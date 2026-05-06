import { jsx } from 'slate-hyperscript'
import { Transforms } from 'slate';

const withHtml = editor => {
    const { insertData, isInline, isVoid } = editor

    editor.isInline = element => {
        return element.type === 'link' ? true : isInline(element)
    }

    editor.isVoid = element => {
        return (element.type === 'image' || element.type === 'video') ? true : isVoid(element)
    }

    editor.insertData = data => {
        const html = data.getData('text/html')

        if (html) {
            // Yc tester 2026-05-06: paste từ Word/Google Docs làm mất chữ &
            // scroll về đầu trang. Pre-process clean Word's mso-* metadata,
            // <o:p>, conditional comments, empty span wrapers... trước khi
            // đẩy vào DOMParser.
            const cleaned = html
                // Conditional comments, MS xml namespaces
                .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '')
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/<\/?o:[^>]*>/gi, '')
                .replace(/<\/?w:[^>]*>/gi, '')
                .replace(/<\/?v:[^>]*>/gi, '')
                .replace(/<\/?xml[^>]*>/gi, '')
                // Strip <style>, <script>, <meta>, <link>, <title>
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<meta[^>]*>/gi, '')
                .replace(/<link[^>]*>/gi, '')
                .replace(/<title[\s\S]*?<\/title>/gi, '')
                // Remove on*= và javascript:
                .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
                .replace(/on\w+\s*=\s*'[^']*'/gi, '')
                .replace(/javascript:/gi, '')
                // Drop class="MsoNormal", id="..."
                .replace(/\s+class="?Mso[^"\s>]*"?/gi, '')
                // Drop mso-* styles để khỏi gây nhiễu align
                .replace(/style="[^"]*mso-[^"]*"/gi, '')

            const parsed = new DOMParser().parseFromString(cleaned, 'text/html')
            const fragment = deserialize(parsed.body)
            try {
                Transforms.insertFragment(editor, fragment)
            } catch (e) {
                // Fallback: nếu deserialize lỗi → paste plain text để không mất chữ
                const plain = data.getData('text/plain')
                if (plain) Transforms.insertText(editor, plain)
            }
            return
        }

        insertData(data)
    }

    return editor
}

export const deserialize = el => {
    if (el.nodeType === 3) {
        return el.textContent
    } else if (el.nodeType !== 1) {
        return null
    } else if (el.nodeName === 'BR') {
        return '\n'
    }

    const { nodeName } = el
    let parent = el

    if (
        nodeName === 'PRE' &&
        el.childNodes[0] &&
        el.childNodes[0].nodeName === 'CODE'
    ) {
        parent = el.childNodes[0]
    }
    let children = Array.from(parent.childNodes)
        .map(deserialize)
        .flat()

    if (children.length === 0) {
        children = [{ text: '' }]
    }

    if (el.nodeName === 'BODY') {
        return jsx('fragment', {}, children)
    }

    //Fix trường hợp thẻ A trong thẻ STRONG => Bị cấm như mô tả trong https://github.com/udecode/plate/issues/77
    //Link bài có thẻ A trong thẻ STRONG gây lỗi khi paste-html: https://benhvienthammykangnam.vn/tham-my-mui/nang-mui-han-quoc-kangnam/
    //
    // Yc tester 2026-05-06: paste từ Word/Docs có nested format (vd
    // <strong>X <em>Y</em></strong>) trước đây bị flatten về `el.textContent`
    // → mất các mark con. Giờ giữ children + apply mark đậm/nghiêng/... lên
    // mọi text leaf bên trong (không animate up vào thẻ link để tránh lỗi
    // A-trong-STRONG đã ghi chú ở trên).
    const applyMark = (mark) => {
        const safeChildren = children.length ? children : [{ text: el.textContent || '' }];
        return safeChildren.map((c) => {
            if (c == null) return null;
            // Nếu là element link (nested A) → bỏ qua mark trên element, paste raw
            if (typeof c === 'object' && (c).type === 'link') return c;
            if (typeof c === 'string') return { text: c, ...mark };
            if ((c).text != null) return { ...c, ...mark };
            return c;
        }).filter(Boolean);
    };
    if (el.nodeName === 'STRONG' || el.nodeName === 'B') {
        return applyMark({ bold: true });
    }

    if (el.nodeName === 'EM' || el.nodeName === 'I') {
        return applyMark({ italic: true });
    }

    if (el.nodeName === 'DEL' || el.nodeName === 'S') {
        return applyMark({ strikethrough: true });
    }

    if (el.nodeName === 'U') {
        return applyMark({ underline: true });
    }

    if (ELEMENT_TAGS[nodeName]) {
        const attrs = ELEMENT_TAGS[nodeName](el)
        return jsx('element', attrs, children)
    }

    if (TEXT_TAGS[nodeName]) {
        const attrs = TEXT_TAGS[nodeName](el)
        return children.map(child => jsx('text', attrs, child))
    }

    return children
}

const TEXT_TAGS = {
    CODE: () => ({ code: true }),
    DEL: () => ({ strikethrough: true }),
    EM: () => ({ italic: true }),
    I: () => ({ italic: true }),
    S: () => ({ strikethrough: true }),
    STRONG: () => ({ bold: true }),
    B: () => ({ bold: true }),
    U: () => ({ underline: true }),
}

const ELEMENT_TAGS = {
    A: el => ({ type: 'link', href: el.getAttribute('href') }),
    BLOCKQUOTE: () => ({ type: 'block-quote' }),
    H1: () => ({ type: 'heading-one' }),
    H2: () => ({ type: 'heading-two' }),
    H3: () => ({ type: 'heading-three' }),
    H4: () => ({ type: 'heading-four' }),
    H5: () => ({ type: 'heading-five' }),
    H6: () => ({ type: 'heading-six' }),
    IMG: el => ({ type: 'image', url: el.getAttribute('src') }),
    LI: () => ({ type: 'list-item' }),
    OL: () => ({ type: 'numbered-list' }),
    P: el => ({ type: 'paragraph', align: getAlign(el) }),
    PRE: () => ({ type: 'code' }),
    UL: () => ({ type: 'bulleted-list' }),
    TABLE: () => ({ type: 'table' }),
    TR: () => ({ type: 'table-row' }),
    TD: () => ({ type: 'table-cell' }),
}

const getAlign = (el) => {
    let align = "";
    if (el.getAttribute("style")) {

        // eslint-disable-next-line prefer-const
        let style = el.getAttribute("style");
        let re = /(text\-align[ ]*?:[ ]*?(center|left|right|justify))/;

        let arr = re.exec(style);
        if (arr && arr.length >= 2) {
            align = arr[2];
        }
    }

    return align;
};

export {
    withHtml
}
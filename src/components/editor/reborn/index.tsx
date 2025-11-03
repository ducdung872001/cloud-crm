import React, { useCallback, useMemo, ReactElement, useState, useEffect, Fragment } from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, Slate, ReactEditor } from "slate-react";
import { withLinks } from "./plugins/withLinks";
import { withMedias } from "./plugins/withMedias";
import { withTables } from "./plugins/withTables";
import { withHtml } from "./plugins/withHtml";
import { withShortcuts, SHORTCUTS } from "./plugins/withShortcuts";
import pipe from "lodash/fp/pipe";
import { InsertImageButton } from "./toolbars/Image";
import { InsertVideoButton } from "./toolbars/Video";
import { InsertTableButton } from "./toolbars/Table";
import { InsertColorPickerButton } from "./toolbars/ColorPicker";
import { InsertCTAButton } from "./toolbars/CTA";

import { Element, Leaf } from "./elements/Render";
import { MarkButton, BlockButton, toggleMark } from "./elements/Button";

import { deserialize } from "utils/editor";
import hash from "object-hash";

import { Editor, createEditor, Descendant, Element as SlateElement, Node as SlateNode } from "slate";
import { withHistory } from "slate-history";

import { Toolbar } from "../components";
import "./index.scss";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

interface EditorProps {
  id?: string;
  initialValue?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  onChangeContent?: any;
  autoFocus?: boolean;
  onFocus?: any;
  onBlur?: any;
  error?: boolean;
  message?: string;
  warning?: boolean;
  messageWarning?: string;
  onKeyDown?: any;
  onKeyUp?: any;
  onClick?: any;
  onReady?: any;
  label?: string | ReactElement;
  labelPosition?: "left";
  fill?: boolean;
  fillColor?: boolean;
  disabled?: boolean;
  onKeyPress?: any;
  readOnly?: boolean;
  maxLength?: number;
  refInput?: any;
  required?: boolean;
  dataText?: string; //Dữ liệu text muốn được chèn vào vị trí hiện tại của trình soạn thảo
}

const emptyParagraph: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const RebornEditor = (props: EditorProps) => {
  const {
    onChangeContent,
    initialValue,
    dataText,
    readOnly,
    error,
    message,
    warning,
    messageWarning,
    fill,
    label,
    labelPosition,
    className,
    fillColor,
    name,
    required,
    disabled,
  } = props;
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const [initialValueDelta, setInitialValueDelta] = useState<Descendant[]>(emptyParagraph);

  const createEditorWithPlugins = pipe(withReact, withHistory, withMedias, withLinks, withTables, withHtml, withShortcuts);

  const editor = useMemo(() => createEditorWithPlugins(createEditor()), []);
  useEffect(() => {
    if (initialValue) {
      const document = new DOMParser().parseFromString(initialValue, "text/html");
      setInitialValueDelta(deserialize(document.body));
    } else {
      setInitialValueDelta(emptyParagraph);
    }
  }, [initialValue]);

  useEffect(() => {
    if (dataText) {
      const { insertText } = editor;
      insertText(dataText);
    }
  }, [dataText]);  

  const handleDOMBeforeInput = useCallback(
    (e: InputEvent) => {
      queueMicrotask(() => {
        const pendingDiffs = ReactEditor.androidPendingDiffs(editor)

        const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
          if (!diff.text.endsWith(' ')) {
            return false
          }

          const { text } = SlateNode.leaf(editor, path)
          const beforeText = text.slice(0, diff.start) + diff.text.slice(0, -1)
          if (!(beforeText in SHORTCUTS)) {
            return
          }

          const blockEntry = Editor.above(editor, {
            at: path,
            match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
          })
          if (!blockEntry) {
            return false
          }

          const [, blockPath] = blockEntry
          return Editor.isStart(editor, Editor.start(editor, path), blockPath)
        })

        if (scheduleFlush) {
          ReactEditor.androidScheduleFlush(editor)
        }
      })
    },
    [editor]
  )

  const editorComponent = () => {
    return (
      <Fragment>
        <Slate
          editor={editor}
          value={initialValueDelta}
          onChange={(value) => {
            onChangeContent(value);
          }}
          key={hash(initialValueDelta || [])}
        >
          <Toolbar>
            <MarkButton format="bold" icon="format_bold" nameIcon="In đậm" />
            <MarkButton format="italic" icon="format_italic" nameIcon="In nghiêng" />
            <MarkButton format="underline" icon="format_underlined" nameIcon="Gạch chân" />
            <MarkButton format="code" icon="code" nameIcon="Code" />
            <InsertColorPickerButton />
            <BlockButton format="heading-one" icon="looks_one" nameIcon="Thẻ tiêu đề H1" />
            <BlockButton format="heading-two" icon="looks_two" nameIcon="Thẻ tiêu đề H2" />
            <BlockButton format="heading-three" icon="looks_3" nameIcon="Thẻ tiêu đề H3" />
            <BlockButton format="link" icon="link" nameIcon="Chèn liên kết" />
            <BlockButton format="block-quote" icon="format_quote" nameIcon="Trích dẫn" />
            <BlockButton format="numbered-list" icon="format_list_numbered" nameIcon="Danh sách được đánh số" />
            <BlockButton format="bulleted-list" icon="format_list_bulleted" nameIcon="Danh sách có dấu đầu dòng" />
            <BlockButton format="left" icon="format_align_left" nameIcon="Căn trái" />
            <BlockButton format="center" icon="format_align_center" nameIcon="Căn giữa" />
            <BlockButton format="right" icon="format_align_right" nameIcon="Căn phải" />
            <BlockButton format="justify" icon="format_align_justify" nameIcon="Căn đều" />
            <InsertImageButton />
            <InsertVideoButton />
            <InsertTableButton />
            <InsertCTAButton />
          </Toolbar>
          <Editable
            className="editor"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Nhập nội dung..."
            spellCheck={false}
            autoFocus
            readOnly={readOnly}
            onKeyDown={(event) => {
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event as any)) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(editor, mark);
                }
              }
            }}

            onDOMBeforeInput={handleDOMBeforeInput}
          />
        </Slate>
      </Fragment>
    );
  };

  return (
    <div
      className={`base-editor${fill ? " base-editor-fill" : ""}${error ? " invalid" : ""}${warning ? " warning" : ""}${initialValue ? " has-value" : ""
        }${label ? " has-label" : ""}${label && labelPosition ? ` has-label__${labelPosition}` : ""}${fillColor ? " base-editor--fill-color" : ""}${disabled ? " has-disabled" : ""
        }${className ? " " + className : ""}`}
    >
      {label ? (
        <Fragment>
          <label htmlFor={name}>
            {label}
            {required && <span className="required"> * </span>}
          </label>
          <div className="wrapper__editor">{editorComponent()}</div>
        </Fragment>
      ) : (
        <div className="wrapper__editor">{editorComponent()}</div>
      )}
      {error && message && <div className="has-error">{message}</div>}
      {warning && messageWarning && <div className="has-warning">{messageWarning}</div>}
    </div>
  );
};

export default RebornEditor;

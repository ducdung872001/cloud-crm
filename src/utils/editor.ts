import escapeHtml from "escape-html";
import { jsx } from "slate-hyperscript";
import { Text } from "slate";
import { ParagraphElement } from "components/editor/custom-types";

const removeClassLevel = (key = "") => {
  localStorage.removeItem(`${key}_classLevel1`);
  localStorage.removeItem(`${key}_classLevel2`);
};

// https://docs.slatejs.org/concepts/10-serializing
const serialize = (node: any, key = "") => {
  //Tham khảo cách xử lý trong EmbedNavigator
  //Ngắt theo từng khối heading-two
  let firstLevel2 = true;
  let hasLevel2 = false;
  let classLevel1: any = localStorage.getItem(`${key}_classLevel1`);
  let classLevel2: any = localStorage.getItem(`${key}_classLevel1`);
  if (classLevel1) {
    classLevel1 = parseInt(classLevel1);
  } else {
    classLevel1 = 0;
  }

  if (classLevel2) {
    classLevel2 = parseInt(classLevel2);
  } else {
    classLevel1 = 0;
  }
  let classLevel = "";

  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }

    if (node.italic) {
      string = `<em>${string}</em>`;
    }

    if (node.underline) {
      string = `<u>${string}</u>`;
    }

    if (node.code) {
      string = `<code>${string}</code>`;
    }

    if (node.color) {
      string = `<span style="color:${node.colorCode}" color="${node.colorCode}">${string}</span>`;
    }
    return string;
  }

  const children = node.children ? node.children.map((n) => serialize(n, key)).join("") : "";

  // console.log('node.type =>', node.type);

  switch (node.type) {
    case "block-quote":
      return `<blockquote><p>${children}</p></blockquote>`;
    case "paragraph":
      return `<p${node.align ? ` style="text-align:${node.align}"` : ""}>${children}</p>`;
    case "link":
      return `<a href="${node.href}">${children}</a>`;
    case "strong":
      return `<b>${children}</b>`;
    case "em":
      return `<em>${children}</em>`;
    case "u":
      return `<u>${children}</u>`;
    case "code":
      return `<code>${children}</code>`;
    case "heading-one":
      return `<h1${node.align ? ` style="text-align:${node.align}"` : ""}>${children}</h1>`;
    case "heading-two":
      if (hasLevel2) {
        firstLevel2 = true;
      }

      //Thực hiện cho cấp hiện tại
      classLevel1++;
      classLevel2 = 0;
      classLevel = `item-${classLevel1}`;
      localStorage.setItem(`${key}_classLevel1`, classLevel1);

      return `<h2 class='${node.class ? node.class : ""}' id="${classLevel}" ${
        node.align ? ` style="text-align:${node.align}"` : ""
      }>${children}</h2>`;
    case "heading-three":
      if (firstLevel2) {
        firstLevel2 = false;
        hasLevel2 = true;
      }

      classLevel2++;
      classLevel = `item-${classLevel1}-${classLevel2}`;
      localStorage.setItem(`${key}_classLevel2`, classLevel2);

      return `<h3 class='${node.class ? node.class : ""}' id="${classLevel}" ${
        node.align ? ` style="text-align:${node.align}"` : ""
      }>${children}</h3>`;
    case "numbered-list":
      return `<ol>${children}</ol>`;
    case "bulleted-list":
      return `<ul>${children}</ul>`;
    case "list-item":
      return `<li>${children}</li>`;
    case "image":
      let imgResult = `<img src="${node.url}" 
                width="${node?.width ? node.width : "100%"}" 
                height="${node?.height ? node.height : "100%"}" 
                align="${node?.align ? node.align : ""}"
                longdesc="${node?.longdesc || ""}"
                alt="${node?.alt || ""}">${children}</img>`;
      if (node?.longdesc) {
        imgResult = `<a href='${node?.longdesc}'>${imgResult}</a>`;
      }

      if (node?.alt) {
        imgResult += `<p class="img-desc">${node?.alt}</p>`;
      }

      return imgResult;
    case "video":
      return `<video controls style={{ width: '100%', height: 'auto' }}><source src="${node.url}"></source></video>`;
    case "cta":
      return `<button style="backgroun-color:${node?.backgroundColor || "red"};color:${node?.color || "white"}">
                <a href="${node?.link}">${children}</a></button>`;
    case "table":
      return `<table id="${node?.id || ""}"><tbody>${children}</tbody></table>`;
    case "table-row":
      return `<tr id="${node?.id || ""}">${children}</tr>`;
    case "table-cell":
      return `<td id="${node?.id || ""}" ${node.align ? ` style="text-align:${node.align}"` : ""}>${children}</td>`;
    default:
      return children;
  }
};

const deserialize = (el, markAttributes = {} as any) => {
  if (el.nodeType === Node.TEXT_NODE) {
    return jsx("text", markAttributes, el.textContent);
  } else if (el.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const nodeAttributes = { ...markAttributes };
  // console.log("el.nodeName =>", el.nodeName);
  // define attributes for text nodes

  switch (el.nodeName) {
    case "STRONG":
      nodeAttributes.bold = true;
      break;
    case "EM":
      nodeAttributes.italic = true;
      break;
    case "U":
      nodeAttributes.underline = true;
      break;
    case "CODE":
      nodeAttributes.code = true;
      break;
    case "SPAN":
      if (el.getAttribute("color")) {
        nodeAttributes.color = true;
        nodeAttributes.colorCode = el.getAttribute("color");
      }
      break;
  }

  const children = Array.from(el.childNodes)
    .map((node) => deserialize(node, nodeAttributes))
    .flat();

  if (children.length === 0) {
    children.push(jsx("text", nodeAttributes, ""));
  }

  switch (el.nodeName) {
    case "BODY":
      return jsx("fragment", {}, children);
    case "BR":
      return "\n";
    case "P":
      let pClassName = el.getAttribute("class");

      //Sẽ không deserialize mô tả của ảnh
      if (pClassName == "img-desc") {
        return "";
      }

      return jsx("element", { type: "paragraph", align: getAlign(el), class: pClassName }, children);
    case "H1":
      return jsx("element", { type: "heading-one", align: getAlign(el) }, children);
    case "H2":
      return jsx("element", { type: "heading-two", align: getAlign(el) }, children);
    case "H3":
      return jsx("element", { type: "heading-three", align: getAlign(el) }, children);
    case "BLOCKQUOTE":
      return jsx("element", { type: "block-quote" }, children);
    case "A":
      return jsx("element", { type: "link", href: el.getAttribute("href") }, children);
    case "OL":
      return jsx("element", { type: "numbered-list" }, children);
    case "UL":
      return jsx("element", { type: "bulleted-list" }, children);
    case "LI":
      return jsx("element", { type: "list-item" }, children);
    case "IMG":
      return jsx(
        "element",
        {
          type: "image",
          url: el.getAttribute("src"),
          width: el.getAttribute("width"),
          height: el.getAttribute("height"),
          align: el.getAttribute("align"),
          alt: el.getAttribute("alt"),
          longdesc: el.getAttribute("longdesc"),
        },
        children
      );
    case "VIDEO":
      let url = "";
      if (el.innerHTML) {
        // eslint-disable-next-line prefer-const
        let div = document.createElement("div");
        div.innerHTML = el.innerHTML;
        // eslint-disable-next-line prefer-const
        let sourceTag: any = div.firstChild;
        url = sourceTag ? sourceTag.getAttribute("src") : "";
      }

      return jsx("element", { type: "video", url }, children);
    case "TABLE":
      return jsx("element", { type: "table", id: el.getAttribute("id") }, children);
    case "TR":
      return jsx("element", { type: "table-row", id: el.getAttribute("id") }, children);
    case "TD":
      return jsx("element", { type: "table-cell", id: el.getAttribute("id"), align: getAlign(el) }, children);
    default:
      return children;
  }
};

const getAlign = (el) => {
  let align = "";
  if (el.attributes["style"]) {
    // eslint-disable-next-line prefer-const
    let style = el.attributes["style"].nodeValue;
    if (style.includes("text-align:center")) {
      align = "center";
    } else if (style.includes("text-align:left")) {
      align = "left";
    } else if (style.includes("text-align:right")) {
      align = "right";
    } else if (style.includes("text-align:justify")) {
      align = "justify";
    }
  }

  return align;
};

const createParagraphNode = (children: any = [{ text: "" }]) =>
  ({
    type: "paragraph",
    children,
  } as ParagraphElement);

export { serialize, deserialize, removeClassLevel, createParagraphNode };

import React, { Fragment, useEffect, useState } from "react";
import { Button, Icon } from "../../../components";
import { Editable, withReact, useSlate, Slate, ReactEditor } from "slate-react";
import { Editor, Transforms, createEditor, Descendant, Element as SlateElement, Path, Range, Node as SlateNode } from "slate";
import { createParagraphNode } from "utils/editor";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { ImageElement, LinkElement } from "../../../custom-types";
import { removeLink } from "../../utils/link";

const BlockButton = ({ format, icon, nameIcon, callback = null }) => {
  const editor = useSlate();

  return (
    <Button
      active={isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? "align" : "type")}
      onMouseDown={(event) => {
        event.preventDefault();

        //1. Trường hợp đặc biệt
        if (format == "link") {
          const url = prompt("Nhập một liên kết");
          insertLink(editor, url);
          return;
        }

        toggleBlock(editor, format);
      }}
    >
      <Tippy content={nameIcon}>
        <Icon>{icon}</Icon>
      </Tippy>
    </Button>
  );
};

const MarkButton = ({ format, icon, nameIcon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Tippy content={nameIcon}>
        <Icon>{icon}</Icon>
      </Tippy>
    </Button>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? "align" : "type");
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type) && !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format,
    })
  );

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const createLinkNode = (href, text) =>
  ({
    type: "link",
    href,
    children: [{ text }],
  } as LinkElement);

const insertLink = (editor, url) => {
  if (!url) return;

  const { selection } = editor;
  const link = createLinkNode(url, "New Link");

  ReactEditor.focus(editor);

  if (!!selection) {
    const [parentNode, parentPath] = Editor.parent(editor, selection.focus?.path);

    // Remove the Link node if we're inserting a new link node inside of another
    // link.
    if ((parentNode as any).type === "link") {
      removeLink(editor);
    }

    if (editor.isVoid(parentNode)) {
      // Insert the new link after the void node
      Transforms.insertNodes(editor, createParagraphNode([link]), {
        at: Path.next(parentPath),
        select: true,
      });
    } else if (Range.isCollapsed(selection)) {
      // Insert the new link in our last known location
      Transforms.insertNodes(editor, link, { select: true });
    } else {
      // Wrap the currently selected range of text into a Link
      Transforms.wrapNodes(editor, link, { split: true });

      // Remove the highlight and move the cursor to the end of the highlight
      Transforms.collapse(editor, { edge: "end" });
    }
  } else {
    // Insert the new link node at the bottom of the Editor when selection
    // is falsey
    Transforms.insertNodes(editor, createParagraphNode([link]));
  }
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

export { BlockButton, MarkButton, isMarkActive, toggleMark };

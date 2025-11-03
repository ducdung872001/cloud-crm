import { Descendant, BaseEditor, BaseRange, Range, Element } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export type BlockQuoteElement = {
  type: "block-quote";
  align?: string;
  children: Descendant[];
};

export type BulletedListElement = {
  type: "bulleted-list";
  align?: string;
  children: Descendant[];
};

export type CheckListItemElement = {
  type: "check-list-item";
  checked: boolean;
  children: Descendant[];
};

export type EditableVoidElement = {
  type: "editable-void";
  children: EmptyText[];
};

export type HeadingElement = {
  type: "heading";
  align?: string;
  children: Descendant[];
};

export type HeadingTwoElement = {
  type: "heading-two";
  align?: string;
  children: Descendant[];
};

export type ImageElement = {
  type: "image";
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  align?: string;
  point?: number;
  longdesc?: string; //Link ảnh wrapper ảnh
  children: EmptyText[];
};

export type LinkElement = { type: "link"; href: string; children: Descendant[] };

export type ButtonElement = { type: "button"; children: Descendant[] };

export type ListItemElement = { type: "list-item"; children: Descendant[] };

export type MentionElement = {
  type: "mention";
  character: string;
  children: CustomText[];
};

export type ParagraphElement = {
  type: "paragraph";
  align?: string;
  children: Descendant[];
};

export type TableCellElement = { type: "table-cell"; children: CustomText[] };
export type TableRowElement = { type: "table-row"; children: TableCellElement[] };
export type TableElement = { type: "table"; children: TableRowElement[] };

export type TitleElement = { type: "title"; children: Descendant[] };

export type VideoElement = { type: "video"; url: string; children: EmptyText[] };

export type CodeBlockElement = {
  type: "code-block";
  language: string;
  children: Descendant[];
};

export type CodeLineElement = {
  type: "code-line";
  children: Descendant[];
};

export type CTAElement = { type: "cta"; children: Descendant[] };

type CustomElement =
  | BlockQuoteElement
  | BulletedListElement
  | CheckListItemElement
  | EditableVoidElement
  | HeadingElement
  | HeadingTwoElement
  | ImageElement
  | LinkElement
  | ButtonElement
  | ListItemElement
  | MentionElement
  | ParagraphElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | TitleElement
  | VideoElement
  | CodeBlockElement
  | CodeLineElement
  | CTAElement;

export type CustomText = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: boolean;
  colorCode?: string;
  text: string;
};

export type EmptyText = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: boolean;
  colorCode?: string;
  text: string;
};

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    nodeToDecorations?: Map<Element, Range[]>;
  };

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText | EmptyText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}

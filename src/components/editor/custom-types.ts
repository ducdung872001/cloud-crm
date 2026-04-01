import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
export type CustomEditor = BaseEditor & ReactEditor;
export type CustomElement = { type: string; children: CustomText[] };
export type CustomText = { text: string; [key: string]: any };
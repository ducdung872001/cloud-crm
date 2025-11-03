import { Editor, Transforms, Path, Range, Element } from "slate";

export const removeLink = (editor, opts = {}) => {
    Transforms.unwrapNodes(editor, {
        ...opts,
        match: (n) =>
            !Editor.isEditor(n) && Element.isElement(n) && n.type === "link"
    });
};
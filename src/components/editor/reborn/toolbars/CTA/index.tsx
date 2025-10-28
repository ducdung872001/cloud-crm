import React, { useState, Fragment } from "react";
import Tippy from "@tippyjs/react";
import { CustomEditor, CTAElement } from "components/editor/custom-types";
import { useSlateStatic } from "slate-react";
import { Button, Icon } from "../../../components";
import { Transforms, Descendant } from "slate";
import "tippy.js/dist/tippy.css";

/**
 * Chèn 1 nút CTA vào trong trình soạn thảo
 * @returns
 */
const InsertCTAButton = () => {
  const editor = useSlateStatic();

  return (
    <Fragment>
      <Button
        onClick={(event) => {
          event && event.preventDefault();
          // insertCTA(editor);
        }}
      >
        <Tippy content="Tạo hành động">
          <Icon>call_to_action</Icon>
        </Tippy>
      </Button>

      {/* <ModalAddImage
                onShow={showModalImage}
                onHide={() => setShowModalImage(false)}
                callback={(lstUrl) => insertImages(editor, lstUrl)}
            /> */}
    </Fragment>
  );
};

/**
 * Chèn ảnh lần đầu vào trình soạn thảo
 * @param editor
 */
const insertCTA = (editor) => {
  const text = { text: "" };
  const ctaButton: CTAElement = { type: "cta", children: [text] };
  Transforms.insertNodes(editor, ctaButton);

  //Chèn bổ sung một khối empty paragraph
  Transforms.insertNodes(editor, { type: "paragraph", children: [text] });
};

export { InsertCTAButton };

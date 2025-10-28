/* eslint-disable prefer-const */
import React, { useState, Fragment } from "react";
import Tippy from "@tippyjs/react";
import { CustomEditor } from "components/editor/custom-types";
import { useSlateStatic } from "slate-react";
import { Button, Icon } from "../../../components";
import ModalAddImage from "../../modals/Image";
import { insertImage as insertImageIntoEditor } from "../../plugins/withMedias";
import "tippy.js/dist/tippy.css";

const InsertImageButton = () => {
  const editor = useSlateStatic();
  const [showModalImage, setShowModalImage] = useState<boolean>(false);

  return (
    <Fragment>
      <Button
        onClick={(event) => {
          event.preventDefault();
          setShowModalImage(!showModalImage);
        }}
      >
        <Tippy content="Tải ảnh lên">
          <Icon>image</Icon>
        </Tippy>
      </Button>

      <ModalAddImage onShow={showModalImage} onHide={() => setShowModalImage(false)} callback={(lstUrl) => insertImages(editor, lstUrl)} />
    </Fragment>
  );
};

// Gọi nhiều lần để tải 1 loạt ảnh
const insertImages = (editor: CustomEditor, lstUrl: string[]) => {
  let url = lstUrl[0]; //Lấy thử 1 hình ảnh để chèn
  insertImageIntoEditor(editor, url);
};

export { InsertImageButton };

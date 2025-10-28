import React, { useState, Fragment } from "react";
import Tippy from "@tippyjs/react";
import { CustomEditor } from "components/editor/custom-types";
import { useSlateStatic } from "slate-react";
import { Button, Icon } from "../../../components";
import ModalColorPicker from "../../modals/ColorPicker";
import { Editor } from "slate";
import { isMarkActive } from "../../elements/Button";
import "tippy.js/dist/tippy.css";

/**
 * Hiển thị popup chọn màu => sau đó cho phép chọn màu => apply vào bên trong trình soạn thảo
 * @returns
 */
const InsertColorPickerButton = (props: any) => {
  const editor = useSlateStatic();
  const [showModalColorPicker, setShowModalColorPicker] = useState<boolean>(false);

  // Gọi nhiều lần để tải 1 loạt ảnh
  const insertColor = (editor: CustomEditor, color: string) => {
    applyColor(color);
  };

  //Áp dụng màu cho khối được chọn
  const applyColor = (color) => {
    toggleMarkColor(editor, 'color', color);
  }

  /**
 * Nên clear tường minh thay vì bật | tắt
 * @param editor 
 * @param format 
 * @param color 
 */
  const toggleMarkColor = (editor, format, color) => {
    const isActive = isMarkActive(editor, format);

    Editor.addMark(editor, format, true);
    Editor.addMark(editor, `${format}Code`, color);
  };

  return (
    <Fragment>
      <Button
        onClick={(event) => {
          event.preventDefault();
          setShowModalColorPicker(!showModalColorPicker);
        }}
      >
        <Tippy content="Màu sắc">
          <Icon>colorize</Icon>
        </Tippy>
      </Button>

      <ModalColorPicker
        onShow={showModalColorPicker}
        onHide={() => setShowModalColorPicker(false)}
        callback={(color) => insertColor(editor, color)}
      />
    </Fragment>
  );
};

export { InsertColorPickerButton };

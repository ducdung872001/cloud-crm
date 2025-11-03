import React, { useState, Fragment } from "react";
import Tippy from "@tippyjs/react";
import { CustomEditor } from "components/editor/custom-types";
import { useSlateStatic } from "slate-react";
import { Button, Icon } from "../../../components";
import { insertTable as insertTableIntoEditor } from "../../plugins/withTables";
import "tippy.js/dist/tippy.css";
import "./index.scss";

const InsertTableButton = () => {
  const editor = useSlateStatic();  

  return (
    <Fragment>
      <Button
        onClick={(event) => {
          event && event.preventDefault();
          insertTable(editor);
        }}
      >
        <Tippy content="Tạo bảng">
          <Icon className="apps">apps</Icon>
        </Tippy>
      </Button>
    </Fragment>
  );
};

/**
 * Sau sẽ truyền thêm nhiều tham số để khởi tạo bảng
 * @param editor
 */
const insertTable = (editor: CustomEditor) => {
  insertTableIntoEditor(editor);
};

export { InsertTableButton };

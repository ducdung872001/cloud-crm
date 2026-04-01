import React, { Fragment } from "react";
import { useSlateStatic, useSelected, useFocused } from "slate-react";
import { removeTable } from "../../plugins/withTables";
import Icon from "components/icon";
import './index.scss';

const Table = ({ attributes, children, element }) => {
  const editor = useSlateStatic();
  const selected = useSelected();
  const focused = useFocused();

  const deleteTable = (currentId) => {
    removeTable(editor, currentId);
  };

  return (
    <Fragment>
      <div className="editor-table-wrap" contentEditable={false} style={{ userSelect: "none" }}>
        {/* Table chính — contentEditable phải nằm trong attributes */}
        <div contentEditable suppressContentEditableWarning>
          <table id={`${element?.id}`} className="editor-table">
            <tbody {...attributes}>
              {children}
            </tbody>
          </table>
        </div>

        {/* Toolbar xóa — hiện khi focus vào bảng */}
        {selected && focused && (
          <div
            className="table-option"
            onMouseDown={(e) => {
              e.preventDefault();
              deleteTable(element?.id);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            <span>Xóa bảng</span>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export { Table };
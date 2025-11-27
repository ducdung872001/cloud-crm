import React, { memo, useEffect, useRef, useState } from "react";
import "./index.scss";
import Input from "components/input/input";
import NoCellMenu from "../CustomCellNoRender/partials/NoCellMenu";
import ReactDOM from "react-dom";
import { useGridAg } from "../../GridAgContext";

const FullWidthRenderer = (props) => {
  const { typeNo, widthNo, rowData } = useGridAg();
  const buttonRef = useRef(null);
  const { data, onEdit } = props;
  const [content, setContent] = useState(props.data.content || "");
  const [isEdit, setIsEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.y + 4, left: rect.left });
    }
  }, [showMenu]);

  const [showEditNo, setShowEditNo] = useState(false);
  const [no, setNo] = useState(props.data.no || "");

  return (
    <div className="full-width-renderer">
      <div
        className={`full-width-renderer--no level-${props.data.level}`}
        onDoubleClick={() => {
          if (typeNo === "input") {
            setShowEditNo(true);
          }
        }}
        style={
          widthNo
            ? {
                width: widthNo,
              }
            : {}
        }
      >
        {showEditNo ? (
          <Input
            name={"content_no"}
            onBlur={() => {
              setShowEditNo(false);
              onEdit(data.rowKey, { no });
            }}
            value={no}
            readOnly={false}
            disabled={false}
            placeholder={"Nhập stt"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEdit(data.rowKey, { no });
                setShowEditNo(false);
              }
            }}
            onChange={(e) => {
              setNo(e.target.value);
            }}
          />
        ) : (
          <>
            <div
              className="text-truncate"
              title={typeNo === "input" ? props.data.no : rowData.findIndex((row) => row.rowKey === props.data.rowKey) + 1}
            >
              {typeNo === "input" ? props.data.no : rowData.findIndex((row) => row.rowKey === props.data.rowKey) + 1}
            </div>
            <div className="icon-popover">
              <div ref={buttonRef} onClick={toggleMenu} title="More" className="button-menu">
                <div className="button-content">⋮</div>
              </div>
            </div>
            {showMenu &&
              ReactDOM.createPortal(
                <NoCellMenu
                  position={position}
                  onClose={() => setShowMenu(false)}
                  rowKey={props.data.rowKey}
                  callBack={props.actionRow}
                  // onEdit={handleEdit}
                  // onDelete={handleDelete}
                />,
                document.body
              )}
          </>
        )}
      </div>

      {!isEdit ? (
        <div className={`full-width-renderer--content level-${props.data.level}`} onDoubleClick={() => setIsEdit(true)}>
          {props.data.content ? props.data.content : <i style={{ color: "#ccc" }}>Nhập tiêu đề</i>}
        </div>
      ) : (
        <div className="full-width-renderer--content" style={{ width: "70%" }}>
          <Input
            name={"content_title"}
            onBlur={() => {
              setIsEdit(false);
              onEdit(data.rowKey, { content });
            }}
            value={content}
            readOnly={false}
            disabled={false}
            placeholder={"Nhập tiêu đề"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEdit(data.rowKey, { content });
                setIsEdit(false);
              }
            }}
            onChange={(e) => {
              setContent(e.target.value);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default memo(FullWidthRenderer);

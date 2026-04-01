import React, { Fragment, useState } from "react";
import { useSlateStatic, useSelected, useFocused } from "slate-react";
import { insertTableColumn, insertTableRow, removeTableColumn, removeTableRow } from "../../plugins/withTables";
import './index.scss';

// Icon SVG nhỏ dùng trong cell menu
const MenuIcon = ({ d }: { d: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const TableCell = ({ attributes, children, element }) => {
  const editor = useSlateStatic();
  const selected = useSelected();
  const focused = useFocused();
  const [cellControl, setCellControl] = useState(false);

  const addNewRow = (id) => { insertTableRow(editor, id); setCellControl(false); };
  const addNewColumn = (id) => { insertTableColumn(editor, id); setCellControl(false); };
  const removeOldRow = (id) => { removeTableRow(editor, id); setCellControl(false); };
  const removeOldColumn = (id) => { removeTableColumn(editor, id); setCellControl(false); };

  const menuItems = [
    { label: "Thiết lập màu nền", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", disabled: true },
    { label: "Chèn thêm 1 cột", icon: "M12 5v14M5 12h14", onClick: () => addNewColumn(element?.id) },
    { label: "Chèn thêm 1 hàng", icon: "M5 12h14M12 5v14", onClick: () => addNewRow(element?.id) },
    { label: "Xóa hàng này", icon: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6", onClick: () => removeOldRow(element?.id), danger: true },
    { label: "Xóa cột này", icon: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6", onClick: () => removeOldColumn(element?.id), danger: true },
    { label: "Trộn ô", icon: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3", disabled: true },
    { label: "Chia ô", icon: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9m-12 12H5a2 2 0 0 1-2-2V9m0 0h18", disabled: true },
    { label: "Xóa nội dung ô", icon: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6", disabled: true },
  ];

  return (
    <Fragment>
      <td {...attributes} id={`${element?.id}`}>
        {children}

        {selected && focused && (
          <Fragment>
            {/* Trigger button */}
            <span
              className="icon-caret"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCellControl(!cellControl);
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>

            {/* Context menu */}
            {cellControl && (
              <ul
                className="cell-option"
                onMouseLeave={() => setCellControl(false)}
              >
                {menuItems.map((item, i) => (
                  <li
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!item.disabled && item.onClick) item.onClick();
                    }}
                    style={item.danger ? { color: "#dc2626" } : item.disabled ? { color: "#9ca3af", cursor: "default" } : {}}
                  >
                    <MenuIcon d={item.icon} />
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </Fragment>
        )}
      </td>
    </Fragment>
  );
};

export { TableCell };
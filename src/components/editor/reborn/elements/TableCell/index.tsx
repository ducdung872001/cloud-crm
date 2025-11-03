import React, { Fragment, useEffect, useState } from "react";
import { useSlateStatic, useSelected, useFocused, ReactEditor } from "slate-react";
import { insertTableColumn, insertTableRow, removeTableColumn, removeTableRow } from "../../plugins/withTables";
import Icon from "components/icon";

import './index.scss';
/**
 * Xử lý cell của bảng
 * @param param0 
 * @returns 
 */
const TableCell = ({ attributes, children, element }) => {
    const editor = useSlateStatic();
    const selected = useSelected();
    const focused = useFocused();
    const [cellControl, setCellControl] = useState<boolean>(false);

    /**
     * Thêm mới một hàng
     */
    const addNewRow = (currentId) => {
        insertTableRow(editor, currentId);
    }

    /**
     * Thêm mới cột
     */
    const addNewColumn = (currentId) => {
        insertTableColumn(editor, currentId);
    }

    /**
     * Xóa một hàng
     */
    const removeOldRow = (currentId) => {
        removeTableRow(editor, currentId);
    }

    /**
     * Xóa một cột
     */
    const removeOldColumn = (currentId) => {
        removeTableColumn(editor, currentId);
    }

    /**
     * Xóa nội dung cột
     */
    const clearCellContent = () => {
        
    }    

    return (
        <Fragment>
            <td {...attributes} id={`${element?.id}`}>
                {children}

                {
                    selected && focused ? <Fragment>
                        <Icon className="icon-caret" name="CaretDown" onClick={() => setCellControl(!cellControl)} />
                        {
                            cellControl && <ul className="cell-option">
                                <li>Thiết lập màu nền</li>
                                <li onClick={() => addNewColumn(element?.id)} >Chèn thêm 1 cột</li>
                                <li onClick={() => addNewRow(element?.id)}>Chèn thêm 1 hàng</li>
                                <li onClick={() => removeOldRow(element?.id)}>Xóa hàng này</li>
                                <li onClick={() => removeOldColumn(element?.id)}>Xóa cột này</li>
                                {/* Xử lý khi có đủ điều kiện */}
                                <li>Trộn hàng cột</li>
                                <li>Chia hàng cột</li>
                                <li>Xóa nội dung ô này</li>
                            </ul>
                        }
                    </Fragment> : null
                }
            </td>
        </Fragment>
    )
}

export { TableCell };
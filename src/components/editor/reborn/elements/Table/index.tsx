import React, { Fragment, useEffect, useState } from "react";
import { useSlateStatic, useSelected, useFocused, ReactEditor } from "slate-react";
import { removeTable } from "../../plugins/withTables";
import Icon from "components/icon";

import './index.scss';
/**
 * Xử lý bảng
 * @param param0 
 * @returns 
 */
const Table = ({ attributes, children, element }) => {
    const editor = useSlateStatic();
    const selected = useSelected();
    const focused = useFocused();
    const [cellControl, setCellControl] = useState<boolean>(false);

    const deleteTable = (currentId) => {
        removeTable(editor, currentId);
    }

    return (
        <Fragment>            
            <table id={`${element?.id}`}>
                <tbody {...attributes}>
                    {children}
                </tbody>
            </table>
            {
                selected && focused ? <div className="table-option" onClick={() => deleteTable(element?.id)}>
                    <Icon className="icon-caret" name="Trash" />
                    <span>Xóa bảng</span>
                </div> : null
            }
        </Fragment>
    )
}

export { Table };
import { Editor, Range, Point, Transforms, Descendant } from "slate";
import { v4 as uuidv4 } from "uuid";

/**
 * Hỗ trợ table trong Editor (Trường hợp bài viết PR)
 * Tham khảo UI tại: https://ckeditor.com/ckeditor-5/demo/feature-rich/
 * @param {*} editor
 */
const withTables = (editor) => {
    const { deleteBackward, deleteForward, insertBreak } = editor;

    editor.deleteBackward = (unit) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const [cell]: any = Editor.nodes(editor, {
                match: (n: any) => n.type === "table-cell",
            });

            if (cell) {
                const [, cellPath] = cell;
                const start = Editor.start(editor, cellPath);

                if (Point.equals(selection.anchor, start)) {
                    return;
                }
            }
        }

        deleteBackward(unit);
    };

    editor.deleteForward = (unit) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const [cell]: any = Editor.nodes(editor, {
                match: (n: any) => n.type === "table-cell",
            });

            if (cell) {
                const [, cellPath] = cell;
                const end = Editor.end(editor, cellPath);

                if (Point.equals(selection.anchor, end)) {
                    return;
                }
            }
        }

        deleteForward(unit);
    };

    editor.insertBreak = () => {
        const { selection } = editor;

        if (selection) {
            const [table]: any = Editor.nodes(editor, { match: (n: any) => n.type === "table" });

            if (table) {
                return;
            }
        }

        insertBreak();
    };

    return editor;
};

/**
   * Khởi tạo một bảng (mặc định là 3x3)
   */
const insertTable = (editor) => {
    const children = [
        {
            type: "table-row",
            children: [
                {
                    type: "table-cell",
                    children: [{ text: "", bold: true }],
                    id: `cell_${uuidv4()}`
                },
                {
                    type: "table-cell",
                    children: [{ text: "", bold: true }],
                    id: `cell_${uuidv4()}`
                },
                {
                    type: "table-cell",
                    children: [{ text: "", bold: true }],
                    id: `cell_${uuidv4()}`
                },
            ],
            id: `row_${uuidv4()}`
        },
        {
            type: "table-row",
            children: [
                {
                    type: "table-cell",
                    children: [{ text: "" }],
                    id: `cell_${uuidv4()}`
                },
                {
                    type: "table-cell",
                    children: [{ text: "" }],
                    id: `cell_${uuidv4()}`
                },
                {
                    type: "table-cell",
                    children: [{ text: "" }],
                    id: `cell_${uuidv4()}`
                },
            ],
            id: `row_${uuidv4()}`
        },
        {
            type: "table-row",
            children: [
                {
                    type: "table-cell",
                    children: [{ text: "" }],
                    id: `cell_${uuidv4()}`
                },
                {
                    type: "table-cell",
                    children: [{ text: "" }],
                    id: `cell_${uuidv4()}`
                },
                {
                    type: "table-cell",
                    children: [{ text: "" }],
                    id: `cell_${uuidv4()}`
                },
            ],
            id: `row_${uuidv4()}`
        },
    ];

    const table: Descendant = { type: "table", children: children, id: `table_${uuidv4()}` };
    Transforms.insertNodes(editor, table);
};

/**
 * Thêm mới 1 cột trong bảng
 */
const insertTableColumn = (editor, currentId) => {
    //Tìm table => lấy ra children => chỉnh sửa children => update lại node
    for (const [node, path] of Editor.nodes(editor, { at: Range, match: (n: any) => n.type === "table" })) {
        let children = node.children;
        let columnIndex = 0;

        (children || []).map((tableRow, idx) => {
            //Tập các cell tương ứng
            let cells = Object.assign([], tableRow.children);
            (cells || []).map((cell, subIdx) => {
                if (cell?.id == currentId) {
                    columnIndex = subIdx;
                }
            });
        });

        children = children.map((tableRow, idx) => {
            //tableRow => Là 1 dòng (row cụ thể)

            //Tập các cell tương ứng
            let cells = Object.assign([], tableRow.children);
            let newCells = [];
            (cells || []).map((cell, subIdx) => {
                newCells[newCells.length] = cell;
                if (columnIndex == subIdx) {
                    newCells[newCells.length] = {
                        type: "table-cell",
                        children: [{ text: "" }],
                        id: `cell_${uuidv4()}`
                    }
                }
            });

            let ntrow = {
                type: tableRow.type,
                children: newCells,
            };

            return ntrow;
        });

        //Xóa cũ
        Transforms.removeNodes(editor, {
            at: Range,
            match: (n: any) => n.type == "table",
        });

        //Thực hiện chèn lại
        Transforms.insertNodes(editor, {
            type: "table",
            children: children,
        });
    }
};

/**
 * Thêm một hàng cuối trong bảng
 * @param currentId (ID của cell cần thêm cột)
 */
const insertTableRow = (editor, currentId) => {
    let point = new Date().getTime();

    //Tìm table => lấy ra children => chỉnh sửa children => update lại node
    for (const [node, path] of Editor.nodes(editor, { at: Range, match: (n: any) => n.type === "table" })) {
        //1. Trả về mảng table-row
        let children = Object.assign([], node.children);

        //Hình thành dòng mới
        let newRow = {
            type: "table-row",
            children: [],
            id: `row_${uuidv4()}`
        };
        (children[0]?.children || []).map(item => {
            newRow.children.push({
                type: "table-cell",
                children: [{ text: "" }],
                id: `cell_${uuidv4()}`
            });
        });

        //Thêm dòng
        let rows = [];
        (children || []).map(row => {
            rows[rows.length] = row;

            //Lặp cột để tìm
            (row?.children || []).map(cell => {
                if (cell?.id == currentId) {
                    rows[rows.length] = newRow;
                }
            });
        })

        //Xóa cũ
        Transforms.removeNodes(editor, {
            at: Range,
            match: (n: any) => n.type == "table",
        });

        //Thực hiện chèn lại
        Transforms.insertNodes(editor, {
            type: "table",
            children: rows,
        });
    }
};

/**
 * Xóa bảng trong Editor
 */
const removeTable = (editor, currentId) => {
    Transforms.removeNodes(editor, {
        at: Range,
        match: (n: any) => n.type == "table" && n?.id == currentId,
    });
};

/**
 * Xóa 1 cột trong Editor
 */
const removeTableColumn = (editor, currentId) => {
    //Tìm table => lấy ra children => chỉnh sửa children => update lại node
    for (const [node, path] of Editor.nodes(editor, { at: Range, match: (n: any) => n.type === "table" })) {
        let children = node.children;
        let columnIndex = 0;

        //Tìm cột cần xóa
        (children || []).map((tableRow, idx) => {
            //Tập các cell tương ứng
            let cells = Object.assign([], tableRow.children);
            (cells || []).map((cell, subIdx) => {
                if (cell?.id == currentId) {
                    columnIndex = subIdx; //==> Thấy cột cần xóa
                }
            });
        });

        children = children.map((tableRow, idx) => {
            //tableRow => Là 1 dòng (row cụ thể)

            //Tập các cell tương ứng
            let cells = Object.assign([], tableRow.children);
            let newCells = [];
            (cells || []).map((cell, subIdx) => {
                //Chỉ giữ lại cột có chỉ số khác columnIndex
                if (columnIndex != subIdx) {
                    newCells[newCells.length] = cell;
                }
            });

            let ntrow = {
                type: tableRow.type,
                children: newCells,
            };

            return ntrow;
        });

        //Xóa cũ
        Transforms.removeNodes(editor, {
            at: Range,
            match: (n: any) => n.type == "table",
        });

        //Thực hiện chèn lại
        Transforms.insertNodes(editor, {
            type: "table",
            children: children,
        });
    }
};

/**
 * Xóa một hàng cuối trong bảng
 * @param currentId Đây là cellId
 */
const removeTableRow = (editor, currentId) => {
    let point = new Date().getTime();

    //Tìm table => lấy ra children => chỉnh sửa children => update lại node
    for (const [node, path] of Editor.nodes(editor, { at: Range, match: (n: any) => n.type === "table" })) {
        //Đây là tập các hàng
        let children = Object.assign([], node.children);
        let rowIndex = 0;

        (children || []).map((row, idx) => {
            //Lặp cột để tìm
            (row?.children || []).map(cell => {
                if (cell?.id == currentId) {
                    rowIndex = idx;
                }
            });
        })

        children = (children || []).map((row, idx) => {
            if (rowIndex != idx) {
                return row;
            }

            return null;
        }).filter(t => t);

        //Xóa cũ
        Transforms.removeNodes(editor, {
            at: Range,
            match: (n: any) => n.type == "table",
        });

        //Thực hiện chèn lại
        Transforms.insertNodes(editor, {
            type: "table",
            children: children,
        });
    }
};

export {
    withTables,
    insertTable,
    insertTableColumn,
    insertTableRow,
    removeTable,
    removeTableColumn,
    removeTableRow
};
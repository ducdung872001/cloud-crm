import { ColDef } from "ag-grid-community";
import GridService from "services/GridService";
import CustomHeader from "../partial/CustomHeader";
import CustomCellEdit from "../partial/CustomCellEdit";
import CustomCellRender from "../partial/CustomCellRender";
import CustomCellNoRender from "../partial/CustomCellNoRender";
import CustomHeaderNo from "../partial/CustomHeaderNo";
import { TypeNo } from "../Type/datatype";
import { fetchDataLookupGrid } from "./lookupGrid";
import CustomCellCommentLast from "../partial/CustomCellCommentLast";

export const defaultNote = {
  noteId: "Activity_0n3i8dv",
  fieldName: "boq",
  potId: 496,
  workId: 1813,
  processId: 380,
};

const getDetailRow = async (nodeId, fieldName, potId, workId) => {
  try {
    const params = {
      nodeId: nodeId,
      fieldName: fieldName,
      potId: potId,
      workId: workId,
    };
    const response = await GridService.detailRow(params);

    if (response.code == 0) {
      const result = response.result;
      const dataResult = (result?.data && JSON.parse(result.data)) || {};

      const data = dataResult?.dataRow || [];

      let checkedMap = dataResult?.checkedMap || null;

      if (!checkedMap && data.length > 0) {
        checkedMap = {};
        data.map((row) => {
          checkedMap[row.rowKey] = {};
          Object.keys(row).map((key) => {
            checkedMap[row.rowKey][key] = false;
          });
        });
      }
      return { data, checkedMap };
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching detail row:", error);
    return [];
  }
};

const getDetailArtifact = async (nodeId, fieldName, potId, workId) => {
  try {
    const params = {
      nodeId: nodeId || defaultNote.noteId,
      fieldName: fieldName || defaultNote.fieldName,
    };
    const response = await GridService.detail(params);

    if (response.code == 0) {
      const result = response.result;
      const header = (result?.header && JSON.parse(result.header)) || null;
      const typeNo = (result?.typeNo && result.typeNo) || "auto";
      return { header, typeNo };
    } else {
    }
  } catch (error) {
    console.error("Error fetching detail artifact:", error);
    return null;
  }
};

export const getDataGrid = async (actionRow, params): Promise<{ columns: ColDef[]; data: any[]; typeNo: TypeNo; columnsConfig: any } | undefined> => {
  try {
    // Your async logic here
    console.log("Fetching data...");
    const { header, typeNo } = await getDetailArtifact(
      params?.noteId || defaultNote.noteId,
      params?.fieldName || defaultNote.fieldName,
      params?.potId || defaultNote.potId,
      params?.workId || defaultNote.workId
    );
    const dataDetailRow: any = await getDetailRow(
      params?.noteId || defaultNote.noteId,
      params?.fieldName || defaultNote.fieldName,
      params?.potId || defaultNote.potId,
      params?.workId || defaultNote.workId
    );
    const data = dataDetailRow?.data || [];
    const checkedMap = dataDetailRow?.checkedMap || null;
    const dataComment = await getListComment(params);
    const dataGrid = {
      columns: [],
      data: [],
      typeNo: typeNo as TypeNo,
      columnsConfig: [],
      dataLookup: {},
      dataComment: dataComment,
      checkedMap: checkedMap,
    };
    if (header && header.length > 0) {
      const columnsForGrid = generateColumns(header, actionRow, typeNo, params);
      dataGrid.columns = columnsForGrid;
      dataGrid.columnsConfig = header;
      if (data && data.length > 0) {
        let _dataLookup = await mapDataWithLookup(header, data);
        dataGrid.dataLookup = _dataLookup.dataLookup;
        dataGrid.data = _dataLookup.dataWithLookup;
      }
    }
    return dataGrid; // Return the fetched data
  } catch (error) {
    console.error("Error in getDataGrid:", error);
    // throw error; // Re-throw the error for further handling if needed
  }
};

export const generateColumns = (header, actionRow, typeNo, params) => {
  const columnsForGrid: any = header
    .map((col) => {
      console.log("col", col);

      const editable = col.readOnly != 1 && params?.enableEditCell && col.type != "checkbox" && col.type != "radio" ? true : false;

      let column: any = {
        headerName: col.name,
        field: col.key,
        sortable: true,
        filter: true,
        autoHeight: true, // 👈 cho phép chiều cao linh hoạt theo nội dung
        minWidth: 200,
        editable: editable,
        headerComponent: CustomHeader,
        cellEditor: CustomCellEdit,
        cellEditorParams: {
          type: col.type, // 👈 Prop bổ sung
          options: col.options || [],
          readOnly: col.readOnly == 1 ? true : false,
          required: col.required || false,
          lookup: col.lookup || "",
          formula: col.formula || "",
          timeRange: col.timeRange || "",
          listBindingField: col.listBindingField || [],
          col_key: col.key,
        },
        cellRenderer: CustomCellRender,
        cellRendererParams: {
          enableAddCmtCell: params?.enableAddCmtCell || false,
          col_key: col.key,
          type: col.type, // 👈 Prop bổ sung
          options: col.options || [],
          readOnly: col.readOnly == 1 ? true : false,
          required: col.required || false,
          regex: col.regex || "",
          lookup: col.lookup || "",
          formula: col.formula || "",
          timeRange: col.timeRange || "",
          listBindingField: col.listBindingField || [],
          haveCheckbox: col?.haveCheckbox == 1 ? true : false,
          haveRadio: col?.haveRadio == 1 ? true : false,
        },
        position: col.position || 0,
      };
      if (col.key == "stt" || col.key == "no" || col.key == "STT") {
        column = {
          headerName: "STT",
          field: col.key,
          headerComponent: CustomHeaderNo,
          headerClass: "header-no",
          // valueGetter: (params) => params.node.rowIndex + 1,
          width: 80,
          cellStyle: { textAlign: "center" },
          resizable: true,
          editable: typeNo == "input" ? true : false,
          cellRenderer: CustomCellNoRender,
          cellRendererParams: {
            actionRow: actionRow,
            type: col.type, // 👈 Prop bổ sung
            options: col.options || [],
            readOnly: col.readOnly == 1 ? true : false,
            required: col.required || false,
            lookup: col.lookup || "",
            formula: col.formula || "",
            timeRange: col.timeRange || "",
          },
        };
      }
      return column;
    })
    .sort((a, b) => a.position - b.position);
  let columnLast: any = {
    headerName: "Làm rõ",
    field: "cot-lam-ro",
    sortable: false,
    filter: false,
    autoHeight: true, // 👈 cho phép chiều cao linh hoạt theo nội dung
    width: 100,
    editable: false,
    resizable: false,
    headerComponent: CustomHeader,
    cellRenderer: CustomCellCommentLast,
    cellRendererParams: {
      col_key: "cot-lam-ro",
      type: "cot-lam-ro", // 👈 Prop bổ sung
      readOnly: true,
    },
    position: 99999,
  };

  columnsForGrid.push(columnLast);

  return columnsForGrid;
};

export const mapDataWithLookup = async (header, data) => {
  const dataLookup = await fetchDataLookupGrid(header, data);
  let dataWithLookup = [];
  if (dataLookup && Object.keys(dataLookup).length > 0) {
    // Nếu có dữ liệu lookup, thực hiện gán giá trị từ lookup vào data
    dataWithLookup = data.map((row) => {
      let colBinding = header.filter((col) => col.type === "binding");
      if (colBinding.length > 0) {
        colBinding.forEach((col) => {
          if (row[col.key]) {
            let listBindingField = col?.listBindingField || [];
            let lookupData = dataLookup?.[col.lookup]?.listValue || [];
            let itemLookup = lookupData.find((item) => item.value == row[col.key]);
            if (itemLookup) {
              listBindingField.forEach((bindingField) => {
                row[bindingField.key] = itemLookup[bindingField.key] || null;
              });
            } else {
              listBindingField.forEach((bindingField) => {
                row[bindingField.key] = null;
              });
            }
          } else {
            let listBindingField = col?.listBindingField || [];
            listBindingField.forEach((bindingField) => {
              row[bindingField.key] = null;
            });
          }
        });
      }
      return row;
    });
  } else {
    dataWithLookup = data;
  }
  return {
    dataWithLookup,
    dataLookup,
  };
};

export const getListComment = async (params) => {
  try {
    const param = {
      nodeId: params.nodeId || defaultNote.noteId,
      potId: params.potId || defaultNote.potId,
      fieldName: params.fieldName || defaultNote.fieldName,
      workId: params.workId || defaultNote.workId,
      limit: 500,
    };
    const response = await GridService.listComment(param);
    if (response.code === 0) {
      if (response?.result?.items && response?.result?.items?.length > 0) {
        let listData = {};
        let listDataLast = {};
        response?.result?.items.map((item) => {
          listData = {
            ...listData,
            [item.rowKey + "-" + item.columnKey]: true,
          };
          listDataLast = {
            ...listDataLast,
            [item.rowKey]: true,
          };
        });
        return {
          listData,
          listDataLast,
        };
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    return null;
  }
};

export const getDataConfig = (actionRow) => {
  const dataGrid = {
    columns: [
      // {
      //   headerName: "STT",
      //   field: "stt",
      //   headerComponent: CustomHeaderNo,
      //   headerClass: "header-no",
      //   // valueGetter: (params) => params.node.rowIndex + 1,
      //   width: 80,
      //   cellStyle: { textAlign: "center" },
      //   resizable: true,
      //   editable: false,
      //   cellRenderer: CustomCellNoRender,
      //   cellRendererParams: {
      //     actionRow: actionRow,
      //   },
      // },
    ],
    data: [],
    typeNo: "auto",
    columnsConfig: [
      {
        headerName: "STT",
        name: "STT",
        key: "stt",
        valueGetter: (params: any) => params.node.rowIndex + 1,
        width: 80,
        cellStyle: { textAlign: "center" },
      },
    ],
    dataLookup: {},
    dataComment: null,
    checkedMap: null,
  };
  return dataGrid;
};

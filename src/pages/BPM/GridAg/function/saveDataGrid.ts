import GridService from "services/GridService";
import { EMAIL_REGEX, PHONE_REGEX_NEW } from "utils/constant";

const optionRegex = {
  phoneRegex: PHONE_REGEX_NEW,
  emailRegex: EMAIL_REGEX,
};

const defaultNote = {
  noteId: "Activity_0n3i8dv",
  fieldName: "boq",
  potId: 496,
  workId: 1813,
  processId: 380,
  documentType: "PVYC",
};

export const saveDataGrid = async (columnsConfig: any[], currentDataRow: any[], params, checkedMap): Promise<{ code; message } | undefined> => {
  try {
    // Your async logic here
    let dataRow = currentDataRow.map((row) => {
      if (row.isFullWidthRow) {
        return row;
      } else {
        let newRow = {}; // Tạo bản sao của row hiện tại
        columnsConfig.forEach((col) => {
          // Bỏ giá trị nếu column không tồn tại trong row
          newRow[col.key] = row[col.key] !== undefined ? row[col.key] : null;
        });
        newRow["rowKey"] = row["rowKey"]; // Giữ nguyên rowKey
        return newRow;
      }
    }); // Deep copy to avoid mutating the original data
    console.log("dataRow to save:", dataRow);

    let check_required = false;
    let check_regex = false;
    dataRow.map((item) => {
      if (!item.isFullWidthRow) {
        columnsConfig.map((field) => {
          if (field?.required && !item[field.key]) {
            console.log("field?.required && !item[field.key]", field, item);

            check_required = true;
          }
          if (field.regex && item[field.key] && !item[field.key].match(optionRegex[field.regex])) {
            check_regex = true;
          }
        });
      }
    });

    if (check_required) {
      return { code: 1, message: "Vui lòng nhập đủ trường dữ liệu bắt buộc" };
    }
    if (check_regex) {
      return { code: 1, message: "Dữ liệu không hợp lệ" };
    }

    const param = {
      nodeId: params?.nodeId || defaultNote.noteId,
      processId: params?.processId || defaultNote.processId,
      potId: params?.potId || defaultNote.potId,
      fieldName: params?.fieldName || defaultNote.fieldName,
      documentType: params?.documentType || defaultNote.documentType,
      workId: params?.workId || defaultNote.workId,
      data: JSON.stringify({ dataRow, checkedMap }),
      // dataHeader: JSON.stringify(checkedMap),
    };

    const response = await GridService.updateRow(param);

    return response; // Return the fetched data
  } catch (error) {
    console.error("Error in getDataGrid:", error);
    // throw error; // Re-throw the error for further handling if needed
  }
};

const generateDataSave = (columnsConfig, dataRow) => {
  const data = dataRow.map((row) => {
    let rowData: any = [];
    if (row.isFullWidthRow) {
      rowData = {
        no: row.no,
        type: row.type || "title",
        style: "title-H" + row.level,
        rowKey: row.rowKey,
        content: row.content,
        indexTitle: "",
        isShowEdit: false,
      };
      return rowData;
    } else {
      columnsConfig.forEach((col) => {
        rowData.push({
          ...col,
          rowKey: row.rowKey,
          key: col.key,
          value: row[col.key] !== undefined ? row[col.key] : null,
        });
      });
    }
    return rowData;
  });
  // Thêm 1 phần tử vào đầu mảng
  data.unshift(columnsConfig);
  return data;
};

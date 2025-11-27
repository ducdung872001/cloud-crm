import React, { useEffect, useMemo, useRef, useState } from "react";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import Icon from "components/icon";
import { IOption } from "model/OtherModel";
import { v4 as uuidv4 } from "uuid";
import { Parser } from "formula-functionizer";

import "./index.scss";
import Button from "components/button/button";
import Popover from "components/popover/popover";
import { useOnClickOutside } from "utils/hookCustom";
import NoteField, { INoteData } from "./partials/NoteField";
import ImageThirdGender from "assets/images/third-gender.png";
import Checkbox from "components/checkbox/checkbox";
import ModalExport from "./partials/ModalExport/ModalExport";
import ModalImport from "./partials/ModalImport";
import { PHONE_REGEX, EMAIL_REGEX, PHONE_REGEX_NEW } from "utils/constant";
import _, { set } from "lodash";
import ModalAddColumn from "./partials/ModalAddColumn/ModalAddColumn";
import SelectLookup from "./partials/SelectLookup/SelectLookup";
import GridService from "services/GridService";
import { getSearchParameters } from "reborn-util";
import { showToast } from "utils/common";
// import { setTime } from "react-datepicker/dist/date_utils";
import ModalComment from "./partials/ModalComment";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
// import ModalAddSupplier from "pages/Supplier/partials/ModalAddSupplier";
import ActionRow from "./partials/ActionRowPopup/ActionRow";
import { Textarea } from "@bpmn-io/form-js-viewer";
import TextArea from "components/textarea/textarea";
import CustomerService from "services/CustomerService";
import ReasonListBpmService from "services/ReasonListBpmService";
import ProjectCatalogService from "services/ProjectCatalogService";
import ProjectRealtyService from "services/ProjectRealtyService";
import UnitService from "services/UnitService";
import MaterialService from "services/MaterialService";
import FieldListService from "services/FieldListService";
import BusinessCategoryService from "services/BusinessCategoryService";
import SupplierService from "services/SupplierService";
import InvestorService from "services/InvestorService";
import ProcurementService from "services/ProcurementService";
import { dataRowHsmt, headerHsmt, dataRowHsmtTvtk } from "./GridConfigHsmt";
import WorkCategoryService from "services/WorkCategoryService";

export interface IColumnGrid {
  name: string;
  key?: string;
  type: "text" | "number" | "checkbox" | "select" | "lookup" | "binding" | "date";
  options?: IOption[];
  required?: boolean;
  regex?: RegExp;
  position?: number;
  lookup?: string;
  format_lookup?: string;
}

export default function GridFormNew(props: any) {
  const params: any = getSearchParameters();
  const columns = props.columns || [];
  const title = props?.title || "Danh mục";
  const data = props?.data || [];

  const parser = new Parser();

  const enableAddRow = params?.enableAddRow == "false" ? false : true;
  const enableAddColumns = params?.enableAddColumns == "false" ? false : true;
  const enableExport = params?.enableExport == "false" ? false : true;
  const enableImport = params?.enableImport == "false" ? false : true;
  const enableAddCmtCell = params?.enableAddCmtCell == "false" ? false : true;
  const enableAddCmtCol = params?.enableAddCmtCol == "false" ? false : true;
  const enableEditCell = params?.enableEditCell == "false" ? false : true;
  const enableSave = params?.enableSave == "false" ? false : true;
  const fieldName = params?.fieldName || "";
  const documentType = params?.documentType || "";
  const procurementType = params?.procurementType || "";

  const optionRegex = {
    phoneRegex: PHONE_REGEX_NEW,
    emailRegex: EMAIL_REGEX,
  };

  //Biến này dùng để kiểm tra xem các trường bắt buộc đã được điền đầy đủ chưa
  const [checkRequired, setCheckRequired] = useState<boolean>(false);
  const [checkRegex, setCheckRegex] = useState<boolean>(false);

  const [listLoadBindingField, setListLoadBindingField] = useState<any[]>([]);
  const [success, setSuccess] = useState(true);
  const [loading, setLoading] = useState(false);

  const getDetailArtifact = async (nodeId, fieldName, potId, workId) => {
    const params = {
      nodeId: nodeId,
      fieldName: fieldName,
    };
    const response = await GridService.detail(params);

    if (response.code == 0) {
      const result = response.result;
      const header = (result?.header && JSON.parse(result.header)) || null;
      setListColumn(header || []);
      let dataRowOrigin: any = await getDetailRow(nodeId, fieldName, potId, workId, header);
      if (dataRowOrigin && dataRowOrigin.length && dataRowOrigin[0].length) {
        const listComment = await getListComment();
        if (listComment) {
          dataRowOrigin = dataRowOrigin.map((item) => {
            if (item.type == "title") {
              return item;
            }

            return item.map((field) => {
              return {
                ...field,
                isHaveNote: listComment[field.rowKey + "-" + field.key] ? true : false,
              };
            });
          });
        }
        setDataRow(dataRowOrigin);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setLoading(false);
  };

  const getDetailHsmt = async (nodeId, fieldName, potId, workId) => {
    setListColumn(headerHsmt);
    let dataRowOrigin: any = await getDetailRow(nodeId, fieldName, potId, workId, headerHsmt);
    if (dataRowOrigin && dataRowOrigin.length && dataRowOrigin[0].length) {
      // Nếu có dữ liệu hồ sơ mời thầu rồi thì hiển thị dữ liệu
      setDataRow(dataRowOrigin);
    } else {
      // Nếu chưa có dữ liệu thì hiển thị dữ liệu mẫu trống
      let data_model = [];
      if (procurementType == "tvtk") {
        data_model = dataRowHsmtTvtk;
      } else {
        data_model = dataRowHsmt;
      }
      setDataRow(
        data_model.map((item, index) => {
          if (index == 0) {
            return item;
          } else {
            let uuid = uuidv4();
            if (item?.length) {
              return item.map((field) => {
                return {
                  ...field,
                  rowKey: uuid,
                };
              });
            } else {
              return {
                ...item,
                rowKey: uuid,
              };
            }
          }
        })
      );
    }
  };

  const getDetailRow = async (nodeId, fieldName, potId, workId, header) => {
    const params = {
      nodeId: nodeId,
      fieldName: fieldName,
      potId: potId,
      workId: workId,
    };
    const response = await GridService.detailRow(params);

    if (response.code == 0) {
      const result = response.result;
      const data = (result?.data && JSON.parse(result.data)) || [];

      if (data && data.length > 0 && data[0].length > 0) {
        // setDataRow(data);
        if (!header) {
          const newDataHeader = data[0].map((item) => {
            return {
              name: item.name,
              key: item.key,
              type: item.type,
              required: item.required,
              options: item.options || [],
              position: item.position,
              lookup: item.lookup,
              formula: item.formula,
              timeRange: item.timeRange,

              regex: item.regex,
              readOnly: item?.readOnly,
            };
          });
          addColumn(newDataHeader);
        }
        return data;
      }
    } else {
      return [];
    }
  };

  useEffect(() => {
    if (fieldName != "hsmt") {
      setLoading(true);
      if (params?.nodeId && params?.fieldName && params?.potId && params?.workId) {
        getDetailArtifact(params?.nodeId, params?.fieldName, params?.potId, params?.workId);
      } else {
        getDetailArtifact("Activity_0n3i8dv", "boq", 496, 1813); // Dữ liệu test
      }
    } else {
      // Xử lý trường hợp hiển thị danh sách hồ sơ mời thầu ở đây
      if (params?.nodeId && params?.fieldName && params?.potId && params?.workId) {
        getDetailHsmt(params?.nodeId, params?.fieldName, params?.potId, params?.workId);
      } else {
        getDetailHsmt("Activity_0n3i8dv", "hsmt", 496, 1813); // Dữ liệu test
      }
    }
  }, []);

  const [listColumn, setListColumn] = useState<any[]>([]);

  const [listDataExport, setListDataExport] = useState<any[]>([]);

  const [isChangeColumns, setIsChangeColumns] = useState<boolean>(false);

  useEffect(() => {
    if (params.fieldName == "hsmt") {
      return;
    }
    const dataRowHeahder = listColumn.map((item: any) => ({
      name: item.name,
      key: item.key,
      rowKey: item.rowKey,
      type: item.type,
      placeholder: item.name,
      value: item.type === "checkbox" ? false : "",
      showNote: false,
      // noteList: [],
      options: item?.options ?? [],
      required: item?.required || false,
      // regex: item?.regex || "",
      regex: item?.regex ? item.regex : "",
      lookup: item?.lookup || "",
      formula: item?.formula || "",
      timeRange: item?.timeRange || "",
      readOnly: item?.readOnly == 1 ? true : false,
    }));
    const baseRowFist = listColumn.map((item: any) => ({
      name: item.name,
      key: item.key,
      rowKey: item.rowKey,
      type: item.type,
      placeholder: item.name,
      value: item.type === "checkbox" ? false : "",
      showNote: false,
      // noteList: [],
      options: item?.options ?? [],
      required: item?.required || false,
      // regex: item?.regex || "",
      regex: item?.regex ? item.regex : "",
      lookup: item?.lookup || "",
      formula: item?.formula || "",
      timeRange: item?.timeRange || "",
      listBindingField: item?.listBindingField || [],
      isBinding: item?.isBinding || false,
      bindingField: item?.bindingField || "",
      readOnly: item?.readOnly == 1 ? true : false,
    }));
    setBaseRow(baseRowFist);

    if (dataRow.length > 0 && dataRow[0].length > 0) {
      let dataRowNew = dataRow.map((item) => {
        if (item.length) {
          return listColumn.map((col) => {
            if (item.find((el) => el.key == col.key)) {
              const itemNew = item.find((el) => el.key == col.key);
              return {
                ...itemNew,
                regex: col?.regex ? col.regex.toString() : "",
              };
            } else {
              return {
                name: col.name,
                key: col.key,
                rowKey: item.find((el) => el.rowKey)?.rowKey || "",
                type: col.type,
                placeholder: col.name,
                value: col.type === "checkbox" ? false : "",
                showNote: false,
                noteList: [],
                options: col?.options ?? [],
                required: col?.required || false,
                regex: col?.regex ? col.regex : "",
                lookup: col?.lookup || "",
                formula: col?.formula || "",
                timeRange: col?.timeRange || "",
                listBindingField: col?.listBindingField || [],
                isBinding: col?.isBinding || false,
                bindingField: col?.bindingField || "",
                readOnly: col?.readOnly == 1 ? true : false,
              };
            }
          });
        } else {
          return item;
        }
      });
      let listMapKeyValue = [];
      dataRowNew.map((item) => {
        let mapKeyValue = {};
        if (item?.length) {
          item.map((field) => {
            mapKeyValue[field.key] = field.value;
          });
        }
        listMapKeyValue.push(mapKeyValue);
      });
      //Tính toán giá trị cho các trường formula hoặc time_range
      const updatedDataNew = dataRowNew.map((row, rIdx) => {
        if (row.type == "title") {
          return row;
        }
        return row.map((field, fIdx) => {
          if (field.type == "formula" && field?.formula) {
            // Phân tích biểu thức thành một hàm
            const formula = parser.parse(JSON.parse(field.formula)?.formula);
            const result = formula(listMapKeyValue[rIdx]);
            return {
              ...field,
              value: result,
            };
          } else if (field.type == "time_range" && field?.timeRange) {
            let timeRange = JSON.parse(field.timeRange);
            const startDate = moment(new Date(listMapKeyValue[rIdx][timeRange.startDate]), "MM/DD/YYYY");
            const endDate = moment(new Date(listMapKeyValue[rIdx][timeRange.endDate]), "MM/DD/YYYY");

            let count = 0;
            let currentDate = startDate.clone();

            while (currentDate.isSameOrBefore(endDate)) {
              const dayOfWeek = currentDate.day();
              if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                // 0 là Chủ nhật, 6 là Thứ 7
                count++;
              }
              currentDate.add(1, "days");
            }
            return {
              ...field,
              value: count + " ngày",
            };
          }
          return field;
        });
      });
      setDataRow(updatedDataNew);
      setListLoading(updatedDataNew);
      if (isChangeColumns) {
        saveDataRow(dataRowNew);
      }
      let check_required = false;
      let check_regex = false;
      for (let i = 0; i < dataRowNew.length; i++) {
        for (let j = 0; j < dataRowNew[i].length; j++) {
          listColumn.map((field) => {
            if (field.key == dataRowNew[i][j].key && field?.required && !dataRowNew[i][j].value && i != 0) {
              check_required = true;
            }
            if (
              field.key == dataRowNew[i][j].key &&
              field.regex &&
              dataRowNew[i][j].value &&
              !dataRowNew[i][j].value.match(optionRegex[field.regex])
            ) {
              check_regex = true;
            }
          });
        }
      }
      setCheckRegex(check_regex);
      setCheckRequired(check_required);
    } else {
      setDataRow([dataRowHeahder]);
    }
  }, [listColumn, params.fieldName]); // Chỉ chạy khi listColumn.length thay đổi (thêm hoặc xóa cột)

  useEffect(() => {
    let success = true;
    if (listLoadBindingField?.length > 0) {
      listLoadBindingField.map((item) => {
        if (!item.success) {
          success = false;
        }
      });
    } else {
      success = true;
    }
    setSuccess(success);
  }, [listLoadBindingField]);

  const setListLoading = (data) => {
    let _listLoadBindingField = [];
    data.map((item, index) => {
      if (index != 0) {
        if (item.length) {
          item.map((field, indexField) => {
            if (field.type == "binding") {
              _listLoadBindingField.push({
                rowIndex: index,
                columnIndex: indexField,
                success: !field?.value || dataRow[index][indexField]?.value == field?.value ? true : false,
              });
            }
          });
        }
      }
    });
    setListLoadBindingField(_listLoadBindingField);
  };

  const [baseRow, setBaseRow] = useState([]);

  const [dataRow, setDataRow] = useState([]);
  // console.log("dataRow>>>", dataRow);

  useEffect(() => {
    window.parent.postMessage(
      {
        type: "DATA_ROW",
        data: dataRow,
        params: params,
        listColumn: listColumn,
      },
      "*"
    );
  }, [dataRow, params, listColumn]);

  const handlExportData = () => {
    if (listColumn.length) {
      const list_data_new = [];
      for (let i = 0; i < dataRow.length; i++) {
        if (dataRow[i].length > 0) {
          let data_row_note = {
            id: dataRow[i][0]?.id ? dataRow[i][0]?.id : null,
            key: dataRow[i][0]?.key ? dataRow[i][0]?.key : null,
            rowKey: dataRow[i][0]?.rowKey ? dataRow[i][0]?.rowKey : null,
            listHaveNote: {},
            options: dataRow[i][0]?.options ? dataRow[i][0]?.options : [],
          };
          for (let j = 0; j < dataRow[i].length; j++) {
            data_row_note = {
              ...data_row_note,
              [dataRow[i][j].key]: dataRow[i][j].value,
              rowKey: dataRow[i][j].rowKey,
              listHaveNote: {
                ...data_row_note.listHaveNote,
                [dataRow[i][j].key]: dataRow[i][j].isHaveNote,
              },
              options: dataRow[i][j]?.options ? dataRow[i][j]?.options : [],
            };
          }
          if (i != 0 && dataRow[i].length) {
            list_data_new.push(data_row_note);
          }
        } else {
          list_data_new.push({
            content: dataRow[i].content,
          });
        }
      }
      setListDataExport(list_data_new);
    }
  };

  const handChangeValueItem = (rowIndex, fieldIndex, value, type) => {
    if (type === "binding") {
      let check_required = false;
      const updatedData = dataRow.map((row, rIdx) => {
        if (rIdx === rowIndex) {
          let new_field: any = [];
          for (let fIdx = 0; fIdx < row.length; fIdx++) {
            const element = row[fIdx];
            if (fIdx === fieldIndex) {
              if (element.required && !value.value) {
                check_required = true;
              }
              new_field.push({
                ...element,
                value: value.value,
              });
            } else {
              new_field.push(element);
            }
          }
          new_field = new_field.map((field) => {
            if (typeof value[field.key] != "undefined") {
              if (value?.options_value?.length && field.key.includes("NguoiLienHe_")) {
                return {
                  ...field,
                  value: value?.options_value ? value?.options_value.find((el) => el.isDefault)?.value : "",
                  options: value?.options_value,
                };
              } else {
                return {
                  ...field,
                  value: value[field.key],
                };
              }
            } else {
              if (field.key.includes("_NguoiLienHe")) {
                const firstKey = Object.keys(value).find((key) => key.includes("NguoiLienHe_"));
                if (firstKey) {
                  let listContact = JSON.parse(value[firstKey]);
                  if (listContact.length) {
                    let defaultContact = listContact.find((el) => el.isDefault);
                    let valueKey =
                      field.key == "SoDienThoai_NguoiLienHe"
                        ? defaultContact?.phone
                        : field.key == "Email_NguoiLienHe"
                        ? defaultContact?.email
                        : field.key == "ChucVu_NguoiLienHe"
                        ? defaultContact?.position
                        : "";
                    return {
                      ...field,
                      value: valueKey,
                    };
                  } else {
                    return field;
                  }
                } else {
                  return field;
                }
              } else {
                return field;
              }
            }
          });
          return new_field;
        }
        if (row.type == "title") {
          return row;
        }
        return row.map((field) => ({ ...field }));
      });
      setCheckRequired(check_required);
      setDataRow(updatedData);
    } else {
      const valueData =
        type == "checkbox"
          ? value.target.checked
          : type == "select"
          ? value.value
          : type == "lookup"
          ? value.value
          : type == "number"
          ? value.floatValue
          : type == "date"
          ? value
          : value.target.value;
      let check_required = false;
      let listMapKeyValue = [];
      const updatedData = dataRow.map((row, rIdx) => {
        const mapKeyValue = {};
        if (rIdx === rowIndex) {
          let rowMapReturn = row.map((field, fIdx) => {
            mapKeyValue[field.key] = fIdx === fieldIndex ? valueData : field.value;
            if (field?.required && !valueData) {
              check_required = true;
            }
            if (fIdx === fieldIndex) {
              return {
                ...field,
                value: valueData,
                isRegexFalse: valueData && field?.regex && !valueData.match(optionRegex[field.regex]) ? true : false,
              };
            } else {
              if (field?.required && !field.value) {
                check_required = true;
              }
              if (field.regex) {
                return {
                  ...field,
                  isRegexFalse: field.value && field?.regex && !field.value.match(optionRegex[field.regex]) ? true : false,
                };
              }
            }
            return field;
          });
          listMapKeyValue.push(mapKeyValue);
          return rowMapReturn;
        } else {
          if (row.type == "title") {
            return row;
          }
          let rowMapReturn = row.map((field) => {
            mapKeyValue[field.key] = field.value;
            if (rIdx != 0) {
              if (field?.required && !field.value) {
                check_required = true;
              }
              if (field.regex) {
                return {
                  ...field,
                  isRegexFalse: field.value && field?.regex && !field.value.match(optionRegex[field.regex]) ? true : false,
                };
              }
            }
            return field;
          });
          listMapKeyValue.push(mapKeyValue);
          return rowMapReturn;
        }
      });
      //Tính toán giá trị cho các trường formula hoặc time_range
      const updatedDataNew = updatedData.map((row, rIdx) => {
        if (row.type == "title") {
          return row;
        }
        return row.map((field, fIdx) => {
          if (field.type == "formula" && field?.formula) {
            // Phân tích biểu thức thành một hàm
            const formula = parser.parse(JSON.parse(field.formula)?.formula);
            const result = formula(listMapKeyValue[rIdx]);
            return {
              ...field,
              value: result,
            };
          } else if (field.type == "time_range" && field?.timeRange) {
            let timeRange = JSON.parse(field.timeRange);
            const startDate = moment(new Date(listMapKeyValue[rIdx][timeRange.startDate]), "MM/DD/YYYY");
            const endDate = moment(new Date(listMapKeyValue[rIdx][timeRange.endDate]), "MM/DD/YYYY");

            let count = 0;
            let currentDate = startDate.clone();

            while (currentDate.isSameOrBefore(endDate)) {
              const dayOfWeek = currentDate.day();
              if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                // 0 là Chủ nhật, 6 là Thứ 7
                count++;
              }
              currentDate.add(1, "days");
            }
            return {
              ...field,
              value: count + " ngày",
            };
          }
          return field;
        });
      });
      setCheckRequired(check_required);
      setDataRow(updatedDataNew);
    }
  };
  const handleDeleteRow = async (data, idx) => {
    setDataRow(dataRow.filter((item, index) => index !== idx));
  };

  const [showModalNote, setShowModalNote] = useState(false);
  const [dataNoteField, setDataNoteField] = useState([]);

  const handShowModalNote = (field, rowIndex, fieldIndex) => {
    setShowModalNote(true);
    setDataRow(
      dataRow.map((item, index) => {
        if (item.type == "title") {
          return item;
        }
        if (index == rowIndex) {
          return item.map((el, indexEl) => (indexEl == fieldIndex ? { ...el, showNote: true } : { ...el, showNote: false }));
        } else {
          return item.map((el, indexEl) => ({ ...el, showNote: false }));
        }
      })
    );
    setDataNoteField(field.noteList);
  };

  const [showModalImport, setShowModalImport] = useState<boolean>(false);
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);
  const [showModalAddColumn, setShowModalAddColumn] = useState<boolean>(false);
  const [dataColumnEdit, setDataColumnEdit] = useState<any>(null);
  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả dữ liệu",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: true,
      },
      // {
      //   value: "current_search",
      //   label: `Tất cả khách hàng phù hợp với kết quả tìm kiếm hiện tại`,
      //   disabled: true,
      // },
    ],
    []
  );

  const onDeleteColumn = async (param) => {
    const response = await GridService.delete(param);
    if (response.code === 0) {
      // showToast("Xóa quy trình thành công", "success");
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const saveDataRow = async (data) => {
    if (!isChangeColumns) {
      let check_required = false;
      let check_regex = false;
      data.map((item, index) => {
        if (index != 0 && item.length) {
          listColumn.map((field) => {
            if (field?.required && !item.find((el) => el.key == field.key)?.value) {
              check_required = true;
            }
            if (
              field.regex &&
              item.find((el) => el.key == field.key)?.value &&
              !item.find((el) => el.key == field.key)?.value.match(optionRegex[field.regex])
            ) {
              check_regex = true;
            }
          });
        }
      });
      if (check_required) {
        showToast("Các trường bắt buộc không được bỏ trống", "error");
        return;
      }
      if (check_regex) {
        showToast("Dữ liệu không hợp lệ", "error");
        return;
      }
    }
    const param = {
      nodeId: params?.nodeId || "Activity_0n3i8dv",
      processId: params?.processId || 380,
      potId: params?.potId || 496,
      fieldName: params?.fieldName || "boq",
      documentType: params?.documentType || "PVYC",
      workId: params?.workId || 1813,
      data: JSON.stringify(data),
    };
    const response = await GridService.updateRow(param);
    if (response.code === 0) {
      if (!isChangeColumns) {
        showToast("Lưu thành công", "success");
      }
      setIsChangeColumns(false);
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setLoading(false);
  };

  const addColumn = async (list_column) => {
    let dataSubmit = {
      nodeId: params?.nodeId || "Activity_0n3i8dv",
      processId: params?.processId || 380,
      fieldName: params?.fieldName || "boq",
      header: JSON.stringify(list_column),
    };
    const responseHeader = await GridService.update(dataSubmit);

    if (responseHeader.code === 0) {
      const result = responseHeader.result;
      const header = (result?.header && JSON.parse(result.header)) || null;
      setListColumn(header || []);
    }
  };

  const [rowKeyComment, setRowKeyComment] = useState<any>(null);
  const [columnKeyComment, setColumnKeyComment] = useState<any>(null);
  const [dataCommentLast, setDataCommentLast] = useState<any>(null);

  const getListComment = async () => {
    const param = {
      nodeId: params.nodeId || "Activity_0n3i8dv",
      potId: params.potId || 496,
      fieldName: params.fieldName || "boq",
      workId: params.workId || 1813,
      limit: 100,
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
        setDataCommentLast(listDataLast);
        if (dataRow?.length > 0) {
          setDataRow(
            dataRow.map((item) => {
              if (item.type == "title") {
                return item;
              }
              return item.map((field) => {
                return {
                  ...field,
                  isHaveNote: listData[field.rowKey + "-" + field.key] ? true : false,
                };
              });
            })
          );
        }
        return listData;
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      return null;
    }
  };

  // ---------------Start Import frontend-------------------
  const [dataImport, setDataImport] = useState<any>(null);
  const [dataImportHeader, setDataImportHeader] = useState<any>(null);
  const [dataExcel, setDataExcel] = useState<any>(null);

  const [caclData, setCaclData] = useState<any>(false);
  const [lineSuccess, setLineSuccess] = useState<any>(0);

  const lineStart = 2;

  useEffect(() => {
    if (dataExcel) {
      setCaclData(true);
      setLineSuccess(0);
    }
  }, [dataExcel]);
  useEffect(() => {
    if (caclData) {
      caclImportData();
    }
  }, [caclData]);

  function excelDateToJSDate(serial) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);

    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  }

  async function caclImportData() {
    let newDataRow = [dataRow[0]];
    let index = 0;
    for (const element of dataExcel.slice(lineStart)) {
      index++;

      // Tạo 1 row mới
      let uuid = uuidv4();
      let _baseRow = baseRow.map((field) => ({
        ...field,
        rowKey: uuid,
      }));

      let new_field: any = [];
      let listIgnoreField = [];

      if (index == 1) {
        let isRowSpecial = true;
        for (let field of _baseRow) {
          let value = element[field.name];
          if (value) {
            isRowSpecial = false;
            break;
          }
        }
        if (isRowSpecial) {
          continue;
        }
      }

      for (let field of _baseRow) {
        let value = element[field.name];

        if (field.type == "binding" && element[field.name]) {
          let _value = null;

          if (field.lookup == "material" || field.lookup == "unit" || field.lookup == "work_category") {
            //Trường hợp này đang binding bằng code
            _value = await loadValueLookup(null, field.lookup, field.listBindingField, element[field.name]);
          } else {
            //Trường hợp này đang binding bằng id
            _value = await loadValueLookup(element[field.name], field.lookup, field.listBindingField);
          }

          if (_value && _value?.value) {
            new_field.push({
              ...field,
              value: _value.value,
            });
            if (field?.listBindingField && field.listBindingField.length) {
              field.listBindingField.map((bindingField) => {
                if (bindingField.key.includes("NguoiLienHe_")) {
                  listIgnoreField.push(bindingField.key);
                  let fieldBinding = _baseRow.find((el) => el.key == bindingField.key);
                  let listContact = JSON.parse(_value[bindingField.key] ? _value[bindingField.key] : "[]");
                  new_field.push({
                    ...fieldBinding,
                    value: _value?.options_value ? _value?.options_value.find((el) => el.isDefault)?.value : "",
                    options: _value?.options_value,
                  });
                  fieldBinding.listBindingField.map((bindingFieldContactCheck) => {
                    if (bindingFieldContactCheck.key.includes("_NguoiLienHe")) {
                      listIgnoreField.push(bindingFieldContactCheck.key);
                      let fieldBindingContact = _baseRow.find((e_l) => e_l.key == bindingFieldContactCheck.key);
                      if (listContact.length) {
                        let defaultContact = listContact.find((e_ll) => e_ll.isDefault);
                        let valueKey =
                          bindingFieldContactCheck.key == "SoDienThoai_NguoiLienHe"
                            ? defaultContact?.phone
                            : bindingFieldContactCheck.key == "Email_NguoiLienHe"
                            ? defaultContact?.email
                            : bindingFieldContactCheck.key == "ChucVu_NguoiLienHe"
                            ? defaultContact?.position
                            : "";
                        new_field.push({
                          ...fieldBindingContact,
                          value: valueKey,
                        });
                      } else {
                        new_field.push({
                          ...fieldBindingContact,
                          value: "",
                        });
                      }
                    }
                  });
                } else {
                  listIgnoreField.push(bindingField.key);
                  let fieldBinding = _baseRow.find((el) => el.key == bindingField.key);
                  new_field.push({
                    ...fieldBinding,
                    value: _value[bindingField.key],
                  });
                }
              });
            }
          } else {
            new_field.push({
              ...field,
              value: "",
            });
          }
        } else if (field.type == "time_range") {
          const timeRange = JSON.parse(field.timeRange);
          const nameValueStart = _baseRow.find((el) => el.key == timeRange.startDate)?.name;
          const nameValueEnd = _baseRow.find((el) => el.key == timeRange.endDate)?.name;
          const valueStart = element[nameValueStart] || "";
          const valueEnd = element[nameValueEnd] || "";

          const startDate = valueStart ? moment(excelDateToJSDate(valueStart), "MM/DD/YYYY") : null;
          const endDate = valueEnd ? moment(excelDateToJSDate(valueEnd), "MM/DD/YYYY") : null;

          let count = 0;
          if (startDate && endDate) {
            let currentDate = startDate.clone();

            while (currentDate.isSameOrBefore(endDate)) {
              const dayOfWeek = currentDate.day();
              if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                // 0 là Chủ nhật, 6 là Thứ 7
                count++;
              }
              currentDate.add(1, "days");
            }
          }
          new_field.push({
            ...field,
            value: count + " ngày",
          });
        } else {
          if (!listIgnoreField.includes(field.key)) {
            if (field.type == "date") {
              new_field.push({
                ...field,
                value: value ? excelDateToJSDate(value) : "",
              });
            } else {
              new_field.push({
                ...field,
                value: value || "",
              });
            }
          }
        }
      }
      newDataRow.push(new_field);
      setLineSuccess((prev) => prev + 1);
    }
    setDataRow(newDataRow);
    setCaclData(false);
    setShowModalImport(false);
  }

  const loadValueLookup = async (id, lookup, bindingField, code?: string) => {
    let response = {
      code: 0,
      result: null,
    };
    switch (lookup) {
      case "customer":
        response = await CustomerService.detail(id);
        break;
      case "reason":
        response = await ReasonListBpmService.detail(id);
        break;
      case "project_catalog":
        response = await ProjectCatalogService.detail(id);
        break;
      case "project_realty":
        response = await ProjectRealtyService.detail(id);
        break;
      case "unit":
        response = await UnitService.detail(id, code);
        break;
      case "material":
        response = await MaterialService.detail(id, code);
        break;
      case "field":
        response = await FieldListService.detail(id);
        break;
      case "business_category":
        response = await BusinessCategoryService.detail(id);
        break;
      case "supplier":
        response = await SupplierService.detail(id);
        break;
      case "investor":
        response = await InvestorService.detail(id);
        break;
      case "procurement_type":
        response = await ProcurementService.detail(id);
        break;
      case "work_category":
        response = await WorkCategoryService.detail(id, code);
        break;
      case "contact_org":
        response = await SupplierService.detailContact(id);
        break;
      default:
        break;
    }

    if (response.code === 0 && response.result) {
      const dataDetailLookup = response.result;
      let data_lookup = {
        value: dataDetailLookup?.id,
        label:
          lookup == "reason"
            ? dataDetailLookup?.reason || "No name"
            : lookup == "material"
            ? dataDetailLookup?.code + " - " + dataDetailLookup?.name || "No code"
            : lookup == "supplier"
            ? dataDetailLookup?.id + " - " + dataDetailLookup?.name || "No code"
            : lookup == "unit"
            ? dataDetailLookup?.code + " - " + dataDetailLookup?.name || "No code"
            : lookup == "work_category"
            ? dataDetailLookup?.code + " - " + dataDetailLookup?.name || "No code"
            : dataDetailLookup?.name || "No name",
        ...(bindingField?.length > 0
          ? bindingField.reduce((acc, field) => {
              acc[field.key] = dataDetailLookup[field.value] || "";
              return acc;
            }, {})
          : {}),
        options_value:
          dataDetailLookup?.contactOrg && JSON.parse(dataDetailLookup?.contactOrg)?.length
            ? JSON.parse(dataDetailLookup?.contactOrg).map((el) => {
                return {
                  value: el.id,
                  label: el.name,
                  isDefault: el.isDefault == 1 ? true : false,
                };
              })
            : [],
      };
      return data_lookup;
    }
  };
  // ---------------End Import frontend-------------------

  // ---------------Start Import Backend-------------------
  useEffect(() => {
    if (dataImport) {
      let dataImportNew = [];
      for (const key in dataImport) {
        if (dataImport.hasOwnProperty(key)) {
          dataImportNew.push({
            ...dataImport[key],
            rowKey: key,
          });
        }
      }
      const dataRowHeahder = listColumn.map((item: any) => ({
        name: item.name,
        key: item.key,
        rowKey: item.rowKey,
        type: item.type,
        placeholder: item.name,
        value: item.type === "checkbox" ? false : "",
        showNote: false,
        // noteList: [],
        options: item?.options ?? [],
        required: item?.required || false,
        // regex: item?.regex || "",
        regex: item?.regex ? item.regex : "",
        lookup: item?.lookup || "",
        readOnly: item?.readOnly == 1 ? true : false,
      }));
      const baseRowFist = listColumn.map((item: any) => ({
        name: item.name,
        key: item.key,
        rowKey: item.rowKey,
        type: item.type,
        placeholder: item.name,
        value: item.type === "checkbox" ? false : "",
        showNote: false,
        // noteList: [],
        options: item?.options ?? [],
        required: item?.required || false,
        // regex: item?.regex || "",
        regex: item?.regex ? item.regex : "",
        lookup: item?.lookup || "",
        listBindingField: item?.listBindingField || [],
        isBinding: item?.isBinding || false,
        bindingField: item?.bindingField || "",
        readOnly: item?.readOnly == 1 ? true : false,
      }));
      let list_data_new: any = dataImportNew.map((item) => {
        baseRowFist.map((field) => {
          item = {
            //Thêm các trường không có trong listColumn cũ
            ...item,
            [field.key]: field.type == "checkbox" ? (item[field.key] ? item[field.key] : false) : item[field.key] ? item[field.key] : "",
          };
        });
        return item;
      });

      if (list_data_new?.length > 0) {
        setDataRow([
          dataRowHeahder,
          ...list_data_new.map((item) => {
            return baseRowFist.map((field) => {
              return {
                ...field,
                value: field.type == "checkbox" ? (item[field.key] ? item[field.key] : false) : item[field.key] ? item[field.key] : "",
                noteList: item?.noteList && typeof item.noteList[field.key] != "undefined" ? item.noteList[field.key] : [],
                id: item?.id,
                readOnly: field?.readOnly || false,
                rowKey: item?.rowKey,
                isHaveNote: item?.listHaveNote && typeof item.listHaveNote[field.key] != "undefined" ? item.listHaveNote[field.key] : false,
              };
            });
          }),
        ]);
      }
    }
  }, [dataImport]);
  // ---------------End Import Backend-------------------

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [supplierId, setSupplierId] = useState(0);

  const handleShowDetail = (rowIndex, fieldIndex) => {
    const data = dataRow[rowIndex][fieldIndex];
    if (data?.lookup == "supplier" && data?.value) {
      setShowModalAdd(true);
      setSupplierId(parseInt(data?.value));
    }
  };

  const [showPopoverStatus, setShowPopoverStatus] = useState<boolean[]>([]);

  const refColumn = useRef();
  const refColumnContainer = useRef();

  useOnClickOutside(refColumn, () => setShowPopoverStatus(showPopoverStatus.map((item) => false)), ["index"]);

  const handleActionRow = (detailAction) => {
    let uuid = uuidv4();
    switch (detailAction.action) {
      case "insert":
        let _baseRow = baseRow.map((field) => {
          return {
            ...field,
            rowKey: uuid,
          };
        });
        if (detailAction?.rowIndex !== undefined) {
          let _dataRow = [...dataRow];
          _dataRow.splice(detailAction?.position == "top" ? detailAction.rowIndex : detailAction.rowIndex + 1, 0, _baseRow);
          setDataRow(_dataRow);
        }
        break;
      case "insertTitle":
        let titleRow = {
          rowKey: uuid,
          style: "title-" + detailAction?.stype,
          content: "",
          indexTitle: "",
          type: "title",
          isShowEdit: true,
        };
        if (detailAction?.rowIndex !== undefined) {
          let _dataRow = [...dataRow];
          _dataRow.splice(detailAction?.position == "top" ? detailAction.rowIndex : detailAction.rowIndex + 1, 0, titleRow);
          setDataRow(_dataRow);
        }
        break;
      case "delete":
        handleDeleteRow(dataRow, detailAction?.rowIndex);
        break;
    }
  };

  const [refs, setRefs] = useState([]);
  const [height, setHeight] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const [rowIndexDraging, setRowIndexDraging] = useState(0);
  const [listRef, setListRef] = useState([]);

  useEffect(() => {
    setShowPopoverStatus(dataRow.map((item) => false));
    setHeight(dataRow.map((item) => 44));
    setRefs((refs) =>
      Array(dataRow.length)
        .fill(null)
        .map((_, i) => refs[i] || React.createRef())
    );
  }, [dataRow]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (isDragging && rowIndexDraging !== null && refs[rowIndexDraging].current) {
        const newHeight = event.clientY - refs[rowIndexDraging].current.getBoundingClientRect().top;
        setHeight(height.map((item, index) => (index == rowIndexDraging ? newHeight : item)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, rowIndexDraging]);

  const handleMouseDown = (rowIndex) => {
    setIsDragging(true);
    setRowIndexDraging(rowIndex);
  };

  const [editColumn, setEditColumn] = useState([]);
  useEffect(() => {
    setEditColumn(
      listColumn.map((item) => {
        return {
          newPosition: item.position,
          isShowEdit: false,
        };
      })
    );
  }, [listColumn]);

  const handleUpdateColumn = async (fieldIndex) => {
    setEditColumn(
      editColumn.map((item, index) =>
        index == fieldIndex
          ? {
              ...item,
              isShowEdit: false,
            }
          : item
      )
    );
    let newListColumn = listColumn.map((item, index) => {
      return index == fieldIndex ? { ...item, position: editColumn[fieldIndex]?.newPosition } : item;
    });
    newListColumn.sort((a, b) => a.position - b.position);

    let dataSubmit = {
      nodeId: params?.nodeId || "Activity_0n3i8dv",
      processId: params?.processId || 380,
      fieldName: params?.fieldName || "boq",
      header: JSON.stringify(newListColumn),
    };

    // return;
    const responseHeader = await GridService.update(dataSubmit);

    if (responseHeader.code === 0) {
      setListColumn(newListColumn);
    } else {
      showToast(responseHeader.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const hanhdleDeleteColumn = async (field) => {
    if (field.type == "binding") {
      let listDeleteField = [field.key];
      if (field?.listBindingField && field.listBindingField?.length) {
        field.listBindingField.map((bindingField) => {
          let fieldBinding = listColumn.find((el) => el.key == bindingField.key);
          if (fieldBinding) {
            listDeleteField.push(bindingField.key);
            if (fieldBinding?.listBindingField && fieldBinding.listBindingField?.length) {
              fieldBinding.listBindingField.map((bindingFieldContact) => {
                let fieldBindingContact = listColumn.find((el) => el.key == bindingFieldContact.key);
                if (fieldBindingContact) {
                  listDeleteField.push(bindingFieldContact.key);
                }
              });
            }
          }
        });
      }
      for (let index = 0; index < listDeleteField.length; index++) {
        const element = listDeleteField[index];
        await onDeleteColumn({
          key: element,
          nodeId: params?.nodeId || "Activity_0n3i8dv",
          fieldName: params?.fieldName || "boq",
        });
      }
      setListColumn(listColumn.filter((item) => !listDeleteField.includes(item.key)));
    } else {
      await onDeleteColumn({
        key: field.key,
        nodeId: params?.nodeId || "Activity_0n3i8dv",
        fieldName: params?.fieldName || "boq",
      });
      setListColumn(listColumn.filter((item) => item.name !== field.name));
    }
    setLoading(false);
  };

  return (
    <div className="box__add-grid-form">
      {!success || loading ? (
        <div className="loading-grid">
          <div className="import-loading">
            <Icon name="Refresh" />
          </div>
        </div>
      ) : null}
      <div className="form-group">
        {/* <div className="label__form">
          <span className="label">{title}</span>
        </div> */}
        <div className="action-excel">
          {enableExport ? (
            <Button
              color="secondary"
              className="button--left"
              onClick={() => {
                setOnShowModalExport(true);
                handlExportData();
              }}
            >
              <Icon name="Upload" /> Xuất dữ liệu Excel
            </Button>
          ) : null}
          {enableImport ? (
            <Button
              color="secondary"
              className="button--right"
              onClick={() => {
                setShowModalImport(true);
              }}
            >
              <Icon name="DownLoadNew" /> Nhập dữ liệu Excel
            </Button>
          ) : null}
        </div>

        {dataRow.length > 0 ? (
          <div className="content__tbody--table">
            <div className="wrap-table" style={params?.fieldName == "hsmt" ? { borderRight: "none", borderBottomRightRadius: "0" } : {}}>
              {dataRow.map((row, rowIndex) => {
                if (row?.type == "title") {
                  return (
                    <div key={rowIndex} className="item__tbody-title">
                      <div
                        className={rowIndex == dataRow.length - 1 ? `index--last index--title` : `index--title`}
                        onClick={() => {
                          setShowPopoverStatus(
                            showPopoverStatus.map((item, index) => {
                              return index == rowIndex ? !item : false;
                            })
                          );
                        }}
                      >
                        <div className="index--data" style={{ cursor: "pointer" }}>
                          <div>{rowIndex}</div>
                        </div>
                      </div>
                      {showPopoverStatus[rowIndex] && enableAddRow && rowIndex != 0 ? (
                        <Popover
                          direction={"bottom"}
                          alignment={"left"}
                          isTriangle={true}
                          className="popover-note"
                          refContainer={null}
                          refPopover={refColumn}
                          forNote={true}
                        >
                          <ActionRow onShow={true} rowIndex={rowIndex} callBack={(detailAction) => handleActionRow(detailAction)}></ActionRow>
                        </Popover>
                      ) : null}

                      {row.isShowEdit ? (
                        <div key={"title-" + rowIndex} className="content-title" style={{ paddingLeft: "1rem" }}>
                          <TextArea
                            name={"title-" + rowIndex}
                            value={row.content}
                            autoFocus={true}
                            readOnly={!enableEditCell ? true : false}
                            onChange={(e) => {
                              setDataRow(
                                dataRow.map((itemRow, indexItemRow) => {
                                  if (indexItemRow == rowIndex) {
                                    return {
                                      ...itemRow,
                                      content: e.target.value,
                                    };
                                  }
                                  return itemRow;
                                })
                              );
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                // Thực hiện hành động khi nhấn Enter
                                // Đổi trạng thái isShowEdit = false
                                setDataRow(
                                  dataRow.map((itemRow, indexItemRow) => {
                                    if (indexItemRow == rowIndex) {
                                      return {
                                        ...itemRow,
                                        isShowEdit: false,
                                      };
                                    }
                                    return itemRow;
                                  })
                                );
                              }
                            }}
                            onBlur={() => {
                              setDataRow(
                                dataRow.map((itemRow, indexItemRow) => {
                                  if (indexItemRow == rowIndex) {
                                    return {
                                      ...itemRow,
                                      isShowEdit: false,
                                    };
                                  }
                                  return itemRow;
                                })
                              );
                            }}
                            placeholder={"Nhập tiêu đề " + row.style.split("-")[1]}
                          />
                        </div>
                      ) : (
                        <div
                          className={row.style + " content-title"}
                          style={
                            params?.fieldName == "hsmt"
                              ? {
                                  cursor: "pointer",
                                  whiteSpace: "normal",
                                  color: "black",
                                  borderRight: "1px solid var(--extra-color-50)",
                                  fontWeight: "bold",
                                }
                              : { cursor: "pointer", whiteSpace: "normal" }
                          }
                          onDoubleClick={() => {
                            // Đổi trạng thái isShowEdit = true
                            setDataRow(
                              dataRow.map((itemRow, indexItemRow) => {
                                if (indexItemRow == rowIndex) {
                                  return {
                                    ...itemRow,
                                    isShowEdit: true,
                                  };
                                }
                                return itemRow;
                              })
                            );
                          }}
                        >
                          <div>{row.content}</div>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={rowIndex}
                      ref={refs[rowIndex]}
                      className={rowIndex == 0 ? `item__tbody item__tbody--header` : `item__tbody item_row_${rowIndex}`}
                      style={params?.fieldName == "hsmt" ? { borderTopRightRadius: "0" } : {}}
                    >
                      <div
                        className={rowIndex == 0 ? `index index--header` : rowIndex == dataRow.length - 1 ? `index index--last` : `index`}
                        style={{ height: row?.find((item) => item?.isRegexFalse) ? "80px" : "" }}
                      >
                        {rowIndex == 0 ? (
                          <div>STT</div>
                        ) : (
                          <div className="index--data" style={{ cursor: "pointer" }}>
                            {/* {enableAddRow ? (
                            <>
                              <div className={`index--number`}>{rowIndex}</div>
                              <div className="index--trash" onClick={() => handleDeleteRow(row, rowIndex)}>
                                <Icon name="Trash" />
                              </div>
                            </>
                          ) : (
                            <div className={``}>{rowIndex}</div>
                          )} */}
                            <>
                              <div
                                className={`index--number`}
                                onClick={() => {
                                  setShowPopoverStatus(
                                    showPopoverStatus.map((item, index) => {
                                      return index == rowIndex ? !item : false;
                                    })
                                  );
                                }}
                              >
                                {rowIndex}
                              </div>
                              <div className="index--carret">
                                <div
                                  className="svg-carret"
                                  onMouseDown={() => {
                                    handleMouseDown(rowIndex);
                                  }}
                                >
                                  <Icon name="CaretDown" />
                                </div>
                              </div>
                            </>
                            {/* <div>{rowIndex}</div> */}
                          </div>
                        )}
                      </div>
                      {showPopoverStatus[rowIndex] && enableAddRow && rowIndex != 0 ? (
                        <Popover
                          direction={"bottom"}
                          alignment={"left"}
                          isTriangle={true}
                          className="popover-note"
                          refContainer={null}
                          refPopover={refColumn}
                          forNote={true}
                        >
                          <ActionRow onShow={true} rowIndex={rowIndex} callBack={(detailAction) => handleActionRow(detailAction)}></ActionRow>
                        </Popover>
                      ) : null}

                      {row.map((field, fieldIndex) => {
                        return rowIndex == 0 ? ( // Hàng đầu tiên là tiêu đề
                          <>
                            {field.key != "documentType" ? (
                              <div
                                key={fieldIndex}
                                className={`form-field form-field--header`}
                                // style={{ borderBottom: "1px solid var(--extra-color-50)" }}
                              >
                                <div className="form-field__header">
                                  {editColumn[fieldIndex]?.isShowEdit ? (
                                    <NummericInput
                                      name={"edit-position-" + fieldIndex}
                                      value={editColumn[fieldIndex]?.newPosition}
                                      autoFocus={true}
                                      onValueChange={(e) => {
                                        let newEditColumn = editColumn.map((item, index) => {
                                          return index == fieldIndex ? { ...item, newPosition: e.floatValue } : item;
                                        });
                                        setEditColumn(newEditColumn);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleUpdateColumn(fieldIndex);
                                        }
                                      }}
                                      onBlur={() => {
                                        setEditColumn(
                                          editColumn.map((item, index) =>
                                            index == fieldIndex
                                              ? {
                                                  ...item,
                                                  isShowEdit: false,
                                                }
                                              : item
                                          )
                                        );
                                      }}
                                      placeholder={`Nhập thứ tự hiển thị`}
                                    />
                                  ) : (
                                    <>
                                      {field?.placeholder?.length > 45 ? `${field?.placeholder.substring(0, 45)}...` : field?.placeholder}
                                      {field?.required && <span style={{ color: "red", marginLeft: "5px", fontSize: "18px" }}>*</span>}
                                      <div
                                        title={"Sửa vị trí cột"}
                                        className={"edit-column"}
                                        onClick={() => {
                                          setEditColumn(
                                            editColumn.map((item, index) =>
                                              index == fieldIndex
                                                ? {
                                                    ...item,
                                                    isShowEdit: true,
                                                  }
                                                : item
                                            )
                                          );
                                          // setShowModalAddColumn(true);
                                          // setDataColumnEdit({
                                          //   ...listColumn.find((item) => item.name === field.name),
                                          //   options: JSON.stringify(listColumn.find((item) => item.name === field.name)?.options),
                                          // });
                                        }}
                                      >
                                        Thứ tự hiển thị: {listColumn[fieldIndex]?.position || 0}
                                      </div>
                                      {enableAddColumns ? (
                                        <div
                                          title={"Xoá cột"}
                                          className={"delete-column"}
                                          onClick={() => {
                                            setIsChangeColumns(true);
                                            setLoading(true);
                                            hanhdleDeleteColumn(field);
                                          }}
                                        >
                                          <Icon name="Trash" />
                                        </div>
                                      ) : null}
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <>
                            {field.key != "documentType" ? (
                              <div
                                key={fieldIndex}
                                className={rowIndex == dataRow.length - 1 ? `form-field form-field--last` : `form-field`}
                                style={{ height: row?.find((item) => item?.isRegexFalse) ? "80px" : "" }}
                              >
                                {enableAddCmtCell ? (
                                  <div
                                    title={field?.isHaveNote ? "Xem ghi chú" : "Thêm ghi chú"}
                                    className={field?.isHaveNote ? "note" : "add-note"}
                                    onClick={() => {
                                      handShowModalNote(field, rowIndex, fieldIndex);
                                      setRowKeyComment(field.rowKey);
                                      setColumnKeyComment(field.key);
                                    }}
                                  >
                                    {!field.noteList?.length ? <Icon name="Pencil" /> : null}
                                  </div>
                                ) : null}
                                {field.type === "text" ? (
                                  <TextArea
                                    name={field.name}
                                    row={1}
                                    value={field.value}
                                    readOnly={!enableEditCell ? true : field.readOnly}
                                    // disabled={field.readOnly}
                                    onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "input")}
                                    placeholder={`Nhập ${field?.placeholder}`}
                                    error={field?.isRegexFalse}
                                    message={field.name + " không hợp lệ"}
                                    height={height[rowIndex] + "px"}
                                  />
                                ) : field.type === "number" ? (
                                  <NummericInput
                                    name={field.name}
                                    value={field.value}
                                    disabled={!enableEditCell ? true : field.readOnly}
                                    thousandSeparator={true}
                                    onValueChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "number")}
                                    placeholder={`Nhập ${field?.placeholder}`}
                                    isDecimalScale={false}
                                  />
                                ) : field.type === "checkbox" ? (
                                  <>
                                    {fieldName == "hsmt" && field.key == "HoSoMoiThau" && field?.rowSpecialKey == "hstc" ? (
                                      <Checkbox checked={false} disabled={!enableEditCell ? true : field.readOnly} onChange={() => {}} />
                                    ) : (
                                      <Checkbox
                                        checked={field.value}
                                        disabled={!enableEditCell ? true : field.readOnly}
                                        onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "checkbox")}
                                      />
                                    )}
                                  </>
                                ) : field.type === "date" ? (
                                  <DatePickerCustom
                                    name={field.name}
                                    fill={false}
                                    // value={field.value}
                                    value={field.value ? moment(field.value).format("DD/MM/YYYY") : ""}
                                    iconPosition="left"
                                    disabled={!enableEditCell ? true : field.readOnly}
                                    // icon={<Icon name="Calendar" />}
                                    onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, field.type)}
                                    placeholder={`Chọn ${field?.placeholder}`}
                                  />
                                ) : field.type === "formula" ? (
                                  <NummericInput
                                    name={field.name}
                                    value={field.value}
                                    disabled={true}
                                    thousandSeparator={true}
                                    placeholder={`Nhập ${field?.placeholder}`}
                                    isDecimalScale={false}
                                  />
                                ) : field.type === "time_range" ? (
                                  <Input
                                    name={field.name}
                                    value={field.value}
                                    readOnly={!enableEditCell ? true : field.isBinding}
                                    disabled={true}
                                    // onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "input")}
                                    placeholder={`${field?.placeholder}`}
                                    error={field?.isRegexFalse}
                                    message={field.name + " không hợp lệ"}
                                  />
                                ) : field.type === "lookup" || field.type === "binding" ? (
                                  <div
                                    onDoubleClick={() => {
                                      handleShowDetail(rowIndex, fieldIndex);
                                    }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <SelectLookup
                                      name={field.name}
                                      lookup={field.lookup}
                                      bindingField={field.listBindingField}
                                      bindingKey={field.key}
                                      dataRow={dataRow}
                                      listColumn={listColumn}
                                      disabled={!enableEditCell ? true : field.readOnly}
                                      setListColumn={setListColumn}
                                      setListLoadBindingField={setListLoadBindingField}
                                      listLoadBindingField={listLoadBindingField}
                                      columnIndex={fieldIndex}
                                      rowIndex={rowIndex}
                                      value={field.value}
                                      onChange={(e) => {
                                        handChangeValueItem(rowIndex, fieldIndex, e, field.type);
                                      }}
                                      placeholder={`Chọn ${field?.placeholder}`}
                                    />
                                  </div>
                                ) : (
                                  <SelectCustom
                                    name={field.name}
                                    disabled={!enableEditCell ? true : field.readOnly}
                                    options={field.options || []}
                                    value={field.value}
                                    onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "select")}
                                    placeholder={`Chọn ${field?.placeholder}`}
                                  />
                                )}
                              </div>
                            ) : null}
                          </>
                        );
                      })}
                      {enableAddCmtCol && params.fieldName != "hsmt" ? (
                        <>
                          {rowIndex == 0 ? (
                            <div
                              className="comment-column--fist"
                              style={{
                                height: row?.find((item) => item?.isRegexFalse) ? "80px" : "",
                                // borderBottom: "1px solid var(--extra-color-50)",
                              }}
                            >
                              <div className="index--fist">Làm rõ</div>
                            </div>
                          ) : (
                            <div
                              className={`${rowIndex == dataRow.length - 1 ? "comment-column--last" : "comment-column"}`}
                              style={{ height: row?.find((item) => item?.isRegexFalse) ? "80px" : "" }}
                            >
                              <div
                                className="index--comment"
                                onClick={() => {
                                  if (row[0]?.rowKey) {
                                    setShowModalNote(true);
                                    setRowKeyComment(row[0]?.rowKey);
                                    setColumnKeyComment("cot-lam-ro");
                                  } else {
                                    showToast("Hãy thêm cột dữ liệu đầu tiên", "error");
                                  }
                                }}
                              >
                                <div className="icon-comment">
                                  {row.length && dataCommentLast && dataCommentLast[row[0]?.rowKey] ? <div className="red-dot"></div> : null}
                                  <Icon name="Comment" />
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ) : null}
        <div className="action-field-add">
          {enableAddRow ? (
            <Button
              color="secondary"
              onClick={() => {
                let uuid = uuidv4();
                let _baseRow = baseRow.map((field) => {
                  return {
                    ...field,
                    rowKey: uuid,
                  };
                });
                setDataRow([...dataRow, _baseRow]);
              }}
            >
              <Icon name="PlusCircle" /> Thêm dòng
            </Button>
          ) : null}
          {enableAddColumns ? (
            <Button
              color="secondary"
              onClick={() => {
                setShowModalAddColumn(true);
              }}
            >
              <Icon name="PlusCircle" /> Thêm cột
            </Button>
          ) : null}

          {enableSave ? (
            <Button
              color="secondary"
              onClick={() => {
                // setShowModalAddColumn(true);
                setLoading(true);
                saveDataRow(dataRow);
              }}
            >
              <Icon name="CheckedCircle" /> Lưu
            </Button>
          ) : null}
        </div>
      </div>
      <ModalExport
        name={title}
        listColumn={listColumn}
        listData={listDataExport}
        onShow={onShowModalExport}
        onHide={() => setOnShowModalExport(false)}
        options={optionsExport}
        callback={(type, extension) => {
          // exportCallback(type, extension)
        }}
      />
      <ModalImport
        name={"Dữ liệu mẫu"}
        listColumn={listColumn}
        onShow={showModalImport}
        caclData={caclData}
        lineSuccess={lineSuccess}
        setDataImport={setDataImport}
        setDataImportHeader={setDataImportHeader}
        setDataExcel={setDataExcel}
        onHide={(reload) => {
          if (reload) {
            // getListCustomer(params, activeTitleHeader);
          }
          setShowModalImport(false);
        }}
        type="grid"
      />
      <ModalAddColumn
        onShow={showModalAddColumn}
        data={dataColumnEdit}
        listColumn={listColumn}
        setListColumn={setListColumn}
        setIsChangeColumns={setIsChangeColumns}
        onHide={(reload) => {
          if (reload) {
          }
          setShowModalAddColumn(false);
          // setDataCustomerAttribute(null);
        }}
      />
      <ModalComment
        onShow={showModalNote}
        nodeId={params?.nodeId || "Activity_0n3i8dv"}
        potId={params?.potId || 496}
        fieldName={params?.fieldName || "boq"}
        workId={params?.workId || 1813}
        rowKey={rowKeyComment}
        columnKey={columnKeyComment}
        onHide={(reload) => {
          setShowModalNote(false);
          setRowKeyComment(null);
          setColumnKeyComment(null);
          if (reload) {
            getListComment();
          }
        }}
      ></ModalComment>
      {/* <ModalAddSupplier
        onShow={showModalAdd}
        data={null}
        isView={true}
        showFromGrid={true}
        supplierId={supplierId}
        onHide={(reload) => {
          if (reload) {
            // getListInvestor(params);
          }
          setShowModalAdd(false);
        }}
      /> */}
    </div>
  );
}

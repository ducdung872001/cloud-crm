import React, { useEffect, useMemo, useRef, useState } from "react";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import Icon from "components/icon";
import { IOption } from "model/OtherModel";
import { v4 as uuidv4 } from "uuid";

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
import { set } from "lodash";
import ModalAddColumn from "./partials/ModalAddColumn/ModalAddColumn";
import SelectLookup from "./partials/SelectLookup/SelectLookup";
import GridService from "services/GridService";
import { getSearchParameters } from "reborn-util";
import { showToast } from "utils/common";
import { setTime } from "react-datepicker/dist/date_utils";
import ModalComment from "./partials/ModalComment";

// interface IDataField {
//   id?: number;
//   key: string;
//   value: string | number | boolean;
//   noteList?: INoteData[];
// }
interface IGridFormProps {
  title?: string;
  columns: IColumnGrid[];
  data?: any[];
}
export interface IColumnGrid {
  name: string;
  key?: string;
  type: "text" | "number" | "checkbox" | "select" | "lookup" | "binding";
  options?: IOption[];
  required?: boolean;
  regex?: RegExp;
  position?: number;
  lookup?: string;
}

export default function GridForm(props: any) {
  const params: any = getSearchParameters();
  const columns = props.columns || [];
  const title = props?.title || "Danh mục";
  const data = props?.data || [];

  const enableAddRow = params?.enableAddRow == "false" ? false : true;
  const enableAddColumns = params?.enableAddColumns == "false" ? false : true;
  const enableExport = params?.enableExport == "false" ? false : true;
  const enableImport = params?.enableImport == "false" ? false : true;
  const enableAddCmtCell = params?.enableAddCmtCell == "false" ? false : true;
  const enableAddCmtCol = params?.enableAddCmtCol == "false" ? false : true;

  const optionRegex = {
    phoneRegex: PHONE_REGEX_NEW,
    emailRegex: EMAIL_REGEX,
  };

  //Biến này dùng để kiểm tra xem các trường bắt buộc đã được điền đầy đủ chưa
  const [checkRequired, setCheckRequired] = useState<boolean>(false);
  const [checkRegex, setCheckRegex] = useState<boolean>(false);

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
      getDetailRow(nodeId, fieldName, potId, workId, header);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailRow = async (nodeId, fieldName, potId, workId, header) => {
    const params = {
      nodeId: nodeId,
      fieldName: fieldName,
      potId: potId,
      workId: workId,
    };
    const dataComment = await getListComment();
    const response = await GridService.detailRow(params);

    if (response.code == 0) {
      const result = response.result;
      const data = (result?.data && JSON.parse(result.data)) || [];

      if (data && data.length > 0) {
        if (dataComment) {
          setDataRow(
            data.map((item) => {
              return item.map((field) => {
                return {
                  ...field,
                  isHaveNote: dataComment[field.rowKey + "-" + field.key] ? true : false,
                };
              });
            })
          );
        } else {
          setDataRow(data);
        }

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
              regex: item.regex,
              readOnly: item?.readOnly,
            };
          });
          addColumn(newDataHeader);
        }
      }
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (params?.nodeId && params?.fieldName && params?.potId && params?.workId) {
      getDetailArtifact(params?.nodeId, params?.fieldName, params?.potId, params?.workId);
    } else {
      getDetailArtifact("Activity_0n3i8dv", "boq", 496, 1813); // Khi push thì tắt đi
    }
  }, []);

  const [listColumn, setListColumn] = useState<IColumnGrid[]>([
    // {
    //   name: "Khách nội bộ",
    //   key: "internalCustomer",
    //   type: "checkbox",
    // },
    // {
    //   name: "Họ và tên",
    //   key: "name",
    //   type: "text",
    // },
    // {
    //   name: "Số điện thoại",
    //   key: "phone",
    //   type: "text",
    //   required: true,
    //   regex: new RegExp(PHONE_REGEX_NEW),
    // },
    // {
    //   name: "Email",
    //   key: "email",
    //   type: "text",
    //   required: true,
    //   regex: new RegExp(EMAIL_REGEX),
    // },
    // {
    //   name: "Tỉnh/Thành phố",
    //   key: "city",
    //   type: "select",
    //   options: [
    //     {
    //       label: "Hà Nội",
    //       value: "hn",
    //     },
    //     {
    //       label: "Hồ Chí Minh",
    //       value: "hcm",
    //     },
    //     {
    //       label: "Đà Nẵng",
    //       value: "dn",
    //     },
    //   ],
    // },
    // {
    //   name: "Nợ cũ",
    //   key: "oldDebt",
    //   type: "number",
    // },
    // {
    //   name: "Nợ mới",
    //   key: "newDebt",
    //   type: "number",
    // },
  ]);

  // const [listData, setListData] = useState<any[]>([
  //   // {
  //   //   id: 1,
  //   //   internalCustomer: false,
  //   //   name: "Nguyễn Văn A",
  //   //   phone: "0123456789",
  //   //   email: "viploivp@gmail.com",
  //   //   city: "hn",
  //   //   oldDebt: 1000000,
  //   //   noteList: {
  //   //     internalCustomer: [],
  //   //     name: [
  //   //       {
  //   //         id: 1,
  //   //         avatar: ImageThirdGender,
  //   //         name: "Hoàng Văn Lợi",
  //   //         time: "21:01 Hôm qua",
  //   //         content: "Comment đầu",
  //   //         isEdit: false,
  //   //       },
  //   //       {
  //   //         id: 2,
  //   //         avatar: ImageThirdGender,
  //   //         name: "Hoàng Văn Lợi",
  //   //         time: "21:01 Hôm qua",
  //   //         content: "Comment thứ 2",
  //   //         isEdit: false,
  //   //       },
  //   //     ],
  //   //     phone: [],
  //   //     email: [],
  //   //     city: [],
  //   //     oldDebt: [],
  //   //   },
  //   // },
  //   // {
  //   //   id: 2,
  //   //   internalCustomer: false,
  //   //   name: "Nguyễn Văn B",
  //   //   phone: "0862999272",
  //   //   email: "hvlepu@gmail.com",
  //   //   city: "dn",
  //   //   oldDebt: 2000000,
  //   //   noteList: {
  //   //     internalCustomer: [],
  //   //     name: [],
  //   //     phone: [],
  //   //     email: [],
  //   //     city: [],
  //   //     oldDebt: [],
  //   //   },
  //   // },
  // ]);

  const [listDataNew, setListDataNew] = useState<any[]>([]);

  // useEffect(() => {
  //   if (columns?.length) {
  //     setListColumn(columns);
  //   }
  // }, [columns]);

  // useEffect(() => {
  //   if (data?.length) {
  //     setListData(data);
  //   }
  // }, [data]);

  // useEffect(() => {
  //   if (listColumn.length) {
  //     const dataRowHeahder = listColumn.map((item: any) => ({
  //       name: item.name,
  //       type: "text",
  //       placeholder: item.name,
  //       required: item?.required || false,
  //       regex: item?.regex ? optionRegex[item.regex] : "",
  //     }));
  //     const baseRowFist = listColumn.map((item: any) => ({
  //       name: item.name,
  //       key: item.key,
  //       type: item.type,
  //       placeholder: item.name,
  //       value: item.type === "checkbox" ? false : "",
  //       showNote: false,
  //       noteList: [],
  //       options: item?.options ?? [],
  //       required: item?.required || false,
  //       regex: item?.regex ? optionRegex[item.regex] : "",
  //       lookup: item?.lookup || "",
  //     }));
  //     setBaseRow(baseRowFist);
  //     if (listData?.length) {
  //       setDataRow([
  //         dataRowHeahder,
  //         ...listData.map((item) => {
  //           return baseRowFist.map((field) => {
  //             return {
  //               ...field,
  //               value: field.type == "checkbox" ? (item[field.key] ? item[field.key] : false) : item[field.key] ? item[field.key] : "",
  //               noteList: item.noteList[field.key] || [],
  //               id: item.id,
  //             };
  //           });
  //         }),
  //       ]);
  //     } else {
  //       setDataRow([dataRowHeahder, baseRowFist]);
  //     }
  //   }
  // }, [listData]);

  useEffect(() => {
    const dataRowHeahder = listColumn.map((item: any) => ({
      // key: item.key,
      // name: item.name,
      // type: "text",
      // placeholder: item.name,
      // required: item?.required || false,
      // regex: item?.regex ? optionRegex[item.regex] : "",

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
      regex: item?.regex ? optionRegex[item.regex] : "",
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
      regex: item?.regex ? optionRegex[item.regex] : "",
      lookup: item?.lookup || "",
      listBindingField: item?.listBindingField || [],
      isBinding: item?.isBinding || false,
      bindingField: item?.bindingField || "",
      readOnly: item?.readOnly == 1 ? true : false,
    }));
    setBaseRow(baseRowFist);
    let list_data_new: any = listDataNew.map((item) => {
      baseRowFist.map((field) => {
        item = {
          //Thêm các trường không có trong listColumn cũ
          ...item,
          [field.key]: field.type == "checkbox" ? (item[field.key] ? item[field.key] : false) : item[field.key] ? item[field.key] : "",
        };
      });
      return item;
    });

    setListDataNew(list_data_new);
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
              options: item?.options ? item?.options : [],
            };
          });
        }),
      ]);
    } else {
      setDataRow([dataRowHeahder]);
    }
  }, [listColumn]);

  console.log("listColumn>>>", listColumn);

  const [baseRow, setBaseRow] = useState([]);

  const [dataRow, setDataRow] = useState([]);
  console.log("dataRow>>>", dataRow);

  useEffect(() => {
    window.parent.postMessage({ 
      type: "DATA_ROW", 
      data: dataRow,
    }, "*");
  }, [dataRow])

  useEffect(() => {
    if (listColumn.length) {
      const list_data_new = [];
      let check_required = false;
      let check_regex = false;
      for (let i = 0; i < dataRow.length; i++) {
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
          listColumn.map((field) => {
            if (field.key == dataRow[i][j].key && field.required && !dataRow[i][j].value && i != 0) {
              check_required = true;
            }
            if (field.key == dataRow[i][j].key && field.regex && dataRow[i][j].value && !dataRow[i][j].value.match(field.regex)) {
              check_regex = true;
            }
          });
        }
        if (i != 0) {
          list_data_new.push(data_row_note);
        }
      }
      setCheckRegex(check_regex);
      setCheckRequired(check_required);
      setListDataNew(list_data_new);
    }
  }, [dataRow, listColumn]);

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
              return field;
            }
          });
          return new_field;
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
          : value.target.value;
      let check_required = false;
      const updatedData = dataRow.map((row, rIdx) => {
        if (rIdx === rowIndex) {
          return row.map((field, fIdx) => {
            if (field.required && !valueData) {
              check_required = true;
            }
            if (fIdx === fieldIndex) {
              return {
                ...field,
                value: valueData,
                isRegexFalse: valueData && field?.regex && !valueData.match(field.regex) ? true : false,
              };
            } else {
              if (field.required && !field.value) {
                check_required = true;
              }
              if (field.regex) {
                return {
                  ...field,
                  isRegexFalse: field.value && field?.regex && !field.value.match(field.regex) ? true : false,
                };
              }
            }
            return field;
          });
        }
        return row.map((field) => ({ ...field }));
      });
      setCheckRequired(check_required);
      setDataRow(updatedData);
    }
  };
  const handleDeleteRow = async (data, idx) => {
    setDataRow(dataRow.filter((item, index) => index !== idx));
  };

  const [showModalNote, setShowModalNote] = useState(false);
  const [dataNoteField, setDataNoteField] = useState([]);

  const refColumn = useRef();
  const refColumnContainer = useRef();

  useOnClickOutside(refColumn, () => setShowModalNote(false), ["add-note"]);

  const handShowModalNote = (field, rowIndex, fieldIndex) => {
    setShowModalNote(true);
    setDataRow(
      dataRow.map((item, index) =>
        index == rowIndex
          ? item.map((el, indexEl) => (indexEl == fieldIndex ? { ...el, showNote: true } : { ...el, showNote: false }))
          : item.map((el, indexEl) => ({ ...el, showNote: false }))
      )
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

  const addRow = async (data) => {
    const param = {
      nodeId: params?.nodeId || "Activity_0n3i8dv",
      processId: params?.processId || 380,
      potId: params?.potId || 496,
      fieldName: params?.fieldName || "boq",
      workId: params?.workId || 1813,
      data: JSON.stringify(data),
    };
    const response = await GridService.updateRow(param);
    if (response.code === 0) {
      showToast("Lưu thành công", "success");
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
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
          if (item.columnKey == "cot-lam-ro") {
            listDataLast = {
              ...listDataLast,
              [item.rowKey]: true,
            };
          }
        });
        setDataCommentLast(listDataLast);
        return listData;
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      return null;
    }
  };

  const [dataImport, setDataImport] = useState<any>(null);
  const [dataImportHeader, setDataImportHeader] = useState<any>(null);

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
        regex: item?.regex ? optionRegex[item.regex] : "",
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
        regex: item?.regex ? optionRegex[item.regex] : "",
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

  return (
    <div className="box__add-grid-form">
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
              <Icon name="DownLoadNew" /> Gán dữ liệu Excel
            </Button>
          ) : null}
        </div>

        {dataRow.length > 0 ? (
          <div className="content__tbody--table">
            {dataRow.map((row, rowIndex) => {
              return (
                <div key={rowIndex} className="item__tbody">
                  <div
                    className={rowIndex == dataRow.length - 1 ? `index index--last` : `index`}
                    style={{ height: row?.find((item) => item.isRegexFalse) ? "80px" : "" }}
                  >
                    {rowIndex == 0 ? (
                      <div
                      // style={{ color: rowIndex == 0 ? "#8F97A3" : "" }}
                      >
                        STT
                      </div>
                    ) : (
                      <>
                        {enableAddRow ? (
                          <>
                            <div className={`index--number`}>{rowIndex}</div>
                            <div className="index--trash" onClick={() => handleDeleteRow(row, rowIndex)}>
                              <Icon name="Trash" />
                            </div>
                          </>
                        ) : (
                          <div className={``}>{rowIndex}</div>
                        )}
                      </>
                    )}
                  </div>

                  {row.map((field, fieldIndex) => {
                    return rowIndex == 0 ? ( // Hàng đầu tiên là tiêu đề
                      <div
                        key={fieldIndex}
                        className={`form-field`}
                        // style={{ borderBottom: "1px solid var(--extra-color-50)" }}
                      >
                        <div className="form-field__header">
                          {field.placeholder?.length > 45 ? `${field.placeholder.substring(0, 45)}...` : field.placeholder}
                          {field.required && <span style={{ color: "red", marginLeft: "5px", fontSize: "18px" }}>*</span>}
                          {/* <div
                                title={"Sửa cột"}
                                className={"edit-column"}
                                onClick={() => {
                                  setShowModalAddColumn(true);
                                  setDataColumnEdit({
                                    ...listColumn.find((item) => item.name === field.name),
                                    options: JSON.stringify(listColumn.find((item) => item.name === field.name)?.options),
                                  });
                                }}
                              >
                                <Icon name="Pencil" />
                              </div> */}
                          {enableAddColumns ? (
                            <div
                              title={"Xoá cột"}
                              className={"delete-column"}
                              onClick={() => {
                                onDeleteColumn({
                                  key: field.key,
                                  nodeId: params?.fieldName || "Activity_0n3i8dv",
                                  fieldName: params?.fieldName || "boq",
                                });
                                setListColumn(listColumn.filter((item) => item.name !== field.name));
                              }}
                            >
                              <Icon name="Trash" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={fieldIndex}
                        className={rowIndex == dataRow.length - 1 ? `form-field form-field--last` : `form-field`}
                        style={{ height: row?.find((item) => item.isRegexFalse) ? "80px" : "" }}
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
                            {/* {field.showNote && showModalNote ? (
                            <Popover
                              direction={dataRow.length > 3 && rowIndex > dataRow.length / 2 ? "top" : "bottom"}
                              alignment={fieldIndex < 2 ? "left" : fieldIndex < row.length - 2 ? "center" : "right"}
                              isTriangle={true}
                              className="popover-note"
                              refContainer={null}
                              refPopover={refColumn}
                              forNote={true}
                            >
                              <NoteField onShow={true} data={field.noteList}></NoteField>
                            </Popover>
                          ) : null} */}
                          </div>
                        ) : null}
                        {field.type === "text" ? (
                          <Input
                            name={field.name}
                            value={field.value}
                            readOnly={field.isBinding}
                            disabled={field.readOnly}
                            onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "input")}
                            placeholder={`Nhập ${field.placeholder}`}
                            error={field?.isRegexFalse}
                            message={field.name + " không hợp lệ"}
                          />
                        ) : field.type === "number" ? (
                          <NummericInput
                            name={field.name}
                            value={field.value}
                            disabled={field.readOnly}
                            thousandSeparator={true}
                            onValueChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "number")}
                            placeholder={`Nhập ${field.placeholder}`}
                          />
                        ) : field.type === "checkbox" ? (
                          <Checkbox
                            checked={field.value}
                            disabled={field.readOnly}
                            onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "checkbox")}
                          />
                        ) : field.type === "lookup" || field.type === "binding" ? (
                          <SelectLookup
                            name={field.name}
                            lookup={field.lookup}
                            bindingField={field.listBindingField}
                            bindingKey={field.key}
                            listColumn={listColumn}
                            disabled={field.readOnly}
                            setListColumn={setListColumn}
                            columnIndex={fieldIndex}
                            value={field.value}
                            onChange={(e) => {
                              handChangeValueItem(rowIndex, fieldIndex, e, field.type);
                            }}
                            placeholder={`Chọn ${field.placeholder}`}
                          />
                        ) : (
                          <SelectCustom
                            name={field.name}
                            disabled={field.readOnly}
                            options={field.options || []}
                            value={field.value}
                            onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "select")}
                            placeholder={`Chọn ${field.placeholder}`}
                          />
                        )}
                      </div>
                    );
                  })}
                  {enableAddCmtCol ? (
                    <>
                      {rowIndex == 0 ? (
                        <div
                          className="comment-column--fist"
                          style={{
                            height: row?.find((item) => item.isRegexFalse) ? "80px" : "",
                            // borderBottom: "1px solid var(--extra-color-50)",
                          }}
                        >
                          <div className="index--fist">Làm rõ</div>
                        </div>
                      ) : (
                        <div
                          className={`${rowIndex == dataRow.length - 1 ? "comment-column--last" : "comment-column"}`}
                          style={{ height: row?.find((item) => item.isRegexFalse) ? "80px" : "" }}
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
                              {dataCommentLast && dataCommentLast[row[rowIndex]?.rowKey] ? <div className="red-dot"></div> : null}
                              <Icon name="Comment" />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              );
            })}
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

                // let data_row_note = { id: baseRow[0]?.id ? baseRow[0]?.id : null };
                // for (let j = 0; j < baseRow.length; j++) {
                //   data_row_note = {
                //     ...data_row_note,
                //     [baseRow[j].key]: baseRow[j].value,
                //   };
                // }
                // addRow(data_row_note);
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
          <Button
            color="secondary"
            onClick={() => {
              // setShowModalAddColumn(true);
              addRow(dataRow);
            }}
          >
            <Icon name="CheckedCircle" /> Lưu
          </Button>
        </div>
      </div>
      <ModalExport
        name={title}
        listColumn={listColumn}
        listData={listDataNew}
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
        setDataImport={setDataImport}
        setDataImportHeader={setDataImportHeader}
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
        onHide={(reload) => {
          if (reload) {
            // getDetailRow(params?.nodeId || "Activity_0n3i8dv", params?.fieldName || "boq", params?.potId || 496, params?.workId || 1813, listColumn);
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
            getDetailRow(params?.nodeId || "Activity_0n3i8dv", params?.fieldName || "boq", params?.potId || 496, params?.workId || 1813, listColumn);
          }
        }}
      ></ModalComment>
    </div>
  );
}

import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import { IAutoProcessModalProps } from "model/customer/CustomerRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import RadioList from "components/radio/radioList";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import AddFile from "./partials/AddFile";
import { useOnClickOutside } from "utils/hookCustom";
import * as XLSX from "xlsx";
import "./index.scss";
import GridService from "services/GridService";
import { exportCustomExcel } from "./partials/exportExcel";
import { v4 as uuidv4 } from "uuid";
import { fetchDataLookup } from "../../Lookup";
import moment from "moment";
import { makeValidateField } from "./partials/makeValidateField";
import Button from "components/button/button";
import { exportOlaExcel } from "../../exportOla";
import { convertToDataRow } from "../../convertToDataRow";

export default function ModalImport(props: any) {
  const { onShow, onHide, name, code, listColumn, caclData, lineSuccess, baseRow, setDataRow, setLookupValues, setLookupError, setLookupLoading } =
    props;

  const [addFile, setAddFile] = useState<string>("");
  const [prevAddFile, setPrevAddFile] = useState<string>("");
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [infoFile, setInfoFile] = useState(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [step, setStep] = useState(1);
  const [lstData, setLstData] = useState([]);
  const [idData, setIdData] = useState<number>(null);
  const [dataDuplicate, setDataDuplicate] = useState(null);

  const [dataRowNew, setDataRowNew] = useState([]);
  const [lstIndexErros, setLstIndexErros] = useState([]);
  const [isReadingFile, setisReadingFile] = useState<boolean>(true);

  useEffect(() => {
    if (addFile !== prevAddFile) {
      setPrevAddFile(addFile);
    }
  }, [addFile, prevAddFile]);

  const lstOptionMechanismBug = [
    {
      value: "ignore",
      label: "Bỏ qua lỗi và tiếp tục",
    },
    {
      value: "stop",
      label: "Gặp lỗi dừng chương trình",
    },
  ];

  const lstOptionMechanismDuplicate = [
    {
      value: "override",
      label: "Ghi đè dữ liệu cũ",
    },
    {
      value: "ignore",
      label: "Bỏ qua dữ liệu trùng lặp",
    },
    {
      value: "merge",
      label: "Trộn hai kết quả",
    },
    {
      value: "manual",
      label: "Xử lý thủ công",
    },
  ];

  const defaultFormData = {
    uploadId: null,
    fileName: "",
    processErrorCode: "ignore",
    processDuplicateCode: "override",
  };

  const [formData, setFormData] = useState<IAutoProcessModalProps>(defaultFormData);

  useEffect(() => {
    if (infoFile) {
      setFormData({ ...formData, uploadId: infoFile.uploadId });
    } else {
      setFormData({ ...formData, uploadId: null });
    }
  }, [infoFile]);

  useEffect(() => {
    if (infoFile?.data) {
      setLstData(infoFile.data);
    } else {
      setLstData([]);
    }
  }, [infoFile]);

  // Hàm đọc file Excel
  const [numberLine, setNumberLine] = useState<number>(0);
  function excelDateToJSDate(serial) {
    // Excel date serial (start from 1/1/1900)
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
  }

  function parseDateValue(value: any): Date | null {
    // Kiểm tra nếu giá trị đã là đối tượng Date
    if (value instanceof Date) {
      return value; // Giữ nguyên nếu đã là đối tượng Date
    }

    // Kiểm tra nếu giá trị là số (Excel serial)
    if (typeof value === "number") {
      return excelDateToJSDate(value); // Chuyển đổi từ số serial
    }

    // Kiểm tra nếu giá trị là chuỗi ngày hợp lệ
    const dateValue = moment(value, "DD/MM/YYYY", true);
    return dateValue.isValid() ? dateValue.toDate() : null; // Trả về ngày hoặc null nếu không hợp lệ
  }

  const listEqual = ["equal", ">=", "<=", ">", "<", "!="];
  const readExcelFile = (file: Blob) => {
    if (!(file instanceof Blob)) {
      console.error("The provided file is not a Blob.");
      return;
    }
    const reader = new FileReader();

    reader.onload = (evt) => {
      const binaryStr = evt.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // setData(jsonData);
      //Đọc dòng đầu trong file Excel để lấy danh sách cột, nếu số lượng và tên cột không khớp với danh sách cột listColumn đã định nghĩa thì sẽ thông báo lỗi
      const headerRow = jsonData[0].filter((item) => item !== null && item !== undefined); // Lọc các giá trị null, undefined và rỗng
      const headerNames = headerRow.map((item) => item.toString().trim());
      const listColumnNames = listColumn.map((col) => col.name.trim());
      const isValidHeader = JSON.stringify(headerNames) === JSON.stringify(listColumnNames);
      if (!isValidHeader) {
        showToast("File Excel không hợp lệ. Vui lòng kiểm tra lại tên và thứ tự cột.", "error");
        return;
      }

      let listBaseColumn = [];
      for (let index = 0; index < listColumn.length; index++) {
        const column = listColumn[index];
        if (column.children && column.children.length > 0) {
          column.children.map((child) => {
            listBaseColumn.push(column.name + "." + child.name);
          });
        } else {
          if (column.type === "checkbox" || column.key === "stt") {
            listBaseColumn.push(column.name);
          } else {
            listBaseColumn = [...listBaseColumn, ...[column.name + "." + "condition", column.name + "." + "value"]];
          }
        }
      }

      let baseData: any = [];
      for (let index = 0; index < jsonData.length; index++) {
        const row = jsonData[index];
        if (index > 2) {
          const rowData = {};
          listBaseColumn.forEach((columnName, cellIndex) => {
            if (columnName) {
              const cell = row[cellIndex];
              rowData[columnName] = cell || "";
            }
          });
          baseData.push(rowData);
        }
      }

      const validateField = makeValidateField(listColumn);

      console.log("readExcelFile>>>:baseData>", baseData);

      if (baseData.length) {
        let newDataRow = [];
        for (let index = 0; index < baseData.length; index++) {
          let row = baseData[index];
          for (const rule of validateField) {
            let hasError = false; // Biến cờ để kiểm tra lỗi
            const value = row[rule.name];
            const listKey = Object.keys(row);
            if (value == "OTHERWISE") {
              continue;
            }
            const errMsg = rule.validateValue(value, row);
            if (errMsg) {
              // Báo lỗi cho rule.name
              console.log("readExcelFile>>>:value>", "Dòng:", index + 1, ":>>", value);
              console.log("readExcelFile>>>:ERROR>", "Dòng:", index + 1, ":>>", rule.name, errMsg);
              hasError = true; // Đánh dấu có lỗi
              setLstIndexErros((prev) => {
                const newPrev = prev;
                newPrev.push({
                  rowIndex: index + 1, // Dòng bắt đầu từ 1
                  colIndex: listKey.findIndex((key) => key === rule.name), // Chỉ số cột
                  fieldName: rule.name,
                  errorMessage: errMsg,
                });
                return newPrev;
              });
              continue; // Thoát khỏi vòng lặp validateField
            }
            if (hasError) {
              continue; // Bỏ qua trường hiện tại (trường lỗi) và tiếp tục với trường tiếp theo
            }
          }
          let uuid = uuidv4();
          // Thực hiện sao chép sâu baseRow
          let newRow = JSON.parse(JSON.stringify(baseRow)); // Khởi tạo newRow từ baseRow

          newRow.map((field) => {
            if (
              row[field.name] == "OTHERWISE" ||
              row[field.name + ".value"] == "OTHERWISE" ||
              row[field.name + ".condition"] == "OTHERWISE" ||
              row[field.name + ".min"] == "OTHERWISE" ||
              row[field.name + ".max"] == "OTHERWISE"
            ) {
              field.value = "OTHERWISE"; // Giữ nguyên giá trị "OTHERWISE"
              field.isOtherwise = true; // Đánh dấu trường là "Otherwise"
            } else {
              if (field.type === "checkbox") {
                field.value = row[field.name] === true ? true : false; // Chuyển đổi giá trị checkbox
              } else {
                if (field.name === "STT" && row[field.name]) {
                  field.value = row[field.name];
                  field.rowKey = uuid;
                } else {
                  if (field.children && field.children.length > 0) {
                    // Trường hợp có children
                    if (listEqual.includes(row[field.name + ".min"])) {
                      field.isSpecialValue = true; // Đánh dấu trường range so sánh đặc biệt
                      field.compare = row[field.name + ".min"] == "equal" ? "=" : row[field.name + ".min"] || ""; // Gán giá trị từ hàng
                      if (field.type === "date") {
                        field.value = parseDateValue(row[field.name + ".max"]) || row[field.name + ".max"]; // Chuyển đổi giá trị ngày tháng
                      } else {
                        field.value = row[field.name + ".max"] || ""; // Gán giá trị từ hàng
                      }
                    } else {
                      field.children = field.children.map((child) => {
                        if (row[field.name + "." + child.name]) {
                          if (child.type === "date") {
                            child.value = parseDateValue(row[field.name + "." + child.name]) || row[field.name + "." + child.name]; // Chuyển đổi giá trị ngày tháng
                          } else {
                            child.value =
                              row[field.name + "." + child.name] == "equal"
                                ? "="
                                : row[field.name + "." + child.name] == "not in"
                                ? "not_in"
                                : row[field.name + "." + child.name]; // Chuyển đổi giá trị điều kiện
                          }
                        } else {
                          child.value = "";
                        }
                        return child;
                      });
                    }
                  } else {
                    if (row[field.name + ".condition"] == "in" || row[field.name + ".condition"] == "not in") {
                      if (typeof row[field.name + ".value"] == "string" && row[field.name + ".value"].includes("|")) {
                        field.value = row[field.name + ".value"] ? row[field.name + ".value"].split("|") : ""; // Gán giá trị từ hàng
                      } else {
                        field.value = row[field.name + ".value"] ? [row[field.name + ".value"]] : ""; // Gán giá trị từ hàng
                      }
                    } else {
                      field.value = row[field.name + ".value"] || ""; // Gán giá trị từ hàng
                    }
                    if (field.type === "date") {
                      field.value = parseDateValue(row[field.name + ".value"]) || row[field.name + ".value"];
                    }
                    field.compare =
                      row[field.name + ".condition"] == "equal"
                        ? "="
                        : row[field.name + ".condition"] == "not in"
                        ? "not_in"
                        : row[field.name + ".condition"] || ""; // Gán điều kiện nếu có
                  }
                }
              }
            }
            return field;
          });
          newDataRow.push(newRow);
        }
        if (newDataRow.length > 0) {
          // setDataRow(newDataRow); // Cập nhật dữ liệu mới vào state
          setDataRowNew(newDataRow); // Cập nhật dữ liệu mới vào state
          // fetchDataLookup(newDataRow) // Load dữ liệu lookup từ dữ liệu mới
          //   .then((result) => setLookupValues(result))
          //   .catch((err) => setLookupError(err))
          //   .finally(() => setLookupLoading(false));
        }
      }
    };
    reader.readAsArrayBuffer(file);
    setisReadingFile(false); // Đặt trạng thái đang đọc file là false sau khi hoàn thành
  };

  const takeFileAdd = (data) => {
    if (data) {
      setLstIndexErros([]); // Reset danh sách lỗi
      setDataRowNew([]); // Reset dữ liệu mới
      readExcelFile(data); // Đọc file Excel khi file được thêm
    }
  };

  const onSubmit = async (e?: any) => {
    e.preventDefault();

    setIsSubmit(true);

    const body: IAutoProcessModalProps = {
      ...(formData as IAutoProcessModalProps),
    };

    let response = await GridService.importFile(body);
    if (response.code === 0) {
      setInfoFile(response.result);
      onHide(true);
      // setStep({ stepOne: false, stepTwo: false, stepThree: true });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsSubmit(false);
  };

  useEffect(() => {
    if (idData && lstData && lstData.length > 0) {
      const takeDataDuplicate = lstData.find((item) => item.id === idData);
      const result = takeDataDuplicate.duplicateData;
      setDataDuplicate(result);
    }
  }, [idData, lstData]);

  const refOption = useRef();

  const [countDataTest, setCountDataTest] = useState<number>(1);
  const [isShowField, setIsShowField] = useState<boolean>(false);

  useEffect(() => {
    if (onShow) {
      setAddFile("");
      setLstIndexErros([]); // Reset danh sách lỗi
    }
  }, [onShow]);

  useOnClickOutside(refOption, () => setIsShowField(false), ["btn__submit--data"]);

  const handClearForm = () => {
    step == 1 ? onHide(false) : onHide(true);
    setAddFile("");
    setInfoFile(null);
    setPrevAddFile("");
    setFormData(defaultFormData);
    setStep(1);
    setLstData([]);
    setCountDataTest(1);
    setIsShowField(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: step == 2 ? "Quay lại" : "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              step == 1 ? handClearForm() : step == 2 ? setStep(1) : handClearForm();
            },
          },
          {
            title: "Tiếp tục",
            disabled: dataRowNew?.length === 0 || isReadingFile || (step == 2 && lstIndexErros.length > 0) || isSubmit,
            is_loading: isSubmit,
            type: "button", // Đảm bảo giá trị là "button" hoặc "submit"
            callback: () => {
              if (step === 1) {
                setStep(2);
              } else if (step === 2) {
                setDataRow(dataRowNew); // Cập nhật dữ liệu mới vào state
                fetchDataLookup(dataRowNew) // Load dữ liệu lookup từ dữ liệu mới
                  .then((result) => setLookupValues(result))
                  .catch((err) => setLookupError(err))
                  .finally(() => setLookupLoading(false));
                // Đóng modal
                handClearForm();
              }
            },
          },
        ],
      },
    }),
    [isSubmit, addFile, step, dataRowNew, isReadingFile, lstIndexErros]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          handClearForm();
        }}
        className="modal__import--backup"
        size={`${step == 2 ? "xl" : "md"}`}
      >
        <form className="form__import--backup" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={name} toggle={() => handClearForm()} />
          <ModalBody>
            <div className="box__ui--import">
              {step == 1 ? (
                <div className="wrapper__step--one">
                  <div className="box__update--file">
                    {!addFile && <div className="notify-message">Hiện tại bạn chưa có file mẫu nhập liệu. Hãy tải file mẫu ở phía dưới nhé!</div>}
                    {isLoadingFile ? (
                      <div className="is__loading--file">
                        <Icon name="Refresh" />
                        <span className="name-loading">Đang tải...</span>
                      </div>
                    ) : (
                      <AddFile takeFileAdd={takeFileAdd} code={code} fileProps={addFile} />
                    )}
                  </div>

                  <div className="file__example">
                    <h4>
                      Tải về file mẫu:
                      <span className="download__file--sample" onClick={() => exportCustomExcel(listColumn)}>
                        Excel file
                      </span>
                    </h4>
                  </div>
                </div>
              ) : step == 2 ? (
                <div className="wrapper__step--two">
                  <div className="number__error">Kiểm tra nhập liệu:</div>
                  <div className="number__error">
                    Có <strong>{lstIndexErros.length}</strong> lỗi
                  </div>
                  {lstIndexErros.length > 0 && (
                    <div className="list__error">
                      <div className="title__error">
                        <div>Danh sách lỗi:</div>

                        <Button
                          className="btn__submit--data"
                          color="primary"
                          type="button"
                          onClick={() => {
                            exportOlaExcel(listColumn, convertToDataRow(dataRowNew), lstIndexErros); // Xuất file lỗi
                          }}
                          // ref={refOption}
                        >
                          Tải file lỗi
                        </Button>
                      </div>
                      <ul>
                        {lstIndexErros.map((item, index) => (
                          <li key={index}>
                            STT {item.rowIndex} - Trường "{item.fieldName.replace(".", " - ")}": {item.errorMessage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="wrapper__step--three">
                  <div className="number__error">Kiểm tra logic:</div>
                  <div className="show__result">
                    <span className="summary-item">
                      - Tổng số <span className="qty-success">{infoFile?.numValid} bản ghi</span> thành công.
                    </span>
                    <span className="summary-item">
                      - Tổng số <span className="qty-duplicate">{infoFile?.numDuplicate} bản ghi</span> bị trùng.
                    </span>
                    <span className="summary-item">
                      - Tổng số <span className="qty-faild">{infoFile?.numInvalid} bản ghi </span>thất bại.{" "}
                      {infoFile?.numInvalid > 0 && (
                        <span>{/* Tải xuống danh sách không thành công <a onClick={() => handDownloadFileError()}>tại đây</a>. */}</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}

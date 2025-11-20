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
// import { fetchDataLookup } from "../../Lookup";
import moment from "moment";
import { makeValidateField } from "./partials/makeValidateField";
import Button from "components/button/button";
import { useGridAg } from "../../GridAgContext";
import { fetchDataLookupGrid } from "../../function/lookupGrid";
import { mapDataWithLookup } from "../../function/getDataGrid";
// import { exportOlaExcel } from "../../exportOla";
// import { convertToDataRow } from "../../convertToDataRow";

export default function ModalImportGrid(props: any) {
  const { onShow, onHide, name, code, listColumn } = props;
  const { typeNo, setRowData, setLookupValues, setIsLoading } = useGridAg();

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

  function parseDateValue(value: any): string | null {
    // Kiểm tra nếu giá trị đã là đối tượng Date
    if (value instanceof Date) {
      return moment(value).utc().toISOString(); // Giữ nguyên nếu đã là đối tượng Date
    }

    // Kiểm tra nếu giá trị là số (Excel serial)
    if (typeof value === "number") {
      return moment(excelDateToJSDate(value)).utc().toISOString(); // Chuyển đổi từ số serial
    }

    // Kiểm tra nếu giá trị là chuỗi ngày hợp lệ
    const dateValue = moment(value, "DD/MM/YYYY", true);
    return dateValue.isValid() ? moment(dateValue.toDate()).utc().toISOString() : null; // Trả về ngày hoặc null nếu không hợp lệ
  }

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
      console.log("jsonData", jsonData);

      //Đọc dòng đầu trong file Excel để lấy danh sách cột, nếu số lượng và tên cột không khớp với danh sách cột listColumn đã định nghĩa thì sẽ thông báo lỗi
      const headerRow = jsonData[0].filter((item) => item !== null && item !== undefined); // Lọc các giá trị null, undefined và rỗng
      const headerNames = headerRow.map((item) => item.toString().trim());
      let listColumnNames = listColumn.map((col) => col.name.trim());
      listColumnNames = ["Level tiêu đề", ...listColumnNames];

      const isValidHeader = JSON.stringify(headerNames.filter((name) => name != "Làm rõ")) === JSON.stringify(listColumnNames);
      if (!isValidHeader) {
        showToast("File Excel không hợp lệ. Vui lòng kiểm tra lại tên và thứ tự cột.", "error");
        return;
      }
      const headerKeys = jsonData[1];
      const listColumnKeys = listColumn.map((col) => col.key).filter((key) => key != "cot-lam-ro");
      const isValidHeaderKey = JSON.stringify(headerKeys) === JSON.stringify(["level", ...listColumnKeys]);
      if (!isValidHeaderKey) {
        showToast("File Excel không hợp lệ. Vui lòng kiểm tra lại key và thứ tự cột.", "error");
        return;
      }
      const headerTypes = jsonData[3];

      let newDataRow = [];
      if (jsonData.length) {
        for (let index = 4; index < jsonData.length; index++) {
          let row = jsonData[index];
          let uuid = uuidv4();
          // Thực hiện sao chép sâu baseRow
          if (row[0]) {
            // Nếu có giá trị ở cột Level tiêu đề thì tạo dòng tiêu đề
            let newRowTitle = {
              rowKey: uuid,
              isFullWidthRow: true,
              level: row[0] || "",
              no: row[1] || "",
              content: row[2] || "",
            };
            newDataRow.push(newRowTitle);
          } else {
            let newRow = headerKeys.reduce((acc, key, index) => {
              if (headerTypes[index] === "date") {
                acc[key] = parseDateValue(row[index]) || null; // Giá trị mặc định là null, có thể thay đổi thành "" hoặc giá trị khác
                return acc;
              } else {
                acc[key] = row[index] || null; // Giá trị mặc định là null, có thể thay đổi thành "" hoặc giá trị khác
              }
              return acc;
            }, {});
            newRow["rowKey"] = uuid;
            newDataRow.push(newRow);
          }
        }
      }
      setDataRowNew(newDataRow);
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

  const handleUpdateData = async () => {
    if (dataRowNew && dataRowNew.length > 0) {
      let _dataLookup = await mapDataWithLookup(listColumn, dataRowNew);
      setLookupValues(_dataLookup?.dataLookup || {});
      setRowData(_dataLookup?.dataWithLookup || []); // Cập nhật dữ liệu mới vào state
      setIsLoading(false);
    }
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
                handleUpdateData();
                handClearForm();
                setIsLoading(true);
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
                  <div className="number__error">
                    Import <strong>{dataRowNew.length}</strong> bản ghi.{" "}
                  </div>
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

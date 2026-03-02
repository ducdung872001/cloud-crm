import React, { useState, Fragment } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import AddFile from "./partials/AddFile";
import { showToast } from "utils/common";
import * as XLSX from "xlsx";
import "./index.scss";

interface IProduct {
  name: string;
  code: string;
  avatar: string;
  unitId: number;
  price: number;
  categoryId: number;
}

interface IModalImportProductProps {
  onShow: boolean;
  onHide: (isSuccess: boolean) => void;
  onImportSuccess: (products: IProduct[]) => void;
}

const PRODUCT_COLUMNS = ["name", "code", "avatar", "unitId", "price", "categoryId"];

export default function ModalImportProduct({ onShow, onHide, onImportSuccess }: IModalImportProductProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [lstProducts, setLstProducts] = useState<IProduct[]>([]);
  const [lstErrors, setLstErrors] = useState<{ row: number; field: string; message: string }[]>([]);
  const [isReading, setIsReading] = useState(false);

  const readExcelFile = (file: Blob) => {
    if (!(file instanceof Blob)) return;

    setIsReading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Validate header
      const headerRow = jsonData[0]
        ?.filter((item) => item !== null && item !== undefined)
        ?.map((item) => item.toString().trim().replace(/^\uFEFF/, "")); // xử lý BOM

      const isValidHeader =
        headerRow.length === PRODUCT_COLUMNS.length &&
        headerRow.every((col, i) => col === PRODUCT_COLUMNS[i]);

      if (!isValidHeader) {
        showToast("File Excel không hợp lệ. Vui lòng kiểm tra lại tên và thứ tự cột.", "error");
        setIsReading(false);
        return;
      }

      const errors: typeof lstErrors = [];
      const products: IProduct[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const [name, code, avatar, unitId, price, categoryId] = row;

        // Validate
        if (!name)
          errors.push({ row: i + 1, field: "name", message: "Tên sản phẩm không được trống" });
        if (!code)
          errors.push({ row: i + 1, field: "code", message: "Mã sản phẩm không được trống" });
        if (avatar && !/^https?:\/\/.+/.test(avatar.toString().trim()))
          errors.push({ row: i + 1, field: "avatar", message: "Avatar phải là đường dẫn URL hợp lệ" });
        if (!unitId || isNaN(Number(unitId)))
          errors.push({ row: i + 1, field: "unitId", message: "Đơn vị tính không hợp lệ (phải là số)" });
        if (!price || isNaN(Number(price)))
          errors.push({ row: i + 1, field: "price", message: "Giá không hợp lệ" });
        if (!categoryId || isNaN(Number(categoryId)))
          errors.push({ row: i + 1, field: "categoryId", message: "Danh mục không hợp lệ (phải là số)" });

        products.push({
          name: name?.toString().trim() ?? "",
          code: code?.toString().trim() ?? "",
          avatar: avatar?.toString().trim() ?? "",
          unitId: Number(unitId) || 0,
          price: Number(price) || 0,
          categoryId: Number(categoryId) || 0,
        });
      }

      setLstErrors(errors);
      setLstProducts(products);
      setIsReading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleFileAdded = (file: Blob) => {
    setLstErrors([]);
    setLstProducts([]);
    if (file) readExcelFile(file);
  };

  const handleClose = () => {
    setStep(1);
    setLstProducts([]);
    setLstErrors([]);
    onHide(false);
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onImportSuccess(lstProducts);
      handleClose();
    }
  };

  const actions = {
    actions_right: {
      buttons: [
        {
          title: step === 2 ? "Quay lại" : "Đóng",
          color: "primary",
          variant: "outline",
          callback: () => (step === 1 ? handleClose() : setStep(1)),
        },
        {
          title: step === 1 ? "Tiếp tục" : "Xác nhận import",
          disabled: lstProducts.length === 0 || isReading || (step === 2 && lstErrors.length > 0),
          callback: handleContinue,
        },
      ],
    },
  };

  return (
    <Fragment>
      <Modal isOpen={onShow} isCentered staticBackdrop toggle={handleClose} size={step === 2 ? "xl" : "md"}>
        <ModalHeader title="Import sản phẩm" toggle={handleClose} />

        <ModalBody>
          {step === 1 ? (
            <div className="wrapper__step--one">
              <AddFile takeFileAdd={handleFileAdded} />
              <div className="file__hint">
                File Excel cần có các cột theo thứ tự: <strong>{PRODUCT_COLUMNS.join(", ")}</strong>
              </div>
            </div>
          ) : (
            <div className="wrapper__step--two">
              <div className="summary__validate">
                Tổng: <strong>{lstProducts.length}</strong> sản phẩm —{" "}
                <strong className="count__error">{lstErrors.length}</strong> lỗi
              </div>

              {lstErrors.length > 0 ? (
                <div className="list__error">
                  <ul>
                    {lstErrors.map((err, i) => (
                      <li key={i}>
                        Dòng {err.row} - <strong>{err.field}</strong>: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="success__message">✅ Không có lỗi, sẵn sàng import!</div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter actions={actions} />
      </Modal>
    </Fragment>
  );
}
import React, { useMemo, useState, useEffect } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Badge from "components/badge/badge";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IFormData, IFieldCustomize, IValidation } from "model/FormModel";
import { IActionModal } from "model/OtherModel";
import { handleChangeValidate } from "utils/validate";
import "./ModalPaymentMethod.scss";

export default function ModalPaymentMethod(props: any) {
  const { onShow, onHide, data } = props;

  const initialValues = useMemo(
    () => ({
      name: data?.name ?? "",
      bankName: data?.bank ?? "",
      accountNumber: data?.account ?? "",
      accountOwner: data?.owner ?? "",
      apiKey: data?.apiKey ?? "",
      order: data?.order ?? "1",
      isDefault: data?.isDefault ?? false,
    }),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: initialValues, errors: {} });

  const validations: IValidation[] = [{ name: "name", rules: "required" }];

  useEffect(() => {
    setFormData({ values: initialValues, errors: {} });
  }, [initialValues]);

  const bankOptions = [
    { value: "VCB", label: "Vietcombank" },
    { value: "TCB", label: "Techcombank" },
    { value: "MB", label: "MB Bank" },
  ];

  const listField = useMemo(
    () =>
      [
        { label: "Tên hiển thị", name: "name", type: "text", placeholder: "Nhập tên hiển thị...", fill: true, required: true },
        { label: "Icon/Logo", name: "logo", type: "file", placeholder: "Chọn tệp hoặc kéo thả", fill: true },
        { label: "Số tài khoản", name: "accountNumber", type: "text", placeholder: "Nhập số tài khoản...", fill: true },
        { label: "Chủ tài khoản", name: "accountOwner", type: "text", placeholder: "Nhập tên chủ tài khoản...", fill: true },
        { label: "Mã tích hợp (API Key/Secret)", name: "apiKey", type: "password", placeholder: "****************", fill: true },
        { label: "Thứ tự hiển thị", name: "order", type: "number", placeholder: "Nhập thứ tự hiển thị...", fill: true },
      ] as IFieldCustomize[],
    []
  );

  const footerActions: IActionModal = {
    actions_right: {
      buttons: [
        { title: "Hủy bỏ", variant: "outline", color: "primary", callback: () => onHide() },
        { title: "Lưu cấu hình", color: "primary", callback: () => onHide() },
      ],
    },
  };

  return (
    <Modal isOpen={onShow} isCentered={true} toggle={onHide} isFade={true} staticBackdrop={true} className="modal-payment-method">
      <div className="form-package-group">
        <ModalHeader title="Cấu hình Phương thức Thanh toán" toggle={onHide} />
        <ModalBody>
          <div className="list-form-group">
            <FieldCustomize
              field={listField[0]}
              formData={formData}
              handleUpdate={(value) => handleChangeValidate(value, listField[0], formData, validations, listField, setFormData)}
            />

            <FieldCustomize
              field={listField[1]}
              formData={formData}
              handleUpdate={(value) => handleChangeValidate(value, listField[1], formData, validations, listField, setFormData)}
            />

            <div className="form-group mb-16">
              <SelectCustom
                label="Tên ngân hàng"
                options={bankOptions}
                placeholder="Chọn.."
                value={formData.values.bankName}
                onChange={(e: any) => setFormData({ ...formData, values: { ...formData.values, bankName: e.value } })}
                fill
              />
            </div>

            {listField.slice(2).map((field, index) => (
              <FieldCustomize
                key={index}
                field={field}
                formData={formData}
                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
              />
            ))}

            <div className="base-switch-wrapper">
              <label>Mặc định</label>
              <input
                type="checkbox"
                className="base-switch"
                checked={formData.values.isDefault}
                onChange={(e) => setFormData({ ...formData, values: { ...formData.values, isDefault: e.target.checked } })}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter actions={footerActions} />
      </div>
    </Modal>
  );
}

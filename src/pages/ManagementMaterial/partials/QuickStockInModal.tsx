import React, { useState, useEffect, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import Validate, { handleChangeValidate } from "utils/validate";
import "./QuickStockInModal.scss";
import { IMaterialResponse } from "@/model/material/MaterialResponseModel";

interface QuickStockInModalProps {
  isOpen: boolean;
  material: IMaterialResponse | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const WAREHOUSE_OPTIONS = [
  { value: "kho-a", label: "Kho A - Tầng 1" },
  { value: "kho-b", label: "Kho B - Tầng 2" },
  { value: "kho-lanh", label: "Kho lạnh" },
];

export default function QuickStockInModal({ isOpen, material, onClose, onSuccess }: QuickStockInModalProps) {
  const values = useMemo(
    () => ({
      qty: "50",
      price: material?.price != null ? String(material.price) : "18000",
      warehouse: "kho-a",
      note: "",
    }),
    [material, isOpen]
  );

  const [formData, setFormData] = useState<IFormData>({ values });
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, values, errors: {} }));
    setIsSubmit(false);
  }, [values]);

  const validations: IValidation[] = [{ name: "qty", rules: "required" }];

  const listField: IFieldCustomize[] = [
    {
      label: "Số lượng nhập",
      name: "qty",
      type: "number",
      fill: true,
      required: true,
      placeholder: "0",
    },
    {
      label: "Giá nhập (₫/đvt)",
      name: "price",
      type: "number",
      fill: true,
      placeholder: "0",
    },
    {
      label: "Kho nhập",
      name: "warehouse",
      type: "select",
      fill: true,
      options: WAREHOUSE_OPTIONS,
      placeholder: "Chọn kho",
    },
    {
      label: "Ghi chú",
      name: "note",
      type: "text",
      fill: true,
      placeholder: "Lô hàng, số phiếu...",
    },
  ];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }
    setIsSubmit(true);
    showToast("Đã nhập tồn thành công! Sổ kho đã được cập nhật.", "success");
    onClose();
    onSuccess?.();
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: onClose,
          },
          {
            title: "Xác nhận nhập",
            type: "submit",
            color: "primary",
            disabled: isSubmit || (formData?.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData?.errors, isSubmit]
  );

  if (!material) return null;

  return (
    <Modal isFade isOpen={isOpen} isCentered staticBackdrop toggle={onClose} className="quick-stockin-modal" size="sm">
      <form className="quick-stockin-modal__form" onSubmit={onSubmit}>
        <ModalHeader title={`Nhập tồn nhanh – ${material.name}`} toggle={onClose} />
        <ModalBody>
          <div className="list-form-group list-form-group--quick-stockin list-form-group--grid-2">
            {listField.slice(0, 2).map((field) => (
              <FieldCustomize
                key={field.name}
                field={field}
                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                formData={formData}
              />
            ))}
          </div>
          <div className="list-form-group list-form-group--quick-stockin">
            {listField.slice(2).map((field) => (
              <FieldCustomize
                key={field.name}
                field={field}
                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                formData={formData}
              />
            ))}
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </form>
    </Modal>
  );
}

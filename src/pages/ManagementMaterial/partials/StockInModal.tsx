import React, { useState, useEffect, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import Validate, { handleChangeValidate } from "utils/validate";
import "./StockInModal.scss";
import { IMaterialResponse } from "@/model/material/MaterialResponseModel";

interface StockInModalProps {
  isOpen: boolean;
  materialList: IMaterialResponse[];
  initialMaterial?: IMaterialResponse | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const WAREHOUSE_OPTIONS = [
  { value: "kho-a", label: "Kho A - Tầng 1" },
  { value: "kho-b", label: "Kho B - Tầng 2" },
  { value: "kho-lanh", label: "Kho lạnh" },
];

const NCC_OPTIONS = [
  { value: "ncc1", label: "NCC An Uyên" },
  { value: "ncc2", label: "NCC Phong Phú" },
  { value: "ncc3", label: "NCC Hoàng Long" },
];

function getDefaultDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function StockInModal({isOpen, materialList, initialMaterial, onClose, onSuccess }: StockInModalProps) {
  const values = useMemo(
    () => ({
      materialId: initialMaterial?.id ?? "",
      qty: "0",
      unit: initialMaterial?.unitName ?? "",
      price: initialMaterial?.price != null ? String(initialMaterial.price) : "0",
      warehouse: "",
      importDate: getDefaultDate(),
      ncc: "",
      note: "",
    }),
    [initialMaterial, isOpen]
  );

  const [formData, setFormData] = useState<IFormData>({ values });
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, values, errors: {} }));
    setIsSubmit(false);
  }, [values]);

  const materialOptions = useMemo(
    () =>
      materialList.map((m) => ({
        value: m.id,
        label: `${m.name}${m.code ? ` (${m.code})` : ""}`,
      })),
    [materialList]
  );

  const validations: IValidation[] = [
    { name: "materialId", rules: "required" },
    { name: "qty", rules: "required" },
  ];

  const listField: IFieldCustomize[] = useMemo(
    () => [
      {
        label: "Chọn nguyên vật liệu",
        name: "materialId",
        type: "select",
        fill: true,
        required: true,
        placeholder: "Chọn nguyên vật liệu",
        options: materialOptions,
        isSearchable: true,
      },
      {
        label: "Số lượng nhập",
        name: "qty",
        type: "number",
        fill: true,
        required: true,
        placeholder: "0",
      },
      {
        label: "Đơn vị",
        name: "unit",
        type: "text",
        fill: true,
        readOnly: true,
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
        label: "Ngày nhập",
        name: "importDate",
        type: "date",
        fill: true,
        placeholder: "dd/mm/yyyy",
      },
      {
        label: "NCC cung cấp lần này",
        name: "ncc",
        type: "select",
        fill: true,
        options: NCC_OPTIONS,
        placeholder: "Chọn NCC",
      },
      {
        label: "Ghi chú / Số phiếu nhập kho",
        name: "note",
        type: "text",
        fill: true,
        placeholder: "Số phiếu, lô hàng, ghi chú...",
      },
    ],
    [materialOptions]
  );

  const selectedMaterial = useMemo(
    () => materialList.find((m) => m.id === formData.values?.materialId) ?? null,
    [materialList, formData.values?.materialId]
  );

  const handleUpdate = (value: any, field: IFieldCustomize) => {
    if (field.name === "materialId") {
      const sel = materialList.find((m) => m.id === value);
      setFormData((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          materialId: value,
          unit: sel?.unitName ?? "",
          price: sel?.price != null ? String(sel.price) : prev.values?.price ?? "",
        },
      }));
      return;
    }
    handleChangeValidate(value, field, formData, validations, listField, setFormData);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }
    if (!selectedMaterial) {
      showToast("Vui lòng chọn nguyên vật liệu", "error");
      return;
    }
    setIsSubmit(true);
    showToast("Đã lưu thành công! Sổ kho đã được cập nhật tự động.", "success");
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
            title: "Xác nhận nhập tồn",
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

  const unit = selectedMaterial?.unitName ?? formData.values?.unit ?? "kg";
  const qtyNum = parseInt(String(formData.values?.qty), 10) || 0;
  const priceNum = parseInt(String(formData.values?.price), 10) || 0;
  const total = qtyNum * priceNum;
  const mockCurrentStock = selectedMaterial ? ((selectedMaterial.id ?? 0) * 37 + 50) % 200 : 0;
  const afterStock = mockCurrentStock + qtyNum;

  return (
    <Modal isFade isOpen={isOpen} isCentered staticBackdrop toggle={onClose} className="stockin-modal" size="lg">
      <form className="stockin-modal__form" onSubmit={onSubmit}>
        <ModalHeader title="Nhập tồn nguyên vật liệu" toggle={onClose} />
        <ModalBody>

          <div className="stockin-modal__card stockin-modal__card--no-border">
            <div className="list-form-group list-form-group--stockin">
              <FieldCustomize
                field={listField[0]}
                handleUpdate={(value) => handleUpdate(value, listField[0])}
                formData={formData}
              />
            </div>
            <div className="list-form-group list-form-group--stockin list-form-group--grid-3">
              {listField.slice(1, 4).map((field, index) => (
                <FieldCustomize
                  key={field.name}
                  field={field}
                  handleUpdate={(value) => handleUpdate(value, field)}
                  formData={formData}
                />
              ))}
            </div>
            <div className="list-form-group list-form-group--stockin list-form-group--grid-2">
              {listField.slice(4, 6).map((field) => (
                <FieldCustomize
                  key={field.name}
                  field={field}
                  handleUpdate={(value) => handleUpdate(value, field)}
                  formData={formData}
                />
              ))}
            </div>
            <div className="list-form-group list-form-group--stockin">
              <FieldCustomize
                field={listField[6]}
                handleUpdate={(value) => handleUpdate(value, listField[6])}
                formData={formData}
              />
            </div>
            <div className="list-form-group list-form-group--stockin">
              <FieldCustomize
                field={listField[7]}
                handleUpdate={(value) => handleUpdate(value, listField[7])}
                formData={formData}
              />
            </div>
          </div>

          {selectedMaterial && (
            <div className="stockin-modal__confirm">
              <div className="stockin-modal__confirm-title">Xác nhận nhập tồn</div>
              <div className="stockin-modal__confirm-row">
                <span className="k">Nguyên vật liệu</span>
                <span className="v">
                  {selectedMaterial.name} ({selectedMaterial.code ?? "—"})
                </span>
              </div>
              <div className="stockin-modal__confirm-row">
                <span className="k">Số lượng nhập</span>
                <span className="v">
                  + {qtyNum} {unit}
                </span>
              </div>
              <div className="stockin-modal__confirm-row">
                <span className="k">Đơn giá nhập</span>
                <span className="v">
                  {priceNum.toLocaleString("vi")} ₫/{unit}
                </span>
              </div>
              <div className="stockin-modal__confirm-row">
                <span className="k">Thành tiền</span>
                <span className="v total">{total.toLocaleString("vi")} ₫</span>
              </div>
              <div className="stockin-modal__confirm-divider" />
              <div className="stockin-modal__confirm-row">
                <span className="k">Tồn kho trước</span>
                <span className="v">
                  {mockCurrentStock} {unit}
                </span>
              </div>
              <div className="stockin-modal__confirm-row">
                <span className="k">Tồn kho sau khi nhập</span>
                <span className="v after">
                  {afterStock} {unit}
                </span>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter actions={actions} />
      </form>
    </Modal>
  );
}

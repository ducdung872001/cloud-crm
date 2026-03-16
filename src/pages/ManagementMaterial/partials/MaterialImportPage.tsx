import React, { useState, useEffect, useMemo } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { showToast } from "utils/common";
import Validate, { handleChangeValidate } from "utils/validate";
import { IMaterialResponse } from "@/model/material/MaterialResponseModel";
import { MOCK_MATERIAL_LIST } from "@/assets/mock/Material";
import "./MaterialImportPage.scss";

interface MaterialImportPageProps {
  onBackProps?: (isBack: boolean) => void;
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

const defaultValues = {
  materialId: "",
  qty: "",
  unit: "",
  price: "",
  warehouse: "",
  importDate: getDefaultDate(),
  ncc: "",
  note: "",
};

export default function MaterialImportPage({ onBackProps }: MaterialImportPageProps) {
  document.title = "Nhập nguyên vật liệu";

  const [formData, setFormData] = useState<IFormData>({ values: { ...defaultValues } });
  const [isSubmit, setIsSubmit] = useState(false);

  const materialOptions = useMemo(
    () =>
      MOCK_MATERIAL_LIST.map((m) => ({
        value: m.id,
        label: `${m.name}${m.code ? ` (${m.code})` : ""}`,
      })),
    []
  );

  const validations: IValidation[] = [
    { name: "materialId", rules: "required" },
    { name: "qty", rules: "required" },
  ];

  const listField: IFieldCustomize[] = useMemo(
    () => [
      {
        label: "Nguyên vật liệu",
        name: "materialId",
        type: "select",
        fill: true,
        required: true,
        placeholder: "Chọn nguyên vật liệu cần nhập",
        options: materialOptions,
        isSearchable: true,
      },
      {
        label: "Số lượng nhập",
        name: "qty",
        type: "number",
        fill: true,
        required: true,
        placeholder: "Nhập số lượng",
      },
      {
        label: "Đơn vị",
        name: "unit",
        type: "text",
        fill: true,
        readOnly: true,
      },
      {
        label: "Giá nhập (VNĐ/đvt)",
        name: "price",
        type: "number",
        fill: true,
        placeholder: "Nhập đơn giá",
      },
      {
        label: "Kho nhập",
        name: "warehouse",
        type: "select",
        fill: true,
        options: WAREHOUSE_OPTIONS,
        placeholder: "Chọn kho nhập",
      },
      {
        label: "Ngày nhập",
        name: "importDate",
        type: "date",
        fill: true,
      },
      {
        label: "Nhà cung cấp",
        name: "ncc",
        type: "select",
        fill: true,
        options: NCC_OPTIONS,
        placeholder: "Chọn nhà cung cấp",
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

  const selectedMaterial: IMaterialResponse | null = useMemo(
    () => MOCK_MATERIAL_LIST.find((m) => m.id === formData.values?.materialId) ?? null,
    [formData.values?.materialId]
  );

  const handleUpdate = (value: any, field: IFieldCustomize) => {
    if (field.name === "materialId") {
      const sel = MOCK_MATERIAL_LIST.find((m) => m.id === value);
      setFormData((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          materialId: value,
          unit: sel?.unitName ?? "",
          price: sel?.price != null ? String(sel.price) : "",
        },
      }));
      return;
    }
    handleChangeValidate(value, field, formData, validations, listField, setFormData);
  };

  const handleReset = () => {
    setFormData({ values: { ...defaultValues } });
    setIsSubmit(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }
    setIsSubmit(true);
    setTimeout(() => {
      showToast("Nhập tồn thành công! Sổ kho đã được cập nhật.", "success");
      handleReset();
    }, 600);
  };

  const titleActions: ITitleActions = {
    actions: [],
  };

  const unit = selectedMaterial?.unitName ?? formData.values?.unit ?? "";
  const qtyNum = parseFloat(String(formData.values?.qty)) || 0;
  const priceNum = parseFloat(String(formData.values?.price)) || 0;
  const total = qtyNum * priceNum;
  const currentStock = selectedMaterial?.stockCurrent ?? 0;
  const afterStock = currentStock + qtyNum;
  const hasSelection = !!selectedMaterial;

  return (
    <div className="page-content page-material-import">
      {/* ── HEADER ── */}
      <div className="action-navigation">
        <div className="action-backup">
          {onBackProps ? (
            <>
              <h1 className="title-first" onClick={() => onBackProps(true)} title="Quay lại">
                Nguyên vật liệu
              </h1>
              <Icon name="ChevronRight" onClick={() => onBackProps(true)} />
              <h1 className="title-last">Nhập nguyên vật liệu</h1>
            </>
          ) : (
            <h1 className="title-last" style={{ color: "var(--text-primary-color)" }}>
              Nhập nguyên vật liệu
            </h1>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <form onSubmit={onSubmit} className="mat-import-layout">
        {/* ── LEFT: form fields ── */}
        <div className="card-box mat-import-form">
          <div className="mat-import-form__title">Thông tin phiếu nhập</div>

          {/* Row 1: NVL selector full width */}
          <div className="list-form-group">
            <FieldCustomize
              field={listField[0]}
              handleUpdate={(v) => handleUpdate(v, listField[0])}
              formData={formData}
            />
          </div>

          {/* Row 2: Số lượng / Đơn vị / Giá nhập */}
          <div className="list-form-group mat-import-grid-3">
            {listField.slice(1, 4).map((field) => (
              <FieldCustomize
                key={field.name}
                field={field}
                handleUpdate={(v) => handleUpdate(v, field)}
                formData={formData}
              />
            ))}
          </div>

          {/* Row 3: Kho / Ngày nhập */}
          <div className="list-form-group mat-import-grid-2">
            {listField.slice(4, 6).map((field) => (
              <FieldCustomize
                key={field.name}
                field={field}
                handleUpdate={(v) => handleUpdate(v, field)}
                formData={formData}
              />
            ))}
          </div>

          {/* Row 4: NCC */}
          <div className="list-form-group">
            <FieldCustomize
              field={listField[6]}
              handleUpdate={(v) => handleUpdate(v, listField[6])}
              formData={formData}
            />
          </div>

          {/* Row 5: Ghi chú */}
          <div className="list-form-group">
            <FieldCustomize
              field={listField[7]}
              handleUpdate={(v) => handleUpdate(v, listField[7])}
              formData={formData}
            />
          </div>
        </div>

        {/* ── RIGHT: summary + actions ── */}
        <div className="mat-import-sidebar">
          {/* Summary card */}
          <div className={`card-box mat-import-summary${hasSelection ? " mat-import-summary--active" : ""}`}>
            <div className="mat-import-summary__header">
              <Icon name="Info" />
              Xác nhận nhập tồn
            </div>

            <div className="mat-import-summary__body">
              {!hasSelection ? (
                <div className="mat-import-summary__empty">
                  <Icon name="Package" />
                  <span>Chọn nguyên vật liệu để xem tóm tắt</span>
                </div>
              ) : (
                <>
                  <div className="mat-import-summary__nvl">
                    <div className="mat-import-summary__nvl-name">{selectedMaterial.name}</div>
                    <div className="mat-import-summary__nvl-code">{selectedMaterial.code ?? "—"}</div>
                  </div>

                  <div className="mat-import-summary__rows">
                    <div className="mat-import-summary__row">
                      <span className="k">Số lượng nhập</span>
                      <span className="v v--green">+{qtyNum.toLocaleString("vi")} {unit}</span>
                    </div>
                    <div className="mat-import-summary__row">
                      <span className="k">Giá nhập (VNĐ/đvt)</span>
                      <span className="v">{priceNum.toLocaleString("vi")}</span>
                    </div>
                    <div className="mat-import-summary__row mat-import-summary__row--total">
                      <span className="k">Thành tiền</span>
                      <span className="v v--primary">{total.toLocaleString("vi")} VNĐ</span>
                    </div>
                  </div>

                  <div className="mat-import-summary__divider" />

                  <div className="mat-import-summary__rows">
                    <div className="mat-import-summary__row">
                      <span className="k">Tồn kho hiện tại</span>
                      <span className="v">{currentStock.toLocaleString("vi")} {unit}</span>
                    </div>
                  </div>
                  {qtyNum > 0 && (
                    <div className="mat-import-after-row">
                      <span className="k">Tồn kho sau nhập</span>
                      <span className="v">{afterStock.toLocaleString("vi")} {unit}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mat-import-actions">
            <Button
              type="button"
              color="primary"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmit}
            >
              Làm mới
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={isSubmit || (formData?.errors && Object.keys(formData.errors).length > 0)}
              is_loading={isSubmit}
            >
              Xác nhận nhập tồn
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

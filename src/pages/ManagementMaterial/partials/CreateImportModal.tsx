import React, { Fragment, useState, useMemo, useEffect } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { IMaterialResponse } from "@/model/material/MaterialResponseModel";
import { IMaterialImportDetailRequest } from "@/model/material/MaterialImportModel";
import MaterialService, { MaterialImportService } from "@/services/MaterialService";
import { MOCK_MATERIAL_LIST } from "@/assets/mock/Material";
import "./CreateImportModal.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WAREHOUSE_OPTIONS = [
  { value: 1, label: "Kho A - Tầng 1" },
  { value: 2, label: "Kho B - Tầng 2" },
  { value: 3, label: "Kho lạnh" },
];

interface DetailLine extends IMaterialImportDetailRequest {
  _key: string;
  _materialName: string;
  _unitName: string;
}

export default function CreateImportModal({ isOpen, onClose, onSuccess }: Props) {
  const [isSubmit, setIsSubmit]           = useState(false);
  const [warehouseId, setWarehouseId]     = useState<number | "">("");
  const [supplierName, setSupplierName]   = useState("");
  const [importDate, setImportDate]       = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote]                   = useState("");
  const [lines, setLines]                 = useState<DetailLine[]>([]);
  const [materialSearch, setMaterialSearch] = useState("");
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [materials, setMaterials]         = useState<IMaterialResponse[]>(MOCK_MATERIAL_LIST);

  // Load materials from API if available
  useEffect(() => {
    if (!isOpen) return;
    MaterialService.list({ limit: 200, page: 1 })
      .then((res) => { if (res?.code === 0 && res.result?.items?.length) setMaterials(res.result.items); })
      .catch(() => {});
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setWarehouseId(""); setSupplierName(""); setNote("");
      setImportDate(new Date().toISOString().slice(0, 10));
      setLines([]); setMaterialSearch(""); setIsSubmit(false);
    }
  }, [isOpen]);

  const filteredMaterials = useMemo(() => {
    const q = materialSearch.toLowerCase();
    return q ? materials.filter((m) =>
      m.name.toLowerCase().includes(q) || (m.code ?? "").toLowerCase().includes(q)
    ) : materials;
  }, [materials, materialSearch]);

  const addLine = (mat: IMaterialResponse) => {
    if (lines.some((l) => l.materialId === mat.id)) {
      showToast("Nguyên vật liệu này đã có trong phiếu", "warning");
      return;
    }
    const newLine: DetailLine = {
      _key: `${mat.id}-${Date.now()}`,
      _materialName: mat.name,
      _unitName: mat.unitName ?? "",
      materialId: mat.id,
      materialName: mat.name,
      unitName: mat.unitName ?? "",
      quantity: 0,
      price: mat.price ?? 0,
    };
    setLines((prev) => [...prev, newLine]);
    setMaterialSearch("");
  };

  const updateLine = (key: string, field: "quantity" | "price" | "note", value: string) => {
    setLines((prev) => prev.map((l) =>
      l._key === key ? { ...l, [field]: field === "note" ? value : parseFloat(value) || 0 } : l
    ));
  };

  const removeLine = (key: string) => {
    setLines((prev) => prev.filter((l) => l._key !== key));
  };

  const totalAmount = useMemo(() =>
    lines.reduce((sum, l) => sum + (l.quantity ?? 0) * (l.price ?? 0), 0),
  [lines]);

  const validate = () => {
    if (!warehouseId) { showToast("Vui lòng chọn kho nhập", "error"); return false; }
    if (!lines.length) { showToast("Phiếu nhập cần có ít nhất 1 dòng nguyên vật liệu", "error"); return false; }
    for (const l of lines) {
      if (!l.quantity || l.quantity <= 0) {
        showToast(`Số lượng của "${l._materialName}" phải lớn hơn 0`, "error");
        return false;
      }
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setIsSubmit(true);
    const body = {
      warehouseId: warehouseId as number,
      supplierName: supplierName || undefined,
      importDate,
      note: note || undefined,
      details: lines.map((l) => ({
        materialId:   l.materialId,
        materialName: l.materialName,
        unitName:     l.unitName,
        quantity:     l.quantity,
        price:        l.price,
        note:         l.note,
      })),
    };

    const res = await MaterialImportService.create(body);
    if (res?.code === 0) {
      showToast("Tạo phiếu nhập thành công", "success");
      onSuccess();
    } else {
      showToast(res?.message ?? "Có lỗi xảy ra", "error");
      setIsSubmit(false);
    }
  };

  const handleClose = () => {
    if (lines.length || supplierName || note) {
      setContentDialog({
        color: "warning", isCentered: true, isLoading: false,
        title: "Hủy tạo phiếu nhập",
        message: "Bạn có chắc chắn muốn hủy? Dữ liệu đã nhập sẽ bị mất.",
        cancelText: "Quay lại",
        cancelAction: () => { setShowDialog(false); setContentDialog(null); },
        defaultText: "Xác nhận",
        defaultAction: () => { setShowDialog(false); setContentDialog(null); onClose(); },
      });
      setShowDialog(true);
    } else {
      onClose();
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true} isOpen={isOpen} isCentered={false}
        staticBackdrop={true} toggle={handleClose}
        className="modal-create-import" style={{ maxWidth: "860px" }}
      >
        <ModalHeader title="Tạo phiếu nhập nguyên vật liệu" toggle={handleClose} />
        <ModalBody>
          <div className="cim-layout">
            {/* ── LEFT: form fields ── */}
            <div className="cim-form">
              <div className="cim-field-row">
                <div className="cim-field">
                  <label className="cim-label">Kho nhập <span className="required">*</span></label>
                  <select
                    className="cim-select"
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(Number(e.target.value) || "")}
                  >
                    <option value="">Chọn kho nhập</option>
                    {WAREHOUSE_OPTIONS.map((w) => (
                      <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                  </select>
                </div>
                <div className="cim-field">
                  <label className="cim-label">Ngày nhập</label>
                  <input
                    type="date" className="cim-input" value={importDate}
                    onChange={(e) => setImportDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="cim-field">
                <label className="cim-label">Nhà cung cấp</label>
                <input
                  type="text" className="cim-input" placeholder="Tên nhà cung cấp..."
                  value={supplierName} onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>

              <div className="cim-field">
                <label className="cim-label">Ghi chú / Số phiếu</label>
                <input
                  type="text" className="cim-input" placeholder="Số phiếu, lô hàng, ghi chú..."
                  value={note} onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* ── Material search ── */}
              <div className="cim-field">
                <label className="cim-label">Thêm nguyên vật liệu</label>
                <div className="cim-mat-search-wrap">
                  <Icon name="Search" className="cim-mat-search-icon" />
                  <input
                    type="text" className="cim-mat-search-input"
                    placeholder="Tìm tên hoặc mã NVL..."
                    value={materialSearch}
                    onChange={(e) => setMaterialSearch(e.target.value)}
                  />
                  {materialSearch && (
                    <div className="cim-mat-dropdown">
                      {filteredMaterials.length === 0 ? (
                        <div className="cim-mat-dropdown__empty">Không tìm thấy</div>
                      ) : filteredMaterials.slice(0, 8).map((m) => (
                        <div
                          key={m.id}
                          className="cim-mat-dropdown__item"
                          onClick={() => addLine(m)}
                        >
                          <span className="cim-mat-dropdown__code">{m.code ?? "—"}</span>
                          <span className="cim-mat-dropdown__name">{m.name}</span>
                          <span className="cim-mat-dropdown__unit">{m.unitName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Detail lines ── */}
              {lines.length > 0 && (
                <div className="cim-lines">
                  <table className="cim-lines-table">
                    <thead>
                      <tr>
                        <th>Tên NVL</th>
                        <th>Đơn vị</th>
                        <th>Số lượng *</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                        <th>Ghi chú</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l) => (
                        <tr key={l._key}>
                          <td>
                            <div className="cim-line-name">{l._materialName}</div>
                          </td>
                          <td className="text-center">{l._unitName || "—"}</td>
                          <td>
                            <input
                              type="number" min={0} className="cim-line-input"
                              value={l.quantity || ""}
                              onChange={(e) => updateLine(l._key, "quantity", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number" min={0} className="cim-line-input"
                              value={l.price || ""}
                              onChange={(e) => updateLine(l._key, "price", e.target.value)}
                            />
                          </td>
                          <td className="text-right cim-line-amount">
                            {((l.quantity ?? 0) * (l.price ?? 0)).toLocaleString("vi")} đ
                          </td>
                          <td>
                            <input
                              type="text" className="cim-line-input cim-line-note"
                              placeholder="Ghi chú..."
                              value={l.note ?? ""}
                              onChange={(e) => updateLine(l._key, "note", e.target.value)}
                            />
                          </td>
                          <td>
                            <button type="button" className="cim-remove-btn" onClick={() => removeLine(l._key)}>
                              <Icon name="Trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="cim-total-label">Tổng tiền:</td>
                        <td className="cim-total-val">{totalAmount.toLocaleString("vi")} đ</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {lines.length === 0 && (
                <div className="cim-empty-lines">
                  <Icon name="Package" />
                  <span>Chưa có nguyên vật liệu nào. Tìm kiếm và thêm ở trên.</span>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter
          actions={{
            actions_right: {
              buttons: [
                {
                  title: "Hủy", color: "primary", variant: "outline",
                  disabled: isSubmit, callback: handleClose,
                },
                {
                  title: "Tạo phiếu nhập", type: "button", color: "primary",
                  disabled: isSubmit || !lines.length || !warehouseId,
                  is_loading: isSubmit,
                  callback: onSubmit,
                },
              ],
            },
          }}
        />
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

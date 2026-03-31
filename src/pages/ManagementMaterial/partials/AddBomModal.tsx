import React, { Fragment, useState, useEffect, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import Badge from "components/badge/badge";
import { showToast } from "utils/common";
import { IBomResponse, IBomIngredient } from "@/model/material/BomModel";
import { IMaterialResponse } from "@/model/material/MaterialResponseModel";
import { BomService } from "@/services/MaterialService";
import MaterialService from "@/services/MaterialService";
import { MOCK_MATERIAL_LIST } from "@/assets/mock/Material";
import "./AddBomModal.scss";

interface Props {
  isOpen: boolean;
  data: IBomResponse | null; // null = create
  onClose: () => void;
  onSuccess: () => void;
}

interface IngredientLine extends IBomIngredient {
  _key: string;
}

const STATUS_OPTS = [
  { value: 1, label: "Đang sử dụng" },
  { value: 2, label: "Bản nháp" },
  { value: 3, label: "Ngừng dùng" },
];

export default function AddBomModal({ isOpen, data, onClose, onSuccess }: Props) {
  const isEdit = !!data?.id;

  const [isSubmit, setIsSubmit]     = useState(false);
  const [productName, setProductName] = useState("");
  const [code, setCode]             = useState("");
  const [outputQty, setOutputQty]   = useState<string>("");
  const [outputUnit, setOutputUnit] = useState("");
  const [version, setVersion]       = useState("v1.0");
  const [note, setNote]             = useState("");
  const [status, setStatus]         = useState(1);
  const [lines, setLines]           = useState<IngredientLine[]>([]);
  const [matSearch, setMatSearch]   = useState("");
  const [materials, setMaterials]   = useState<IMaterialResponse[]>(MOCK_MATERIAL_LIST);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // Load materials
  useEffect(() => {
    if (!isOpen) return;
    MaterialService.list({ limit: 200, page: 1 })
      .then((res) => { if (res?.code === 0 && res.result?.items?.length) setMaterials(res.result.items); })
      .catch(() => {});
  }, [isOpen]);

  // Populate from data
  useEffect(() => {
    if (!isOpen) {
      setProductName(""); setCode(""); setOutputQty(""); setOutputUnit("");
      setVersion("v1.0"); setNote(""); setStatus(1); setLines([]); setIsSubmit(false);
      return;
    }
    if (data) {
      setProductName(data.productName ?? "");
      setCode(data.code ?? "");
      setOutputQty(String(data.outputQty ?? ""));
      setOutputUnit(data.outputUnit ?? "");
      setVersion(data.version ?? "v1.0");
      setNote(data.note ?? "");
      setStatus(data.status ?? 1);
      setLines((data.ingredients ?? []).map((ing, i) => ({
        ...ing, _key: `${ing.materialId}-${i}`,
      })));
    }
  }, [isOpen, data]);

  const filteredMats = useMemo(() => {
    const q = matSearch.toLowerCase();
    return q ? materials.filter((m) =>
      m.name.toLowerCase().includes(q) || (m.code ?? "").toLowerCase().includes(q)
    ) : materials;
  }, [materials, matSearch]);

  const addIngredient = (mat: IMaterialResponse) => {
    if (lines.some((l) => l.materialId === mat.id)) {
      showToast("Nguyên vật liệu này đã có trong công thức", "warning");
      return;
    }
    setLines((prev) => [...prev, {
      _key: `${mat.id}-${Date.now()}`,
      materialId:   mat.id,
      materialCode: mat.code,
      materialName: mat.name,
      unitName:     mat.unitName,
      quantity:     0,
    }]);
    setMatSearch("");
  };

  const updateLine = (key: string, field: "quantity" | "note", value: string) => {
    setLines((prev) => prev.map((l) =>
      l._key === key ? { ...l, [field]: field === "quantity" ? parseFloat(value) || 0 : value } : l
    ));
  };

  const removeLine = (key: string) => setLines((prev) => prev.filter((l) => l._key !== key));

  const validate = () => {
    if (!productName.trim()) { showToast("Tên thành phẩm là bắt buộc", "error"); return false; }
    if (!lines.length)       { showToast("Cần có ít nhất 1 nguyên liệu", "error"); return false; }
    for (const l of lines) {
      if (!l.quantity || l.quantity <= 0) {
        showToast(`Số lượng của "${l.materialName}" phải lớn hơn 0`, "error");
        return false;
      }
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setIsSubmit(true);

    const body = {
      id:          data?.id,
      code:        code || undefined,
      productName: productName.trim(),
      outputQty:   parseFloat(outputQty) || 1,
      outputUnit:  outputUnit || undefined,
      version:     version || "v1.0",
      note:        note || undefined,
      status,
      details: lines.map((l) => ({
        materialId:   l.materialId,
        materialCode: l.materialCode,
        materialName: l.materialName,
        quantity:     l.quantity,
        unitName:     l.unitName,
        note:         l.note,
      })),
    };

    const res = await BomService.update(body);
    if (res?.code === 0) {
      showToast(`${isEdit ? "Cập nhật" : "Thêm"} công thức thành công`, "success");
      onSuccess();
    } else {
      showToast(res?.message ?? "Có lỗi xảy ra", "error");
      setIsSubmit(false);
    }
  };

  const handleClose = () => {
    const isDirty = productName || lines.length || note;
    if (isDirty && !isEdit) {
      setContentDialog({
        color: "warning", isCentered: true, isLoading: false,
        title: "Hủy thao tác",
        message: "Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.",
        cancelText: "Quay lại",
        cancelAction: () => { setShowDialog(false); setContentDialog(null); },
        defaultText: "Xác nhận",
        defaultAction: () => { setShowDialog(false); setContentDialog(null); onClose(); },
      });
      setShowDialog(true);
    } else { onClose(); }
  };

  return (
    <Fragment>
      <Modal isFade isOpen={isOpen} isCentered={false} staticBackdrop toggle={handleClose}
        className="modal-add-bom" style={{ maxWidth: "820px" }}>
        <ModalHeader title={`${isEdit ? "Chỉnh sửa" : "Thêm"} công thức sản xuất (BOM)`} toggle={handleClose} />
        <ModalBody>
          <div className="bom-modal-layout">
            {/* Basic info */}
            <div className="bom-modal-row">
              <div className="bom-modal-field bom-modal-field--grow">
                <label className="bom-modal-label">Tên thành phẩm <span className="required">*</span></label>
                <input className="bom-modal-input" type="text" placeholder="VD: Viên nén Paracetamol 500mg"
                  value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>
              <div className="bom-modal-field bom-modal-field--sm">
                <label className="bom-modal-label">Mã công thức</label>
                <input className="bom-modal-input" type="text" placeholder="VD: CT-001"
                  value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
            </div>

            <div className="bom-modal-row">
              <div className="bom-modal-field">
                <label className="bom-modal-label">Sản lượng / mẻ</label>
                <input className="bom-modal-input" type="number" min={0}
                  placeholder="VD: 1000" value={outputQty}
                  onChange={(e) => setOutputQty(e.target.value)} />
              </div>
              <div className="bom-modal-field">
                <label className="bom-modal-label">Đơn vị thành phẩm</label>
                <input className="bom-modal-input" type="text" placeholder="VD: Viên, Lít, Tuýp..."
                  value={outputUnit} onChange={(e) => setOutputUnit(e.target.value)} />
              </div>
              <div className="bom-modal-field">
                <label className="bom-modal-label">Phiên bản</label>
                <input className="bom-modal-input" type="text" placeholder="v1.0"
                  value={version} onChange={(e) => setVersion(e.target.value)} />
              </div>
              <div className="bom-modal-field">
                <label className="bom-modal-label">Trạng thái</label>
                <select className="bom-modal-select" value={status} onChange={(e) => setStatus(Number(e.target.value))}>
                  {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="bom-modal-field">
              <label className="bom-modal-label">Ghi chú</label>
              <input className="bom-modal-input" type="text" placeholder="Ghi chú về công thức..."
                value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            {/* Ingredient search */}
            <div className="bom-modal-field">
              <label className="bom-modal-label">Thêm nguyên vật liệu</label>
              <div className="bom-mat-search-wrap">
                <Icon name="Search" className="bom-mat-search-icon" />
                <input className="bom-mat-search-input" type="text"
                  placeholder="Tìm tên hoặc mã NVL..."
                  value={matSearch} onChange={(e) => setMatSearch(e.target.value)} />
                {matSearch && (
                  <div className="bom-mat-dropdown">
                    {filteredMats.length === 0 ? (
                      <div className="bom-mat-dropdown__empty">Không tìm thấy</div>
                    ) : filteredMats.slice(0, 8).map((m) => (
                      <div key={m.id} className="bom-mat-dropdown__item" onClick={() => addIngredient(m)}>
                        <span className="bom-mat-dropdown__code">{m.code ?? "—"}</span>
                        <span className="bom-mat-dropdown__name">{m.name}</span>
                        <span className="bom-mat-dropdown__unit">{m.unitName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ingredient table */}
            {lines.length > 0 ? (
              <table className="bom-ing-table">
                <thead>
                  <tr>
                    <th>STT</th><th>Tên NVL</th><th>Mã NVL</th>
                    <th>Số lượng *</th><th>Đơn vị</th><th>Ghi chú</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={l._key}>
                      <td className="text-center">{i + 1}</td>
                      <td><strong>{l.materialName}</strong></td>
                      <td className="text-center">{l.materialCode ?? "—"}</td>
                      <td>
                        <input type="number" min={0} className="bom-ing-input"
                          value={l.quantity || ""}
                          onChange={(e) => updateLine(l._key, "quantity", e.target.value)} />
                      </td>
                      <td className="text-center">{l.unitName ?? "—"}</td>
                      <td>
                        <input type="text" className="bom-ing-input bom-ing-note"
                          placeholder="Ghi chú..." value={l.note ?? ""}
                          onChange={(e) => updateLine(l._key, "note", e.target.value)} />
                      </td>
                      <td>
                        <button type="button" className="bom-remove-btn" onClick={() => removeLine(l._key)}>
                          <Icon name="Trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="bom-ing-empty">
                <Icon name="Layers" />
                <span>Chưa có nguyên liệu nào. Tìm kiếm và thêm ở trên.</span>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter
          actions={{
            actions_right: {
              buttons: [
                { title: "Hủy", color: "primary", variant: "outline", disabled: isSubmit, callback: handleClose },
                {
                  title: isEdit ? "Cập nhật" : "Tạo công thức",
                  type: "button", color: "primary",
                  disabled: isSubmit || !productName.trim() || !lines.length,
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

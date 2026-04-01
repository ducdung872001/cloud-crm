import React, { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import { IBomResponse } from "@/model/material/BomModel";
import { IProductionOrderCreateRequest } from "@/model/material/ProductionOrderModel";
import { BomService, ProductionOrderService } from "@/services/MaterialService";
import { urlsApi } from "@/configs/urls";
import { convertParamsToString } from "reborn-util";

interface VariantItem {
  id: number;
  productId: number;
  sku?: string;
  productName?: string;
  unitName?: string;
}

interface MaterialLine {
  materialId: number;
  materialCode?: string;
  materialName: string;
  unitName?: string;
  plannedQty: number;
  _key: string;
}

const WAREHOUSE_OPTIONS = [
  { value: 1, label: "Kho A" },
  { value: 2, label: "Kho B" },
  { value: 3, label: "Kho lạnh" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProductionOrderModal({ isOpen, onClose, onSuccess }: Props) {
  const [isSubmit, setIsSubmit] = useState(false);

  // BOM search
  const [bomSearch, setBomSearch]     = useState("");
  const [bomList, setBomList]         = useState<IBomResponse[]>([]);
  const [selectedBom, setSelectedBom] = useState<IBomResponse | null>(null);
  const [showBomDrop, setShowBomDrop] = useState(false);

  // Form fields
  const [plannedQty, setPlannedQty]         = useState("1");
  const [materialWarehouseId, setMatWh]     = useState<number | "">("");
  const [productWarehouseId,  setProdWh]    = useState<number | "">("");
  const [plannedDate, setPlannedDate]       = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote]                     = useState("");

  // Liên kết product_variant
  const [variantSearch, setVariantSearch]   = useState("");
  const [variantList, setVariantList]       = useState<VariantItem[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<VariantItem | null>(null);
  const [showVarDrop, setShowVarDrop]       = useState(false);

  // NVL lines (tự động load từ BOM, có thể điều chỉnh)
  const [lines, setLines] = useState<MaterialLine[]>([]);

  const [showDialog, setShowDialog]     = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setBomSearch(""); setSelectedBom(null); setBomList([]);
      setPlannedQty("1"); setMatWh(""); setProdWh("");
      setPlannedDate(new Date().toISOString().slice(0, 10));
      setNote(""); setVariantSearch(""); setSelectedVariant(null);
      setVariantList([]); setLines([]); setIsSubmit(false);
    }
  }, [isOpen]);

  // BOM search debounce
  useEffect(() => {
    if (!bomSearch.trim()) { setBomList([]); setShowBomDrop(false); return; }
    const t = setTimeout(() => {
      BomService.list({ keyword: bomSearch, limit: 8, page: 1, status: 1 })
        .then((res) => {
          if (res?.code === 0) {
            setBomList(res.result?.items ?? []);
            setShowBomDrop(true);
          }
        });
    }, 300);
    return () => clearTimeout(t);
  }, [bomSearch]);

  // Khi chọn BOM → tự động load NVL ingredients
  const handleSelectBom = useCallback(async (bom: IBomResponse) => {
    setSelectedBom(bom);
    setBomSearch(bom.productName);
    setShowBomDrop(false);

    // Load full detail để lấy ingredients
    try {
      const res = await BomService.get(bom.id);
      if (res?.code === 0 && res.result?.ingredients) {
        const planned = parseFloat(plannedQty) || 1;
        setLines(res.result.ingredients.map((ing: any, i: number) => ({
          materialId:   ing.materialId,
          materialCode: ing.materialCode,
          materialName: ing.materialName,
          unitName:     ing.unitName,
          plannedQty:   (ing.quantity ?? 0) * planned,
          _key:         `${ing.materialId}-${i}`,
        })));
      }
    } catch {}

    // Nếu BOM đã có product_variant_id, auto-fill
    if ((bom as any).productVariantId) {
      setSelectedVariant({
        id:          (bom as any).productVariantId,
        productId:   (bom as any).productId ?? 0,
        sku:         (bom as any).productSku,
        productName: bom.productName,
      });
    }
  }, [plannedQty]);

  // Khi thay đổi plannedQty → rescale NVL
  useEffect(() => {
    if (!selectedBom || lines.length === 0) return;
    const factor = parseFloat(plannedQty) || 1;
    // Recalculate from BOM ratio: plannedQty = ingredient.quantity * batches
    BomService.get(selectedBom.id).then((res) => {
      if (res?.code === 0 && res.result?.ingredients) {
        setLines(res.result.ingredients.map((ing: any, i: number) => ({
          materialId:   ing.materialId,
          materialCode: ing.materialCode,
          materialName: ing.materialName,
          unitName:     ing.unitName,
          plannedQty:   (ing.quantity ?? 0) * factor,
          _key:         `${ing.materialId}-${i}`,
        })));
      }
    });
  }, [plannedQty]);

  // Variant search debounce
  useEffect(() => {
    if (!variantSearch.trim()) { setVariantList([]); setShowVarDrop(false); return; }
    const t = setTimeout(() => {
      fetch(`${urlsApi.productImport.variantList}${convertParamsToString({
        keyword: variantSearch, limit: 8, page: 1
      })}`, { method: "GET" })
        .then((r) => r.json())
        .then((res) => {
          if (res?.code === 0) {
            const items = res.result?.items ?? res.result ?? [];
            setVariantList(items.slice(0, 8));
            setShowVarDrop(true);
          }
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [variantSearch]);

  const updateLineQty = (key: string, val: string) => {
    setLines((prev) => prev.map((l) =>
      l._key === key ? { ...l, plannedQty: parseFloat(val) || 0 } : l
    ));
  };

  const removeLine = (key: string) => {
    setLines((prev) => prev.filter((l) => l._key !== key));
  };

  const totalOutputQty = useMemo(() => {
    if (!selectedBom) return 0;
    const batches = parseFloat(plannedQty) || 1;
    return batches * (selectedBom.outputQty ?? 1);
  }, [selectedBom, plannedQty]);

  const validate = () => {
    if (!selectedBom) { showToast("Vui lòng chọn công thức BOM", "error"); return false; }
    if (!plannedQty || parseFloat(plannedQty) <= 0) {
      showToast("Số mẻ phải lớn hơn 0", "error"); return false;
    }
    if (!materialWarehouseId) { showToast("Vui lòng chọn kho xuất NVL", "error"); return false; }
    if (!productWarehouseId && selectedVariant) {
      showToast("Vui lòng chọn kho nhập thành phẩm", "error"); return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setIsSubmit(true);

    const body: IProductionOrderCreateRequest = {
      bomId:               selectedBom!.id,
      bomCode:             selectedBom!.code,
      productId:           selectedVariant?.productId,
      productVariantId:    selectedVariant?.id,
      productName:         selectedBom!.productName,
      productSku:          selectedVariant?.sku,
      plannedQty:          parseFloat(plannedQty),
      outputQtyPerBatch:   selectedBom!.outputQty ?? 1,
      outputUnit:          selectedBom!.outputUnit,
      materialWarehouseId: materialWarehouseId as number,
      productWarehouseId:  productWarehouseId as number || undefined,
      plannedDate,
      note: note || undefined,
      materials: lines.map((l) => ({
        materialId:   l.materialId,
        materialCode: l.materialCode,
        materialName: l.materialName,
        unitName:     l.unitName,
        plannedQty:   l.plannedQty,
      })),
    };

    const res = await ProductionOrderService.create(body);
    if (res?.code === 0) {
      showToast("Tạo lệnh sản xuất thành công", "success");
      onSuccess();
    } else {
      showToast(res?.message ?? "Có lỗi xảy ra", "error");
      setIsSubmit(false);
    }
  };

  const handleClose = () => {
    if (selectedBom || lines.length) {
      setContentDialog({
        color: "warning", isCentered: true, isLoading: false,
        title: "Hủy tạo lệnh",
        message: "Dữ liệu đã nhập sẽ bị mất. Bạn có chắc chắn muốn hủy?",
        cancelText: "Quay lại",
        cancelAction: () => { setShowDialog(false); setContentDialog(null); },
        defaultText: "Xác nhận hủy",
        defaultAction: () => { setShowDialog(false); setContentDialog(null); onClose(); },
      });
      setShowDialog(true);
    } else onClose();
  };

  // ── Styles ──
  const S = {
    field:  { marginBottom: "1.4rem" } as React.CSSProperties,
    label:  { display: "block", fontSize: "1.2rem", fontWeight: 600,
              color: "#1e293b", marginBottom: "0.5rem" } as React.CSSProperties,
    input:  { width: "100%", height: "3.8rem", padding: "0 1.2rem",
              border: "1px solid #e2e8f0", borderRadius: "0.6rem",
              fontSize: "1.3rem", color: "#1e293b", background: "#ffffff",
              outline: "none", boxSizing: "border-box" as const },
    select: { width: "100%", height: "3.8rem", padding: "0 1.2rem",
              border: "1px solid #e2e8f0", borderRadius: "0.6rem",
              fontSize: "1.3rem", color: "#1e293b", background: "#ffffff",
              outline: "none", boxSizing: "border-box" as const },
    row2:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" } as React.CSSProperties,
    row3:   { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.2rem" } as React.CSSProperties,
    dropWrap: { position: "relative" } as React.CSSProperties,
    dropdown: { position: "absolute", zIndex: 2000, top: "calc(100% + 4px)",
                left: 0, right: 0, background: "#ffffff",
                border: "1px solid #e2e8f0", borderRadius: "0.6rem",
                boxShadow: "0 4px 16px rgba(0,0,0,.10)",
                maxHeight: "22rem", overflowY: "auto" as const },
    dropItem: { display: "flex", alignItems: "center", gap: "0.8rem",
                padding: "0.8rem 1.2rem", cursor: "pointer",
                fontSize: "1.3rem", color: "#1e293b",
                borderBottom: "1px solid #f1f5f9" },
  };

  return (
    <Fragment>
      <Modal isFade isOpen={isOpen} isCentered={false} staticBackdrop toggle={handleClose}
        style={{ maxWidth: "860px" }}>
        <ModalHeader title="Tạo lệnh sản xuất" toggle={handleClose} />
        <ModalBody>
          <div style={{ padding: "0.2rem 0" }}>

            {/* ── BOM Search ── */}
            <div style={S.field}>
              <label style={S.label}>Công thức (BOM) <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={S.dropWrap}>
                <div style={{ position: "relative" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
                    style={{ position: "absolute", left: "1rem", top: "50%",
                      transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    style={{ ...S.input, paddingLeft: "3.2rem",
                      borderColor: selectedBom ? "#015aa4" : "#e2e8f0" }}
                    placeholder="Tìm công thức theo tên thành phẩm..."
                    value={bomSearch}
                    onChange={(e) => { setBomSearch(e.target.value); setSelectedBom(null); setLines([]); }}
                    onFocus={() => { if (bomList.length) setShowBomDrop(true); }}
                    onBlur={() => setTimeout(() => setShowBomDrop(false), 150)}
                  />
                  {selectedBom && (
                    <span style={{ position: "absolute", right: "1rem", top: "50%",
                      transform: "translateY(-50%)", fontSize: "1.1rem",
                      color: "#016aa4", fontFamily: "monospace" }}>
                      ✓ {selectedBom.code}
                    </span>
                  )}
                </div>
                {showBomDrop && bomList.length > 0 && (
                  <div style={S.dropdown}>
                    {bomList.map((b) => (
                      <div key={b.id} style={S.dropItem}
                        onMouseDown={() => handleSelectBom(b)}>
                        <span style={{ fontFamily: "monospace", fontSize: "1.1rem",
                          color: "#015aa4", minWidth: "6rem" }}>{b.code}</span>
                        <span style={{ flex: 1 }}>{b.productName}</span>
                        <span style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
                          {b.outputQty} {b.outputUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Số mẻ + kho ── */}
            <div style={S.row3}>
              <div style={S.field}>
                <label style={S.label}>Số mẻ sản xuất <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={S.input} type="number" min={1} value={plannedQty}
                  onChange={(e) => setPlannedQty(e.target.value)} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Kho xuất NVL <span style={{ color: "#ef4444" }}>*</span></label>
                <select style={S.select} value={materialWarehouseId}
                  onChange={(e) => setMatWh(Number(e.target.value) || "")}>
                  <option value="">Chọn kho...</option>
                  {WAREHOUSE_OPTIONS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Kho nhập thành phẩm</label>
                <select style={S.select} value={productWarehouseId}
                  onChange={(e) => setProdWh(Number(e.target.value) || "")}>
                  <option value="">Chọn kho...</option>
                  {WAREHOUSE_OPTIONS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
            </div>

            {/* ── Sản lượng dự kiến + ngày SX ── */}
            {selectedBom && (
              <div style={{ ...S.row2, marginBottom: "1.4rem" }}>
                <div style={{ padding: "1rem 1.2rem", background: "#eff6ff",
                  border: "1px solid #bfdbfe", borderRadius: "0.6rem" }}>
                  <div style={{ fontSize: "1.1rem", color: "#64748b" }}>Sản lượng dự kiến</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#015aa4" }}>
                    {totalOutputQty.toLocaleString("vi")}
                    <span style={{ fontSize: "1.3rem", fontWeight: 500, marginLeft: "0.4rem" }}>
                      {selectedBom.outputUnit}
                    </span>
                  </div>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Ngày sản xuất</label>
                  <input style={S.input} type="date" value={plannedDate}
                    onChange={(e) => setPlannedDate(e.target.value)} />
                </div>
              </div>
            )}

            {/* ── Liên kết Product Variant ── */}
            <div style={S.field}>
              <label style={S.label}>
                Liên kết sản phẩm trong kho
                <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: "0.5rem" }}>
                  (tùy chọn — để nhập thành phẩm vào inventory)
                </span>
              </label>
              <div style={S.dropWrap}>
                <div style={{ position: "relative" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
                    style={{ position: "absolute", left: "1rem", top: "50%",
                      transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    style={{ ...S.input, paddingLeft: "3.2rem",
                      borderColor: selectedVariant ? "#015aa4" : "#e2e8f0" }}
                    placeholder="Tìm sản phẩm/SKU để liên kết..."
                    value={variantSearch || (selectedVariant ? `${selectedVariant.productName ?? ""} ${selectedVariant.sku ? `(${selectedVariant.sku})` : ""}` : "")}
                    onChange={(e) => { setVariantSearch(e.target.value); setSelectedVariant(null); }}
                    onFocus={() => setVariantSearch("")}
                    onBlur={() => setTimeout(() => setShowVarDrop(false), 150)}
                  />
                  {selectedVariant && (
                    <button type="button"
                      onClick={() => { setSelectedVariant(null); setVariantSearch(""); }}
                      style={{ position: "absolute", right: "1rem", top: "50%",
                        transform: "translateY(-50%)", background: "none", border: "none",
                        cursor: "pointer", color: "#94a3b8", fontSize: "1.6rem" }}>×</button>
                  )}
                </div>
                {showVarDrop && variantList.length > 0 && (
                  <div style={S.dropdown}>
                    {variantList.map((v) => (
                      <div key={v.id} style={S.dropItem}
                        onMouseDown={() => { setSelectedVariant(v); setVariantSearch(""); setShowVarDrop(false); }}>
                        <span style={{ flex: 1 }}>{v.productName}</span>
                        {v.sku && <span style={{ fontFamily: "monospace", fontSize: "1.1rem", color: "#015aa4" }}>{v.sku}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── NVL table ── */}
            {lines.length > 0 && (
              <div style={{ marginTop: "0.4rem" }}>
                <label style={{ ...S.label, marginBottom: "0.8rem" }}>
                  Nguyên vật liệu cần dùng
                  <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: "0.5rem" }}>
                    (tự động tính từ BOM × số mẻ — có thể điều chỉnh)
                  </span>
                </label>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "0.8rem", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1.3rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Mã", "Tên NVL", "Số lượng", "Đơn vị", ""].map((h, i) => (
                          <th key={i} style={{ padding: "0.8rem 1rem", textAlign: "left",
                            fontSize: "1.1rem", fontWeight: 600, color: "#94a3b8",
                            borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l) => (
                        <tr key={l._key}>
                          <td style={{ padding: "0.6rem 1rem", color: "#015aa4",
                            fontFamily: "monospace", fontSize: "1.1rem" }}>{l.materialCode ?? "—"}</td>
                          <td style={{ padding: "0.6rem 1rem", fontWeight: 600, color: "#1e293b" }}>
                            {l.materialName}
                          </td>
                          <td style={{ padding: "0.4rem 0.8rem" }}>
                            <input type="number" min={0}
                              value={l.plannedQty || ""}
                              onChange={(e) => updateLineQty(l._key, e.target.value)}
                              style={{ width: "9rem", height: "3rem", padding: "0 0.8rem",
                                border: "1px solid #e2e8f0", borderRadius: "0.4rem",
                                fontSize: "1.3rem", outline: "none", textAlign: "right" as const }} />
                          </td>
                          <td style={{ padding: "0.6rem 1rem", color: "#64748b" }}>{l.unitName}</td>
                          <td style={{ padding: "0.4rem 0.8rem" }}>
                            <button type="button" onClick={() => removeLine(l._key)}
                              style={{ background: "none", border: "none", cursor: "pointer",
                                color: "#94a3b8", padding: "0.3rem" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ghi chú */}
            <div style={{ ...S.field, marginTop: "1.4rem" }}>
              <label style={S.label}>Ghi chú</label>
              <input style={S.input} type="text" placeholder="Ghi chú cho lệnh sản xuất..."
                value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter
          actions={{
            actions_right: {
              buttons: [
                { title: "Hủy", color: "primary", variant: "outline",
                  disabled: isSubmit, callback: handleClose },
                { title: "Tạo lệnh sản xuất", type: "button", color: "primary",
                  disabled: isSubmit || !selectedBom || !materialWarehouseId,
                  is_loading: isSubmit, callback: onSubmit },
              ],
            },
          }}
        />
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

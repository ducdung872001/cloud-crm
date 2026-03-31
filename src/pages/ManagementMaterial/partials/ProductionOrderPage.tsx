import React, { useState, useEffect } from "react";
import Loading from "components/loading";
import Badge from "components/badge/badge";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import {
  IProductionOrderListItem,
  IProductionOrderDetail,
  IProductionOrderMaterial,
} from "@/model/material/ProductionOrderModel";
import { ProductionOrderService } from "@/services/MaterialService";

const C = {
  white:      "#ffffff",
  border:     "#e2e8f0",
  bgLight:    "#f8fafc",
  text:       "#1e293b",
  textMuted:  "#94a3b8",
  textSub:    "#64748b",
  primary:    "#015aa4",
  primaryBg:  "#eff6ff",
  primaryBdr: "#bfdbfe",
  green:      "#16a34a",
  greenBg:    "#f0fdf4",
  orange:     "#ea580c",
  orangeBg:   "#fff7ed",
  red:        "#dc2626",
  redBg:      "#fef2f2",
  redBdr:     "#fecaca",
  gray:       "#6b7280",
} as const;

const STATUS_CONFIG: Record<number, { label: string; variant: "success" | "warning" | "secondary" | "error" }> = {
  1: { label: "Nháp",           variant: "secondary" },
  2: { label: "Đang sản xuất",  variant: "warning"   },
  3: { label: "Hoàn thành",     variant: "success"   },
  4: { label: "Đã hủy",         variant: "error"     },
};

function formatDateTime(raw?: string | object): string {
  if (!raw) return "";
  try {
    const d = new Date(String(raw));
    if (isNaN(d.getTime())) return String(raw);
    const dd  = String(d.getDate()).padStart(2, "0");
    const mm  = String(d.getMonth() + 1).padStart(2, "0");
    const hh  = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`;
  } catch { return String(raw); }
}

interface Props {
  order: IProductionOrderListItem;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ProductionOrderDetailPanel({ order, onClose, onRefresh }: Props) {
  const [detail, setDetail]   = useState<IProductionOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog]   = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [confirmQty, setConfirmQty] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);
    ProductionOrderService.get(order.id)
      .then((res) => { if (res?.code === 0) setDetail(res.result); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [order.id]);

  const data = detail ?? order as IProductionOrderDetail;
  const status = data.status;
  const cfg = STATUS_CONFIG[status] ?? { label: "—", variant: "secondary" as const };

  const handleStart = () => {
    setContentDialog({
      color: "primary", isCentered: true, isLoading: true,
      title: "Bắt đầu sản xuất",
      message: `Bắt đầu thực hiện lệnh sản xuất ${data.code}?`,
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Bắt đầu",
      defaultAction: async () => {
        setShowDialog(false);
        const res = await ProductionOrderService.start(order.id);
        if (res?.code === 0) {
          showToast("Đã bắt đầu sản xuất", "success");
          onRefresh();
          // Reload detail
          ProductionOrderService.get(order.id).then((r) => { if (r?.code === 0) setDetail(r.result); });
        } else showToast(res?.message ?? "Có lỗi xảy ra", "error");
        setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  const handleConfirm = () => {
    const actualQty = confirmQty ? parseFloat(confirmQty) : undefined;
    setContentDialog({
      color: "primary", isCentered: true, isLoading: true,
      title: "Xác nhận hoàn thành",
      message: (
        <div>
          <p style={{ marginBottom: "1rem" }}>
            Xác nhận hoàn thành sẽ:
          </p>
          <ul style={{ paddingLeft: "1.4rem", lineHeight: 1.8, color: C.textSub }}>
            <li>Xuất NVL ra khỏi kho nguyên liệu</li>
            <li>Nhập thành phẩm vào kho sản phẩm</li>
            <li>Cập nhật tồn kho thực tế</li>
          </ul>
          <p style={{ marginTop: "1rem", color: C.orange, fontWeight: 600 }}>
            Hành động này không thể hoàn tác!
          </p>
        </div>
      ),
      cancelText: "Kiểm tra lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận hoàn thành",
      defaultAction: async () => {
        setShowDialog(false);
        const res = await ProductionOrderService.confirm(order.id, actualQty);
        if (res?.code === 0) {
          showToast("Hoàn thành sản xuất! Tồn kho đã được cập nhật", "success");
          onRefresh();
          ProductionOrderService.get(order.id).then((r) => { if (r?.code === 0) setDetail(r.result); });
        } else showToast(res?.message ?? "Có lỗi xảy ra", "error");
        setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  const handleCancel = () => {
    setContentDialog({
      color: "error", isCentered: true, isLoading: true,
      title: "Hủy lệnh sản xuất",
      message: `Hủy lệnh ${data.code}? Hành động này không thể hoàn tác.`,
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận hủy",
      defaultAction: async () => {
        setShowDialog(false);
        const res = await ProductionOrderService.cancel(order.id, "Hủy thủ công");
        if (res?.code === 0) {
          showToast("Đã hủy lệnh sản xuất", "success");
          onRefresh();
          ProductionOrderService.get(order.id).then((r) => { if (r?.code === 0) setDetail(r.result); });
        } else showToast(res?.message ?? "Có lỗi xảy ra", "error");
        setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  return (
    <>
      <div style={{ height: "100%", overflowY: "auto", background: C.white,
        display: "flex", flexDirection: "column", borderLeft: `1px solid ${C.border}` }}>

        {/* Header */}
        <div style={{ padding: "1.6rem 1.8rem 1.2rem", position: "relative",
          borderBottom: `1px solid ${C.border}`, background: C.white }}>
          <button onClick={onClose} type="button" style={{
            position: "absolute", top: "1.2rem", right: "1.2rem",
            background: C.bgLight, border: `1px solid ${C.border}`,
            color: C.textSub, width: "2.8rem", height: "2.8rem",
            borderRadius: "50%", cursor: "pointer", fontSize: "1.4rem",
            display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

          <div style={{ fontFamily: "monospace", fontSize: "1.2rem", color: C.primary,
            fontWeight: 700, marginBottom: "0.4rem" }}>{data.code}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: C.text,
            marginBottom: "0.8rem", lineHeight: 1.3, paddingRight: "3.5rem" }}>
            {data.productName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
            <Badge text={cfg.label} variant={cfg.variant} />
            {data.productSku && (
              <span style={{ fontFamily: "monospace", fontSize: "1.1rem",
                background: C.bgLight, border: `1px solid ${C.border}`,
                padding: "0.2rem 0.7rem", borderRadius: "0.3rem", color: C.textSub }}>
                {data.productSku}
              </span>
            )}
            {data.plannedDate && (
              <span style={{ fontSize: "1.1rem", color: C.textMuted }}>
                📅 {String(data.plannedDate)}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.bgLight }}>
          {[
            { val: `${data.plannedQty} mẻ`,        lbl: "Kế hoạch",      color: C.text    },
            { val: String(data.totalOutputQty ?? 0), lbl: `${data.outputUnit ?? "SP"} đầu ra`, color: C.primary },
            { val: String(detail?.materials?.length ?? order.totalOutputQty ?? 0),
              lbl: "Nguyên liệu", color: C.green },
          ].map((s, i, arr) => (
            <div key={i} style={{ flex: 1, padding: "1.1rem 0.6rem", textAlign: "center",
              borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color,
                lineHeight: 1, marginBottom: "0.3rem" }}>{s.val}</div>
              <div style={{ fontSize: "1.05rem", color: C.textMuted }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Material list */}
        <div style={{ fontSize: "1.05rem", fontWeight: 700, color: C.textMuted,
          textTransform: "uppercase", letterSpacing: "0.08em",
          padding: "1.2rem 1.6rem 0.6rem" }}>
          Nguyên vật liệu cần dùng
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 1.2rem 0.8rem" }}>
          {isLoading ? <Loading /> : (detail?.materials?.length ?? 0) > 0 ? (
            detail!.materials!.map((m, i) => {
              const isDone = m.consumedQty != null;
              return (
                <div key={m.materialId} style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "0.9rem 0.4rem", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: "2.4rem", height: "2.4rem", borderRadius: "50%",
                    background: isDone ? C.greenBg : C.primaryBg,
                    border: `1px solid ${isDone ? "#bbf7d0" : C.primaryBdr}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem", fontWeight: 700,
                    color: isDone ? C.green : C.primary, flexShrink: 0 }}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 600, color: C.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.materialName}
                    </div>
                    {m.materialCode && (
                      <div style={{ fontSize: "1.1rem", color: C.textMuted,
                        fontFamily: "monospace" }}>{m.materialCode}</div>
                    )}
                    {isDone && m.stockAfter != null && (
                      <div style={{ fontSize: "1.1rem", color: C.green }}>
                        Tồn sau: {m.stockAfter}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700,
                      color: isDone ? C.green : C.primary }}>
                      {isDone ? m.consumedQty : m.plannedQty}
                    </div>
                    <div style={{ fontSize: "1.1rem", color: C.textMuted }}>{m.unitName}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", color: C.textMuted,
              padding: "2rem", fontSize: "1.3rem" }}>Chưa có dữ liệu NVL</div>
          )}
        </div>

        {/* Actual output input — chỉ hiện khi đang sản xuất */}
        {status === 2 && (
          <div style={{ margin: "0 1.6rem 0.8rem", padding: "1rem",
            background: C.orangeBg, border: `1px solid #fed7aa`,
            borderRadius: "0.6rem" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 600, color: C.orange,
              marginBottom: "0.6rem" }}>
              Sản lượng thực tế (tùy chọn)
            </div>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <input
                type="number" min={0}
                value={confirmQty}
                onChange={(e) => setConfirmQty(e.target.value)}
                placeholder={`Kế hoạch: ${data.totalOutputQty} ${data.outputUnit ?? ""}`}
                style={{ flex: 1, height: "3.6rem", padding: "0 1rem",
                  border: `1px solid #fed7aa`, borderRadius: "0.5rem",
                  fontSize: "1.3rem", background: C.white, outline: "none" }}
              />
              <span style={{ fontSize: "1.2rem", color: C.textSub }}>{data.outputUnit}</span>
            </div>
          </div>
        )}

        {/* Note */}
        {data.note && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem",
            margin: "0 1.6rem 0.8rem", padding: "0.8rem 1rem",
            background: C.bgLight, border: `1px solid ${C.border}`,
            borderRadius: "0.6rem", fontSize: "1.2rem", color: C.textSub }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"
              style={{ flexShrink: 0, marginTop: "0.1rem" }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{data.note}</span>
          </div>
        )}

        {/* Dates */}
        <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap",
          padding: "0 1.6rem 0.8rem", fontSize: "1.1rem", color: C.textMuted }}>
          {data.createdTime && <span>Tạo: {formatDateTime(data.createdTime)}</span>}
          {detail?.updatedTime && <span>Cập nhật: {formatDateTime(detail.updatedTime)}</span>}
        </div>

        {/* Actions */}
        {(status === 1 || status === 2) && (
          <div style={{ padding: "1.2rem 1.6rem",
            borderTop: `1px solid ${C.border}`, marginTop: "auto",
            display: "flex", flexDirection: "column", gap: "0.8rem" }}>

            {status === 1 && (
              <button onClick={handleStart} style={{
                width: "100%", padding: "0.9rem", borderRadius: "0.6rem",
                border: "none", background: C.primary, color: C.white,
                fontSize: "1.3rem", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Bắt đầu sản xuất
              </button>
            )}

            {status === 2 && (
              <button onClick={handleConfirm} style={{
                width: "100%", padding: "0.9rem", borderRadius: "0.6rem",
                border: "none", background: C.green, color: C.white,
                fontSize: "1.3rem", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Xác nhận hoàn thành
              </button>
            )}

            <button onClick={handleCancel} style={{
              width: "100%", padding: "0.8rem", borderRadius: "0.6rem",
              border: `1.5px solid ${C.redBdr}`, background: C.white, color: C.red,
              fontSize: "1.2rem", fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Hủy lệnh
            </button>
          </div>
        )}
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </>
  );
}
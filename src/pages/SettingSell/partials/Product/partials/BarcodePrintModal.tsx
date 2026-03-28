import React, { useState, useRef, useEffect } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./BarcodePrintModal.scss";

// ── Barcode renderer (Code128 / EAN-13 — dùng thuật toán đơn giản render SVG bars) ──
// Dùng thư viện JsBarcode nếu có, fallback về SVG bars đơn giản
function BarcodeImage({ value, width = 200, height = 50 }: { value: string; width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    try {
      // Dùng JsBarcode nếu có trong window
      if ((window as any).JsBarcode) {
        (window as any).JsBarcode(canvasRef.current, value, {
          format: value.length === 13 ? "EAN13" : "CODE128",
          width: 1.5,
          height: height,
          displayValue: false,
          margin: 0,
        });
      }
    } catch (_) {}
  }, [value, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", maxWidth: width, display: "block" }}
    />
  );
}

// ── Types ──
interface VariantInfo {
  id: number;
  label: string;
  sku: string;
  barcode: string;
  price: number | string;
  unitName?: string;
}

interface BarcodeLabel {
  variantId: number;
  variantLabel: string;
  sku: string;
  barcode: string;
  price: number | string;
  productName: string;
  quantity: number;
}

interface PrintConfig {
  paperSize: "A4" | "58mm" | "80mm";
  showProductName: boolean;
  showVariantLabel: boolean;
  showBarcode: boolean;
  showPrice: boolean;
  showSku: boolean;
  labelsPerRow: number;
}

const PAPER_SIZES = [
  { value: "A4",   label: "A4 — nhiều nhãn/trang", cols: 4, labelW: 42, labelH: 25 },
  { value: "58mm", label: "Thermal 58mm",           cols: 1, labelW: 50, labelH: 30 },
  { value: "80mm", label: "Thermal 80mm",           cols: 1, labelW: 72, labelH: 35 },
];

interface BarcodePrintModalProps {
  onShow: boolean;
  onHide: () => void;
  productName: string;
  variants: VariantInfo[];
}

export default function BarcodePrintModal({ onShow, onHide, productName, variants }: BarcodePrintModalProps) {
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const [config, setConfig] = useState<PrintConfig>({
    paperSize: "A4",
    showProductName: true,
    showVariantLabel: true,
    showBarcode: true,
    showPrice: true,
    showSku: false,
    labelsPerRow: 4,
  });

  // Mỗi biến thể: số lượng nhãn cần in
  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    Object.fromEntries(variants.map((v) => [v.id, 1]))
  );

  const setQty = (id: number, val: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, val) }));

  const setCfg = (key: keyof PrintConfig, val: any) =>
    setConfig((prev) => ({ ...prev, [key]: val }));

  // Khi đổi paperSize → cập nhật labelsPerRow tương ứng
  const handlePaperSize = (size: "A4" | "58mm" | "80mm") => {
    const ps = PAPER_SIZES.find((p) => p.value === size)!;
    setConfig((prev) => ({ ...prev, paperSize: size, labelsPerRow: ps.cols }));
  };

  // Build danh sách nhãn (expand theo quantity)
  const buildLabels = (): BarcodeLabel[] => {
    const labels: BarcodeLabel[] = [];
    for (const v of variants) {
      const qty = quantities[v.id] ?? 1;
      for (let i = 0; i < qty; i++) {
        labels.push({
          variantId: v.id,
          variantLabel: v.label,
          sku: v.sku,
          barcode: v.barcode,
          price: v.price,
          productName,
          quantity: qty,
        });
      }
    }
    return labels;
  };

  const totalLabels = buildLabels().length;
  const ps = PAPER_SIZES.find((p) => p.value === config.paperSize)!;

  // ── Format giá ──
  const fmtPrice = (p: number | string) => {
    const n = typeof p === "string" ? parseFloat(p) : p;
    if (!n || isNaN(n)) return "";
    return n.toLocaleString("vi-VN") + "đ";
  };

  // ── Render 1 nhãn (dùng cho cả preview và print HTML) ──
  const renderLabelHtml = (label: BarcodeLabel, forPrint = false): string => {
    const barcodeImg = label.barcode
      ? `<div class="bl-barcode" id="bc-${label.variantId}-${Math.random().toString(36).slice(2)}">
           <canvas data-barcode="${label.barcode}"></canvas>
           <div class="bl-barcode-val">${label.barcode}</div>
         </div>`
      : "";

    return `
      <div class="barcode-label" style="width:${ps.labelW}mm; min-height:${ps.labelH}mm">
        ${config.showProductName ? `<div class="bl-name">${label.productName}</div>` : ""}
        ${config.showVariantLabel && label.variantLabel && label.variantLabel !== "Mac dinh"
          ? `<div class="bl-variant">${label.variantLabel}</div>` : ""}
        ${config.showBarcode ? barcodeImg : ""}
        <div class="bl-footer">
          ${config.showPrice ? `<div class="bl-price">${fmtPrice(label.price)}</div>` : ""}
          ${config.showSku && label.sku ? `<div class="bl-sku">${label.sku}</div>` : ""}
        </div>
      </div>
    `;
  };

  // ── Thực hiện in ──
  const handlePrint = () => {
    const labels = buildLabels();
    if (!labels.length) return;

    const labelsHtml = labels.map((l) => renderLabelHtml(l, true)).join("");

    const jsbarcodeScript = `
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
      <script>
        window.onload = function() {
          document.querySelectorAll('[data-barcode]').forEach(function(canvas) {
            try {
              JsBarcode(canvas, canvas.getAttribute('data-barcode'), {
                format: canvas.getAttribute('data-barcode').length === 13 ? 'EAN13' : 'CODE128',
                width: 1.5, height: 40, displayValue: false, margin: 0
              });
            } catch(e) {}
          });
          setTimeout(function() { window.print(); }, 800);
        };
      </script>
    `;

    const colsStyle =
      config.paperSize === "A4"
        ? `display:grid; grid-template-columns: repeat(${config.labelsPerRow}, 1fr); gap:2mm;`
        : `display:flex; flex-direction:column; gap:1mm;`;

    const pageStyle =
      config.paperSize === "A4"
        ? `@page { size: A4; margin: 8mm; }`
        : `@page { size: ${config.paperSize} auto; margin: 2mm; }`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${pageStyle}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; }
    .labels-wrap { ${colsStyle} }
    .barcode-label {
      border: 0.3mm solid #ccc;
      padding: 1.5mm 2mm;
      display: flex; flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.8mm;
      page-break-inside: avoid;
      overflow: hidden;
    }
    .bl-name {
      font-size: 7pt; font-weight: bold;
      text-align: center; width: 100%;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .bl-variant {
      font-size: 6pt; color: #555;
      text-align: center;
    }
    .bl-barcode { text-align: center; width: 100%; }
    .bl-barcode canvas { max-width: 100%; height: auto; }
    .bl-barcode-val { font-size: 6pt; text-align: center; letter-spacing: 0.5px; }
    .bl-footer {
      display: flex; justify-content: space-between;
      align-items: center; width: 100%;
    }
    .bl-price { font-size: 8pt; font-weight: bold; color: #c00; }
    .bl-sku { font-size: 5.5pt; color: #888; }
    @media print {
      .barcode-label { border-color: #999; }
    }
  </style>
</head>
<body>
  <div class="labels-wrap">${labelsHtml}</div>
  ${jsbarcodeScript}
</body>
</html>`;

    const iframe = printFrameRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  };

  const labels = buildLabels();

  const footerActions = {
    actions_right: {
      buttons: [
        {
          title: "Đóng",
          color: "primary",
          variant: "outline",
          callback: onHide,
        },
        {
          title: `In ${totalLabels} nhãn`,
          color: "primary",
          disabled: totalLabels === 0,
          callback: handlePrint,
        },
      ],
    },
  };

  return (
    <>
      <Modal isOpen={onShow} isCentered staticBackdrop toggle={onHide} size="xl">
        <ModalHeader title="In mã vạch sản phẩm" toggle={onHide} />

        <ModalBody>
          <div className="bpm-layout">
            {/* ── LEFT: Cấu hình ── */}
            <div className="bpm-config">
              {/* Khổ giấy */}
              <div className="bpm-section">
                <div className="bpm-section__title">Khổ giấy / máy in</div>
                <div className="bpm-paper-options">
                  {PAPER_SIZES.map((ps) => (
                    <label
                      key={ps.value}
                      className={`bpm-paper-opt${config.paperSize === ps.value ? " bpm-paper-opt--active" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paperSize"
                        value={ps.value}
                        checked={config.paperSize === ps.value}
                        onChange={() => handlePaperSize(ps.value as any)}
                      />
                      <span className="bpm-paper-opt__label">{ps.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Nội dung nhãn */}
              <div className="bpm-section">
                <div className="bpm-section__title">Nội dung nhãn</div>
                {[
                  { key: "showProductName",   label: "Tên sản phẩm" },
                  { key: "showVariantLabel",  label: "Tên biến thể" },
                  { key: "showBarcode",       label: "Mã vạch (barcode)" },
                  { key: "showPrice",         label: "Giá bán" },
                  { key: "showSku",           label: "Mã SKU" },
                ].map(({ key, label }) => (
                  <label key={key} className="bpm-toggle-row">
                    <input
                      type="checkbox"
                      checked={!!config[key as keyof PrintConfig]}
                      onChange={(e) => setCfg(key as keyof PrintConfig, e.target.checked)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {/* Số cột (chỉ A4) */}
              {config.paperSize === "A4" && (
                <div className="bpm-section">
                  <div className="bpm-section__title">Số nhãn mỗi hàng</div>
                  <div className="bpm-cols-row">
                    {[2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        className={`bpm-col-btn${config.labelsPerRow === n ? " bpm-col-btn--active" : ""}`}
                        onClick={() => setCfg("labelsPerRow", n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Số lượng mỗi biến thể */}
              <div className="bpm-section">
                <div className="bpm-section__title">Số lượng nhãn cần in</div>
                <div className="bpm-variant-list">
                  {variants.map((v) => (
                    <div key={v.id} className="bpm-variant-row">
                      <div className="bpm-variant-row__info">
                        <div className="bpm-variant-row__label">
                          {v.label === "Mac dinh" ? "Mặc định" : v.label}
                        </div>
                        {v.barcode && (
                          <div className="bpm-variant-row__barcode">{v.barcode}</div>
                        )}
                      </div>
                      <div className="bpm-qty-ctrl">
                        <button onClick={() => setQty(v.id, (quantities[v.id] ?? 1) - 1)}>−</button>
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={quantities[v.id] ?? 1}
                          onChange={(e) => setQty(v.id, parseInt(e.target.value) || 1)}
                        />
                        <button onClick={() => setQty(v.id, (quantities[v.id] ?? 1) + 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Preview nhãn ── */}
            <div className="bpm-preview">
              <div className="bpm-preview__header">
                Xem trước nhãn &nbsp;
                <span className="bpm-preview__count">({totalLabels} nhãn)</span>
              </div>
              <div
                className="bpm-preview__labels"
                style={{ gridTemplateColumns: `repeat(${Math.min(config.labelsPerRow, 3)}, 1fr)` }}
              >
                {labels.slice(0, 12).map((l, i) => (
                  <div key={i} className="bpm-label-preview">
                    {config.showProductName && (
                      <div className="bpm-lp__name">{l.productName}</div>
                    )}
                    {config.showVariantLabel && l.variantLabel && l.variantLabel !== "Mac dinh" && (
                      <div className="bpm-lp__variant">{l.variantLabel}</div>
                    )}
                    {config.showBarcode && l.barcode && (
                      <div className="bpm-lp__barcode">
                        <div className="bpm-lp__barcode-bars">
                          {/* Simplified visual barcode bars */}
                          {Array.from({ length: 30 }, (_, idx) => (
                            <div
                              key={idx}
                              className="bpm-lp__bar"
                              style={{ width: idx % 3 === 0 ? "2px" : "1px", opacity: idx % 4 === 0 ? 0 : 1 }}
                            />
                          ))}
                        </div>
                        <div className="bpm-lp__barcode-val">{l.barcode}</div>
                      </div>
                    )}
                    <div className="bpm-lp__footer">
                      {config.showPrice && <span className="bpm-lp__price">{fmtPrice(l.price)}</span>}
                      {config.showSku && l.sku && <span className="bpm-lp__sku">{l.sku}</span>}
                    </div>
                  </div>
                ))}
                {labels.length > 12 && (
                  <div className="bpm-preview__more">+{labels.length - 12} nhãn nữa...</div>
                )}
              </div>
              <div className="bpm-preview__note">
                💡 Khi in, mã vạch thực sẽ được tạo tự động. Preview chỉ mang tính minh họa layout.
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter actions={footerActions as any} />
      </Modal>

      {/* Hidden iframe để in */}
      <iframe
        ref={printFrameRef}
        style={{ display: "none" }}
        title="print-frame"
      />
    </>
  );
}

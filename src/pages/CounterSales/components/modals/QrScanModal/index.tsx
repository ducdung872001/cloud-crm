import React, { useState, useEffect, useRef, useCallback } from "react";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import ProductService from "services/ProductService";
import { formatCurrency } from "reborn-util";
import "./index.scss";

interface ScannedProduct {
  id: number;
  variantId: number;
  name: string;
  barcode: string;
  sku: string;
  unitName: string;
  priceRetail: number;
  onHandQty: number;
}

interface QuickCreateForm {
  name: string;
  price: string;
  barcode: string;
}

interface QrScanModalProps {
  open: boolean;
  onClose: () => void;
  onAddToCart: (item: {
    id: string; variantId: string; name: string;
    price: number; priceLabel: string; unit: string;
    unitName: string; icon: string; qty: number;
  }) => void;
}

export default function QrScanModal({ open, onClose, onAddToCart }: QrScanModalProps) {
  const [inputCode, setInputCode]         = useState("");
  const [isSearching, setIsSearching]     = useState(false);
  const [found, setFound]                 = useState<ScannedProduct | null>(null);
  const [notFound, setNotFound]           = useState(false);
  const [scannedCode, setScannedCode]     = useState("");

  // Quick-create form (khi không tìm thấy)
  const [showCreate, setShowCreate]       = useState(false);
  const [createForm, setCreateForm]       = useState<QuickCreateForm>({ name: "", price: "", barcode: "" });
  const [createErrors, setCreateErrors]   = useState<Partial<QuickCreateForm>>({});
  const [isSaving, setIsSaving]           = useState(false);

  const inputRef  = useRef<HTMLInputElement>(null);
  const nameRef   = useRef<HTMLInputElement>(null);
  // Dùng để nhận tín hiệu từ máy quét barcode vật lý
  // Máy quét = gõ nhanh chuỗi ký tự + Enter (< 100ms/ký tự)
  const scanBuffer  = useRef("");
  const scanTimer   = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (open) {
      resetState();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const resetState = () => {
    setInputCode(""); setFound(null); setNotFound(false);
    setScannedCode(""); setShowCreate(false);
    setCreateForm({ name: "", price: "", barcode: "" });
    setCreateErrors({});
  };

  // ── Xử lý phím từ máy quét vật lý (nhận qua keydown toàn modal) ─────────
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    // Nếu đang focus input / form → không intercept
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (e.key === "Enter" && scanBuffer.current) {
      handleSearch(scanBuffer.current);
      scanBuffer.current = "";
      clearTimeout(scanTimer.current);
      return;
    }
    if (e.key.length === 1) {
      scanBuffer.current += e.key;
      clearTimeout(scanTimer.current);
      // Nếu sau 200ms không có ký tự mới → flush
      scanTimer.current = setTimeout(() => {
        if (scanBuffer.current) {
          setInputCode(scanBuffer.current);
          scanBuffer.current = "";
        }
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  // ── Tìm sản phẩm theo mã ────────────────────────────────────────────────
  const handleSearch = async (code?: string) => {
    const searchCode = (code ?? inputCode).trim();
    if (!searchCode) return;
    setIsSearching(true);
    setFound(null); setNotFound(false); setShowCreate(false);
    setScannedCode(searchCode);
    try {
      const res = await ProductService.wScan(searchCode);
      if (res.code === 0 && res.result?.id) {
        setFound(res.result);
      } else {
        setNotFound(true);
        // Điền sẵn barcode vào form tạo mới
        setCreateForm({ name: "", price: "", barcode: searchCode });
      }
    } catch {
      setNotFound(true);
      setCreateForm({ name: "", price: "", barcode: searchCode });
    } finally {
      setIsSearching(false);
    }
  };

  // ── Thêm vào giỏ ─────────────────────────────────────────────────────────
  const handleAddFound = () => {
    if (!found) return;
    onAddToCart({
      id:         String(found.id),
      variantId:  String(found.variantId),
      name:       found.name,
      price:      found.priceRetail,
      priceLabel: formatCurrency(found.priceRetail) + " ₫",
      unit:       found.unitName || "Cái",
      unitName:   found.unitName || "Cái",
      icon:       "📦",
      qty:        1,
    });
    onClose();
  };

  // ── Tạo sản phẩm mới nhanh rồi thêm vào giỏ ────────────────────────────
  const validateCreate = () => {
    const errs: Partial<QuickCreateForm> = {};
    if (!createForm.name.trim()) errs.name = "Vui lòng nhập tên sản phẩm";
    const priceNum = Number(createForm.price.replace(/[^0-9]/g, ""));
    if (!priceNum) errs.price = "Vui lòng nhập giá hợp lệ";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleQuickCreate = async () => {
    if (!validateCreate()) return;
    setIsSaving(true);
    const priceNum = Number(createForm.price.replace(/[^0-9]/g, ""));
    try {
      // Tạo SP mới qua API update (upsert, id=null → insert)
      const res = await ProductService.wUpdate({
        name:     createForm.name.trim(),
        status:   1,
        variants: [{
          barcode:      createForm.barcode,
          priceRetail:  priceNum,
          sku:          "",
          onHandQty:    0,
        }],
      });
      const newProduct = res?.result;
      onAddToCart({
        id:         newProduct?.id ? String(newProduct.id) : `quick_${Date.now()}`,
        variantId:  newProduct?.defaultVariantId ? String(newProduct.defaultVariantId) : `quick_v_${Date.now()}`,
        name:       createForm.name.trim(),
        price:      priceNum,
        priceLabel: formatCurrency(priceNum) + " ₫",
        unit:       "Cái",
        unitName:   "Cái",
        icon:       "🆕",
        qty:        1,
      });
      onClose();
    } catch {
      // Nếu API tạo thất bại → vẫn thêm vào giỏ dạng quick item
      onAddToCart({
        id:         `quick_${Date.now()}`,
        variantId:  `quick_v_${Date.now()}`,
        name:       createForm.name.trim(),
        price:      priceNum,
        priceLabel: formatCurrency(priceNum) + " ₫",
        unit:       "Cái", unitName: "Cái", icon: "⚡", qty: 1,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePriceInput = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    setCreateForm((f) => ({ ...f, price: digits ? Number(digits).toLocaleString("vi") : "" }));
  };

  return (
    <Modal isFade isOpen={open} isCentered staticBackdrop toggle={onClose} className="qr-modal">
      <ModalHeader title="📷 Quét mã sản phẩm" toggle={onClose} />

      <ModalBody>
        {/* ── Viewport máy quét ── */}
        {!found && !notFound && (
          <div className="qr-modal__viewport">
            <div className="qr-modal__frame">
              <div className="qr-modal__corner qr-modal__corner--tl" />
              <div className="qr-modal__corner qr-modal__corner--tr" />
              <div className="qr-modal__corner qr-modal__corner--bl" />
              <div className="qr-modal__corner qr-modal__corner--br" />
              <span className="qr-modal__camera-icon">{isSearching ? "⏳" : "📷"}</span>
              <div className="qr-modal__scan-line" />
            </div>
            <div className="qr-modal__hint">
              Đưa mã vạch vào khung hoặc nhập thủ công bên dưới
            </div>
          </div>
        )}

        {/* ── Input nhập thủ công (test không cần máy quét) ── */}
        <div className="qr-modal__input-row">
          <input
            ref={inputRef}
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Nhập hoặc quét mã vạch..."
            disabled={isSearching}
          />
          <button
            className="btn btn--primary btn--sm"
            onClick={() => handleSearch()}
            disabled={isSearching || !inputCode.trim()}
          >
            {isSearching ? "..." : "Tìm"}
          </button>
        </div>

        {/* ── Tìm thấy SP ── */}
        {found && (
          <div className="qr-modal__result qr-modal__result--found">
            <span className="qr-modal__result-icon">✅</span>
            <div className="qr-modal__result-info">
              <div className="qr-modal__result-name">{found.name}</div>
              <div className="qr-modal__result-meta">
                {formatCurrency(found.priceRetail)} ₫ / {found.unitName || "Cái"}
                {found.sku ? ` · SKU: ${found.sku}` : ""}
                {` · Tồn: ${found.onHandQty ?? 0}`}
              </div>
            </div>
            <button className="btn btn--primary btn--sm qr-modal__add-btn" onClick={handleAddFound}>
              + Thêm vào giỏ
            </button>
          </div>
        )}

        {/* ── Không tìm thấy ── */}
        {notFound && !showCreate && (
          <div className="qr-modal__not-found">
            <div className="qr-modal__nf-icon">🔍</div>
            <p className="qr-modal__nf-text">
              Không tìm thấy sản phẩm với mã <code>{scannedCode}</code>
            </p>
            <div className="qr-modal__nf-actions">
              <button
                className="btn btn--primary btn--sm"
                onClick={() => { setShowCreate(true); setTimeout(() => nameRef.current?.focus(), 100); }}
              >
                ➕ Tạo sản phẩm mới với mã này
              </button>
              <button
                className="btn btn--outline btn--sm"
                onClick={() => { setNotFound(false); setInputCode(""); setTimeout(() => inputRef.current?.focus(), 100); }}
              >
                Quét lại
              </button>
            </div>
          </div>
        )}

        {/* ── Form tạo nhanh ── */}
        {showCreate && (
          <div className="qr-modal__create-form">
            <div className="qr-modal__create-title">
              ➕ Tạo sản phẩm mới
              <span className="qr-modal__create-barcode">{scannedCode}</span>
            </div>

            <div className={`qam-field${createErrors.name ? " qam-field--error" : ""}`}>
              <label className="qam-label">Tên sản phẩm <span className="qam-required">*</span></label>
              <input
                ref={nameRef}
                className="qam-input"
                placeholder="VD: Nước suối Lavie 500ml"
                value={createForm.name}
                onChange={(e) => { setCreateForm((f) => ({ ...f, name: e.target.value })); setCreateErrors((e2) => ({ ...e2, name: "" })); }}
                onKeyDown={(e) => e.key === "Enter" && handleQuickCreate()}
              />
              {createErrors.name && <span className="qam-error">{createErrors.name}</span>}
            </div>

            <div className={`qam-field${createErrors.price ? " qam-field--error" : ""}`}>
              <label className="qam-label">Giá bán (₫) <span className="qam-required">*</span></label>
              <div className="qam-price-wrap">
                <input
                  className="qam-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={createForm.price}
                  onChange={(e) => { handlePriceInput(e.target.value); setCreateErrors((e2) => ({ ...e2, price: "" })); }}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickCreate()}
                />
                <span className="qam-currency">₫</span>
              </div>
              {createErrors.price && <span className="qam-error">{createErrors.price}</span>}
            </div>

            <div className="qr-modal__create-actions">
              <button
                className="btn btn--primary btn--sm"
                onClick={handleQuickCreate}
                disabled={isSaving}
              >
                {isSaving ? "Đang lưu..." : "✓ Lưu & Thêm vào giỏ"}
              </button>
              <button className="btn btn--outline btn--sm" onClick={() => setShowCreate(false)}>
                ← Quay lại
              </button>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
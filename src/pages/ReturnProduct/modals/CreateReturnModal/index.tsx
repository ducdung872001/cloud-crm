import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import {
  ReturnProduct,
  ReturnType,
  ICreateReturnRequest,
  ICreateExchangeRequest,
  IAutofillState,
  IReturnableProduct,
  IInvoiceReturnItemResponse,
} from "../../../../types/returnProduct";
import ReturnInvoiceService from "services/ReturnInvoiceService";
import ProductService from "services/ProductService";
import InventoryService from "services/InventoryService";
import "./index.scss";

// ─── Constants ────────────────────────────────────────────────────────────────

const REASONS = [
  "Sản phẩm bị lỗi / hư hỏng",
  "Không đúng mô tả / sai sản phẩm",
  "Sản phẩm hết hạn sử dụng",
  "Khách hàng đổi ý",
  "Khác",
];

const PAY_METHODS: { label: string; refundMethod: number; paymentType: number }[] = [
  { label: "Tiền mặt",                       refundMethod: 1, paymentType: 1 },
  { label: "Chuyển khoản ngân hàng",          refundMethod: 2, paymentType: 2 },
  { label: "Hoàn vào ví khách hàng",          refundMethod: 3, paymentType: 2 },
  { label: "Không hoàn tiền (đổi ngang giá)", refundMethod: 4, paymentType: 1 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductRow {
  id: string;
  name: string;
  qty: number;
  maxQty: number;
  price: number;
  productId?: number;
  variantId?: number;
  inventoryId?: number;
  fromApi?: boolean;
}

/** Suggestion từ ProductService.list({name}) */
interface ProductSuggestion {
  id: number;      // productId
  name: string;
  avatar?: string;
}


type LookupStatus = "idle" | "loading" | "found" | "notfound" | "error";

interface CreateReturnModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (item: ReturnProduct) => void;
  totalExisting: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mkRow = (): ProductRow => ({
  id: Math.random().toString(36).slice(2),
  name: "", qty: 1, maxQty: 9999, price: 0,
});

const fmt  = (n: number) => (n > 0 ? n.toLocaleString("vi") + " ₫" : "0 ₫");
const pad2 = (n: number) => String(n).padStart(2, "0");

function nowStr() {
  const d = new Date();
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function apiProductToRow(p: IReturnableProduct): ProductRow {
  return {
    id:          Math.random().toString(36).slice(2),
    name:        p.name ?? `Sản phẩm #${p.productId}`,
    qty:         p.qty,
    maxQty:      p.qty,
    price:       p.price,
    productId:   p.productId,
    variantId:   p.variantId,
    inventoryId: p.inventoryId,
    fromApi:     true,
  };
}

function rowsToApiLines(rows: ProductRow[]) {
  return rows
    .filter((r) => r.name.trim() && r.qty > 0)
    .map((r) => ({
      productId:   r.productId,
      variantId:   r.variantId,
      qty:         r.qty,
      price:       r.price,
      fee:         r.qty * r.price,
      discount:    0,
      discountUnit: 2,
      inventoryId: r.inventoryId,
    }));
}

// ─── ExchangeProductRow — ô tìm kiếm có autocomplete ─────────────────────────
//
// Flow:
//   1. Gõ keyword → ProductService.wList({name}) → items có originalPrice, stockQuantity
//   2. Chọn SP    → InventoryService.variantStockList({productId, stockStatus:2})
//                   → biến thể còn hàng: variantId, variantLabel, sellingPrice, quantity
//      · 0 biến thể → dùng originalPrice từ wList
//      · 1 biến thể → tự chọn, điền sellingPrice
//      · nhiều      → hiện picker

/** Biến thể còn hàng từ /inventoryBalance/variant/list */
interface StockVariant {
  variantId:    number;
  variantLabel: string;   // vd "Đỏ / XL"
  sellingPrice: number;   // giá bán hiện tại
  quantity:     number;   // tồn kho
  sellingUnitName: string;
}

interface ExchangeProductRowProps {
  row: ProductRow;
  disabled?: boolean;
  onChange: (id: string, field: keyof ProductRow, value: string | number) => void;
  onSelect: (id: string, productId: number, variantId: number | undefined,
             price: number, label: string) => void;
  onRemove: (id: string) => void;
}

function ExchangeProductRow({ row, disabled, onChange, onSelect, onRemove }: ExchangeProductRowProps) {
  const [query, setQuery]                   = useState(row.name);
  const [suggestions, setSuggestions]       = useState<any[]>([]);
  const [showDrop, setShowDrop]             = useState(false);
  const [searching, setSearching]           = useState(false);
  const [variants, setVariants]             = useState<StockVariant[]>([]);
  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const [loadingVariants, setLoadingVariants]     = useState(false);
  const [pendingProd, setPendingProd]       = useState<any>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef    = useRef<AbortController | null>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(row.name); }, [row.name]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowDrop(false);
        setShowVariantPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Bước 1: Tìm kiếm sản phẩm ───────────────────────────────────
  const searchProducts = async (kw: string) => {
    abortRef.current?.abort();
    if (!kw.trim()) { setSuggestions([]); setShowDrop(false); return; }
    abortRef.current = new AbortController();
    setSearching(true);
    try {
      const res = await ProductService.wList(
        { name: kw.trim(), limit: 10, page: 1 },
        abortRef.current.signal
      );
      if (res?.code === 0) {
        setSuggestions(res.result?.items ?? []);
        setShowDrop(true);
      } else {
        setSuggestions([]);
        setShowDrop(true);
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") { setSuggestions([]); setShowDrop(false); }
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    onChange(row.id, "name", val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchProducts(val), 350);
  };

  // ── Bước 2: Chọn SP → load biến thể còn hàng ────────────────────
  const handlePickProduct = async (item: any) => {
    setShowDrop(false);
    setSuggestions([]);
    setPendingProd(item);
    setQuery(item.name);
    setLoadingVariants(true);
    setShowVariantPicker(true);

    try {
      const res = await InventoryService.variantStockList({
        productId:   item.id,
        stockStatus: 2,   // chỉ lấy biến thể CÒN HÀNG
        size:        50,
        page:        1,
      });

      const items: any[] = res?.result?.items ?? [];

      // Map → StockVariant
      const stockVariants: StockVariant[] = items.map((v: any) => ({
        variantId:       v.variantId,
        variantLabel:    v.variantLabel || v.sku || item.name,
        sellingPrice:    v.sellingPrice ?? item.originalPrice ?? 0,
        quantity:        v.quantity ?? 0,
        sellingUnitName: v.sellingUnitName || v.baseUnitName || "",
      }));

      if (stockVariants.length === 0) {
        // Không có biến thể còn hàng → dùng originalPrice, variantId=undefined
        setShowVariantPicker(false);
        applySelection(item, undefined, item.originalPrice ?? 0, item.name);
        return;
      }

      if (stockVariants.length === 1) {
        // Chỉ 1 biến thể → tự chọn
        setShowVariantPicker(false);
        const v = stockVariants[0];
        const label = buildLabel(item.name, v.variantLabel);
        applySelection(item, v.variantId, v.sellingPrice, label);
        return;
      }

      // Nhiều biến thể → hiện picker
      setVariants(stockVariants);
    } catch {
      setShowVariantPicker(false);
      applySelection(item, undefined, item.originalPrice ?? 0, item.name);
    } finally {
      setLoadingVariants(false);
    }
  };

  // ── Bước 2b: Chọn biến thể từ picker ────────────────────────────
  const handlePickVariant = (v: StockVariant) => {
    if (!pendingProd) return;
    setShowVariantPicker(false);
    const label = buildLabel(pendingProd.name, v.variantLabel);
    applySelection(pendingProd, v.variantId, v.sellingPrice, label);
  };

  // ── Apply vào row ────────────────────────────────────────────────
  const applySelection = (item: any, variantId: number | undefined, price: number, label: string) => {
    setQuery(label);
    onChange(row.id, "name",  label);
    onChange(row.id, "price", price);
    onSelect(row.id, item.id, variantId, price, label);
  };

  // "Áo sơ mi" + "Đỏ / XL" → "Áo sơ mi — Đỏ / XL"
  // Nếu variantLabel === tên SP thì không thêm hậu tố
  const buildLabel = (productName: string, variantLabel: string): string => {
    if (!variantLabel || variantLabel === productName) return productName;
    return `${productName} — ${variantLabel}`;
  };

  return (
    <div ref={wrapRef} className="crm-prod-table__row" style={{ position: "relative" }}>

      {/* Ô tìm kiếm */}
      <div style={{ position: "relative", flex: 1 }}>
        <input
          placeholder="Tìm tên hoặc mã sản phẩm..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowDrop(true); }}
          disabled={disabled}
          autoComplete="off"
        />
        {(searching || loadingVariants) && (
          <span style={{
            position: "absolute", right: 8, top: "50%",
            transform: "translateY(-50%)", fontSize: 12, color: "#888",
          }}>⏳</span>
        )}

        {/* Dropdown: danh sách sản phẩm */}
        {showDrop && !showVariantPicker && (
          <div className="crm-product-dropdown">
            {suggestions.length === 0 ? (
              <div className="crm-product-dropdown__empty">
                {searching ? "Đang tìm..." : "Không tìm thấy sản phẩm"}
              </div>
            ) : suggestions.map((sug: any) => (
              <div
                key={sug.id}
                className="crm-product-dropdown__item"
                onMouseDown={(e) => { e.preventDefault(); handlePickProduct(sug); }}
              >
                {sug.avatar && (
                  <img src={sug.avatar} alt="" className="crm-product-dropdown__avatar" />
                )}
                <div className="crm-product-dropdown__info">
                  <span className="crm-product-dropdown__name">{sug.name}</span>
                  <span className="crm-product-dropdown__meta">
                    {sug.originalPrice > 0
                      ? sug.originalPrice.toLocaleString("vi") + " ₫"
                      : "Chưa có giá"}
                    {sug.stockQuantity != null && ` · Tồn: ${sug.stockQuantity}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Picker: chọn biến thể còn hàng */}
        {showVariantPicker && (
          <div className="crm-product-dropdown crm-product-dropdown--variants">
            <div className="crm-product-dropdown__header">
              {loadingVariants ? "Đang tải biến thể..." : "Chọn biến thể (còn hàng):"}
            </div>
            {!loadingVariants && variants.map((v) => (
              <div
                key={v.variantId}
                className="crm-product-dropdown__item"
                onMouseDown={(e) => { e.preventDefault(); handlePickVariant(v); }}
              >
                <div className="crm-product-dropdown__info">
                  <span className="crm-product-dropdown__name">
                    {v.variantLabel}
                    {v.sellingUnitName && (
                      <span style={{ fontWeight: 400, color: "var(--muted)" }}>
                        {" "}({v.sellingUnitName})
                      </span>
                    )}
                  </span>
                  <span className="crm-product-dropdown__meta">
                    {v.sellingPrice > 0
                      ? v.sellingPrice.toLocaleString("vi") + " ₫"
                      : "Chưa có giá"}
                    {" · "}Tồn: {v.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SL */}
      <input
        type="number" min={1}
        value={row.qty}
        onChange={(e) => onChange(row.id, "qty", +e.target.value || 1)}
        disabled={disabled}
      />

      {/* Đơn giá */}
      <input
        type="number" placeholder="0"
        value={row.price || ""}
        onChange={(e) => onChange(row.id, "price", +e.target.value || 0)}
        disabled={disabled}
      />

      {/* Thành tiền */}
      <input
        type="text" readOnly
        value={row.qty * row.price > 0 ? (row.qty * row.price).toLocaleString("vi") : ""}
      />

      <button className="crm-prod-table__rm" onClick={() => onRemove(row.id)} disabled={disabled}>×</button>
    </div>
  );
}

// ─── ReturnProductRowsTable — readonly từ autofill ───────────────────────────

interface ReturnRowsTableProps {
  rows: ProductRow[];
  onChange: (id: string, field: keyof ProductRow, value: string | number) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

function ReturnRowsTable({ rows, onChange, onRemove, disabled }: ReturnRowsTableProps) {
  return (
    <div className="crm-prod-table">
      <div className="crm-prod-table__head">
        <span>Sản phẩm</span><span>SL</span><span>Đơn giá</span><span>Thành tiền</span><span />
      </div>
      {rows.map((row) => (
        <div key={row.id} className={`crm-prod-table__row${row.fromApi ? " crm-prod-table__row--autofill" : ""}`}>
          <input
            placeholder="Tên hoặc mã sản phẩm..."
            value={row.name}
            onChange={(e) => onChange(row.id, "name", e.target.value)}
            disabled={disabled || row.fromApi}
            className={row.fromApi ? "crm-prod-table__autofill" : ""}
          />
          <input
            type="number" min={1}
            max={row.fromApi ? row.maxQty : undefined}
            value={row.qty}
            onChange={(e) => onChange(row.id, "qty", +e.target.value || 1)}
            disabled={disabled}
            title={row.fromApi ? `Tối đa: ${row.maxQty}` : undefined}
          />
          <input
            type="number" placeholder="0"
            value={row.price || ""}
            onChange={(e) => onChange(row.id, "price", +e.target.value || 0)}
            disabled={disabled || row.fromApi}
            className={row.fromApi ? "crm-prod-table__autofill" : ""}
          />
          <input
            type="text" readOnly
            value={row.qty * row.price > 0 ? (row.qty * row.price).toLocaleString("vi") : ""}
          />
          <button className="crm-prod-table__rm" onClick={() => onRemove(row.id)} disabled={disabled}>×</button>
        </div>
      ))}
    </div>
  );
}

// ─── Component chính ──────────────────────────────────────────────────────────

export default function CreateReturnModal({
  open, onClose, onCreate, totalExisting,
}: CreateReturnModalProps) {

  const [seg,          setSeg]          = useState<ReturnType>("return");
  const [maGoc,        setMaGoc]        = useState("");
  const [customer,     setCustomer]     = useState("");
  const [reason,       setReason]       = useState(REASONS[0]);
  const [note,         setNote]         = useState("");
  const [payMethodIdx, setPayMethodIdx] = useState(0);
  const [retItems,     setRetItems]     = useState<ProductRow[]>([mkRow()]);
  const [exchItems,    setExchItems]    = useState<ProductRow[]>([mkRow()]);

  const [lookupStatus,  setLookupStatus]  = useState<LookupStatus>("idle");
  const [lookupMsg,     setLookupMsg]     = useState("");
  const [autofill,      setAutofill]      = useState<IAutofillState | null>(null);
  const [submitting,    setSubmitting]    = useState(false);

  const lookupAbort = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const retTotal   = retItems.reduce((s, r)  => s + r.qty * r.price, 0);
  const exchTotal  = exchItems.reduce((s, r) => s + r.qty * r.price, 0);
  const grandTotal = seg === "exchange" ? Math.abs(retTotal - exchTotal) : retTotal;

  // ── Autofill ───────────────────────────────────────────────────
  const fetchReturnItems = useCallback(async (invoiceId: number, signal: AbortSignal) => {
    const res2 = await ReturnInvoiceService.getReturnItems(invoiceId, signal);
    if (signal.aborted) return;
    if (res2?.code !== 0 || !res2?.result) {
      setLookupStatus("error");
      setLookupMsg("Không thể tải thông tin hóa đơn. Thử lại sau.");
      return;
    }
    const data: IInvoiceReturnItemResponse = res2.result;
    const inv = data.invoice;
    const availableProducts = (data.lstBoughtProduct ?? []).filter((p) => (p.qty ?? 0) > 0);
    const availableServices = (data.lstBoughtService ?? []).filter((s) => (s.serviceNumber ?? 0) > 0);

    if (availableProducts.length === 0 && availableServices.length === 0) {
      setLookupStatus("notfound");
      const hadItems = (data.lstBoughtProduct?.length ?? 0) > 0 || (data.lstBoughtService?.length ?? 0) > 0;
      setLookupMsg(hadItems
        ? "Hóa đơn này đã được hoàn trả toàn bộ, không thể tạo thêm phiếu."
        : "Hóa đơn này không có mặt hàng nào có thể trả.");
      return;
    }

    const af: IAutofillState = {
      originalInvoiceId: inv.id,
      customerName:  inv.customerName ?? (inv.customerId ? `KH #${inv.customerId}` : ""),
      customerId:    inv.customerId,
      customerPhone: inv.customerPhone,
      products:      availableProducts,
      services:      availableServices,
      originalFee:   inv.fee,
    };
    setAutofill(af);
    const customerDisplay = [inv.customerName, inv.customerPhone].filter(Boolean).join(" – ");
    if (customerDisplay) setCustomer(customerDisplay);
    const productRows: ProductRow[] = af.products.map(apiProductToRow);
    setRetItems(productRows.length > 0 ? productRows : [mkRow()]);
    setLookupStatus("found");
    const partialNote = availableProducts.length < (data.lstBoughtProduct?.length ?? 0)
      ? " (một phần đã hoàn trả trước)" : "";
    setLookupMsg(
      `✓ Tìm thấy: ${af.customerName || "Khách hàng"}` +
      ` — ${af.products.length} sản phẩm${partialNote}` +
      (af.services.length > 0 ? `, ${af.services.length} dịch vụ` : "")
    );
  }, []);

  const lookupInvoice = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setLookupStatus("idle"); setLookupMsg(""); setAutofill(null);
      setCustomer(""); setRetItems([mkRow()]); return;
    }
    lookupAbort.current?.abort();
    const ctrl = new AbortController();
    lookupAbort.current = ctrl;
    setLookupStatus("loading"); setLookupMsg("");
    try {
      const res1 = await ReturnInvoiceService.findByCode(trimmed, ctrl.signal);
      if (ctrl.signal.aborted) return;
      let invoiceId: number | null = null;
      const items = res1?.result?.pagedLst?.items;
      if (Array.isArray(items) && items.length > 0) {
        invoiceId = items[0]?.invoiceId ?? items[0]?.invoice?.id ?? null;
      }
      if (!invoiceId) {
        setLookupStatus("notfound");
        setLookupMsg(`Không tìm thấy hóa đơn "${trimmed}". Kiểm tra lại mã.`);
        return;
      }
      await fetchReturnItems(invoiceId, ctrl.signal);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setLookupStatus("error");
      setLookupMsg("Lỗi kết nối. Kiểm tra lại mạng và thử lại.");
    }
  }, [fetchReturnItems]);

  const handleMaGocChange = useCallback((val: string) => {
    setMaGoc(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => lookupInvoice(val), 600);
  }, [lookupInvoice]);

  const handleMaGocBlur = useCallback(() => {
    clearTimeout(debounceRef.current);
    lookupInvoice(maGoc);
  }, [maGoc, lookupInvoice]);

  const resetForm = useCallback(() => {
    setSeg("return"); setMaGoc(""); setCustomer(""); setReason(REASONS[0]);
    setNote(""); setPayMethodIdx(0);
    setRetItems([mkRow()]); setExchItems([mkRow()]);
    setLookupStatus("idle"); setLookupMsg(""); setAutofill(null);
    lookupAbort.current?.abort();
  }, []);

  const handleClose = useCallback(() => { resetForm(); onClose(); }, [resetForm, onClose]);
  useEffect(() => () => { lookupAbort.current?.abort(); }, []);

  // ── Row helpers ────────────────────────────────────────────────
  const updateRow = useCallback((
    list: ProductRow[],
    setList: React.Dispatch<React.SetStateAction<ProductRow[]>>,
    id: string, field: keyof ProductRow, value: string | number
  ) => {
    setList(list.map((r) => {
      if (r.id !== id) return r;
      if (field === "qty" && r.fromApi) {
        return { ...r, qty: Math.min(Number(value) || 1, r.maxQty) };
      }
      return { ...r, [field]: value };
    }));
  }, []);

  const removeRow = useCallback((
    list: ProductRow[],
    setList: React.Dispatch<React.SetStateAction<ProductRow[]>>,
    id: string
  ) => {
    if (list.length <= 1) { setList([mkRow()]); return; }
    setList(list.filter((r) => r.id !== id));
  }, []);

  /** Khi user chọn SP/biến thể → cập nhật row */
  const handleExchSelect = useCallback((
    id: string, productId: number, variantId: number | undefined,
    price: number, label: string
  ) => {
    setExchItems((prev) => prev.map((r) => r.id !== id ? r : {
      ...r,
      name:      label,
      productId,
      variantId,
      price,
    }));
  }, []);

  // ── Validation ─────────────────────────────────────────────────
  const validate = useCallback((): string | null => {
    if (!maGoc.trim()) return "Vui lòng nhập mã đơn hàng gốc.";
    if (lookupStatus === "loading") return "Đang tải thông tin hóa đơn, vui lòng chờ.";
    if (lookupStatus === "notfound") return "Hóa đơn gốc không tồn tại hoặc không còn hàng để trả.";
    if (retItems.filter((r) => r.name.trim()).length === 0) return "Vui lòng nhập ít nhất 1 sản phẩm trả lại.";
    if (seg === "exchange" && exchItems.filter((r) => r.name.trim()).length === 0)
      return "Vui lòng nhập ít nhất 1 sản phẩm đổi mới.";
    return null;
  }, [maGoc, lookupStatus, retItems, exchItems, seg]);

  // ── Submit ─────────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    const err = validate();
    if (err) { showToast(err, "error"); return; }
    setSubmitting(true);
    const pm = PAY_METHODS[payMethodIdx];
    try {
      const retLines  = rowsToApiLines(retItems);
      const exchLines = rowsToApiLines(exchItems);
      const firstItem = retItems.find((r) => r.name.trim());
      const optimistic: ReturnProduct = {
        id: Date.now().toString(),
        code: `PTH-${String(totalExisting + 1).padStart(4, "0")}`,
        time: nowStr(),
        customerName: autofill?.customerName || customer || "Khách vãng lai",
        originalOrderCode: maGoc,
        type: seg,
        productSummary: firstItem ? `${firstItem.name} (x${firstItem.qty})` : "Sản phẩm (x1)",
        refundAmount: grandTotal,
        status: "pending",
        reason,
        staffName: "–",
        paymentMethod: pm.label,
        note,
      };
      const invoiceBase = {
        referId:      autofill?.originalInvoiceId ?? 0,
        customerId:   autofill?.customerId,
        amount:       retTotal,
        fee:          retTotal,
        paid:         retTotal,
        debt:         0,
        discount:     0,
        vatAmount:    0,
        paymentType:  pm.paymentType,
        reason,
        refundMethod: pm.refundMethod,
        note:         note || undefined,
      };

      let res: any;
      if (seg === "return") {
        const body: ICreateReturnRequest = {
          invoice: invoiceBase, lstProduct: retLines, lstService: [], lstCardService: [],
        };
        res = await ReturnInvoiceService.createReturn(body);
      } else {
        const body: ICreateExchangeRequest = {
          invoice: invoiceBase, lstProduct: retLines, lstService: [], lstCardService: [],
          ...(exchLines.length > 0 && {
            exchangeInvoice: {
              customerId:  autofill?.customerId,
              amount:      exchTotal,
              fee:         exchTotal,
              paid:        grandTotal,
              debt:        0,
              discount:    0,
              vatAmount:   0,
              paymentType: pm.paymentType,
            },
            lstExchangeProduct: exchLines,
          }),
        };
        res = await ReturnInvoiceService.createExchange(body);
      }

      if (res?.code !== 0) {
        showToast(res?.message ?? "Tạo phiếu thất bại. Vui lòng thử lại.", "error");
        return;
      }
      if (res?.result?.invoiceCode) optimistic.code = res.result.invoiceCode;
      if (res?.result?.id)          optimistic.id   = String(res.result.id);

      showToast(seg === "return" ? "Tạo phiếu trả hàng thành công!" : "Tạo phiếu đổi hàng thành công!", "success");
      onCreate(optimistic);
      resetForm();
    } catch (e) {
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setSubmitting(false);
    }
  }, [
    validate, seg, maGoc, customer, reason, note, payMethodIdx,
    retItems, exchItems, retTotal, exchTotal, grandTotal,
    autofill, totalExisting, onCreate, resetForm,
  ]);

  const actions = useMemo<IActionModal>(() => ({
    actions_right: {
      buttons: [
        { title: "Hủy", color: "primary", variant: "outline", callback: handleClose, disabled: submitting },
        { title: submitting ? "Đang tạo..." : "✅ Xác nhận tạo phiếu", color: "primary", callback: handleCreate, disabled: submitting },
      ],
    },
  }), [handleClose, handleCreate, submitting]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <Modal isFade isOpen={open} isCentered staticBackdrop toggle={handleClose} className="create-return-modal">
      <ModalHeader title="Tạo phiếu trả / đổi hàng" toggle={handleClose} />
      <ModalBody>

        {/* Segment */}
        <div className="crm-seg">
          <button className={`crm-seg__btn${seg === "return"   ? " crm-seg__btn--active" : ""}`} onClick={() => setSeg("return")}   disabled={submitting}>🔴 Trả hàng</button>
          <button className={`crm-seg__btn${seg === "exchange" ? " crm-seg__btn--active" : ""}`} onClick={() => setSeg("exchange")} disabled={submitting}>🔵 Đổi hàng</button>
        </div>

        {/* Thông tin chung */}
        <div className="crm-section">
          <div className="crm-section__title">Thông tin chung</div>
          <div className="crm-form-grid">
            <div className="crm-field">
              <label>Mã đơn hàng gốc <span>*</span></label>
              <div className="crm-invoice-lookup">
                <input
                  value={maGoc}
                  onChange={(e) => handleMaGocChange(e.target.value)}
                  onBlur={handleMaGocBlur}
                  placeholder="VD: HD-2241"
                  disabled={submitting}
                  className={`crm-invoice-lookup__input${
                    lookupStatus === "found"    ? " crm-invoice-lookup__input--ok"  :
                    lookupStatus === "notfound" ? " crm-invoice-lookup__input--err" :
                    lookupStatus === "error"    ? " crm-invoice-lookup__input--err" : ""
                  }`}
                />
                {lookupStatus === "loading"  && <span className="crm-invoice-lookup__spin">⏳</span>}
                {lookupStatus === "found"    && <span className="crm-invoice-lookup__ok">✓</span>}
                {(lookupStatus === "notfound" || lookupStatus === "error") && <span className="crm-invoice-lookup__err">✕</span>}
              </div>
              {lookupMsg && (
                <span className={`crm-lookup-msg crm-lookup-msg--${
                  lookupStatus === "found" ? "ok" : lookupStatus === "loading" ? "loading" : "err"
                }`}>{lookupMsg}</span>
              )}
            </div>

            <div className="crm-field">
              <label>Khách hàng</label>
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder={lookupStatus === "loading" ? "Đang tải..." : "Tìm tên hoặc SĐT khách..."}
                disabled={submitting}
                className={lookupStatus === "found" && autofill?.customerName ? "crm-field__autofilled" : ""}
                readOnly={lookupStatus === "found" && !!autofill?.customerName}
              />
            </div>

            <div className="crm-field">
              <label>Lý do <span>*</span></label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} disabled={submitting}>
                {REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div className="crm-field">
              <label>Hình thức hoàn tiền</label>
              <select value={payMethodIdx} onChange={(e) => setPayMethodIdx(+e.target.value)} disabled={submitting}>
                {PAY_METHODS.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
              </select>
            </div>

            <div className="crm-field crm-field--full">
              <label>Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú thêm (nếu có)..."
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Sản phẩm trả lại — dùng ReturnRowsTable (readonly autofill) */}
        <div className="crm-section">
          <div className="crm-section__title">
            {seg === "exchange" ? "Sản phẩm cần đổi" : "Sản phẩm trả lại"}
            {lookupStatus === "found" && autofill && autofill.products.length > 0 && (
              <span className="crm-autofill-badge">Tự động điền từ HĐ gốc</span>
            )}
          </div>
          <ReturnRowsTable
            rows={retItems}
            disabled={submitting}
            onChange={(id, f, v) => updateRow(retItems, setRetItems, id, f, v)}
            onRemove={(id) => removeRow(retItems, setRetItems, id)}
          />
          <button className="crm-add-row" onClick={() => setRetItems((p) => [...p, mkRow()])} disabled={submitting}>
            + Thêm sản phẩm
          </button>
        </div>

        {/* Sản phẩm đổi mới — dùng ExchangeProductRow có autocomplete */}
        {seg === "exchange" && (
          <div className="crm-section">
            <div className="crm-section__title">Sản phẩm đổi mới</div>
            <div className="crm-prod-table">
              <div className="crm-prod-table__head">
                <span>Sản phẩm</span><span>SL</span><span>Đơn giá</span><span>Thành tiền</span><span />
              </div>
              {exchItems.map((row) => (
                <ExchangeProductRow
                  key={row.id}
                  row={row}
                  disabled={submitting}
                  onChange={(id, f, v) => updateRow(exchItems, setExchItems, id, f, v)}
                  onSelect={handleExchSelect}
                  onRemove={(id) => removeRow(exchItems, setExchItems, id)}
                />
              ))}
            </div>
            <button className="crm-add-row" onClick={() => setExchItems((p) => [...p, mkRow()])} disabled={submitting}>
              + Thêm sản phẩm đổi
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="crm-summary">
          <div className="crm-summary__row">
            <span>Tổng tiền hàng trả</span><span>{fmt(retTotal)}</span>
          </div>
          {seg === "exchange" && (
            <div className="crm-summary__row">
              <span>Tổng tiền hàng đổi</span><span>{fmt(exchTotal)}</span>
            </div>
          )}
          <div className="crm-summary__divider" />
          <div className="crm-summary__row crm-summary__row--total">
            <span>{seg === "exchange" ? "Chênh lệch thanh toán" : "Tiền hoàn khách"}</span>
            <span>{fmt(grandTotal)}</span>
          </div>
        </div>

      </ModalBody>
      <ModalFooter actions={actions} />
    </Modal>
  );
}
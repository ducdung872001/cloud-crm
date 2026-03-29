import React, { useState, useEffect, useRef } from "react";
import SelectCustom from "components/selectCustom/selectCustom";
import FileService from "services/FileService";
import NummericInput from "components/input/numericInput";
import TextArea from "components/textarea/textarea";
import ProductService from "services/ProductService";
import CategoryServiceService from "services/CategoryServiceService";
import { SelectOptionData } from "utils/selectCommon";
import { showToast } from "utils/common";
import { IProductRequest } from "model/product/ProductRequestModel";
import { IProductResponse } from "model/product/ProductResponseModel";
import { IOption } from "model/OtherModel";
import "./AddProductPage.scss";
import Tippy from "@tippyjs/react";
import ShareLinkModal from "./ShareLinkModal";
import BarcodePrintModal from "./BarcodePrintModal";
import { useContext } from "react";
import { UserContext, ContextType } from "contexts/userContext";
import { useOnboarding, isTourDone } from "hooks/useOnboarding";
import TourOverlay from "components/tourOverlay/TourOverlay";
import RebornEditor from "components/editor/reborn";
import { serialize } from "utils/editor";
import urls from "@/configs/urls";

type PageTab = "info" | "variants";

interface AddProductPageProps {
  idProduct: number | null;
  data?: any;
  onBack: (reload: boolean) => void;
  preFillBarcode?: string | null;
}

const DISPLAY_TOGGLES = [
  { key: "showOnWeb", label: "Hiển thị trên Web", sub: "Đồng bộ lên cửa hàng online" },
  { key: "showImage", label: "Hiển thị hình ảnh", sub: "Ảnh sản phẩm trên Web" },
  { key: "showUnit", label: "Hiển thị đơn vị", sub: "Đơn vị tính (Hộp, Cái...)" },
  { key: "showDesc", label: "Hiển thị mô tả", sub: "Nội dung mô tả chi tiết" },
  { key: "showPromoPrice", label: "Hiển thị giá khuyến mãi", sub: "Giá sale khi có CTKM" },
  { key: "showWholesalePrice", label: "Hiển thị giá sỉ", sub: "Giá bán sỉ cho đại lý" },
  { key: "showStock", label: "Hiển thị tồn kho", sub: "Số lượng còn lại" },
  { key: "showBarcode", label: "Hiển thị mã vạch", sub: "Barcode / QR code" },
  { key: "showCategory", label: "Hiển thị phân loại", sub: "Danh mục, nhóm sản phẩm" },
  { key: "hideWhenOutOfStock", label: "Ẩn khi hết hàng", sub: "Tự động ẩn khỏi Web" },
];

const DEFAULT_FORM = {
  name: "",
  categoryId: null as number | null,
  categoryName: "",
  status: 1,
  description: "",
  avatar: "",
  trackStock: true,
  stock: 0,
  minStock: 20,
  maxStock: 0,
  showOnWeb: true,
  showImage: true,
  showUnit: true,
  showDesc: true,
  showPromoPrice: false,
  showWholesalePrice: false,
  showStock: true,
  showBarcode: false,
  showCategory: true,
  hideWhenOutOfStock: true,
};

// ── VARIANT TYPES ──
interface VariantAttribute {
  tempId: string;
  id?: number | null;                    // variantGroup.id từ API (cần khi update)
  name: string;
  values: string[];
  optionIds?: Record<string, number>;    // { "Đỏ": 12, "Xanh": 13 } — option id theo label
  inputVal: string;
}

interface UnitPrice {
  tempId: string;
  id?: number | null;
  unitId: number | null;
  unitName: string;
  price: string | number;
}

interface VariantCombination {
  key: string;
  id?: number | null;
  label: string;
  sku: string;
  barcode: string;
  images: string[];
  unitId: number | null;
  price: string | number;
  costPrice: string | number;
  priceWholesale: string | number;
  pricePromo: string | number;
  variantPrices: UnitPrice[];
}

const genId = () => Math.random().toString(36).slice(2, 9);

const toSkuPart = (str: string): string =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);

// Sinh EAN-13 hợp lệ theo chuẩn GS1 (prefix 893 = Việt Nam)
const generateEAN13 = (): string => {
  const prefix = "893";
  const rand = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("");
  const partial = prefix + rand; // 12 chữ số
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(partial[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return partial + check;
};

// Fallback cuối cùng — đảm bảo SKU không bao giờ là chuỗi rỗng
const safeSku = (candidate: string, prefix = "VT"): string =>
  candidate.trim() || `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

const generateSku = (productName: string, comboLabel: string): string => {
  const namePart = toSkuPart(productName) || "SP";
  const valueParts = comboLabel
    .split("/")
    .map((v) => toSkuPart(v.trim()))
    .filter(Boolean)
    .join("-");
  // Suffix độc nhất: 4 ký tự cuối của timestamp (base36) + 2 ký tự random
  // → xác suất trùng gần như bằng 0 dù tạo cùng lúc
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rnd = Math.random().toString(36).slice(2, 4).toUpperCase();
  const base = valueParts ? `${namePart}-${valueParts}` : namePart;
  return `${base}-${ts}${rnd}`;
};

const makeEmptyUnitPrice = (): UnitPrice => ({
  tempId: genId(),
  unitId: null,
  unitName: "",
  price: "",
});

const buildCombinations = (attrs: VariantAttribute[]): VariantCombination[] => {
  const active = attrs.filter((a) => a.name.trim() && a.values.length > 0);
  if (!active.length) return [];
  const cartesian = (...sets: string[][]): string[][] => {
    if (!sets.length) return [[]];
    const [first, ...rest] = sets;
    return first.flatMap((v) => cartesian(...rest).map((r) => [v, ...r]));
  };
  return cartesian(...active.map((a) => a.values)).map((combo) => ({
    key: active.map((a, i) => `${a.name}:${combo[i]}`).join("|"),
    label: combo.join(" / "),
    sku: "",
    barcode: "",
    images: [],
    unitId: null,
    price: "" as string | number,
    costPrice: "" as string | number,
    priceWholesale: "" as string | number,
    pricePromo: "" as string | number,
    variantPrices: [makeEmptyUnitPrice()],
  }));
};

// ── Barcode Scanner Modal (dùng BarcodeDetector API native) ──
function BarcodeScannerModal({ onScan, onClose }: { onScan: (barcode: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    if (!("BarcodeDetector" in window)) {
      setError("Trình duyệt chưa hỗ trợ BarcodeDetector. Vui lòng dùng Chrome / Edge phiên bản mới.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      detectorRef.current = new (window as any).BarcodeDetector({
        formats: ["ean_13", "ean_8", "code_128", "code_39", "qr_code", "upc_a", "upc_e", "itf", "codabar"],
      });
      setIsReady(true);
      scanLoop();
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Bạn chưa cấp quyền truy cập camera. Vui lòng cho phép trong cài đặt trình duyệt.");
      } else {
        setError("Không thể mở camera: " + (err.message || err));
      }
    }
  };

  const scanLoop = async () => {
    if (!videoRef.current || !detectorRef.current) return;
    if (videoRef.current.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      if (barcodes.length > 0) {
        stopCamera();
        onScan(barcodes[0].rawValue);
        return;
      }
    } catch (_) {}
    rafRef.current = requestAnimationFrame(scanLoop);
  };

  return (
    <div className="bs-overlay" onClick={onClose}>
      <div className="bs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bs-modal__header">
          <span className="bs-modal__title">Quét mã vạch</span>
          <button type="button" className="bs-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="bs-modal__body">
          {error ? (
            <div className="bs-modal__error">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
            </div>
          ) : (
            <div className="bs-modal__video-wrap">
              <video ref={videoRef} className="bs-modal__video" playsInline muted />
              {/* Khung ngắm */}
              <div className="bs-modal__reticle">
                <span className="bs-modal__reticle-corner bs-modal__reticle-corner--tl" />
                <span className="bs-modal__reticle-corner bs-modal__reticle-corner--tr" />
                <span className="bs-modal__reticle-corner bs-modal__reticle-corner--bl" />
                <span className="bs-modal__reticle-corner bs-modal__reticle-corner--br" />
                <div className="bs-modal__scan-line" />
              </div>
              <p className="bs-modal__hint">{isReady ? "Đưa mã vạch vào khung để quét tự động" : "Đang khởi động camera..."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Multi-image picker cho variant (upload lên CDN, reorder bằng nút ◀▶) ──
const MAX_VARIANT_IMAGES = 7;

function VariantImagePicker({ images, onChange }: { images: string[]; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  // Luôn giữ ref mới nhất để callback async không bị stale closure
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const remaining = MAX_VARIANT_IMAGES - images.length - uploadingCount;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, Math.max(0, remaining));
    if (!files.length) return;
    e.target.value = "";
    files.forEach((file) => {
      setUploadingCount((c) => c + 1);
      FileService.uploadFile({
        data: file,
        onSuccess: (result: any) => {
          const url = result?.fileUrl || result;
          setUploadingCount((c) => c - 1);
          onChange([...imagesRef.current, url]);
        },
        onError: () => {
          setUploadingCount((c) => c - 1);
          showToast("Upload ảnh thất bại, vui lòng thử lại", "error");
        },
      });
    });
  };

  // Click vào ảnh → đặt làm ảnh chính (đưa lên index 0)
  const setAsMain = (idx: number) => {
    if (idx === 0) return;
    const arr = [...images];
    const [picked] = arr.splice(idx, 1);
    onChange([picked, ...arr]);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...images];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange(arr);
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="vt-img-strip">
      {images.map((url, idx) => (
        <div
          className={`vt-img-strip__item${idx === 0 ? " vt-img-strip__item--main" : ""}`}
          key={`${url}-${idx}`}
          onClick={() => setAsMain(idx)}
          title={idx === 0 ? "Ảnh chính" : "Click để đặt làm ảnh chính"}
        >
          {idx === 0 && <span className="vt-img-strip__main-badge">Chính</span>}
          <img src={url} alt={`img-${idx}`} className="vt-img-strip__img" />
          {/* Nút di chuyển (hiện khi hover) */}
          <div className="vt-img-strip__move-row">
            <button
              type="button"
              className="vt-img-strip__move"
              style={{ visibility: idx > 0 ? "visible" : "hidden" }}
              onClick={(e) => { e.stopPropagation(); move(idx, -1); }}
              title="Dịch sang trái"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              type="button"
              className="vt-img-strip__move"
              style={{ visibility: idx < images.length - 1 ? "visible" : "hidden" }}
              onClick={(e) => { e.stopPropagation(); move(idx, 1); }}
              title="Dịch sang phải"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          {/* Nút xoá */}
          <button
            type="button"
            className="vt-img-strip__remove"
            onClick={(e) => { e.stopPropagation(); remove(idx); }}
            title="Xoá ảnh"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      ))}

      {/* Spinner cho từng ảnh đang upload */}
      {Array.from({ length: uploadingCount }).map((_, i) => (
        <div className="vt-img-strip__item vt-img-strip__item--loading" key={`loading-${i}`}>
          <div className="vt-img-strip__spinner" />
        </div>
      ))}

      {/* Nút thêm ảnh — ẩn khi đã đủ MAX */}
      {remaining > 0 && (
        <div className="vt-img-strip__add" onClick={() => inputRef.current?.click()} title={`Thêm ảnh (còn ${remaining} slot)`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Thêm</span>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFiles} />
    </div>
  );
}

export default function AddProductPage({ idProduct, data, onBack, preFillBarcode }: AddProductPageProps) {
  const isEdit = !!idProduct;
  const { id: userId } = useContext(UserContext) as ContextType;

  // ── Tour hướng dẫn in mã vạch ──
  const barcodeTour = useOnboarding({
    userId: userId ?? "guest",
    tourId: "barcode_print",
    autoStart: false, // chỉ tự khởi động lần đầu khi SP đã có biến thể (xem useEffect bên dưới)
  });
  const [activeTab, setActiveTab] = useState<PageTab>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBarcodePrintModal, setShowBarcodePrintModal] = useState(false);
  const [showWebPreviewDropdown, setShowWebPreviewDropdown] = useState(false);
  const [showWebPreviewModal, setShowWebPreviewModal] = useState(false);
  const [detailProduct, setDetailProduct] = useState<IProductResponse>(null);

  // ── Content (editor) ──
  const [contentHtml, setContentHtml] = useState<string>("");        // HTML → lưu vào content
  const [contentDelta, setContentDelta] = useState<string>("");      // JSON → lưu vào contentDelta
  const [isSavingContent, setIsSavingContent] = useState(false);

  // ── Tags ──
  const [availableTags, setAvailableTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [listUnit, setListUnit] = useState<IOption[]>([]);
  const [listCategory, setListCategory] = useState<IOption[]>([]);

  // ── Đơn vị quy đổi (product_unit) ──
  interface IUnitExchange { id?: number; productId?: number; unitId: number | null; unitName: string; isBasis: number; exchange: number; }
  const makeEmptyUE = (): IUnitExchange => ({ unitId: null, unitName: "", isBasis: 0, exchange: 1 });
  const [unitExchangeList, setUnitExchangeList] = useState<IUnitExchange[]>([makeEmptyUE()]);
  const [isSavingUE, setIsSavingUE] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ value: number; label: string } | null>(null);
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [isDuplicating, setIsDuplicating] = useState(false);
  // Variants
  const [variantAttrs, setVariantAttrs] = useState<VariantAttribute[]>([]);
  const [combinations, setCombinations] = useState<VariantCombination[]>([]);
  const [scanningComboKey, setScanningComboKey] = useState<string | null>(null);

  const setField = (key: string, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));

  const buildProductWebUrl = () => {
    const slug = formData.name
      .toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d")
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-").replace(/^-|-$/g, "");
    return `${window.location.origin}/shop/san-pham/${idProduct}${slug ? `-${slug}` : ""}`;
  };

  useEffect(() => {
    const init = async () => {
      // Chạy song song các load không phụ thuộc nhau
      // loadAvailableTags phải hoàn thành TRƯỚC loadDetail để tránh race condition
      await Promise.all([loadUnits(), loadCategories(), loadAvailableTags()]);
      if (isEdit) {
        await loadDetail();
        await Promise.all([loadWebsiteSetting(), loadUnitExchange()]); // load cài đặt hiển thị sau khi có idProduct
      } else {
        if (data) preFill(data);
        await loadDefaultWebsiteSetting(); // load defaults khi tạo SP mới
      }
    };
    init();
  }, [idProduct]);

  // Khi được mở từ scan QR → điền sẵn barcode vào biến thể đầu tiên
  useEffect(() => {
    if (!preFillBarcode) return;
    setCombinations((prev) => {
      if (prev.length === 0) {
        // Chưa có biến thể → tạo 1 biến thể mặc định với barcode điền sẵn
        return [{
          key: genId(),
          id: null,
          label: "Mặc định",
          sku: "",
          barcode: preFillBarcode,
          images: [],
          unitId: null,
          price: 0,
          costPrice: 0,
          priceWholesale: 0,
          pricePromo: 0,
          variantPrices: [],
        }];
      }
      // Đã có biến thể → điền vào cái đầu tiên nếu chưa có barcode
      return prev.map((v, i) => i === 0 && !v.barcode ? { ...v, barcode: preFillBarcode } : v);
    });
    setActiveTab("variants");
    showToast(`Mã vạch "${preFillBarcode}" đã được điền vào biến thể — vui lòng nhập tên và giá sản phẩm`, "info");
  }, [preFillBarcode]);

  // Tự động bắt đầu tour in mã vạch lần đầu — khi SP đã có biến thể
  useEffect(() => {
    if (combinations.length > 0 && !isTourDone(userId ?? "guest", "barcode_print")) {
      // Delay nhỏ để UI render xong
      const t = setTimeout(() => barcodeTour.start(), 600);
      return () => clearTimeout(t);
    }
  }, [combinations.length > 0]);

  const preFill = (p: any) => {
    setFormData((prev) => ({
      ...prev,
      name: p.name || "",
      categoryId: p.categoryId || null,
      categoryName: p.categoryName || "",
      status: p.status ?? 1,
      images: p.avatar || "",
      description: p.description || "",
      trackStock: p.trackStock ?? true,
      stock: p.stock ?? 0,
      minStock: p.minStock ?? p.stockWarning ?? 20,
      maxStock: p.maxStock ?? 0,
      // ⚠️ Không set website display settings ở đây —
      // chúng được load riêng từ /product/website-setting/get
      // để tránh overwrite bằng undefined defaults
    }));
    if (p.categoryId) setSelectedCategory({ value: p.categoryId, label: p.categoryName });

    // ── Content editor (mô tả chi tiết) ──
    // p.description = mô tả ngắn (textarea) — KHÔNG set vào editor
    // p.content = mô tả chi tiết HTML → khởi tạo editor
    // p.contentDelta = Slate delta JSON → restore editor state chính xác hơn
    if (p.content) setContentHtml(p.content);
    if (p.contentDelta) setContentDelta(p.contentDelta);

    // ── Tags ──
    if (p.tagIds?.length) setSelectedTagIds([...new Set<number>(p.tagIds)]);

    // ── Load biến thể từ API ──
    if (p.variantGroups?.length) {
      // Map variantGroups → variantAttrs
      const attrs: VariantAttribute[] = p.variantGroups.map((g: any) => ({
        tempId: genId(),
        id: g.id ?? null,
        name: g.name,
        values: [...new Set((g.options || []).map((o: any) => o.label as string))],
        optionIds: Object.fromEntries((g.options || []).map((o: any) => [o.label, o.id])),
        inputVal: "",
      }));
      setVariantAttrs(attrs);

      // Map variants → combinations (bỏ qua biến thể "Mac dinh" / default)
      const realVariants = (p.variants || []).filter((v: any) => v.label !== "Mac dinh");

      if (realVariants.length) {
        const combos: VariantCombination[] = realVariants.map((v: any) => {
          // variantPrices: BE có thể trả field tên khác (prices / variantPrices / units)
          const rawUnitPrices: any[] =
            v.variantPrices ?? v.prices ?? v.units ?? [];
          const mappedUnitPrices =
            rawUnitPrices.length > 0
              ? rawUnitPrices.map((u: any) => ({
                  tempId: genId(),
                  id: u.id ?? null,
                  unitId: u.unitId ?? u.unit_id ?? null,
                  unitName: u.unitName ?? u.unit_name ?? "",
                  price: u.price ?? u.priceRetail ?? "",
                }))
              : [
                  {
                    tempId: genId(),
                    unitId: v.unitId ?? null,
                    unitName: v.unitName ?? "",
                    price: v.price ?? "",
                  },
                ];

          // Tạo key theo format "GroupName:value|GroupName:value|..."
          // Nếu API trả về groupName rỗng, fallback: tách label "Đỏ / M" theo attrs
          const hasGroupName = v.selectedOptions?.some((o: any) => o.groupName);
          let key: string;
          if (hasGroupName) {
            key = v.selectedOptions
              .filter((o: any) => o.groupName)
              .map((o: any) => `${o.groupName}:${o.label}`)
              .join("|");
          } else {
            // Fallback: label "Đỏ" hoặc "Đỏ / M" → map theo thứ tự attrs
            const parts = v.label.split(" / ").map((s: string) => s.trim());
            key = attrs.map((attr, i) => `${attr.name}:${parts[i] || ""}`).join("|");
          }

          return {
            key,
            id: v.id ?? null,
            label: v.label,
            sku: v.sku || "",
            barcode: v.code || v.barcode || v.barcodeCode || "",
            images: v.images?.length ? v.images : [v.avatar, v.image].filter(Boolean) as string[],
            unitId: v.unitId ?? null,
            price: v.price ?? v.priceRetail ?? "",
            costPrice: v.costPrice ?? v.cost_price ?? "",
            priceWholesale: v.priceWholesale ?? v.price_wholesale ?? v.wholesale ?? "",
            pricePromo: v.pricePromo ?? v.pricePromotion ?? v.price_promo ?? "",
            variantPrices: mappedUnitPrices,
          };
        });
        setCombinations(combos);
      }
    }
  };

  const loadDetail = async () => {
    const res = await ProductService.wDetail(idProduct);
    console.log("[loadDetail] raw response:", JSON.stringify(res.result, null, 2));
    if (res.code === 0) {
      setDetailProduct(res.result);
      preFill(res.result);
    }
  };

  const loadUnits = async () => setListUnit((await SelectOptionData("unit")) || []);

  // ── Load / Save đơn vị quy đổi ──
  const loadUnitExchange = async () => {
    if (!idProduct) return;
    try {
      const res = await fetch(`${urls.unitExchange.listByProduct}?productId=${idProduct}`).then(r => r.json());
      const items = res?.result ?? res?.data ?? [];
      setUnitExchangeList(items.length ? items.map((i: any) => ({
        id: i.id,
        productId: i.productId,
        unitId: i.unitId ?? null,
        unitName: i.unitName ?? "",
        isBasis: i.isBasis ?? 0,
        exchange: i.exchange ?? 1,
      })) : [makeEmptyUE()]);
    } catch { /* giữ default nếu lỗi */ }
  };

  const handleSaveUnitExchange = async () => {
    if (!idProduct) return;
    const valid = unitExchangeList.filter(u => u.unitId);
    if (!valid.length) { showToast("Vui lòng chọn ít nhất 1 đơn vị", "error"); return; }
    const basisCount = valid.filter(u => u.isBasis === 1).length;
    if (basisCount === 0) { showToast("Vui lòng chọn 1 đơn vị làm đơn vị cơ bản", "error"); return; }
    if (basisCount > 1) { showToast("Chỉ được chọn 1 đơn vị cơ bản", "error"); return; }
    setIsSavingUE(true);
    try {
      const results = await Promise.all(valid.map(u =>
        fetch(urls.unitExchange.update, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...u, productId: idProduct, isBasis: u.isBasis }),
        }).then(r => r.json())
      ));
      const failed = results.find(r => r.code !== 0 && r.status !== 1);
      if (failed) showToast(failed.message ?? "Lỗi lưu đơn vị quy đổi", "error");
      else { showToast("Đã lưu đơn vị quy đổi", "success"); await loadUnitExchange(); }
    } catch { showToast("Lỗi kết nối", "error"); }
    finally { setIsSavingUE(false); }
  };

  const handleDeleteUE = async (index: number) => {
    const item = unitExchangeList[index];
    if (item.id) {
      const res = await fetch(`${urls.unitExchange.delete}?id=${item.id}`, { method: "DELETE" }).then(r => r.json());
      if (res.code !== 0 && res.status !== 1) { showToast(res.message ?? "Lỗi xóa", "error"); return; }
    }
    setUnitExchangeList(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [makeEmptyUE()];
    });
  };

  const loadCategories = async () => {
    const res = await CategoryServiceService.list({ page: 1, limit: 100 });
    if (res.code === 0) {
      const items = Array.isArray(res.result) ? res.result : res.result?.items || [];
      setListCategory(
        items.map((i: any) => ({
          value: i.id ?? i.groupId,
          label: i.name ?? i.groupName,
        }))
      );
    }
  };

  const loadAvailableTags = async () => {
    const res = await ProductService.wTagList("");
    if (res.code === 0) {
      const items = Array.isArray(res.result) ? res.result : res.result?.items || [];
      // Lọc bỏ tag không có name (null/undefined) để tránh crash .toLowerCase()
      setAvailableTags(
        items
          .filter((i: any) => i.name != null)
          .map((i: any) => ({ id: i.id, name: i.name }))
      );
    }
  };

  // ── Helper: map backend response (0/1) → formData fields (boolean) ──
  const applyWebsiteSettingToForm = (r: any) => {
    if (!r) return;
    setFormData((prev) => ({
      ...prev,
      showOnWeb:           r.showOnWebsite === 1,
      showImage:           r.showImage === 1,
      showUnit:            r.showUnit === 1,
      showDesc:            r.showDescription === 1,
      showPromoPrice:      r.showPromotionPrice === 1,
      showWholesalePrice:  r.showWholesalePrice === 1,
      showStock:           r.showInventory === 1,
      showBarcode:         r.showBarcode === 1,
      showCategory:        r.showVariant === 1,
      hideWhenOutOfStock:  r.hideWhenOutOfStock === 1,
    }));
  };

  // Load cài đặt hiển thị của SP cụ thể (khi edit)
  const loadWebsiteSetting = async () => {
    if (!idProduct) return;
    const res = await ProductService.wWebsiteSettingGet(idProduct);
    if (res.code === 0) applyWebsiteSettingToForm(res.result);
  };

  // Load cài đặt mặc định toàn hệ thống (khi tạo SP mới)
  const loadDefaultWebsiteSetting = async () => {
    const res = await ProductService.wWebsiteSettingDefaultGet();
    if (res.code === 0) applyWebsiteSettingToForm(res.result);
  };

  // ── Content editor handlers ──
  const handleSaveContent = async () => {
    if (!idProduct) return;
    setIsSavingContent(true);
    try {
      const res = await ProductService.wDescriptionUpdate({
        productId: idProduct,
        content: contentHtml,
        contentDelta,
      });
      if (res.code === 0) showToast("Đã lưu mô tả chi tiết", "success");
      else showToast(res.message ?? "Lỗi lưu mô tả", "error");
    } finally {
      setIsSavingContent(false);
    }
  };

  // ── Tag handlers ──
  const toggleTag = (id: number) => {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreateTag = async () => {
    const name = tagInput.trim();
    if (!name) return;
    setIsCreatingTag(true);
    try {
      const res = await ProductService.wTagCreate({ name });
      if (res.code === 0) {
        const newId = res.result;
        setAvailableTags(prev => [...prev, { id: newId, name }]);
        // Tính newTagIds trực tiếp để tránh stale closure khi gọi save ngay sau
        const newTagIds = [...selectedTagIds, newId];
        setSelectedTagIds(newTagIds);
        setTagInput("");
        showToast(`Đã tạo tag "${name}"`, "success");
        // Auto-save tags ngay sau khi tạo (không bắt user phải ấn "Lưu tags" thêm lần nữa)
        if (idProduct) {
          await ProductService.wTagUpdate({ productId: idProduct, tagIds: newTagIds });
        }
      } else {
        showToast(res.message ?? "Lỗi tạo tag", "error");
      }
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSaveTags = async () => {
    if (!idProduct) return;
    const uniqueTagIds = [...new Set(selectedTagIds)];
    const res = await ProductService.wTagUpdate({ productId: idProduct, tagIds: uniqueTagIds });
    if (res.code === 0) {
      setSelectedTagIds(uniqueTagIds); // cập nhật state luôn với list đã dedupe
      showToast("Đã lưu tags", "success");
    } else showToast(res.message ?? "Lỗi lưu tags", "error");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast("Vui lòng nhập tên sản phẩm", "error");
      return;
    }
    if (combinations.length === 0) {
      showToast("Vui lòng thêm ít nhất 1 biến thể sản phẩm", "error");
      setActiveTab("variants");
      return;
    }
    const longSku = combinations.find((c) => c.sku && c.sku.length > 20);
    if (longSku) {
      showToast(`SKU biến thể "${longSku.label}" vượt quá 20 ký tự`, "error");
      setActiveTab("variants");
      return;
    }
    const missingPrice = combinations.find((c) => !c.price || +c.price === 0);
    if (missingPrice) {
      showToast(`Biến thể "${missingPrice.label}" chưa có giá bán`, "error");
      setActiveTab("variants");
      return;
    }
    const activeAttrs = variantAttrs.filter((a) => a.name.trim() && a.values.length > 0);
    // ── Build variantGroups ──
    const variantGroups = activeAttrs.map((attr) => ({
      ...(attr.id ? { id: attr.id } : {}),
      name: attr.name,
      options: attr.values.map((val) => ({
        ...(attr.optionIds?.[val] ? { id: attr.optionIds[val] } : {}),
        label: val,
      })),
    }));

    // ── Build variants ──
    const variants = combinations.map((c) => {
      const firstUp = c.variantPrices[0];

      // Parse key "Màu sắc:Hồng|Size:8 GB" → [{ name, value }, ...]
      const keyParts = c.key.split("|").map((k) => {
        const idx = k.indexOf(":");
        return { name: k.slice(0, idx), value: k.slice(idx + 1) };
      });

      const selectedOptions = activeAttrs.map((attr) => ({
        groupName: attr.name,
        label: keyParts.find((k) => k.name === attr.name)?.value ?? "",
      }));

      const variantSku = safeSku(c.sku?.trim() || generateSku(formData.name, c.label));

      // Map selectedOptions → attributes: [{ name, value }]
      const attributes = selectedOptions.map((o) => ({ name: o.groupName, value: o.label }));

      // Lấy optionValueIds từ optionIds đã lưu trong attrs
      const optionValueIds = activeAttrs
        .map((attr) => {
          const value = keyParts.find((k) => k.name === attr.name)?.value ?? "";
          return attr.optionIds?.[value] ?? null;
        })
        .filter((id): id is number => id != null);

      return {
        ...(c.id ? { id: c.id } : {}),
        label: c.label,
        sku: variantSku,
        barcode: c.barcode || "",
        unitId: c.unitId ?? null,
        price: +(c.price ?? 0) || 0,
        costPrice: +(c.costPrice ?? 0) || 0,
        priceWholesale: +(c.priceWholesale ?? 0) || 0,
        pricePromo: +(c.pricePromo ?? 0) || 0,
        pricePromotion: +(c.pricePromo ?? 0) || 0,
        images: c.images || [],
        attributes,
        selectedOptions,
        ...(optionValueIds.length ? { optionValueIds } : {}),
        variantPrices: c.variantPrices.map((u) => ({
          ...(u.id ? { id: u.id } : {}),
          unitId: u.unitId,
          unitName: u.unitName,
          price: +(u.price ?? 0) || 0,
        })),
      };
    });

    console.log("[variantPrices] data gửi lên theo từng biến thể:");
    variants.forEach((v) => {
      console.log(`  variant "${v.label}" (id=${(v as any).id ?? "new"}):`, JSON.stringify(v.variantPrices, null, 2));
    });

    const defaultVariant = {
      label: "Mac dinh",
      sku: safeSku(toSkuPart(formData.name), "SP"),
      price: 0,
      costPrice: 0,
      priceWholesale: 0,
      pricePromo: 0,
    };

    const body = {
      ...(idProduct ? { id: idProduct } : {}),
      name: formData.name,
      position: detailProduct?.position ?? 0,
      status: formData.status,
      categoryId: selectedCategory?.value ?? null,
      trackStock: formData.trackStock,
      stock: +(formData.stock ?? 0) || 0,
      minStock: +(formData.minStock ?? 0) || 0,
      maxStock: +(formData.maxStock ?? 0) || 0,
      exchange: 1,
      otherUnits: detailProduct?.otherUnits ?? "",
      type: detailProduct?.type ? String(detailProduct.type) : "1",
      description: formData.description,
      variantGroups,
      variants: variants.length > 0 ? variants : [defaultVariant],
    };

    console.log("[AddProduct] submit body:", JSON.stringify(body, null, 2));
    setIsSubmitting(true);
    try {
      const res = await ProductService.wUpdate(body as any);
      if (res.code === 0) {
        // Lưu content, tags và website settings song song sau khi lưu SP thành công
        const savedId = idProduct || res.result?.id || res.result;
        if (savedId) {
          const sideEffects: Promise<any>[] = [];
          if (contentHtml || contentDelta) {
            sideEffects.push(
              ProductService.wDescriptionUpdate({ productId: savedId, content: contentHtml, contentDelta })
            );
          }
          if (selectedTagIds.length > 0) {
            sideEffects.push(
              ProductService.wTagUpdate({ productId: savedId, tagIds: selectedTagIds })
            );
          }
          // Luôn lưu website settings (kể cả khi tạo mới — ghi đè default)
          sideEffects.push(
            ProductService.wWebsiteSettingUpdate({
              productId: savedId,
              showOnWebsite:     formData.showOnWeb          ? 1 : 0,
              showImage:         formData.showImage          ? 1 : 0,
              showUnit:          formData.showUnit           ? 1 : 0,
              showDescription:   formData.showDesc           ? 1 : 0,
              showPromotionPrice:formData.showPromoPrice     ? 1 : 0,
              showWholesalePrice:formData.showWholesalePrice ? 1 : 0,
              showInventory:     formData.showStock          ? 1 : 0,
              showBarcode:       formData.showBarcode        ? 1 : 0,
              showVariant:       formData.showCategory       ? 1 : 0,
              hideWhenOutOfStock:formData.hideWhenOutOfStock ? 1 : 0,
            })
          );
          if (sideEffects.length) await Promise.allSettled(sideEffects);
        }
        showToast(isEdit ? "Cập nhật sản phẩm thành công" : "Thêm sản phẩm thành công", "success");
        onBack(true);
      } else {
        showToast(res.error ?? res.message ?? "Có lỗi xảy ra", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── VARIANT HANDLERS ──
  const syncCombinations = (attrs: VariantAttribute[]) => {
    const next = buildCombinations(attrs);
    setCombinations((prev) =>
      next.map((c) => {
        const existing = prev.find((p) => p.key === c.key);
        return {
          ...c,
          sku: existing?.sku || generateSku(formData.name, c.label),
          barcode: existing?.barcode || "",
          images: existing?.images || [],
          unitId: existing?.unitId ?? null,
          price: existing?.price ?? "",
          costPrice: existing?.costPrice ?? "",
          priceWholesale: existing?.priceWholesale ?? "",
          pricePromo: existing?.pricePromo ?? "",
          variantPrices: existing?.variantPrices?.length ? existing.variantPrices : [makeEmptyUnitPrice()],
        };
      })
    );
  };

  const addAttr = () => setVariantAttrs((prev) => [...prev, { tempId: genId(), name: "", values: [], inputVal: "" }]);

  const removeAttr = (id: string) => {
    const updated = variantAttrs.filter((a) => a.tempId !== id);
    setVariantAttrs(updated);
    syncCombinations(updated);
  };

  const updateAttrName = (id: string, name: string) => setVariantAttrs((prev) => prev.map((a) => (a.tempId === id ? { ...a, name } : a)));

  const confirmAttrName = () => syncCombinations(variantAttrs);

  const addValue = (id: string) => {
    const updated = variantAttrs.map((a) => {
      if (a.tempId !== id) return a;
      const v = a.inputVal.trim();
      if (!v || a.values.includes(v)) return { ...a, inputVal: "" };
      return { ...a, values: [...a.values, v], inputVal: "" };
    });
    setVariantAttrs(updated);
    syncCombinations(updated);
  };

  const removeValue = (id: string, val: string) => {
    const updated = variantAttrs.map((a) => (a.tempId === id ? { ...a, values: a.values.filter((v) => v !== val) } : a));
    setVariantAttrs(updated);
    syncCombinations(updated);
  };

  const updateComboSku = (key: string, sku: string) => setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, sku } : c)));

  const updateComboImages = (key: string, images: string[]) => {
    setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, images } : c)));
  };

  // Cập nhật field trực tiếp trên variant (barcode, price, costPrice, priceWholesale, pricePromo)
  const updateComboField = (key: string, field: keyof VariantCombination, value: any) =>
    setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, [field]: value } : c)));

  // ── UNIT PRICE HANDLERS ──
  // Biến thể đầu tiên: thêm hàng → tự động thêm vào tất cả biến thể còn lại
  // Biến thể 2+: thêm/xóa độc lập, không ảnh hưởng biến thể khác
  const addUnitPrice = (comboKey: string) => {
    setCombinations((prev) => {
      const isFirst = prev[0]?.key === comboKey;
      if (isFirst) {
        // Propagate thêm hàng mới đến TẤT CẢ biến thể
        return prev.map((c) => ({
          ...c,
          variantPrices: [...c.variantPrices, makeEmptyUnitPrice()],
        }));
      }
      // Biến thể 2+: chỉ thêm vào biến thể đó
      return prev.map((c) => (c.key === comboKey ? { ...c, variantPrices: [...c.variantPrices, makeEmptyUnitPrice()] } : c));
    });
  };

  const removeUnitPrice = (comboKey: string, tempId: string) =>
    setCombinations((prev) =>
      prev.map((c) => {
        if (c.key !== comboKey) return c;
        const filtered = c.variantPrices.filter((u) => u.tempId !== tempId);
        return { ...c, variantPrices: filtered.length ? filtered : [makeEmptyUnitPrice()] };
      })
    );

  const updateUnitPrice = (comboKey: string, tempId: string, field: keyof UnitPrice, value: any) =>
    setCombinations((prev) => {
      const isFirst = prev[0]?.key === comboKey;
      if (isFirst) {
        // Tìm index của row trong variant 1
        const rowIndex = prev[0].variantPrices.findIndex((u) => u.tempId === tempId);
        return prev.map((c) => {
          if (c.key === comboKey) {
            // Cập nhật variant 1 theo tempId
            return { ...c, variantPrices: c.variantPrices.map((u) => (u.tempId === tempId ? { ...u, [field]: value } : u)) };
          }
          // Áp dụng cùng field/value vào row cùng vị trí ở variants còn lại
          return {
            ...c,
            variantPrices: c.variantPrices.map((u, ui) => (ui === rowIndex ? { ...u, [field]: value } : u)),
          };
        });
      }
      // Biến thể 2+: chỉ cập nhật biến thể đó
      return prev.map((c) =>
        c.key === comboKey ? { ...c, variantPrices: c.variantPrices.map((u) => (u.tempId === tempId ? { ...u, [field]: value } : u)) } : c
      );
    });

  const handleDuplicate = async () => {
    if (!idProduct) return;
    setIsDuplicating(true);
    try {
      const activeAttrs = variantAttrs.filter((a) => a.name.trim() && a.values.length > 0);
      const dupVariantGroups = activeAttrs.map((attr) => ({
        name: attr.name,
        options: attr.values.map((val) => ({ label: val })),
      }));

      const dupVariants = combinations.map((c) => {
        // Sinh SKU mới: thêm suffix "-C" + timestamp + random để tránh trùng
        const base = (c.sku?.trim() || generateSku(formData.name, c.label)).replace(/-C$/, "").slice(0, 14);
        const ts = Date.now().toString(36).toUpperCase().slice(-3);
        const rnd = Math.random().toString(36).slice(2, 4).toUpperCase();
        const variantSku = safeSku(`${base}-C${ts}${rnd}`.slice(0, 19));

        const keyParts = c.key.split("|").map((k) => {
          const idx = k.indexOf(":");
          return { name: k.slice(0, idx), value: k.slice(idx + 1) };
        });
        return {
          label: c.label,
          sku: variantSku,
          barcode: generateEAN13(),   // sinh barcode mới hoàn toàn để tránh unique constraint
          unitId: c.unitId ?? null,
          price: +(c.price ?? 0) || 0,
          costPrice: +(c.costPrice ?? 0) || 0,
          priceWholesale: +(c.priceWholesale ?? 0) || 0,
          pricePromo: +(c.pricePromo ?? 0) || 0,
          pricePromotion: +(c.pricePromo ?? 0) || 0,
          images: c.images || [],
          selectedOptions: activeAttrs.map((attr) => ({
            groupName: attr.name,
            label: keyParts.find((k) => k.name === attr.name)?.value ?? "",
          })),
          variantPrices: c.variantPrices.map((u, ui) => ({
            sku: safeSku(`${variantSku}-${toSkuPart(u.unitName) || `U${ui + 1}`}`),
            unitId: u.unitId,
            unitName: u.unitName,
            price: +(u.price ?? 0) || 0,
          })),
        };
      });

      const body = {
        id: 0,
        name: `${formData.name} (Copy)`,
        position: 0,
        status: formData.status,
        categoryId: selectedCategory?.value ?? null,
        exchange: 1,
        otherUnits: detailProduct?.otherUnits ?? "",
        type: detailProduct?.type ? String(detailProduct.type) : "1",
        description: formData.description,
        minStock: formData.minStock ?? null,
        maxStock: formData.maxStock ?? null,
        variantGroups: dupVariantGroups,
        variants:
          dupVariants.length > 0
            ? dupVariants
            : [{
                label: "Mac dinh",
                sku: safeSku(`${toSkuPart(formData.name) || "SP"}-C`),
                barcode: generateEAN13(),
                price: 0,
                costPrice: 0,
                priceWholesale: 0,
                pricePromo: 0,
              }],
      };

      const res = await ProductService.wUpdate(body as any);
      if (res.code !== 0) {
        showToast(res.error ?? res.message ?? "Có lỗi xảy ra", "error");
        return;
      }

      // Lấy id sản phẩm vừa tạo
      const newId = res.result?.id ?? res.result;
      if (newId) {
        const sideEffects: Promise<any>[] = [];

        // Copy mô tả chi tiết
        if (contentHtml || contentDelta) {
          sideEffects.push(
            ProductService.wDescriptionUpdate({ productId: newId, content: contentHtml, contentDelta })
          );
        }

        // Copy tags
        if (selectedTagIds.length > 0) {
          sideEffects.push(
            ProductService.wTagUpdate({ productId: newId, tagIds: selectedTagIds })
          );
        }

        if (sideEffects.length) await Promise.allSettled(sideEffects);
      }

      showToast("Nhân bản sản phẩm thành công", "success");
      onBack(true);
    } finally {
      setIsDuplicating(false);
    }
  };

  // ── RENDER ──
  return (
    <div className="add-prod-page">
      {/* TOOLBAR */}
      <div className="add-prod-page__toolbar">
        <div className="add-prod-page__toolbar-left">
          <button className="add-prod-page__back-btn" onClick={() => onBack(false)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>{" "}
            Quay lại
          </button>
          <span className="add-prod-page__divider">|</span>
          <span className="add-prod-page__title">{isEdit ? `Chỉnh sửa: ${formData.name || "Sản phẩm"}` : "Thêm sản phẩm mới"}</span>
        </div>
        <div className="add-prod-page__toolbar-right">
          {/* Nút Chia sẻ — chỉ hiện khi đang edit sản phẩm đã có id */}
          {isEdit && (
            <button
              className="add-prod-page__btn add-prod-page__btn--share"
              onClick={() => setShowShareModal(true)}
              title="Chia sẻ link sản phẩm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Chia sẻ
            </button>
          )}
          {/* Xem trước Web — split button với dropdown 2 lựa chọn */}
          <div className="add-prod-page__preview-wrap" style={{ position: "relative" }}>
            <div className={`add-prod-page__preview-btn-group${!isEdit ? " add-prod-page__preview-btn-group--disabled" : ""}`}>
              {/* Main label */}
              <button
                className="add-prod-page__btn add-prod-page__btn--outline add-prod-page__preview-main"
                disabled={!isEdit}
                onClick={() => setShowWebPreviewDropdown((v) => !v)}
                title={!isEdit ? "Lưu sản phẩm trước để xem trước" : ""}
              >
                Xem trước Web
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ marginLeft: 4, transition: "transform 0.15s", transform: showWebPreviewDropdown ? "rotate(180deg)" : "none" }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>

            {/* Dropdown */}
            {showWebPreviewDropdown && isEdit && (
              <>
                {/* Overlay trong suốt để đóng dropdown */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 999 }}
                  onClick={() => setShowWebPreviewDropdown(false)}
                />
                <div className="add-prod-preview-dropdown">
                  {/* Cách 1: Mở tab website thật */}
                  <button
                    className="add-prod-preview-dropdown__item"
                    onClick={() => {
                      setShowWebPreviewDropdown(false);
                      window.open(buildProductWebUrl(), "_blank", "noopener,noreferrer");
                    }}
                  >
                    <div className="add-prod-preview-dropdown__icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </div>
                    <div className="add-prod-preview-dropdown__content">
                      <div className="add-prod-preview-dropdown__title">Mở trang web thật</div>
                      <div className="add-prod-preview-dropdown__sub">Mở tab mới — xem đúng trang khách hàng thấy</div>
                    </div>
                  </button>

                  <div className="add-prod-preview-dropdown__divider" />

                  {/* Cách 2: Preview trong CRM */}
                  <button
                    className="add-prod-preview-dropdown__item"
                    onClick={() => {
                      setShowWebPreviewDropdown(false);
                      setShowWebPreviewModal(true);
                    }}
                  >
                    <div className="add-prod-preview-dropdown__icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </div>
                    <div className="add-prod-preview-dropdown__content">
                      <div className="add-prod-preview-dropdown__title">Preview trong CRM</div>
                      <div className="add-prod-preview-dropdown__sub">Xem mock-up ngay tại đây — không cần mở tab</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              className="add-prod-page__btn add-prod-page__btn--outline"
              onClick={() => setShowBarcodePrintModal(true)}
              disabled={combinations.length === 0}
              title={combinations.length === 0 ? "Cần có ít nhất 1 biến thể" : "In mã vạch"}
            >
              In mã vạch
            </button>
            <button
              className="add-prod-page__btn add-prod-page__btn--outline"
              style={{ padding: "0 8px", minWidth: 28, fontWeight: 700, color: "#6b7280" }}
              onClick={() => barcodeTour.start()}
              title="Xem hướng dẫn in mã vạch"
            >
              ?
            </button>
          </div>
          <button className="add-prod-page__btn add-prod-page__btn--primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="add-prod-tabs">
        <button className={`add-prod-tabs__item${activeTab === "info" ? " add-prod-tabs__item--active" : ""}`} onClick={() => setActiveTab("info")}>
          Thông tin sản phẩm
        </button>
        <button
          className={`add-prod-tabs__item${activeTab === "variants" ? " add-prod-tabs__item--active" : ""}`}
          onClick={() => setActiveTab("variants")}
        >
          Cài đặt biến thể
          {combinations.length > 0 && <span className="add-prod-tabs__badge">{combinations.length}</span>}
        </button>
      </div>

      {/* BODY */}
      <div className="add-prod-page__body">
        {/* ════ TAB: THÔNG TIN SẢN PHẨM ════ */}
        {activeTab === "info" && (
          <>
            <div className="add-prod-page__left">
              {/* Thông tin cơ bản */}
              <div className="add-prod-card">
                <div className="add-prod-card__title">Thông tin cơ bản</div>
                <div className="add-prod-field add-prod-field--full">
                  <label>
                    Tên sản phẩm <span className="required">*</span>
                  </label>
                  <input type="text" value={formData.name} onChange={(e) => setField("name", e.target.value)} placeholder="Nhập tên sản phẩm..." />
                </div>
                <div className="add-prod-field add-prod-field--full" style={{ marginTop: 12 }}>
                  <label>Danh mục sản phẩm</label>
                  <SelectCustom
                    id="categoryId"
                    name="categoryId"
                    value={selectedCategory?.value ?? null}
                    options={listCategory}
                    onChange={(e) => {
                      setSelectedCategory(e);
                      setField("categoryId", e?.value ?? null);
                      setField("categoryName", e?.label ?? "");
                    }}
                    onMenuOpen={loadCategories}
                    placeholder="Chọn danh mục..."
                    isSearchable
                    isClearable
                  />
                </div>
              </div>

              {/* Mô tả ngắn */}
              <div className="add-prod-card">
                <div className="add-prod-card__title">Mô tả ngắn</div>
                <TextArea
                  label="Mô tả ngắn (hiển thị trên Website)"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Nhập mô tả ngắn cho trang web bán hàng..."
                  fill={true}
                  row={3}
                />
              </div>

              {/* Mô tả chi tiết — Editor */}
              <div className="add-prod-card">
                <div className="add-prod-card__title">
                  Mô tả chi tiết
                  {isEdit && (
                    <button
                      className="add-prod-card__title-action"
                      onClick={handleSaveContent}
                      disabled={isSavingContent}
                    >
                      {isSavingContent ? "Đang lưu..." : "Lưu mô tả"}
                    </button>
                  )}
                </div>
                <p className="add-prod-editor-hint">Soạn thảo nội dung chi tiết hiển thị trên trang sản phẩm (website bán hàng). Hỗ trợ định dạng văn bản, chèn ảnh, bảng biểu...</p>
                <div className="add-prod-editor-wrap">
                  <RebornEditor
                    name="contentDetail"
                    fill={true}
                    initialValue={contentHtml || ""}
                    onChangeContent={(value: any) => {
                      setContentHtml(serialize({ children: value }));
                      setContentDelta(JSON.stringify(value));
                    }}
                    placeholder="Nhập mô tả chi tiết sản phẩm..."
                  />
                </div>
                {!isEdit && (
                  <p className="add-prod-editor-note">💡 Mô tả chi tiết sẽ được lưu tự động khi bạn nhấn "Lưu sản phẩm".</p>
                )}
              </div>

              {/* Tags sản phẩm */}
              <div className="add-prod-card">
                <div className="add-prod-card__title">
                  Tags sản phẩm
                  {isEdit && (
                    <button className="add-prod-card__title-action" onClick={handleSaveTags}>
                      Lưu tags
                    </button>
                  )}
                </div>
                <p className="add-prod-editor-hint">Gắn nhãn để dễ tìm kiếm và lọc sản phẩm. Có thể tạo tag mới ngay tại đây.</p>
                <div className="add-prod-tags">
                  {/* Chips đã chọn */}
                  {selectedTagIds.length > 0 && (
                    <div className="add-prod-tags__selected">
                      {selectedTagIds.map(id => {
                        const tag = availableTags.find(t => t.id === id);
                        if (!tag) return null;
                        return (
                          <span key={id} className="add-prod-tag-chip">
                            {tag.name}
                            <button type="button" onClick={() => toggleTag(id)} title="Xóa tag">×</button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {/* Input tìm/tạo tag */}
                  <div className="add-prod-tags__input-wrap">
                    <div className="add-prod-tags__input-row">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input
                        type="text"
                        className="add-prod-tags__input"
                        placeholder="Tìm hoặc tạo tag mới..."
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onFocus={() => setTagDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setTagDropdownOpen(false), 180)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const match = availableTags.find(t => t.name?.toLowerCase() === tagInput.trim().toLowerCase());
                            if (match) toggleTag(match.id);
                            else if (tagInput.trim()) handleCreateTag();
                          }
                        }}
                      />
                    </div>
                    {tagDropdownOpen && (
                      <div className="add-prod-tags__dropdown">
                        {availableTags
                          .filter(t => t.name?.toLowerCase().includes(tagInput.toLowerCase()))
                          .slice(0, 12)
                          .map(t => (
                            <div
                              key={t.id}
                              className={`add-prod-tags__option${selectedTagIds.includes(t.id) ? " add-prod-tags__option--selected" : ""}`}
                              onMouseDown={e => { e.preventDefault(); toggleTag(t.id); }}
                            >
                              {selectedTagIds.includes(t.id) && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                              )}
                              <span>{t.name}</span>
                            </div>
                          ))}
                        {tagInput.trim() && !availableTags.find(t => t.name?.toLowerCase() === tagInput.trim().toLowerCase()) && (
                          <div
                            className="add-prod-tags__option add-prod-tags__option--create"
                            onMouseDown={e => { e.preventDefault(); handleCreateTag(); }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            <span>{isCreatingTag ? "Đang tạo..." : `Tạo tag "${tagInput.trim()}"`}</span>
                          </div>
                        )}
                        {availableTags.filter(t => t.name?.toLowerCase().includes(tagInput.toLowerCase())).length === 0 && !tagInput.trim() && (
                          <div className="add-prod-tags__empty">Chưa có tag nào. Nhập tên để tạo mới.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tồn kho */}
              <div className="add-prod-card">
                <div className="add-prod-card__title">Quản lý tồn kho</div>
                <div className="add-prod-stock-header">
                  <div>
                    <div className="add-prod-stock-header__label">Theo dõi tồn kho</div>
                    <div className="add-prod-stock-header__sub">Hệ thống sẽ tự động trừ khi có đơn hàng</div>
                  </div>
                  <label className="add-prod-toggle">
                    <input type="checkbox" checked={formData.trackStock} onChange={(e) => setField("trackStock", e.target.checked)} />
                    <span className="add-prod-toggle__slider" />
                  </label>
                </div>
                {formData.trackStock && (
                  <div className="add-prod-form-grid" style={{ marginTop: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                    <div className="add-prod-field">
                      <label>Ngưỡng cảnh báo sắp hết</label>
                      <input type="number" value={formData.minStock} onChange={(e) => setField("minStock", +e.target.value)} />
                    </div>
                    <div className="add-prod-field">
                      <label>Ngưỡng cảnh báo quá hàng</label>
                      <input type="number" value={formData.maxStock} onChange={(e) => setField("maxStock", +e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Đơn vị quy đổi ── */}
              <div className="add-prod-card">
                <div className="add-prod-card__title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Đơn vị quy đổi</span>
                  {isEdit && (
                    <button className="add-prod-card__title-action" onClick={handleSaveUnitExchange} disabled={isSavingUE}>
                      {isSavingUE ? "Đang lưu..." : "Lưu đơn vị"}
                    </button>
                  )}
                </div>
                <div className="add-prod-ue-hint">Định nghĩa tỷ lệ quy đổi giữa các đơn vị tính (VD: 1 Thùng = 24 Chai). Chọn 1 đơn vị làm cơ bản.</div>

                {/* Header bảng */}
                <div className="add-prod-ue-table-head">
                  <span className="add-prod-ue-col add-prod-ue-col--unit">Đơn vị</span>
                  <span className="add-prod-ue-col add-prod-ue-col--exchange">Tỷ lệ quy đổi</span>
                  <span className="add-prod-ue-col add-prod-ue-col--basis">Đơn vị cơ bản</span>
                  <span className="add-prod-ue-col add-prod-ue-col--action" />
                </div>

                {unitExchangeList.map((ue, idx) => (
                  <div className="add-prod-ue-row" key={idx}>
                    {/* Chọn đơn vị */}
                    <div className="add-prod-ue-col add-prod-ue-col--unit">
                      <SelectCustom
                        id={`ue-unit-${idx}`}
                        name={`ue-unit-${idx}`}
                        value={ue.unitId}
                        options={listUnit}
                        onChange={(e: IOption | null) => {
                          const next = [...unitExchangeList];
                          next[idx] = { ...next[idx], unitId: e?.value ?? null, unitName: e?.label ?? "" };
                          setUnitExchangeList(next);
                        }}
                        onMenuOpen={async () => { if (!listUnit.length) await loadUnits(); }}
                        placeholder="Chọn đơn vị..."
                        isClearable
                        isSearchable
                      />
                    </div>

                    {/* Tỷ lệ quy đổi */}
                    <div className="add-prod-ue-col add-prod-ue-col--exchange">
                      <input
                        type="number"
                        min={1}
                        value={ue.exchange}
                        onChange={(e) => {
                          const next = [...unitExchangeList];
                          next[idx] = { ...next[idx], exchange: Math.max(1, +e.target.value || 1) };
                          setUnitExchangeList(next);
                        }}
                        className="add-prod-ue-exchange-input"
                        disabled={ue.isBasis === 1}
                      />
                    </div>

                    {/* Radio đơn vị cơ bản */}
                    <div className="add-prod-ue-col add-prod-ue-col--basis">
                      <label className="add-prod-ue-basis-label">
                        <input
                          type="radio"
                          name="ue-basis"
                          checked={ue.isBasis === 1}
                          onChange={() => {
                            setUnitExchangeList(prev => prev.map((u, i) => ({
                              ...u,
                              isBasis: i === idx ? 1 : 0,
                              exchange: i === idx ? 1 : u.exchange, // đơn vị cơ bản exchange = 1
                            })));
                          }}
                        />
                        <span>{ue.isBasis === 1 ? "Cơ bản" : "Đặt làm cơ bản"}</span>
                      </label>
                    </div>

                    {/* Xóa */}
                    <div className="add-prod-ue-col add-prod-ue-col--action">
                      <button
                        type="button"
                        className="add-prod-vt-unit-del"
                        onClick={() => handleDeleteUE(idx)}
                        title="Xóa dòng này"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Thêm dòng */}
                <button
                  type="button"
                  className="add-prod-vt-unit-add-btn"
                  style={{ marginTop: 10 }}
                  onClick={() => setUnitExchangeList(prev => [...prev, makeEmptyUE()])}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Thêm đơn vị quy đổi
                </button>

                {!isEdit && (
                  <div className="add-prod-ue-notice">Lưu sản phẩm trước, sau đó mới có thể cấu hình đơn vị quy đổi.</div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="add-prod-page__right">
              <div className="add-prod-right-box">
                <div className="add-prod-right-box__title">Trạng thái</div>
                <select value={formData.status} onChange={(e) => setField("status", +e.target.value)}>
                  <option value={1}>Đang bán</option>
                  <option value={0}>Tạm dừng</option>
                  <option value={2}>Ngừng kinh doanh</option>
                </select>
              </div>
              <div className="add-prod-right-box">
                <div className="add-prod-right-box__title">Cài đặt hiển thị Website</div>
                {DISPLAY_TOGGLES.map(({ key, label, sub }) => (
                  <div className="add-prod-toggle-row" key={key}>
                    <div>
                      <div className="add-prod-toggle-row__label">{label}</div>
                      <div className="add-prod-toggle-row__sub">{sub}</div>
                    </div>
                    <label className="add-prod-toggle">
                      <input type="checkbox" checked={!!formData[key]} onChange={(e) => setField(key, e.target.checked)} />
                      <span className="add-prod-toggle__slider" />
                    </label>
                  </div>
                ))}
              </div>
              {isEdit && (
                <div className="add-prod-right-box">
                  <div className="add-prod-right-box__title">Thao tác nhanh</div>
                  <button className="add-prod-quick-btn" onClick={handleDuplicate} disabled={isDuplicating}>
                    {isDuplicating ? "Đang xử lý..." : "Nhân bản sản phẩm"}
                  </button>
                  <button className="add-prod-quick-btn add-prod-quick-btn--danger">Xóa sản phẩm</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ════ TAB: BIẾN THỂ ════ */}
        {activeTab === "variants" && (
          <div className="add-prod-page__variant-panel">
            {/* Thuộc tính */}
            <div className="add-prod-card">
              <div className="add-prod-card__title">Thuộc tính biến thể</div>
              <p className="add-prod-vt__hint">Thêm các thuộc tính (Size, Màu sắc...) để hệ thống tự tạo các biến thể sản phẩm.</p>

              {variantAttrs.map((attr) => (
                <div className="add-prod-vt-attr" key={attr.tempId}>
                  <div className="add-prod-vt-attr__row">
                    <div className="add-prod-field" style={{ flex: 1 }}>
                      <label>Tên thuộc tính</label>
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => updateAttrName(attr.tempId, e.target.value)}
                        onBlur={confirmAttrName}
                        placeholder="VD: Size, Màu sắc, Chất liệu..."
                      />
                    </div>
                    <button className="add-prod-vt-attr__del" onClick={() => removeAttr(attr.tempId)}>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                  <div className="add-prod-vt-attr__values">
                    {attr.values.map((v) => (
                      <span className="add-prod-vt-tag" key={v}>
                        {v}
                        <button onClick={() => removeValue(attr.tempId, v)}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    <div className="add-prod-vt-attr__input-row">
                      <input
                        type="text"
                        value={attr.inputVal}
                        onChange={(e) =>
                          setVariantAttrs((prev) => prev.map((a) => (a.tempId === attr.tempId ? { ...a, inputVal: e.target.value } : a)))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addValue(attr.tempId);
                          }
                        }}
                        placeholder="Nhập giá trị, Enter để thêm..."
                      />
                      <button className="add-prod-scan-btn" onClick={() => addValue(attr.tempId)}>
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button className="add-prod-vt__add-btn" onClick={addAttr}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>{" "}
                Thêm thuộc tính
              </button>
            </div>

            {/* Danh sách biến thể */}
            {combinations.length > 0 && (
              <div className="add-prod-card">
                <div className="add-prod-card__title">
                  Chi tiết biến thể
                  <span className="add-prod-card__count">{combinations.length} biến thể</span>
                </div>

                {combinations.map((c, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <div className="add-prod-vt-combo-card" key={c.key}>
                      {/* Header: Tên biến thể + badge | SKU */}
                      <div className="add-prod-vt-combo-card__header">
                        {/* Tên biến thể */}
                        <div className="add-prod-vt-combo-card__label-wrap">
                          <span className="add-prod-vt-combo">{c.label}</span>
                          {isFirst && (
                            <Tippy content="Thêm đơn vị-giá ở biến thể này sẽ tự áp dụng cho tất cả biến thể còn lại" placement="top">
                              <span className="add-prod-vt-combo-card__first-badge">Biến thể gốc</span>
                            </Tippy>
                          )}
                        </div>

                        {/* SKU */}
                        <input
                          className="add-prod-vt-combo-card__sku"
                          type="text"
                          value={c.sku}
                          onChange={(e) => updateComboSku(c.key, e.target.value)}
                          placeholder="Mã SKU..."
                        />

                        {/* Barcode */}
                        <div className="add-prod-vt-combo-card__barcode-wrap">
                          <input
                            className="add-prod-vt-combo-card__barcode"
                            type="text"
                            value={c.barcode}
                            onChange={(e) => updateComboField(c.key, "barcode", e.target.value)}
                            placeholder="Mã vạch..."
                          />
                          <Tippy content="Quét mã vạch bằng camera" placement="top">
                            <button type="button" className="add-prod-scan-btn add-prod-scan-btn--icon" onClick={() => setScanningComboKey(c.key)}>
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                <line x1="7" y1="12" x2="17" y2="12" />
                              </svg>
                            </button>
                          </Tippy>
                          <Tippy content="Tự sinh mã EAN-13" placement="top">
                            <button
                              type="button"
                              className="add-prod-scan-btn add-prod-scan-btn--gen"
                              onClick={() => updateComboField(c.key, "barcode", generateEAN13())}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M15 4V2" />
                                <path d="M15 16v-2" />
                                <path d="M8 9h2" />
                                <path d="M20 9h2" />
                                <path d="M17.8 11.8L19 13" />
                                <path d="M15 9h.01" />
                                <path d="M17.8 6.2L19 5" />
                                <path d="M3 21l9-9" />
                                <path d="M12.2 6.2L11 5" />
                              </svg>
                            </button>
                          </Tippy>
                        </div>
                      </div>

                      {/* Ảnh biến thể */}
                      <VariantImagePicker images={c.images} onChange={(urls) => updateComboImages(c.key, urls)} />

                      {/* Đơn vị cơ bản */}
                      <div className="add-prod-vt-unit-row">
                        <Tippy
                          content="Đơn vị tính mặc định của biến thể này (VD: Chiếc, Cái, Hộp...). Dùng làm đơn vị gốc khi bán lẻ."
                          placement="top"
                        >
                          <label className="add-prod-vt-unit-row__label" style={{ cursor: "help" }}>
                            Đơn vị cơ bản
                          </label>
                        </Tippy>
                        <div className="add-prod-vt-unit-row__select">
                          <SelectCustom
                            id={`unitId-${c.key}`}
                            name="unitId"
                            value={c.unitId}
                            options={listUnit}
                            onChange={(e) => updateComboField(c.key, "unitId", e?.value ?? null)}
                            onMenuOpen={loadUnits}
                            placeholder="Chọn đơn vị..."
                            isSearchable
                            isClearable
                          />
                        </div>
                      </div>

                      {/* Giá biến thể */}
                      <div className="add-prod-vt-combo-card__price-grid">
                        {[
                          { field: "price", label: "Giá bán" },
                          { field: "costPrice", label: "Giá nhập" },
                          { field: "priceWholesale", label: "Giá sỉ" },
                          { field: "pricePromo", label: "Giá KM" },
                        ].map(({ field, label }) => (
                          <div className="add-prod-vt-price-col" key={field}>
                            <label className="add-prod-vt-price-col__label">{label}</label>
                            <div className="add-prod-vt-price">
                              <span className="add-prod-vt-price__icon">₫</span>
                              <NummericInput
                                value={c[field as keyof VariantCombination] as string | number}
                                onValueChange={(vals: any) => updateComboField(c.key, field as keyof VariantCombination, vals.floatValue ?? 0)}
                                placeholder="0"
                                thousandSeparator={true}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Danh sách đơn vị-giá */}
                      <div className="add-prod-vt-combo-card__prices">
                        {c.variantPrices.map((up) => (
                          <div className="add-prod-vt-unit-row" key={up.tempId}>
                            {/* Chọn đơn vị */}
                            <div className="add-prod-vt-unit-select">
                              <SelectCustom
                                id={`unit-${up.tempId}`}
                                name={`unit-${up.tempId}`}
                                value={up.unitId}
                                options={listUnit}
                                onChange={(e: IOption | null) => {
                                  updateUnitPrice(c.key, up.tempId, "unitId", e?.value ?? null);
                                  updateUnitPrice(c.key, up.tempId, "unitName", e?.label ?? "");
                                }}
                                onMenuOpen={async () => {
                                  if (!listUnit.length) setListUnit((await SelectOptionData("unit")) || []);
                                }}
                                placeholder="Chọn đơn vị..."
                                isClearable
                              />
                            </div>

                            {/* Nhập giá */}
                            <div className="add-prod-vt-price">
                              <span className="add-prod-vt-price__icon">₫</span>
                              <NummericInput
                                value={up.price}
                                onValueChange={(vals: any) => updateUnitPrice(c.key, up.tempId, "price", vals.floatValue ?? 0)}
                                placeholder="0"
                                thousandSeparator={true}
                              />
                            </div>

                            {/* Nút xóa */}
                            <Tippy content="Xóa đơn vị này" placement="top">
                              <button
                                type="button"
                                className="add-prod-vt-unit-del"
                                disabled={c.variantPrices.length === 1}
                                onClick={() => removeUnitPrice(c.key, up.tempId)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                              </button>
                            </Tippy>
                          </div>
                        ))}

                        {/* Nút thêm đơn vị */}
                        <Tippy
                          content={isFirst ? "Sẽ tự động thêm hàng mới vào tất cả biến thể còn lại" : "Chỉ thêm vào biến thể này"}
                          placement="top"
                        >
                          <button
                            type="button"
                            className={`add-prod-vt-unit-add-btn${isFirst ? " add-prod-vt-unit-add-btn--sync" : ""}`}
                            onClick={() => addUnitPrice(c.key)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            {isFirst ? "Thêm đơn vị bán (áp dụng tất cả)" : "Thêm đơn vị bán"}
                          </button>
                        </Tippy>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {variantAttrs.length === 0 && (
              <div className="add-prod-vt__empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <p>Chưa có thuộc tính nào.</p>
                <p>Thêm thuộc tính như Size, Màu sắc để tạo biến thể.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      {scanningComboKey && (
        <BarcodeScannerModal
          onScan={(barcode) => {
            updateComboField(scanningComboKey, "barcode", barcode);
            setScanningComboKey(null);
          }}
          onClose={() => setScanningComboKey(null)}
        />
      )}

      {/* Share Link Modal — chỉ hiện khi edit sản phẩm đã có id */}
      {showShareModal && isEdit && (
        <ShareLinkModal
          productId={idProduct}
          productName={formData.name}
          productAvatar={formData.avatar}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Barcode Print Modal */}
      {showBarcodePrintModal && (
        <BarcodePrintModal
          onShow={showBarcodePrintModal}
          onHide={() => setShowBarcodePrintModal(false)}
          productName={formData.name}
          variants={combinations.map((c) => ({
            id: c.id ?? Math.random(),
            label: c.label,
            sku: c.sku || "",
            barcode: c.barcode || "",
            price: c.price ?? 0,
          }))}
        />
      )}

      {/* Web Preview Modal (Cách 2 — mock UI trong CRM) */}
      {showWebPreviewModal && (
        <div className="web-preview-overlay" onClick={() => setShowWebPreviewModal(false)}>
          <div className="web-preview-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="web-preview-modal__header">
              <div className="web-preview-modal__header-left">
                <div className="web-preview-modal__dots">
                  <span style={{ background: "#ff5f56" }} />
                  <span style={{ background: "#ffbd2e" }} />
                  <span style={{ background: "#27c93f" }} />
                </div>
                <div className="web-preview-modal__url-bar">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span>{buildProductWebUrl()}</span>
                </div>
              </div>
              <button className="web-preview-modal__close" onClick={() => setShowWebPreviewModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Product page mock */}
            <div className="web-preview-modal__body">
              {/* Ảnh sản phẩm */}
              <div className="wp-product">
                <div className="wp-product__gallery">
                  {combinations[0]?.images?.[0] || detailProduct?.avatar ? (
                    <img
                      src={combinations[0]?.images?.[0] || (detailProduct as any)?.avatar}
                      alt={formData.name}
                      className="wp-product__main-img"
                    />
                  ) : (
                    <div className="wp-product__img-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                      <span>Chưa có ảnh</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="wp-product__info">
                  <h1 className="wp-product__name">{formData.name || "Tên sản phẩm"}</h1>

                  {selectedCategory && (
                    <div className="wp-product__category">{selectedCategory.label}</div>
                  )}

                  {/* Giá */}
                  {combinations.length > 0 && (
                    <div className="wp-product__price-block">
                      <span className="wp-product__price">
                        {(+(combinations[0]?.price ?? 0)).toLocaleString("vi-VN")}đ
                      </span>
                      {combinations[0]?.pricePromo && +combinations[0].pricePromo > 0 && (
                        <span className="wp-product__price-promo">
                          {(+combinations[0].pricePromo).toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>
                  )}

                  {/* Biến thể */}
                  {variantAttrs.filter((a) => a.name && a.values.length > 0).map((attr) => (
                    <div key={attr.tempId} className="wp-product__attr">
                      <div className="wp-product__attr-name">{attr.name}</div>
                      <div className="wp-product__attr-values">
                        {attr.values.map((val) => (
                          <button key={val} className="wp-product__attr-btn">{val}</button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Mô tả ngắn */}
                  {formData.description && (
                    <p className="wp-product__desc">{formData.description}</p>
                  )}

                  {/* Tồn kho */}
                  {formData.trackStock && (
                    <div className="wp-product__stock">
                      Còn lại: <strong>{formData.stock ?? 0}</strong>
                    </div>
                  )}

                  {/* Nút mua */}
                  <div className="wp-product__actions">
                    <button className="wp-product__btn-cart">Thêm vào giỏ</button>
                    <button className="wp-product__btn-buy">Mua ngay</button>
                  </div>

                  <div className="wp-preview-note">
                    👁 Đây là bản preview — giao diện thực tế tuỳ theo theme website của cửa hàng
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tour hướng dẫn in mã vạch */}
      <TourOverlay
        active={barcodeTour.active}
        step={barcodeTour.currentStep}
        stepIdx={barcodeTour.stepIdx}
        totalSteps={barcodeTour.totalSteps}
        target={barcodeTour.target}
        isFirst={barcodeTour.isFirst}
        isLast={barcodeTour.isLast}
        onNext={barcodeTour.next}
        onPrev={barcodeTour.prev}
        onSkip={barcodeTour.skip}
      />
    </div>
  );
}
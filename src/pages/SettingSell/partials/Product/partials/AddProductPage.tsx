import React, { useState, useEffect, useRef } from "react";
import Icon from "components/icon";
import FileUpload from "components/fileUpload/fileUpload";
import SelectCustom from "components/selectCustom/selectCustom";
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

type PageTab = "info" | "variants";

interface AddProductPageProps {
  idProduct: number | null;
  data?: any;
  onBack: (reload: boolean) => void;
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
  code: "",
  productLine: "",
  price: "" as string | number,
  priceWholesale: "" as string | number,
  pricePromo: "" as string | number,
  costPrice: "" as string | number,
  categoryId: null as number | null,
  categoryName: "",
  unitId: null as number | null,
  unitName: "",
  status: 1,
  description: "",
  avatar: "",
  trackStock: true,
  stock: 0,
  stockWarning: 20,
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
  name: string;
  values: string[];
  inputVal: string;
}

interface UnitPrice {
  tempId: string;
  unitId: number | null;
  unitName: string;
  price: string | number;
}

interface VariantCombination {
  key: string;
  label: string;
  sku: string;
  image: string; // ảnh riêng cho từng biến thể
  unitPrices: UnitPrice[];
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

const generateSku = (productName: string, comboLabel: string): string => {
  const namePart = toSkuPart(productName) || "SP";
  const valueParts = comboLabel
    .split("/")
    .map((v) => toSkuPart(v.trim()))
    .filter(Boolean)
    .join("-");
  // Suffix độc nhất: 4 ký tự cuối của timestamp (base36) + 2 ký tự random
  // → xác suất trùng gần như bằng 0 dù tạo cùng lúc
  const ts  = Date.now().toString(36).toUpperCase().slice(-4);
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
    image: "",
    unitPrices: [makeEmptyUnitPrice()],
  }));
};

// ── Compact image picker cho variant ──
function VariantImagePicker({
  image,
  onChange,
}: {
  image: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div
      className="vt-img-picker"
      onClick={() => inputRef.current?.click()}
      title="Chọn ảnh biến thể"
    >
      {image ? (
        <>
          <img src={image} alt="variant" className="vt-img-picker__img" />
          <button
            type="button"
            className="vt-img-picker__clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            ✕
          </button>
        </>
      ) : (
        <div className="vt-img-picker__placeholder">
          <Icon name="Camera" />
          <span>Ảnh</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </div>
  );
}

export default function AddProductPage({ idProduct, data, onBack }: AddProductPageProps) {
  const isEdit = !!idProduct;
  const [activeTab, setActiveTab] = useState<PageTab>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailProduct, setDetailProduct] = useState<IProductResponse>(null);
  const [listUnit, setListUnit] = useState<IOption[]>([]);
  const [listCategory, setListCategory] = useState<IOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{ value: number; label: string } | null>(null);
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  // Variants
  const [variantAttrs, setVariantAttrs] = useState<VariantAttribute[]>([]);
  const [combinations, setCombinations] = useState<VariantCombination[]>([]);

  const setField = (key: string, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    loadUnits();
    loadCategories();
    if (isEdit) loadDetail();
    else if (data) preFill(data);
  }, [idProduct]);

  const preFill = (p: any) => {
    setFormData((prev) => ({
      ...prev,
      name: p.name || "",
      code: p.code || "",
      productLine: p.productLine || "",
      price: p.price ?? "",
      priceWholesale: p.priceWholesale ?? "",
      pricePromo: p.pricePromo ?? "",
      costPrice: p.costPrice ?? "",
      categoryId: p.categoryId || null,
      categoryName: p.categoryName || "",
      unitId: p.unitId ?? null,
      unitName: p.unitName || "",
      status: p.status ?? 1,
      avatar: p.avatar || "",
      description: p.description || "",
      trackStock: p.trackStock ?? true,
      stock: p.stock ?? 0,
      stockWarning: p.stockWarning ?? 20,
      showOnWeb: p.showOnWeb ?? true,
      showImage: p.showImage ?? true,
      showUnit: p.showUnit ?? true,
      showDesc: p.showDesc ?? true,
      showPromoPrice: p.showPromoPrice ?? false,
      showWholesalePrice: p.showWholesalePrice ?? false,
      showStock: p.showStock ?? true,
      showBarcode: p.showBarcode ?? false,
      showCategory: p.showCategory ?? true,
      hideWhenOutOfStock: p.hideWhenOutOfStock ?? true,
    }));
    if (p.categoryId) setSelectedCategory({ value: p.categoryId, label: p.categoryName });

    // ── Load biến thể từ API ──
    if (p.variantGroups?.length) {
      // Map variantGroups → variantAttrs
      const attrs: VariantAttribute[] = p.variantGroups.map((g: any) => ({
        tempId: genId(),
        name: g.name,
        values: (g.options || []).map((o: any) => o.label),
        inputVal: "",
      }));
      setVariantAttrs(attrs);

      // Map variants → combinations (bỏ qua biến thể "Mac dinh" / default)
      const realVariants = (p.variants || []).filter(
        (v: any) => v.selectedOptions?.some((o: any) => o.groupName)
      );

      if (realVariants.length) {
        const combos: VariantCombination[] = realVariants.map((v: any) => {
          const mappedUnitPrices =
            v.unitPrices?.length > 0
              ? v.unitPrices.map((u: any) => ({
                  tempId: genId(),
                  unitId: u.unitId ?? null,
                  unitName: u.unitName ?? "",
                  price: u.price ?? "",
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
          const key = v.selectedOptions
            .filter((o: any) => o.groupName)
            .map((o: any) => `${o.groupName}:${o.label}`)
            .join("|");

          return {
            key,
            label: v.label,
            sku: v.sku || "",
            image: v.avatar || "",
            unitPrices: mappedUnitPrices,
          };
        });
        setCombinations(combos);
      }
    }
  };

  const loadDetail = async () => {
    const res = await ProductService.wDetail(idProduct);
    if (res.code === 0) {
      setDetailProduct(res.result);
      preFill(res.result);
    }
  };

  const loadUnits = async () => setListUnit((await SelectOptionData("unit")) || []);

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

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    setField("avatar", "");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast("Vui lòng nhập tên sản phẩm", "error");
      return;
    }
    if (!formData.description.trim()) {
      showToast("Vui lòng nhập mô tả sản phẩm", "error");
      return;
    }
    if (!formData.price) {
      showToast("Vui lòng nhập giá bán", "error");
      return;
    }

    const activeAttrs = variantAttrs.filter((a) => a.name.trim() && a.values.length > 0);

    // ── Build variantGroups (DB tự sinh ID) ──
    const variantGroups = activeAttrs.map((attr) => ({
      name: attr.name,
      options: attr.values.map((val) => ({ label: val })),
    }));

    // ── Build variants ──
    const variants = combinations.map((c) => {
      const firstUp = c.unitPrices[0];

      // Parse key "Màu sắc:Hồng|Size:8 GB" → [{ name, value }, ...]
      const keyParts = c.key.split("|").map((k) => {
        const idx = k.indexOf(":");
        return { name: k.slice(0, idx), value: k.slice(idx + 1) };
      });

      const selectedOptions = activeAttrs.map((attr) => ({
        groupName: attr.name,
        label: keyParts.find((k) => k.name === attr.name)?.value ?? "",
      }));

      const variantSku = c.sku?.trim() || generateSku(formData.name, c.label);

      return {
        label: c.label,
        sku: variantSku,
        price: +(firstUp?.price ?? 0) || 0,
        promotionPrice: 0,
        avatar: c.image || "",
        selectedOptions,
        unitPrices: c.unitPrices.map((u, ui) => {
          const unitPart = toSkuPart(u.unitName);
          // SKU unit-price = variantSku + đơn vị (hoặc index nếu chưa chọn đơn vị)
          const unitSku = `${variantSku}-${unitPart || `U${ui + 1}`}`;
          return {
            sku: unitSku,
            unitId: u.unitId,
            unitName: u.unitName,
            price: +(u.price ?? 0) || 0,
          };
        }),
      };
    });

    const defaultVariant = {
      label: "Mac dinh",
      sku: toSkuPart(formData.name) || `SP-${Date.now()}`,
      price: +formData.price,
    };

    const body = {
      id: idProduct || 0,
      name: formData.name,
      code: formData.code,
      productLine: formData.productLine,
      price: +formData.price,
      position: detailProduct?.position ?? 0,
      status: formData.status,
      avatar: formData.avatar,
      categoryId: selectedCategory?.value ?? null,
      exchange: 1,
      otherUnits: detailProduct?.otherUnits ?? "",
      type: detailProduct?.type ? String(detailProduct.type) : "1",
      description: formData.description,
      supplierId: null, // TODO: thêm field chọn NCC vào form
      costPrice: +formData.costPrice || 0,
      priceWholesale: +formData.priceWholesale || 0,
      pricePromo: +formData.pricePromo || 0,
      variantGroups,
      variants: variants.length > 0 ? variants : [defaultVariant],
    };

    console.log("📦 [AddProductPage] body gửi lên:", JSON.stringify(body, null, 2));

    setIsSubmitting(true);
    try {
      const hasAvatarChange = !!selectedImageFile || (isEdit && !formData.avatar);
      let res;
      if (hasAvatarChange) {
        const form = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (key === "avatar") return;
          if (key === "variantGroups" || key === "variants") {
            form.append(key, JSON.stringify(value));
            return;
          }
          form.append(key, String(value));
        });
        if (selectedImageFile) {
          form.append("avatar", selectedImageFile);
        } else if (isEdit && !formData.avatar) {
          form.append("avatar", "");
        } else if (formData.avatar) {
          form.append("avatar", formData.avatar);
        }
        res = await ProductService.wUpdateFormData(form);
      } else {
        res = await ProductService.wUpdate(body as any);
      }
      if (res.code === 0) {
        showToast(isEdit ? "Cập nhật sản phẩm thành công" : "Thêm sản phẩm thành công", "success");
        onBack(true);
      } else {
        showToast(res.message ?? "Có lỗi xảy ra", "error");
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
          image: existing?.image || "",
          unitPrices: existing?.unitPrices?.length ? existing.unitPrices : [makeEmptyUnitPrice()],
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

  const updateAttrName = (id: string, name: string) =>
    setVariantAttrs((prev) => prev.map((a) => (a.tempId === id ? { ...a, name } : a)));

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
    const updated = variantAttrs.map((a) =>
      a.tempId === id ? { ...a, values: a.values.filter((v) => v !== val) } : a
    );
    setVariantAttrs(updated);
    syncCombinations(updated);
  };

  const updateComboSku = (key: string, sku: string) =>
    setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, sku } : c)));

  const updateComboImage = (key: string, image: string) =>
    setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, image } : c)));

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
          unitPrices: [...c.unitPrices, makeEmptyUnitPrice()],
        }));
      }
      // Biến thể 2+: chỉ thêm vào biến thể đó
      return prev.map((c) =>
        c.key === comboKey
          ? { ...c, unitPrices: [...c.unitPrices, makeEmptyUnitPrice()] }
          : c
      );
    });
  };

  const removeUnitPrice = (comboKey: string, tempId: string) =>
    setCombinations((prev) =>
      prev.map((c) => {
        if (c.key !== comboKey) return c;
        const filtered = c.unitPrices.filter((u) => u.tempId !== tempId);
        return { ...c, unitPrices: filtered.length ? filtered : [makeEmptyUnitPrice()] };
      })
    );

  const updateUnitPrice = (comboKey: string, tempId: string, field: keyof UnitPrice, value: any) =>
    setCombinations((prev) => {
      const isFirst = prev[0]?.key === comboKey;
      if (isFirst) {
        // Tìm index của row trong variant 1
        const rowIndex = prev[0].unitPrices.findIndex((u) => u.tempId === tempId);
        return prev.map((c) => {
          if (c.key === comboKey) {
            // Cập nhật variant 1 theo tempId
            return { ...c, unitPrices: c.unitPrices.map((u) => (u.tempId === tempId ? { ...u, [field]: value } : u)) };
          }
          // Áp dụng cùng field/value vào row cùng vị trí ở variants còn lại
          return {
            ...c,
            unitPrices: c.unitPrices.map((u, ui) => (ui === rowIndex ? { ...u, [field]: value } : u)),
          };
        });
      }
      // Biến thể 2+: chỉ cập nhật biến thể đó
      return prev.map((c) =>
        c.key === comboKey
          ? { ...c, unitPrices: c.unitPrices.map((u) => (u.tempId === tempId ? { ...u, [field]: value } : u)) }
          : c
      );
    });

  const handleDuplicate = async () => {
    if (!idProduct) return;
    setIsDuplicating(true);
    try {
      const body: IProductRequest = {
        id: 0,
        name: `${formData.name} (Copy)`,
        code: "",
        productLine: formData.productLine,
        price: +formData.price,
        position: 0,
        status: formData.status,
        avatar: formData.avatar,
        categoryId: selectedCategory?.value ?? null,
        categoryName: selectedCategory?.label ?? "",
        exchange: 1,
        otherUnits: detailProduct?.otherUnits ?? "",
        type: detailProduct?.type ? String(detailProduct.type) : "1",
        description: formData.description,
        costPrice: +formData.costPrice || 0,
        priceWholesale: +formData.priceWholesale || 0,
        pricePromo: +formData.pricePromo || 0,
      };
      const res = await ProductService.wUpdate(body);
      if (res.code === 0) {
        showToast("Nhân bản sản phẩm thành công", "success");
        onBack(true);
      } else {
        showToast(res.message ?? "Có lỗi xảy ra", "error");
      }
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
            <Icon name="ArrowLeft" /> Quay lại
          </button>
          <span className="add-prod-page__divider">|</span>
          <span className="add-prod-page__title">
            {isEdit ? `Chỉnh sửa: ${formData.name || "Sản phẩm"}` : "Thêm sản phẩm mới"}
          </span>
        </div>
        <div className="add-prod-page__toolbar-right">
          <button className="add-prod-page__btn add-prod-page__btn--outline">Xem trước Web</button>
          <button className="add-prod-page__btn add-prod-page__btn--outline">In mã vạch</button>
          <button
            className="add-prod-page__btn add-prod-page__btn--primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="add-prod-tabs">
        <button
          className={`add-prod-tabs__item${activeTab === "info" ? " add-prod-tabs__item--active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Thông tin sản phẩm
        </button>
        <button
          className={`add-prod-tabs__item${activeTab === "variants" ? " add-prod-tabs__item--active" : ""}`}
          onClick={() => setActiveTab("variants")}
        >
          Cài đặt biến thể
          {combinations.length > 0 && (
            <span className="add-prod-tabs__badge">{combinations.length}</span>
          )}
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
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Nhập tên sản phẩm..."
                  />
                </div>
                <div className="add-prod-form-grid">
                  <div className="add-prod-field">
                    <label>Mã vạch (Barcode)</label>
                    <div className="add-prod-field__barcode">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setField("code", e.target.value)}
                        placeholder="8938507680019"
                        className="monospace"
                      />
                      <button className="add-prod-scan-btn">Quét</button>
                    </div>
                  </div>
                  <div className="add-prod-field">
                    <label>Mã SKU nội bộ</label>
                    <input
                      type="text"
                      value={formData.productLine}
                      onChange={(e) => setField("productLine", e.target.value)}
                      placeholder="VD: TH001"
                    />
                  </div>
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

              {/* Giá & Đơn vị */}
              <div className="add-prod-card">
                <div className="add-prod-card__title">Giá & Đơn vị</div>
                <div className="add-prod-form-grid3">
                  {[
                    { key: "price", label: "Giá bán lẻ", required: true },
                    { key: "priceWholesale", label: "Giá sỉ", required: false },
                    { key: "pricePromo", label: "Giá khuyến mãi", required: false },
                  ].map(({ key, label, required }) => (
                    <div className="add-prod-field" key={key}>
                      <label>
                        {label} {required && <span className="required">*</span>}
                      </label>
                      <div className="add-prod-field__price">
                        <span className="add-prod-field__price-icon">₫</span>
                        <NummericInput
                          value={formData[key]}
                          onValueChange={(vals: any) => setField(key, vals.floatValue ?? 0)}
                          placeholder="0"
                          thousandSeparator={true}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="add-prod-form-grid" style={{ marginTop: 12 }}>
                  <div className="add-prod-field">
                    <label>Giá vốn</label>
                    <div className="add-prod-field__price">
                      <span className="add-prod-field__price-icon">₫</span>
                      <NummericInput
                        value={formData.costPrice}
                        onValueChange={(vals: any) => setField("costPrice", vals.floatValue ?? 0)}
                        placeholder="0"
                        thousandSeparator={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hình ảnh */}
              <div className="add-prod-card">
                <div className="add-prod-card__title">Hình ảnh sản phẩm</div>
                <FileUpload
                  type="avatar"
                  label="Ảnh sản phẩm"
                  formData={{ values: { avatar: selectedImagePreview || formData.avatar } }}
                  setFormData={(fd: any) => {
                    const nextAvatar = fd?.values?.avatar || "";
                    if (!nextAvatar) {
                      handleRemoveImage();
                    }
                  }}
                  onFileChange={(file: File | null) => {
                    if (!file) {
                      handleRemoveImage();
                      setField("avatar", "");
                      return;
                    }
                    const previewUrl = URL.createObjectURL(file);
                    setSelectedImageFile(file);
                    setSelectedImagePreview(previewUrl);
                  }}
                />
              </div>

              {/* Mô tả */}
              <div className="add-prod-card">
                <div className="add-prod-card__title">Mô tả sản phẩm</div>
                <TextArea
                  label="Mô tả chi tiết (hiển thị trên Website)"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Nhập mô tả sản phẩm cho trang web bán hàng..."
                  fill={true}
                  row={4}
                />
              </div>

              {/* Tồn kho */}
              <div className="add-prod-card">
                <div className="add-prod-card__title">Quản lý tồn kho</div>
                <div className="add-prod-stock-header">
                  <div>
                    <div className="add-prod-stock-header__label">Theo dõi tồn kho</div>
                    <div className="add-prod-stock-header__sub">
                      Hệ thống sẽ tự động trừ khi có đơn hàng
                    </div>
                  </div>
                  <label className="add-prod-toggle">
                    <input
                      type="checkbox"
                      checked={formData.trackStock}
                      onChange={(e) => setField("trackStock", e.target.checked)}
                    />
                    <span className="add-prod-toggle__slider" />
                  </label>
                </div>
                {formData.trackStock && (
                  <div className="add-prod-form-grid" style={{ marginTop: 12 }}>
                    <div className="add-prod-field">
                      <label>Tồn kho hiện tại</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setField("stock", +e.target.value)}
                      />
                    </div>
                    <div className="add-prod-field">
                      <label>Ngưỡng cảnh báo sắp hết</label>
                      <input
                        type="number"
                        value={formData.stockWarning}
                        onChange={(e) => setField("stockWarning", +e.target.value)}
                      />
                    </div>
                  </div>
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
                      <input
                        type="checkbox"
                        checked={!!formData[key]}
                        onChange={(e) => setField(key, e.target.checked)}
                      />
                      <span className="add-prod-toggle__slider" />
                    </label>
                  </div>
                ))}
              </div>
              {isEdit && (
                <div className="add-prod-right-box">
                  <div className="add-prod-right-box__title">Thao tác nhanh</div>
                  <button
                    className="add-prod-quick-btn"
                    onClick={handleDuplicate}
                    disabled={isDuplicating}
                  >
                    {isDuplicating ? "Đang xử lý..." : "Nhân bản sản phẩm"}
                  </button>
                  <button className="add-prod-quick-btn add-prod-quick-btn--danger">
                    Xóa sản phẩm
                  </button>
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
              <p className="add-prod-vt__hint">
                Thêm các thuộc tính (Size, Màu sắc...) để hệ thống tự tạo các biến thể sản phẩm.
              </p>

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
                    <button
                      className="add-prod-vt-attr__del"
                      onClick={() => removeAttr(attr.tempId)}
                    >
                      <Icon name="Trash" />
                    </button>
                  </div>
                  <div className="add-prod-vt-attr__values">
                    {attr.values.map((v) => (
                      <span className="add-prod-vt-tag" key={v}>
                        {v}
                        <button onClick={() => removeValue(attr.tempId, v)}>
                          <Icon name="Close" />
                        </button>
                      </span>
                    ))}
                    <div className="add-prod-vt-attr__input-row">
                      <input
                        type="text"
                        value={attr.inputVal}
                        onChange={(e) =>
                          setVariantAttrs((prev) =>
                            prev.map((a) =>
                              a.tempId === attr.tempId ? { ...a, inputVal: e.target.value } : a
                            )
                          )
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
                <Icon name="Plus" /> Thêm thuộc tính
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
                      {/* Header: Ảnh | Tên biến thể + badge | SKU */}
                      <div className="add-prod-vt-combo-card__header">
                        {/* Cột ảnh */}
                        <VariantImagePicker
                          image={c.image}
                          onChange={(url) => updateComboImage(c.key, url)}
                        />

                        {/* Tên biến thể */}
                        <div className="add-prod-vt-combo-card__label-wrap">
                          <span className="add-prod-vt-combo">{c.label}</span>
                          {isFirst && (
                            <Tippy content="Thêm đơn vị-giá ở biến thể này sẽ tự áp dụng cho tất cả biến thể còn lại" placement="top">
                              <span className="add-prod-vt-combo-card__first-badge">
                                Biến thể gốc
                              </span>
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
                      </div>

                      {/* Danh sách đơn vị-giá */}
                      <div className="add-prod-vt-combo-card__prices">
                        {c.unitPrices.map((up) => (
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
                                  if (!listUnit.length)
                                    setListUnit((await SelectOptionData("unit")) || []);
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
                                onValueChange={(vals: any) =>
                                  updateUnitPrice(c.key, up.tempId, "price", vals.floatValue ?? 0)
                                }
                                placeholder="0"
                                thousandSeparator={true}
                              />
                            </div>

                            {/* Nút xóa */}
                            <Tippy content="Xóa đơn vị này" placement="top">
                              <button
                                type="button"
                                className="add-prod-vt-unit-del"
                                disabled={c.unitPrices.length === 1}
                                onClick={() => removeUnitPrice(c.key, up.tempId)}
                              >
                                <Icon name="Trash" style={{ width: 14 }} />
                              </button>
                            </Tippy>
                          </div>
                        ))}

                        {/* Nút thêm đơn vị */}
                        <Tippy
                          content={
                            isFirst
                              ? "Sẽ tự động thêm hàng mới vào tất cả biến thể còn lại"
                              : "Chỉ thêm vào biến thể này"
                          }
                          placement="top"
                        >
                          <button
                            type="button"
                            className={`add-prod-vt-unit-add-btn${isFirst ? " add-prod-vt-unit-add-btn--sync" : ""}`}
                            onClick={() => addUnitPrice(c.key)}
                          >
                            <Icon name="Plus" style={{ width: 13 }} />
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
                <Icon name="Settings" />
                <p>Chưa có thuộc tính nào.</p>
                <p>Thêm thuộc tính như Size, Màu sắc để tạo biến thể.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

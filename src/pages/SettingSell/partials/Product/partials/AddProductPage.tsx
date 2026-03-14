import React, { useState, useEffect } from "react";
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
  unitPrices: UnitPrice[];
}

const genId = () => Math.random().toString(36).slice(2, 9);

const toSkuPart = (str: string): string =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .replace(/đ/gi, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "") // chỉ giữ chữ và số
    .slice(0, 4); // tối đa 4 ký tự mỗi phần

const generateSku = (productName: string, comboLabel: string): string => {
  const namePart = toSkuPart(productName) || "SP";
  const valueParts = comboLabel
    .split("/")
    .map((v) => toSkuPart(v.trim()))
    .filter(Boolean)
    .join("-");
  return valueParts ? `${namePart}-${valueParts}` : namePart;
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
    unitPrices: [makeEmptyUnitPrice()],
  }));
};

export default function AddProductPage({ idProduct, data, onBack }: AddProductPageProps) {
  const isEdit = !!idProduct;
  const [activeTab, setActiveTab] = useState<PageTab>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailProduct, setDetailProduct] = useState<IProductResponse>(null);
  const [listUnit, setListUnit] = useState<IOption[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<IOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ value: number; label: string } | null>(null);
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [isDuplicating, setIsDuplicating] = useState(false);
  // Variants
  const [variantAttrs, setVariantAttrs] = useState<VariantAttribute[]>([]);
  const [combinations, setCombinations] = useState<VariantCombination[]>([]);

  const setField = (key: string, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    loadUnits();
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
      categoryId: p.categoryId || null,
      categoryName: p.categoryName || "",
      unitId: p.unitId || null,
      unitName: p.unitName || "",
      status: p.status ?? 1,
      avatar: p.avatar || "",
    }));
    if (p.categoryId) setSelectedCategory({ value: p.categoryId, label: p.categoryName });
  };

  const loadDetail = async () => {
    const res = await ProductService.wDetail(idProduct);
    if (res.code === 0) {
      setDetailProduct(res.result);
      preFill(res.result);
    }
  };

  const loadUnits = async () => setListUnit((await SelectOptionData("unit")) || []);

  useEffect(() => {
    if (listUnit.length && formData.unitId) {
      const found = listUnit.find((u) => u.value === formData.unitId);
      if (found) setSelectedUnit(found);
    }
  }, [listUnit, formData.unitId]);

  const loadOptionCategory = async (search: string, _: any, { page }: any) => {
    const res = await CategoryServiceService.list({ name: search, page, limit: 10, type: 2 });
    if (res.code === 0) {
      const items = res.result.items || [];
      return {
        options: items.map((i: any) => ({ value: i.id, label: i.name })),
        hasMore: res.result.loadMoreAble,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast("Vui lòng nhập tên sản phẩm", "error");
      return;
    }
    if (!formData.price) {
      showToast("Vui lòng nhập giá bán", "error");
      return;
    }

    const activeAttrs = variantAttrs.filter((a) => a.name.trim() && a.values.length > 0);
    const variants = combinations.map((c) => {
      const firstUp = c.unitPrices[0];
      return {
        id: 0,
        label: c.label,
        sku: c.sku?.trim() || generateSku(formData.name, c.label),
        // giá & đơn vị lấy từ dòng đầu tiên
        price: +(firstUp?.price ?? 0) || 0,
        unitId: firstUp?.unitId ?? null,
        unitName: firstUp?.unitName ?? "",
        quantity: 0,
        // toàn bộ danh sách đơn vị-giá
        unitPrices: c.unitPrices.map((u) => ({
          unitId: u.unitId,
          unitName: u.unitName,
          price: +(u.price ?? 0) || 0,
        })),
        attributes: activeAttrs.map((a) => ({
          name: a.name,
          value:
            c.key
              .split("|")
              .find((k) => k.startsWith(a.name + ":"))
              ?.split(":")[1] ?? "",
        })),
      };
    });

    const defaultVariant = {
      id: 0,
      label: "Mac dinh",
      sku: toSkuPart(formData.name) || `SP-${Date.now()}`,
      price: +formData.price,
      quantity: 0,
      attributes: [],
    };

    const body: IProductRequest = {
      id: idProduct || 0,
      name: formData.name,
      code: formData.code,
      productLine: formData.productLine,
      price: +formData.price,
      position: detailProduct?.position ?? 0,
      unitId: selectedUnit?.value ?? null,
      unitName: selectedUnit?.label ?? "",
      status: formData.status,
      avatar: formData.avatar,
      categoryId: selectedCategory?.value ?? null,
      categoryName: selectedCategory?.label ?? "",
      exchange: 1,
      otherUnits: detailProduct?.otherUnits ?? "",
      type: detailProduct?.type ? String(detailProduct.type) : "0",
      description: formData.description,
      costPrice: +formData.costPrice || 0,
      priceWholesale: +formData.priceWholesale || 0,
      pricePromo: +formData.pricePromo || 0,
      variants: variants.length > 0 ? variants : [defaultVariant],
    };

    setIsSubmitting(true);
    try {
      const res = await ProductService.wUpdate(body);
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
          // giữ data user đã nhập, chỉ auto-gen SKU nếu chưa có
          sku: existing?.sku || generateSku(formData.name, c.label),
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

  const updateComboSku = (key: string, sku: string) =>
    setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, sku } : c)));

  // ── UNIT PRICE HANDLERS ──
  const addUnitPrice = (comboKey: string) =>
    setCombinations((prev) =>
      prev.map((c) =>
        c.key === comboKey
          ? { ...c, unitPrices: [...c.unitPrices, makeEmptyUnitPrice()] }
          : c
      )
    );

  const removeUnitPrice = (comboKey: string, tempId: string) =>
    setCombinations((prev) =>
      prev.map((c) => {
        if (c.key !== comboKey) return c;
        return { ...c, unitPrices: c.unitPrices.filter((u) => u.tempId !== tempId) };
      })
    );

  const updateUnitPrice = (comboKey: string, tempId: string, field: keyof UnitPrice, value: any) =>
    setCombinations((prev) =>
      prev.map((c) =>
        c.key === comboKey
          ? { ...c, unitPrices: c.unitPrices.map((u) => (u.tempId === tempId ? { ...u, [field]: value } : u)) }
          : c
      )
    );

  const handleDuplicate = async () => {
    if (!idProduct) return;
    setIsDuplicating(true);
    try {
      const body: IProductRequest = {
        id: 0, // id=0 → tạo mới
        name: `${formData.name} (Copy)`,
        code: "", // xóa barcode tránh trùng
        productLine: formData.productLine,
        price: +formData.price,
        position: 0,
        unitId: selectedUnit?.value ?? null,
        unitName: selectedUnit?.label ?? "",
        status: formData.status,
        avatar: formData.avatar,
        categoryId: selectedCategory?.value ?? null,
        categoryName: selectedCategory?.label ?? "",
        exchange: 1,
        otherUnits: detailProduct?.otherUnits ?? "",
        type: detailProduct?.type ? String(detailProduct.type) : "0",
        description: formData.description,
        costPrice: +formData.costPrice || 0,
        priceWholesale: +formData.priceWholesale || 0,
        pricePromo: +formData.pricePromo || 0,
        // variants: undefined, // không copy biến thể
      };
      const res = await ProductService.wUpdate(body);
      if (res.code === 0) {
        showToast("Nhân bản sản phẩm thành công", "success");
        onBack(true); // quay lại list, reload
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
          <span className="add-prod-page__title">{isEdit ? `Chỉnh sửa: ${formData.name || "Sản phẩm"}` : "Thêm sản phẩm mới"}</span>
        </div>
        <div className="add-prod-page__toolbar-right">
          <button className="add-prod-page__btn add-prod-page__btn--outline">Xem trước Web</button>
          <button className="add-prod-page__btn add-prod-page__btn--outline">In mã vạch</button>
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
                <div className="add-prod-form-grid" style={{ marginTop: 12 }}>
                  <div className="add-prod-field">
                    <label>Danh mục sản phẩm</label>
                    <SelectCustom
                      id="categoryId"
                      name="categoryId"
                      value={selectedCategory}
                      isAsyncPaginate={true}
                      options={[]}
                      loadOptionsPaginate={loadOptionCategory}
                      additional={{ page: 1 }}
                      onChange={(e) => {
                        setSelectedCategory(e);
                        setField("categoryId", e?.value ?? null);
                        setField("categoryName", e?.label ?? "");
                      }}
                      placeholder="Chọn danh mục..."
                      isClearable
                    />
                  </div>
                  <div className="add-prod-field">
                    <label>
                      Đơn vị tính <span className="required">*</span>
                    </label>
                    <SelectCustom
                      id="unitId"
                      name="unitId"
                      value={selectedUnit?.value ?? null}
                      options={listUnit}
                      onChange={(e) => {
                        setSelectedUnit(e);
                        setField("unitId", e?.value ?? null);
                        setField("unitName", e?.label ?? "");
                      }}
                      onMenuOpen={async () => {
                        if (!listUnit.length) setListUnit((await SelectOptionData("unit")) || []);
                      }}
                      placeholder="Chọn đơn vị..."
                      isClearable
                    />
                  </div>
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
                        <NummericInput value={formData[key]} onValueChange={(vals: any) => setField(key, vals.floatValue ?? 0)} placeholder="0" thousandSeparator={true} />
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
                  formData={{ values: { avatar: formData.avatar } }}
                  setFormData={(fd: any) => setField("avatar", fd?.values?.avatar || "")}
                />
              </div>

              {/* Mô tả — dùng TextArea component */}
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
                    <div className="add-prod-stock-header__sub">Hệ thống sẽ tự động trừ khi có đơn hàng</div>
                  </div>
                  <label className="add-prod-toggle">
                    <input type="checkbox" checked={formData.trackStock} onChange={(e) => setField("trackStock", e.target.checked)} />
                    <span className="add-prod-toggle__slider" />
                  </label>
                </div>
                {formData.trackStock && (
                  <div className="add-prod-form-grid" style={{ marginTop: 12 }}>
                    <div className="add-prod-field">
                      <label>Tồn kho hiện tại</label>
                      <input type="number" value={formData.stock} onChange={(e) => setField("stock", +e.target.value)} />
                    </div>
                    <div className="add-prod-field">
                      <label>Ngưỡng cảnh báo sắp hết</label>
                      <input type="number" value={formData.stockWarning} onChange={(e) => setField("stockWarning", +e.target.value)} />
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
                <Icon name="Plus" /> Thêm thuộc tính
              </button>
            </div>

            {/* Danh sách biến thể — card layout */}
            {combinations.length > 0 && (
              <div className="add-prod-card">
                <div className="add-prod-card__title">
                  Chi tiết biến thể
                  <span className="add-prod-card__count">{combinations.length} biến thể</span>
                </div>

                {combinations.map((c) => (
                  <div className="add-prod-vt-combo-card" key={c.key}>
                    {/* Hàng trên: tên biến thể + SKU */}
                    <div className="add-prod-vt-combo-card__header">
                      <span className="add-prod-vt-combo">{c.label}</span>
                      <input
                        className="add-prod-vt-combo-card__sku"
                        type="text"
                        value={c.sku}
                        onChange={(e) => updateComboSku(c.key, e.target.value)}
                        placeholder="Mã SKU..."
                      />
                    </div>

                    {/* Hàng dưới: danh sách đơn vị-giá */}
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
                              disabled={c.unitPrices.length === 1}
                              onClick={() => removeUnitPrice(c.key, up.tempId)}
                            >
                              <Icon name="Trash" style={{ width: 14 }} />
                            </button>
                          </Tippy>
                        </div>
                      ))}

                      {/* Nút thêm đơn vị */}
                      <button
                        type="button"
                        className="add-prod-vt-unit-add-btn"
                        onClick={() => addUnitPrice(c.key)}
                      >
                        <Icon name="Plus" style={{ width: 13 }} />
                        Thêm đơn vị bán
                      </button>
                    </div>
                  </div>
                ))}
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

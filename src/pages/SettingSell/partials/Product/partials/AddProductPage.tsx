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

type PageTab = "info" | "variants";

interface AddProductPageProps {
  idProduct: number | null;
  data?: any;
  onBack: (reload: boolean) => void;
}

const DEFAULT_FORM = {
  name: "",
  price: "" as string | number,
  pricePromo: "" as string | number,
  costPrice: "" as string | number,
  categoryId: null as number | null,
  categoryName: "",
  unitId: null as number | null,
  unitName: "",
  status: 1,
  description: "",
  avatar: "",
  stock: 0,
};

interface UnitPrice {
  tempId: string;
  unitId: number | null;
  unitName: string;
  price: string | number;
}

interface VariantCombination {
  id?: number | null;
  key: string;
  label: string;
  sku: string;
  barcode: string;
  images?: string[];
  selectedOptions: Record<string, string>;
  pricePromo?: number;
  supplierId?: number | null;
  costPrice?: number;
  quantity?: number;
  optionValueIds?: number[];
  attributes?: { name: string; value: string }[];
  unitPrices: UnitPrice[];
}

interface VariantGroupState {
  id?: number | null;
  name: string;
  key?: string;
  options: { id?: number | null; label: string }[];
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

const slugifyGroupKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const makeEmptyVariant = (productName = "", index = 1): VariantCombination => ({
  id: 0,
  key: genId(),
  label: `Biến thể ${index}`,
  sku: productName ? generateSku(productName, `VT${index}`) : "",
  barcode: "",
  images: undefined,
  selectedOptions: {},
  pricePromo: 0,
  supplierId: null,
  costPrice: 0,
  quantity: 0,
  optionValueIds: undefined,
  attributes: undefined,
  unitPrices: [makeEmptyUnitPrice()],
});

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
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [variantGroups, setVariantGroups] = useState<VariantGroupState[]>([]);
  const [combinations, setCombinations] = useState<VariantCombination[]>([]);

  const setField = (key: string, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
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
      price: p.price ?? "",
      pricePromo: p.pricePromo ?? "",
      costPrice: p.costPrice ?? "",
      categoryId: p.categoryId || null,
      categoryName: p.categoryName || "",
      unitId: p.unitId ?? null,
      unitName: p.unitName || "",
      status: p.status ?? 1,
      avatar: p.avatar || "",
      description: p.description || "",
      stock: p.stock ?? 0,
    }));
    if (p.categoryId) setSelectedCategory({ value: p.categoryId, label: p.categoryName });
    setSelectedImagePreview(p.avatar || "");
    setVariantGroups(
      Array.isArray(p.variantGroups)
        ? p.variantGroups.map((group: any) => ({
            id: group.id ?? null,
            name: group.name || "",
            key: group.key,
            options: Array.isArray(group.options)
              ? group.options.map((option: any) => ({
                  id: option.id ?? null,
                  label: option.label || "",
                }))
              : [],
          }))
        : []
    );

    const variants = Array.isArray(p.variants) ? p.variants : [];
    if (variants.length) {
      const combos: VariantCombination[] = variants.map((v: any, index: number) => ({
        id: v.id ?? null,
        key: String(v.id ?? genId()),
        label: v.label || `Biến thể ${index + 1}`,
        sku: v.sku || "",
        barcode: v.barcode || (index === 0 ? p.code || "" : ""),
        images: Array.isArray(v.images)
          ? v.images.filter(Boolean)
          : index === 0 && p.avatar
            ? [p.avatar]
            : undefined,
        selectedOptions: Array.isArray(v.attributes)
          ? v.attributes.reduce(
              (acc: Record<string, string>, attr: any) => ({
                ...acc,
                [attr?.name || ""]: attr?.value || "",
              }),
              {}
            )
          : {},
        pricePromo: v.pricePromo ?? v.promotionPrice ?? 0,
        supplierId: v.supplierId ?? null,
        costPrice: v.costPrice ?? 0,
        quantity: v.quantity ?? 0,
        optionValueIds: Array.isArray(v.optionValueIds) ? v.optionValueIds : undefined,
        attributes: Array.isArray(v.attributes) ? v.attributes : undefined,
        unitPrices: [
          {
            tempId: genId(),
            unitId: v.unitId ?? p.unitId ?? null,
            unitName: v.unitName ?? p.unitName ?? "",
            price: v.price ?? "",
          },
        ],
      }));
      setCombinations(combos);
    } else {
      setCombinations([]);
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

  const buildVariantMetadata = (combo: VariantCombination) => {
    const attributes = variantGroups
      .map((group) => {
        const selectedValue = combo.selectedOptions[group.name] || "";
        return selectedValue ? { name: group.name, value: selectedValue } : null;
      })
      .filter(Boolean) as { name: string; value: string }[];

    const optionValueIds = variantGroups
      .map((group) => {
        const selectedValue = combo.selectedOptions[group.name] || "";
        if (!selectedValue) return null;
        const matchedOption = group.options.find((option) => option.label === selectedValue);
        return matchedOption?.id && matchedOption.id > 0 ? matchedOption.id : null;
      })
      .filter((id): id is number => !!id);

    return {
      attributes,
      optionValueIds,
    };
  };

  const addVariantGroup = () =>
    setVariantGroups((prev) => [
      ...prev,
      {
        id: null,
        name: "",
        key: "",
        options: [{ id: null, label: "" }],
      },
    ]);

  const removeVariantGroup = (index: number) =>
    setVariantGroups((prev) => prev.filter((_, groupIndex) => groupIndex !== index));

  const updateVariantGroup = (index: number, field: "name" | "key", value: string) =>
    setVariantGroups((prev) =>
      prev.map((group, groupIndex) =>
        groupIndex === index
          ? {
              ...group,
              [field]: value,
              ...(field === "name" && !group.key ? { key: slugifyGroupKey(value) } : {}),
            }
          : group
      )
    );

  const addVariantGroupOption = (groupIndex: number) =>
    setVariantGroups((prev) =>
      prev.map((group, currentIndex) =>
        currentIndex === groupIndex
          ? {
              ...group,
              options: [...group.options, { id: null, label: "" }],
            }
          : group
      )
    );

  const removeVariantGroupOption = (groupIndex: number, optionIndex: number) =>
    setVariantGroups((prev) =>
      prev.map((group, currentIndex) =>
        currentIndex === groupIndex
          ? {
              ...group,
              options: group.options.filter((_, idx) => idx !== optionIndex),
            }
          : group
      )
    );

  const updateVariantGroupOption = (groupIndex: number, optionIndex: number, label: string) =>
    setVariantGroups((prev) =>
      prev.map((group, currentIndex) =>
        currentIndex === groupIndex
          ? {
              ...group,
              options: group.options.map((option, idx) =>
                idx === optionIndex ? { ...option, label } : option
              ),
            }
          : group
      )
    );

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast("Vui lòng nhập tên sản phẩm", "error");
      return;
    }
    if (!selectedCategory?.value) {
      showToast("Vui lòng chọn danh mục sản phẩm", "error");
      return;
    }
    if (!formData.description.trim()) {
      showToast("Vui lòng nhập mô tả sản phẩm", "error");
      return;
    }
    if (!combinations.length) {
      showToast("Vui lòng thêm ít nhất một biến thể", "error");
      return;
    }

    for (const combo of combinations) {
      const firstPrice = +(combo.unitPrices[0]?.price ?? 0) || 0;
      if (!firstPrice) {
        showToast(`Biến thể "${combo.label}" chưa có giá`, "error");
        return;
      }
      const isNewVariant = !combo.id || combo.id <= 0;
      if (isNewVariant && !combo.sku.trim()) {
        showToast(`Biến thể "${combo.label}" phải có SKU khi tạo mới`, "error");
        return;
      }
      if (isNewVariant && !combo.barcode.trim()) {
        showToast(`Biến thể "${combo.label}" phải có mã vạch khi tạo mới`, "error");
        return;
      }
    }

    const variants = combinations.map((c) => {
      const firstUp = c.unitPrices[0];
      const isNewVariant = !c.id || c.id <= 0;
      const variantSku = c.sku?.trim() || (isNewVariant ? generateSku(formData.name, c.label) : "");
      const variantBarcode = c.barcode?.trim();
      const { attributes, optionValueIds } = buildVariantMetadata(c);
      const nextAttributes = attributes.length ? attributes : c.attributes || [];
      const nextOptionValueIds = optionValueIds.length ? optionValueIds : c.optionValueIds || [];
      const nextImages = c.images ? c.images.map((image) => image.trim()).filter(Boolean) : undefined;

      return {
        id: c.id ?? 0,
        label: c.label,
        ...(variantSku ? { sku: variantSku } : {}),
        ...(variantBarcode ? { barcode: variantBarcode } : {}),
        unitId: firstUp?.unitId ?? null,
        price: +(firstUp?.price ?? 0) || 0,
        pricePromo: +(c.pricePromo ?? formData.pricePromo ?? 0) || 0,
        supplierId: c.supplierId ?? null,
        costPrice: +(c.costPrice ?? formData.costPrice ?? 0) || 0,
        quantity: c.quantity ?? 0,
        ...(c.images ? { images: nextImages || [] } : {}),
        ...(nextOptionValueIds.length ? { optionValueIds: nextOptionValueIds } : {}),
        ...(nextAttributes.length ? { attributes: nextAttributes } : {}),
      };
    });

    const body: IProductRequest = {
      id: idProduct || 0,
      name: formData.name,
      position: detailProduct?.position ?? 0,
      status: formData.status,
      categoryId: selectedCategory?.value ?? null,
      exchange: 1,
      otherUnits: detailProduct?.otherUnits ?? "",
      type: detailProduct?.type ? String(detailProduct.type) : "1",
      description: formData.description,
      ...(variantGroups.length
        ? {
            variantGroups: variantGroups
              .filter((group) => group.name.trim())
              .map((group) => ({
                id: group.id ?? undefined,
                name: group.name.trim(),
                ...(group.key?.trim() ? { key: group.key.trim() } : {}),
                ...(group.options?.some((option) => option.label.trim())
                  ? {
                      options: group.options
                        .filter((option) => option.label.trim())
                        .map((option) => ({
                          ...(option.id ? { id: option.id } : {}),
                          label: option.label.trim(),
                        })),
                    }
                  : {}),
              })),
          }
        : {}),
      variants,
    };

    console.log("📦 [AddProductPage] body gửi lên:", JSON.stringify(body, null, 2));

    setIsSubmitting(true);
    try {
      const res = await ProductService.wUpdate(body as any);
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

  const addVariant = () =>
    setCombinations((prev) => [...prev, makeEmptyVariant(formData.name, prev.length + 1)]);

  const removeVariant = (key: string) =>
    setCombinations((prev) => prev.filter((c) => c.key !== key));

  const updateComboLabel = (key: string, label: string) =>
    setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, label } : c)));

  const updateComboSku = (key: string, sku: string) =>
    setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, sku } : c)));

  const updateComboBarcode = (key: string, barcode: string) =>
    setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, barcode } : c)));

  const updateComboImage = (key: string, file: File | null) => {
    if (!file) {
      setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, images: [] } : c)));
      if (combinations[0]?.key === key) {
        setSelectedImagePreview("");
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const image = String(ev.target?.result || "");
      setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, images: image ? [image] : [] } : c)));
      if (combinations[0]?.key === key) {
        setSelectedImagePreview(image);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateComboImageUrl = (key: string, index: number, value: string) =>
    setCombinations((prev) =>
      prev.map((combo) => {
        if (combo.key !== key) return combo;
        const nextImages = [...(combo.images || [])];
        nextImages[index] = value;
        return { ...combo, images: nextImages };
      })
    );

  const addComboImageSlot = (key: string) =>
    setCombinations((prev) =>
      prev.map((combo) =>
        combo.key === key ? { ...combo, images: [...(combo.images || []), ""] } : combo
      )
    );

  const removeComboImage = (key: string, index: number) =>
    setCombinations((prev) =>
      prev.map((combo) => {
        if (combo.key !== key) return combo;
        const nextImages = (combo.images || []).filter((_, imageIndex) => imageIndex !== index);
        return { ...combo, images: nextImages };
      })
    );

  const updateComboSelectedOption = (key: string, groupName: string, value: string) =>
    setCombinations((prev) =>
      prev.map((combo) =>
        combo.key === key
          ? {
              ...combo,
              selectedOptions: {
                ...combo.selectedOptions,
                [groupName]: value,
              },
            }
          : combo
      )
    );

  const updateUnitPrice = (comboKey: string, tempId: string, field: keyof UnitPrice, value: any) =>
    setCombinations((prev) => {
      return prev.map((c) =>
        c.key === comboKey
          ? { ...c, unitPrices: c.unitPrices.map((u, ui) => (ui === 0 || u.tempId === tempId ? { ...u, [field]: value } : u)).slice(0, 1) }
          : c
      );
    });

  const updateVariantMeta = (key: string, field: "pricePromo" | "costPrice" | "quantity", value: any) =>
    setCombinations((prev) => prev.map((c) => (c.key === key ? { ...c, [field]: value } : c)));

  const handleDuplicate = async () => {
    if (!idProduct) return;
    setIsDuplicating(true);
    try {
      const variants = combinations.map((combo) => {
        const firstUp = combo.unitPrices[0];
        const { attributes, optionValueIds } = buildVariantMetadata(combo);
        const nextAttributes = attributes.length ? attributes : combo.attributes || [];
        const nextOptionValueIds = optionValueIds.length ? optionValueIds : combo.optionValueIds || [];
        const nextImages = combo.images ? combo.images.map((image) => image.trim()).filter(Boolean) : undefined;

        return {
          label: combo.label,
          sku: combo.sku?.trim() || generateSku(`${formData.name} Copy`, combo.label),
          barcode: combo.barcode?.trim(),
          unitId: firstUp?.unitId ?? null,
          price: +(firstUp?.price ?? 0) || 0,
          pricePromo: +(combo.pricePromo ?? 0) || 0,
          supplierId: combo.supplierId ?? null,
          costPrice: +(combo.costPrice ?? 0) || 0,
          quantity: combo.quantity ?? 0,
          ...(combo.images ? { images: nextImages || [] } : {}),
          ...(nextOptionValueIds.length ? { optionValueIds: nextOptionValueIds } : {}),
          ...(nextAttributes.length ? { attributes: nextAttributes } : {}),
        };
      });

      const body: IProductRequest = {
        id: 0,
        name: `${formData.name} (Copy)`,
        position: 0,
        status: formData.status,
        categoryId: selectedCategory?.value ?? null,
        exchange: 1,
        otherUnits: detailProduct?.otherUnits ?? "",
        type: detailProduct?.type ? String(detailProduct.type) : "1",
        description: formData.description,
        ...(variantGroups.length
          ? {
              variantGroups: variantGroups
                .filter((group) => group.name.trim())
                .map((group) => ({
                  name: group.name.trim(),
                  ...(group.key?.trim() ? { key: group.key.trim() } : {}),
                  ...(group.options?.some((option) => option.label.trim())
                    ? {
                        options: group.options
                          .filter((option) => option.label.trim())
                          .map((option) => ({ label: option.label.trim() })),
                      }
                    : {}),
                })),
            }
          : {}),
        ...(variants.length ? { variants } : {}),
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
          <div className="variant-panel">
            <div className="variant-toolbar card">
              <div className="variant-toolbar__left">
                <h3>Biến thể sản phẩm</h3>
                <p>Khai báo nhóm biến thể, ảnh, SKU, mã vạch, giá bán và tồn kho riêng cho từng biến thể.</p>
              </div>

              <div className="variant-toolbar__right">
                <span className="variant-toolbar__count">
                  {combinations.length} biến thể
                </span>
                <button className="variant-btn variant-btn--primary" onClick={addVariant}>
                  <Icon name="Plus" />
                  Thêm biến thể
                </button>
              </div>
            </div>

            <div className="variant-group-panel card">
              <div className="variant-group-panel__header">
                <div>
                  <h4>Nhóm biến thể</h4>
                  <p>Tạo các nhóm như Màu sắc, Kích thước để gắn thuộc tính cho từng biến thể.</p>
                </div>
                <button className="variant-btn variant-btn--secondary variant-btn--text-only" type="button" onClick={addVariantGroup}>
                  Thêm nhóm biến thể
                </button>
              </div>

              {variantGroups.length > 0 ? (
                <div className="variant-group-list">
                  {variantGroups.map((group, groupIndex) => (
                    <div className="variant-group-card" key={`${group.id ?? "new"}-${groupIndex}`}>
                      <div className="variant-group-card__top">
                        <div className="variant-group-card__title">Nhóm {groupIndex + 1}</div>
                        <button
                          type="button"
                          className="variant-icon-btn variant-icon-btn--danger"
                          onClick={() => removeVariantGroup(groupIndex)}
                        >
                          <Icon name="Trash" style={{ width: 16 }} />
                        </button>
                      </div>

                      <div className="variant-grid variant-grid--2">
                        <div className="add-prod-field">
                          <label>Tên nhóm</label>
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => updateVariantGroup(groupIndex, "name", e.target.value)}
                            placeholder="Ví dụ: Màu sắc"
                          />
                        </div>
                        <div className="add-prod-field">
                          <label>Key</label>
                          <input
                            type="text"
                            value={group.key || ""}
                            onChange={(e) => updateVariantGroup(groupIndex, "key", e.target.value)}
                            placeholder="mau-sac"
                          />
                        </div>
                      </div>

                      <div className="variant-option-list">
                        {group.options.map((option, optionIndex) => (
                          <div className="variant-option-row" key={`${groupIndex}-${optionIndex}`}>
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => updateVariantGroupOption(groupIndex, optionIndex, e.target.value)}
                              placeholder={`Lựa chọn ${optionIndex + 1}`}
                            />
                            <button
                              type="button"
                              className="variant-icon-btn variant-icon-btn--danger"
                              onClick={() => removeVariantGroupOption(groupIndex, optionIndex)}
                            >
                              <Icon name="Trash" style={{ width: 16 }} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        className="variant-btn variant-btn--secondary variant-btn--text-only"
                        type="button"
                        onClick={() => addVariantGroupOption(groupIndex)}
                      >
                        Thêm lựa chọn
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="variant-group-empty">
                  Chưa có nhóm biến thể. Bạn vẫn có thể tạo biến thể thủ công hoặc thêm nhóm để quản lý thuộc tính tốt hơn.
                </div>
              )}
            </div>

            {combinations.length > 0 ? (
              <div className="variant-list">
                {combinations.map((c, idx) => {
                  const up = c.unitPrices[0] || makeEmptyUnitPrice();

                  return (
                    <div className="variant-card card" key={c.key}>
                      <div className="variant-card__header">
                        <div className="variant-card__title-wrap">
                          <span className="variant-card__index">#{idx + 1}</span>
                          <div>
                            <div className="variant-card__title">
                              {c.label?.trim() || `Biến thể ${idx + 1}`}
                            </div>
                            <div className="variant-card__subtitle">
                              {c.barcode?.trim() ? `Barcode: ${c.barcode}` : "Chưa có mã vạch"}
                            </div>
                          </div>
                        </div>

                        <div className="variant-card__actions">
                          <button
                            type="button"
                            className="variant-icon-btn"
                            onClick={() => {
                              // optional: duplicateVariant(c.key)
                            }}
                          >
                            <Icon name="Copy" style={{ width: 16 }} />
                          </button>

                          <button
                            type="button"
                            className="variant-icon-btn variant-icon-btn--danger"
                            onClick={() => removeVariant(c.key)}
                          >
                            <Icon name="Trash" style={{ width: 16 }} />
                          </button>
                        </div>
                      </div>

                      <div className="variant-card__body">
                        <div className="variant-card__left">
                          <div className="add-prod-field">
                            <label>Tên biến thể</label>
                            <input
                              type="text"
                              value={c.label}
                              onChange={(e) => updateComboLabel(c.key, e.target.value)}
                              placeholder="Ví dụ: Đỏ / M"
                            />
                          </div>

                          <div className="variant-card__media">
                            <label className="variant-label">Ảnh biến thể</label>
                            <FileUpload
                              type="avatar"
                              label="Ảnh biến thể"
                              formData={{
                                values: {
                                  avatar:
                                    c.images?.[0] || (idx === 0 ? selectedImagePreview || formData.avatar : ""),
                                },
                              }}
                              setFormData={(fd: any) => {
                                const nextAvatar = fd?.values?.avatar || "";
                                if (!nextAvatar) updateComboImage(c.key, null);
                              }}
                              onFileChange={(file: File | null) => updateComboImage(c.key, file)}
                            />
                          </div>

                          <div className="add-prod-field">
                            <label>Mã vạch</label>
                            <div className="variant-barcode">
                              <input
                                type="text"
                                value={c.barcode}
                                onChange={(e) => updateComboBarcode(c.key, e.target.value)}
                                placeholder="Nhập mã vạch..."
                              />
                              <button className="variant-btn variant-btn--secondary" type="button">
                                <Icon name="ScanLine" />
                                Quét mã
                              </button>
                            </div>
                          </div>

                          <div className="variant-image-list">
                            <div className="variant-image-list__header">
                              <label className="variant-label">Danh sách ảnh</label>
                              <button
                                className="variant-btn variant-btn--secondary"
                                type="button"
                                onClick={() => addComboImageSlot(c.key)}
                              >
                                <Icon name="Plus" />
                                Thêm ảnh
                              </button>
                            </div>
                            {(c.images || []).map((image, imageIndex) => (
                              <div className="variant-image-row" key={`${c.key}-image-${imageIndex}`}>
                                <input
                                  type="text"
                                  value={image}
                                  onChange={(e) => updateComboImageUrl(c.key, imageIndex, e.target.value)}
                                  placeholder="Dán URL ảnh hoặc base64"
                                />
                                <button
                                  type="button"
                                  className="variant-icon-btn variant-icon-btn--danger"
                                  onClick={() => removeComboImage(c.key, imageIndex)}
                                >
                                  <Icon name="Trash" style={{ width: 16 }} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="variant-card__content">
                          <div className="variant-grid variant-grid--3">
                            <div className="add-prod-field">
                              <label>SKU</label>
                              <input
                                type="text"
                                value={c.sku}
                                onChange={(e) => updateComboSku(c.key, e.target.value)}
                                placeholder="Ví dụ: TS-RED-M"
                              />
                            </div>

                            <div className="add-prod-field">
                              <label>Đơn vị</label>
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
                                  if (!listUnit.length) {
                                    setListUnit((await SelectOptionData("unit")) || []);
                                  }
                                }}
                                placeholder="Chọn đơn vị..."
                                isClearable
                              />
                            </div>

                            <div className="add-prod-field">
                              <label>Nhà cung cấp</label>
                              <input
                                type="number"
                                value={c.supplierId ?? ""}
                                onChange={(e) =>
                                  setCombinations((prev) =>
                                    prev.map((combo) =>
                                      combo.key === c.key
                                        ? {
                                            ...combo,
                                            supplierId: e.target.value ? +e.target.value : null,
                                          }
                                        : combo
                                    )
                                  )
                                }
                                placeholder="ID nhà cung cấp"
                              />
                            </div>
                          </div>

                          {variantGroups.length > 0 && (
                            <div className="variant-attribute-grid">
                              {variantGroups.map((group, groupIndex) => (
                                <div className="add-prod-field" key={`${group.name}-${groupIndex}`}>
                                  <label>{group.name || `Nhóm ${groupIndex + 1}`}</label>
                                  <select
                                    value={c.selectedOptions[group.name] || ""}
                                    onChange={(e) => updateComboSelectedOption(c.key, group.name, e.target.value)}
                                  >
                                    <option value="">Chọn thuộc tính</option>
                                    {group.options
                                      .filter((option) => option.label.trim())
                                      .map((option, optionIndex) => (
                                        <option
                                          key={`${groupIndex}-${option.id ?? optionIndex}`}
                                          value={option.label}
                                        >
                                          {option.label}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="variant-grid variant-grid--3">
                            <div className="add-prod-field">
                              <label>Giá bán</label>
                              <div className="variant-price">
                                <span className="variant-price__icon">₫</span>
                                <NummericInput
                                  value={up.price}
                                  onValueChange={(vals: any) =>
                                    updateUnitPrice(c.key, up.tempId, "price", vals.floatValue ?? 0)
                                  }
                                  placeholder="Giá bán"
                                  thousandSeparator={true}
                                />
                              </div>
                            </div>

                            <div className="add-prod-field">
                              <label>Giá khuyến mãi</label>
                              <div className="variant-price">
                                <span className="variant-price__icon">₫</span>
                                <NummericInput
                                  value={c.pricePromo}
                                  onValueChange={(vals: any) =>
                                    updateVariantMeta(c.key, "pricePromo", vals.floatValue ?? 0)
                                  }
                                  placeholder="0"
                                  thousandSeparator={true}
                                />
                              </div>
                            </div>

                            <div className="add-prod-field">
                              <label>Giá vốn</label>
                              <div className="variant-price">
                                <span className="variant-price__icon">₫</span>
                                <NummericInput
                                  value={c.costPrice}
                                  onValueChange={(vals: any) =>
                                    updateVariantMeta(c.key, "costPrice", vals.floatValue ?? 0)
                                  }
                                  placeholder="0"
                                  thousandSeparator={true}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="variant-grid variant-grid--2 variant-grid--muted">
                            <div className="add-prod-field">
                              <label>Số lượng</label>
                              <input
                                type="number"
                                value={c.quantity ?? 0}
                                onChange={(e) => updateVariantMeta(c.key, "quantity", +e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="variant-empty card">
                <Icon name="PackagePlus" />
                <h4>Chưa có biến thể nào</h4>
                <p>
                  Tạo biến thể đầu tiên để khai báo ảnh, mã vạch, đơn vị, giá bán và tồn kho riêng.
                </p>
                <button className="variant-btn variant-btn--primary" onClick={addVariant}>
                  <Icon name="Plus" />
                  Tạo biến thể đầu tiên
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

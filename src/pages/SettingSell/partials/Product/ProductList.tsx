import React, { Fragment, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import _ from "lodash";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction } from "model/OtherModel";
import { IProductListProps } from "model/product/PropsModel";
import { IProductFilterRequest } from "model/product/ProductRequestModel";
import { IProductResponse } from "model/product/ProductResponseModel";
import { showToast } from "utils/common";
import { formatCurrency, getPageOffset } from "reborn-util";
import ProductService from "services/ProductService";
import AddProductModal from "./partials/AddProductModal";
import { getPermissions } from "utils/common";
import "./ProductList.scss";
import CustomerCharacteristics from "pages/Common/CustomerCharacteristics";
import PermissionService from "services/PermissionService";
import ConfigIntegrateModal from "./ConfigIntegrateModal/ConfigIntegrateModal";
import DetailProductModal from "./DetailProduct/DetailProductModal";
import ModalImportProduct from "./partials/ModalImport";
import Badge from "@/components/badge/badge";
import { ProductLabel } from "@/assets/mock/Product";
import ConfigDisplayModal from "./DetailProduct/ConfigDisplayModal";
import CategoryModal from "./partials/CategoryModal";
import AddProductPage from "./partials/AddProductPage";
import { syncProductToLazada } from "services/LazadaSyncService";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import ShareLinkModal from "./partials/ShareLinkModal";
import BarcodePrintModal from "./partials/BarcodePrintModal";

// ---- Tab filter type ----
type StatusTab = "all" | "active" | "paused" | "category" | "label" | "low_stock" | "on_web";

const isSuccessResponse = (response: any) => response?.code === 0 || response?.status === 1;

// showOnWebsite (số 0/1) ưu tiên hơn showOnWeb (boolean) vì API trả không nhất quán
const getProductWebState = (item: IProductResponse) =>
  Boolean(item?.showOnWebsite ?? item?.showOnWeb);

export default function ProductList(props: IProductListProps) {
  document.title = "Danh sách sản phẩm";

  const { onBackProps } = props;

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const targetBsnId_product = localStorage.getItem("targetBsnId_product");

  const [listProduct, setListProduct] = useState<IProductResponse[]>([]);
  const [idProduct, setIdProduct] = useState<number>(null);
  const [dataProduct, setDataProduct] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalConfig, setShowModalConfig] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [listPartner, setListPartner] = useState([]);
  const [showModalDetail, setShowModalDetail] = useState<boolean>(false);
  const [showModalImport, setShowModalImport] = useState<boolean>(false);
  const [isConfigIntegrateModal, setIsConfigIntegrateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchValue, setSearchValue] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductPage, setShowProductPage] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set());

  // ── Share Link Modal ──
  const [shareProduct, setShareProduct] = useState<IProductResponse | null>(null);

  // ── Barcode Print Modal ──
  const [showBarcodePrint, setShowBarcodePrint] = useState(false);
  const [barcodePrintProduct, setBarcodePrintProduct] = useState<{ name: string; variants: any[] } | null>(null);
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);

  // Đọc ?productId từ URL (từ Global Search) → tự mở trang chi tiết sản phẩm
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const pid = searchParams.get("productId");
    if (pid) {
      const numId = parseInt(pid, 10);
      if (!isNaN(numId)) {
        setIdProduct(numId);
        setShowProductPage(true);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [targetBsnId, setTargetBsnId] = useState(targetBsnId_product ? +targetBsnId_product : null);
  useEffect(() => {
    localStorage.setItem("targetBsnId_product", JSON.stringify(targetBsnId));
  }, [targetBsnId]);

  const [params, setParams] = useState<IProductFilterRequest>({
    name: "",
    limit: 10,
    page: 1,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Sản phẩm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListProduct = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ProductService.wList(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListProduct(result.items);
      setPagination((prev) => ({
        ...prev,
        page: +result.page,
        sizeLimit: paramsSearch.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(paramsSearch.limit ?? DataPaginationDefault.sizeLimit)),
      }));
      if (+result.total === 0 && +result.page === 1) setIsNoItem(true);
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getListProduct(params);
    return () => {
      abortController.abort();
    };
  }, [params]);

  const colorData = [
    "#E98E4C",
    "#ED6665",
    "#FFBF00",
    "#9966CC",
    "#6A5ACD",
    "#007FFF",
    "#993300",
    "#F0DC82",
    "#CC5500",
    "#C41E3A",
    "#ACE1AF",
    "#7FFF00",
    "#FF7F50",
    "#BEBEBE",
    "#FF00FF",
    "#C3CDE6",
    "#FFFF00",
    "#40826D",
    "#704214",
  ];

  const getListPartner = async () => {
    const p = { limit: 100, status: 1, requestCode: "product" };
    const response = await PermissionService.requestPermissionSource(p);
    if (response.code === 0) {
      const result = response.result.items || [];
      const newList = [];
      result.map((item, index) => {
        if (newList.filter((el) => el.targetBsnId === item.targetBsnId).length === 0) {
          newList.push({ name: item.targetBranchName, targetBsnId: item.targetBsnId, color: colorData[index] });
        }
      });
      setListPartner(newList);
    }
  };

  useEffect(() => {
    getListPartner();
  }, []);

  // TODO: Implement QR scan handler
  const handleScanQR = () => {
    showToast("Chức năng quét mã QR đang được phát triển", "info");
  };

  // TODO: Implement category management handler
  const handleOpenCategory = () => {
    setShowCategoryModal(true);
  };

  // TODO: Implement display settings handler
  const handleDisplaySettings = () => {
    setShowModalDetail(true);
  };

  // TODO: Implement tab filter (API integration needed)
  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    // TODO: call getListProduct with corresponding status filter
  };

  const handleToggleWebDisplay = async (item: IProductResponse, newValue: boolean) => {
    const previousValue = getProductWebState(item);
    const patch = (value: boolean) =>
      setListProduct((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, showOnWeb: value, showOnWebsite: value ? 1 : 0 } : p))
      );

    patch(newValue);

    const response = await ProductService.wWebsiteToggle({ id: item.id, showOnWebsite: newValue ? 1 : 0 });

    if (isSuccessResponse(response)) {
      showToast(newValue ? "Đã đẩy sản phẩm lên website" : "Đã ẩn sản phẩm khỏi website", "success");
      return;
    }

    patch(previousValue);
    showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  };

  const onDelete = async (id: number) => {
    const response = await ProductService.wDelete(id);
    if (response.code === 0) {
      showToast("Xóa sản phẩm thành công", "success");
      getListProduct(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;
    const arrPromises = selectedIds.map((selectedId) => {
      const found = listProduct.find((item) => item.id === selectedId);
      return found?.id ? ProductService.delete(found.id) : Promise.resolve(null);
    });
    Promise.all(arrPromises)
      .then((results) => {
        const count = results.filter(Boolean)?.length || 0;
        if (count > 0) {
          showToast(`Xóa thành công ${count} sản phẩm`, "success");
          getListProduct(params);
          setListIdChecked([]);
        } else {
          showToast("Không có sản phẩm nào được xóa", "error");
        }
      })
      .finally(() => {
        setShowDialog(false);
        setContentDialog(null);
      });
  };

  // ── Barcode Print handler ──
  // Dùng cho cả single item (từ action menu) và bulk (từ listIdChecked)
  const handleOpenBarcodePrint = async (productIds: number[]) => {
    if (!productIds.length) return;
    setIsFetchingBarcode(true);
    try {
      // Fetch detail song song tất cả SP đã chọn
      const results = await Promise.all(productIds.map((id) => ProductService.wDetail(id)));
      const allVariants: any[] = [];
      let productName = "";

      results.forEach((res) => {
        if (res.code !== 0) return;
        const p = res.result;
        if (!productName) productName = p.name; // tên SP đầu tiên
        const realVariants = (p.variants || []).filter((v: any) => v.label !== "Mac dinh");
        realVariants.forEach((v: any) => {
          allVariants.push({
            id: v.id,
            label: productIds.length > 1 ? `${p.name} — ${v.label}` : v.label,
            sku: v.sku || "",
            barcode: v.barcode || "",
            price: v.price ?? 0,
            unitName: v.unitName || "",
          });
        });
        // Nếu không có biến thể thực → dùng "Mặc định"
        if (realVariants.length === 0 && p.variants?.length > 0) {
          const def = p.variants[0];
          allVariants.push({
            id: def.id,
            label: productIds.length > 1 ? `${p.name}` : "Mặc định",
            sku: def.sku || "",
            barcode: def.barcode || "",
            price: def.price ?? 0,
            unitName: def.unitName || "",
          });
        }
      });

      if (!allVariants.length) {
        showToast("Các sản phẩm đã chọn chưa có mã vạch", "error");
        return;
      }

      setBarcodePrintProduct({
        name: productIds.length === 1 ? productName : `${productIds.length} sản phẩm`,
        variants: allVariants,
      });
      setShowBarcodePrint(true);
    } catch {
      showToast("Không thể tải thông tin sản phẩm", "error");
    } finally {
      setIsFetchingBarcode(false);
    }
  };

  const handleDuplicateProd = async (item: IProductResponse) => {
    // Dùng syncingIds để hiện loading trên icon nút nhân bản
    setSyncingIds(prev => new Set(prev).add(item.id));
    try {
      // 1. Lấy đầy đủ thông tin sản phẩm gốc (variants, variantGroups, tags, content...)
      const detailRes = await ProductService.wDetail(item.id);
      if (detailRes.code !== 0) {
        showToast(detailRes.message ?? "Không thể lấy thông tin sản phẩm", "error");
        return;
      }
      const src = detailRes.result;

      // 2. Helper: sinh EAN-13 hợp lệ (prefix 893 = Việt Nam)
      const genEAN13 = (): string => {
        const prefix = "893";
        const rand = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("");
        const partial = prefix + rand;
        let sum = 0;
        for (let i = 0; i < 12; i++) sum += parseInt(partial[i]) * (i % 2 === 0 ? 1 : 3);
        return partial + ((10 - (sum % 10)) % 10);
      };

      // Helper: sinh SKU an toàn (tránh SKU rỗng, thêm suffix "-C" + random)
      const genDupSku = (original: string): string => {
        const base = (original || "SP").replace(/-C$/, "").slice(0, 14);
        const ts = Date.now().toString(36).toUpperCase().slice(-3);
        const rnd = Math.random().toString(36).slice(2, 4).toUpperCase();
        return `${base}-C${ts}${rnd}`.slice(0, 19); // max 19 ký tự (< 20)
      };

      // 3. Build variantGroups (bỏ id → tạo mới)
      const dupVariantGroups = (src.variantGroups || []).map((g: any) => ({
        name: g.name,
        options: (g.options || []).map((o: any) => ({ label: o.label })),
      }));

      // 4. Build variants — sinh SKU + barcode mới, giữ giá/ảnh/đơn vị
      const realVariants = (src.variants || []).filter((v: any) => v.label !== "Mac dinh");
      const dupVariants = realVariants.length > 0
        ? realVariants.map((v: any) => ({
            label: v.label,
            sku: genDupSku(v.sku || ""),
            barcode: genEAN13(),                // sinh mới để tránh unique constraint
            unitId: v.unitId ?? null,
            price: v.price ?? 0,
            costPrice: v.costPrice ?? 0,
            priceWholesale: v.priceWholesale ?? 0,
            pricePromo: v.pricePromo ?? v.pricePromotion ?? 0,
            pricePromotion: v.pricePromo ?? v.pricePromotion ?? 0,
            images: v.images || [],
            selectedOptions: (v.selectedOptions || []).map((o: any) => ({
              groupName: o.groupName,
              label: o.label,
            })),
            attributes: (v.attributes || []).map((a: any) => ({ name: a.name, value: a.value })),
            variantPrices: (v.variantPrices || []).map((u: any) => ({
              unitId: u.unitId ?? null,
              unitName: u.unitName ?? "",
              price: u.price ?? 0,
            })),
          }))
        : [{
            label: "Mac dinh",
            sku: genDupSku("SP"),
            barcode: genEAN13(),
            price: 0,
            costPrice: 0,
            priceWholesale: 0,
            pricePromo: 0,
          }];

      const body: any = {
        id: 0,
        name: `${src.name} (Copy)`,
        position: 0,
        status: src.status ?? 1,
        categoryId: src.categoryId ?? null,
        exchange: src.exchange ?? 1,
        otherUnits: src.otherUnits ?? "",
        type: src.type ? String(src.type) : "1",
        description: src.description ?? "",
        minStock: src.minStock ?? null,
        maxStock: src.maxStock ?? null,
        variantGroups: dupVariantGroups,
        variants: dupVariants,
      };

      const res = await ProductService.wUpdate(body);
      if (res.code !== 0) {
        showToast(res.error ?? res.message ?? "Có lỗi xảy ra", "error");
        return;
      }

      // 5. Lấy id sản phẩm mới vừa tạo
      const newId = res.result?.id ?? res.result;

      if (newId) {
        const sideEffects: Promise<any>[] = [];

        // Copy mô tả chi tiết (content HTML + delta)
        if (src.content || src.contentDelta) {
          sideEffects.push(
            ProductService.wDescriptionUpdate({
              productId: newId,
              content: src.content ?? "",
              contentDelta: src.contentDelta ?? "",
            })
          );
        }

        // Copy tags
        if (src.tagIds?.length > 0) {
          sideEffects.push(
            ProductService.wTagUpdate({ productId: newId, tagIds: src.tagIds })
          );
        }

        if (sideEffects.length) await Promise.allSettled(sideEffects);
      }

      showToast("Nhân bản sản phẩm thành công", "success");
      getListProduct(params);
    } finally {
      setSyncingIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
    }
  };

  const showDialogConfirmDelete = (item?: IProductResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "sản phẩm " : `${listIdChecked.length} sản phẩm đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (item?.id) {
          onDelete(item.id);
          return;
        }
        if (listIdChecked.length > 0) {
          onDeleteAll();
          return;
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: isFetchingBarcode ? "Đang tải..." : "In mã vạch",
      callback: () => handleOpenBarcodePrint(listIdChecked),
    },
    permissions["PRODUCT_DELETE"] == 1 && {
      title: "Xóa sản phẩm",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const getRandomLabel = () => {
    const keys = Object.keys(ProductLabel);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return ProductLabel[randomKey];
  };

  // Stats (TODO: replace with real API data)
  const stats = [
    { label: "Tổng sản phẩm", value: pagination.totalItem ?? 0, color: "#3b82f6" },
    { label: "Đang bán", value: 0, color: "#22c55e" }, // TODO: get from API
    { label: "Sắp hết hàng", value: 0, color: "#ef4444" }, // TODO: get from API
    { label: "Hiển thị trên Web", value: 0, color: "#8b5cf6" }, // TODO: get from API
    { label: "Hết hàng", value: 0, color: "#f97316" }, // TODO: get from API
  ];

  const filterTabs: { key: StatusTab; label: string; count?: number }[] = [
    { key: "all", label: "Tất cả", count: pagination.totalItem },
    { key: "active", label: "Đang bán", count: 0 }, // TODO: real counts
    { key: "paused", label: "Tạm dừng", count: 0 }, // TODO: real counts
  ];

  const filterChips: { key: StatusTab; label: string; icon?: string }[] = [
    { key: "category", label: "Danh mục" },
    { key: "label", label: "Nhãn" },
    { key: "low_stock", label: "Sắp hết hàng" },
    { key: "on_web", label: "Trên Web" },
  ];

  // --- Table columns ---
  const titles = ["Sản phẩm", "Danh mục", "Giá bán / giá sỉ", "Tồn kho", "Hiển thị web", "Trạng thái"];

  const dataFormat = ["", "", "text-right", "text-center", "text-center", "text-center"];

  const getStatusBadge = (item: IProductResponse) => {
    // TODO: use real status field from API when available
    // Mocked: derive from price/stock for demo
    return <span className="product-status-badge product-status-badge--active">Đang bán</span>;
  };

  const dataMappingArray = (item: IProductResponse, index: number) => {
    const randomLabel = getRandomLabel();
    return [
      // SẢN PHẨM
      <div className="product-cell" key={item.id}>
        <div className="product-cell__img">
          {item.avatar ? (
            <a data-fancybox="gallery" href={item.avatar}>
              <Image src={item.avatar} alt={item.name} width={"48px"} />
            </a>
          ) : (
            // ✅ Placeholder ảnh đẹp thay vì ảnh lỗi xấu
            <div className="product-cell__img-placeholder">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4c9d4" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          )}
        </div>
        <div className="product-cell__info">
          <p className="product-cell__name">{item.name}</p>
          <p className="product-cell__meta">
            <span className="product-cell__sku">SKU: {item.productLine || "—"}</span>
            {item.code && (
              <>
                <span className="product-cell__dot">·</span>
                <span className="product-cell__barcode">{item.code}</span>
              </>
            )}
          </p>
        </div>
      </div>,

      // DANH MỤC
      <span className="product-category-badge" key={`cat-${item.id}`}>
        {item.categoryName || "Chưa xác định"}
      </span>,

      // GIÁ BÁN / GIÁ SỈ
      <div className="product-price-cell" key={`price-${item.id}`}>
        <p className="product-price-cell__main">{formatCurrency(item.price)}</p>
        {item.priceWholesale > 0 && (
          <p className="product-price-cell__wholesale">Sỉ: {formatCurrency(item.priceWholesale)}</p>
        )}
      </div>,

      // TỒN KHO
      <div className="product-stock-cell" key={`stock-${item.id}`}>
        <span className="product-stock-cell__value">
          {item.stock != null ? item.stock : "—"}
        </span>
      </div>,

      // HIỂN THỊ WEB
      <div className="product-toggle-cell" key={`toggle-${item.id}`}>
        <label className="product-toggle">
          <input type="checkbox" checked={getProductWebState(item)} onChange={(e) => handleToggleWebDisplay(item, e.target.checked)} />
          <span className="product-toggle__slider" />
        </label>
      </div>,

      // TRẠNG THÁI
      getStatusBadge(item),
    ];
  };

  const handleSyncLazada = async (item: IProductResponse) => {
    if (syncingIds.has(item.id)) return;
    setSyncingIds(prev => new Set(prev).add(item.id));
    try {
      // Load chi tiết sản phẩm với variants
      const detailRes = await ProductService.detail(item.id);
      const detail = detailRes?.result ?? detailRes?.data ?? item;
      const result = await syncProductToLazada({
        id:           item.id,
        name:         item.name,
        description:  detail.description ?? "",
        price:        item.price,
        avatar:       item.avatar,
        code:         item.code,
        productLine:  item.productLine,
        categoryId:   item.categoryId,
        categoryName: item.categoryName,
        stock:        item.stock,
        variants:     detail.variants ?? [],
      });
      if (result.success) {
        showToast(result.message, "success");
      } else {
        showToast(`Lazada: ${result.message}`, "error");
      }
    } catch (e: any) {
      showToast(e?.message ?? "Lỗi đồng bộ Lazada", "error");
    } finally {
      setSyncingIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
    }
  };

  // Keep actionsTable for BoxTable inline actions (hidden/redundant with new layout but kept for compatibility)
  const actionsTable = (item: IProductResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      // {
      //   title: "Đặc trưng khách hàng",
      //   icon: <Icon name="Tag" className={isCheckedItem ? "icon-disabled" : ""} style={{ width: 18 }} />,
      //   disabled: isCheckedItem,
      //   callback: () => {
      //     if (!isCheckedItem) {
      //       setIdProduct(item.id);
      //       setShowModalConfig(true);
      //     }
      //   },
      // },
      // {
      //   title: "Chi tiết sản phẩm",
      //   icon: <Icon name="CollectInfo" className={isCheckedItem ? "icon-disabled" : ""} style={{ width: 17 }} />,
      //   disabled: isCheckedItem,
      //   callback: () => {
      //     if (!isCheckedItem) {
      //       setDataProduct(item);
      //       setShowModalDetail(true);
      //     }
      //   },
      // },
      // ── Chia sẻ link sản phẩm ──
      {
        title: "Chia sẻ link sản phẩm",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        ),
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) setShareProduct(item);
        },
      },
      {
        title: syncingIds.has(item.id) ? "Đang đồng bộ..." : "Đồng bộ Lazada",
        icon: <Icon
          name="Sync"
          className={syncingIds.has(item.id) ? "icon-disabled icon-spin" : ""}
          style={{ width: 17 }}
        />,
        disabled: syncingIds.has(item.id),
        callback: () => { handleSyncLazada(item); },
      },
      {
        title: "Nhân bản sản phẩm",
        icon: <Icon name="Copy" className={isCheckedItem ? "icon-disabled" : ""} style={{ width: 17 }} />,
        callback: () => {
          handleDuplicateProd(item);
        },
      },
      {
        title: "In mã vạch",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4a2 2 0 00-2 2v7a2 2 0 002 2h16a2 2 0 002-2v-7a2 2 0 00-2-2h-2"/>
            <rect x="6" y="2" width="12" height="9" rx="2"/>
            <path d="M6 17H4M18 17h2M8 13v4M12 13v4M16 13v4"/>
          </svg>
        ),
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) handleOpenBarcodePrint([item.id]);
        },
      },
      permissions["PRODUCT_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setIdProduct(item.id);
            setShowProductPage(true);
            // setShowModalAdd(true);
            setDataProduct(item);
          }
        },
      },
      permissions["PRODUCT_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) showDialogConfirmDelete(item);
        },
      },
    ].filter(Boolean) as IAction[];
  };

  if (showProductPage) {
    return (
      <AddProductPage
        idProduct={idProduct}
        data={dataProduct}
        onBack={(reload) => {
          if (reload) getListProduct(params);
          setShowProductPage(false);
          setIdProduct(null);
          setDataProduct(null);
        }}
      />
    );
  }

  return (
    <div className="page-content page-product page-product--v2">
      {/* ── HEADER ── */}
      <div className="action-navigation">
        <div className="action-backup">
          <h1 className="title-first" onClick={() => onBackProps(true)} title="Quay lại">
            Cài đặt bán hàng
          </h1>
          <Icon name="ChevronRight" onClick={() => onBackProps(true)} />
          <h1 className="title-last">Danh sách sản phẩm</h1>
        </div>
        <TitleAction
          title=""
          titleActions={{
            actions: [
              {
                title: "Thêm sản phẩm",
                color: "primary",
                callback: () => {
                  setIdProduct(null);
                  setShowProductPage(true);
                },
              },
            ],
          } as ITitleActions}
        />
      </div>

      {/* ── SECONDARY ACTIONS ── */}
      <div className="prod-list-secondary-actions">
        <button className="prod-list-btn prod-list-btn--ghost" onClick={() => setShowModalImport(true)}>
          <Icon name="UploadExcel" />
          Nhập Excel
        </button>
        <button className="prod-list-btn prod-list-btn--ghost" onClick={handleOpenCategory}>
          📦 Danh mục
        </button>
        <button className="prod-list-btn prod-list-btn--ghost" onClick={handleDisplaySettings}>
          <Icon name="Settings" />
          Cài đặt hiển thị
        </button>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="prod-list-toolbar">
        {/* Search */}
        <div className="prod-list-search">
          <Icon name="Search" />
          <input
            type="text"
            placeholder="Tìm tên sản phẩm, mã vạch, SKU..."
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              clearTimeout(searchTimerRef.current);
              searchTimerRef.current = setTimeout(() => {
                setParams((prev) => ({ ...prev, name: value, page: 1 }));
              }, 400);
            }}
          />
        </div>

        {/* QR button */}
        <button className="prod-list-btn prod-list-btn--qr" onClick={handleScanQR}>
          Quét mã QR
        </button>

        {/* Status tabs */}
        <div className="prod-list-tabs">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              className={`prod-list-tab${activeTab === tab.key ? " prod-list-tab--active" : ""}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
              {tab.count !== undefined && <span className="prod-list-tab__count">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Filter chips */}
        <div className="prod-list-chips">
          {filterChips.map((chip) => (
            <button
              key={chip.key}
              className={`prod-list-chip${activeTab === chip.key ? " prod-list-chip--active" : ""}`}
              onClick={() => handleTabChange(chip.key)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="prod-list-stats">
        {stats.map((stat, idx) => (
          <div className="prod-list-stat" key={idx}>
            <span className="prod-list-stat__dot" style={{ background: stat.color }} />
            <div>
              <p className="prod-list-stat__value">{stat.value}</p>
              <p className="prod-list-stat__label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABLE ── */}
      <div className="prod-list-table-wrap">
        {!isLoading && listProduct && listProduct.length > 0 ? (
          <BoxTable
            name="Sản phẩm"
            titles={titles}
            items={listProduct}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            listIdChecked={listIdChecked}
            striped={true}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isPermissions ? (
              <SystemNotification type="no-permission" />
            ) : isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có sản phẩm nào. <br />
                    Hãy thêm mới sản phẩm đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới sản phẩm"
                action={() => {
                  setIdProduct(null);
                  // setShowModalAdd(true);
                  setShowProductPage(true);
                }}
              />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Không có dữ liệu trùng khớp.
                    <br />
                    Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                  </span>
                }
                type="no-result"
              />
            )}
          </Fragment>
        )}
      </div>

      {/* ── MODALS ── */}
      <AddProductModal
        onShow={showModalAdd}
        idProduct={idProduct}
        data={dataProduct}
        onHide={(reload) => {
          if (reload) getListProduct(params);
          setShowModalAdd(false);
          setDataProduct(null);
        }}
      />

      <ModalImportProduct
        onShow={showModalImport}
        onHide={(isSuccess) => {
          setShowModalImport(false);
          if (isSuccess) getListProduct(params);
        }}
      />

      <CustomerCharacteristics
        onShow={showModalConfig}
        data={idProduct}
        typeProps="product"
        onHide={(reload) => {
          setShowModalConfig(false);
        }}
      />

      <ConfigIntegrateModal
        onShow={isConfigIntegrateModal}
        type="product"
        onHide={(reload) => {
          setIsConfigIntegrateModal(false);
        }}
      />

      {/* <DetailProductModal
        onShow={showModalDetail}
        data={dataProduct}
        onHide={(reload) => {
          if (reload) getListProduct(params);
          setShowModalDetail(false);
          setDataProduct(null);
        }}
      /> */}

      <ConfigDisplayModal
        onShow={showModalDetail}
        // data={dataProduct}
        onHide={(reload) => {
          if (reload) getListProduct(params);
          setShowModalDetail(false);
          setDataProduct(null);
        }}
      />

      <CategoryModal onShow={showCategoryModal} onHide={() => setShowCategoryModal(false)} listProduct={listProduct} />
      <Dialog content={contentDialog} isOpen={showDialog} />

      {/* ── Share Link Modal ── */}
      {shareProduct && (
        <ShareLinkModal
          productId={shareProduct.id}
          productName={shareProduct.name}
          productAvatar={shareProduct.avatar}
          onClose={() => setShareProduct(null)}
        />
      )}

      {/* ── Barcode Print Modal ── */}
      {showBarcodePrint && barcodePrintProduct && (
        <BarcodePrintModal
          onShow={showBarcodePrint}
          onHide={() => { setShowBarcodePrint(false); setBarcodePrintProduct(null); }}
          productName={barcodePrintProduct.name}
          variants={barcodePrintProduct.variants}
        />
      )}
    </div>
  );
}
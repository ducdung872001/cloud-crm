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
import CategoryServiceService from "services/CategoryServiceService";

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
  // Scan QR modal
  const [showScanModal, setShowScanModal]         = useState(false);
  const [scanInput, setScanInput]                 = useState("");
  const [scanSearching, setScanSearching]         = useState(false);
  const [scanFound, setScanFound]                 = useState<any>(null);
  const [scanNotFound, setScanNotFound]           = useState(false);
  const [scanCode, setScanCode]                   = useState("");
  const [preFillBarcode, setPreFillBarcode]       = useState<string | null>(null);
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
  const [summaryData, setSummaryData] = useState({
    totalProduct: 0, sellingProduct: 0, pausedProduct: 0,
    lowStockProduct: 0, websiteVisibleProduct: 0, outOfStockProduct: 0,
  });

  // ── Category filter dropdown ──
  const [categoryList, setCategoryList]         = useState<{id: number; name: string}[]>([]);
  const [showCategoryDrop, setShowCategoryDrop] = useState(false);
  const [filterCategory, setFilterCategory]     = useState<{id: number; name: string} | null>(null);
  const categoryDropRef = useRef<HTMLDivElement>(null);

  // ── Tag filter ──
  const [tagSearch, setTagSearch]             = useState("");
  const [tagList, setTagList]                 = useState<{id: number; name: string}[]>([]);
  const [showTagDrop, setShowTagDrop]         = useState(false);
  const [filterTag, setFilterTag]             = useState<{id: number; name: string} | null>(null);
  const tagDropRef = useRef<HTMLDivElement>(null);

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

  const fetchSummary = async () => {
    try {
      const res = await ProductService.wDashboard();
      if (res.code === 0 && res.result) {
        setSummaryData({
          totalProduct:          +res.result.totalProduct          || 0,
          sellingProduct:        +res.result.sellingProduct        || 0,
          pausedProduct:         +res.result.pausedProduct         || 0,
          lowStockProduct:       +res.result.lowStockProduct       || 0,
          websiteVisibleProduct: +res.result.websiteVisibleProduct || 0,
          outOfStockProduct:     +res.result.outOfStockProduct     || 0,
        });
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    getListProduct(params);
    return () => {
      abortController.abort();
    };
  }, [params]);

  // Load summary một lần khi mount và sau mỗi mutation
  useEffect(() => {
    fetchSummary();
  }, []);

  // Load danh sách danh mục khi mở dropdown
  const loadCategories = async () => {
    if (categoryList.length > 0) return; // cache
    const res = await CategoryServiceService.list({ type: 1, page: 1, limit: 200 });
    if (res.code === 0) {
      setCategoryList((res.result?.items || []).map((i: any) => ({ id: i.id, name: i.name })));
    }
  };

  // Tìm tags theo keyword
  const searchTags = async (kw: string) => {
    const res = await ProductService.wTagList(kw);
    if (res.code === 0) {
      setTagList((res.result?.items || res.result || []).map((i: any) => ({ id: i.id, name: i.name })));
    }
  };

  // Debounced tag search
  const tagSearchTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const handleTagInput = (kw: string) => {
    setTagSearch(kw);
    clearTimeout(tagSearchTimer.current);
    tagSearchTimer.current = setTimeout(() => searchTags(kw), 300);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryDropRef.current && !categoryDropRef.current.contains(e.target as Node)) {
        setShowCategoryDrop(false);
      }
      if (tagDropRef.current && !tagDropRef.current.contains(e.target as Node)) {
        setShowTagDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
    setScanInput(""); setScanFound(null); setScanNotFound(false); setScanCode("");
    setShowScanModal(true);
  };

  const handleScanSearch = async (code?: string) => {
    const q = (code ?? scanInput).trim();
    if (!q) return;
    setScanSearching(true); setScanFound(null); setScanNotFound(false); setScanCode(q);
    try {
      const res = await ProductService.wScan(q);
      if (res.code === 0 && res.result?.id) {
        setScanFound(res.result);
      } else {
        setScanNotFound(true);
      }
    } catch {
      setScanNotFound(true);
    } finally {
      setScanSearching(false);
    }
  };

  const handleScanGoToProduct = () => {
    setPreFillBarcode(scanCode);
    setIdProduct(null);
    setDataProduct(null);
    setShowScanModal(false);
    setShowProductPage(true);
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
  const applyCategory = (cat: {id: number; name: string} | null) => {
    setFilterCategory(cat);
    setShowCategoryDrop(false);
    setParams((prev) => {
      const next = { ...prev, page: 1 };
      if (cat) next.categoryId = cat.id;
      else delete next.categoryId;
      return next;
    });
  };

  const applyTag = (tag: {id: number; name: string} | null) => {
    setFilterTag(tag);
    setShowTagDrop(false);
    setTagSearch(tag?.name || "");
    setParams((prev) => {
      const next = { ...prev, page: 1 };
      if (tag) next.tagId = tag.id;
      else delete next.tagId;
      return next;
    });
  };

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setParams((prev) => {
      const base = { name: prev.name, limit: prev.limit, page: 1 };
      switch (tab) {
        case "active":      return { ...base, status: 1 };
        case "paused":      return { ...base, status: 0 };
        case "low_stock":   return { ...base, isLowStock: 1 };
        case "on_web":      return { ...base, isWebsiteVisible: 1 };
        case "out_stock":   return { ...base, isOutOfStock: 1 };
        case "all":
        default:            return base;
      }
    });
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
      fetchSummary();
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
          fetchSummary();
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

  // ── Unified filter + stats (click để lọc, hiện số từ API) ──
  const FILTER_STATS: { key: StatusTab; label: string; value: number; color: string; dotColor: string }[] = [
    { key: "all",      label: "Tất cả",           value: summaryData.totalProduct,          color: "#3b82f6", dotColor: "#3b82f6" },
    { key: "active",   label: "Đang bán",          value: summaryData.sellingProduct,        color: "#22c55e", dotColor: "#22c55e" },
    { key: "paused",   label: "Tạm dừng",          value: summaryData.pausedProduct,         color: "#6b7280", dotColor: "#6b7280" },
    { key: "low_stock",label: "Sắp hết hàng",      value: summaryData.lowStockProduct,       color: "#ef4444", dotColor: "#ef4444" },
    { key: "on_web",   label: "Hiển thị trên Web", value: summaryData.websiteVisibleProduct, color: "#8b5cf6", dotColor: "#8b5cf6" },
    { key: "out_stock",label: "Hết hàng",          value: summaryData.outOfStockProduct,     color: "#f97316", dotColor: "#f97316" },
  ];

  // --- Table columns ---
  const titles = ["Sản phẩm", "Danh mục", "Giá bán / giá sỉ", "Tồn kho", "Hiển thị web", "Trạng thái"];

  const dataFormat = ["", "", "text-right", "text-right", "text-center", "text-center"];

  const getStatusBadge = (item: IProductResponse) => {
    switch (item.status) {
      case 1:
        return <span className="product-status-badge product-status-badge--active">Đang bán</span>;
      case 0:
        return <span className="product-status-badge product-status-badge--paused">Tạm dừng</span>;
      case 2:
        return <span className="product-status-badge product-status-badge--stopped">Ngừng KD</span>;
      default:
        return <span className="product-status-badge product-status-badge--active">Đang bán</span>;
    }
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
        <p className="product-price-cell__main">{formatCurrency(item.originalPrice)}</p>
        {item.priceWholesale > 0 && (
          <p className="product-price-cell__wholesale">Sỉ: {formatCurrency(item.priceWholesale)}</p>
        )}
      </div>,

      // TỒN KHO
      <div className="product-stock-cell" key={`stock-${item.id}`}>
        <span className="product-stock-cell__value">
          {item.stockQuantity != null ? item.stockQuantity : "—"}
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
        preFillBarcode={preFillBarcode}
        onBack={(reload) => {
          if (reload) getListProduct(params);
          setShowProductPage(false);
          setIdProduct(null);
          setDataProduct(null);
          setPreFillBarcode(null);
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

      {/* ── ROW 1: Search + QR ── */}
      <div className="prod-list-toolbar">
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
          {searchValue && (
            <button className="prod-list-search__clear" onClick={() => {
              setSearchValue("");
              setParams((prev) => ({ ...prev, name: "", page: 1 }));
            }}>✕</button>
          )}
        </div>

        <button className="prod-list-btn prod-list-btn--qr" onClick={handleScanQR}>
          Quét mã QR
        </button>
      </div>

      {/* ── ROW 2: Filter chips + Stats ── */}
      <div className="prod-list-filter-row">
        {/* Left: filter by Danh mục + Tags */}
        <div className="prod-list-filters">

          {/* Danh mục dropdown */}
          <div className="prod-filter-drop" ref={categoryDropRef}>
            <button
              className={`prod-filter-btn${filterCategory ? " prod-filter-btn--active" : ""}`}
              onClick={() => { setShowCategoryDrop((v) => !v); loadCategories(); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h8M4 18h4"/></svg>
              {filterCategory ? filterCategory.name : "Danh mục"}
              {filterCategory
                ? <span className="prod-filter-btn__clear" onClick={(e) => { e.stopPropagation(); applyCategory(null); }}>✕</span>
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              }
            </button>
            {showCategoryDrop && (
              <div className="prod-filter-drop__menu">
                {categoryList.length === 0
                  ? <p className="prod-filter-drop__empty">Chưa có danh mục</p>
                  : categoryList.map((cat) => (
                    <button
                      key={cat.id}
                      className={`prod-filter-drop__item${filterCategory?.id === cat.id ? " prod-filter-drop__item--active" : ""}`}
                      onClick={() => applyCategory(cat)}
                    >
                      {cat.name}
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          {/* Tags dropdown */}
          <div className="prod-filter-drop" ref={tagDropRef}>
            <div
              className={`prod-filter-tag-input${filterTag ? " prod-filter-tag-input--active" : ""}`}
              onClick={() => { setShowTagDrop(true); if (!tagSearch) searchTags(""); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              <input
                placeholder={filterTag ? "" : "Tags sản phẩm"}
                value={filterTag ? filterTag.name : tagSearch}
                readOnly={!!filterTag}
                onChange={(e) => { handleTagInput(e.target.value); setShowTagDrop(true); }}
                onFocus={() => { setShowTagDrop(true); if (!tagSearch && !filterTag) searchTags(""); }}
              />
              {filterTag && (
                <button className="prod-filter-btn__clear" onClick={(e) => { e.stopPropagation(); applyTag(null); setTagSearch(""); setTagList([]); }}>✕</button>
              )}
            </div>
            {showTagDrop && !filterTag && (
              <div className="prod-filter-drop__menu">
                {tagList.length === 0
                  ? <p className="prod-filter-drop__empty">{tagSearch ? "Không tìm thấy tag" : "Nhập để tìm tag..."}</p>
                  : tagList.map((tag) => (
                    <button
                      key={tag.id}
                      className="prod-filter-drop__item"
                      onClick={() => applyTag(tag)}
                    >
                      # {tag.name}
                    </button>
                  ))
                }
              </div>
            )}
          </div>

        </div>

        {/* Right: Stats filter */}
        <div className="prod-list-stats">
          {FILTER_STATS.map((stat) => (
            <button
              key={stat.key}
              className={`prod-list-stat${activeTab === stat.key ? " prod-list-stat--active" : ""}`}
              onClick={() => handleTabChange(stat.key)}
            >
              <span className="prod-list-stat__dot" style={{ background: stat.dotColor }} />
              <div>
                <p className="prod-list-stat__value">{stat.value.toLocaleString("vi-VN")}</p>
                <p className="prod-list-stat__label">{stat.label}</p>
              </div>
            </button>
          ))}
        </div>
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

      {/* ── Scan QR Modal (Danh sách SP) ── */}
      {showScanModal && (
        <div className="scan-overlay" onClick={(e) => e.target === e.currentTarget && setShowScanModal(false)}>
          <div className="scan-modal">
            <div className="scan-modal__header">
              <span>📷 Quét mã sản phẩm</span>
              <button className="scan-modal__close" onClick={() => setShowScanModal(false)}>✕</button>
            </div>

            {/* Input nhập mã */}
            <div className="scan-modal__input-row">
              <input
                autoFocus
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScanSearch()}
                placeholder="Nhập hoặc quét mã vạch rồi Enter..."
                disabled={scanSearching}
              />
              <button
                className="btn btn--primary btn--sm"
                onClick={() => handleScanSearch()}
                disabled={scanSearching || !scanInput.trim()}
              >
                {scanSearching ? "..." : "Tìm"}
              </button>
            </div>

            {/* Tìm thấy */}
            {scanFound && (
              <div className="scan-modal__found">
                <span>✅</span>
                <div>
                  <div className="scan-modal__found-name">{scanFound.name}</div>
                  <div className="scan-modal__found-meta">
                    SKU: {scanFound.sku || "—"} · Tồn: {scanFound.onHandQty ?? 0}
                  </div>
                </div>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => {
                    setIdProduct(scanFound.id);
                    setShowScanModal(false);
                    setShowProductPage(true);
                  }}
                >
                  Xem SP
                </button>
              </div>
            )}

            {/* Không tìm thấy */}
            {scanNotFound && (
              <div className="scan-modal__not-found">
                <div className="scan-modal__nf-icon">🔍</div>
                <p>Không tìm thấy sản phẩm với mã <code>{scanCode}</code></p>
                <div className="scan-modal__nf-actions">
                  <button className="btn btn--primary btn--sm" onClick={handleScanGoToProduct}>
                    ➕ Tạo sản phẩm mới với mã này
                  </button>
                  <button className="btn btn--outline btn--sm" onClick={() => { setScanNotFound(false); setScanInput(""); }}>
                    Quét lại
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
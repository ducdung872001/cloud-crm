import React, { Fragment, useState, useEffect, useRef } from "react";
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
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";

// ---- Tab filter type ----
type StatusTab = "all" | "active" | "paused" | "category" | "label" | "low_stock" | "on_web";

export default function ProductList(props: IProductListProps) {
  document.title = "Danh sách sản phẩm";

  const { onBackProps } = props;

  const isMounted = useRef(false);
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

    // const response = await ProductService.wList(paramsSearch, abortController.signal);
    const response = await ProductService.publicList(paramsSearch, abortController.signal);

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
  const handleScanQR = () => {};

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

  // TODO: Implement toggle web display per product
  const handleToggleWebDisplay = (item: IProductResponse, newValue: boolean) => {
    // TODO: call API to update product web display status
    console.log("Toggle web display", item.id, newValue);
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

  const handleDuplicateProd = async (item: IProductResponse) => {
    const body: any = {
      id: 0,
      name: `${item.name} (Copy)`,
      code: "",
      productLine: item.productLine ?? "",
      price: item.price ?? 0,
      position: 0,
      bsnId: item.bsnId ?? 0,
      unitId: item.unitId ?? null,
      unitName: item.unitName ?? "",
      status: item.status,
      avatar: "",
      categoryId: null,
      categoryName: "",
      exchange: 1,
      otherUnits: item.otherUnits ?? "",
      type: item.type ? String(item.type) : "0",
    };

    const res = await ProductService.wUpdate(body);
    if (res.code === 0) {
      showToast("Nhân bản sản phẩm thành công", "success");
      getListProduct(params); // reload lại list
    } else {
      showToast(res.message ?? "Có lỗi xảy ra", "error");
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
          <a data-fancybox="gallery" href={item.avatar}>
            <Image src={item.avatar} alt={item.name} width={"48px"} />
          </a>
        </div>
        <div className="product-cell__info">
          <p className="product-cell__name">{item.name}</p>
          <p className="product-cell__meta">
            {/* TODO: add SKU and barcode fields to IProductResponse if not present */}
            <span className="product-cell__sku">SKU: —</span>
            <span className="product-cell__dot">·</span>
            <span className="product-cell__barcode">—</span>
          </p>
          {/* <div className="product-cell__tags">
            <Badge text={randomLabel.label} variant={randomLabel.color} />
          </div> */}
        </div>
      </div>,

      // DANH MỤC
      <span className="product-category-badge" key={`cat-${item.id}`}>
        {item.categoryName ? item.categoryName : "Chưa xác định"}
      </span>,

      // GIÁ BÁN / GIÁ SỈ
      <div className="product-price-cell" key={`price-${item.id}`}>
        <p className="product-price-cell__main">{formatCurrency(item.price)}</p>
        {/* TODO: add wholesale price field (giá sỉ) to IProductResponse */}
        <p className="product-price-cell__wholesale">Si: —</p>
      </div>,

      // TỒN KHO
      <div className="product-stock-cell" key={`stock-${item.id}`}>
        {/* TODO: add stock/quantity field to IProductResponse */}
        <span className="product-stock-cell__value">—</span>
      </div>,

      // HIỂN THỊ WEB
      <div className="product-toggle-cell" key={`toggle-${item.id}`}>
        {/* TODO: add isWebDisplay field to IProductResponse */}
        <label className="product-toggle">
          <input type="checkbox" defaultChecked={false} onChange={(e) => handleToggleWebDisplay(item, e.target.checked)} />
          <span className="product-toggle__slider" />
        </label>
      </div>,

      // TRẠNG THÁI
      getStatusBadge(item),
    ];
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
      {
        title: "Nhân bản sản phẩm",
        icon: <Icon name="Copy" className={isCheckedItem ? "icon-disabled" : ""} style={{ width: 17 }} />,
        callback: () => {
          handleDuplicateProd(item);
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
              setSearchValue(e.target.value);
              setParams((prev) => ({ ...prev, name: e.target.value, page: 1 }));
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
        onHide={() => setShowModalImport(false)}
        onImportSuccess={(products) => {
          setListProduct((prev) => [...prev, ...products]);
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
    </div>
  );
}

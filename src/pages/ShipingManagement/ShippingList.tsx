import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { showToast, getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import { formatCurrency, isDifferenceObj } from "reborn-util";
import Badge from "components/badge/badge";

// import ShippingService from "services/ShippingService";
import { mockFilterOrders } from "./ShippingMockData";

import { IShippingOrderFilterRequest } from "model/shipping/ShippingRequestModel";
import { IShippingOrderResponse } from "model/shipping/ShippingResponseModel";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";

import ShippingOrderDetailModal from "./partials/ShippingOrderDetailModal";

import "./ShippingList.scss";

const STATUS_TABS = [
  { label: "Tất cả",       status: "all" },
  { label: "Chờ lấy hàng", status: "pending" },
  { label: "Đang giao",    status: "in_transit" },
  { label: "Đã giao",      status: "delivered" },
  { label: "Hoàn hàng",    status: "returned" },
];

const ROUTES = {
  shippingCreate:       "/shipping/create",
  shippingEdit:         (id: number) => `/shipping/edit/${id}`,
  shippingPartnerSetup: "/shipping/partner-setup",
  shippingFeeConfig:    "/shipping/fee-config",
};

export default function ShippingOrderList() {
  document.title = "Quản lý vận chuyển";

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [permissions]  = useState(getPermissions());
  const [activeTab, setActiveTab]   = useState<string>("all");
  const [tabCounts, setTabCounts]   = useState<Record<string, number>>({
    all: 0, pending: 0, in_transit: 0, delivered: 0, returned: 0,
  });

  const [listOrder, setListOrder]         = useState<IShippingOrderResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading]         = useState<boolean>(false);
  const [isNoItem, setIsNoItem]           = useState<boolean>(false);

  const [showModalDetail, setShowModalDetail] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder]     = useState<IShippingOrderResponse>(null);
  const [showDialog, setShowDialog]           = useState<boolean>(false);
  const [contentDialog, setContentDialog]     = useState<IContentDialog>(null);

  const isMounted = useRef(false);

  const [params, setParams] = useState<IShippingOrderFilterRequest>({
    keyword: "", status: "all", page: 1, limit: 10,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Đơn vận chuyển",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit, page: 1 })),
  });

  // ---- Fetch ----
  const getListOrder = async (paramsSearch: IShippingOrderFilterRequest) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    // TODO: const response = await ShippingService.filter(paramsSearch, signal);
    const response = mockFilterOrders({
      keyword: paramsSearch.keyword,
      status:  paramsSearch.status === "all" ? "" : paramsSearch.status,
      page:    paramsSearch.page,
      limit:   paramsSearch.limit,
    });
    if (response.code === 0) {
      const result = response.result;
      setListOrder(result.items as IShippingOrderResponse[]);
      setTabCounts({
        ...result.tabCounts,
        all: (result.tabCounts.pending ?? 0)
           + (result.tabCounts.in_transit ?? 0)
           + (result.tabCounts.delivered ?? 0)
           + (result.tabCounts.returned ?? 0),
      });
      setPagination((prev) => ({
        ...prev,
        page:      result.page,
        sizeLimit: paramsSearch.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: result.total,
        totalPage: result.totalPage,
      }));
      setIsNoItem(result.total === 0 && !paramsSearch.keyword);
    }
    setIsLoading(false);
  };

  useEffect(() => { getListOrder(params); }, []); 

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    getListOrder(params);
    const paramsTemp = _.cloneDeep(params) as any;
    if (paramsTemp.limit === 10) delete paramsTemp["limit"];
    Object.keys(paramsTemp).forEach((k) => { if (!paramsTemp[k] && paramsTemp[k] !== 0) delete paramsTemp[k]; });
    if (isDifferenceObj(searchParams, paramsTemp)) {
      if (paramsTemp.page === 1) delete paramsTemp["page"];
      setSearchParams(paramsTemp as Record<string, string>);
    }
  }, [params]); 

  // ---- Tab ----
  const handleTabChange = (status: string) => {
    setActiveTab(status);
    setListIdChecked([]);
    setParams((prev) => ({ ...prev, status, page: 1 }));
  };

  // ---- Single actions ----
  const handlePushSingle = useCallback(async (id: number) => {
    await new Promise((r) => setTimeout(r, 200));
    showToast(`Đã đẩy đơn #${id} sang hãng vận chuyển (demo)`, "success");
    getListOrder(params);
  }, [params]); 

  const handlePrintSingle = useCallback(async (id: number) => {
    await new Promise((r) => setTimeout(r, 150));
    showToast(`Đã gửi lệnh in mã vận đơn #${id} (demo)`, "success");
  }, []);

  const handleCancelOrder = useCallback(async (id: number) => {
    await new Promise((r) => setTimeout(r, 200));
    showToast("Đã hủy đơn hàng (demo)", "success");
    getListOrder(params);
    setShowDialog(false);
    setContentDialog(null);
  }, [params]); 

  const showDialogConfirmCancel = (item: IShippingOrderResponse) => {
    setContentDialog({
      color: "error", className: "dialog-delete", isCentered: true, isLoading: true,
      title: <Fragment>Hủy đơn vận chuyển</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc muốn hủy đơn <strong>{item.trackingCode}</strong>?
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Không",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Hủy đơn",
      defaultAction: () => handleCancelOrder(item.id),
    });
    setShowDialog(true);
  };

  // ---- Bulk actions ----
  const handleBulkPush = async () => {
    if (!listIdChecked.length) { showToast("Vui lòng chọn ít nhất một đơn hàng", "warning"); return; }
    await new Promise((r) => setTimeout(r, 300));
    showToast(`Đã đẩy ${listIdChecked.length} đơn hàng (demo)`, "success");
    setListIdChecked([]);
    getListOrder(params);
  };

  const handleBulkPrint = async () => {
    if (!listIdChecked.length) { showToast("Vui lòng chọn ít nhất một đơn hàng", "warning"); return; }
    await new Promise((r) => setTimeout(r, 200));
    showToast(`Đã gửi lệnh in ${listIdChecked.length} mã vận đơn (demo)`, "success");
  };

  const bulkActionList: BulkActionItemModel[] = [
    { title: "Đẩy đơn hàng loạt",      callback: handleBulkPush },
    { title: "In mã vận đơn hàng loạt", callback: handleBulkPrint },
  ];

  // ---- Title actions ----
  const titleActions: ITitleActions = {
    actions: [
      { title: "Tạo đơn vận chuyển", callback: () => navigate("/add_shipping") },
    ],
    actions_extra: [
      { title: "Thiết lập đối tác", icon: <Icon name="Setting" />,         callback: () => navigate("/shipping_parther") },
      { title: "Cấu hình phí VC",   icon: <Icon name="SettingCashbook" />, callback: () => navigate("/shipping_fee_config") },
    ],
  };

  const titles = [
    "STT",
    "Mã vận đơn",
    "Hãng VC",
    "Khách hàng",
    "SĐT",
    "Ngày tạo",
    "COD",
    "Trạng thái",
    "Hành động",
  ];

  const dataFormat = [
    "text-center", 
    "",            
    "text-center", 
    "",           
    "text-center", 
    "text-center", 
    "text-right",  
    "text-center", 
    "text-center", 
  ];

  const dataSize = [
    "auto", 
    "auto", 
    "auto", 
    "auto",
    "auto", 
    18,     
    16,     
    "auto", 
    "auto", 
  ];

  const dataMappingArray = (item: IShippingOrderResponse, index: number) => [
    
    getPageOffset(params) + index + 1,

    <span
      key={`code-${item.id}`}
      className="tracking-code-link"
      onClick={() => { setSelectedOrder(item); setShowModalDetail(true); }}
    >
      {item.trackingCode}
    </span>,
    item.partnerName,
    item.receiverName,
    item.receiverPhone,
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY") : "",
    item.codAmount ? `${formatCurrency(+(item.codAmount))}đ` : "0",

    <Badge
      key={`badge-${item.id}`}
      text={
        item.status === "pending"    ? "Chờ lấy hàng" :
        item.status === "in_transit" ? "Đang giao"    :
        item.status === "delivered"  ? "Đã giao"      :
        item.status === "returned"   ? "Hoàn hàng"    : "Đã hủy"
      }
      variant={
        item.status === "pending"    ? "secondary" :
        item.status === "in_transit" ? "primary"   :
        item.status === "delivered"  ? "success"   :
        item.status === "returned"   ? "warning"   : "error"
      }
    />,

    <div key={`action-${item.id}`} className="lst__action--cell">
      <Tippy content="Xem chi tiết / lộ trình">
        <span className="item__action" onClick={() => { setSelectedOrder(item); setShowModalDetail(true); }}>
          <Icon name="Eye" />
        </span>
      </Tippy>

      {item.status === "pending" && (
        <Tippy content="Đẩy sang hãng vận chuyển">
          <span className="item__action" onClick={() => handlePushSingle(item.id)}>
            <Icon name="Send" />
          </span>
        </Tippy>
      )}

      <Tippy content="In mã vận đơn">
        <span className="item__action" onClick={() => handlePrintSingle(item.id)}>
          <Icon name="Print" />
        </span>
      </Tippy>

      <Tippy content="Chỉnh sửa">
        <span className="item__action" onClick={() => navigate(`/add_shipping/${item.id}`)}>
          <Icon name="Pencil" />
        </span>
      </Tippy>

      {item.status === "pending" && (
        <Tippy content="Hủy đơn">
          <span className="item__action icon__delete" onClick={() => showDialogConfirmCancel(item)}>
            <Icon name="Trash" />
          </span>
        </Tippy>
      )}
    </div>,
  ];

  // ============================================================

  return (
    <Fragment>
      <div className="page-content page-shipping">
        <TitleAction title="Quản lý vận chuyển" titleActions={titleActions} />

        <div className="card-box d-flex flex-column">

          {/* Tab trạng thái */}
          <div className="shipping-tabs">
            {STATUS_TABS.map((tab) => (
              <div
                key={tab.status}
                className={`shipping-tab-item ${activeTab === tab.status ? "active" : ""}`}
                onClick={() => handleTabChange(tab.status)}
              >
                {tab.label}
                {tabCounts[tab.status] > 0 && (
                  <span className="tab-count-badge">{tabCounts[tab.status]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Tìm kiếm */}
          <div className="search__box--shipping">
            <SearchBox
              name="Đơn vận chuyển"
              placeholderSearch="Theo mã vận đơn, tên khách hàng, số điện thoại..."
              params={params}
              isFilter={false}
              isSaveSearch={false}
              listSaveSearch={[]}
              listFilterItem={[]}
              updateParams={(paramsNew) => setParams((prev) => ({ ...prev, ...paramsNew, page: 1 }))}
            />
          </div>

          {/* Bảng */}
          {!isLoading && listOrder.length > 0 ? (
            <BoxTable
              name="Đơn vận chuyển"
              titles={titles}
              dataFormat={dataFormat}
              dataSize={dataSize}
              items={listOrder}
              dataMappingArray={dataMappingArray}
              isPagination={true}
              dataPagination={pagination}
              isBulkAction={true}
              bulkActionItems={bulkActionList}
              listIdChecked={listIdChecked}
              setListIdChecked={(listId) => setListIdChecked(listId)}
            />
          ) : isLoading ? (
            <Loading />
          ) : (
            <Fragment>
              {isNoItem ? (
                <SystemNotification
                  description={<span>Chưa có đơn vận chuyển nào.<br />Hãy tạo đơn vận chuyển đầu tiên nhé!</span>}
                  type="no-item"
                  titleButton="Tạo đơn vận chuyển"
                  action={() => navigate(ROUTES.shippingCreate)}
                />
              ) : (
                <SystemNotification
                  description={<span>Không có đơn hàng phù hợp.<br />Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!</span>}
                  type="no-result"
                />
              )}
            </Fragment>
          )}
        </div>

        <ShippingOrderDetailModal
          onShow={showModalDetail}
          data={selectedOrder}
          onHide={() => { setShowModalDetail(false); setSelectedOrder(null); }}
          onReload={() => getListOrder(params)}
        />

        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </Fragment>
  );
}
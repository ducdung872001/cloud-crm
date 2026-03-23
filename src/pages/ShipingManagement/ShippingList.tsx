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

import ShippingService, { STATUS_CODE_TO_UI } from "services/ShippingService";

import { IShippingOrderFilterRequest } from "model/shipping/ShippingRequestModel";
import { IShippingOrderResponse } from "model/shipping/ShippingResponseModel";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";

import ShippingOrderDetailModal from "./partials/ShippingOrderDetailModal";

import "./ShippingList.scss";

// ─── Hằng số ──────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "Tất cả",       status: "all" },
  { label: "Chờ lấy hàng", status: "pending" },
  { label: "Đang giao",    status: "in_transit" },
  { label: "Đã giao",      status: "delivered" },
  { label: "Hoàn hàng",    status: "returned" },
];

const ROUTES = {
  shippingCreate:       "/add_shipping",
  shippingEdit:         (id: number) => `/add_shipping/id=${id}`,
  shippingPartnerSetup: "/shipping/partner-setup",
  shippingFeeConfig:    "/shipping/fee-config",
};

/**
 * Lấy UI-status từ statusCode API.
 * API trả về UPPERCASE (SUBMITTED, IN_TRANSIT, …), UI dùng lowercase (pending, in_transit, …).
 */
const normalizeStatus = (statusCode: string): string =>
  STATUS_CODE_TO_UI[statusCode?.toUpperCase()] ?? statusCode?.toLowerCase() ?? "";

// ─── Component ────────────────────────────────────────────────────────────────

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

  const isMounted    = useRef(false);
  const abortRef     = useRef<AbortController | null>(null);

  const [params, setParams] = useState<IShippingOrderFilterRequest>({
    keyword: "", status: "all", page: 1, limit: 10,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Đơn vận chuyển",
    isChooseSizeLimit: true,
    setPage:         (page)  => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit, page: 1 })),
  });

  // ── Fetch danh sách ──────────────────────────────────────────────────────────
  const getListOrder = async (paramsSearch: IShippingOrderFilterRequest) => {
    // Huỷ request cũ nếu đang chạy
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const response = await ShippingService.filter(paramsSearch, abortRef.current.signal);

      if (response.code === 0) {
        const result = response.result;

        // API trả về items với các field thực tế (carrierTrackingCode, statusCode, …)
        setListOrder(result.items as IShippingOrderResponse[]);

        // Tính tabCounts từ dữ liệu API
        // Nếu API có trả về tabCounts → dùng luôn, không thì giữ nguyên
        if (result.tabCounts) {
          setTabCounts({
            ...result.tabCounts,
            all: (result.tabCounts.pending    ?? 0)
               + (result.tabCounts.in_transit ?? 0)
               + (result.tabCounts.delivered  ?? 0)
               + (result.tabCounts.returned   ?? 0),
          });
        } else {
          // Tự đếm từ items nếu API chưa có tabCounts
          setTabCounts((prev) => ({ ...prev, all: result.total ?? 0 }));
        }

        setPagination((prev) => ({
          ...prev,
          page:      result.page,
          sizeLimit: paramsSearch.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: result.total,
          totalPage: result.totalPage,
        }));

        setIsNoItem(result.total === 0 && !paramsSearch.keyword);
      } else {
        showToast(response.message ?? "Lỗi tải danh sách vận chuyển", "error");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        showToast("Không thể tải danh sách vận chuyển", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { getListOrder(params); }, []); // eslint-disable-line

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    getListOrder(params);

    const paramsTemp = _.cloneDeep(params) as any;
    if (paramsTemp.limit === 10) delete paramsTemp["limit"];
    Object.keys(paramsTemp).forEach((k) => {
      if (!paramsTemp[k] && paramsTemp[k] !== 0) delete paramsTemp[k];
    });
    if (isDifferenceObj(searchParams, paramsTemp)) {
      if (paramsTemp.page === 1) delete paramsTemp["page"];
      setSearchParams(paramsTemp as Record<string, string>);
    }
  }, [params]); // eslint-disable-line

  // ── Tab ──────────────────────────────────────────────────────────────────────
  const handleTabChange = (status: string) => {
    setActiveTab(status);
    setListIdChecked([]);
    setParams((prev) => ({ ...prev, status, page: 1 }));
  };

  // ── Đẩy đơn đơn lẻ ───────────────────────────────────────────────────────────
  const handlePushSingle = useCallback(async (id: number) => {
    try {
      const res = await ShippingService.push(id);
      if (res.code === 0) {
        showToast(`Đã đẩy đơn #${id} sang hãng vận chuyển`, "success");
      } else {
        showToast(res.message ?? "Đẩy đơn thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi đẩy đơn", "error");
    } finally {
      getListOrder(params);
    }
  }, [params]); // eslint-disable-line

  // ── In đơn đơn lẻ ────────────────────────────────────────────────────────────
  const handlePrintSingle = useCallback(async (id: number) => {
    try {
      const res = await ShippingService.printLabel(id);
      if (res.code === 0) {
        showToast(`Đã gửi lệnh in mã vận đơn #${id}`, "success");
        // Nếu API trả về URL file PDF: window.open(res.result?.url, "_blank");
      } else {
        showToast(res.message ?? "In vận đơn thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi in vận đơn", "error");
    }
  }, []);

  // ── Hủy đơn ──────────────────────────────────────────────────────────────────
  const handleCancelOrder = useCallback(async (id: number) => {
    try {
      const res = await ShippingService.cancel(id);
      if (res.code === 0) {
        showToast("Đã hủy đơn hàng thành công", "success");
      } else {
        showToast(res.message ?? "Hủy đơn thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi hủy đơn", "error");
    } finally {
      getListOrder(params);
      setShowDialog(false);
      setContentDialog(null);
    }
  }, [params]); // eslint-disable-line

  const showDialogConfirmCancel = (item: IShippingOrderResponse) => {
    setContentDialog({
      color: "error", className: "dialog-delete", isCentered: true, isLoading: true,
      title: <Fragment>Hủy đơn vận chuyển</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc muốn hủy đơn{" "}
          <strong>{item.carrierTrackingCode || item.shipmentOrder}</strong>?
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText:     "Không",
      cancelAction:   () => { setShowDialog(false); setContentDialog(null); },
      defaultText:    "Hủy đơn",
      defaultAction:  () => handleCancelOrder(item.id),
    });
    setShowDialog(true);
  };

  // ── Bulk actions ──────────────────────────────────────────────────────────────
  const handleBulkPush = async () => {
    if (!listIdChecked.length) {
      showToast("Vui lòng chọn ít nhất một đơn hàng", "warning");
      return;
    }
    try {
      const res = await ShippingService.pushBulk(listIdChecked);
      if (res.code === 0) {
        showToast(`Đã đẩy ${listIdChecked.length} đơn hàng`, "success");
      } else {
        showToast(res.message ?? "Đẩy hàng loạt thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi đẩy hàng loạt", "error");
    } finally {
      setListIdChecked([]);
      getListOrder(params);
    }
  };

  const handleBulkPrint = async () => {
    if (!listIdChecked.length) {
      showToast("Vui lòng chọn ít nhất một đơn hàng", "warning");
      return;
    }
    try {
      const res = await ShippingService.printLabelBulk(listIdChecked);
      if (res.code === 0) {
        showToast(`Đã gửi lệnh in ${listIdChecked.length} mã vận đơn`, "success");
      } else {
        showToast(res.message ?? "In hàng loạt thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi in hàng loạt", "error");
    }
  };

  const bulkActionList: BulkActionItemModel[] = [
    { title: "Đẩy đơn hàng loạt",      callback: handleBulkPush },
    { title: "In mã vận đơn hàng loạt", callback: handleBulkPrint },
  ];

  // ── Title actions ────────────────────────────────────────────────────────────
  const titleActions: ITitleActions = {
    actions: [
      { title: "Tạo đơn vận chuyển", callback: () => navigate(ROUTES.shippingCreate) },
    ],
    actions_extra: [
      { title: "Thiết lập đối tác", icon: <Icon name="Setting" />,         callback: () => navigate(ROUTES.shippingPartnerSetup) },
      { title: "Cấu hình phí VC",   icon: <Icon name="SettingCashbook" />, callback: () => navigate(ROUTES.shippingFeeConfig) },
    ],
  };

  // ── Table config ─────────────────────────────────────────────────────────────
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
    "text-left",
    "text-center",
    "",
    "text-center",
    "text-center",
    "text-center",
    "text-center",
    "text-center",
  ];

  const dataSize = Array(9).fill("auto");

  /**
   * Map một item từ API response sang mảng cell cho BoxTable.
   *
   * Các field thực tế từ API:
   *   - item.carrierTrackingCode  → Mã vận đơn hãng
   *   - item.shipmentOrder        → Mã đơn nội bộ (fallback)
   *   - item.carrierName          → Tên hãng vận chuyển
   *   - item.receiverName         → Tên người nhận
   *   - item.receiverPhone        → SĐT người nhận
   *   - item.createdAt            → Ngày tạo (ISO string)
   *   - item.codAmount / totalAmount → COD
   *   - item.statusCode           → SUBMITTED | PENDING | IN_TRANSIT | DELIVERED | RETURNED | CANCELLED
   */
  const dataMappingArray = (item: IShippingOrderResponse, index: number) => {
    const uiStatus = normalizeStatus(item.statusCode);

    const badgeText: Record<string, string> = {
      pending:    "Chờ lấy hàng",
      in_transit: "Đang giao",
      delivered:  "Đã giao",
      returned:   "Hoàn hàng",
      cancelled:  "Đã hủy",
    };

    const badgeVariant: Record<string, string> = {
      pending:    "secondary",
      in_transit: "primary",
      delivered:  "success",
      returned:   "warning",
      cancelled:  "error",
    };

    // Mã vận đơn hiển thị: ưu tiên mã hãng, fallback mã nội bộ
    const displayTrackingCode = item.carrierTrackingCode || item.shipmentOrder;

    // COD: lấy codAmount nếu có, không thì 0
    const codValue = item.codAmount ?? 0;

    return [
      getPageOffset(params) + index + 1,

      <span
        key={`code-${item.id}`}
        className="tracking-code-link"
        onClick={() => { setSelectedOrder(item); setShowModalDetail(true); }}
      >
        {displayTrackingCode}
      </span>,

      // Tên hãng vận chuyển (API: carrierName)
      item.carrierName,

      // Tên người nhận
      item.receiverName,

      // SĐT người nhận
      item.receiverPhone,

      // Ngày tạo: API trả về ISO string (createdAt)
      item.createdAt ? moment(item.createdAt).format("DD/MM/YYYY") : "",

      // COD
      codValue > 0 ? `${formatCurrency(codValue)}đ` : "0",

      <Badge
        key={`badge-${item.id}`}
        text={badgeText[uiStatus] ?? item.statusCode}
        variant={badgeVariant[uiStatus] ?? "secondary"}
      />,

      <div key={`action-${item.id}`} className="lst__action--cell">
        <Tippy content="Xem chi tiết / lộ trình">
          <span
            className="item__action"
            onClick={() => { setSelectedOrder(item); setShowModalDetail(true); }}
          >
            <Icon name="Eye" />
          </span>
        </Tippy>

        {/* Chỉ hiển thị "Đẩy đơn" khi trạng thái là PENDING hoặc SUBMITTED */}
        {(uiStatus === "pending") && (
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
          <span
            className="item__action"
            onClick={() => navigate(ROUTES.shippingEdit(item.id))}
          >
            <Icon name="Pencil" />
          </span>
        </Tippy>

        {/* Chỉ cho hủy khi đơn đang ở trạng thái PENDING / SUBMITTED */}
        {(uiStatus === "pending") && (
          <Tippy content="Hủy đơn">
            <span
              className="item__action icon__delete"
              onClick={() => showDialogConfirmCancel(item)}
            >
              <Icon name="Trash" />
            </span>
          </Tippy>
        )}
      </div>,
    ];
  };

  // ─────────────────────────────────────────────────────────────────────────────

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
          <SearchBox
            name="Đơn vận chuyển"
            placeholderSearch="Theo mã vận đơn, tên khách hàng, số điện thoại..."
            params={params}
            isFilter={false}
            isSaveSearch={false}
            listSaveSearch={[]}
            listFilterItem={[]}
            updateParams={(paramsNew) =>
              setParams((prev) => ({ ...prev, ...paramsNew, page: 1 }))
            }
          />

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
                  description={
                    <span>
                      Chưa có đơn vận chuyển nào.
                      <br />
                      Hãy tạo đơn vận chuyển đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Tạo đơn vận chuyển"
                  action={() => navigate(ROUTES.shippingCreate)}
                />
              ) : (
                <SystemNotification
                  description={
                    <span>
                      Không có đơn hàng phù hợp.
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

        {/* Modal chi tiết */}
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
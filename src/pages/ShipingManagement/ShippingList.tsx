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

import ShippingService from "services/ShippingService";

import { IShippingOrderFilterRequest } from "model/shipping/ShippingRequestModel";
import { IShippingOrderResponse } from "model/shipping/ShippingResponseModel";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";

import ShippingOrderDetailModal from "./partials/ShippingOrderDetailModal";

import "./ShippingList.scss";

// ─── Hằng số ──────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "Tất cả",       status: "ALL" },
  { label: "Chờ duyệt",    status: "PENDING" },
  { label: "Chờ lấy hàng", status: "SUBMITTED" },
  { label: "Đang giao",    status: "IN_TRANSIT" },
  { label: "Đã giao",      status: "DELIVERED" },
  { label: "Hoàn hàng",    status: "RETURNED" },
  { label: "Đã hủy",       status: "CANCELLED" },
];

const ROUTES = {
  shippingCreate:       "/add_shipping",
  shippingEdit:         (id: number) => `/add_shipping/id=${id}`,
  shippingPartnerSetup: "/shipping/partner-setup",
  shippingFeeConfig:    "/shipping/fee-config",
};

// Map statusCode API → key nội bộ (dùng cho badge và điều kiện action)
const STATUS_MAP: Record<string, string> = {
  PENDING:    "pending",
  SUBMITTED:  "submitted",
  IN_TRANSIT: "in_transit",
  DELIVERED:  "delivered",
  RETURNED:   "returned",
  CANCELLED:  "cancelled",
};

const normalizeStatus = (status: string): string => {
  if (!status) return "";
  return STATUS_MAP[status.toUpperCase()] ?? status.toLowerCase().replace(/-/g, "_");
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShippingOrderList() {
  document.title = "Quản lý vận chuyển";

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [permissions]  = useState(getPermissions());
  const [activeTab, setActiveTab]   = useState<string>("ALL");
  const [tabCounts, setTabCounts]   = useState<Record<string, number>>({
    ALL: 0, PENDING: 0, SUBMITTED: 0, IN_TRANSIT: 0, DELIVERED: 0, RETURNED: 0, CANCELLED: 0,
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
    shipmentOrder: "", status: "", page: 1, limit: 10,
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

        // API trả về items với các field thực tế (carrierTrackingCode, status, …)
        setListOrder(result.items as IShippingOrderResponse[]);

        // Tính tabCounts từ dữ liệu API
        // Nếu API có trả về tabCounts → dùng luôn, không thì giữ nguyên
        if (result.tabCounts) {
          setTabCounts({
            ...result.tabCounts,
            ALL: (result.tabCounts.PENDING    ?? 0)
               + (result.tabCounts.SUBMITTED  ?? 0)
               + (result.tabCounts.IN_TRANSIT ?? 0)
               + (result.tabCounts.DELIVERED  ?? 0)
               + (result.tabCounts.RETURNED   ?? 0)
               + (result.tabCounts.CANCELLED  ?? 0),
          });
        } else {
          // Tự đếm từ items nếu API chưa có tabCounts
          setTabCounts((prev) => ({ ...prev, ALL: result.total ?? 0 }));
        }

        setPagination((prev) => ({
          ...prev,
          page:      result.page,
          sizeLimit: paramsSearch.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: result.total,
          // API không trả về totalPage, tính từ total và limit
          totalPage: Math.ceil((result.total ?? 0) / (paramsSearch.limit ?? 10)),
        }));

        setIsNoItem(result.total === 0 && !paramsSearch.shipmentOrder);
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

  console.log("Params search:", params);
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
    // "ALL" → gửi status="" lên API (không filter theo status)
    setParams((prev) => ({ ...prev, status: status === "ALL" ? "" : status, page: 1 }));
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
  const handleCancelOrder = useCallback(async (item: IShippingOrderResponse) => {
    try {
      const res = await ShippingService.cancel(item.shipmentOrder);
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
      defaultAction:  () => handleCancelOrder(item),
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
   * Các field thực tế từ API (theo response /logistics/shipment/list):
   *   - item.id                   → ID nội bộ
   *   - item.shipmentOrder        → Mã đơn nội bộ (VD: SHIP249101-002)
   *   - item.orderId / orderCode  → Mã đơn gốc
   *   - item.carrierCode          → Mã hãng vận chuyển (VD: GHN)
   *   - item.carrierName          → Tên hãng vận chuyển
   *   - item.carrierTrackingCode  → Mã vận đơn hãng
   *   - item.carrierServiceCode   → Loại dịch vụ hãng
   *   - item.senderName           → Tên người gửi
   *   - item.senderPhone          → SĐT người gửi
   *   - item.senderAddress        → Địa chỉ người gửi
   *   - item.receiverName         → Tên người nhận
   *   - item.receiverPhone        → SĐT người nhận
   *   - item.receiverAddress      → Địa chỉ người nhận
   *   - item.weightGram           → Khối lượng (gram)
   *   - item.lengthCm/widthCm/heightCm → Kích thước
   *   - item.noteForShipper       → Ghi chú cho shipper
   *   - item.carrierFee           → Phí hãng VC
   *   - item.shippingFee          → Phí vận chuyển (sau giảm giá)
   *   - item.totalAmount          → Tổng tiền đơn hàng (dùng làm COD)
   *   - item.statusCode       → SUBMITTED | PENDING | IN_TRANSIT | DELIVERED | RETURNED | CANCELLED
   *   - item.createdAt            → Ngày tạo (ISO string)
   *   - item.expectedPickupDate   → Ngày dự kiến lấy hàng
   *   - item.expectedDeliveryDate → Ngày dự kiến giao
   */
  const dataMappingArray = (item: IShippingOrderResponse, index: number) => {
    // Lấy statusCode gốc (chữ hoa) từ API, fallback về chuỗi rỗng
    const rawStatus = (item.statusCode ?? "").toUpperCase();
    const uiStatus  = normalizeStatus(rawStatus);

    // Map TRỰC TIẾP từ statusCode chữ hoa → label (không qua normalizeStatus)
    const badgeText: Record<string, string> = {
      PENDING:    "Chờ duyệt",
      SUBMITTED:  "Chờ lấy hàng",
      IN_TRANSIT: "Đang giao",
      DELIVERED:  "Đã giao",
      RETURNED:   "Hoàn hàng",
      CANCELLED:  "Đã hủy",
    };

    const badgeVariant: Record<string, string> = {
      PENDING:    "warning",
      SUBMITTED:  "secondary",
      IN_TRANSIT: "primary",
      DELIVERED:  "success",
      RETURNED:   "warning",
      CANCELLED:  "error",
    };

    // Mã vận đơn hiển thị: ưu tiên mã hãng, fallback mã nội bộ
    const displayTrackingCode = item.carrierTrackingCode || item.shipmentOrder;

    // COD: API không trả về codAmount, dùng totalAmount làm giá trị COD
    const codValue = (item as any).codAmount ?? item.totalAmount ?? 0;

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

      // COD: totalAmount từ API
      codValue > 0 ? `${formatCurrency(codValue)}đ` : "0đ",

      <Badge
        key={`badge-${item.id}`}
        text={badgeText[rawStatus] ?? item.statusCode}
        variant={(badgeVariant[rawStatus] ?? "secondary") as "warning" | "secondary" | "primary" | "success" | "error" | "transparent" | "done" | "wait-collect"}
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
        {(uiStatus === "pending" || uiStatus === "submitted") && (
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
        {(uiStatus === "pending" || uiStatus === "submitted") && (
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
              setParams((prev) => ({ ...prev, ...paramsNew, shipmentOrder: (paramsNew as any).keyword ?? (paramsNew as any).shipmentOrder ?? prev.shipmentOrder, page: 1 }))
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
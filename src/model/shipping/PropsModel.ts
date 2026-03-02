// =============================================
// SHIPPING PROPS MODELS
// Module: Quản lý vận chuyển (Mục 20 - BRD)
// =============================================

import {
  IShippingOrderResponse,
  IShippingPartnerResponse,
  IShippingFeeConfigResponse,
  IShippingTrackingHistoryResponse,
} from "./ShippingResponseModel";

// ---- Trang danh sách đơn vận chuyển ----
export interface IShippingOrderListProps {
  tab?: string; // pending | in_transit | delivered | returned
}

// ---- Modal tạo / chỉnh sửa đơn vận chuyển ----
export interface IAddShippingOrderModalProps {
  onShow: boolean;
  data?: IShippingOrderResponse;       // null = thêm mới, có data = chỉnh sửa
  salesOrderId?: number;               // pre-fill từ đơn hàng bán
  onHide: (reload?: boolean) => void;
}

// ---- Panel chi tiết đơn vận chuyển ----
export interface IShippingOrderDetailProps {
  data: IShippingOrderResponse;
  onReload: () => void;
  onClose: () => void;
}

// ---- Component theo dõi lộ trình (Tracking Timeline) ----
export interface IShippingTrackingTimelineProps {
  trackingHistory: IShippingTrackingHistoryResponse[];
  currentStatus: string;
  shipperName?: string;
  shipperPhone?: string;
}

// ---- Floating Action Bar (Bulk Action) ----
export interface IShippingBulkActionBarProps {
  selectedCount: number;
  selectedIds: number[];
  onPrint: (ids: number[]) => void;
  onPush: (ids: number[]) => void;
  onCancel: (ids: number[]) => void;
}

// ---- Modal kết nối đối tác vận chuyển ----
export interface IShippingPartnerConnectModalProps {
  onShow: boolean;
  partner: IShippingPartnerResponse;
  onHide: (reload?: boolean) => void;
}

// ---- Card đối tác vận chuyển ----
export interface IShippingPartnerCardProps {
  data: IShippingPartnerResponse;
  onConnect: (partner: IShippingPartnerResponse) => void;
  onDisconnect: (partnerId: number) => void;
}

// ---- Modal cấu hình phí vận chuyển ----
export interface IShippingFeeConfigModalProps {
  onShow: boolean;
  data?: IShippingFeeConfigResponse;
  onHide: (reload?: boolean) => void;
}

// ---- Bảng điều khiển (Dashboard) ----
export interface IShippingDashboardProps {
  activeTab: string;  // pending | in_transit | delivered | returned
  onTabChange: (tab: string) => void;
}

// ---- Tab badge (số lượng theo trạng thái) ----
export interface IShippingStatusTabProps {
  label: string;
  count: number;
  status: string;
  isActive: boolean;
  onClick: (status: string) => void;
}

// ---- Row trong bảng danh sách ----
export interface IShippingOrderRowProps {
  data: IShippingOrderResponse;
  index: number;
  isChecked: boolean;
  onCheck: (id: number, checked: boolean) => void;
  onViewDetail: (id: number) => void;
  onPrint: (id: number) => void;
  onPush: (id: number) => void;
}

// ---- Báo cáo vận chuyển ----
export interface IShippingReportProps {
  partnerId?: number;
  branchId?: number;
  fromDate?: string;
  toDate?: string;
}

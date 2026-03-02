import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction } from "model/OtherModel";
import { getPermissions } from "utils/common";
import { showToast } from "utils/common";
import Badge from "components/badge/badge";

import "./style.scss";
import InvoiceVATMockService, {
  IInvoiceVATFilterRequest,
  IInvoiceVATResponse,
  IInvoiceVATStats,
  MOCK_INVOICE_STATS,
} from "./partials/InvoiceVATMock";
import InvoiceVATList        from "./partials/InvoiceVATList/index";
import IssueInvoice          from "./partials/IssueInvoice/index";
import ElectronicInvoiceProvider from "./partials/ ElectronicInvoiceProvider/index";
import Configuration         from "./partials/Configuration/index";
import InvoicePreviewModal from "./partials/IssueInvoice/InvoicePreviewModal/index";
import InvoiceDetailModal, { InvoiceDetailData }   from "./partials/InvoiceDetailModal/index";

const InvoiceVATService = InvoiceVATMockService;

// ---- Helpers ----
const formatCurrency = (value: number) => value.toLocaleString("vi-VN") + "đ";

type BadgeVariant = "success" | "warning" | "error" | "transparent" | "primary" | "secondary" | "done" | "wait-collect";

const statusBadgeMap: Record<string, { text: string; variant: BadgeVariant }> = {
  issued:       { text: "Đã phát hành", variant: "success" },
  pending_sign: { text: "Chờ ký số",    variant: "warning" },
  error:        { text: "Bị lỗi / hủy", variant: "error"   },
};

// ---- Stats Card ----
interface StatCardProps {
  label: string; value: string | number; sub?: React.ReactNode; accentColor?: string;
}
function StatCard({ label, value, sub, accentColor = "#f59e0b" }: StatCardProps) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${accentColor}` }}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value" style={{ color: accentColor }}>{value}</p>
      {sub && <p className="stat-card__sub">{sub}</p>}
    </div>
  );
}

// ---- Per-tab header config ----
type TabName = "tab_one" | "tab_two" | "tab_three" | "tab_four" | "tab_five";
interface TabHeaderConfig { title: string; subtitle?: string; actions: React.ReactNode; }

export default function InvoiceVATOverview(props: any) {
  document.title = "Hóa đơn VAT điện tử";

  const isMounted = useRef(false);

  const [listInvoice, setListInvoice]   = useState<IInvoiceVATResponse[]>([]);
  const [dataInvoice, setDataInvoice]   = useState<IInvoiceVATResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog]     = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading]       = useState<boolean>(true);
  const [isNoItem, setIsNoItem]         = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions]   = useState(getPermissions());

  // ── InvoicePreviewModal (tab 3 header buttons) ──
  const [showPreview, setShowPreview] = useState(false);
  const handleOpenPreview = () => setShowPreview(true);

  // ── InvoiceDetailModal (nút "Xem" trên từng hóa đơn) ──
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<InvoiceDetailData | null>(null);

  const handleOpenDetail = (item: IInvoiceVATResponse) => {
    setDetailData({
      invoiceNo:    item.invoiceNo,
      symbol:       "C26TNA",
      invoiceDate:  item.invoiceDate,
      providerName: "VNPT Invoice",
      templateCode: "01GTKT0/001",
      status:       item.status as "issued" | "pending_sign" | "error",
      buyerName:    item.customerName,
      buyerTaxCode: item.taxCode ?? undefined,
      buyerAddress: "15 Nguyễn Huệ, Q.1, TP.HCM",
      paymentMethod: "Chuyển khoản",
      emailReceive: "ketoan@khachhang.vn",
      items: [
        { id: 1, name: "Áo thun oversize unisex", unit: "Cái", qty: 5, unitPrice: 2_000_000, taxRate: 10, total: 10_000_000 },
        { id: 2, name: "Quần jogger thể thao",    unit: "Cái", qty: 2, unitPrice: 1_500_000, taxRate: 10, total:  3_000_000 },
      ],
      cqtCode: "AB28022026001280001",
    });
    setShowDetail(true);
  };

  const handleCloseDetail = () => { setShowDetail(false); setDetailData(null); };

  const [tab, setTab]     = useState<{ name: TabName }>({ name: "tab_one" });
  const [params, setParams] = useState<IInvoiceVATFilterRequest>({ name: "" });

  const listTabs = [
    { title: "Tổng quan",         is_active: "tab_one"   as TabName },
    { title: "Danh sách HĐVAT",   is_active: "tab_two"   as TabName },
    { title: "Xuất hóa đơn",      is_active: "tab_three" as TabName },
    { title: "Nhà cung cấp HĐĐT", is_active: "tab_four"  as TabName },
    { title: "Cấu hình",          is_active: "tab_five"  as TabName },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "hóa đơn VAT",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((p) => ({ ...p, page })),
    chooseSizeLimit: (limit) => setParams((p) => ({ ...p, limit })),
  });

  const abortController = new AbortController();

  const getListInvoice = async (paramsSearch: IInvoiceVATFilterRequest) => {
    setIsLoading(true);
    const response = await InvoiceVATService.list(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setListInvoice(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && +result.page === 1) setIsNoItem(true);
    } else if (response.code === 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => { setParams({ ...params }); }, [tab]);
  useEffect(() => { const p = _.cloneDeep(params); setParams((prev) => ({ ...prev, ...p })); }, []);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    getListInvoice(params);
    const p = _.cloneDeep(params);
    if (p.limit === 10) delete p["limit"];
    Object.keys(p).forEach((k) => { if (p[k] === "") delete p[k]; });
    return () => { abortController.abort(); };
  }, [params]);

  const name = "hóa đơn";

  const actionsTable = (item: IInvoiceVATResponse): IAction[] => [
    permissions["INVOICE_UPDATE"] == 1 && {
      title: "Sửa",
      icon: <Icon name="Pencil" />,
      callback: () => { setDataInvoice(item); },
    },
    permissions["INVOICE_DELETE"] == 1 && {
      title: "Xóa",
      icon: <Icon name="Trash" className="icon-error" />,
      callback: () => { showDialogConfirmDelete(item); },
    },
  ];

  const onDelete = async (id: number) => {
    const response = await InvoiceVATService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa ${name} thành công`, "success");
      getListInvoice(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false); setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IInvoiceVATResponse) => {
    const dialog: IContentDialog = {
      color: "error", className: "dialog-delete", isCentered: true, isLoading: true,
      title: <Fragment>Xóa hóa đơn</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? name : `${listIdChecked.length} ${name} đã chọn`}
          {item ? <strong> {item.invoiceNo}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",  cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa", defaultAction: () => onDelete(item.id),
    };
    setContentDialog(dialog); setShowDialog(true);
  };

  const stats = MOCK_INVOICE_STATS;

  // ---- Per-tab header configs ----
  const tabHeaderConfig: Record<TabName, TabHeaderConfig> = {
    tab_one: {
      title: "Hóa đơn VAT điện tử",
      subtitle: "Xuất và quản lý hóa đơn GTGT theo nghị định 123/2020/NĐ-CP · Tháng 2/2026",
      actions: (
        <>
          <button className="btn-export-report"><Icon name="Download" /> Xuất báo cáo</button>
          <button className="btn-new-invoice" onClick={() => setTab({ name: "tab_three" })}>+ Xuất hóa đơn mới</button>
        </>
      ),
    },
    tab_two: {
      title: "Danh sách hóa đơn VAT",
      subtitle: "128 hóa đơn trong tháng 2/2026",
      actions: (
        <>
          <button className="btn-export-report"><Icon name="Download" /> Xuất Excel</button>
          <button className="btn-new-invoice" onClick={() => setTab({ name: "tab_three" })}>+ Xuất hóa đơn mới</button>
        </>
      ),
    },
    tab_three: {
      title: "Xuất hóa đơn VAT mới",
      subtitle: "Hóa đơn GTGT theo Nghị định 123/2020/NĐ-CP · Ký số điện tử",
      actions: (
        <>
          <button className="btn-export-report" onClick={handleOpenPreview}><Icon name="Eye" /> Xem trước</button>
          <button className="btn-new-invoice"   onClick={handleOpenPreview}><Icon name="FileText" /> Phát hành hóa đơn</button>
        </>
      ),
    },
    tab_four: {
      title: "Nhà cung cấp HĐDT",
      subtitle: "Liên kết hệ thống với nhà cung cấp hóa đơn điện tử được Bộ Tài Chính chứng nhận",
      actions: (
        <button className="btn-new-invoice" onClick={() => showToast("Lưu & Kết nối thành công!", "success")}>
          <Icon name="Check" /> Lưu &amp; Kết nối
        </button>
      ),
    },
    tab_five: {
      title: "Cấu hình hóa đơn VAT",
      subtitle: "Mẫu hóa đơn, thông tin doanh nghiệp & tự động hóa",
      actions: (
        <button className="btn-new-invoice" onClick={() => showToast("Lưu cấu hình thành công!", "success")}>
          <Icon name="Check" /> Lưu cấu hình
        </button>
      ),
    },
  };

  const currentHeader = tabHeaderConfig[tab.name];

  return (
    <div className={`page-content page-invoice-vat${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">

        {/* Tabs */}
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              {listTabs.map((item, idx) => (
                <li key={idx}
                    className={item.is_active === tab.name ? "active" : ""}
                    onClick={(e) => { e && e.preventDefault(); setTab({ name: item.is_active }); }}>
                  {item.title}
                  {item.is_active === "tab_two" && <span className="tab-badge">3</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Page title row */}
        <div className="page-title-row">
          <div className="page-title-text">
            <h1>{currentHeader.title}</h1>
            {currentHeader.subtitle && <p>{currentHeader.subtitle}</p>}
          </div>
          <div className="page-title-actions">{currentHeader.actions}</div>
        </div>

        {/* ── Tab: Tổng quan ── */}
        {tab.name === "tab_one" && (
          <div className="invoice-overview">
            <div className="stat-cards-row">
              <StatCard label="TỔNG HĐ THÁNG NÀY"        value={stats.totalInvoices}
                        sub={<span className="trend-up">↑ +14 so với tháng trước</span>}       accentColor="#1e3a5f" />
              <StatCard label="TỔNG TIỀN VAT"             value={stats.totalVATFormatted}
                        sub={<span className="trend-up">↑ Thuế GTGT: {stats.vatGTGTFormatted}</span>} accentColor="#f59e0b" />
              <StatCard label="CHỜ KÝ SỐ / PHÁT HÀNH"    value={stats.pendingSign}
                        sub={<span className="trend-neutral">⏱ Cần xử lý hôm nay</span>}       accentColor="#f59e0b" />
              <StatCard label="ĐÃ PHÁT HÀNH THÀNH CÔNG"  value={stats.issued}
                        sub={<span className="trend-up">✓ 96.9% tỷ lệ thành công</span>}       accentColor="#16a34a" />
            </div>

            <div className="overview-body">
              <div className="recent-invoices">
                <div className="section-header">
                  <div>
                    <h3>Hóa đơn vừa xuất</h3>
                    <p>Cập nhật tự động từ hệ thống HĐĐT</p>
                  </div>
                  <a href="#" className="view-all-link"
                     onClick={(e) => { e.preventDefault(); setTab({ name: "tab_two" }); }}>
                    Xem tất cả →
                  </a>
                </div>

                <table className="invoice-table">
                  <thead>
                  <tr><th>SỐ HĐ</th><th>KHÁCH HÀNG</th><th>GIÁ TRỊ</th><th>TRẠNG THÁI</th><th></th></tr>
                  </thead>
                  <tbody>
                  {listInvoice.map((item) => {
                    const si = statusBadgeMap[item.status] ?? { text: item.status, variant: "wait-collect" as BadgeVariant };
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="invoice-no">{item.invoiceNo}</div>
                          <div className="invoice-date">{item.invoiceDate}</div>
                        </td>
                        <td>
                          <div className="customer-name">{item.customerName}</div>
                          <div className="tax-code">{item.taxCode ? `MST: ${item.taxCode}` : "Cá nhân"}</div>
                        </td>
                        <td className="text-right">
                          <div className="total-amount">{formatCurrency(item.totalAmount)}</div>
                          <div className="vat-amount">VAT: {formatCurrency(item.vatAmount)}</div>
                        </td>
                        <td className="text-center">
                          <Badge text={si.text} variant={si.variant} />
                        </td>
                        <td className="text-center">
                          {item.status === "pending_sign" && (
                            <button className="btn btn-warning btn-sm">Ký số</button>
                          )}
                          {item.status === "error" && (
                            <button className="btn btn-outline btn-sm">Thay thế</button>
                          )}
                          {item.status === "issued" && (
                            // ── Nút "Xem" → mở InvoiceDetailModal ──
                            <button className="btn btn-outline btn-sm"
                                    onClick={() => handleOpenDetail(item)}>
                              Xem
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>

              <div className="overview-sidebar">
                <div className="sidebar-card">
                  <h4>Nhà cung cấp HĐĐT</h4>
                  <div className="provider-item">
                    <div className="provider-logo vnpt">VNPT</div>
                    <div className="provider-info">
                      <span className="provider-name">VNPT Invoice</span>
                      <span className="provider-sub">Đang kết nối · API v2.1</span>
                    </div>
                    <span className="provider-status active">● Hoạt động</span>
                  </div>
                  <div className="quota-section">
                    <div className="quota-header"><span>Hạn mức hóa đơn</span></div>
                    <div className="quota-bar-card">
                      <div className="quota-bar-header">
                        <span>Đã dùng tháng này</span>
                        <span className="quota-numbers">{stats.usedQuota} / {stats.maxQuota}</span>
                      </div>
                      <div className="quota-bar">
                        <div className="quota-bar-fill" style={{ width: `${(stats.usedQuota / stats.maxQuota) * 100}%` }} />
                      </div>
                      <p className="quota-expiry">Còn lại {stats.maxQuota - stats.usedQuota} hóa đơn · Hết hạn {stats.quotaExpiry}</p>
                    </div>
                  </div>
                </div>
                <div className="sidebar-card">
                  <h4>Trạng thái phát hành</h4>
                  <div className="status-list">
                    <div className="status-item">
                      <span className="status-icon success">✓</span>
                      <div className="status-info">
                        <span className="status-label">Phát hành thành công</span>
                        <span className="status-sub">Khách hàng đã nhận HĐVAT</span>
                      </div>
                      <span className="status-count success">{stats.issued}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-icon warning">⏱</span>
                      <div className="status-info">
                        <span className="status-label">Chờ ký số / xử lý</span>
                        <span className="status-sub">Đang chờ ký điện tử</span>
                      </div>
                      <span className="status-count warning">{stats.pendingSign}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-icon error">⊗</span>
                      <div className="status-info">
                        <span className="status-label">Lỗi / Đã hủy</span>
                        <span className="status-sub">Cần xuất hóa đơn thay thế</span>
                      </div>
                      <span className="status-count error">{stats.error}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab.name === "tab_two" && (
          <InvoiceVATList
            onGoToExport={() => setTab({ name: "tab_three" })}
            onDataChanged={() => getListInvoice(params)}
            onOpenDetail={handleOpenDetail}
          />
        )}

        {tab.name === "tab_three" && <IssueInvoice />}
        {tab.name === "tab_four"  && <ElectronicInvoiceProvider />}
        {tab.name === "tab_five"  && <Configuration />}
      </div>

      {/* ── InvoiceDetailModal (nút Xem) ── */}
      <InvoiceDetailModal
        isOpen={showDetail}
        data={detailData}
        onClose={handleCloseDetail}
      />

      {/* ── InvoicePreviewModal (nút Xem trước / Phát hành ở header tab 3) ── */}
      <InvoicePreviewModal
        isOpen={showPreview}
        data={{
          sellerName:       "POSME FASHION STORE",
          sellerTaxCode:    "0311987654",
          sellerAddress:    "123 Nguyễn Huệ, P.Bến Nghé, Q.1, TP.HCM",
          sellerPhone:      "028 1234 5678",
          sellerEmail:      "info@posme.vn",
          sellerBankAccount:"0011234567890",
          sellerBankName:   "Vietcombank HCM",
          templateCode:     "01GTKT0/001 – HĐ GTGT điện tử",
          symbol:           "C26TNA",
          invoiceNo:        "0000129",
          invoiceDate:      "28/02/2026",
          buyerName:        "Công ty TNHH Thương mại ABC",
          buyerTaxCode:     "0311234567",
          buyerAddress:     "15 Nguyễn Huệ, Phường Bến Nghé, Q.1, TP.HCM",
          paymentMethod:    "Chuyển khoản",
          emailReceive:     "ketoan@abc.vn",
          items: [
            { id: 1, name: "Áo thun oversize unisex", unit: "Cái", qty: 5, unitPrice: 2_000_000, taxRate: 10, total: 10_000_000 },
            { id: 2, name: "Quần jogger thể thao",    unit: "Cái", qty: 2, unitPrice: 1_500_000, taxRate: 10, total:  3_000_000 },
          ],
          note: "Hàng đã giao đủ theo hợp đồng số HD-2026-0128.",
        }}
        onClose={() => setShowPreview(false)}
        onPublish={() => {}}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
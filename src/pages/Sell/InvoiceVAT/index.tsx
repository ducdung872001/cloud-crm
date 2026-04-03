import React, { Fragment, useState, useEffect, useRef, useCallback } from "react";
import _ from "lodash";
import { useLocation } from "react-router-dom";
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
import { ExportExcel } from "exports/excel";

import "./style.scss";
import InvoiceVATMockService, {
  IInvoiceVATFilterRequest,
  IInvoiceVATResponse,
  IInvoiceVATStats,
  MOCK_INVOICE_STATS,
} from "./partials/InvoiceVATMock";
import IssueInvoice          from "./partials/IssueInvoice/index";
import ElectronicInvoiceProvider from "./partials/ElectronicInvoiceProvider/index";
import Configuration         from "./partials/Configuration/index";
import InvoicePreviewModal from "./partials/IssueInvoice/InvoicePreviewModal/index";
import InvoiceVATList, { SinvoiceLog, fetchSinvoiceLogs, monthToRange } from "./partials/InvoiceVATList/index";
import InvoiceDetailModal               from "./partials/InvoiceDetailModal/index";
import VatInvoiceService, { VatConfig } from "services/VatInvoiceService";
import EinvoiceProviderService, { ProviderItem } from "services/EinvoiceProviderService";

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

  const location = useLocation();
  const isMounted = useRef(false);

  // Đọc query params: ?tab=issue&code=HD003198
  // Khi navigate từ màn hình đơn hàng → chuyển thẳng vào tab Xuất hóa đơn + auto-fill mã
  const [initialInvoiceCode, setInitialInvoiceCode] = useState("");

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const tabParam  = sp.get("tab");
    const codeParam = sp.get("code");
    if (tabParam === "issue") {
      setTab({ name: "tab_three" });
      if (codeParam) setInitialInvoiceCode(codeParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const [listInvoice, setListInvoice]   = useState<IInvoiceVATResponse[]>([]);
  const [dataInvoice, setDataInvoice]   = useState<IInvoiceVATResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog]     = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading]       = useState<boolean>(true);
  const [isNoItem, setIsNoItem]         = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions]   = useState(getPermissions());

  // ── IssueInvoice callbacks (tab 3 header buttons wire into child) ──
  const [showPreview, setShowPreview] = useState(false);
  const handleOpenPreview = () => setShowPreview(true);

  const issuePreviewRef  = useRef<(() => void) | null>(null);
  const issuePublishRef  = useRef<(() => void) | null>(null);
  const listExportRef    = useRef<(() => void) | null>(null);
  const handleRegisterPreview = (fn: () => void) => { issuePreviewRef.current = fn; };
  const handleRegisterPublish = (fn: () => void) => { issuePublishRef.current = fn; };
  const handleRegisterExport  = (fn: () => void) => { listExportRef.current  = fn; };

  // ── Live stats từ InvoiceVATList (cập nhật khi tab 2 load counts) ──
  const [liveStats, setLiveStats] = useState<{
    total: number; pending: number; issued: number; failed: number; monthLabel: string;
  }>({ total: 0, pending: 0, issued: 0, failed: 0, monthLabel: "" });

  const handleCountsLoaded = (info: typeof liveStats) => setLiveStats(info);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<SinvoiceLog | null>(null);

  const handleOpenDetail = (item: SinvoiceLog) => {
    setDetailData(item);
    setShowDetail(true);
  };

  const handleCloseDetail = () => { setShowDetail(false); setDetailData(null); };

  // ── Load VAT config + active provider on mount ────────────────────────────
  const [vatConfig, setVatConfig] = useState<VatConfig | null>(null);
  const [activeProvider, setActiveProvider] = useState<ProviderItem | null>(null);

  useEffect(() => {
    VatInvoiceService.getConfig()
      .then((res: any) => {
        if (res?.code === 0 && res.result) {
          const c: VatConfig = res.result;
          setVatConfig(c);
          (window as any).__VAT_SUPPLIER_TAX_CODE__ = c.taxCode;
          (window as any).__VAT_TEMPLATE_CODE__ = c.defaultTemplateCode;
          (window as any).__VAT_CONFIG__ = c;
        }
      })
      .catch(() => {});

    EinvoiceProviderService.listProviders()
      .then((list) => {
        const active = list.find((p) => p.configActive === 1) || null;
        setActiveProvider(active);
      })
      .catch(() => {});
  }, []);

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

  // ─── Overview: real stats ─────────────────────────────────────────────────
  const SUPPLIER_TAX_CODE = (window as any).__VAT_SUPPLIER_TAX_CODE__ || "0100109106-501";
  const TEMPLATE_CODE     = (window as any).__VAT_TEMPLATE_CODE__     || "1/6553";

  const currentMonth = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  interface OverviewStats {
    total: number; issued: number; pending: number; failed: number;
    totalVAT: number; monthLabel: string;
    usedQuota: number; maxQuota: number; quotaExpiry: string;
  }
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    total: 0, issued: 0, pending: 0, failed: 0, totalVAT: 0,
    monthLabel: "", usedQuota: 0, maxQuota: 99999999, quotaExpiry: "—",
  });
  const [recentInvoices, setRecentInvoices] = useState<SinvoiceLog[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(false);

  const fmtVND = (v: number): string => {
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1).replace(".0","") + " Tỷ";
    if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1).replace(".0","") + "M";
    if (v >= 1_000)         return (v / 1_000).toFixed(0) + "K";
    return v.toLocaleString("vi-VN");
  };

  const loadOverview = useCallback(async () => {
    setLoadingOverview(true);
    const { fromDate, toDate } = monthToRange(currentMonth);
    const [y, m] = currentMonth.split("-").map(Number);
    const monthLabel = `Tháng ${m}/${y}`;
    try {
      const [resAll, resIssued, resPending, resRecent, resQuota] = await Promise.allSettled([
        fetchSinvoiceLogs({ fromDate, toDate, page: 1, size: 1 }),
        fetchSinvoiceLogs({ fromDate, toDate, status: "ISSUED",  page: 1, size: 1 }),
        fetchSinvoiceLogs({ fromDate, toDate, status: "PENDING", page: 1, size: 1 }),
        fetchSinvoiceLogs({ fromDate, toDate, page: 1, size: 6 }),
        fetch(`/bizapi/integration/sinvoice/query/usage-status?supplierTaxCode=${SUPPLIER_TAX_CODE}&templateCode=${encodeURIComponent(TEMPLATE_CODE)}&serial=`)
          .then(r => r.json()).catch(() => null),
      ]);
      const total   = resAll.status     === "fulfilled" ? resAll.value.total     : 0;
      const issued  = resIssued.status  === "fulfilled" ? resIssued.value.total  : 0;
      const pending = resPending.status === "fulfilled" ? resPending.value.total : 0;
      const failed  = Math.max(0, total - issued - pending);
      const recent  = resRecent.status  === "fulfilled" ? resRecent.value.items  : [];

      let totalVAT = 0;
      recent.forEach(item => { totalVAT += item.taxAmount ?? 0; });

      let usedQuota = total, maxQuota = 99999999, quotaExpiry = "—";
      if (resQuota.status === "fulfilled" && resQuota.value?.code === 0) {
        try {
          const q = typeof resQuota.value.result === "string"
            ? JSON.parse(resQuota.value.result)
            : resQuota.value.result;
          usedQuota = q?.numOfpublishInv ?? total;
          maxQuota  = q?.totalInv        ?? 99999999;
        } catch { /* ignore */ }
      }
      setOverviewStats({ total, issued, pending, failed, totalVAT, monthLabel, usedQuota, maxQuota, quotaExpiry });
      setRecentInvoices(recent);
    } catch (e) {
      console.error("Overview load error:", e);
    } finally {
      setLoadingOverview(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    if (tab.name === "tab_one") loadOverview();
  }, [tab.name]);

  const stats = MOCK_INVOICE_STATS; // giữ lại cho các vùng chưa chuyển hết

  // ─── Xuất báo cáo (Tab 1) ─────────────────────────────────────────────────
  const [exportingReport, setExportingReport] = useState(false);

  const fmtDateExport = (ts: number | null | undefined): string => {
    if (!ts) return "—";
    const d = new Date(ts);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const handleExportReport = useCallback(async () => {
    setExportingReport(true);
    try {
      const { fromDate, toDate } = monthToRange(currentMonth);
      const allData = await fetchSinvoiceLogs({
        fromDate, toDate, page: 1, size: 5000,
      });

      if (allData.items.length === 0) {
        showToast("Không có dữ liệu để xuất báo cáo.", "error");
        return;
      }

      const statusLabel = (s: string) => {
        const m: Record<string, string> = {
          ISSUED: "Đã phát hành", PENDING: "Chờ ký số",
          FAILED: "Lỗi / Hủy", CANCELLED: "Đã hủy",
        };
        return m[s] ?? s;
      };

      const [y, m] = currentMonth.split("-").map(Number);

      ExportExcel({
        title:        `BÁO CÁO HÓA ĐƠN VAT ĐIỆN TỬ - THÁNG ${m}/${y}`,
        fileName:     `BaoCao_HoaDon_VAT_T${m}_${y}`,
        generateInfo: false,
        generateSign: false,
        header: [[
          "STT",
          "Số hóa đơn",
          "Ký hiệu",
          "Ngày xuất",
          "Người mua",
          "Mã số thuế",
          "Tiền hàng (VNĐ)",
          "Thuế GTGT (VNĐ)",
          "Tổng tiền (VNĐ)",
          "Trạng thái",
        ]],
        data: allData.items.map((item, idx) => [
          idx + 1,
          item.invoiceNo || "Đang xử lý",
          item.invoiceSeries || "",
          fmtDateExport(item.invoiceIssuedDate),
          item.buyerName || "",
          item.buyerTaxCode || "Cá nhân",
          (item as any).amountWithoutTax ?? 0,
          (item as any).taxAmount ?? 0,
          item.totalAmount ?? 0,
          statusLabel(item.status),
        ]),
        columnsWidth: [6, 18, 12, 14, 30, 16, 18, 18, 18, 16],
        formatExcel:  ["center", "left", "center", "center", "left", "center", "right", "right", "right", "center"],
      });
      showToast("Xuất báo cáo thành công!", "success");
    } catch (e: any) {
      showToast(e?.message || "Lỗi khi xuất báo cáo.", "error");
    } finally {
      setExportingReport(false);
    }
  }, [currentMonth]);

  // ---- Per-tab header configs ----
  const tabHeaderConfig: Record<TabName, TabHeaderConfig> = {
    tab_one: {
      title: "Hóa đơn VAT điện tử",
      subtitle: `Xuất và quản lý hóa đơn GTGT theo nghị định 123/2020/NĐ-CP${overviewStats.monthLabel ? " · " + overviewStats.monthLabel : ""}`,
      actions: (
        <>
          <button className="btn-export-report" onClick={handleExportReport} disabled={exportingReport}>
            <Icon name="Download" /> {exportingReport ? "Đang xuất..." : "Xuất báo cáo"}
          </button>
          <button className="btn-new-invoice" onClick={() => setTab({ name: "tab_three" })}>+ Xuất hóa đơn mới</button>
        </>
      ),
    },
    tab_two: {
      title: "Danh sách hóa đơn VAT",
      subtitle: liveStats.total > 0
        ? `${liveStats.total} hóa đơn trong ${liveStats.monthLabel}`
        : "Đang tải...",
      actions: (
        <>
          <button className="btn-export-report" onClick={() => listExportRef.current?.()}>
            <Icon name="Download" /> Xuất Excel
          </button>
          <button className="btn-new-invoice" onClick={() => setTab({ name: "tab_three" })}>+ Xuất hóa đơn mới</button>
        </>
      ),
    },
    tab_three: {
      title: "Xuất hóa đơn VAT mới",
      subtitle: "Hóa đơn GTGT theo Nghị định 123/2020/NĐ-CP · Ký số điện tử",
      actions: (
        <>
          <button className="btn-export-report" onClick={() => issuePreviewRef.current?.()}>
            <Icon name="Eye" /> Xem trước
          </button>
          <button className="btn-new-invoice" onClick={() => issuePublishRef.current?.()}>
            <Icon name="FileText" /> Phát hành hóa đơn
          </button>
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
      actions: <></>,
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
                  {item.is_active === "tab_two" && liveStats.pending > 0 && (
                    <span className="tab-badge">{liveStats.pending}</span>
                  )}
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
            {loadingOverview && (
              <div style={{ textAlign: "center", padding: "12px 0", color: "#9ca3af", fontSize: 13 }}>
                Đang tải dữ liệu...
              </div>
            )}
            <div className="stat-cards-row">
              <StatCard label="TỔNG HĐ THÁNG NÀY"
                        value={overviewStats.total || "—"}
                        sub={<span className="trend-up">{overviewStats.monthLabel}</span>}
                        accentColor="#1e3a5f" />
              <StatCard label="TỔNG TIỀN VAT (tháng này)"
                        value={overviewStats.totalVAT ? fmtVND(overviewStats.totalVAT) : "—"}
                        sub={<span className="trend-up">Thuế GTGT tháng này</span>}
                        accentColor="#f59e0b" />
              <StatCard label="CHỜ KÝ SỐ / PHÁT HÀNH"
                        value={overviewStats.pending}
                        sub={<span className="trend-neutral">⏱ Cần xử lý hôm nay</span>}
                        accentColor="#f59e0b" />
              <StatCard label="ĐÃ PHÁT HÀNH THÀNH CÔNG"
                        value={overviewStats.issued}
                        sub={overviewStats.total > 0
                          ? <span className="trend-up">✓ {Math.round(overviewStats.issued / overviewStats.total * 100)}% tỷ lệ thành công</span>
                          : <span>—</span>}
                        accentColor="#16a34a" />
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
                  {recentInvoices.length === 0 && !loadingOverview && (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: "24px", fontSize: 13 }}>Chưa có hóa đơn trong tháng này.</td></tr>
                  )}
                  {recentInvoices.map((item) => {
                    const fmtDateOv = (ts?: number | null) => { if (!ts) return "—"; const d=new Date(ts); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; };
                    const OV_BADGE: Record<string, {text:string;variant:BadgeVariant}> = { ISSUED:{text:"Đã phát hành",variant:"success"}, PENDING:{text:"Chờ ký số",variant:"warning"}, FAILED:{text:"Lỗi / Hủy",variant:"error"}, CANCELLED:{text:"Đã hủy",variant:"error"} };
                    const si = OV_BADGE[item.status] ?? { text: item.status, variant: "wait-collect" as BadgeVariant };
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="invoice-no">{item.invoiceNo || <em style={{color:"#9ca3af"}}>Đang xử lý</em>}</div>
                          <div className="invoice-date">{fmtDateOv(item.invoiceIssuedDate)}</div>
                        </td>
                        <td>
                          <div className="customer-name">{item.buyerName || "—"}</div>
                          <div className="tax-code">{item.buyerTaxCode ? `MST: ${item.buyerTaxCode}` : "Cá nhân"}</div>
                        </td>
                        <td className="text-right">
                          <div className="total-amount">{formatCurrency(item.totalAmount ?? 0)}</div>
                          <div className="vat-amount">VAT: {formatCurrency(item.taxAmount ?? 0)}</div>
                        </td>
                        <td className="text-center">
                          <Badge text={si.text} variant={si.variant} />
                        </td>
                        <td className="text-center">
                          {item.status === "PENDING" && (
                            <button className="btn btn-warning btn-sm">Ký số</button>
                          )}
                          {(item.status === "FAILED" || item.status === "CANCELLED") && (
                            <button className="btn btn-outline btn-sm">Thay thế</button>
                          )}
                          {item.status === "ISSUED" && (
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
                  {activeProvider ? (
                    <div className="provider-item">
                      <div className="provider-logo" style={{ background: activeProvider.logoColor || "#1e40af" }}>
                        {activeProvider.logoText || activeProvider.code?.toUpperCase()}
                      </div>
                      <div className="provider-info">
                        <span className="provider-name">{activeProvider.name}</span>
                        <span className="provider-sub">
                          {activeProvider.lastTestStatus === "success" ? "Đang kết nối" : "Chưa kiểm tra"} · API
                        </span>
                      </div>
                      <span className={`provider-status ${activeProvider.lastTestStatus === "success" ? "active" : ""}`}>
                        ● {activeProvider.lastTestStatus === "success" ? "Hoạt động" : "Chưa xác nhận"}
                      </span>
                    </div>
                  ) : (
                    <div className="provider-item">
                      <div className="provider-info">
                        <span className="provider-sub">Chưa cấu hình nhà cung cấp</span>
                      </div>
                    </div>
                  )}
                  <div className="quota-section">
                    <div className="quota-header"><span>Hạn mức hóa đơn</span></div>
                    <div className="quota-bar-card">
                      <div className="quota-bar-header">
                        <span>Đã dùng tháng này</span>
                        <span className="quota-numbers">{overviewStats.usedQuota} / {overviewStats.maxQuota === 99999999 ? "∞" : overviewStats.maxQuota}</span>
                      </div>
                      <div className="quota-bar">
                        <div className="quota-bar-fill" style={{ width: `${overviewStats.maxQuota === 99999999 ? 2 : Math.min(100, overviewStats.usedQuota / overviewStats.maxQuota * 100)}%` }} />
                      </div>
                      <p className="quota-expiry">{overviewStats.maxQuota === 99999999 ? "Không giới hạn" : `Còn lại ${overviewStats.maxQuota - overviewStats.usedQuota} hóa đơn`}{overviewStats.quotaExpiry !== "—" && ` · Hết hạn ${overviewStats.quotaExpiry}`}</p>
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
                      <span className="status-count success">{overviewStats.issued}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-icon warning">⏱</span>
                      <div className="status-info">
                        <span className="status-label">Chờ ký số / xử lý</span>
                        <span className="status-sub">Đang chờ ký điện tử</span>
                      </div>
                      <span className="status-count warning">{overviewStats.pending}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-icon error">⊗</span>
                      <div className="status-info">
                        <span className="status-label">Lỗi / Đã hủy</span>
                        <span className="status-sub">Cần xuất hóa đơn thay thế</span>
                      </div>
                      <span className="status-count error">{overviewStats.failed}</span>
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
            onRegisterExport={handleRegisterExport}
            onCountsLoaded={handleCountsLoaded}
          />
        )}

        {tab.name === "tab_three" && (
          <IssueInvoice
            onRegisterPreview={handleRegisterPreview}
            onRegisterPublish={handleRegisterPublish}
            initialInvoiceCode={initialInvoiceCode || undefined}
          />
        )}
        {tab.name === "tab_four"  && <ElectronicInvoiceProvider />}
        {tab.name === "tab_five"  && <Configuration />}
      </div>

      {/* ── InvoiceDetailModal (nút Xem) ── */}
      <InvoiceDetailModal
        isOpen={showDetail}
        data={detailData}
        onClose={handleCloseDetail}
        onRefresh={handleCloseDetail}
      />

      {/* ── InvoicePreviewModal (nút Xem trước / Phát hành ở header tab 3) ── */}
      <InvoicePreviewModal
        isOpen={showPreview}
        data={{
          sellerName:       vatConfig?.companyName || "—",
          sellerTaxCode:    vatConfig?.taxCode || "—",
          sellerAddress:    vatConfig?.address || "—",
          sellerPhone:      vatConfig?.phone || "",
          sellerEmail:      vatConfig?.email || "",
          sellerBankAccount:vatConfig?.bankAccount || "",
          sellerBankName:   vatConfig?.bankName || "",
          templateCode:     vatConfig?.defaultTemplateCode || "1/6553",
          symbol:           vatConfig?.defaultInvoiceSeries || "C26TNA",
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
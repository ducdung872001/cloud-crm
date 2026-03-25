import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { getPermissions, showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import Icon from "components/icon";
import AddPromoCodeModal from "./AddPromoCodeModal";
import { ITitleActions } from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import CouponService from "services/CouponService";
import {
  ICoupon,
  DISCOUNT_TYPE_LABELS,
  COUPON_STATUS_MAP,
  COUPON_STATUS_TRANSITIONS,
} from "model/coupon/CouponModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import "./index.scss";

// ── Stat Card ────────────────────────────────────────────────────────
interface StatCardProps {
  title: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: "orange"|"blue"|"green"|"purple";
  trend?: number; isLoading?: boolean;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, color, trend, isLoading }) => (
  <div className={`promo-stat-card promo-stat-card--${color}`}>
    <div className="promo-stat-card__body">
      <div className="promo-stat-card__content">
        <p className="promo-stat-card__label">{title}</p>
        <p className="promo-stat-card__value">{isLoading ? "..." : value}</p>
        {sub && <p className="promo-stat-card__sub">{sub}</p>}
        {trend !== undefined && !isLoading && (
          <p className={`promo-stat-card__trend ${trend >= 0 ? "promo-stat-card__trend--up" : "promo-stat-card__trend--down"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% so với tháng trước
          </p>
        )}
      </div>
      <div className="promo-stat-card__icon">{icon}</div>
    </div>
  </div>
);

export default function PromoCode(props: any) {
  document.title = "Mã giảm giá";
  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());

  // ── Data ──────────────────────────────────────────────────────────
  const [listData, setListData]   = useState<ICoupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats]         = useState({ active: 0, used: 0, pending: 0, total: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage]           = useState(1);
  const [totalItem, setTotalItem] = useState(0);
  const [sizeLimit]               = useState(12);  // Grid 3 cột → 12/page

  // ── Filter ────────────────────────────────────────────────────────
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState(-1);
  const [typeFilter, setTypeFilter]       = useState(0);

  // ── UI ────────────────────────────────────────────────────────────
  const [showModalAdd, setShowModalAdd]   = useState(false);
  const [selectedItem, setSelectedItem]   = useState<ICoupon | null>(null);
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [statusMenu, setStatusMenu]       = useState<{ id: number; top: number; left: number } | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Load list ─────────────────────────────────────────────────────
  const loadList = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    try {
      const res = await CouponService.list(
        {
          ...(search.trim() ? { code: search.trim() } : {}),
          status:       statusFilter,
          ...(typeFilter > 0 ? { discountType: typeFilter } : {}),
          page, sizeLimit,
        },
        abortRef.current.signal
      );
      if (res?.code === 0) {
        setListData(res.result?.items ?? []);
        setTotalItem(res.result?.total ?? 0);
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") showToast("Lỗi tải dữ liệu", "error");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter, page, sizeLimit]);

  // ── Load stats ────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [active, pending, total, used] = await Promise.all([
        CouponService.countByStatus(1),
        CouponService.countByStatus(0),
        CouponService.countByStatus(-1),
        CouponService.sumUsed(),
      ]);
      setStats({ active, pending, total, used });
    } catch { /* silent */ }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadStats(); }, []);

  // Đóng status dropdown khi click ngoài
  useEffect(() => {
    const handler = () => setStatusMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setShowDialog(false); setContentDialog(null);
    const res = await CouponService.delete(id);
    if (res?.code === 0) {
      showToast("Xóa mã giảm giá thành công", "success");
      loadList(); loadStats();
    } else showToast(res?.message ?? "Xóa thất bại", "error");
  };

  const showConfirmDelete = (item: ICoupon) => {
    setContentDialog({
      color: "error", isCentered: true, isLoading: true,
      title: <>Xóa mã giảm giá</>,
      message: <>Bạn có chắc muốn xóa mã <strong>{item.code}</strong>? Không thể khôi phục.</>,
      cancelText: "Hủy", cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa", defaultAction: () => handleDelete(item.id),
    });
    setShowDialog(true);
  };

  // ── Update status ─────────────────────────────────────────────────
  const handleUpdateStatus = async (id: number, status: number) => {
    setStatusMenu(null);
    const res = await CouponService.updateStatus(id, status);
    if (res?.code === 0) {
      showToast(`Đã chuyển sang "${COUPON_STATUS_MAP[status]?.label}"`, "success");
      loadList(); loadStats();
    } else showToast(res?.message ?? "Đổi trạng thái thất bại", "error");
  };

  // ── Helpers ───────────────────────────────────────────────────────
  const formatMoney = (v?: number) =>
    v ? new Intl.NumberFormat("vi-VN").format(v) : "0";

  const formatDate = (d?: string) => {
    if (!d) return "--";
    // "2026-03-31" → "31/03/2026"
    return d.substring(0, 10).split("-").reverse().join("/");
  };

  const titleActions: ITitleActions = {
    actions: [(permissions["CATEGORY_SERVICE_ADD"] == 1 || true) && {
      title: "Tạo mã mới",
      callback: () => { setSelectedItem(null); setShowModalAdd(true); },
    }],
  };

  const totalPage = Math.ceil(totalItem / sizeLimit) || 0;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="promo-page page-content">
      <HeaderTabMenu
        title="Mã giảm giá" titleBack="Khuyến mãi"
        titleActions={titleActions} onBackProps={onBackProps}
      />

      {/* Stat cards */}
      <div className="promo-stats-grid">
        <StatCard title="Đang phát hành" value={stats.active}  sub="Mã giảm giá" icon={<Icon name="Tag" />}       color="blue"   isLoading={statsLoading} />
        <StatCard title="Đã sử dụng"     value={stats.used}    sub="Lượt dùng"   icon={<Icon name="Payment" />}   color="green"  isLoading={statsLoading} />
        <StatCard title="Chờ duyệt"      value={stats.pending} sub="Mã giảm giá" icon={<Icon name="Clock" />}     color="orange" isLoading={statsLoading} />
        <StatCard title="Tổng mã"        value={stats.total}   sub="Mã giảm giá" icon={<Icon name="ChartLine" />} color="purple" isLoading={statsLoading} />
      </div>

      {/* Toolbar */}
      <div className="coupon-toolbar">
        <div className="promo-search-wrap">
          <svg className="promo-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Tìm mã giảm giá..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="promo-search-input" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(Number(e.target.value)); setPage(1); }} className="promo-select">
          <option value={-1}>Tất cả trạng thái</option>
          <option value={1}>Đang chạy</option>
          <option value={0}>Chờ duyệt</option>
          <option value={2}>Hết hạn</option>
          <option value={3}>Tạm dừng</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(Number(e.target.value)); setPage(1); }} className="promo-select">
          <option value={0}>Tất cả loại</option>
          {Object.entries(DISCOUNT_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="coupon-loading">Đang tải...</div>
      ) : listData.length === 0 ? (
        <div className="coupon-empty">
          <Icon name="Tag" />
          <p>Chưa có mã giảm giá nào</p>
        </div>
      ) : (
        <div className="coupon-grid">
          {listData.map(c => {
            const st = c.status ?? 0;
            const statusInfo = COUPON_STATUS_MAP[st] ?? COUPON_STATUS_MAP[0];
            const transitions = COUPON_STATUS_TRANSITIONS[st] ?? [];
            const usedPct = c.maxUses > 0 ? Math.min(100, Math.round((c.usedCount / c.maxUses) * 100)) : 0;
            return (
              <div key={c.id} className="c-card">
                {/* Header */}
                <div className={`c-card-header ${statusInfo.headerClass}`}>
                  <div className="c-card-header__inner">
                    <span className="c-card__code">{c.code}</span>
                    {/* Badge + dropdown đổi trạng thái */}
                    <div className="promo-status-wrap" onClick={e => e.stopPropagation()}>
                      <span className={statusInfo.badgeClass}>{statusInfo.label}</span>
                      {transitions.length > 0 && (
                        <span className="promo-status-chevron"
                          onClick={e => {
                            e.stopPropagation();
                            if (statusMenu?.id === c.id) { setStatusMenu(null); return; }
                            const wrap = (e.currentTarget as HTMLElement).closest(".promo-status-wrap") as HTMLElement;
                            const rect = (wrap ?? e.currentTarget as HTMLElement).getBoundingClientRect();
                            const W = 200, H = transitions.length * 44 + 8;
                            let left = rect.right - W;
                            left = Math.max(8, Math.min(left, window.innerWidth - W - 8));
                            const top = window.innerHeight - rect.bottom < H + 8
                              ? rect.top - H - 4 : rect.bottom + 4;
                            setStatusMenu({ id: c.id, top, left });
                          }}
                        >
                          <Icon name="CaretDown" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="c-card-body">
                  <div className="c-card-info">
                    <div className="c-card-info__main">
                      <p className="c-card-info__val">
                        {c.discountType === 1
                          ? `${c.discountValue}%`
                          : c.discountType === 3
                          ? "100%"
                          : `${formatMoney(c.discountValue)}đ`}
                      </p>
                      <p className="c-card-info__type">
                        {c.discountType === 3 ? "Miễn ship" : DISCOUNT_TYPE_LABELS[c.discountType] ?? "--"}
                      </p>
                    </div>
                    <div className="c-card-info__min">
                      <p className="c-card-info__min-label">Đơn tối thiểu</p>
                      <p className="c-card-info__min-val">
                        {c.minOrder > 0 ? `${formatMoney(c.minOrder)}đ` : "Không giới hạn"}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {c.maxUses > 0 && (
                    <div className="c-card-prog">
                      <div className="c-card-prog__text">
                        <span>Đã dùng: {c.usedCount}/{c.maxUses}</span>
                        <span>{usedPct}%</span>
                      </div>
                      <div className="c-card-prog__bar-wrapper">
                        <div className="c-card-prog__bar" style={{ width: `${usedPct}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="c-card-footer">
                    <span className="c-card-footer__hsd">HSD: {formatDate(c.expiryDate)}</span>
                    <div className="c-card-footer__actions">
                      <button className="c-card-footer__btn c-card-footer__btn--edit"
                        onClick={() => { setSelectedItem(c); setShowModalAdd(true); }}>
                        Sửa
                      </button>
                      <button className="c-card-footer__btn c-card-footer__btn--del"
                        onClick={() => showConfirmDelete(c)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination đơn giản */}
      {totalPage > 1 && (
        <div className="coupon-pagination">
          <span className="coupon-pagination__info">
            Trang {page}/{totalPage} · {totalItem} mã
          </span>
          <div className="coupon-pagination__btns">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            <button disabled={page >= totalPage} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      )}

      {/* Status dropdown portal */}
      {statusMenu && ReactDOM.createPortal(
        <div className="promo-status-dropdown"
          style={{ position: "fixed", zIndex: 9999, top: statusMenu.top, left: statusMenu.left, minWidth: 200 }}
          onClick={e => e.stopPropagation()}>
          {(COUPON_STATUS_TRANSITIONS[
            listData.find(d => d.id === statusMenu.id)?.status ?? 0
          ] ?? []).map(t => (
            <div key={t.status} className="promo-status-dropdown__item"
              onClick={() => handleUpdateStatus(statusMenu.id, t.status)}>
              <span>{t.label}</span>
            </div>
          ))}
        </div>,
        document.body
      )}

      <AddPromoCodeModal
        onShow={showModalAdd}
        data={selectedItem}
        onHide={(refresh) => { setShowModalAdd(false); if (refresh) { loadList(); loadStats(); } }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

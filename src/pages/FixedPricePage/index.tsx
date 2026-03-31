import React, { useState, useEffect, useCallback, useRef } from "react";
import { getPermissions, showToast } from "utils/common";
import { ITitleActions } from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import PromotionService from "services/PromotionService";
import FixedPriceService from "services/FixedPriceService";
import AddPromotionalModal from "pages/PromotionalProgram/partials/AddPromotionalModal";
import { IPromotion, PROMOTION_STATUS_MAP } from "model/promotion/PromotionModel";
import "./index.scss";

// ── Stat card ─────────────────────────────────────────────────────
interface StatCardProps {
  title: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: "orange" | "blue" | "green" | "purple";
  isLoading?: boolean;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, color, isLoading }) => (
  <div className={`promo-stat-card promo-stat-card--${color}`}>
    <div className="promo-stat-card__body">
      <div className="promo-stat-card__content">
        <p className="promo-stat-card__label">{title}</p>
        <p className="promo-stat-card__value">{isLoading ? "..." : value}</p>
        {sub && <p className="promo-stat-card__sub">{sub}</p>}
      </div>
      <div className="promo-stat-card__icon">{icon}</div>
    </div>
  </div>
);

// ── Status badge config ───────────────────────────────────────────
const STATUS_CFG: Record<number, { label: string; cls: string }> = {
  0: { label: "Chờ duyệt",  cls: "fp-badge fp-badge--pending" },
  1: { label: "Đang chạy",  cls: "fp-badge fp-badge--active"  },
  2: { label: "Hết hạn",    cls: "fp-badge fp-badge--expired" },
  3: { label: "Tạm dừng",   cls: "fp-badge fp-badge--paused"  },
};

function formatMoney(n?: number) {
  if (!n && n !== 0) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function formatDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return d; }
}

// ── Main page ─────────────────────────────────────────────────────
export default function FixedPricePage(props: any) {
  document.title = "Chương trình đồng giá";
  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());

  // ── Data ────────────────────────────────────────────────────────
  const [listData, setListData]   = useState<IPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats]         = useState({ active: 0, pending: 0, expired: 0, total: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Số SP trong mỗi CT — key: promotionId
  const [productCounts, setProductCounts] = useState<Record<number, number>>({});

  // ── Filter ──────────────────────────────────────────────────────
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState(-1);
  const [page, setPage]               = useState(1);
  const [totalItem, setTotalItem]     = useState(0);
  const sizeLimit = 10;

  // ── Modal + dialog ───────────────────────────────────────────────
  const [showModalAdd, setShowModalAdd]   = useState(false);
  const [selectedItem, setSelectedItem]   = useState<IPromotion | null>(null);
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Load list (chỉ promotionType = 7) ───────────────────────────
  const loadList = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    try {
      const res = await PromotionService.list(
        {
          ...(search.trim() ? { name: search.trim() } : {}),
          status:        statusFilter,
          promotionType: 7,   // ← chỉ lấy đồng giá
          page,
          sizeLimit,
        },
        abortRef.current.signal
      );
      if (res?.code === 0) {
        const items: IPromotion[] = res.result?.items ?? [];
        setListData(items);
        setTotalItem(res.result?.total ?? 0);

        // Load số SP cho mỗi CT (batch, không block UI)
        items.forEach((p) => {
          if (!p.id) return;
          FixedPriceService.getProducts(p.id)
            .then((r) => {
              if (r.code === 0) {
                setProductCounts((prev) => ({ ...prev, [p.id!]: r.result?.length ?? 0 }));
              }
            })
            .catch(() => {});
        });
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") showToast("Lỗi tải dữ liệu", "error");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, sizeLimit]);

  // ── Load stats — đếm chỉ promotionType=7 ────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      // Lấy tất cả CT đồng giá (không phân trang, limit lớn) rồi đếm phía FE
      const [active, pending, expired, total] = await Promise.all([
        PromotionService.list({ promotionType: 7, status: 1,  page: 1, sizeLimit: 1 }),
        PromotionService.list({ promotionType: 7, status: 0,  page: 1, sizeLimit: 1 }),
        PromotionService.list({ promotionType: 7, status: 2,  page: 1, sizeLimit: 1 }),
        PromotionService.list({ promotionType: 7, status: -1, page: 1, sizeLimit: 1 }),
      ]);
      setStats({
        active:  active?.result?.total  ?? 0,
        pending: pending?.result?.total ?? 0,
        expired: expired?.result?.total ?? 0,
        total:   total?.result?.total   ?? 0,
      });
    } catch { /* silent */ }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadStats(); }, []);

  // ── Update status ────────────────────────────────────────────────
  const handleUpdateStatus = async (id: number, status: number) => {
    const res = await PromotionService.updateStatus(id, status);
    if (res?.code === 0) {
      const label = STATUS_CFG[status]?.label ?? "";
      showToast(`Đã chuyển sang "${label}"`, "success");
      loadList(); loadStats();
    } else showToast(res?.message ?? "Đổi trạng thái thất bại", "error");
  };

  // ── Delete ───────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setShowDialog(false); setContentDialog(null);
    const res = await PromotionService.delete(id);
    if (res?.code === 0) {
      showToast("Xóa chương trình đồng giá thành công", "success");
      loadList(); loadStats();
    } else showToast(res?.message ?? "Xóa thất bại", "error");
  };

  const showConfirmDelete = (item: IPromotion) => {
    setContentDialog({
      color: "error", isCentered: true, isLoading: true,
      title: <>Xóa chương trình đồng giá</>,
      message: <>Bạn có chắc muốn xóa <strong>{item.name}</strong>? Thao tác không thể khôi phục.</>,
      cancelText: "Hủy",    cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",  defaultAction: () => handleDelete(item.id!),
    });
    setShowDialog(true);
  };

  const titleActions: ITitleActions = {
    actions: [
      (permissions["CATEGORY_SERVICE_ADD"] == 1 || true) && {
        title: "Tạo đồng giá mới",
        callback: () => { setSelectedItem(null); setShowModalAdd(true); },
      },
    ],
  };

  const totalPage = Math.ceil(totalItem / sizeLimit) || 0;

  return (
    <div className="fp-page page-content">
      <HeaderTabMenu
        title="Chương trình đồng giá"
        titleBack="Khuyến mãi"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />

      {/* ── Stat cards ── */}
      <div className="promo-stats-grid">
        <StatCard title="Đang chạy"  value={stats.active}  sub="CT đồng giá" icon={<Icon name="Tag" />}       color="blue"   isLoading={statsLoading} />
        <StatCard title="Chờ duyệt"  value={stats.pending} sub="CT đồng giá" icon={<Icon name="Clock" />}     color="orange" isLoading={statsLoading} />
        <StatCard title="Hết hạn"    value={stats.expired} sub="CT đồng giá" icon={<Icon name="CloseCircle" />} color="purple" isLoading={statsLoading} />
        <StatCard title="Tổng cộng"  value={stats.total}   sub="CT đồng giá" icon={<Icon name="ChartLine" />} color="green"  isLoading={statsLoading} />
      </div>

      {/* ── Toolbar ── */}
      <div className="fp-toolbar">
        <div className="promo-search-wrap">
          <svg className="promo-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Tìm chương trình đồng giá..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="promo-search-input" />
        </div>
        <select value={statusFilter}
          onChange={(e) => { setStatusFilter(Number(e.target.value)); setPage(1); }}
          className="promo-select">
          <option value={-1}>Tất cả trạng thái</option>
          <option value={1}>Đang chạy</option>
          <option value={0}>Chờ duyệt</option>
          <option value={2}>Hết hạn</option>
          <option value={3}>Tạm dừng</option>
        </select>
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="fp-loading">Đang tải...</div>
      ) : listData.length === 0 ? (
        <div className="fp-empty-state">
          <div className="fp-empty-state__icon">🏷️</div>
          <p className="fp-empty-state__title">Chưa có chương trình đồng giá</p>
          <p className="fp-empty-state__desc">
            Tạo chương trình đồng giá để bán hàng với mức giá cố định cho nhiều sản phẩm cùng lúc.
          </p>
          <button className="fp-empty-state__btn"
            onClick={() => { setSelectedItem(null); setShowModalAdd(true); }}>
            + Tạo đồng giá đầu tiên
          </button>
        </div>
      ) : (
        <div className="fp-table-wrap">
          <table className="fp-table">
            <thead>
              <tr>
                <th>Tên chương trình</th>
                <th>Giá đồng giá</th>
                <th>Số sản phẩm</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listData.map((item) => {
                const st = item.status ?? 0;
                const stCfg = STATUS_CFG[st] ?? STATUS_CFG[0];
                const canStart  = st === 0 || st === 3;
                const canPause  = st === 1;
                const canEnd    = st === 1 || st === 3;
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="fp-table__name">{item.name}</div>
                      {item.minAmount && (
                        <div className="fp-table__sub">Đơn tối thiểu: {formatMoney(item.minAmount)}</div>
                      )}
                    </td>
                    <td>
                      <span className="fp-table__price">{formatMoney(item.fixedPrice)}</span>
                    </td>
                    <td>
                      <span className="fp-table__count">
                        {productCounts[item.id!] !== undefined
                          ? `${productCounts[item.id!]} SP`
                          : "—"}
                      </span>
                    </td>
                    <td>
                      <div className="fp-table__date">{formatDate(item.startTime)}</div>
                      <div className="fp-table__date fp-table__date--end">→ {formatDate(item.endTime)}</div>
                    </td>
                    <td>
                      <span className={stCfg.cls}>{stCfg.label}</span>
                    </td>
                    <td>
                      <div className="fp-table__actions">
                        <button className="fp-act-btn fp-act-btn--edit"
                          title="Chỉnh sửa"
                          onClick={() => { setSelectedItem(item); setShowModalAdd(true); }}>
                          <Icon name="Pencil" />
                        </button>
                        {canStart && (
                          <button className="fp-act-btn fp-act-btn--start"
                            title="Duyệt – Bắt đầu chạy"
                            onClick={() => handleUpdateStatus(item.id!, 1)}>
                            <Icon name="CheckedCircle" />
                          </button>
                        )}
                        {canPause && (
                          <button className="fp-act-btn fp-act-btn--pause"
                            title="Tạm dừng"
                            onClick={() => handleUpdateStatus(item.id!, 3)}>
                            <Icon name="PauseCircle" />
                          </button>
                        )}
                        {canEnd && (
                          <button className="fp-act-btn fp-act-btn--end"
                            title="Kết thúc"
                            onClick={() => handleUpdateStatus(item.id!, 2)}>
                            <Icon name="CloseCircle" />
                          </button>
                        )}
                        <button className="fp-act-btn fp-act-btn--del"
                          title="Xóa"
                          onClick={() => showConfirmDelete(item)}>
                          <Icon name="Trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPage > 1 && (
        <div className="coupon-pagination">
          <span className="coupon-pagination__info">
            Trang {page}/{totalPage} · {totalItem} chương trình
          </span>
          <div className="coupon-pagination__btns">
            <button disabled={page <= 1}        onClick={() => setPage((p) => p - 1)}>‹</button>
            <button disabled={page >= totalPage} onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        </div>
      )}

      {/* ── Modal tạo/sửa — tái dùng AddPromotionalModal, mặc định type=7 ── */}
      <AddPromotionalModal
        onShow={showModalAdd}
        data={selectedItem ?? (showModalAdd && !selectedItem
          ? { promotionType: 7 }   // ← mặc định type đồng giá khi tạo mới từ tab này
          : null)}
        onHide={(refresh) => {
          setShowModalAdd(false);
          if (refresh) { loadList(); loadStats(); }
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
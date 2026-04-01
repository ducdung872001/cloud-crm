import React, { useState, useEffect, useRef, useCallback } from "react";
import moment from "moment";
import Loading from "components/loading";
import "./Overview.scss";
import ModalAddChannel from "./ModalAddChannel/ModalAddChannel";
import MultiChannelService, {
  IStatCards,
  IChannelRow,
} from "services/MultiChannelService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtRevenue(val: number): string {
  if (!val || val === 0) return "0";
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000)     return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)         return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString("vi");
}

/** Màu + logo theo saleflowId từ CHANNEL_META backend */
const CHANNEL_CONFIG: Record<number, { logo: string; bg: string; color: string }> = {
  0: { logo: "POS", bg: "#1e2139",  color: "#6366f1" }, // Tại quầy
  1: { logo: "WEB", bg: "#000000",  color: "#6b7280" }, // Website
  2: { logo: "SOC", bg: "#1877f2",  color: "#3b82f6" }, // Fanpage/Zalo
  3: { logo: "MKT", bg: "#ff6633",  color: "#f97316" }, // Sàn TMĐT
};

function getChannelCfg(saleflowId: number) {
  return CHANNEL_CONFIG[saleflowId] ?? { logo: "CH", bg: "#6b7280", color: "#9ca3af" };
}

// ─── Mock fallback (hiển thị khi API chưa live) ───────────────────────────────

const MOCK_STAT: IStatCards = {
  revenue: 100_300_000, orderCount: 194, doneCount: 180,
  cancelCount: 14, avgOrderValue: 517_000,
  revenueDeltaPct: 12.4, orderDeltaCount: 8,
};

const MOCK_CHANNELS: IChannelRow[] = [
  { saleflowId: 3, channelName: "Sàn TMĐT",        channelDesc: "Shopee, Lazada...", orderCount: 121, revenue: 39_400_000, avgOrderValue: 325_000, ratio: 1.0,  trend: "UP",   trendPct: 15 },
  { saleflowId: 0, channelName: "Tại quầy (POS)",   channelDesc: "Trực tiếp",         orderCount: 49,  revenue: 25_000_000, avgOrderValue: 510_000, ratio: 0.63, trend: "UP",   trendPct: 8  },
  { saleflowId: 2, channelName: "Fanpage / Zalo OA", channelDesc: "Social inbox",      orderCount: 22,  revenue: 14_300_000, avgOrderValue: 650_000, ratio: 0.36, trend: "STABLE", trendPct: 0 },
  { saleflowId: 1, channelName: "Website bán hàng", channelDesc: "Đơn online",         orderCount: 11,  revenue: 7_200_000,  avgOrderValue: 654_000, ratio: 0.18, trend: "DOWN", trendPct: -3 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Overview() {
  document.title = "Bán hàng đa kênh";

  // Mặc định: hôm nay
  const today    = moment().format("DD/MM/YYYY");
  const params   = { fromTime: today, toTime: today, branchId: 0 };

  const [modalConnect, setModalConnect] = useState(false);
  const [statCards,    setStatCards]    = useState<IStatCards>(MOCK_STAT);
  const [channels,     setChannels]     = useState<IChannelRow[]>(MOCK_CHANNELS);
  const [loadingStat,  setLoadingStat]  = useState(false);
  const [loadingCh,    setLoadingCh]    = useState(false);

  const abortStat = useRef<AbortController | null>(null);
  const abortCh   = useRef<AbortController | null>(null);

  // ── Fetch KPI stat cards ────────────────────────────────────────────────────
  const fetchStat = useCallback(() => {
    abortStat.current?.abort();
    abortStat.current = new AbortController();
    setLoadingStat(true);

    MultiChannelService.getStatCards(params, abortStat.current.signal)
      .then((res) => {
        if (res?.code === 0 && res.result?.statCards) {
          setStatCards(res.result.statCards);
        }
        // nếu API lỗi → giữ nguyên mock
      })
      .catch(() => {})
      .finally(() => setLoadingStat(false));
  }, []);

  // ── Fetch channel breakdown ─────────────────────────────────────────────────
  const fetchChannels = useCallback(() => {
    abortCh.current?.abort();
    abortCh.current = new AbortController();
    setLoadingCh(true);

    MultiChannelService.getChannelBreakdown(params, abortCh.current.signal)
      .then((res) => {
        if (res?.code === 0 && Array.isArray(res.result) && res.result.length > 0) {
          // Sắp xếp theo revenue giảm dần
          const sorted = [...res.result].sort(
            (a: IChannelRow, b: IChannelRow) => b.revenue - a.revenue
          );
          setChannels(sorted);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCh(false));
  }, []);

  useEffect(() => {
    fetchStat();
    fetchChannels();
    return () => {
      abortStat.current?.abort();
      abortCh.current?.abort();
    };
  }, []);

  // ── Tính toán KPI card 3 & 4 từ channels ───────────────────────────────────
  const activeChannelCount = channels.filter((c) => c.orderCount > 0).length;
  const totalChannelCount  = channels.length;
  const pendingOrderCount  = statCards.cancelCount; // đơn huỷ/chờ xử lý

  // ── KPI card config ─────────────────────────────────────────────────────────
  const overviewList = [
    {
      id:    1,
      label: "Doanh thu hôm nay",
      value: fmtRevenue(statCards.revenue),
      des:   statCards.revenueDeltaPct >= 0
               ? `+${statCards.revenueDeltaPct.toFixed(1)}% so với hôm qua`
               : `${statCards.revenueDeltaPct.toFixed(1)}% so với hôm qua`,
      desColor: statCards.revenueDeltaPct >= 0 ? "green" : "red",
      color: "red",
    },
    {
      id:    2,
      label: "Tổng đơn hàng",
      value: statCards.orderCount.toString(),
      des:   statCards.orderDeltaCount >= 0
               ? `+${statCards.orderDeltaCount} đơn so với hôm qua`
               : `${statCards.orderDeltaCount} đơn so với hôm qua`,
      desColor: statCards.orderDeltaCount >= 0 ? "green" : "red",
      color: "blue",
    },
    {
      id:    3,
      label: "Kênh đang hoạt động",
      value: `${activeChannelCount}/${totalChannelCount}`,
      des:   totalChannelCount - activeChannelCount > 0
               ? `${totalChannelCount - activeChannelCount} kênh đang chờ kết nối`
               : "Tất cả kênh đang hoạt động",
      desColor: "var(--extra-color-50)",
      color: "green",
    },
    {
      id:    4,
      label: "Đơn chờ xử lý",
      value: pendingOrderCount.toString(),
      des:   pendingOrderCount > 0 ? "Cần xử lý ngay" : "Không có đơn tồn đọng",
      desColor: pendingOrderCount > 0 ? "red" : "green",
      color: "orange",
    },
  ];

  // ── Tính maxRevenue cho thanh progress ──────────────────────────────────────
  const maxRevenue = channels.length > 0
    ? Math.max(...channels.map((c) => c.revenue), 1)
    : 1;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="overview-page">

      {/* ── Header ── */}
      <div className="conatiner-header">
        <div>
          <span style={{ fontSize: 24, fontWeight: "700", color: "var(--text-primary-color)" }}>
            Bán hàng đa kênh
          </span>
          <div>
            <span style={{ fontSize: 16, fontWeight: "500", color: "#939394" }}>
              Quản lý tất cả kênh bán hàng tại một nơi
            </span>
          </div>
        </div>

        <div className="conatiner-button">
          <div className="button-export">
            <span style={{ fontSize: 14, fontWeight: "500" }}>Xuất báo cáo</span>
          </div>
          <div className="button-connect" onClick={() => setModalConnect(true)}>
            <span style={{ fontSize: 14, fontWeight: "500" }}>Kết nối kênh mới</span>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="list-overview-report">
        {loadingStat ? (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "2rem" }}>
            <Loading />
          </div>
        ) : (
          overviewList.map((item) => (
            <div
              key={item.id}
              className="item-overview"
              style={{ borderTop: "5px solid", borderTopColor: item.color }}
            >
              <div>
                <span style={{ fontSize: 16, fontWeight: "700", color: "#939394" }}>
                  {item.label}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 24, fontWeight: "600" }}>{item.value}</span>
              </div>
              <div>
                <span style={{ fontSize: 14, fontWeight: "600", color: item.desColor }}>
                  {item.des}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Bảng hiệu quả từng kênh ── */}
      <div className="table-result-app">
        <div className="table-header">
          <span style={{ fontSize: 16, fontWeight: "700" }}>Hiệu quả từng kênh hôm nay</span>
          <div className="button-export">
            <span style={{ fontSize: 14, fontWeight: "500" }}>Xuất tất cả đơn</span>
          </div>
        </div>

        <div className="table-body">
          {loadingCh ? (
            <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
              <Loading />
            </div>
          ) : channels.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#939394" }}>
              Chưa có dữ liệu kênh bán hàng hôm nay
            </div>
          ) : (
            channels.map((item, index) => {
              const cfg     = getChannelCfg(item.saleflowId);
              const pct     = Math.round((item.revenue / maxRevenue) * 100);
              const lastSync = item.orderCount > 0
                ? `${item.orderCount} đơn · Hôm nay`
                : "Chưa có đơn hôm nay";

              return (
                <div key={index} className="line-body">
                  <div style={{ display: "flex", gap: "0 1.5rem", alignItems: "center" }}>
                    <div className="avatar" style={{ backgroundColor: cfg.bg }}>
                      <span style={{ fontSize: 12, fontWeight: "700", color: "white" }}>
                        {cfg.logo}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: "700" }}>
                        {item.channelName}
                      </span>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: "500", color: "var(--extra-color-50)" }}>
                          {lastSync}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="box-rate">
                    <div className="line-load">
                      <div
                        style={{
                          width:           `${pct}%`,
                          borderRadius:    "2rem",
                          height:          "0.5rem",
                          backgroundColor: cfg.color,
                          transition:      "width 0.4s ease",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: "700", whiteSpace: "nowrap" }}>
                      {fmtRevenue(item.revenue)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ModalAddChannel
        onShow={modalConnect}
        onHide={() => setModalConnect(false)}
      />
    </div>
  );
}
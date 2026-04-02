import React, { useState, useEffect, useRef, useCallback } from "react";
import moment from "moment";
import Loading from "components/loading";
import "./Overview.scss";
import ModalAddChannel from "./ModalAddChannel/ModalAddChannel";
import OrderRequestService from "services/OrderRequestService";
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

/** Màu logo theo saleflowId — khớp CHANNEL_META backend */
const CHANNEL_CONFIG: Record<number, { logo: string; bg: string; barColor: string }> = {
  0: { logo: "POS", bg: "#1e2139",  barColor: "#6366f1" },
  1: { logo: "WEB", bg: "#111827",  barColor: "#9ca3af" },
  2: { logo: "SOC", bg: "#1877f2",  barColor: "#3b82f6" },
  3: { logo: "MKT", bg: "#ff6633",  barColor: "#f97316" },
};

function channelCfg(saleflowId: number) {
  return CHANNEL_CONFIG[saleflowId] ?? { logo: "CH", bg: "#6b7280", barColor: "#d1d5db" };
}

// ─── Giá trị mặc định khi API stat lỗi (KPI = 0 rõ ràng, không misleading) ───
const EMPTY_STAT: IStatCards = {
  revenue: 0, orderCount: 0, doneCount: 0, cancelCount: 0,
  avgOrderValue: 0, revenueDeltaPct: 0, orderDeltaCount: 0,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Overview() {
  document.title = "Bán hàng đa kênh";

  const today  = moment().format("DD/MM/YYYY");
  const params = { fromTime: today, toTime: today, branchId: 0 };

  const [modalConnect, setModalConnect] = useState(false);

  // null = chưa load xong; [] = load xong, không có data; [...] = có data thật
  const [isExporting, setIsExporting] = useState(false);
  const [statCards, setStatCards]   = useState<IStatCards | null>(null);
  const [channels,  setChannels]    = useState<IChannelRow[] | null>(null);
  const [statError, setStatError]   = useState(false);
  const [chError,   setChError]     = useState(false);

  const abortStat = useRef<AbortController | null>(null);
  const abortCh   = useRef<AbortController | null>(null);

  // ── Fetch KPI stat cards ────────────────────────────────────────────────────
  const fetchStat = useCallback(() => {
    abortStat.current?.abort();
    abortStat.current = new AbortController();
    setStatCards(null);
    setStatError(false);

    MultiChannelService.getStatCards(params, abortStat.current.signal)
      .then((res) => {
        if (res?.code === 0 && res.result?.statCards) {
          setStatCards(res.result.statCards);
        } else {
          // API trả code ≠ 0 → hiển thị 0 (không dùng mock số giả)
          setStatCards(EMPTY_STAT);
          setStatError(true);
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setStatCards(EMPTY_STAT);
          setStatError(true);
        }
      });
  }, []);

  // ── Fetch channel breakdown ─────────────────────────────────────────────────
  const fetchChannels = useCallback(() => {
    abortCh.current?.abort();
    abortCh.current = new AbortController();
    setChannels(null);   // null = đang load
    setChError(false);

    MultiChannelService.getChannelBreakdown(params, abortCh.current.signal)
      .then((res) => {
        if (res?.code === 0) {
          // API thành công — dù result là [] thì cũng set thật (empty state)
          const sorted = Array.isArray(res.result)
            ? [...res.result].sort((a: IChannelRow, b: IChannelRow) => b.revenue - a.revenue)
            : [];
          setChannels(sorted);
        } else {
          setChannels([]);
          setChError(true);
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setChannels([]);
          setChError(true);
        }
      });
  }, []);

  useEffect(() => {
    fetchStat();
    fetchChannels();
    return () => {
      abortStat.current?.abort();
      abortCh.current?.abort();
    };
  }, []);

  // ── Derived KPI ─────────────────────────────────────────────────────────────
  const stat               = statCards ?? EMPTY_STAT;
  const activeChannelCount = (channels ?? []).filter((c) => c.orderCount > 0).length;
  const totalChannelCount  = (channels ?? []).length;
  const maxRevenue         = channels?.length
    ? Math.max(...channels.map((c) => c.revenue), 1)
    : 1;

  const overviewList = [
    {
      id:       1,
      label:    "Doanh thu hôm nay",
      value:    fmtRevenue(stat.revenue),
      des:      stat.revenueDeltaPct >= 0
                  ? `+${stat.revenueDeltaPct.toFixed(1)}% so với hôm qua`
                  : `${stat.revenueDeltaPct.toFixed(1)}% so với hôm qua`,
      desColor: stat.revenueDeltaPct >= 0 ? "green" : "red",
      color:    "red",
    },
    {
      id:       2,
      label:    "Tổng đơn hàng",
      value:    stat.orderCount.toString(),
      des:      stat.orderDeltaCount >= 0
                  ? `+${stat.orderDeltaCount} đơn so với hôm qua`
                  : `${stat.orderDeltaCount} đơn so với hôm qua`,
      desColor: stat.orderDeltaCount >= 0 ? "green" : "red",
      color:    "blue",
    },
    {
      id:       3,
      label:    "Kênh đang hoạt động",
      value:    channels === null ? "..." : `${activeChannelCount}/${totalChannelCount}`,
      des:      channels === null
                  ? "Đang tải..."
                  : totalChannelCount === 0
                    ? "Chưa có kênh nào"
                    : totalChannelCount - activeChannelCount > 0
                      ? `${totalChannelCount - activeChannelCount} kênh chờ kết nối`
                      : "Tất cả kênh đang hoạt động",
      desColor: "var(--extra-color-50)",
      color:    "green",
    },
    {
      id:       4,
      label:    "Đơn chờ xử lý",
      value:    stat.cancelCount.toString(),
      des:      stat.cancelCount > 0 ? "Cần xử lý ngay" : "Không có đơn tồn đọng",
      desColor: stat.cancelCount > 0 ? "red" : "green",
      color:    "orange",
    },
  ];

  // ── Export Excel ────────────────────────────────────────────────────────────
  const handleExportAll = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const res = await OrderRequestService.export({});
      if (!res || res.code !== 0) throw new Error(res?.message ?? "Xuất Excel thất bại");
      const base64 = res.result as string;
      const bin = atob(base64); const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `don_hang_da_kenh_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message ?? "Xuất Excel thất bại. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Xuất báo cáo tổng quan (FE-only, dùng statCards + channels đã load) ───
  const handleExportReport = () => {
    const st  = statCards ?? EMPTY_STAT;
    const chs = channels  ?? [];
    const esc = (s: string) =>
      String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const fmtNum = (n: number) => (n ?? 0).toLocaleString("vi-VN");
    const fmtPct = (n: number) => (n > 0 ? "+" : "") + (n ?? 0).toFixed(1) + "%";
    const trendLabel = (t: string) => t === "UP" ? "↑ Tăng" : t === "DOWN" ? "↓ Giảm" : "→ Ổn định";

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="t"><Font ss:Bold="1" ss:Size="14" ss:Color="#015aa4"/></Style>
  <Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#015aa4" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
  <Style ss:ID="lb"><Font ss:Bold="1"/></Style>
  <Style ss:ID="nr"><Alignment ss:Horizontal="Right"/><NumberFormat ss:Format="#,##0.##"/></Style>
  <Style ss:ID="sum"><Font ss:Bold="1" ss:Color="#015aa4"/><Interior ss:Color="#E0EBF8" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="Báo cáo tổng quan"><Table>
<Column ss:Width="210"/><Column ss:Width="154"/>
<Row ss:Height="28"><Cell ss:MergeAcross="1" ss:StyleID="t"><Data ss:Type="String">BÁO CÁO BÁN HÀNG ĐA KÊNH — Hôm nay ${new Date().toLocaleDateString("vi-VN")}</Data></Cell></Row>
<Row ss:Height="16"><Cell ss:MergeAcross="1"><Data ss:Type="String">Ngày xuất: ${new Date().toLocaleString("vi-VN")}</Data></Cell></Row>
<Row><Cell/></Row>
<Row><Cell ss:StyleID="lb"><Data ss:Type="String">Doanh thu hôm nay (VNĐ)</Data></Cell><Cell ss:StyleID="nr"><Data ss:Type="Number">${st.revenue}</Data></Cell></Row>
<Row><Cell ss:StyleID="lb"><Data ss:Type="String">Tăng trưởng doanh thu</Data></Cell><Cell><Data ss:Type="String">${esc(fmtPct(st.revenueDeltaPct))}</Data></Cell></Row>
<Row><Cell ss:StyleID="lb"><Data ss:Type="String">Tổng đơn hàng</Data></Cell><Cell ss:StyleID="nr"><Data ss:Type="Number">${st.orderCount}</Data></Cell></Row>
<Row><Cell ss:StyleID="lb"><Data ss:Type="String">Chênh lệch đơn so hôm qua</Data></Cell><Cell><Data ss:Type="String">${st.orderDeltaCount > 0 ? "+" : ""}${st.orderDeltaCount} đơn</Data></Cell></Row>
<Row><Cell ss:StyleID="lb"><Data ss:Type="String">Đơn hoàn thành</Data></Cell><Cell ss:StyleID="nr"><Data ss:Type="Number">${st.doneCount}</Data></Cell></Row>
<Row><Cell ss:StyleID="lb"><Data ss:Type="String">Đơn đã hủy</Data></Cell><Cell ss:StyleID="nr"><Data ss:Type="Number">${st.cancelCount}</Data></Cell></Row>
<Row><Cell ss:StyleID="lb"><Data ss:Type="String">Giá trị đơn TB (VNĐ)</Data></Cell><Cell ss:StyleID="nr"><Data ss:Type="Number">${st.avgOrderValue}</Data></Cell></Row>
<Row><Cell/></Row>
<Row ss:Height="22">
  <Cell ss:StyleID="h"><Data ss:Type="String">Kênh bán hàng</Data></Cell>
  <Cell ss:StyleID="h"><Data ss:Type="String">Số đơn</Data></Cell>
  <Cell ss:StyleID="h"><Data ss:Type="String">Doanh thu (VNĐ)</Data></Cell>
  <Cell ss:StyleID="h"><Data ss:Type="String">TB/đơn (VNĐ)</Data></Cell>
  <Cell ss:StyleID="h"><Data ss:Type="String">Tỉ trọng</Data></Cell>
  <Cell ss:StyleID="h"><Data ss:Type="String">Xu hướng</Data></Cell>
</Row>
${chs.map(ch => `<Row>
  <Cell><Data ss:Type="String">${esc(ch.channelName)}</Data></Cell>
  <Cell ss:StyleID="nr"><Data ss:Type="Number">${ch.orderCount}</Data></Cell>
  <Cell ss:StyleID="nr"><Data ss:Type="Number">${ch.revenue}</Data></Cell>
  <Cell ss:StyleID="nr"><Data ss:Type="Number">${ch.avgOrderValue}</Data></Cell>
  <Cell><Data ss:Type="String">${(ch.ratio * 100).toFixed(1)}%</Data></Cell>
  <Cell><Data ss:Type="String">${trendLabel(ch.trend)}</Data></Cell>
</Row>`).join("")}
<Row ss:Height="20">
  <Cell ss:StyleID="sum"><Data ss:Type="String">Tổng cộng</Data></Cell>
  <Cell ss:StyleID="sum"><Data ss:Type="Number">${chs.reduce((s,c)=>s+c.orderCount,0)}</Data></Cell>
  <Cell ss:StyleID="sum"><Data ss:Type="Number">${chs.reduce((s,c)=>s+c.revenue,0)}</Data></Cell>
  <Cell/><Cell/><Cell/>
</Row>
</Table></Worksheet></Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `bao_cao_ban_hang_da_kenh_${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

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
          <div
            className="button-export"
            onClick={handleExportReport}
            style={{ cursor: "pointer" }}
          >
            <span style={{ fontSize: 14, fontWeight: "500" }}>Xuất báo cáo</span>
          </div>
          <div className="button-connect" onClick={() => setModalConnect(true)}>
            <span style={{ fontSize: 14, fontWeight: "500" }}>Kết nối kênh mới</span>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="list-overview-report">
        {statCards === null ? (
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
          <div
            className="button-export"
            onClick={handleExportAll}
            style={{ cursor: isExporting ? "not-allowed" : "pointer", opacity: isExporting ? 0.7 : 1 }}
          >
            <span style={{ fontSize: 14, fontWeight: "500" }}>
              {isExporting ? "Đang xuất..." : "Xuất tất cả đơn"}
            </span>
          </div>
        </div>

        <div className="table-body">
          {/* Đang load */}
          {channels === null && (
            <div style={{ padding: "2.4rem", display: "flex", justifyContent: "center" }}>
              <Loading />
            </div>
          )}

          {/* Lỗi network */}
          {channels !== null && chError && (
            <div style={{ padding: "2.4rem", textAlign: "center", color: "#ef4444", fontSize: 14 }}>
              Không thể tải dữ liệu kênh. Vui lòng thử lại.
            </div>
          )}

          {/* Không có đơn hôm nay — API trả [] hợp lệ */}
          {channels !== null && !chError && channels.length === 0 && (
            <div style={{ padding: "3rem", textAlign: "center", color: "#939394", fontSize: 14 }}>
              Chưa có đơn hàng từ kênh nào hôm nay.
            </div>
          )}

          {/* Có data thật */}
          {channels !== null && !chError && channels.length > 0 && channels.map((item, index) => {
            const cfg = channelCfg(item.saleflowId);
            const pct = Math.round((item.revenue / maxRevenue) * 100);

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
                        {item.orderCount} đơn · Hôm nay
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
                        backgroundColor: cfg.barColor,
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
          })}
        </div>
      </div>

      <ModalAddChannel
        onShow={modalConnect}
        onHide={() => setModalConnect(false)}
      />
    </div>
  );
}
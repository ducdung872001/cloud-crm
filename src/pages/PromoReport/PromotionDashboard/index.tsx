import React from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";
import "./index.scss";

interface IBarData { m: string; v: number }
const barData: IBarData[] = [
  { m: "T10", v: 95 },
  { m: "T11", v: 112 },
  { m: "T12", v: 185 },
  { m: "T1", v: 140 },
  { m: "T2", v: 165 },
  { m: "T3", v: 210 },
];

const channelData = [
  { ch: "Flash Sale", rev: 95, c: "#f97316" },
  { ch: "Mã giảm giá", rev: 78, c: "#3b82f6" },
  { ch: "Combo", rev: 62, c: "#22c55e" },
  { ch: "Sinh nhật", rev: 45, c: "#a855f7" },
  { ch: "Theo mùa", rev: 28, c: "#f59e0b" },
];

const topPrograms = [
  { n: "Flash Sale cuối tuần", u: 312, r: "95M", roi: "412%" },
  { n: "Tết Nguyên Đán 2026", u: 245, r: "78M", roi: "320%" },
  { n: "Sinh nhật khách hàng", u: 189, r: "45M", roi: "280%" },
];


interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "purple" | "red";
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, color, trend }) => (
  <div className={`promo-stat-card promo-stat-card--${color}`}>
    <div className="promo-stat-card__body">
      <div className="promo-stat-card__content">
        <p className="promo-stat-card__label">{title}</p>
        <p className="promo-stat-card__value">{value}</p>
        {sub && <p className="promo-stat-card__sub">{sub}</p>}
        {trend !== undefined && (
          <p className={`promo-stat-card__trend ${trend >= 0 ? "promo-stat-card__trend--up" : "promo-stat-card__trend--down"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% so với tháng trước
          </p>
        )}
      </div>
      <div className="promo-stat-card__icon">{icon}</div>
    </div>
  </div>
);

const BarMini: React.FC<{ data: IBarData[]; vk: keyof IBarData; lk: keyof IBarData; color?: string; h?: number }> = ({
  data,
  vk,
  lk,
  color = "#f97316",
  h = 150,
}) => {
  const max = Math.max(...data.map((d) => d[vk] as number));
  return (
    <div className="pr-bar-mini" style={{ height: h }}>
      {data.map((d, i) => (
        <div key={i} className="pr-bar-mini__col">
          <div
            className="pr-bar-mini__fill"
            style={{
              height: `${((d[vk] as number) / max) * (h - 28)}px`,
              backgroundColor: color,
            }}
          />
          <span className="pr-bar-mini__label">{d[lk]}</span>
        </div>
      ))}
    </div>
  );
};

export default function PromotionDashboard(props: any) {
  document.title = "Báo cáo khuyến mãi";
  const { onBackProps } = props;

  return (
    <div className="promo-page page-content">
      <HeaderTabMenu
        title="Báo cáo khuyến mãi"
        titleBack="Khuyến mãi"
        onBackProps={onBackProps}
      />

      <div className="promo-stats-grid">
        <StatCard title="Doanh thu từ KM" value="285M" sub="tháng 3/2026" icon={<Icon name="MoneyFill" />} color="green" trend={12} />
        <StatCard title="Đơn áp dụng KM" value="1.245" icon={<Icon name="Cart" />} color="blue" trend={8} />
        <StatCard title="Tỷ lệ chuyển đổi" value="34%" sub="từ KM" icon={<Icon name="Charttable" />} color="orange" />
        <StatCard title="Chi phí KM" value="45M" icon={<Icon name="Expense" />} color="purple" />
      </div>

      <div className="pr-charts-row">
        <div className="pr-card">
          <p className="pr-card__title">Doanh thu từ KM theo tháng (triệu đ)</p>
          <BarMini data={barData} vk="v" lk="m" color="#f97316" h={150} />
        </div>
        <div className="pr-card">
          <p className="pr-card__title">Hiệu quả theo kênh</p>
          <div className="pr-channel-list">
            {channelData.map((it) => (
              <div key={it.ch} className="pr-channel-item">
                <div className="pr-channel-item__text">
                  <span className="pr-channel-item__label">{it.ch}</span>
                  <span className="pr-channel-item__val">{it.rev}M</span>
                </div>
                <div className="pr-channel-item__bar-bg">
                  <div
                    className="pr-channel-item__bar-fill"
                    style={{ width: `${it.rev}%`, backgroundColor: it.c }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pr-card pr-card--table">
        <div className="pr-card__header">
          <p className="pr-card__title">Top chương trình hiệu quả nhất</p>
        </div>
        <div className="pr-table-wrapper">
          <table className="pr-table">
            <thead>
              <tr>
                <th>Chương trình</th>
                <th className="pr-text-right">Lượt dùng</th>
                <th className="pr-text-right">Doanh thu</th>
                <th className="pr-text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {topPrograms.map((r, i) => (
                <tr key={i}>
                  <td>
                    <span className="pr-table__name">{r.n}</span>
                  </td>
                  <td className="pr-text-right">
                    <span className="pr-table__used">{r.u}</span>
                  </td>
                  <td className="pr-text-right">
                    <span className="pr-table__rev">{r.r}</span>
                  </td>
                  <td className="pr-text-right">
                    <span className="pr-table__roi">{r.roi}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

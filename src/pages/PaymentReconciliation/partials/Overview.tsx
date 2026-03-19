import React, { useMemo } from "react";
import Button from "components/button/button";
import { FinanceData, formatVnd, shortMoney } from "../financeTypes";
import "./Common.scss";

type Props = {
  data: FinanceData;
  onOpenCashbook: () => void;
};

const Overview: React.FC<Props> = ({ data, onOpenCashbook }) => {
  const totals = useMemo(() => {
    const totalFunds = data.funds.reduce((a, f) => a + f.balance, 0);
    const totalThu = data.txs.filter((t) => t.type === "thu").reduce((a, t) => a + t.amount, 0);
    const totalChi = data.txs.filter((t) => t.type === "chi").reduce((a, t) => a + t.amount, 0);
    return { totalFunds, totalThu, totalChi };
  }, [data]);

  return (
    <div className="fin-screen">
      <div className="grid4 mb16">
        <div className="stat">
          <div className="stat-lbl">Tổng thu tháng này</div>
          <div className="stat-val c-gr">{formatVnd(totals.totalThu + 196000000)}</div>
          <div className="stat-chg c-gr">↑ 27.2% so với tháng trước</div>
        </div>

        <div className="stat">
          <div className="stat-lbl">Tổng chi tháng này</div>
          <div className="stat-val c-rd">{formatVnd(totals.totalChi + 95000000)}</div>
          <div className="stat-chg c-rd">↑ 5.1% so với tháng trước</div>
        </div>

        <div className="stat">
          <div className="stat-lbl">Lợi nhuận tháng này</div>
          <div className="stat-val c-bl">96.200.000 VND</div>
          <div className="stat-chg c-gr">↑ 18.4% so với tháng trước</div>
        </div>

        <div className="stat">
          <div className="stat-lbl">Tổng tồn quỹ</div>
          <div className="stat-val c-am">{formatVnd(totals.totalFunds)}</div>
          <div className="stat-chg c-t2">{data.funds.length} nguồn tiền hoạt động</div>
        </div>
      </div>

      <div className="grid2 mb16">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Thu chi 6 tháng gần nhất</div>
              <div className="card-sub">Đơn vị: Triệu đồng (M₫)</div>
            </div>
            <Button color="secondary" variant="outline">
              Xuất
            </Button>
          </div>

          <div className="mini-bars">
            {["T10", "T11", "T12", "T1", "T2", "T3"].map((m, i) => {
              const thuD = [185, 210, 290, 165, 195, 248];
              const chiD = [120, 145, 180, 130, 115, 152];
              const mx = 290;
              const bh = (v: number) => Math.round((v / mx) * 100);

              return (
                <div className="col" key={m}>
                  <div className="bars">
                    <div className="b thu" style={{ height: `${bh(thuD[i])}%` }} title={`${thuD[i]}M`} />
                    <div className="b chi" style={{ height: `${bh(chiD[i])}%` }} title={`${chiD[i]}M`} />
                  </div>
                  <div className="m">{m}</div>
                </div>
              );
            })}
          </div>

          <div className="legend">
            <span>
              <i className="dot dot--gr" /> Thu vào
            </span>
            <span>
              <i className="dot dot--rd" /> Chi ra
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Cơ cấu chi phí tháng này</div>

          {[
            { n: "Hàng hóa", v: 42, c: "#00A67E" },
            { n: "Vận hành", v: 18, c: "#1A73E8" },
            { n: "Nhân sự", v: 25, c: "#F59E0B" },
            { n: "Khác", v: 15, c: "#7C3AED" },
          ].map((s) => (
            <div className="progress-row" key={s.n}>
              <div className="l">
                <span className="sw" style={{ background: s.c }} />
                <span>{s.n}</span>
              </div>
              <div className="r">
                <div className="prog">
                  <div className="prog-b" style={{ width: `${s.v}%`, background: s.c }} />
                </div>
                <span className="pct">{s.v}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Nguồn tiền</div>
            <div className="card-strong c-gr">{formatVnd(totals.totalFunds)}</div>
          </div>

          {data.funds.map((f) => (
            <div className="row" key={f.id}>
              <div className="left">
                <div className="chip-ic">{f.icon}</div>
                <div>
                  <div className="nm">{f.name}</div>
                  <div className="meta">{f.type === "cash" ? "Tiền mặt" : f.type === "bank" ? "Ngân hàng" : "Ví điện tử"}</div>
                </div>
              </div>
              <div className="val">{shortMoney(f.balance)}M₫</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Giao dịch gần đây</div>
            <Button color="secondary" variant="outline" onClick={onOpenCashbook}>
              Xem tất cả
            </Button>
          </div>

          {data.txs.slice(0, 5).map((t) => (
            <div className="row" key={t.id}>
              <div className="left">
                <div className={`chip-dir ${t.type}`}>{t.type === "thu" ? "↓" : "↑"}</div>
                <div>
                  <div className="nm">{t.desc}</div>
                  <div className="meta">
                    {t.date} · {t.fund}
                  </div>
                </div>
              </div>
              <div className={`val ${t.type}`}>
                {t.type === "thu" ? "+" : "-"}
                {shortMoney(t.amount)}M
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;

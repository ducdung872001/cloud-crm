import React, { useMemo, useState } from "react";
import Button from "components/button/button";
import { FinanceData, formatVnd } from "../financeTypes";
import "./Common.scss";

type Props = {
  data: FinanceData;
  onAddTx: () => void;
};

const Cashbook: React.FC<Props> = ({ data, onAddTx }) => {
  const [type, setType] = useState<"all" | "thu" | "chi">("all");

  const totals = useMemo(() => {
    const totalThu = data.txs.filter((t) => t.type === "thu").reduce((a, t) => a + t.amount, 0);
    const totalChi = data.txs.filter((t) => t.type === "chi").reduce((a, t) => a + t.amount, 0);
    return { totalThu, totalChi, balance: totalThu - totalChi };
  }, [data]);

  const rows = useMemo(() => {
    if (type === "all") return data.txs;
    return data.txs.filter((t) => t.type === type);
  }, [data, type]);

  const groups = useMemo(() => Array.from(new Set(rows.map((t) => t.grp))), [rows]);

  return (
    <div className="fin-screen">
      <div className="grid3 mb16">
        <div className="pillbox pillbox--gr">
          <div className="pillbox-lbl">Tổng thu</div>
          <div className="pillbox-val">{formatVnd(totals.totalThu)}</div>
        </div>
        <div className="pillbox pillbox--rd">
          <div className="pillbox-lbl">Tổng chi</div>
          <div className="pillbox-val">{formatVnd(totals.totalChi)}</div>
        </div>
        <div className="pillbox pillbox--bl">
          <div className="pillbox-lbl">Số dư thực</div>
          <div className="pillbox-val">{formatVnd(totals.balance)}</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-left">
          <span className="fw">Bộ lọc nhanh</span>
          <select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="all">Tất cả</option>
            <option value="thu">Thu</option>
            <option value="chi">Chi</option>
          </select>
          <select defaultValue="Tháng này">
            <option>Tháng này</option>
            <option>Tuần này</option>
            <option>Hôm nay</option>
          </select>
        </div>

        <div className="filter-right">
          <Button color="primary" onClick={onAddTx}>
            + Tạo giao dịch
          </Button>
          <span className="hint">
            Đã tải {rows.length}/{rows.length} giao dịch
          </span>
        </div>
      </div>

      <div>
        {groups.map((g) => (
          <div key={g}>
            <div className="date-header">{g}</div>
            {rows
              .filter((t) => t.grp === g)
              .map((t) => (
                <div className="tx-item" key={t.id}>
                  <div className="tx-left">
                    <div className="tx-title">{t.desc}</div>
                    <div className="tx-meta">
                      {t.id} | {t.meta.split("|")[0].trim()}
                    </div>
                    <div className="tx-meta">{t.meta.split("|").slice(1).join("|").trim()}</div>
                  </div>

                  <div className="tx-right">
                    <div className="tx-badges">
                      <span className={`badge ${t.type === "thu" ? "bg" : "br"}`}>{t.type === "thu" ? "Thu" : "Chi"}</span>
                      <span className="badge bgr">{t.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}</span>
                    </div>
                    <div className={`tx-amount ${t.type}`}>
                      {t.type === "thu" ? "+ " : "- "}
                      {formatVnd(t.amount)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cashbook;

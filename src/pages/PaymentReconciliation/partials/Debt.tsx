import React, { useMemo, useState } from "react";
import Button from "components/button/button";
import { FinanceData, formatVnd, pct } from "../financeTypes";
import "./Common.scss";

type Props = { data: FinanceData };

const Debt: React.FC<Props> = ({ data }) => {
  const [tab, setTab] = useState<"all" | "receivable" | "payable">("all");

  const rows = useMemo(() => {
    if (tab === "all") return data.debts;
    return data.debts.filter((d) => d.type === tab);
  }, [data, tab]);

  const totalRec = useMemo(() => data.debts.filter((d) => d.type === "receivable").reduce((a, d) => a + (d.amount - d.paid), 0), [data]);
  const totalPay = useMemo(() => data.debts.filter((d) => d.type === "payable").reduce((a, d) => a + (d.amount - d.paid), 0), [data]);
  const overdue = useMemo(() => data.debts.filter((d) => d.status === "overdue").length, [data]);

  const stMap = {
    paid: { label: "Đã TT đủ", cls: "bg" },
    partial: { label: "TT 1 phần", cls: "ba" },
    overdue: { label: "Quá hạn", cls: "br" },
  } as const;

  return (
    <div className="fin-screen">
      {overdue > 0 && <div className="alert alert--danger mb16">Có {overdue} khoản công nợ đã quá hạn thanh toán. Cần liên hệ đối tác ngay!</div>}

      <div className="grid3 mb16">
        <div className="stat">
          <div className="stat-lbl">Phải thu (Khách hàng)</div>
          <div className="stat-val c-gr">{formatVnd(totalRec)}</div>
          <div className="stat-chg c-t2">{data.debts.filter((d) => d.type === "receivable").length} đối tác</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Phải trả (Nhà cung cấp)</div>
          <div className="stat-val c-rd">{formatVnd(totalPay)}</div>
          <div className="stat-chg c-t2">{data.debts.filter((d) => d.type === "payable").length} đối tác</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Quá hạn thanh toán</div>
          <div className="stat-val c-rd">{overdue} khoản</div>
          <div className="stat-chg c-rd">Cần xử lý ngay</div>
        </div>
      </div>

      <div className="card">
        <div className="tabs mb16">
          <button className={`tab${tab === "all" ? " active" : ""}`} onClick={() => setTab("all")}>
            Tất cả ({data.debts.length})
          </button>
          <button className={`tab${tab === "receivable" ? " active" : ""}`} onClick={() => setTab("receivable")}>
            Phải thu ({data.debts.filter((d) => d.type === "receivable").length})
          </button>
          <button className={`tab${tab === "payable" ? " active" : ""}`} onClick={() => setTab("payable")}>
            Phải trả ({data.debts.filter((d) => d.type === "payable").length})
          </button>

          <div className="tabs-right">
            <Button color="primary">+ Tạo giao dịch nợ</Button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Đối tác</th>
                <th className="tr">Tổng nợ</th>
                <th className="tr">Đã TT</th>
                <th className="tr">Còn lại</th>
                <th>Hạn TT</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const rem = d.amount - d.paid;
                return (
                  <tr key={d.id}>
                    <td>
                      <div className="fw">{d.partner}</div>
                      <div className="mt6">
                        <span className={`badge ${d.type === "receivable" ? "bb" : "ba"}`}>{d.type === "receivable" ? "Phải thu" : "Phải trả"}</span>
                      </div>
                    </td>
                    <td className="tr mono fw">{formatVnd(d.amount)}</td>
                    <td className="tr mono c-gr fw">{formatVnd(d.paid)}</td>
                    <td className="tr">
                      <div className={`fw mono ${rem > 0 ? "c-rd" : "c-gr"}`}>{rem > 0 ? formatVnd(rem) : "Đã TT đủ"}</div>
                      {rem > 0 && (
                        <div className="prog mt6" style={{ width: 90, marginLeft: "auto" }}>
                          <div className="prog-b" style={{ width: `${pct(d.paid, d.amount)}%` }} />
                        </div>
                      )}
                    </td>
                    <td className={`${d.status === "overdue" ? "c-rd fw" : "muted"}`}>{d.due}</td>
                    <td>
                      <span className={`badge ${stMap[d.status].cls}`}>{stMap[d.status].label}</span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Debt;

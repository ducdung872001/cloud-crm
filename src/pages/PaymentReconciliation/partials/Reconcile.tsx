import React, { useMemo, useState } from "react";
import Button from "components/button/button";
import { FinanceData, formatVnd } from "../financeTypes";
import "./Common.scss";

type Props = { data: FinanceData };

const Reconcile: React.FC<Props> = ({ data }) => {
  const [running, setRunning] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const matched = useMemo(() => data.bankStmts.filter((b) => b.matched).length, [data]);

  const run = () => {
    setRunning(true);
    setDoneMsg(null);
    setTimeout(() => {
      setRunning(false);
      setDoneMsg(
        `Đối soát hoàn thành! Đã khớp ${matched}/${data.bankStmts.length} giao dịch. ${data.bankStmts.length - matched} cần xử lý thủ công.`
      );
    }, 1200);
  };

  return (
    <div className="fin-screen">
      <div className="banner mb16">
        <div className="banner-left">
          <div className="banner-title">Đối soát tự động với ngân hàng</div>
          <div className="banner-sub">Hệ thống tự động khớp giao dịch ngân hàng với sổ thu chi</div>
        </div>
        <div className="banner-right">
          <select defaultValue="Vietcombank ****1234">
            <option>Vietcombank ****1234</option>
            <option>Techcombank ****5678</option>
          </select>
          <input type="date" defaultValue="2026-03-16" />
          <Button color="primary" onClick={run} disabled={running}>
            {running ? "Đang đối soát..." : "Chạy đối soát"}
          </Button>
        </div>
      </div>

      <div className="grid3 mb16">
        <div className="stat">
          <div className="stat-lbl">Đã khớp tự động</div>
          <div className="stat-val c-gr">
            {matched}/{data.bankStmts.length} GD
          </div>
          <div className="stat-chg c-gr">Tỷ lệ khớp {Math.round((matched / data.bankStmts.length) * 100)}%</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Chưa khớp</div>
          <div className="stat-val c-am">{data.bankStmts.length - matched} GD</div>
          <div className="stat-chg c-t2">Cần xem xét thủ công</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Tổng thu trong kỳ</div>
          <div className="stat-val c-bl">{formatVnd(data.bankStmts.filter((b) => b.type === "thu").reduce((a, b) => a + b.amount, 0))}</div>
          <div className="stat-chg c-t2">{data.bankStmts.filter((b) => b.type === "thu").length} phát sinh</div>
        </div>
      </div>

      {doneMsg && <div className="alert alert--success mb16">{doneMsg}</div>}

      <div className="card mb16">
        <div className="card-title mb12">Bảng đối soát · Vietcombank ****1234 · 16/03/2026</div>

        <div className="table-wrap">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mã tham chiếu</th>
                <th>Nội dung ngân hàng</th>
                <th className="tr">Số tiền</th>
                <th>Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {data.bankStmts.map((b, idx) => (
                <tr key={idx}>
                  <td className="muted">{b.date}</td>
                  <td className="mono blue">{b.ref}</td>
                  <td className="fw">{b.desc}</td>
                  <td className={`tr mono fw ${b.type === "thu" ? "c-gr" : "c-rd"}`}>
                    {b.type === "thu" ? "+ " : "- "}
                    {formatVnd(b.amount)}
                  </td>
                  <td>{b.matched ? <span className="badge bg">Đã khớp</span> : <span className="badge ba">Chưa khớp</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="banner banner--warn">
        <div className="banner-left">
          <div className="banner-title">📱 Thu tiền nhanh bằng QR Pro</div>
          <div className="banner-sub">
            QR động cho từng giao dịch. Khi khách quét & thanh toán, hệ thống tự ghi nhận vào sổ thu chi và đối soát ngân hàng tức thì.
          </div>
        </div>
        <div className="banner-right">
          <Button color="primary">Tạo QR thanh toán</Button>
        </div>
      </div>
    </div>
  );
};

export default Reconcile;

import React, { useMemo, useState } from "react";
import Button from "components/button/button";
import "./index.scss";

type BankStmt = {
  date: string;
  ref: string;
  desc: string;
  amount: number;
  type: "thu" | "chi";
  matched: boolean;
};

const MOCK_BANK_STMTS: BankStmt[] = [
  { date: "16/03", ref: "FT26075123", desc: "TT don hang SO2318", amount: 31200000, type: "thu", matched: true },
  { date: "16/03", ref: "FT26075234", desc: "KH Nguyen Lan chuyen khoan", amount: 8750000, type: "thu", matched: true },
  { date: "15/03", ref: "FT26074345", desc: "CHUYEN TIEN LUONG T3/2026", amount: 28000000, type: "chi", matched: false },
  { date: "15/03", ref: "FT26074456", desc: "VNPAY QR giao dich online", amount: 3500000, type: "thu", matched: true },
  { date: "14/03", ref: "FT26073567", desc: "TT nha cung cap Minh Hoang", amount: 12500000, type: "chi", matched: false },
];

const formatVnd = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + " VND";

const Reconcile: React.FC = () => {
  const [bankAccount, setBankAccount] = useState("Vietcombank ****1234");
  const [date, setDate] = useState("2026-03-16");
  const [running, setRunning] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  const matched = useMemo(() => MOCK_BANK_STMTS.filter((b) => b.matched).length, []);
  const totalThu = useMemo(() => MOCK_BANK_STMTS.filter((b) => b.type === "thu").reduce((a, b) => a + b.amount, 0), []);
  const totalTx = MOCK_BANK_STMTS.length;

  const run = async () => {
    setRunning(true);
    setDoneMsg(null);

    await new Promise((r) => setTimeout(r, 1400));

    setRunning(false);
    setDoneMsg(`Đối soát hoàn thành! Đã khớp ${matched}/${totalTx} giao dịch. ${totalTx - matched} cần xử lý thủ công.`);
  };

  return (
    <div className="reconcile-page">
      <div className="page-header">
        <div>
          <div className="page-title">Đối soát thanh toán</div>
          <div className="page-desc">Tự động khớp giao dịch ngân hàng với sổ thu chi</div>
        </div>
      </div>

      <div className="banner mb16">
        <div className="banner-left">
          <div className="banner-title">Đối soát tự động với ngân hàng</div>
          <div className="banner-sub">Chọn tài khoản và ngày để chạy đối soát. Kết quả hiển thị bên dưới.</div>
        </div>

        <div className="banner-right">
          <select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}>
            <option>Vietcombank ****1234</option>
            <option>Techcombank ****5678</option>
          </select>

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <Button color="primary" onClick={run} disabled={running}>
            {running ? "⟳ Đang đối soát..." : "⟳ Chạy đối soát"}
          </Button>
        </div>
      </div>

      <div className="grid3 mb16">
        <div className="stat">
          <div className="stat-lbl">Đã khớp tự động</div>
          <div className="stat-val c-gr">
            {matched}/{totalTx} GD
          </div>
          <div className="stat-chg c-gr">Tỷ lệ khớp {Math.round((matched / totalTx) * 100)}%</div>
          <div className="stat-bar stat-bar--gr" />
        </div>

        <div className="stat">
          <div className="stat-lbl">Chưa khớp</div>
          <div className="stat-val c-am">{totalTx - matched} GD</div>
          <div className="stat-chg c-t2">Cần xử lý thủ công</div>
          <div className="stat-bar stat-bar--am" />
        </div>

        <div className="stat">
          <div className="stat-lbl">Tổng thu trong kỳ</div>
          <div className="stat-val c-bl">{formatVnd(totalThu)}</div>
          <div className="stat-chg c-t2">{MOCK_BANK_STMTS.filter((b) => b.type === "thu").length} phát sinh</div>
          <div className="stat-bar stat-bar--bl" />
        </div>
      </div>

      {doneMsg && <div className="alert alert--success mb16">{doneMsg}</div>}

      <div className="card mb16">
        <div className="card-title mb12">
          Bảng đối soát · {bankAccount} · {date}
        </div>

        <div className="table-wrap">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mã tham chiếu</th>
                <th>Nội dung ngân hàng</th>
                <th className="tr">Số tiền</th>
                <th>Kết quả</th>
                <th className="hide-m"></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BANK_STMTS.map((b, idx) => (
                <tr key={idx}>
                  <td className="muted">{b.date}</td>
                  <td className="mono blue">{b.ref}</td>
                  <td className="fw">{b.desc}</td>
                  <td className={`tr mono fw ${b.type === "thu" ? "c-gr" : "c-rd"}`}>
                    {b.type === "thu" ? "+ " : "- "}
                    {formatVnd(b.amount)}
                  </td>
                  <td>{b.matched ? <span className="badge bg">Đã khớp</span> : <span className="badge ba">Chưa khớp</span>}</td>
                  <td className="hide-m">
                    {!b.matched ? (
                      <Button color="secondary" variant="outline">
                        Khớp thủ công
                      </Button>
                    ) : null}
                  </td>
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
            QR động cho từng giao dịch. Khi khách quét &amp; thanh toán, hệ thống tự ghi nhận vào sổ thu chi và đối soát ngân hàng tức thì.
          </div>
          <div className="badges">
            <span className="badge bg">VietQR</span>
            <span className="badge bb">Napas 247</span>
            <span className="badge ba">Tức thì</span>
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

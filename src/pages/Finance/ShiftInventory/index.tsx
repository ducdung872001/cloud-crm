import React, { FormEvent, useMemo, useState } from "react";
import Button from "components/button/button";
import { getFinanceFundsMock, getFinanceTransactionsMock } from "../data";
import { FinanceBadge, FinancePageShell, formatCurrency } from "../shared";
import "./index.scss";

export default function FinanceShiftInventory() {
  document.title = "Kiểm kê cuối ca - tài chính";

  const funds = useMemo(() => getFinanceFundsMock(), []);
  const transactions = useMemo(() => getFinanceTransactionsMock(), []);
  const cashFunds = useMemo(() => funds.filter((item) => item.type === "cash"), [funds]);
  const [fundId, setFundId] = useState<string>(cashFunds[0]?.id || "");
  const [actualAmount, setActualAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const selectedFund = useMemo(() => cashFunds.find((item) => item.id === fundId), [cashFunds, fundId]);
  const actualNumber = Number(actualAmount || 0);
  const systemBalance = selectedFund?.balance || 0;
  const difference = actualNumber - systemBalance;

  const shiftSummary = useMemo(() => {
    const fundTransactions = transactions.filter((item) => item.fundId === fundId);

    return fundTransactions.reduce(
      (result, item) => {
        if (item.kind === "income") {
          result.income += item.amount;
        } else {
          result.expense += item.amount;
        }
        result.count += 1;
        return result;
      },
      { income: 0, expense: 0, count: 0 }
    );
  }, [fundId, transactions]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (actualNumber <= 0) {
      setError("Vui lòng nhập số tiền thực tế đếm được.");
      setSubmitted(false);
      return;
    }

    if (difference !== 0 && !reason.trim()) {
      setError("Có chênh lệch nên bắt buộc nhập lý do.");
      setSubmitted(false);
      return;
    }

    setError("");
    setSubmitted(true);
  };

  return (
    <FinancePageShell
      title="Kiểm kê cuối ca"
      subtitle="Đối chiếu số tiền thực tế với số dư trên hệ thống, cảnh báo chênh lệch và hỗ trợ kết ca."
    >
      <div className="finance-grid">
        <div className="finance-grid__span-7">
          <section className="finance-panel">
            <form className="finance-form" onSubmit={handleSubmit}>
              <div className="finance-field">
                <label>Chọn quỹ cần kiểm kê</label>
                <select value={fundId} onChange={(event) => setFundId(event.target.value)}>
                  {cashFunds.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="finance-form__grid">
                <div className="finance-field">
                  <label>Số dư trên hệ thống</label>
                  <input value={formatCurrency(systemBalance)} readOnly={true} />
                </div>
                <div className="finance-field">
                  <label>Số tiền thực tế đếm được</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={actualAmount ? new Intl.NumberFormat("vi-VN").format(Number(actualAmount)) : ""}
                    onChange={(event) => setActualAmount(event.target.value.replace(/\D/g, ""))}
                    placeholder="Nhập số tiền thực tế"
                  />
                </div>
              </div>

              <div className="finance-helper-box">
                <strong>Chênh lệch kiểm kê</strong>
                <div style={{ marginTop: "0.8rem" }}>
                  {difference === 0 ? (
                    <FinanceBadge tone="success">Khớp số dư</FinanceBadge>
                  ) : difference > 0 ? (
                    <FinanceBadge tone="warning">Thừa tiền</FinanceBadge>
                  ) : (
                    <FinanceBadge tone="danger">Thiếu tiền</FinanceBadge>
                  )}
                </div>
                <div style={{ marginTop: "0.8rem", fontWeight: 700 }}>{formatCurrency(Math.abs(difference))}</div>
              </div>

              {difference !== 0 ? (
                <div className="finance-field">
                  <label>Lý do chênh lệch</label>
                  <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Mô tả lý do thừa / thiếu tiền" />
                </div>
              ) : null}

              {error ? <span className="finance-field__error">{error}</span> : null}

              <div className="finance-inline-actions">
                <Button type="submit" color="primary">
                  Hoàn tất kiểm kê & Kết ca
                </Button>
                <Button color="secondary">Xuất báo cáo</Button>
              </div>
            </form>
          </section>
        </div>

        <div className="finance-grid__span-5">
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Tóm tắt ca làm việc</h2>
              <span>Quỹ tiền mặt đã chọn</span>
            </div>
            <div className="finance-summary-list">
              <div className="finance-summary-list__item">
                <span>Tổng thu</span>
                <strong>{formatCurrency(shiftSummary.income)}</strong>
              </div>
              <div className="finance-summary-list__item">
                <span>Tổng chi</span>
                <strong>{formatCurrency(shiftSummary.expense)}</strong>
              </div>
              <div className="finance-summary-list__item">
                <span>Số giao dịch</span>
                <strong>{shiftSummary.count}</strong>
              </div>
              <div className="finance-summary-list__item">
                <span>Lợi nhuận ca</span>
                <strong>{formatCurrency(shiftSummary.income - shiftSummary.expense)}</strong>
              </div>
            </div>

            {submitted ? (
              <div className="finance-helper-box" style={{ marginTop: "1.2rem" }}>
                <strong>Đã hoàn tất kiểm kê</strong>
                <ul>
                  <li>Đã khóa số liệu ca hiện tại để đối chiếu.</li>
                  <li>{difference !== 0 ? "Có thể sinh phiếu điều chỉnh ở bước tiếp theo." : "Số liệu khớp, không cần điều chỉnh."}</li>
                  <li>Đã sẵn sàng xuất báo cáo ca làm việc.</li>
                </ul>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </FinancePageShell>
  );
}

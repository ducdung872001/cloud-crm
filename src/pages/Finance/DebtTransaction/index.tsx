import React, { FormEvent, useMemo, useState } from "react";
import Button from "components/button/button";
import urls from "configs/urls";
import { Link } from "react-router-dom";
import { FinanceDebt, getFinanceDebtsMock } from "../data";
import { FinancePageShell, FinanceStatCard, formatCurrency } from "../shared";
import "./index.scss";

export default function FinanceDebtTransaction() {
  document.title = "Tạo giao dịch nợ";

  const [debts] = useState<FinanceDebt[]>(() => getFinanceDebtsMock().filter((item) => item.status !== "paid"));
  const [selectedDebtId, setSelectedDebtId] = useState<string>(debts[0]?.id || "");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const selectedDebt = useMemo(() => debts.find((item) => item.id === selectedDebtId), [debts, selectedDebtId]);
  const amountNumber = Number(amount || 0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDebt) {
      setError("Vui lòng chọn công nợ.");
      setSubmitted(false);
      return;
    }

    if (amountNumber <= 0) {
      setError("Số tiền phải lớn hơn 0.");
      setSubmitted(false);
      return;
    }

    if (amountNumber > selectedDebt.amount) {
      setError("Số tiền không được lớn hơn dư nợ hiện tại.");
      setSubmitted(false);
      return;
    }

    setError("");
    setSubmitted(true);
  };

  return (
    <FinancePageShell
      title="Tạo giao dịch nợ"
      subtitle="Xử lý thu nợ khách hàng hoặc thanh toán nhà cung cấp, sau đó sinh phiếu và cập nhật quỹ."
    >
      <div className="finance-grid">
        <div className="finance-grid__span-7">
          <section className="finance-panel">
            <form className="finance-form" onSubmit={handleSubmit}>
              <div className="finance-field">
                <label>Khoản công nợ</label>
                <select value={selectedDebtId} onChange={(event) => setSelectedDebtId(event.target.value)}>
                  {debts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.kind === "receivable" ? "Phải thu" : "Phải trả"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="finance-field">
                <label>Hành động</label>
                <input value={selectedDebt?.kind === "receivable" ? "Thu nợ khách hàng" : "Thanh toán nhà cung cấp"} readOnly={true} />
              </div>

              <div className="finance-field">
                <label>Số tiền thanh toán</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount ? new Intl.NumberFormat("vi-VN").format(Number(amount)) : ""}
                  onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
                  placeholder="Nhập số tiền"
                />
              </div>

              <div className="finance-field">
                <label>Ghi chú</label>
                <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú lý do thanh toán hoặc thu nợ" />
              </div>

              {error ? <span className="finance-field__error">{error}</span> : null}

              <div className="finance-inline-actions">
                <Button type="submit" color="primary">
                  Xác nhận giao dịch
                </Button>
                <Link className="finance-link-button" to={urls.finance_management_debt_management}>
                  Quay lại công nợ
                </Link>
              </div>
            </form>
          </section>
        </div>

        <div className="finance-grid__span-5">
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Tóm tắt luồng</h2>
              <span>Công nợ - Thanh toán - Sinh phiếu</span>
            </div>

            {selectedDebt ? (
              <div className="finance-summary-list">
                <div className="finance-summary-list__item">
                  <span>Đối tượng</span>
                  <strong>{selectedDebt.name}</strong>
                </div>
                <div className="finance-summary-list__item">
                  <span>Dư nợ hiện tại</span>
                  <strong>{formatCurrency(selectedDebt.amount)}</strong>
                </div>
                <div className="finance-summary-list__item">
                  <span>Còn lại sau giao dịch</span>
                  <strong>{formatCurrency(Math.max(selectedDebt.amount - amountNumber, 0))}</strong>
                </div>
              </div>
            ) : null}

            {submitted ? (
              <div className="finance-helper-box" style={{ marginTop: "1.2rem" }}>
                <strong>Đã tạo giao dịch nợ thành công</strong>
                <ul>
                  <li>Đã ghi nhận giao dịch thanh toán / thu nợ.</li>
                  <li>Đã sẵn sàng sinh phiếu tương ứng trong sổ thu chi.</li>
                  <li>Đã sẵn sàng cập nhật quỹ và giảm dư nợ.</li>
                </ul>
              </div>
            ) : (
              <div style={{ marginTop: "1.2rem" }}>
                <FinanceStatCard label="Số tiền chuẩn bị ghi nhận" value={formatCurrency(amountNumber)} helper="Điền số tiền để mô phỏng tác động" />
              </div>
            )}
          </section>
        </div>
      </div>
    </FinancePageShell>
  );
}

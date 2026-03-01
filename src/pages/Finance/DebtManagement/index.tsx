import React, { useMemo, useState } from "react";
import Button from "components/button/button";
import urls from "configs/urls";
import { Link } from "react-router-dom";
import financeDebtQrImage from "../shhhh/qr.jpg";
import {
  financeDebtFilterOptions,
  financeDebtPaymentSuccessMessage,
  financeDebtStatusMap,
  FinanceDebt,
  FinanceDebtFilter,
  getFinanceDebtsMock,
} from "../data";
import { FinanceBadge, FinancePageShell, FinanceStatCard, formatCurrency, formatDate } from "../shared";
import "./index.scss";

function cloneDebts() {
  return getFinanceDebtsMock();
}

export default function FinanceDebtManagement() {
  document.title = "Quản lý công nợ";

  const [debtFilter, setDebtFilter] = useState<FinanceDebtFilter>("all");
  const [debts, setDebts] = useState<FinanceDebt[]>(cloneDebts);
  const [selectedDebt, setSelectedDebt] = useState<FinanceDebt | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string>("");

  const filteredDebts = useMemo(() => {
    return debts.filter((item) => {
      if (debtFilter === "all") return item.status !== "paid";
      if (debtFilter === "overdue") return item.status === "overdue";
      return item.kind === debtFilter && item.status !== "paid";
    });
  }, [debtFilter, debts]);

  const summary = useMemo(() => {
    return debts.reduce(
      (result, item) => {
        if (item.status === "paid") {
          return result;
        }

        if (item.kind === "receivable") {
          result.receivable += item.amount;
        } else {
          result.payable += item.amount;
        }

        result.totalCounterparty += 1;
        return result;
      },
      { receivable: 0, payable: 0, totalCounterparty: 0 }
    );
  }, [debts]);

  const markAsPaid = () => {
    if (!selectedDebt) return;

    setDebts((current) =>
      current.map((item) => {
        if (item.id === selectedDebt.id) {
          return { ...item, status: "paid" };
        }
        return item;
      })
    );

    setPaymentMessage(financeDebtPaymentSuccessMessage);
  };

  return (
    <FinancePageShell
      title="Quản lý công nợ"
      subtitle="Theo dõi phải thu, phải trả, trạng thái đến hạn và xử lý QR thu nợ."
      actions={
        <div className="finance-inline-actions">
          <Link className="finance-link-button finance-link-button--primary" to={urls.finance_management_debt_transaction}>
            Tạo giao dịch nợ
          </Link>
        </div>
      }
    >
      <div className="finance-grid">
        <div className="finance-grid__span-4">
          <FinanceStatCard label="Tổng nợ phải thu" value={formatCurrency(summary.receivable)} tone="success" />
        </div>
        <div className="finance-grid__span-4">
          <FinanceStatCard label="Tổng nợ phải trả" value={formatCurrency(summary.payable)} tone="danger" />
        </div>
        <div className="finance-grid__span-4">
          <FinanceStatCard label="Số đối tượng còn nợ" value={String(summary.totalCounterparty)} tone="warning" />
        </div>

        <div className="finance-grid__span-12">
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Bộ lọc công nợ</h2>
              <span>{filteredDebts.length} bản ghi</span>
            </div>

            <div className="finance-filter-row" style={{ marginBottom: "1.2rem" }}>
              {financeDebtFilterOptions.map((option) => (
                <button
                  key={option.value}
                  className={`finance-filter-chip${debtFilter === option.value ? " is-active" : ""}`}
                  onClick={() => setDebtFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <table className="finance-table">
              <thead>
                <tr>
                  <th>Đối tượng</th>
                  <th>Loại công nợ</th>
                  <th>Số nợ</th>
                  <th>Hạn thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredDebts.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.kind === "receivable" ? "Phải thu" : "Phải trả"}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{formatDate(item.dueDate)}</td>
                    <td>
                      <FinanceBadge tone={financeDebtStatusMap[item.status].tone}>{financeDebtStatusMap[item.status].label}</FinanceBadge>
                    </td>
                    <td>
                      <div className="finance-inline-actions">
                        {item.kind === "receivable" ? (
                          <Button
                            color="success"
                            onClick={() => {
                              setSelectedDebt(item);
                              setPaymentMessage("");
                            }}
                          >
                            QR Thu nợ
                          </Button>
                        ) : (
                          <Link className="finance-link-button" to={urls.finance_management_debt_transaction}>
                            Thanh toán
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      {selectedDebt ? (
        <div className="finance-modal">
          <div className="finance-modal__content">
            <div className="finance-panel__title">
              <h3>QR Thu nợ</h3>
              <Button
                color="transparent"
                onClick={() => {
                  setSelectedDebt(null);
                }}
              >
                Đóng
              </Button>
            </div>
            <div className="finance-summary-list">
              <div className="finance-summary-list__item">
                <span>Khách hàng</span>
                <strong>{selectedDebt.name}</strong>
              </div>
              <div className="finance-summary-list__item">
                <span>Số tiền nợ</span>
                <strong>{formatCurrency(selectedDebt.amount)}</strong>
              </div>
            </div>
            <div className="finance-qr-box">
              <strong>QR Thanh toán</strong>
              <img
                src={financeDebtQrImage}
                alt={`QR thu nợ của ${selectedDebt.name}`}
                style={{ width: "100%", maxWidth: "220px", borderRadius: "12px", margin: "0.8rem auto", display: "block" }}
              />
              {/* <span>{selectedDebt.name}</span> */}
              <span>{formatCurrency(selectedDebt.amount)}</span>
            </div>
            <div className="finance-inline-actions">
              <Button color="primary">Chia sẻ mã QR</Button>
              <Button color="success" onClick={markAsPaid}>
                Mô phỏng thanh toán thành công
              </Button>
            </div>
            {paymentMessage ? (
              <p className="finance-muted" style={{ marginTop: "1rem" }}>
                {paymentMessage}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </FinancePageShell>
  );
}

import React, { useMemo } from "react";
import urls from "configs/urls";
import { Link } from "react-router-dom";
import { getFinanceDebtsMock, getFinanceFundsMock, getFinanceTransactionsMock } from "../data";
import { FinanceBadge, FinancePageShell, FinanceStatCard, formatCurrency, formatDateTime } from "../shared";
import "./index.scss";

export default function FinanceDashboard() {
  document.title = "Dashboard tài chính";

  const funds = useMemo(() => getFinanceFundsMock(), []);
  const transactions = useMemo(() => getFinanceTransactionsMock(), []);
  const debts = useMemo(() => getFinanceDebtsMock(), []);

  const summary = useMemo(() => {
    const totalFund = funds.reduce((total, fund) => total + fund.balance, 0);
    const totalIncome = transactions.filter((item) => item.kind === "income").reduce((total, item) => total + item.amount, 0);
    const totalExpense = transactions.filter((item) => item.kind === "expense").reduce((total, item) => total + item.amount, 0);
    const receivable = debts
      .filter((item) => item.kind === "receivable" && item.status !== "paid")
      .reduce((total, item) => total + item.amount, 0);
    const payable = debts
      .filter((item) => item.kind === "payable" && item.status !== "paid")
      .reduce((total, item) => total + item.amount, 0);

    return {
      totalFund,
      totalIncome,
      totalExpense,
      receivable,
      payable,
    };
  }, [debts, funds, transactions]);

  const latestTransactions = transactions.slice(0, 5);
  const debtAlerts = debts.filter((item) => item.status === "overdue" || item.status === "upcoming").slice(0, 4);

  return (
    <FinancePageShell
      title="Dashboard tài chính"
      subtitle="Tổng hợp quỹ, giao dịch gần nhất và công nợ phải thu/phải trả."
      actions={
        <div className="finance-inline-actions">
          <Link className="finance-link-button finance-link-button--primary" to={urls.finance_management_cashbook_template}>
            Tạo phiếu
          </Link>
          <Link className="finance-link-button" to={urls.finance_management_cashbook}>
            Xem sổ thu chi
          </Link>
        </div>
      }
    >
      <div className="finance-grid">
        <div className="finance-grid__span-3">
          <FinanceStatCard label="Tổng quỹ hiện tại" value={formatCurrency(summary.totalFund)} helper="Tổng số dư toàn hệ thống" tone="success" />
        </div>
        <div className="finance-grid__span-3">
          <FinanceStatCard label="Tổng thu" value={formatCurrency(summary.totalIncome)} helper="Tổng từ các phiếu thu" tone="success" />
        </div>
        <div className="finance-grid__span-3">
          <FinanceStatCard label="Tổng chi" value={formatCurrency(summary.totalExpense)} helper="Trừ từ các phiếu chi" tone="danger" />
        </div>
        <div className="finance-grid__span-3">
          <FinanceStatCard
            label="Công nợ mở"
            value={formatCurrency(summary.receivable + summary.payable)}
            helper={`Phải thu ${formatCurrency(summary.receivable)} | Phải trả ${formatCurrency(summary.payable)}`}
            tone="warning"
          />
        </div>

        <div className="finance-grid__span-7">
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Giao dịch gần nhất</h2>
              <Link className="finance-link-button" to={urls.finance_management_cashbook}>
                Xem toàn bộ sổ thu chi
              </Link>
            </div>
            <div className="finance-list">
              {latestTransactions.map((item) => (
                <div key={item.id} className="finance-list__item">
                  <div>
                    <strong>{item.title}</strong>
                    <div className="finance-list__meta">{formatDateTime(item.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <FinanceBadge tone={item.kind === "income" ? "success" : "danger"}>{item.kind === "income" ? "Thu tiền" : "Chi tiền"}</FinanceBadge>
                    <div className={item.kind === "income" ? "finance-amount--income" : "finance-amount--expense"} style={{ marginTop: "0.6rem", fontWeight: 700 }}>
                      {item.kind === "income" ? "+" : "-"} {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="finance-grid__span-5">
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Cảnh báo công nợ</h2>
              <Link className="finance-link-button" to={urls.finance_management_debt_management}>
                Quản lý công nợ
              </Link>
            </div>
            <div className="finance-summary-list">
              {debtAlerts.map((item) => (
                <div key={item.id} className="finance-summary-list__item">
                  <div>
                    <strong>{item.name}</strong>
                    <div className="finance-muted">{item.kind === "receivable" ? "Phải thu" : "Phải trả"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <FinanceBadge tone={item.status === "overdue" ? "danger" : "warning"}>
                      {item.status === "overdue" ? "Quá hạn" : "Sắp đến hạn"}
                    </FinanceBadge>
                    <div style={{ marginTop: "0.6rem", fontWeight: 700 }}>{formatCurrency(item.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* <div className="finance-grid__span-12">
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Luong nghiep vu dang ap dung</h2>
              <span>Moi dong tien deu di qua phieu giao dich theo FinRetail</span>
            </div>
            <div className="finance-grid">
              <div className="finance-grid__span-4">
                <div className="finance-helper-box">
                  <strong>1. Tao phieu</strong>
                  <ul>
                    <li>Thu tien hoac chi tien</li>
                    <li>Chon hang muc, quy, so tien</li>
                    <li>Luu phieu de phat sinh giao dich</li>
                  </ul>
                </div>
              </div>
              <div className="finance-grid__span-4">
                <div className="finance-helper-box">
                  <strong>2. Cap nhat quy va cong no</strong>
                  <ul>
                    <li>Thu thi cong quy, chi thi tru quy</li>
                    <li>Neu co doi tuong lien quan thi cap nhat cong no</li>
                    <li>Khong cho so du am neu khong cau hinh cho phep</li>
                  </ul>
                </div>
              </div>
              <div className="finance-grid__span-4">
                <div className="finance-helper-box">
                  <strong>3. Tong hop dashboard</strong>
                  <ul>
                    <li>Cap nhat tong quy</li>
                    <li>Cap nhat giao dich gan nhat</li>
                    <li>Cap nhat phai thu va phai tra</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div> */}
      </div>
    </FinancePageShell>
  );
}

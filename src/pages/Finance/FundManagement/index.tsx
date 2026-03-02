import React, { useMemo, useState } from "react";
import Button from "components/button/button";
import {
  financeFundQuickFacts,
  financeFundTypeLabels,
  getFinanceFundsMock,
  getFinanceTransactionsMock,
} from "../data";
import { FinancePageShell, FinanceStatCard, formatCurrency, formatDateTime } from "../shared";
import "./index.scss";

export default function FinanceFundManagement() {
  document.title = "Quản lý quỹ";

  const funds = useMemo(() => getFinanceFundsMock(), []);
  const transactions = useMemo(() => getFinanceTransactionsMock(), []);
  const totalFunds = useMemo(() => funds.reduce((total, item) => total + item.balance, 0), [funds]);
  const [selectedFundId, setSelectedFundId] = useState<string>(funds[0]?.id || "");
  const selectedFund = useMemo(() => funds.find((item) => item.id === selectedFundId) || null, [funds, selectedFundId]);

  const selectedFundTransactionCount = useMemo(() => {
    if (!selectedFund) {
      return 0;
    }

    return transactions.filter((item) => item.fundId === selectedFund.id).length;
  }, [selectedFund, transactions]);

  const selectedFundLatestTransaction = useMemo(() => {
    if (!selectedFund) {
      return null;
    }

    return transactions.find((item) => item.fundId === selectedFund.id) || null;
  }, [selectedFund, transactions]);

  return (
    <FinancePageShell
      title="Quản lý quỹ"
      subtitle="Theo dõi danh sách quỹ hiện có, số dư hiện tại và lịch sử giao dịch liên quan."
      actions={
        <div className="finance-inline-actions">
          <Button color="primary">+ Thêm quỹ mới</Button>
        </div>
      }
    >
      <div className="finance-grid">
        <div className="finance-grid__span-12">
          <FinanceStatCard label="Tổng quỹ toàn hệ thống" value={formatCurrency(totalFunds)} helper={`${funds.length} quỹ đang hoạt động`} tone="success" />
        </div>

        <div className={selectedFund ? "finance-grid__span-8" : "finance-grid__span-12"}>
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Danh sách quỹ</h2>
              <span>Nhấn vào từng quỹ để xem chi tiết</span>
            </div>

            <div className="finance-fund-list">
              <div className="finance-list">
                {funds.map((fund) => {
                  const isSelected = selectedFundId === fund.id;

                  return (
                    <button
                      key={fund.id}
                      type="button"
                      className={`finance-list__item finance-fund-list__item${isSelected ? " is-selected" : ""}`}
                      onClick={() => setSelectedFundId(fund.id)}
                    >
                      <div className="finance-fund-list__primary">
                        <strong>{fund.name}</strong>
                      </div>
                      <div className="finance-fund-list__secondary">
                        <div className="finance-fund-list__amount">{formatCurrency(fund.balance)}</div>
                        <div className="finance-list__meta">{formatDateTime(fund.updatedAt)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {selectedFund ? (
          <div className="finance-grid__span-4">
            <section className="finance-panel">
              <div className="finance-panel__title">
                <h2>Chi tiết quỹ</h2>
                <Button color="transparent" onClick={() => setSelectedFundId("")}>
                  Đóng
                </Button>
              </div>

              <div className="finance-summary-list">
                <div className="finance-summary-list__item">
                  <span>Tên quỹ</span>
                  <strong>{selectedFund.name}</strong>
                </div>
                <div className="finance-summary-list__item">
                  <span>Số dư hiện tại</span>
                  <strong>{formatCurrency(selectedFund.balance)}</strong>
                </div>
                <div className="finance-summary-list__item">
                  <span>Cập nhật gần nhất</span>
                  <strong>{formatDateTime(selectedFund.updatedAt)}</strong>
                </div>
                <div className="finance-summary-list__item">
                  <span>Loại quỹ</span>
                  <strong>{financeFundTypeLabels[selectedFund.type]}</strong>
                </div>
                <div className="finance-summary-list__item">
                  <span>Số giao dịch liên kết</span>
                  <strong>{selectedFundTransactionCount}</strong>
                </div>
                <div className="finance-summary-list__item">
                  <span>Giao dịch gần nhất</span>
                  <strong>{selectedFundLatestTransaction ? selectedFundLatestTransaction.title : "Chưa có giao dịch"}</strong>
                </div>
              </div>

              <div className="finance-helper-box" style={{ marginTop: "1rem" }}>
                <strong>Thông tin nhanh</strong>
                <ul>
                  {financeFundQuickFacts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              </div>

              <div className="finance-inline-actions" style={{ marginTop: "1rem" }}>
                <Button color="secondary">Chỉnh sửa quỹ</Button>
                <Button color="transparent">Xem lịch sử</Button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </FinancePageShell>
  );
}

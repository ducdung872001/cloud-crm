import React, { FormEvent, useMemo, useState } from "react";
import Button from "components/button/button";
import {
  FinanceFund,
  financeFundQuickFacts,
  financeFundTypeLabels,
  getFinanceFundsMock,
  getFinanceTransactionsMock,
} from "../data";
import {
  FinanceLoadMoreIndicator,
  FinancePageShell,
  FinanceStatCard,
  formatCurrency,
  formatDateTime,
  useFinanceProgressiveList,
} from "../shared";
import "./index.scss";

export default function FinanceFundManagement() {
  document.title = "Quản lý quỹ";

  const [funds, setFunds] = useState<FinanceFund[]>(() => getFinanceFundsMock());
  const transactions = useMemo(() => getFinanceTransactionsMock(), []);
  const totalFunds = useMemo(() => funds.reduce((total, item) => total + item.balance, 0), [funds]);
  const [isCreatingFund, setIsCreatingFund] = useState<boolean>(false);
  const [selectedFundId, setSelectedFundId] = useState<string>(funds[0]?.id || "");
  const [formError, setFormError] = useState<string>("");
  const [fundForm, setFundForm] = useState<{
    name: string;
    type: FinanceFund["type"];
    openingBalance: string;
  }>({
    name: "",
    type: "cash",
    openingBalance: "",
  });
  const selectedFund = useMemo(() => funds.find((item) => item.id === selectedFundId) || null, [funds, selectedFundId]);
  const {
    visibleItems: visibleFunds,
    isLoading: isMainListLoading,
    hasMore: hasMoreMainFunds,
    handleScroll: handleMainFundScroll,
  } = useFinanceProgressiveList(funds, 10);
  const {
    visibleItems: visibleCreateFunds,
    isLoading: isCreateListLoading,
    hasMore: hasMoreCreateFunds,
    handleScroll: handleCreateFundScroll,
  } = useFinanceProgressiveList(funds, 10);

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

  const resetFundForm = () => {
    setFundForm({
      name: "",
      type: "cash",
      openingBalance: "",
    });
    setFormError("");
  };

  const handleOpenCreateFund = () => {
    setIsCreatingFund(true);
    resetFundForm();
  };

  const handleCancelCreateFund = () => {
    setIsCreatingFund(false);
    resetFundForm();
  };

  const handleSaveFund = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const openingBalance = Number(fundForm.openingBalance || 0);

    if (!fundForm.name.trim()) {
      setFormError("Vui lòng nhập tên quỹ.");
      return;
    }

    if (openingBalance < 0) {
      setFormError("Số dư ban đầu không hợp lệ.");
      return;
    }

    const createdFund: FinanceFund = {
      id: `fund_${Date.now()}`,
      name: fundForm.name.trim(),
      type: fundForm.type,
      balance: openingBalance,
      updatedAt: "2026-03-01T12:00:00",
    };

    setFunds((current) => [createdFund, ...current]);
    setSelectedFundId(createdFund.id);
    setIsCreatingFund(false);
    resetFundForm();
  };

  return (
    <FinancePageShell
      title="Quản lý quỹ"
      // subtitle="Theo dõi danh sách quỹ hiện có, số dư hiện tại và lịch sử giao dịch liên quan."
      actions={
        <div className="finance-inline-actions">
          <Button color="primary" onClick={handleOpenCreateFund}>
            Thêm quỹ mới
          </Button>
        </div>
      }
    >
      {isCreatingFund ? (
        <div className="finance-grid">
          <div className="finance-grid__span-5">
            <section className="finance-panel">
              <div className="finance-panel__title">
                <h2>Thiết lập quỹ mới</h2>
                <span>Tạo thêm quỹ để dùng cho thu chi và đối soát</span>
              </div>

              <form className="finance-form" onSubmit={handleSaveFund}>
                <div className="finance-field">
                  <label>Tên quỹ</label>
                  <input
                    type="text"
                    value={fundForm.name}
                    onChange={(event) => setFundForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Nhập tên quỹ"
                  />
                </div>

                <div className="finance-field">
                  <label>Loại quỹ</label>
                  <select
                    value={fundForm.type}
                    onChange={(event) =>
                      setFundForm((current) => ({
                        ...current,
                        type: event.target.value as FinanceFund["type"],
                      }))
                    }
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="bank">Tiền gửi ngân hàng</option>
                  </select>
                </div>

                <div className="finance-field">
                  <label>Số dư ban đầu</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={fundForm.openingBalance ? new Intl.NumberFormat("vi-VN").format(Number(fundForm.openingBalance)) : ""}
                    onChange={(event) =>
                      setFundForm((current) => ({
                        ...current,
                        openingBalance: event.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="Nhập số dư ban đầu"
                  />
                </div>

                {formError ? <span className="finance-field__error">{formError}</span> : null}

                <div className="finance-inline-actions">
                  <Button type="submit" color="primary">
                    Lưu quỹ
                  </Button>
                  <Button color="transparent" type="button" onClick={handleCancelCreateFund}>
                    Hủy
                  </Button>
                </div>
              </form>
            </section>
          </div>

          <div className="finance-grid__span-7">
            <section className="finance-panel">
              <div className="finance-panel__title">
                <h2>Danh sách quỹ đã có</h2>
                <span>{funds.length} quỹ hiện có</span>
              </div>

              <div className="finance-fund-list" onScroll={handleCreateFundScroll}>
                <div className="finance-list">
                  {visibleCreateFunds.map((fund) => (
                    <div key={fund.id} className="finance-list__item finance-fund-list__item is-static">
                      <div className="finance-fund-list__primary">
                        <strong>{fund.name}</strong>
                      </div>
                      <div className="finance-fund-list__secondary">
                        <div className="finance-fund-list__amount">{formatCurrency(fund.balance)}</div>
                        <div className="finance-list__meta">{formatDateTime(fund.updatedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <FinanceLoadMoreIndicator loading={isCreateListLoading} hasMore={hasMoreCreateFunds} />
              </div>
            </section>

            <div className="finance-fund-summary">
              <FinanceStatCard label="Tổng quỹ toàn hệ thống" value={formatCurrency(totalFunds)} helper={`${funds.length} quỹ đang hoạt động`} tone="success" />
            </div>
          </div>
        </div>
      ) : (
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

              <div className="finance-fund-list" onScroll={handleMainFundScroll}>
                <div className="finance-list">
                  {visibleFunds.map((fund) => {
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
                <FinanceLoadMoreIndicator loading={isMainListLoading} hasMore={hasMoreMainFunds} />
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

                <div className="finance-helper-box finance-fund-panel-spacing">
                  <strong>Thông tin nhanh</strong>
                  <ul>
                    {financeFundQuickFacts.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                </div>

                <div className="finance-inline-actions finance-fund-panel-spacing">
                  <Button color="secondary">Chỉnh sửa quỹ</Button>
                  <Button color="transparent">Xem lịch sử</Button>
                </div>
              </section>
            </div>
          ) : null}
        </div>
      )}
    </FinancePageShell>
  );
}

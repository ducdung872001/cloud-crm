import React, { useMemo, useState } from "react";
import {
  financeApprovalStatusMap,
  financeCashBookKindOptions,
  financeCashBookPeriodOptions,
  FinanceCashBookKindFilter,
  FinanceCashBookPeriodFilter,
  getFinanceCashBookMock,
} from "../data";
import {
  FinanceBadge,
  FinanceEmptyState,
  FinanceLoadMoreIndicator,
  FinancePageShell,
  FinanceStatCard,
  formatCurrency,
  formatDate,
  useFinanceProgressiveList,
} from "../shared";
import "./index.scss";

export default function FinanceCashBook() {
  document.title = "Sổ thu chi";

  const cashBookMock = useMemo(() => getFinanceCashBookMock(), []);
  const funds = cashBookMock.filters.funds;
  const transactions = cashBookMock.records;

  const [kindFilter, setKindFilter] = useState<FinanceCashBookKindFilter>("all");
  const [fundFilter, setFundFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<FinanceCashBookPeriodFilter>("this_month");

  const filteredTransactions = useMemo(() => {
    const today = new Date("2026-03-01T12:00:00");

    return transactions.filter((item) => {
      const matchedKind = kindFilter === "all" ? true : item.kind === kindFilter;
      const matchedFund = fundFilter === "all" ? true : item.fundId === fundFilter;
      const itemDate = new Date(item.createdAt);
      const matchedMonth =
        monthFilter === "all"
          ? true
          : itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();

      return matchedKind && matchedFund && matchedMonth;
    });
  }, [fundFilter, kindFilter, monthFilter, transactions]);

  const {
    visibleItems: visibleTransactions,
    visibleCount,
    isLoading,
    hasMore,
    handleScroll,
  } = useFinanceProgressiveList(filteredTransactions, 10);

  const groupedTransactions = useMemo(() => {
    return visibleTransactions.reduce((groups, item) => {
      const key = item.createdAt.slice(0, 10);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, typeof visibleTransactions>);
  }, [visibleTransactions]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (result, item) => {
        if (item.kind === "income") {
          result.income += item.amount;
        } else {
          result.expense += item.amount;
        }
        return result;
      },
      { income: 0, expense: 0 }
    );
  }, [filteredTransactions]);

  const hasCustomFilter = kindFilter !== "all" || monthFilter !== "this_month" || fundFilter !== "all";

  const resetFilters = () => {
    setKindFilter("all");
    setMonthFilter("this_month");
    setFundFilter("all");
  };

  return (
    <FinancePageShell title="Sổ thu chi"
    // subtitle="Hiển thị toàn bộ giao dịch đã tạo, group theo ngày và lọc nhanh theo nhu cầu."
    >
      <div className="finance-grid">
        <div className="finance-grid__span-4">
          <FinanceStatCard label="Tổng thu" value={formatCurrency(totals.income)} tone="success" />
        </div>
        <div className="finance-grid__span-4">
          <FinanceStatCard label="Tổng chi" value={formatCurrency(totals.expense)} tone="danger" />
        </div>
        <div className="finance-grid__span-4">
          <FinanceStatCard label="Số dư thực" value={formatCurrency(totals.income - totals.expense)} tone="warning" />
        </div>

        <div className="finance-grid__span-12">
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Bộ lọc nhanh</h2>
              <span>
                Đã tải {visibleTransactions.length}/{filteredTransactions.length} giao dịch
              </span>
            </div>

            <div className="finance-filter-toolbar">
              <div className="finance-filter-toolbar__group">
                <select
                  value={kindFilter}
                  onChange={(event) => setKindFilter(event.target.value as FinanceCashBookKindFilter)}
                  className="finance-filter-select finance-filter-select--compact"
                  aria-label="Lọc theo loại giao dịch"
                >
                  {financeCashBookKindOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="finance-filter-toolbar__group">
                <select
                  value={monthFilter}
                  onChange={(event) => setMonthFilter(event.target.value as FinanceCashBookPeriodFilter)}
                  className="finance-filter-select finance-filter-select--compact"
                  aria-label="Lọc theo thời gian"
                >
                  {financeCashBookPeriodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="finance-filter-toolbar__group">
                <select
                  value={fundFilter}
                  onChange={(event) => setFundFilter(event.target.value)}
                  className="finance-filter-select finance-filter-select--wide"
                  aria-label="Lọc theo quỹ"
                >
                  <option value="all">Tất cả quỹ</option>
                  {funds.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.name}
                    </option>
                  ))}
                </select>
              </div>

              {hasCustomFilter ? (
                <div className="finance-filter-toolbar__group finance-filter-toolbar__group--end">
                  <button className="finance-filter-reset" onClick={resetFilters}>
                    Đặt lại
                  </button>
                </div>
              ) : null}
            </div>

            <div className="finance-scroll-panel" onScroll={handleScroll}>
              {visibleTransactions.length === 0 ? (
                <FinanceEmptyState title="Chưa có giao dịch phù hợp" description="Hãy thay đổi bộ lọc hoặc tạo thêm phiếu thu/chi." />
              ) : (
                <>
                  {Object.keys(groupedTransactions).map((dateKey) => (
                    <div key={dateKey} className="finance-date-group">
                      <span className="finance-date-group__label">{formatDate(dateKey)}</span>
                      <div className="finance-list">
                        {groupedTransactions[dateKey].map((item) => {
                          const fund = funds.find((fundItem) => fundItem.id === item.fundId);

                          return (
                            <div key={item.id} className="finance-list__item">
                              <div>
                                <strong>{item.title}</strong>
                                <div className="finance-list__meta">
                                  {item.code} | {fund?.name || "Không xác định quỹ"}
                                </div>
                                <div className="finance-list__meta">
                                  {item.branchName} | {item.createdBy}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div className="finance-inline-actions" style={{ justifyContent: "flex-end", gap: "0.5rem" }}>
                                  <FinanceBadge tone={item.kind === "income" ? "success" : "danger"}>{item.kind === "income" ? "Thu" : "Chi"}</FinanceBadge>
                                  <FinanceBadge tone={financeApprovalStatusMap[item.approvalStatus].tone}>
                                    {financeApprovalStatusMap[item.approvalStatus].label}
                                  </FinanceBadge>
                                </div>
                                <div className={item.kind === "income" ? "finance-amount--income" : "finance-amount--expense"} style={{ marginTop: "0.5rem" }}>
                                  {item.kind === "income" ? "+" : "-"} {formatCurrency(item.amount)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <FinanceLoadMoreIndicator loading={isLoading} hasMore={hasMore} />
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </FinancePageShell>
  );
}

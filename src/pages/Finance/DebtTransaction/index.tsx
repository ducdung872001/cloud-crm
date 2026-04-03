import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "components/button/button";
import urls from "configs/urls";
import { Link, useNavigate } from "react-router-dom";
import { financeDebtTransactionTypeOptions, FinanceDebt, FinanceDebtTransactionType, getFinanceDebtsMock } from "../data";
import { FinancePageShell, FinanceStatCard, formatCurrency } from "../shared";
import "./index.scss";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import DebtManagementService, { IDebtItem } from "@/services/DebtManagementService";
import { showToast } from "utils/common";

function mapApiToFinanceDebt(item: IDebtItem): FinanceDebt {
  return {
    id: String(item.id),
    name: item.name,
    kind: item.kind,
    amount: item.amount,
    dueDate: item.dueDate,
    daysRemaining: item.daysRemaining,
    status: item.status,
  };
}

export default function FinanceDebtTransaction(props) {
  const { t } = useTranslation();
  document.title = t("pageFinance.createTransaction");

  const navigate = useNavigate();
  const [debts, setDebts] = useState<FinanceDebt[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(true);

  const fetchDebts = useCallback(async () => {
    setLoadingDebts(true);
    try {
      const res = await DebtManagementService.list({ size: 200 });
      const activeDebts = (res.items ?? [])
        .filter((item) => item.status !== "paid")
        .map(mapApiToFinanceDebt);
      setDebts(activeDebts);
    } catch {
      // Fallback to mock if API fails
      setDebts(getFinanceDebtsMock().filter((item) => item.status !== "paid"));
    } finally {
      setLoadingDebts(false);
    }
  }, []);

  useEffect(() => { fetchDebts(); }, [fetchDebts]);
  const [debtTransactionType, setDebtTransactionType] = useState<FinanceDebtTransactionType>("collect_debt");
  const [selectedDebtId, setSelectedDebtId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [reminderDate, setReminderDate] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const filteredDebts = useMemo(() => {
    const targetKind = debtTransactionType === "collect_debt" ? "receivable" : "payable";

    return debts.filter((item) => item.kind === targetKind);
  }, [debtTransactionType, debts]);

  const selectedDebt = useMemo(() => filteredDebts.find((item) => item.id === selectedDebtId) || null, [filteredDebts, selectedDebtId]);
  const amountNumber = Number(amount || 0);

  useEffect(() => {
    if (!filteredDebts.length) {
      setSelectedDebtId("");
      return;
    }

    if (!filteredDebts.find((item) => item.id === selectedDebtId)) {
      setSelectedDebtId(filteredDebts[0].id);
    }
  }, [filteredDebts, selectedDebtId]);

  useEffect(() => {
    if (selectedDebt) {
      setDueDate(selectedDebt.dueDate);
      setReminderDate(selectedDebt.dueDate);
    } else {
      setDueDate("");
      setReminderDate("");
    }
  }, [selectedDebt]);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDebt) {
      setError(t("pageFinance.selectDebtRequired"));
      setSubmitted(false);
      return;
    }

    if (amountNumber <= 0) {
      setError(t("pageFinance.amountMustBePositive"));
      setSubmitted(false);
      return;
    }

    if (!dueDate) {
      setError(t("pageFinance.dueDateRequired"));
      setSubmitted(false);
      return;
    }

    if (!reminderDate) {
      setError(t("pageFinance.reminderRequired"));
      setSubmitted(false);
      return;
    }

    if (amountNumber > selectedDebt.amount) {
      setError(t("pageFinance.amountExceedsDebt"));
      setSubmitted(false);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await DebtManagementService.pay({
        debtId: Number(selectedDebt.id),
        amount: amountNumber,
        fundId: 0,
        note: note || undefined,
      });
      setSubmitted(true);
      showToast(t("pageFinance.transactionSuccess"), "success");
    } catch (e: any) {
      setError(e?.message ?? "Tạo giao dịch thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <HeaderTabMenu
        title={t("pageFinance.createTransaction")}
        titleBack={t("pageFinance.debtManagement")}
        callBack={() => {
          navigate(`${urls.finance_management_debt_management}`);
        }}
      />
      <div style={{marginTop: '2rem'}}>
        <FinancePageShell
          title={t("pageFinance.createTransaction")}
          // subtitle="Xử lý thu nợ khách hàng hoặc thanh toán nhà cung cấp, sau đó sinh phiếu và cập nhật quỹ."
        >
          <div className="finance-grid">
            <div className="finance-grid__span-7">
              <section className="finance-panel">
                <form className="finance-form" onSubmit={handleSubmit}>
                  <div className="finance-form__grid">
                    <div className="finance-field">
                      <label>{t("pageFinance.debtType")}</label>
                      <select
                        value={debtTransactionType}
                        onChange={(event) => {
                          setDebtTransactionType(event.target.value as FinanceDebtTransactionType);
                          setSubmitted(false);
                          setError("");
                        }}
                      >
                        {financeDebtTransactionTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.value === "collect_debt" ? t("pageFinance.collectDebt") : t("pageFinance.payDebt")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="finance-field">
                      <label>{t("pageFinance.debtItem")}</label>
                      <select value={selectedDebtId} onChange={(event) => setSelectedDebtId(event.target.value)}>
                        {filteredDebts.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="finance-field">
                    <label>{t("pageFinance.paymentAmount")}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amount ? new Intl.NumberFormat("vi-VN").format(Number(amount)) : ""}
                      onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
                      placeholder={t("pageFinance.paymentAmountPlaceholder")}
                    />
                  </div>

                  <div className="finance-form__grid">
                    <div className="finance-field">
                      <label>{t("pageFinance.dueDate")}</label>
                      <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
                    </div>

                    <div className="finance-field">
                      <label>{t("pageFinance.reminderDate")}</label>
                      <input type="date" value={reminderDate} onChange={(event) => setReminderDate(event.target.value)} />
                    </div>
                  </div>

                  <div className="finance-field">
                    <label>{t("pageFinance.transactionNote")}</label>
                    <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={t("pageFinance.transactionNotePlaceholder")} />
                  </div>

                  {error ? <span className="finance-field__error">{error}</span> : null}

                  <div className="finance-inline-actions">
                    <Button type="submit" color="primary" disabled={submitting}>
                      {submitting ? t("common.processing") : t("pageFinance.confirmTransaction")}
                    </Button>
                    <Link className="finance-link-button" to={urls.finance_management_debt_management}>
                      {t("pageFinance.backToDebt")}
                    </Link>
                  </div>
                </form>
              </section>
            </div>

            <div className="finance-grid__span-5">
              <section className="finance-panel">
                <div className="finance-panel__title">
                  <h2>{t("pageFinance.info")}</h2>
                  {/* <span>Công nợ - Thanh toán - Sinh phiếu</span> */}
                </div>

                {selectedDebt ? (
                  <div className="finance-summary-list">
                    <div className="finance-summary-list__item">
                      <span>{t("pageFinance.infoCounterparty")}</span>
                      <strong>{selectedDebt.name}</strong>
                    </div>
                    <div className="finance-summary-list__item">
                      <span>{t("pageFinance.infoDebtType")}</span>
                      <strong>{debtTransactionType === "collect_debt" ? t("pageFinance.collectDebt") : t("pageFinance.payDebt")}</strong>
                    </div>
                    <div className="finance-summary-list__item">
                      <span>{t("pageFinance.infoCurrentDebt")}</span>
                      <strong>{formatCurrency(selectedDebt.amount)}</strong>
                    </div>
                    <div className="finance-summary-list__item">
                      <span>{t("pageFinance.infoDueDate")}</span>
                      <strong>{dueDate || "—"}</strong>
                    </div>
                    <div className="finance-summary-list__item">
                      <span>{t("pageFinance.infoReminder")}</span>
                      <strong>{reminderDate || "—"}</strong>
                    </div>
                    <div className="finance-summary-list__item">
                      <span>{t("pageFinance.infoRemainingAfter")}</span>
                      <strong>{formatCurrency(Math.max(selectedDebt.amount - amountNumber, 0))}</strong>
                    </div>
                  </div>
                ) : null}

                {submitted ? (
                  <div className="finance-helper-box" style={{ marginTop: "1.2rem" }}>
                    <strong>{t("pageFinance.transactionSuccess")}</strong>
                    {/* <ul>
                      <li>Đã ghi nhận giao dịch thanh toán / thu nợ.</li>
                      <li>Đã sẵn sàng sinh phiếu tương ứng trong sổ thu chi.</li>
                      <li>Đã sẵn sàng cập nhật quỹ và giảm dư nợ.</li>
                    </ul> */}
                  </div>
                ) : (
                  <div style={{ marginTop: "1.2rem" }}>
                    <FinanceStatCard label={t("pageFinance.infoRecordedAmount")} value={formatCurrency(amountNumber)}/>
                  </div>
                )}
              </section>
            </div>
          </div>
        </FinancePageShell>
      </div>
    </div>
  );
}

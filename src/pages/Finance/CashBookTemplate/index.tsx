import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Button from "components/button/button";
import urls from "configs/urls";
import { Link } from "react-router-dom";
import { getFinanceCategoriesByKind, getFinanceFundsMock } from "../data";
import { FinanceBadge, FinancePageShell, FinanceStatCard, formatCurrency } from "../shared";
import "./index.scss";

type TransactionKind = "income" | "expense";

interface FormState {
  kind: TransactionKind;
  categoryId: string;
  fundId: string;
  amount: string;
  note: string;
  relatedEntity: string;
  attachments: string[];
}

export default function FinanceCashBookTemplate() {
  document.title = "Tạo phiếu thu/chi";

  const funds = useMemo(() => getFinanceFundsMock(), []);

  const amountRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<FormState>({
    kind: "income",
    categoryId: "",
    fundId: "",
    amount: "",
    note: "",
    relatedEntity: "",
    attachments: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const categoryOptions = useMemo(() => getFinanceCategoriesByKind(form.kind), [form.kind]);

  useEffect(() => {
    if (!categoryOptions.find((item) => item.id === form.categoryId)) {
      setForm((current) => ({ ...current, categoryId: "" }));
    }
  }, [categoryOptions, form.categoryId]);

  const amountNumber = Number(form.amount || 0);
  const selectedFund = funds.find((item) => item.id === form.fundId);
  const projectedBalance =
    selectedFund && amountNumber > 0 ? selectedFund.balance + (form.kind === "income" ? amountNumber : -amountNumber) : selectedFund?.balance || 0;

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/\D/g, "");
    setForm((current) => ({ ...current, amount: numeric }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.categoryId) {
      nextErrors.categoryId = "Vui lòng chọn hạng mục.";
    }
    if (!form.fundId) {
      nextErrors.fundId = "Vui lòng chọn quỹ.";
    }
    if (!form.amount || amountNumber <= 0) {
      nextErrors.amount = "Số tiền phải lớn hơn 0.";
    }
    if (selectedFund && form.kind === "expense" && amountNumber > selectedFund.balance) {
      nextErrors.amount = "Không cho phép số dư âm theo nguyên tắc hệ thống.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
  };

  return (
    <FinancePageShell
      title="Phiếu giao dịch mới"
      subtitle="Ghi lại dòng tiền vào hoặc ra khỏi quỹ của bạn theo đúng mô tả trong FinRetail."
      actions={
        <div className="finance-inline-actions">
          <Link className="finance-link-button" to={urls.finance_management_dashboard}>
            Về Dashboard
          </Link>
        </div>
      }
    >
      <div className="finance-grid">
        <div className="finance-grid__span-8">
          <section className="finance-panel">
            <form className="finance-form" onSubmit={handleSubmit}>
              <div className="finance-field">
                <label>Loại giao dịch</label>
                <div className="finance-radio-group">
                  <label className={`finance-radio-option finance-radio-option--income${form.kind === "income" ? " is-active" : ""}`}>
                    <input
                      type="radio"
                      name="kind"
                      checked={form.kind === "income"}
                      onChange={() => setForm((current) => ({ ...current, kind: "income" }))}
                    />
                    Thu tiền
                  </label>
                  <label className={`finance-radio-option finance-radio-option--expense${form.kind === "expense" ? " is-active" : ""}`}>
                    <input
                      type="radio"
                      name="kind"
                      checked={form.kind === "expense"}
                      onChange={() => setForm((current) => ({ ...current, kind: "expense" }))}
                    />
                    Chi tiền
                  </label>
                </div>
              </div>

              <div className="finance-form__grid">
                <div className="finance-field">
                  <label>Hạng mục</label>
                  <select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}>
                    <option value="">Chọn hạng mục</option>
                    {categoryOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId ? <span className="finance-field__error">{errors.categoryId}</span> : null}
                </div>

                <div className="finance-field">
                  <label>Nguồn tiền (Quỹ)</label>
                  <select value={form.fundId} onChange={(event) => setForm((current) => ({ ...current, fundId: event.target.value }))}>
                    <option value="">Chọn quỹ</option>
                    {funds.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.fundId ? <span className="finance-field__error">{errors.fundId}</span> : null}
                </div>
              </div>

              <div className="finance-form__grid">
                <div className="finance-field">
                  <label>Số tiền (VND)</label>
                  <input
                    ref={amountRef}
                    type="text"
                    inputMode="numeric"
                    value={form.amount ? new Intl.NumberFormat("vi-VN").format(Number(form.amount)) : ""}
                    onChange={(event) => handleAmountChange(event.target.value)}
                    placeholder="Nhập số tiền"
                  />
                  <span className="finance-field__hint">Chỉ nhận số dương, có format ngăn cách hàng nghìn.</span>
                  {errors.amount ? <span className="finance-field__error">{errors.amount}</span> : null}
                </div>

                <div className="finance-field">
                  <label>Đối tượng liên quan</label>
                  <input
                    type="text"
                    value={form.relatedEntity}
                    onChange={(event) => setForm((current) => ({ ...current, relatedEntity: event.target.value }))}
                    placeholder="Tên khách hàng hoặc nhà cung cấp"
                  />
                  <span className="finance-field__hint">Dùng để liên kết giao dịch với công nợ nếu cần.</span>
                </div>
              </div>

              <div className="finance-field">
                <label>Mô tả / Ghi chú</label>
                <textarea
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Ghi chú chi tiết nội dung giao dịch"
                />
              </div>

              <div className="finance-field">
                <label>Chứng từ đính kèm</label>
                <input
                  type="file"
                  multiple={true}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      attachments: Array.from(event.target.files || []).map((file) => file.name),
                    }))
                  }
                />
                <span className="finance-field__hint">Có thể đính kèm hóa đơn, biên lai hoặc chứng từ liên quan.</span>
                {form.attachments.length > 0 ? <span className="finance-muted">{form.attachments.join(", ")}</span> : null}
              </div>

              <div className="finance-inline-actions">
                <Button type="submit" color={form.kind === "income" ? "success" : "destroy"}>
                  Lưu phiếu giao dịch
                </Button>
                <Link className="finance-link-button" to={urls.finance_management_dashboard}>
                  Hủy
                </Link>
              </div>
            </form>
          </section>
        </div>

        <div className="finance-grid__span-4">
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Xử lý khi lưu phiếu</h2>
              <FinanceBadge tone={form.kind === "income" ? "success" : "danger"}>{form.kind === "income" ? "Thu tiền" : "Chi tiền"}</FinanceBadge>
            </div>

            <div className="finance-helper-box">
              <strong>Tác động dự kiến</strong>
              <ul>
                <li>Validate toàn bộ form trước khi lưu.</li>
                <li>{form.kind === "income" ? "Cộng" : "Trừ"} quỹ đã chọn sau khi ghi transaction.</li>
                <li>Cập nhật công nợ nếu có đối tượng liên quan.</li>
                <li>Thông báo thành công và điều hướng về Dashboard hoặc Sổ thu chi.</li>
              </ul>
            </div>

            <div style={{ marginTop: "1.2rem" }}>
              <FinanceStatCard
                label="Số dư dự kiến sau giao dịch"
                value={formatCurrency(projectedBalance)}
                helper={selectedFund ? `Quỹ hiện tại: ${selectedFund.name}` : "Chọn quỹ để xem số dư dự kiến"}
                tone={form.kind === "income" ? "success" : "warning"}
              />
            </div>

            {submitted ? (
              <div className="finance-helper-box" style={{ marginTop: "1.2rem" }}>
                <strong>Lưu phiếu thành công</strong>
                <ul>
                  <li>Đã ghi nhận giao dịch vào hệ thống.</li>
                  <li>Đã cập nhật số dư quỹ tương ứng.</li>
                  <li>{form.relatedEntity ? "Đã sẵn sàng cập nhật công nợ liên quan." : "Không phát sinh cập nhật công nợ."}</li>
                </ul>
                <div className="finance-inline-actions" style={{ marginTop: "1rem" }}>
                  <Link className="finance-link-button finance-link-button--primary" to={urls.finance_management_dashboard}>
                    Về Dashboard
                  </Link>
                  <Link className="finance-link-button" to={urls.finance_management_cashbook}>
                    Mở Sổ thu chi
                  </Link>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </FinancePageShell>
  );
}

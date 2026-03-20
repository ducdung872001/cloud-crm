import React, { Fragment, useMemo, useState } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Button from "components/button/button";
import Icon from "components/icon";

import "./index.scss";
import { useFinanceMock } from "./useFinanceMock";
import { FinanceScreenId, formatVnd, pct } from "./financeTypes";
import Reconcile from "./partials/Reconcile";
import Debt from "./partials/Debt";
import Cashbook from "./partials/Cashbook";
import Overview from "./partials/Overview";
import VatInvoice from "./partials/VatInvoice";
import FundManagement from "./partials/FundManagement";

type Props = {
  initialScreen?: FinanceScreenId;
};

const FinanceContent: React.FC<Props> = ({ initialScreen = "tong-quan" }) => {
  const data = useFinanceMock();
  const [active, setActive] = useState<FinanceScreenId>(initialScreen);

  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const titles: Record<FinanceScreenId, string> = {
    "tong-quan": "Tổng quan tài chính",
    "so-thu-chi": "Sổ thu chi",
    "hoa-don-vat": "Xuất hóa đơn VAT",
    "quan-ly-quy": "Quản lý quỹ",
    "cong-no": "Quản lý công nợ",
    "doi-soat": "Đối soát thanh toán",
  };

  const openModal = (dialog: IContentDialog) => {
    setContentDialog(dialog);
    setShowDialog(true);
  };

  // Example modals (prototype-level)
  const openAddTxModal = () => {
    openModal({
      color: "success",
      className: "finance-modal",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Tạo giao dịch mới</Fragment>,
      message: (
        <Fragment>
          <div className="fin-form">
            <div className="fin-row">
              <label>Loại giao dịch</label>
              <select defaultValue="thu">
                <option value="thu">Thu tiền</option>
                <option value="chi">Chi tiền</option>
              </select>
            </div>

            <div className="fin-row">
              <label>Khoản mục</label>
              <select defaultValue="Thu bán hàng">
                <option>Thu bán hàng</option>
                <option>Thu công nợ</option>
                <option>Thu khác</option>
                <option>Chi nhập hàng</option>
                <option>Chi nhân sự</option>
                <option>Chi vận hành</option>
              </select>
            </div>

            <div className="fin-grid2">
              <div className="fin-row">
                <label>Số tiền (VND)</label>
                <input type="number" placeholder="0" />
              </div>
              <div className="fin-row">
                <label>Nguồn tiền</label>
                <select defaultValue={data.funds[0]?.name}>
                  {data.funds.map((f) => (
                    <option key={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="fin-row">
              <label>Ngày giao dịch</label>
              <input type="date" defaultValue="2026-03-16" />
            </div>

            <div className="fin-row">
              <label>Diễn giải</label>
              <input placeholder="Nhập diễn giải giao dịch..." />
            </div>

            <div className="fin-row">
              <label>Ghi chú</label>
              <textarea rows={2} placeholder="Ghi chú thêm..." />
            </div>
          </div>
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Lưu giao dịch",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
    });
  };

  const openTransferModal = () => {
    openModal({
      color: "success",
      className: "finance-modal",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Chuyển tiền giữa các quỹ</Fragment>,
      message: (
        <Fragment>
          <div className="fin-form">
            <div className="fin-row">
              <label>Quỹ nguồn (Từ)</label>
              <select defaultValue={data.funds[0]?.name}>
                {data.funds.map((f) => (
                  <option key={f.id}>
                    {f.name} — {formatVnd(f.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="fin-row fin-center">
              <span className="fin-arrow">↓</span>
            </div>

            <div className="fin-row">
              <label>Quỹ đích (Đến)</label>
              <select defaultValue={data.funds[1]?.name ?? data.funds[0]?.name}>
                {data.funds.map((f) => (
                  <option key={f.id}>
                    {f.name} — {formatVnd(f.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="fin-row">
              <label>Số tiền chuyển (VND)</label>
              <input type="number" placeholder="0" />
            </div>

            <div className="fin-row">
              <label>Ghi chú</label>
              <input placeholder="Lý do chuyển quỹ..." />
            </div>
          </div>
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Thực hiện chuyển",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
    });
  };

  const totals = useMemo(() => {
    const totalFunds = data.funds.reduce((a, f) => a + f.balance, 0);
    const totalThu = data.txs.filter((t) => t.type === "thu").reduce((a, t) => a + t.amount, 0);
    const totalChi = data.txs.filter((t) => t.type === "chi").reduce((a, t) => a + t.amount, 0);
    return { totalFunds, totalThu, totalChi };
  }, [data]);

  return (
    <div className="finance-content">
      <div className="finance-content__header">
        <div className="fin-title">
          <div className="h1">{titles[active]}</div>
          <div className="sub">Tháng 3/2026 · Dữ liệu demo</div>
        </div>

        <div className="fin-actions">
          {active === "so-thu-chi" && (
            <Button color="primary" onClick={openAddTxModal}>
              <Icon name="Plus" className="mr-6" />
              Tạo giao dịch
            </Button>
          )}
          {active === "quan-ly-quy" && (
            <Button color="primary" onClick={openTransferModal}>
              <Icon name="Swap" className="mr-6" />
              Chuyển quỹ
            </Button>
          )}
        </div>
      </div>

      <div className="finance-content__tabs">
        <button className={`tab${active === "tong-quan" ? " active" : ""}`} onClick={() => setActive("tong-quan")}>
          Thông tin tài chính
        </button>
        <button className={`tab${active === "so-thu-chi" ? " active" : ""}`} onClick={() => setActive("so-thu-chi")}>
          Sổ thu chi
        </button>
        <button className={`tab${active === "hoa-don-vat" ? " active" : ""}`} onClick={() => setActive("hoa-don-vat")}>
          Xuất hóa đơn VAT
        </button>
        <button className={`tab${active === "quan-ly-quy" ? " active" : ""}`} onClick={() => setActive("quan-ly-quy")}>
          Quản lý quỹ
        </button>
        <button className={`tab${active === "cong-no" ? " active" : ""}`} onClick={() => setActive("cong-no")}>
          Công nợ
        </button>
        <button className={`tab${active === "doi-soat" ? " active" : ""}`} onClick={() => setActive("doi-soat")}>
          Đối soát
        </button>

        <div className="quick">
          <span className="pill">Tổng quỹ: {formatVnd(totals.totalFunds)}</span>
          <span className="pill pill--gr">Thu: {formatVnd(totals.totalThu)}</span>
          <span className="pill pill--rd">Chi: {formatVnd(totals.totalChi)}</span>
          <span className="pill pill--bl">Tỷ lệ thu/chi: {pct(totals.totalThu, totals.totalChi)}%</span>
        </div>
      </div>

      <div className="finance-content__body">
        {active === "tong-quan" && <Overview data={data} onOpenCashbook={() => setActive("so-thu-chi")} />}
        {active === "so-thu-chi" && <Cashbook data={data} onAddTx={openAddTxModal} />}
        {active === "hoa-don-vat" && <VatInvoice data={data} />}
        {active === "quan-ly-quy" && <FundManagement data={data} onTransfer={openTransferModal} />}
        {active === "cong-no" && <Debt data={data} />}
        {active === "doi-soat" && <Reconcile data={data} />}
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
};

export default FinanceContent;

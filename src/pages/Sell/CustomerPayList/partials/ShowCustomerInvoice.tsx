import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import ModalReceipt, { ModalBodyReceipt, ModalFooterReceipt, ModalReceiptHeader } from "components/modalReceipt/modalReceipt";
import { IActionModal } from "model/OtherModel";
import { IShowCustomerInvoiceProps } from "model/sell/PropsModel";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import InvoiceService from "services/InvoiceService";

export default function ShowCustomerInvoice(props: IShowCustomerInvoiceProps) {
  const { onShow, onHide, idCustomerPay } = props;

  const [isSubmit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailInvoice, setdetailInvoice] = useState(null);
  const [detaillBranch, setdetaillBranch] = useState<IBeautyBranchResponse>(null);
  const [listProduct, setListProduct] = useState([]);

  const getdetaillCustomerInvoice = async () => {
    setIsLoading(true);

    const response = await InvoiceService.listInvoiceDetail(idCustomerPay);

    if (response.code === 0) {
      const result = response.result;
      setdetailInvoice(result.invoice);
      setdetaillBranch(result.beautyBranch);
      setListProduct([...result.products, ...result.services, ...result.boughtCardServices]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && idCustomerPay) {
      getdetaillCustomerInvoice();
    }
  }, [onShow, idCustomerPay]);

  const titles = ["STT", "Tên mặt hàng", "Đơn giá", "Số lượng", "Giảm giá", "Thành tiền"];

  const dataFormat = ["text-center", "", "text-right", "text-right", "text-right", "text-right"];

  const dataMappingArray = (item, index: number) => [
    index + 1,
    item.name,
    formatCurrency(item.price ? item.price : item.cash),
    item.quantity,
    formatCurrency(item.priceDiscount ? item.priceDiscount : "0"),
    formatCurrency(item.fee),
  ];

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // ── Gửi email biên lai ──────────────────────────────────────────────────────
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailInput, setEmailInput]         = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendEmail = async () => {
    const email = emailInput.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Email không hợp lệ", "error");
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await fetch("/adminapi/outlookMail/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: email,
          subject: `Biên lai hóa đơn ${detailInvoice?.invoiceCode ?? ""}`,
          body: `<p>Kính gửi quý khách,</p>
                 <p>Đây là biên lai hóa đơn <b>${detailInvoice?.invoiceCode ?? ""}</b> ngày <b>${moment(detailInvoice?.receiptDate).format("DD/MM/YYYY")}</b>.</p>
                 <p>Tổng thanh toán: <b>${formatCurrency(detailInvoice?.fee ?? 0)}</b></p>
                 <p>Cảm ơn quý khách!</p>`,
        }),
      });
      const rj = await res.json().catch(() => ({}));
      if (rj.code !== 0) throw new Error(rj.message ?? "Gửi thất bại");
      showToast(`Đã gửi biên lai tới ${email}`, "success");
      setShowEmailInput(false);
    } catch (err: any) {
      showToast(err?.message ?? "Gửi email thất bại. Vui lòng thử lại.", "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => { onHide(false); },
          },
          {
            title: showEmailInput ? "Huỷ email" : "Gửi email",
            color: "primary",
            variant: "outline",
            callback: () => {
              if (showEmailInput) {
                setShowEmailInput(false);
              } else {
                // Pre-fill email nếu có
                setEmailInput(detailInvoice?.customerEmail ?? "");
                setShowEmailInput(true);
              }
            },
          },
          {
            title: "In hóa đơn A4/A5",
            type: "button",
            color: "primary",
            is_loading: isSubmit,
            callback: () => { handlePrint(); },
          },
        ],
      },
    }),
    [isSubmit, showEmailInput, detailInvoice]
  );

  return (
    <Fragment>
      <ModalReceipt
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-customer-invoice"
      >
        {!isLoading && (detailInvoice !== null || detaillBranch !== null || listProduct.length > 0) ? (
          <Fragment>
            <div ref={componentRef}>
              <ModalReceiptHeader
                title={detaillBranch?.name}
                avatar={detaillBranch?.avatar}
                address={detaillBranch?.address}
                phone={detaillBranch?.phone}
                toggle={() => !isSubmit && onHide(false)}
              />

              <ModalBodyReceipt
                type="IV2"
                name="Chi tiết hóa đơn khách trả hàng"
                code={detailInvoice?.invoiceCode}
                phone={detailInvoice?.employeePhone}
                address={detailInvoice?.employeeAddress}
                importer={detailInvoice?.employeeName}
                billDate={moment(detailInvoice?.receiptDate).format("DD/MM/YYYY")}
                totalMoney={detailInvoice?.amount || 0}
                discount={detailInvoice?.discount || 0}
                vat={0}
                totalAmountPayable={detailInvoice?.fee || 0}
                actuallyPaySupplier={detailInvoice?.paid || 0}
                debt={detailInvoice?.debt || 0}
              >
                <BoxTable
                  name="Chi tiết hóa đơn khách trả hàng"
                  titles={titles}
                  items={listProduct}
                  dataFormat={dataFormat}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  striped={true}
                />
              </ModalBodyReceipt>

              {/* Email input form — hiện khi bấm "Gửi email" */}
              {showEmailInput && (
                <div style={{
                  padding: "1.2rem 1.6rem",
                  borderTop: "1px solid var(--border)",
                  background: "var(--paper)",
                }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", marginBottom: "0.8rem" }}>
                    Địa chỉ email nhận biên lai
                  </div>
                  <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendEmail()}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: "0.7rem 1.2rem",
                        border: "1.5px solid var(--border)",
                        borderRadius: "0.8rem",
                        fontFamily: "var(--font-base)",
                        fontSize: "1.3rem",
                        color: "var(--ink)",
                        background: "var(--white)",
                        outline: "none",
                      }}
                    />
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={handleSendEmail}
                      disabled={isSendingEmail}
                    >
                      {isSendingEmail ? "Đang gửi..." : "Gửi"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <ModalFooterReceipt actions={actions} />
          </Fragment>
        ) : (
          <Loading />
        )}
      </ModalReceipt>
    </Fragment>
  );
}
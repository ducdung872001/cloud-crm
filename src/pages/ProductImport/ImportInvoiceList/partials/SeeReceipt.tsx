import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import ModalReceipt, { ModalBodyReceipt, ModalFooterReceipt, ModalReceiptHeader } from "components/modalReceipt/modalReceipt";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { IActionModal } from "model/OtherModel";
import { SeeReceiptProps } from "model/invoice/PropsModel";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import InvoiceService from "services/InvoiceService";
import { INVOICE_IMPORT } from "utils/constant";

export default function SeeReceipt(props: SeeReceiptProps) {
  const { onShow, idInvoice, onHide } = props;

  const [isSubmit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detaiInvoice, setDetaiInvoice] = useState(null);
  const [detailBranch, setDetailBranch] = useState<IBeautyBranchResponse>(null);
  const [listProduct, setListProduct] = useState([]);

  const getDetailInvoice = async () => {
    setIsLoading(true);

    const response = await InvoiceService.listInvoiceDetail(idInvoice);

    if (response.code === 0) {
      const result = response.result;
      setDetaiInvoice(result.invoice);
      setDetailBranch(result.beautyBranch);
      setListProduct(result.importedProducts);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (idInvoice && onShow) {
      getDetailInvoice();
    }
  }, [idInvoice, onShow]);

  const titles = ["STT", "Tên mặt hàng", "Đơn giá", "Số lượng", "Đơn vị", "Giảm giá", "Thành tiền"];

  const dataFormat = ["text-center", "", "text-right", "text-right", "text-center", "text-right", "text-right"];

  const dataMappingArray = (item, index: number) => [
    index + 1,
    item.productName,
    formatCurrency(item.mainCost),
    item.quantity,
    item.unitName,
    formatCurrency("0"),
    formatCurrency((item.mainCost ? item.mainCost : 0) * (item.quantity ? item.quantity : 0)),
  ];

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              onHide();
            },
          },
          {
            title: "In hóa đơn A4/A5",
            type: "button",
            color: "primary",
            is_loading: isSubmit,
            callback: () => {
              handlePrint();
            },
          },
        ],
      },
    }),
    [isSubmit]
  );

  return (
    <Fragment>
      <ModalReceipt
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => !isSubmit && onHide()}
        className="modal-see-receipt"
      >
        {!isLoading && (detaiInvoice !== null || detailBranch !== null || listProduct.length > 0) ? (
          <Fragment>
            <div ref={componentRef}>
              <ModalReceiptHeader
                title={detailBranch?.name}
                avatar={detailBranch?.avatar}
                address={detailBranch?.address}
                phone={detailBranch?.phone}
                toggle={() => !isSubmit && onHide()}
              />
              <ModalBodyReceipt
                type={INVOICE_IMPORT}
                code={detaiInvoice?.invoiceCode}
                phone={detaiInvoice?.employeePhone}
                address={detaiInvoice?.employeeAddress}
                importer={detaiInvoice?.employeeName}
                billDate={moment(detaiInvoice?.receiptDate).format("DD/MM/YYYY")}
                totalMoney={detaiInvoice?.amount || 0}
                discount={detaiInvoice?.discount || 0}
                vat={0}
                totalAmountPayable={detaiInvoice?.fee || 0}
                actuallyPaySupplier={detaiInvoice?.paid || 0}
                debt={detaiInvoice?.debt || 0}
                paymentType={detaiInvoice?.paymentType}
                name="Danh sách mặt hàng"
              >
                <BoxTable
                  name="Danh sách mặt hàng"
                  titles={titles}
                  items={listProduct}
                  dataFormat={dataFormat}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  striped={true}
                />
              </ModalBodyReceipt>
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

import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import ModalReceipt, { ModalBodyReceipt, ModalFooterReceipt, ModalReceiptHeader } from "components/modalReceipt/modalReceipt";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { IActionModal } from "model/OtherModel";
import { ShowModalDetailOfferProps } from "model/offer/PropsModel";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import InvoiceService from "services/InvoiceService";
import { INVOICE_PURCHASE_CARD } from "utils/constant";
import ImageThirdGender from "assets/images/third-gender.png";
import Image from "components/image";

export default function ShowModalDetailSaleInvoice(props: ShowModalDetailOfferProps) {
  const { onShow, idOffer, onHide } = props;

  const [isSubmit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detaiInvoice, setDetaiInvoice] = useState(null);
  const [detailBranch, setDetailBranch] = useState<IBeautyBranchResponse>(null);
  const [checkView, setCheckView] = useState<boolean>(false);

  const [listData, setListData] = useState([]);

  const getDetailInvoice = async () => {
    setIsLoading(true);

    const response = await InvoiceService.listInvoiceDetail(idOffer);

    if (response.code === 0) {
      const result = response.result;
      setDetaiInvoice(result.invoice);
      setDetailBranch(result.beautyBranch);

      if (result.boughtCardServices?.length > 0) {
        setCheckView(false);
        setListData([...result.boughtCardServices]);
      } else {
        setCheckView(true);
        setListData([...result.products, ...result.services]);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (idOffer && onShow) {
      getDetailInvoice();
    }
  }, [idOffer, onShow]);

  const titles = [
    "STT",
    "Ảnh mặt hàng", //mặt hàng
    "Tên mặt hàng", //mặt hàng
    `${checkView ? "Giá bán" : "Mã thẻ"}`,
    `${checkView ? "Số lượng" : "Giá trị thẻ"}`,
    `${checkView ? "Thành tiền" : "Giá bán"}`,
  ];

  const dataFormat = ["text-center", "text-center", "", `${checkView ? "text-right" : ""}`, "text-right", "text-right"];

  const dataMappingArray = (item, index: number) => [
    index + 1,
    <Image key={index} src={item.avatar || item.productAvatar || item.serviceAvatar || ImageThirdGender} alt={item.name} />,
    !item.batchNo ? (
      item.name || item.serviceName
    ) : (
      <Fragment>
        <span>{item.name}</span>
        <br />
        <span>
          <strong>Số lô: </strong>
          {item.batchNo}
        </span>
        <br />
        <span>
          <strong>Đơn vị tính: </strong>
          {item.unitName}
        </span>
      </Fragment>
    ),
    `${
      checkView
        ? formatCurrency(
            item.discount && item.discountUnit == 1
              ? (item.priceDiscount ? item.priceDiscount : item.price) -
                  (item.priceDiscount ? item.priceDiscount : item.price) * (item.discount / 100)
              : (item.priceDiscount ? item.priceDiscount : item.price) - item.discount
          )
        : item.cardNumber
    }`,
    `${checkView ? (item.qty ? item.qty : 1) : formatCurrency(item.cash)}`,
    `${checkView ? formatCurrency(item.fee) : formatCurrency(item.account)}`,
  ];

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [typePrint, setTypePrint] = useState<string>("");

  const adjustForPrint = (type) => {
    const style = `
    @page {
      size: ${type === "a4" ? "portrait" : "landscape"};
      margin: 0;
    }
  `;

    const styleElement = document.createElement("style");
    styleElement.innerHTML = style;
    document.head.appendChild(styleElement);
  };

  useEffect(() => {
    if (typePrint) {
      handlePrint();
      adjustForPrint(typePrint);
    }
  }, [typePrint]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "In hóa đơn A4",
            type: "button",
            color: "primary",
            is_loading: isSubmit,
            callback: () => {
              setTypePrint("a4");
            },
          },
          {
            title: "In hóa đơn A5",
            type: "button",
            color: "primary",
            is_loading: isSubmit,
            callback: () => {
              setTypePrint("a5");
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
        className="modal-detail-sale-invoice"
      >
        {!isLoading && (detaiInvoice !== null || detailBranch !== null || listData.length > 0) ? (
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
                type={INVOICE_PURCHASE_CARD}
                code={detaiInvoice?.invoiceCode}
                phone={detaiInvoice?.customerPhone}
                address={detaiInvoice?.customerAddress}
                importer={detaiInvoice?.customerName}
                billDate={moment(detaiInvoice?.receiptDate).format("DD/MM/YYYY")}
                totalMoney={detaiInvoice?.amount || 0}
                discount={detaiInvoice?.discount || 0}
                vat={0}
                totalAmountPayable={detaiInvoice?.fee || 0}
                actuallyPaySupplier={detaiInvoice?.paid || 0}
                debt={detaiInvoice?.debt || 0}
                paymentType={detaiInvoice?.paymentType}
                name="Danh sách mặt hàng"
                className={`modal-receipt-body--${typePrint}`}
              >
                <BoxTable
                  name="Danh sách mặt hàng"
                  titles={titles}
                  items={listData}
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

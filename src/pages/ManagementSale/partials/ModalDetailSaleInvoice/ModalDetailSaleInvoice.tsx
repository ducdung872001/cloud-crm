import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { IActionModal } from "model/OtherModel";
import { ShowModalDetailSaleInvoiceProps } from "model/invoice/PropsModel";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import InvoiceService from "services/InvoiceService";
import { INVOICE_PURCHASE_CARD } from "utils/constant";
import ImageThirdGender from "assets/images/third-gender.png";
import Image from "components/image";
import PomService from "services/PomService";
import Icon from "components/icon";
import ModalReceipt, { ModalBodyReceipt, ModalFooterReceipt, ModalReceiptHeader } from "./partials/ModalReceipt";

export default function ModalDetailSaleInvoice(props: ShowModalDetailSaleInvoiceProps) {
  const { onShow, idInvoice, onHide } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detaiInvoice, setDetaiInvoice] = useState(null);
  const [detailBranch, setDetailBranch] = useState<IBeautyBranchResponse>(null);
  const [checkView, setCheckView] = useState<boolean>(false);

  const [listData, setListData] = useState([]);

  // lấy danh sách id của dịch vụ
  const [isPrintPomService, setIsPrintPomService] = useState<boolean>(false);
  const [lstIdService, setLstIdService] = useState([]);
  const [lstService, setLstService] = useState([]);
  const [dataPomService, setDataPomService] = useState(null);  

  const getPomService = async (lstId) => {
    const params = {
      lstId,
    };

    const response = await PomService.lstPomSales(params);
    if (response.code === 0) {
      const result = response.result;

      const changeResult = lstService.flatMap((service) => {
        const serviceId = service.serviceId.toString();
        const items = result[serviceId] || [];
        return items.map((item) => ({
          ...item,
          serviceName: service.serviceName,
          quantity: item.quantity * lstService.filter((s) => s.serviceId === service.serviceId).length,
        }));
      });

      const seenIds = [];
      const resultArray = changeResult.filter((item) => {
        if (!seenIds.includes(item.id)) {
          seenIds.push(item.id);
          return true;
        }
        return false;
      });

      if (resultArray.length > 0) {
        setDataPomService(resultArray);
      }
    } else {
      setDataPomService(null);
    }
  };

  useEffect(() => {
    if (lstIdService && lstIdService.length > 0) {
      const changeLstIdService = _.uniq(lstIdService);
      const result = changeLstIdService.join(",");

      getPomService(result);
    }
  }, [lstIdService, lstService]);

  const getDetailInvoice = async () => {
    setIsLoading(true);

    const response = await InvoiceService.listInvoiceDetail(idInvoice);

    if (response.code === 0) {
      const result = response.result;

      const takeIdService = result.services && result.services.map((item) => item.serviceId);
      setLstIdService(takeIdService);
      setLstService(result.services);

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
    if (idInvoice && onShow) {
      getDetailInvoice();
    }
  }, [idInvoice, onShow]);

  const titles = [
    "STT",
    "Ảnh mặt hàng", //mặt hàng
    "Tên mặt hàng", //mặt hàng
    `${checkView ? "Giá bán" : "Mã thẻ"}`,
    `${checkView ? "Số lượng" : "Giá trị thẻ"}`,
    // `${checkView ? "Thành tiền" : "Giá bán"}`,
    'Kho hàng'
  ];

  const dataFormat = ["text-center", "image", "", `${checkView ? "text-right" : ""}`, "text-right", "text-right"];

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
    item.inventoryName
    // `${checkView ? formatCurrency(item.fee) : formatCurrency(item.account)}`,
  ];

  // đoạn này là table của vật tư tiêu hao
  const titlesPom = ["STT", "Sản phẩm", "Đơn vị", "Số lượng", "Dịch vụ"];

  const dataFormatPom = ["text-center", "", "", "text-right", ""];

  const dataMappingArrayPom = (item, index: number) => [index + 1, item.productName, item.unitName, item.quantity, item.serviceName];

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [typePrint, setTypePrint] = useState<string>("a5");

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
        //   ...(dataPomService
        //     ? ([
        //         {
        //           title: "Xem vật tư tiêu hao",
        //           type: "button",
        //           color: "primary",
        //           variant: "outline",
        //           callback: () => {
        //             setIsPrintPomService(true);
        //           },
        //         },
        //       ] as any)
        //     : []),
        //   {
        //     title: "In hóa đơn A4",
        //     type: "button",
        //     color: "primary",
        //     callback: () => {
        //       setIsPrintPomService(false);
        //       setTypePrint("a4");
        //       setTimeout(() => {
        //         handlePrint();
        //       }, 100);
        //     },
        //   },
        //   {
        //     title: "In hóa đơn A5",
        //     type: "button",
        //     color: "primary",
        //     callback: () => {
        //       setIsPrintPomService(false);
        //       setTypePrint("a5");
        //       setTimeout(() => {
        //         handlePrint();
        //       }, 100);
        //     },
        //   },
        {
            title: "Xuất kho",
            type: "button",
            color: "primary",
            callback: () => {
              
            },
          },
        ],
      },
    }),
    [dataPomService, isPrintPomService]
  );

  return (
    <Fragment>
      <ModalReceipt
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => onHide()}
        className="modal-detail-sale-invoice"
      >
        {!isLoading && (detaiInvoice !== null || detailBranch !== null || listData.length > 0) ? (
          <Fragment>
            <div className={`type__print--${typePrint}`} ref={componentRef}>
              <ModalReceiptHeader
                title={detailBranch?.name}
                avatar={detailBranch?.avatar}
                address={detailBranch?.address}
                phone={detailBranch?.phone}
                toggle={() => {
                  onHide();
                  setIsPrintPomService(false);
                }}
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
                name={isPrintPomService ? "" : "Danh sách mặt hàng"}
                className={`modal-receipt-body--${typePrint} ${isPrintPomService ? "modal-receipt-body--pom" : ""}`}
                isPrintPomService={isPrintPomService}
              >
                {dataPomService && isPrintPomService ? (
                  <div className="info__sales">
                    <div className="desc__pom">
                      <div className="title__pom d-flex align-items-center">
                        <h3>Danh sách vật tư tiêu hao</h3>
                        <Tippy content="In vật tư tiêu hao">
                          <span
                            className="icon__print"
                            onClick={() => {
                              handlePrint();
                            }}
                          >
                            <Icon name="Print" />
                          </span>
                        </Tippy>
                      </div>
                      <BoxTable
                        name="Danh sách vật tư tiêu hao"
                        titles={titlesPom}
                        items={dataPomService}
                        dataFormat={dataFormatPom}
                        dataMappingArray={(item, index) => dataMappingArrayPom(item, index)}
                        striped={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="desc__items">
                    <BoxTable
                      name="Danh sách mặt hàng"
                      titles={titles}
                      items={listData}
                      dataFormat={dataFormat}
                      dataMappingArray={(item, index) => dataMappingArray(item, index)}
                      striped={true}
                    />
                  </div>
                )}
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

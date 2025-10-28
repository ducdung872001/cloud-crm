import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import _ from "lodash";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import ModalReceipt, { ModalBodyReceipt, ModalFooterReceipt, ModalReceiptHeader } from "components/modalReceipt/modalReceipt";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { ShowPaymentBillModalProps } from "model/invoice/PropsModel";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import InvoiceService from "services/InvoiceService";
import ImageThirdGender from "assets/images/third-gender.png";
import Image from "components/image";
import { INVOICE_PURCHASE } from "utils/constant";
import { IActionModal } from "model/OtherModel";
import PomService from "services/PomService";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";

export default function ShowPaymentBillModal(props: ShowPaymentBillModalProps) {
  const { onShow, idInvoice, tab } = props;

  const navigate = useNavigate();

  const nameCommon = tab == "tab_one";

  const [isSubmit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detaiInvoice, setDetaiInvoice] = useState(null);
  const [detailBranch, setDetailBranch] = useState<IBeautyBranchResponse>(null);
  // lấy danh sách id của dịch vụ
  const [isPrintPomService, setIsPrintPomService] = useState<boolean>(false);
  const [lstIdService, setLstIdService] = useState([]);
  const [lstService, setLstService] = useState([]);
  const [dataPomService, setDataPomService] = useState(null);

  const [listData, setListData] = useState([]);

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

      tab == "tab_one" ? setListData([...result.products, ...result.services]) : setListData([...result.boughtCardServices]);
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
    `${nameCommon ? "Giá bán" : "Mã thẻ"}`,
    `${nameCommon ? "Số lượng" : "Giá trị thẻ"}`,
    `${nameCommon ? "Thành tiền" : "Giá bán"}`,
  ];

  const dataFormat = ["text-center", "image", "", `${nameCommon ? "text-right" : ""}`, "text-right", "text-right"];

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
      nameCommon
        ? formatCurrency(
            item.discount && item.discountUnit == 1
              ? (item.priceDiscount ? item.priceDiscount : item.price) -
                  (item.priceDiscount ? item.priceDiscount : item.price) * (item.discount / 100)
              : (item.priceDiscount ? item.priceDiscount : item.price) - item.discount
          )
        : item.cardNumber
    }`,
    `${nameCommon ? (item.qty ? item.qty : 1) : formatCurrency(item.cash)}`,
    `${nameCommon ? formatCurrency(item.fee ? item.fee : "0") : formatCurrency(item.account)}`,
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

  const actionPrint = () => {
    handlePrint();
    setTypePrint("a5");
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_left: {
        buttons: dataPomService
          ? [
              {
                title: "Xem vật tư tiêu hao",
                type: "button",
                color: "primary",
                variant: "outline",
                is_loading: isSubmit,
                callback: () => {
                  setIsPrintPomService(true);
                },
              },
            ]
          : [],
      },
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              localStorage.removeItem("infoCustomer");
              navigate("/sale_invoice");
            },
          },
          {
            title: "In hóa đơn A4",
            type: "button",
            color: "primary",
            is_loading: isSubmit,
            callback: () => {
              setIsPrintPomService(false);
              setTypePrint("a4");
              setTimeout(() => {
                handlePrint();
              }, 100);
            },
          },
          {
            title: "In hóa đơn A5",
            type: "button",
            color: "primary",
            is_loading: isSubmit,
            callback: () => {
              setIsPrintPomService(false);
              setTimeout(() => {
                actionPrint();
              }, 100);
            },
          },
        ],
      },
    }),
    [isSubmit, typePrint, dataPomService, isPrintPomService]
  );

  return (
    <Fragment>
      <ModalReceipt isOpen={onShow} isFade={true} staticBackdrop={true} isCentered={true} toggle={() => !isSubmit} className="modal-see-payment-bill">
        {!isLoading && (detaiInvoice !== null || detailBranch !== null || listData.length > 0) ? (
          <Fragment>
            <div ref={componentRef}>
              <ModalReceiptHeader
                title={detailBranch?.name}
                avatar={detailBranch?.avatar}
                address={detailBranch?.address}
                phone={detailBranch?.phone}
                toggle={() => !isSubmit && navigate("/sale_invoice")}
                className={`modal-receipt-header--${typePrint}`}
              />

              <ModalBodyReceipt
                type={INVOICE_PURCHASE}
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

import React, { Fragment, useEffect, useRef, useState } from "react";
import { Portal } from "react-overlays";
import Button from "./../button/button";
import Icon from "components/icon";
import { IActionModal } from "model/OtherModel";
import { formatCurrency, fadeOut } from "reborn-util";
import { useOnClickOutside } from "utils/hookCustom";
import SelectCustom from "components/selectCustom/selectCustom";
import Image from "components/image";
import {
  INVOICE_PURCHASE,
  INVOICE_RETURN_CUSTOMER,
  INVOICE_PURCHASE_CARD,
  INVOICE_IMPORT,
  INVOICE_IMPORT_INIT,
  INVOICE_EXPORT_DESTROY,
  INVOICE_ADJUST_INVENTORY,
  INVOICE_RETURN_PROVIDER,
  HISTORY_USE_CARD_SERVICE,
} from "utils/constant";
import "./modalReceipt.scss";

interface ModalReceiptProps {
  isOpen: boolean;
  children: React.ReactElement | React.ReactElement[];
  toggle: () => void;
  staticBackdrop?: boolean;
  className?: string;
  isCentered?: boolean;
  isFade?: boolean;
}

export default function ModalReceipt(props: ModalReceiptProps) {
  const { isOpen, children, toggle, staticBackdrop, className, isCentered, isFade } = props;

  const refModal = useRef();
  const refBackdrop = useRef();
  const refDialog = useRef();
  useOnClickOutside(refDialog, () => toggle(), [
    "modal-dialog",
    "dialog",
    "dialog-backdrop",
    "react-datepicker-popper",
    "popover",
    ...(staticBackdrop ? ["modal-backdrop"] : []),
  ]);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.getElementsByTagName("body")[0].style.overflow = "hidden";
      setIsOpenModal(isOpen);
    } else {
      document.getElementsByTagName("body")[0].style.overflow = "";
      if (refModal?.current && isFade) {
        fadeOut(refModal.current);
        if (refBackdrop?.current) {
          fadeOut(refBackdrop.current);
        }
        setTimeout(() => {
          setIsOpenModal(isOpen);
        }, 200);
      } else {
        setIsOpenModal(isOpen);
      }
    }
  }, [isOpen]);

  return (
    isOpenModal && (
      <Portal container={document.getElementsByTagName("body")[0]}>
        <Fragment>
          <div className={`modal-receipt${className ? ` ${className}` : ""} show`} ref={refModal}>
            <div className={`modal-dialog${isCentered ? " modal-dialog--centered" : ""}`} ref={refDialog}>
              <div className="modal-content">{children}</div>
            </div>
            <div className={`modal-backdrop show`} ref={refBackdrop}></div>
          </div>
        </Fragment>
      </Portal>
    )
  );
}

interface ModalReceiptHeaderProps {
  title: React.ReactElement | string;
  avatar: string;
  address: string;
  phone: string;
  toggle: () => void;
  className?: string;
}

export function ModalReceiptHeader(props: ModalReceiptHeaderProps) {
  const { title, avatar, address, phone, toggle, className } = props;
  return (
    <div className={`modal-receipt-header ${className ? ` ${className}` : ""}`}>
      <div className="wrapper-header">
        <div className="header__image">
          <Image src={avatar} alt="avatar" />
        </div>
        <div className="header__info">
          <h4>{title}</h4>
          <div className="header__info--address">
            <Icon name="Home" />
            {address}
          </div>
          <div className="header__info--phone">
            <Icon name="Telephone" />
            {phone}
          </div>
        </div>
      </div>
      {toggle && (
        <Button onClick={() => toggle()} type="button" className="btn-close" color="transparent" onlyIcon={true}>
          <Icon name="Times" />
        </Button>
      )}
    </div>
  );
}

interface ModalReceiptBodyProps {
  className?: string;
  code: string;
  phone?: string;
  address?: string;
  importer?: string;
  billDate?: string;
  totalMoney?: number;
  discount?: number;
  vat?: number;
  totalAmountPayable?: number;
  actuallyPaySupplier?: number;
  debt?: number;
  children: any;
  type: string;
  name?: string;
  nameCard?: string;
  valueCard?: number;
  remainingMoney?: number;
  pocketMoney?: number;
  paymentType?: string | number;
  status?: number;
  style?: any;
  isPrintPomService?: boolean;
}

export function ModalBodyReceipt(props: ModalReceiptBodyProps) {
  const {
    code,
    phone,
    address,
    importer,
    billDate,
    totalMoney,
    discount,
    vat,
    totalAmountPayable,
    actuallyPaySupplier,
    debt,
    children,
    className,
    type,
    name,
    nameCard,
    valueCard,
    remainingMoney,
    pocketMoney,
    paymentType,
    status,
    style,
    isPrintPomService,
  } = props;

  return (
    <div style={style ? style : {}} className={`modal-receipt-body ${className ? ` ${className}` : ""}`}>
      {/* Tiêu đề phiếu */}
      <div className="coupon-title">
        <h2>
          {type === HISTORY_USE_CARD_SERVICE ? `Lịch sử tiêu dùng thẻ ${nameCard}` : type == INVOICE_ADJUST_INVENTORY ? "Thông tin phiếu" : "Hóa đơn"}{" "}
          {type == INVOICE_IMPORT
            ? "Nhập hàng"
            : type == INVOICE_RETURN_CUSTOMER
            ? "Trả hàng"
            : type == INVOICE_IMPORT_INIT
            ? "Nhập tồn"
            : type == INVOICE_EXPORT_DESTROY
            ? "Xuất hủy"
            : type == INVOICE_ADJUST_INVENTORY
            ? "Điều chỉnh kho"
            : type == INVOICE_RETURN_PROVIDER
            ? "Trả hàng nhà cung cấp"
            : type === HISTORY_USE_CARD_SERVICE
            ? ""
            : "Bán hàng"}
        </h2>
        <span>
          ({type === HISTORY_USE_CARD_SERVICE ? "Mã thẻ" : type == INVOICE_ADJUST_INVENTORY ? "Mã phiếu" : "Mã hóa đơn"}: {code})
        </span>
      </div>
      {/* Thông tin người nhập phiếu */}
      {type !== HISTORY_USE_CARD_SERVICE ? (
        <div className="info-person">
          <div className="d-flex align-items-start">
            <label className="title-left">Ngày hóa đơn</label>
            <strong>{billDate}</strong>
          </div>
          {type == INVOICE_ADJUST_INVENTORY ? (
            <div className="d-flex align-items-start">
              <label className="title-left">Trạng thái</label>
              <strong>{status === 0 ? "Bản nháp" : status === 1 ? "Tạo thành công" : status === 2 ? "Đã duyệt" : "Đã hủy"}</strong>
            </div>
          ) : (
            <div className="d-flex align-items-start">
              <label className="title-left">Điện thoại</label>
              <strong>{phone}</strong>
            </div>
          )}
          <div className="d-flex align-items-start">
            <label className="title-right">
              Tên{" "}
              {type == INVOICE_PURCHASE || type == INVOICE_PURCHASE_CARD
                ? "người mua"
                : type === INVOICE_ADJUST_INVENTORY
                ? "người tạo"
                : "người nhập"}
            </label>
            <strong>{importer}</strong>
          </div>
          <div className="d-flex align-items-start">
            <label className="title-right">
              {type == INVOICE_ADJUST_INVENTORY ? "Chi nhánh" : "Địa chỉ"} {type == INVOICE_IMPORT || type == INVOICE_ADJUST_INVENTORY ? "kho" : ""}
            </label>
            <strong>{address}</strong>
          </div>
        </div>
      ) : (
        <div className="info-card">
          <div className="d-flex align-items-start">
            <label className="title-left">Giá trị thẻ</label>
            <strong>{formatCurrency(valueCard)}</strong>
          </div>
          <div className="d-flex align-items-start">
            <label className="title-center">Số tiền tiêu dùng</label>
            <strong>{formatCurrency(pocketMoney || "0")}</strong>
          </div>
          <div className="d-flex align-items-start">
            <label className="title-right">Số tiền còn lại</label>
            <strong>{formatCurrency(remainingMoney)}</strong>
          </div>
        </div>
      )}
      {/* Chi tiết sản phẩm */}
      <div className="detail-product">
        <h3>{name}</h3>
        {children}
      </div>
      {/* Thông tin thanh toán */}
      {type !== INVOICE_ADJUST_INVENTORY && type !== HISTORY_USE_CARD_SERVICE && (
        <div className={`billing-information ${isPrintPomService ? "hide__billing-information d-none" : ""}`}>
          <div className="billing-information--left">
            <h4>Người {type == "IV4" ? "nhập hàng" : type == "IV2" ? "trả hàng" : "bán hàng"}</h4>
            <span>
              <i>(Kí tên, đóng dấu)</i>
            </span>
          </div>
          <div className="billing-information--right">
            <div className="info-payment">
              <label>Tổng tiền: </label>
              {totalMoney == 0 ? formatCurrency(totalMoney.toString()) : formatCurrency(totalMoney)}
            </div>
            <div className="info-payment">
              <label>Giảm giá: </label>
              {discount == 0 ? formatCurrency(discount.toString()) : formatCurrency(discount)}
            </div>
            <div className="info-payment">
              <label>Tiền VAT: </label>
              {vat == 0 ? formatCurrency(vat.toString()) : formatCurrency(vat)}
            </div>
            <div className="info-payment">
              <label>Tổng tiền {type == INVOICE_PURCHASE || type == INVOICE_PURCHASE_CARD ? "khách phải trả:" : "phải trả:"} </label>
              {totalAmountPayable == 0 ? formatCurrency(totalAmountPayable.toString()) : formatCurrency(totalAmountPayable)}
            </div>
            <div className="info-payment">
              <label>{type == INVOICE_PURCHASE || type == INVOICE_PURCHASE_CARD ? "Khách đã trả:" : "Thực trả nhà cung cấp:"} </label>
              {actuallyPaySupplier == 0 ? formatCurrency(actuallyPaySupplier.toString()) : formatCurrency(actuallyPaySupplier)}
            </div>
            <div className="info-payment">
              <label>Công nợ: </label>
              {debt == 0 ? formatCurrency(debt.toString()) : formatCurrency(debt)}
            </div>
            <div className="info-payment">
              <label>Phương thức thanh toán: </label>
              {paymentType == 1 ? "Tiền mặt" : paymentType == 2 ? "Chuyển khoản" : "Thẻ dịch vụ"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
interface ModalReceiptFooterProps {
  actions?: IActionModal;
  className?: string;
}

export function ModalFooterReceipt(props: ModalReceiptFooterProps) {
  const { actions, className } = props;

  // đoạn này dự tính là sẽ làm dạng select để chọn
  const optionDefault = [
    { value: "0", label: "Chọn loại in" },
    { value: "a4", label: "In loại A4" },
    { value: "a5", label: "In loại A5" },
  ];

  const [valueOption, setValueOption] = useState(null);

  const handleChangeValuePrint = (e) => {
    setValueOption(e);
  };

  useEffect(() => {
    if (valueOption?.value && valueOption.value !== "0") {
      actions.actions_right.callbackPrint(valueOption.value);
    }
  }, [valueOption]);

  return (
    <div className={`modal-receipt-footer${className ? ` ${className}` : ""}`}>
      <div className="modal-receipt-footer__actions modal-receipt-footer__actions--left">
        {actions?.actions_left?.buttons &&
          actions?.actions_left?.buttons.length > 0 &&
          actions?.actions_left?.buttons.map((action, index) => (
            <Button
              type="button"
              variant={action.variant}
              color={action.color ? action.color : "primary"}
              onClick={() => action.callback()}
              disabled={action.disabled}
              key={index}
            >
              {action.title}
            </Button>
          ))}
        {!actions?.actions_left?.buttons && actions?.actions_left?.text ? actions?.actions_left?.text : ""}
      </div>
      <div className="modal-receipt-footer__actions modal-receipt-footer__actions--right">
        {actions?.actions_right?.buttons &&
          actions?.actions_right?.buttons.length > 0 &&
          actions?.actions_right?.buttons.map((action, index) => (
            <Button
              type={action.type ?? "button"}
              variant={action.variant}
              color={action.color ? action.color : "primary"}
              onClick={() => action.callback && action.callback()}
              disabled={action.disabled}
              key={index}
            >
              {action.title}
              {action.is_loading && <Icon name="Loading" />}
            </Button>
          ))}
        {!actions?.actions_right?.buttons && actions?.actions_right?.text ? actions?.actions_right?.text : ""}

        {/* Đoạn này dùng để custom cho phần in hóa đơn */}
        {actions.actions_right.isOption && (
          <div className="custom__print">
            <SelectCustom
              id="typePrint"
              name="typePrint"
              fill={true}
              special={true}
              value={valueOption}
              options={actions.actions_right.option || optionDefault}
              placeholder="Chọn loại in"
              onChange={(e) => handleChangeValuePrint(e)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

import React, { Fragment, useState, useEffect, useContext } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "reborn-util";
import Tippy from "@tippyjs/react";
import { IOption } from "model/OtherModel";
import { IPaymentBillProps } from "model/sell/PropsModel";
import { IBoughtCardFilterRequest } from "model/boughtCard/BoughtCardRequestModel";
import { IInvoiceCreateRequest } from "model/invoice/InvoiceRequestModel";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import RadioList from "components/radio/radioList";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import InvoiceService from "services/InvoiceService";
import BoughtCardService from "services/BoughtCardService";
import BeautyBranchService from "services/BeautyBranchService";
import BoughtServiceService from "services/BoughtServiceService";
import BoughtProductService from "services/BoughtProductService";
import ImageThirdGender from "assets/images/third-gender.png";
import ShowPaymentBillModal from "./partials/ShowPaymentBillModal/ShowPaymentBillModal";
import "tippy.js/animations/scale-extreme.css";
import "./PaymentBill.scss";
import { ContextType, UserContext } from "contexts/userContext";
import Input from "components/input/input";
import CampaignService from "services/CampaignService";

export default function PaymentBill(props: IPaymentBillProps) {
  const { dataPaymentBill, tab, idCustomer, listIdCardService, listIdProduct, listIdService, productIdGetCode, invoiceCode, setInvoiceCode } = props;
  
  const navigate = useNavigate();

  const checkUserRoot = localStorage.getItem("user.root");
  const takeInfoCustomerInLocalStorage = localStorage.getItem("infoCustomer");
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [showModalInvoice, setShowModalInvoice] = useState<boolean>(false);
  const [idInvoice, setIdInvoice] = useState<number>(null);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listCardService, setListCardService] = useState([]);
  const [addFieldCard, setAddFieldCard] = useState([{ bcseId: null, valueCard: null, fee: 0 }]);
  const [validateCardFeeService, setValidateCardFeeService] = useState<boolean>(false);
  const [indexErrorCardFee, setIndexErrorCardFee] = useState<number>(null);
  const [validateBcseId, setValidateBcseId] = useState<boolean>(false);
  
  console.log('invoiceCode', invoiceCode);
  

  const getInvoiceCode = async (id: number) => {

    const response = await InvoiceService.getInvoiceCode(id);

    if (response.code === 0) {
      const result = response.result;
      setInvoiceCode(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

  };

  useEffect(() => {
    if (productIdGetCode ) {
      getInvoiceCode(productIdGetCode);
    }
  }, [productIdGetCode]);

  const listOptionPayment =
    tab === "tab_one"
      ? [
          {
            value: 1,
            label: "Tiền mặt",
          },
          {
            value: 2,
            label: "Chuyển khoản",
          },
          {
            value: 3,
            label: "Thẻ dịch vụ",
          },
        ]
      : [
          {
            value: 1,
            label: "Tiền mặt",
          },
          {
            value: 2,
            label: "Chuyển khoản",
          },
        ];

  const [formData, setFormData] = useState<IInvoiceCreateRequest>(dataPaymentBill);
  

  useEffect(() => {
    setFormData({
      ...formData,
      id: dataPaymentBill?.id,
      amount: dataPaymentBill?.amount,
      customerId: dataPaymentBill?.customerId,
      invoiceType: dataPaymentBill?.invoiceType,
      branchId: dataPaymentBill.branchId,
      campaignId: dataPaymentBill.campaignId,
    });
  }, [dataPaymentBill]);

  useEffect(() => {
    setFormData({ ...formData, debt: 0, discount: 0, paymentType: 1 });
  }, [tab]);  

  //! đoạn này dùng về sau
  const [listPromotions, setListPromotions] = useState<IOption[]>([]);

  // Chi tiết 1 chi nhánh
  const [detailBranch, setDetailBranch] = useState(null);
  const [validateFieldBranch, setValidateFieldBranch] = useState<boolean>(false);

  //? đoạn này xử lý vấn đề call api lấy ra danh sách chi nhánh
  const loadOptionBranch = async (search, loadedOptions, { page }) => {
    const param: IBeautyBranchFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      if (dataOption.length === 1) {
        setDetailBranch({
          value: dataOption[0].id,
          label: dataOption[0].name,
        });
      }

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IBeautyBranchResponse) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  // useEffect(() => {
  //   // loadOptionBranch("", "", { page: 1 });
  //   setFormData({ ...formData, branchId: dataBranch.value });
  //   setDetailBranch(dataBranch)

  // }, [dataBranch]);

  //? đoạn này xử lý vấn đề thay đổi chi nhánh
  const handleChangeValueBranch = (e) => {
    setValidateFieldBranch(false);
    setDetailBranch(e);
    setFormData({ ...formData, branchId: e.value });
  };

  // Ngày bán hàng
  const [validateFieldReceiptDate, setValidateFieldReceiptDate] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề thay đổi ngày nhập hàng
  const handleChangeValueReceiptDate = (e) => {
    setValidateFieldReceiptDate(false);

    const newReceiptDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));

    setFormData({ ...formData, receiptDate: newReceiptDate });
  };

  // validate số tiền đã trả
  const [validateFieldPaid, setValidateFieldPaid] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề thay đổi số tiền đã trả
  const handleChangeValuePaid = (e) => {
    oninput = () => {
      setValidateFieldPaid(false);
    };

    setFormData({ ...formData, paid: +e.value });
  };

  //! đoạn này validate số tiền đã trả
  const handleBlurValuePaid = (e) => {
    const value = formData?.paid;

    if (Math.abs(formData?.fee) < value) {
      setValidateFieldPaid(true);
    }
  };

  //! đoạn này xử lý tính toán lại dữ liệu số tiền phải trả và đã trả khi có tổng tiền
  useEffect(() => {
    if (formData?.discount) {
      const recalculation = formData?.amount - formData?.discount;
      setFormData({ ...formData, fee: recalculation, paid: recalculation });
    }

    if (!formData?.discount) {
      const totalAmount = dataPaymentBill?.amount;
      setFormData({ ...formData, amount: totalAmount, fee: totalAmount, paid: totalAmount });
    }

    if ((formData?.amount || dataPaymentBill?.amount) < (formData?.discount || dataPaymentBill?.discount)) {
      setFormData({ ...formData, fee: 0, paid: 0, debt: 0 });
    }
  }, [formData?.discount, formData?.amount]);

  //! đoạn này tính toán lại số tiền đã trả
  useEffect(() => {
    if (formData?.paid > 0) {
      const recalculation = formData?.fee - formData?.paid;
      setFormData({ ...formData, debt: recalculation });
    }

    if (formData?.paid == 0 || isNaN(formData?.paid) == true) {
      const totalFee = formData?.fee;
      setFormData({ ...formData, debt: totalFee });
    }

    if (Math.abs(formData?.fee) < formData?.paid) {
      setFormData({ ...formData, debt: 0 });
    }
  }, [formData?.paid, formData?.fee]);

  //! đoạn này tính toán lại công nợ
  useEffect(() => {
    if (formData?.debt > 0) {
      const recalculation = formData?.fee - formData?.debt;
      setFormData({ ...formData, paid: recalculation });
    }

    if (formData?.debt > formData?.fee) {
      setFormData({ ...formData, paid: 0 });
    }
  }, [formData?.fee, formData?.debt]);

  //! đoạn này xử lý vấn đề chọn thanh toán bằng thẻ dịch vụ
  const getListCardService = async () => {
    const param: IBoughtCardFilterRequest = {
      customerId: idCustomer,
      checkAccount: 1,
    };

    const response = await BoughtCardService.list(param);

    if (response.code === 0) {
      const result = (response.result || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          name: item.name,
          remaining: item.remaining,
          avatar: item.avatar,
          cardNumber: item.cardNumber,
        };
      });

      if (result.length > 0) {
        setListCardService(result);
      } else {
        showToast("Bạn chưa có thẻ dịch vụ nào!", "warning");
      }
    }
  };

  //! đoạn này hiển thị hình ảnh thẻ dịch vụ
  const formatOptionLabelCardService = ({ label, avatar, cardNumber, remaining }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div className="d-flex align-items-start justify-content-start flex-column">
          {label}
          <span className="subsidiary">
            Số dư: {formatCurrency(remaining)} <strong style={{ color: "#000", fontWeight: "600" }}>|</strong> Mã thẻ: {cardNumber}
          </span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (formData?.paymentType === 3 && idCustomer) {
      getListCardService();
    }
  }, [formData?.paymentType, idCustomer]);

  //* Tính toán lại số tiền khách phải trả khi dùng thẻ dịch vụ
  useEffect(() => {
    let totalCardService = 0;

    if (addFieldCard.length > 0 && formData?.paymentType == 3) {
      addFieldCard.map((item) => {
        const amountItem = item.fee;
        totalCardService += amountItem;
      });

      const account = addFieldCard.map((item) => {
        return {
          bcseId: item.bcseId,
          fee: item.fee,
        };
      });

      setFormData({
        ...formData,
        paid: totalCardService,
        debt: formData?.fee - formData.paid,
        account: JSON.stringify(account),
        amountCard: totalCardService,
      });

      if (totalCardService > formData?.fee) {
        setFormData({ ...formData, paid: 0 });
        setValidateCardFeeService(true);
      }
    } else {
      setFormData({ ...formData, account: "[]", amountCard: 0, paid: formData.fee });
    }
  }, [addFieldCard, formData?.paymentType]);

  //* đoạn này xử lý vấn đề thay đổi thẻ dịch vụ để thanh toán
  const handleChangeValueCardService = (e, idx) => {
    const value = e.value;
    setValidateBcseId(false);

    setAddFieldCard((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, bcseId: value, valueCard: e, fee: 0 };
        }
        return obj;
      })
    );
  };

  //* sử dụng số tiền trong thẻ
  const handleChangeValueCardFee = (e, idx) => {
    const value = e.floatValue;
    setValidateCardFeeService(false);

    setAddFieldCard((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          setIndexErrorCardFee(index);
          setValidateCardFeeService(obj?.valueCard.remaining < value);
          return { ...obj, fee: value };
        }
        return obj;
      })
    );
  };

  //! xóa đi 1 thẻ dịch vụ
  const handleRemoveItemCard = (idx) => {
    const result = [...addFieldCard];
    result.splice(idx, 1);

    setAddFieldCard(result);
  };

  //! xử lý gửi dữ liệu đi
  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (formData?.branchId == null && +checkUserRoot == 1) {
      setValidateFieldBranch(true);
      return;
    }

    if (formData?.receiptDate == "") {
      setValidateFieldReceiptDate(true);
      return;
    }

    const checkEmtyAddFieldCard = addFieldCard.filter((el) => el.bcseId === null);

    if (checkEmtyAddFieldCard.length > 0 && formData?.paymentType == 3) {
      setValidateBcseId(true);
      return;
    }

    setIsSubmit(true);

    const body: IInvoiceCreateRequest = {
      ...(formData as IInvoiceCreateRequest),
      ...(invoiceCode ? {invoiceCode: invoiceCode} : {} ),
      ...(dataPaymentBill ? { id: dataPaymentBill.id } : {}),
    };

    const response = await InvoiceService.create(body);

    if (response.code === 0) {
      showToast("Bán hàng thành công", "success");
      setIdInvoice(response.result?.id);
      setShowModalInvoice(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setShowModalInvoice(false);
    }

    setIsSubmit(false);
  };

  const handTemporarilyInvoice = async () => {
    if (!dataPaymentBill) return;

    const body = {
      id: dataPaymentBill.id,
    };

    const response = await InvoiceService.temporarilyInvoices(body);

    if (response.code == 0) {
      showToast("Lưu tạm hóa đơn thành công", "success");
      navigate("/sale_invoice");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Lưu tạm hóa đơn bán hàng</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn lưu tạm hóa đơn bán hàng? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => handTemporarilyInvoice(),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  //! Xóa all tất cả thẻ dịch vụ cần bán khi xác nhận hủy đơn
  const handleDeleteAllCardService = () => {
    const arrPromise = [];

    listIdCardService.map((item) => {
      const promise = new Promise((resolve, reject) => {
        BoughtCardService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa thẻ dịch vụ cần bán thành công", "success");
        setTimeout(() => {
          navigate("/sale_invoice");
        }, 1000);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  //! Xóa all tất cả dịch vụ, sản phẩm cần bán khi xác nhận hủy đơn
  const handleDeleteAllServiceProduct = () => {
    const arrServicePromise = [];
    const arrProductPromise = [];

    if (listIdProduct.length > 0) {
      listIdProduct.map((item) => {
        const promise = new Promise((resolve, reject) => {
          BoughtProductService.delete(item).then((res) => {
            resolve(res);
          });
        });

        arrProductPromise.push(promise);

        Promise.all(arrProductPromise).then((result) => {
          if (result.length > 0) {
            showToast("Xóa sản phẩm thành công", "success");
            setTimeout(() => {
              navigate("/sale_invoice");
            }, 1000);
          } else {
            showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          }
          setShowDialog(false);
          setContentDialog(null);
        });
      });
    }

    if (listIdService.length > 0) {
      listIdService.map((item) => {
        const promise = new Promise((resolve, reject) => {
          BoughtServiceService.delete(item).then((res) => {
            resolve(res);
          });
        });

        arrServicePromise.push(promise);

        Promise.all(arrServicePromise).then((result) => {
          if (result.length > 0) {
            showToast("Xóa dịch vụ thành công", "success");
            setTimeout(() => {
              navigate("/sale_invoice");
            }, 1000);
          } else {
            showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          }
          setShowDialog(false);
          setContentDialog(null);
        });
      });
    }
  };

  const showDialogConfirmDelete = () => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy hóa đơn bán hàng</Fragment>,
      message: (
        <Fragment>
          Hiện tại bạn đang có{" "}
          {tab == "tab_two" ? (
            <strong>{listIdCardService.length} thẻ dịch vụ cần bán</strong>
          ) : (
            <strong>
              {listIdProduct.length} sản phẩm và {listIdService.length} dịch vụ cần bán.
            </strong>
          )}{" "}
          Bạn có chắc chắn muốn hủy hóa đơn bán hàng? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        if (tab == "tab_two") {
          handleDeleteAllCardService();
        } else {
          handleDeleteAllServiceProduct();
        }

        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <div className="payment__bill--item">
      <label className="title__payment--bill">Thông tin hóa đơn bán hàng</label>
      <form className="form__payment--bill" onSubmit={(e) => onSubmit(e)}>
        <div className="list-form-group">
          {/* {+checkUserRoot == 1 && (
            <div className="form-group">
              <SelectCustom
                id="branchId"
                name="branchId"
                label="Chi nhánh"
                fill={true}
                required={true}
                error={validateFieldBranch}
                message="Chi nhánh không được bỏ trống"
                options={[]}
                disabled={true}
                value={detailBranch}
                onChange={(e) => handleChangeValueBranch(e)}
                isAsyncPaginate={true}
                placeholder="Chọn chi nhánh"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadOptionBranch}
              />
            </div>
          )} */}

          {invoiceCode ? 
            <div className="form-group">
              <Input
                id="invoiceCode"
                name="invoiceCode"
                label="Mã hoá đơn"
                fill={true}
                required={true}
                placeholder={"Mã hoá đơn"}
                value={invoiceCode}
                onChange={(e) => {
                  setInvoiceCode(e.target.value);
                }}
              />
            </div>
          : null}

          <div className="form-group">
            <DatePickerCustom
              label="Ngày bán"
              name="receiptDate"
              fill={true}
              value={formData?.receiptDate}
              onChange={(e) => handleChangeValueReceiptDate(e)}
              placeholder="Chọn ngày bán hàng"
              required={true}
              iconPosition="left"
              icon={<Icon name="Calendar" />}
              isMaxDate={true}
              disabled={dataPaymentBill?.amount == 0}
              error={validateFieldReceiptDate}
              message="Vui lòng chọn ngày bán hàng"
            />
          </div>

          <div className="form-group">
            <NummericInput
              label="Tổng tiền"
              name="amount"
              fill={true}
              required={true}
              value={formData?.amount}
              disabled={true}
              thousandSeparator={true}
            />
          </div>

          <div className="form-group">
            <SelectCustom fill={true} label="Khuyến mại" options={listPromotions} placeholder="Chọn khuyến mại" />
          </div>

          <div className="form-group">
            <NummericInput
              label="Được giảm"
              name="discount"
              fill={true}
              value={formData?.discount}
              disabled={formData?.amount === 0}
              thousandSeparator={true}
              onValueChange={(e) => setFormData({ ...formData, discount: +e.value })}
              error={formData?.amount < formData?.discount}
              message="Số tiền được giảm giá phải nhỏ hơn tổng tiền"
            />
          </div>

          <div className="form-group">
            <NummericInput
              label="Khách phải trả"
              name="fee"
              fill={true}
              required={true}
              value={formData?.fee}
              disabled={true}
              thousandSeparator={true}
            />
          </div>

          <div className="form-group">
            <NummericInput
              label="Khách đã trả"
              name="paid"
              fill={true}
              required={true}
              value={formData?.paid}
              disabled={formData?.amount === 0 || formData?.amount - formData?.discount === 0}
              thousandSeparator={true}
              onValueChange={(e) => handleChangeValuePaid(e)}
              error={validateFieldPaid}
              message="Số tiền khách đã trả nhỏ hơn số tiền khách phải trả"
              onBlur={(e) => handleBlurValuePaid(e)}
            />
          </div>

          <div className="form-group">
            <NummericInput
              label="Công nợ"
              name="debt"
              fill={true}
              value={formData?.debt}
              disabled={formData?.amount === 0 || formData?.amount - formData?.discount === 0}
              onValueChange={(e) => setFormData({ ...formData, debt: +e.value })}
              thousandSeparator={true}
              error={formData?.debt > formData?.fee}
              message="Công nợ nhỏ hơn hoặc bằng với số tiền khách đã trả"
            />
          </div>

          <div className="form-group" id="PaymentType">
            <RadioList
              name="paymentType"
              title="Kiểu thanh toán"
              options={listOptionPayment}
              value={formData?.paymentType}
              onChange={(e) => setFormData({ ...formData, paymentType: +e.target.value })}
            />
          </div>

          {formData?.paymentType == 3 && (
            <div className="form-group" id="CardPaymentBill">
              <div className="list__card--payment-bill">
                {listCardService &&
                  listCardService.length > 0 &&
                  addFieldCard.map((item, idx) => {
                    return (
                      <div key={idx} className="form__card--item">
                        <div className="change__card--item">
                          <div className="form-group">
                            <SelectCustom
                              fill={true}
                              required={true}
                              label={`Thẻ ${item.valueCard?.name.replace("Thẻ" || "thẻ", "") || ""}`}
                              options={listCardService.filter((el) => el.value !== item.bcseId)}
                              value={item.valueCard}
                              onChange={(e) => handleChangeValueCardService(e, idx)}
                              placeholder="Chọn thẻ dịch vụ"
                              special={true}
                              error={validateBcseId}
                              isFormatOptionLabel={true}
                              formatOptionLabel={formatOptionLabelCardService}
                              message="Thẻ dịch vụ không được bỏ trống"
                            />
                          </div>
                          <div className="form-group">
                            <NummericInput
                              fill={true}
                              required={true}
                              label="Số tiền tiêu dùng trong thẻ"
                              value={item.fee}
                              thousandSeparator={true}
                              placeholder="Nhập số tiền sử dụng trong thẻ"
                              onValueChange={(e) => handleChangeValueCardFee(e, idx)}
                              error={idx === indexErrorCardFee ? validateCardFeeService : false}
                              message={`${
                                item.fee > item.valueCard?.remaining
                                  ? "Số tiền tiêu dùng nhỏ hơn số dư thẻ"
                                  : "Số tiền thanh toán qua thẻ nhỏ hơn khách phải trả"
                              }`}
                              disabled={!item.bcseId}
                            />
                          </div>
                        </div>
                        <div className={`action-change ${addFieldCard.length > 1 ? "update__width--item" : ""}`}>
                          <Tippy content="Thêm thẻ" delay={[100, 0]} animation="scale-extreme">
                            <span className="icon-add" onClick={() => setAddFieldCard([...addFieldCard, { bcseId: null, valueCard: null, fee: 0 }])}>
                              <Icon name="PlusCircleFill" />
                            </span>
                          </Tippy>

                          {addFieldCard.length > 1 && (
                            <Tippy content="Xóa thẻ" delay={[100, 0]} animation="scale-extreme">
                              <span className="icon-delete" onClick={() => handleRemoveItemCard(idx)}>
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <div className="action__apply--payment">
          <div className="side__action">
            {takeInfoCustomerInLocalStorage ? (
              dataPaymentBill?.amount !== 0 && (
                <Fragment>
                  <Button
                    color="destroy"
                    variant="outline"
                    disabled={isSubmit}
                    onClick={(e) => {
                      e.preventDefault();
                      showDialogConfirmDelete();
                    }}
                  >
                    Hủy đơn
                  </Button>
                  <Button
                    color="warning"
                    variant="outline"
                    disabled={isSubmit}
                    onClick={(e) => {
                      e.preventDefault();
                      showDialogConfirmCancel();
                    }}
                  >
                    Lưu tạm
                  </Button>
                </Fragment>
              )
            ) : dataPaymentBill?.amount === 0 ? (
              <Button
                color="primary"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/sale_invoice");
                }}
              >
                Quay lại
              </Button>
            ) : (
              <Fragment>
                <Button
                  color="destroy"
                  variant="outline"
                  disabled={isSubmit}
                  onClick={(e) => {
                    e.preventDefault();
                    showDialogConfirmDelete();
                  }}
                >
                  Hủy đơn
                </Button>
                <Button
                  color="warning"
                  variant="outline"
                  disabled={isSubmit}
                  onClick={(e) => {
                    e.preventDefault();
                    showDialogConfirmCancel();
                  }}
                >
                  Lưu tạm
                </Button>
              </Fragment>
            )}
          </div>

          <Button
            type="submit"
            color="primary"
            disabled={
              isSubmit ||
              formData?.amount === 0 ||
              validateFieldReceiptDate ||
              validateFieldPaid ||
              validateFieldBranch ||
              validateCardFeeService ||
              validateBcseId ||
              formData?.amount < formData?.discount ||
              formData?.debt > formData?.fee
            }
          >
            Tạo đơn bán
            {isSubmit ? <Icon name="Loading" /> : null}
          </Button>
        </div>
      </form>
      <ShowPaymentBillModal onShow={showModalInvoice} idInvoice={idInvoice} tab={tab} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

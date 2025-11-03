import React, { Fragment, useState, useEffect } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "reborn-util";
import Tippy from "@tippyjs/react";
import { IOption } from "model/OtherModel";
import { IPaymentBillProps } from "model/sell/PropsModel";
import { IInvoiceCreateRequest } from "model/invoice/InvoiceRequestModel";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import OfferService from "services/OfferService";
import BeautyBranchService from "services/BeautyBranchService";
import OfferCardService from "services/OfferCardService";
import OfferServiceService from "services/OfferServiceService";
import OfferProductService from "services/OfferProductService";
import ImageThirdGender from "assets/images/third-gender.png";
import ShowPaymentBillModal from "./partials/ShowPaymentBillModal/ShowPaymentBillModal";
import "tippy.js/animations/scale-extreme.css";
import "./PaymentBill.scss";

export default function PaymentBill(props: any) {
  const { dataPaymentBill, tab, idCustomer, listIdCardService, listIdProduct, listIdService } = props;
  const navigate = useNavigate();

  const checkUserRoot = localStorage.getItem("user.root");
  const takeInfoCustomerInLocalStorage = localStorage.getItem("infoCustomer");

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

  const [formData, setFormData] = useState<IInvoiceCreateRequest>(dataPaymentBill);

  useEffect(() => {
    setFormData({
      ...formData,
      id: dataPaymentBill?.id,
      amount: dataPaymentBill?.amount,
      customerId: dataPaymentBill?.customerId,
      invoiceType: dataPaymentBill?.invoiceType,
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
      ...(dataPaymentBill ? { id: dataPaymentBill.id } : {}),
    };

    const response = await OfferService.create(body);

    if (response.code === 0) {
      showToast("Báo giá thành công", "success");
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

    const response = await OfferService.temporarilyOffers(body);

    if (response.code == 0) {
      showToast("Lưu tạm báo giá thành công", "success");
      navigate("/offer");
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
      title: <Fragment>Lưu tạm báo giá</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn lưu tạm báo giá? Thao tác này không thể khôi phục.</Fragment>,
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
        OfferCardService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa thẻ dịch vụ thành công", "success");
        setTimeout(() => {
          navigate("/offer");
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
          OfferProductService.delete(item).then((res) => {
            resolve(res);
          });
        });

        arrProductPromise.push(promise);

        Promise.all(arrProductPromise).then((result) => {
          if (result.length > 0) {
            showToast("Xóa sản phẩm thành công", "success");
            setTimeout(() => {
              navigate("/offer");
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
          OfferServiceService.delete(item).then((res) => {
            resolve(res);
          });
        });

        arrServicePromise.push(promise);

        Promise.all(arrServicePromise).then((result) => {
          if (result.length > 0) {
            showToast("Xóa dịch vụ thành công", "success");
            setTimeout(() => {
              navigate("/offer");
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
            <strong>{listIdCardService.length} thẻ dịch vụ cần báo giá</strong>
          ) : (
            <strong>
              {listIdProduct.length} sản phẩm và {listIdService.length} dịch vụ cần báo giá.
            </strong>
          )}{" "}
          Bạn có chắc chắn muốn hủy báo giá này? Thao tác này không thể khôi phục.
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
      <label className="title__payment--bill">Thông tin báo giá</label>
      <form className="form__payment--bill" onSubmit={(e) => onSubmit(e)}>
        <div className="list-form-group">
          {+checkUserRoot == 1 && (
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
          )}

          <div className="form-group">
            <DatePickerCustom
              label="Ngày báo giá"
              name="receiptDate"
              fill={true}
              value={formData?.receiptDate}
              onChange={(e) => handleChangeValueReceiptDate(e)}
              placeholder="Chọn ngày báo giá"
              required={true}
              iconPosition="left"
              icon={<Icon name="Calendar" />}
              isMaxDate={true}
              disabled={dataPaymentBill?.amount == 0}
              error={validateFieldReceiptDate}
              message="Vui lòng chọn ngày báo giá"
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
                    Hủy báo giá
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
                  navigate("/offer");
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
            Tạo báo giá
            {isSubmit ? <Icon name="Loading" /> : null}
          </Button>
        </div>
      </form>
      <ShowPaymentBillModal onShow={showModalInvoice} idInvoice={idInvoice} tab={tab} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

import React, { Fragment, useState, useEffect } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { PaymentImportInvoicesProps } from "model/invoice/PropsModel";
import { IInvoiceCreateRequest } from "model/invoice/InvoiceRequestModel";
import InvoiceService from "services/InvoiceService";
import InventoryService from "services/InventoryService";
import ProductImportService from "services/ProductImportService";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import RadioList from "components/radio/radioList";
import NummericInput from "components/input/numericInput";
import FileUpload from "components/fileUpload/fileUpload";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import ShowInvoiceModal from "./partials/ShowInvoiceModal/ShowInvoiceModal";
import "./PaymentImportInvoices.scss";

interface IOptionInventory {
  value: number;
  label: string;
  address: string;
  branchName: string;
}

export default function PaymentImportInvoices(props: PaymentImportInvoicesProps) {
  const { data, listInvoiceDetail } = props;

  const navigate = useNavigate();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [showModalInvoice, setShowModalInvoice] = useState<boolean>(false);
  const [idInvoice, setIdInvoice] = useState<number>(null);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [formData, setFormData] = useState<IInvoiceCreateRequest>(data);

  //! đoạn này xử lý vấn đề validate
  const [validateReceiptDate, setValidateReceiptDate] = useState<boolean>(false);
  const [validatePaid, setValidatePaid] = useState<boolean>(false);
  const [validateInventory, setValidateInventory] = useState<boolean>(false);

  useEffect(() => {
    setFormData({ ...formData, id: data?.id, amount: data?.amount });
  }, [data]);

  const [infoBranch, setInfoBranch] = useState({
    branch: "",
    address: "",
  });

  const [listInventory, setListInventory] = useState<IOptionInventory[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);

  //! đoạn này call api lấy ra thông tin kho hàng
  const getListInventory = async () => {
    if (!listInventory || listInventory.length === 0) {
      setIsLoadingInventory(true);

      const response = await InventoryService.import();

      if (response.code === 0) {
        const dataOption = response.result || [];

        setListInventory([
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  address: item.address,
                  branchName: item.branchName,
                };
              })
            : []),
        ]);
      }

      setIsLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (data?.inventoryId) {
      getListInventory();
    }
  }, [data]);

  //! đoạn này xử lý vấn đề thay đổi kho hàng
  const handleChangeValueInventory = (e) => {
    setValidateInventory(false);
    setFormData({ ...formData, inventoryId: e.value });
    setInfoBranch({ address: e.address, branch: e.branchName });
  };

  //! đoạn này xử lý vấn đề thay đổi ngày nhập hàng
  const handleChangeValueReceiptDate = (e) => {
    setValidateReceiptDate(false);

    const newReceiptDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));

    setFormData({ ...formData, receiptDate: newReceiptDate });
  };

  //! đoạn này xử lý vấn đề thay đổi số tiền đã trả
  const handleChangeValuePaid = (e) => {
    oninput = () => {
      setValidatePaid(false);
    };

    setFormData({ ...formData, paid: +e.value });
  };

  //! đoạn này validate số tiền đã trả
  const handleBlurValuePaid = (e) => {
    const value = formData?.paid;

    if (Math.abs(formData?.fee) < value) {
      setValidatePaid(true);
    }
  };

  //! đoạn này xử lý tính toán lại dữ liệu số tiền phải trả và đã trả khi có tổng tiền
  useEffect(() => {
    if (formData?.discount > 0) {
      const recalculation = formData?.amount - formData?.discount;
      setFormData({ ...formData, fee: recalculation, paid: recalculation });
    }

    if (formData?.discount === 0 || isNaN(formData?.discount) == true) {
      const totalAmount = formData?.amount;
      setFormData({ ...formData, fee: totalAmount, paid: totalAmount });
    }

    if (formData?.amount < formData?.discount) {
      setFormData({ ...formData, fee: 0, paid: 0, debt: 0 });
    }

    if (formData?.amount - formData?.discount == 0) {
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

  const onSubmit = async (e) => {
    e.preventDefault();

    if (formData?.inventoryId == null) {
      setValidateInventory(true);
      return;
    }

    if (formData?.receiptDate == "") {
      setValidateReceiptDate(true);
      return;
    }

    setIsSubmit(true);

    const body: IInvoiceCreateRequest = {
      ...(formData as IInvoiceCreateRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await InvoiceService.create(body);

    if (response.code === 0) {
      showToast("Nhập hàng thành công", "success");
      setIdInvoice(response.result?.id);
      setShowModalInvoice(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setShowModalInvoice(false);
    }

    setIsSubmit(false);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Lưu tạm hóa đơn nhập hàng</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn lưu tạm hóa đơn nhập hàng? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        showToast("Lưu tạm hóa đơn thành công", "success");
        navigate("/invoice_order");
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const showDialogConfirmDelete = () => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy hóa đơn nhập hàng</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy hóa đơn nhập hàng? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleDeleteInvoice();
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleDeleteInvoice = () => {
    const arrPromise = [];

    listInvoiceDetail.map((item) => {
      const promise = new Promise((resolve, reject) => {
        ProductImportService.delete(item?.id).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Hủy hóa đơn thành công", "success");
        navigate("/invoice_order");
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    });
  };

  return (
    <div className="payment__import--invoice">
      <div className="card-box">
        <label className="label-title">Thông tin hóa đơn nhập hàng</label>
        <form className="form__payment__import--invoice" onSubmit={(e) => onSubmit(e)}>
          <div className="list-form-group">
            <div className="form-group">
              <SelectCustom
                fill={true}
                options={listInventory}
                required={true}
                name="inventoryId"
                placeholder="Chọn kho hàng"
                label="Kho hàng"
                value={formData?.inventoryId}
                onMenuOpen={getListInventory}
                onChange={(e) => handleChangeValueInventory(e)}
                isLoading={isLoadingInventory}
                error={validateInventory}
                message="Vui lòng chọn kho hàng"
              />
            </div>

            <div className="form-group">
              <Input fill={true} disabled={true} label="Địa chỉ" value={infoBranch?.address} placeholder="Chọn kho hàng để xem địa chỉ" />
            </div>

            <div className="form-group">
              <Input fill={true} disabled={true} label="Chi nhánh" value={infoBranch?.branch} placeholder="Chọn kho hàng để xem chi nhánh" />
            </div>

            <div className="form-group">
              <DatePickerCustom
                label="Ngày nhập"
                name="receiptDate"
                fill={true}
                value={formData?.receiptDate}
                onChange={(e) => handleChangeValueReceiptDate(e)}
                placeholder="Chọn ngày nhập hàng"
                required={true}
                iconPosition="left"
                icon={<Icon name="Calendar" />}
                disabled={formData?.amount == 0}
                isMaxDate={true}
                error={validateReceiptDate}
                message="Vui lòng chọn ngày nhập hàng"
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
              <NummericInput
                label="Được giảm giá"
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
                label="Số tiền phải trả"
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
                label="Số tiền đã trả"
                name="paid"
                fill={true}
                required={true}
                value={formData?.paid}
                disabled={formData?.amount === 0 || formData?.amount - formData?.discount === 0}
                thousandSeparator={true}
                onValueChange={(e) => handleChangeValuePaid(e)}
                error={validatePaid}
                message="Số tiền đã trả nhỏ hơn số tiền phải trả"
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
                message="Công nợ nhỏ hơn hoặc bằng với số tiền đã trả"
              />
            </div>

            <div className="form-group">
              <RadioList
                name="paymentType"
                title="Kiểu thanh toán"
                options={[
                  {
                    value: 1,
                    label: "Tiền mặt",
                  },
                  {
                    value: 2,
                    label: "Chuyển khoản",
                  },
                ]}
                value={formData?.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: +e.target.value })}
              />
            </div>
          </div>
          {formData?.paymentType == 2 && (
            <div className="form-group">
              <FileUpload type="avatar" label="Ảnh chứng từ" formData={formData} setFormData={setFormData} />
            </div>
          )}
          <div className="action__import--order">
            <div className="side__action">
              {data?.amount === 0 ? (
                <Button
                  color="primary"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/invoice_order");
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
                validateReceiptDate ||
                validatePaid ||
                validateInventory ||
                formData?.amount < formData?.discount ||
                formData?.debt > formData?.fee
              }
            >
              Tạo đơn nhập
              {isSubmit ? <Icon name="Loading" /> : null}
            </Button>
          </div>
        </form>
      </div>
      <ShowInvoiceModal onShow={showModalInvoice} idInvoice={idInvoice} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

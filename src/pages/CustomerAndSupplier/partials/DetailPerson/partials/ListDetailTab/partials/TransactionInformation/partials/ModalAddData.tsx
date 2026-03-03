import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import _ from "lodash";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Icon from "components/icon";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import TransactionInformationService from "services/fintech/TransactionInformationService";
import { showToast } from "utils/common";

import "./ModalAddData.scss";
import moment from "moment";

export default function ModalAddData({ onShow, onHide, dataProps, customerId }) {
  const focusedElement = useActiveElement();

  const [data, setData] = useState(null);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        casa: data?.casa ?? "",
        fd: data?.fd ?? "",
        trf: data?.trf ?? "",
        loan: data?.loan ?? "",
        currency: data?.currency ?? "",
        exchageRate: data?.exchageRate ?? "",
        transactionHistory: data?.transactionHistory ?? "",
        transactionFrequency: data?.transactionFrequency ?? "",
        transactionDate: data?.transactionDate ? moment(data?.transactionDate).toDate() : "",
        customerId: data?.customerId ?? "",
      } as any),
    [onShow, data]
  );

  useEffect(() => {
    if (dataProps != null) {
      setData({ ...dataProps });
    }
  }, [dataProps]);

  const validations: IValidation[] = [
    {
      name: "casa",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const listField = useMemo(
    () =>
      [
        {
          label: "Ngày giao dịch",
          name: "transactionDate",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          hasSelectTime: true,
          minDate: moment().toDate(),
          placeholder: "Nhập ngày giao dịch",
        },
        {
          label: "CASA",
          name: "casa",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "FD",
          name: "fd",
          type: "number",
          fill: true,
        },
        {
          label: "TRF",
          name: "trf",
          type: "number",
          fill: true,
        },
        {
          label: "Cho vay",
          name: "loan",
          type: "number",
          fill: true,
        },
        {
          label: "Loại tiền tệ",
          name: "currency",
          type: "text",
          fill: true,
        },
        {
          label: "Tỷ giá quy đổi",
          name: "exchageRate",
          type: "number",
          fill: true,
        },
        {
          label: "Tần suất giao dịch của khách hàng",
          name: "transactionFrequency",
          type: "number",
          fill: true,
        },
        {
          label: "Lịch sử giao dịch của khách hàng",
          name: "transactionHistory",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [formData]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as any),
      customerId,
      // transactionDate: moment(formData.values.transactionDate).format("YYYY-MM-DD HH:mm:ss"),
      transactionDate: moment(formData.values.transactionDate).format("YYYY-MM-DD[T]HH:mm:ss"),
    };

    const response = await TransactionInformationService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} thông tin giao dịch thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setData(null);
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
            callback: () => {
              _.isEqual(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: dataProps?.id ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: _.isEqual(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleClearForm(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          handleClearForm(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-transaction"
      >
        <form className="form-add-data" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${dataProps?.id ? "Chỉnh sửa" : "Thêm mới"} thông tin giao dịch`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

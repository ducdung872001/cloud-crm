import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import NetServiceChargeService from "services/fintech/NetServiceChargeService";
import { showToast } from "utils/common";

import "./ModalAddData.scss";

export default function ModalAddData({ onShow, onHide, dataProps, customerId }) {
  const focusedElement = useActiveElement();

  const [data, setData] = useState(null);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
    ({
      accountManagement: data?.accountManagement ?? "",
      transactionFee: data?.transactionFee ?? "",
      guaranteeFee: data?.guaranteeFee ?? "",
      tf: data?.tf ?? "",
      fx: data?.fx ?? "",
      other: data?.other ?? "",
      transactionDate: data?.transactionDate ?? "",
      customerId: data?.customerId ?? "",
    } as any),
    [onShow, data]
  );

  const validations: IValidation[] = [
    {
      name: "accountManagement",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    if (dataProps != null) {
      setData({ ...dataProps });
    }
  }, [dataProps]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // Hàm kiểm tra giá trị có nằm ngoài khoảng 0 - 99,999,999 không
  const isOutOfRange = (value: any): boolean => {
    if (value === "" || value === undefined || value === null) return false;
    const num = Number(value);
    return isNaN(num) || num < 0 || num > 99999999;
  };

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
          placeholder: "Nhập ngày giao dịch",
          messageWarning: "Ngày giao dịch là bắt buộc",
        },
        {
          label: "Phí quản lý tài khoản",
          name: "accountManagement",
          type: "number",
          fill: true,
          required: true,
          isWarning: isOutOfRange(formData.values.accountManagement),
          messageWarning: "Chỉ được phép nhập giá trị trong khoảng từ 0 đến 99,999,999",
        },
        {
          label: "Phí giao dịch",
          name: "transactionFee",
          type: "number",
          fill: true,
          isWarning: isOutOfRange(formData.values.transactionFee),
          messageWarning: "Chỉ được phép nhập giá trị trong khoảng từ 0 đến 99,999,999",
        },
        {
          label: "Phí bảo lãnh",
          name: "guaranteeFee",
          type: "number",
          fill: true,
          required: false,
          isWarning: isOutOfRange(formData.values.guaranteeFee),
          messageWarning: "Chỉ được phép nhập giá trị trong khoảng từ 0 đến 99,999,999",
        },
        {
          label: "TF",
          name: "tf",
          type: "number",
          fill: true,
          isWarning: isOutOfRange(formData.values.tf),
          messageWarning: "Chỉ được phép nhập giá trị trong khoảng từ 0 đến 99,999,999",
        },
        {
          label: "FX",
          name: "fx",
          type: "number",
          fill: true,
          isWarning: isOutOfRange(formData.values.fx),
          messageWarning: "Chỉ được phép nhập giá trị trong khoảng từ 0 đến 99,999,999",
        },
        {
          label: "Khác",
          name: "other",
          type: "number",
          fill: true,
          isWarning: isOutOfRange(formData.values.other),
          messageWarning: "Chỉ được phép nhập giá trị trong khoảng từ 0 đến 99,999,999",
        },
      ] as IFieldCustomize[],
    [formData.values]
  );

  const hasOutOfRangeValue = useMemo(() => {
    return (
      isOutOfRange(formData.values.accountManagement) ||
      isOutOfRange(formData.values.transactionFee) ||
      isOutOfRange(formData.values.guaranteeFee) ||
      isOutOfRange(formData.values.tf) ||
      isOutOfRange(formData.values.fx) ||
      isOutOfRange(formData.values.other)
    );
  }, [formData.values]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasOutOfRangeValue) {
      showToast("Vui lòng kiểm tra lại các trường phí, giá trị phải từ 0 đến 99,999,999", "warning");
      return;
    }

    if (!formData.values.transactionDate || formData.values.transactionDate === "") {
      showToast("Ngày giao dịch là bắt buộc", "warning");
      return;
    }

    if (!formData.values.accountManagement && formData.values.accountManagement !== 0) {
      showToast("Phí quản lý tài khoản là bắt buộc", "warning");
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as any),
      customerId,
      transactionDate: moment(formData.values.transactionDate).format('YYYY-MM-DDTHH:mm:ss'),
    };

    const response = await NetServiceChargeService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} thu phí dịch vụ thành công`, "success");
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
            disabled:
              _.isEqual(formData.values, values) ||
              hasOutOfRangeValue ||
              isSubmit,
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
        className="modal-cic-info"
      >
        <form className="form-add-data" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${dataProps?.id ? "Chỉnh sửa" : "Thêm mới"} thu phí dịch vụ`} toggle={() => !isSubmit && handleClearForm(false)} />
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

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
import FullFinancialReportService from "services/fintech/FullFinancialReportService";
import { showToast } from "utils/common";

import "./ModalAddData.scss";
import { MONTH_REPORT_REGEX } from "utils/constant";

export default function ModalAddData({ onShow, onHide, dataProps, customerId }) {
  const focusedElement = useActiveElement();

  const [data, setData] = useState(null);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
    ({
      balanceSheet: data?.balanceSheet ?? "",
      cashFlow: data?.cashFlow ?? "",
      businessReport: data?.businessReport ?? "",
      auditReport: data?.auditReport ?? "",
      month: data?.month ?? "",
      year: data?.year ?? "",
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
      name: "balanceSheet",
      rules: "required",
    },
    {
      name: "month",
      rules: "regex",
    },
    {
      name: "balanceSheet",
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
          label: "Kỳ báo cáo (tháng)",
          name: "month",
          type: "number",
          fill: true,
          regex: new RegExp(MONTH_REPORT_REGEX),
          messageErrorRegex: "Tháng phải là số từ 1 đến 12",
        },
        {
          label: "Kỳ báo cáo (năm)",
          name: "year",
          type: "number",
          fill: true,
        },
        {
          label: "Bảng cân đối kế toán",
          name: "balanceSheet",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Báo cáo lưu chuyển tiền tệ",
          name: "cashFlow",
          type: "text",
          fill: true,
        },
        {
          label: "Báo cáo kết quả kinh doanh",
          name: "businessReport",
          type: "text",
          fill: true,
        },
        {
          label: "Báo cáo kiểm toán",
          name: "auditReport",
          type: "text",
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
      customerId
    };

    const response = await FullFinancialReportService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} báo cáo tài chính đầy đủ thành công`, "success");
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
              (formData.errors && Object.keys(formData.errors).length > 0),
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
        className="modal-full-financial-report"
      >
        <form className="form-add-data" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${dataProps?.id ? "Chỉnh sửa" : "Thêm mới"} báo cáo tài chính đầy đủ`} toggle={() => !isSubmit && handleClearForm(false)} />
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

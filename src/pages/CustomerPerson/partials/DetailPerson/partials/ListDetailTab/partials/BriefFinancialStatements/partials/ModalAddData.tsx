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
import BriefFinancialReportService from "services/fintech/BriefFinancialReportService";
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
      revenue: data?.revenue ?? "",
      capital: data?.capital ?? "",
      creditRating: data?.creditRating ?? "",
      // startTime: moment().format("MM/DD/YYYY"),
      shortTermAsset: data?.shortTermAsset ?? "",
      longTermAsset: data?.longTermAsset ?? "",
      shortTermDebt: data?.shortTermDebt ?? "",
      longTermDebt: data?.longTermDebt ?? "",
      costGoodsSold: data?.costGoodsSold ?? "",
      grossProfit: data?.grossProfit ?? "",
      expenseOperating: data?.expenseOperating ?? "",
      taxCost: data?.taxCost ?? "",
      profitOperating: data?.profitOperating ?? "",
      expenseInterest: data?.expenseInterest ?? "",
      profitBeforeTax: data?.profitBeforeTax ?? "",
      corpIncomeTax: data?.corpIncomeTax ?? "",
      netProfit: data?.netProfit ?? "",
      month: data?.month ?? "",
      year: data?.year ?? "",
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
      name: "revenue",
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
          required: false,
        },
        {
          label: "Kỳ báo cáo (năm)",
          name: "year",
          type: "number",
          fill: true,
          required: false,
        },
        {
          label: "Doanh thu của DN",
          name: "revenue",
          type: "number",
          fill: true,
          required: false,
        },
        {
          label: "Vốn điều lệ",
          name: "capital",
          type: "number",
          fill: true,
        },
        {
          label: "Xếp hạng tín dụng",
          name: "creditRating",
          type: "select",
          fill: true,
          required: false,
          options: [
            {
              value: "AAA",
              label: "AAA",
            },
            {
              value: "AA",
              label: "AA",
            },
            {
              value: "A",
              label: "A",
            },
            {
              value: "BBB",
              label: "BBB",
            },
            {
              value: "BB",
              label: "BB",
            },
            {
              value: "B",
              label: "B",
            },
            {
              value: "CCC",
              label: "CCC",
            },
            {
              value: "CC",
              label: "CC",
            },
          ],
        },
        {
          label: "Tổng tài sản ngắn hạn",
          name: "shortTermAsset",
          type: "number",
          fill: true,
        },
        {
          label: "Tổng tài sản dài hạn",
          name: "longTermAsset",
          type: "number",
          fill: true,
        },
        {
          label: "Nợ ngắn hạn",
          name: "shortTermDebt",
          type: "number",
          fill: true,
        },
        {
          label: "Nợ dài hạn",
          name: "longTermDebt",
          type: "number",
          fill: true,
        },
        {
          label: "Giá vốn hàng bán",
          name: "costGoodsSold",
          type: "number",
          fill: true,
        },
        {
          label: "Lợi nhuận gộp",
          name: "grossProfit",
          type: "number",
          fill: true,
        },
        {
          label: "Chi phí hoạt động",
          name: "expenseOperating",
          type: "number",
          fill: true,
        },
        {
          label: "Chi phí thuế",
          name: "taxCost",
          type: "number",
          fill: true,
        },
        {
          label: "Lợi nhuận hoạt động",
          name: "profitOperating",
          type: "number",
          fill: true,
        },
        {
          label: "Chi phí lãi vay",
          name: "expenseInterest",
          type: "number",
          fill: true,
        },
        {
          label: "Lợi nhuận trước thuế",
          name: "profitBeforeTax",
          type: "number",
          fill: true,
        },
        {
          label: "Thuế thu nhập doanh nghiệp",
          name: "corpIncomeTax",
          type: "number",
          fill: true,
        },
        {
          label: "Lợi nhuận ròng",
          name: "netProfit",
          type: "number",
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

    const response = await BriefFinancialReportService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} báo cáo tài chính rút gọn thành công`, "success");
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
        className="modal-brief-financial-report"
      >
        <form className="form-add-data" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${dataProps?.id ? "Chỉnh sửa" : "Thêm mới"} báo cáo tài chính rút gọn`} toggle={() => !isSubmit && handleClearForm(false)} />
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

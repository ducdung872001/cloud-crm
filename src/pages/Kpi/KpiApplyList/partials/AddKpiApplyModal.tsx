import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddKpiApplyModalProps } from "model/kpiApply/PropsModel";
import { IKpiApplyRequest } from "model/kpiApply/KpiApplyRequestModel";
import KpiApplyService from "services/KpiApplyService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import Icon from "components/icon";

import "./AddKpiApplyModal.scss";

export default function AddKpiModal(props: IAddKpiApplyModalProps) {
  const { onShow, onHide, data } = props;

  const nameCommon = "phiếu giao KPI";

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listKpi, setListKpi] = useState<IOption[]>(null);
  const [isLoadingKpi, setIsLoadingKpi] = useState<boolean>(false);

  const onSelectOpenKpi = async () => {
    if (!listKpi || listKpi.length === 0) {
      setIsLoadingKpi(true);
      const dataOption = await SelectOptionData("kpiId");

      if (dataOption) {
        setListKpi([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingKpi(false);
    }
  };

  useEffect(() => {
    if (data && data.kpiId) {
      onSelectOpenKpi();
    }
  }, [data]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        description: data?.description ?? "",
        kpiId: data?.kpiId ?? "",
        startTime: data?.startTime ?? "",
        endTime: data?.endTime ?? "",
      } as IKpiApplyRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "kpiId",
      rules: "required",
    },
    {
      name: "startTime",
      rules: "required",
    },
    {
      name: "endTime",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const listField = useMemo(
    () =>
      [
        {
          label: `Tên ${nameCommon}`,
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mô tả",
          name: "description",
          type: "textarea",
          fill: true,
        },
        {
          label: "Bộ KPI",
          name: "kpiId",
          type: "select",
          fill: true,
          options: listKpi,
          onMenuOpen: onSelectOpenKpi,
          isLoading: isLoadingKpi,
          required: true,
        },
        {
          label: "Thời gian bắt đầu",
          name: "startTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập thời gian bắt đầu",
          hasSelectTime: false,
          maxDate: new Date(formData?.values?.endTime),
        },
        {
          label: "Thời gian kết thúc",
          name: "endTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập thời gian kết thúc",
          hasSelectTime: false,
          minDate: new Date(formData?.values?.startTime),
        },
      ] as IFieldCustomize[],
    [nameCommon, listKpi, isLoadingKpi, formData?.values]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);
    const body: IKpiApplyRequest = {
      ...(formData.values as IKpiApplyRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await KpiApplyService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} ${nameCommon} thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
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
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
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
        onHide(false);
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
          onHide(false);
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
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-kpi-apply"
      >
        <form className="form-kpi-apply" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} ${nameCommon}`} toggle={() => !isSubmit && onHide(false)} />
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

import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FileUpload from "components/fileUpload/fileUpload";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IKpiDatasourceRequest } from "model/kpiDatasource/KpiDatasourceRequestModel";
import { AddKpiDatasourceModalProps } from "model/kpiDatasource/PropsModel";
import { PHONE_REGEX, EMAIL_REGEX } from "utils/constant";
import { showToast } from "utils/common";
import { createArrayFromTo, createArrayFromToR, getMaxDay, isDifferenceObj } from 'reborn-util';
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import KpiDatasourceService from "services/KpiDatasourceService";
import "./AddKpiDatasourceModal.scss";

export default function AddKpiDatasourceModal(props: AddKpiDatasourceModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
    ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      code: data?.code ?? "",
      position: data?.position ?? 0,
      type: data?.type ?? 0,
    } as IKpiDatasourceRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "code",
      rules: "required",
    },
    {
      name: "type",
      rules: "required",
    },
  ];

  const listFieldBasic: IFieldCustomize[] = [
    {
      label: "Tên nguồn cấp",
      name: "name",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "Mã nguồn cấp",
      name: "code",
      type: "text",
      fill: true,
      required: true,
    },    
    {
      label: "Loại nguồn",
      name: "type",
      type: "select",
      fill: true,
      options: [
        {
          value: "1",
          label: "Bán hàng",
        },
        {
          value: "2",
          label: "Khách hàng",
        },
        {
          value: "3",
          label: "Tổng đài",
        },
        {
          value: "4",
          label: "Chiến dịch",
        },
        {
          value: "5",
          label: "Cơ hội",
        },
        {
          value: "6",
          label: "Hỗ trợ",
        },
        {
          value: "7",
          label: "Bảo hành",
        },
        {
          value: "8",
          label: "Tài chính",
        },
      ]
    },
    {
      label: "Thứ tự",
      name: "position",
      type: "number",
      fill: true,
    },
    {
      label: "Mô tả",
      name: "description",
      type: "textarea",
      fill: true,
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

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const body: IKpiDatasourceRequest = {
      ...(formData.values as IKpiDatasourceRequest),
      ...(data ? { id: data.id } : {})
    };
    const response = await KpiDatasourceService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} nguồn cấp thành công`, "success");
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
        className="modal-add-branch"
      >
        <form className="form-branch-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} nguồn cấp`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic">
                {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

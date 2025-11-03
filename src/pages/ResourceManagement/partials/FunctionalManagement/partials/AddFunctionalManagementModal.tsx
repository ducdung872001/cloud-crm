import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddFunctionalManagementModalProps } from "model/functionalManagement/PropsModel";
import { IFunctionalManagementRequest } from "model/functionalManagement/FunctionalManagementRequest";
import FunctionalManagementService from "services/FunctionalManagementService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Checkbox from "components/checkbox/checkbox";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import "./AddFunctionalManagementModal.scss";

export default function AddFunctionalManagementModal(props: IAddFunctionalManagementModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const listOptions = [
    {
      name: "VIEW",
    },
    {
      name: "ADD",
    },
    {
      name: "UPDATE",
    },
    {
      name: "DELETE",
    },
    {
      name: "IMPORT",
    },
    {
      name: "EXPORT",
    },
  ];

  const [optionActions, setOptionActions] = useState<string[]>(["VIEW", "ADD", "UPDATE", "DELETE"]);

  const values = useMemo(
    () =>
    ({
      name: data?.name ?? "",
      code: data?.code ?? "",
      uri: data?.uri ?? "",
      actions: data?.actions ?? JSON.stringify(optionActions),
      app: data?.app ?? "",
      description: data?.description ?? "",      
    } as IFunctionalManagementRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "app",
      rules: "required",
    },
    {
      name: "name",
      rules: "required",
    },
    {
      name: "actions",
      rules: "required",
    },
  ];

  const listFieldBasic: IFieldCustomize[] = [
    {
      label: "Ứng dụng",
      name: "app",
      type: "select",
      fill: true,
      required: true,
      options: [
        {
          value: "crm",
          label: "CRM",
        },
        {
          value: "cms",
          label: "CMS",
        },
        {
          value: "market",
          label: "MARKET",
        },
        {
          value: "community",
          label: "COMMUNITY",
        },
      ],
    },
    {
      label: "Tên chức năng",
      name: "name",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "Mã chức năng",
      name: "code",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "Đường dẫn",
      name: "uri",
      type: "text",
      fill: true,
      required: true,
    },
  ];

  const listFieldAdvanced: IFieldCustomize[] = [  
    {
      label: "Mô tả",
      name: "description",
      type: "textarea",
      fill: true,
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  //? đoạn này xử lý vấn đề xem ông nào được check
  const handleChangeValueAction = (item: string, isChecked: boolean) => {
    if (isChecked) {
      setOptionActions && setOptionActions([...(optionActions ?? []), item]);
    } else {
      setOptionActions && setOptionActions(optionActions?.filter((i) => i !== item) ?? []);
    }
  };

  //! đoạn này xử lý vấn đề fill mặc định các option
  useEffect(() => {
    setFormData({ ...formData, values: { ...formData?.values, actions: JSON.stringify(optionActions) } });
  }, [optionActions]);

  //* đoạn này xử lý vấn đề khi mình update thì nó sẽ lấy những item được check trước đó
  useEffect(() => {
    if (data?.id && data?.actions !== null) {
      const takeDataAction = JSON.parse(data?.actions);
      setOptionActions(takeDataAction);
    }
  }, [data?.id]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBasic, ...listFieldAdvanced]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);
    const body: IFunctionalManagementRequest = {
      ...(formData.values as IFunctionalManagementRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await FunctionalManagementService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} chức năng thành công`, "success");
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
        className="modal-add-functional-management"
      >
        <form className="form-functional-management-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} chức năng`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listFieldBasic.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                  formData={formData}
                />
              ))}

              <div className="list__options--action">
                <label className="name__option">Lựa chọn hành động</label>

                <div className="option__items">
                  {listOptions.map((item, index) => {
                    const isChecked = optionActions && setOptionActions && optionActions.some((element) => element === item.name);

                    return (
                      <Checkbox
                        key={index}
                        label={item.name}
                        checked={isChecked}
                        onChange={(e) => handleChangeValueAction(item.name, e.target.checked)}
                      />
                    );
                  })}
                </div>
              </div>

              {listFieldAdvanced.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldAdvanced, setFormData)}
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

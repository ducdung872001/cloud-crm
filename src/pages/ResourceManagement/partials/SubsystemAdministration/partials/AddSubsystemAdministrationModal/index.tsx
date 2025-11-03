import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ISubsystemAdministrationRequest } from "model/subsystemAdministration/SubsystemAdministrationRequest";
import { IAddSubsystemAdministrationModalProps } from "model/subsystemAdministration/PropsModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import SubsystemAdministrationService from "services/SubsystemAdministrationService";
import "./index.scss";

export default function AddSubsystemAdministrationModal(props: IAddSubsystemAdministrationModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listParentIdStemAdmin, setListParentIdStemAdmin] = useState<IOption[]>(null);
  const [isLoadingParentIdStemAdmin, setIsLoadingParentIdStemAdmin] = useState<boolean>(false);

  const onSelectOpenParentIdStemAdmin = async () => {
    if (!listParentIdStemAdmin || listParentIdStemAdmin.length === 0) {
      setIsLoadingParentIdStemAdmin(true);

      const param = {
        limit: 100,
        app: formData?.values.app
      };

      const response = await SubsystemAdministrationService.list(param);

      if (response.code === 0) {
        const dataOption = (response.result?.items || []).filter((item) => item.parentId === null);
        setListParentIdStemAdmin([
          { value: null, label: "Chọn phân hệ cha" },
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
              return { 
                value: item.id,
                label: item.name,
              };
            })
            : []),
        ]);
      }

      setIsLoadingParentIdStemAdmin(false);
    }
  };

  useEffect(() => {
    if (data?.parentId) {
      onSelectOpenParentIdStemAdmin();
    }

    if (data?.parentId === null) {
      setListParentIdStemAdmin([]);
    }
  }, [data]);

  const values = useMemo(
    () =>
    ({
      name: data?.name ?? "",
      parentId: data?.parentId ?? null,
      position: data?.position ?? "0",
      app: data?.app
    } as ISubsystemAdministrationRequest),
    [onShow, data]
  );

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if(formData.values.app){
      onSelectOpenParentIdStemAdmin();
    }
  }, [formData])


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
      name: "position",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
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
          label: "Tên phân hệ",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Phân hệ cha",
          name: "parentId",
          type: "select",
          fill: true,
          options: listParentIdStemAdmin,
          onMenuOpen: onSelectOpenParentIdStemAdmin,
          isLoading: isLoadingParentIdStemAdmin,
          disabled: formData?.values.app ? false : true
        }, 
        {
          label: "Thứ tự hiển thị",
          name: "position",
          type: "number",
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [listParentIdStemAdmin, isLoadingParentIdStemAdmin, formData]
  );



  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: ISubsystemAdministrationRequest = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as ISubsystemAdministrationRequest),
    };

    const response = await SubsystemAdministrationService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} phân hệ thành công`, "success");
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
        className="modal-add-systemadmin"
      >
        <form className="form-systemadmin-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} phân hệ`} toggle={() => !isSubmit && onHide(false)} />
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

import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Tippy from "@tippyjs/react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddApplicationModalProps } from "model/installApplication/PropsModel";
import { IInstallApplicationRequest } from "model/installApplication/InstallApplicationRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FileUpload from "components/fileUpload/fileUpload";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import InstallApplicationService from "services/InstallApplicationService";
import TagsInput from "components/tagsInput/tagsInput";
import "./AddApplicationModal.scss";

export default function AddApplicationModal(props: IAddApplicationModalProps) {
  const { onShow, onHide, data } = props;

  const defaultDataKeyValue = {
    clientId: "",
    clientKey: "",
  };

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [showValueKey, setShowValueKey] = useState<boolean>(false);
  const [dataKeyValue, setDataKeyValue] = useState(defaultDataKeyValue);

  const handleGetKey = async () => {
    const response = await InstallApplicationService.takeKey();

    if (response.code === 0) {
      const result = response.result;

      setDataKeyValue({
        clientId: result.clientId,
        clientKey: result.clientKey,
      });
    } else {
      setDataKeyValue(defaultDataKeyValue);
    }
  };

  useEffect(() => {
    if (onShow && !data) {
      handleGetKey();
    }
  }, [onShow, data]);

  const [listTag, setListTag] = useState([]);

  useEffect(() => {
    if (onShow && data?.whitelistDomains) {
      const result = JSON.parse(data?.whitelistDomains);
      setListTag(result);
    }
  }, [onShow, data?.whitelistDomains]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        avatar: data?.avatar ?? "",
        status: data?.status.toString() ?? "0",
        clientId: data?.clientId ?? dataKeyValue.clientId ?? "",
        clientKey: data?.clientKey ?? dataKeyValue.clientKey ?? "",
        whitelistDomains: data && data.whitelistDomains ? JSON.parse(data.whitelistDomains) : [],
      } as IInstallApplicationRequest),
    [data, onShow, dataKeyValue]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "status",
      rules: "required",
    },
    {
      name: "clientId",
      rules: "required",
    },
    {
      name: "clientKey",
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

  useEffect(() => {
    if (listTag) {
      setFormData({ ...formData, values: { ...formData.values, whitelistDomains: listTag } });
    }
  }, [listTag]);

  const handleGetValue = async () => {
    const response = await InstallApplicationService.takeKey();

    if (response.code === 0) {
      const result = response.result;

      setFormData({ ...formData, values: { ...formData.values, clientKey: result.clientKey } });
    }
  };

  const handCopyValueClientId = () => {
    const value = formData?.values?.clientId;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        showToast("Copy ID ứng dụng thành công", "success");
      })
      .catch(() => {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      });
  };

  const handleCopyValueClientKey = () => {
    const value = formData?.values?.clientKey;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        showToast("Copy khóa mật ứng dụng thành công", "success");
      })
      .catch(() => {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      });
  };

  const listField = useMemo(
    () =>
      [
        {
          type: "custom",
          name: "avatar_app",
          snippet: <FileUpload label="Ảnh ứng dụng" type="avatar" formData={formData} setFormData={setFormData} />,
        },
        {
          label: "ID ứng dụng",
          name: "clientId",
          type: "text",
          fill: true,
          required: true,
          iconPosition: "right",
          icon: <Icon name="Copy" />,
          iconClickEvent: () => handCopyValueClientId(),
          disabled: data || dataKeyValue ? true : false,
          placeholder: "Nhập ID ứng dụng",
        },
        {
          type: "custom",
          name: "clientKey",
          snippet: (
            <div className="client__key">
              <div className="label__key">
                <span className="name--key">Khóa bí mật của ứng dụng</span>
                <Tippy content="Đổi khóa bí mật của ứng dụng">
                  <span className="icon__change" onClick={() => handleGetValue()}>
                    <Icon name="ResetPassword" />
                  </span>
                </Tippy>
              </div>
              <Input
                name="client_key"
                type={showValueKey ? "text" : "password"}
                iconPosition="right"
                fill={true}
                icons={[
                  { name: `${showValueKey ? "Eye" : "EyeSlash"}`, clickEvent: () => setShowValueKey(!showValueKey) },
                  { name: "Copy", clickEvent: () => handleCopyValueClientKey() },
                ]}
                value={formData?.values?.clientKey}
                placeholder="Nhập khóa bí mật của ứng dụng"
                onChange={(e) => setFormData({ ...formData, values: { ...formData.values, clientKey: e.target.value } })}
                disabled={data || dataKeyValue ? true : false}
              />
            </div>
          ),
        },
        {
          label: "Tên ứng dụng",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Trạng thái ứng dụng",
          name: "status",
          type: "radio",
          options: [
            { value: "0", label: "Đang phát triển" },
            { value: "1", label: "Chế độ chính thức" },
          ],
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [formData, showValueKey, data, dataKeyValue]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const changeFormData: any = {
      ...formData.values,
      whitelistDomains: JSON.stringify(listTag),
    };

    setIsSubmit(true);
    const body: IInstallApplicationRequest = {
      ...(changeFormData as IInstallApplicationRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await InstallApplicationService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} ứng dụng thành công`, "success");
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
              _.isEqual(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || _.isEqual(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
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
        className="modal-add--app"
      >
        <form className="form-add--app" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} ứng dụng`} toggle={() => !isSubmit && onHide(false)} />
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
              <div className="form-group">
                <TagsInput
                  label="Whitelist Domains"
                  tagsData={listTag}
                  acceptPaste={true}
                  maxLength={100}
                  addTag={(listTagNew) => setListTag(listTagNew)}
                  removeTag={(listTagNew) => setListTag(listTagNew)}
                  placeholder="Nhập whitelist domains"
                />
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

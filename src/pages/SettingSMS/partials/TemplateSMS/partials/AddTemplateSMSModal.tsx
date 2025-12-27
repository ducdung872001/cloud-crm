import React, { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ITemplateSMSRequest } from "model/templateSMS/TemplateSMSRequest";
import { AddTemplateSMSModalProps } from "model/templateSMS/PropsModel";
import { IConfigCodeResponseModel } from "model/configCode/ConfigCodeResponse";
import TemplateSMSService from "services/TemplateSMSService";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import ConfigCodeService from "services/ConfigCodeService";
import "./AddTemplateSMSModal.scss";

export default function AddTemplateSMSModal(props: AddTemplateSMSModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listConfigCode, setListConfigCode] = useState<IOption[]>(null);
  const [isLoadingConfigCode, setIsLoadingConfigCode] = useState<boolean>(false);

  const [listBrandName, setListBrandName] = useState<IOption[]>(null);
  const [isLoadingBrandName, setIsLoadingBrandName] = useState<boolean>(false);

  const [listConfigSMS, setListConfigSMS] = useState<IConfigCodeResponseModel[]>([]);
  const [isLoadingConfigSMS, setIsLoadingConfigSMS] = useState<boolean>(false);

  const [cursorPosition, setCursorPosition] = useState<number>(0);

  const getListConfigSMS = async () => {
    setIsLoadingConfigSMS(true);

    const param = {
      type: 1,
    };

    const response = await ConfigCodeService.list(param);

    if (response.code === 0) {
      const result = response.result;
      setListConfigSMS(result.items);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoadingConfigSMS(false);
  };

  useEffect(() => {
    getListConfigSMS();
  }, []);

  const onSelectOpenConfigCode = async () => {
    if (!listConfigCode || listConfigCode.length === 0) {
      setIsLoadingConfigCode(true);

      const dataOption = await SelectOptionData("tcyId");
      if (dataOption) {
        setListConfigCode([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingConfigCode(false);
    }
  };

  useEffect(() => {
    if (data?.tcyId) {
      onSelectOpenConfigCode();
    }

    if (data?.tcyId === null) {
      setListConfigCode([]);
    }
  }, [data]);

  const onSelectOpenBrandName = async () => {
    if (!listBrandName || listBrandName.length === 0) {
      setIsLoadingBrandName(true);

      const dataOption = await SelectOptionData("brandnameId");
      if (dataOption) {
        setListBrandName([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingBrandName(false);
    }
  };

  useEffect(() => {
    if (data?.brandnameId) {
      onSelectOpenBrandName();
    }

    if (data?.brandnameId === null) {
      setListBrandName([]);
    }
  }, [data]);

  const values = useMemo(
    () =>
      ({
        title: data?.title ?? "",
        content: data?.content ?? "",
        initialContent: data?.content ?? "",
        tcyId: data?.tcyId ?? null,
        brandnameId: data?.brandnameId ?? null,
      } as ITemplateSMSRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "title",
      rules: "required",
    },
    {
      name: "content",
      rules: "required",
    },
    {
      name: "tcyId",
      rules: "required",
    },
    {
      name: "brandnameId",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Chọn brandname",
          name: "brandnameId",
          type: "select",
          options: listBrandName,
          onMenuOpen: onSelectOpenBrandName,
          fill: true,
          required: true,
          isLoading: isLoadingBrandName,
        },
        {
          label: "Tiêu đề sms",
          name: "title",
          type: "text",
          fill: true,
          maxLength: 300,
          required: true,
        },
        {
          label: "Chọn chủ đề SMS",
          name: "tcyId",
          type: "select",
          options: listConfigCode,
          onMenuOpen: onSelectOpenConfigCode,
          fill: true,
          required: true,
          isLoading: isLoadingConfigCode,
        },
      ] as IFieldCustomize[],
    [listConfigCode, isLoadingConfigCode, listBrandName, isLoadingBrandName]
  );

  const listFieldContent = useMemo(
    () =>
      [
        {
          label: "Nội dung tin",
          name: "content",
          type: "textarea",
          fill: true,
          required: true,
          onClick: (e) => handleChangeContent(e),
          onChange: (e) => handleChangeContent(e),
        },
      ] as IFieldCustomize[],
    []
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  // đoạn này sẽ xử lý thay đổi nội dung
  const handleChangeContent = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  const handlePointerContent = (data) => {
    const value = data.code;

    let content = formData.values.content;
    const textBeforeCursorPosition = content.substring(0, cursorPosition);
    const textAfterCursorPosition = content.substring(cursorPosition);

    content = textBeforeCursorPosition + value + textAfterCursorPosition;

    setFormData({ ...formData, values: { ...formData.values, content } });
  };

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = Validate(validations, formData, [...listField, ...listFieldContent]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: ITemplateSMSRequest = {
      ...(formData.values as ITemplateSMSRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await TemplateSMSService.update(body);
    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} mẫu tin thành công`, "success");
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
        className="modal-add-template-sms"
      >
        <form className="form-template-sms-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} mẫu tin SMS`} toggle={() => !isSubmit && onHide(false)} />
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
              <div className="code-sms">
                {listConfigSMS.map((item, idx) => (
                  <span key={idx} className="name-template" onClick={() => handlePointerContent(item)}>
                    {item.name}
                  </span>
                ))}
              </div>
              {listFieldContent.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldContent, setFormData)}
                  formData={formData}
                />
              ))}
              <span className="noted">
                <strong>Lưu ý: </strong>
                Nội dung được lưu sẽ được chuyển sang dạng không dấu.
              </span>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Tippy from "@tippyjs/react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import Input from "components/input/input";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import PartnerCallService from "services/PartnerCallService";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddPartnerCallModelProps } from "model/partnerCall/PropsModel";
import { IPartnerCallRequestModel } from "model/partnerCall/PartnerCallRequestModel";
import { useActiveElement } from "utils/hookCustom";
import { PHONE_REGEX } from "utils/constant";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import "tippy.js/animations/scale-extreme.css";
import "./AddPartnerCallModel.scss";

export default function AddPartnerCallModel(props: IAddPartnerCallModelProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [addFieldConfig, setAddFieldConfig] = useState<any[]>([{ key: "", value: "" }]);

  const values = useMemo(
    () =>
    ({
      partnerName: data?.partnerName ?? "",
      partnerCode: data?.partnerCode ?? "",
      partnerConfig: data?.partnerConfig ?? "",
      contactName: data?.contactName ?? "",
      contactPhone: data?.contactPhone ?? "",
      address: data?.address ?? "",
    } as IPartnerCallRequestModel),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "partnerName",
      rules: "required",
    },
    {
      name: "contactName",
      rules: "required",
    },
    {
      name: "contactPhone",
      rules: "nullable|regex",
    },
  ];

  const listFieldPartner: IFieldCustomize[] = [
    {
      label: "Tên đối tác",
      name: "partnerName",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "Mã đối tác",
      name: "partnerCode",
      type: "text",
      fill: true,
      required: true,
    },
  ];

  const listFieldContact: IFieldCustomize[] = [
    {
      label: "Tên người liên hệ hỗ trợ",
      name: "contactName",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "SĐT người liên hệ hỗ trợ",
      name: "contactPhone",
      type: "text",
      fill: true,
      regex: new RegExp(PHONE_REGEX),
      messageErrorRegex: "Số điện thoại không đúng định dạng",
      placeholder: "Nhập SĐT người liên hệ hỗ trợ",
      required: true,
    },
    {
      label: "Trụ sở của đối tác",
      name: "address",
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

  // đoạn này xử lý conver object to array fieldConfig lúc sửa
  useEffect(() => {
    if (data?.partnerConfig !== undefined) {
      const dataItem = JSON.parse(data?.partnerConfig);
      const changeDataItem = Object.entries(dataItem).map((item) => {
        return {
          key: item[0],
          value: item[1],
        };
      });

      setAddFieldConfig([...changeDataItem]);
    }
  }, [data?.partnerConfig]);

  // đoạn này xử lý conver array to object fieldConfig lúc gửi đi
  useEffect(() => {
    const result = Object.fromEntries(addFieldConfig.map((item) => [item.key, item.value]));

    setFormData({ ...formData, values: { ...formData.values, partnerConfig: JSON.stringify(result) } });
  }, [addFieldConfig]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldPartner, ...listFieldContact]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: IPartnerCallRequestModel = {
      ...(formData.values as IPartnerCallRequestModel),
      ...(data ? { id: data.id } : {}),
    };

    const response = await PartnerCallService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} đối tác thành công`, "success");
      onHide(true);
      setAddFieldConfig([{ key: "", value: "" }]);
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

  const handleRemoveItemConfig = (idx) => {
    const result = [...addFieldConfig];
    result.splice(idx, 1);

    setAddFieldConfig(result);
  };

  // xử lý thay đổi giá trị key config
  const handleChangeKeyConfig = (e, idx) => {
    const value = e.target.value;

    setAddFieldConfig((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, key: value };
        }
        return obj;
      })
    );
  };

  // xử lý thay đổi giá trị value config
  const handleChangeValueConfig = (e, idx) => {
    const value = e.target.value;

    setAddFieldConfig((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, value: value };
        }
        return obj;
      })
    );
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-partnercall"
      >
        <form className="form-partnercall-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} đối tác`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="list-form-partner">
                {listFieldPartner.map((field, index) => (
                  <FieldCustomize
                    field={field}
                    key={index}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldPartner, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>

              <div className="list-field-config">
                <label className="title-config">Cấu hình</label>
                {addFieldConfig.map((item, idx) => {
                  return (
                    <div key={idx} className="field-config-item">
                      <div className="change-value-config">
                        <div className="form-group">
                          <Input type="text" value={item.key} fill={true} placeholder="Nhập khóa" onChange={(e) => handleChangeKeyConfig(e, idx)} />
                        </div>
                        <div className="form-group">
                          <Input
                            type="text"
                            value={item.value}
                            fill={true}
                            placeholder="Nhập giá trị"
                            onChange={(e) => handleChangeValueConfig(e, idx)}
                          />
                        </div>
                      </div>
                      <div className="action-change">
                        <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                          <span className="icon-add" onClick={() => setAddFieldConfig([...addFieldConfig, { key: "", value: "" }])}>
                            <Icon name="PlusCircleFill" />
                          </span>
                        </Tippy>

                        {addFieldConfig.length > 1 ? (
                          <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                            <span className="icon-delete" onClick={() => handleRemoveItemConfig(idx)}>
                              <Icon name="Trash" />
                            </span>
                          </Tippy>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="list-form-contact">
                {listFieldContact.map((field, index) => (
                  <FieldCustomize
                    field={field}
                    key={index}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldContact, setFormData)}
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

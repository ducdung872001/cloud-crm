import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import Input from "components/input/input";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import SwitchboardService from "services/SwitchboardService";
import PartnerCallService from "services/PartnerCallService";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddSwitchboardModelProps } from "model/switchboard/PropsModel";
import { ISwitchboardRequestModel } from "model/switchboard/SwitchboardRequestModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import "./AddSwitchboardModel.scss";

interface IPartnerSMS {
  value: number;
  label: string;
  partnerConfig: string;
}

export default function AddSwitchboardModel(props: IAddSwitchboardModelProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listPartner, setListPartner] = useState<IPartnerSMS[]>(null);
  const [isLoadingPartner, setIsLoadingPartner] = useState<boolean>(false);
  const [addFieldConfig, setAddFieldConfig] = useState<any[]>([{ key: "", value: "" }]);
  const [validateFieldConfig, setValidateFieldConfig] = useState<boolean>(false);

  const onSelectOpenPartner = async () => {
    if (!listPartner || listPartner.length === 0) {
      setIsLoadingPartner(true);

      const response = await PartnerCallService.list();

      if (response.code === 0) {
        const dataOption = response.result;
        setListPartner([
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
              return {
                value: item.id,
                label: item.partnerName,
                partnerConfig: item.partnerConfig,
              };
            })
            : []),
        ]);
      }

      setIsLoadingPartner(false);
    }
  };

  useEffect(() => {
    if (data?.partnerId && onShow) {
      onSelectOpenPartner();
    }

    if (data?.partnerId == null) {
      setListPartner([]);
    }
  }, [data, onShow]);

  const values = useMemo(
    () =>
    ({
      name: data?.name ?? "",
      expiredDate: data?.expiredDate ?? "",
      partnerId: data?.partnerId ?? null,
      partnerConfig: data?.partnerConfig ?? "",
    } as ISwitchboardRequestModel),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "expiredDate",
      rules: "required",
    },
    {
      name: "partnerId",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên tổng đài",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Ngày hết hạn đăng ký",
          name: "expiredDate",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Chọn ngày hết hạn đăng ký",
        },
        {
          label: "Chọn đối tác Tổng đài",
          name: "partnerId",
          type: "select",
          options: listPartner,
          onMenuOpen: onSelectOpenPartner,
          isLoading: isLoadingPartner,
          fill: true,
          required: true,
          onChange: (e) => handleChangeValuePartner(e),
        },
      ] as IFieldCustomize[],
    [listPartner, isLoadingPartner]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //! đoạn này xử lý vấn đề khi chọn đối tác thì fill dữ liệu ra
  const handleChangeValuePartner = (data) => {
    setValidateFieldConfig(false);

    const converPartnerConfig = JSON.parse(data.partnerConfig);
    const result = Object.entries(converPartnerConfig).map((item) => {
      return {
        key: item[0],
        value: "",
      };
    });

    setAddFieldConfig([...result]);
  };

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

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const checkEmtyAddFieldConfig = addFieldConfig.filter((el) => el.value === "");

    if (checkEmtyAddFieldConfig.length > 0) {
      setValidateFieldConfig(true);
      return;
    }

    setIsSubmit(true);

    const body: ISwitchboardRequestModel = {
      ...(formData.values as ISwitchboardRequestModel),
      ...(data ? { id: data.id } : {}),
    };

    const response = await SwitchboardService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} Tổng đài thành công`, "success");
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
            disabled:
              isSubmit ||
              validateFieldConfig ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, validateFieldConfig]
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
        setAddFieldConfig([{ key: "", value: "" }]);
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
        className="modal-add-switchboard"
      >
        <form className="form-switchboard-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} Tổng đài`}
            toggle={() => {
              !isSubmit && onHide(false);
              setAddFieldConfig([{ key: "", value: "" }]);
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              <div className="list-field-basic">
                {listField.map((field, index) => (
                  <FieldCustomize
                    field={field}
                    key={index}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>

              <div className="list-field-config">
                <label className="title-config">Cấu hình</label>
                {addFieldConfig.map((item, idx) => {
                  return (
                    <div key={idx} className={`field-config-item ${validateFieldConfig ? "emty__value" : ""}`}>
                      <div className="change-value-config">
                        <div className="form-group">
                          <Input type="text" value={item.key} fill={true} placeholder="Nhập khóa" disabled={true} />
                        </div>
                        <div className="form-group">
                          <Input
                            type="text"
                            value={item.value}
                            fill={true}
                            placeholder="Nhập giá trị"
                            onChange={(e) => handleChangeValueConfig(e, idx)}
                            error={item.value === "" ? validateFieldConfig : false}
                            message="Vui lòng nhập giá trị"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
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

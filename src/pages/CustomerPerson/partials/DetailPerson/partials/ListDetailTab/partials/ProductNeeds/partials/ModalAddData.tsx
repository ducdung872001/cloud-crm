import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Icon from "components/icon";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import ProductDemandService from "services/fintech/ProductDemandService";
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
      type: data?.type ?? "",
      name: data?.name ?? "",
      usedTime: data?.usedTime ?? "",
      quantity: data?.quantity ?? "",
      favorites: data?.favorites ?? "",
      statistics: data?.statistics ?? "",
      costs: data?.costs ?? "",
      isUsed: data?.isUsed ?? "",
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
      name: "type",
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
          label: "Loại sản phẩm",
          name: "type",
          type: "select",
          fill: true,
          required: false,
          options: [
            {
              value: "1",
              label: "Tài khoản tiền gửi thanh toán",
            },
            {
              value: "2",
              label: "Tiền gửi",
            },
            {
              value: "3",
              label: "Tín dụng",
            },
            {
              value: "4",
              label: "Bảo hiểm",
            },
            {
              value: "5",
              label: "Thẻ",
            },
            {
              value: "6",
              label: "Lienviet24h",
            },
            {
              value: "7",
              label: "Tài trợ thương mại",
            },
            {
              value: "8",
              label: "Dịch vụ thanh toán trong nước",
            },
            {
              value: "9",
              label: "Dịch vụ nhận/ chuyển tiền quốc tế",
            },
            {
              value: "10",
              label: "Dịch vụ bảo lãnh",
            },
            {
              value: "11",
              label: "Dịch vụ ngoại hối",
            },
          ],
        },
        {
          label: "Tên sản phẩm",
          name: "name",
          type: "text",
          fill: true,
        },
        {
          label: "Thời gian sử dụng",
          name: "usedTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          hasSelectTime: true,
          placeholder: "Nhập thời gian sử dụng",
        },
        {
          label: "Số lượng sản phẩm đã dùng",
          name: "quantity",
          type: "number",
          fill: true,
        },
        {
          label: "Sản phẩm yêu thích",
          name: "favorites",
          type: "textarea",
          fill: true,
        },
        {
          label: "Sự hài lòng về sử dụng sản phẩm",
          name: "statistics",
          type: "textarea",
          fill: true,
        },
        {
          label: "Chi phí sử dụng sản phẩm",
          name: "costs",
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

    const response = await ProductDemandService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} nhu cầu sản phẩm thành công`, "success");
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
        className="modal-product-needs"
      >
        <form className="form-add-data" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${dataProps?.id ? "Chỉnh sửa" : "Thêm mới"} nhu cầu sản phẩm`} toggle={() => !isSubmit && handleClearForm(false)} />
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

import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFormData } from "model/FormModel";
import { ICustomPlaceholderRequest } from "model/customPlaceholder/CustomPlaceholderRequestModel";
import { ICustomPlaceholderModalProps } from "model/customPlaceholder/PropsModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { ICustomerSendSMSRequestModel } from "model/customer/CustomerRequestModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import { convertToId } from "reborn-util";
import Input from "components/input/input";
import CustomerService from "services/CustomerService";
import "./AddCustomPlaceholderSmsModal.scss";

export default function AddCustomPlaceholderSmsModal(props: ICustomPlaceholderModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [mapCode, setMapCode] = useState({});

  const values = useMemo(
    () =>
    ({
      codes: data?.codes ?? [],
      customerId: data?.customerId || 0,
      templateId: data?.templateId || 0,
    } as ICustomPlaceholderRequest),
    [data, onShow]
  );
  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    let mapCode = {};
    (values?.codes || [] as any).map(item => {
      mapCode[item] = '';
    });

    setMapCode(mapCode);
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);
    const body: ICustomerSendSMSRequestModel = {
      templateId: formData?.values?.templateId,
      customerId: formData?.values?.customerId,
      mapCustomPlaceholder: mapCode
    };

    const response = await CustomerService.customerSendSMS(body);
    if (response.code === 0 && response.status !== 2) {
      showToast("Gửi SMS thành công", "success");
      onHide(true);
      setIsSubmit(false);
    } else {
      console.log(response);
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
              onHide(false)
            },
          },
          {
            title: "Gửi sms",
            type: "submit",
            color: "primary",
            disabled: false,
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

  /**
   * Cập nhật lại giá trị vào đây
   * @param value 
   */
  const handleUpdate = (field, value) => {
    mapCode[field] = value;
    setMapCode(mapCode);
  }

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-custom-placeholder"
      >
        <form className="form-custom-placeholder" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Thay thế nội dung`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {(formData?.values?.codes ? formData?.values?.codes : []).map((field, index) => (
                <div className="form-group" id={`Field${convertToId(field)}`} key={index}>
                  <Input
                    type={'text'}
                    label={field}
                    name={field}
                    id={field}
                    placeholder={'Nhập thay thế'}
                    onChange={(e) => {
                      handleUpdate(field, e.target.value);
                    }}
                  />
                </div>
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

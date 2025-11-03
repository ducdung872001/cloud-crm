import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, getPageOffset, isDifferenceObj } from "reborn-util";
import "./MarketingChannelInternal.scss";

export default function MarketingChannelInternal(props: any) {
  const { onShow, onHide, data} = props;
  const focusedElement = useActiveElement();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const value = useMemo(
    () =>
    ({
      send: 'email'
    } as any),
    [data, onShow]
  );  

  const validations: IValidation[] = [
    {
      name: "send",
      rules: "required",
    },
    
  ];

  const [formData, setFormData] = useState<IFormData>({ values: value });  

  const listField = useMemo(
    () =>
      [
        {
          label: "",
          name: "send",
          type: "radio",
          options: [
            {
              value: 'email',
              label: "Email Marketing",
            },
            {
              value: 'sms',
              label: "SMS Marketing",
            },
            {
                value: 'marketing_automation',
                label: "Marketing Automation",
              },
          ],
          fill: true,
        },
       
      ] as IFieldCustomize[],
    [formData?.values]
  );

  useEffect(() => {
    setFormData({ ...formData, values: value, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [value]);

  const onSubmit = async () => {
    // e.preventDefault();

    const errors = Validate(validations, formData, [...listField]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    handleClearForm(true, formData.values?.send, data.id);

    // setIsSubmit(true);

    const body = {
        ...(formData.values as any),
        // ...(data ? { id: data.id } : {}),
    };

    // const response = await ContractService.contractUpdate(body);

    // if (response.code === 0) {
    //     showToast(`${data ? 'Cập nhật' : 'Thêm'} phụ lục hợp đồng thành công`, "success");
    //     setIsSubmit(false);
    //     getList(params);
    //     cancelAdd();
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //   setIsSubmit(false);
    // }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Huỷ",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
                handleClearForm(false);
                // !isDifferenceObj(formData.values, value) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit ,
                        // || !isDifferenceObj(formData.values, value) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
                onSubmit();
            },
          },
        ],
      },
    }),
    [formData, value, isSubmit]
  );

  const handleClearForm = (acc: boolean, type?, mbtId?) => {
    onHide(acc, type, mbtId);
    
  };
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
        if (isDifferenceObj(formData.values, value)) {
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
        toggle={() => {
            if(!isSubmit){
                handleClearForm(false);
            }
        }}
        className="modal-channel-internal"
      >
        <div className="container-channel-internal">
          <ModalHeader
            title={`Kênh Marketing`} 
            toggle={() => {
                if(!isSubmit){
                    handleClearForm(false);
                }
            }}
          />
          <ModalBody>
            <div>
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
            </div>

          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={ contentDialog} isOpen={showDialog} />
      
    </Fragment>
  );
}

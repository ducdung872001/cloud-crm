import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { AddCardModalProps } from "model/card/PropsModel";
import { ICardRequest } from "model/card/CardRequestModel";
import CardService from "services/CardService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import "./AddCustomerCardModal.scss";

export default function AddCustomerCardModal(props: AddCardModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [warningPayoutMin, setWarningPayoutMin] = useState<boolean>(false);
  const [warningPayoutMax, setWarningPayoutMax] = useState<boolean>(false);
  const [comparePayoutMinPayoutMax, setComparePayoutMinPayoutMax] = useState<boolean>(false);
  const [comparePayoutMaxPayoutMin, setComparePayoutMaxPayoutMin] = useState<boolean>(false);

  const values = useMemo(
    () =>
    ({
      name: data?.name ?? "",
      code: data?.code ?? "",
      payoutMin: data?.payoutMin?.toString() ?? "",
      payoutMax: data?.payoutMax?.toString() ?? "",
      note: data?.note ?? "",
      avatar: data?.avatar ?? "",
    } as ICardRequest),
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
      name: "payoutMin",
      rules: "required",
    },
    {
      name: "payoutMax",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên thẻ",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mã thẻ hạng",
          name: "code",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Chi tiêu tối thiểu",
          name: "payoutMin",
          type: "number",
          fill: true,
          required: true,
          isWarning: warningPayoutMin || comparePayoutMinPayoutMax,
          messageWarning: warningPayoutMin
            ? "Chi tiêu tối thiểu phải lớn hơn 0"
            : comparePayoutMinPayoutMax
              ? "Chi tiêu tối thiểu cần nhỏ hơn chi tiêu tối đa"
              : "",
          onChange: (e) => handleChangeValuePayoutMin(e),
          onBlur: (e) => handleChangeBlurPayoutMin(e),
        },
        {
          label: "Chi tiêu tối đa",
          name: "payoutMax",
          type: "number",
          fill: true,
          required: true,
          isWarning: warningPayoutMax || comparePayoutMaxPayoutMin,
          messageWarning: warningPayoutMax
            ? "Chi tiêu tối đa phải lớn hơn 0"
            : comparePayoutMaxPayoutMin
              ? "Chi tiêu tối đa cần lớn hơn chi tiêu tối thiểu"
              : "",
          onChange: (e) => handleChangeValuePayoutMax(e),
          onBlur: (e) => handleChangeBlurPayoutMax(e),
        },
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [warningPayoutMin, warningPayoutMax, comparePayoutMinPayoutMax, comparePayoutMaxPayoutMin]
  );

  // đoạn này validate giá trị chi tiêu tối thiểu
  const handleChangeValuePayoutMin = (value) => {
    oninput = () => {
      setWarningPayoutMin(false);
    };
  };

  const handleChangeBlurPayoutMin = (e) => {
    const value = e.target.value;

    if (value == 0) {
      setWarningPayoutMin(true);
    }
  };

  // đoạn này validate giá trị chi tiêu tối đa
  const handleChangeValuePayoutMax = (value) => {
    oninput = () => {
      setWarningPayoutMax(false);
    };
  };

  const handleChangeBlurPayoutMax = (e) => {
    const value = e.target.value;

    if (value == 0) {
      setWarningPayoutMax(true);
    }
  };

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    // đoạn này kiểm tra xem giá trị tối thiểu mà lớn hơn tối đa thì thông báo
    if (formData.values.payoutMin > 0 && formData.values.payoutMin > formData.values.payoutMax && formData.values.payoutMax > 0) {
      setComparePayoutMinPayoutMax(true);
    } else {
      setComparePayoutMinPayoutMax(false);
    }

    // đoạn này kiểm tra xem nếu như mà giá trị tối đa nhỏ hơn tối thiểu thì hiển thông báo
    if (formData.values.payoutMax > 0 && formData.values.payoutMax < formData.values.payoutMin && formData.values.payoutMin > 0) {
      setComparePayoutMaxPayoutMin(true);
    } else {
      setComparePayoutMaxPayoutMin(false);
    }
  }, [formData.values.payoutMin, formData.values.payoutMax]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: ICardRequest = {
      ...(formData.values as ICardRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await CardService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} thẻ khách hàng thành công`, "success");
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
            disabled:
              isSubmit ||
              warningPayoutMin ||
              warningPayoutMax ||
              comparePayoutMaxPayoutMin ||
              comparePayoutMinPayoutMax ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, warningPayoutMin, warningPayoutMax, comparePayoutMaxPayoutMin, comparePayoutMinPayoutMax]
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
        className="modal-add-card-customer"
      >
        <form className="form-card-customer" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} thẻ khách hàng`} toggle={() => !isSubmit && onHide(false)} />
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

              <FileUpload label="Ảnh đại diện" type="avatar" formData={formData} setFormData={setFormData} />
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

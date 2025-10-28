import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./AddContractProgressModal.scss";
import Icon from "components/icon";
import ContractProgressService from "services/ContractProgressService";

export default function AddContractProgressModal(props: any) {
  const { onShow, onHide, data, contractId } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        id: data?.id ?? 0,
        term: data?.term ?? "",
        startDate: data?.startDate ?? '',
        endDate: data?.endDate ?? "",
        status: data?.status ?? "",
        contractId: contractId,
      } as any),
    [data, contractId]
  );

  const validations: IValidation[] = [
    {
      name: "term",
      rules: "required",
    },
    {
      name: "startDate",
      rules: "required",
    },
    {
        name: "endDate",
        rules: "required",
    },
    {
        name: "status",
        rules: "required",
    },
    {
      name: "amount",
      rules: "required|min:0",
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

  // lấy thông tin ngày bắt đầu, ngày kết thúc
  const startDay = new Date(formData.values.startDate).getTime();
  const endDay = new Date(formData.values.endDate).getTime();

  const listFieldBasic = useMemo(
    () =>
      [
        {
            label: "Giai đoạn",
            name: "term",
            type: "text",
            fill: true,
            required: true,
        },

        {
            label: "Trạng thái",
            name: "status",
            type: "select",
            fill: true,
            required: false,
            options: [
              {
                value: "Khảo sát",
                label: "Khảo sát",
              },
              {
                value: "Phân tích nghiệp vụ",
                label: "Phân tích nghiệp vụ",
              },
              {
                value: "Triển khai sản phẩm",
                label: "Triển khai sản phẩm",
              },
              {
                value: "Kiểm soát chất lượng",
                label: "Kiểm soát chất lượng",
              },
              {
                value: "Nghiệm thu giai đoạn",
                label: "Nghiệm thu giai đoạn",
              },
            ],
        },

        {
            label: "Ngày bắt đầu",
            name: "startDate",
            type: "date",
            fill: true,
            required: true,
            icon: <Icon name="Calendar" />,
            iconPosition: "left",
            isWarning: startDay > endDay,
            // hasSelectTime: true,
            placeholder: "Nhập ngày bắt đầu",
            messageWarning: "Ngày bắt đầu nhỏ hơn ngày kết thúc",
        },
        {
            label: "Ngày kết thúc",
            name: "endDate",
            type: "date",
            fill: true,
            required: true,
            icon: <Icon name="Calendar" />,
            iconPosition: "left",
            isWarning: endDay < startDay,
            // hasSelectTime: true,
            placeholder: "Nhập ngày kết thúc",
            messageWarning: "Ngày kết thúc lớn hơn ngày bắt đầu",
        },

       
      ] as IFieldCustomize[],
    [formData?.values]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(formData.values as any),
      // ...(data ? { id: data.id } : {}),
    };

    const response = await ContractProgressService.update(body);

    if (response.code === 0) {
      showToast(`Thêm giai đoạn thành công`, "success");
      setIsSubmit(false);
      onHide(true);
      setFormData({ values: values, errors: {} });
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
            title: "Huỷ",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handleClearForm() : showDialogConfirmCancel();
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
        handleClearForm();
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClearForm = () => {
    onHide(false);
    setFormData({ values: values, errors: {} });
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
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-add-contract-progress"
        size='lg'
      >
        <form className="form-contract-progress-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} giai đoạn`}
            toggle={() => {
              !isSubmit && handleClearForm();
            }}
          />
          <ModalBody>
            <div className="list-form-group-contract-progress">
              {listFieldBasic.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
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

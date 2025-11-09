import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import { getSearchParameters, isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Icon from "components/icon";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";

import WorkOrderService from "services/WorkOrderService";
import "./AddMAModal.scss";
import { ContextType, UserContext } from "contexts/userContext";

export default function AddMAModalV2(props: any) {
  const { onShow, onHide, id } = props;

  const params: any = getSearchParameters();

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [data, setData] = useState(null);

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //! đoạn này call API chi tiết khi update
  const getDetailWork = async (id: number) => {
    const response = await WorkOrderService.detail(id);

    if (response.code == 0) {
      const result = response.result;

      setData({
        id: result.id,
        name: result.name,
        startDate: result.startTime,
        endDate: result.endTime,
      });
    }
  };

  useEffect(() => {
    if (id && onShow) {
      getDetailWork(id);
    }
  }, [onShow, id]);

  const values = useMemo(
    () => ({
      name: data?.name ?? "",
      startDate: id ? data?.startDate : new Date(),
      endDate: id ? data?.endDate : "",
    }),
    [onShow, data]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "startTime",
      rules: "required",
    },
    {
      name: "endTime",
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

  // lấy thông tin ngày bắt đầu, ngày kết thúc
  const startDay = new Date(formData.values.startTime).getTime();
  const endDay = new Date(formData.values.endTime).getTime();

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên chương trình",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Bắt đầu",
          name: "startTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          isWarning: startDay > endDay,
          hasSelectTime: true,
          placeholder: "Nhập ngày bắt đầu",
          messageWarning: "Ngày bắt đầu nhỏ hơn ngày kết thúc",
        },
        {
          label: "Kết thúc",
          name: "endTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          isWarning: endDay < startDay,
          hasSelectTime: true,
          placeholder: "Nhập ngày kết thúc",
          messageWarning: "Ngày kết thúc lớn hơn ngày bắt đầu",
        },
      ] as IFieldCustomize[],
    [startDay, endDay, formData?.values]
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
    };

    setIsSubmit(false);
  };

  const handleClearForm = () => {
    onHide(false);
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
              !isDifferenceObj(formData.values, values) ? handleClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: id ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              startDay > endDay ||
              endDay < startDay ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, startDay, endDay]
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
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => !isSubmit && onHide(false)} className="modal-add-ma">
        <form className="form-add-ma" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${id ? "Chỉnh sửa" : "Thêm mới"} chương trình MA`}
            toggle={() => {
              !isSubmit && onHide(false);
            }}
          />
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

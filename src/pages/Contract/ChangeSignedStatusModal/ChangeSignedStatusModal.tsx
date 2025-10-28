import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./ChangeSignedStatusModal.scss";
import CustomerService from "services/CustomerService";
import ContractService from "services/ContractService";

export default function ChangeSignedStatusModal(props: any) {
  const { data, onShow, onHide } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const values = useMemo(
    () =>
      ({
        status: data?.status?.toString() ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "status",
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
          label: "Các trạng thái",
          name: "status",
          type: "radio",
          options: [
            // ...(data?.status === 0 ? [
            //     {
            //         value: "0",
            //         label: "Chưa trình ký",
            //     },
            // ] : []),
            {
              value: "0",
              label: "Chưa trình ký",
              // disabled: data?.status === 0 ? false : true
            },

            {
              value: "1",
              label: "Đã trình ký",
              // disabled: data?.status > 1 ? true : false
            },
            {
              value: "2",
              label: "Đã phê duyệt",
              // disabled: data?.status > 2 ? true : false
            },
            {
              value: "4",
              label: "Tạm dừng luồng ký",
            },
            {
              value: "3",
              label: "Từ chối phê duyệt",
              // disabled: data?.status > 3 ? true : false
            },
          ],
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [data]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const contractStatus =
      +formData.values.status === 0
        ? 0
        : +formData.values.status === 1
        ? 1
        : +formData.values.status === 2
        ? 2
        : +formData.values.status === 3
        ? 4
        : +formData.values.status === 4
        ? 1
        : 0;

    setIsSubmit(true);

    const changeData = {
      id: data?.id,
      status: formData.values.status,
      contractStatus: contractStatus,
    };

    const response = await ContractService.updateStatus(changeData);

    if (response.code === 0) {
      showToast(`Thay đổi trạng thái ký thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
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
              onHide(false);
            },
          },
          {
            title: "Xác nhận",
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal__change-signed-status"
      >
        <form className="form__change-signed-status" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            // title={`Thay đổi trạng thái ${
            //   data
            //     ? data.status == "draft"
            //       ? "chưa phê duyệt"
            //       : data.status == "approved"
            //       ? "đã phê duyệt"
            //       : data.status == "paused"
            //       ? "tạm dừng"
            //       : "đang chạy"
            //     : ""
            // }`}
            title={`Thay đổi trạng thái ký`}
            toggle={() => !isSubmit && onHide(false)}
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
    </Fragment>
  );
}

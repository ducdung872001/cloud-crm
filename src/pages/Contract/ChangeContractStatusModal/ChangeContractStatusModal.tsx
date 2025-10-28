import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./ChangeContractStatusModal.scss";
import ContractService from "services/ContractService";


export default function ChangeContractStatusModal(props: any) {
  const { data, onShow, onHide } = props;
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const values = useMemo(
    () =>
      ({
        contractStatus: data?.contractStatus?.toString() ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "contractStatus",
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
          name: "contractStatus",
          type: "radio",
          options: [
            // {
            //     value: "0",
            //     label: "Chưa phê duyệt",
            // },
            
            // {
            //     value: "1",
            //     label: "Đang phê duyệt",
            // },
            {
                value: "2",
                label: "Đang thực hiện",
            },
            {
                value: "3",
                label: "Đóng hợp đồng",
            },
            {
                value: "4",
                label: "Lưu trữ (thất bại)",
            },
            {
                value: "5",
                label: "Lưu trữ (thành công)",
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

    setIsSubmit(true);
    
    const changeData = {
      id: data?.id,
      contractStatus: formData.values.contractStatus,
    };

    const response = await ContractService.updateStatus(changeData);

    if (response.code === 0) {
      showToast(`Thay đổi trạng thái hợp đồng thành công`, "success");
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
        className="modal__change-contract-status"
      >
        <form className="form__change-contract-status" onSubmit={(e) => onSubmit(e)}>
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
            title={`Thay đổi trạng thái hợp đồng`}
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

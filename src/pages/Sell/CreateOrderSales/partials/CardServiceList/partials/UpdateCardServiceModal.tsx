import React, { Fragment, useState, useEffect, useMemo } from "react";
import { validateIsEmpty } from "reborn-validation";
import { IActionModal } from "model/OtherModel";
import Input from "components/input/input";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import BoughtCardService from "services/BoughtCardService";

export default function UpdateCardServiceModal(props) {
  const { data, onShow, onHide } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [formData, setFormData] = useState({ id: 0, cardNumber: "" });

  const [validateFiledCardNumber, setValidateFiledCardNumber] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setFormData({ id: data?.id, cardNumber: data?.cardNumber });
    }
  }, [data]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (validateIsEmpty(formData?.cardNumber)) {
      setValidateFiledCardNumber(true);
      return;
    }

    setIsSubmit(true);

    const response = await BoughtCardService.update(formData);

    if (response.code === 0) {
      showToast("Chỉnh sửa mã thẻ dịch vụ cần bán thành công", "success");
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
            title: "Chỉnh sửa",
            type: "submit",
            color: "primary",
            disabled: isSubmit || validateFiledCardNumber || formData?.cardNumber == "",
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, validateFiledCardNumber, isSubmit]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => !isSubmit && onHide(false)}>
        <form className="form-update-card-service" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Chỉnh sửa mã thẻ dịch vụ được bán" toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  label="Mã thẻ dịch vụ"
                  fill={true}
                  required={true}
                  value={formData?.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="Nhập mã thẻ dịch vụ"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}

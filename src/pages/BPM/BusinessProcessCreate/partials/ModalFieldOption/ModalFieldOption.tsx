import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";

import "./ModalFieldOption.scss";

export default function ModalFieldOption({ onShow, onHide, data }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

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
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-field--option"
      >
        <form className="form-field-option-group">
          <ModalHeader title={`Cấu hình trường dữ liệu`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="content__field">
              <h2 style={{ textAlign: "center" }}>Cấu hình các field ở đây</h2>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}

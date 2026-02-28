import React, { Fragment } from "react";
import { IAddCustomerViewerModalProps } from "model/customer/CustomerRequestModel";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import "./index.scss";

export default function ScoreHistoryModal(props: IAddCustomerViewerModalProps) {
  const { onShow, onHide, dataCustomer } = props;

  const handleClear = () => {
    onHide();
  };
  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="lg"
        toggle={() => handleClear()}
        className="modal-score-history"
      >
        <div className="form__score--history">
          <ModalHeader title="Lịch sử điểm" toggle={() => handleClear()} />
          <ModalBody>
            <div>Lịch sử điểm</div>
          </ModalBody>
          {/* <ModalFooter actions={actions} /> */}
        </div>
      </Modal>
    </Fragment>
  );
}

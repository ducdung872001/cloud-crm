import React, { Fragment } from "react";
import { IAddCustomerViewerModalProps } from "model/customer/CustomerRequestModel";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import "./index.scss";
import Input from "components/input/input";

export default function EditScoreModal(props: IAddCustomerViewerModalProps) {
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
        size="sm"
        toggle={() => handleClear()}
        className="modal-score-edit"
      >
        <div className="form__score--edit">
          <ModalHeader title="Chỉnh sửa điểm" toggle={() => handleClear()} />
          <ModalBody>
            <div>
              <Input
                label="Tên khách hàng"
                name="name"
                fill={true}
                required={true}
                value={"MTP Entertainment"}
                placeholder="Tên khách hàng"
                disabled={true}
              />
              <Input label="Điểm mới" value={0} />
            </div>
          </ModalBody>
          {/* <ModalFooter actions={actions} /> */}
        </div>
      </Modal>
    </Fragment>
  );
}

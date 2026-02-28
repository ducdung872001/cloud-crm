import React, { Fragment, useMemo } from "react";
import { IAddCustomerViewerModalProps } from "model/customer/CustomerRequestModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./index.scss";
import Input from "components/input/input";
import AttachmentUploader from "@/components/attachmentUpload";
import Textarea from "@/components/textarea/textarea";
import { IActionModal } from "@/model/OtherModel";
import SelectCustom from "@/components/selectCustom/selectCustom";

export default function EditScoreModal(props: IAddCustomerViewerModalProps) {
  const { onShow, onHide, dataCustomer } = props;

  const handleClear = () => {
    onHide();
  };
  const listImageWork = [];
  const handleChange = (files: any) => {
    console.log(files);
  };
  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
          {
            title: "Điều chỉnh",
            type: "submit",
            color: "primary",
            callback: () => {
              onHide();
            },
          },
        ],
      },
    }),
    []
  );
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
            <div className="mb-3">
              <Input label="Tên khách hàng" name="name" fill={true} required={true} value={"MTP Entertainment"} placeholder="Tên khách hàng" />
            </div>
            <div className="mb-3">
              <SelectCustom
                isSearchable={false}
                id="optionAdd"
                options={[
                  { value: "", label: "Chọn điều kiện lọc" },
                  { value: "option1", label: "Cộng điểm" },
                  { value: "option2", label: "Trừ điểm" },
                ]}
                value="option1"
                fill={true}
                placeholder="Chọn điều kiện lọc"
                onChange={() => {}}
              />
            </div>
            <div className="mb-3">
              <Input label="Số điểm điều chỉnh" name="adjustmentPoints" fill={true} required={true} value={"+500"} placeholder="Số điểm điều chỉnh" />
            </div>
            <div className="mb-3">
              <Textarea
                label="Lý do điều chỉnh"
                name="adjustmentReason"
                fill={true}
                required={true}
                value={"Xử lý khiếu nại của đơn hàng #12345"}
                placeholder="Lý do điều chỉnh"
              />
            </div>
            <div className="mb-3">
              <AttachmentUploader value={listImageWork} placeholderLabel="Upload chứng từ" onChange={handleChange} multiple={true} maxFiles={10} />
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}

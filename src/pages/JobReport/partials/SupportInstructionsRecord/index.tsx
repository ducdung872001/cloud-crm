import React, { Fragment, useState, useEffect, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import "./index.scss";

interface ISupportInstructionsRecordProps {
  onShow: boolean;
  onHide: () => void;
}

export default function SupportInstructionsRecord(props: ISupportInstructionsRecordProps) {
  const { onShow, onHide } = props;

  const defaultData = [
    {
      id: 1,
      name: "Gửi SMS thành công",
    },
    {
      id: 2,
      name: "Gửi Email khách hàng có đọc",
    },
    {
      id: 3,
      name: "Cuộc gọi khách hàng thành công",
    },
    {
      id: 4,
      name: "Phản hồi khách hàng thành công",
    },
    {
      id: 5,
      name: "Có đơn mua hàng thành công",
    },
  ];

  const [lstData, setLstData] = useState(defaultData);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
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
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-support--record">
        <div className="support__instructions--record">
          <ModalHeader title={`Hướng dẫn ghi nhận tương tác`} toggle={() => onHide()} />
          <ModalBody>
            <div className="lst__instructions--record">
              {lstData.map((item, idx) => {
                return (
                  <div key={idx} className={`item__instructions--record ${idx % 2 === 0 ? "__even" : "__odd"}`}>
                    <span className="name">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}

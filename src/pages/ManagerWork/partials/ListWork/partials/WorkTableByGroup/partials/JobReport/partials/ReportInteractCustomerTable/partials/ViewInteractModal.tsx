import React, { Fragment, useEffect, useMemo, useState } from "react";
import moment from "moment";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import "./ViewInteractModal.scss";

interface IViewInteractModalProps {
  onShow: boolean;
  onHide: () => void;
  data: any;
}

export default function ViewInteractModal(props: IViewInteractModalProps) {
  const { onShow, onHide, data } = props;

  const [lstInteract, setLstInteract] = useState([]);

  const titles = ["Thời gian", "Nội dung"];

  const dataFormat = ["", ""];

  const dataSize = [12, 41];

  const dataMappingArray = (item, idx) => [
    moment(item.createdAt).format("DD/MM/YYYY HH:mm"),
    <div key={idx} className="view__content--interact">
      <span className="icon-interact">
        <Icon name={item.type == "invoice" ? "Bill" : item.type == "call" ? "PhoneFill" : item.type == "sms" ? "SMS" : "Feedback"} />
      </span>
      <p className="desc">{item.content}</p>
    </div>,
  ];

  useEffect(() => {
    if (data) {
      setLstInteract(data.details);
    }
  }, [data]);

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
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-view--interact">
        <div className="box-view--interact">
          <ModalHeader title="Xem lịch sử tương tác" toggle={() => onHide()} />
          <ModalBody>
            <div className="lst__interact">
              {data && data.details && (
                <BoxTable
                  name="Lịch sử tương tác"
                  titles={titles}
                  items={lstInteract}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  dataSize={dataSize}
                  striped={true}
                  actionType="inline"
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}

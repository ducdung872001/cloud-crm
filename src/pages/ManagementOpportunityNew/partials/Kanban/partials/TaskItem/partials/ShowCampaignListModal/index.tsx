import React, { Fragment, useState, useEffect, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import "./index.scss";



export default function ShowCampaignListModal(props: any) {
  const { onShow, onHide, campaignList } = props;

  const [lstData, setLstData] = useState([]);

  useEffect(() => {
    if(campaignList && campaignList.length > 0){
        setLstData(campaignList)
    }
  }, [campaignList, onShow])

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
        <div className="show_campaign_list_modal">
          <ModalHeader title={`Danh sách chiến dịch`} toggle={() => onHide()} />
          <ModalBody>
            <div className="show_campaign_list">
              {lstData && lstData.length > 0 && lstData.map((item, idx) => {
                return (
                  <div key={idx} className={`item__campaign ${idx % 2 === 0 ? "__even" : "__odd"}`}>
                    <span className="name">{item.campaignName}</span>
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

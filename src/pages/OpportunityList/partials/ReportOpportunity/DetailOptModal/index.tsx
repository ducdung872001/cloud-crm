import React, { Fragment } from "react";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import _ from "lodash";

import "./index.scss";
import DetailManagementOpportunity from "pages/ManagementOpportunity/partials/DetailManagementOpportunity";

export default function DetailOptModal(props: any) {
  const { onShow, onHide, itemDetail } = props;

  return (
    <Fragment>
      <Modal isOpen={onShow} isFade={true} staticBackdrop={true} isCentered={true} size="xxl" toggle={() => {}} className="modal-detail-opt">
        <div>
          <ModalHeader
            title={"Chi tiết cơ hội"}
            toggle={() => {
              onHide(false);
            }}
          />
          <ModalBody>
            {itemDetail?.id ? (
              <DetailManagementOpportunity
                idData={itemDetail.id}
                idCampaign={null}
                onShow={true}
                onHide={(reload) => {
                  if (reload) {
                    // getListManagementOpportunity(params, kanbanTab);
                  }
                  // setShowModalAdd(false);
                }}
              />
            ) : null}
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
}

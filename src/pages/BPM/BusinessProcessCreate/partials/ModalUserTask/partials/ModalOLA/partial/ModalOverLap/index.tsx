import React, { Fragment, useState, useMemo, useEffect } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import "./index.scss";
import _ from "lodash";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import moment from "moment";

export default function ModalOverLap(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, dataNode } = props;
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    if (onShow && dataNode) {
    }
  }, [onShow, dataNode]);

  const clearForm = () => {
    onHide(false);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => onHide(false)}
        size="lg"
        className="modal-overlap-OLA"
      >
        <form className="form-overlap-OLA">
          <ModalHeader title={`Có ${dataNode.length} cặp điều kiện bị chồng lấn`} toggle={() => clearForm()} />
          <ModalBody>
            <div className="list-overlap-OLA">
              {dataNode.map((item, index) => {
                return (
                  <div className="item-overlap-OLA" key={index}>
                    <span className="text-overlap-OLA">
                      - Điều kiện có STT {item[0] + 1} chồng lấn với điều kiện có STT {item[1] + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </ModalBody>
          {/* <ModalFooter actions={actions} /> */}
        </form>
      </Modal>
    </Fragment>
  );
}

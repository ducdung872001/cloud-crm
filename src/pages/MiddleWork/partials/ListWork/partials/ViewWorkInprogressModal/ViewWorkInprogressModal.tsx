import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IViewWorkInprogressModalProps } from "model/workOrder/PropsModel";
import { IWorkInprogressResponseModal } from "model/workOrder/WorkOrderResponseModel";
import { IWorkInprogressFilterRequest } from "model/workOrder/WorkOrderRequestModel";
import Loading from "components/loading";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import WorkOrderService from "services/WorkOrderService";
import "./ViewWorkInprogressModal.scss";

export default function ViewWorkInprogressModal(props: IViewWorkInprogressModalProps) {
  const { onShow, onHide, idWork } = props;

  const [listWorkInprogress, setListWorkInprogress] = useState<IWorkInprogressResponseModal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getListlWorkInprogress = async () => {
    setIsLoading(true);

    const param: IWorkInprogressFilterRequest = {
      worId: idWork,
    };

    const response = await WorkOrderService.getWorkInprogressList(param);

    if (response.code === 0) {
      const result = response.result.items;
      setListWorkInprogress(result);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && idWork) {
      getListlWorkInprogress();
    }
  }, [onShow, idWork]);

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
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-view-percent">
        <Fragment>
          <ModalHeader title="Xem chi tiết tiến độ công việc" toggle={() => onHide()} />
          <ModalBody>
            {!isLoading && listWorkInprogress && listWorkInprogress.length > 0 ? (
              <div className="wrapper__list--workinprogress">
                {listWorkInprogress.map((item, idx) => (
                  <div key={idx} className="item__workinprogress">
                    <div className="view__percent">
                      <h4 className="title">Tiến độ</h4>
                      <h4 className="name">{`${item.percent}%`}</h4>
                    </div>
                    <div className="content__percent">
                      <h4 className="title">Ghi chú</h4>
                      <p className="content">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : isLoading ? (
              <Loading />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Hiện tại bạn chưa cập nhật tiến độ công việc. <br />
                    Hãy cập nhật tiến độ công việc nhé!
                  </span>
                }
                type="no-item"
              />
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </Fragment>
      </Modal>
    </Fragment>
  );
}

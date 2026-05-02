import React, { Fragment, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { ISupportTaskModalProps } from "model/workOrder/PropsModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./SupportTaskModal.scss";

export default function SupportTaskModal(props: ISupportTaskModalProps) {
  const { onShow, onHide } = props;

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
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-support--task">
        <div className="wrapper__support--task">
          <ModalHeader title="Hướng dẫn kéo thả công việc" toggle={() => onHide()} />
          <ModalBody>
            <div className="lst__support">
              <div className="task-support task-one">
                <div className="name">
                  Trạng thái đầu tiên : <span className="outstanding outstanding-one">Chưa thực hiện</span>
                </div>

                <p className="content">
                  Ở trạng thái <span className="outstanding outstanding-one">Chưa thực hiện</span> bạn có thể kéo sang các trạng thái{" "}
                  <span className="outstanding outstanding-two">Đang thực hiện</span>,{" "}
                  <span className="outstanding outstanding-three">Đã hoàn thành</span> và <span className="outstanding outstanding-four">Đã hủy</span>
                </p>
              </div>

              <div className="task-support task-two">
                <div className="name">
                  Trạng thái thứ hai : <span className="outstanding outstanding-two">Đang thực hiện</span>
                </div>

                <p className="content">
                  Ở trạng thái <span className="outstanding outstanding-two">Đang thực hiện</span> bạn có thể kéo sang các trạng thái{" "}
                  <span className="outstanding outstanding-three">Đã hoàn thành</span>, <span className="outstanding outstanding-four">Đã hủy</span>{" "}
                  và <span className="outstanding outstanding-five">Tạm dừng</span>
                </p>
              </div>

              <div className="task-support task-three">
                <div className="name">
                  Trạng thái thứ ba : <span className="outstanding outstanding-three">Đã hoàn thành</span>
                </div>

                <p className="content">
                  Ở trạng thái <span className="outstanding outstanding-three">Đã hoàn thành</span> bạn không thể kéo sang các trạng thái khác.
                </p>
              </div>

              <div className="task-support task-four">
                <div className="name">
                  Trạng thái thứ tư : <span className="outstanding outstanding-four">Đã hủy</span>
                </div>

                <p className="content">
                  Ở trạng thái <span className="outstanding outstanding-four">Đã hủy</span> bạn không thể kéo sang các trạng thái khác.
                </p>
              </div>

              <div className="task-support task-five">
                <div className="name">
                  Trạng thái cuối cùng : <span className="outstanding outstanding-five">Tạm dừng</span>
                </div>

                <p className="content">
                  Ở trạng thái <span className="outstanding outstanding-five">Tạm dừng</span> bạn có thể kéo sang các trạng thái{" "}
                  <span className="outstanding outstanding-three">Đang thực hiện</span> và{" "}
                  <span className="outstanding outstanding-four">Đã hủy</span>
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}

import React, { Fragment, memo, useEffect, useMemo, useState } from "react";
import Icon from "components/icon";
import EmployeeService from "services/EmployeeService";
import "./index.scss";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import ResizableLayout from "components/resizableLayout/ResizableLayout";
import Button from "components/button/button";
import { IActionModal } from "model/OtherModel";
import WorkChatArea from "./partials/WorkChatArea";
import InfoWorkArea from "./partials/InfoWorkArea";
interface IDetailWorkModalProps {
  onShow: boolean;
  onHide: () => void;
  idData: number | null;
}

const DetailWorkModal = (props: IDetailWorkModalProps) => {
  const { idData, onShow, onHide } = props;
  const [dataEmployee, setDataEmployee] = useState(null);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => onHide(),
          },
        ],
      },
    }),
    [onHide]
  );

  const takeDataEmployee = async () => {
    const response = await EmployeeService.info();
    if (response.code === 0) setDataEmployee(response.result);
  };

  useEffect(() => {
    if (onShow && idData) {
      takeDataEmployee();
    }
  }, [idData, onShow]);

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} size={"xxl"} className={"modal-work-xml-full"}>
        <form className="form-handle-task">
          <div className="container-header">
            <div className="box-title">
              <h4>Chi tiết công việc</h4>
            </div>
            <div className="container-button">
              <Button type="button" className="btn-close" color="transparent" onlyIcon={true} onClick={onHide}>
                <Icon name="Times" />
              </Button>
            </div>
          </div>
          <ModalBody>
            <ResizableLayout
              leftComponent={<InfoWorkArea idData={idData} onShow={onShow} onHide={onHide} />}
              rightComponent={<WorkChatArea dataEmployee={dataEmployee} worId={idData} />}
              initialLeftWidth={60}
            />
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
};

export default memo(DetailWorkModal);

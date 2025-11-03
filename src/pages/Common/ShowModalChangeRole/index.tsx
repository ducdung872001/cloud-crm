import React, { Fragment, useState, useMemo, useEffect } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import EmployeeService from "services/EmployeeService";

import "./index.scss";

interface IShowModalChangeRoleProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
  lstData: any[];
}

export default function ShowModalChangeRole(props: IShowModalChangeRoleProps) {
  const { onShow, onHide, data, lstData } = props;

  const [lstRole, setLstRole] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getDetailEmployeeInfo = async () => {
    setIsLoading(true);
    const response = await EmployeeService.info();

    if (response.code === 0) {
      onHide(false);
      setDataRole(null);

      setTimeout(() => {
        location.reload();
        setIsLoading(false);
      }, 500);
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lstData && lstData.length > 0) {
      setLstRole(lstData);
    }
  }, [lstData]);

  const [dataRole, setDataRole] = useState(data);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide(false);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: dataRole === data,
            is_loading: isLoading,
            callback: () => {
              localStorage.setItem("SelectedRole", dataRole);
              getDetailEmployeeInfo();
            },
          },
        ],
      },
    }),
    [dataRole, data, isLoading]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-change-role">
        <div className="box-change-role">
          <ModalHeader title={`Chuyển vai trò`} toggle={() => onHide(false)} />
          <ModalBody>
            <div className="lst__role--change">
              {lstRole.map((item, idx) => {
                return (
                  <div key={idx} className={`item__role ${item.role === dataRole ? "active__role" : ""}`} onClick={() => setDataRole(item.role)}>
                    <div className="info-role">
                      <div className="avatar-role">
                        <Icon name="AccountCircle" />
                      </div>
                      <div className="desc-role">
                        <span className="name-dep">{item.departmentName}</span>
                        <span className="name-role">{item.name}</span>
                      </div>
                    </div>
                    {item.role == dataRole && (
                      <span className="icon-check">
                        <Icon name="Checked" />
                      </span>
                    )}
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

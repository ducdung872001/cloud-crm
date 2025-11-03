import React, { Fragment, useMemo, useState } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./index.scss";

export default function ChooseRole({ lstRole, onShow, onHide }) {
  const [dataRole, setDataRole] = useState(null);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: !dataRole,
            callback: () => {
              localStorage.setItem("SelectedRole", dataRole);
              onHide(false);
            },
          },
        ],
      },
    }),
    [dataRole]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="page__choose--role">
        <div className="box__choose--role">
          <ModalHeader title={`Chọn vai trò`} toggle={() => onHide(false)} />
          <ModalBody>
            <div className="lst__role">
              {lstRole.map((item, idx) => {
                const condition = item.role === dataRole;

                return (
                  <div key={idx} className={`item--role ${condition ? "active__role" : ""}`} onClick={() => setDataRole(item.role)}>
                    {condition && (
                      <div className="icon-check">
                        <Icon name="Checked" />
                      </div>
                    )}
                    <div className="avatar-role">
                      <Icon name="AccountCircle" />
                    </div>
                    <div className="info__role">
                      <span className="name-dep">{item.departmentName}</span>
                      <h3>{item.name}</h3>
                    </div>
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

import React, { Fragment, useMemo, useState, useEffect } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { LoginZaloModalProps } from "model/zaloOA/PropsModel";
import { getDomain } from "reborn-util";
import { useNavigate } from "react-router-dom";

import "./index.scss";
export default function LoginZaloModal(props: LoginZaloModalProps) {
  const { onShow, onHide, getListZaloOA } = props;

  const navigate = useNavigate();

  //! biến này tạo ra với mục đích tránh gọi API không cần thiết
  const [checkReload, setCheckReload] = useState<boolean>(false);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              checkReload ? onHide(true) : onHide(false);
              setCheckReload(false);
            },
          },
        ],
      },
    }),
    [checkReload]
  );

  //Trường hợp zalo
  window.addEventListener("message", (event) => {
    // Data sent with postMessage is stored in event.data
    if (event.origin === "https://sso.reborn.vn") {
      console.log("show event zalo =>", event);

      const code = event.data?.code;
      const oaId = event.data?.oaId;

      //Thực hiện kết nối với Zalo
      console.log("code is: ", code, ", oaId is:", oaId);

      if (code) {
        // getListZaloOA();
        onHide(false);
        navigate(`/public_connect_zalo?code=${code}&oa_id=${oaId}`);
      }
    }
  });

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-connect-zalo">
        <ModalHeader title="Kết nối Zalo Offical Account" toggle={() => (checkReload ? onHide(true) : onHide(false))} />
        <ModalBody>
          <div className="connect-zalo">
            {/* Nhúng iframe vào đây và truyền tham số là login vào để callback có xử lý thêm */}
            <iframe
              id="iframe_callback"
              src={`https://sso.reborn.vn/login_crm?sourceDomain=${getDomain(document.location.href)}&method=zalo`}
              style={{ width: "100%", minHeight: "600px", border: "none" }}
            ></iframe>
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
    </Fragment>
  );
}

/* eslint-disable prefer-const */
import React, { Fragment, useMemo, useState, useEffect } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { LoginFanpageModalProps } from "model/fanpageFacebook/PropsModel";
import { getDomain } from "reborn-util";
import "./index.scss";

export default function LoginFacebookModal(props: LoginFanpageModalProps) {
  const { onShow, onHide, loadFanpages } = props;

  //! biến này tạo ra với mục đích tránh gọi API không cần thiết👉<Bao giờ thời gian xem lại đoạn này>
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

  //Trường hợp facebook
  window.addEventListener("message", (event) => {
    // Data sent with postMessage is stored in event.data
    if (event.origin === "https://sso.reborn.vn") {
      let accessToken = event.data?.accessToken;

      console.log("access token is: ", accessToken);
      if (accessToken) {
        loadFanpages(accessToken);
        onHide(false);
      }
    }
  });

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-connect-facebook">
        <ModalHeader title="Kết nối Fanpage" toggle={() => (checkReload ? onHide(true) : onHide(false))} />
        <ModalBody>
          <div className="connect-facebook">
            {/* Nhúng iframe vào đây và truyền tham số là login vào fb để callback có xử lý thêm */}
            <iframe
              id="iframe_callback"
              src={`https://sso.reborn.vn/login_crm?sourceDomain=${getDomain(document.location.href)}&method=facebook`}
              style={{ width: "100%", minHeight: "600px", border: "none" }}
            ></iframe>
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
    </Fragment>
  );
}

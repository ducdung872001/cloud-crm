import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import Button from "components/button/button";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";

import "./notifiPackageRenewal.scss";

interface INotifiPackageRenewalProps {
  onShow: boolean;
  data?: any;
  onHide: () => void;
}

export default function NotifiPackageRenewal(props: INotifiPackageRenewalProps) {
  const { onShow, data, onHide } = props;

  const navigation = useNavigate();

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => onHide()}
        size="sm"
        className="modal__notifi__package--renewal"
      >
        <div className="box__package--renewal">
          {data.numDay > 0 ? (
            <ModalHeader title={`Gói dịch vụ của quý khách sắp hết hạn`} toggle={() => onHide()} />
          ) : (
            <ModalHeader title={`Gói dịch vụ của quý khách đã hết hạn`} />
          )}
          <ModalBody>
            <div className="content__notifi">
              <p className="desc">
                {data.numDay > 0
                  ? "Vui lòng đăng ký gia hạn gói dịch vụ để tiếp tục sử dụng. Nếu không đăng ký trước khi hết hạn, bạn sẽ không thể tiếp tục sử dụng dịch vụ."
                  : "Quý khách vui lòng đăng ký gia hạn gói dịch vụ để tiếp tục sử dụng."}
              </p>

              <div className="action__extend">
                <Button
                  color="warning"
                  onClick={() => {
                    onHide();
                    navigation("/setting_account?isPackage=true");
                  }}
                >
                  Đăng ký gia hạn
                </Button>
              </div>
            </div>
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
}

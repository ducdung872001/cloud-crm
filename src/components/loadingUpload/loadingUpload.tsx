import React, { Fragment } from "react";
import Icon from "components/icon";
import Image from "components/image";
import Modal, { ModalBody } from "components/modal/modal";
import ImgUploadFile from "assets/images/img-upload-file.png";
import "./loadingUpload.scss";

interface ILoadingUploadProps {
  name?: string;
  onShow: boolean;
  imgNotify?: string;
}

export default function LoadingUpload(props: ILoadingUploadProps) {
  const { name, imgNotify, onShow } = props;

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} size="sm" className="modal__loading--upload">
        <div className="box__loading">
          <ModalBody>
            <div className="loading-item">
              <div className="__img-upload">
                <Image src={imgNotify || ImgUploadFile} alt={name} />
              </div>

              <div className="animation__loading">
                <Icon name="Refresh" />
              </div>

              <p className="content">{name || "Đang trong quá trình xử lý. Vui lòng đợi trong giây lát !"}</p>
            </div>
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
}

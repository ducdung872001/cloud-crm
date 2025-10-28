import React from "react";
import { useTranslation } from "react-i18next";
import QRCode from "assets/images/qr-code.png";
import GoogleStore from "assets/images/google-store.png";
import AppStore from "assets/images/app-store.png";
interface InfoboxProps {
  classNames?: string;
}

export default function InfoBox(props: InfoboxProps) {
  const { classNames } = props;

  const { t } = useTranslation();

  return (
    <div className={`info-box d-flex${classNames ? ` ${classNames}` : ""}`}>
      <div className="card-box info-box__item">
        <div className="title d-flex align-items-start justify-content-between">
          <h2>Liên hệ với chúng tôi</h2>
        </div>
        <div className="info-box__content">
          <strong>Tổng đài tư vấn và hỗ trợ khách hàng:</strong> 0973090393
          <br />
          <br />
          <strong>Email:</strong> contact@reborn.vn
          <br />
          <br />
          Từ 8h00 – 22h00 các ngày từ thứ 2 đến Chủ nhật
        </div>
      </div>
      <div className="card-box info-box__item">
        <div className="title d-flex align-items-start justify-content-between">
          <h2>Tải ứng dụng</h2>
        </div>
        <div className="info-box__content d-flex align-items-start flex-wrap">
          <div className="description">
            Ứng dụng <strong>REBORN CRM</strong> đã có mặt trên App Store và Google Play
          </div>
          <div className="qr-appstore">
            <img src={QRCode} alt="Mã QR code" />
            <div className="appstore d-flex flex-column">
              <img src={GoogleStore} alt="Google Store" />
              <img src={AppStore} alt="App Store" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

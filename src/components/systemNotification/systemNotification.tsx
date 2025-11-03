import React from "react";
import ImageNoItem from "assets/images/img-no-item.svg";
import ImageNoPermission from "assets/images/img-no-permission.svg";
import ImageNoResult from "assets/images/img-no-result.svg";
import ImageErrorSystem from "assets/images/server.png";
import Button from "components/button/button";
import "./systemNotification.scss";

interface SystemNotificationProps {
  description?: React.ReactElement | string;
  titleButton?: string;
  action?: () => void;
  titleButton01?: string;
  action01?: () => void;
  disabled?: boolean;
  type: "no-permission" | "no-item" | "no-result" | "not-found" | "no-service";
}

export function SystemNotification(props: SystemNotificationProps) {
  const { description, titleButton, action, titleButton01, action01, type, disabled = false } = props;

  return (
    <div className={`system-notification d-flex align-items-center justify-content-center ${type}`}>
      <div className="system-notification__wrapper d-flex align-items-center flex-column">
        {type === "no-item" ? (
          <ImageNoItem />
        ) : type === "no-result" ? (
          <ImageNoResult />
        ) : type === "no-permission" ? (
          <ImageNoPermission />
        ) : (
          type === "no-service" && <img srcSet={`${ImageErrorSystem} 2x`} alt="Lỗi hệ thống" />
        )}
        <div className="system-notification__description">
          <h2>
            {type === "no-permission"
              ? "Bạn không có quyền truy cập vào trang này."
              : type === "no-item"
              ? "Ở đây chưa có gì cả."
              : type === "no-result"
              ? "Không tìm thấy."
              : "Lỗi hệ thống"}
          </h2>
          {type === "no-result" ? <h3>Không tìm thấy dữ liệu phù hợp với điều kiện tìm kiếm</h3> : ""}
          {type !== "no-permission" && (
            <p>
              {type === "no-result"
                ? "Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm"
                : type === "no-item" || type === "no-service"
                ? description
                : ""}
            </p>
          )}
          <div className="action-notification">
            {titleButton && action && (
              <Button type="button" color="primary" onClick={action} disabled={disabled}>
                {titleButton}
              </Button>
            )}
            {titleButton01 && action01 && (
              <Button type="button" color="primary" onClick={action01} disabled={disabled}>
                {titleButton01}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./PaymentMethodPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import PaymentMethodList from "../PaymentMethod/PaymentMethod";
import SettingPaymentMethod from "../SettingPaymentMethod";

export default function PaymentMethodPage() {
  document.title = "Phương thức thanh toán";

  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Cài đặt phương thức thanh toán",
      icon: "MethodPaymentSetting",
      tab: 1,
      backgroundColor: "#EEEDFE",
      strokeColor: "#534ab7",
      des: "Định nghĩa và cấu hình toàn bộ các phương thức thanh toán khả dụng trên hệ thống, bao gồm tiền mặt, thẻ ngân hàng, ví điện tử, QR code... Chỉ Admin hệ thống mới có quyền thực hiện."
    },

    {
      title: "Lựa chọn phưong thức thanh toán",
      icon: "MethodPaymentSelect",
      tab: 2,
      backgroundColor: "#E1F5EE",
      strokeColor: "#0f6e56",
      des: "Kích hoạt hoặc tắt các phương thức thanh toán phù hợp với từng cửa hàng, dựa trên danh sách đã được Admin hệ thống thiết lập sẵn."
    },
  ];

  return (
    <div className="page-content">
      {!isDetail && <TitleAction title="Cài đặt phương thức thanh toán" />}
      <div className="d-flex flex-column">
        {!isDetail && (
            <TabMenuList
                listTab={listTab}
                onClick={(item) => {
                    setTab(item.tab);
                    setIsDetail(true);
                }}
            />
        )}
      </div>

      {isDetail && tab === 1 ? (
        <SettingPaymentMethod
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}

      {isDetail && tab === 2 ? (
        <PaymentMethodList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}


    </div>
  );
}

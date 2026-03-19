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
      icon: "SettingsMenu",
      tab: 1,
      des: ""
    },

    {
      title: "Lựa chọn phưong thức thanh toán",
      icon: "ZaloMenu",
      tab: 2,
      des: ""
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

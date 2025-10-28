import React, { useState } from "react";
import { ITipUserProps } from "model/tipUser/PropsModel";
import { ITipUserResponse } from "model/tipUser/TipUserResponseModel";
import Icon from "components/icon";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import TipUsersList from "./partials/TipUserList/TipUserList";
import TipUserDetail from "./partials/TipUserDetail/TipUserDetail";
import "./index.scss";

export default function TipUser(props: ITipUserProps) {
  document.title = "Hoa hồng theo cá nhân";

  const { onBackProps } = props;

  const [dataTipUser, setDataTipUser] = useState<ITipUserResponse>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalCommissionRate, setShowModalCommissionRate] = useState<boolean>(false);
  const [isDetailUser, setIsDetailUser] = useState<boolean>(true);
  const [dataDetailTip, setDataDetailTip] = useState(false);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          if (isDetailUser) {
            setDataDetailTip(null);
            setShowModalCommissionRate(true);
          } else {
            setDataTipUser(null);
            setShowModalAdd(true);
          }
        },
      },
    ],
  };

  const handBackUp = () => {
    if (isDetailUser) {
      setIsDetailUser(false);
    } else {
      onBackProps(true);
    }
  };

  return (
    <div className="page-content page-tip-user">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              handBackUp();
            }}
            className="title-first"
            title="Quay lại"
          >
            {isDetailUser ? "Hoa hồng theo cá nhân" : "Cài đặt hoa hồng"}
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">{isDetailUser ? dataTipUser?.employeeName : "Hoa hồng theo cá nhân"}</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      {isDetailUser ? (
        <TipUserDetail
          showModalCommissionRate={showModalCommissionRate}
          setShowModalCommissionRate={setShowModalCommissionRate}
          dataTipUser={dataTipUser}
          dataDetailTip={dataDetailTip}
          setDataDetailTip={setDataDetailTip}
        />
      ) : (
        <TipUsersList
          dataTipUser={dataTipUser}
          setDataTipUser={setDataTipUser}
          showModalAdd={showModalAdd}
          setShowModalAdd={setShowModalAdd}
          setIsDetailUser={setIsDetailUser}
        />
      )}
    </div>
  );
}

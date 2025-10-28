/* eslint-disable react/jsx-no-target-blank */
import React, { useState, useEffect } from "react";
import FacebookLogin from "react-facebook-login";
import TitleAction from "components/titleAction/titleAction";
import { APP_ID } from "configs/facebook";
import { IFanpageFacebookResponse } from "model/fanpageFacebook/FanpageResponseModel";
import { IConnectFanpageFilterRequest } from "model/fanpageFacebook/FanpageFacebookRequestModel";
import FanpageFacebookService from "services/FanpageFacebookService";
import AddFanpageModal from "./partials/AddFanpageModal";
import { useSearchParams } from "react-router-dom";
import "./SocialCrm.scss";

export default function SocialCrm() {
  document.title = "Cài đặt kênh bán";

  const [searchParams, setSearchParams] = useSearchParams();

  const [params, setParams] = useState({
    code: searchParams.get("code"),
    oaId: searchParams.get("oa_id"),
  });

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [dataFanpage, setDataFanpage] = useState<IFanpageFacebookResponse[]>([]);

  const loadFanpages = async (accessToken: any) => {
    const params: IConnectFanpageFilterRequest = {
      accessToken,
    };

    const response = await FanpageFacebookService.connect(params);
    if (response.code === 0) {
      // eslint-disable-next-line prefer-const
      let fanpages = [];
      // console.log('fanpages =>', response.result);

      (response.result || []).map((item: any) => {
        fanpages.push({
          name: item.name,
          _fanpage_id: item.id,
          accessToken: item.access_token,
          id: 0,
        });
      });

      setDataFanpage(fanpages);
      setShowModalAdd(true);
    }
  };

  const responseFacebook = async (response: any) => {
    const accessToken = response.accessToken;

    //Từ accessToken, lấy ra danh sách các fanpage người dùng này đang quản lý
    console.log("access token =>", accessToken);
    loadFanpages(accessToken);
  };

  useEffect(() => {
    if (params.code) {
      console.log("code =>", params.code);

      //Call api để kết nối zalo
    }
  }, [params]);

  return (
    <div className="page-content page-social">
      <TitleAction title="Kênh bán" />
      <div className="card-box d-flex flex-column">
        <ul className="menu">
          <li className="menu__social">
            <FacebookLogin
              appId={APP_ID}
              textButton={"Đăng nhập qua Facebook"}
              fields="name,email,picture"
              scope="public_profile,pages_show_list,pages_messaging,pages_read_engagement,pages_read_user_content,pages_manage_metadata,pages_manage_engagement,pages_manage_posts" //ads_read,ads_management,pages_manage_ads
              icon="fa-facebook"
              cssClass="btn-facebook"
              callback={responseFacebook}
            />
          </li>
          <li className="menu__social">
            <a
              href="https://oauth.zaloapp.com/v4/oa/permission?app_id=2865768106189456835&redirect_uri=https%3A%2F%2Fbetacloud.reborn.vn%2Fadminapi%2Fzalo%2Fredirect"
              target={"_blank"}
            >
              Đăng nhập qua Zalo
            </a>
          </li>
        </ul>
      </div>

      <AddFanpageModal
        onShow={showModalAdd}
        data={dataFanpage}
        onHide={(reaload) => {
          setShowModalAdd(false);
        }}
      />
    </div>
  );
}

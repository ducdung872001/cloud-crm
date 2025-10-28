import React, { useContext, useEffect, useState } from "react";
import { getSearchParameters } from "reborn-util";
import Icon from "components/icon";
import { ContextType, UserContext } from "contexts/userContext";
import ConnectGmailService from "services/ConnectGmailService";
import { showToast } from "utils/common";
import Tippy from "@tippyjs/react";

export default function ConnectGmail() {
  const link = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://mail.google.com/ https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=http://localhost:4000/crm/setting_account&client_id=484257639452-6f9hmi7v82pc8enb63albllkpptb5b9u.apps.googleusercontent.com`;

  const { id } = useContext(UserContext) as ContextType;

  const handleConnectGmail = (link: string) => {
    if (!link) return;

    const tagLink = document.createElement("a");
    tagLink.href = link;
    tagLink.target = "_blank";

    document.body.appendChild(tagLink);
    tagLink.click();
    document.body.removeChild(tagLink);
  };

  const [body, setBody] = useState({
    token: "",
    "bsn-id": null,
  });

  const [isConnect, setIsConnect] = useState<boolean>(false);

  const handCheckConnect = async (id) => {
    const param = {
      ["bsn-id"]: id,
    };

    const response = await ConnectGmailService.checkConnect(param);

    if (response.code === 200) {
      setIsConnect(true);
    } else {
      setIsConnect(false);
    }
  };

  useEffect(() => {
    if (id) {
      setBody({ ...body, "bsn-id": id });
      handCheckConnect(id);
    }
  }, [id]);

  const paramsUrl = getSearchParameters();

  useEffect(() => {
    if (paramsUrl && paramsUrl.code) {
      setBody({ ...body, token: paramsUrl.code });
    }
  }, [paramsUrl.code]);

  const [isCallApi, setIsCallApi] = useState<boolean>(false);

  const getConnectGmail = async (params) => {
    const response = await ConnectGmailService.connect(params);

    if (response.code === 200) {
      showToast("Kết nối Email thành công", "success");
      setIsCallApi(true);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (body.token && body["bsn-id"] && !isCallApi) {
      getConnectGmail(body);
    }
  }, [body, isCallApi]);

  return (
    <div className="item__connect" style={{ cursor: !isConnect ? "pointer" : "default" }} onClick={() => !isConnect && handleConnectGmail(link)}>
      <Tippy content={isConnect ? "Kết nối thành công" : "Chưa kết nối"}>
        <div className={`icon-connect ${isConnect ? "icon-connect--success" : "icon-connect--error"}`}>
          {isConnect ? <Icon name="Checked" /> : <Icon name="Info" />}
        </div>
      </Tippy>
      <div className="icon">
        <Icon name="Gmail" />
      </div>
    </div>
  );
}

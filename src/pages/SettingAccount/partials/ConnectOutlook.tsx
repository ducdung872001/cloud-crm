import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { AccountInfo, SilentRequest } from "@azure/msal-browser";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import { showToast } from "utils/common";
import EmployeeService from "services/EmployeeService";
import { loginRequest } from "configs/authConfig";

export default function ConnectOutlook() {
  const [isConnect, setIsConnect] = useState<boolean>(false); 

  /**
   * Cập nhật token
   * @param e 
   * @returns
   */
  const updateToken = async (res) => {
    const body: any = {
      idToken: res.idToken,
      accessToken: res.accessToken,
      uniqueId: res.uniqueId,
    };

    const response = await EmployeeService.updateToken(body);

    if (response.code === 0) {
      showToast("Kết nối thành công", "success");
      //   navigate("/email");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const { instance } = useMsal();

  const handleLogin = (loginType) => {
    if (loginType === "popup") {
      instance
        .loginPopup(loginRequest)
        .then((res) => {
          console.log("popup res =>", res);
          updateToken(res);

          localStorage.setItem("outlook.account", JSON.stringify(res.account));
        })
        .catch((e) => {
          console.log(e);
        });
    } else if (loginType === "redirect") {
      instance.loginRedirect(loginRequest).catch((e) => {
        console.log(e);
      });
    } else if (loginType === "silent") {
      let accountInfo: any = localStorage.getItem("outlook.account");
      if (accountInfo) {
        accountInfo = JSON.parse(accountInfo);
      }

      const accessTokenRequest: SilentRequest = {
        scopes: ["User.Read", "Mail.Read", "Mail.Send"],
        account: {
          homeAccountId: accountInfo?.homeAccountId,
          environment: accountInfo?.environment,
          tenantId: accountInfo?.tenantId,
          username: accountInfo?.username,
          localAccountId: accountInfo?.localAccountId,
        } as AccountInfo,
        forceRefresh: true,
      };

      instance
        .acquireTokenSilent(accessTokenRequest)
        .then((res) => {
          console.log("popup silent =>", res);
        })
        .catch((e) => {
          console.log("popup silent err =>");
          console.log(e);

          setIsConnect(false);
        });
    }
  };

  const checkEmailConnection = async () => {
    const response = await EmployeeService.checkEmailConnection();

    if (response.code == 0) {
      const result = response.result;
      +result > 0 ? setIsConnect(true) : setIsConnect(false);

      //Nếu kết nối rồi, thực hiện làm mới token
      if (+result > 0) {
        //Đăng nhập ẩn để lấy mới token
        handleLogin("silent");
      }
    }
  };

  /**
   * Kiểm tra kết nối
   */
  useEffect(() => {
    checkEmailConnection();
  }, []);

  /**
   * Thực hiện hủy kết nối
   */
  const disconnectEmail = async () => {
    const response = await EmployeeService.disconnectEmail();

    if (response.code == 0) {
      const result = response.result;
      setIsConnect(!(+result > 0));
    }
  };

  return (
    <div
      className="item__connect item__connect--outlook"
      style={{ cursor: !isConnect ? "pointer" : "default" }}
      onClick={() => (isConnect ? disconnectEmail() : handleLogin("popup"))}
    >
      <Tippy content={isConnect ? "Kết nối thành công" : "Chưa kết nối"}>
        <div className={`icon-connect ${isConnect ? "icon-connect--success" : "icon-connect--error"}`}>
          {isConnect ? <Icon name="Checked" /> : <Icon name="Info" />}
        </div>
      </Tippy>
      <div className="icon">
        <Icon name="MicroSoftOutlook" />
      </div>
    </div>
  );
}

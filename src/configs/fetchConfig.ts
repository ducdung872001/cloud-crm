import fetchIntercept from "fetch-intercept";
import { useCookies } from "react-cookie";
import { getCookie } from "reborn-util";
import { getRootDomain } from "utils/common";

const prefixAdmin = "/adminapi";
const prefixApi = "/api";

const takeSelectedRole = localStorage.getItem("SelectedRole");

export default function RegisterFetch() {
  const [cookies, setCookie, removeCookie] = useCookies();

  return fetchIntercept.register({
    request(url, config) {
      if (!config) {
        config = {};
      }
      if (!config.headers) {
        config.headers = {};
      }
      const token = getCookie("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      if (token && takeSelectedRole) {
        config.headers["Selectedrole"] = takeSelectedRole;
      }
      if (!config.headers.Accept) {
        config.headers.Accept = "application/json";
      }
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
      config.headers["Hostname"] = location.hostname || "";
      //
      // Hostname gửi tới BE = domain user đang truy cập. Khi chạy dev local
      // (localhost / 127.0.0.1) không có domain tenant thật → dùng override
      // qua localStorage.devHostname, fallback "kcn.reborn.vn" để không phá
      // environment test hiện tại. QA đổi tenant bằng:
      //   localStorage.setItem("devHostname", "boutique2shop.reborn.vn")
      {
        const realHost = location.hostname || "";
        const isLocal = realHost === "localhost" || realHost === "127.0.0.1" || realHost === "";
        let devHost = "";
        try {
          devHost = (typeof localStorage !== "undefined" && localStorage.getItem("devHostname")) || "";
        } catch {
          /* SSR / sandbox */
        }
        config.headers["Hostname"] = isLocal ? (devHost || "kcn.reborn.vn") : realHost;
      }
      if (!url.startsWith("http")) {
        if (!url.startsWith("/")) {
          url = `/${url}`;
        }

        if (url.indexOf(".hot-update.json") === -1) {
          if (url.startsWith(prefixAdmin) || url.startsWith(prefixApi)) {
            // eslint-disable-next-line prefer-const
            let rootDomain = getRootDomain(location.hostname || "");

            //Chia 2 trường hợp
            if (rootDomain == "localhost") {
              if (url.startsWith(prefixAdmin)) {
                url = process.env.APP_ADMIN_URL + url;
              } else {
                url = process.env.APP_API_URL + url;
              }
              // url = "http://192.168.137.1:9090" + url; //Gọi sang máy Năng, nếu không gọi thì comment đoạn này và mở đoạn trên
            } else {
              url = process.env.APP_API_URL + url;
            }
          } else {
            url = process.env.APP_AUTHENTICATOR_URL + url;
          }
        }
      }
      return [url, config];
    },

    requestError(error) {
      return Promise.reject(error);
    },

    response(response) {
      if (response.status === 401) {
        // eslint-disable-next-line prefer-const
        let rootDomain = getRootDomain(location.hostname || "");

        if (cookies.user) {
          removeCookie("user", { path: "/", domain: rootDomain });
        }
        if (cookies.token) {
          removeCookie("token", { path: "/", domain: rootDomain });
        }

        localStorage.removeItem("permissions");
        localStorage.removeItem("user.root");
      }
      return response;
    },

    responseError(error) {
      return Promise.reject(error);
    },
  });
}

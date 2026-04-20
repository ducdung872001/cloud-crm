import fetchIntercept from "fetch-intercept";
import { useCookies } from "react-cookie";
import { getCookie } from "reborn-util";
import { getRootDomain } from "utils/common";

const prefixAdmin = "/adminapi";
const prefixApi = "/api";
const prefixBiz = "/bizapi";

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
      const isFormDataBody = typeof FormData !== "undefined" && config.body instanceof FormData;
      const isPublic = url.includes("/public/");
      const token = getCookie("token");
      if (token && !isPublic) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      if (token && takeSelectedRole && !isPublic) {
        config.headers["Selectedrole"] = takeSelectedRole;
      }
      if (!config.headers.Accept) {
        config.headers.Accept = "application/json";
      }
      if (isFormDataBody) {
        delete config.headers["Content-Type"];
      } else if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
      // Local (localhost / 127.0.0.1) → luôn "kcn.reborn.vn" (env test mặc định).
      // Live (prod/staging) → location.hostname thật của tenant user đang truy cập.
      {
        const realHost = location.hostname || "";
        const isLocal = realHost === "localhost" || realHost === "127.0.0.1" || realHost === "";
        config.headers["Hostname"] = isLocal ? "kcn.reborn.vn" : realHost;
      }


      if (!url.startsWith("http")) {
        if (url.indexOf(".hot-update.json") === -1) {
          if (url.startsWith(prefixBiz)) {
            url = process.env.APP_BIZ_URL + url.replace(prefixBiz, "");
          } else if (url.startsWith(prefixAdmin) || url.startsWith(prefixApi)) {
            const rootDomain = getRootDomain(location.hostname || "");
            if (rootDomain == "localhost") {
              if (url.startsWith(prefixAdmin)) {
                url = process.env.APP_ADMIN_URL + url;
              } else {
                url = process.env.APP_API_URL + url;
              }
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

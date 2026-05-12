import fetchIntercept from "fetch-intercept";
import { useCookies } from "react-cookie";
import { getCookie } from "reborn-util";
import { getRootDomain } from "utils/common";

const prefixAdmin = "/adminapi";
const prefixApi = "/api";
const prefixBiz = "/bizapi";

// 13 microservice prefix — route sang biz.reborn.vn (không qua reborn.vn)
const BIZ_MICROSERVICE_PREFIXES = [
  "/billing/", "/care/", "/contract/", "/customer/",
  "/finance/", "/integration/", "/inventory/", "/logistics/",
  "/market/", "/notification/", "/operation/", "/org/", "/sales/",
];

// Migration 1-lần: dọn SelectedRole rác (các phiên bản cũ từng ghi string không đúng format
// "<departmentId>_<id>", gây header Selectedrole invalid → BE 403). Chạy trước khi đọc snapshot.
{
  const cur = typeof localStorage !== "undefined" ? localStorage.getItem("SelectedRole") : null;
  if (cur && !/^\d+_\d+$/.test(cur)) {
    localStorage.removeItem("SelectedRole");
  }
}

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
      // Bỏ qua các call sang host ngoài (Firebase, Google APIs, …) —
      // chỉ áp Authorization/Hostname/Content-Type cho backend reborn.
      // Firebase SDK gọi thẳng googleapis.com — Google reject CORS preflight
      // nếu thấy custom header `Hostname`/`Authorization` → `auth/network-request-failed`.
      if (/^https?:\/\//i.test(url)) {
        try {
          const host = new URL(url).hostname;
          if (!/(^|\.)reborn\.vn$/i.test(host)) {
            return [url, config];
          }
        } catch {
          // URL parse fail → để chảy xuống flow cũ
        }
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
      // [TEMP] Force toàn bộ request gửi Hostname = hub.reborn.vn (không phân biệt local/live).
      // Rollback: bỏ block dưới và uncomment block phía trên.
      config.headers["Hostname"] = "hub.reborn.vn";

      // Block gốc (giữ lại để rollback):
      // {
      //   const realHost = location.hostname || "";
      //   const isLocal = realHost === "localhost" || realHost === "127.0.0.1" || realHost === "";
      //   config.headers["Hostname"] = isLocal ? "hub.reborn.vn" : realHost;
      // }


      if (!url.startsWith("http")) {
        if (url.indexOf(".hot-update.json") === -1) {
          if (url.startsWith(prefixBiz)) {
            url = process.env.APP_BIZ_URL + url.replace(prefixBiz, "");
          } else if (url.startsWith(prefixAdmin) || url.startsWith(prefixApi)) {
            let rootDomain = getRootDomain(location.hostname || "");
            if (rootDomain == "localhost") {
              if (url.startsWith(prefixAdmin)) {
                url = process.env.APP_ADMIN_URL + url;
              } else {
                url = process.env.APP_API_URL + url;
              }
            } else {
              url = process.env.APP_API_URL + url;
            }
          } else if (BIZ_MICROSERVICE_PREFIXES.some((p) => url.startsWith(p))) {
            url = (process.env.APP_BIZ_URL || "https://biz.reborn.vn") + url;
          } else {
            url = (process.env.APP_AUTHENTICATOR_URL || "https://reborn.vn") + url;
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
        // Scope: chỉ reset session khi 401 từ endpoint XÁC THỰC/KHỞI TẠO PHIÊN.
        // 401 từ /sales/*, /inventory/*, /notification/*, … là lỗi nghiệp vụ
        // (BE microservice down, query sai, …) — KHÔNG được logout user.
        // (port từ nhánh mentorhub commit 58ae9b69)
        const url = response.url || "";
        const isSessionEndpoint =
          url.includes("/authenticator/user/me") ||
          url.includes("/employee/info") ||
          url.includes("/employee/init") ||
          url.includes("/permission/resource");

        if (isSessionEndpoint) {
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
      }
      return response;
    },

    responseError(error) {
      return Promise.reject(error);
    },
  });
}

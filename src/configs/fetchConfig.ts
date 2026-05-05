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
      // Tạm fix cứng "kcn.reborn.vn" cho cả local lẫn production (nhánh mentorhub).
      config.headers["Hostname"] = "kcn.reborn.vn";


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
        // 401 từ /notification/*, /sales/*, … là lỗi nghiệp vụ — không được logout user.
        const url = response.url || "";
        const isSessionEndpoint =
          url.includes("/authenticator/user/me") ||
          url.includes("/customer/employee/info") ||
          url.includes("/customer/employee/init") ||
          url.includes("/customer/permission/resource");

        if (isSessionEndpoint) {
          // eslint-disable-next-line prefer-const
          let rootDomain = getRootDomain(location.hostname || "");

          // Cookies auth — xoá trên cả root domain lẫn hostname hiện tại lẫn path-only
          // (cookie đôi khi set domain khác, removeCookie 1 cấu hình duy nhất không trúng).
          const expire = "expires=Thu, 01 Jan 1970 00:00:01 GMT";
          for (const name of ["token", "user"]) {
            if (cookies[name]) removeCookie(name, { path: "/", domain: rootDomain });
            document.cookie = `${name}=; ${expire}; path=/; domain=.${rootDomain}`;
            document.cookie = `${name}=; ${expire}; path=/; domain=${location.hostname}`;
            document.cookie = `${name}=; ${expire}; path=/`;
          }

          // localStorage stale — header Selectedrole/permissions/branch info từ tenant
          // cũ kéo theo có thể là nguyên nhân BE trả 401. Dọn để SSO retry sạch.
          for (const k of ["permissions", "user.root", "SelectedRole", "isBeauty", "logoOrganization", "valueBranch"]) {
            localStorage.removeItem(k);
          }

          // Service workers (firebase-messaging-sw + bất kỳ SW cũ) — best-effort, không await.
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker
              .getRegistrations()
              .then((regs) => regs.forEach((r) => r.unregister()))
              .catch(() => {});
          }
        }
      }
      return response;
    },

    responseError(error) {
      return Promise.reject(error);
    },
  });
}

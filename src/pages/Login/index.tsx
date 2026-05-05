/* eslint-disable prefer-const */
import React, { useEffect, useState } from "react";
import { isObjEmpty } from "reborn-util";
import { useNavigate, useLocation } from "react-router-dom";
import UserService from "services/UserService";
import EmployeeService from "services/EmployeeService";
import BeautyBranchService from "services/BeautyBranchService";
import PermissionService from "services/PermissionService";
import { useCookies } from "react-cookie";
import { addMinutes } from "date-fns";
import { getAppSSOLink, showToast } from "utils/common";
import { IUser } from "model/user/UserResponseModel";
import { getDomain } from "reborn-util";
import { getRootDomain } from "utils/common";

import "./index.scss";

export default function Index() {
  const [cookies, setCookie] = useCookies();
  const navigate = useNavigate();

  const locationPathname = useLocation();

  useEffect(() => {
    if (locationPathname.pathname !== "/link_survey") {
      if (!cookies.token) {
        //1. Yêu cầu đăng nhập qua sso
        let redirectUri = encodeURIComponent(location.href);
        let sourceDomain = getDomain(decodeURIComponent(document.location.href));
        let rootDomain = getRootDomain(sourceDomain);
        let env = process.env.APP_ENV;

        let appSSOLink = getAppSSOLink(rootDomain);
        let sso = `${appSSOLink}?redirect_uri=${redirectUri}&domain=${rootDomain}&env=${env}`;
        document.location.href = sso;
        return;
      }

      //2. Nếu có token rồi thì thực hiện lấy thông tin và chuyển hướng
      getUserMe();
    }
  }, [locationPathname]);

  //Lấy thông tin người dùng sau khi đăng nhập thành công
  const getUserMe = async () => {
    const response = await UserService.profile(cookies.token);

    if (response.result && response.result.user) {
      // Trường hợp user đăng nhập vào sai subdomain tenant (ví dụ vào hub.reborn.vn
      // trong khi tổ chức của họ là tnteco.reborn.vn) → /employee/info sẽ trả rỗng và
      // App.tsx sẽ vòng vô hạn với toast "Bạn không phải là nhân viên của tổ chức này!".
      // Dùng lstBeautySalon[].subdomain để chuyển hướng sang đúng subdomain trước.
      const lstSalon: { subdomain?: string }[] = Array.isArray(response.result?.lstBeautySalon)
        ? response.result.lstBeautySalon
        : [];
      const currentHost = (location.hostname || "").toLowerCase();
      const isLocalHost = currentHost === "localhost" || currentHost === "127.0.0.1" || currentHost === "";
      const salonSubdomains = lstSalon.map((s) => (s?.subdomain || "").toLowerCase()).filter(Boolean);
      const matched = salonSubdomains.some((sd) => sd === currentHost);
      if (!isLocalHost && salonSubdomains.length > 0 && !matched) {
        const target = salonSubdomains[0];
        const returnUrlQS = new URLSearchParams(location.search).get("returnUrl");
        const qs = returnUrlQS ? `?returnUrl=${encodeURIComponent(returnUrlQS)}` : "";
        document.location.href = `https://${target}/crm/login${qs}`;
        return;
      }

      //Khởi tạo thông tin ban đầu nếu lần đầu đăng nhập
      const employeeRes = await EmployeeService.init();
      // console.log("employeeRes =>", employeeRes);

      //Kiểm tra người dùng này đã liên kết với nhân viên chưa

      let rootUser = 0;
      if (employeeRes?.message) {
        rootUser = employeeRes.result || 0;
      } else {
        rootUser = employeeRes;
      }
      localStorage.setItem("user.root", rootUser.toString());

      //Lấy và lưu thông tin quyền của người dùng
      const permissionRes = await PermissionService.getPermissionResources();
      let lstPermissionResource = permissionRes.result;
      let mapPermission = {};
      (lstPermissionResource || []).forEach((permissionResource: Record<string, unknown>) => {
        if (permissionResource?.actions) {
          let actions = JSON.parse(permissionResource?.actions);
          actions.forEach((action: Record<string, unknown>) => {
            mapPermission[`${permissionResource.code}_${action}`] = 1;
          });
        }
      });

      // console.log("permissions =>", JSON.stringify(mapPermission));
      localStorage.setItem("permissions", JSON.stringify(mapPermission));

      const takeIsBeauty = await BeautyBranchService.getByBeauty(cookies.token);
      if (!isObjEmpty(takeIsBeauty)) {
        localStorage.setItem("isBeauty", takeIsBeauty.isBeauty);

        //Sẽ lưu lại logo của tổ chức nếu tên miền khác reborn.vn
        let sourceDomain = getDomain(decodeURIComponent(location.href));

        // if (!sourceDomain.endsWith("reborn.vn")) {
        localStorage.setItem("logoOrganization", takeIsBeauty.logo || takeIsBeauty.logoTransparent || "");
        // }
      }

      const userRes = response.result.user;
      const dateExpires = addMinutes(new Date(), 3000);
      const user: IUser = {
        id: userRes.id,
        name: userRes.name,
        phone: userRes.phone,
        avatar: userRes.avatar,
        gender: userRes.gender,
        role: userRes.role,
      };

      let sourceDomain = getDomain(decodeURIComponent(document.location.href));
      let rootDomain = getRootDomain(sourceDomain);
      setCookie("user", JSON.stringify(user), { path: "/", domain: rootDomain, expires: dateExpires });
    } else {
      showToast("Có lỗi xảy ra vui lòng thử lại sau!", "error");
    }
  };

  return null;
}

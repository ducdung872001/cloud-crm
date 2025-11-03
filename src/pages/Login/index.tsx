/* eslint-disable prefer-const */
import React, { useEffect, useState } from "react";
import { isObjEmpty } from "reborn-util";
import { useNavigate, useLocation } from "react-router-dom";
import UserService from "services/UserService";
import EmployeeService from "services/EmployeeService";
import BeautyBranchService from "services/BeautyBranchService";
import PermissionService from "services/PermissionService";
import { useCookies } from "react-cookie";
import moment from "moment";
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
      (lstPermissionResource || []).forEach((permissionResource: any) => {
        let actions = JSON.parse(permissionResource.actions);
        actions.forEach((action: any) => {
          mapPermission[`${permissionResource.code}_${action}`] = 1;
        });
      });

      // console.log("permissions =>", JSON.stringify(mapPermission));
      localStorage.setItem("permissions", JSON.stringify(mapPermission));

      const takeIsBeauty = await BeautyBranchService.getByBeauty(cookies.token);
      if (!isObjEmpty(takeIsBeauty)) {
        localStorage.setItem("isBeauty", takeIsBeauty.isBeauty);

        //Sẽ lưu lại logo của tổ chức nếu tên miền khác reborn.vn
        let sourceDomain = getDomain(decodeURIComponent(location.href));
        console.log("sourceDomain =>", sourceDomain);

        // if (!sourceDomain.endsWith("reborn.vn")) {
        console.log("sourceDomain =>", "Có vào");
        localStorage.setItem("logoOrganization", takeIsBeauty.logo || takeIsBeauty.logoTransparent || "");
        // }
      }

      const userRes = response.result.user;
      const dateExpires = moment().add(3000, "minutes").toDate();
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

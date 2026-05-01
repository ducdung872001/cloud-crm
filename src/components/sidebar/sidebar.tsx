import React, {Fragment, useCallback, useContext, useEffect, useState, memo} from "react";
import Navigation from "components/navigation/navigation";
import LogoMenu from "assets/images/logo-menu.svg";
import { menu } from "configs/routes";
import Button from "components/button/button";
import Icon from "components/icon";
import { Link } from "react-router-dom";
import { UserContext, ContextType } from "contexts/userContext";
import CustomScrollbar from "components/customScrollbar";
import { useLocation } from "react-router-dom";
import { fadeIn, fadeOut } from "reborn-util";
import { useWindowDimensions } from "utils/hookCustom";
import { getDomain } from "reborn-util";
import { logout } from "utils/common";
import ShowModalChangeRole from "pages/Common/ShowModalChangeRole";
import "./sidebar.scss";


const style_height_width: React.CSSProperties = { height: "100%", width: "auto" };
function Sidebar() {
  const location = useLocation();
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);
  const [showModalChangeRole, setShowModalChangeRole] = useState<boolean>(false);
  const { isCollapsedSidebar, setIsCollapsedSidebar, dataBeauty, lstRole, name, avatar, phone, setIsShowChatBot } = useContext(UserContext) as ContextType;
  const { width, height } = useWindowDimensions();
  const hasMultipleRoles = Array.isArray(lstRole) && lstRole.length > 1;

  const [logoOrganization, setLogoOrganization] = useState(() => {
    return localStorage.getItem("logoOrganization") || "";
  });

  const showMenuMobile = useCallback(() => {
    const overlay = document.querySelector(".overlay-sidebar__mobile");
    if (overlay) {
      const body = document.getElementsByTagName("body")[0];
      if (isCollapsedSidebar) {
        fadeOut(overlay);
        body.style.overflow = "";
      } else {
        fadeIn(overlay);
        body.style.overflow = "hidden";
      }
    }
    setIsCollapsedSidebar(!isCollapsedSidebar);
  }, [isCollapsedSidebar, setIsCollapsedSidebar]);

  useEffect(() => {
    if (isCollapsedSidebar && width < 1200) {
      showMenuMobile();
    }
  }, [location]);

  return (
    <Fragment>
      <div
        className={`sidebar${isCollapsedSidebar ? " sidebar--collapsed" : ""}${isMouseOver && isCollapsedSidebar ? " sidebar--hover" : ""}`}
        onMouseOver={() => setIsMouseOver(true)}
        onMouseLeave={() => setIsMouseOver(false)}
      >
        <div className="sidebar-logo d-flex align-items-center justify-content-between">
          <Link to="/" className="logo">
            <LogoMenu />
          </Link>
          {isMouseOver || !isCollapsedSidebar ? (
            <Button
              type="button"
              color="transparent"
              className="btn-collapsed-sidebar d-none d-xl-flex"
              onlyIcon={true}
              onClick={() => setIsCollapsedSidebar(!isCollapsedSidebar)}
            >
              {isCollapsedSidebar ? <Icon name="ChevronDoubleRight" /> : <Icon name="ChevronDoubleLeft" />}
            </Button>
          ) : null}
        </div>

        {/* User info — avatar + tên + phone (ẩn khi sidebar collapsed) */}
        {(name || phone) && (
          <Link to="/setting_account" className="sidebar-user" onClick={() => width < 1200 && showMenuMobile()}>
            <div className="sidebar-user__avatar">
              {avatar ? <img src={avatar} alt={name || "avatar"} /> : <Icon name="AccountCircle" />}
            </div>
            <div className="sidebar-user__info">
              {name && <div className="sidebar-user__name">{name}</div>}
              {phone && <div className="sidebar-user__phone">{phone}</div>}
            </div>
          </Link>
        )}
        <CustomScrollbar
          className="sidebar-menu d-flex flex-column"
          width="100%"
          height={
            height
            - 57 // logo header
            - 76 // user info section (avatar + 2 lines)
            - 56 * 3 // Tài khoản + Hỗ trợ + Đăng xuất
            - (hasMultipleRoles ? 56 : 0) // Chuyển vai trò
          }
          autoHide={true}
        >
          <Navigation menuItemList={menu} />
        </CustomScrollbar>

        <div className="sidebar-footer">
          {hasMultipleRoles && (
            <button
              type="button"
              className="sidebar-footer__btn"
              onClick={() => {
                setShowModalChangeRole(true);
                if (width < 1200) showMenuMobile();
              }}
            >
              <Icon name="SwitchAccount" />
              <span>Chuyển vai trò</span>
            </button>
          )}
          <Link to="/setting_account" className="sidebar-footer__btn" onClick={() => width < 1200 && showMenuMobile()}>
            <Icon name="AccountCircle" />
            <span>Tài khoản &amp; mật khẩu</span>
          </Link>
          <button
            type="button"
            className="sidebar-footer__btn"
            onClick={() => {
              setIsShowChatBot(true);
              if (width < 1200) showMenuMobile();
            }}
          >
            <Icon name="CustomerSupport" />
            <span>Hỗ trợ &amp; chatbot</span>
          </button>
          <button
            type="button"
            className="sidebar-footer__btn sidebar-footer__btn--logout"
            onClick={() => {
              if (window.confirm("Đăng xuất khỏi hệ thống?")) logout();
            }}
          >
            <Icon name="Logout" />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* <div
          className={`sidebar__option${isCollapsedSidebar ? " sidebar__option--show" : ""}${
            isMouseOver && isCollapsedSidebar ? " sidebar__option--show" : ""
          } d-flex align-items-center justify-content-between`}
        >
          <Link to="" className="item">
            CRM
          </Link>
          <Link to="" className="item link-item">
            CMS
          </Link>
          <Link to="" className="item link-item">
            WEB
          </Link>
        </div> */}
      </div>
      <ShowModalChangeRole
        lstData={lstRole || []}
        onShow={showModalChangeRole}
        onHide={() => setShowModalChangeRole(false)}
        data={localStorage.getItem("SelectedRole") || null}
      />
      {width < 1200 && (
        <div className="overlay-sidebar__mobile" onClick={() => showMenuMobile()}>
          <Button type="button" color="transparent" className="btn-close-sidebar" onlyIcon={true}>
            <Icon name="Times" />
          </Button>
        </div>
      )}
    </Fragment>
  );
}

export default memo(Sidebar);

import React, { Fragment, useContext, useEffect, useState } from "react";
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
import "./sidebar.scss";

export default function Sidebar() {
  const location = useLocation();
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);
  const { isCollapsedSidebar, setIsCollapsedSidebar, dataBeauty } = useContext(UserContext) as ContextType;
  const { width, height } = useWindowDimensions();

  const [logoOrganization, setLogoOrganization] = useState(() => {
    return localStorage.getItem("logoOrganization") || "";
  });

  const showMenuMobile = () => {
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
  };

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
            {logoOrganization ? <img src={logoOrganization} style={{ height: "100%", width: "auto" }} /> : <LogoMenu />}
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
        <CustomScrollbar className="sidebar-menu d-flex flex-column" width="100%" height={height - 57} autoHide={true}>
          <Navigation menuItemList={menu} />
        </CustomScrollbar>

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

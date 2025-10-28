import React, { useContext, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "components/icon";
import { IMenuItem } from "model/OtherModel";
import { getPermissions } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import _ from "lodash";
import "./navigation.scss";

import "i18n";

interface NavigationProps {
  menuItemList: IMenuItem[];
}

const filterMenuItemList = (menuItemList: any) => {
  //Lọc menu ở đây
  const permissions = getPermissions();

  return menuItemList
    .map((m) => {
      if (m?.code) {
        if (permissions[m.code + "_VIEW"] == 1) {
          return m;
        }

        return null;
      }

      return m;
    })
    .filter((m) => m);
};

export default function Navigation(props: NavigationProps) {
  const { menuItemList } = props;

  const { permissions, dataExpired } = useContext(UserContext) as ContextType;

  const location = useLocation();

  const [hasShowChildren, setHasShowChildren] = useState<boolean>(false);

  const [menuList, setMenuList] = useState<IMenuItem[]>(
    filterMenuItemList(menuItemList).map((m) => {
      return {
        ...m,
        is_show_children:
          m.path === location.pathname ||
          (m.children && m.children.filter((children) => children.path === location.pathname)?.length > 0) ||
          m.is_active,
      };
    })
  );
  const setShowChildren = (idx: number) => {
    const menuListNew = _.cloneDeep(menuList);
    setMenuList(
      menuListNew.map((m, index) => {
        return {
          ...m,
          is_show_children: m.is_show_children === true ? false : index === idx,
        };
      })
    );
  };

  const handShowChildren = (item) => {
    if (item.children == undefined || item.children == null) {
      setHasShowChildren(false);
    } else {
      setHasShowChildren(true);
    }
  };

  const { t } = useTranslation();

  return (
    <ul className="navigation">
      {menuList.map((item, idx) => {
        //Lọc thêm dựa vào quyền
        if (item.children && item.children.length > 0) {
          item.children = filterMenuItemList(item.children);
        }

        const isActive =
          item.path === location.pathname ||
          (item.children && item.children.filter((children) => children.path === location.pathname)?.length > 0) ||
          item.is_active;
        const disabledChildrenCount =
          item.children?.length > 0 &&
          item.children.filter((children) => children.permission && permissions.filter((per) => children.permission?.includes(per)).length === 0)
            .length;

        return (
          <li
            key={idx}
            className={`level-1${isActive ? " active" : ""}${item.is_show_children ? " show-children" : ""}${
              (item.permission && permissions.filter((per) => item.permission?.includes(per)).length === 0) ||
              (item.children?.length > 0 && disabledChildrenCount === item.children.length) ||
              (dataExpired && dataExpired.numDay <= 0)
                ? " disabled"
                : ""
            }`}
          >
            {item.children && item.children.length > 0 ? (
              <a
                className="d-flex align-items-center"
                onClick={() => {
                  if (dataExpired && dataExpired.numDay > 0) {
                    handShowChildren(item);
                    setShowChildren(idx);
                  }
                }}
                title={t(`sidebar.${item.title}`)}
                target={item.target}
              >
                {item.icon}
                <span>{t(`sidebar.${item.title}`)}</span>
                {item.children &&
                  item.children.length > 0 &&
                  (item.is_show_children ? <Icon name="ChevronDown" className="arrow-menu" /> : <Icon name="ChevronRight" className="arrow-menu" />)}
              </a>
            ) : (
              <Link
                className="d-flex align-items-center"
                to={item.path}
                title={t(`sidebar.${item.title}`)}
                target={item.target}
                onClick={() => {
                  if (dataExpired && dataExpired.numDay > 0) {
                    handShowChildren(item);
                  }
                }}
              >
                {item.icon}
                <span>{t(`sidebar.${item.title}`)}</span>
              </Link>
            )}
            {item.children && item.children.length > 0 && (
              <ul
                style={{
                  maxHeight:
                    item.is_show_children || (isActive && menuList.find((m) => m.is_show_children) === item)
                      ? item.children.length === 1
                        ? item.children.length * 62
                        : item.children.length * 48
                      : null,
                  transition: `max-height ${item.children.length * 0.1}s ease-in-out`,
                }}
              >
                {item.children.map((childrenItem, idxChild) => (
                  <li
                    key={idxChild}
                    className={`level-2${childrenItem.path === location.pathname ? " active" : ""}${
                      (childrenItem.permission && permissions.filter((per) => childrenItem.permission?.includes(per)).length === 0) ||
                      (dataExpired && dataExpired.numDay <= 0)
                        ? " disabled"
                        : ""
                    }`}
                  >
                    <Link className="d-flex align-items-center" to={childrenItem.path} title={childrenItem.title} target={childrenItem.target}>
                      {childrenItem.icon}
                      {t(`sidebar.${childrenItem.title}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

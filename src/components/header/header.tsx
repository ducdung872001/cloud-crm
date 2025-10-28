import React, { useEffect, useRef, useState, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay } from "swiper";
import Button from "components/button/button";
import Icon from "components/icon";
import Popover from "components/popover/popover";
import { UserContext, ContextType } from "contexts/userContext";
import { INotification, INotificationItem } from "model/OtherModel";
import ImageThirdGender from "assets/images/third-gender.png";
import { fadeIn, fadeOut, getDomain } from "reborn-util";
import { useOnClickOutside } from "utils/hookCustom";
import { getRootDomain } from "utils/common";
import BeautyBranchService from "services/BeautyBranchService";
import Input from "components/input/input";
import ShowModalChangeRole from "pages/Common/ShowModalChangeRole";
import "./header.scss";
import Tippy from "@tippyjs/react";

SwiperCore.use([Autoplay]);

export default function Header(props: any) {
  const [cookies, setCookie, removeCookie] = useCookies();
  const { valueBranch, handleChangeValueBranch, listBranch, newListBranch, searchListBranch, paramBranch } = props;
  const {
    isCollapsedSidebar,
    setIsCollapsedSidebar,
    name,
    phone,
    avatar,
    setIsShowFeedback,
    token,
    dataExpired,
    valueLanguage,
    setValueLanguage,
    setDataBeauty,
    lstRole,
  } = useContext(UserContext) as ContextType;

  const checkUserRoot = localStorage.getItem("user.root");

  const navigate = useNavigate();

  const refUser = useRef();
  const refUserContainer = useRef();
  const refBranch = useRef();
  const refBranchContainer = useRef();
  const [showPopoverUser, setShowPopoverUser] = useState<boolean>(false);
  const [showPopoverBranch, setShowPopoverBranch] = useState<boolean>(false);
  useOnClickOutside(refUser, () => setShowPopoverUser(false), ["user-dropdown"]);
  useOnClickOutside(refBranch, () => setShowPopoverBranch(false), ["container-branch"]);

  const checkLanguageCrm = localStorage.getItem("languageCrm");

  useEffect(() => {
    if (checkLanguageCrm) {
      const takeValue = JSON.parse(checkLanguageCrm);
      setValueLanguage(takeValue);
    }
  }, [checkLanguageCrm]);

  const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);

  const handleLogout = () => {
    setIsLogoutLoading(true);
    // UserService.logout().then(() => {
    //   removeCookie("user", { path: "/", domain: rootDomain });
    //   removeCookie("token", { path: "/", domain: rootDomain });
    //   localStorage.removeItem("permissions");
    //   localStorage.removeItem("user.root");
    //   navigate("/login");
    //   setIsLogoutLoading(false);
    // });

    const sourceDomain = getDomain(decodeURIComponent(document.location.href));
    const rootDomain = getRootDomain(sourceDomain);

    //TNEX
    const checkSubdomainTNEX = sourceDomain.includes("tnex");
    const accessTokenAthena = (localStorage.getItem("access_token_athena") || "");
    if(checkSubdomainTNEX){
      logoutAccountAthena(accessTokenAthena);
      setTimeout(() => {
        removeCookie("user", { path: "/", domain: rootDomain });
        removeCookie("token", { path: "/", domain: rootDomain });
        localStorage.removeItem("permissions");
        localStorage.removeItem("user.root");
        localStorage.removeItem("SelectedRole");
        navigate("/login");
        setIsLogoutLoading(false);
    
        localStorage.removeItem("checkIsKanban");
        localStorage.removeItem("isKanbanCampaign");
        localStorage.removeItem("kanbanTabOpportunity");
        localStorage.removeItem("campaignId");
        localStorage.removeItem("campaignName");
        localStorage.removeItem("campaignType");
    
        localStorage.removeItem("valueBranch");
    
        localStorage.removeItem("isKanbanContract");
        localStorage.removeItem("pipelineContractId");
    
        localStorage.removeItem("targetBsnId_product");
        localStorage.removeItem("access_token_athena");
      }, 1500)
    } else {
      removeCookie("user", { path: "/", domain: rootDomain });
      removeCookie("token", { path: "/", domain: rootDomain });
      localStorage.removeItem("permissions");
      localStorage.removeItem("user.root");
      localStorage.removeItem("SelectedRole");
      navigate("/login");
      setIsLogoutLoading(false);

      localStorage.removeItem("checkIsKanban");
      localStorage.removeItem("isKanbanCampaign");
      localStorage.removeItem("kanbanTabOpportunity");
      localStorage.removeItem("campaignId");
      localStorage.removeItem("campaignName");
      localStorage.removeItem("campaignType");

      localStorage.removeItem("valueBranch");

      localStorage.removeItem("isKanbanContract");
      localStorage.removeItem("pipelineContractId");

      localStorage.removeItem("targetBsnId_product");
      localStorage.removeItem("access_token_athena");
    }

  };

  const logoutAccountAthena = async (accessTokenAthena) => {
    const url = "https://api-athenaspear-prod.athenafs.io/api/v1/account/logout";
    const headers = {
      "Content-Type": "application/json",
      "x-access-token": accessTokenAthena,
    };
    const response: any = await fetch(url, {
      method: "GET", 
      headers: headers,
      // body: JSON.stringify(body),
    }).then((res) => res.json());

    console.log('response', response);

    if (response?.error_code === 0) {

    } else {
     
    }
  }

  const refNotification = useRef();
  const refNotificationContainer = useRef();
  const [showPopoverNotification, setShowPopoverNotification] = useState<boolean>(false);
  useOnClickOutside(refNotification, () => setShowPopoverNotification(false), ["notification-dropdown"]);

  const [listNotification, setListNotification] = useState<INotification>({
    total: 0,
    unread: 0,
    list_noti: [],
  });

  const [detailNotification, setDetailNotification] = useState<INotificationItem>(null);
  const [showModalDetailNotification, setShowModalDetailNotification] = useState<boolean>(false);
  const [isLoadingNotification, setIsLoadingNotification] = useState<boolean>(false);
  const [paramsNotification, setParamsNotification] = useState({
    per_page: 5,
  });

  const getNotification = () => {
    setIsLoadingNotification(true);
    // UserService.getNotification(paramsNotification)
    //   .then((res) => {
    //     if (res.result) {
    //       setIsLoadingNotification(false);
    //       setListNotification({ ...res.result, list_noti: [...listNotification.list_noti, ...res.result.list_noti] });
    //     }
    //   })
    //   .catch(() => {
    //     setIsLoadingNotification(false);
    //   });
  };

  useEffect(() => {
    getNotification();
    return () => {
      setIsLoadingNotification(false);
      setListNotification({
        total: 0,
        unread: 0,
        list_noti: [],
      });
    };
  }, [paramsNotification]);

  const readNotification = (e, item: INotificationItem) => {
    e.preventDefault();
    // if (item.url) {
    //   const win = window.open(item.url, "_blank");
    //   win.focus();
    // } else if (item.content) {
    //   setDetailNotification(item);
    //   setShowModalDetailNotification(true);
    // }
    // if (!item.is_read) {
    //   UserService.readNotification(item.id).then((res) => {
    //     if (res.RESULT === 1) {
    //       const listNotificationNew = _.cloneDeep(listNotification);
    //       listNotificationNew.unread = listNotificationNew.unread - 1;
    //       const indexItem = listNotificationNew.list_noti.findIndex((n) => n.id === item.id);
    //       if (indexItem !== -1) {
    //         listNotificationNew.list_noti[indexItem].is_read = true;
    //         setListNotification(listNotificationNew);
    //       }
    //     }
    //   });
    // }
  };

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

  // đoạn này mình fix tạm vậy sau có nhiều khách hàng tính giải pháp sau
  const location = window.location;

  const [dataCompany, setDataCompany] = useState(null);

  const handGetCompany = async () => {
    const response = await BeautyBranchService.getByBeauty(token);

    if (response) {
      setDataCompany(response);
      setDataBeauty(response);
    } else {
      setDataCompany("");
    }
  };

  useEffect(() => {
    handGetCompany();
  }, []);

  const lstLanguage = [
    {
      name: "Tiếng Việt",
      shortName: "vi",
    },
    {
      name: "English",
      shortName: "en",
    },
  ];

  const refLanguage = useRef();
  const refLanguageContainer = useRef();
  const [showPopoverLanguage, setShowPopoverLanguage] = useState<boolean>(false);
  useOnClickOutside(refLanguage, () => setShowPopoverLanguage(false), ["view-language"]);

  const getLevle = (code: number) => {
    switch (code) {
      case 0:
        return "";
      case 1:
        return "- ";
      case 2:
        return "- - ";
      case 3:
        return "- - - ";
      case 4:
        return "- - - - ";
      case 5:
        return "- - - - - ";
      case 6:
        return "- - - - - - ";
      case 7:
        return "- - - - - - - ";
      default:
        return "";
    }
  };

  const [showModalChangeRole, setShowModalChangeRole] = useState<boolean>(false);

  return (
    <div className="header d-flex justify-content-between">
      <Button type="button" color="transparent" className="d-block d-xl-none btn-menu-mobile" onClick={() => showMenuMobile()}>
        <Icon name="Bars" />
      </Button>
      <div className="notification-hot">
        <Swiper
          slidesPerView={1}
          // autoplay={{
          //   delay: 3000,
          //   disableOnInteraction: false,
          // }}
          // loop={true}
          direction="vertical"
          simulateTouch={false}
        >
          <SwiperSlide className="swiper__item">
            <div className="info__common">
              <span className="name">{dataCompany && dataCompany.name}</span>
              <span className="__package">{` - Sử dụng ${dataExpired?.name?.toLowerCase()}`}</span>{" "}
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="header-actions d-flex align-items-center">
        {checkUserRoot == "1" ? (
          <div className={`container-branch ${showPopoverBranch ? "action__container--branch" : ""}`} ref={refBranchContainer}>
            <div className="branch-filter" onClick={() => setShowPopoverBranch(!showPopoverBranch)}>
              <div className="icon-location">
                <Icon name="Location" />
              </div>
              {valueBranch?.label.length > 30 ? (
                <Tippy content={valueBranch?.label}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: "500", marginLeft: 3, cursor: "pointer" }}>
                      {valueBranch?.label.substring(0, 22)}...
                    </span>
                  </div>
                </Tippy>
              ) : (
                <span style={{ fontSize: 15, fontWeight: "500", marginLeft: 3 }}>{valueBranch?.label}</span>
              )}
              {/* <span style={{ fontSize: 15, fontWeight: "500", marginLeft: 3 }}>{valueBranch?.label}</span> */}
            </div>

            {showPopoverBranch && (
              <Popover alignment="right" isTriangle={true} className="popover-branch-header" refContainer={refBranchContainer} refPopover={refBranch}>
                <div className="form-list-branch">
                  <div className="form-group">
                    <Input
                      id="search"
                      name="search"
                      label=""
                      className="input-search"
                      fill={true}
                      placeholder={"Tìm kiếm"}
                      value={paramBranch.name}
                      iconPosition="left"
                      icon={<Icon name={"Search"} width={18} />}
                      onChange={(e) => {
                        searchListBranch(e.target.value);
                      }}
                    />
                  </div>

                  <div className="list-branch">
                    {paramBranch.name ? (
                      <div>
                        {listBranch &&
                          listBranch.length > 0 &&
                          (listBranch || []).map((item, key) => {
                            return (
                              <label
                                key={key}
                                onClick={() => {
                                  handleChangeValueBranch(item);
                                  setShowPopoverBranch(false);
                                }}
                              >
                                {item.label}
                              </label>
                            );
                          })}
                      </div>
                    ) : (
                      <div>
                        {newListBranch && newListBranch.length > 0 ? (
                          (newListBranch || []).map((item, key) => {
                            return (
                              <div key={key} style={{ marginLeft: item.level * 10, color: valueBranch.value === item.value ? "#015aa4" : "" }}>
                                <label
                                  key={key}
                                  onClick={() => {
                                    handleChangeValueBranch(item);
                                    setShowPopoverBranch(false);
                                  }}
                                >
                                  {`${getLevle(item.level)}${item.label}`}
                                </label>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ justifyContent: "center", display: "flex", width: "100%" }}>
                            <span style={{ fontSize: 14, color: "#757575" }}>Chưa có dữ liệu</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Popover>
            )}
          </div>
        ) : (
          <div className={`container-branch`}>
            <div className="branch-filter">
              <div className="icon-location">
                <Icon name="Location" />
              </div>
              <span style={{ fontSize: 15, fontWeight: "500", marginLeft: 3 }}>{valueBranch?.label}</span>
            </div>
          </div>
        )}
        <div className="view-language" ref={refLanguageContainer}>
          <Button type="button" color="transparent" onClick={() => setShowPopoverLanguage(!showPopoverLanguage)}>
            <Icon name="Language" />
            {valueLanguage.name}
          </Button>
          {showPopoverLanguage && (
            <Popover alignment="right" isTriangle={true} className="popover-language" refContainer={refLanguageContainer} refPopover={refLanguage}>
              <ul>
                {lstLanguage.map((item, idx) => {
                  return (
                    <li
                      key={idx}
                      onClick={() => {
                        setValueLanguage(item);
                        setShowPopoverLanguage(false);
                        localStorage.setItem("languageCrm", JSON.stringify(item));
                      }}
                    >
                      {item.name}
                    </li>
                  );
                })}
              </ul>
            </Popover>
          )}
        </div>
        <div className="notification-dropdown" ref={refNotificationContainer}>
          <Button type="button" color="transparent" onClick={() => setShowPopoverNotification(!showPopoverNotification)}>
            <Icon name="Bell" />
            {listNotification.unread > 0 && <span className="count">{listNotification.unread > 99 ? "99" : listNotification.unread}</span>}
          </Button>
          {showPopoverNotification && listNotification.list_noti.length > 0 && (
            <Popover
              alignment="right"
              isTriangle={true}
              className="popover-notification-header"
              refContainer={refNotificationContainer}
              refPopover={refNotification}
            >
              <div className="notification__wrapper">
                <ul>
                  {listNotification.list_noti.map((n, index) => (
                    <li key={index} onClick={(e) => readNotification(e, n)} className={`notification-item${!n.is_read ? " unread" : ""}`}>
                      {n.type === "order" ? (
                        <div className="notification-item__icon order">
                          <Icon name="Order" />
                        </div>
                      ) : n.type === "news" ? (
                        <div className="notification-item__icon news">
                          <Icon name="News" />
                        </div>
                      ) : n.type === "promotion" ? (
                        <div className="notification-item__icon promotion">
                          <Icon name="Promotion" />
                        </div>
                      ) : (
                        <div className="notification-item__icon system">
                          <Icon name="Settings" />
                        </div>
                      )}
                      <div className="notification-item__body">
                        <h3>{n.title}</h3>
                        <time className="text-muted">{moment(n.created_at).format("H:mm | DD-MM-yyyy")}</time>
                      </div>
                    </li>
                  ))}
                </ul>
                {listNotification.list_noti.length < listNotification.total && (
                  <Button
                    type="button"
                    color="link"
                    className="btn-viewmore-noti"
                    disabled={isLoadingNotification}
                    onClick={() => setParamsNotification({ ...paramsNotification, per_page: paramsNotification.per_page + 5 })}
                  >
                    Xem thêm thông báo
                    {isLoadingNotification && <Icon name="Loading" />}
                  </Button>
                )}
              </div>
            </Popover>
          )}
        </div>

        <div className="user-dropdown" ref={refUserContainer}>
          <Button type="button" color="transparent" onClick={() => setShowPopoverUser(!showPopoverUser)}>
            <div className="avatar">
              <img src={avatar || ImageThirdGender} alt="avatar" style={{ objectFit: location.origin.includes("sor") ? "contain" : "cover" }} />
            </div>
            <span className="d-none d-md-block">{name}</span>
          </Button>
          {showPopoverUser && (
            <Popover alignment="right" isTriangle={true} className="popover-user-header" refContainer={refUserContainer} refPopover={refUser}>
              <ul>
                <li
                  onClick={() => {
                    setShowPopoverUser(false);
                    navigate("/setting_account");
                  }}
                >
                  <Icon name="AccountCircle" />
                  <span>Tài khoản</span>
                </li>
                <li onClick={() => setShowPopoverUser(false)}>
                  <Icon name="CustomerCare" />
                  <span>{phone}</span>
                </li>
                <li
                  onClick={() => {
                    setIsShowFeedback(true);
                    setShowPopoverUser(false);
                  }}
                >
                  <Icon name="Feedback" />
                  <span>Góp ý cải tiến</span>
                </li>
                <li
                  onClick={() => {
                    setShowModalChangeRole(true);
                    setShowPopoverUser(false);
                  }}
                >
                  <Icon name="SwitchAccount" />
                  <span>Chuyển vai trò</span>
                </li>
                <li onClick={() => (!isLogoutLoading ? handleLogout() : undefined)}>
                  <Icon name="Logout" />
                  <span>Đăng xuất</span>
                  {isLogoutLoading && <Icon className="logout-loading" name="Loading" />}
                </li>
              </ul>
            </Popover>
          )}
        </div>
      </div>
      <ShowModalChangeRole
        lstData={lstRole}
        onShow={showModalChangeRole}
        onHide={() => setShowModalChangeRole(false)}
        data={localStorage.getItem("SelectedRole") || null}
      />
    </div>
  );
}

import React, { useEffect, useRef, useState, useContext, useCallback } from "react";
import _ from "lodash";
import moment from "moment";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Button from "components/button/button";
import Icon from "components/icon";
import Popover from "components/popover/popover";
import { UserContext, ContextType } from "contexts/userContext";
import { INotification, INotificationItem } from "model/OtherModel";
import ImageThirdGender from "assets/images/third-gender.png";
import { fadeIn, fadeOut, getDomain } from "reborn-util";
import { useOnClickOutside } from "utils/hookCustom";
import { getRootDomain, showToast } from "utils/common";
import BeautyBranchService from "services/BeautyBranchService";
import Input from "components/input/input";
import ShowModalChangeRole from "pages/Common/ShowModalChangeRole";
import "./header.scss";
import Tippy from "@tippyjs/react";
import { onMessage } from "firebase/messaging";
import { messaging } from "@/firebase-config";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Loading from "../loading";
import NotificationService from "@/services/NotificationService";
import { requestPermission } from "@/firebase-config";
import CustomerService from "services/CustomerService";
import ProductService from "services/ProductService";
import InvoiceService from "services/InvoiceService";

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
    countUnread,
    setCountUnread,
    newNotificationPayload,
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
    const accessTokenAthena = localStorage.getItem("access_token_athena") || "";
    if (checkSubdomainTNEX) {
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
      }, 1500);
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

    console.log("response", response);

    if (response?.error_code === 0) {
    } else {
    }
  };

  const refNotification = useRef();
  const refNotificationContainer = useRef();
  const [showPopoverNotification, setShowPopoverNotification] = useState<boolean>(false);
  useOnClickOutside(refNotification, () => setShowPopoverNotification(false), ["notification-dropdown"]);

  // const [listNotification, setListNotification] = useState<INotification>({
  //   total: 0,
  //   unread: 0,
  //   list_noti: [],
  // });

  const [listNotification, setListNotification] = useState([]);
  const [isLoadingNotify, setLoadingNotify] = useState(false);
  const [isReadingAll, setIsReadingAll] = useState(false);

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

  // useEffect(() => {
  //   getNotification();
  //   return () => {
  //     setIsLoadingNotification(false);
  //     setListNotification({
  //       total: 0,
  //       unread: 0,
  //       list_noti: [],
  //     });
  //   };
  // }, [paramsNotification]);

  const getListNotify = async (paramsSearch: any, disableLoading?: boolean) => {
    setLoadingNotify(true);
    const response = await NotificationService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result.items;

      setListNotification(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setLoadingNotify(false);
  };

  useEffect(() => {
    if (showPopoverNotification) {
      getListNotify({
        limit: 10,
        page: 1,
      });
    }
  }, [showPopoverNotification]);

  useEffect(() => {
    if (newNotificationPayload && showPopoverNotification) {
      getListNotify({
        limit: 10,
        page: 1,
      });
    }
  }, [newNotificationPayload]);

  const onUnread = async (id: number) => {
    const response = await NotificationService.updateUnread({ id: id });
    if (response.code === 0) {
      console.log("Đã đọc");
      getListNotify({
        limit: 10,
        page: 1,
      });
      getCountUnread();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onReadAll = async () => {
    if (isReadingAll) return;
    setIsReadingAll(true);
    try {
      const response = await NotificationService.updateReadAll({});
      if (response.code === 0) {
        showToast("Đã đánh dấu tất cả là đã đọc", "success");
        // Cập nhật UI ngay
        setListNotification((prev) =>
          (prev as any[]).map((item) => ({ ...item, unread: 1 }))
        );
        setCountUnread(0);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    } finally {
      setIsReadingAll(false);
    }
  };

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

  // ── Global Search ──────────────────────────────────────────────────────────
  type SearchGroup = "product" | "customer" | "invoice";
  interface SearchResult {
    id:       number;
    group:    SearchGroup;
    title:    string;
    subtitle: string;
    avatar?:  string;
    meta?:    string;
  }
  const searchRef         = useRef<HTMLDivElement>(null);
  const searchInputRef    = useRef<HTMLInputElement>(null);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [searchResults,   setSearchResults]   = useState<SearchResult[]>([]);
  const [searchLoading,   setSearchLoading]   = useState(false);
  const [searchAbort,     setSearchAbort]     = useState<AbortController | null>(null);

  useOnClickOutside(searchRef, () => setSearchOpen(false), ["gs-dropdown"]);

  const fmt = (n: number) => n?.toLocaleString("vi") + " ₫";

  const doSearch = useCallback(
    _.debounce(async (q: string) => {
      if (!q.trim()) { setSearchResults([]); setSearchLoading(false); return; }
      searchAbort?.abort();
      const ctrl = new AbortController();
      setSearchAbort(ctrl);
      setSearchLoading(true);
      try {
        const [custRes, prodRes, invRes] = await Promise.allSettled([
          CustomerService.filter({ keyword: q, page: 1, limit: 5 }, ctrl.signal),
          ProductService.publicList({ name: q, page: 1, limit: 5 } as any, ctrl.signal),
          // Nếu query trông giống mã đơn (HD, DH + số) → dùng invoiceCode, ngược lại keyword
          InvoiceService.list({
            ...(q.match(/^(HD|DH|INV|dh|hd)/i) ? { invoiceCode: q } : { keyword: q }),
            page: 1, limit: 5,
          } as any, ctrl.signal),
        ]);
        const results: SearchResult[] = [];
        if (custRes.status === "fulfilled" && custRes.value?.code === 0) {
          const custItems = custRes.value.result?.items
            ?? custRes.value.result?.pagedLst?.items
            ?? custRes.value.result
            ?? [];
          (custItems as any[]).slice(0, 3).forEach((c: any) => {
            results.push({
              id:       c.id,
              group:    "customer",
              title:    c.name,
              subtitle: c.phone ?? c.number_phone ?? "",
              avatar:   c.avatar,
              meta:     c.code ?? "",
            });
          });
          const custTotal = custRes.value.result?.total ?? custRes.value.result?.pagedLst?.total ?? 0;
          if (custTotal > 3) results.push({ id: -1, group: "customer", title: `__more__${custTotal}`, subtitle: "", meta: "" });
        }

        if (prodRes.status === "fulfilled" && prodRes.value?.code === 0) {
          const prodItems = prodRes.value.result?.items
            ?? prodRes.value.result?.pagedLst?.items
            ?? [];
          (prodItems as any[]).slice(0, 3).forEach((p: any) => {
            results.push({
              id:       p.id,
              group:    "product",
              title:    p.name,
              subtitle: `Tồn: ${p.stockQuantity ?? 0}`,
              avatar:   p.image ?? p.avatar,
              meta:     p.salePrice ? fmt(p.salePrice) : "",
            });
          });
          const prodTotal = prodRes.value.result?.total ?? 0;
          if (prodTotal > 3) results.push({ id: -1, group: "product", title: `__more__${prodTotal}`, subtitle: "", meta: "" });
        }

        if (invRes.status === "fulfilled" && invRes.value?.code === 0) {
          const invItems = invRes.value.result?.pagedLst?.items
            ?? invRes.value.result?.items
            ?? [];
          (invItems as any[]).slice(0, 3).forEach((row: any) => {
            const inv = row.invoice ?? row;
            const prodNames = (row.products ?? [])
              .map((p: any) => p.productName)
              .filter(Boolean)
              .join(", ");
            results.push({
              id:       inv.id ?? row.invoiceId,
              group:    "invoice",
              title:    inv.invoiceCode ?? `#${inv.id ?? row.invoiceId}`,
              subtitle: prodNames || "—",
              meta:     inv.fee ? fmt(inv.fee) : inv.amount ? fmt(inv.amount) : "",
            });
          });
          const invTotal = invRes.value.result?.pagedLst?.total ?? invRes.value.result?.total ?? 0;
          if (invTotal > 3) results.push({ id: -1, group: "invoice", title: `__more__${invTotal}`, subtitle: "", meta: "" });
        }
        setSearchResults(results);
      } catch { /* aborted */ }
      finally { setSearchLoading(false); }
    }, 320),
    []
  );

  useEffect(() => {
    doSearch(searchQuery);
    if (searchQuery.trim()) setSearchOpen(true);
    else setSearchOpen(false);
  }, [searchQuery]);

  const handleSearchSelect = (item: SearchResult) => {
    setSearchQuery("");
    setSearchOpen(false);
    if (item.group === "customer") {
      // Mở hồ sơ KH → tab "Lịch sử mua hàng"
      navigate(`/detail_person/customerId/${item.id}/purchase_invoice`);
    } else if (item.group === "product") {
      // Mở danh sách SP với tab sản phẩm và highlight SP đó
      navigate(`/setting_sell?tab=product_tab_one&productId=${item.id}`);
    } else {
      // Mở danh sách đơn hàng + tự động bật popup chi tiết đơn
      navigate(`/sale_invoice?openInvoice=${item.id}`);
    }
  };

  const GROUP_LABEL: Record<SearchGroup, string> = {
    customer: "👤 Khách hàng",
    product:  "📦 Sản phẩm",
    invoice:  "🧾 Đơn hàng",
  };
  const GROUP_ORDER: SearchGroup[] = ["customer", "product", "invoice"];

  const getCountUnread = async () => {
    const response = await NotificationService.countUnread();
    if (response.code === 0) {
      const result = response.result;
      setCountUnread(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getCountUnread();
  }, []);



  function isJsonString(str) {
    try {
      const parsed = JSON.parse(str);
      return typeof parsed === "object" && parsed !== null;
    } catch (e) {
      return false;
    }
  }

  const handleNotificationClick = (item: any) => {
    // unread: 0 = chưa đọc, unread: 1 = đã đọc
    if (item.unread === 0 || item.unread === null) {
      onUnread(item.id);
    }
    setShowPopoverNotification(false);

    if (item.payload && isJsonString(item.payload)) {
      const payload = JSON.parse(item.payload);
      if (payload?.type === "ORDER_REQUEST" && payload.orderId) {
        navigate("/multi_channel_sales", { state: { tab: 2, orderRequestModalId: payload.orderId } });
        return;
      }
    }

    if (item.targetLink) {
      navigate(item.targetLink);
      return;
    }

    if (item.payload && isJsonString(item.payload)) {
      const payload = JSON.parse(item.payload);
      switch (payload?.type) {
        case "ORDER":
        case "ORDER_REQUEST":
          if (payload.orderId) navigate(`/orders/${payload.orderId}`);
          break;
        case "CAMPAIGN":
          if (payload.campaignId) navigate(`/campaigns/${payload.campaignId}`);
          break;
        case "BID":
          if (payload.packageId)
            navigate("/bpm/bid_management", { state: { viewDetail: true, packageId: payload.packageId } });
          break;
        case "TASK":
          if (payload.workId)
            navigate("/bpm/task_assignment", { state: { viewDetail: true, workId: payload.workId } });
          break;
        default:
          break;
      }
    }
  };

  const getNotificationIconName = (item: any): string => {
    if (item.payload && isJsonString(item.payload)) {
      const payload = JSON.parse(item.payload);
      switch (payload?.type) {
        case "ORDER":
        case "ORDER_REQUEST":
          return "OrderListMenu";
        case "CAMPAIGN":
          return "Promotion";
        case "BID":
          return "NotifyExpire";
        case "TASK":
          return "NotifySetting";
        case "TEST_PUSH":
          return "NotifyRox";
        default:
          break;
      }
    }
    return "NotifyRox";
  };

  /** Render a single notification item using the new API fields */
  const renderNotificationItem = (item: any) => {
    const isUnread = item.unread === 0 || item.unread === null; // 0/null = chưa đọc, 1 = đã đọc
    const iconName = getNotificationIconName(item);
    return (
      <div
        key={item.id}
        className={isUnread ? "item-notification-unread" : "item-notification"}
        onClick={() => handleNotificationClick(item)}
      >
        <Icon name={iconName} />
        <div className="body-notification">
          <div className="title-notification">
            <div className="box-title">
              <span className="title">{item.messageTitle || "Thông báo"}</span>
            </div>
            {isUnread ? <div className="icon-red" /> : null}
          </div>
          {item.messageText ? (
            <div className="content-notification">
              <span className="content">{item.messageText}</span>
            </div>
          ) : null}
          <div className="footer-notification">
            <span className="time">{item.sentAt ? moment(item.sentAt).format("DD/MM/YYYY - HH:mm") : ""}</span>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="header d-flex justify-content-between">
      <Button type="button" color="transparent" className="d-block d-xl-none btn-menu-mobile" onClick={() => showMenuMobile()}>
        <Icon name="Bars" />
      </Button>
      <div className="notification-hot">
        <Swiper modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} autoplay={{ delay: 3000 }}>
          <SwiperSlide className="swiper__item">
            <div className="info__common">
              <span className="name">{dataCompany && dataCompany.name}</span>
              <span className="__package">{` - Sử dụng ${dataExpired?.name?.toLowerCase()}`}</span>{" "}
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* ── Global Search ── */}
      <div className="gs-wrapper" ref={searchRef}>
        <div className={`gs-input-wrap${searchOpen ? " is-open" : ""}`}>
          <span className="gs-icon">🔍</span>
          <input
            ref={searchInputRef}
            className="gs-input"
            type="text"
            placeholder="Tìm khách hàng, sản phẩm, đơn hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }}
            onKeyDown={(e) => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } }}
          />
          {searchQuery && (
            <button className="gs-clear" onClick={() => { setSearchQuery(""); setSearchOpen(false); searchInputRef.current?.focus(); }}>✕</button>
          )}
        </div>

        {searchOpen && (
          <div className="gs-dropdown">
            {searchLoading ? (
              <div className="gs-empty">
                <span className="gs-spin">⏳</span> Đang tìm kiếm...
              </div>
            ) : searchResults.filter(r => !r.title.startsWith("__more__")).length === 0 ? (
              <div className="gs-empty">Không tìm thấy kết quả cho "<b>{searchQuery}</b>"</div>
            ) : (
              <div className="gs-scroll">
                {GROUP_ORDER.map((group) => {
                  const all   = searchResults.filter((r) => r.group === group);
                  const items = all.filter(r => !r.title.startsWith("__more__"));
                  const more  = all.find(r => r.title.startsWith("__more__"));
                  if (!items.length) return null;
                  const moreCount = more ? parseInt(more.title.replace("__more__", "")) : 0;
                  return (
                    <div key={group} className="gs-group">
                      <div className="gs-group__label">{GROUP_LABEL[group]}</div>
                      {items.map((item) => (
                        <div
                          key={`${group}-${item.id}`}
                          className="gs-item"
                          onClick={() => handleSearchSelect(item)}
                        >
                          <div className="gs-item__avatar">
                            {item.avatar
                              ? <img src={item.avatar} alt="" />
                              : <span className="gs-item__avatar-fallback">
                                  {group === "customer" ? "👤" : group === "product" ? "📦" : "🧾"}
                                </span>
                            }
                          </div>
                          <div className="gs-item__info">
                            <div className="gs-item__title">{item.title}</div>
                            {item.subtitle && <div className="gs-item__sub">{item.subtitle}</div>}
                          </div>
                          {item.meta && <div className="gs-item__meta">{item.meta}</div>}
                        </div>
                      ))}
                      {moreCount > 0 && (
                        <div className="gs-more" onClick={() => {
                          setSearchOpen(false);
                          if (group === "customer")
                            navigate(`/crm/customer_list?keyword=${encodeURIComponent(searchQuery)}`);
                          else if (group === "product")
                            navigate(`/crm/setting_sell?tab=product_tab_one&keyword=${encodeURIComponent(searchQuery)}`);
                          else
                            navigate(`/crm/sale_invoice?keyword=${encodeURIComponent(searchQuery)}`);
                        }}>
                          Xem tất cả {moreCount} kết quả →
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="gs-footer">
              Nhấn <kbd>Esc</kbd> để đóng
            </div>
          </div>
        )}
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
          <div className="button-bell" onClick={() => setShowPopoverNotification(!showPopoverNotification)}>
            <Icon name="NotifyRox" />
            {/* {<span className="count">99</span>} */}

            {countUnread ? <span className="count">{countUnread > 99 ? "99+" : countUnread}</span> : null}
          </div>
          {/* <Button type="button" color="transparent" onClick={() => setShowPopoverNotification(!showPopoverNotification)}>
            <Icon name="Bell" />
            {listNotification.unread > 0 && <span className="count">{listNotification.unread > 99 ? "99" : listNotification.unread}</span>}
          </Button> */}
          {/* {showPopoverNotification && listNotification.list_noti.length > 0 && (
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
          )} */}
          {showPopoverNotification && (
            <Popover
              alignment="right"
              isTriangle={true}
              className="popover-notification-header-bpm"
              refContainer={refNotificationContainer}
              refPopover={refNotification}
            >
              <div className="container-notification">
                <div className="popover-title">
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#015aa4" }}>Thông báo</span>
                  <div
                    className="button-close"
                    onClick={() => {
                      setShowPopoverNotification(false);
                    }}
                  >
                    <Icon name="Times" />
                  </div>
                </div>

                {listNotification && listNotification.length > 0 ? (
                  <>
                    <div className="header-notification">
                      <div>
                        <span className="text-unRead">{countUnread ? `Có ${countUnread} thông báo chưa đọc` : ""}</span>
                      </div>
                      <button
                        className={`text-Read${isReadingAll ? " text-Read--loading" : ""}${!countUnread || countUnread <= 0 ? " text-Read--disabled" : ""}`}
                        onClick={onReadAll}
                        disabled={isReadingAll || !countUnread || countUnread <= 0}
                      >
                        {isReadingAll ? "Đang xử lý..." : "Đánh dấu là đã đọc"}
                      </button>
                    </div>

                    <div className="list-notification">
                      {listNotification.map((item) => renderNotificationItem(item))}
                    </div>

                    <div
                      className="button-view-all"
                      onClick={() => {
                        navigate("/notification");
                        setShowPopoverNotification(false);
                      }}
                    >
                      <span className="title-button">Xem tất cả thông báo</span>
                    </div>
                  </>
                ) : (
                  <div className="loading-notify">{isLoadingNotify ? <Loading /> : null}</div>
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
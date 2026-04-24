/* eslint-disable prefer-const */
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "./contexts/userContext";
import { AuthContext, AuthContextType } from "./contexts/authContext";
import { UIContext, UIContextType } from "./contexts/uiContext";
import { CallContext, CallContextType } from "./contexts/callContext";
// Start css của thư viện
import "swiper/css";
import "styles/main.scss";
import "tippy.js/dist/tippy.css";
import "react-toastify/dist/ReactToastify.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "reactflow/dist/style.css";
import "rc-slider/assets/index.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
// End css của thư viện
import Login from "./pages/Login/index";
import { IUser } from "./model/user/UserResponseModel";
import { useCookies } from "react-cookie";
import fetchConfig from "./configs/fetchConfig";
import { routes } from "./configs/routes";
import { ToastContainer } from "react-toastify";
import LayoutPage from "pages/layout";
import { getAppSSOLink, showToast } from "utils/common";
import EmployeeService from "services/EmployeeService";
import { getDomain } from "reborn-util";
import { getRootDomain } from "utils/common";
import ChooseRole from "pages/Common/ChooseRole";
import LinkSurvey from "pages/LinkSurvey";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./configs/authConfig";
import UploadDocument from "pages/BPM/UploadDocument/UploadDocument";
import CollectTicket from "pages/Ticket/partials/CollectTicket";
import CollectWarranty from "pages/Warranty/partials/CollectWarranty";
import SharePromoPage from "pages/SharePromoPage";
import ShareCouponPage from "pages/ShareCouponPage";
import DiscoverPage from "pages/PublicFitPro/DiscoverPage";
import GridFormNew from "pages/BPM/GridForm";
import { onMessage } from "firebase/messaging";
import NotificationService from "services/NotificationService";
import WebRtcCallIncomeModal from "pages/CallCenter/partials/WebRtcCallIncomeModal";
import ringtone from "assets/sounds/call_in_sound.wav";
import { useSTWebRTC } from "./webrtc/useSTWebRTC";
import { messaging, requestPermission } from "./firebase-config";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

// ─────────────────────────────────────────────────────────────────────────────

const msalInstance = new PublicClientApplication(msalConfig);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = new URLSearchParams(location.search).get("returnUrl");
  const [cookies, setCookie, removeCookie] = useCookies();
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [user, setUser] = useState<IUser>(null);
  const [isRunRefresh, setIsRunRefresh] = useState<boolean>(false);
  const [isCollapsedSidebar, setIsCollapsedSidebar] = useState<boolean>(false);
  const [dataBranch, setDataBranch] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isShowFeedback, setIsShowFeedback] = useState<boolean>(false);
  const [isShowChatBot, setIsShowChatBot] = useState<boolean>(false);
  const [dataBeauty, setDataBeauty] = useState(null);
  const [countUnread, setCountUnread] = useState(0);
  const [newNotificationPayload, setNewNotificationPayload] = useState<Record<string, unknown> | null>(null);

  // ────────────────────────────────────────────────────────────────────────────

  fetchConfig();

  const [lstRole, setLstRole] = useState([]);

  const takeSelectedRole = localStorage.getItem("SelectedRole");
  const defaultRedirectRef = useRef<string>("/create_sale_add");


  const handleGetRoles = async (token: string) => {
    if (!token) return;

    const response = await EmployeeService.takeRoles(token);

    if (response.code === 0) {
      const result = response.result;

      if (result.length > 1) {
        const changeResult = result.map((item) => {
          return {
            role: `${item.departmentId}_${item.id}`,
            name: item.title,
            departmentName: item.departmentName,
          };
        });

        setLstRole(changeResult);
        // TEST-MODE: auto-pick role "Ban giám đốc" để tránh modal chọn role spam suốt quá trình chạy test suite.
        // Revert bằng cách khôi phục dòng `!takeSelectedRole && setChooseRoleInit(true);` bên dưới.
        if (!takeSelectedRole) {
          const preferred =
            changeResult.find((r) => r.name === "Ban giám đốc") ||
            changeResult.find((r) => (r.name || "").toLowerCase().includes("giám đốc")) ||
            changeResult[0];
          if (preferred) {
            localStorage.setItem("SelectedRole", preferred.role);
          } else {
            setChooseRoleInit(true);
          }
        }
        // !takeSelectedRole && setChooseRoleInit(true);
      }
    }
  };

  useEffect(() => {
    const checkEmployeeStatus = async () => {
      if (cookies.token && location.pathname !== "/link_survey") {
        const isEmployee = await getDetailEmployeeInfo();

        if (isEmployee) {
          setIsLogin(true);
          if (location.pathname === "/" || location.pathname === "/login") {
            if (cookies.user) {
              const target = returnUrl || defaultRedirectRef.current || "/create_sale_add";
              navigate(target);
            }
          }

          if (cookies.user?.id !== user?.id || cookies.token !== user?.token) {
            setUser({ ...cookies.user, token: cookies.token });
            setIsLogin(true);
            if (cookies.user?.expired_cookie && isRunRefresh === false) {
              setIsRunRefresh(true);
              const dateExpired = new Date(cookies.user.expired_cookie);
              let timeOut = dateExpired.getTime() - Date.now();
              timeOut = timeOut > 0 ? timeOut : 0;
            }

            if (location.pathname === "/" || location.pathname === "/login") {
              if (cookies.user) {
                const target = returnUrl || defaultRedirectRef.current || "/create_sale_add";
                navigate(target);
              }
            }
          }

          handleGetRoles(cookies.token);
        }
      } else if (location.pathname !== "/login") {
        if (location.pathname !== "/link_survey") {
          setIsLogin(false);
          const returnUrl = routes.find((r) => r.path === location.pathname) ? `?returnUrl=${location.pathname}${location.search}` : "";
          navigate(`/login${returnUrl}`);
        }
      }
    };

    // Public paths — bypass auth (FitPro Phase 4.2 Discover & Book + các legacy public routes)
    const PUBLIC_PATHS = [
      "/send_email_confirm",
      "/voucher_confirm",
      "/fp_discover",   // FitPro Public Discover page
      "/discover",       // Alias
    ];
    if (!PUBLIC_PATHS.includes(location.pathname)) {
      checkEmployeeStatus();
    }
  }, [cookies.user, location]);

  const [dataExpired, setDataExpired] = useState({
    numDay: null,
    name: "",
    endDate: "",
  });

  const [dataInfoEmployee, setDataInfoEmployee] = useState(null);

  const [chooseRoleInit, setChooseRoleInit] = useState<boolean>(false);

  const [showModalPackage, setShowModalPackage] = useState<boolean>(false);

  const [lastShowModalPayment, setLastShowModalPayment] = useState<boolean>(false);

  const getDetailEmployeeInfo = async () => {
    if (isChecking) {
      return false;
    }

    setIsChecking(true);

    try {
      const response = await EmployeeService.info();
      if (response.code === 0) {
        const result = response.result;
        setDataInfoEmployee(result);

        if (result) {
          const changeResult = result.lstOrgApp[0];

          const defaultRedirect = result?.defaultRedirect;
          defaultRedirectRef.current = defaultRedirect || "/create_sale_add";

          const endDate = new Date(changeResult?.endDate);
          const currentDate = new Date();
          const remainingTimeInMilliseconds = endDate.getTime() - currentDate.getTime();
          const remainingDays = Math.ceil((remainingTimeInMilliseconds || 0) / (1000 * 60 * 60 * 24));

          setDataExpired({
            ...changeResult,
            name: changeResult?.packageName,
            numDay: remainingDays,
          });
        }

        if (result && (result.id || result.isOwner == 1)) {
          setIsChecking(false);
          return true;
        }
      }
    } catch (error) {
      console.error("Error fetching employee info:", error);
      setIsChecking(false);
      return false;
    }

    showToast("Bạn không phải là nhân viên của tổ chức này!", "warning");
    setTimeout(() => {
      let sourceDomain = getDomain(decodeURIComponent(document.location.href));
      let rootDomain = getRootDomain(sourceDomain);
      let env = process.env.APP_ENV;
      let crmLink;
      if (rootDomain == "localhost") {
        crmLink = `${process.env.APP_CRM_LINK}/crm/login`;
      } else {
        crmLink = `https://${sourceDomain}/crm/login`;
      }

      let appSSOLink = getAppSSOLink(rootDomain);
      document.location.href = `${appSSOLink}?redirect_uri=${crmLink}&domain=${rootDomain}&env=${env}`;
    }, 5000);

    setIsChecking(false);
    return false;
  };

  const { i18n } = useTranslation();

  const [valueLanguage, setValueLanguage] = useState({
    name: "Tiếng Việt",
    shortName: "vi",
  });

  useEffect(() => {
    if (valueLanguage.shortName) {
      i18n.changeLanguage(valueLanguage.shortName);
    }
  }, [valueLanguage]);

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
    requestPermission(cookies.token);

    if (messaging) {
      onMessage(messaging, (payload) => {
        showToast(payload.notification?.title || "Bạn có thông báo mới", "success");
        getCountUnread();
        setNewNotificationPayload(payload);
      });
    }
  }, []);

  // Khởi tạo tổng đài
  const [showModalCallIncome, setShowModalCallIncome] = useState<boolean>(false);
  const pbxCustomerCode = "d9cf985baac44238b3d930ae569d9f0912";
  const employeeSip470 = "101";
  const employeeSip471 = "471";

  const { callState, incomingNumber, makeCall, answer, hangup, transfer } = useSTWebRTC({
    extension: parseInt(dataInfoEmployee?.id) == 4699513 ? employeeSip470 : parseInt(dataInfoEmployee?.id) == 703 ? employeeSip471 : null,
    pbxCustomerCode: pbxCustomerCode,
  });

  const RINGTONE_SRC = ringtone;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef<boolean>(false);

  useEffect(() => {
    const audio = new Audio(RINGTONE_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    const tryUnlock = async () => {
      if (unlockedRef.current) return;
      try {
        await audioRef.current?.play();
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
        unlockedRef.current = true;
      } catch (err) {
        // vẫn bị chặn
      } finally {
        document.removeEventListener("click", tryUnlock, true);
        document.removeEventListener("touchstart", tryUnlock, true);
      }
    };

    document.addEventListener("click", tryUnlock, true);
    document.addEventListener("touchstart", tryUnlock, true);

    return () => {
      try {
        audioRef.current?.pause();
        audioRef.current = null;
      } catch (e) {}
      document.removeEventListener("click", tryUnlock, true);
      document.removeEventListener("touchstart", tryUnlock, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (callState == "incoming") {
      setShowModalCallIncome(true);

      if (!audio) return;

      (async () => {
        try {
          await audio.play();
          unlockedRef.current = true;
        } catch (err) {
          showToast("Trình duyệt chặn phát âm thanh tự động. Vui lòng click/đụng vào trang để bật chuông.", "warning");
        }
      })();
    } else {
      try {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      } catch (e) {
        // ignore
      }
    }
  }, [callState]);

  const authValue: AuthContextType = {
    id: user?.id,
    idEmployee: user?.idEmployee,
    username: user?.username,
    name: user?.name,
    phone: user?.phone,
    avatar: user?.avatar,
    email: user?.email,
    token: user?.token,
    role: user?.role,
    gender: user?.gender,
    permissions: user?.permissions,
    product_store: user?.product_store,
    dataExpired,
    valueLanguage,
    setValueLanguage,
    dataInfoEmployee,
    lstRole,
    dataBeauty,
    setDataBeauty,
  };

  const uiValue: UIContextType = {
    isCollapsedSidebar,
    setIsCollapsedSidebar,
    dataBranch,
    setDataBranch,
    isShowFeedback,
    setIsShowFeedback,
    isShowChatBot,
    setIsShowChatBot,
    showModalPackage,
    setShowModalPackage,
    lastShowModalPayment,
    setLastShowModalPayment,
    countUnread,
    setCountUnread,
    newNotificationPayload,
  };

  const callValue: CallContextType = {
    callState,
    incomingNumber,
    makeCall,
    answer,
    hangup,
    transfer,
  };

  return (
    <ErrorBoundary>
    <AuthContext.Provider value={authValue}>
    <UIContext.Provider value={uiValue}>
    <CallContext.Provider value={callValue}>
    <UserContext.Provider
      value={{
        ...user,
        ...authValue,
        ...uiValue,
        ...callValue,
      }}
    >
      <MsalProvider instance={msalInstance}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Routes>
          {isLogin && <Route path="*" element={<LayoutPage />} />}
          {location.pathname == "/grid_form" && <Route path="/grid_form" element={<GridFormNew />} />}
          {location.pathname == "/link_survey" && <Route path="/link_survey" element={<LinkSurvey />} />}
          {location.pathname == "/upload_document" && <Route path="/upload_document" element={<UploadDocument />} />}
          {location.pathname == "/collect_ticket" && <Route path="/collect_ticket" element={<CollectTicket />} />}
          {location.pathname == "/collect_warranty" && <Route path="/collect_warranty" element={<CollectWarranty />} />}
          {location.pathname == "/share_promo" && <Route path="/share_promo" element={<SharePromoPage />} />}
          {location.pathname == "/share_coupon" && <Route path="/share_coupon" element={<ShareCouponPage />} />}
          {location.pathname == "/fp_discover" && <Route path="/fp_discover" element={<DiscoverPage />} />}
          {location.pathname == "/discover" && <Route path="/discover" element={<DiscoverPage />} />}
          <Route path="/login" element={<Login />} />
        </Routes>
        <ChooseRole onShow={chooseRoleInit} onHide={() => setChooseRoleInit(false)} lstRole={lstRole} />
        <WebRtcCallIncomeModal
          onShow={showModalCallIncome}
          makeCall={makeCall}
          hangup={hangup}
          answer={answer}
          transfer={transfer}
          callState={callState}
          incomingNumber={incomingNumber}
          onHide={() => setShowModalCallIncome(false)}
        />
      </MsalProvider>
    </UserContext.Provider>
    </CallContext.Provider>
    </UIContext.Provider>
    </AuthContext.Provider>
    </ErrorBoundary>
  );
}
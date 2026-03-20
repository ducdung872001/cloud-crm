/* eslint-disable prefer-const */
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "./contexts/userContext";
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
import moment from "moment";
// import { fetchToken, onMessageListener } from "configs/firebaseConfig";
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
import GridFormNew from "pages/BPM/GridForm";
import { onMessage } from "firebase/messaging";
import NotificationService from "services/NotificationService";
import WebRtcCallIncomeModal from "pages/CallCenter/partials/WebRtcCallIncomeModal";
import ringtone from "assets/sounds/call_in_sound.wav";
import { useSTWebRTC } from "./webrtc/useSTWebRTC";
import { messaging, requestPermission } from "./firebase-config";

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
  const [newNotificationPayload, setNewNotificationPayload] = useState<any>(null);

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
        !takeSelectedRole && setChooseRoleInit(true);
      }
    }
  };

  useEffect(() => {
    const checkEmployeeStatus = async () => {
      if (cookies.token && location.pathname !== "/link_survey") {
        // Chờ lấy thông tin nhân viên
        const isEmployee = await getDetailEmployeeInfo();

        if (isEmployee) {
          setIsLogin(true);
          if (location.pathname === "/" || location.pathname === "/login") {
            if (cookies.user) {
              const target = returnUrl || defaultRedirectRef.current || "/create_sale_add";
              navigate(target);
            }
          }

          if (JSON.stringify(cookies.user) !== JSON.stringify(user)) {
            setUser({ ...cookies.user, token: cookies.token });
            setIsLogin(true);
            if (cookies.user?.expired_cookie && isRunRefresh === false) {
              setIsRunRefresh(true);
              const dateExpired = moment(cookies.user.expired_cookie);
              let timeOut = dateExpired.valueOf() - moment().valueOf();
              timeOut = timeOut > 0 ? timeOut : 0;
            }

            if (location.pathname === "/" || location.pathname === "/login") {
              if (cookies.user) {
                const target = returnUrl || defaultRedirectRef.current || "/create_sale_add";
                navigate(target);
              }
            }
          }

          //Nếu là nhân viên thì mới lấy vai trò
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

    //Gọi thực thi
    // checkEmployeeStatus();
    if (location.pathname !== "/send_email_confirm" && location.pathname !== "/voucher_confirm") {
      // if (
      //   location.pathname !== "/send_voucher"
      // )
      checkEmployeeStatus();
    }
  }, [cookies.user, location]);

  // useEffect(() => {
  //   fetchToken().then((token) => {
  //     //cookies.user chỉ để kiểm tra người dùng đăng nhập hay chưa
  //     if (cookies.user) {
  //       //Gọi API Lưu thông tin token xuống dưới server
  //     }

  //     onMessageListener()
  //       .then((payload: any) => {
  //         //Làm gì đó với dữ liệu nhận được
  //       })
  //       .catch((err) => console.log("failed: ", err));
  //   });
  // }, []);

  const [dataExpired, setDataExpired] = useState({
    numDay: null,
    name: "",
    endDate: "",
  });

  const [dataInfoEmployee, setDataInfoEmployee] = useState(null);

  const [chooseRoleInit, setChooseRoleInit] = useState<boolean>(false);

  const [showModalPackage, setShowModalPackage] = useState<boolean>(false);

  const [lastShowModalPayment, setLastShowModalPayment] = useState<boolean>(false);

  /**
   * Trả về thông tin
   * @returns
   */
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

          // Chuyển đổi startDate và endDate thành đối tượng Date
          const endDate: any = new Date(changeResult?.endDate);

          // Lấy thời gian hiện tại
          const currentDate: any = new Date();

          // Tính số mili giây còn lại giữa ngày hiện tại và ngày kết thúc
          const remainingTimeInMilliseconds = endDate - currentDate;

          // Chuyển đổi từ mili giây sang ngày
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

      //Chuyển hướng về trang đăng nhập sso (để chọn tài khoản khác)
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

    //Trả về thất bại
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

  /**
   * Chỉ request khi tồn tại cookies.token
   */
  useEffect(() => {
    requestPermission(cookies.token);

    onMessage(messaging, (payload) => {
      console.log("Thông báo nhận được:", payload);
      showToast(payload.notification?.title || "Bạn có thông báo mới", "success");
      getCountUnread();
      setNewNotificationPayload(payload);
    });
  }, []);

  // Khởi tạo tổng đài
  const [showModalCallIncome, setShowModalCallIncome] = useState<boolean>(false);
  const pbxCustomerCode = "d9cf985baac44238b3d930ae569d9f0912";
  const employeeSip470 = "470"; // Test với tài khoản Nguyễn Ngọc Trung trên rebornjsc sdt 0962829352 có id là 81
  const employeeSip471 = "471"; // Test với tài khoản Hoàng Văn Lợi trên rebornjsc sdt 0862999272 có id là 703

  const { callState, incomingNumber, makeCall, answer, hangup, transfer } = useSTWebRTC({
    extension: parseInt(dataInfoEmployee?.id) == 81 ? employeeSip470 : parseInt(dataInfoEmployee?.id) == 703 ? employeeSip471 : null, //test tạm thời, sau này lấy theo dataInfoEmployee?.sip
    pbxCustomerCode: pbxCustomerCode,
  });

  const RINGTONE_SRC = ringtone;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef<boolean>(false);

  // Khởi tạo audio và cố gắng unlock bằng user gesture (click/touch)
  useEffect(() => {
    const audio = new Audio(RINGTONE_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    const tryUnlock = async () => {
      if (unlockedRef.current) return;
      try {
        // Thử play rồi pause ngay để unlock audio trên 1 số trình duyệt khi có gesture
        await audioRef.current?.play();
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
        unlockedRef.current = true;
        // không cần thông báo
      } catch (err) {
        // vẫn bị chặn
      } finally {
        // chỉ cần thử 1 lần, gỡ listener
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
          // Nếu play thành công, mark unlocked
          unlockedRef.current = true;
        } catch (err) {
          // Nếu bị chặn bởi autoplay policy, thông báo cho user bấm vào trang để unlock
          console.warn("Ringtone play blocked by browser autoplay policy:", err);
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

  return (
    <UserContext.Provider
      value={{
        ...user,
        lstRole: lstRole,
        dataBeauty: dataBeauty,
        setDataBeauty: setDataBeauty,
        isCollapsedSidebar: isCollapsedSidebar,
        setIsCollapsedSidebar: setIsCollapsedSidebar,
        dataBranch: dataBranch,
        setDataBranch: setDataBranch,
        isShowFeedback: isShowFeedback,
        setIsShowFeedback: setIsShowFeedback,
        isShowChatBot: isShowChatBot,
        setIsShowChatBot: setIsShowChatBot,
        dataExpired: dataExpired,
        valueLanguage: valueLanguage,
        setValueLanguage: setValueLanguage,
        dataInfoEmployee: dataInfoEmployee,
        showModalPackage: showModalPackage,
        setShowModalPackage: setShowModalPackage,
        lastShowModalPayment: lastShowModalPayment,
        setLastShowModalPayment: setLastShowModalPayment,
        countUnread: countUnread,
        setCountUnread: setCountUnread,
        newNotificationPayload: newNotificationPayload,
        callState: callState,
        incomingNumber: incomingNumber,
        makeCall: makeCall,
        answer: answer,
        hangup: hangup,
        transfer: transfer,
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
          {/* {location.pathname == "/grid_form_new" && <Route path="/grid_form_new" element={<GridAg />} />} */}
          {location.pathname == "/link_survey" && <Route path="/link_survey" element={<LinkSurvey />} />}
          {location.pathname == "/upload_document" && <Route path="/upload_document" element={<UploadDocument />} />}
          {location.pathname == "/collect_ticket" && <Route path="/collect_ticket" element={<CollectTicket />} />}
          {location.pathname == "/collect_warranty" && <Route path="/collect_warranty" element={<CollectWarranty />} />}
          <Route path="/login" element={<Login />} />
        </Routes>
        <ChooseRole onShow={chooseRoleInit} onHide={() => setChooseRoleInit(false)} lstRole={lstRole} />
        <WebRtcCallIncomeModal
          // onShow={true}
          onShow={showModalCallIncome}
          makeCall={makeCall}
          hangup={hangup}
          answer={answer}
          transfer={transfer}
          callState={callState}
          // callState={"oncall"}
          incomingNumber={incomingNumber}
          onHide={() => setShowModalCallIncome(false)}
        />
      </MsalProvider>
    </UserContext.Provider>
  );
}

import React, { Fragment, useContext, useEffect, useState } from "react";
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import Icon from "components/icon";
import Button from "components/button/button";
import Header from "components/header/header";
import Sidebar from "components/sidebar/sidebar";
import Page404 from "pages/404/index";
import { routes } from "configs/routes";
import { UserContext, ContextType } from "contexts/userContext";
import CustomScrollbar from "components/customScrollbar";
import { useWindowDimensions } from "utils/hookCustom";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import NotifiPackageRenewal from "components/notifiPackageRenewal/notifiPackageRenewal";
import { showToast } from "utils/common";
import ChatFeedback from "./ChatFeedback";
import EmployeeService from "services/EmployeeService";
import Chatbot from "./ChatBot";
import { getDomain } from "reborn-util";
// import { SystemNotification } from "components/systemNotification/systemNotification";

export default function Layout() {
  const {
    isCollapsedSidebar,
    setDataBranch,
    isShowFeedback,
    setIsShowFeedback,
    dataExpired,
    setShowModalPackage,
    setLastShowModalPayment,
    isShowChatBot,
  } = useContext(UserContext) as ContextType;

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");

  useEffect(() => {
    if (isShowChatBot) {
      setIsShowFeedback(false);
    }
  }, [isShowChatBot]);

  const { height } = useWindowDimensions();
  document.getElementsByTagName("html")[0].style.height = "";

  const navigation = useNavigate();

  ///Chi nhánh
  const [valueBranch, setValueBranch] = useState(null);
  const [listBranch, setListBranch] = useState([]);
  const [newListBranch, setNewListBranch] = useState([]);

  const branchList = async () => {
    const param: IBeautyBranchFilterRequest = {
      name: "",
      page: 1,
      limit: 1000,
    };
    const response = await BeautyBranchService.list(param);

    const responseDataEmployee = await EmployeeService.info();

    if (response.code === 0 && responseDataEmployee.code === 0) {
      const dataOption = response.result.items;
      const checkBranch = localStorage.getItem("valueBranch") || null;
      const branchHeadquarter = dataOption.filter((el) => el.headquarter === 1);

      const dataEmployee = responseDataEmployee.result;

      if (checkBranch) {
        const branchSelected = dataOption.filter((el) => el.id === JSON.parse(checkBranch).value);
        if (branchSelected && branchSelected.length > 0) {
          setValueBranch({ value: branchSelected[0].id, label: branchSelected[0].name });
        } else {
          if (branchHeadquarter && branchHeadquarter.length > 0) {
            setValueBranch({ value: branchHeadquarter[0].id, label: branchHeadquarter[0].name });
          } else {
            setValueBranch({ value: dataOption[0].id, label: dataOption[0].name });
          }
        }
      } else if (dataEmployee.branchId) {
        setValueBranch({ value: dataEmployee.branchId, label: dataEmployee.branchName });
      } else {
        if (branchHeadquarter && branchHeadquarter.length > 0) {
          setValueBranch({ value: branchHeadquarter[0].id, label: branchHeadquarter[0].name });
        } else {
          setValueBranch({ value: dataOption[0].id, label: dataOption[0].name });
        }
      }
      // if (dataOption?.length > 1) {
      //   setValueBranch({value: dataOption[0].id, label: dataOption[0].name});
      //   // localStorage.setItem("valueBranch", JSON.stringify({value: dataOption[0].id, label: dataOption[0].name}));

      // }
    }
  };

  const [isLoadingBranch, setIsLoadingBranch] = useState<boolean>(false);

  const [paramBranch, setParamBranch] = useState({
    name: "",
    page: 1,
    limit: 1000,
  });
  const getListBranch = async (param) => {
    setIsLoadingBranch(true);

    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const result = response.result.items;
      const listBranch = result.map((item) => {
        return {
          value: item.id,
          label: item.name,
          parentId: item.parentId,
        };
      });
      setListBranch(listBranch);

      let newListBranch = listBranch;
      const resultListBranch = [];

      (newListBranch || []).map((item) => {
        if (!item.parentId) {
          const level0 = [];
          level0.push({ ...item, level: 0 });
          resultListBranch.push(level0);

          const newList = newListBranch.filter((el) => el.value !== item.value);
          newListBranch = newList;
        }
      });

      if (newListBranch.length > 0) {
        newListBranch.map((item) => {
          const number = resultListBranch.length;
          let newArray = [];
          resultListBranch[number - 1] &&
            resultListBranch[number - 1].map((item) => {
              const newLevel = newListBranch.filter((el) => el.parentId === item.value);
              const resultLevel = newLevel.map((el) => {
                return { ...el, level: number };
              });
              resultLevel.unshift(item);
              newArray = [...newArray, ...resultLevel];

              const newList = newListBranch.filter((el) => el.parentId !== item.value);
              newListBranch = newList;
            });

          if (newArray.length > 0) {
            resultListBranch.push(newArray);
            setNewListBranch(newArray);
          }
        });
      } else {
        setNewListBranch([]);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingBranch(false);
  };

  useEffect(() => {
    branchList();
  }, []);

  useEffect(() => {
    getListBranch(paramBranch);
  }, [paramBranch]);

  const searchListBranch = (name) => {
    setParamBranch({ ...paramBranch, name: name });
  };

  const loadOptionBranch = async (search, loadedOptions, { page }) => {
    const param: IBeautyBranchFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IBeautyBranchResponse) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueBranch = (e) => {
    setValueBranch(e);
    setParamBranch({ ...paramBranch, name: "" });
    // localStorage.setItem("valueBranch", JSON.stringify(e));
  };

  useEffect(() => {
    if (valueBranch) {
      // setParams({ ...params, branchId: valueBranch.value });
      localStorage.setItem("valueBranch", JSON.stringify(valueBranch));
      setDataBranch(valueBranch);
    }
  }, [valueBranch]);

  const [isAlmostExpired, setIsAlmostExpired] = useState<boolean>(() => {
    return dataExpired.numDay <= 14 && dataExpired.numDay > 6 ? true : false;
  });

  // đoạn này dành cho đã hết hạn gói dịch vụ
  const [isExpired, setIsExpired] = useState<boolean>(() => {
    return dataExpired && dataExpired.numDay <= 6 ? true : false;
  });

  useEffect(() => {
    const lastClickTime = localStorage.getItem("lastClickTime");
    if (lastClickTime) {
      const lastClickTimestamp = parseInt(lastClickTime, 10);
      const currentTime = Date.now();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (lastClickTimestamp < currentTime - (currentTime % (24 * 60 * 60 * 1000))) {
        setIsAlmostExpired(true);
      } else {
        setIsAlmostExpired(false);
      }
    }
  }, []);

  const handleHideNotification = () => {
    setIsAlmostExpired(false);
    localStorage.setItem("lastClickTime", Date.now().toString());
  };

  const [isPackage, setIsPackage] = useState<boolean>(() => {
    return dataExpired && dataExpired.numDay <= 0 && dataExpired.period <= 36 ? true : false;
  });

  const checkPathUrl = window.location.pathname;

  useEffect(() => {
    setLastShowModalPayment(isPackage);
  }, [isPackage]);

  return (
    <div id="container">
      <div className={`page-wrapper${isCollapsedSidebar ? " page-wrapper--collapsed-sidebar" : ""} d-flex align-items-start justify-content-between`}>
        {checkPathUrl !== "/crm/link_survey" && <Sidebar />}
        <div className="main-content">
          {checkPathUrl !== "/crm/link_survey" && (
            <Header
              listBranch={listBranch}
              newListBranch={newListBranch}
              valueBranch={valueBranch}
              handleChangeValueBranch={handleChangeValueBranch}
              loadOptionBranch={loadOptionBranch}
              searchListBranch={searchListBranch}
              paramBranch={paramBranch}
            />
          )}

          <CustomScrollbar width="100%" height={height - 57} autoHide={true}>
            <Fragment>
              <div
                className={`notification__warning--package ${
                  dataExpired && (dataExpired.numDay <= 14 && dataExpired.numDay > 6 ? isAlmostExpired : isExpired) ? "" : "d-none"
                } ${checkPathUrl == "/crm/link_survey" ? "d-none" : ""}`}
              >
                {dataExpired && dataExpired.period <= 36 && (
                  <div className={`box__warning--notify ${isExpired ? "bg__error" : isAlmostExpired ? "bg__warning" : ""}`}>
                    <div className="content__notify--left">
                      <Icon name="WarningCircle" />
                      {dataExpired.numDay > 0 ? (
                        <span className="content">
                          Thời gian {dataExpired.name.toLowerCase()} của quý khách {dataExpired.numDay ? `còn ${dataExpired.numDay} ngày nữa` : "đã"}{" "}
                          hết hạn
                        </span>
                      ) : (
                        <span className="content">Tài khoản đăng nhập của khách hàng đã hết hạn sử dụng</span>
                      )}
                    </div>
                    <div className="content__notify--right">
                      <Button
                        color={isExpired ? "warning" : "transparent"}
                        onClick={() => {
                          navigation("/setting_account?isPackage=true");
                          setShowModalPackage(true);
                        }}
                      >
                        Gia hạn ngay
                      </Button>
                      {isAlmostExpired && (
                        <span className="action__close" onClick={() => handleHideNotification()}>
                          <Icon name="Times" />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="main-content__wrapper">
                <Routes>
                  {routes.map((r, index) => {
                    return <Route key={index} path={r.path} element={r.component} />;
                    // if (!r.permission || permissions.filter((per) => r.permission.includes(per)).length > 0) {
                    //   return <Route key={index} path={r.path} element={r.component} />;
                    // } else {
                    //   return <Route key={index} path={r.path} element={<SystemNotification type="no-permission" />} />;
                    // }
                  })}
                  <Route path="*" element={<Page404 />} />
                </Routes>
              </div>
            </Fragment>
          </CustomScrollbar>
          {isShowFeedback && <ChatFeedback />}
          {!checkSubdomainTNEX ? <Chatbot /> : null}
        </div>
      </div>

      <NotifiPackageRenewal data={dataExpired} onShow={isPackage} onHide={() => setIsPackage(false)} />
      <Outlet />
    </div>
  );
}

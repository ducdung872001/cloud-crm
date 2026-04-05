import React, { useState, useEffect, Fragment } from "react";
import Icon from "components/icon";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IFanpageFacebookResponse } from "model/fanpageFacebook/FanpageResponseModel";
import { IFanpageFacebookFilterRequest, IFanpageFacebookRequest } from "model/fanpageFacebook/FanpageFacebookRequestModel";
import FanpageFacebookService from "services/FanpageFacebookService";
import ZaloOAService from "services/ZaloOAService";
import { IZaloOAResponse } from "model/zaloOA/ZaloOAResponse";
import { IZaloOAFilterRequest } from "model/zaloOA/ZaloOARequest";
import { showToast } from "utils/common";
import AddFanpageModal from "./partials/AddFanpageFacebookModal";
import LoginFacebookModal from "./partials/LoginFacebookModal";
import LoginZaloModal from "./partials/LoginZaloModal";
import TableFanpageFacebook from "./partials/TableFanpageFacebook";
import TableZaloOA from "./partials/TableZaloOA";
import { getPermissions } from "utils/common";
import "./SetttingSocialCrmList.scss";

export default function SetttingSocialCrmList() {
  document.title = "Cài đặt kênh bán";

  const [tab, setTab] = useState<string>(() => {
    const historyStorage = JSON.parse(localStorage.getItem("tab_social_crm"));

    return historyStorage ? historyStorage : "tab_one";
  });
  const [isPermissionsFacebook, setIsPermissionsFacebook] = useState<boolean>(false);
  const [isPermissionsZalo, setIsPermissionsZalo] = useState<boolean>(false);

  const [permissions, setPermissions] = useState(getPermissions());

  const listTabs = [
    {
      title: "Danh sách Fanpage Facebook",
      is_tab: "tab_one",
    },
    {
      title: "Danh sách Zalo Official Account",
      is_tab: "tab_two",
    },
  ]; 

  //! đoạn dưới này xử lý vấn đề ưu tab hiện tại khi chuyển hướng trang
  useEffect(() => {
    localStorage.setItem("tab_social_crm", JSON.stringify(tab));
  }, [tab]);

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalLoginFacebook, setShowModalLoginFacebook] = useState<boolean>(false);
  const [showModalLoginZalo, setShowModalLoginZalo] = useState<boolean>(false);
  const [listOptionFanpage, setListOptionFanpage] = useState<IFanpageFacebookResponse[]>([]);

  /**
   * Lấy danh sách fanpage để thêm kết nối
   * @param accessToken 
   */
  const loadFanpages = async (accessToken?: Record<string, unknown>) => {
    const params: IFanpageFacebookRequest = {
      accessToken,
    };

    const response = await FanpageFacebookService.connect(params);
    if (response.code === 0) {
      // eslint-disable-next-line prefer-const
      let fanpages = [];

      (response.result || []).map((item: Record<string, unknown>) => {
        fanpages.push({
          name: item.name,
          _fanpage_id: item.id,
          accessToken: item.access_token,
        });
      });

      setListOptionFanpage(fanpages);
      setShowModalAdd(true);
    }
  };

  // --------- 🎉🎉 đoạn này xử lý vấn đề list danh sách fanpage kết nối với facebook 🎉🎉 ---------- //
  const [listFanpageFacebook, setListFanpageFacebook] = useState<IFanpageFacebookResponse[]>([]);
  const [isLoadingFanpageFacebook, setIsLoadingFanpageFacebook] = useState<boolean>(false);
  const [paramFanpageFacebook, setParamsFanpageFacebook] = useState<IFanpageFacebookFilterRequest>({
    limit: 10,
  });

  const [paginationFanpageFacebook, setPaginationFanpageFacebook] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Fanpage facebook",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParamsFanpageFacebook((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParamsFanpageFacebook((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  //! đoạn này call api list ra danh sách fanpage facebook đã được kết nối sẵn
  const getListFanpageFacebook = async () => {
    setIsLoadingFanpageFacebook(true);

    const response = await FanpageFacebookService.list();

    if (response.code === 0) {
      const result = response.result;
      setListFanpageFacebook(result);

      setPaginationFanpageFacebook({
        ...paginationFanpageFacebook,
        page: +result.page,
        sizeLimit: paramFanpageFacebook.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(paramFanpageFacebook.limit ?? DataPaginationDefault.sizeLimit)),
      });
    } else if (response.code == 400) {
      setIsPermissionsFacebook(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingFanpageFacebook(false);
  };

  //! đoạn này kiểm tra điều kiện call API list fanpage
  useEffect(() => {
    getListFanpageFacebook();
  }, []);

  // --------- 😊😊 đoạn này xử lý vấn đề list danh sách fanpage kết nối với zalo 😊😊 ---------- //
  const [listZaloOA, setListZaloOA] = useState<IZaloOAResponse[]>([]);
  const [isLoadingZaloOA, setIsLoadingZaloOA] = useState<boolean>(false);

  const [paramZaloOA, setParamsZaloOA] = useState<IZaloOAFilterRequest>({
    limit: 10,
  });

  const [paginationZaloOA, setPaginationZaloOA] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Zalo Offical Account",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParamsZaloOA((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParamsZaloOA((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  /**
   * Nút kết nối Fanpage
   */
  const titleActions: ITitleActions = {
    actions: [
      permissions["FANPAGE_ADD"] == 1 && {
        title: "Kết nối Fanpage",
        icon: <Icon name="Facebook" />,
        callback: () => {
          setShowModalLoginFacebook(true);
        },
      },
    ],
  };

  /**
   * Nút kết nối Zalo
   */
  const titleActionsZalo: ITitleActions = {
    actions: [
      permissions["ZALO_OA_ADD"] == 1 && {
        title: "Kết nối Zalo",
        icon: <Icon name="Zalo" />,
        callback: () => {
          setShowModalLoginZalo(true);
        },
      },
    ],
  };

  /**
   * Lấy danh sách các Zalo OA đã kết nối sẵn
   */
  const getListZaloOA = async () => {
    setIsLoadingZaloOA(true);

    const response = await ZaloOAService.list();

    if (response.code === 0) {
      const result = response.result;
      setListZaloOA(result);

      setPaginationZaloOA({
        ...paginationZaloOA,
        page: +result.page,
        sizeLimit: paramZaloOA.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(paramZaloOA.limit ?? DataPaginationDefault.sizeLimit)),
      });
    } else if (response.code == 400) {
      setIsPermissionsZalo(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingZaloOA(false);
  };

  //! đoạn này xử lý vấn đề nếu như là tab zalo thì mới callAPI zalo
  useEffect(() => {
    if (tab === "tab_two") {
      getListZaloOA();
    }
  }, [tab]);

  return (
    <div className="page-content page-setting-social">
      <div className="action__header">
        <div className="action__header--left">
          <TitleAction title="Kênh bán" />
        </div>
        <div className="action__header--right">
          {tab == "tab_one"
            ? permissions["FANPAGE_ADD"] == 1 && (
                <Fragment>
                  <TitleAction title="" titleActions={titleActions} />
                </Fragment>
              )
            : permissions["ZALO_OA_ADD"] == 1 && (
                <Fragment>
                  <TitleAction title="" titleActions={titleActionsZalo} />
                </Fragment>
              )}
        </div>
      </div>
      <div className="card-box d-flex flex-column">
        <ul className="menu__social">
          {listTabs.map((item, idx) => {
            return (
              <li
                key={idx}
                className={item.is_tab == tab ? "active" : ""}
                onClick={(e) => {
                  e && e.preventDefault();
                  setTab(item.is_tab);
                }}
              >
                {item.title}
              </li>
            );
          })}
        </ul>
        {tab == "tab_one" ? (
          <TableFanpageFacebook
            listFanpageFacebook={listFanpageFacebook}
            isLoading={isLoadingFanpageFacebook}
            dataPagination={paginationFanpageFacebook}
            callback={getListFanpageFacebook}
            isPermissionsFacebook={isPermissionsFacebook}
          />
        ) : (
          <TableZaloOA
            listZaloOA={listZaloOA}
            isLoading={isLoadingZaloOA}
            dataPagination={paginationZaloOA}
            callback={getListZaloOA}
            isPermissionsZalo={isPermissionsZalo}
          />
        )}
      </div>

      <AddFanpageModal
        onShow={showModalAdd}
        data={listOptionFanpage}
        listFanpageFacebook={listFanpageFacebook}
        onHide={(reaload) => {
          if (reaload) {
            getListFanpageFacebook();
          }
          setShowModalAdd(false);
        }}
      />

      <LoginFacebookModal
        onShow={showModalLoginFacebook}
        loadFanpages={loadFanpages}
        onHide={(reaload) => {
          setShowModalLoginFacebook(false);
        }}
      />

      <LoginZaloModal
        onShow={showModalLoginZalo}
        getListZaloOA={getListZaloOA}
        onHide={(reaload) => {
          setShowModalLoginZalo(false);
        }}
      />
    </div>
  );
}

import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Loading from "components/loading";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IProjectManagementListProps } from "model/workProject/PropsModel";
import { IWorkProjectFilterRequest } from "model/workProject/WorkProjectRequestModel";
import { IWorkProjectResponseModel } from "model/workProject/WorkProjectResponseModel";
import WorkProjectService from "services/WorkProjectService";
import { showToast } from "utils/common";
import { getSearchParameters } from "reborn-util";
import ImageProjectPlan from "assets/images/project-plan.png";
import AddProjectManagementModal from "./partials/AddProjectManagementModal";
import ProjectManagementItem from "./partials/ProjectManagementItem/ProjectManagementItem";
import SearchProjectManagementModal from "./partials/SearchProjectManagementModal";
import "tippy.js/animations/scale.css";
import "./CampaignManagementList.scss";
import CampaignService from "services/CampaignService";
import { useOnClickOutside } from "utils/hookCustom";
import { useNavigate } from "react-router-dom";
import { ContextType, UserContext } from "contexts/userContext";

export default function CampaignManagementList(props: any) {
  const isMounted = useRef(false);
  const navigate = useNavigate();

  const { dataBranch } = useContext(UserContext) as ContextType;

  const { setType, isFullPage, idProjectManagement, setIdProjectManagement, isRegimeKanban, setParentCampaign } = props;

  const paramsUrl: any = getSearchParameters();

  const takeIdProjectManagement = Object.keys(paramsUrl).length > 0 && paramsUrl?.parentId ? +paramsUrl?.parentId : -1;

  const [listProject, setListProject] = useState(null);

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchProject, setIsSearchProject] = useState<boolean>(false);
  const [isShowChildrenProject, setIsShowChildrenProject] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    limit: 20,
    page: 1,
    // parentId: 0,
    campaignType: 0,
  });

  //param này để load more
  const [paramsLoadMore, setParamsLoadMore] = useState<any>({
    limit: 20,
    page: 1,
    campaignType: 0,
  });

  const abortControllerChild = new AbortController();

  const getListProject = async (paramsSearch: any) => {
    setIsLoading(true);

    // const response = await WorkProjectService.list(paramsSearch, abortControllerChild.signal);
    const response = await CampaignService.list(paramsSearch, abortControllerChild.signal);

    if (response.code === 0) {
      const result = response.result;
      setListProject(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setIdProjectManagement(takeIdProjectManagement);

    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListProject(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }

    return () => {
      abortControllerChild.abort();
    };
  }, [params]);

  const onDelete = async (id: number) => {
    const response = await WorkProjectService.delete(id);

    if (response.code === 0) {
      showToast("Xoá dự án thành công", "success");
      getListProject(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IWorkProjectResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa dự án
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleScroll = async (e, currentData, currentParams) => {
    const resultScroll = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;

    if (resultScroll && currentData?.loadMoreAble) {
      const param = {
        ...currentParams,
        page: currentParams.page + 1,
        limit: 20,
        // parentId: 0,
        campaignType: 0,
      };

      const response = await CampaignService.list(param);

      if (response.code === 0) {
        const result = response.result;

        const newData = {
          ...result,
          items: [...currentData.items, ...result.items],
        };
        setListProject(newData);
        setParamsLoadMore(param);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  const [isActive, setIsActive] = useState<boolean>(false);
  const [isActiveChild, setIsActiveChild] = useState<boolean>(false);
  const refContainerProject = useRef();
  const refEditProject = useRef();
  const refEditProjectChild = useRef();
  useOnClickOutside(refEditProject, () => setIsActive(false), ["actions-edit-remove"]);
  useOnClickOutside(refEditProjectChild, () => setIsActiveChild(false), ["actions-edit-remove"]);

  return (
    <div className="page-campaign-management">
      <div className="header-project-management">
        <div className="title-item">
          <Tippy content={isSearchProject ? "Click bỏ lọc" : "Click lọc dự án"} delay={[120, 100]} animation="scale">
            <span
              className="active__icon--search"
              onClick={() => {
                // setIsSearchProject(!isSearchProject);
              }}
            >
              {isSearchProject ? <Icon name="Sortby" /> : <Icon name="Filter2" />}
            </span>
          </Tippy>
          Chiến dịch cha
          <span className="active__icon--search">
            <Icon name="IconCaretLeft" />
            <Icon name="IconCaretRight" />
          </span>
        </div>
        <Tippy content="Thêm chiến dịch cha" delay={[120, 100]} animation="scale">
          <span
            className="add-project"
            onClick={() => {
              navigate("/create_sale_campaign", { state: { isParent: true } });
            }}
          >
            <Icon name="PlusCircleFill" />
          </span>
        </Tippy>
      </div>
      {!isLoading && listProject?.items && listProject?.items?.length > 0 ? (
        <Fragment>
          <CustomScrollbar
            width="100%"
            height={isRegimeKanban ? "auto" : isFullPage ? "80rem" : "80rem"}
            handleScroll={(e) => {
              handleScroll(e, listProject, paramsLoadMore);
            }}
          >
            <div className="list-project-management">
              <div className="project-management-item">
                <div className={`project__management-lv1 ${idProjectManagement == -1 ? "active__project-management" : ""}`}>
                  <div
                    className="folder-project-management"
                    onClick={() => {
                      setIdProjectManagement(-1);
                      setIsShowChildrenProject(false);
                      // localStorage.setItem("backupCampaign", JSON.stringify(`/sales_campaign?branchId=${dataBranch?.value}&campaignType=${2}`));
                    }}
                  >
                    <Icon name="FolderOpen" />
                    <span className="name--project">Tất cả chiến dịch</span>
                  </div>
                </div>
              </div>
              {listProject?.items && listProject?.items.length > 0
                ? listProject?.items.map((item, idx) => {
                    return (
                      <div className="project-management-item">
                        <div
                          className={`project__management-lv1 ${item?.id === idProjectManagement ? "active__project-management" : ""}`}
                          onClick={() => {
                            setIdProjectManagement(item?.id);
                            setParentCampaign(item);
                            // localStorage.setItem(
                            //   "backupCampaign",
                            //   JSON.stringify(`/sales_campaign?branchId=${dataBranch?.value}&parentId=${item?.id}&campaignType=${1}`)
                            // );
                          }}
                        >
                          <div
                            className="folder-project-management"
                            onClick={() => {
                              //TODO: đoạn này có time cần xem lại chút
                              setIsShowChildrenProject(!isShowChildrenProject);
                            }}
                          >
                            <Icon name="Opportunity" />
                            <span className="name--project">{item.name}</span>
                          </div>
                          <div
                            className={`actions-edit-remove ${isActive ? "active__item--option" : ""}`}
                            onClick={() => {
                              setIsActive(!isActive);
                            }}
                            ref={refContainerProject}
                          >
                            <Icon name="ThreeDotVertical" />

                            {isActive && item?.id === idProjectManagement && (
                              <ul className="menu-action-project" ref={refEditProject}>
                                <li
                                  className="view-project-item"
                                  onClick={() => {
                                    navigate("/edit_sale_campaign/" + item.id, { state: { isParent: true } });
                                  }}
                                >
                                  <Icon name="Eye" />
                                  Xem chi tiết
                                </li>
                                <li
                                  className="add-project-item"
                                  onClick={() => {
                                    navigate("/create_sale_campaign", { state: { parentCampaign: item } });
                                  }}
                                >
                                  <Icon name="PlusCircleFill" />
                                  Thêm chiến dịch con
                                </li>
                                <li
                                  className="edit-project-item"
                                  onClick={() => {
                                    navigate("/edit_sale_campaign/" + item.id, { state: { isParent: true } });
                                  }}
                                >
                                  <Icon name="Pencil" />
                                  Sửa
                                </li>
                                <li
                                  className="remove-project-item"
                                  onClick={() => {
                                    // showDialogConfirmDelete(data);
                                  }}
                                >
                                  <Icon name="Trash" />
                                  Xóa
                                </li>
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          </CustomScrollbar>
        </Fragment>
      ) : isLoading && params.page === 1 ? (
        <Loading />
      ) : (
        <div className="notification-project">
          <div className="img-project">
            <img src={ImageProjectPlan} alt="no-project" />
          </div>
          <h2>Bạn chưa có dự án nào!</h2>
        </div>
      )}
      <AddProjectManagementModal
        onShow={showModalAdd}
        idData={idProjectManagement}
        onHide={(reload) => {
          if (reload) {
            getListProject(params);
          }
          setShowModalAdd(false);
        }}
      />
      <SearchProjectManagementModal
        onShow={isSearchProject}
        onHide={() => setIsSearchProject(false)}
        callBack={(param) => {
          if (param) {
            getListProject(param);
          }
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

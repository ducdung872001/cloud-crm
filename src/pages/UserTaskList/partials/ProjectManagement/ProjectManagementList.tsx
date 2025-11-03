import React, { Fragment, useEffect, useRef, useState } from "react";
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
import "./ProjectManagementList.scss";
import BusinessProcessService from "services/BusinessProcessService";

export default function ProjectManagementList(props: IProjectManagementListProps) {
  const isMounted = useRef(false);

  const { setType, isFullPage, idProjectManagement, setIdProjectManagement, isRegimeKanban } = props;

  const paramsUrl: any = getSearchParameters();

  const takeIdProjectManagement = Object.keys(paramsUrl).length > 0 && paramsUrl?.projectId ? +paramsUrl?.projectId : -1;

  const [listBusinessProcess, setListBusinessProcess] = useState(null);

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchProject, setIsSearchProject] = useState<boolean>(false);
  const [isShowChildrenProject, setIsShowChildrenProject] = useState<boolean>(false);

  const [params, setParams] = useState<IWorkProjectFilterRequest>({
    limit: 20,
    page: 1,
  });

  //param này để load more
  const [paramsLoadMore, setParamsLoadMore] = useState<IWorkProjectFilterRequest>({
    limit: 20,
    page: 1,
  });

  const abortControllerChild = new AbortController();

  const getListBusinessProcess = async (paramsSearch: IWorkProjectFilterRequest) => {
    setIsLoading(true);

    const response = await BusinessProcessService.list(paramsSearch, abortControllerChild.signal);

    if (response.code === 0) {
      const result = response.result;
      setListBusinessProcess(result.items);
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
      getListBusinessProcess(params);
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
      showToast("Xoá quy trình thành công", "success");
      getListBusinessProcess(params);
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
          Bạn có chắc chắn muốn xóa quy trình
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
      };

      const response = await BusinessProcessService.list(param);

      if (response.code === 0) {
        const result = response.result;

        const newData = {
          ...result,
          items: [...currentData.items, ...result.items],
        };
        setListBusinessProcess(newData);
        setParamsLoadMore(param);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  return (
    <div className="page-project-management">
      <div className="header-project-management">
        <div className="title-item">
          <Tippy content={isSearchProject ? "Click bỏ lọc" : "Click lọc dự án"} delay={[120, 100]} animation="scale">
            <span
              className="active__icon--search"
              onClick={() => {
                setIsSearchProject(!isSearchProject);
              }}
            >
              {isSearchProject ? <Icon name="Sortby" /> : <Icon name="Filter2" />}
            </span>
          </Tippy>
          Danh sách quy trình
          <span className="active__icon--search">
            <Icon name="IconCaretLeft" />
            <Icon name="IconCaretRight" />
          </span>
        </div>
        <Tippy content="Thêm dự án" delay={[120, 100]} animation="scale">
          <span
            className="add-project"
            onClick={() => {
              setShowModalAdd(true);
              setIdProjectManagement(null);
            }}
          >
            <Icon name="PlusCircleFill" />
          </span>
        </Tippy>
      </div>
      {!isLoading && listBusinessProcess && listBusinessProcess?.length > 0 ? (
        <Fragment>
          <CustomScrollbar
            width="100%"
            height={isRegimeKanban ? "auto" : isFullPage ? "80rem" : "99rem"}
            handleScroll={(e) => {
              handleScroll(e, listBusinessProcess, paramsLoadMore);
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
                    }}
                  >
                    <Icon name="FolderOpen" />
                    <span className="name--project">Xem tất cả</span>
                  </div>
                </div>
              </div>
              {listBusinessProcess && listBusinessProcess.length > 0
                ? listBusinessProcess.map((item, idx) => {
                    return (
                      <ProjectManagementItem
                        key={idx}
                        data={item}
                        isShowChildrenProject={isShowChildrenProject}
                        setIsShowChildrenProject={setIsShowChildrenProject}
                        idProjectManagement={idProjectManagement}
                        setIdProjectManagement={setIdProjectManagement}
                        setShowModalAdd={setShowModalAdd}
                        showDialogConfirmDelete={showDialogConfirmDelete}
                        onReload={(reload) => {
                          if (reload) {
                            getListBusinessProcess(params);
                          }
                        }}
                      />
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
          <h2>Bạn chưa có quy trình nào!</h2>
        </div>
      )}
      <AddProjectManagementModal
        onShow={showModalAdd}
        idData={idProjectManagement}
        onHide={(reload) => {
          if (reload) {
            getListBusinessProcess(params);
          }
          setShowModalAdd(false);
        }}
      />
      <SearchProjectManagementModal
        onShow={isSearchProject}
        onHide={() => setIsSearchProject(false)}
        callBack={(param) => {
          if (param) {
            getListBusinessProcess(param);
          }
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Loading from "components/loading";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IOptManagementListProps } from "model/workOpt/PropsModel";
import { IWorkOptFilterRequest } from "model/workOpt/WorkOptRequestModel";
import { IWorkOptResponseModel } from "model/workOpt/WorkOptResponseModel";
import { showToast } from "utils/common";
import { getSearchParameters } from "reborn-util";
import ImageProjectPlan from "assets/images/project-plan.png";
import SearchProjectManagementModal from "./partials/SearchProjectManagementModal";
import "tippy.js/animations/scale.css";
import "./OptManagementList.scss";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import OptManagementItem from "./partials/OptManagementItem/OptManagementItem";
import AddManagementOpportunityModal from "pages/ManagementOpportunity/partials/AddManagementOpportunityModal";
import { ICampaignOpportunityFilterRequest } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import { ICampaignOpportunityResponseModel } from "model/campaignOpportunity/CampaignOpportunityResponseModel";

export default function OptManagementList(props: IOptManagementListProps) {
  const isMounted = useRef(false);

  const { setType, isFullPage, idOptManagement, setIdOptManagement, isRegimeKanban, dataProjectReport } = props;

  const paramsUrl: any = getSearchParameters();
  const checkKanbanTab = localStorage.getItem("kanbanTabOpportunity");
  const [kanbanTab, setKanbanTab] = useState(checkKanbanTab ? JSON.parse(checkKanbanTab) : 1);
  useEffect(() => {
    localStorage.setItem("kanbanTabOpportunity", JSON.stringify(kanbanTab));
  }, [kanbanTab]);

  const takeIdOptManagement = Object.keys(paramsUrl).length > 0 && paramsUrl?.opportunityId ? +paramsUrl?.opportunityId : -1;

  const [listOpt, setListOpt] = useState(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchProject, setIsSearchProject] = useState<boolean>(false);
  const [isShowChildrenProject, setIsShowChildrenProject] = useState<boolean>(false);
  const [listManagementOpportunity, setListManagementOpportunity] = useState<ICampaignOpportunityResponseModel[]>([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [params, setParams] = useState<IWorkOptFilterRequest>({
    limit: 20,
    page: 1,
  });

  useEffect(() => {
    if (dataProjectReport) {
      setParams((prevParams) => ({ ...prevParams, projectId: dataProjectReport.id }));
    }
  }, [dataProjectReport]);

  //param này để load more
  const [paramsLoadMore, setParamsLoadMore] = useState<IWorkOptFilterRequest>({
    limit: 20,
    page: 1,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Cơ hội",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
      setParamsLoadMore((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
      setParamsLoadMore((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortControllerChild = new AbortController();

  const getListOpt = async (paramsSearch: IWorkOptFilterRequest) => {
    setIsLoading(true);
    const response = await CampaignOpportunityService.list(paramsSearch, abortControllerChild.signal);

    if (response.code === 0) {
      const result = response.result;
      setListOpt(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);

    setIdOptManagement(takeIdOptManagement);

    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListOpt(params);
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
    const response = await CampaignOpportunityService.delete(id);

    if (response.code === 0) {
      showToast("Xoá cơ hội thành công", "success");
      getListOpt(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IWorkOptResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa cơ hội
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

  const abortController = new AbortController();

  const getListManagementOpportunity = async (paramsSearch: ICampaignOpportunityFilterRequest, kanbanTab) => {
    setIsLoading(true);
    const response =
      kanbanTab === 1
        ? await CampaignOpportunityService.list(paramsSearch, abortController.signal)
        : await CampaignOpportunityService.listViewSale(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListManagementOpportunity(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params?.name && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };
  const handleScroll = async (e, currentData, currentParams) => {
    const resultScroll = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;

    if (resultScroll && currentData?.loadMoreAble) {
      const param = {
        ...currentParams,
        page: currentParams.page + 1,
        limit: 20,
      };
      const response = await CampaignOpportunityService.list(param);

      if (response.code === 0) {
        const result = response.result;

        const newData = {
          ...result,
          items: [...currentData.items, ...result.items],
        };
        setListOpt(newData);
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
          <Tippy content={isSearchProject ? "Click bỏ lọc" : "Click lọc cơ hội"} delay={[120, 100]} animation="scale">
            <span
              className="active__icon--search"
              onClick={() => {
                setIsSearchProject(!isSearchProject);
              }}
            >
              {isSearchProject ? <Icon name="Sortby" /> : <Icon name="Filter2" />}
            </span>
          </Tippy>
          <h3>Quản lý cơ hội</h3>
        </div>
        <Tippy content="Thêm cơ hội" delay={[120, 100]} animation="scale">
          <span
            className="add-project"
            onClick={() => {
              setShowModalAdd(true);
              setIdOptManagement(null);
            }}
          >
            <Icon name="PlusCircleFill" />
          </span>
        </Tippy>
      </div>
      {!isLoading && listOpt?.items && listOpt?.items?.length > 0 ? (
        <Fragment>
          <CustomScrollbar
            width="100%"
            height={isRegimeKanban ? "auto" : isFullPage ? "80rem" : "99rem"}
            handleScroll={(e) => {
              handleScroll(e, listOpt, paramsLoadMore);
            }}
          >
            <div className="list-project-management">
              <div className="project-management-item">
                <div className={`project__management-lv1 ${idOptManagement == -1 ? "active__project-management" : ""}`}>
                  <div
                    className="folder-project-management"
                    onClick={() => {
                      setIdOptManagement(-1);
                      setIsShowChildrenProject(false);
                    }}
                  >
                    <Icon name="OpportunityManagement" />
                    <span className="name--project">Xem tất cả</span>
                  </div>
                </div>
              </div>
              {listOpt?.items && listOpt?.items.length > 0
                ? listOpt?.items.map((item, idx) => {
                    return (
                      <OptManagementItem
                        key={idx}
                        data={item}
                        isShowChildrenOpt={isShowChildrenProject}
                        setIsShowChildrenOpt={setIsShowChildrenProject}
                        idOptManagement={idOptManagement}
                        setIdOptManagement={setIdOptManagement}
                        setShowModalAdd={setShowModalAdd}
                        showDialogConfirmDelete={showDialogConfirmDelete}
                        onReload={(reload) => {
                          if (reload) {
                            getListOpt(params);
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
          <h2>Bạn chưa có cơ hội nào!</h2>
        </div>
      )}
      <AddManagementOpportunityModal
        onShow={showModalAdd}
        idData={idOptManagement}
        onHide={(reload) => {
          if (reload) {
            getListManagementOpportunity(params, kanbanTab);
            getListOpt(params);
          }
          setShowModalAdd(false);
        }}
      />
      <SearchProjectManagementModal
        onShow={isSearchProject}
        onHide={() => setIsSearchProject(false)}
        callBack={(param) => {
          if (param) {
            getListOpt(param);
          }
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

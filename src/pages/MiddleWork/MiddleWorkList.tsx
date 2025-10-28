import React, { useState, useCallback, useEffect } from "react";
import Icon from "components/icon";
import { getSearchParameters } from "reborn-util";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { fadeIn, fadeOut } from "reborn-util";
import ListWork from "./partials/ListWork/ListWork";
import ProjectManagementList from "./partials/ProjectManagement/ProjectManagementList";
import DetailWork from "./partials/ListWork/partials/DetailWork/DetailWork";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import "./MiddleWorkList.scss";
import OptManagementList from "./partials/OptManagement/OptManagementList";

export default function MiddleWorkList() {
  const paramsUrl: any = getSearchParameters();
  const [isFullPage, setIsFullPage] = useState<boolean>(false);
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(false);
  const [isDetailWork, setIsDetailWork] = useState<boolean>(false);
  const [isVertical, setIsVertical] = useState<boolean>(false);
  const [isRegimeReport, setIsRegimeReport] = useState<boolean>(false);

  const takeType = Object.keys(paramsUrl).length > 0 && paramsUrl?.workType ? paramsUrl?.workType : "project";
  const [type, setType] = useState<string>(takeType);

  const takeIdOptManagement = Object.keys(paramsUrl).length > 0 && paramsUrl?.opportunityId ? +paramsUrl?.opportunityId : -1;
  const [idOptManagement, setIdOptManagement] = useState<number>(takeIdOptManagement);

  const takeIdProjectManagement = Object.keys(paramsUrl).length > 0 && paramsUrl?.projectId ? +paramsUrl?.projectId : -1;
  const [idProjectManagement, setIdProjectManagement] = useState<number>(takeIdProjectManagement);

  const abortController = new AbortController();

  //! đẩy xuống dưới là do phụ thuộc vào biến ở trên để thay đổi tên
  document.title = `${isDetailWork ? "Chi tiết công việc" : isRegimeKanban ? "Kanban công việc" : "Công việc"}`;

  const [dataDetaiWork, setDataDetailWork] = useState<IWorkOrderResponseModel>(null);

  const showProjectManagement = () => {
    const overlay = document.querySelector(".project-management");
    if (overlay) {
      const body = document.getElementsByTagName("body")[0];
      if (isRegimeKanban) {
        fadeOut(overlay);
        body.style.overflow = "";
      } else if (isRegimeReport) {
        // fadeOut(overlay);
        // body.style.overflow = "";
      } else {
        fadeIn(overlay);
        body.style.overflow = "hidden";
      }
    }
    setIsFullPage(!isFullPage);
  };

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);

  const titleActions: ITitleActions = {
    actions: [
      ...(isRegimeReport
        ? [
            {
              title: "Quay lại",
              icon: <Icon name="ChevronLeft" />,
              callback: () => {
                setIsRegimeReport(!isRegimeReport);
                setIsFullPage(false);
              },
            },
          ]
        : isRegimeKanban
        ? [
            {
              title: "Quay lại",
              icon: <Icon name="ChevronLeft" />,
              callback: () => {
                setIsRegimeKanban(!isRegimeKanban);
                setIsFullPage(false);
                localStorage.removeItem("keep_position_kanban");
              },
            },
          ]
        : [
            {
              title: type == "project" ? "Cơ hội" : "Dự án",
              icon: type == "project" ? <Icon name="OpportunityManagement" /> : <Icon name="FolderOpen" />,
              callback: () => {
                setType(type === "project" ? "opportunity" : "project");
                setIdOptManagement(-1);
                setIdProjectManagement(-1);
              },
            },
            // {
            //   title: isFullPage ? "Đầy đủ" : "Rút gọn",
            //   icon: isFullPage ? <Icon name="FullscreenExit" /> : <Icon name="Fullscreen" />,
            //   callback: () => {
            //     setIsFullPage(!isFullPage);
            //     showProjectManagement();
            //   },
            // },
            {
              title: "Kanban",
              icon: <Icon name="Dashboard" />,
              callback: () => {
                setIsRegimeKanban(true);
                setIsFullPage(true);
              },
            },
            ...(idProjectManagement != -1
              ? [
                  {
                    title: "Báo cáo",
                    icon: <Icon name="ReportFill" />,
                    callback: () => {
                      setIsRegimeReport(true);
                      setIsFullPage(true);
                    },
                  },
                ]
              : []),
          ]),
    ],
    actions_extra: [
      {
        title: "Xuất danh sách",
        icon: <Icon name="Download" />,
        callback: () => {
          setOnShowModalExport(true);
        },
      },
    ],
  };

  useEffect(() => {
    if (isRegimeKanban) {
      localStorage.setItem("keep_position_kanban", JSON.stringify("active_kanban"));
    }

    const historyStorage = JSON.parse(localStorage.getItem("keep_position_kanban"));

    if (historyStorage == "active_kanban") {
      setIsRegimeKanban(true);
      setIsFullPage(true);
    }
  }, [isRegimeKanban]);
  useEffect(() => {
    setIsFullPage(isRegimeReport);
  }, [isRegimeReport]);

  const handleDetailWork = useCallback(
    (data, totalData) => {
      if (totalData > 6) {
        setIsVertical(true);
      } else {
        setIsVertical(false);
      }
      setDataDetailWork(data);
    },
    [dataDetaiWork]
  );

  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className="page-content page-middle-work">
      <div className="actions-title">{!isDetailWork && <TitleAction title="Công việc" titleActions={titleActions} />}</div>
      {type == "project" ? (
        <div className={`wrapper-project ${isDetailWork ? "d-none" : ""}`}>
          <div className={`${isFullPage ? "hide-project-management" : "project-management"} ${!isVertical ? "show__vertical--project" : ""}`}>
            <ProjectManagementList
              setType={setType}
              isRegimeKanban={isRegimeKanban}
              isFullPage={isFullPage}
              idProjectManagement={idProjectManagement}
              setIdProjectManagement={setIdProjectManagement}
            />
          </div>
          <div className={`${isFullPage ? "active-fullpage" : ""} list-project ${isVertical ? "show__vertical--work" : ""}`}>
            <ListWork
              type="project"
              idManagement={idProjectManagement}
              isRegimeKanban={isRegimeKanban}
              isRegimeReport={isRegimeReport}
              isFullPage={isFullPage}
              showProjectManagement={showProjectManagement}
              handleDetailWork={handleDetailWork}
              setIsDetailWork={setIsDetailWork}
              setIsFullPage={setIsFullPage}
              abortController={abortController}
              isExportWork={onShowModalExport}
              onHideExport={() => setOnShowModalExport(false)}
            />
          </div>
        </div>
      ) : (
        <div className={`wrapper-project ${isDetailWork ? "d-none" : ""}`}>
          <div className={`${isFullPage ? "hide-project-management" : "project-management"} ${!isVertical ? "show__vertical--project" : ""}`}>
            <OptManagementList
              setType={setType}
              isRegimeKanban={isRegimeKanban}
              isFullPage={isFullPage}
              idOptManagement={idOptManagement}
              setIdOptManagement={setIdOptManagement}
            />
          </div>
          <div className={`${isFullPage ? "active-fullpage" : ""} list-project ${isVertical ? "show__vertical--work" : ""}`}>
            <ListWork
              type="opportunity"
              idManagement={idOptManagement}
              isRegimeKanban={isRegimeKanban}
              handleDetailWork={handleDetailWork}
              setIsDetailWork={setIsDetailWork}
              setIsFullPage={setIsFullPage}
              showProjectManagement={showProjectManagement}
              abortController={abortController}
              isExportWork={onShowModalExport}
              onHideExport={() => setOnShowModalExport(false)}
            />
          </div>
        </div>
      )}
      <div className={`wrapper__detail--work ${isDetailWork ? "" : "d-none"}`}>
        <div className="action-navigation">
          <div className="action-backup">
            <h1
              onClick={() => {
                setIsDetailWork(false);
              }}
              className="title-first"
              title="Quay lại"
            >
              Công việc
            </h1>
            <Icon name="ChevronRight" />
            <h1 className="title-last">Chi tiết công việc</h1>
          </div>
        </div>

        <DetailWork idData={dataDetaiWork?.id} />
      </div>
    </div>
  );
}

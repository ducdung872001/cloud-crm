import React, { useState, useCallback, useEffect } from "react";
import Icon from "components/icon";
import { getSearchParameters } from "reborn-util";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { fadeIn, fadeOut } from "reborn-util";
import ListWork from "./partials/ListWork/ListWork";
import ProjectManagementList from "./partials/ProjectManagement/ProjectManagementList";

import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import "./index.scss";
import HandleTask from "./partials/ListWork/partials/HandleTask/HandleTask";
import { useLocation } from "react-router-dom";
import DetailTask from "./partials/ListWork/partials/DetailWork/DetailTask";

export default function UserTaskList() {
  const paramsUrl: any = getSearchParameters();
  const location = useLocation();
  const state = location.state || null;
  const viewDetail = location.state?.viewDetail || "";
  const workId = location.state?.workId || "";

  //Khi tạo ycms tự động bật form xử lý
  const isModalHandleTask = location.state?.isHandleTask || "";

  useEffect(() => {
    if (viewDetail) {
      setIsDetailWork(viewDetail);
    }
  }, [viewDetail]);

  useEffect(() => {
    if (workId) {
      setDataDetailWork({ id: workId });
      setIsDetailWork(true);
    }
  }, [workId]);

  useEffect(() => {
    if (isModalHandleTask) {
      setIsModalHandleProcument(isModalHandleTask);
    }
  }, [isModalHandleTask]);

  const [isFullPage, setIsFullPage] = useState<boolean>(false);
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(false);
  const [isDetailWork, setIsDetailWork] = useState<boolean>(false);
  const [isVertical, setIsVertical] = useState<boolean>(false);
  const [isRegimeReport, setIsRegimeReport] = useState<boolean>(false);
  const [isHandleTask, setIsHandleTask] = useState<boolean>(false);
  // console.log('isHandleTask', isHandleTask);
  const [isModalHandleProcument, setIsModalHandleProcument] = useState(false);

  const takeType = Object.keys(paramsUrl).length > 0 && paramsUrl?.workType ? paramsUrl?.workType : "project";
  const [type, setType] = useState<string>(takeType);

  const takeIdOptManagement = Object.keys(paramsUrl).length > 0 && paramsUrl?.opportunityId ? +paramsUrl?.opportunityId : -1;
  const [idOptManagement, setIdOptManagement] = useState<number>(takeIdOptManagement);

  const takeIdProjectManagement = Object.keys(paramsUrl).length > 0 && paramsUrl?.projectId ? +paramsUrl?.projectId : -1;
  const [idProjectManagement, setIdProjectManagement] = useState<number>(takeIdProjectManagement);

  const abortController = new AbortController();

  //! đẩy xuống dưới là do phụ thuộc vào biến ở trên để thay đổi tên
  document.title = `${isDetailWork ? "Chi tiết công việc" : isRegimeKanban ? "Kanban công việc" : "Công việc"}`;

  // const [dataDetaiWork, setDataDetailWork] = useState<IWorkOrderResponseModel>(null);
  const [dataDetaiWork, setDataDetailWork] = useState<any>(null);

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
      // ...(isRegimeReport
      //   ? [
      //       {
      //         title: "Quay lại",
      //         icon: <Icon name="ChevronLeft" />,
      //         callback: () => {
      //           setIsRegimeReport(!isRegimeReport);
      //           setIsFullPage(false);
      //         },
      //       },
      //     ]
      //   : isRegimeKanban
      //   ? [
      //       {
      //         title: "Quay lại",
      //         icon: <Icon name="ChevronLeft" />,
      //         callback: () => {
      //           setIsRegimeKanban(!isRegimeKanban);
      //           setIsFullPage(false);
      //           localStorage.removeItem("keep_position_kanban");
      //         },
      //       },
      //     ]
      //   : [
      //       {
      //         title: "Kanban",
      //         icon: <Icon name="Dashboard" />,
      //         callback: () => {
      //           setIsRegimeKanban(true);
      //           setIsFullPage(true);
      //         },
      //       },
      //     ]),
    ],
    // actions_extra: [
    //   {
    //     title: "Xuất danh sách",
    //     icon: <Icon name="Download" />,
    //     callback: () => {
    //       setOnShowModalExport(true);
    //     },
    //   },
    // ],
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
      // if (totalData > 6) {
      //   setIsVertical(true);
      // } else {
      //   setIsVertical(false);
      // }
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
    <div className="page-content page-user-task-list">
      <div className="actions-title">
        {<TitleAction title={isDetailWork || isHandleTask ? "Công việc" : "Danh sách công việc"} titleActions={titleActions} />}
      </div>
      {type == "project" ? (
        <div className={`wrapper-project ${isDetailWork || isHandleTask ? "d-none" : ""}`}>
          {/* <div className={`${isFullPage ? "hide-project-management" : "project-management"} ${!isVertical ? "show__vertical--project" : ""}`}>
            <ProjectManagementList
              setType={setType}
              isRegimeKanban={isRegimeKanban}
              isFullPage={isFullPage}
              idProjectManagement={idProjectManagement}
              setIdProjectManagement={setIdProjectManagement}
            />
          </div> */}
          <div className={`${isFullPage ? "active-fullpage" : ""} list-project ${isVertical ? "show__vertical--work" : ""}`}>
            <ListWork
              type="process"
              isDetailWork={isDetailWork}
              idManagement={idProjectManagement}
              isRegimeKanban={isRegimeKanban}
              setIsRegimeKanban={setIsRegimeKanban}
              isRegimeReport={isRegimeReport}
              isFullPage={isFullPage}
              showProjectManagement={showProjectManagement}
              handleDetailWork={handleDetailWork}
              setIsDetailWork={setIsDetailWork}
              setIsHandleTask={setIsHandleTask}
              setIsFullPage={setIsFullPage}
              abortController={abortController}
              isExportWork={onShowModalExport}
              onHideExport={() => setOnShowModalExport(false)}
              setOnShowModalExport={() => {
                setOnShowModalExport(true);
              }}
            />
          </div>
        </div>
      ) : (
        <div className={`wrapper-project ${isDetailWork || isHandleTask ? "d-none" : ""}`}>
          <div className={`${isFullPage ? "active-fullpage" : ""} list-project ${isVertical ? "show__vertical--work" : ""}`}>
            <ListWork
              type="opportunity"
              isDetailWork={isDetailWork}
              idManagement={idOptManagement}
              isRegimeKanban={isRegimeKanban}
              handleDetailWork={handleDetailWork}
              setIsDetailWork={setIsDetailWork}
              setIsHandleTask={setIsHandleTask}
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
                setDataDetailWork(null);
                setIsModalHandleProcument(false);
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

        <DetailTask
          idData={dataDetaiWork?.id}
          isDetailWork={isDetailWork}
          isHandleTask={isModalHandleProcument}
          setIsHandleTask={() => {
            // setIsHandleTask(true);
            setIsDetailWork(false);
            setIsModalHandleProcument(false);
          }}
        />
      </div>

      <div className={`wrapper__handle--work ${isHandleTask ? "" : "d-none"}`}>
        <div className="action-navigation">
          <div className="action-backup">
            <h1
              onClick={() => {
                setIsDetailWork(false);
                setDataDetailWork(null);
                setIsHandleTask(false);
              }}
              className="title-first"
              title="Quay lại"
            >
              Công việc
            </h1>
            <Icon name="ChevronRight" />

            <h1
              className="title-first"
              onClick={() => {
                setIsHandleTask(false);
                setIsDetailWork(true);
              }}
            >
              Chi tiết công việc
            </h1>
            <Icon name="ChevronRight" />

            <h1 className="title-last">Xử lý nhiệm vụ</h1>
          </div>
        </div>

        {/* <div className="container-form">
          <HandleTask 
            onShow={isHandleTask}
            dataWork={dataDetaiWork} 
          />
        </div> */}
      </div>
    </div>
  );
}

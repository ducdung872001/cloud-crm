import Icon from "components/icon";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import ListWork from "pages/MiddleWork/partials/ListWork/ListWork";
import DetailWork from "pages/MiddleWork/partials/ListWork/partials/DetailWork/DetailWork";
import React, { useCallback, useEffect, useState } from "react";
import { fadeIn, fadeOut } from "reborn-util";
// import { getSearchParameters } from "utils/common";
import "./TableWorkReport.scss";

export default function TableWorkContract({ dataProjectReport }) {
  // const paramsUrl: any = getSearchParameters();
  const [isFullPage, setIsFullPage] = useState<boolean>(true);
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(false);
  const [isDetailWork, setIsDetailWork] = useState<boolean>(false);
  const [isVertical, setIsVertical] = useState<boolean>(false);
  const [isRegimeReport, setIsRegimeReport] = useState<boolean>(false);

  const takeType = "project";
  const [type, setType] = useState<string>(takeType);

  const [idProjectManagement, setIdProjectManagement] = useState<number>(0);

  useEffect(() => {
    setIdProjectManagement(dataProjectReport.id);
  }, [dataProjectReport]);

  const abortController = new AbortController();

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
    if (type == "project") {
      setIsFullPage(true);
    } else {
      setIsFullPage(!isFullPage);
    }
  };

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);

  const titleActions: ITitleActions = {
    actions: [
      // {
      //   title: type == "project" ? "Xem công việc theo cơ hội" : "Xem công việc của dự án",
      //   icon: type == "project" ? <Icon name="OpportunityManagement" /> : <Icon name="FolderOpen" />,
      //   callback: () => {
      //     setType(type === "project" ? "opportunity" : "project");
      //     setIdOptManagement(-1);
      //     setIdProjectManagement(-1);
      //   },
      // },
    ],
  };

  useEffect(() => {
    if (type == "project") {
      setIsFullPage(true);
    } else {
      setIsFullPage(false);
    }
  }, [type]);

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
    setIsFullPage(true);
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className="page-content page-middle-work-report">
      <div className="actions-title">{!isDetailWork && <TitleAction title="" titleActions={titleActions} />}</div>
      <div className={`wrapper-project ${isDetailWork ? "d-none" : ""}`}>
        <div className={`${isFullPage ? "active-fullpage" : ""} list-project ${isVertical ? "show__vertical--work" : ""} list-work-project`}>
          <ListWork
            type="project"
            dataProjectReport={dataProjectReport}
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

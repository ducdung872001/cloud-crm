import React, { useState } from "react";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import ProjectNavigation from "./partials/ProjectNavigation";
import WorkTableByGroup from "./partials/WorkTableByGroup";

export default function ListWork(props: any) {
  const { activeTitleHeader } = props;
  const [isDetailWork, setIsDetailWork] = useState<boolean>(false);
  let _isFullPage = localStorage.getItem("isFullPageWorkManagement");
  const [isFullPage, setIsFullPage] = useState<boolean>(_isFullPage ? (_isFullPage === "true" ? true : false) : false);
  const [isVertical, setIsVertical] = useState<boolean>(false);
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(false);
  const [isRegimeReport, setIsRegimeReport] = useState<boolean>(false);
  const [type, setType] = useState<string>("project");
  // localStorage.setItem("projectIdWorkManagement", takeIdProjectManagement.toString());
  const takeIdProjectManagement =
    localStorage.getItem("projectWorkManagement") &&
    JSON.parse(localStorage.getItem("projectWorkManagement")) &&
    JSON.parse(localStorage.getItem("projectWorkManagement"))?.id
      ? JSON.parse(localStorage.getItem("projectWorkManagement"))?.id
      : -1;
  console.log("projectWorkManagement:", takeIdProjectManagement);

  const [idProjectManagement, setIdProjectManagement] = useState<number>(takeIdProjectManagement);
  const abortController = new AbortController();
  const handleDetailWork = (isDetail: boolean, isVerticalWork: boolean) => {
    setIsDetailWork(isDetail);
    setIsVertical(isVerticalWork);
  };
  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);
  const showProjectManagement = () => {};
  return (
    <div className="list-work-manager">
      {/* <div className="header-list-work">
        <div className="item-header"></div>
      </div> */}
      <div className="body-list-work">
        <div className={`wrapper-project ${isDetailWork ? "d-none" : ""}`}>
          <div className={`${isFullPage ? "hide-project-management" : "project-management"} ${!isVertical ? "show__vertical--project" : ""}`}>
            <ProjectNavigation
              setType={setType}
              isRegimeKanban={isRegimeKanban}
              isFullPage={isFullPage}
              idProjectManagement={idProjectManagement}
              setIdProjectManagement={setIdProjectManagement}
            />
          </div>
          <div className={`${isFullPage ? "active-fullpage" : ""} list-project ${isVertical ? "show__vertical--work" : ""}`}>
            <WorkTableByGroup
              activeTitleHeader={activeTitleHeader}
              idManagement={idProjectManagement}
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
      </div>
    </div>
  );
}

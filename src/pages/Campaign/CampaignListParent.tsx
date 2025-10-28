import React, { useState, useCallback, useEffect } from "react";
import Icon from "components/icon";
import { getSearchParameters } from "reborn-util";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { fadeIn, fadeOut } from "reborn-util";

import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import "./CampaignListParent.scss";
import ProjectManagementList from "pages/MiddleWork/partials/ProjectManagement/ProjectManagementList";
import ListWork from "pages/MiddleWork/partials/ListWork/ListWork";
import OptManagementList from "pages/MiddleWork/partials/OptManagement/OptManagementList";
import DetailWork from "pages/MiddleWork/partials/ListWork/partials/DetailWork/DetailWork";
import CampaignManagementList from "./partials/CampaignManagement/CampaignManagementList";
import CampaignList from "./CampaignList";

export default function CampaignListParent() {
  const paramsUrl: any = getSearchParameters();
  const [isFullPage, setIsFullPage] = useState<boolean>(false);
  const [isDetailWork, setIsDetailWork] = useState<boolean>(false);
  const [isVertical, setIsVertical] = useState<boolean>(false);
  const [isRegimeReport, setIsRegimeReport] = useState<boolean>(false);

  const takeType = Object.keys(paramsUrl).length > 0 && paramsUrl?.workType ? paramsUrl?.workType : "project";
  const [type, setType] = useState<string>(takeType);

  const takeIdOptManagement = Object.keys(paramsUrl).length > 0 && paramsUrl?.opportunityId ? +paramsUrl?.opportunityId : -1;
  const [idOptManagement, setIdOptManagement] = useState<number>(takeIdOptManagement);

  const takeIdProjectManagement = Object.keys(paramsUrl).length > 0 && paramsUrl?.parentId ? +paramsUrl?.parentId : -1;
  const [idProjectManagement, setIdProjectManagement] = useState<number>(takeIdProjectManagement);

  const abortController = new AbortController();

  //! đẩy xuống dưới là do phụ thuộc vào biến ở trên để thay đổi tên

  const [dataDetaiWork, setDataDetailWork] = useState<IWorkOrderResponseModel>(null);

  const showProjectManagement = () => {
    const overlay = document.querySelector(".project-management");
    if (overlay) {
      const body = document.getElementsByTagName("body")[0];
    }
    setIsFullPage(!isFullPage);
  };

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);

  const titleActions: ITitleActions = {
    actions: [
      // {
      //   title: type == "project" ? "Cơ hội" : "Dự án",
      //   icon: type == "project" ? <Icon name="OpportunityManagement" /> : <Icon name="FolderOpen" />,
      //   callback: () => {
      //     setType(type === "project" ? "opportunity" : "project");
      //     setIdOptManagement(-1);
      //     setIdProjectManagement(-1);
      //   },
      // },
    ],
    actions_extra: [
      // {
      //   title: "Xuất danh sách",
      //   icon: <Icon name="Download" />,
      //   callback: () => {
      //     setOnShowModalExport(true);
      //   },
      // },
    ],
  };

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

  const [parentCampaign, setParentCampaign] = useState(null);

  return (
    <div className="page-content page-campaign-parent">
      <div className="actions-title">{!isDetailWork && <TitleAction title="Chiến dịch" titleActions={titleActions} />}</div>
      <div className={`wrapper-project ${isDetailWork ? "d-none" : ""}`}>
        <div className={`${isFullPage ? "hide-project-management" : "project-management"} ${!isVertical ? "show__vertical--project" : ""}`}>
          <CampaignManagementList
            setType={setType}
            isRegimeKanban={false}
            isFullPage={isFullPage}
            idProjectManagement={idProjectManagement}
            setIdProjectManagement={setIdProjectManagement}
            setParentCampaign={setParentCampaign}
          />
        </div>
        <div className={`${isFullPage ? "active-fullpage" : ""} list-project ${isVertical ? "show__vertical--work" : ""}`}>
          <CampaignList parentId={idProjectManagement} isFullPage={isFullPage} setIsFullPage={setIsFullPage} parentCampaign={parentCampaign} />
        </div>
      </div>

      {/* <div className={`wrapper__detail--work ${isDetailWork ? "" : "d-none"}`}>
        <div className="action-navigation">
          <div className="action-backup">
            <h1
              onClick={() => {
                setIsDetailWork(false);
              }}
              className="title-first"
              title="Quay lại"
            >
              Chiến dịch
            </h1>
            <Icon name="ChevronRight" />
            <h1 className="title-last">Chi tiết công việc</h1>
          </div>
        </div>

        <DetailWork idData={dataDetaiWork?.id} />
      </div> */}
    </div>
  );
}

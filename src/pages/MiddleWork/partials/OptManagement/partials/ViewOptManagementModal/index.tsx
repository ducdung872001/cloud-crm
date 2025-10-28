import React, { Fragment, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { IActionModal } from "model/OtherModel";
import { IViewProjectManagementModalProps } from "model/workProject/PropsModel";
import Loading from "components/loading";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import ImageThirdGender from "assets/images/third-gender.png";
import { showToast } from "utils/common";
import "./index.scss";
import CampaignOpportunityService from "services/CampaignOpportunityService";

export default function ViewProjectManagementModal(props: IViewProjectManagementModalProps) {
  const { onShow, onHide, idOptManagement } = props;

  const [detailProjectManagement, setDetailProjectManagement] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getDetailProjectManagement = async () => {
    setIsLoading(true);

    const response = await CampaignOpportunityService.detail(idOptManagement);

    if (response.code === 0) {
      const result = response.result;
      console.log("result", result);

      setDetailProjectManagement(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && idOptManagement) {
      getDetailProjectManagement();
    }
  }, [onShow, idOptManagement]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-view-project">
      {!isLoading && detailProjectManagement !== null ? (
        <Fragment>
          <ModalHeader
            title={`Xem chi tiết cơ hội ${detailProjectManagement?.name ? " - " + detailProjectManagement?.name?.toLowerCase() : ""}`}
            toggle={() => {
              onHide();
            }}
          />
          <ModalBody>
            <div className="wrapper__view--project">
              <div className="view__info--left">
                <div className={`item__info--left ${detailProjectManagement?.parentId !== 0 ? "dependent__sub" : ""} code--project`}>
                  <h4 className="title">Mã cơ hội</h4>
                  <h4 className="name">{detailProjectManagement?.code}</h4>
                </div>
                {detailProjectManagement?.parentId !== 0 && (
                  <div className="item__info--left dependent__sub in--project">
                    <h4 className="title">Thuộc cơ hội</h4>
                    <h4 className="name">{detailProjectManagement?.parentName}</h4>
                  </div>
                )}
                <div className={`item__info--left ${detailProjectManagement?.parentId !== 0 ? "dependent__sub" : ""} starttime--project`}>
                  <h4 className="title">Bắt đầu</h4>
                  <h4 className="name">{moment(detailProjectManagement?.startTime).format("DD/MM/YYYY HH:mm")}</h4>
                </div>
                <div className={`item__info--left ${detailProjectManagement?.parentId !== 0 ? "dependent__sub" : ""} endtime--project`}>
                  <h4 className="title">Kết thúc</h4>
                  <h4 className="name">{moment(detailProjectManagement?.endTime).format("DD/MM/YYYY HH:mm")}</h4>
                </div>
                <div className={`item__info--left ${detailProjectManagement?.parentId !== 0 ? "dependent__sub" : ""} content--project`}>
                  <h4 className="title">Nội dung</h4>
                  <p className="content">
                    {detailProjectManagement?.description?.length > 0 ? detailProjectManagement?.description : "..............."}
                  </p>
                </div>
                <div
                  className={`item__info--left ${detailProjectManagement?.parentId !== 0 ? "dependent__sub" : ""} ${
                    JSON.parse(detailProjectManagement?.docLink ? detailProjectManagement?.docLink : "[]")?.length > 0 ? "document--project" : ""
                  } `}
                >
                  <h4 className="title">Tài liệu</h4>
                  {JSON.parse(detailProjectManagement?.docLink ? detailProjectManagement?.docLink : "[]")?.length > 0 ? (
                    <div className="list__document">
                      {JSON.parse(detailProjectManagement?.docLink ? detailProjectManagement?.docLink : "[]").map((item, idx) => {
                        return item.type === "image" ? (
                          <div key={idx} className="image-item">
                            <img src={item.url} alt="" />
                          </div>
                        ) : (
                          ""
                        );
                      })}
                    </div>
                  ) : (
                    <span className="three--dots">...............</span>
                  )}
                </div>
              </div>
              <div className="view__info--right">
                <div className="info__manager">
                  <h4 className="title">Người quản lý cơ hội</h4>
                  <div className="name__manager">
                    <div className="avatar--manager">
                      <img src={detailProjectManagement.avatar || ImageThirdGender} alt={detailProjectManagement.employeeName} />
                    </div>
                    {detailProjectManagement.employeeName}
                  </div>
                </div>

                <div className={`info__participant ${detailProjectManagement.lstParticipant?.length === 0 ? "d-flex " : ""}`}>
                  <h4 className="title">Người tham gia</h4>
                  {detailProjectManagement.lstParticipant?.length > 0 ? (
                    <div className="list__participant">
                      <CustomScrollbar
                        width="32rem"
                        height={`${
                          (detailProjectManagement.lstParticipant?.length * 36) / 10 >= 14
                            ? 14
                            : (detailProjectManagement.lstParticipant?.length * 36) / 10
                        }rem`}
                      >
                        {detailProjectManagement.lstParticipant.map((item, idx) => {
                          return (
                            <div key={idx} className="item__participant">
                              <div className="avatar--participant">
                                <img src={item.avatar || ImageThirdGender} alt={item.name} />
                              </div>
                              {item.name}
                            </div>
                          );
                        })}
                      </CustomScrollbar>
                    </div>
                  ) : (
                    <span className="three--dots">...............</span>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </Fragment>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}

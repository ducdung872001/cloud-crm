import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { ILstVideoSupportProps } from "model/videoSupport/PropsModel";
import { IVideoSupportFilterRequest } from "model/videoSupport/VideoSupportRequestModel";
import { IVideoSupportResponseModel } from "model/videoSupport/VideoSupportResponseModel";
import Loading from "components/loading";
import Image from "components/image";
import Icon from "components/icon";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import VideoSupportService from "services/VideoSupportService";
import { showToast, takeThumbnailImgYoutube } from "utils/common";
import { useWindowDimensions } from "utils/hookCustom";
import "./lstVideoSupport.scss";

export default function LstVideoSupport(props: ILstVideoSupportProps) {
  const { onShow, onHide } = props;

  const { width } = useWindowDimensions();

  const [lstVideo, setLstVideo] = useState<IVideoSupportResponseModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailVideo, setDetailVideo] = useState<IVideoSupportResponseModel>(null);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  const [params] = useState<IVideoSupportFilterRequest>({
    module: "crm",
    parentId: 0,
    limit: 100,
  });

  const getListVideo = async (paramsSearch: IVideoSupportFilterRequest) => {
    setIsLoading(true);

    const response = await VideoSupportService.list(paramsSearch);

    if (response.code == 0) {
      const result = response.result;
      const takeLstVideo = (result.items || []).filter((item) => item.type == "video");
      setLstVideo(takeLstVideo);
      setDetailVideo(takeLstVideo[0]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow) {
      getListVideo(params);
    }
  }, [onShow]);

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

  const resizeScreen = width > 1600 ? 60 : width <= 1600 ? 55 : "";

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} size="xxl" toggle={() => onHide()} className="modal-video-support">
        <div className="wrapper__video--support">
          <ModalHeader title="Danh sách video hướng dẫn" toggle={() => onHide()} />
          <ModalBody>
            {!isLoading && detailVideo && lstVideo && lstVideo.length > 0 ? (
              <div className="video--support">
                <div className="box__prev--video">
                  <iframe
                    loading="eager"
                    src={`${detailVideo?.link.replace("watch?v=", "embed/")}?autoplay=${autoPlay ? 1 : 0}`}
                    allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="action-play"
                    allowFullScreen={true}
                  />

                  <div className="name-video">
                    <h3>{detailVideo.title}</h3>
                  </div>
                </div>
                <div className="lst__video">
                  <CustomScrollbar width="100%" height={`${resizeScreen}rem`}>
                    <Fragment>
                      {lstVideo.map((el, idx) => {
                        const idThumbnailYoutube = takeThumbnailImgYoutube(el.link);
                        return (
                          <div
                            key={idx}
                            className={`item-video ${el.id == detailVideo.id ? "active-video" : ""}`}
                            onClick={() => {
                              if (el.id !== detailVideo.id) {
                                setDetailVideo(el);
                                setAutoPlay(true);
                              }
                            }}
                          >
                            {el.id == detailVideo.id && (
                              <div className="play-video">
                                <Icon name="Play" />
                              </div>
                            )}
                            <div className="info-video">
                              <div className="avatar">
                                <Image src={`https://i.ytimg.com/vi/${idThumbnailYoutube}/hqdefault.jpg`} alt={el.title} />
                              </div>
                              <div className="name">{el.title}</div>
                            </div>
                          </div>
                        );
                      })}
                    </Fragment>
                  </CustomScrollbar>
                </div>
              </div>
            ) : (
              <Loading />
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}

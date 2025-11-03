import React, { Fragment, useEffect, useMemo, useState } from "react";
import { IActionModal } from "model/OtherModel";
import { IModalAddVideoProps } from "model/editor/PropsModel";
import Icon from "components/icon";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { validateIsEmpty } from "reborn-validation";
import { showToast } from "utils/common";
import { createArrayFromTo } from "reborn-util";
import { uploadVideoFromFiles } from "utils/videoBlob";

import "./index.scss";

export default function Video(props: IModalAddVideoProps) {
  const { onShow, onHide } = props;

  const [option, setOption] = useState<number>(1);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //Danh sách video có thể chọn để chèn => Gọi từ api thư viện người dùng
  const [listVideo, setListVideo] = useState([]);

  //Video được chọn
  const [videoLink, setVideoLink] = useState("");
  const [thumbnailLink, setThumbnailLink] = useState("");

  //Hiển thị % uploadVideo
  const [showProgress, setShowProgress] = useState<number>(null);

  const nameCommon = showProgress === null;

  const onSubmit = async (e) => {
    e && e.preventDefault();
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              videoLink ? showDialogConfirmCancel() : onHide();
            },
          },
          {
            title: "Thêm video",
            type: "button",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
            callback: () => {
              if (validateIsEmpty(videoLink)) {
                showToast("Bạn cần tải hoặc chọn 1 video có sẵn từ thư viện", "error");
                return;
              }

              //Gọi chèn vào trình soạn thảo
              if (props.callback) {
                props.callback(videoLink, thumbnailLink);
                onHide();
              }
            },
          },
        ],
      },
    }),
    [isSubmit, videoLink, thumbnailLink]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác thêm mới`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide();
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  //! đoạn này xử lý video
  const handleVideoUpload = async (e) => {
    e && e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      const maxSize = 1048576 * 500;

      if (e.target.files[0].size > maxSize) {
        showToast("Video tải lên giới hạn dung lượng không quá 500MB", "warning");
        e.target.value = "";
      } else {
        uploadVideoFromFiles(e.target.files, processVideo, showProcessUploadMedia, processThumbnail, null);
        e.target.value = null;
      }
    }
  };

  const processVideo = (url, filekey) => {
    setVideoLink(url);
  };

  const processThumbnail = (url, fileKey) => {
    setThumbnailLink(url);
  };

  const showProcessUploadMedia = (percent, fileKey) => {
    setShowProgress(percent);
    setIsSubmit(true);

    if (percent == 100) {
      setShowProgress(null);
      setIsSubmit(false);
    }
  };

  const chooseVideo = (e, url) => {
    e && e.preventDefault();
    setVideoLink(url);
  };

  useEffect(() => {
    if (videoLink) {
      //Gọi chèn video xuống dưới luôn
      if (props.callback) {
        props.callback(videoLink, thumbnailLink);
        onHide();
      }
    }
  }, [videoLink]);

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => !isSubmit && onHide()} className="modal-add-video">
        <form className="form-add-video-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Thêm video" toggle={() => !isSubmit && onHide()} />
          <ModalBody>
            <CustomScrollbar width="100%" height="35rem">
              <div className="wrapper__add--video">
                <ul className="menu__list--option">
                  <li className={`option-item ${option == 1 ? "action__option" : ""}`} onClick={() => setOption(1)}>
                    Tải video lên
                  </li>
                  <li className={`option-item ${option == 2 ? "action__option" : ""}`} onClick={() => setOption(2)}>
                    Thư viện
                  </li>
                </ul>

                {option == 1 ? (
                  <div className="d-flex align-items-start">
                    <h4>Chọn video</h4>
                    <div className="upload-photos">
                      <div className={`upload ${showProgress ? "upload__done" : ""}`} style={{ width: `100%` }}>
                        <label htmlFor={nameCommon ? "uploadVideo" : ""}>
                          {nameCommon ? (
                            <span>
                              <Icon name="PlayVideo" />
                              Tải video lên
                            </span>
                          ) : (
                            `${Math.round(showProgress || 0)}%`
                          )}
                        </label>
                        <input
                          type="file"
                          accept="video/*,.mp4,.mov;capture=camera"
                          className="d-none"
                          id="uploadVideo"
                          onChange={(e) => handleVideoUpload(e)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-start">
                    <h4>Tất cả video</h4>
                    <div className="list__photo--gallery">
                      {(listVideo || []).map((image, idx) => {
                        <div key={idx} className="item" onClick={(e) => chooseVideo(e, image)}>
                          <img src={image} alt="" />
                        </div>;
                      })}

                      {listVideo.length < 9 &&
                        createArrayFromTo(1, 9 - listVideo.length).map((item, idx) => {
                          return (
                            <div key={idx} className="item">
                              <img src="https://samkyvuong.vn/wp-content/uploads/2022/04/hinh-anh-gai-han.jpg" alt="" />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </CustomScrollbar>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

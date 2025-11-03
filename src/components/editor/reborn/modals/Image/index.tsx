import React, { Fragment, useMemo, useState } from "react";
import { IActionModal } from "model/OtherModel";
import { IModalAddImageProps } from "model/editor/PropsModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import CustomScrollbar from "components/customScrollbar";
import { showToast } from "utils/common";
import { uploadImageFromFiles } from "utils/image";
import FileService from "services/FileService";
import { createArrayFromTo } from "reborn-util";

import "./index.scss";

export default function Image(props: IModalAddImageProps) {
  const { onShow, onHide } = props;
  const [option, setOption] = useState<number>(1);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //Danh sách ảnh có thể chọn để chèn => Gọi từ api thư viện người dùng
  const [listImage, setListImage] = useState([]);

  //Ảnh được chèn vào 1 lần tối đa được 9 ảnh ...
  const [listSelectedImage, setListSelectedImage] = useState<string[]>([]);

  //* Hiển thị % uploadImage
  const [showProgress, setShowProgress] = useState<number>(null);

  const nameCommon = showProgress === null;

  //! đoạn này xử lý hình ảnh
  const handleImageUpload = async (e) => {
    e && e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      const maxSize = 1048576 * 25;

      if (e.target.files[0].size > maxSize) {
        showToast("Ảnh tải lên giới hạn dung lượng không quá 25MB", "warning");
        e.target.value = "";
      } else {
        // uploadImageFromFiles(e.target.files, showImage, false, getProgress);
        handUploadFile(e.target.files[0]);

        e.target.value = null;
      }
    }
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setListSelectedImage([...listSelectedImage, result]);
  };

  // const showImage = (url, filekey) => {
  //   setListSelectedImage([...listSelectedImage, url]);
  // };

  const chooseImage = (e, url) => {
    e && e.preventDefault();
    setListSelectedImage([...listSelectedImage, url]);
  };

  const getProgress = (percent) => {
    setShowProgress(percent);

    if (percent == 100) {
      setShowProgress(null);
    }
  };

  const handleRemoveImageItem = (idx) => {
    const result = [...listSelectedImage];
    result.splice(idx, 1);
    setListSelectedImage(result);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác thêm mới ảnh`}</Fragment>,
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
        setListSelectedImage([]);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: showProgress !== null,
            callback: () => {
              listSelectedImage.length > 0 ? showDialogConfirmCancel() : onHide();
            },
          },
          {
            title: "Xác nhận", // Thêm ảnh
            type: "button",
            color: "primary",
            disabled: showProgress !== null || listSelectedImage.length == 0,
            callback: () => {
              //Gọi chèn vào trình soạn thảo
              if (props.callback) {
                props.callback(listSelectedImage);
                onHide();
              }
            },
          },
        ],
      },
    }),
    [listSelectedImage, showProgress]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !showProgress && onHide()}
        className="modal-add-image"
      >
        <div className="form-add-image-group">
          <ModalHeader
            title="Thêm hình ảnh"
            toggle={() => {
              !showProgress && onHide();
              !showProgress && setListSelectedImage([]);
            }}
          />
          <ModalBody>
            <CustomScrollbar width="100%" height="35rem">
              <div className="wrapper__add--image">
                <ul className="menu__list--option">
                  <li className={`option-item ${option == 1 ? "action__option" : ""}`} onClick={() => setOption(1)}>
                    Tải ảnh lên
                  </li>
                  <li className={`option-item ${option == 2 ? "action__option" : ""}`} onClick={() => setOption(2)}>
                    Thư viện
                  </li>
                </ul>

                {option == 1 ? (
                  <div className="d-flex align-items-start">
                    <h4>Chọn ảnh</h4>
                    <div className="upload-photos">
                      <div className={`upload ${showProgress ? "upload__done" : ""}`} style={{ width: `${showProgress}%` }}>
                        <label htmlFor={`${nameCommon ? "uploadPhotos" : ""}`}>{`${
                          nameCommon ? "Tải ảnh lên" : `${Math.round(showProgress || 0)}%`
                        }`}</label>
                        <input
                          type="file"
                          accept="image/gif,image/jpeg,image/png,image/jpg"
                          className="d-none"
                          id="uploadPhotos"
                          onChange={(e) => handleImageUpload(e)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-start">
                    <h4>Tất cả hình ảnh</h4>
                    <div className="list__photo--gallery">
                      {(listImage || []).map((image, idx) => {
                        <div key={idx} className="item" onClick={(e) => chooseImage(e, image)}>
                          <img src={image} alt="" />
                        </div>;
                      })}

                      {listImage.length < 9 &&
                        createArrayFromTo(1, 9 - listImage.length).map((item, idx) => {
                          return (
                            <div key={idx} className="item">
                              <img src="https://samkyvuong.vn/wp-content/uploads/2022/04/hinh-anh-gai-han.jpg" alt="" />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div className="list__img--selected">
                  <h4>Hình ảnh được chèn ({listSelectedImage.length}/9)</h4>
                  <div className="list-item">
                    {(listSelectedImage || []).map((item, idx) => {
                      return (
                        <div key={idx} className="item img-selected">
                          <img src={item} alt="" />
                          <span className="icon-delete" onClick={() => handleRemoveImageItem(idx)}>
                            <Icon name="Trash" />
                          </span>
                        </div>
                      );
                    })}

                    {listSelectedImage.length < 9 &&
                      createArrayFromTo(1, 9 - listSelectedImage.length).map((item, idx) => {
                        return (
                          <div key={idx} className="item">
                            <Icon name="Image" />
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </CustomScrollbar>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

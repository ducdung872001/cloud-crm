import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { IActionModal } from "model/OtherModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import { showToast } from "utils/common";
import "./index.scss";
import CampaignOpportunityService from "services/CampaignOpportunityService";

interface IUploadMediaProps {
  infoMedia: { type: string; url: string };
  checkType?: string;
  onShow: boolean;
  onHide: (reload: boolean) => void;
  id: number;
  employeeId: number;
  coyId: number;
  content?: string;
}

export default function UploadMedia(props: IUploadMediaProps) {
  const { infoMedia, checkType, onShow, onHide, id, employeeId, coyId, content } = props;

  const textareaRef = useRef(null);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [lstData, setLstData] = useState([]);

  const [contentDesc, setContentDesc] = useState({
    content: "",
  });

  useEffect(() => {
    if (content) {
      setContentDesc({ content: content });
    }
  }, [content]);

  useEffect(() => {
    if (infoMedia.url) {
      setLstData([...lstData, infoMedia]);
    } else {
      setLstData([]);
    }
  }, [infoMedia]);

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handSubmitForm(e);
    }
  };

  const handleTextareaChange = (e) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }

    const value = e.target.value;
    setContentDesc({ content: value });
  };

  const nameCommon = checkType == "video" ? "video" : "hình ảnh";

  const handSubmitForm = async (e) => {
    e && e.preventDefault();

    const lstMedia = lstData.map((item) => {
      return {
        type: item.type,
        url: item.url,
        fileName: item.fileName,
      };
    });

    setIsSubmit(true);

    const body = {
      id: id,
      coyId: coyId,
      employeeId: employeeId,
      content: contentDesc.content,
      medias: lstMedia,
    };

    const response = await CampaignOpportunityService.addOpportunityExchange(body);

    if (response.code === 0) {
      onHide(true);
      setLstData([]);
      setContentDesc({ content: "" });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  // xóa đi 1 ảnh hoặc video
  const handRemoveMedia = (idx) => {
    const newData = [...lstData];
    newData.splice(idx, 1);

    setLstData(newData);
    onHide(false);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác gửi ${nameCommon}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setLstData([]);
        setShowDialog(false);
        setContentDialog(null);
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
            disabled: isSubmit,
            callback: () => {
              showDialogConfirmCancel();
            },
          },
          {
            title: "Gửi",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, nameCommon, lstData]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="wrapper__upload--media"
      >
        <form className="form__upload--media" onSubmit={(e) => handSubmitForm(e)}>
          <ModalHeader title={`Gửi ${lstData.length} ${nameCommon}`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className={`lst-media`}>
                {lstData &&
                  lstData.length > 0 &&
                  lstData.map((item, idx) => {
                    return (
                      <div key={idx} className="item">
                        <div className="action__change--item">
                          <span
                            className="icon-edit"
                            onClick={() => {
                              // onAddUpload(true);
                            }}
                          >
                            <Icon name="Pencil" />
                          </span>
                          <span className="icon-delete" onClick={() => handRemoveMedia(idx)}>
                            <Icon name="Trash" />
                          </span>
                        </div>
                        {/* {item.progress ? (
                          <span className="show-progress">{`${item.progress}%`}</span>
                        ) : item.type == "image" ? (
                          <img src={item.url} alt="Ảnh Upload" />
                        ) : (
                          <video controls>
                            <source src={item.url} />
                          </video>
                        )} */}
                        {item.type == "image" ? (
                          <img src={item.url} alt="Ảnh Upload" />
                        ) : (
                          <video controls>
                            <source src={item.url} />
                          </video>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="desc-media">
                <label>Mô tả</label>

                <div className="detail-content">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Nhập mô tả"
                    value={contentDesc.content}
                    autoFocus={true}
                    onKeyDown={handleOnKeyDown}
                    className="content-item"
                    onChange={handleTextareaChange}
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

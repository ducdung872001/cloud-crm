import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Tippy from "@tippyjs/react";
import { IActionModal } from "model/OtherModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import ImageExcel from "assets/images/img-excel.png";
import ImageWord from "assets/images/img-word.png";
import ImagePowerPoint from "assets/images/img-powerpoint.png";
import ImagePdf from "assets/images/img-pdf.png";
import { showToast } from "utils/common";
import WorkOrderService from "services/WorkOrderService";
import "./index.scss";
import CampaignOpportunityService from "services/CampaignOpportunityService";

interface ILstDataProps {
  type: string;
  url: string;
  fileSize: number;
  fileName: string;
}

interface IUploadDocumentProps {
  infoDocument: { type: string; url: string; fileSize: number; fileName: string };
  onShow: boolean;
  onHide: (reload: boolean) => void;
  progress?: number;
  id: number;
  employeeId: number;
  coyId: number;
  content?: string;
}

export default function UploadDocument(props: IUploadDocumentProps) {
  const { onShow, infoDocument, onHide, progress, id, employeeId, coyId, content } = props;

  const textareaRef = useRef(null);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isEditDocument, setIsEditDocument] = useState<boolean>(false);
  const [idxDocument, setIdxDocument] = useState<number>(null);

  const [contentDesc, setContentDesc] = useState({
    content: "",
  });

  useEffect(() => {
    if (content) {
      setContentDesc({ content: content });
    }
  }, [content]);

  const [lstData, setLstData] = useState<ILstDataProps[]>([]);

  useEffect(() => {
    if (infoDocument && !isEditDocument && !idxDocument) {
      setLstData([infoDocument]);
    }

    if (!infoDocument.url) {
      setLstData([]);
    }
  }, [infoDocument, isEditDocument]);

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

  const handSubmitForm = async (e) => {
    e && e.preventDefault();

    const lstMedia = lstData.map((item) => {
      return {
        type: item.type,
        url: item.url,
        fileName: item.fileName,
        fileSize: item.fileSize
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

  // thay đổi tài liệu
  useEffect(() => {
    if (isEditDocument && infoDocument) {
      const newData: any = [...lstData].map((item, index) => {
        if (index == idxDocument && infoDocument.url !== item.url) {
          return infoDocument;
        }
        return item;
      });

      setLstData(newData);
    }
  }, [idxDocument, isEditDocument, infoDocument]);

  // xóa đi tài liệu
  const handRemoveDocument = (idx) => {
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
      title: <Fragment>{`Hủy bỏ thao tác gửi tài liệu`}</Fragment>,
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
    [isSubmit, lstData, infoDocument]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="sm"
        toggle={() => !isSubmit && onHide(false)}
        className="wrapper__upload--document"
      >
        <form className="form__upload--document" onSubmit={(e) => handSubmitForm(e)}>
          <ModalHeader title={`Gửi tài liệu`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className={`lst-document`}>
                {!progress &&
                  lstData &&
                  lstData.length > 0 &&
                  lstData.map((item, idx) => {
                    return (
                      <div key={idx} className="item">
                        <div className="img-document">
                          <img
                            src={item.type == "pdf" ? ImagePdf : item.type == "xlsx" ? ImageExcel : item.type == "docx" ? ImageWord : ImagePowerPoint}
                            alt={item.fileName}
                          />
                        </div>
                        <div className="info-document">
                          <div className="el">
                            <h4 className="key">Tên file</h4>
                            <h4 className="value">{item.fileName}</h4>
                          </div>
                          <div className="el">
                            <h4 className="key">Kích thước</h4>
                            <h4 className="value">
                              {item.fileSize > 1048576 ? `${(item.fileSize / 1048576).toFixed(2)} MB` : `${(item.fileSize / 1024).toFixed(1)} KB`}
                            </h4>
                          </div>
                        </div>
                        <div className="action__change--item">
                          <Tippy content="Sửa" placement="left">
                            <span
                              className="icon-edit"
                              onClick={() => {
                                setIdxDocument(idx);
                                setIsEditDocument(true);
                                // onEditUpload(true);
                              }}
                            >
                              <Icon name="Pencil" />
                            </span>
                          </Tippy>
                          <Tippy content="Xóa" placement="right">
                            <span className="icon-delete" onClick={() => handRemoveDocument(idx)}>
                              <Icon name="Trash" />
                            </span>
                          </Tippy>
                        </div>
                      </div>
                    );
                  })}

                {progress > 0 && <div className="show-progress">{`${progress}%`}</div>}
              </div>
              <div className="desc-document">
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

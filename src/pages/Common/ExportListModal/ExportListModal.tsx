/* eslint-disable prefer-const */
import React, { useState, useEffect, useMemo, Fragment } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import AddFile from "./partials/AddFile";
import ExcelIcon from "assets/images/img-excel.png";
import ReportTemplateService from "services/ReportTemplateService";
import FileService from "services/FileService";
import { IReportTemplateFilterRequest, IReportTemplateRequest } from "model/reportTemplate/ReportTemplateRequestModel";

import "./ExportListModal.scss";

interface IExportListModalProps {
  onShow: boolean;
  code: string; // code chuyền xuống để lấy ra danh sách các file đã import
  exampleFile: string;
  onHide: (reload?: boolean) => void;
  chooseTemplate?: (template: string) => void;
}

export default function ExportListModal(props: IExportListModalProps) {
  const { onShow, onHide, code, exampleFile, chooseTemplate } = props;

  const [listFile, setListFile] = useState<IReportTemplateRequest[]>([]);
  const [detailFile, setDetailFile] = useState(null);
  const [addFile, setAddFile] = useState(null);
  const [isAddFile, setIsAddFile] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Lấy danh sách các mẫu file xuất báo cáo
   * @param code
   */
  const getListFile = async (code: string) => {
    setIsLoading(true);

    let data: IReportTemplateFilterRequest = {
      code,
    };

    let response = await ReportTemplateService.list(data);

    if (response.code === 0) {
      const result = response.result;
      // console.log("result list =>", result);

      setListFile(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && code) {
      getListFile(code);
    }
  }, [code, onShow]);

  const takeFileAdd = (data) => {
    if (data) {
      // console.log("data =>", data);
      setAddFile(data[0]);
    }
  };

  // xóa đi 1 file
  const handRemoveFile = async (id: number) => {
    // console.log(id);

    // bh có api thì call ở đây
    const response = await ReportTemplateService.delete(id);

    if (response.code === 0) {
      showToast("Xóa file thành công", "success");
      // sau khi xóa thành công thì call lại api list
      getListFile(code);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa file
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => handRemoveFile(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  //Thực sự upload 1 file
  const handAddNewFile = async (file) => {
    // console.log("file muốn thêms : ", file);
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  /**
   * Cập nhật lên report_template luôn
   * @param result
   */
  const processUploadSuccess = (result) => {
    // console.log("link =>", result);
    addTemplateReport({ id: 0, name: result.fileName, link: result.fileUrl, code });
  };

  const addTemplateReport = async (templateReport: IReportTemplateRequest) => {
    setIsSubmit(true);

    const response = await ReportTemplateService.update(templateReport);
    // console.log("response =>", response);

    if (response?.code == 0) {
      templateReport.id = response.result;

      listFile.push(templateReport);
      setListFile(listFile);
      showToast(`Tải mẫu báo cáo thành công`, "success");
      setIsAddFile(false);
      setAddFile(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  // trong trường hợp chọn luôn file
  const handSubmit = async () => {
    // nếu như không chọn file nào thì không làm gì cả
    if (!detailFile) return;

    // console.log("detailFile =>", detailFile);
    chooseTemplate(detailFile.link);

    //Gọi về để xuất báo cáo
    onHide(true);
    clearForm();
  };

  const clearForm = () => {
    onHide(false);
    setIsAddFile(false);
    setDetailFile(null);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác xuất báo cáo</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        clearForm();
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
              detailFile ? showDialogConfirmCancel() : clearForm();
            },
          },
          {
            title: isAddFile && !addFile ? "Quay lại" : addFile ? "Tiếp tục" : "Xác nhận",
            type: "submit",
            color: "primary",
            is_loading: isSubmit,
            disabled: isSubmit ? isSubmit : isAddFile ? !isAddFile && !addFile : !detailFile,
            callback: () => {
              isAddFile && !addFile ? setIsAddFile(false) : addFile ? handAddNewFile(addFile) : handSubmit();
            },
          },
        ],
      },
    }),
    [isSubmit, isAddFile, addFile, detailFile]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal__export-common"
      >
        <div className="form__export-common">
          <ModalHeader title="Chọn mẫu xuất báo cáo" toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="box__export-common">
              {!isAddFile && listFile.length > 0 ? (
                <div className="list__file--upload">
                  {listFile.map((item, idx) => {
                    const check = item.id == detailFile?.id;

                    return (
                      <div key={idx} className={`item-file ${check ? "active__item" : ""}`}>
                        <div className="img-file">
                          <Image src={ExcelIcon} alt={""} />
                        </div>
                        <div className="name-file">
                          <span>{item.name || `Mẫu ${idx + 1}`}</span>
                        </div>

                        {check && (
                          <div className="icon__choose--file">
                            <Icon name="CheckedCircle" />
                          </div>
                        )}

                        <div className={`view__action ${check ? "hide__action" : ""}`}>
                          <div
                            className="view__action--choose"
                            onClick={() => {
                              setDetailFile(item);
                              if (check) {
                                setDetailFile(null);
                                setAddFile(null);
                              }
                            }}
                          >
                            {check ? <Icon name="UnChoose" /> : <Icon name="Choose" />}
                            <span>{check ? "Bỏ mẫu" : "Dùng mẫu"}</span>
                          </div>

                          <div className="view__action--del" onClick={() => showDialogConfirmDelete(item)}>
                            <Icon name="Trash" />
                            <span>Xóa mẫu</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    className="item__add--file"
                    onClick={() => {
                      setIsAddFile(true);
                      setDetailFile(null);
                    }}
                  >
                    <div className="img-add">
                      <Icon name="Wallpaper" />
                    </div>

                    <span className="name">Thêm mẫu</span>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="__loading">
                  <Loading />
                </div>
              ) : (
                <div className="box__update--file">
                  {listFile.length == 0 && (
                    <div className="notify-message">Hiện tại bạn chưa có mẫu báo cáo nào. Hãy thêm mới mẫu ở phía dưới nhé !</div>
                  )}
                  <AddFile takeFileAdd={takeFileAdd} code={code} />
                </div>
              )}

              {exampleFile && (
                <div className="file__example">
                  <h4>
                    Tải về file mẫu:
                    <a href={exampleFile} download>
                      Excel file
                    </a>
                  </h4>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

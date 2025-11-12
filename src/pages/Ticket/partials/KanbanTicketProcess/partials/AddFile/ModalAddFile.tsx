import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IAddEmailModelProps } from "model/email/PropsModel";
import { IEmailRequest } from "model/email/EmailRequestModel";
// import EmailService from "services/EmailService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { convertToFileName, isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import CustomerService from "services/CustomerService";
import { serialize } from "utils/editor";
import "./ModalAddFile.scss";
import MarketingAutomationService from "services/MarketingAutomationService";
import RebornEditor from "components/editor/reborn";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Input from "components/input/input";
import _ from "lodash";
import RadioList from "components/radio/radioList";
import FileService from "services/FileService";
import { uploadDocumentFormData } from "utils/document";
import ImgExcel from "assets/images/img-excel.png";
import ImgWord from "assets/images/img-word.png";
import ImgPowerpoint from "assets/images/img-powerpoint.png";

import ImgRar from "assets/images/img-rar.png";
import ImgZip from "assets/images/img-zip.png";
import ImgFilePDF from "assets/images/img-pdf.png";
import ImgFileDoc from "assets/images/img-word.png";
import ImgFileExcel from "assets/images/img-excel.png";
import ImgFilePowerpoint from "assets/images/img-powerpoint.png";
import SelectCustom from "components/selectCustom/selectCustom";

export default function ModalAddFile(props: any) {
  const { onShow, onHide, dataNode, setDataNode, statusMA } = props;
  console.log("dataNode", dataNode);

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataCustomer, setDataCustomer] = useState<ICustomerResponse>(null);
  const [data, setData] = useState(null);
  const [dataCodeEmail, setDataCodeEmail] = useState<string>("");
  const [desContent, setDesContent] = useState<string>("");

  const [nodeName, setNodeName] = useState(null);
  const [nodePoint, setNodePoint] = useState(null);

  useEffect(() => {
    if (dataNode?.name) {
      setNodeName(dataNode.name);
    }
    if (dataNode?.point) {
      setNodePoint(dataNode.point);
    } else {
      setNodePoint(null);
    }
  }, [dataNode]);

  useEffect(() => {
    if (dataNode && onShow) {
      setData(dataNode.configData);
      if (dataNode.configData && dataNode.configData.files?.length > 0) {
        const dataAttactment = dataNode.configData.files.map((item) => {
          return {
            url: item.fileUrl,
            type: item.fileUrl.includes(".docx")
              ? "docx"
              : item.fileUrl.includes(".xlsx")
              ? "xlsx"
              : item.fileUrl.includes(".pdf")
              ? "pdf"
              : item.fileUrl.includes(".pptx")
              ? "pptx"
              : item.fileUrl.includes(".zip")
              ? "zip"
              : item.fileUrl.includes(".rar")
              ? "rar"
              : "image",
            fileName: item.fileName,
          };
        });

        setListAttactment(dataAttactment);
      }
    }
  }, [dataNode, onShow]);

  useEffect(() => {
    if (data && onShow) {
      setDesContent(data.content);
    }
  }, [data, onShow]);

  const values = useMemo(
    () =>
      ({
        files: data?.files || [],
      } as IEmailRequest),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const [listAttactment, setListAttactment] = useState([]);
  // console.log('listAttactment', listAttactment);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<number>(0);

  //! đoạn này xử lý hình ảnh
  const handleUploadDocument = (e) => {
    e.preventDefault();

    const file = e.target.files[0];

    const checkFile = file.type;
    setIsLoadingFile(true);
    if (checkFile.startsWith("image")) {
      handUploadFile(file);
    }

    if (checkFile.startsWith("application")) {
      uploadDocumentFormData(file, onSuccess, onError, onProgress);
    }
  };

  //* Xử lý tài liệu
  const onSuccess = (data) => {
    if (data) {
      const result = {
        url: data.fileUrl,
        type: data.extension,
        fileName: data.fileName,
      };

      setListAttactment([...listAttactment, result]);
      setIsLoadingFile(false);
    }
  };

  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent.toFixed(0));
    }
  };

  useEffect(() => {
    if (isLoadingFile === false) {
      setShowProgress(0);
    }
  }, [isLoadingFile]);

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess, onError: uploadError });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    const changeResult = {
      url: result,
      type: "image",
      fileName: data.fileName,
    };
    setListAttactment([...listAttactment, changeResult]);
    setIsLoadingFile(false);
  };

  const uploadError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const handleRemoveImageItem = (idx) => {
    const result = [...listAttactment];
    result.splice(idx, 1);
    setListAttactment(result);
  };

  const [newData, setNewData] = useState([]);

  useEffect(() => {
    if (onShow && listAttactment) {
      setNewData([]);
      (listAttactment || []).map((item) => {
        const request = new XMLHttpRequest();
        request.open("GET", item.url, true);
        request.responseType = "blob";
        request.onload = function () {
          const reader = new FileReader();
          reader.readAsDataURL(request.response);
          reader.onload = function (e: any) {
            const data = {
              fileName: `${convertToFileName(item?.fileName || "")}`,
              fileData: e.target.result.split(",")[1],
            };
            setNewData((oldArray) => [...oldArray, data]);
          };
        };

        request.send();
        // setNewData(newListAttactment);
      });
    }
  }, [onShow, listAttactment]);

  // Thực hiện gửi email
  const onSubmit = async () => {
    // e.preventDefault()
    const dataAttactment = (listAttactment || []).map((item) => {
      return {
        fileUrl: item.url,
        // fileName: `${convertToFileName(item?.fileName || '')}`,
        fileName: item?.fileName,
      };
    });

    setIsSubmit(true);

    const body: any = {
      ...dataNode,
      configData: { ...formData.values, content: desContent, files: dataAttactment },
      point: nodePoint,
    };

    console.log("body", body);
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
              !isDifferenceObj(formData.values, values) ? handleClose() : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
            // type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !nodeName ||
              statusMA === 1 ||
              (!isDifferenceObj(formData.values, values) && !desContent && !nodePoint) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,

            callback: () => {
              if (_.isEqual(nodeName, dataNode?.name)) {
                onSubmit();
              } else {
                onHide(true);
                setEditName(true);
                setNodePoint(null);
              }
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, desContent, nodePoint, nodeName, dataNode, statusMA, newData]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleClose();
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  const handleClose = () => {
    onHide(false);
    setEditName(true);
    setNodePoint(null);
    setDataCodeEmail("");
    setData(null);
    setTimeout(() => {
      setDesContent("");
    }, 1000);
    setListAttactment([]);
  };

  const [editName, setEditName] = useState(true);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClose()}
        className="modal-send-email"
        size="lg"
      >
        <form className="form-email">
          <ModalHeader title={"Tải lên hồ sơ pháp lý đính kèm"} toggle={() => !isSubmit && handleClose()} />
          <ModalBody>
            <div style={{ maxHeight: "48rem", overflow: "auto", padding: "1.6rem" }}>
              <div className="list-form-group">
                <div className="attachments">
                  {/* <label className="title-attachment">Tài liệu đính kèm</label> */}
                  <div className={listAttactment.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                    {listAttactment.length === 0 ? (
                      <label htmlFor="imageUpload" className="action-upload-image">
                        <div className={`wrapper-upload ${isLoadingFile ? "d-none" : ""}`}>
                          <Icon name="Upload" />
                          Tải tài liệu lên
                        </div>

                        <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                          <Icon name="Refresh" />
                          <span className="name-loading">Đang tải...{showProgress}%</span>
                        </div>
                      </label>
                    ) : (
                      <Fragment>
                        <div className="d-flex align-items-center">
                          {listAttactment.map((item, idx) => (
                            <div key={idx} className={item.type === "image" ? "image-item" : "file-item"}>
                              <img
                                src={
                                  // item.type == "xlsx" ? ImgExcel
                                  // : item.type === "docx" ? ImgWord
                                  // : item.type === "pptx" ? ImgPowerpoint
                                  // : item.url
                                  item.type === "docx"
                                    ? ImgFileDoc
                                    : item.type === "xlsx"
                                    ? ImgFileExcel
                                    : item.type === "pdf"
                                    ? ImgFilePDF
                                    : item.type === "pptx"
                                    ? ImgFilePowerpoint
                                    : item.type === "zip"
                                    ? ImgZip
                                    : item.type === "zip"
                                    ? ImgRar
                                    : item.url
                                }
                                alt="image-warranty"
                              />
                              {item.type !== "image" && (
                                <div style={{ marginLeft: "1rem", width: "85%" }}>
                                  <div className="file-name">{item?.fileName ? item?.fileName : `${convertToFileName(item?.fileName)}`}</div>
                                </div>
                              )}
                              <span className="icon-delete" onClick={() => handleRemoveImageItem(idx)}>
                                <Icon name="Trash" />
                              </span>
                            </div>
                          ))}

                          <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                            <Icon name="Refresh" />
                            <span className="name-loading">Đang tải...{showProgress}%</span>
                          </div>

                          <label htmlFor="imageUpload" className="add-image">
                            <Icon name="PlusCircleFill" />
                          </label>
                        </div>
                      </Fragment>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
                    className="d-none"
                    id="imageUpload"
                    onChange={(e) => handleUploadDocument(e)}
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

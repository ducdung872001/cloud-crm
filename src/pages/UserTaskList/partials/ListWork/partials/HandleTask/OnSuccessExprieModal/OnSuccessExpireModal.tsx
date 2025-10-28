import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { formatFileSize, showToast } from "utils/common";
import { convertToFileName, isDifferenceObj, trimContent } from "reborn-util";
import "./OnSuccessExpireModal.scss";
import TextArea from "components/textarea/textarea";
import FileService from "services/FileService";
import { uploadDocumentFormData } from "utils/document";
import Icon from "components/icon";
import ImgRar from "assets/images/img-rar.png";
import ImgZip from "assets/images/img-zip.png";
import ImgFilePDF from "assets/images/img-pdf.png";
import ImgFileDoc from "assets/images/img-word.png";
import ImgFileExcel from "assets/images/img-excel.png";
import ImgFilePowerpoint from "assets/images/img-powerpoint.png";
import WorkOrderService from "services/WorkOrderService";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import ReasonListBpmService from "services/ReasonListBpmService";

export default function OnSuccessExpireModal(props: any) {
  const { onShow, onHide, data, dataSchema } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [pauseReason, setPauseReason] = useState(null);
  const [listAttactment, setListAttactment] = useState([]);
  // console.log('listAttactment', listAttactment);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<number>(0);

  const values = useMemo(
    () =>
      ({
        potId: data?.potId ?? "",
        processId: data?.processId ?? "",
        nodeId: data?.nodeId ?? "",
        config: "",
        workOrderId: data?.id ?? 0,
        reason: "",
        attachment: [],
        day: "",
        hour: "",
        minute: "",
        pauseReasonId: "",
        isLate: 1,
      } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });
  // console.log('formData', formData);

  const validations: IValidation[] = [
    {
      name: "reason",
      rules: "required",
    },
  ];

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async () => {
    // e.preventDefault();

    // const errors = Validate(validations, formData, [...listFieldBasic]);
    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    const attachment = listAttactment.map((item) => {
      return {
        fileName: item.fileName,
        fileUrl: item.fileUrl,
        fileSize: item.fileSize,
      };
    });

    setIsSubmit(true);

    const body: any = {
      ...(formData.values as any),
      attachment: attachment,
      config: dataSchema ? JSON.stringify(dataSchema) : null,
    };
    console.log("body", body);

    const response = await WorkOrderService.updatePause(body);
    if (response.code === 0) {
      //   showToast(`Tạm dừng công việc thành công`, "success");
      handClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setListAttactment([]);
    setPauseReason(null);
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
              !isDifferenceObj(formData.values, values) ? handClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Hoàn thành",
            // type: "submit",
            color: "primary",
            disabled: isSubmit || !formData.values.pauseReasonId,
            //  || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, listAttactment]
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
        handClearForm(false);
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
        fileUrl: data.fileUrl,
        type: data.extension,
        fileName: data.fileName,
        fileSize: data.fileSize,
      };

      setListAttactment([result, ...listAttactment]);
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

  const [dragging, setDragging] = useState<boolean>(false);

  function handleDragStart(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const newFiles = [...listAttactment];
    const droppedFiles: any = Array.from(e.dataTransfer.files);
    console.log("droppedFiles", droppedFiles);

    droppedFiles.forEach((file) => {
      // const checkFile = file?.name.split("?")[0].split("#")[0].split(".").pop();
      // if (checkFile !== "xlsx") {
      //   showToast("File không đúng định dạng. Vui lòng kiểm tra lại !", "warning");
      //   return;
      // }

      const checkFile = file.type;

      if (!newFiles.find((f) => f.name === file.name)) {
        setIsLoadingFile(true);
        if (checkFile.startsWith("image")) {
          handUploadFile(file);
        }

        if (checkFile.startsWith("application")) {
          uploadDocumentFormData(file, onSuccess, onError, onProgress);
        }
      }
    });

    setListAttactment(newFiles);
  }

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess, onError: uploadError, onProgress });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    const changeResult = {
      fileUrl: result,
      type: "image",
      fileName: data.fileName,
      fileSize: data?.fileSize,
    };
    setListAttactment([changeResult, ...listAttactment]);
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
        var request = new XMLHttpRequest();
        request.open("GET", item.url, true);
        request.responseType = "blob";
        request.onload = function () {
          var reader = new FileReader();
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

  const loadedOptionPauseReason = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ReasonListBpmService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.reason,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-success-expire-modal"
        // size="lg"
      >
        <form
          className="form-success-expire-modal"
          // onSubmit={(e) => onSubmit(e)}
        >
          <ModalHeader
            title={`Công việc đã quá hạn`}
            toggle={() => {
              !isSubmit && handClearForm(false);
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              <div className="list-field-item list-field-basic">
                <div className="form-group">
                  <SelectCustom
                    id="pauseReasonId"
                    name="pauseReasonId"
                    label="Nguyên nhân quá hạn"
                    options={[]}
                    fill={true}
                    value={pauseReason}
                    required={true}
                    onChange={(e) => {
                      setPauseReason(e);
                      setFormData({ ...formData, values: { ...formData?.values, pauseReasonId: e.value } });
                    }}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn nguyên nhân"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionPauseReason}
                    // formatOptionLabel={formatOptionLabelEmployee}
                    // error={checkFieldEmployee}
                    // message="Nhân viên thực hiện tư vấn không được bỏ trống"
                  />
                </div>
                <div className="form-group">
                  <TextArea
                    name="note"
                    value={formData.values.reason}
                    label="Nhập lý do quá hạn"
                    fill={true}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData.values, reason: value } });
                    }}
                    placeholder="Nhập mô tả"
                  />
                </div>

                <div className="attachments">
                  <label className="title-attachment">Tài liệu đính kèm</label>
                  <div
                    className={"wrapper-list-image"}
                    draggable="true"
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                  >
                    {/* <div className={listAttactment.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}> */}
                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                      <label htmlFor="imageUpload" className="action-upload-image">
                        <div className={`wrapper-upload`}>
                          <div>
                            <Icon name="UploadRox" />
                          </div>
                          <div>Nhấn hoặc thả vào để tải lên</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {listAttactment && listAttactment.length > 0 ? (
                    <div style={{ marginTop: "1rem" }}>
                      <span style={{ fontSize: 12, fontWeight: "500", color: "#939394" }}>Đã tải lên</span>
                    </div>
                  ) : null}

                  <div className="list-attachment">
                    {isLoadingFile ? (
                      <div className="item-attachment">
                        <Icon name="FileXls" />
                        <div className="data-file">
                          <span style={{ fontSize: 14, fontWeight: "500" }}>Đang tải...</span>
                          <div className="container-loading">
                            <div className="item-loading" style={{ width: `${showProgress}%` }} />
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {listAttactment && listAttactment.length > 0
                      ? listAttactment.map((item, index) => (
                          <div
                            key={index}
                            className="item-attachment"
                            onClick={() => {
                              window.open(
                                `${process.env.APP_CRM_LINK}/crm/view_document?name=${item.fileName}&url=${item.fileUrl}`,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }}
                          >
                            {item?.type == "image" ? <img src={item?.fileUrl} width={36} height={36} /> : <Icon name="FileXls" />}
                            {/* <Icon name='FileXls'/> */}
                            <div className="data-file">
                              <span style={{ fontSize: 14, fontWeight: "500" }}>
                                {item?.fileName ? trimContent(item?.fileName, 50, true, true) : ``}
                                {item?.fileName?.length > 50 ? `.${item?.type}` : ""}
                              </span>
                              <div>
                                <span style={{ fontSize: 12, fontWeight: "400", color: "#999999" }}>
                                  {item?.fileSize ? formatFileSize(item?.fileSize) : ``}
                                </span>
                              </div>
                            </div>
                            <div
                              style={{ marginTop: "-1rem", cursor: "pointer" }}
                              onClick={() => {
                                handleRemoveImageItem(index);
                              }}
                            >
                              <Icon name="Times" style={{ width: "2rem", height: "2rem" }} />
                            </div>
                          </div>
                        ))
                      : null}
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

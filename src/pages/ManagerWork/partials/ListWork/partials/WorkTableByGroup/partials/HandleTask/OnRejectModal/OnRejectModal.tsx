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
import "./OnRejectModal.scss";
import WorkTimeService from "services/WorkTimeService";
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
import BusinessProcessService from "services/BusinessProcessService";
import EmployeeService from "services/EmployeeService";
import RadioList from "components/radio/radioList";

export default function OnRejectModal(props: any) {
  const { onShow, onHide, data, dataSchema, dataForm, checkReceived } = props;
  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataNode, setDataNode] = useState(null);
  const [dataEmployee, setDataEmployee] = useState(null);
  const [listAttactment, setListAttactment] = useState([]);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<number>(0);
  const [error, setError] = useState("error_info");

  const values = useMemo(
    () =>
      ({
        potId: data?.potId ?? "",
        processId: data?.processId ?? "",
        nodeId: data?.nodeId ?? "",
        returnEmployeeId: data?.returnEmployeeId ?? "",
        config: "",
        workId: data?.id,
        reason: "",
        fromNodeId: "",
        attachment: [],
      } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });
  const validations: IValidation[] = [
    {
      name: "reason",
      rules: "required",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Lý do từ chối",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [formData?.values]
  );

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

    const response = await WorkOrderService.updateReject(body);
    if (response.code === 0) {
      // showToast(`${checkReceived ? (checkIsApproval ? 'Yêu cầu điều chính' : 'Từ chối') : 'Từ chối'} thành công`, "success");
      showToast(
        `${checkReceived ? (dataForm?.type === 2 || dataForm?.type === 4 ? "Yêu cầu điều chính" : "Từ chối") : "Từ chối"} thành công`,
        "success"
      );

      handClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setListAttactment([]);
    setDataNode(null);
    setDataEmployee(null);
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
            title: "Xác nhận",
            // type: "submit",
            color: "primary",
            disabled: isSubmit || (dataSchema && dataForm?.type !== 4 ? !formData.values.fromNodeId : "") || !formData.values.reason,
            //  || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, listAttactment, dataSchema, dataForm]
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

    const checkFile = file?.type;
    setIsLoadingFile(true);
    if (checkFile?.startsWith("image")) {
      handUploadFile(file);
    }

    if (checkFile?.startsWith("application")) {
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

  const loadedOptionNode = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      potId: data?.potId,
      nodeId: data?.nodeId,
      processId: data?.processId,
    };

    const response = await BusinessProcessService.listNodeHistory(param);

    if (response.code === 0) {
      // let dataOption = data?.isScriptTask === 1 ? response.result : ((response.result && response.result.filter((el) => el.nodeId !== data?.nodeId)) || []); // isScriptTask === 1 là node linh động

      let dataOption = [];

      if (data?.isScriptTask === 1) {
        if (error === "error_info") {
          dataOption =
            data?.isScriptTask === 1 ? response.result : (response.result && response.result.filter((el) => el.nodeId !== data?.nodeId)) || []; // isScriptTask === 1 là node linh động
        } else {
          dataOption = (response.result && response.result.filter((el) => el.nodeId !== data?.nodeId && el.isScriptTask !== 1)) || [];
        }
      } else {
        dataOption = (response.result && response.result.filter((el) => el.nodeId !== data?.nodeId)) || [];
      }

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.nodeId,
                  label: item.name || item.nodeId,
                  isScriptTask: item.isScriptTask,
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

  const loadedOptionBpmParticipantSeq = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      nodeId: dataNode?.value,
      potId: data?.potId,
    };

    const response = await EmployeeService.listBpmParticipantSeq(param);

    if (response.code === 0) {
      const dataOption = response.result || [];

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.employeeId,
                  label: item.employeeName,
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

  useEffect(() => {
    if (dataNode) {
      loadedOptionBpmParticipantSeq("", undefined, { page: 1 });
    }
  }, [dataNode]);

  useEffect(() => {
    if (onShow) {
      loadedOptionNode("", undefined, { page: 1 });
    }
  }, [error, onShow]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-onreject-modal"
        // size="lg"
      >
        <form
          className="form-onreject-modal"
          // onSubmit={(e) => onSubmit(e)}
        >
          <ModalHeader
            title={checkReceived ? (dataForm?.type === 2 || dataForm?.type === 4 ? `Yêu cầu điều chỉnh` : "Từ chối tiếp nhận") : "Từ chối tiếp nhận"}
            toggle={() => {
              !isSubmit && handClearForm(false);
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              <div className="list-field-item list-field-basic">
                <div className="form-group">
                  <TextArea
                    name="note"
                    value={formData.values.reason}
                    label="Lý do"
                    fill={true}
                    required={true}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData.values, reason: value } });
                    }}
                    placeholder="Ghi chú"
                  />
                </div>

                {data?.isScriptTask === 1 ? (
                  <div className="form-group">
                    <RadioList
                      name=""
                      title=""
                      options={[
                        {
                          label: "Sai thông tin",
                          value: "error_info",
                        },
                        {
                          label: "Sai người duyệt",
                          value: "error_employee",
                        },
                      ]}
                      value={error}
                      onChange={(e) => {
                        setError(e.target.value);
                        setDataNode(null);
                        setDataEmployee(null);
                      }}
                    />
                  </div>
                ) : null}

                {dataForm?.type === 4 ? null : (
                  <div style={{ width: "100%" }}>
                    {dataSchema ? (
                      <div>
                        <div className="form-group">
                          <SelectCustom
                            key={error}
                            id="fromNodeId"
                            name="fromNodeId"
                            label="Quay về bước"
                            options={[]}
                            fill={true}
                            value={dataNode}
                            required={true}
                            onChange={(e) => {
                              setDataNode(e);
                              setFormData({ ...formData, values: { ...formData?.values, fromNodeId: e.value, returnEmployeeId: "" } });
                              setDataEmployee(null);
                            }}
                            isAsyncPaginate={true}
                            isFormatOptionLabel={true}
                            placeholder="Chọn bước"
                            additional={{
                              page: 1,
                            }}
                            loadOptionsPaginate={loadedOptionNode}
                            // formatOptionLabel={formatOptionLabelEmployee}
                            // error={checkFieldEmployee}
                            // message="Nhân viên thực hiện tư vấn không được bỏ trống"
                          />
                        </div>

                        {dataNode?.isScriptTask === 1 ? (
                          <div className="form-group">
                            <SelectCustom
                              key={dataNode?.value}
                              id="returnEmployeeId"
                              name="returnEmployeeId"
                              label="Quay về người xử lý"
                              options={[]}
                              fill={true}
                              value={dataEmployee}
                              required={true}
                              onChange={(e) => {
                                setDataEmployee(e);
                                setFormData({ ...formData, values: { ...formData?.values, returnEmployeeId: e.value } });
                              }}
                              isAsyncPaginate={true}
                              isFormatOptionLabel={true}
                              placeholder="Chọn người xử lý"
                              additional={{
                                page: 1,
                              }}
                              loadOptionsPaginate={loadedOptionBpmParticipantSeq}
                              // formatOptionLabel={formatOptionLabelEmployee}
                              // error={checkFieldEmployee}
                              // message="Nhân viên thực hiện tư vấn không được bỏ trống"
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )}

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
                    {/* {listAttactment.length === 0 ? (
                        <div style={{ width: '100%', display:'flex', justifyContent:'center'}}>
                            <label htmlFor="imageUpload" className="action-upload-image">
                                <div className={`wrapper-upload ${isLoadingFile ? "d-none" : ""}`}>
                                    <div>
                                        <Icon name="UploadRox" />
                                    </div>
                                    <div>
                                        Nhấn hoặc thả vào để tải lên
                                    </div>
                                </div>

                                <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                                    <Icon name="Refresh" />
                                    <span className="name-loading">Đang tải...{showProgress}%</span>
                                </div>
                            </label>
                        </div>
                    ) : (
                      <Fragment>
                        <div className="container-list-file">
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
                                alt="file"
                              />
                              {item.type !== "image" && (
                                <div style={{ marginLeft: "1rem", width: "85%" }}>
                                  <h5 style={{ fontSize: 14 }}>{item?.fileName ? item?.fileName : `${convertToFileName(item?.fileName)}`}</h5>
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
                    )} */}
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
                            onDoubleClick={() => {
                              window.open(
                                `${process.env.APP_LINK}/app/view_document?name=${item.fileName}&url=${item.fileUrl}`,
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
                                {item?.fileName.length > 50 ? `.${item?.type}` : ""}
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

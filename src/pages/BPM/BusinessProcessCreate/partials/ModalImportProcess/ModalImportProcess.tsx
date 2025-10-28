import Dialog, { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import RadioList from "components/radio/radioList";
import SelectCustom from "components/selectCustom/selectCustom";
import { IActionModal } from "model/OtherModel";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { getPageOffset, isDifferenceObj, trimContent } from "reborn-util";
import BusinessProcessService from "services/BusinessProcessService";
import { formatFileSize, showToast } from "utils/common";
import { uploadDocumentFormData } from "utils/document";
import "./ModalImportProcess.scss";

export default function ModalImportProcess(props: any) {
  const { onShow, onHide, processId } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [showDialogConfirm, setShowDialogConfirm] = useState<boolean>(false);
  const [contentDialogConfirm, setContentDialogConfirm] = useState<IContentDialog>(null);
  const [listAttactment, setListAttactment] = useState([]);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<number>(0);
  const [addFile, setAddFile] = useState<string>(""); 
  const [typeImport, setTypeImport] = useState('import_process');
  const [dataSubprocess, setDataSubprocess] = useState(null);

  const onSubmit = async () => {

    const dataImport = {
        file: addFile,
        processId: processId,
        nodeId: dataSubprocess?.value
    }
    // e.preventDefault();
    setIsSubmit(true);
    uploadDocumentFormData(dataImport, onSuccess, onError, onProgress, 'processData');
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setIsSubmit(false);
    setAddFile("");
    setListAttactment([]);
    setDataSubprocess(null);
    setTypeImport('import_process');
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            // disabled: isSubmit,
            callback: () => {
              addFile ? handClearForm(false) : showDialogConfirmCancel();
            },
          },

        //   {
        //     title: "Áp dụng",
        //     // type: "submit",
        //     color: "primary",
        //     disabled: listAttactment && listAttactment.length === 0,
        //     //     || !isDifferenceObj(formData.values, values)
        //     //     || (formData.errors && Object.keys(formData.errors).length > 0)
        //     //     || !formData.values.name,
        //     is_loading: isSubmit,
        //     callback: () => {
        //       onSubmit();
        //     },
        //   },
        ],
      },
    }),
    [isSubmit, addFile, listAttactment]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleUploadDocument = (e) => {
    e.preventDefault();

    const file = e.target.files[0];
    setAddFile(file);

    const checkFile = file.type;

    const dataImport = {
        file: file,
        processId: processId,
        nodeId: dataSubprocess?.value,
        subprocessId: dataSubprocess?.subprocessId
    }

    setIsLoadingFile(true);

    if (checkFile.startsWith("application")) {
        uploadDocumentFormData(dataImport, onSuccess, onError, onProgress, 'processData');
    }

    e.target.value = ""; // Reset the input value to allow re-uploading the same file
  };

  //* Xử lý tài liệu
  const onSuccess = (data) => {
    if (data) {
      
      showToast("Import dữ liệu quy trình thành công!", "success");
      handClearForm(true);

      setIsLoadingFile(false);
    }
  };

  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    setIsSubmit(false);
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
      setAddFile(file);
      const checkFile = file.type;

      if (!newFiles.find((f) => f.name === file.name)) {
        setIsLoadingFile(true);

        if (checkFile.startsWith("application")) {
            const dataImport = {
                file: file,
                processId: processId,
                nodeId: dataSubprocess?.value,
                subprocessId: dataSubprocess?.subprocessId
            }
            uploadDocumentFormData(dataImport, onSuccess, onError, onProgress, 'processData');
        }
      }
    });

    setListAttactment(newFiles);
  }

  const loadedOptionSubprocess = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      processId: processId,
      type:'bpmn:SubProcess'
    };

    const response = await BusinessProcessService.debugListNodeProcess(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.nodeId,
                  label: item.name,
                  subprocessId: item.childProcessId
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

  const handleChangeSubprocess = (e) => {
    setDataSubprocess(e);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-import-process"
        // size="sm"
      >
        <form
          className="form-import-process"
          // onSubmit={(e) => onSubmit(e)}
        >
          <ModalHeader
            title={`Nhập file excel`}
            toggle={() => {
              !isSubmit && handClearForm(false);
            }}
          />
          <ModalBody>
            <div className="list-form-group">
                <div className="list-field-item list-field-basic">
                    <div className="form-group">
                        <RadioList
                            name="type_import"
                            title=""
                            options={[
                                {
                                    value: 'import_process',
                                    label: 'Nhập dữ liệu cho quy trình'
                                },
                                {
                                    value: 'import_node',
                                    label: 'Nhập dữ liệu cho Subprocess'
                                },
                            ]}
                            value={typeImport}
                            onChange={(e) => {
                                setTypeImport(e.target.value);
                                setDataSubprocess(null);
                            }}
                        />
                    </div>
                    
                    {typeImport === "import_node" ? 
                        <div className="form-group">
                            <SelectCustom
                                id="processId"
                                name="processId"
                                label="Chọn Subprocess"
                                options={[]}
                                fill={true}
                                value={dataSubprocess}
                                onChange={(e) => handleChangeSubprocess(e)}
                                isAsyncPaginate={true}
                                isFormatOptionLabel={true}
                                placeholder="Chọn Subprocess"
                                additional={{
                                    page: 1,
                                }}
                                loadOptionsPaginate={loadedOptionSubprocess}
                            />
                        </div>
                    : null}

                  <div className="attachments">
                    {/* <label className="title-attachment">Tài liệu đính kèm</label> */}
                    {(listAttactment && listAttactment.length > 0) || isLoadingFile ? null : (
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
                    )}

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
                                  {item?.fileName?.length > 50 ? `.${item?.type}` : ""}
                                </span>
                                <div>
                                  <span style={{ fontSize: 12, fontWeight: "400", color: "#999999" }}>
                                    {item?.fileSize ? formatFileSize(item?.fileSize) : ``}
                                  </span>
                                </div>
                              </div>
                              
                            </div>
                          ))
                        : null}
                    </div>
                    <input type="file" accept=".xlsx,.xlsf" className="d-none" id="imageUpload" onChange={(e) => handleUploadDocument(e)} />
                  </div>
                </div>
             
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDialogConfirm} isOpen={showDialogConfirm} />
    </Fragment>
  );
}

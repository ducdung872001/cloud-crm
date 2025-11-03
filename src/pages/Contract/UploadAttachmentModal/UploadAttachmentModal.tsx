import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, getPageOffset, isDifferenceObj } from "reborn-util";
import "./UploadAttachmentModal.scss";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { SelectOptionData } from "utils/selectCommon";
import moment from "moment";
import { uploadDocumentFormData } from "utils/document";
import AddFile from "./partials/AddFile";
import ContractAttachmentService from "services/ContractAttachmentService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import SendEmailModal from "./SendEmailModal/SendEmailModal";

export default function UploadAttachmentModal(props: any) {
  const { onShow, onHide, data } = props;
  const focusedElement = useActiveElement();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataAttachment, setDataAttachment] = useState(null);

  const [isAddAttachment, setIsAddAttachment] = useState(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    if (data && onShow) {
      setParams((preState) => ({ ...preState, contractId: data?.contractId }));
    }
  }, [data, onShow]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "tài liệu",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [attachmentList, setAttachmentList] = useState([]);

  const abortController = new AbortController();

  const getListAttachment = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ContractAttachmentService.contractAttachmentList(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setAttachmentList(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow) {
      getListAttachment(params);
    }
  }, [params]);

  const titles = ["STT", "Tên tài liệu", "Loại tài liệu"];
  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [getPageOffset(params) + index + 1, item.name, item.attachmentName];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Tải xuống",
        icon: <Icon name="Download" />,
        callback: () => {
          let fieldName = convertToId(item.name) || "";
          fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

          const type = item.link.includes(".docx")
            ? "docx"
            : item.link.includes(".xlsx")
            ? "xlsx"
            : item.link.includes(".pdf") || item.link.includes(".PDF")
            ? "pdf"
            : item.link.includes(".pptx")
            ? "pptx"
            : item.link.includes(".zip")
            ? "zip"
            : "rar";
          const name = `${fieldName}.${type}`;

          handDownloadFileOrigin(item.link, name);
        },
      },
      {
        title: "Gửi Email",
        icon: <Icon name="SendEmail" />,
        callback: () => {
          setDataAttachment(item);
          setShowModalSendEmail(item);
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataAttachment(item);
          setIsAddAttachment(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
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
          Bạn có chắc chắn muốn xóa tài liệu đã chọn
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: async () => {
        const response = await ContractAttachmentService.contractAttachmentDelete(item.id);
        if (response.code === 0) {
          showToast("Xóa tài liệu thành công", "success");
          getListAttachment(params);
        } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
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
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
          //   {
          //     title:  "Xác nhận",
          //     // type: "submit",
          //     color: "primary",
          //     disabled: lstAttributeSelected?.length > 0 ? false : true,
          //     // is_loading: isSubmit,
          //     callback: () => {
          //       handleSubmit(lstAttributeSelected)
          //     },
          //   },
        ],
      },
    }),
    []
  );

  ////Thêm tài liệu

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);

  const [isLoadingAttactment, setIsLoadingAttachment] = useState(false);
  const [listAttachment, setListAttachment] = useState([]);

  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [infoFile, setInfoFile] = useState(null);
  const [showProgress, setShowProgress] = useState(0);

  const [linkAttachment, setLinkAttachment] = useState(null);

  useEffect(() => {
    if (dataAttachment) {
      setInfoFile({
        fileUrl: dataAttachment.link,
        extension: dataAttachment.link.includes(".docx")
          ? "docx"
          : dataAttachment.link.includes(".xlsx")
          ? "xlsx"
          : dataAttachment.link.includes(".pdf")
          ? "pdf"
          : dataAttachment.link.includes(".pptx")
          ? "pptx"
          : dataAttachment.link.includes(".zip")
          ? "zip"
          : "rar",
      });
    }
  }, [dataAttachment, onShow]);

  const values = useMemo(
    () =>
      ({
        id: dataAttachment?.id ?? 0,
        link: dataAttachment?.link ?? "",
        name: dataAttachment?.name ?? "",
        note: dataAttachment?.note ?? "",
        pipelineId: dataAttachment?.pipelineId || data?.pipelineId || 0,
        approachId: dataAttachment?.approachId || data?.approachId || 0,
        attachmentId: dataAttachment?.attachmentId ?? 0,
        contractId: dataAttachment?.contractId || data?.contractId || 0,
      } as any),
    [data, onShow, dataAttachment]
  );

  const onSelectOpenAttactment = async () => {
    if (!listAttachment || listAttachment.length === 0) {
      setIsLoadingAttachment(true);

      const dataOption = await SelectOptionData("attachmentId");

      if (dataOption) {
        setListAttachment([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingAttachment(false);
    }
  };

  useEffect(() => {
    if (dataAttachment?.attachmentId) {
      onSelectOpenAttactment();
    }

    if (dataAttachment?.attachmentId == null) {
      setListAttachment([]);
    }
  }, [dataAttachment]);

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Loại tài liệu",
          name: "attachmentId",
          type: "select",
          fill: true,
          options: listAttachment,
          onMenuOpen: onSelectOpenAttactment,
          isLoading: isLoadingAttactment,
          required: true,
        },
        {
          label: "Tên tài liệu",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mô tả",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [formData?.values, listAttachment, isLoadingAttactment]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if (infoFile) {
      setFormData({ ...formData, values: { ...formData?.values, link: infoFile.fileUrl } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, link: "" } });
    }
  }, [infoFile]);

  const takeFileAdd = (data) => {
    if (data) {
      setIsLoadingFile(true);
      uploadDocumentFormData(data, onSuccess, onError, onProgress);
    }
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent.toFixed(0));
      // if (percent = 100) {
      //   setShowProgress(0);
      // }
    }
  };

  //* Đoạn này nhận link file đã chọn
  const onSuccess = (data) => {
    if (data) {
      setIsLoadingFile(false);
      setInfoFile(data);
      //   handUploadProduct(data);
    }
  };

  useEffect(() => {
    if (isLoadingFile === false) {
      setShowProgress(0);
    }
  }, [isLoadingFile]);

  //* Đoạn này nếu như mà lỗi không tải lên được thì bắn ra thông báo
  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const onSubmit = async () => {
    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(formData.values as any),
      // ...(data ? { id: data.id } : {}),
    };

    const response = await ContractAttachmentService.contractAttachmentUpdate(body);

    if (response.code === 0) {
      showToast(`Thêm tài liệu thành công`, "success");
      setIsSubmit(false);
      setIsAddAttachment(false);
      setListAttachment([]);
      getListAttachment(params);
      setDataAttachment(null);
      setFormData({ ...formData, values: values, errors: {} });
      setTimeout(() => {
        setInfoFile(null);
      }, 500);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setInfoFile(null);
    setListAttachment([]);
  };

  const actionsAdd = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Quay lại",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? cancelAdd() : showDialogConfirmCancel();
            },
          },
          {
            title: dataAttachment ? "Cập nhật" : "Thêm mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, dataAttachment]
  );

  const cancelAdd = () => {
    setIsAddAttachment(false);
    setListAttachment([]);
    setDataAttachment(null);
    setFormData({ ...formData, values: values, errors: {} });
    setTimeout(() => {
      setInfoFile(null);
    }, 500);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataAttachment ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        cancelAdd();
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
    };
    setContentDialogAdd(contentDialog);
    setShowDialogAdd(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialogAdd) {
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

  const [showModalSendEmail, setShowModalSendEmail] = useState(false);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          if (!isSubmit) {
            cancelAdd();
            onHide();
          }
        }}
        className="modal-upload-attachment-contract"
      >
        <div className="container-upload-attachment">
          <ModalHeader
            title={isAddAttachment ? `${dataAttachment ? "Chỉnh sửa tài liệu" : "Thêm mới tài liệu"}` : `Danh sách tài liệu`}
            toggle={() => {
              if (!isSubmit) {
                cancelAdd();
                onHide();
              }
            }}
          />
          <ModalBody>
            <div style={{ maxHeight: "48rem", overflow: "auto" }}>
              {isAddAttachment ? null : (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, marginBottom: 10, marginRight: 10 }}>
                  <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick={() => {
                      setIsAddAttachment(true);
                    }}
                  >
                    Thêm tài liệu
                  </Button>
                </div>
              )}

              {!isAddAttachment ? (
                <div>
                  {!isLoading && attachmentList && attachmentList.length > 0 ? (
                    <BoxTable
                      name="Danh sách tài liệu"
                      titles={titles}
                      items={attachmentList}
                      isPagination={true}
                      dataPagination={pagination}
                      dataMappingArray={(item, index) => dataMappingArray(item, index)}
                      dataFormat={dataFormat}
                      // listIdChecked={listIdChecked}
                      isBulkAction={true}
                      // bulkActionItems={bulkActionList}
                      striped={true}
                      // setListIdChecked={(listId) => setListIdChecked(listId)}
                      actions={actionsTable}
                      actionType="inline"
                    />
                  ) : isLoading ? (
                    <Loading />
                  ) : (
                    <SystemNotification description={<span>Hiện tại chưa có tài liệu nào.</span>} type="no-item" />
                  )}
                </div>
              ) : (
                <div className="box-upload-attachment">
                  <div className="list-form-group">
                    {listFieldBasic.map(
                      (field, index) =>
                        field.label === "Loại tài liệu" && (
                          <FieldCustomize
                            key={index}
                            field={field}
                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                            formData={formData}
                          />
                        )
                    )}
                  </div>

                  <div className="box__update--attachment">
                    {/* {isLoadingFile ? ( */}
                    <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                      <Icon name="Refresh" />
                      <span className="name-loading">Đang tải...{showProgress}%</span>
                    </div>
                    {/* ) : ( */}
                    <div className={isLoadingFile ? "d-none" : ""}>
                      <AddFile
                        takeFileAdd={takeFileAdd}
                        infoFile={infoFile}
                        setInfoFile={setInfoFile}
                        setIsLoadingFile={setIsLoadingFile}
                        dataAttachment={dataAttachment}
                      />
                    </div>
                    {/* )} */}
                  </div>

                  <div className="list-form-group">
                    {listFieldBasic.map(
                      (field, index) =>
                        field.label !== "Loại tài liệu" && (
                          <FieldCustomize
                            key={index}
                            field={field}
                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                            formData={formData}
                          />
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={isAddAttachment ? actionsAdd : actions} />
        </div>
      </Modal>
      <Dialog content={isAddAttachment ? contentDialogAdd : contentDialog} isOpen={isAddAttachment ? showDialogAdd : showDialog} />
      <SendEmailModal
        onShow={showModalSendEmail}
        dataAttachment={dataAttachment}
        customerIdlist={data?.id ? [data?.id] : []}
        onHide={(reload) => {
          // onReload(true)
          // if (reload) {
          //     onReload(true)
          // } else {
          //     // handleUpdateStatusFail(dataWork);
          // }
          setShowModalSendEmail(false);
        }}
      />
    </Fragment>
  );
}

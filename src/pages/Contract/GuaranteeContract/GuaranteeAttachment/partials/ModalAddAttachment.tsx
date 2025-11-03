import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./ModalAddAttachment.scss";
import Icon from "components/icon";
import { SelectOptionData } from "utils/selectCommon";
import { uploadDocumentFormData } from "utils/document";
import AddFile from "./partials/AddFile";
import GuaranteeAttachmentService from "services/GuaranteeAttachmentService";

export default function ModalAddAttachment(props: any) {
  const { onShow, onHide, data, guaranteeId } = props;
  
  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isLoadingAttactment, setIsLoadingAttachment] = useState(false);
  const [listAttachment, setListAttachment] = useState([]);

  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [infoFile, setInfoFile] = useState(null);
  const [showProgress, setShowProgress] = useState(0);

  useEffect(() => {
    if (data) {
      setInfoFile({
        fileUrl: data.link,
        extension: data.link.includes('.docx') ? 'docx'
                    : data.link.includes('.xlsx') ? 'xlsx'
                    : (data.link.includes('.pdf') || data.link.includes('.PDF')) ? 'pdf'
                    : data.link.includes('.pptx') ? 'pptx'
                    : data.link.includes('.zip') ? 'zip'
                    : 'rar'
      });
    }
  }, [data, onShow]);

  const values = useMemo(
    () =>
    ({
      id: data?.id ?? 0,
      link: data?.link ?? "",
      name: data?.name ?? "",
      note: data?.note ?? "",
      attachmentId: data?.attachmentId ?? 0,
      guaranteeId: guaranteeId

    } as any),
    [data, guaranteeId]
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
    if (data?.attachmentId) {
      onSelectOpenAttactment();
    }

    if (data?.attachmentId == null) {
      setListAttachment([]);
    }
  }, [data]);

    const validations: IValidation[] = [
        {
        name: "name",
        rules: "required",
        },
    ]

  const [formData, setFormData] = useState<IFormData>({ values: values });    

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

  // useEffect(() => {
  //   if (infoFile) {
  //       setFormData({ ...formData, values: { ...formData?.values, link: infoFile.fileUrl } })
  //   } else {
  //       setFormData({ ...formData, values: { ...formData?.values, link: '' } })
  //   }
  // }, [infoFile]);

  const takeFileAdd = (data) => {
    if (data) {        
        setIsLoadingFile(true)
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
    setIsLoadingFile(false)
    if (data) {
      setInfoFile(data);
      setIsLoadingFile(false);
      //   handUploadProduct(data);
    }
  };

  useEffect(() => {
    if(isLoadingFile === false){
      setShowProgress(0);
    }
  }, [isLoadingFile])

  //* Đoạn này nếu như mà lỗi không tải lên được thì bắn ra thông báo
  const onError = (message) => {
    setIsLoadingFile(false)
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body = {
        ...(formData.values as any),
        ...(infoFile ? { link: infoFile.fileUrl } : {}),
    };

    const response = await GuaranteeAttachmentService.guaranteeAttachmentUpdate(body);

    if (response.code === 0) {
        showToast(`Thêm tài liệu thành công`, "success");
        setIsSubmit(false);
        onHide(true);
        setInfoFile(null);
        setFormData({ values: values, errors: {} });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Huỷ",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handleClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
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
        handleClearForm();
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClearForm = () => {
    onHide(false);
    setInfoFile(null);
    setFormData({ values: values, errors: {} });
  }

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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-add-guarantee-attachment"
      >
        <form className="form-attachment-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} tài liệu`}
            toggle={() => {
              !isSubmit && handleClearForm();
            }}
          />
          <ModalBody>
            <div className="box-upload-attachment">
                <div className="list-form-group">
                    {listFieldBasic.map((field, index) => (
                        field.label === 'Loại tài liệu' &&
                        <FieldCustomize
                            key={index}
                            field={field}
                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                            formData={formData}
                        />
                    ))}
                </div>

                <div className="box__update--attachment">
                    {/* {isLoadingFile ? ( */}
                      <div className={`is__loading--file ${isLoadingFile ? '' : 'd-none'}`}>
                          <Icon name="Refresh" />
                          <span className="name-loading">Đang tải...{showProgress}%</span>
                      </div>
                      {/* ) : ( */}
                      <div className={isLoadingFile ? 'd-none' : ''}>
                        <AddFile
                            takeFileAdd={takeFileAdd}
                            infoFile={infoFile}
                            setInfoFile={setInfoFile}
                            setIsLoadingFile={setIsLoadingFile}
                            dataAttachment={data}
                        />
                      </div>
                    {/* )} */}
                </div>

                <div className="list-form-group">
                    {listFieldBasic.map((field, index) => (
                        field.label !== 'Loại tài liệu' &&
                        <FieldCustomize
                            key={index}
                            field={field}
                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                            formData={formData}
                        />
                    ))}
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

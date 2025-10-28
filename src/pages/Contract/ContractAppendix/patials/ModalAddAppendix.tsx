import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddContractPipelineModalProps } from "model/contractPipeline/PropsModel";
import { IContractPipelineRequest } from "model/contractPipeline/ContractPipelineRequestModel";
import ContractPipelineService from "services/ContractPipelineService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./ModalAddAppendix.scss";
import Icon from "components/icon";
import ContractService from "services/ContractService";
import AddFile from "./AddFile";
import { uploadDocumentFormData } from "utils/document";
import { name } from "@azure/msal-browser/dist/packageMetadata";

export default function ModalAddAppendix(props: any) {
  const { onShow, onHide, data, contractId } = props;

  const focusedElement = useActiveElement();

  const [isSubmitAppendix, setIsSubmitAppendix] = useState(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [infoFile, setInfoFile] = useState(null);
  const [showProgress, setShowProgress] = useState(0);

  const valueAppendix = useMemo(
    () =>
      ({
        id: data?.id ?? 0,
        name: data?.name ?? "",
        appendixNo: data?.appendixNo ?? "",
        affectedDate: data?.affectedDate ?? "",
        content: data?.content ?? "",
        changeRequest: data?.changeRequest ?? "price",
        attachments: data?.attachments ? JSON.parse(data.attachments)[0] : "",
        contractId: contractId,
        otherChangeRequest: data?.otherChangeRequest ?? "",
      } as any),
    [data, contractId]
  );

  const [dataAttachment, setDataAttachment] = useState(null);

  useEffect(() => {
    if (data?.attachments) {
      setInfoFile({
        fileUrl: data?.attachments ? JSON.parse(data.attachments)[0] : "",
        extension: data.attachments.includes(".docx")
          ? "docx"
          : data.attachments.includes(".xlsx")
          ? "xlsx"
          : data.attachments.includes(".pdf") || data.attachments.includes(".PDF")
          ? "pdf"
          : data.attachments.includes(".pptx")
          ? "pptx"
          : data.attachments.includes(".zip")
          ? "zip"
          : "rar",
      });
    }
    setDataAttachment({
      // id: data?.id ?? 0,
      link: data?.attachments ? JSON.parse(data.attachments)[0] : "",
      name: "Tài liệu đính kèm",
      // note: data?.note ?? "",
      // attachmentId: data?.attachmentId ?? 0,
      // contractId: contractId
    });
  }, [data, onShow]);

  const validationsAppendx: IValidation[] = [
    {
      name: "appendixNo",
      rules: "required",
    },
  ];

  const [formDataAppendix, setFormDataAppendix] = useState<IFormData>({ values: valueAppendix });

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
    setIsLoadingFile(false);
    if (data) {
      setIsLoadingFile(false);
      setInfoFile(data);
      setDataAttachment({
        ...dataAttachment,
        name: data.fileName,
        link: data.fileUrl,
      });
      //   handUploadProduct(data);
    }
  };

  useEffect(() => {
    if (infoFile) {
      setFormDataAppendix({ ...formDataAppendix, values: { ...formDataAppendix.values, attachments: infoFile?.fileUrl ? infoFile?.fileUrl : "" } });
    }
  }, [infoFile]);

  //* Đoạn này nếu như mà lỗi không tải lên được thì bắn ra thông báo
  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  useEffect(() => {
    if (isLoadingFile === false) {
      setShowProgress(0);
    }
  }, [isLoadingFile]);

  useEffect(() => {
    setFormDataAppendix({ ...formDataAppendix, values: { ...formDataAppendix.values, otherChangeRequest: "" } });
  }, [formDataAppendix.values.changeRequest]);

  const listFieldAppendix = useMemo(
    () =>
      [
        {
          label: "Tên phụ lục",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Số phụ lục",
          name: "appendixNo",
          type: "text",
          fill: true,
          required: true,
        },

        {
          label: "Ngày hiệu lực",
          name: "affectedDate",
          type: "date",
          fill: true,
          required: true,
          // isMaxDate: true,
          placeholder: "Chọn ngày hiệu lực",
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
        },

        {
          label: "Loại thay đổi",
          name: "changeRequest",
          type: "radio",
          options: [
            {
              value: "price",
              label: "Phụ lục thay đổi giá",
            },
            {
              value: "extend",
              label: "Phụ lục gia hạn hợp đồng",
            },
            {
              value: "other",
              label: "Phụ lục thay đổi thông tin điều khoản",
            },
            {
              value: "otherChangeRequest",
              label: "Khác",
            },
          ],
          fill: true,
        },

        ...(formDataAppendix.values.changeRequest === "otherChangeRequest"
          ? [
              {
                label: "",
                name: "otherChangeRequest",
                type: "textarea",
                placeholder: "Nhập loại thay đổi",
                fill: true,
              },
            ]
          : []),

        {
          label: "Nội dung thay đổi",
          name: "content",
          type: "textarea",
          fill: true,
        },
        {
          name: "attachments",
          type: "custom",
          snippet: (
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
          ),
        },
      ] as IFieldCustomize[],
    [formDataAppendix?.values, infoFile, dataAttachment, isLoadingFile, showProgress]
  );

  useEffect(() => {
    setFormDataAppendix({ ...formDataAppendix, values: valueAppendix, errors: {} });
    setIsSubmitAppendix(false);

    return () => {
      setIsSubmitAppendix(false);
    };
  }, [valueAppendix]);

  const onSubmitAppendix = async (e) => {
    e.preventDefault();

    const errors = Validate(validationsAppendx, formDataAppendix, [...listFieldAppendix]);
    if (Object.keys(errors).length > 0) {
      setFormDataAppendix((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmitAppendix(true);

    const body = {
      ...(formDataAppendix.values as any),
      // ...(data ? { id: data.id } : {}),
      attachments: JSON.stringify([formDataAppendix?.values?.attachments || ""]),
    };

    const response = await ContractService.contractAppendixUpdate(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm"} phụ lục hợp đồng thành công`, "success");
      setIsSubmitAppendix(false);
      onHide(true);
      setFormDataAppendix({ values: valueAppendix, errors: {} });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmitAppendix(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmitAppendix,
            callback: () => {
              !isDifferenceObj(formDataAppendix.values, valueAppendix) ? handleClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmitAppendix,
            // !isDifferenceObj(formDataAppendix.values, valueAppendix) ||
            // (formDataAppendix.errors && Object.keys(formDataAppendix.errors).length > 0),
            is_loading: isSubmitAppendix,
          },
        ],
      },
    }),
    [formDataAppendix, valueAppendix, isSubmitAppendix]
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
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClearForm = () => {
    onHide(false);
    setFormDataAppendix({ values: valueAppendix, errors: {} });
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formDataAppendix.values, valueAppendix)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formDataAppendix]
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
        toggle={() => !isSubmitAppendix && handleClearForm()}
        className="modal-add-appendix"
      >
        <form className="form-contrac-appendix-group" onSubmit={(e) => onSubmitAppendix(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} phụ lục hợp đồng`}
            toggle={() => {
              !isSubmitAppendix && handleClearForm();
            }}
          />
          <ModalBody>
            <div className="list-form-group-appendix">
              {listFieldAppendix.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) =>
                    handleChangeValidate(value, field, formDataAppendix, validationsAppendx, listFieldAppendix, setFormDataAppendix)
                  }
                  formData={formDataAppendix}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

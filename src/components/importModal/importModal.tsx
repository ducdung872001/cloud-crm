import React, { useState, useEffect, useMemo, Fragment } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import { uploadDocumentFormData } from "utils/document";
import AddFile from "./partials/AddFile";
import "./importModal.scss";

interface IImportModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  code?: string;
  name: string;
  type: "customer" | "contract" | "contact_profile";
}

export default function ImportModal(props: IImportModalProps) {
  const { onShow, onHide, name, code, type } = props;

  const [addFile, setAddFile] = useState<string>("");
  const [resFile, setResFile] = useState(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<number>(0);

  const [exampleFile] = useState<string>(() => {
    if (type === "customer") {
      return "https://cdn.reborn.vn/2023/11/19/eb5c60dc-3036-4582-837c-347ee02b6a43-1700396923.xlsx";
    } else if (type === "contract") {
      return "https://cdn.reborn.vn/2023/11/19/d566c184-e664-4b98-abb6-7f6d3e8e83a3-1700397288.xlsx";
    } else {
      return "https://cdn.reborn.vn/2023/11/19/a10c5cd1-7b70-47d6-9c8f-f197dc6f88b9-1700397202.xlsx";
    }
  });

  const takeFileAdd = (data) => {
    if (data) {
      setAddFile(data);
    } else {
      setAddFile("");
    }
  };

  const handConfirmUploadFile = (data) => {
    if (!data) return;
    uploadDocumentFormData(data, onSuccess, onError, onProgress, type);
  };

  //* Xử lý tài liệu
  const onSuccess = (data) => {
    if (data) {
      setIsSubmit(true);

      setResFile({
        total: data.total,
        message: data.message,
        name: data.name,
        num_exited: data.num_exited,
        num_invalid: data.num_invalid,
        num_wrong_parser: data.num_wrong_parser,
      });

      setTimeout(() => {
        onHide(true);
        clearForm();
      }, 500);

      // showToast(
      //   `Tổng ${data.total} bản ghi hợp lệ, ${data.num_invalid} bản ghi không hợp lệ, ${data.num_exited} bản ghi đã tồn tại, ${data.num_wrong_parser} bản ghi không chuyển đổi được`,
      //   "success"
      // );
      showToast("Import file thành công", "success");
    }
  };

  const onError = (message) => {
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent);
      if (percent >= 99) {
        setShowProgress(0);
      }
    }
  };

  const clearForm = () => {
    setResFile(null);
    setAddFile("");
    setIsSubmit(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              onHide(false);
              clearForm();
            },
          },
          {
            title: "Xác nhận",
            disabled: isSubmit || !addFile,
            is_loading: isSubmit,
            callback: () => handConfirmUploadFile(addFile),
          },
        ],
      },
    }),
    [isSubmit, addFile]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal__import--common"
      >
        <div className="wrapper__import--common">
          <ModalHeader title={name} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="box__import">
              <div className="box__update--file">
                {!addFile && <div className="notify-message">Hiện tại bạn chưa có mẫu báo cáo nào. Hãy tải file mẫu ở phía dưới nhé !</div>}
                <AddFile takeFileAdd={takeFileAdd} code={code} />
              </div>

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
    </Fragment>
  );
}

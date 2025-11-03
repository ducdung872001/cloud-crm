import React, { useEffect, useState } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import RadioList from "components/radio/radioList";
import "./exportModal.scss";

export interface ExportModalProps {
  type?: "one_option" | "two_option";
  name: string;
  onShow: boolean;
  onHide: () => void;
  options: IOption[];
  callback: (type: string, extension: string) => void;
}
export default function ExportModal(props: ExportModalProps) {
  const { name, onShow, onHide, options, callback, type = "one_option" } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [typeExport, setTypeExport] = useState<string | number>(options[0].value);
  const [extensionFile, setExtensionFile] = useState<string>("excel");

  useEffect(() => {
    if (onShow) {
      setTypeExport(options[0].value);
      setIsSubmit(false);
      setExtensionFile("excel");
    }
  }, [onShow]);

  const onSubmit = async (e) => {
    e.preventDefault();
  };

  const actions: IActionModal = {
    actions_right: {
      buttons: [
        {
          title: "Hủy",
          color: "primary",
          variant: "outline",
          disabled: isSubmit,
          callback: () => onHide(),
        },
        {
          title: "Xuất file",
          type: "submit",
          color: "primary",
          disabled: isSubmit,
          is_loading: isSubmit,
          callback: () => {
            setIsSubmit(true);
            callback(typeExport as string, extensionFile);
          },
        },
      ],
    },
  };

  const optionsExtension: IOption[] =
    type === "one_option"
      ? [
          {
            value: "excel",
            label: "Excel",
          },
        ]
      : [
          {
            value: "excel",
            label: "Excel",
          },
          {
            value: "pdf",
            label: "PDF",
          },
        ];

  return (
    <Modal isOpen={onShow} className="modal-export" isFade={true} staticBackdrop={true} toggle={() => !isSubmit && onHide()} isCentered={true}>
      <form className="form-export" onSubmit={(e) => onSubmit(e)}>
        <ModalHeader title={`Xuất danh sách ${name}`} toggle={() => !isSubmit && onHide()} />
        <ModalBody>
          <RadioList
            options={optionsExtension}
            className="options-extension"
            title="Chọn định dạng file"
            name="type"
            value={extensionFile ?? ""}
            onChange={(e) => !isSubmit && setExtensionFile(e.target.value)}
          />
          <RadioList
            options={options}
            title="Chọn kiểu xuất file"
            name="export"
            value={typeExport ?? ""}
            onChange={(e) => !isSubmit && setTypeExport(e.target.value)}
          />
        </ModalBody>
        <ModalFooter actions={actions} />
      </form>
    </Modal>
  );
}

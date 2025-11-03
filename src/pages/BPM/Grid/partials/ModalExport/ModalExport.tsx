import React, { useEffect, useState } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import RadioList from "components/radio/radioList";
import "./ModalExport.scss";
import Input from "components/input/input";
import * as XLSX from "xlsx";
import { convertToFileName } from "reborn-util";
import { saveAs } from "file-saver";
import { IColumnGrid } from "../..";

export interface ExportModalProps {
  type?: "one_option" | "two_option";
  name: string;
  onShow: boolean;
  onHide: () => void;
  options: IOption[];
  listColumn: IColumnGrid[];
  listData: any[];
  callback: (type: string, extension: string) => void;
}
export default function ModalExport(props: ExportModalProps) {
  const { name, onShow, onHide, options, callback, type = "one_option", listColumn, listData } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [typeExport, setTypeExport] = useState<string | number>(options[0].value);
  const [extensionFile, setExtensionFile] = useState<string>("excel");
  const [email, setEmail] = useState(null);

  // Hàm tạo file xlsx và cho phép tải xuống
  const createAndDownloadExcel = async () => {
    // Dữ liệu mẫu
    // const data = [
    //   { "Tên khách hàng": "Nguyễn Văn A", Tuổi: 30, "Địa chỉ": "Hà Nội" },
    //   { "Tên khách hàng": "Trần Thị B", Tuổi: 25, "Địa chỉ": "TP. Hồ Chí Minh" },
    //   { "Tên khách hàng": "Lê Văn C", Tuổi: 28, "Địa chỉ": "Đà Nẵng" },
    // ];
    const data = listData.map((item) => {
      let obj = {};
      listColumn.map((column) => {
        if (column.type == "select" || column.type == "lookup" || column.type == "binding") {
          if (column.key.includes("NguoiLienHe_")) {
            obj[column.name] = item.options.find((option) => option.value == item[column.key])?.label;
          } else {
            obj[column.name] = column.options.find((option) => option.value == item[column.key])?.label;
          }
        } else {
          obj[column.name] = item[column.key];
        }
      });
      return obj;
    });

    // Tạo workbook và worksheet
    const ws = XLSX.utils.aoa_to_sheet([
      // ["Tên khách hàng", "Tuổi", "Địa chỉ"], // Dòng tiêu đề
      // ["name", "age", "address"], // Dòng thứ 2 với các key
      listColumn.map((item) => item.name), // Dòng tiêu đề
      listColumn.map((item) => item.key), // Dòng thứ 2 với các key
    ]);

    window.parent.postMessage(
      {
        type: "EXPORT_XLSX",
        data: data,
        listColumn: listColumn,
        name: name,
      },
      "*"
    );

    // Thêm dữ liệu mẫu bắt đầu từ dòng thứ 3
    XLSX.utils.sheet_add_json(ws, data, { origin: "A3", skipHeader: true });

    // Ẩn dòng thứ 2
    ws["!rows"] = [{}, { hidden: true }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name);

    // Tạo blob từ workbook
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    // Tạo liên kết và tải xuống file
    let code_name = convertToFileName(name);
    // return;
    await saveAs(blob, code_name + ".xlsx");
    setIsSubmit(false);
  };

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
          // type: "submit",
          color: "primary",
          disabled: isSubmit,
          is_loading: isSubmit,
          callback: () => {
            createAndDownloadExcel();
            setIsSubmit(true);
            // callback(typeExport as string, extensionFile);
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

  const clearForm = () => {
    setEmail(null);
    onHide();
  };

  return (
    <Modal isOpen={onShow} className="modal-export" isFade={true} staticBackdrop={true} toggle={() => !isSubmit && clearForm()} isCentered={true}>
      <form className="form-export">
        <ModalHeader title={`Xuất danh sách ${name}`} toggle={() => !isSubmit && clearForm()} />
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

          {/* <div style={{marginTop: '1rem'}}>
            <Input
                label="Gửi đến Email"
                name="email"
                fill={true}
                required={true}
                value={email}
                placeholder="Nhập Email"
                onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                }}
            />
          </div> */}
        </ModalBody>
        <ModalFooter actions={actions} />
      </form>
    </Modal>
  );
}

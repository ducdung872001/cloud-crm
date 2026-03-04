import React, { useEffect, useState } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import RadioList from "components/radio/radioList";
import "./ModalExportCustomer.scss";
import Input from "components/input/input";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import { getDomain } from "reborn-util";

export interface ExportModalProps {
  type?: "one_option" | "two_option";
  name: string;
  onShow: boolean;
  onHide: () => void;
  options: IOption[];
  callback: (type: string, extension: string) => void;
  total: any;
  params: any;
}
export default function ModalExportCustomer(props: ExportModalProps) {
  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");

  const { name, onShow, onHide, options, callback, type = "one_option", total, params } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [typeExport, setTypeExport] = useState<string | number>(options[0].value);
  const [extensionFile, setExtensionFile] = useState<string>("excel");
  const [email, setEmail] = useState(null);

  useEffect(() => {
    if (onShow) {
      setTypeExport(options[0].value);
      setIsSubmit(false);
      setExtensionFile("excel");
    }
  }, [onShow]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (checkSubdomainTNEX) {
      handleExport();
      setIsSubmit(true);
    }
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
            if (!checkSubdomainTNEX) {
              setIsSubmit(true);
              callback(typeExport as string, extensionFile);
            }
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
    setEmail(null);
  };

  const handleExport = async () => {
    const bodyExport = {
      customerRequestParam: {
        queryFromTnex: 1,
        // employeeId:
        ...params,
      },
      pageable: {
        limit: total,
        offset: 0,
      },
      body: {
        map: {
          numCustomer: total,
          name: true,
          phoneUnmasked: true,
          sourceName: true,
          employeeName: true,
          employeeAssignDate: true,

          ...(params?.Trangthaikhoanvaycashloan ? { "extra.Trangthaikhoanvaycashloan": true } : ""),
          ...(params?.Trangthaikhoanvaycashloan ? { "extra.sotienpheduyetcashloan": true } : ""),

          ...(params?.TrangThaiKhoanVayTBoss ? { "extra.TrangThaiKhoanVayTBoss": true } : ""),
          ...(params?.TrangThaiKhoanVayTBoss ? { "extra.SoTienPheDuyetTBoss": true } : ""),

          ...(params?.Trangthaikhoanvaycreditline ? { "extra.Trangthaikhoanvaycreditline": true } : ""),
          ...(params?.Trangthaikhoanvaycreditline ? { "extra.SoTienPheDuyetCreditline": true } : ""),

          lstCustomerExtraInfo: true,
          // firstCall: true,
          // telesaleCall:true,
          // extra.ThongTinDanhChoTelesale: true,
          // extra.ThongTinKhoanVayCashLoan: true,
          // extra.ThongTinKhoanVayCreditline: true,
          // extra.ThongTinKhoanVayTBoss: true,
          // extra.LyDoTuChoi: true,
          // extra.SanPham: true,
          // extra.TrangthaiOnboard: true,
          // extra.Ngayonboard: true,
          // extra.ThuTu: true,
          // extra.marketingSendLeadTime: true,
          // extra.marketingSendLeadSource: true,
          // extra.MaDangKyVayCashloan: true,
          // extra.ngaypheduyetcashloan: true,
          // extra.MaDangKyVayCreditline: true,

          // extra.ngaypheduyetcreditline: true,
          // extra.MaDangKyVayTBoss: true,
          // extra.NgayPheDuyetTBoss: true,
          // extra.TrangThaiLienKetShop: true,
          // extra.LyDo: true
        },
      },
      cusType: "0",
      lstEmployeeIds: [],
      email: email,
    };

    console.log("bodyExport", bodyExport);
    const response = await CustomerService.exportMulti(bodyExport);
    console.log("response", response);

    if (response) {
      showToast(`Xuất File khách hàng thành công!. File dữ liệu sẽ được gửi tới Email của bạn`, "success");
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsSubmit(false);
  };

  return (
    <Modal isOpen={onShow} className="modal-export" isFade={true} staticBackdrop={true} toggle={() => !isSubmit && clearForm()} isCentered={true}>
      <form className="form-export" onSubmit={(e) => onSubmit(e)}>
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

          {checkSubdomainTNEX ? (
            <div style={{ marginTop: "1rem" }}>
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
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter actions={actions} />
      </form>
    </Modal>
  );
}

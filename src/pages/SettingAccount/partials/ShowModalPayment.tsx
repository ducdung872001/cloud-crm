import React, { Fragment, useMemo, useState } from "react";
import { formatCurrency } from "reborn-util";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import LogoMB from "assets/images/logo-mb.png";
import QR from "assets/images/qr-mb.png";
import { IActionModal } from "model/OtherModel";
import FileUpload from "components/fileUpload/fileUpload";
import PackageService from "services/PackageService";
import { showToast } from "utils/common";

interface IShowModalPaymentProps {
  onShow: boolean;
  onHide: () => void;
  phone: string;
  data: Record<string, unknown>;
  dataResponse?: Record<string, unknown>;
}

export default function ShowModalPayment(props: IShowModalPaymentProps) {
  const { onShow, onHide, data, phone, dataResponse } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    values: {
      avatar: "",
    },
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const body = {
      id: dataResponse?.id,
      bill: formData?.values.avatar,
    };

    const response = await PackageService.updateBill(body);

    if (response.code === 0) {
      showToast(
        "Gói bạn đăng ký đã được gửi thành công. Bây giờ, gói bạn đăng ký đang được chờ xác nhận từ phía bộ phận admin của chúng tôi. Xin hãy kiên nhẫn trong khi chúng tôi kiểm tra và xác nhận thông tin của bạn!",
        "success"
      );
      handleClearForm();
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsSubmit(false);
  };

  const handleClearForm = () => {
    onHide();
    setFormData({ values: { avatar: "" } });
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
              handleClearForm();
            },
          },
          {
            title: "Xác nhận",
            color: "primary",
            type: "submit",
            disabled: isSubmit || !formData?.values?.avatar,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, isSubmit]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => handleClearForm()} className="modal-payment-package">
        <form className="wrapper-payment-package" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Hướng dẫn thanh toán" toggle={() => handleClearForm()} />
          <ModalBody>
            <div className="info__payment--user">
              <div className="money__payment">
                Quý khách cần thanh toán {data?.price ? formatCurrency(data.price) : "0đ"} cho {data?.nameOrg?.toLowerCase()} với lựa chọn{" "}
                {data?.packageType == 5 ? `${data?.account || 0} tài khoản và ${data?.branch || 0} chi nhánh` : `${data?.name}/${data?.extend}`}.
              </div>
              <div className="step-item step-item--one">
                <div className="name-step">
                  <span className="hight-line">1</span>
                  Quý khách hàng cần chuyển tiền vào tài khoản sau:
                </div>
                <div className="info-step info-step--one">
                  <div className="info-step--left">
                    {/* <div className="logo-msb">
                      <img loading="lazy" src={LogoMB} alt="logo-msb" />
                    </div> */}
                    <div className="qr-code">
                      <img loading="lazy" src={QR} alt="logo-msb" />
                    </div>
                  </div>
                  <div className="info-step--right">
                    <div className="user-receive logo-bank">
                      <img loading="lazy" src={LogoMB} alt="logo-mb" />
                    </div>
                    <div className="user-receive">
                      <strong>Chủ tài khoản:</strong> REBORN JSC.
                    </div>
                    <div className="user-receive">
                      <strong>Số tài khoản:</strong> 3536899899.
                    </div>
                    <div className="user-receive">
                      <strong>Ngân hàng:</strong> Ngân hàng Thương mại Cổ phần Quân đội (MBBank).
                    </div>
                  </div>
                </div>
              </div>
              <div className="step-item step-item--two">
                <div className="name-step">
                  <span className="hight-line">2</span>
                  Sau khi chọn xong tài khoản, quý khách hàng cần soạn nội dung chuyển khoản như sau:
                </div>
                <div className="info-step info-step--two">
                  <div className="info-step--content">
                    <span>
                      👉Nội dung: {data?.name?.toLowerCase()} {phone}
                    </span>
                  </div>
                </div>
              </div>
              <div className="step-item step-item--three">
                <div className="name-step">
                  <span className="hight-line">3</span>
                  Lưu ý:
                </div>
                <div className="info-step info-step-three">
                  <div className="info-step--note">Sau khi thanh toán thành công quý khách hàng vui lòng chụp ảnh biên lai chuyển tiền tại đây.</div>
                  <div className="update__money-bill">
                    <FileUpload type="avatar" formData={formData} setFormData={setFormData} name="avatar" />
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}

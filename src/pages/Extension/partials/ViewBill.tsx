import React, { Fragment, useMemo, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import ApplicationService from "services/ApplicationService";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IActionModal } from "model/OtherModel";

import "./ViewBill.scss";
import { showToast } from "utils/common";

interface IViewBillProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
}

export default function ViewBill(props: IViewBillProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const body = {
      id: data?.id,
    };

    const response = await ApplicationService.confirmBill(body);

    if (response.code === 0) {
      showToast("Gia hạn thành công", "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsSubmit(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: data?.status !== 1 ? "Hủy" : "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              onHide(false);
            },
          },
          ...(data && data.status !== 1
            ? ([
                {
                  title: "Xác nhận",
                  type: "submit",
                  color: "primary",
                  disabled: isSubmit,
                  is_loading: isSubmit,
                },
              ] as any)
            : []),
        ],
      },
    }),
    [isSubmit, data]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-view-bill"
      >
        <form className="form-view-bill-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Hóa đơn thanh toán`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="view__image--bill">
              {data && data.bill ? (
                <div className="img-bill">
                  <img src={data.bill} alt="Hóa đơn chuyển tiền" />
                </div>
              ) : (
                <SystemNotification type="no-item" description={<span>Hiện tại chưa có hóa đơn chuyển tiền nào.</span>} />
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}

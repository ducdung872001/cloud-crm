import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import ModalReceipt, { ModalBodyReceipt, ModalFooterReceipt } from "components/modalReceipt/modalReceipt";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import Image from "components/image";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IActionModal } from "model/OtherModel";
import { IViewAdjustmentSlipProps } from "model/adjustmentSlip/AdjustmentSlipRequestModel";
import { IDetailAdjustmentSlipResponse } from "model/adjustmentSlip/AdjustmentSlipResponseModel";
import { showToast } from "utils/common";
import AdjustmentSlipService from "services/AdjustmentSlipService";
import { INVOICE_ADJUST_INVENTORY } from "utils/constant";

export default function ViewAdjustmentSlip(props: IViewAdjustmentSlipProps) {
  const { onShow, onHide, idAdjustment, type, name } = props;

  const [isSubmitCancel, setIsSubmitCancel] = useState<boolean>(false);
  const [isSubmitApproved, setIsSubmitApproved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<IDetailAdjustmentSlipResponse>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const getDetailAdjustmentSlip = async (id: number) => {
    setIsLoading(true);

    const response = await AdjustmentSlipService.view(id);

    if (response.code === 0) {
      const result = response.result;
      setData(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && idAdjustment) {
      getDetailAdjustmentSlip(idAdjustment);
    }
  }, [onShow, idAdjustment]);

  const titles = ["STT", "Ảnh sản phẩm", "Tên sản phẩm", "Số lô", "Đơn vị", "Lý do điều chỉnh", "SL thực tế", "SL lệch"];

  const dataFormat = ["text-center", "text-center", "", "text-center", "text-center", "", "text-right", "text-right"];

  const dataMappingArray = (item, index: number) => [
    index + 1,
    <Image key={index} src={item.productAvatar} alt={item.productName} />,
    item.productName,
    item.batchNo,
    item.unitName,
    item.reason,
    item.availQty,
    item.offsetQty,
  ];

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handConfirmApproval = async (type: string, id: number) => {
    type === "cancel" ? setIsSubmitCancel(true) : setIsSubmitApproved(true);

    let response = null;

    if (type === "cancel") {
      response = await AdjustmentSlipService.cancel(id);

      if (response.code === 0) {
        showToast("Không duyệt phiếu thành công", "success");
        onHide(true);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
      }

      setIsSubmitCancel(false);
    } else {
      response = await AdjustmentSlipService.approved(id);

      if (response.code === 0) {
        showToast("Duyệt phiếu thành công", "success");
        onHide(true);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
      }
      setIsSubmitApproved(false);
    }
  };

  const showDialogConfirmDelete = () => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Không duyệt...</Fragment>,
      message: <Fragment>Bạn có chắc chắn bỏ duyệt phiếu điều chỉnh kho này? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => handConfirmApproval("cancel", idAdjustment),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_left: {
        buttons:
          type !== "view"
            ? [
                {
                  title: "Không duyệt",
                  color: "destroy",
                  variant: "outline",
                  is_loading: isSubmitCancel,
                  disabled: isSubmitCancel || isSubmitApproved,
                  callback: () => showDialogConfirmDelete(),
                },
              ]
            : [],
      },
      actions_right: {
        buttons:
          type === "view"
            ? [
                {
                  title: "Đóng",
                  color: "primary",
                  variant: "outline",
                  disabled: isSubmitCancel || isSubmitApproved,
                  callback: () => onHide(false),
                },
                // {
                //   title: "In hóa đơn A4/A5",
                //   color: "primary",
                //   callback: () => {
                //     handlePrint();
                //   },
                // },
              ]
            : [
                {
                  title: "Duyệt phiếu",
                  color: "primary",
                  is_loading: isSubmitApproved,
                  disabled: isSubmitCancel || isSubmitApproved,
                  callback: () => handConfirmApproval("approved", idAdjustment),
                },
                {
                  title: "Đóng",
                  color: "primary",
                  variant: "outline",
                  callback: () => onHide(false),
                },
              ],
      },
    }),
    [type, isSubmitCancel, isSubmitApproved, idAdjustment]
  );

  return (
    <Fragment>
      <ModalReceipt
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => onHide(false)}
        className="modal-view-adjustment--slip"
      >
        {!isLoading && data ? (
          <div ref={componentRef}>
            <ModalBodyReceipt
              type={INVOICE_ADJUST_INVENTORY}
              name="Danh sách mặt hàng"
              code={data.stockAdjust.code}
              billDate={moment(data.stockAdjust.created_at).format("DD/MM/YYYY HH:mm")}
              importer={data.stockAdjust.creatorName || name}
              address={data.stockAdjust.inventoryName}
              status={data.stockAdjust.status}
              style={{
                marginTop: "2rem",
              }}
            >
              <BoxTable
                name="Danh sách mặt hàng"
                titles={titles}
                items={data.stockAdjustDetails}
                dataFormat={dataFormat}
                dataMappingArray={(item, index) => dataMappingArray(item, index)}
                striped={true}
              />
            </ModalBodyReceipt>
          </div>
        ) : (
          <Loading />
        )}
        <ModalFooterReceipt actions={actions} />
      </ModalReceipt>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

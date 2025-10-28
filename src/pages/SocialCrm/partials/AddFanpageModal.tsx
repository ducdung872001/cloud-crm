import React, { Fragment, useMemo, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import BoxTable from "components/boxTable/boxTable";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IActionModal } from "model/OtherModel";
import { IFanpageFacebookRequest } from "model/fanpageFacebook/FanpageFacebookRequestModel";
import { AddFanpageModalProps } from "model/fanpageFacebook/PropsModel";
import { IFanpageFacebookResponse } from "model/fanpageFacebook/FanpageResponseModel";
import { IAction } from "model/OtherModel";
import { showToast } from "utils/common";
import FanpageFacebookService from "services/FanpageFacebookService";
import "./AddFanpageModal.scss";

export default function AddFanpageModal(props: AddFanpageModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataDetailFanpage, setDataDetailFanpage] = useState<IFanpageFacebookResponse>(null);

  const titles = ["STT", "Tên Fanpage", "UID"];

  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: IFanpageFacebookResponse, index: number) => [index + 1, item.name, item._fanpage_id];

  const actionsTable = (item: IFanpageFacebookResponse): IAction[] => {
    return [
      {
        title: "Chọn",
        icon: item._fanpage_id == dataDetailFanpage?._fanpage_id ? <span className="selected" /> : <span className="un-selected" />,
        callback: () => {
          setDataDetailFanpage(item);
        },
      },
    ];
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác chọn Fanpage</Fragment>,
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
        setDataDetailFanpage(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  //! đoạn này xử lý vấn đề callAPI gọi đi
  const handleSelectedFanpage = async () => {
    setIsSubmit(true);

    const body: IFanpageFacebookRequest = {
      id: dataDetailFanpage?.id,
      name: dataDetailFanpage?.name,
      _fanpage_id: dataDetailFanpage?._fanpage_id,
      userAccessToken: dataDetailFanpage?.accessToken,
    };

    const response = await FanpageFacebookService.update(body);
    if (response.code === 0) {
      showToast(`Chọn Fanpage thành công`, "success");
      onHide(true);
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
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              dataDetailFanpage === null ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || dataDetailFanpage === null,
            is_loading: isSubmit,
            callback: () => {
              handleSelectedFanpage();
            },
          },
        ],
      },
    }),
    [isSubmit, dataDetailFanpage]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-fanpage"
      >
        <ModalHeader title={`Chọn Fanpage cần kết nối`} toggle={() => !isSubmit && onHide(false)} />
        <ModalBody>
          <div className="list-fanpage">
            {/* Dạng danh sách */}
            <BoxTable
              style={{ marginTop: 0 }}
              name="Danh sách Fanpage"
              titles={titles}
              items={data}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              striped={true}
              actions={actionsTable}
              actionType="inline"
            />
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

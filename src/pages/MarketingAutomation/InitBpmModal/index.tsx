import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IAddWorkRatingModalProps } from "model/workOrder/PropsModel";
import { IUpdateRatingRequestModal } from "model/workOrder/WorkOrderRequestModel";
import Icon from "components/icon";
import TextArea from "components/textarea/textarea";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import WorkOrderService from "services/WorkOrderService";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import BusinessProcessService from "services/BusinessProcessService";

export default function InitBpmModal(props: any) {
  const { onShow, onHide, idCampaign } = props;

  const [rating, setRating] = useState<number>(0);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [validateContent, setValidateContent] = useState<boolean>(false);

  const [formData, setFormData] = useState<any>({
    idCampaign: idCampaign,
  });

  const handSubmitForm = async () => {
    if (formData.content == "") {
      setValidateContent(true);
      return;
    }

    setIsSubmit(true);

    const body: IUpdateRatingRequestModal = {
      ...(formData as IUpdateRatingRequestModal),
    };
    return;

    const response = await WorkOrderService.updateRating(body);

    if (response.code === 0) {
      showToast("Đánh giá thành công", "success");
      setFormData({
        worId: 0,
        mark: rating,
        content: "",
      });
      onHide(true);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsSubmit(false);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác cập nhật đánh giá`}</Fragment>,
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
              rating <= 0 ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Đẩy vào quy trình",
            type: "button",
            color: "primary",
            disabled: !valueProcess ? true : isSubmit,
            is_loading: isSubmit,
            callback: () => {
              handSubmitForm();
            },
          },
        ],
      },
    }),
    [rating, isSubmit, validateContent, formData]
  );

  //danh sách quy trình

  const [listBusinessProcess, setListBusinessProcess] = useState([]);

  const [valueProcess, setValueProcess] = useState(null);

  const loadOptionProcess = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BusinessProcessService.list(param);
    let optionProcess =
      page === 1
        ? [
            // {
            //   value: -1,
            //   label: "Tất cả quy trình",
            // },
          ]
        : [];

    if (response.code === 0) {
      const dataOption = response.result.items;

      if (dataOption.length > 0) {
        dataOption.map((item: any) => {
          optionProcess.push({
            value: item.id,
            label: item.name,
          });
        });
      }

      return {
        // options: [
        //   ...(dataOption.length > 0
        //     ? dataOption.map((item: ICampaignResponseModel) => {
        //         return {
        //           value: item.id,
        //           label: item.name,
        //         };
        //       })
        //     : []),
        // ],
        options: optionProcess,
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  useEffect(() => {
    loadOptionProcess("", undefined, { page: 1 });
  }, [listBusinessProcess]);

  const handleChangeValueProcess = (e) => {
    setValueProcess(e);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-init-bpm"
      >
        <div className="form-rating-group">
          <ModalHeader title={`Đẩy vào quy trình`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="box__rating">
              <SelectCustom
                id="processId"
                name="processId"
                fill={true}
                required={true}
                options={[]}
                value={valueProcess}
                onChange={(e) => handleChangeValueProcess(e)}
                isAsyncPaginate={true}
                placeholder="Chọn quy trình"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadOptionProcess}
              />
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

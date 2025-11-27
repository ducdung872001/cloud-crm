import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import BusinessProcessService from "services/BusinessProcessService";
import MarketingAutomationService from "services/MarketingAutomationService";

export default function InitBpmModalV2(props: any) {
  const { onShow, onHide, idCampaign } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [validateProcess, setValidateProcess] = useState<boolean>(false);

  const handSubmitForm = async () => {
    if (!valueProcess) {
      setValidateProcess(true);
      return;
    }

    setIsSubmit(true);

    const body = {
      maId: idCampaign,
      processId: valueProcess.value,
    };

    const response = await MarketingAutomationService.updateMapping(body);

    if (response.code === 0) {
      showToast("Cập nhật thành công", "success");
      setValueProcess(null);
      setValidateProcess(false);
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsSubmit(false);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
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
  const [valueProcess, setValueProcess] = useState(null);
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
              !valueProcess ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Cập nhật",
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
    [isSubmit, validateProcess, valueProcess, idCampaign]
  );

  //danh sách quy trình

  const [listBusinessProcess, setListBusinessProcess] = useState([]);

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
    setValidateProcess(false);
  };

  useEffect(() => {
    if (!onShow) {
      // Reset form khi đóng modal
      setValueProcess(null);
      setValidateProcess(false);
      setIsSubmit(false);
    } else if (onShow && idCampaign) {
      // Load giá trị process hiện tại nếu đã có mapping
      const loadCurrentMapping = async () => {
        const response = await MarketingAutomationService.detail(idCampaign);
        if (response.code === 0 && response.result && response.result.processId) {
          setValueProcess({
            value: response.result.processId,
            label: response.result.processName,
          });
        }
      };
      loadCurrentMapping();
    }
  }, [onShow, idCampaign]);

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
          <ModalHeader title={`Chọn quy trình`} toggle={() => !isSubmit && onHide(false)} />
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
              {validateProcess && (
                <div style={{ color: "var(--error-color)", marginTop: "0.5rem", fontSize: "1.2rem" }}>
                  Vui lòng chọn quy trình
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

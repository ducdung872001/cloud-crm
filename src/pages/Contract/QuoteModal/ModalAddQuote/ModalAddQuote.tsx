import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import "./ModalAddQuote.scss";
import _ from "lodash";
import Checkbox from "components/checkbox/checkbox";
import ImageThirdGender from "assets/images/third-gender.png";
import SelectCustom from "components/selectCustom/selectCustom";
import ContractApproachService from "services/ContractApproachService";
import ContractEformService from "services/ContractEformService";
import ContractPipelineService from "services/ContractPipelineService";
import QuoteService from "services/QuoteService";

export default function ModalAddQuote(props: any) {
  const { onShow, onHide, data } = props;
  //   console.log('activityData', activityData);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const valueConfig = useMemo(
    () =>
      ({
        id: 0,
        quoteId: 0,
        contractId: data?.contractId,
      } as any),
    [onShow, data]
  );

  const [formData, setFormData] = useState(valueConfig);

  useEffect(() => {
    setFormData(valueConfig);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [valueConfig, onShow]);

  const [detailQuote, setDetailQuote] = useState(null);

  const [checkFieldQuote, setCheckFieldQuote] = useState<boolean>(false);

  const loadedOptionQuote = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      status: 2,
    };

    const response = await QuoteService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueAction = (e) => {
    setCheckFieldQuote(false);
    setDetailQuote(e);
    setFormData({ ...formData, quoteId: e.value });
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (detailQuote === null) {
      setCheckFieldQuote(true);
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(formData as any),
    };

    console.log("body", body);

    const response = await QuoteService.updateQuoteContract(body);
    if (response.code === 0) {
      onHide(true);
      setDetailQuote(null);
      showToast(`Thêm báo giá thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDetailQuote(null);
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
              // _.isEqual(formData, valueConfig) ? handClearForm() : showDialogConfirmCancel();
              handClearForm();
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldQuote ||
              //   !isDifferenceObj(formData.values, valueSetting),
              _.isEqual(formData, valueConfig),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, valueConfig]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác cài đặt`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);
        handClearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-quote"
        size="lg"
      >
        <form className="form-add-quote" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Thêm báo giá`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="container-add-quote">
              <div style={{ width: "100%" }}>
                <SelectCustom
                  id="quoteId"
                  name="quoteId"
                  label=""
                  options={[]}
                  fill={true}
                  value={detailQuote}
                  required={true}
                  onChange={(e) => handleChangeValueAction(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={false}
                  placeholder="Chọn báo giá"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionQuote}
                  // formatOptionLabel={formatOptionLabelEmployee}
                  error={checkFieldQuote}
                  message="Báo giá không được bỏ trống"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

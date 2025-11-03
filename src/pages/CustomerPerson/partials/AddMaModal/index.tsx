import React, { Fragment, useState, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import CustomerService from "services/CustomerService";
import SelectCustom from "components/selectCustom/selectCustom";
import ImageThirdGender from "assets/images/third-gender.png";
import MarketingAutomationService from "services/MarketingAutomationService";

interface IAddMaModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
}

export default function AddMaModal(props: IAddMaModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [valueMA, setValueMA] = useState(null);
  const [checkFieldMA, setCheckFieldMA] = useState(false);

  const loadedOptionMA = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      fromDirect: true,
      status: 1
    };

    const response = await MarketingAutomationService.list(param);

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

  const handleChangeValueMA = (e) => {
    setValueMA(e);
    setCheckFieldMA(false)
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    if(!valueMA){
        setCheckFieldMA(true);
        return;
    }

    const body = {
        maId: valueMA.value,
        customerIds: data
    }

    const response = await CustomerService.addCustomerMA(body);

    if (response.code === 0) {
      showToast("Thêm khách hàng vào chương trình MA thành công", "success");
      handleClearForm(true);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsSubmit(false);
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setValueMA(null);
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
              !valueMA ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !valueMA,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [valueMA, isSubmit]
  );

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
        handleClearForm(false);
        setShowDialog(false);
        setContentDialog(null);
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
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-customer-ma"
      >
        <form className="form-foodunit-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Chương trình Marketing Automation`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  id="maId"
                  name="maId"
                  label=""
                  options={[]}
                  fill={true}
                  value={valueMA}
                  required={true}
                  onChange={(e) => handleChangeValueMA(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn chương trình"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionMA}
                //   formatOptionLabel={formatOptionLabel}
                error={checkFieldMA}
                message="Chương tình MA không được để trống"
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

import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import RadioList from "components/radio/radioList";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId } from "reborn-util";
import ContractEformService from "services/ContractEformService";
import { showToast } from "utils/common";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";

import "./index.scss";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";

export default function ModalSelectForm({ onShow, onHide, dataNode, callBack }) {
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataForm, setDataForm] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if(dataForm){
        const config = dataForm.config && JSON.parse(dataForm.config) || null;
        callBack(config, dataForm?.id)
        handleClear(true);
    } else {
        showToast( "Vui lòng chọn biểu mẫu", "warning");
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
            //   !isDifferenceObj(formData, values) ? handleClear(false) : showDialogConfirmCancel();
            handleClear(false)
            },
          },
          {
            title: 'Xác nhận',
            type: "submit",
            color: "primary",
            disabled: isSubmit, 
                // || !isDifferenceObj(formData, values),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [
        // formData, values, 
        isSubmit,
        dataForm
    ]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataForm ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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

  const loadedOptionEform = async (search, loadedOptions, { page }) => {
    const params = {
        name: search,
        page: page,
        limit: 10,
    }
    const response = await ContractEformService.list(params);

    if (response.code === 0) {
      const dataOption = response.result?.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  config: item.config
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

  const handleClear = (acc) => {
    onHide(acc)
    setDataForm(null);
  }


  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="lg"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-add-type-form"
      >
        <form className="form-add-form-type-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Chọn biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                    id=""
                    name="recipient"
                    label={'Chọn biểu mẫu'}
                    fill={true}
                    required={true}
                    // error={item.checkMapping}
                    // message="Biến quy trình không được để trống"
                    options={[]}
                    value={dataForm}
                    onChange={(e) => {
                        setDataForm(e);
                    }}
                    isAsyncPaginate={true}
                    placeholder={`Chọn biểu mẫu`}
                    additional={{
                        page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionEform}
                    // formatOptionLabel={formatOptionLabelAttribute}
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

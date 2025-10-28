import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId } from "reborn-util";
import ContractEformService from "services/ContractEformService";
import { showToast } from "utils/common";
import "./ModalSelectMappingOther.scss";
import BusinessProcessService from "services/BusinessProcessService";

export default function ModalSelectMappingOther({ onShow, onHide, dataNode }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataFromProcess, setDataFromProcess] = useState(null);
  const [dataFromCode, setDataFromCode] = useState(null);

  const values = useMemo(
    () => ({
      fromProcessId: null,
      fromCode: null,
      nodeId: dataNode?.id,
    }),
    [onShow, dataNode]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // if(!dataNode){
    //     showToast( "Vui lòng chọn biểu mẫu", "warning");
    //     return;
    // }

    const body = {
      ...formData,
    };

    // let response = null;

    // if (data?.type === 'bpmn:UserTask') {
    //   response = await BusinessProcessService.cloneUserTask(body);
    // }

    const response = await BusinessProcessService.cloneFormMapping(body);

    if (response?.code === 0) {
      showToast("Sao chép dữ liệu vào/ra thành công", "success");
      handleClear(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
              !isDifferenceObj(formData, values) ? handleClear(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
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
      dataNode,
    ]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataNode ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleClear(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const loadedOptionListProcess = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BusinessProcessService.list(params);

    if (response.code === 0) {
      const dataOption = response.result?.items;

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

  const loadedOptionListForm = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 100,
      // processId: dataFromProcess?.value,
      nodeId: dataNode?.id,
    };
    const response = await BusinessProcessService.listBpmFormMapping(params);

    if (response.code === 0) {
      const dataOption = response.result;
      const newOption = dataOption.filter((el) => el.code);

      return {
        options: [
          ...(newOption.length > 0
            ? newOption.map((item) => {
                return {
                  value: item.code,
                  label: item.name || item.code,
                  processId: item.processId,
                  //   config: item.config
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

  useEffect(() => {
    loadedOptionListForm("", undefined, { page: 1 });
  }, [dataFromProcess]);

  const handleClear = (acc) => {
    onHide(acc);
    setDataFromProcess(null);
    setDataFromCode(null);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="lg"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-select-mapping-other"
      >
        <form className="form-select-mapping-other" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Sao chép dữ liệu vào/ra`} toggle={() => !isSubmit && handleClear(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                {/* <SelectCustom
                    id="fromProcessId"
                    name="fromProcessId"
                    // label={'Chọn quy trình'}
                    fill={true}
                    required={true}
                    // error={item.checkMapping}
                    // message="Biến quy trình không được để trống"
                    options={[]}
                    value={dataFromProcess}
                    onChange={(e) => {
                        setDataFromProcess(e);
                        setFormData({...formData, fromProcessId: e.value})
                    }}
                    isAsyncPaginate={true}
                    placeholder={`Chọn quy trình`}
                    additional={{
                        page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionListProcess}
                    // formatOptionLabel={formatOptionLabelAttribute}
                /> */}
              </div>

              <div className="form-group">
                <SelectCustom
                  // key={dataFromProcess?.value}
                  id="nodeId"
                  name="nodeId"
                  label={"Chọn Form của quy trình"}
                  fill={true}
                  required={true}
                  // error={item.checkMapping}
                  // message="Biến quy trình không được để trống"
                  options={[]}
                  value={dataFromCode}
                  onChange={(e) => {
                    setDataFromCode(e);
                    setFormData({ ...formData, fromCode: e.value, fromProcessId: e.processId });
                  }}
                  isAsyncPaginate={true}
                  placeholder={`Chọn Form của quy trình`}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionListForm}
                  // formatOptionLabel={formatOptionLabelAttribute}
                  // disabled={dataFromProcess ? false : true}
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

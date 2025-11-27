import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import BusinessProcessService from "services/BusinessProcessService";
import ManageDefaultProcessesService from "services/ManageDefaultProcessesService";

export default function AddConfigDefaultProcesses(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataProcess, setDataProcess] = useState<any>(null);
  const [checkFieldProcess, setCheckFieldProcess] = useState<boolean>(false);

  useEffect(() => {
    if (data && data.processCode) {
      setDataProcess({
        value: data.processCode,
        label: (data?.processName ?? "No name") + " - " + data.processCode,
      });
    }
  }, [data]);

  const values = useMemo(
    () =>
      ({
        id: data?.id ?? 0,
        name: data?.name ?? "",
        uri: data?.uri ?? "",
        processCode: data?.processCode ?? "",
        processName: data?.processName ?? "",
      } as any),
    [data, onShow]
  );

  const loadedOptionProcess = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await BusinessProcessService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.code,
                  label: item.name + " - " + item.code,
                  processName: item.name,
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

  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return <div className="selected--item">{label}</div>;
  };

  const handleChangeValueProcess = (e) => {
    setCheckFieldProcess(false);
    setDataProcess(e);
    setFormData({ ...formData, values: { ...formData?.values, processCode: e.value, processName: e.processName } });
  };

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "uri",
      rules: "required",
    },
    {
      name: "processCode",
      rules: "required",
    },
  ];

  // {
  //   "name": "Permission Test",
  //   "uri": "/ticket/test",
  //   "processCode": "PROC_001",
  //   "bsnId": 37
  // }

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Tên tính năng",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "URI",
          name: "uri",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Quy trình mặc định",
          name: "processCode",
          type: "custom",
          snippet: (
            <SelectCustom
              id="processCode"
              name="processCode"
              label="Quy trình mặc định"
              options={[]}
              fill={true}
              value={dataProcess}
              required={true}
              onChange={(e) => handleChangeValueProcess(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn quy trình"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionProcess}
              formatOptionLabel={formatOptionLabelEmployee}
              error={checkFieldProcess}
              message="Quy trình không được bỏ trống"
            />
          ),
        },
      ] as IFieldCustomize[],
    [formData?.values, dataProcess, checkFieldProcess]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(formData.values as any),
      ...(data ? { id: data.id } : {}),
    };

    const response = await ManageDefaultProcessesService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} tính năng thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setCheckFieldProcess(false);
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
              !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-default-processes"
      >
        <form className="form-add-default-processes " onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} tính năng`}
            toggle={() => {
              !isSubmit && onHide(false);
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              <div className="list-field-item list-field-basic">
                {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                    formData={formData}
                  />
                ))}
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

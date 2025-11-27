import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { AddContractModalProps } from "model/contract/PropsModel";
import { IContractRequest } from "model/contract/ContractRequestModel";
import ContractService from "services/ContractService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import "./AddContractModal.scss";

export default function AddContractModal(props: AddContractModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [listPipeline, setListPipeline] = useState<IOption[]>(null);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState<boolean>(false);
  const [listStage, setListStage] = useState<IOption[]>(null);
  const [isLoadingStage, setIsLoadingStage] = useState<boolean>(false);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        taxCode: data?.taxCode ?? "",
        contractNo: data?.contractNo ?? "",
        signDate: data?.signDate ?? "",
        dealValue: data?.dealValue ?? "",
      } as IContractRequest),
    [data, onShow]
  );

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId");

      if (dataOption) {
        setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  const onSelectOpenCustomer = async () => {
    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingCustomer(true);
      const dataOption = await SelectOptionData("customerId");

      if (dataOption) {
        setListCustomer([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomer(false);
    }
  };

  const onSelectOpenPipeline = async () => {
    if (!listPipeline || listPipeline.length === 0) {
      setIsLoadingPipeline(true);
      const dataOption = await SelectOptionData("pipelineId");

      if (dataOption) {
        setListPipeline([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingPipeline(false);
    }
  };

  const onSelectOpenStage = async () => {
    if (!listStage || listStage.length === 0) {
      setIsLoadingStage(true);
      const dataOption = await SelectOptionData("stageId");

      if (dataOption) {
        setListStage([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingStage(false);
    }
  };

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "taxCode",
      rules: "required",
    },
    {
      name: "contractNo",
      rules: "required",
    },
    {
      name: "dealValue",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên hợp đồng",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mã số thuế",
          name: "taxCode",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Số hợp đồng",
          name: "contractNo",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Ngày ký",
          name: "signDate",
          type: "date",
          fill: true,
          required: true,
        },
        {
          label: "Khách hàng",
          name: "customerId",
          type: "select",
          fill: true,
          options: listCustomer,
          onMenuOpen: onSelectOpenCustomer,
          isLoading: isLoadingCustomer,
        },
        {
          label: "Người phụ trách",
          name: "employeeId",
          type: "select",
          fill: true,
          options: listEmployee,
          onMenuOpen: onSelectOpenEmployee,
          isLoading: isLoadingEmployee,
        },
        {
          label: "Loại hợp đồng",
          name: "pipelineId",
          type: "select",
          fill: true,
          options: listPipeline,
          onMenuOpen: onSelectOpenPipeline,
          isLoading: isLoadingPipeline,
        },
        {
          label: "Giai đoạn hợp đồng",
          name: "stageId",
          type: "select",
          fill: true,
          options: listStage,
          onMenuOpen: onSelectOpenStage,
          isLoading: isLoadingStage,
        },
        {
          label: "Giá trị hợp đồng",
          name: "dealValue",
          type: "number",
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [listCustomer, isLoadingCustomer, listEmployee, isLoadingEmployee, listPipeline, isLoadingPipeline, listStage, isLoadingStage]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: IContractRequest = {
      ...(formData.values as IContractRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await ContractService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} hợp đồng thành công`, "success");
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
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
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
        className="modal-add-contract"
      >
        <form className="form-contract" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} hợp đồng`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

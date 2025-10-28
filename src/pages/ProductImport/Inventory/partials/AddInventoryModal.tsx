import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IInventoryRequest } from "model/inventory/InventoryRequestModel";
import { AddInventoryModalProps } from "model/inventory/PropsModel";
import InventoryService from "services/InventoryService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import "./AddInventoryModal.scss";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import { ContextType, UserContext } from "contexts/userContext";

export default function AddInventoryModal(props: AddInventoryModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { dataBranch } = useContext(UserContext) as ContextType;
  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listBeautyBranch, setListBeautyBranch] = useState<IOption[]>(null);
  const [isLoadingBeautyBranch, setIsLoadingBeautyBranch] = useState<boolean>(false);
  const checkUserRoot = localStorage.getItem("user.root");

  const [branchId, setBranchId] = useState(null);

  const branchList = async () => {
    const param: IBeautyBranchFilterRequest = {
      name: "",
      page: 1,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;
      if (dataOption?.length === 1) {
        setBranchId(dataOption[0].id);
      }
    }
  };

  useEffect(() => {
    if (!data?.branchId && !data?.id) {
      branchList();
    } else {
      setBranchId(null);
    }
    onSelectOpenEmployee();
  }, [data, onShow]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        address: data?.address ?? "",
        position: data?.position ?? "0",
        branchId: data?.branchId ?? dataBranch.value ?? null,
        employeeId: data?.employeeId ?? null,
        status: data?.status ?? 1,
        code: data?.code ?? "",
      } as IInventoryRequest),
    [data, onShow, branchId, dataBranch]
  );

  const onSelectOpenBeautyBranch = async () => {
    if (!listBeautyBranch || listBeautyBranch.length === 0) {
      setIsLoadingBeautyBranch(true);
      const dataOption = await SelectOptionData("beautyBranch");
      if (dataOption) {
        setListBeautyBranch([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingBeautyBranch(false);
    }
  };

  useEffect(() => {
    if (data?.branchId && checkUserRoot == "1") {
      onSelectOpenBeautyBranch();
    }
    if (data?.branchId == null && !data?.id) {
      if (dataBranch && checkUserRoot == "1") {
        onSelectOpenBeautyBranch();
      } else {
        setListBeautyBranch([]);
      }
    }
  }, [data, checkUserRoot, branchId, dataBranch]);

  const validations: IValidation[] = [
    {
      name: "branchId",
      rules: "required",
    },
    {
      name: "name",
      rules: "required",
    },
    {
      name: "address",
      rules: "required",
    },
    {
      name: "position",
      rules: "required",
    },
  ];

  const [lstEmployee, setLstEmployee] = useState([]);

  const onSelectOpenEmployee = async () => {
    const response = await SelectOptionData("employee");
    if (response) {
      setLstEmployee([...(response.length > 0 ? response : [])]);
    }
  };

  const listStatus: any = [
    { value: 1, label: "Đang sử dụng" },
    { value: 0, label: "Ngừng sử dụng" },
  ];

  const listField: IFieldCustomize[] = [
    {
      label: "Tên kho",
      name: "name",
      type: "text",
      fill: true,
      required: true,
      className: "input-name",
    },
    {
      label: "Mã kho",
      name: "code",
      type: "text",
      fill: true,
      className: "input-code",
    },
    {
      label: "Địa chỉ kho",
      name: "address",
      type: "text",
      fill: true,
      required: true,
      className: "input-address",
    },
    {
      label: "Thủ kho",
      name: "employeeId",
      type: "select",
      fill: true,
      options: lstEmployee,
      className: "input-employee",
    },
    {
      label: "Thứ tự hiển thị",
      name: "position",
      type: "number",
      fill: true,
      required: false,
      className: "input-position",
    },
    {
      label: "Trạng thái",
      name: "status",
      type: "select",
      fill: true,
      options: listStatus,
      className: "input-status",
    },
  ];

  // Chỉ xuất hiện đối với tài khoản tổng (Thuật ngữ: leader - quản lý | mod)
  const listFieldBeautyBranch = useMemo(
    () =>
      [
        // ...(checkUserRoot == "1" ? [{
        //   label: "Chi nhánh",
        //   name: "branchId",
        //   type: "select",
        //   fill: true,
        //   required: true,
        //   disabled: true,
        //   options: listBeautyBranch,
        //   onMenuOpen: onSelectOpenBeautyBranch,
        //   isLoading: isLoadingBeautyBranch,
        // }] : []),
      ] as IFieldCustomize[],
    [isLoadingBeautyBranch, listBeautyBranch]
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

    const errors = Validate(validations, formData, [...listFieldBeautyBranch, ...listField]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: IInventoryRequest = {
      ...(formData.values as IInventoryRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await InventoryService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} kho hàng thành công`, "success");
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
        className="modal-add-inventory"
      >
        <form className="form-inventory" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} kho hàng`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listFieldBeautyBranch.map((field, index) => (
                <FieldCustomize
                  field={field}
                  key={index}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBeautyBranch, setFormData)}
                  formData={formData}
                />
              ))}

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

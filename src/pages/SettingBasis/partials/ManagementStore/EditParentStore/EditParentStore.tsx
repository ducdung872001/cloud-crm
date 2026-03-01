import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { showToast } from "utils/common";
import { createArrayFromTo, createArrayFromToR, getMaxDay, isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import BeautyBranchService from "services/BeautyBranchService";
import "./EditParentStore.scss";
import { SelectOptionData } from "utils/selectCommon";
import { IStoreRequest } from "@/model/managementStore/StoreRequestModel";

export default function EditParentStore(props: any) {
  const { onShow, onHide, branchId } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getDetailBranch = async () => {
    setIsLoading(true);

    const response = await BeautyBranchService.detail(branchId);

    if (response.code === 0) {
      const result = response.result;
      setData(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (branchId) {
      getDetailBranch();
    }
  }, [branchId, onShow]);

  const [isLoadingStore, setIsLoadingStore] = useState<boolean>(false);
  const [listStore, setListStore] = useState<IOption[]>(null);

  const onSelectOpenStore = async () => {
    if (!listStore || listStore.length === 0) {
      setIsLoadingStore(true);
      const dataOption = await SelectOptionData("beautyBranch");
      console.log("dataOption>>", dataOption);

      if (dataOption) {
        const newData = [...dataOption];
        newData.unshift({
          value: "",
          label: "Không có cửa hàng cha",
        });
        // Lọc bỏ cửa hàng hiện tại để tránh tự tham chiếu
        const filteredData = newData.filter((item) => item.value !== branchId);
        setListStore(filteredData);
      }
      setIsLoadingStore(false);
    }
  };

  useEffect(() => {
    if (data?.parentId) {
      onSelectOpenStore();
    }

    if (data?.parentId == null) {
      setListStore([]);
    }
  }, [data?.parentId]);

  const values = useMemo(
    () =>
    ({
      parentId: data?.parentId ?? "",
      avatar: data?.avatar ?? "",
      name: data?.name ?? "",
      alias: data?.alias ?? "",
      address: data?.address ?? "",
      foundingDay: data?.foundingDay ?? "",
      foundingMonth: data?.foundingMonth ?? "",
      foundingYear: data?.foundingYear ?? "",
      website: data?.website ?? "",
      description: data?.description ?? "",
      code: data?.code ?? "",
      doctorNum: data?.doctorNum.toString() ?? "0",
      contact: data?.contact ?? "",
      phone: data?.phone ?? "",
      email: data?.email ?? "",
      goodAt: data?.goodAt ?? "",
    } as IStoreRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    // {
    //   name: "parentId",
    //   rules: "required",
    // },
  ];

  const listFieldBasic: IFieldCustomize[] = [
    {
      label: "Cửa hàng cha",
      name: "parentId",
      type: "select",
      fill: true,
      required: false,
      options: listStore,
      onMenuOpen: onSelectOpenStore,
      isLoading: isLoadingStore,
    },
  ];

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

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    // Kiểm tra không cho phép chọn chính cửa hàng hiện tại làm cửa hàng cha
    if (formData.values.parentId && formData.values.parentId === branchId) {
      showToast("Không thể chọn chính cửa hàng hiện tại làm cửa hàng cha", "error");
      return;
    }

    setIsSubmit(true);
    const body: IStoreRequest = {
      ...(formData.values as IStoreRequest),
      ...(data ? { id: data.id } : {}),
    };
    const response = await BeautyBranchService.update(body);

    if (response.code === 0) {
      showToast(`Thay đổi cửa hàng cha thành công`, "success");
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
        className="modal-edit-parent-branch"
      >
        <form className="form-branch-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Chỉnh sửa cửa hàng cha`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic">
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

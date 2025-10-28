import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { AddDepartmentModalProps } from "model/department/PropsModel";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IDepartmentRequest } from "model/department/DepartmentRequestModel";
import { IDepartmentResponse } from "model/department/DepartmentResponseModel";
import DepartmentService from "services/DepartmentService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "tippy.js/animations/scale-extreme.css";
import "./index.scss";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import { SelectOptionData } from "utils/selectCommon";
import { ContextType, UserContext } from "contexts/userContext";
import RoleService from "services/RoleService";

export interface IJobTitles {
  title: string;
  position: number;
  isTitle: boolean;
  isPostion: boolean;
}

export default function AddRoleDirectoryModal(props: any) {
  const { onShow, onHide, idRole, data } = props;

  console.log("data>>", data);

  const focusedElement = useActiveElement();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [detailRole, setDetailRole] = useState<IDepartmentResponse>(null);

  const [listDepartmnent, setListDepartmnent] = useState<IOption[]>(null);

  const values = useMemo(
    () =>
      ({
        id: data?.id || 0,
        name: data?.name || "",
        code: data?.code || "",
        position: data?.position || 0,
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "code",
      rules: "required",
    },
  ];

  const listFieldInfoBasic = useMemo(
    () =>
      [
        {
          label: "Tên nhóm quyền",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mã nhóm quyền",
          name: "code",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Vị trí hiển thị",
          name: "position",
          type: "number",
          fill: true,
          required: false,
        },
        // {
        //   label: "Trạng thái",
        //   name: "status",
        //   type: "select",
        //   fill: true,
        //   required: true,
        //   options: [
        //     {
        //       value: "1",
        //       label: "Đang hoạt động",
        //     },
        //     {
        //       value: "2",
        //       label: "Tạm dừng hoạt động",
        //     },
        //   ],
        // },
      ] as IFieldCustomize[],
    []
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setListDepartmnent([]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldInfoBasic]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: IDepartmentRequest = {
      ...formData.values,
    };

    const response = await RoleService.update(body);

    if (response.code === 0) {
      showToast(`${detailRole ? "Cập nhật" : "Thêm mới"} nhóm quyền`, "success");
      handleClearForm(true);
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
              !isDifferenceObj(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data?.id ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, data]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${detailRole ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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
          handleClearForm(false);
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
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-role"
      >
        <form className="form-department-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${detailRole ? "Chỉnh sửa" : "Thêm mới"} nhóm quyền`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="list-form-info-basic">
                {listFieldInfoBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldInfoBasic, setFormData)}
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

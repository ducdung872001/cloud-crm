import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Tippy from "@tippyjs/react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
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
import "./EditParentDepartment.scss";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import { SelectOptionData } from "utils/selectCommon";

export interface IJobTitles {
  title: string;
  position: number;
}

export default function EditParentDepartment(props: AddDepartmentModalProps) {
  const { onShow, onHide, idDepartment } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [detailDepartment, setDetailDepartment] = useState<IDepartmentResponse>(null);

  //! đoạn này call API chi tiết một phòng ban
  const getDetailDepartment = async () => {
    const response = await DepartmentService.detail(idDepartment);

    if (response.code === 0) {
      setDetailDepartment(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (idDepartment !== null && onShow) {
      getDetailDepartment();
    } else {
      setDetailDepartment(null);
    }
  }, [idDepartment, onShow]);

  const [isLoadingDepartmnent, setIsLoadingDepartmnent] = useState<boolean>(false);
  const [listDepartmnent, setListDepartmnent] = useState<IOption[]>(null);

  const onSelectOpenDepartmnent = async () => {
    if (!listDepartmnent || listDepartmnent.length === 0) {
      setIsLoadingDepartmnent(true);
      const dataOption = await SelectOptionData("department");      
      if (dataOption) {
        const newData = [...dataOption];
        newData.unshift({
            value:'',
            label:'Không có phòng ban quản lý'
        })
        setListDepartmnent([...(newData.length > 0 ? newData : [])]);
      }
      setIsLoadingDepartmnent(false);
    }
  };

  useEffect(() => {
    if (detailDepartment?.parentId) {
      onSelectOpenDepartmnent();
    }

    if (detailDepartment?.parentId == null) {
      setListDepartmnent([]);
    }
  }, [detailDepartment]);



  const values = useMemo(
    () =>
      ({
        parentId: detailDepartment?.parentId ?? "",
        // branchId: checkUserRoot == "1" ? detailDepartment?.branchId ??  null : 0,
        // name: detailDepartment?.name ?? "",
        // managerId: detailDepartment?.managerId ?? "",
        // note: detailDepartment?.note ?? "",
        // status: detailDepartment?.status?.toString() ?? "1",
        // jobTitles: detailDepartment?.jobTitles ?? [],
      } as IDepartmentRequest),
    [detailDepartment, onShow, checkUserRoot]
  );

  const validations: IValidation[] = [
  
  ];

  const listFieldInfoBasic: IFieldCustomize[] = [
    
    {
      label: "Phòng ban quản lý",
      name: "parentId",
      type: "select",
      fill: true,
      required: false,
      options: listDepartmnent,
      onMenuOpen: onSelectOpenDepartmnent,
      isLoading: isLoadingDepartmnent,
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

    const errors = Validate(validations, formData, [...listFieldInfoBasic]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: IDepartmentRequest = {
      ...(formData.values as IDepartmentRequest),
      ...(detailDepartment ? { id: detailDepartment.id } : {}),
    };

    const response = await DepartmentService.updateParent(body);

    if (response.code === 0) {
      showToast(`Chỉnh sửa phòng ban quản lý thành công`, "success");
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
            title: detailDepartment ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
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
      title: <Fragment>{`Hủy bỏ thao tác ${detailDepartment ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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
        className="modal-edit-parent-department"
      >
        <form className="form-department-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Chỉnh sửa phòng ban quản lý`} toggle={() => !isSubmit && onHide(false)} />
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

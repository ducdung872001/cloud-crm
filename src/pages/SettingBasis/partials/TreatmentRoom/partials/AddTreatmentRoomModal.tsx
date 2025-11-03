import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { isDifferenceObj } from "reborn-util";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddTreatmentRoomModalProps } from "model/treatmentRoom/PropsModal";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ITreatmentRoomRequestModal } from "model/treatmentRoom/TreatmentRoomRequestModal";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import TreatmentRoomService from "services/TreatmentRoomService";
import EmployeeService from "services/EmployeeService";
import BeautyBranchService from "services/BeautyBranchService";
import "./AddTreatmentRoomModal.scss";

export default function AddTreatmentRoomModal(props: IAddTreatmentRoomModalProps) {
  const { onShow, onHide, data } = props;
  
  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [dataBranch, setDataBranch] = useState(null);
  const [dataEmployee, setDataEmployee] = useState(null);
  const [checkFieldBranch, setCheckFieldBranch] = useState<boolean>(false);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        bedNum: data?.bedNum ?? 0,
        employeeId: data?.employeeId ?? null,
        branchId: data?.branchId ?? null,
      } as ITreatmentRoomRequestModal),
    [onShow, data]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  //! đoạn này xử lý vấn đề khi update tự fill dữ liệu vào nhân viên và chi nhánh
  const getDetailEmloyee = async (id: number) => {
    if (!id) return;

    const response = await EmployeeService.detail(id);

    if (response.code == 0) {
      const result = response.result;

      setDataEmployee({
        value: result?.id,
        label: result?.name,
        avatar: result?.avatar,
      });
    }
  };

  useEffect(() => {
    if (onShow && data?.id) {
      getDetailEmloyee(data?.employeeId);

      setDataBranch({
        value: data?.branchId,
        label: data?.branchName,
      });
    }
  }, [data, onShow]);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
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

  //! đoạn này xử lý vấn đề hiển thị hình ảnh nhân viên
  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý vấn đề thay đổi nhân viên
  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
  };

  useEffect(() => {
    if (dataEmployee) {
      setFormData({ ...formData, values: { ...formData?.values, employeeId: dataEmployee.value } });
    }
  }, [dataEmployee]);

  //? đoạn này xử lý vấn đề call api lấy ra danh sách chi nhánh
  const loadOptionBranch = async (search, loadedOptions, { page }) => {
    const param: IBeautyBranchFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

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

  //? đoạn này xử lý vấn đề thay đổi chi nhánh
  const handleChangeValueBranch = (e) => {
    setCheckFieldBranch(false);
    setDataBranch(e);
  };

  const branchList = async () => {
    const param: IBeautyBranchFilterRequest = {
      name: '',
      page: 1,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);
    
    if (response.code === 0){
      const dataOption = response.result.items;
      if(dataOption?.length === 1){     
        setDataBranch({value: dataOption[0].id, label: dataOption[0].name})    
      }
    }
  }

  useEffect(() => {
    if(!data?.branchId && !data?.id){
      branchList()
    } 
  }, [data, onShow]) 

  useEffect(() => {
    if (dataBranch) {
      setFormData({ ...formData, values: { ...formData?.values, branchId: dataBranch.value } });
    }
  }, [dataBranch]);

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "bedNum",
      rules: "required|min:0",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên phòng",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Số giường",
          name: "bedNum",
          type: "number",
          fill: true,
          required: true,
        },
        {
          name: "employeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="employeeId"
              name="employeeId"
              label="Nhân viên"
              fill={true}
              options={[]}
              value={dataEmployee}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn nhân viên"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
            />
          ),
        },
        {
          name: "branchId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="branchId"
              name="branchId"
              label="Chi nhánh"
              fill={true}
              required={true}
              options={[]}
              value={dataBranch}
              onChange={(e) => handleChangeValueBranch(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn chi nhánh"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionBranch}
              error={checkFieldBranch}
              message="Chi nhánh không được để trống"
            />
          ),
        },
      ] as IFieldCustomize[],
    [dataBranch, dataEmployee, checkFieldBranch]
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

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (!dataBranch) {
      setCheckFieldBranch(true);
      return;
    }

    setIsSubmit(true);

    const body: ITreatmentRoomRequestModal = {
      ...(formData?.values as ITreatmentRoomRequestModal),
      ...(data ? { id: data.id } : {}),
    };

    const response = await TreatmentRoomService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} phòng điều trị thành công`, "success");
      onHide(true);
      setDataBranch(null);
      setDataEmployee(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDataBranch(null);
    setDataEmployee(null);
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
            disabled:
              isSubmit ||
              checkFieldBranch ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldBranch]
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
        setDataBranch(null);
        setDataEmployee(null);
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
        className="modal-add-treamentroom"
      >
        <form className="form-treamentroom-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} phòng điều trị`}
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setDataBranch(null);
              !isSubmit && setDataEmployee(null);
            }}
          />
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

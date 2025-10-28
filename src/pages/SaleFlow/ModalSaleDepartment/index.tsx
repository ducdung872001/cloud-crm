import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import "./index.scss";
import NummericInput from "components/input/numericInput";
import _ from "lodash";
import Checkbox from "components/checkbox/checkbox";
import SaleflowApproachService from "services/SaleflowApproachService";
import SelectCustom from "components/selectCustom/selectCustom";
import { ContextType, UserContext } from "contexts/userContext";
import DepartmentService from "services/DepartmentService";
import EmployeeService from "services/EmployeeService";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import ImageThirdGender from "assets/images/third-gender.png";

export default function ModalSaleDepartment(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, dataApproach } = props;
  // console.log('dataApproach', dataApproach);

  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [detailDepartment, setDetailDepartment] = useState(null);
  const [checkFieldDepartment, setCheckFieldDepartment] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState(false);
  const [detailSaleflowSale, setDetailSaleflowSale] = useState(null);
  useEffect(() => {
    if (dataApproach && onShow) {
      // setValues({...values, approachId: dataApproach.id})
      getDetailSaleDepartment(dataApproach.id);
    }
  }, [dataApproach, onShow]);

  const getDetailSaleDepartment = async (approachId: number) => {
    const response = await SaleflowApproachService.detailSaleflowSale(approachId);

    if (response.code == 0) {
      const result = response.result;
      if (result?.departmentId) {
        setDetailSaleflowSale(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (detailSaleflowSale) {
      setDetailDepartment({ value: detailSaleflowSale.departmentId, label: detailSaleflowSale.departmentName });
      const newEmployees =
        detailSaleflowSale.lstEmployee?.map((item) => {
          return {
            value: item.id,
            label: item.name,
            avatar: item.avatar,
          };
        }) || [];
      setEmployees(newEmployees);
    }
  }, detailSaleflowSale);

  const loadedOptionDepartment = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await DepartmentService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

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

  const handleChangeValueDepartment = (e) => {
    setCheckFieldDepartment(false);
    setDetailDepartment(e);
    setEmployees([]);
    setFormData({ ...formData, values: { ...formData?.values, departmentId: +e.value, employees: "[]" } });
  };

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionSales = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      LstId: detailDepartment?.value,
    };

    const response = await EmployeeService.list_department(param);

    if (response.code === 0) {
      // const dataOption = (response.result.items || []).filter((item) => {
      //     return !lstIdSale.some((el) => el === item.id);
      // });

      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  // departmentName: item.departmentName,
                  // branchName: item.branchName
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
    loadedOptionSales("", undefined, { page: 1 });
  }, [detailDepartment]);

  const formatOptionLabelSales = ({ label, avatar, departmentName, branchName }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div>
          <div>{label}</div>
          {/* <div>
            <span style={{fontSize: 10, fontWeight:'200', marginTop: 3}}>
              {`${departmentName} (${branchName})`}
            </span>
          </div> */}
        </div>
      </div>
    );
  };

  const handleChangeValueSales = (e) => {
    setCheckFieldEmployee(false);
    setEmployees(e);
    const newCoordinators = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, employees: JSON.stringify(newCoordinators) } });
  };

  const [values, setValues] = useState({
    approachId: "",
    departmentId: 0,
    employees: "[]",
  });
  // console.log('valueSetting', valueSetting);

  useEffect(() => {
    if (dataApproach) {
      setValues({ ...values, approachId: dataApproach.id });
    }
  }, dataApproach);

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    // const errors = Validate(validations, formData, listField);

    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    if (!detailDepartment) {
      setCheckFieldDepartment(true);
      return;
    }

    if (employees.length === 0) {
      setCheckFieldEmployee(true);
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(formData?.values as any),
      ...(detailSaleflowSale?.id ? { id: detailSaleflowSale?.id } : {}),
      ...{ approachId: dataApproach.id },
    };

    const response = await SaleflowApproachService.updateSaleflowSale(body);
    if (response.code === 0) {
      onHide(true);
      showToast(`Cài đặt bộ phận bán hàng thành công`, "success");
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
              _.isEqual(formData.values, values) ? handleClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              //   !isDifferenceObj(formData.values, valueSetting),
              _.isEqual(formData.values, values) ||
              checkFieldDepartment,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, values, checkFieldDepartment]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác cài đặt`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);
        handleClearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClearForm = () => {
    onHide(false);
    setDetailDepartment(null);
    setEmployees([]);
    setCheckFieldDepartment(false);
    setCheckFieldEmployee(false);
    setDetailSaleflowSale(null);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-sale-department"
      >
        <form className="form-sale-department" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Bộ phận bán hàng`} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
            <div>
              <div className="form-group">
                <SelectCustom
                  id="departmentId"
                  name="departmentId"
                  label="Phòng ban"
                  options={[]}
                  fill={true}
                  value={detailDepartment}
                  required={true}
                  onChange={(e) => handleChangeValueDepartment(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn phòng ban"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionDepartment}
                  // formatOptionLabel={formatOptionLabelEmployee}
                  error={checkFieldDepartment}
                  message="Phòng ban không được bỏ trống"
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  key={detailDepartment?.value}
                  id="saleId"
                  name="saleId"
                  label="Nhân viên"
                  options={[]}
                  fill={true}
                  isMulti={true}
                  disabled={!detailDepartment ? true : false}
                  value={employees}
                  required={true}
                  onChange={(e) => handleChangeValueSales(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn nhân viên"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionSales}
                  formatOptionLabel={formatOptionLabelSales}
                  error={checkFieldEmployee}
                  message="Vui lòng chọn nhân viên"
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

import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import ImageThirdGender from "assets/images/third-gender.png";
import SelectCustom from "components/selectCustom/selectCustom";
import NummericInput from "components/input/numericInput";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import EmployeeService from "services/EmployeeService";
import DepartmentService from "services/DepartmentService";
import { ContextType, UserContext } from "contexts/userContext";
import SupportCommonService from "services/SupportCommonService";
import { showToast } from "utils/common";

import "./AddDepartmentSupport.scss";

interface IAddDepartmentSupportProps {
  onShow: boolean;
  onHide: () => void;
  data?: any;
  supportId: number;
  takeData?: (data: any) => void;
  disabled: boolean;
}

export default function AddDepartmentSupport(props: IAddDepartmentSupportProps) {
  const { onShow, onHide, data, takeData, supportId, disabled } = props;

  const handleGetDetailSupport = async (id: number) => {
    if (!id) return;

    const response = await SupportCommonService.detailConfig(id);

    if (response.code === 0) {
      const result = response.result;

      if (result.lstEmployee.length > 0) {
        const changeDataEmployee = result.lstEmployee.map((item) => {
          return {
            label: item.name,
            value: item.id,
            avatar: item.avatar,
          };
        });

        setValueEmployee(changeDataEmployee);
      }

      setValueDepartment({
        label: data.data.departmentName,
        value: data.data.departmentId,
      });
    } else {
      showToast("Chi tiết phòng ban đang bị lỗi. Xin vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (onShow && data) {
      handleGetDetailSupport(data.id);
    }
  }, [onShow, data]);

  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const values = useMemo(
    () => ({
      departmentId: data ? data.data.departmentId : null,
      employees: data ? JSON.parse(data.data.employees || "[]") : [],
      day: data ? data.data.day : null,
      hour: data ? data.data.hour : null,
      minute: data ? data.data.minute : null,
    }),
    [onShow, data]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const [validateFormData, setValidateFormData] = useState({
    departmentId: false,
    employees: false,
    day: false,
    hour: false,
    minute: false,
  });

  const [valueDepartment, setValueDepartment] = useState(null);
  const [valueEmployee, setValueEmployee] = useState([]);

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
      departmentId: valueDepartment?.value,
      branchId: dataBranch.value,
      status: 1,
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
                  label: `${item.name}`,
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

  const loadedOptionDepartment = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 100,
    };

    const response = await DepartmentService.list(param);

    if (response.code === 0) {
      const dataOption = response.result || [];

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
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueDepartment = (e) => {
    setValueDepartment(e);
    setFormData({ ...formData, departmentId: e.value });
  };

  const handleChangeValueEmployee = (e) => {
    setValueEmployee(e);

    const lstId = e.map((item) => item.value);

    setFormData({ ...formData, employees: lstId });
  };

  const handleChangeValueDay = (e) => {
    const value = e.floatValue;
    setFormData({ ...formData, day: value });
  };

  const handleChangeValueHour = (e) => {
    const value = e.floatValue;
    setFormData({ ...formData, hour: value });
  };

  const handleChangeValueMinute = (e) => {
    const value = e.floatValue;
    setFormData({ ...formData, minute: value });
  };

  const handleClearForm = () => {
    onHide();
    setFormData(values);
    setValueDepartment(null);
    setValueEmployee([]);
    setValidateFormData({
      departmentId: false,
      employees: false,
      day: false,
      hour: false,
      minute: false,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.departmentId) {
      setValidateFormData({ ...validateFormData, departmentId: true });
      return;
    }

    if (formData.employees.length === 0) {
      setValidateFormData({ ...validateFormData, employees: true });
      return;
    }

    setIsSubmit(true);

    const body = {
      ...formData,
      type: data.type,
      position: JSON.stringify(data.position),
      supportId: supportId,
      employees: JSON.stringify(formData.employees),
      ...(data && data.id ? { id: +data.id } : {}),
    };

    const response = await SupportCommonService.updateConfig(body);

    if (response.code === 0) {
      const result = response.result;
      const changeResult = {
        ...data,
        id: `${result.id}`,
        data: {
          label: `${valueDepartment.label}\n${result.day || 0} ngày, ${result.hour || 0} giờ ${result.minute || 0} phút`,
          name: "Phòng ban",
          departmentId: result.departmentId,
          departmentName: valueDepartment.label,
          employees: result.employees,
          day: result.day,
          hour: result.hour,
          minute: result.minute,
        },
      };

      takeData(changeResult);
      showToast("Chọn phòng ban thành công", "success");
      handleClearForm();
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
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
              handleClearForm();
            },
          },
          {
            title: "Lưu",
            type: "submit",
            color: "primary",
            disabled: isSubmit || _.isEqual(formData, values) || Object.values(validateFormData).filter((item) => item === true).length > 0,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, validateFormData, formData, values]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-add-department--support"
      >
        <form className="form-add-department--support" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data && data.id ? "Chỉnh sửa" : "Chọn"} phòng ban`} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  fill={true}
                  id="departmentId"
                  name="departmentId"
                  label="Phòng ban"
                  options={[]}
                  isAsyncPaginate={true}
                  placeholder="Chọn phòng ban"
                  additional={{
                    page: 1,
                  }}
                  value={valueDepartment}
                  onChange={(e) => handleChangeValueDepartment(e)}
                  loadOptionsPaginate={loadedOptionDepartment}
                  error={validateFormData.departmentId}
                  message="Phòng ban không được bỏ trống"
                  disabled={disabled}
                />
              </div>
              <div className="form-group">
                <SelectCustom
                  key={formData.departmentId?.toString()}
                  name="employee"
                  value={valueEmployee}
                  label="Chọn nhân viên"
                  fill={true}
                  required={true}
                  options={[]}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  additional={{
                    page: 1,
                  }}
                  isMulti={true}
                  loadOptionsPaginate={loadedOptionEmployee}
                  formatOptionLabel={formatOptionLabelEmployee}
                  placeholder="Chọn nhân viên"
                  disabled={!valueDepartment || disabled}
                  onChange={(e) => handleChangeValueEmployee(e)}
                  error={validateFormData.employees}
                  message="Bạn cần chọn ít nhất 1 nhân viên"
                />
              </div>

              <div className="form-group">
                <span className="name-time">Thời gian chờ</span>

                <div className="info__time">
                  <div className="time-item">
                    <NummericInput
                      name="day"
                      value={formData.day}
                      fill={true}
                      placeholder="Nhập ngày"
                      suffixes="Ngày"
                      onValueChange={(e) => handleChangeValueDay(e)}
                      disabled={disabled}
                    />
                  </div>

                  <div className="time-item">
                    <NummericInput
                      name="hour"
                      value={formData.hour}
                      fill={true}
                      placeholder="Nhập giờ"
                      suffixes="Giờ"
                      onValueChange={(e) => handleChangeValueHour(e)}
                      disabled={disabled}
                    />
                  </div>

                  <div className="time-item">
                    <NummericInput
                      name="minute"
                      value={formData.minute}
                      fill={true}
                      placeholder="Nhập phút"
                      suffixes="Phút"
                      onValueChange={(e) => handleChangeValueMinute(e)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}

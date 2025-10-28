import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import ImageThirdGender from "assets/images/third-gender.png";
import SelectCustom from "components/selectCustom/selectCustom";
import NummericInput from "components/input/numericInput";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { ContextType, UserContext } from "contexts/userContext";
import EmployeeService from "services/EmployeeService";
import ApprovalService from "services/ApprovalService";
import { showToast } from "utils/common";

import "./AddSigner.scss";

interface IAddSignerProps {
  onShow: boolean;
  onHide: () => void;
  data?: any;
  approvalId: number;
  takeData?: (data: any) => void;
  disabled: boolean;
}

export default function AddSigner(props: IAddSignerProps) {
  const { onShow, onHide, data, takeData, approvalId, disabled } = props;

  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const values = useMemo(
    () => ({
      employeeId: data ? data.data.employeeId : null,
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
    employeeId: false,
    day: false,
    hour: false,
    minute: false,
  });

  const [valueEmployee, setValueEmployee] = useState(null);

  useEffect(() => {
    if (data && data.data?.employeeId) {
      setValueEmployee({ value: data.data.employeeId, label: data.data.employeeName });
    }
  }, [onShow, data]);

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      status: 1,
      branchId: dataBranch.value,
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
                  label: `${item.name} - ${item.departmentName}`,
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

  const handleChangeValueEmployee = (e) => {
    setValueEmployee(e);
    setFormData({ ...formData, employeeId: e.value });
    setValidateFormData({ ...validateFormData, employeeId: false });
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
    setValueEmployee(null);
    setValidateFormData({
      employeeId: false,
      day: false,
      hour: false,
      minute: false,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId) {
      setValidateFormData({ ...validateFormData, employeeId: true });
      return;
    }

    setIsSubmit(true);

    const body = {
      ...formData,
      type: data.type,
      position: JSON.stringify(data.position),
      approvalId: approvalId,
      ...(data && data.id ? { id: +data.id } : {}),
    };

    const response = await ApprovalService.updateConfig(body);

    if (response.code === 0) {
      const result = response.result;
      const changeResult = {
        ...data,
        id: `${result.id}`,
        data: {
          label: `${valueEmployee.label}\n${result.day || 0} ngày, ${result.hour || 0} giờ ${result.minute || 0} phút`,
          name: "Người ký",
          employeeId: result.employeeId,
          employeeName: valueEmployee.label,
          day: result.day,
          hour: result.hour,
          minute: result.minute,
        },
      };

      takeData(changeResult);
      showToast("Chọn người ký thành công", "success");
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
        className="modal-add-signer"
      >
        <form className="form-add-signer-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data && data.id ? "Chỉnh sửa người ký" : "Chọn người ký"}`} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
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
                  loadOptionsPaginate={loadedOptionEmployee}
                  formatOptionLabel={formatOptionLabelEmployee}
                  placeholder="Chọn nhân viên"
                  onChange={(e) => handleChangeValueEmployee(e)}
                  error={validateFormData.employeeId}
                  message="Nhân viên không được bỏ trống"
                  disabled={disabled}
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

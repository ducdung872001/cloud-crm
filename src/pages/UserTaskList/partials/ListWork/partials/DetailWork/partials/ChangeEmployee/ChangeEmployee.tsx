import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import "./ChangeEmployee.scss";
import EmployeeService from "services/EmployeeService";
import WorkOrderService from "services/WorkOrderService";
import { ContextType, UserContext } from "contexts/userContext";

export default function ChangeEmployee(props: any) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { dataBranch } = useContext(UserContext) as ContextType;

  useEffect(() => {
    if(onShow && data && data?.employeeId){
        setValueEmployee({value: data?.employeeId, label: data?.employeeName})
    }
  }, [onShow, data])

  const values = useMemo(
    () => ({
        id: data?.id ?? null,
        employeeId: data?.id ?? null,
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

  const [validateFieldEmployee, setValidateFieldEmployee] = useState<boolean>(false);
  const [valueEmployee, setValueEmployee] = useState(null);

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      // branchId: dataBranch.value
    //   departmentId: dataDepartment?.value,
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

  const handleChangeValueProcess = (e) => {
    setValueEmployee(e);
    setFormData({ ...formData, employeeId: e.value });
    setValidateFieldEmployee(false);
  }

  const handleClearForm = (acc) => {
    onHide(acc);
    setFormData(values);
    setValueEmployee(null);
    setValidateFieldEmployee(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId) {
      setValidateFieldEmployee(true);
      return;
    }

    setIsSubmit(true);

    const body = {
      ...formData,
    };

    const response = await WorkOrderService.updateEmployee(body);

    if (response.code === 0) {
      showToast("Đổi người nhận việc thành công", "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
              handleClearForm(false);
            },
          },
          {
            title: "Áp dụng",
            type: "submit",
            color: "primary",
            disabled: isSubmit || _.isEqual(formData, values) || validateFieldEmployee,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, validateFieldEmployee, formData, values]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-change-employee"
      >
        <form className="form-change-employee" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Đổi người nhận việc`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  name="employeeId"
                  value={valueEmployee}
                  label="Chọn người nhận việc"
                  fill={true}
                  required={true}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEmployee}
                  placeholder="Chọn người nhận việc"
                  onChange={(e) => handleChangeValueProcess(e)}
                  error={validateFieldEmployee}
                  message="Người nhận việc không được bỏ trống"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}

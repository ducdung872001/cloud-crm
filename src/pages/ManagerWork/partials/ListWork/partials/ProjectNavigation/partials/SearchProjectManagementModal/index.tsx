import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import moment from "moment";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Validate, { handleChangeValidate } from "utils/validate";
import { isDifferenceObj } from "reborn-util";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import EmployeeService from "services/EmployeeService";
import DepartmentService from "services/DepartmentService";
import ImageThirdGender from "assets/images/third-gender.png";
import { ContextType, UserContext } from "contexts/userContext";
import "./index.scss";

interface ISearchProjectManagementModalProps {
  onShow: boolean;
  onHide: () => void;
  callBack: (params) => void;
}

export default function SearchProjectManagementModal(props: ISearchProjectManagementModalProps) {
  const { onShow, onHide, callBack } = props;

  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const values = useMemo(
    () =>
      ({
        name: "",
        startTime: "",
        endTime: "",
        employeeId: null,
        departmentId: null,
      } as any),
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

  const [dataDepartment, setDataDepartment] = useState(null);

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
    setDataDepartment(e);
    setFormData({ ...formData, values: { ...formData?.values, departmentId: +e.value } });
  };

  const [dataEmployee, setDataEmployee] = useState(null);

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      departmentId: dataDepartment?.value || null,
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

  useEffect(() => {
    if (onShow) {
      loadedOptionEmployee("", undefined, { page: 1 });
    }
  }, [dataDepartment, onShow]);

  //? đoạn này xử lý vấn đề thay đổi người quản lý dự án
  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData.values, employeeId: e.value } });
  };

  //* đoạn này xử lý vấn đề hiển thị hình ảnh người quản lý dự án
  const formatOptionLabelEmployee = ({ value, label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const validations: IValidation[] = [];

  const listField: any = [
    {
      type: "custom",
      name: "",
      snippet: (
        <SelectCustom
          id="departmentId"
          name="departmentId"
          label="Phòng ban phụ trách"
          options={[]}
          fill={true}
          required={true}
          isAsyncPaginate={true}
          additional={{
            page: 1,
          }}
          value={dataDepartment}
          onChange={(e) => handleChangeValueDepartment(e)}
          loadOptionsPaginate={loadedOptionDepartment}
          placeholder="Chọn phòng ban phụ trách"
        />
      ),
    },
    {
      type: "custom",
      name: "",
      snippet: (
        <SelectCustom
          key={dataDepartment?.value}
          id="employeeId"
          name="employeeId"
          label="Người quản lý dự án"
          options={[]}
          fill={true}
          isAsyncPaginate={true}
          isFormatOptionLabel={true}
          placeholder="Chọn người quản lý dự án"
          additional={{
            page: 1,
          }}
          value={dataEmployee}
          onChange={(e) => handleChangeValueEmployee(e)}
          loadOptionsPaginate={loadedOptionEmployee}
          formatOptionLabel={formatOptionLabelEmployee}
        />
      ),
    },
    {
      label: "Tên dự án",
      name: "name",
      type: "text",
      fill: true,
    },
    {
      label: "Bắt đầu",
      name: "startTime",
      type: "date",
      fill: true,
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
    },
    {
      label: "Kết thúc",
      name: "endTime",
      type: "date",
      fill: true,
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
    },
  ];

  const onSubmit = (e) => {
    e.preventDefault();

    const changeFormData = {
      name: formData.values.name || "",
      limit: 20,
      ...(formData.values.employeeId ? { employeeId: formData.values.employeeId } : {}),
      ...(formData.values.departmentId ? { departmentId: formData.values.departmentId } : {}),
      ...(formData.values.startTime ? { startTime: moment(formData.values.startTime).format("DD/MM/YYYY") } : {}),
      ...(formData.values.endTime ? { endTime: moment(formData.values.endTime).format("DD/MM/YYYY") } : {}),
    };

    setIsSubmit(true);
    callBack(changeFormData);
    setIsSubmit(false);
    onHide();
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_left: {
        buttons: [
          {
            title: "Làm mới",
            color: "warning",
            variant: "outline",
            callback: () => {
              setFormData({ ...formData, values: values });
              setDataDepartment(null);
              setDataEmployee(null);
            },
          },
        ],
      },
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide()}
        className="modal__search--project"
      >
        <form className="form__search--project--group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Tìm kiếm dự án" toggle={() => !isSubmit && onHide()} />
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
    </Fragment>
  );
}

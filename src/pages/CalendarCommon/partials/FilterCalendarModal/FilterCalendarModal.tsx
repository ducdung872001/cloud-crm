import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IFilterCalendarModalProps } from "model/scheduleCommon/PropsModel";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ImageThirdGender from "assets/images/third-gender.png";
import { useActiveElement } from "utils/hookCustom";
import { handleChangeValidate } from "utils/validate";
import EmployeeService from "services/EmployeeService";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import CustomerService from "services/CustomerService";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ContextType, UserContext } from "contexts/userContext";

import "./FilterCalendarModal.scss";

export default function FilterCalendarModal(props: IFilterCalendarModalProps) {
  const { onShow, onHide, filterCalendar, setFilterCalendar, idEmployee } = props;

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [checkViewSourcesCalendar, setCheckViewSourcesCalendar] = useState<boolean>(false);

  const [dataEmployee, setDataEmployee] = useState(null);
  const [dataCustomer, setDataCustomer] = useState(null);

  const values = useMemo(
    () => ({
      chooseTypeCalendar: filterCalendar?.chooseTypeCalendar.join(),
      sourcesCalendar: filterCalendar?.sourcesCalendar.join(),
      // branchId: filterCalendar.branchId,
      branchId: dataBranch?.value,
      lstEmployeeId: filterCalendar?.lstEmployeeId,
      lstCustomerId: filterCalendar?.lstCustomerId,
      startTime: filterCalendar?.startTime ? filterCalendar?.startTime : new Date(),
      endTime: filterCalendar?.endTime ?? "",
    }),
    [filterCalendar, onShow, dataBranch]
  );

  const validations: IValidation[] = [];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  // Chi tiết 1 chi nhánh
  const [detailBranch, setDetailBranch] = useState(null);

  useEffect(() => {
    setDetailBranch(dataBranch);
  }, [dataBranch]);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = (response.result.items || []).filter((item) => item.id !== idEmployee);

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
    setDataEmployee(e);
    const takeIdEmployee = e.map((item) => item.value);
    setFormData({ ...formData, values: { ...formData?.values, lstEmployeeId: takeIdEmployee } });
  };

  //! đoạn này xử lý call api lấy ra thông tin khách hàng
  const loadOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };
    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: ICustomerResponse) => {
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

  const handleChangeValueCustomer = (e) => {
    setDataCustomer(e);
    const takeIdCustomer = e.map((item) => item.value);
    setFormData({ ...formData, values: { ...formData?.values, lstCustomerId: takeIdCustomer } });
  };

  const formatOptionLabelCustomer = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  useEffect(() => {
    if (dataEmployee && dataEmployee?.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, sourcesCalendar: "2" } });
    } else {
      setDataEmployee(null);
    }
  }, [dataEmployee]);

  useEffect(() => {
    if (formData?.values?.chooseTypeCalendar) {
      const checkData = formData?.values?.chooseTypeCalendar.split(",");
      const result = (checkData || []).find((item) => item == "1");

      if (result) {
        setCheckViewSourcesCalendar(true);
        setFormData({ ...formData, values: { ...formData?.values, sourcesCalendar: "2" } });
      } else {
        setCheckViewSourcesCalendar(false);
      }
    }

    const checkCondition = formData?.values?.chooseTypeCalendar.split(",") || [];

    if (checkCondition.length > 0) {
      if (checkCondition[checkCondition.length - 1] != -1) {
        const newArray = checkCondition.filter((el) => el != -1);
        setFormData({
          ...formData,
          values: { ...formData?.values, chooseTypeCalendar: newArray.join(","), sourcesCalendar: "2" },
        });
      } else {
        const result = checkCondition.find((item) => item == "-1");
        if (result) {
          setCheckViewSourcesCalendar(true);
          setFormData({ ...formData, values: { ...formData?.values, chooseTypeCalendar: "-1", sourcesCalendar: "2" } });
        }
      }
    }

    if (!formData?.values?.chooseTypeCalendar) {
      setFormData({ ...formData, values: { ...formData?.values, chooseTypeCalendar: "-1" } });
    }
  }, [formData?.values?.chooseTypeCalendar]);

  useEffect(() => {
    if (!formData?.values?.sourcesCalendar) {
      setFormData({ ...formData, values: { ...formData?.values, sourcesCalendar: "2" } });
    }
  }, [formData?.values?.sourcesCalendar]);

  const listField = useMemo(
    () =>
      [
        {
          name: "lstEmployeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="lstEmployeeId"
              name="lstEmployeeId"
              label="Nhân viên"
              fill={true}
              options={[]}
              isMulti={true}
              value={dataEmployee}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionEmployee}
              placeholder="Chọn nhân viên"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelEmployee}
            />
          ),
        },

        {
          name: "lstCustomerId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="lstCustomerId"
              name="lstCustomerId"
              label="Khách hàng"
              fill={true}
              options={[]}
              isMulti={true}
              value={dataCustomer}
              onChange={(e) => handleChangeValueCustomer(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadOptionCustomer}
              placeholder="Chọn khách hàng"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelCustomer}
            />
          ),
        },

        {
          label: "Bắt đầu",
          name: "startTime",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập thời gian bắt đầu",
        },
        {
          label: "Kết thúc",
          name: "endTime",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập thời gian Kết thúc",
        },
        {
          label: "Dạng lịch",
          name: "chooseTypeCalendar",
          type: "checkbox",
          fill: true,
          options: [
            {
              value: "-1",
              label: "Tất cả",
            },
            {
              value: "1",
              label: "Lịch công việc",
            },
            {
              value: "2",
              label: "Lịch tư vấn",
            },
            {
              value: "3",
              label: "Lịch điều trị",
            },
          ],
        },
        {
          label: "Cá nhân",
          name: "sourcesCalendar",
          type: "checkbox",
          fill: true,
          disabled: dataEmployee || checkViewSourcesCalendar,
          options: [
            {
              value: "1",
              label: "Lịch tôi tạo",
            },
            {
              value: "2",
              label: "Lịch của tôi",
            },
          ],
        },
      ] as IFieldCustomize[],
    [dataEmployee, dataCustomer, checkViewSourcesCalendar, idEmployee, detailBranch]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = (e) => {
    e && e.preventDefault();

    if (formData?.values) {
      const convertChooseTypeCalendar = formData?.values?.chooseTypeCalendar.split(",").map((item) => +item);
      const convertSourcesCalendar = formData?.values?.sourcesCalendar.split(",").map((item) => +item);
      const collectEmployee = [...formData?.values?.lstEmployeeId];
      const collectCustomer = [...formData?.values?.lstCustomerId];
      // const collectBranch = [...formData?.values?.lstBranchId];

      if (convertChooseTypeCalendar.length > 0 && convertSourcesCalendar.length > 0) {
        setFilterCalendar({
          branchId: formData?.values?.branchId,
          lstEmployeeId: collectEmployee,
          lstCustomerId: collectCustomer,
          chooseTypeCalendar: convertChooseTypeCalendar,
          sourcesCalendar: convertSourcesCalendar,
          startTime: formData?.values?.startTime,
          endTime: formData?.values?.endTime,
        });
        onHide();
      }
    }
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác tìm kiếm</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide();
        setShowDialog(false);
        setContentDialog(null);
        onHide();
        setDataEmployee(null);
        setDataCustomer(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? onHide() : showDialogConfirmCancel();
            },
          },
          {
            title: "Tìm kiếm",
            type: "submit",
            color: "primary",
            disabled: isSubmit || (!isDifferenceObj(formData.values, values) && !formData.values.branchId),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

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
          onHide();
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
        toggle={() => {
          if (!isSubmit) {
            onHide();
            setDataEmployee(null);
            setDataCustomer(null);
          }
        }}
        className="modal-filter-calendar"
      >
        <form className="form-filter-calendar-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title="Dữ liệu tìm kiếm"
            toggle={() => {
              if (!isSubmit) {
                onHide();
                setDataEmployee(null);
                setDataCustomer(null);
              }
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

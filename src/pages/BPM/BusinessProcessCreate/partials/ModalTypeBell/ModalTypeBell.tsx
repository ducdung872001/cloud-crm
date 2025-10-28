import React, { Fragment, useState, useEffect, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import CheckboxList from "components/checkbox/checkboxList";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import CustomerService from "services/CustomerService";
import EmployeeService from "services/EmployeeService";
import { UserContext, ContextType } from "contexts/userContext";
import ImageThirdGender from "assets/images/third-gender.png";

import "./ModalTypeBell.scss";

interface IModalTypeBellProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
}

export default function ModalTypeBell(props: IModalTypeBellProps) {
  const { onShow, onHide, data } = props;

  const { dataBranch } = useContext(UserContext) as ContextType;

  const lstTypeBell = [
    {
      value: "email",
      label: "Email",
    },
    {
      value: "sms",
      label: "SMS",
    },
  ];

  const lstOptionNotify = [
    {
      value: "customer",
      label: "Khách hàng",
    },
    {
      value: "employee",
      label: "Nhân viên",
    },
  ];

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [lstTemplateEmail, setLstTemplateEmail] = useState([]);
  const [isLoadingTemplateEmail, setIsLoadingTemplateEmail] = useState<boolean>(false);

  const [lstTemplateSMS, setLstTemplateSMS] = useState([]);
  const [isLoadingTemplateSMS, setIsLoadingTemplateSMS] = useState<boolean>(false);

  const onSelectOpenTemplateEmail = async () => {
    setIsLoadingTemplateEmail(true);
    const dataOption = await SelectOptionData("templateEmailId");
    if (dataOption) {
      setLstTemplateEmail([...(dataOption.length > 0 ? dataOption : [])]);
    }
    setIsLoadingTemplateEmail(false);
  };

  const onSelectOpenTemplateSMS = async () => {
    setIsLoadingTemplateSMS(true);
    const dataOption = await SelectOptionData("templateSmsId");
    if (dataOption) {
      setLstTemplateSMS([...(dataOption.length > 0 ? dataOption : [])]);
    }
    setIsLoadingTemplateSMS(false);
  };

  useEffect(() => {
    if (data) {
      if (data.emailTemplateId) {
        onSelectOpenTemplateEmail();
      }

      if (data.smsTemplateId) {
        onSelectOpenTemplateSMS();
      }
    }
  }, [data, onShow]);

  const [dataCustomer, setDataCustomer] = useState(null);

  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param = {
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

  const handleChangeValueCustomer = (e) => {
    setDataCustomer(e);
  };

  const [dataEmployee, setDataEmployee] = useState(null);

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      // branchId: dataBranch.value,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

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
  };

  const values = useMemo(
    () => ({
      from: "customer", // thông báo đến ai
      type: "email", // thông báo qua đâu
      templateEmailId: null,
      templateSmsId: null,
      customerId: null,
      employeeId: null,
    }),
    [onShow, data]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const handleChangeValueType = (e) => {
    const value = e;
    setFormData({ ...formData, type: value ? value : "email" });
  };

  const handleChangeValueFrom = (e) => {
    const value = e;
    setFormData({ ...formData, from: value ? value : "customer" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
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
              !isDifferenceObj(formData, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData, values),
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-type-bell"
      >
        <form className="form-add-bell-type-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt thông báo`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <CheckboxList title={"Thông báo đến"} value={formData.from} options={lstOptionNotify} onChange={(e) => handleChangeValueFrom(e)} />
              </div>

              <div className="merge-form">
                {formData.from.split(",").includes("customer") && (
                  <div className="form-group">
                    <SelectCustom
                      id="customer"
                      name="customer"
                      label="Khách hàng"
                      fill={true}
                      options={[]}
                      value={dataCustomer}
                      onChange={(e) => handleChangeValueCustomer(e)}
                      isAsyncPaginate={true}
                      isFormatOptionLabel={true}
                      loadOptionsPaginate={loadedOptionCustomer}
                      placeholder="Chọn người khách hàng"
                      additional={{
                        page: 1,
                      }}
                      formatOptionLabel={formatOptionLabelCustomer}
                    />
                  </div>
                )}
                {formData.from.split(",").includes("employee") && (
                  <div className="form-group">
                    <SelectCustom
                      id="employeeId"
                      name="employeeId"
                      label="Nhân viên"
                      options={[]}
                      fill={true}
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
                  </div>
                )}
              </div>

              <div className="form-group">
                <CheckboxList title="Thông báo qua" value={formData.type} options={lstTypeBell} onChange={(e) => handleChangeValueType(e)} />
              </div>

              <div className="merge-form">
                {formData.type.split(",").includes("email") && (
                  <div className="form-group">
                    <SelectCustom
                      name="templateEmailId"
                      label="Chọn mẫu email"
                      fill={true}
                      required={true}
                      options={lstTemplateEmail}
                      isLoading={isLoadingTemplateEmail}
                      onMenuOpen={onSelectOpenTemplateEmail}
                      placeholder="Chọn mẫu email"
                    />
                  </div>
                )}

                {formData.type.split(",").includes("sms") && (
                  <div className="form-group">
                    <SelectCustom
                      name="templateSmsId"
                      label="Chọn mẫu sms"
                      fill={true}
                      required={true}
                      options={lstTemplateSMS}
                      isLoading={isLoadingTemplateSMS}
                      onMenuOpen={onSelectOpenTemplateSMS}
                      placeholder="Chọn mẫu sms"
                    />
                  </div>
                )}
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

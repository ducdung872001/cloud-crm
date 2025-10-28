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
import BpmFormArtifactService from "services/BpmFormArtifactService";
import { showToast } from "utils/common";

interface IModalTypeBellProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  dataComponent: any;
}

export default function ModalTypeBell(props: IModalTypeBellProps) {
  const { onShow, onHide, dataComponent } = props;

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [data, setData] = useState(null);
  const [config, setConfig] = useState(null);

  const getDetailBell = async (id: number) => {
    const response = await BpmFormArtifactService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      const newConfig = result.config ? JSON.parse(result.config) : null;
      const newData = newConfig?.data || null;
      setData(result);
      if (newData) {
        setConfig(newData);
        setDataCustomer(newData.customerId ? { value: newData.customerId, label: newData.customerName, avatar: newData.customerAvatar } : null);
        setDataEmployee(newData.employeeId ? { value: newData.employeeId, label: newData.employeeName, avatar: newData.employeeAvatar } : null);
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (onShow && dataComponent?.i) {
      getDetailBell(dataComponent?.i);
    }
  }, [onShow, dataComponent]);

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
    if (config) {
      if (config.emailTemplateId) {
        onSelectOpenTemplateEmail();
      }

      if (config.smsTemplateId) {
        onSelectOpenTemplateSMS();
      }
    }
  }, [data, onShow, config]);

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
    setFormData({ ...formData, customerId: e.value, customerName: e.label, customerAvatar: e.avatar });
  };

  const [dataEmployee, setDataEmployee] = useState(null);

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
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
    setFormData({ ...formData, employeeId: e.value, employeeName: e.label, employeeAvatar: e.avatar });
  };

  const values = useMemo(
    () => ({
      from: config?.from ?? "customer", // thông báo đến ai
      type: config?.type ?? "email", // thông báo qua đâu
      templateEmailId: config?.templateEmailId ?? null,
      templateSmsId: config?.templateSmsId ?? null,
      customerId: config?.customerId ?? null,
      customerName: config?.customerName ?? "",
      customerAvatar: config?.customerAvatar ?? "",
      employeeId: config?.employeeId ?? null,
      employeeName: config?.employeeName ?? "",
      employeeAvatar: config?.employeeAvatar ?? "",
    }),
    [onShow, data, config]
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

  const handleChangeValueTemplateEmail = (e) => {
    const value = e.value;
    setFormData({ ...formData, templateEmailId: value });
  };

  const handleChangeValueTemplateSMS = (e) => {
    const value = e.value;
    setFormData({ ...formData, templateSmsId: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const conditionCustomer = formData.from.split(",").includes("customer");
    const conditionEmployee = formData.from.split(",").includes("employee");
    const conditionTemplateEmail = formData.type.split(",").includes("email");
    const conditionTemplateSms = formData.type.split(",").includes("sms");

    const changeFormData = {
      ...formData,
      employeeId: conditionEmployee ? formData.employeeId : null,
      employeeName: conditionEmployee ? formData.employeeName : null,
      employeeAvatar: conditionEmployee ? formData.employeeAvatar : null,
      customerId: conditionCustomer ? formData.customerId : null,
      customerName: conditionCustomer ? formData.customerName : "",
      customerAvatar: conditionCustomer ? formData.customerAvatar : "",
      templateEmailId: conditionTemplateEmail ? formData.templateEmailId : null,
      templateSmsId: conditionTemplateSms ? formData.templateSmsId : null,
    };

    const saveConfig = {
      type: "bell",
      data: changeFormData,
    };

    const body = {
      id: +data?.id,
      config: JSON.stringify(saveConfig),
    };

    const response = await BpmFormArtifactService.updateConfig(body);
    if (response.code === 0) {
      clearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
              !isDifferenceObj(formData, values) ? clearForm(false) : showDialogConfirmCancel();
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

  const clearForm = (acc) => {
    onHide(acc);
    setConfig(null);
    setData(null);
    setDataCustomer(null);
    setDataEmployee(null);
    setFormData(values);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-add-type-bell"
      >
        <form className="form-add-bell-type-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt thông báo`} toggle={() => !isSubmit && clearForm(false)} />
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
                      options={lstTemplateEmail}
                      isLoading={isLoadingTemplateEmail}
                      onMenuOpen={onSelectOpenTemplateEmail}
                      placeholder="Chọn mẫu email"
                      value={formData.templateEmailId}
                      onChange={(e) => handleChangeValueTemplateEmail(e)}
                    />
                  </div>
                )}

                {formData.type.split(",").includes("sms") && (
                  <div className="form-group">
                    <SelectCustom
                      name="templateSmsId"
                      label="Chọn mẫu sms"
                      fill={true}
                      options={lstTemplateSMS}
                      isLoading={isLoadingTemplateSMS}
                      onMenuOpen={onSelectOpenTemplateSMS}
                      placeholder="Chọn mẫu sms"
                      value={formData.templateSmsId}
                      onChange={(e) => handleChangeValueTemplateSMS(e)}
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

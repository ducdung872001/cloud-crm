import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";
import NummericInput from "components/input/numericInput";
import _ from "lodash";
import Checkbox from "components/checkbox/checkbox";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";
import SelectCustom from "components/selectCustom/selectCustom";
import KpiService from "services/KpiService";

export default function ModalConfigContactGoal(props: any) {
  const { onShow, onHide, data, campaignId } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  useEffect(() => {
    if (data && onShow) {
      handleAddEmployee(data.id);
      setDetailEmployee({ value: data.id, label: data.name, departmentName: data.departmentName, branchName: data.branchName });
    }
  }, [data, onShow]);

  const [valueConfig, setValueConfig] = useState([
    {
      name: "Tổng đài (gọi)",
      value: 0,
    },
    {
      name: "Gửi Email",
      value: 0,
    },
    {
      name: "Gửi SMS",
      value: 0,
    },
    {
      name: "Đặt lịch hẹn",
      value: 0,
    },
    {
      name: "Gặp trực tiếp",
      value: 0,
    },
  ]);

  const [formData, setFormData] = useState([]);

  const [actionList, setActionList] = useState([]);
  console.log("actionList", actionList);

  // useEffect(() => {
  //   setActionList(valueConfig);
  //   setIsSubmit(false);

  //   return () => {
  //     setIsSubmit(false);
  //   };
  // }, [valueConfig]);

  const [detailEmployee, setDetailEmployee] = useState(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);

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
                  departmentName: item.departmentName,
                  branchName: item.branchName,
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

  const formatOptionLabelEmployee = ({ label, avatar, departmentName, branchName }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div>
          <div>{label}</div>
          <div>
            <span style={{ fontSize: 10, fontWeight: "200", marginTop: 3 }}>{`${departmentName} (${branchName})`}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    setCheckFieldEmployee(false);
    setDetailEmployee(e);
    handleAddEmployee(e.value);
  };

  const handleAddEmployee = async (employeeId) => {
    const body = {
      campaignId: campaignId,
      employeeId: employeeId,
    };

    const response = await KpiService.addEmployeeToKpiContact(body);

    if (response.code == 0) {
      const result = response.result;
      setActionList(result);
      setFormData(result);
      // showToast( "Thêm nhân viên thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (detailEmployee === null) {
      setCheckFieldEmployee(true);
      return;
    }

    setIsSubmit(true);

    // const body = {
    //     id: formData.values.id,
    //     slaConfig: JSON.stringify(formData.values.slaConfig)
    // };

    // console.log('body', body);

    // const response = await CampaignApproachService.updateSLA(body);
    // if (response.code === 0) {
    //     onHide(true);
    //     showToast(`Cài đặt SLA thành công`, "success");
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //   setIsSubmit(false);
    // }
  };

  const handClearForm = () => {
    // if(!_.isEqual(formData, actionList)){
    //   onHide(true);
    // } else {
    //   onHide(false);
    // }
    if (data) {
      onHide(false);
    } else {
      if (!_.isEqual(formData, actionList)) {
        onHide(true);
      } else {
        onHide(false);
      }
    }
    setDetailEmployee(null);
    setActionList([]);

    // showToast( "Cập nhật chỉ tiêu kpi cho nhân viên thành công", "success");
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
              // _.isEqual(formData, valueConfig) ? handClearForm() : showDialogConfirmCancel();
              handClearForm();
            },
          },
          // {
          //   title: 'Cập nhật',
          //   type: "submit",
          //   color: "primary",
          //   disabled:
          //     isSubmit ||
          //   //   !isDifferenceObj(formData.values, valueSetting),
          //   _.isEqual(formData, valueConfig),
          //   is_loading: isSubmit,
          // },
        ],
      },
    }),
    [isSubmit, actionList]
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
        handClearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleUpdateValueKpiEmployee = async (value, item, index) => {
    const body = {
      ...item,
      value: +value,
    };

    if ((!formData[index].value && !value) || formData[index].value == +value) {
      return;
    }

    // if(!body.value){
    //   showToast( "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //   return;
    // }

    console.log("body", body);

    const response = await KpiService.saveKpiContactEmployee(body);

    if (response.code == 0) {
      // getListGoalKpiEmployee(item.kotId);
      showToast("Cập nhật kpi thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-setting-contact-goal"
        size="lg"
      >
        <form className="form-setting-contact-goal" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt chỉ tiêu tương tác cho nhân viên`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div>
              <div>
                <SelectCustom
                  id="employeeId"
                  name="employeeId"
                  label=""
                  options={[]}
                  fill={true}
                  value={detailEmployee}
                  required={true}
                  onChange={(e) => handleChangeValueEmployee(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn nhân viên"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEmployee}
                  formatOptionLabel={formatOptionLabelEmployee}
                  error={checkFieldEmployee}
                  message="Nhân viên không được bỏ trống"
                />
              </div>

              <div className="container-contact-goal">
                <div className="box-contact-goal">
                  {actionList &&
                    actionList.length > 0 &&
                    actionList.map((item, index) => (
                      <div key={index} className="box-action">
                        <div>
                          <span style={{ fontSize: 14, fontWeight: "400" }}>{item.interactionName}:</span>
                        </div>
                        <div className="form-group">
                          <NummericInput
                            name="value"
                            id="value"
                            thousandSeparator={true}
                            // label="Số lượng thực tế"
                            fill={false}
                            value={!item.value ? "" : item.value}
                            onBlur={(e) => {
                              const value = e.target.value.replace(/\,/g, "");
                              console.log("value", value);

                              handleUpdateValueKpiEmployee(+value, item, index);
                            }}
                            onValueChange={(e) => {
                              const value = e.floatValue;
                              setActionList((current) =>
                                current.map((obj, idx) => {
                                  if (index === idx) {
                                    return { ...obj, value: !value ? null : value };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
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

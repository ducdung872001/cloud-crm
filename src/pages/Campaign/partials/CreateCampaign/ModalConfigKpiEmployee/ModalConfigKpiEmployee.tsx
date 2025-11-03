import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import "./ModalConfigKpiEmployee.scss";
import { ContextType, UserContext } from "contexts/userContext";
import NummericInput from "components/input/numericInput";
import _ from "lodash";
import Checkbox from "components/checkbox/checkbox";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";
import SelectCustom from "components/selectCustom/selectCustom";
import KpiService from "services/KpiService";

export default function ModalConfigKpiEmployee(props: any) {
  const { onShow, onHide, data, kayId } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  useEffect(() => {
    if (data && onShow) {
      setDetailEmployee({ value: data.employeeId, label: data.employeeName, departmentName: data.departmentName, branchName: data.branchName });
      getListGoalKpiEmployee(data.kotId);
    }
  }, [data, onShow]);

  const [listKpiGoal, setListKpiGoal] = useState([]);
  const [sumWeight, setSumWeight] = useState(0);
  useEffect(() => {
    if (listKpiGoal.length > 0) {
      let sumWeight = 0;
      listKpiGoal.map((item) => {
        sumWeight += item.weight;
      });
      setSumWeight(sumWeight);
    }
  }, [listKpiGoal]);

  const [valueConfig, setValueConfig] = useState({
    id: "",
    employeeId: 0,
    kpiGoalList: [],
  });

  const [formData, setFormData] = useState([]);

  // useEffect(() => {
  //   setFormData(listKpiGoal);
  //   setIsSubmit(false);

  //   return () => {
  //     setIsSubmit(false);
  //   };
  // }, [listKpiGoal]);

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
    onHide(true);
  };

  const handleAddEmployee = async (employeeId) => {
    const body = {
      kayId: kayId,
      objectId: employeeId,
      objectType: 1,
    };

    const response = await KpiService.addEmployeeToKpi(body);

    if (response.code == 0) {
      const result = response.result;
      getListGoalKpiEmployee(result.id);
      showToast("Thêm nhân viên thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //lấy danh sách chỉ tiêu của nhân viên

  const getListGoalKpiEmployee = async (kotId) => {
    const body = {
      kotId: kotId,
    };

    const response = await KpiService.listGoalKpiEmployee(body);

    if (response.code == 0) {
      const result = response.result;
      const listGoal = result.map((item) => {
        return {
          id: item.id,
          kpiId: item.kpiId,
          goalId: item.goalId,
          goalName: item.goalName,
          threshold: item.threshold,
          weight: item.weight,
          kotId: item.kotId,
        };
      });
      setListKpiGoal(listGoal);
      setFormData(listGoal);
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
    onHide(false);
    setDetailEmployee(null);
    setListKpiGoal([]);
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
    [isSubmit, formData, valueConfig]
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
      id: item.id,
      kpiId: item.kpiId,
      goalId: item.goalId,
      threshold: +value,
      weight: item.weight,
      kotId: item.kotId,
    };

    if (formData[index].threshold == +value) {
      return;
    }

    console.log("body", body);

    const response = await KpiService.saveKpiEmployee(body);

    if (response.code == 0) {
      getListGoalKpiEmployee(item.kotId);
      showToast("Cập nhật chỉ tiêu kpi thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleUpdateWeightKpiEmployee = async (value, item, index) => {
    const body = {
      id: item.id,
      kpiId: item.kpiId,
      goalId: item.goalId,
      threshold: item.threshold,
      weight: +value,
      kotId: item.kotId,
    };

    if (formData[index].weight == +value) {
      return;
    }

    console.log("body", body);

    const response = await KpiService.saveKpiEmployee(body);

    if (response.code == 0) {
      getListGoalKpiEmployee(item.kotId);
      showToast("Cập nhật chỉ tiêu kpi thành công", "success");
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
        className="modal-setting-KPI"
        size="lg"
      >
        <form className="form-setting-KPI" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt KPI cho nhân viên`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div>
              <div>
                <SelectCustom
                  id="employeeId"
                  name="employeeId"
                  label=""
                  options={[]}
                  fill={true}
                  disabled={data ? true : false}
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

              <div className="container-kpi-goal">
                {listKpiGoal && listKpiGoal.length > 0
                  ? listKpiGoal.map((item, index) => (
                      <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div className="box-kpi-goal">
                          <div className="name-kpi-goal">
                            <span style={{ fontSize: 14, fontWeight: "400" }}>{item.goalName}</span>
                          </div>

                          <div className="box-value">
                            <div style={{ width: "40%" }}>
                              <span style={{ fontSize: 14, fontWeight: "400" }}>Giá trị:</span>
                            </div>
                            <div className="form-group">
                              <NummericInput
                                name="value"
                                id="value"
                                thousandSeparator={true}
                                // label="Số lượng thực tế"
                                fill={false}
                                value={item.threshold === 0 ? "" : item.threshold}
                                onBlur={(e) => {
                                  const value = e.target.value.replace(/\,/g, "");
                                  handleUpdateValueKpiEmployee(+value, item, index);
                                }}
                                onValueChange={(e) => {
                                  const value = e.floatValue;
                                  setListKpiGoal((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        return { ...obj, threshold: value };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                              />
                            </div>
                          </div>

                          <div className="box-weight">
                            <div style={{ width: "70%" }}>
                              <span style={{ fontSize: 14, fontWeight: "400" }}>Trọng số:</span>
                            </div>
                            <div className="form-group">
                              {/* <span className="style-weight">{item.weight}</span> */}
                              <NummericInput
                                name="weight"
                                id="weight"
                                // label="Số lượng thực tế"
                                fill={false}
                                value={item.weight === 0 ? "" : item.weight}
                                onBlur={(e) => {
                                  const value = e.target.value.replace(/\,/g, "");
                                  handleUpdateWeightKpiEmployee(+value, item, index);
                                }}
                                onValueChange={(e) => {
                                  const value = e.floatValue;
                                  setListKpiGoal((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        return { ...obj, weight: value };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                              />
                            </div>
                          </div>

                          <div className="box-percent">
                            <span style={{ fontSize: 14, fontWeight: "400" }}>
                              {sumWeight
                                ? Number.isInteger((item.weight / sumWeight) * 100)
                                  ? (item.weight / sumWeight) * 100
                                  : ((item.weight / sumWeight) * 100).toFixed(1)
                                : 0}
                              %
                            </span>
                          </div>
                        </div>
                        {/* <div className="action__remove--kpi_goal" title="Xóa" 
                                    onClick={() => handleRemoveKpiGoal(index)}
                                >
                                    <Icon name="Trash" />
                                </div> */}
                      </div>
                    ))
                  : null}
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

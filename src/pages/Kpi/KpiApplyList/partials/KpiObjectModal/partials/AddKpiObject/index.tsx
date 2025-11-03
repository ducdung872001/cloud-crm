import React, { useEffect, useMemo, useState, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IKpiObjectModalProps } from "model/kpiObject/PropsModel";
import { IKpiObjectRequest } from "model/kpiObject/KpiObjectRequestModel";
import { IKpiGoalFilterRequest } from "model/kpiGoal/KpiGoalRequestModel";
import Icon from "components/icon";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import KpiObjectService from "services/KpiObjectService";
import KpiGoalService from "services/KpiGoalService";
import KpiSetupService from "services/KpiSetupService";
import { showToast } from "utils/common";

import "./index.scss";
import Radio from "components/radio/radio";
import EmployeeService from "services/EmployeeService";
import DepartmentService from "services/DepartmentService";
import Input from "components/input/input";
import { ContextType, UserContext } from "contexts/userContext";
import ProductService from "services/ProductService";
import ImageThirdGender from "assets/images/third-gender.png";

interface IDataEmployees {
  employee: {
    value: number;
    label: string;
    avatar: string;
  };
  rank: {
    value: number;
    label: string;
  };
}

/**
 * Thêm định nghĩa ngưỡng KPI
 * @param props
 * @returns
 */
export default function AddKpiObject(props: IKpiObjectModalProps) {
  const { data, onReload, infoKpi } = props;

  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [dataGoal, setDataGoal] = useState(null);

  const [tabInfo, setTabInfo] = useState(1);
  const [typeInfo, SetTypeInfo] = useState("0");
  const [dataEmployee, setDataEmployee] = useState(null);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);

  const [dataDepartment, setDataDepartment] = useState([]);
  const [infoRevenue, setInfoRevenue] = useState({
    revenueTarget: "",
    threshold: "",
    weight: "",
  });

  const [infoCall, setInfoCall] = useState({
    callTarget: "",
    threshold: "",
    weight: "",
  });

  console.log("infoRevenue", infoRevenue);

  //! validate

  const [validateThreshold, setValidateThreshold] = useState<boolean>(false);
  const [validateWeight, setValidateWeight] = useState<boolean>(false);

  const values = useMemo(
    () =>
      ({
        kpiId: infoKpi?.idKpi,
        goalId: data?.goalId ?? null,
        threshold: data?.threshold ?? null,
        weight: data?.weight ?? null,
      } as IKpiObjectRequest),
    [data, infoKpi]
  );

  const [formData, setFormData] = useState(values);

  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
    // setFormData({ ...formData, goalId: e.value });
  };

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 100,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result?.items || [];

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
    setDataDepartment(e);
    // setFormData({ ...formData, goalId: e.value });
  };

  //! đoạn này xử lý vấn đề cập nhật chỉ số KPI
  const getDetailKpiGoal = async () => {
    const response = await KpiGoalService.detail(data?.goalId);

    if (response.code === 0) {
      const result = response.result;

      setDataGoal({ value: result.id, label: result.name });
    }
  };

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

  useEffect(() => {
    if (data?.goalId) {
      getDetailKpiGoal();
    }
  }, [data?.goalId]);

  const onSubmitNextStep = () => {
    const body = {
      typeInfo: typeInfo,
      target: typeInfo === "0" ? JSON.stringify(dataEmployee) : JSON.stringify(dataDepartment),
    };

    console.log("body", body);
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();

    // if (!formData?.threshold) {
    //   setValidateThreshold(true);
    //   return;
    // }

    // setIsSubmit(true);

    const body = {
      infoCall: infoCall,
      infoRevenue: infoRevenue,
    };

    // const response = await KpiObjectService.update(body);

    // if (response.code === 0) {
    //   showToast(`${data ? "Cập nhật" : "Thêm mới"} ngưỡng thành công`, "success");
    //   onReload(true);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //   setIsSubmit(false);
    // }
  };

  const handleChangeValueThreshold = (e) => {
    oninput = () => {
      setValidateThreshold(false);
    };
    const value = e.value;
    setFormData({ ...formData, ...{ threshold: +value } });
  };

  const handleChangeValueWeight = (e) => {
    oninput = () => {
      setValidateThreshold(false);
    };
    const value = e.value;
    setFormData({ ...formData, ...{ weight: +value } });
  };

  const tabData = [
    {
      value: 1,
      label: "Chọn đối tượng áp dụng",
    },
    {
      value: 2,
      label: "Chọn đối tượng áp dụng",
    },
  ];

  const typeData = [
    {
      value: "0",
      label: "Cá nhân",
    },
    {
      value: "1",
      label: "Tổ chức",
    },
  ];

  const [lstSetKpi, setLstSetKpi] = useState([]);
  const [dataSetKpi, setDataSetKpi] = useState(null);

  const handPushItemChildren = (id) => {
    const newDataChildren = {
      departmentId: null,
      departmentName: "",
      productId: null,
      productName: "",
      plan: 0,
    };

    setLstSetKpi((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            plannedRevenue: "",
            children: [...item.children, newDataChildren],
          };
        }

        return item;
      })
    );
  };

  const handleGetKpiObject = async (id: number) => {
    if (!id) return;

    const param = {
      kpiId: id,
    };

    const response = await KpiSetupService.list(param);

    if (response.code === 0) {
      const result = response.result;
      const changeResult = result.map((item) => ({ ...item, children: [] }));
      setLstSetKpi(changeResult);
    } else {
      showToast("Chỉ tiêu kpi đang lỗi. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (typeInfo == "1" && infoKpi && infoKpi.setKpiId && dataDepartment && dataDepartment.length > 0) {
      handleGetKpiObject(infoKpi.setKpiId);
    }
  }, [typeInfo, infoKpi, dataDepartment]);

  //TODO: đoạn này xử lý dữ liệu thêm kpi cho phòng ban
  const loadedOptionProduct = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ProductService.list(param);

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

  const formatOptionLabelProduct = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueDepartmentChildren = (e, ids, idPater) => {
    const value = e;

    setLstSetKpi((prev) =>
      prev.map((item) => {
        if (item.id === idPater) {
          return {
            ...item,
            children: item.children.map((el, idx) => {
              if (idx === ids) {
                return {
                  ...el,
                  departmentId: value.value,
                  departmentName: value.label,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleChangeValueProductChildren = (e, ids, idPater) => {
    const value = e;

    setLstSetKpi((prev) =>
      prev.map((item) => {
        if (item.id === idPater) {
          return {
            ...item,
            children: item.children.map((el, idx) => {
              if (idx === ids) {
                return {
                  ...el,
                  productId: value.value,
                  productName: value.label,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleChangePlanChildren = (e, ids, idPater) => {
    const value = e.floatValue;

    setLstSetKpi((prev) =>
      prev.map((item) => {
        if (item.id === idPater) {
          return {
            ...item,
            children: item.children.map((el, idx) => {
              if (idx === ids) {
                return {
                  ...el,
                  plan: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleClearItemChildren = (ids, idPater) => {
    setLstSetKpi((prev) =>
      prev.map((item) => {
        if (item.id === idPater) {
          return {
            ...item,
            children: item.children.filter((el, idx) => idx !== ids),
          };
        }

        return item;
      })
    );
  };

  const handleChangeValuePlannedRevenue = (e, id) => {
    setLstSetKpi((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            plannedRevenue: e.floatValue,
          };
        }

        return item;
      })
    );
  };

  const [hasMoneyPlan, setHasMoneyPlan] = useState<boolean>(false);

  return (
    <form className="form__add--kpi-object" onSubmit={onSubmit}>
      <div className="header-box">
        <div style={{ width: "47%", justifyContent: "center", display: "flex" }}>
          <span style={tabInfo === 2 ? { color: "#d3d5d7" } : {}}>Chọn đối tượng áp dụng</span>
        </div>
        <div className="icon-arrow">
          <Icon name="RightArrow" />
        </div>
        <div style={{ width: "47%", justifyContent: "center", display: "flex" }}>
          <span style={tabInfo === 1 ? { color: "#d3d5d7" } : {}}>Thiết lập ngưỡng</span>
        </div>
      </div>

      {/* {hasMoneyPlan && <div className="">hehe</div>} */}

      {tabInfo === 1 ? (
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", width: "100%", marginTop: 30 }}>
            {typeData.map((item, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center", marginRight: 40, cursor: "pointer" }}
                onClick={() => {
                  SetTypeInfo(item.value);
                  if (typeInfo == "0") {
                    setDataEmployee(null);
                  } else if (typeInfo == "1") {
                    setDataDepartment([]);
                  }
                }}
              >
                <div className="radio">
                  <Radio
                    // value={item.isPrimary}
                    checked={item.value == typeInfo}
                    // defaultChecked={defaultValue && defaultValue === option.value}
                    // name={name}
                    disabled={false} // true
                    onChange={(e) => {
                      //
                    }}
                    onClick={(e) => {
                      //
                    }}
                  />
                </div>
                <span style={{ fontSize: 14 }}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="list-form-group">
            {typeInfo == "0" ? (
              <div className="form-group">
                <SelectCustom
                  key="0"
                  fill={true}
                  id="employeeId"
                  name="employeeId"
                  label="Chọn cá nhân"
                  options={[]}
                  isMulti={true}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn cá nhân"
                  additional={{
                    page: 1,
                  }}
                  value={dataEmployee}
                  onChange={(e) => handleChangeValueEmployee(e)}
                  loadOptionsPaginate={loadedOptionEmployee}
                  error={checkFieldEmployee}
                />
              </div>
            ) : (
              <div className="form-group">
                <SelectCustom
                  key="1"
                  fill={true}
                  id="departmentId"
                  name="departmentId"
                  label="Chọn phòng ban"
                  isMulti={true}
                  options={[]}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn phòng ban"
                  additional={{
                    page: 1,
                  }}
                  value={dataDepartment}
                  onChange={(e) => handleChangeValueDepartment(e)}
                  loadOptionsPaginate={loadedOptionDepartment}
                  error={checkFieldEmployee}
                />
              </div>
            )}

            {/* <div className="form-group">
              <div className="wrapper__workload">
                <NummericInput
                  id="threshold"
                  name="threshold"
                  label="KPI mục tiêu"
                  value={formData?.threshold}
                  fill={true}
                  placeholder="Nhập KPI mục tiêu"
                  required={true}
                  onValueChange={(e) => handleChangeValueThreshold(e)}
                  
                />
              </div>
            </div>
            <div className="form-group">
              <div className="wrapper__workload">
                <NummericInput
                  id="weight"
                  name="weight"
                  label="Trọng số KPI"
                  value={formData?.weight}
                  fill={true}
                  placeholder="Nhập trọng số KPI"
                  required={true}
                  onValueChange={(e) => handleChangeValueWeight(e)}
                />
              </div>
            </div> */}
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", marginTop: 30 }}>
          {dataDepartment && dataDepartment.length > 0 && infoKpi.setKpiName && lstSetKpi && (
            <div className="box__set--kpi">
              <div className="form-group">
                <Input
                  value={infoKpi.setKpiName}
                  fill={true}
                  label="Bộ chỉ tiêu"
                  disabled={true}
                  icon={<Icon name="ChevronDown" />}
                  iconPosition="right"
                />
              </div>

              {lstSetKpi && lstSetKpi.length > 0 && (
                <div className="lst__item--kpi">
                  {lstSetKpi.map((item, idx) => {
                    return (
                      <div key={idx} className="item__set--kpi" onClick={() => setDataSetKpi(item)}>
                        <div className="pater__kpi">
                          <div className="info__kpi">
                            <div className="form-group">
                              <Input value={item.goalName} fill={true} disabled={true} />
                            </div>
                            <div className="form-group">
                              <NummericInput
                                name="plannedRevenue"
                                value={item.plannedRevenue}
                                thousandSeparator={true}
                                fill={true}
                                placeholder="Giá trị được giao"
                                onValueChange={(e) => handleChangeValuePlannedRevenue(e, item.id)}
                                icon={<Icon name="Eye" />}
                                iconPosition="right"
                                iconClickEvent={() => setHasMoneyPlan(!hasMoneyPlan)}
                              />
                            </div>
                            <div className="form-group">
                              <Input value={item.weight} fill={true} disabled={true} />
                            </div>
                          </div>
                          <div
                            className="action-kpi"
                            onClick={() => {
                              handPushItemChildren(item.id);
                            }}
                          >
                            <Icon name="PlusCircleFill" />
                          </div>
                        </div>

                        {dataSetKpi &&
                          dataSetKpi.id === item.id &&
                          item.children.length > 0 &&
                          item.children.map((el, ids) => {
                            return (
                              <div key={ids} className="item__children--kpi">
                                <div className="info__children">
                                  <div className="form-group">
                                    <SelectCustom
                                      key={"departmentIdChildren"}
                                      name="departmentId"
                                      value={el.departmentId ? { label: el.departmentName, value: el.departmentId } : ""}
                                      options={[]}
                                      fill={true}
                                      placeholder="Chọn phòng ban"
                                      onChange={(e) => handleChangeValueDepartmentChildren(e, ids, item.id)}
                                      additional={{
                                        page: 1,
                                      }}
                                      isAsyncPaginate={true}
                                      loadOptionsPaginate={loadedOptionDepartment}
                                    />
                                  </div>

                                  <div className="form-group">
                                    <SelectCustom
                                      key={"productId"}
                                      id="productId"
                                      name="productId"
                                      fill={true}
                                      options={[]}
                                      value={el.productId ? { label: el.productName, value: el.productId } : ""}
                                      onChange={(e) => handleChangeValueProductChildren(e, ids, item.id)}
                                      isFormatOptionLabel={true}
                                      isAsyncPaginate={true}
                                      placeholder="Chọn sản phẩm"
                                      additional={{
                                        page: 1,
                                      }}
                                      loadOptionsPaginate={loadedOptionProduct}
                                      formatOptionLabel={formatOptionLabelProduct}
                                    />
                                  </div>

                                  <div className="form-group">
                                    <NummericInput
                                      name="plan"
                                      value={el.plan || ""}
                                      fill={true}
                                      placeholder="Nhập số được giao"
                                      onValueChange={(e) => handleChangePlanChildren(e, ids, item.id)}
                                    />
                                  </div>
                                </div>

                                <div className="action__children" onClick={() => handleClearItemChildren(ids, item.id)}>
                                  <Icon name="Trash" />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* <div>
            <Input
              fill={true}
              required={true}
              name=""
              label="Chỉ tiêu doanh thu"
              value={infoRevenue.revenueTarget}
              onChange={(e) => setInfoRevenue({ ...infoRevenue, revenueTarget: e.target.value })}
              placeholder="Chỉ tiêu doanh thu"
            />
          </div> */}

          {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 15 }}>
            <div style={{ width: "48%" }}>
              <NummericInput
                fill={true}
                required={true}
                name=""
                label="Ngưỡng"
                value={infoRevenue.threshold}
                onChange={(e) => setInfoRevenue({ ...infoRevenue, threshold: e.target.value })}
                placeholder="Nhập ngưỡng"
              />
            </div>
            <div style={{ width: "48%" }}>
              <NummericInput
                fill={true}
                name=""
                required={true}
                label="Trọng số"
                value={infoRevenue.weight}
                onChange={(e) => setInfoRevenue({ ...infoRevenue, weight: e.target.value })}
                placeholder="Nhập trọng số"
              />
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <Input
              fill={true}
              required={true}
              name=""
              label="Chỉ tiêu cuộc gọi"
              value={infoCall.callTarget}
              onChange={(e) => setInfoCall({ ...infoCall, callTarget: e.target.value })}
              placeholder="Chỉ tiêu doanh thu"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 15 }}>
            <div style={{ width: "48%" }}>
              <NummericInput
                fill={true}
                required={true}
                name=""
                label="Ngưỡng"
                value={infoCall.threshold}
                onChange={(e) => setInfoCall({ ...infoCall, threshold: e.target.value })}
                placeholder="Nhập ngưỡng"
              />
            </div>
            <div style={{ width: "48%" }}>
              <NummericInput
                fill={true}
                required={true}
                name=""
                label="Trọng số"
                value={infoCall.weight}
                onChange={(e) => setInfoCall({ ...infoCall, weight: e.target.value })}
                placeholder="Nhập trọng số"
              />
            </div>
          </div> */}
        </div>
      )}

      <div className="button-box">
        {tabInfo === 1 ? (
          <Button
            type="button"
            onClick={() => {
              setTabInfo(2);
              onSubmitNextStep();
            }}
          >
            Tiếp tục
            <Icon name="RightArrow" />
          </Button>
        ) : (
          <div style={{ display: "flex" }}>
            <div className="btn-back">
              <Button type="button" color="primary" variant="outline" onClick={() => setTabInfo(1)}>
                Quay lại
              </Button>
            </div>

            <Button type="button" onClick={onSubmit}>
              Hoàn thành
            </Button>
          </div>
        )}
      </div>

      {/* <Button
        type="submit"
        className="btn__next"
        disabled={
          isSubmit ||
          validateThreshold ||
          validateWeight ||
          !isDifferenceObj(formData, values)
        }
      >
        Tiếp tục
      </Button> */}
    </form>
  );
}

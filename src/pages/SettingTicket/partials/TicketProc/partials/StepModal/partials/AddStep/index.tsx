import React, { useEffect, useMemo, useState, useRef } from "react";
import { isDifferenceObj } from "reborn-util";
import { IOption } from "model/OtherModel";
import { IStepModalProps } from "model/ticketStep/PropsModel";
import { ITicketStepRequest } from "model/ticketStep/TicketStepRequestModel";
import { IDepartmentFilterRequest } from "model/department/DepartmentRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import ImageThirdGender from "assets/images/third-gender.png";
import TicketStepService from "services/TicketStepService";
import DepartmentService from "services/DepartmentService";
import { showToast } from "utils/common";
import { useOnClickOutside } from "utils/hookCustom";
import RadioList from "components/radio/radioList";
import EmployeeService from "services/EmployeeService";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";

import "./index.scss";

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
 * Thêm bước xử lý
 * @param props 
 * @returns 
 */
export default function AddStep(props: IStepModalProps) {
  const { data, onReload, infoProc } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [dataDepartment, setDataDepartment] = useState(null);
  const [dataPrevDepartment, setDataPrevDepartment] = useState(null);

  //! validate
  const [checkFieldDepartment, setCheckFieldDepartment] = useState<boolean>(false);
  const [checkFieldPrevDepartment, setCheckFieldPrevDepartment] = useState<boolean>(false);
  const [validatePeriod, setValidatePeriod] = useState<boolean>(false);
  const [isOptionUnit, setIsOptionUnit] = useState<boolean>(false);
  const [listEmployees, setListEmployees] = useState<IDataEmployees[]>([{ employee: null, rank: { label: "Khá", value: 6 } }]);  
  const [checkFieldEmployees, setCheckFieldEmployees] = useState<boolean>(false);
  const [lstIdEmployee, setLstIdEmployee] = useState([]);
  const [isOptionRank, setIsOptionRank] = useState<boolean>(false);
  const [indexSale, setIndexSale] = useState<number>(null);

  const refOptionSpecialize = useRef();
  const refContainerSpecialize = useRef();

  const refOptionUnit = useRef();
  const refContainerUnit = useRef();

  const [dataUnit, setDataUnit] = useState({
    value: "D",
    label: "Ngày",
  });
  useOnClickOutside(refOptionUnit, () => setIsOptionUnit(false), ["option__time--time"]);

  const values = useMemo(
    () =>
    ({
      procId: infoProc?.idProc,
      departmentId: data?.departmentId ?? null,
      period: data?.period ?? null,
      unit: data?.unit ?? null,
      prevId: data?.prevId ?? null,
      divisionMethod: data?.divisionMethod?.toString() ?? null,
      employees: data?.employees ?? "[]",
    } as ITicketStepRequest),
    [data, infoProc]
  );

  useEffect(() => {
    if (data?.employees) {
      const takeEmployees = JSON.parse(data?.employees || "[]");

      if (takeEmployees?.length > 0) {
        const result = takeEmployees.map((item) => {
          return {
            employee: {
              value: item.employeeId,
              label: item.employeeName,
              avatar: item.employeeAvatar,
            },

            rank: {
              value: item.rank,
              label: item.rank == 5 ? "Trung bình" : item.rank == 6 ? "Khá" : item.rank == 8 ? "Tốt" : "Xuất sắc",
            },
          };
        });

        setListEmployees(result);
      }
    }
  }, [data?.employees])

  const [formData, setFormData] = useState(values);

  //! đoạn này xử lý phòng ban (đích)
  const handleChangeValueDepartment = (e) => {
    setDataDepartment(e);
    setCheckFieldDepartment(false);
    setFormData({ ...formData, departmentId: e.value });
  };

  //! đoạn này xử lý phòng ban (nguồn)
  const handleChangeValuePrevDepartment = (e) => {
    setDataPrevDepartment(e);
    setFormData({ ...formData, prevId: e.value });
  };

  const formatOptionLabelEmployees = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const rankData = [
    {
      label: "Trung bình",
      value: 5,
    },
    {
      label: "Khá",
      value: 6,
    },
    {
      label: "Tốt",
      value: 8,
    },
    {
      label: "Xuất sắc",
      value: 10,
    },
  ];

  //! Xóa đi một người hỗ trợ
  const handleRemoveEmployee = (idx) => {
    const result = [...listEmployees];
    result.splice(idx, 1);
    setListEmployees(result);
    setLstIdEmployee(() => {
      return result.map((item) => item.employee?.value);
    });
  };

  const listOptionUnit = [
    {
      value: "D",
      label: "Ngày",
    },
    {
      value: "H",
      label: "Giờ",
    },
    {
      value: "M",
      label: "Phút",
    },
  ];

  const loadedOptionDepartment = async (search, loadedOptions, { page }) => {
    const param: IDepartmentFilterRequest = {
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
                label: item.name
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

  const handleChangeValueEmployees = (e, idx) => {
    setCheckFieldEmployees(false);

    setListEmployees((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, employee: e };
        }
        return obj;
      })
    );
  };

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployees = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = (response.result.items || []).filter((item) => {
        return !lstIdEmployee.some((el) => el === item.id);
      });

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

  //! đoạn này xử lý vấn đề hiển thị hình ảnh phòng ban
  const formatOptionLabelDepartment = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý vấn đề cập nhật phòng ban
  const getDetailDepartment = async () => {
    const response = await DepartmentService.detail(data?.departmentId);

    if (response.code === 0) {
      const result = response.result;

      setDataDepartment({ value: result.id, label: result.name, avatar: result.avatar });
    }
  };

  const getDetailPrevDepartment = async () => {
    const response = await DepartmentService.detail(data?.prevId);

    if (response.code === 0) {
      const result = response.result;

      setDataPrevDepartment({ value: result.id, label: result.name, avatar: result.avatar });
    }
  };

  useEffect(() => {
    if (data?.departmentId) {
      getDetailDepartment();
    }
  }, [data?.departmentId]);

  useEffect(() => {
    if (data?.prevId) {
      getDetailPrevDepartment();
    }
  }, [data?.prevId]);

  useEffect(() => {
    switch (data?.unit) {
      case "D":
        setDataUnit({ value: "D", label: "Ngày" });
        break;
      case "H":
        setDataUnit({ value: "H", label: "Giờ" });
        break;
      case "M":
        setDataUnit({ value: "M", label: "Phút" });
        break;
    }
  }, [data?.unit])

  useEffect(() => {
    if (listEmployees.length > 0) {
      const result = listEmployees.map((item) => {
        return {
          employeeId: item.employee?.value,
          employeeName: item.employee?.label,
          employeeAvatar: item.employee?.avatar,
          rank: item.rank?.value,
        };
      });

      setFormData({ ...formData, ...({ employees: JSON.stringify(result) }) });
    }
  }, [listEmployees]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (!formData?.period) {
      setValidatePeriod(true);
      return;
    }

    const checkEmtySales = listEmployees.filter((item) => item.employee == null);
    if (checkEmtySales.length > 0) {
      setCheckFieldEmployees(true);
      return;
    }

    setIsSubmit(true);

    const body: ITicketStepRequest = {
      ...(formData as ITicketStepRequest),
      ...(data ? { id: data.id } : {}),
      unit: dataUnit?.value
    };

    const response = await TicketStepService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} bước thành công`, "success");
      onReload(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handleChangeValueTime = (e) => {
    oninput = () => {
      setValidatePeriod(false);
    };
    const value = e.value;
    setFormData({ ...formData, ...({ period: +value }) });
  };

  return (
    <form className="form__add--step" onSubmit={onSubmit}>
      <div className="list-form-group">
        <div className="form-group">
          <Input fill={true} value={infoProc?.nameProc || ""} label="Quy trình" disabled={true} />
        </div>
        <div className="form-group">
          <SelectCustom
            fill={true}
            id="prevId"
            name="prevId"
            label="Phòng ban chuyển"
            options={[]}
            isAsyncPaginate={true}
            isFormatOptionLabel={true}
            placeholder="Chọn phòng ban chuyển đến"
            additional={{
              page: 1,
            }}
            value={dataPrevDepartment}
            onChange={(e) => handleChangeValuePrevDepartment(e)}
            loadOptionsPaginate={loadedOptionDepartment}
            formatOptionLabel={formatOptionLabelDepartment}
            error={checkFieldDepartment}
          />
        </div>
        <div className="form-group">
          <SelectCustom
            fill={true}
            id="departmentId"
            name="departmentId"
            label="Phòng ban nhận"
            options={[]}
            required={true}
            isAsyncPaginate={true}
            isFormatOptionLabel={true}
            placeholder="Chọn phòng ban tiếp nhận"
            additional={{
              page: 1,
            }}
            value={dataDepartment}
            onChange={(e) => handleChangeValueDepartment(e)}
            loadOptionsPaginate={loadedOptionDepartment}
            formatOptionLabel={formatOptionLabelDepartment}
            error={checkFieldDepartment}
            message="Phòng ban tiếp nhận không được bỏ trống"
          />
        </div>
        <div className="form-group">
          <div className="wrapper__workload">
            <NummericInput
              id="expireTime"
              name="expireTime"
              label="Thời gian xử lý"
              value={formData?.period}
              fill={true}
              placeholder="Nhập thời gian xử lý"
              required={true}
              error={validatePeriod || (formData?.period <= 0)}
              message={`${validatePeriod
                ? "Vui lòng nhập thời gian"
                : formData?.period <= 0
                  ? "Thời gian cần lớn hơn 0"
                  : ""
                }`}
              onValueChange={(e) => handleChangeValueTime(e)}
            />

            <div className="option__time" ref={refContainerUnit}>
              <div
                className="selected__item--time"
                onClick={() => {
                  setIsOptionUnit(!isOptionUnit);
                }}
              >
                {dataUnit.label}
                <Icon name="ChevronDown" />
              </div>
              {isOptionUnit && (
                <ul className="menu__time" ref={refOptionUnit}>
                  {listOptionUnit.map((item, idx) => (
                    <li
                      key={idx}
                      className={`item--time ${dataUnit.value === item.value ? "active__item--time" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setDataUnit(item);
                        setIsOptionUnit(false);
                      }}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="form-group">
          <RadioList
            options={[
              {
                value: "1",
                label: "Giao thủ công",
              },
              {
                value: "2",
                label: "Giao vòng tròn",
              },
              {
                value: "3",
                label: "Giao cân bằng",
              },
            ]}
            title={"Phân chia Hỗ trợ"}
            value={formData?.divisionMethod}
            required={true}
            name={"divisionMethod"}
            onChange={(e) => {
              setFormData({ ...formData, ...({ divisionMethod: e.target.value }) });
            }}
          />
        </div>
        <div className="form-group"> 
          <div className="wrapper__employees">
            <h4>Danh sách người hỗ trợ</h4>

            <div className="list__employees">
              <div
                className="action__add--employees"
                onClick={() => setListEmployees([...listEmployees, { employee: null, rank: { label: "Khá", value: 6 } }])}
              >
                <Icon name="PlusCircleFill" />
                Thêm người hỗ trợ
              </div>

              {/* listEmployees  => Danh sách người hỗ trợ */}
              {listEmployees.map((item, idx) => {
                return (
                  <div key={idx} className="item__employees">
                    <div className="info__detail--sale">
                      <SelectCustom
                        id="employeeId"
                        name="employeeId"
                        options={[]}
                        fill={true}
                        value={item.employee}
                        required={true}
                        onChange={(e) => handleChangeValueEmployees(e, idx)}
                        isAsyncPaginate={true}
                        isFormatOptionLabel={true}
                        placeholder="Chọn người hỗ trợ"
                        additional={{
                          page: 1,
                        }}
                        loadOptionsPaginate={loadedOptionEmployees}
                        formatOptionLabel={formatOptionLabelEmployees}
                        error={item.employee ? false : checkFieldEmployees}
                        message="Vui lòng chọn người hỗ trợ"
                      />

                      <div
                        className={`option__rank ${isOptionRank && indexSale == idx ? "prioritize" : ""}`}
                        ref={refContainerSpecialize}
                        style={item.employee ? { height: "3.95rem" } : { height: "3.8rem" }}
                      >
                        <div
                          className="select__rank"
                          onClick={() => {
                            setIsOptionRank(!isOptionRank);
                            setIndexSale(idx);
                          }}
                        >
                          {item.rank?.label}
                          <Icon name="ChevronDown" />
                        </div>

                        {isOptionRank && indexSale == idx && (
                          <ul className="menu__option--rank" ref={refOptionSpecialize}>
                            {rankData.map((el, index) => (
                              <li
                                key={index}
                                className={`item--rank ${item.rank?.value === el.value ? "active__item--rank" : ""}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setListEmployees((current) =>
                                    current.map((obj, i) => {
                                      if (i === idx) {
                                        return { ...obj, rank: el };
                                      }
                                      return obj;
                                    })
                                  );
                                  setIsOptionRank(false);
                                }}
                              >
                                {el.label}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {listEmployees.length > 1 && (
                      <div className="action__remove--sale" title="Xóa" onClick={() => handleRemoveEmployee(idx)}>
                        <Icon name="Trash" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="btn__add--step"
        disabled={
          isSubmit ||
          checkFieldDepartment ||
          checkFieldPrevDepartment ||
          validatePeriod ||
          !isDifferenceObj(formData, values)
        }
      >
        {data ? "Cập nhật" : "Thêm mới"}
        {isSubmit ? <Icon name="Loading" /> : null}
      </Button>
    </form>
  );
}

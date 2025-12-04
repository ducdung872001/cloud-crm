import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext, useRef } from "react";
import moment from "moment";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IAddConsultationScheduleModalProps } from "model/scheduleConsultant/PropsModel";
import { IServiceFilterRequest } from "model/service/ServiceRequestModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { IScheduleConsultantResponseModelProps } from "model/scheduleConsultant/ScheduleConsultantResponseModel";
import { IScheduleConsultantRequestModelProps } from "model/scheduleConsultant/ScheduleConsultantRequestModel";
import ImageThirdGender from "assets/images/third-gender.png";
import { ContextType, UserContext } from "contexts/userContext";
import Icon from "components/icon";
import Input from "components/input/input";
import Switch from "components/switch/switch";
import CheckboxList from "components/checkbox/checkboxList";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Button from "components/button/button";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { listTimeSlots, showToast } from "utils/common";
import { listDay, listHour, listMinute, listNotificationType, listOption } from "../MockData";
import CustomerService from "services/CustomerService";
import EmployeeService from "services/EmployeeService";
import ServiceService from "services/ServiceService";
import ScheduleConsultantService from "services/ScheduleConsultantService";
import "./AddConsultationScheduleModal.scss";
import ModalAddCustomerArrivedConsultation from "../ModalAddCustomerArrived/ModalConsulation";

interface IDataListNotificationProps {
  method: string[];
  time: {
    day: number;
    hour: number;
    minute: number;
  };
}

export default function AddConsultationScheduleModal(props: IAddConsultationScheduleModalProps) {
  const { startDate, endDate, onShow, onHide, idData, idCustomer, dataOpp } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const refOptionDecisionTime = useRef();
  const refContainerDecisionTime = useRef();

  const { id, dataBranch } = useContext(UserContext) as ContextType;

  const [detailEmployee, setDetailEmployee] = useState(null);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [showDialogConfirmCustomerArrived, setShowDialogConfirmCustomerArrived] = useState<boolean>(false);
  const [contentDialogConfirmCustomerArrived, setContentDialogConfirmCustomerArrived] = useState<IContentDialog>(null);
  const [isSubmittingCustomerArrived, setIsSubmittingCustomerArrived] = useState<boolean>(false);
  const [showModalCustomerArrived, setShowModalCustomerArrived] = useState<boolean>(false);
  const [isReloadingFromChild, setIsReloadingFromChild] = useState<boolean>(false);

  const [valueDecisionTime, setValueDecisionTime] = useState({
    value: "3",
    label: "Phút",
  });
  const [valueTime, setValueTime] = useState(null);
  const [isOptionDecisionTime, setIsOptionDecisionTime] = useState<boolean>(false);
  useOnClickOutside(refOptionDecisionTime, () => setIsOptionDecisionTime(false), ["decision-time"]);

  useEffect(() => {
    if (valueDecisionTime) {
      setValueTime(valueDecisionTime.value == "1" ? listDay[0] : valueDecisionTime.value == "2" ? listHour[0] : listMinute[0]);
    }
  }, [valueDecisionTime]);

  const handleChangeValueTime = (e) => {
    setValueTime(e);
  };

  const [data, setData] = useState<IScheduleConsultantResponseModelProps>(null);

  const [dataListNotification, setDataListNotification] = useState<IDataListNotificationProps[]>([]);

  const [dataApplyNotification, setDataApplyNotification] = useState({
    method: [],
    time: { day: 0, hour: 0, minute: 0 },
  });

  useEffect(() => {
    if (valueTime && valueDecisionTime) {
      if (valueDecisionTime.value == "1") {
        setDataApplyNotification({ ...dataApplyNotification, time: { day: +valueTime.value, hour: 0, minute: 0 } });
      } else if (valueDecisionTime.value == "2") {
        setDataApplyNotification({ ...dataApplyNotification, time: { day: 0, hour: +valueTime.value, minute: 0 } });
      } else {
        setDataApplyNotification({ ...dataApplyNotification, time: { day: 0, hour: 0, minute: +valueTime.value } });
      }
    }
  }, [valueTime, valueDecisionTime]);

  const handleChangeValueNofiType = (e) => {
    setDataApplyNotification({ ...dataApplyNotification, method: e ? e.split(",") : [] });
  };

  const handApplyNotification = () => {
    if (dataApplyNotification.method.length > 0) {
      setDataListNotification([...dataListNotification, dataApplyNotification]);
      setValueDecisionTime({
        value: "3",
        label: "Phút",
      });
      setDataApplyNotification({ ...dataApplyNotification, method: [] });
    }
  };

  //! xử lý xóa thông báo
  const handleRemoveApplyNotification = (idx) => {
    //? đoạn này dùng toán tử (...) trong ES6 để tránh modify trực tiếp mảng ban đầu
    const newApplyNotification = [...dataListNotification];
    newApplyNotification.splice(idx, 1);
    setDataListNotification(newApplyNotification);
  };

  //fill mặc định nhân viên thực hiện khi thêm mới lịch điều trị
  const getTakeDefaultConsultant = async () => {
    const response = await EmployeeService.list();

    if (response.code === 0) {
      const result = response.result.items;

      const takeEmployee = result.find((item) => item.userId === id);
      setDetailEmployee({
        value: takeEmployee?.id,
        label: takeEmployee?.name,
        avatar: takeEmployee?.avatar,
      });
    }
  };

  useEffect(() => {
    if (!idData && onShow) {
      getTakeDefaultConsultant();
    }
  }, [idData, onShow]);

  const getDetailDataItem = async (idData: number) => {
    const response = await ScheduleConsultantService.detail(idData);

    if (response.code == 0) {
      const result = response.result;
      const takeServiceResponse = (result.lstService || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        };
      });

      setDetailService(takeServiceResponse);

      const takeNotification = result.notification ? JSON.parse(result.notification) : [];
      setDataListNotification(takeNotification);

      setData({
        id: result.id,
        title: result.title,
        consultantId: result.consultantId,
        services: result.services,
        content: result.content,
        customerId: result.customerId,
        note: result.note,
        startTime: result.startTime,
        endTime: result.endTime,
        type: result.type,
        notification: result.notification,
      });
    }
  };

  useEffect(() => {
    if (idData && onShow) {
      getDetailDataItem(idData);
    }
  }, [idData, onShow]);

  const values = useMemo(
    () =>
    ({
      title: data?.title ?? "",
      consultantId: data?.consultantId ?? detailEmployee?.value,
      services: data?.services ?? "[]",
      content: data?.content ?? "",
      customerId: data?.customerId ?? idCustomer ?? null,
      note: data?.note ?? "",
      startTime: idData ? data?.startTime : startDate,
      endTime: idData ? data?.endTime : endDate,
      type: data?.type?.toString() ?? "1",
      notification: data?.notification ?? "[]",
    } as IScheduleConsultantRequestModelProps),
    [onShow, data, startDate, endDate, idData, detailEmployee]
  );

  const validations: IValidation[] = [
    {
      name: "startTime",
      rules: "required",
    },
    {
      name: "endTime",
      rules: "required",
    },
    {
      name: "title",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // khách hàng
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [checkFieldCustomer, setCheckFieldCustomer] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách khách hàng
  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
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
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: `${item.name} - ${item.phoneMasked}`,
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
    setCheckFieldCustomer(false);
    setDetailCustomer(e);
  };

  const getDetailCustomer = async () => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(data?.customerId || idCustomer);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: `${result.name} - ${result.phoneMasked}`,
        avatar: result.avatar,
      };

      setDetailCustomer(detailData);
    }

    setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (detailCustomer) {
      setFormData({ ...formData, values: { ...formData?.values, customerId: detailCustomer.value } });
    }
  }, [detailCustomer]);

  useEffect(() => {
    if ((data?.customerId || idCustomer) && onShow) {
      getDetailCustomer();
    }
  }, [data?.customerId, onShow, idCustomer]);

  // nhân viên
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
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
    setCheckFieldEmployee(false);
    setDetailEmployee(e);
  };

  const getDetailEmployee = async () => {
    setIsLoadingEmployee(true);
    const response = await EmployeeService.detail(data?.consultantId);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      };

      setDetailEmployee(detailData);
    }
    setIsLoadingEmployee(false);
  };

  useEffect(() => {
    if (detailEmployee) {
      setFormData({ ...formData, values: { ...formData?.values, consultantId: detailEmployee.value } });
    }
  }, [detailEmployee]);

  useEffect(() => {
    if (data?.consultantId && onShow) {
      getDetailEmployee();
    }
  }, [data?.consultantId, onShow]);

  // dịch vụ
  const [detailService, setDetailService] = useState(null);

  const loadedOptionService = async (search, loadedOptions, { page }) => {
    const param: IServiceFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ServiceService.filter(param);

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

  const handleChangeValueService = (e) => {
    setDetailService(e);
  };

  //* đoạn này hiển thị hình ảnh người tham gia
  const formatOptionLabelService = ({ label, avatar }) => {
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
    if (detailService && detailService?.length > 0) {
      const takeIdService = detailService.map((item) => item.value);
      setFormData({ ...formData, values: { ...formData?.values, services: JSON.stringify(takeIdService) } });
    }
  }, [detailService]);

  useEffect(() => {
    if (dataListNotification.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, notification: JSON.stringify(dataListNotification) } });
    }
  }, [dataListNotification]);

  useEffect(() => {
    if (formData?.values?.type == "2") {
      setFormData({ ...formData, values: { ...formData?.values, notification: JSON.stringify([]) } });
    }
  }, [formData?.values?.type]);

  const addTimePeriodicSchedule = {
    start: "",
    end: "",
  };

  const defaultPeriodicSchedule = [
    {
      name: "Chủ nhật",
      code: "cn",
      time: [],
    },
    {
      name: "Thứ 2",
      code: "t2",
      time: [],
    },
    {
      name: "Thứ 3",
      code: "t3",
      time: [],
    },
    {
      name: "Thứ 4",
      code: "t4",
      time: [],
    },
    {
      name: "Thứ 5",
      code: "t5",
      time: [],
    },
    {
      name: "Thứ 6",
      code: "t6",
      time: [],
    },
    {
      name: "Thứ 7",
      code: "t7",
      time: [],
    },
  ];

  // Thời gian bắt đầu và kết thúc
  const intervalMinutes = 15;
  const startTime = moment(new Date()).startOf("day");
  const endTime = moment(new Date()).endOf("day");
  const timeSlots = listTimeSlots(startTime, endTime, intervalMinutes);

  const [lstPeriodicSchedule, setLstPeriodicSchedule] = useState(defaultPeriodicSchedule);

  const refOptionStartTime = useRef();
  const refContainerStartTime = useRef();

  const refOptionEndTime = useRef();
  const refContainerEndTime = useRef();

  const [isChooseStartTime, setIsChooseStartTime] = useState<boolean>(false);
  const [isChooseEndTime, setIsChooseEndTime] = useState<boolean>(false);

  useOnClickOutside(refOptionStartTime, () => setIsChooseStartTime(false), ["choose__start--time"]);
  useOnClickOutside(refOptionEndTime, () => setIsChooseEndTime(false), ["choose__end--time"]);

  const handleAddItemTimeEmpty = (idx) => {
    setLstPeriodicSchedule((prev) =>
      prev.map((item, index) => {
        if (index === idx) {
          return {
            ...item,
            time: [addTimePeriodicSchedule],
          };
        }

        return item;
      })
    );
  };

  const handleChangeStartTime = (e, index, idx) => {
    const value = e.target.value;

    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time].map((el, k) => {
              if (k === index) {
                return {
                  ...el,
                  start: value,
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

  const handleChooseStartTime = (value, index, idx) => {
    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time].map((el, k) => {
              if (k === index) {
                return {
                  ...el,
                  start: value,
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

  const handleChangeEndTime = (e, index, idx) => {
    const value = e.target.value;

    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time].map((el, k) => {
              if (k === index) {
                return {
                  ...el,
                  end: value,
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

  const handleChooseEndTime = (value, index, idx) => {
    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time].map((el, k) => {
              if (k === index) {
                return {
                  ...el,
                  end: value,
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

  const handleAddItemTime = (idx) => {
    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time, defaultPeriodicSchedule],
          };
        }

        return item;
      })
    );
  };

  const handleDeleteItemTime = (index, idx) => {
    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time].filter((_, k) => k !== index),
          };
        }

        return item;
      })
    );
  };

  const [hasPeriodicSchedule, setHasPeriodicSchedule] = useState<boolean>(true);

  const listField = useMemo(
    () =>
      [
        {
          label: "Tiêu đề",
          name: "title",
          type: "text",
          fill: true,
          required: true,
        },
        {
          name: "consultantId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="consultantId"
              name="consultantId"
              label="Nhân viên thực hiện tư vấn"
              options={[]}
              fill={true}
              value={detailEmployee}
              required={true}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn nhân viên tư vấn"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              error={checkFieldEmployee}
              message="Nhân viên thực hiện tư vấn không được bỏ trống"
              isLoading={data?.consultantId ? isLoadingEmployee : null}
            />
          ),
        },
        {
          name: "services",
          type: "custom",
          snippet: (
            <SelectCustom
              id="services"
              name="services"
              label="Dịch vụ"
              fill={true}
              options={[]}
              isMulti={true}
              value={detailService}
              onChange={(e) => handleChangeValueService(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionService}
              placeholder="Chọn dịch vụ khách hàng quan tâm"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelService}
            />
          ),
        },
        {
          name: "customerId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="customerId"
              name="customerId"
              label="Khách hàng"
              options={[]}
              fill={true}
              value={detailCustomer}
              required={true}
              disabled={idCustomer ? true : false}
              onChange={(e) => handleChangeValueCustomer(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn khách hàng"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionCustomer}
              formatOptionLabel={formatOptionLabelCustomer}
              error={checkFieldCustomer}
              message="Khách hàng không được bỏ trống"
              isLoading={data?.customerId ? isLoadingCustomer : null}
            />
          ),
        },
        {
          label: "Nội dung tư vấn",
          name: "content",
          type: "textarea",
          fill: true,
        },
        {
          label: "Bắt đầu",
          name: "startTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập thời gian bắt đầu",
          hasSelectTime: true,
        },
        {
          label: "Kết thúc",
          name: "endTime",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          required: true,
          placeholder: "Nhập thời gian kết thúc",
          hasSelectTime: true,
        },
        {
          label: "Kiểu lịch",
          name: "type",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Lịch đặt trước",
            },
            {
              value: "2",
              label: "Lịch đột xuất",
            },
          ],
        },
        ...(formData?.values?.type == "1"
          ? [
              {
                name: "notification",
                type: "custom",
                snippet: (
                  <div className="notification-calendar">
                    <div className="info-notification">
                      <div className="setting-time">
                        <label className="title-time">Cài đặt thời gian thông báo</label>
                        <div className="desc-choose">
                          <div className="choose-time">
                            <SelectCustom
                              fill={true}
                              special={true}
                              value={valueTime}
                              options={valueDecisionTime.value == "1" ? listDay : valueDecisionTime.value == "2" ? listHour : listMinute}
                              onChange={(e) => handleChangeValueTime(e)}
                            />
                          </div>
                          <div className="decision-time" ref={refContainerDecisionTime}>
                            <div
                              className="select__decision-time"
                              onClick={() => {
                                setIsOptionDecisionTime(!isOptionDecisionTime);
                              }}
                            >
                              {valueDecisionTime.label}
                              <Icon name="ChevronDown" />
                            </div>
                            {isOptionDecisionTime && (
                              <ul className="menu__time" ref={refOptionDecisionTime}>
                                {listOption.map((item, idx) => {
                                  return (
                                    <li
                                      key={idx}
                                      className={`${valueDecisionTime.value === item.value ? "active__item--item" : "item-time"}`}
                                      onClick={(e) => {
                                        e && e.preventDefault();
                                        setValueDecisionTime(item as any);
                                        setIsOptionDecisionTime(false);
                                      }}
                                    >
                                      {item.label}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="choose-notification">
                        <CheckboxList
                          title="Thông báo qua"
                          options={listNotificationType}
                          value={dataApplyNotification.method.join()}
                          onChange={(e) => handleChangeValueNofiType(e)}
                        />
                      </div>
                    </div>

                    <div className="lst__nitification--apply">
                      <div
                        className={`${dataApplyNotification.method.length <= 0 ? "disabled__apply-notification" : "apply-notification"}`}
                        title={`${dataApplyNotification.method.length <= 0 ? "Bạn chưa chọn thông báo qua app, email hay sms !" : ""}`}
                        onClick={() => handApplyNotification()}
                      >
                        Áp dụng
                      </div>

                      {dataListNotification && dataListNotification.length > 0 && (
                        <div className="list__apply--notification">
                          {dataListNotification.map((item, idx) => {
                            return (
                              <div key={idx} className="apply-item">
                                <h4 className="name-notification">{`Thông báo trước ${
                                  item.time.day ? `${item.time.day} ngày` : item.time.hour ? `${item.time.hour} giờ` : `${item.time.minute} phút`
                                } qua ${item.method.join(", ")}`}</h4>

                                <span
                                  title="Xóa"
                                  className="remove-notification"
                                  onClick={(e) => {
                                    e && e.preventDefault();
                                    handleRemoveApplyNotification(idx);
                                  }}
                                >
                                  <Icon name="Trash" />
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                name: "periodicSchedule",
                type: "custom",
                snippet: (
                  <div className="box__periodic--schedule">
                    <Switch label="Lịch định kỳ" checked={hasPeriodicSchedule} onChange={() => setHasPeriodicSchedule(!hasPeriodicSchedule)} />

                    {hasPeriodicSchedule && (
                      <div className="lst__option--periodic--schedule">
                        {lstPeriodicSchedule.map((item, idx) => {
                          return (
                            <div key={idx} className="item__periodic--schedule">
                              <span className="name__option">{item.name}</span>

                              <div className="choose__setting--schedule">
                                <div className="lst__choose--time">
                                  {item.time && item.time.length === 0 ? (
                                    <div className="item-empty--time">
                                      <div className="name-empty">Bận</div>
                                      <div className="add--time" onClick={() => handleAddItemTimeEmpty(idx)}>
                                        <Icon name="PlusCircleFill" />
                                      </div>
                                    </div>
                                  ) : (
                                    item.time.map((el, index) => {
                                      return (
                                        <div key={index} className="item__choose--time">
                                          <div className="data__time">
                                            <div className="form-time" ref={refContainerStartTime}>
                                              <Input
                                                name="startTime"
                                                className="dept-time"
                                                value={el.start}
                                                fill={true}
                                                placeholder="HH:MM"
                                                autoComplete="off"
                                                onChange={(e) => handleChangeStartTime(e, index, idx)}
                                                onClick={() => setIsChooseStartTime(true)}
                                              />

                                              {isChooseStartTime && (
                                                <div className="choose__item--time choose__start--time" ref={refOptionStartTime}>
                                                  <ul className="lst__time--choose">
                                                    {timeSlots.map((item, idxs) => {
                                                      return (
                                                        <li
                                                          key={idxs}
                                                          className={`item-choose ${el.start == item.label ? "item-choose--active" : ""}`}
                                                          onClick={() => {
                                                            handleChooseStartTime(item.label, index, idx);
                                                            setIsChooseStartTime(false);
                                                          }}
                                                        >
                                                          {item.label}
                                                        </li>
                                                      );
                                                    })}
                                                  </ul>
                                                </div>
                                              )}
                                            </div>
                                            <span className="to-time">đến</span>
                                            <div className="form-time" ref={refContainerEndTime}>
                                              <Input
                                                name="endTime"
                                                className="dept-time"
                                                value={el.end}
                                                fill={true}
                                                placeholder="HH:MM"
                                                autoComplete="off"
                                                onChange={(e) => handleChangeEndTime(e, index, idx)}
                                                onClick={() => setIsChooseEndTime(true)}
                                              />

                                              {isChooseEndTime && (
                                                <div className="choose__item--time choose__end--time" ref={refOptionEndTime}>
                                                  <ul className="lst__time--choose">
                                                    {timeSlots.map((item, idxs) => {
                                                      return (
                                                        <li
                                                          key={idxs}
                                                          className={`item-choose ${el.end == item.label ? "item-choose--active" : ""}`}
                                                          onClick={() => {
                                                            handleChooseEndTime(item.label, index, idx);
                                                            setIsChooseEndTime(false);
                                                          }}
                                                        >
                                                          {item.label}
                                                        </li>
                                                      );
                                                    })}
                                                  </ul>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="action__time">
                                            <div className="action__time--item action__time--add" onClick={() => handleAddItemTime(idx)}>
                                              <Icon name="PlusCircleFill" />
                                            </div>
                                            {item.time.length > 1 && (
                                              <div
                                                className="action__time--item action__time--delete"
                                                onClick={() => handleDeleteItemTime(index, idx)}
                                              >
                                                <Icon name="Trash" />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ),
              },
            ]
          : []),
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
          placeholder: "Ghi chú nhanh về thông tin khách hàng, VD: (SĐT, Tên, Tuổi, Địa chỉ)",
        },
      ] as IFieldCustomize[],
    [
      detailEmployee,
      checkFieldEmployee,
      isLoadingEmployee,
      data,
      detailService,
      detailCustomer,
      checkFieldCustomer,
      isLoadingCustomer,
      valueDecisionTime,
      valueTime,
      isOptionDecisionTime,
      dataApplyNotification,
      dataListNotification,
      formData?.values?.type,
      lstPeriodicSchedule,
      hasPeriodicSchedule,
      isChooseStartTime,
      isChooseEndTime,
    ]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (detailCustomer === null) {
      setCheckFieldCustomer(true);
      return;
    }

    if (detailEmployee === null) {
      setCheckFieldEmployee(true);
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: IScheduleConsultantRequestModelProps = {
      ...(formData.values as IScheduleConsultantRequestModelProps),
      ...(data ? { id: data.id } : {}),
      ...(dataOpp?.coyId ? { coyId: dataOpp.coyId } : {}),
      ...(dataOpp?.approachId ? { approachId: dataOpp.approachId } : {}),
      startTime: moment(formData.values.startTime).format('YYYY-MM-DDTHH:mm:ss'),
      endTime: moment(formData.values.endTime).format('YYYY-MM-DDTHH:mm:ss'),
    };

    const response = await ScheduleConsultantService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} lịch thành công`, "success");
      handClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setDetailCustomer(null);
    setDetailEmployee(null);
    setDetailService(null);
    setValueDecisionTime({ value: "3", label: "Phút" });
    setValueTime(null);
    setDataApplyNotification({ method: [], time: { day: 0, hour: 0, minute: 0 } });
    setDataListNotification([]);
    setData(null);
    setLstPeriodicSchedule(defaultPeriodicSchedule);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_left: {
        buttons: idData
          ? [
              {
                title: "Xoá",
                color: "destroy",
                variant: "outline",
                disabled: isSubmit,
                callback: () => showDialogConfirmCancelDelete(idData),
              },
            ]
          : [],
      },
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldEmployee ||
              checkFieldCustomer ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldCustomer, checkFieldEmployee, data]
  );

  const onDelete = async (id?: number) => {
    const response = await ScheduleConsultantService.delete(id);

    if (response.code == 0) {
      showToast(`Xóa lịch ${data?.type == 1 ? "đặt trước" : "đến trực tiếp"} thành công`, "success");
      handClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmCancelDelete = (id?: number) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa lịch {data?.type == 1 ? "đặt trước" : "đến trực tiếp"}</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa
          <strong> {data?.title}</strong>? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (id) {
          onDelete(id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

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
        handClearForm(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  //! Xử lý xác nhận khách đến
  const handleShowDialogConfirmCustomerArrived = () => {
    const contentDialog: IContentDialog = {
      color: "success",
      className: "dialog-customer-arrived",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Xác nhận khách đến</Fragment>,
      message: <Fragment>Bạn có chắc chắn khách hàng đã đến?</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogConfirmCustomerArrived(false);
        setContentDialogConfirmCustomerArrived(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleConfirmCustomerArrived();
      },
    };
    setContentDialogConfirmCustomerArrived(contentDialog);
    setShowDialogConfirmCustomerArrived(true);
  };

  const handleConfirmCustomerArrived = async () => {
  if (!idData) return;

  setIsSubmittingCustomerArrived(true);

  const vForm: any = formData?.values ?? values;
  const vdata: any = data;

  const processor = vdata?.processor
    ? JSON.parse(vdata.processor)
    : vForm?.processor
    ? JSON.parse(vForm.processor)
    : {};

  const kafkaData = {
    employeeId: vdata?.consultantId ?? vForm?.consultantId ?? null,
    employeeName: vdata?.consultantName ?? vForm?.consultantName ?? "",
    customerId: vdata?.customerId ?? vForm?.customerId ?? null,
    customerName: vdata?.customerName ?? vForm?.customerName ?? "",
    arrival: 1,
  };

  const kafkaBody = {
    data: JSON.stringify(kafkaData),
     processId: processor.processId ?? 0,
     potId: processor.potId ?? 0,
     nodeId: processor.nodeId ?? "",
     currentRequestId: processor.currentRequestId ?? "",
  };

  try {
    const response = await ScheduleConsultantService.updateKafka(kafkaBody as any);

    if (response.code === 0) {
      showToast("Xác nhận khách đến thành công", "success");

      if (idData) await getDetailDataItem(idData);

      setShowDialogConfirmCustomerArrived(false);
      setContentDialogConfirmCustomerArrived(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  } catch {
    showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  } finally {
    setIsSubmittingCustomerArrived(false);
  }
};


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
          handClearForm(false);
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
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-add-event"
      >
        <form className="form-add-event" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            custom={idData ? true : false}
            title={idData ? undefined : `${idData ? "Chỉnh sửa" : "Thêm mới"} lịch thực tư vấn`}
            toggle={() => !isSubmit && handClearForm(false)}
          >
            {idData ? (
              <Fragment>
                <div className="modal-header-custom">
                  <h4>{`Chỉnh sửa lịch tư vấn`}</h4>
                  <div className="modal-header-actions">
                    <Button
                      type="button"
                      color="primary"
                      variant="outline"
                      onClick={(e) => handleShowDialogConfirmCustomerArrived()}
                      disabled={isSubmit || isSubmittingCustomerArrived}
                    >
                      Khách đến
                    </Button>
                    <Button
                      onClick={() => !isSubmit && handClearForm(false)}
                      type="button"
                      className="btn-close"
                      color="transparent"
                      onlyIcon={true}
                    >
                      <Icon name="Times" />
                    </Button>
                  </div>
                </div>
              </Fragment>
            ) : null}
          </ModalHeader>
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
      <ModalAddCustomerArrivedConsultation
              onShow={showModalCustomerArrived}
              onHide={(reload) => {
                setShowModalCustomerArrived(false);
                if (reload && idData) {
                    setIsReloadingFromChild(true);
                    getDetailDataItem(idData);
                }
              }}
              data={data}
            />
      <Dialog content={contentDialog} isOpen={showDialog} />
       <Dialog content={contentDialogConfirmCustomerArrived} isOpen={showDialogConfirmCustomerArrived} />
    </Fragment>
  );
}

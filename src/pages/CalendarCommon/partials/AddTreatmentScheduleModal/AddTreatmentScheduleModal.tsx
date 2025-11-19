import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext, useRef } from "react";
import moment from "moment";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IScheduleTreatmentResponseModalProps } from "model/scheduleTreatment/PropsModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { ICheckTreatmentRoomRequestModal } from "model/treatmentRoom/TreatmentRoomRequestModal";
import { IScheduleTreatmentRequestModal } from "model/scheduleTreatment/ScheduleTreatmentRequestModel";
import { IScheduleTreatmentResponseModal } from "model/scheduleTreatment/ScheduleTreatmentResponseModel";
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
import ImageThirdGender from "assets/images/third-gender.png";
import { listDay, listHour, listMinute, listNotificationType, listOption } from "../MockData";
import CustomerService from "services/CustomerService";
import EmployeeService from "services/EmployeeService";
import BeautyBranchService from "services/BeautyBranchService";
import BoughtServiceService from "services/BoughtServiceService";
import TreatmentRoomService from "services/TreatmentRoomService";
import ScheduleTreatmentService from "services/ScheduleTreatmentService";
import "./AddTreatmentScheduleModal.scss";

interface IDataListNotificationProps {
  method: string[];
  time: {
    day: number;
    hour: number;
    minute: number;
  };
}

export default function AddTreatmentScheduleModal(props: IScheduleTreatmentResponseModalProps) {
  const { startDate, endDate, onShow, onHide, idData, idCustomer } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const refOptionDecisionTime = useRef();
  const refContainerDecisionTime = useRef();

  const { id, dataBranch } = useContext(UserContext) as ContextType;

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [showDialogConfirmCustomerArrived, setShowDialogConfirmCustomerArrived] = useState<boolean>(false);
  const [contentDialogConfirmCustomerArrived, setContentDialogConfirmCustomerArrived] = useState<IContentDialog>(null);
  const [isSubmittingCustomerArrived, setIsSubmittingCustomerArrived] = useState<boolean>(false);

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

  const [data, setData] = useState<IScheduleTreatmentResponseModal>(null);

  const getDetailTreatmentSchedule = async (id: number) => {
    const response = await ScheduleTreatmentService.detail(id);

    if (response.code == 0) {
      const result = response.result;

      if (result?.branchId) {
        setValueBranch({
          value: result?.branchId,
          label: result?.branchName,
        });
      }

      if (result?.roomId) {
        setDataRoom({
          value: result?.roomId,
          label: result?.roomName,
        });
      }

      const takeLstParticipant = (result?.lstParticipant || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        };
      });

      setDataParticipants(takeLstParticipant);

      const takeLstService = (result.lstService || []).map((item) => {
        return {
          value: item.id,
          serviceId: item.id,
          label: item.name,
          avatar: item.avatar,
          serviceNumber: item.serviceNumber,
        };
      });

      setDataServices(takeLstService);

      const takeNotification = result.notification ? JSON.parse(result.notification) : [];
      setDataListNotification(takeNotification);

      setData({
        id: result.id,
        title: result.title,
        customerId: result.customerId,
        services: result?.services,
        employeeId: result.employeeId,
        participants: result?.participants,
        startTime: result.startTime,
        endTime: result.endTime,
        content: result?.content,
        note: result?.note,
        roomId: result?.roomId,
        notification: result?.notification,
        status: result?.status,
        branchId: result?.branchId,
      });
    }
  };

  useEffect(() => {
    if (onShow && idData) {
      getDetailTreatmentSchedule(idData);
    }
  }, [onShow, idData]);

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

  const [dataEmployee, setDataEmployee] = useState(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);

  const values = useMemo(
    () =>
      ({
        title: data?.title ?? "",
        customerId: data?.customerId ?? null,
        services: data?.services ?? "[]",
        employeeId: data?.employeeId ?? dataEmployee?.value,
        participants: data?.participants ?? "[]",
        startTime: idData ? data?.startTime : startDate,
        endTime: idData ? data?.endTime : endDate,
        content: data?.content ?? "",
        note: data?.note ?? "",
        roomId: data?.roomId ?? 0,
        notification: data?.notification ?? "[]",
        status: data?.status?.toString() ?? "1",
        branchId: data?.branchId ?? dataBranch.value ?? null,
      } as IScheduleTreatmentRequestModal),
    [onShow, data, startDate, endDate, idData, dataEmployee, dataBranch]
  );

  const validations: IValidation[] = [
    {
      name: "title",
      rules: "required",
    },
    {
      name: "startTime",
      rules: "required",
    },
    {
      name: "endTime",
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

  //! đoạn này xử lý vấn đề fill mặc định nhân viên khi thêm mới
  const getDefaultEmployeeNewData = async () => {
    const response = await EmployeeService.list();

    if (response.code === 0) {
      const result = response.result.items;

      const takeEmployee = result.find((item) => item.userId === id);
      setDataEmployee({
        value: takeEmployee?.id,
        label: takeEmployee?.name,
        avatar: takeEmployee?.avatar,
      });
    }
  };

  useEffect(() => {
    if (!idData && onShow) {
      getDefaultEmployeeNewData();
    }
  }, [idData, onShow]);

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

  //! đoạn này xử lý vấn đề hiển thị hình ảnh nhân viên
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

  //! đoạn này xử lý vấn đề thay đổi nhân viên
  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
  };

  const getDetailEmployee = async () => {
    setIsLoadingEmployee(true);

    const response = await EmployeeService.detail(data?.employeeId);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      };

      setDataEmployee(detailData);
    }

    setIsLoadingEmployee(false);
  };

  useEffect(() => {
    if (dataEmployee) {
      setFormData({ ...formData, values: { ...formData?.values, employeeId: dataEmployee.value } });
    }
  }, [dataEmployee]);

  useEffect(() => {
    if (data?.employeeId && onShow) {
      getDetailEmployee();
    }
  }, [data?.employeeId, onShow]);

  // khách hàng
  const [dataCustomer, setDataCustomer] = useState(null);
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
    setDataCustomer(e);
    setDataServices([]);
  };

  const getDetailCustomer = async () => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(data?.customerId);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: `${result.name} - ${result.phoneMasked}`,
        avatar: result.avatar,
      };

      setDataCustomer(detailData);
    }

    setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (dataCustomer) {
      onSelectOpenBuyService(dataCustomer.value);
      setFormData({ ...formData, values: { ...formData?.values, customerId: dataCustomer.value } });
    }
  }, [dataCustomer]);

  useEffect(() => {
    if (data?.customerId && onShow) {
      getDetailCustomer();
    }
  }, [data?.customerId, onShow]);

  // danh sách dịch vụ
  const [listService, setListService] = useState([]);
  const [dataServices, setDataServices] = useState([]);
  const [isLoadingBuyService, setIsLoadingBuyService] = useState<boolean>(false);
  const [checkFieldServices, setCheckFieldServices] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách thẻ dịch vụ đã mua
  const onSelectOpenBuyService = async (idCustomer?: number) => {
    if (!idCustomer) return;

    setIsLoadingBuyService(true);

    const response = await BoughtServiceService.getByCustomerId(idCustomer);

    if (response.code === 0) {
      const dataOption = response.result;

      setListService([
        ...(dataOption.length > 0
          ? dataOption.map((item) => {
              return {
                value: item.id,
                serviceId: item.serviceId,
                label: item.serviceName,
                avatar: item.serviceAvatar,
                serviceNumber: item.serviceNumber,
              };
            })
          : []),
      ]);
    }

    setIsLoadingBuyService(false);
  };

  const handleChangeValueService = (e) => {
    setCheckFieldServices(false);
    setDataServices(e);
  };

  //* đoạn này hiển thị hình ảnh dịch vụ
  const formatOptionLabelService = ({ label, avatar, serviceNumber }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div className="d-flex align-items-start justify-content-start flex-column">
          {label}
          <span className="subsidiary">Mã thẻ: {serviceNumber}</span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (dataServices && dataServices?.length > 0) {
      const takeIdService = dataServices.map((item) => {
        return {
          id: item.serviceId,
          serviceNumber: item.serviceNumber,
        };
      });
      setFormData({ ...formData, values: { ...formData?.values, services: JSON.stringify(takeIdService) } });
    }
  }, [dataServices]);

  // Thông báo
  useEffect(() => {
    if (dataListNotification.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, notification: JSON.stringify(dataListNotification) } });
    }
  }, [dataListNotification]);

  // Danh sách phụ tá
  const [dataParticipants, setDataParticipants] = useState([]);

  const loadedOptionParticipants = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
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

  const handleChangeValueParticipants = (e) => {
    setDataParticipants(e);
  };

  //* đoạn này hiển thị hình ảnh  phụ tá
  const formatOptionLabelParticipants = ({ label, avatar }) => {
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
    if (dataParticipants && dataParticipants.length > 0) {
      const takeIdParticipants = dataParticipants.map((item) => item.value);
      setFormData({ ...formData, values: { ...formData?.values, participants: JSON.stringify(takeIdParticipants) } });
    }
  }, [dataParticipants]);

  // Lấy chi nhánh
  const [valueBranch, setValueBranch] = useState(null);

  //? đoạn này xử lý vấn đề call api lấy ra danh sách chi nhánh
  const loadOptionBranch = async (search, loadedOptions, { page }) => {
    const param: IBeautyBranchFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

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

  //? đoạn này xử lý vấn đề thay đổi chi nhánh
  const handleChangeValueBranch = (e) => {
    setValueBranch(e);
    setDataRoom(null);
  };

  useEffect(() => {
    if (dataBranch) {
      setFormData({ ...formData, values: { ...formData?.values, branchId: dataBranch.value } });
      setValueBranch(dataBranch);
    }
  }, [dataBranch]);

  // Lấy phòng điều trị
  const [listRoom, setListRoom] = useState([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState<boolean>(false);
  const [dataRoom, setDataRoom] = useState(null);

  const onSelectOpenRoom = async () => {
    setIsLoadingRoom(true);

    const body: ICheckTreatmentRoomRequestModal = {
      branchId: dataBranch?.value,
      startTime: formData?.values?.startTime,
      endTime: formData?.values?.endTime,
    };

    const response = await TreatmentRoomService.checkTreatmentRoom(body);

    if (response.code == 0) {
      const dataOption = response.result;

      setListRoom([
        ...(dataOption.length > 0
          ? dataOption.map((item) => {
              return {
                value: item.id,
                label: item.name,
              };
            })
          : []),
      ]);
    }

    setIsLoadingRoom(false);
  };

  useEffect(() => {
    //! đoạn này bh có time ngồi đọc rồi tối ưu lại
    if (valueBranch && formData?.values?.startTime && formData?.values?.endTime) {
      onSelectOpenRoom();
    }
  }, [valueBranch, formData?.values?.startTime, formData?.values?.endTime]);

  const handleChangeValueRoom = (e) => {
    setDataRoom(e);
  };

  useEffect(() => {
    if (dataRoom) {
      setFormData({ ...formData, values: { ...formData?.values, roomId: dataRoom.value } });
    }
  }, [dataRoom]);

  // Thời gian bắt đầu và kết thúc
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
          name: "title",
          label: "Tiêu đề",
          type: "text",
          fill: true,
          required: true,
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
              value={dataCustomer}
              required={true}
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
          name: "services",
          type: "custom",
          snippet: (
            <SelectCustom
              id="services"
              name="services"
              label="Dịch vụ"
              fill={true}
              required={true}
              options={listService}
              isMulti={true}
              special={true}
              value={dataServices}
              isLoading={isLoadingBuyService}
              onMenuOpen={onSelectOpenBuyService}
              onChange={(e) => handleChangeValueService(e)}
              isFormatOptionLabel={true}
              placeholder={`${dataCustomer ? "Chọn dịch vụ" : "Chọn khách hàng để xem dịch vụ"}`}
              formatOptionLabel={formatOptionLabelService}
              disabled={!dataCustomer}
              error={checkFieldServices}
              message="Dịch vụ không được bỏ trống"
            />
          ),
        },
        {
          name: "employeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="employeeId"
              name="employeeId"
              label="Bác sĩ/kỹ thuật viên"
              options={[]}
              fill={true}
              value={dataEmployee}
              required={true}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn bác sĩ / kỹ thuật viên"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              isLoading={data?.employeeId ? isLoadingEmployee : null}
            />
          ),
        },
        {
          name: "participants",
          type: "custom",
          snippet: (
            <SelectCustom
              id="participants"
              name="participants"
              label="Phụ tá"
              fill={true}
              options={[]}
              isMulti={true}
              value={dataParticipants}
              onChange={(e) => handleChangeValueParticipants(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionParticipants}
              placeholder="Chọn phụ tá"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelParticipants}
            />
          ),
        },
        {
          label: "Nội dung dự kiến thực hiện",
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
          name: "branchId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="branchId"
              name="branchId"
              label="Chi nhánh"
              fill={true}
              options={[]}
              special={true}
              value={valueBranch}
              disabled={true}
              onChange={(e) => handleChangeValueBranch(e)}
              isAsyncPaginate={true}
              placeholder="Chọn chi nhánh"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionBranch}
            />
          ),
        },
        {
          name: "roomId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="roomId"
              name="roomId"
              label="Phòng điều trị"
              fill={true}
              special={true}
              options={listRoom}
              value={dataRoom}
              isLoading={isLoadingRoom}
              onMenuOpen={onSelectOpenRoom}
              onChange={(e) => handleChangeValueRoom(e)}
              placeholder={`${dataBranch ? "Chọn phòng điều trị" : "Chọn chi nhánh để xem phòng điều trị"}`}
              disabled={!dataBranch}
            />
          ),
        },
        {
          name: "status",
          label: "Trạng thái lịch",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Chờ duyệt",
            },
            {
              value: "2",
              label: "Đã duyệt",
            },
            {
              value: "3",
              label: "Đã gửi SMS",
            },
            {
              value: "4",
              label: "Đã gọi điện",
            },
            {
              value: "5",
              label: "Hoàn thành",
            },
            {
              value: "6",
              label: "Đã hủy",
            },
          ],
          disabled: !data,
        },
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
                                          onClick={() => {
                                            setIsChooseStartTime(true);
                                          }}
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
                                          onClick={() => {
                                            setIsChooseEndTime(true);
                                          }}
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
                                        <div className="action__time--item action__time--delete" onClick={() => handleDeleteItemTime(index, idx)}>
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
        {
          label: "Lưu ý cho phụ tá",
          name: "note",
          type: "textarea",
          fill: true,
          placeholder: "Lưu ý dành cho ekip để chuẩn bị trước khi thực hiện",
        },
      ] as IFieldCustomize[],
    [
      dataCustomer,
      checkFieldCustomer,
      isLoadingCustomer,
      dataServices,
      listService,
      isLoadingBuyService,
      checkFieldServices,
      dataEmployee,
      isLoadingEmployee,
      dataParticipants,
      dataBranch,
      listRoom,
      dataRoom,
      isLoadingRoom,
      valueDecisionTime,
      valueTime,
      isOptionDecisionTime,
      dataApplyNotification,
      dataListNotification,
      lstPeriodicSchedule,
      hasPeriodicSchedule,
      isChooseStartTime,
      isChooseEndTime,
    ]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (!dataCustomer) {
      setCheckFieldCustomer(true);
      return;
    }

    if (dataServices?.length == 0) {
      setCheckFieldServices(true);
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: IScheduleTreatmentRequestModal = {
      ...(formData.values as IScheduleTreatmentRequestModal),
      ...(data ? { id: data.id } : {}),
      startTime: moment(formData.values.startTime).format('YYYY-MM-DDTHH:mm:ss'),
      endTime: moment(formData.values.endTime).format('YYYY-MM-DDTHH:mm:ss'),
    };

    const response = await ScheduleTreatmentService.update(body);

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
    setDataCustomer(null);
    setDataEmployee(null);
    setDataRoom(null);
    setListRoom([]);
    setListService([]);
    setValueBranch(null);
    setDataServices([]);
    setDataParticipants([]);
    setValueDecisionTime({ value: "3", label: "Phút" });
    setValueTime(null);
    setDataApplyNotification({ method: [], time: { day: 0, hour: 0, minute: 0 } });
    setDataListNotification([]);
    setData(null);
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
            title: idData ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldServices ||
              checkFieldCustomer ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldCustomer, checkFieldServices, idData]
  );

  const onDelete = async (id?: number) => {
    const response = await ScheduleTreatmentService.delete(id);

    if (response.code == 0) {
      showToast("Xóa lịch điều trị thành công", "success");
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
      title: <Fragment>Xóa lịch điều trị</Fragment>,
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

    const body: IScheduleTreatmentRequestModal = {
      ...(formData.values as IScheduleTreatmentRequestModal),
      ...(idData ? { id: idData } : {}),
      status: "7", // Giả định status 7 là "Khách đến", có thể cần điều chỉnh theo backend
    };

    const response = await ScheduleTreatmentService.update(body);

    if (response.code === 0) {
      showToast("Xác nhận khách đến thành công", "success");
      // Reload lại dữ liệu
      if (idData) {
        await getDetailTreatmentSchedule(idData);
      }
      setShowDialogConfirmCustomerArrived(false);
      setContentDialogConfirmCustomerArrived(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmittingCustomerArrived(false);
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
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
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
        className="modal-add-treatment-schedule"
      >
        <form className="form-add-treatment-schedule" onSubmit={(e) => onSubmit(e)}>
        <ModalHeader
            custom={idData ? true : false}
            title={idData ? undefined : `${idData ? "Chỉnh sửa" : "Thêm mới"} lịch thực hiện dịch vụ`}
            toggle={() => !isSubmit && handClearForm(false)}
          >
            {idData ? (
              <Fragment>
                <div className="modal-header-custom">
                  <h4>{`Chỉnh sửa lịch thực hiện dịch vụ`}</h4>
                  <div className="modal-header-actions">
                    <Button
                      type="button"
                      color="primary"
                      variant="outline"
                      onClick={() => handleShowDialogConfirmCustomerArrived()}
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
      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDialogConfirmCustomerArrived} isOpen={showDialogConfirmCustomerArrived} />
    </Fragment>
  );
}

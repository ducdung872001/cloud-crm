import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { IScheduleCommonFilterRequest } from "model/scheduleCommon/ScheduleCommonRequestModal";
import Icon from "components/icon";
import Button from "components/button/button";
import SelectCustom from "components/selectCustom/selectCustom";
import { ContextType, UserContext } from "contexts/userContext";
import { showToast } from "utils/common";
import EmployeeService from "services/EmployeeService";
import ScheduleCommonService from "services/ScheduleCommonService";
import FilterCalendarModal from "./partials/FilterCalendarModal/FilterCalendarModal";
import AddWorkModal from "pages/MiddleWork/partials/ListWork/partials/AddWorkModal/AddWorkModal";
import AddTreatmentScheduleModal from "./partials/AddTreatmentScheduleModal/AddTreatmentScheduleModal";
import AddConsultationScheduleModal from "./partials/AddConsultationScheduleModal/AddConsultationScheduleModal";
import "tippy.js/animations/scale.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./CalendarCommon.scss";

interface IDataEventsListCalendarProps {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  type: number;
  employeeId: number;
  employeeName: string;
  employeeAvatar: string;
  status: number;
}

const localizer = momentLocalizer(moment);

export default function CalendarCommon() {
  document.title = "Lịch";

  const [valueOptionView, setValueOptionView] = useState<string>("week");
  const onView = useCallback((newView) => setValueOptionView(newView), [valueOptionView]);

  const isBeauty = localStorage.getItem("isBeauty");
  const { dataBranch } = useContext(UserContext) as ContextType;

  const listOptionNewAdd =
    isBeauty && isBeauty == "1"
      ? [
          {
            value: "1",
            label: "Thêm lịch tư vấn",
          },
          {
            value: "2",
            label: "Thêm lịch điều trị",
          },
          {
            value: "3",
            label: "Thêm lịch công việc",
          },
        ]
      : [
          {
            value: "1",
            label: "Thêm lịch tư vấn",
          },
          {
            value: "3",
            label: "Thêm lịch công việc",
          },
        ];

  const [valueOptionAdd, setValueOptionAdd] = useState({
    value: "1",
    label: "Thêm lịch tư vấn",
  });

  const handleChangeValueOptionAdd = (e) => {
    setValueOptionAdd(e);
  };

  //đoạn này sau tách thành 1 component
  const CustomToolbar = (toolbar) => {
    const listOptionView = [
      {
        value: "day",
        label: "Ngày",
      },
      {
        value: "week",
        label: "Tuần",
      },
      {
        value: "month",
        label: "Tháng",
      },
    ];

    const addMonths = (date, months) => {
      const d = date.getDate();
      date.setMonth(date.getMonth() + months);
      if (date.getDate() != d) {
        date.setDate(0);
      }
      return date;
    };

    const addWeeks = (date, weeks) => {
      date.setDate(date.getDate() + 7 * weeks);
      return date;
    };

    const addDays = (date, days) => {
      date.setDate(date.getDate() + days);
      return date;
    };

    const goToBack = () => {
      if (valueOptionView == "month") {
        toolbar.onNavigate("prev", addMonths(toolbar.date, -1));
      } else if (valueOptionView == "week") {
        toolbar.onNavigate("prev", addWeeks(toolbar.date, -1));
      } else {
        toolbar.onNavigate("prev", addDays(toolbar.date, -1));
      }
    };

    const goToNext = () => {
      if (valueOptionView == "month") {
        toolbar.onNavigate("next", addMonths(toolbar.date, +1));
      } else if (valueOptionView == "week") {
        toolbar.onNavigate("next", addWeeks(toolbar.date, +1));
      } else {
        toolbar.onNavigate("next", addDays(toolbar.date, +1));
      }
    };

    const goToCurrent = () => {
      const now = new Date();
      toolbar.date.setMonth(now.getMonth());
      toolbar.date.setYear(now.getFullYear());
      toolbar.date.setDate(now.getDate());
      toolbar.onNavigate("current");
    };

    const label = () => {
      const date = moment(toolbar.date);
      return (
        <div className="info-date">
          <span>{date.format("DD")}</span>
          <span>{date.format("MMMM")}</span>
          <span> {date.format("YYYY")}</span>
        </div>
      );
    };

    const handleChangeValueOptionView = (event) => {
      setValueOptionView(event.value);
    };

    return (
      <div className="custom__toolbar">
        <div className="custom__toolbar--left">
          <Button type="button" variant="outline" color="secondary" className="btn btn-current" onClick={goToCurrent}>
            Hôm nay
          </Button>
          <Button type="button" variant="outline" color="secondary" className="btn btn-back" onClick={goToBack}>
            <Tippy
              content={`${valueOptionView == "day" ? "Ngày" : valueOptionView == "week" ? "Tuần" : "Tháng"} trước`}
              delay={[120, 100]}
              animation="scale"
              arrow={false}
              placement="bottom"
              offset={[0, 15]}
            >
              <div className="d-flex align-items-center justify-content-center">
                <Icon name="ChevronLeft" />
              </div>
            </Tippy>
          </Button>
          <Button type="button" variant="outline" color="secondary" className="btn btn-next" onClick={goToNext}>
            <Tippy
              content={`${valueOptionView == "day" ? "Ngày tiếp theo" : valueOptionView == "week" ? "Tuần sau" : "Tháng sau"}`}
              delay={[120, 100]}
              animation="scale"
              arrow={false}
              placement="bottom"
              offset={[0, 15]}
            >
              <div className="d-flex align-items-center justify-content-center">
                <Icon name="ChevronRight" />
              </div>
            </Tippy>
          </Button>
        </div>
        <label className="label-date">{label()}</label>
        <div className="custom__toolbar--right">
          <Button type="button" variant="outline" color="secondary" className="btn__search--calendar" onClick={() => setShowModalSearch(true)}>
            <Tippy content={"Tìm kiếm"} delay={[120, 100]} animation="scale" arrow={false} placement="bottom" offset={[0, 12]}>
              <div className="d-flex align-items-center justify-content-center">
                <Icon name="SearchFill" />
              </div>
            </Tippy>
          </Button>
          <div className="option-view">
            <SelectCustom fill={true} options={listOptionView} value={valueOptionView} onChange={(e) => handleChangeValueOptionView(e)} />
          </div>
          <div className="option-add">
            <SelectCustom
              fill={true}
              options={listOptionNewAdd}
              special={true}
              value={valueOptionAdd}
              onChange={(e) => handleChangeValueOptionAdd(e)}
            />
          </div>
        </div>
      </div>
    );
  };

  // đoạn này custom thêm khoảng trống thừa sau có thể trèn logo vào
  const CustomGutterHeader = () => {
    return <div className="custom__gutter--header"></div>;
  };

  const messages = {
    showMore: (total) => `+ ${total} xem thêm`,
  };

  //! callAPI lấy ra dữ liệu lịch
  const isMounted = useRef(false);

  const [listSchedule, setListSchedule] = useState<IDataEventsListCalendarProps[]>([]);
  const [filterCalendar, setFilterCalendar] = useState({
    chooseTypeCalendar: [2, 3],
    sourcesCalendar: [1, 2],
    branchId: 0,
    lstEmployeeId: [],
    lstCustomerId: [],
    startTime: "",
    endTime: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModalAddConsultationScheduleModal, setShowModalAddConsultationScheduleModal] = useState<boolean>(false);
  const [showModalSearch, setShowModalSearch] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [idItemCalendar, setIdItemCalendar] = useState<number>(null);
  const [showModalAddTreatmentSchedule, setShowModalAddTreatmentSchedule] = useState<boolean>(false);
  const [showModalAddWork, setShowModalAddWork] = useState<boolean>(false);
  const [idEmployee, setIdEmployee] = useState<number>(null);

  const { id } = useContext(UserContext) as ContextType;

  const getTakeDefaultConsultant = async () => {
    const response = await EmployeeService.list();

    if (response.code === 0) {
      const result = response.result.items;

      const takeEmployee = result.find((item) => item.userId === id);

      if (takeEmployee) {
        setIdEmployee(takeEmployee.id);
      }
    }
  };

  useEffect(() => {
    if (id) {
      getTakeDefaultConsultant();
    }
  }, [id]);

  //* đoạn này có thể bỏ tham số trong object đi, vì ở dưới đã set rồi,
  //* thêm vào nhìn cho đỡ trống
  const [params, setParams] = useState<IScheduleCommonFilterRequest>({
    types: [2, 3].join(),
    sources: [1, 2].join(),
  });

  useEffect(() => {
    if (filterCalendar && idEmployee) {
      setParams({
        ...params,
        lstId: [idEmployee, ...filterCalendar.lstEmployeeId].join(),
        branchId: filterCalendar.branchId,
        lstCustomerId: filterCalendar.lstCustomerId.join(),
        types: filterCalendar.chooseTypeCalendar.join(),
        sources: filterCalendar.sourcesCalendar.join(),
        startTime: filterCalendar.startTime ? moment(filterCalendar.startTime).format("DD/MM/YYYY") : "",
        endTime: filterCalendar.endTime ? moment(filterCalendar.endTime).format("DD/MM/YYYY") : "",
      });
    }
  }, [filterCalendar, idEmployee]);

  useEffect(() => {
    setFilterCalendar({ ...filterCalendar, branchId: dataBranch.value });
  }, [dataBranch]);

  const abortController = new AbortController();

  const getListSchedule = async (paramsSearch: IScheduleCommonFilterRequest) => {
    setIsLoading(true);

    const response = await ScheduleCommonService.listCommon(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = (response.result || []).map((item) => {
        return {
          id: item.id,
          title: item.title,
          start: new Date(moment(item.startTime).format()),
          end: new Date(moment(item.endTime).format()),
          type: item.type,
          employeeId: item.employeeId,
          employeeName: item.employeeName,
          employeeAvatar: item.employeeAvatar,
          status: item.status,
        };
      });
      setListSchedule(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // if (!isMounted.current) {
    //   isMounted.current = true;
    //   return;
    // }

    if (isMounted.current === true) {
      getListSchedule(params);
      const paramsTemp = _.cloneDeep(params);

      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }

    return () => {
      abortController.abort();
    };
  }, [params]);

  // Đoạn này lấy thông tin kéo thả lịch để thêm mới
  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      if (start && end) {
        setIdItemCalendar(null);
        setStartDate(start);
        setEndDate(end);

        if (valueOptionAdd.value == "1") {
          setShowModalAddConsultationScheduleModal(true);
        } else if (valueOptionAdd.value == "2") {
          setShowModalAddTreatmentSchedule(true);
        } else {
          setShowModalAddWork(true);
        }
      }
    },
    [valueOptionAdd]
  );

  // Đoạn này lấy thông tin chi tiết khi click vào 1 item lịch bất kỳ
  const handleSelectEvent = useCallback((event) => {
    if (event) {
      setIdItemCalendar(event.id);

      if (event.type == 1) {
        setShowModalAddWork(true);
        setStartDate(event.start);
        setEndDate(event.end);
      } else if (event.type == 2) {
        setShowModalAddConsultationScheduleModal(true);
      } else {
        setShowModalAddTreatmentSchedule(true);
      }
    }
  }, []);

  // Đoạn này chỉnh màu của các item bên trong lịch
  const handEventPropGetter = useCallback((event, start, end, isSelected) => {
    const backgroundColor = "rgb(3, 155, 229)";
    const style = {
      backgroundColor: backgroundColor,
      borderColor: backgroundColor,
    };
    return {
      style: style,
    };
  }, []);

  return (
    <div className="page-content page-calendar">
      <div className={`card-box ${isLoading ? "filtering" : ""}`}>
        <Calendar
          localizer={localizer}
          events={listSchedule}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          onView={onView}
          view={valueOptionView}
          defaultDate={new Date()}
          components={{ toolbar: CustomToolbar, timeGutterHeader: CustomGutterHeader }}
          className="custom-calendar"
          messages={messages}
          selectable
          popup={true}
          step={10}
          timeslots={6}
          resizable={true}
          showMultiDayTimes={true}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={handEventPropGetter}
        />
      </div>
      <FilterCalendarModal
        onShow={showModalSearch}
        filterCalendar={filterCalendar}
        idEmployee={idEmployee}
        setFilterCalendar={setFilterCalendar}
        onHide={() => setShowModalSearch(false)}
      />
      <AddWorkModal
        type="project"
        onShow={showModalAddWork}
        idWork={idItemCalendar}
        startDate={startDate}
        endDate={endDate}
        onHide={(reload) => {
          if (reload) {
            getListSchedule(params);
          }
          setShowModalAddWork(false);
        }}
      />
      <AddTreatmentScheduleModal
        onShow={showModalAddTreatmentSchedule}
        idData={idItemCalendar}
        startDate={startDate}
        endDate={endDate}
        onHide={(reload) => {
          if (reload) {
            getListSchedule(params);
          }
          setShowModalAddTreatmentSchedule(false);
        }}
      />
      <AddConsultationScheduleModal
        onShow={showModalAddConsultationScheduleModal}
        idData={idItemCalendar}
        startDate={startDate}
        endDate={endDate}
        onHide={(reload) => {
          if (reload) {
            getListSchedule(params);
          }
          setShowModalAddConsultationScheduleModal(false);
        }}
      />
    </div>
  );
}

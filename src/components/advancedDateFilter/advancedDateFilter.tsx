import React, { useEffect, useRef, useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subDays, subMonths, addDays } from "date-fns";
import { formatDate } from "utils/dateUtils";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Button from "components/button/button";
import Icon from "components/icon";
import { useOnClickOutside } from "utils/hookCustom";

import "./advancedDateFilter.scss";

interface IAdvancedDateFilterProps {
  updateParams: (toTime: string, fromTime: string, defaultKey: string) => void;
  defaultKey?: string;
}

export default function AdvancedDateFilter(props: IAdvancedDateFilterProps) {
  const { updateParams, defaultKey } = props;

  const dataOption = [
    {
      key: "thisWeek",
      value: "1",
      label: "Tuần này",
    },
    {
      key: "lastWeek",
      value: "2",
      label: "Tuần trước",
    },
    {
      key: "thisMonth",
      value: "3",
      label: "Tháng này",
    },
    {
      key: "lastMonth",
      value: "4",
      label: "Tháng trước",
    },
    {
      key: "last7Days",
      value: "5",
      label: "7 ngày gần đây",
    },
    {
      key: "last30Days",
      value: "6",
      label: "30 ngày gần đây",
    },
    // {
    //   key: "thisYear",
    //   value: "8",
    //   label: "Năm nay",
    // },
    {
      key: "startYearToNow",
      value: "9",
      // label: "Đầu năm đến hiện tại",
      label: "Năm nay",
    },
    {
      key: "custom",
      value: "7",
      label: "Tùy chỉnh",
    },
  ];

  const [fromTime, setFromTime] = useState("");

  const handleChangeValueFromTime = (e) => {
    const value = e;
    setFromTime(value);
  };

  const [toTime, setToTime] = useState("");

  const handleChangeValueToTime = (e) => {
    const value = e;
    setToTime(value);
  };

  const refOption = useRef();
  const refOptionContainer = useRef();
  const refCustom = useRef();

  const [showOption, setShowOption] = useState<boolean>(false);
  const [isChoose, setIsChoose] = useState<boolean>(false);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  useOnClickOutside(refOption, () => setShowOption(false), ["box__option"]);
  useOnClickOutside(refCustom, () => setIsCustom(false), ["box__option", "react-datepicker-popper"]);

  const [valueOption, setValueOption] = useState(
    null
    // dataOption.find((item) => item.key == defaultKey)
    //  || {
    //   key: "last7Days",
    //   value: "5",
    //   label: "7 ngày gần đây",
    // }
  );

  useEffect(() => {
    if (defaultKey) {
      setValueOption(dataOption.find((item) => item.key == defaultKey));
    }
  }, [defaultKey]);

  const dateCalculation = (type) => {
    const now = new Date();
    const fmt = "dd/MM/yyyy";
    switch (type) {
      case "1": {
        const start = format(startOfWeek(now, { weekStartsOn: 1 }), fmt);
        const end = format(endOfWeek(now, { weekStartsOn: 1 }), fmt);
        updateParams(start, end, "thisWeek");
        break;
      }

      case "2": {
        const lastWeek = subWeeks(now, 1);
        const start = format(startOfWeek(lastWeek, { weekStartsOn: 1 }), fmt);
        const end = format(endOfWeek(lastWeek, { weekStartsOn: 1 }), fmt);
        updateParams(start, end, "lastWeek");
        break;
      }

      case "3": {
        const start = format(startOfMonth(now), fmt);
        const end = format(endOfMonth(now), fmt);
        updateParams(start, end, "thisMonth");
        break;
      }

      case "4": {
        const prevMonth = subMonths(now, 1);
        const start = format(startOfMonth(prevMonth), fmt);
        const end = format(endOfMonth(prevMonth), fmt);
        updateParams(start, end, "lastMonth");
        break;
      }

      case "5": {
        const currentDate = format(now, fmt);
        const sevenDaysAgo = format(subDays(now, 6), fmt);
        updateParams(sevenDaysAgo, currentDate, "last7Days");
        break;
      }

      case "6": {
        const currentDate = format(now, fmt);
        const thirtyDaysAgo = format(subDays(now, 30), fmt);
        updateParams(thirtyDaysAgo, currentDate, "last30Days");
        break;
      }

      case "7": {
        if (isChoose) {
          setIsCustom(true);
        }
        break;
      }

      case "8": {
        const start = format(startOfYear(now), fmt);
        const end = format(endOfYear(now), fmt);
        updateParams(start, end, "thisYear");
        break;
      }
      case "9": {
        const start = format(startOfYear(now), fmt);
        const end = format(endOfYear(now), fmt);
        updateParams(start, end, "startYearToNow");
        break;
      }

      default: {
        const currentDate = format(now, fmt);
        const sevenDaysAgo = format(subDays(now, 6), fmt);
        updateParams(sevenDaysAgo, currentDate, "last7Days");
        break;
      }
    }
    setIsChoose(false);
  };

  useEffect(() => {
    if (valueOption) {
      dateCalculation(valueOption?.value);
    }
  }, [valueOption]);

  useEffect(() => {
    if (valueOption?.value == "7" && (fromTime || toTime) && !isCustom) {
      valueOption.label = `${fromTime && formatDate(fromTime)} ${toTime ? "-" : ""} ${
        toTime && formatDate(toTime)
      }`;
    }
  }, [valueOption, fromTime, toTime, isCustom]);

  const handSearchDate = () => {
    if (fromTime && toTime) {
      const since = formatDate(fromTime);
      const toData = formatDate(toTime);
      updateParams(since, toData, "custom");
    }

    setIsCustom(false);
  };

  return (
    <div className="form__advanced--date">
      <div className="box__option" ref={refOptionContainer}>
        <div className={`value-option ${showOption ? "show-option" : ""}`} onClick={() => setShowOption(!showOption)}>
          <span className="view-option">{valueOption?.label}</span>
          <span className="__icon">
            <Icon name="ChevronDown" />
          </span>
        </div>

        {showOption && (
          <div className="list__option" ref={refOption}>
            {dataOption.map((item, idx) => {
              return (
                <div
                  key={item.value}
                  className={`item-option ${item.value == valueOption?.value ? "active__option" : ""}`}
                  onClick={(e) => {
                    e && e.preventDefault();
                    setValueOption(item);
                    setShowOption(false);
                    setIsChoose(true);
                  }}
                >
                  <span className="name-option">{item.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {isCustom ? (
          <div className="custom__date" ref={refCustom}>
            <div
              className="action-backup"
              onClick={(e) => {
                e && e.preventDefault();
                setIsCustom(false);
                setShowOption(true);
              }}
            >
              <span className="icon-backup">
                <Icon name="ChevronLeft" />
              </span>

              <span className="__name">Quay lại</span>
            </div>

            <div className="wrapper__from">
              <div className="form-item">
                <DatePickerCustom
                  name="fromTime"
                  fill={true}
                  value={fromTime}
                  onChange={(e) => handleChangeValueFromTime(e)}
                  placeholder="Từ ngày"
                  maxDate={toTime ? toTime : false}
                  // minDate={toTime ? subDays(new Date(toTime), 90) : false}
                />
              </div>
              <div className="form-item">
                <DatePickerCustom
                  name="toTime"
                  fill={true}
                  value={toTime}
                  onChange={(e) => handleChangeValueToTime(e)}
                  placeholder="Đến ngày"
                  // maxDate={fromTime ? addDays(new Date(fromTime), 90) : false}
                  minDate={fromTime ? fromTime : false}
                />
              </div>

              <Button className="btn__search" disabled={fromTime == "" || toTime == ""} onClick={handSearchDate}>
                Lọc
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

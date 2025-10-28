import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { addDays, subDays } from "date-fns";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Button from "components/button/button";
import Icon from "components/icon";
import { useOnClickOutside } from "utils/hookCustom";

import "./AdvancedDateFilter.scss";

interface IAdvancedDateFilterProps {
  updateParams: (toTime: string, fromTime: string) => void;
}

export default function AdvancedDateFilter(props: IAdvancedDateFilterProps) {
  const { updateParams } = props;  

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
  const [isCustom, setIsCustom] = useState<boolean>(false);

  useOnClickOutside(refOption, () => setShowOption(false), ["box__option"]);
  useOnClickOutside(refCustom, () => setIsCustom(false), ["box__option", "react-datepicker-popper"]);

  const dataOption = [
    {
      value: "1",
      label: "Hôm nay",
    },
    {
      value: "2",
      label: "Ngày mai",
    },
    {
      value: "3",
      label: "7 ngày tiếp theo",
    },
    {
      value: "4",
      label: "Tháng này",
    },
    {
      value: "5",
      label: "30 ngày tiếp theo",
    },
    {
      value: "7",
      label: "Tùy chỉnh",
    },
  ];

  const [valueOption, setValueOption] = useState({
    value: "3",
    label: "7 ngày gần đây",
  });

  const dateCalculation = (type) => {
    switch (type) {
      case "1": {
        const startOfWeek = moment().format("DD/MM/yyyy");

        const currentDate = moment().format("DD/MM/yyyy");

        updateParams(startOfWeek, currentDate);
        break;
      }

      case "2": {
        const startOfLastWeek = moment().add(1, "days").format("DD/MM/yyyy");

        const endOfLastWeek = moment().add(1, "days").format("DD/MM/yyyy");

        updateParams(startOfLastWeek, endOfLastWeek);

        break;
      }

      case "3": {
        const startOfMonth = moment().format("DD/MM/yyyy");

        const endOfMonth = moment().add(6, "days").format("DD/MM/yyyy");

        updateParams(startOfMonth, endOfMonth);

        break;
      }

      case "4": {
        const startOfMonth = moment().startOf("month").format("DD/MM/yyyy");

        const endOfMonth = moment().endOf("month").format("DD/MM/yyyy");

        updateParams(startOfMonth, endOfMonth);

        // const currentDate = moment();

        // const previousMonth = currentDate.subtract(1, "month");

        // const startOfPreviousMonth = previousMonth.startOf("month").format("DD/MM/yyyy");

        // const endOfPreviousMonth = previousMonth.endOf("month").format("DD/MM/yyyy");

        // updateParams(startOfPreviousMonth, endOfPreviousMonth);

        break;
      }

      case "5": {
        const currentDate = moment().format("DD/MM/yyyy");

        const sevenDaysAgo = moment().subtract(6, "days").format("DD/MM/yyyy");

        updateParams(sevenDaysAgo, currentDate);

        break;
      }

      case "6": {
        const currentDate = moment().format("DD/MM/yyyy");

        const thirtyDaysAgo = moment().subtract(30, "days").format("DD/MM/yyyy");

        updateParams(thirtyDaysAgo, currentDate);

        break;
      }

      case "7": {
        setIsCustom(true);
        break;
      }

      default: {
        const currentDate = moment().format("DD/MM/yyyy");

        const sevenDaysAgo = moment().subtract(6, "days").format("DD/MM/yyyy");

        updateParams(sevenDaysAgo, currentDate);

        break;
      }
    }
  };

  useEffect(() => {
    dateCalculation(valueOption.value);
  }, [valueOption]);

  useEffect(() => {
    if (valueOption.value == "7" && (fromTime || toTime) && !isCustom) {
      valueOption.label = `${fromTime && moment(fromTime).format("DD/MM/yyyy")} ${toTime ? "-" : ""} ${
        toTime && moment(toTime).format("DD/MM/yyyy")
      }`;
    }
  }, [valueOption, fromTime, toTime, isCustom]);

  const handSearchDate = () => {
    if (fromTime && toTime) {
      const since = moment(fromTime).format("DD/MM/yyyy");
      const toData = moment(toTime).format("DD/MM/yyyy");
      updateParams(since, toData);
    }

    setIsCustom(false);
  };

  return (
    <div className="form__advanced--date">
      <div className="box__option" ref={refOptionContainer}>
        <div className={`value-option ${showOption ? "show-option" : ""}`} onClick={() => setShowOption(!showOption)}>
          <span className="view-option">{valueOption.label}</span>
          <span className="__icon">
            <Icon name="ChevronDown" />
          </span>
        </div>

        {showOption && (
          <div className="list__option" ref={refOption}>
            {dataOption.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className={`item-option ${item.value == valueOption.value ? "active__option" : ""}`}
                  onClick={(e) => {
                    e && e.preventDefault();
                    setValueOption(item);
                    setShowOption(false);
                  }}
                >
                  <span className="name-option">{item.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {isCustom && (
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
                  minDate={toTime ? subDays(new Date(toTime), 90) : false}
                />
              </div>
              <div className="form-item">
                <DatePickerCustom
                  name="toTime"
                  fill={true}
                  value={toTime}
                  onChange={(e) => handleChangeValueToTime(e)}
                  placeholder="Đến ngày"
                  maxDate={fromTime ? addDays(new Date(fromTime), 90) : false}
                  minDate={fromTime ? fromTime : false}
                />
              </div>

              <Button className="btn__search" disabled={fromTime == "" || toTime == ""} onClick={handSearchDate}>
                Lọc
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

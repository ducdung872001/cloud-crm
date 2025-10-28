import React, { useEffect, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { IOption } from "model/OtherModel";
import Icon from "components/icon";
import RadioList from "components/radio/radioList";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import { listTimeSlots } from "utils/common";
import "./index.scss";

export interface IRepeatTimeProps {
  dataProps?: any;
  callback?: (data) => void;
}

export default function RepeatTime(props: IRepeatTimeProps) {
  const { dataProps, callback } = props;

  const lstDay: IOption[] = [
    {
      value: "All",
      label: "All",
    },
  ];

  for (let i = 1; i <= 31; i++) {
    const result = {
      value: i,
      label: i,
    };

    lstDay.push(result);
  }

  const lstRepeatWeeks = [
    { value: "All", label: "All" },
    { value: "Su", label: "Cn" },
    { value: "Mo", label: "T2" },
    { value: "Tu", label: "T3" },
    { value: "We", label: "T4" },
    { value: "Th", label: "T5" },
    { value: "Fr", label: "T6" },
    { value: "Sa", label: "T7" },
  ];

  const lstOptionRepeat = [
    {
      label: "Ngày",
      value: "day",
    },
    {
      label: "Tuần",
      value: "week",
    },
    {
      label: "Tháng",
      value: "month",
    },
  ];

  // Thời gian bắt đầu và kết thúc
  const intervalMinutes = 15;
  const startTime = moment(new Date()).startOf("day");
  const endTime = moment(new Date()).endOf("day");

  const timeSlots = listTimeSlots(startTime, endTime, intervalMinutes);

  const [formData, setFormData] = useState({
    never: "0",
    after: 1,
    endAt: new Date(),
    repeat: 1,
    frequencyType: "week",
    repeatWeekOns: ["Mo"],
    repeatMonthOns: [1, 31] as any[],
    timeRanges: [
      {
        startTime: "00:00:00",
        endTime: "23:45:00",
      },
    ],
  });

  const handleDeleteItemTimeRanges = (idx) => {
    const newData = [...formData.timeRanges];
    newData.splice(idx, 1);

    setFormData({ ...formData, timeRanges: newData });
  };

  const handleChangeValueStartTime = (e, idx) => {
    const value = e.value;

    setFormData({
      ...formData,
      timeRanges: formData.timeRanges.map((prev, index) => {
        if (idx === index) {
          return {
            ...prev,
            startTime: value,
          };
        }

        return prev;
      }),
    });
  };

  const handleChangeValueEndTime = (e, idx) => {
    const value = e.value;

    setFormData({
      ...formData,
      timeRanges: formData.timeRanges.map((prev, index) => {
        if (idx === index) {
          return {
            ...prev,
            endTime: value,
          };
        }

        return prev;
      }),
    });
  };

  useEffect(() => {
    if (dataProps) {
      let result = null;
      const conditionRepeatWeekOns = dataProps.repeatWeekOns;
      !conditionRepeatWeekOns.includes("All") && conditionRepeatWeekOns.length === 7 && conditionRepeatWeekOns.unshift("All");

      const conditionRepeatMonthOns = dataProps.repeatMonthOns;
      !conditionRepeatMonthOns.includes("All") && conditionRepeatMonthOns.length === 31 && conditionRepeatMonthOns.unshift("All");

      const changeData = {
        repeat: dataProps.repeat,
        frequencyType: dataProps.frequencyType,
        repeatWeekOns: dataProps.repeatWeekOns.length === 0 ? ["Mo"] : dataProps.repeatWeekOns,
        repeatMonthOns: dataProps.repeatMonthOns.length === 0 ? [1, 31] : dataProps.repeatMonthOns,
        timeRanges: dataProps.timeRanges,
      };

      if (dataProps.never) {
        result = {
          never: "0",
          endAt: new Date(),
          after: 1,
          ...changeData,
        };
      }

      if (dataProps.endAt) {
        result = {
          never: "1",
          endAt: dataProps.endAt,
          after: 1,
          ...changeData,
        };
      }

      if (dataProps.after) {
        result = {
          never: "2",
          endAt: new Date(),
          after: dataProps.after,
          ...changeData,
        };
      }

      setFormData(result);
    }
  }, [dataProps]);

  useEffect(() => {
    callback(formData);
  }, [formData]);

  return (
    <div className="wrapper__repeat--time">
      <div className="custom_repeat">
        <span className="name">Lặp lại tùy chỉnh</span>
        <div className="setup__custom">
          <span className="name-custom">Lặp lại mỗi</span>
          <div className="qty-repeat">
            <NummericInput
              fill={true}
              minValue={1}
              value={formData.repeat}
              onValueChange={(e) => setFormData({ ...formData, repeat: e.floatValue })}
            />
          </div>
          <div className="choose-option">
            <SelectCustom
              fill={true}
              value={formData.frequencyType}
              options={lstOptionRepeat}
              onChange={(e) => setFormData({ ...formData, frequencyType: e.value })}
            />
          </div>
        </div>
      </div>

      {formData.frequencyType !== "day" &&
        (formData.frequencyType === "week" ? (
          <div className="box__repeat--week">
            <span className="name">Lặp lại vào</span>
            <div className="lst__repeat--week">
              {lstRepeatWeeks.map((item, idx) => {
                const isActive = formData.repeatWeekOns.includes(item.value);
                const isRemovable = formData.repeatWeekOns.length > 1;

                const handleClickItemRepeat = () => {
                  if (item.value === "All") {
                    if (isActive) {
                      setFormData({ ...formData, repeatWeekOns: ["Mo"] });
                    } else {
                      const allValuesExceptAll = lstRepeatWeeks.map((value) => value.value);
                      setFormData({ ...formData, repeatWeekOns: allValuesExceptAll });
                    }
                  } else if (isActive && isRemovable) {
                    const updatedRepeatOn = formData.repeatWeekOns.filter((value) => value !== item.value);
                    setFormData({ ...formData, repeatWeekOns: updatedRepeatOn });
                  } else if (!isActive) {
                    setFormData({ ...formData, repeatWeekOns: [...formData.repeatWeekOns, item.value] });
                  }
                };

                return (
                  <div
                    key={idx}
                    className={`item__repeat--week ${formData.repeatWeekOns.includes(item.value) ? "active__repeat--week" : ""}`}
                    onClick={handleClickItemRepeat}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="box__repeat--moth">
            <span className="name">Lặp lại vào</span>
            <div className="lst__repeat--moth">
              {lstDay.map((item, idx) => {
                const isActive = formData.repeatMonthOns.includes(item.value);
                const isRemovable = formData.repeatMonthOns.length > 1;

                const handleClickItemRepeatMonth = () => {
                  if (item.value === "All") {
                    if (isActive) {
                      setFormData({ ...formData, repeatMonthOns: [] });
                    } else {
                      const allValuesExceptAll = lstDay.map((value) => value.value);
                      setFormData({ ...formData, repeatMonthOns: allValuesExceptAll });
                    }
                  } else if (isActive && isRemovable) {
                    const updatedRepeatOn = formData.repeatMonthOns.filter((value) => value !== item.value);
                    setFormData({ ...formData, repeatMonthOns: updatedRepeatOn });
                  } else if (!isActive) {
                    setFormData({ ...formData, repeatMonthOns: [...formData.repeatMonthOns, item.value] });
                  }
                };

                return (
                  <div
                    key={idx}
                    className={`item__repeat--moth ${formData.repeatMonthOns.includes(item.value) ? "active__repeat--moth" : ""}`}
                    onClick={handleClickItemRepeatMonth}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      <div className="box__end--time">
        <span className="name">Kết thúc</span>

        <div className="option__end--time">
          <div className="option__left">
            <RadioList
              name="option_time"
              options={[
                { value: "0", label: "Không bao giờ" },
                { value: "1", label: "Vào ngày" },
                { value: "2", label: "Sau" },
              ]}
              value={formData.never}
              onChange={(e) => setFormData({ ...formData, never: e.target.value })}
            />
          </div>
          <div className="option__value--right">
            <div className={`the_day ${formData.never !== "1" ? "dis__the_day" : ""}`}>
              <DatePickerCustom
                name="the_day"
                fill={true}
                isFmtText={true}
                value={moment(formData.endAt).format("DD/MM/YYYY")}
                onChange={(e) => setFormData({ ...formData, endAt: e })}
                disabled={formData.never !== "1"}
                placeholder="DD/MM/YYYY"
              />
            </div>

            <div className={`after_number ${formData.never !== "2" ? "dis__after_number" : ""}`}>
              <input
                type="number"
                value={formData.after}
                onChange={(e) => setFormData({ ...formData, after: +e.target.value })}
                disabled={formData.never !== "2"}
              />
              <span className="subtitles">lần xuất hiện</span>
            </div>
          </div>
        </div>
      </div>

      <div className="time__period">
        <span className="name">Khoảng thời gian</span>

        <div className="lst__time--period">
          {formData.timeRanges &&
            formData.timeRanges.length > 0 &&
            formData.timeRanges.map((item, idx) => {
              return (
                <div key={idx} className="item__time--period">
                  <div className="info__time">
                    <div className="start__time">
                      <span className="name--time">Bắt đầu</span>
                      <SelectCustom
                        fill={true}
                        options={timeSlots}
                        className="choose__time choose__start--time"
                        placeholder="hh:mm"
                        value={item.startTime}
                        onChange={(e) => handleChangeValueStartTime(e, idx)}
                      />
                    </div>
                    <div className="end__time">
                      <span className="name--time">Kết thúc</span>
                      <SelectCustom
                        fill={true}
                        options={timeSlots}
                        className="choose__time choose__end--time"
                        placeholder="hh:mm"
                        value={item.endTime}
                        onChange={(e) => handleChangeValueEndTime(e, idx)}
                      />
                    </div>
                  </div>
                  <div className="action__time">
                    <Tippy content="Thêm">
                      <span
                        className="add--time"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            timeRanges: [...formData.timeRanges, { startTime: "", endTime: "" }],
                          })
                        }
                      >
                        <Icon name="PlusCircleFill" />
                      </span>
                    </Tippy>
                    {formData.timeRanges.length > 1 && (
                      <Tippy content="Xóa">
                        <span className="delete--time" onClick={() => handleDeleteItemTimeRanges(idx)}>
                          <Icon name="Trash" />
                        </span>
                      </Tippy>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

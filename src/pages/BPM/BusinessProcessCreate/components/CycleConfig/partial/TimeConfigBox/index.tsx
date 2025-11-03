import NummericInput from "components/input/numericInput";
import React, { useState, useEffect } from "react";
import "./index.scss";

const listTimeUnit = [
  { label: "Năm", value: "year" },
  { label: "Quý", value: "quarter" },
  { label: "Tháng", value: "month" },
  { label: "Tuần", value: "week" },
  { label: "Ngày", value: "day" },
  { label: "Giờ", value: "hour" },
  { label: "Phút", value: "minute" },
  { label: "Giây", value: "second" },
];

export type TimeConfig = {
  year: string | number;
  quarter?: string | number;
  month: string | number;
  week: string | number;
  day: string | number;
  hour: string | number;
  minute: string | number;
  second: string | number;
};

type TimeConfigBoxProps = {
  initialConfig?: TimeConfig;
  onChange?: (config: TimeConfig) => void;
  enableYear?: boolean;
  enableQuarter?: boolean;
  enableMonth?: boolean;
  enableWeek?: boolean;
  enableDay?: boolean;
  enableHour?: boolean;
  enableMinute?: boolean;
  enableSecond?: boolean;
  leftYearLabel?: string;
  rightYearLabel?: string;
  leftQuarterLabel?: string;
  rightQuarterLabel?: string;
  leftMonthLabel?: string;
  rightMonthLabel?: string;
  leftWeekLabel?: string;
  rightWeekLabel?: string;
  leftDayLabel?: string;
  rightDayLabel?: string;
  leftHourLabel?: string;
  rightHourLabel?: string;
  leftMinuteLabel?: string;
  rightMinuteLabel?: string;
  leftSecondLabel?: string;
  rightSecondLabel?: string;
  setCronType?: (type: string) => void;
  repeatDuration: any;
  setRepeatDuration: (value: any) => void;
};

const TimeConfigBox: React.FC<TimeConfigBoxProps> = ({
  initialConfig = {
    year: "",
    quarter: "",
    month: "",
    week: "",
    day: "",
    hour: "",
    minute: "",
    second: "",
  },
  onChange,
  enableYear = false,
  enableQuarter = false,
  enableMonth = false,
  enableWeek = false,
  enableDay = false,
  enableHour = false,
  enableSecond = false,
  enableMinute = false,
  leftYearLabel = "",
  rightYearLabel = "",
  leftQuarterLabel = "",
  rightQuarterLabel = "",
  leftMonthLabel = "",
  rightMonthLabel = "",
  leftWeekLabel = "",
  rightWeekLabel = "",
  leftDayLabel = "",
  rightDayLabel = "",
  leftHourLabel = "",
  rightHourLabel = "",
  leftMinuteLabel = "",
  rightMinuteLabel = "",
  leftSecondLabel = "",
  rightSecondLabel = "",
  setCronType,
  repeatDuration,
  setRepeatDuration,
}) => {
  const [durationLabel, setDurationLabel] = useState<string>("");

  useEffect(() => {
    const parts: string[] = [];
    if (enableYear && repeatDuration.year) parts.push(`${repeatDuration.year} Năm `);
    if (enableQuarter && repeatDuration.quarter) parts.push(`${repeatDuration.quarter} Quý `);
    if (enableMonth && repeatDuration.month) parts.push(`${repeatDuration.month} Tháng `);
    if (enableWeek && repeatDuration.week) parts.push(`${repeatDuration.week} Tuần `);
    if (enableDay && repeatDuration.day) parts.push(`${repeatDuration.day} Ngày `);
    if (enableHour && repeatDuration.hour) parts.push(`${repeatDuration.hour} Giờ `);
    if (enableMinute && repeatDuration.minute) parts.push(`${repeatDuration.minute} Phút `);
    if (enableSecond && repeatDuration.second) parts.push(`${repeatDuration.second} Giây`);

    setDurationLabel(parts.length > 0 ? parts.join(" ") : "");

    for (let index = listTimeUnit.length; index >= 0; index--) {
      const element = listTimeUnit[index];
      if (element && (repeatDuration as any)[element.value]) {
        setCronType(element.value);
        break;
      } else {
        setCronType("");
      }
    }
  }, [repeatDuration]);

  return (
    <div className="box_time_config">
      <div className="box_setting_time">
        {enableYear && (
          <div className="box_time">
            <div>
              <span className="title_time">{leftYearLabel || ""}</span>
            </div>
            <div className="form-time">
              <NummericInput
                name="week"
                id="week"
                label={!rightYearLabel ? "Năm" : ""}
                // minValue={0}
                // maxValue={31}
                fill={false}
                value={repeatDuration.year}
                onChange={(e) => {
                  const value = e.target.value || "";
                  setRepeatDuration((prev) => ({ ...prev, year: value }));
                }}
              />
            </div>
            <div>
              <span className="title_time">{rightYearLabel || ""}</span>
            </div>
          </div>
        )}
        {/* {enableQuarter && (
          <div className="box_time">
            <div>
              <span className="title_time">{leftQuarterLabel || ""}</span>
            </div>
            <div className="form-time">
              <NummericInput
                name="quarter"
                id="quarter"
                label={!rightQuarterLabel ? "Quý" : ""}
                // minValue={0}
                // maxValue={31}
                fill={false}
                value={repeatDuration.quarter}
                onChange={(e) => {
                  const value = e.target.value || "";
                  setConfig((prev) => ({ ...prev, quarter: value }));
                }}
              />
            </div>
            <div>
              <span className="title_time">{rightQuarterLabel || ""}</span>
            </div>
          </div>
        )} */}
        {enableMonth && (
          <div className="box_time">
            <div>
              <span className="title_time">{leftMonthLabel || ""}</span>
            </div>
            <div className="form-time">
              <NummericInput
                name="week"
                id="week"
                label={!rightMonthLabel ? "Tháng" : ""}
                // minValue={0}
                // maxValue={31}
                fill={false}
                value={repeatDuration.month}
                onChange={(e) => {
                  const value = e.target.value || "";
                  setRepeatDuration((prev) => ({ ...prev, month: value }));
                }}
              />
            </div>
            <div>
              <span className="title_time">{rightMonthLabel || ""}</span>
            </div>
          </div>
        )}
        {enableWeek && (
          <div className="box_time">
            <div>
              <span className="title_time">{leftWeekLabel || ""}</span>
            </div>
            <div className="form-time">
              <NummericInput
                name="week"
                id="week"
                label={!rightWeekLabel ? "Tuần" : ""}
                // minValue={0}
                // maxValue={31}
                fill={false}
                value={repeatDuration.week}
                onChange={(e) => {
                  const value = e.target.value || "";
                  setRepeatDuration((prev) => ({ ...prev, week: value }));
                }}
              />
            </div>
            <div>
              <span className="title_time">{rightWeekLabel || ""}</span>
            </div>
          </div>
        )}
        {enableDay && (
          <div className="box_time">
            <div>
              <span className="title_time">{leftDayLabel || ""}</span>
            </div>
            <div className="form-time">
              <NummericInput
                name="day"
                id="day"
                label={!rightDayLabel ? "Ngày" : ""}
                // minValue={0}
                // maxValue={31}
                fill={false}
                value={repeatDuration.day}
                onChange={(e) => {
                  const value = e.target.value || "";
                  setRepeatDuration((prev) => ({ ...prev, day: value }));
                }}
              />
            </div>
            <div>
              <span className="title_time">{rightDayLabel || ""}</span>
            </div>
          </div>
        )}
        {enableHour && (
          <div className="box_time">
            <div>
              <span className="title_time">{leftHourLabel || ""}</span>
            </div>
            <div className="form-time">
              <NummericInput
                name="hour"
                id="hour"
                label={!rightHourLabel ? "Giờ" : ""}
                fill={false}
                // minValue={0}
                // maxValue={23}
                value={repeatDuration.hour}
                onChange={(e) => {
                  const value = e.target.value || "";
                  setRepeatDuration((prev) => ({ ...prev, hour: value }));
                }}
              />
            </div>
            <div>
              <span className="title_time">{rightHourLabel || ""}</span>
            </div>
          </div>
        )}
        {enableMinute && (
          <div className="box_time">
            <div>
              <span className="title_time">{leftMinuteLabel || ""}</span>
            </div>
            <div className="form-time">
              <NummericInput
                name="minute"
                id="minute"
                label={!rightMinuteLabel ? "Phút" : ""}
                // minValue={0}
                // maxValue={59}
                fill={false}
                value={repeatDuration.minute}
                onChange={(e) => {
                  const value = e.target.value || "";
                  setRepeatDuration((prev) => ({ ...prev, minute: value }));
                }}
              />
            </div>
            <div>
              <span className="title_time">{rightMinuteLabel || ""}</span>
            </div>
          </div>
        )}
        {enableSecond && (
          <div className="box_time">
            <div>
              <span className="title_time">{leftSecondLabel || ""}</span>
            </div>
            <div className="form-time">
              <NummericInput
                name="second"
                id="second"
                label={!rightSecondLabel ? "Giây" : ""}
                // minValue={0}
                // maxValue={59}
                fill={false}
                value={repeatDuration.second}
                onChange={(e) => {
                  const value = e.target.value || "";
                  setRepeatDuration((prev) => ({ ...prev, second: value }));
                }}
              />
            </div>
            <div>
              <span className="title_time">{rightSecondLabel || ""}</span>
            </div>
          </div>
        )}
      </div>
      <div className="text-duration" style={{ paddingLeft: "5px", marginTop: "8px", fontSize: "14px" }}>
        {durationLabel ? "Thời gian giữa hai lần kiểm tra kích hoạt là: " + durationLabel : ""}
      </div>
    </div>
  );
};

export default TimeConfigBox;

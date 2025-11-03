import NummericInput from "components/input/numericInput";
import React, { useState } from "react";
import "./index.scss";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import TimeConfigBox from "./partial/TimeConfigBox";
import moment from "moment";
import RunTimeConfig from "./partial/RunTimeConfig";

export default function CycleConfig({ setFormData, formData, repeatDuration, setRepeatDuration, config, setConfig }: any) {
  const [cronType, setCronType] = useState("");

  return (
    <div className="cycle-config">
      <div className="form-group-cycle">
        <DatePickerCustom
          label="Thời điểm bắt đầu vào vòng lặp (Start)"
          name="start"
          fill={true}
          required={false}
          isFmtText={true}
          value={formData.start ? moment(formData.start).format("DD/MM/YYYY HH:mm:ss") : ""}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, start: e ? e : null }));
          }}
          hasSelectTime={true}
          timeIntervals={15}
          placeholder="DD/MM/YYYY"
        />
      </div>
      <div className="form-group-cycle">
        <NummericInput
          id="executionCount"
          name="executionCount"
          label="Số lần thực thi"
          fill={true}
          required={false}
          placeholder={"Số lần thực thi"}
          value={formData.executionCount}
          onValueChange={(e) => {
            const value = e.floatValue;
            setFormData((prev) => ({ ...prev, executionCount: value }));
          }}
        />
      </div>
      <div className="form-group-cycle">
        <div style={{ fontSize: 14, fontWeight: "700" }} className="title_time">
          Tần suất kích hoạt{" "}
          <span className="required" style={{ color: "red" }}>
            *
          </span>
        </div>
        <div className="container-config">
          <div className="day-cycle">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", width: "100%" }}>
              <TimeConfigBox
                enableHour
                enableMinute
                enableSecond
                enableDay
                enableWeek
                enableMonth
                enableYear
                enableQuarter
                setCronType={setCronType}
                repeatDuration={repeatDuration}
                setRepeatDuration={setRepeatDuration}
              />
            </div>
          </div>
        </div>
      </div>
      {cronType !== "" && cronType !== "second" ? (
        <div className="form-group-cycle">
          <div style={{ fontSize: 14, fontWeight: "700" }} className="title_time">
            Thời điểm thực thi{" "}
          </div>
          <div className="day-cycle">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", width: "100%" }}>
              <RunTimeConfig
                enableSecond={
                  cronType == "minute" ||
                  cronType == "hour" ||
                  cronType == "day" ||
                  cronType == "week" ||
                  cronType == "month" ||
                  cronType == "year" ||
                  cronType == "quarter"
                }
                enableMinute={
                  cronType == "hour" || cronType == "day" || cronType == "week" || cronType == "month" || cronType == "year" || cronType == "quarter"
                }
                enableDayOfWeek={cronType == "week"}
                enableHour={cronType == "day" || cronType == "week" || cronType == "month" || cronType == "year" || cronType == "quarter"}
                enableDay={cronType == "month" || cronType == "year" || cronType == "quarter"}
                // enableWeek={cronType == "year"}
                enableMonth={cronType == "year" || cronType == "quarter"}
                // enableYear={cronType == "year"}
                cronType={cronType}
                config={config}
                setConfig={setConfig}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

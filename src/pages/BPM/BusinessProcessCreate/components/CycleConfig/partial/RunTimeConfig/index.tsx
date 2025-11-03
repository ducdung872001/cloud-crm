import React, { useState, useEffect } from "react";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import Icon from "components/icon";

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: i + 1,
  value: i + 1,
}));

const weekOptions = [
  { label: "Chủ nhật", value: 1 },
  { label: "Thứ hai", value: 2 },
  { label: "Thứ ba", value: 3 },
  { label: "Thứ tư", value: 4 },
  { label: "Thứ năm", value: 5 },
  { label: "Thứ sáu", value: 6 },
  { label: "Thứ bảy", value: 7 },
];

const dayOptions = Array.from({ length: 31 }, (_, i) => ({
  label: i + 1,
  value: i + 1,
}));

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: i,
  value: i,
}));

const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
  label: i,
  value: i,
}));

const secondOptions = Array.from({ length: 60 }, (_, i) => ({
  label: i,
  value: i,
}));

export type TimeConfig = {
  year: number[] | string[];
  quarter?: number[] | string[];
  month: number[] | string[];
  week: number[] | string[];
  day: number[] | string[];
  hour: number[] | string[];
  minute: number[] | string[];
  second: number[] | string[];
};

type TimeConfigBoxProps = {
  initialConfig?: TimeConfig[];
  onChange?: (config: TimeConfig[]) => void;
  enableYear?: boolean;
  enableQuarter?: boolean;
  enableMonth?: boolean;
  enableDayOfWeek?: boolean;
  enableWeek?: boolean;
  enableDay?: boolean;
  enableHour?: boolean;
  enableMinute?: boolean;
  enableSecond?: boolean;
  cronType?: string;
  config: any;
  setConfig: any;
};

const RunTimeConfig: React.FC<TimeConfigBoxProps> = ({
  initialConfig = [
    {
      year: [],
      quarter: [],
      month: [],
      week: [],
      day: [],
      hour: [],
      minute: [],
      second: [],
    },
  ],
  enableYear = false,
  enableQuarter = false,
  enableMonth = false,
  enableWeek = false,
  enableDayOfWeek = false,
  enableDay = false,
  enableHour = false,
  enableSecond = false,
  enableMinute = false,
  cronType,
  config,
  setConfig,
}) => {
  useEffect(() => {
    if (config?.length > 0) {
      setConfig((prev) => {
        return prev.map((item) => ({
          ...item,
          month: enableMonth ? item.month : [],
          day: enableDay ? item.day : [],
          week: enableDayOfWeek ? item.week : [],
          hour: enableHour ? item.hour : [],
          minute: enableMinute ? item.minute : [],
          second: enableSecond ? item.second : [],
        }));
      });
    }
  }, [enableMonth, enableDay, enableHour, enableMinute, enableSecond, enableDayOfWeek]);

  return (
    <div className="run-time-config">
      {config?.length > 0 ? (
        <>
          {config.map((item_config, index) => (
            <div className="box_setting_time" key={index}>
              {config?.length > 1 ? (
                <div className="icon-delete">
                  <Icon
                    name="Trash"
                    onClick={() => {
                      setConfig((prev) => prev.filter((_, i) => i !== index));
                    }}
                  />
                </div>
              ) : null}
              {enableMonth && (
                <div className="box_time">
                  <div className="title-container">
                    <span className="title_time">Tháng thứ</span>
                  </div>
                  <div className="form-time">
                    <SelectCustom
                      options={monthOptions}
                      isMulti={true}
                      special={true}
                      fill={true}
                      value={item_config.month}
                      name={"month" + index}
                      placeholder={`Chọn tháng`}
                      onChange={(e) => {
                        const value = e.map((item) => item.value);
                        setConfig((prev) => {
                          const newList = [...prev];
                          newList[index] = { ...newList[index], month: e };
                          return newList;
                        });
                      }}
                    />
                  </div>
                  <div>
                    <span className="title_time">của năm</span>
                  </div>
                </div>
              )}
              {enableDayOfWeek && (
                <div className="box_time">
                  <div className="title-container">
                    <span className="title_time">Ngày</span>
                  </div>
                  <div className="form-time">
                    <SelectCustom
                      options={weekOptions}
                      isMulti={true}
                      special={true}
                      fill={true}
                      value={item_config.week}
                      name={"week" + index}
                      placeholder={`Chọn thứ`}
                      onChange={(e) => {
                        setConfig((prev) => {
                          const newList = [...prev];
                          newList[index] = { ...newList[index], week: e };
                          return newList;
                        });
                      }}
                    />
                  </div>
                  <div>
                    <span className="title_time">của tuần</span>
                  </div>
                </div>
              )}
              {enableDay && (
                <div className="box_time">
                  <div className="title-container">
                    <span className="title_time">Ngày thứ</span>
                  </div>
                  <div className="form-time">
                    <SelectCustom
                      options={dayOptions}
                      isMulti={true}
                      special={true}
                      fill={true}
                      value={item_config.day}
                      name={"day" + index}
                      placeholder={`Chọn ngày`}
                      onChange={(e) => {
                        const value = e.map((item) => item.value);
                        setConfig((prev) => {
                          const newList = [...prev];
                          newList[index] = { ...newList[index], day: e };
                          return newList;
                        });
                      }}
                    />
                  </div>
                  <div>
                    <span className="title_time">của tháng</span>
                  </div>
                </div>
              )}
              {enableHour && (
                <div className="box_time">
                  <div className="title-container">
                    <span className="title_time">Giờ thứ</span>
                  </div>
                  <div className="form-time">
                    <SelectCustom
                      options={hourOptions}
                      isMulti={true}
                      special={true}
                      fill={true}
                      value={item_config.hour}
                      name={"hour" + index}
                      placeholder={`Chọn giờ`}
                      onChange={(e) => {
                        const value = e.map((item) => item.value);
                        setConfig((prev) => {
                          const newList = [...prev];
                          newList[index] = { ...newList[index], hour: e };
                          return newList;
                        });
                      }}
                    />
                  </div>
                  <div>
                    <span className="title_time">của ngày</span>
                  </div>
                </div>
              )}
              {enableMinute && (
                <div className="box_time">
                  <div className="title-container">
                    <span className="title_time">Phút thứ</span>
                  </div>
                  <div className="form-time">
                    <SelectCustom
                      options={minuteOptions}
                      isMulti={true}
                      special={true}
                      fill={true}
                      value={item_config.minute}
                      name={"minute" + index}
                      placeholder={`Chọn phút`}
                      onChange={(e) => {
                        const value = e.map((item) => item.value);
                        setConfig((prev) => {
                          const newList = [...prev];
                          newList[index] = { ...newList[index], minute: e };
                          return newList;
                        });
                      }}
                    />
                  </div>
                  <div>
                    <span className="title_time">của giờ</span>
                  </div>
                </div>
              )}
              {enableSecond && (
                <div className="box_time">
                  <div className="title-container">
                    <span className="title_time">Giây thứ</span>
                  </div>
                  <div className="form-time">
                    <SelectCustom
                      options={secondOptions}
                      isMulti={true}
                      special={true}
                      fill={true}
                      value={item_config.second}
                      name={"second" + index}
                      placeholder={`Chọn giây`}
                      onChange={(e) => {
                        const value = e.map((item) => item.value);
                        setConfig((prev) => {
                          const newList = [...prev];
                          newList[index] = { ...newList[index], second: e };
                          return newList;
                        });
                      }}
                    />
                  </div>
                  <div>
                    <span className="title_time">của phút</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      ) : null}
      {cronType == "minute" ? null : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="btn_add_time"
            onClick={(e) => {
              e.preventDefault();
              setConfig((prev) => [
                ...prev,
                {
                  year: [],
                  quarter: [],
                  month: [],
                  week: [],
                  day: [],
                  hour: [],
                  minute: [],
                  second: [],
                },
              ]);
            }}
          >
            Thêm thời điểm
          </button>
        </div>
      )}
    </div>
  );
};

export default RunTimeConfig;

import React from "react";
import _ from "lodash";
import { IFieldCustomize} from "model/FormModel";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";

// import "./index.scss";

export type BuildListFieldAssignParams = {
  // data/state
  dataManager: any;
  dataWorkProject: any;
  dataEmployee: any;
  dataTimeWorkLoad: any;
  listOptionTimeWorkLoad: any[];
  isOptionTimeWorkLoad: boolean;

  // derived/validate
  startDay: number;
  endDay: number;
  validateWordLoad: boolean;
  formData: any;

  // refs
  refContainerTimeWorkLoad: any;
  refOptionTimeWorkLoad: any;

  // handlers
  formatOptionLabelManager: (opt: any) => React.ReactNode;
  formatOptionLabelEmployee: (opt: any) => React.ReactNode;
  handleChangeValueEmployee: (e: any) => void;
  loadedOptionEmployee: any;
  handleChangeValueWorkLoad: (e: any) => void;

  setIsOptionTimeWorkLoad: (v: boolean) => void;
  setDataTimeWorkLoad: (v: any) => void;
};

export function buildListFieldAssign(p: BuildListFieldAssignParams): IFieldCustomize[] {
  const {
    dataManager,
    dataWorkProject,
    dataEmployee,
    dataTimeWorkLoad,
    listOptionTimeWorkLoad,
    isOptionTimeWorkLoad,

    startDay,
    endDay,
    validateWordLoad,
    formData,

    refContainerTimeWorkLoad,
    refOptionTimeWorkLoad,

    formatOptionLabelManager,
    formatOptionLabelEmployee,
    handleChangeValueEmployee,
    loadedOptionEmployee,
    handleChangeValueWorkLoad,

    setIsOptionTimeWorkLoad,
    setDataTimeWorkLoad,
  } = p;

  return [
    {
      name: "managerId",
      type: "custom",
      snippet: (
        <SelectCustom
          id="managerId"
          name="managerId"
          label="Người giao việc"
          options={dataManager ? [dataManager] : []}
          fill={true}
          required={true}
          readOnly={true}
          value={dataManager?.value ?? ""}
          isFormatOptionLabel={true}
          placeholder="Chọn người giao việc"
          formatOptionLabel={formatOptionLabelManager}
        />
      ),
    },
    {
      name: "employeeId",
      type: "custom",
      snippet: (
        <SelectCustom
          key={
            (dataWorkProject?.value ? dataWorkProject.value : "null") +
            "_" +
            (dataEmployee?.value ? dataEmployee.value : "null")
          }
          id="employeeId"
          name="employeeId"
          label="Người nhận việc"
          options={[]}
          fill={true}
          required={true}
          disabled={!dataWorkProject}
          value={dataEmployee}
          onChange={(e) => handleChangeValueEmployee(e)}
          isAsyncPaginate={true}
          isFormatOptionLabel={true}
          placeholder="Chọn người nhận việc"
          additional={{ page: 1 }}
          loadOptionsPaginate={loadedOptionEmployee}
          formatOptionLabel={formatOptionLabelEmployee}
          error={!dataWorkProject}
          message="Vui lòng chọn dự án trước khi chọn người nhận việc"
        />
      ),
    },
    {
      name: "workLoad",
      type: "custom",
      snippet: (
        <div className="wrapper__workload">
          <NummericInput
            id="workLoad"
            name="workLoad"
            label="Khối lượng công việc"
            value={formData?.values?.workLoad}
            fill={true}
            placeholder="Nhập khối lượng công việc"
            required={true}
            error={validateWordLoad || (formData?.values?.workLoad !== "" && formData?.values?.workLoad == 0)}
            message={
              validateWordLoad
                ? "Vui lòng nhập khối lượng công việc"
                : formData?.values?.workLoad !== "" && formData?.values?.workLoad == 0
                ? "Khối lượng công việc cần lớn hơn 0"
                : ""
            }
            onValueChange={(e) => handleChangeValueWorkLoad(e)}
          />

          <div className="option__time--workload" ref={refContainerTimeWorkLoad}>
            <div
              className="selected__item--workload"
              onClick={() => setIsOptionTimeWorkLoad(!isOptionTimeWorkLoad)}
            >
              {dataTimeWorkLoad?.label}
              <Icon name="ChevronDown" />
            </div>

            {isOptionTimeWorkLoad && (
              <ul className="menu__time--workload" ref={refOptionTimeWorkLoad}>
                {listOptionTimeWorkLoad.map((item, idx) => (
                  <li
                    key={idx}
                    className={`item--workload ${
                      dataTimeWorkLoad?.value === item.value ? "active__item--workload" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setDataTimeWorkLoad(item);
                      setIsOptionTimeWorkLoad(false);
                    }}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ),
    },
    {
      label: "Mức độ ưu tiên",
      name: "priorityLevel",
      type: "radio",
      options: [
        { label: "Thấp", value: "1" },
        { label: "Trung bình", value: "2" },
        { label: "Cao", value: "3" },
        { label: "Rất cao", value: "4" },
      ],
      fill: true,
      required: true,
    },
    {
      label: "Bắt đầu",
      name: "startTime",
      type: "date",
      fill: true,
      required: true,
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
      isWarning: startDay > endDay,
      hasSelectTime: true,
      placeholder: "Nhập ngày bắt đầu",
      messageWarning: "Ngày bắt đầu nhỏ hơn ngày kết thúc",
    },
    {
      label: "Kết thúc",
      name: "endTime",
      type: "date",
      fill: true,
      required: true,
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
      isWarning: endDay < startDay,
      hasSelectTime: true,
      placeholder: "Nhập ngày kết thúc",
      messageWarning: "Ngày kết thúc lớn hơn ngày bắt đầu",
    },
  ] as IFieldCustomize[];
}

import React from "react";
import _ from "lodash";
import { IFieldCustomize } from "model/FormModel";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import WorkOrderService from "services/WorkOrderService";

export type BuildListFieldAssignParams = {
  // data/state
  dataManager: Record<string, unknown> | null;
  dataWorkProject: Record<string, unknown> | null;
  dataEmployee: Record<string, unknown> | null;
  dataTimeWorkLoad: Record<string, unknown> | null;
  listOptionTimeWorkLoad: Record<string, unknown>[];
  isOptionTimeWorkLoad: boolean;

  // derived/validate
  startDay: number;
  endDay: number;
  validateWordLoad: boolean;
  formData: Record<string, unknown>;

  // refs
  refContainerTimeWorkLoad: React.RefObject<HTMLDivElement>;
  refOptionTimeWorkLoad: React.RefObject<HTMLUListElement>;

  // handlers (UI/state update)
  formatOptionLabelManager: (opt: Record<string, unknown>) => React.ReactNode;
  formatOptionLabelEmployee: (opt: Record<string, unknown>) => React.ReactNode;

  handleChangeValueManager: (e: unknown) => void;
  handleChangeValueEmployee: (e: unknown) => void;
  handleChangeValueWorkLoad: (e: unknown) => void;

  setIsOptionTimeWorkLoad: (v: boolean) => void;
  setDataTimeWorkLoad: (v: Record<string, unknown>) => void;
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

    handleChangeValueManager,
    handleChangeValueEmployee,
    handleChangeValueWorkLoad,

    setIsOptionTimeWorkLoad,
    setDataTimeWorkLoad,
  } = p;

  const loadProjectAssignees = async (_search: string, _loadedOptions: unknown, { page }: { page: number }) => {
    if (!dataWorkProject?.value) return { options: [], hasMore: false };

    const response = await WorkOrderService.projectEmployeeAssignees({
      workProjectId: dataWorkProject.value,
    });

    if (response?.code === 0) {
      const raw = response?.result;
      const list = Array.isArray(raw) ? raw : raw?.items ?? [];
      const hasMore = !!raw?.loadMoreAble;

      return {
        options: list.map((item: Record<string, unknown>) => ({
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        })),
        hasMore,
        additional: { page: page + 1 },
      };
    }

    return { options: [], hasMore: false };
  };

  return [
    // {
    //   name: "managerId",
    //   type: "custom",
    //   snippet: (
    //     <SelectCustom
    //       key={(dataWorkProject?.value ? dataWorkProject.value : "null") + "_" + (dataManager?.value ?? "null")}
    //       id="managerId"
    //       name="managerId"
    //       label="Người giao việc"
    //       options={[]}
    //       fill={true}
    //       required={true}
    //       disabled={!dataWorkProject}
    //       value={dataManager}
    //       onChange={(e) => handleChangeValueManager(e)}
    //       isAsyncPaginate={true}
    //       isFormatOptionLabel={true}
    //       placeholder="Chọn người giao việc"
    //       additional={{ page: 1 }}
    //       loadOptionsPaginate={loadProjectAssignees}
    //       formatOptionLabel={formatOptionLabelManager}
    //       error={!dataWorkProject}
    //       message="Vui lòng chọn dự án trước khi chọn người giao việc"
    //     />
    //   ),
    // }
    // ,
    {
      name: "employeeId",
      type: "custom",
      snippet: (
        <SelectCustom
          key={(dataWorkProject?.value ? dataWorkProject.value : "null") + "_" + (dataEmployee?.value ? dataEmployee.value : "null")}
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
          loadOptionsPaginate={loadProjectAssignees}
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
            <div className="selected__item--workload" onClick={() => setIsOptionTimeWorkLoad(!isOptionTimeWorkLoad)}>
              {dataTimeWorkLoad?.label}
              <Icon name="ChevronDown" />
            </div>

            {isOptionTimeWorkLoad && (
              <ul className="menu__time--workload" ref={refOptionTimeWorkLoad}>
                {listOptionTimeWorkLoad.map((item, idx) => (
                  <li
                    key={item.value}
                    className={`item--workload ${dataTimeWorkLoad?.value === item.value ? "active__item--workload" : ""}`}
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

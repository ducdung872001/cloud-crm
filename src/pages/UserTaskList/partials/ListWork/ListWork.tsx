import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import Icon from "components/icon";
import Button from "components/button/button";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IListWorkProps } from "model/workOrder/PropsModel";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { IWorkOrderFilterRequest } from "model/workOrder/WorkOrderRequestModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import { getPermissions, showToast } from "utils/common";
import UserTaskService from "services/UserTaskService";
import TableWork from "./partials/TableWork/TableWork";
import KanbanWork from "./partials/KanbanWork/KanbanWork";
import AddWorkInprogressModal from "./partials/AddWorkInprogressModal/AddWorkInprogressModal";
import ViewWorkInprogressModal from "./partials/ViewWorkInprogressModal/ViewWorkInprogressModal";
import "tippy.js/animations/scale.css";
import "./ListWork.scss";
import { ExportExcel } from "exports";
import ExportModal from "components/exportModal/exportModal";
import JobReport from "./partials/JobReport/JobReport";
import SearchBox from "components/searchBox/searchBox";
import Popover from "components/popover/popover";
import { useOnClickOutside } from "utils/hookCustom";
import SelectCustom from "components/selectCustom/selectCustom";
import FilterModal from "./partials/FilterModal/FilterModal";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import ModalAddWorkBpm from "./partials/ModalAddWorkBPM/ModalAddWorkBPM";
import EmployeeService from "services/EmployeeService";

// status: 0-chưa bắt đầu, 1-mới tiếp nhận, 2-hoàn thành, 3-huỷ, 4-tạm dừng

export default function ListWork(props: any) {
  const isMounted = useRef(false);

  const navigation = useNavigate();
  const [permissions, setPermissions] = useState(getPermissions());

  const {
    type,
    isDetailWork,
    idManagement,
    isRegimeKanban,
    setIsRegimeKanban,
    isRegimeReport,
    isFullPage,
    handleDetailWork,
    showProjectManagement,
    setIsDetailWork,
    setIsHandleTask,
    abortController,
    isExportWork,
    setIsFullPage,
    onHideExport,
    dataProjectReport,
    setOnShowModalExport,
  } = props;

  const [searchParams, setSearchParams] = useSearchParams();

  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listWork, setListWork] = useState<IWorkOrderResponseModel[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataEmployee, setDataEmployee] = useState(null);

  const takeDataEmployee = async () => {
    const response = await EmployeeService.info();

    if (response.code === 0) {
      const result = response.result;
      setDataEmployee(result);
    }
  };

  // đoạn này cập nhập tiến động công việc
  const [idWork, setIdWork] = useState<number>(null);
  const [showModalWorkInprogress, setShowModalWorkInprogress] = useState<boolean>(false);

  // đoạn này hiển thị danh sách cập nhật tiến độ công việc
  const [showModalViewWorkInprogress, setShowModalViewWorkInprogress] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
  });

  const [paramsInit, setParamsInit] = useState<any>({
    name: "",
    // processId: -1,
    // potId: -1,
  });

  useEffect(() => {
    takeDataEmployee();

    // if (idManagement) {
    //   if (type === "opportunity") {
    //     const newParams = { ...params };
    //     delete newParams["projectId"];
    //     setParams({ ...newParams, opportunityId: idManagement, workType: type });
    //   } else {
    //     const newParams = { ...params };
    //     delete newParams["opportunity"];
    //     // setParams({ ...newParams, projectId: idManagement, workType: type });
    //     setParams({ ...newParams, processId: idManagement, potId: -1 });

    //   }
    // }
  }, [idManagement, type]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách công việc",
      is_active: true,
    },
  ]);

  const [filterByKanban, setFilterByKanban] = useState<string>("kanbanStatus");

  const customerFilterList: IFilterItem[] = useMemo(
    () =>
      isRegimeKanban
        ? [
            ...(filterByKanban !== "kanbanProject"
              ? ([
                  {
                    key: "departmentId",
                    name: "Phòng ban",
                    type: "select",
                    is_featured: true,
                    value: searchParams.get("departmentId") ?? "",
                  },
                ] as any)
              : []),
            ...(filterByKanban !== "kanbanEmployee" && filterByKanban !== "kanbanProject"
              ? ([
                  {
                    key: "employeeId",
                    name: "Nhân viên",
                    type: "select",
                    is_featured: true,
                    value: searchParams.get("employeeId") ?? "",
                  },
                ] as any)
              : []),
            {
              key: "status",
              name: "Trạng thái công việc",
              type: "select",
              is_featured: true,
              list: [
                {
                  value: "-1",
                  label: "Tất cả",
                },
                {
                  value: "0",
                  label: "Chưa thực hiện",
                },
                {
                  value: "1",
                  label: "Đang thực hiện",
                },
                {
                  value: "2",
                  label: "Đã hoàn thành",
                },
                {
                  value: "3",
                  label: "Đã hủy",
                },
              ],
              value: searchParams.get("status") ?? "",
            },
            {
              key: "time_buy",
              name: "Khoảng thời gian",
              type: "date-two",
              param_name: ["startDate", "endDate"],
              is_featured: true,
              value: searchParams.get("startDate") ?? "",
              value_extra: searchParams.get("endDate") ?? "",
              is_fmt_text: true,
            },
            {
              key: "type",
              name: "Kiểu công việc",
              type: "select",
              is_featured: true,
              list: [
                {
                  value: "-1",
                  label: "Tất cả",
                },
                {
                  value: "1",
                  label: "Công việc mới nhất",
                },
                {
                  value: "2",
                  label: "Công việc liên quan",
                },
                {
                  value: "3",
                  label: "Công việc ưu tiên",
                },
                {
                  value: "4",
                  label: "Công việc bị chậm",
                },
              ],
              value: searchParams.get("type") ?? "",
            },
            {
              key: "sourceType",
              name: "Nguồn công việc",
              type: "select",
              is_featured: true,
              list: [
                {
                  value: "1",
                  label: "Việc tôi giao người khác",
                },
                {
                  value: "2",
                  label: "Việc tôi nhận từ người khác giao",
                },
                {
                  value: "3",
                  label: "Việc tôi có liên quan",
                },
              ],
              value: searchParams.get("sourceType") ?? "",
            },
          ]
        : [
            {
              key: "departmentId",
              name: "Phòng ban",
              type: "select",
              is_featured: true,
              value: searchParams.get("departmentId") ?? "",
            },
            {
              key: "employeeId",
              name: "Nhân viên",
              type: "select",
              is_featured: true,
              value: searchParams.get("employeeId") ?? "",
            },
            {
              key: "status",
              name: "Trạng thái công việc",
              type: "select",
              is_featured: true,
              list: [
                {
                  value: "-1",
                  label: "Tất cả",
                },
                {
                  value: "0",
                  label: "Chưa thực hiện",
                },
                {
                  value: "1",
                  label: "Đang thực hiện",
                },
                {
                  value: "2",
                  label: "Đã hoàn thành",
                },
                {
                  value: "3",
                  label: "Đã hủy",
                },
              ],
              value: searchParams.get("status") ?? "",
            },
            {
              key: "time_buy",
              name: "Khoảng thời gian",
              type: "date-two",
              param_name: ["startDate", "endDate"],
              is_featured: true,
              value: searchParams.get("startDate") ?? "",
              value_extra: searchParams.get("endDate") ?? "",
              is_fmt_text: true,
            },
            {
              key: "type",
              name: "Kiểu công việc",
              type: "select",
              is_featured: true,
              list: [
                {
                  value: "-1",
                  label: "Tất cả",
                },
                {
                  value: "1",
                  label: "Công việc mới nhất",
                },
                {
                  value: "2",
                  label: "Công việc liên quan",
                },
                {
                  value: "3",
                  label: "Công việc ưu tiên",
                },
                {
                  value: "4",
                  label: "Công việc bị chậm",
                },
              ],
              value: searchParams.get("type") ?? "",
            },
            {
              key: "sourceType",
              name: "Nguồn công việc",
              type: "select",
              is_featured: true,
              list: [
                {
                  value: "1",
                  label: "Việc tôi giao người khác",
                },
                {
                  value: "2",
                  label: "Việc tôi nhận từ người khác giao",
                },
                {
                  value: "3",
                  label: "Việc tôi có liên quan",
                },
              ],
              value: searchParams.get("sourceType") ?? "",
            },
          ],
    [searchParams, filterByKanban, isRegimeKanban]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Công việc",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortControllerChild = new AbortController();

  const getListWork = async (paramsSearch: IWorkOrderFilterRequest, notLoad?) => {
    if (!notLoad) {
      setIsLoading(true);
    }

    if (type === "process") {
      delete paramsSearch["opportunityId"];
    } else {
      delete paramsSearch["processId"];
    }

    // Nếu là báo cáo công việc thì lấy id của dự án từ báo cáo
    // if (dataProjectReport) {
    //   paramsSearch = { ...paramsSearch, processId: dataProjectReport.id };
    // }

    const response = await UserTaskService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;

      setListWork(result.items);
      // handleDetailWork(null, result.items?.length);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && !params?.name && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let paramsTemp = _.cloneDeep(params);

    searchParams.forEach(async (key, value) => {
      if (value == "filters") {
        paramsTemp[value] = {
          ...(paramsTemp["projectId"] ? { projectId: paramsTemp["projectId"] } : {}),
          ...(paramsTemp["prName"] ? { projectId: paramsTemp["prName"] } : {}),
        };
      } else {
        paramsTemp[value] = key;
      }
    });

    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListWork(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });

      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        if (!dataProjectReport) {
          setSearchParams(paramsTemp as Record<string, string | string[]>);
        }
      }
    }
    return () => {
      abortControllerChild.abort();
    };
  }, [params, isDetailWork]);

  const [dataOfApproachStart, setDataOfApproachStart] = useState([]);
  const [dataOfApproachDo, setDataOfApproachDo] = useState([]);
  const [dataOfApproachFail, setDataOfApproachFail] = useState([]);
  const [dataOfApproachSuccess, setDataOfApproachSuccess] = useState([]);
  const [dataOfApproachPending, setDataOfApproachPending] = useState([]);

  const getDataOfStatus = async (idManagement, status) => {
    if (dataProjectReport) {
      return;
    }
    const param: any = {
      limit: 10,
      page: 1,
      status: status,
      // workType: type,
    };
    if (type === "process") {
      param.processId = idManagement;
    } else {
      param.opportunityId = idManagement;
    }

    const response = await UserTaskService.list(param);

    if (response.code === 0) {
      const result = response.result;
      if (status === 0) {
        setDataOfApproachStart(result);
      } else if (status === 1) {
        setDataOfApproachDo(result);
      } else if (status === 2) {
        setDataOfApproachSuccess(result);
      } else if (status === 3) {
        setDataOfApproachFail(result);
      } else {
        setDataOfApproachPending(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (idManagement) {
      // Nguyên nhân gây ra thông báo lỗi: Invalid number value: null
      getDataOfStatus(idManagement, 0);
      getDataOfStatus(idManagement, 1);
      getDataOfStatus(idManagement, 2);
      getDataOfStatus(idManagement, 3);
      getDataOfStatus(idManagement, 4);
    }
  }, [type, idManagement]);

  //Export
  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả công việc",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} công việc phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, params]
  );

  const titles = [
    "STT",
    "Tên công việc",
    "",
    //  "Dự án",
    "Thời gian",
    // "Tên gói thầu mua sắm",
    "Người nhận việc",
    "Trạng thái",
  ];

  const titlesExcel = ["STT", "Tên công việc", "Dự án", "Thời gian", "Tên gói thầu mua sắm", "Người nhận việc", "Trạng thái"];
  const dataFormatExport = [
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
  ];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number, type?: string) =>
    type !== "export"
      ? [
          getPageOffset(params) + index + 1,
          <div>
            {item.scope === "external" ? (
              <div className="container-name">
                <span
                  key={item.id}
                  className="title-name"
                  onClick={() => {
                    setIsDetailWork(true);
                    handleDetailWork(item, listWork.length);
                    setIsShowFilter(false);
                  }}
                >
                  {item.content}
                </span>

                {item.taskType === "my_task" || (item.status === 0 && item.managerId === dataEmployee?.id) ? (
                  <div className="box-icon">
                    {permissions["WORK_MANAGEMENT_UPDATE"] == 1 ? (
                      <Tippy content="Sửa">
                        <div
                          className="icon-edit"
                          onClick={() => {
                            setShowModalAdd(true);
                            setIdWork(item.id);
                          }}
                        >
                          <Icon name="PencilSimpleLineSmall" />
                        </div>
                      </Tippy>
                    ) : null}

                    {permissions["WORK_MANAGEMENT_DELETE"] == 1 ? (
                      <Tippy content="Xoá">
                        <div className="icon-delete" onClick={() => showDialogConfirmDelete(item)}>
                          <Icon name="TrashRoxSmall" />
                        </div>
                      </Tippy>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="container-name">
                <span
                  key={item.id}
                  className="title-name"
                  onClick={() => {
                    setIsDetailWork(true);
                    handleDetailWork(item, listWork.length);
                    setIsShowFilter(false);
                  }}
                >
                  {item.nodeName || item.name} {item?.iteration && item.iteration > 0 ? `(lần ${item.iteration})` : ""}
                </span>
              </div>
            )}
          </div>,
          <div>
            <Tippy
              content={`${
                item.priorityLevel === 1 || item.priorityLevel === 2 ? "Việc không ưu tiên" : item.priorityLevel === 3 ? "Việc ưu tiên" : "Việc gấp"
              }`}
            >
              <div
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (item.priorityLevel === 1 || item.priorityLevel === 2) {
                    changePriorityLevel(item.id, 3);
                  }
                  if (item.priorityLevel === 3) {
                    changePriorityLevel(item.id, 2);
                  }
                  setIsShowFilter(false);
                }}
              >
                <Icon
                  name="Star"
                  style={{
                    width: 20,
                    height: 20,
                    fill:
                      item.priorityLevel === 1 || item.priorityLevel === 2
                        ? "var(--extra-color-30)"
                        : item.priorityLevel === 3
                        ? "#FDE047"
                        : "#ED1B34",
                    marginTop: -4,
                    marginRight: 5,
                  }}
                />
              </div>
            </Tippy>
          </div>,
          <div>
            {item.startTime || item.endTime
              ? `${moment(item.startTime).format("DD/MM/YYYY HH:mm")} - ${moment(item.endTime).format("DD/MM/YYYY HH:mm")}`
              : ""}
          </div>,
          // <div style={{ width: "20rem" }}>{item.extendedData && JSON.parse(item.extendedData) ? JSON.parse(item.extendedData).prName : ""}</div>,
          <div>{item.employeeName}</div>,
          <div style={{ display: "flex", justifyContent: "center" }}>
            {item.status == 0 ? (
              new Date() > new Date(item?.endTime) ? (
                <Tippy content={<span>Quá hạn {handleUnfulfilled(item.endTime)}</span>}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#C94B1C",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>{handleUnfulfilled(item.endTime, true)}</span>
                  </div>
                </Tippy>
              ) : (
                <Tippy content={<span>Chưa tiếp nhận</span>}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#047BC1",
                      cursor: "pointer",
                    }}
                  >
                    <Icon name="ArrowDownRight" />
                  </div>
                </Tippy>
              )
            ) : item.status == 1 ? (
              new Date() > new Date(item?.endTime) ? (
                <Tippy content={<span>Quá hạn {handleUnfulfilled(item.endTime)}</span>}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#C94B1C",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>{handleUnfulfilled(item.endTime, true)}</span>
                  </div>
                </Tippy>
              ) : (
                <Tippy content={<span>Mới tiếp nhận</span>}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#047BC1",
                      cursor: "pointer",
                    }}
                  >
                    <Icon name="ArrowDownRight" />
                  </div>
                </Tippy>
              )
            ) : item.status == 2 ? (
              <Tippy content={"Hoàn thành"}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#B7B8B9",
                    cursor: "pointer",
                  }}
                >
                  <Icon name="Checked" style={{ width: 15, height: 15, fill: "#FFFFFF" }} />
                </div>
              </Tippy>
            ) : item.status == 3 ? (
              <Tippy content={"Đã huỷ"}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#B7B8B9",
                    cursor: "pointer",
                  }}
                >
                  <Icon name="Times" style={{ width: 15, height: 15, fill: "#FFFFFF" }} />
                </div>
              </Tippy>
            ) : (
              <Tippy content={<span>Tạm dừng {handleUnfulfilled(item.endTime)}</span>}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#CA8A04",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>{handleUnfulfilled(item.endTime, true)}</span>
                </div>
              </Tippy>
            )}
          </div>,
        ]
      : [
          getPageOffset(params) + index + 1,
          item.nodeName || item.name,
          item.projectName,
          item.startTime || item.endTime ? `${moment(item.startTime).format("DD/MM/YYYY")} - ${moment(item.endTime).format("DD/MM/YYYY")}` : "",
          item.prName,
          item.employeeName,
          item.status === 0
            ? new Date() > new Date(item?.endTime)
              ? `Quá hạn ${handleUnfulfilled(item.endTime)}`
              : "Chưa tiếp nhận"
            : item.status === 1
            ? new Date() > new Date(item?.endTime)
              ? `Quá hạn ${handleUnfulfilled(item.endTime)}`
              : "Mới tiếp nhận"
            : item.status === 2
            ? "Hoàn thành"
            : item.status === 3
            ? "Đã huỷ"
            : item.status === 3
            ? `Tạm dừng ${handleUnfulfilled(item.endTime)}`
            : "",
        ];

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await UserTaskService.list({
        ...params,
        page: type === "current_page" ? 1 : params.page,
        limit: type === "all" || type === "current_search" ? 10000 : params.limit,
      });

      if (response.code === 0) {
        const result = response.result.items;

        if (extension === "excel") {
          ExportExcel({
            fileName: "CongViec",
            title: "Công việc",
            header: titlesExcel,
            formatExcel: dataFormatExport,
            data: result.map((item, idx) => dataMappingArray(item, idx, "export")),
            info: { name },
          });
        }
        showToast("Xuất file thành công", "success");
        onHideExport();
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
        onHideExport();
      }
    },
    [params]
  );

  const changePriorityLevel = async (workId, priorityLevel) => {
    const body = {
      id: workId,
      priorityLevel: priorityLevel,
    };

    const response = await UserTaskService.updateLevelStatus(body);

    if (response.code === 0) {
      reLoadListWork(true);
      showToast(`${priorityLevel === 4 ? "Thêm" : "Bỏ"} công việc ưu tiên thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleUnfulfilled = (time, disableUnit?) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(time).getTime();

    if (currentTime < startTime) {
    } else {
      //thời gian 24 * 60 * 60 * 1000
      if ((currentTime - startTime) / (24 * 60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 ngày thì trả về ngày, không thì trả về giờ
        return <span>{`${Math.round((currentTime - startTime) / (24 * 60 * 60 * 1000))} ${disableUnit ? "" : "ngày"}`}</span>;
      } else {
        return <span>{`1 ${disableUnit ? "" : "ngày"}`}</span>;
      }
    }
  };

  const actionsTable = (item: IWorkOrderResponseModel): IAction[] => {
    return [
      // ...(item?.contextData ? [
      //   {
      //     title: "Xử lý nhiệm vụ",
      //     icon: <Icon name="CollectInfo" />,
      //     callback: () => {
      //       // navigation("/handle_task");
      //       handleDetailWork(item, listWork.length);
      //       setIsHandleTask(true)
      //     },
      //   },
      // ] : []),
      // {
      //   title: "Xem chi tiết",
      //   icon: <Icon name="Eye" />,
      //   callback: () => {
      //     handleDetailWork(item, listWork.length);
      //     setIsDetailWork(true);
      //   },
      // },
      // ...(item.status == 2 || item.status == 3
      //   ? []
      //   : [
      //       {
      //         title: "Sửa",
      //         icon: <Icon name="Pencil" />,
      //         callback: () => {
      //           setIdWork(item?.id);
      //           setShowModalAdd(true);
      //         },
      //       },
      //       {
      //         title: "Xóa",
      //         icon: <Icon name="Trash" className="icon-error" />,
      //         callback: () => {
      //           showDialogConfirmDelete(item);
      //         },
      //       },
      //     ]),
    ];
  };

  const onDelete = async (id: number) => {
    const response = await UserTaskService.delete(id);

    if (response.code === 0) {
      showToast("Xóa công việc thành công", "success");
      reLoadListWork();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllWork = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        UserTaskService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa công việc thành công", "success");
        reLoadListWork();
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IWorkOrderResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "công việc " : `${listIdChecked.length} công việc đã chọn`}
          {item ? <strong>{item.nodeName || item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (listIdChecked.length > 0) {
          onDeleteAllWork();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa công việc",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const reLoadListWork = (notLoad?) => {
    getListWork(params, notLoad);
    getDataOfStatus(idManagement, 0);
    getDataOfStatus(idManagement, 1);
    getDataOfStatus(idManagement, 2);
    getDataOfStatus(idManagement, 3);
    getDataOfStatus(idManagement, 4);
  };

  const [headerTab, setHeaderTab] = useState(1);
  const dataHeaderTab = [
    {
      value: 1,
      label: "Công việc của tôi",
      icon: "PersonalWork",
    },
    {
      value: 2,
      label: "Công việc phòng ban",
      icon: "UserFour",
    },
  ];

  const refContainerFilter = useRef();
  const refFilter = useRef();
  const [isShowFilter, setIsShowFilter] = useState(false);

  const titleActions: ITitleActions = {
    actions: [
      {
        icon: <Icon name="RefreshCw" style={{ width: 13, height: 13 }} />,
        title: "Làm mới",
        callback: () => {
          reLoadListWork();
        },
      },
      // permissions["WORK_MANAGEMENT_ADD"] == 1 && {
      true && {
        icon: <Icon name="Plus" style={{ width: 13, height: 13 }} />,
        title: "Thêm mới",
        callback: () => {
          // setDataWo(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  return (
    <div className={`page-content page-work${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="header_tab">
              {dataHeaderTab.map((item, index) => (
                <div
                  key={index}
                  className={item.value === headerTab ? "item_tab_active" : "item_tab_inactive"}
                  onClick={() => {
                    setHeaderTab(item.value);
                    setIsShowFilter(false);
                  }}
                >
                  <Icon name={item.icon} />
                  <span className="label">{item.label}</span>
                </div>
              ))}
            </div>
            <div>
              <TitleAction title="" titleActions={titleActions} />
            </div>
          </div>
          <div className="line__height--work">
            <div className="container-button-header">
              <div
                className={isRegimeKanban ? "style-list-button-inactive" : "style-list-button-active"}
                onClick={() => {
                  setIsRegimeKanban(false);
                  localStorage.removeItem("keep_position_kanban");
                  setIsShowFilter(false);
                }}
              >
                <Icon name="ListData" />
                <span className="title">Danh sách</span>
              </div>

              <div
                className={isRegimeKanban ? "style-list-button-active" : "style-list-button-inactive"}
                onClick={() => {
                  setIsRegimeKanban(true);
                  setIsShowFilter(false);
                }}
              >
                <Icon name="Kanban" />
                <span className="title">Kanban</span>
              </div>
            </div>

            <div className="container-button-right">
              <div>
                <SearchBox
                  // key={customerFilterList.length}
                  name="Tên công việc"
                  params={params}
                  isFilter={false}
                  isSaveSearch={false}
                  listSaveSearch={listSaveSearch}
                  listFilterItem={customerFilterList}
                  updateParams={(paramsNew) => {
                    // if(Object.keys(paramsNew).find((el) => el === "filters") && (Object.keys(paramsNew).find((el) => el === "projectId") || Object.keys(paramsNew).find((el) => el === "prName"))){
                    //   delete paramsNew.filters;

                    //   const filters = {
                    //     ...(Object.keys(paramsNew).find((el) => el === "projectId") ? {projectId: paramsNew["projectId"]} : {}),
                    //     ...(Object.keys(paramsNew).find((el) => el === "prName") ? {projectId: paramsNew["prName"]} : {})
                    //   }
                    //   setParams({ ...paramsNew, filters: filters });

                    // } else {
                    //   setParams(paramsNew);
                    // }
                    setParams(paramsNew);
                  }}
                />
              </div>
              {/* {isRegimeKanban ? null : permissions["WORK_MANAGEMENT_EXPORT"] == 1 ? ( */}
              {isRegimeKanban ? null : (
                <div
                  className="button_export"
                  onClick={() => {
                    setOnShowModalExport();
                    setIsShowFilter(false);
                  }}
                >
                  <Icon name="ExportRox" />
                  <span className="label">Xuất dữ liệu</span>
                </div>
              )}

              {params.employeeId ||
              params?.isPriority ||
              params.startDate ||
              params.endDate ||
              params.status ||
              params.projectId ||
              params.biddingName ||
              params.filters ? (
                <div className="button_cancel_filter">
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Bộ lọc</span>
                  <Tippy content="Bỏ lọc">
                    <div
                      style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                      onClick={() => {
                        setParams(paramsInit);
                        setIsShowFilter(false);
                      }}
                    >
                      <Icon name="TimesCircle" />
                    </div>
                  </Tippy>
                </div>
              ) : null}

              <div className="container_filter" ref={refContainerFilter}>
                <div
                  className={
                    params.employeeId ||
                    params?.isPriority ||
                    params.startDate ||
                    params.endDate ||
                    params.status ||
                    params.projectId ||
                    params.biddingName ||
                    params.filters
                      ? "button_filter_active"
                      : "button_filter"
                  }
                  onClick={() => {
                    setIsShowFilter(!isShowFilter);
                  }}
                >
                  <Icon name="Funnel" />
                  {params.employeeId ||
                  params?.isPriority ||
                  params.startDate ||
                  params.endDate ||
                  params.status ||
                  params.projectId ||
                  params.biddingName ||
                  params.filters ? null : (
                    <span className="label">Lọc</span>
                  )}
                </div>

                {isShowFilter && (
                  <FilterModal
                    refContainerFilter={refContainerFilter}
                    refFilter={refFilter}
                    setIsShowFilter={setIsShowFilter}
                    params={params}
                    paramsInit={paramsInit}
                    setParams={setParams}
                    filterStatusAll={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`${isRegimeKanban || isRegimeReport ? "d-none" : ""}`}>
          <TableWork
            params={params}
            setParams={setParams}
            listSaveSearch={listSaveSearch}
            customerFilterList={customerFilterList}
            titles={titles}
            listWork={listWork}
            pagination={pagination}
            dataMappingArray={dataMappingArray}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            setListIdChecked={setListIdChecked}
            bulkActionList={bulkActionList}
            actionsTable={actionsTable}
            isLoading={isLoading}
            isNoItem={isNoItem}
            setIdWork={setIdWork}
            setShowModalAdd={setShowModalAdd}
          />
        </div>
        {isRegimeKanban && (
          <div className={`${isRegimeKanban ? "" : "d-none"}`}>
            <KanbanWork
              type={type}
              isKanban={isRegimeKanban}
              params={params}
              setParams={setParams}
              customerFilterList={customerFilterList}
              data={listWork}
              dataStart={dataOfApproachStart}
              setDataStart={setDataOfApproachStart}
              dataDo={dataOfApproachDo}
              setDataDo={setDataOfApproachDo}
              dataFail={dataOfApproachFail}
              setDataFail={setDataOfApproachFail}
              dataSuccess={dataOfApproachSuccess}
              setDataSuccess={setDataOfApproachSuccess}
              dataPending={dataOfApproachPending}
              setDataPending={setDataOfApproachPending}
              setIsDetailWork={setIsDetailWork}
              handleDetailWork={handleDetailWork}
              changeValueFilterByKanban={(data) => {
                setFilterByKanban(data);
              }}
              onReload={(reload, idStartPoint, idEndPoint) => {
                if (reload) {
                  getListWork(params);

                  if (idStartPoint === 0 || idEndPoint === 0) {
                    getDataOfStatus(idManagement, 0);
                  }

                  if (idStartPoint === 1 || idEndPoint === 1) {
                    getDataOfStatus(idManagement, 1);
                  }

                  if (idStartPoint === 2 || idEndPoint === 2) {
                    getDataOfStatus(idManagement, 2);
                  }

                  if (idStartPoint === 3 || idEndPoint === 3) {
                    getDataOfStatus(idManagement, 3);
                  }

                  if (idStartPoint === 4 || idEndPoint === 4) {
                    getDataOfStatus(idManagement, 4);
                  }
                }
              }}
            />
          </div>
        )}
        {isRegimeReport && (
          <div className={`${isRegimeReport ? "" : "d-none"}`}>
            <JobReport />
          </div>
        )}
      </div>
      <ModalAddWorkBpm
        type={type}
        onShow={showModalAdd}
        idWork={idWork}
        onHide={(reload) => {
          if (reload) {
            reLoadListWork();
          }
          setShowModalAdd(false);
          setIdWork(null);
        }}
      />
      <ExportModal
        name="Công việc"
        onShow={isExportWork}
        onHide={() => onHideExport()}
        options={optionsExport}
        callback={(type, extension) => exportCallback(type, extension)}
      />
      <AddWorkInprogressModal
        onShow={showModalWorkInprogress}
        idWork={idWork}
        onHide={(reload) => {
          if (reload) {
            reLoadListWork();
          }
          setShowModalWorkInprogress(false);
        }}
      />
      <ViewWorkInprogressModal
        idWork={idWork}
        onShow={showModalViewWorkInprogress}
        onHide={() => {
          setShowModalViewWorkInprogress(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

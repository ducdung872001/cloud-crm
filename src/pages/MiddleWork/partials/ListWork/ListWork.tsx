import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import { useSearchParams } from "react-router-dom";
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
import { showToast } from "utils/common";
import WorkOrderService from "services/WorkOrderService";
import TableWork from "./partials/TableWork/TableWork";
import KanbanWork from "./partials/KanbanWork/KanbanWork";
import AddWorkModal from "./partials/AddWorkModal/AddWorkModal";
import AddWorkInprogressModal from "./partials/AddWorkInprogressModal/AddWorkInprogressModal";
import ViewWorkInprogressModal from "./partials/ViewWorkInprogressModal/ViewWorkInprogressModal";
import "tippy.js/animations/scale.css";
import "./ListWork.scss";
import { ExportExcel } from "exports";
import ExportModal from "components/exportModal/exportModal";
import JobReport from "./partials/JobReport/JobReport";
import { ContextType, UserContext } from "contexts/userContext";

export default function ListWork(props: IListWorkProps) {
  const isMounted = useRef(false);

  const {
    type,
    idManagement,
    isRegimeKanban,
    isRegimeReport,
    isFullPage,
    handleDetailWork,
    showProjectManagement,
    setIsDetailWork,
    abortController,
    isExportWork,
    setIsFullPage,
    onHideExport,
    dataProjectReport,
  } = props;

  const { dataInfoEmployee } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listWork, setListWork] = useState<IWorkOrderResponseModel[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // đoạn này cập nhập tiến động công việc
  const [idWork, setIdWork] = useState<number>(null);
  const [showModalWorkInprogress, setShowModalWorkInprogress] = useState<boolean>(false);

  // đoạn này hiển thị danh sách cập nhật tiến độ công việc
  const [showModalViewWorkInprogress, setShowModalViewWorkInprogress] = useState<boolean>(false);

  const [params, setParams] = useState<IWorkOrderFilterRequest>({
    name: "",
  });

  useEffect(() => {
    if (idManagement) {
      if (type === "opportunity") {
        const newParams = { ...params };
        delete newParams["projectId"];
        setParams({ ...newParams, opportunityId: idManagement, workType: type });
      } else {
        const newParams = { ...params };
        delete newParams["opportunityId"];
        setParams({ ...newParams, projectId: idManagement, workType: type });
      }
    }
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

  const getListWork = async (paramsSearch: IWorkOrderFilterRequest) => {
    setIsLoading(true);

    if (type === "project") {
      delete paramsSearch["opportunityId"];
    } else {
      delete paramsSearch["projectId"];
    }

    // Nếu là báo cáo công việc thì lấy id của dự án từ báo cáo
    if (dataProjectReport) {
      paramsSearch = { ...paramsSearch, projectId: dataProjectReport.id };
    }

    const response = await WorkOrderService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;

      setListWork(result.items);
      handleDetailWork(null, result.items?.length);
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
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
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
  }, [params]);

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
      workType: type,
    };
    if (type === "project") {
      param.projectId = idManagement;
    } else {
      param.opportunityId = idManagement;
    }

    const response = await WorkOrderService.list(param, abortController.signal);

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
  }, [idManagement]);
  useEffect(() => {
    getDataOfStatus(idManagement, 0);
    getDataOfStatus(idManagement, 1);
    getDataOfStatus(idManagement, 2);
    getDataOfStatus(idManagement, 3);
    getDataOfStatus(idManagement, 4);
  }, [type]);

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
    "Người nhận việc",
    "Thời gian",
    type == "opportunity" ? "Thuộc cơ hội" : "Thuộc dự án",
    "Tiến độ",
    "Trạng thái công việcc",
  ];

  const dataFormat = ["text-center", "", "", "", "", "text-center", "text-center"];

  const dataMappingArray = (item: IWorkOrderResponseModel, index: number, type?: string) =>
    type !== "export"
      ? [
          getPageOffset(params) + index + 1,
          <span
            key={item.id}
            className="name-work"
            onClick={() => {
              setIsDetailWork(true);
              handleDetailWork(item, listWork.length);
            }}
          >
            {item.name}
          </span>,
          item.employeeName,
          item.startTime || item.endTime ? `${moment(item.startTime).format("DD/MM/YYYY")} - ${moment(item.endTime).format("DD/MM/YYYY")}` : "",
          item.projectName,
          <div
            key={item.id}
            className="percent__finish--work"
            onClick={() => {
              if (item.percent !== 100 && item.status !== 0 && item.status !== 2 && item.status !== 3 && item.status !== 4) {
                setShowModalWorkInprogress(true);
                setIdWork(item.id);
              } else if (item.status == 2 || item.status == 3 || item.status == 4) {
                setIdWork(item.id);
                setShowModalViewWorkInprogress(true);
              } else {
                showToast("Công việc đang trong trạng thái chưa được thực hiện", "warning");
              }
            }}
          >
            <CircularProgressbar value={item.percent || 0} text={`${item.percent || 0}%`} className="value-percent" />
          </div>,
          item.status == 0 ? (
            handleUnfulfilled(item.startTime)
          ) : item.status == 1 ? (
            handleProcessing(item.startTime, item.endTime)
          ) : item.status == 2 ? (
            <span className="status-success">Đã hoàn thành</span>
          ) : item.status == 3 ? (
            <span className="status-cancelled">Đã hủy</span>
          ) : (
            <span className="status-pause">Tạm dừng</span>
          ),
        ]
      : [
          getPageOffset(params) + index + 1,
          item.name,
          item.employeeName,
          `${moment(item.startTime).format("DD/MM/YYYY")} - ${moment(item.endTime).format("DD/MM/YYYY")}`,
          item.projectName,
          `${item.percent || 0}%`,
          item.status == 0
            ? "Chưa thực hiện"
            : item.status == 1
            ? "Đang thực hiện"
            : item.status == 2
            ? "Đã hoàn thành"
            : item.status == 3
            ? "Đã hủy"
            : "Tạm dừng",
        ];

  const formatExcel = ["center", "top", "top", "center", "top", "center", "center"];

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await WorkOrderService.list({
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
            header: titles,
            formatExcel: formatExcel,
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

  //! đoạn này xử lý vấn đề hiển thị thông tin xem bao giờ thực hiện
  const handleUnfulfilled = (time) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(time).getTime();

    if (currentTime < startTime) {
      if ((startTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((startTime - currentTime) / (60 * 60 * 1000) >= 1) {
        return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 1000))} phút`}</span>;
      }
    } else {
      if ((currentTime - startTime) / (24 * 60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 ngày thì trả về ngày, không thì trả về giờ
        return <span className="status-cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - startTime) / (60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 giờ thì trả về giờ, không thì trả về phút
        return <span className="status-cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return <span className="status-cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 1000))} phút`}</span>;
      }
    }
  };

  const handleProcessing = (start, end) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const calculatorTime = (endTime - startTime) / 3;

    if (startTime > currentTime) {
      return <span className="status-processing">Đang thực hiện</span>;
    } else if (currentTime >= startTime && currentTime <= endTime) {
      if (endTime - currentTime >= calculatorTime) {
        return <span className="status-processing">Đang thực hiện</span>;
      } else {
        if ((endTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
          return <span className="status-processing--waring">{`Còn ${Math.round((endTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
        } else if ((endTime - currentTime) / (60 * 60 * 1000) >= 1) {
          return <span className="status-processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
        } else {
          return <span className="status-processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 1000))} phút`}</span>;
        }
      }
    } else {
      if ((currentTime - endTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="status-cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - endTime) / (60 * 60 * 1000) >= 1) {
        return <span className="status-cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return (
          <span className="status-cancelled">{`Quá hạn ${
            Math.round((currentTime - endTime) / (60 * 1000)) === 0 ? 1 : Math.round((currentTime - endTime) / (60 * 1000))
          } phút`}</span>
        );
      }
    }
  };

  const actionsTable = (item: IWorkOrderResponseModel): IAction[] => {
    return [
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" />,
        callback: () => {
          handleDetailWork(item, listWork.length);
          setIsDetailWork(true);
        },
      },
      ...(item.status == 2 || item.status == 3
        ? [
            ...(dataInfoEmployee?.isOwner === 1
              ? [
                  {
                    title: "Xóa",
                    icon: <Icon name="Trash" className="icon-error" />,
                    callback: () => {
                      showDialogConfirmDelete(item);
                    },
                  },
                ]
              : []),
          ]
        : [
            {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setIdWork(item?.id);
                setShowModalAdd(true);
              },
            },
            {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]),
    ];
  };

  const onDelete = async (id: number) => {
    const response = await WorkOrderService.delete(id);

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
        WorkOrderService.delete(item).then((res) => {
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
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
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

  const reLoadListWork = () => {
    getListWork(params);
    getDataOfStatus(idManagement, 0);
    getDataOfStatus(idManagement, 1);
    getDataOfStatus(idManagement, 2);
    getDataOfStatus(idManagement, 3);
    getDataOfStatus(idManagement, 4);
  };
  return (
    <div className={`page-content page-work${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className={`${isRegimeKanban || isRegimeReport ? "d-none" : ""}`}>
          <div className="action-header">
            <Tippy content="Xem toàn trang" delay={[100, 0]} placement="left" animation="scale-extreme">
              <div className="add-work">
                <Button
                  color="success"
                  onClick={() => {
                    setIsFullPage(!isFullPage);
                    showProjectManagement();
                  }}
                >
                  {isFullPage ? <Icon name="FullscreenExit" /> : <Icon name="Fullscreen" />}
                </Button>
              </div>
            </Tippy>
            <Tippy content="Thêm công việc" delay={[100, 0]} placement="left" animation="scale-extreme">
              <div className="full-page">
                <Button
                  color="success"
                  onClick={() => {
                    setIdWork(null);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
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
            <JobReport idProject={idManagement} />
          </div>
        )}
      </div>
      <AddWorkModal
        type={type}
        onShow={showModalAdd}
        idWork={idWork}
        idManagement={idManagement}
        onHide={(reload) => {
          if (reload) {
            reLoadListWork();
          }
          setShowModalAdd(false);
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

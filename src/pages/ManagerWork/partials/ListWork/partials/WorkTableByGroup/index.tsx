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
import { IGroupsFilterRequest, IWorkOrderFilterRequest } from "model/workOrder/WorkOrderRequestModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import { showToast } from "utils/common";
import WorkOrderService from "services/WorkOrderService";
import AddWorkModal from "./partials/AddWorkModal";
import AddWorkInprogressModal from "./partials/AddWorkInprogressModal/AddWorkInprogressModal";
import ViewWorkInprogressModal from "./partials/ViewWorkInprogressModal/ViewWorkInprogressModal";
import "tippy.js/animations/scale.css";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import Collapsible from "components/collapse";
import Input from "components/input/input";
import TableWorkInColapse from "./partials/TableWorkInColapse";

export default function WorkTableByGroup(props: any) {
  const isMounted = useRef(false);

  const {
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

  const [searchParams, setSearchParams] = useSearchParams();
  const [listGroupWork, setListGroupWork] = useState<any[]>([]);

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const [groupBy, setGroupBy] = useState<any>("status");

  // đoạn này cập nhập tiến động công việc
  const [idWork, setIdWork] = useState<number>(null);
  const [showModalWorkInprogress, setShowModalWorkInprogress] = useState<boolean>(false);

  // đoạn này hiển thị danh sách cập nhật tiến độ công việc
  const [showModalViewWorkInprogress, setShowModalViewWorkInprogress] = useState<boolean>(false);

  // useEffect(() => {
  //   if (idManagement) {
  //     const newParams = { ...params };
  //     setParams({ ...newParams, projectId: idManagement });
  //   }
  // }, [idManagement]);

  console.log("listGroupWork>>>", listGroupWork);

  useEffect(() => {
    getGroupWork({
      groupBy: groupBy,
      projectId: idManagement,
    });
  }, [idManagement, groupBy]);

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

  const abortControllerChild = new AbortController();

  const getGroupWork = async (paramsSearch: IGroupsFilterRequest) => {
    const response = await WorkOrderService.groups(paramsSearch, abortController.signal);

    if (response.code === 0 && response?.result?.buckets) {
      //  response.result;
      if (response.result.buckets.length === 0) {
        setListGroupWork([]);
      } else {
        setListGroupWork(response.result.buckets.map((item) => item));
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      return null;
    }
  };

  const headerCollapsible = useCallback((item, index) => {
    console.log("itemSetup item", item);
    return (
      <div className="collapse-header">
        <div className="group-name" style={{ backgroundColor: item?.color }}>
          <Icon name="Job" />
          {item?.title}
        </div>
        <div className="number-work">{item?.count} công việc</div>
        <div className="button-add">
          <Tippy content="Thêm công việc" delay={[100, 0]} placement="left" animation="scale-extreme">
            <div className="add-work">
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
      </div>
    );
  }, []);
  return (
    <div className={`page-content page-work-table-by-group`}>
      <div className="card-box d-flex flex-column">
        <div className={`${isRegimeKanban || isRegimeReport ? "d-none" : ""}`}>
          <div className="title-header">
            <div className="title-header-left">
              <Tippy content="Xem toàn trang" delay={[100, 0]} placement="left" animation="scale-extreme">
                <div className="full-page">
                  <div
                    className="btn-full-page"
                    onClick={() => {
                      setIsFullPage(!isFullPage);
                      showProjectManagement();
                      localStorage.setItem("isFullPageWorkManagement", JSON.stringify(!isFullPage));
                    }}
                  >
                    {isFullPage ? <Icon name="ChevronDoubleRight" /> : <Icon name="ChevronDoubleLeft" />}
                  </div>
                </div>
              </Tippy>
              <div className="title">Tất cả dự án</div>
            </div>
            <div className="title-header-right">
              <Tippy content="Thêm công việc" delay={[100, 0]} placement="left" animation="scale-extreme">
                <div className="add-work">
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
          </div>
          <div className="action-header">
            <div className="action-header-left">
              <div className="select-group-by">
                <SelectCustom
                  id="groupBy"
                  name="groupBy"
                  label={"Nhóm theo"}
                  fill={true}
                  options={[
                    { label: "Trạng thái công việc", value: "status" },
                    { label: "Nhân viên phụ trách", value: "priority" },
                    { label: "Ưu tiên", value: "employee" },
                    { label: "Loại công việc", value: "wte" },
                  ]}
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.value)}
                  placeholder="Nhóm theo"
                />
              </div>
            </div>
            <div className="action-header-right">
              {/* <span>Lọc:</span> */}
              <div className="filter">
                <Input
                  type="text"
                  placeholder="Tìm kiếm công việc..."
                  label={""}
                  fill={true}
                  className="input-search-work"
                  // value={params.name}
                  // onChange={(e) => setParams({ ...params, name: e.target.value, page: 1 })}
                />
                <SelectCustom
                  id="employeeId"
                  name="employeeId"
                  label={"Nhân viên"}
                  fill={true}
                  options={[]}
                  value={""}
                  onChange={(e) => setGroupBy(e)}
                  placeholder="Chọn nhân viên"
                />
              </div>
            </div>
          </div>
          {listGroupWork.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100px",
                fontSize: "18px",
                color: "#555",
              }}
            >
              <span>
                Hiện tại chưa có công việc nào. <br />
              </span>
            </div>
          ) : (
            <div className="list-table">
              {listGroupWork.map((groupItem, groupIndex) => (
                <Collapsible
                  header={headerCollapsible}
                  dataItems={{
                    title: groupItem?.name || "Chưa phân nhóm",
                    count: groupItem?.total || 0,
                    color: "#FFC43C", // #00b499
                  }}
                  isOpen={groupItem.isOpen || false}
                  title={""}
                  defaultOpen={false}
                  className="collapsible-work-by-group"
                  //  children,
                  animationDuration={500}
                  onToggle={(open) => {
                    setListGroupWork((prevState) => {
                      return prevState.map((item, index) => {
                        if (index === groupIndex) {
                          return { ...item, isOpen: open };
                        } else {
                          return { ...item, isOpen: false };
                        }
                      });
                    });
                  }}
                >
                  <TableWorkInColapse
                    isOpen={groupItem.isOpen || false}
                    paramsFilter={{
                      groupBy: groupBy,
                      groupValue: groupItem?.key == null ? -2 : groupItem?.key,
                      projectId: idManagement,
                    }}
                  />
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </div>
      <AddWorkModal
        onShow={showModalAdd}
        idWork={idWork}
        idManagement={idManagement}
        onHide={(reload) => {
          if (reload) {
            // reLoadListWork();
          }
          setShowModalAdd(false);
        }}
      />
      <AddWorkInprogressModal
        onShow={showModalWorkInprogress}
        idWork={idWork}
        onHide={(reload) => {
          if (reload) {
            // reLoadListWork();
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

      <DetailWorkModal onShow={showModalDetail} idData={idWork} onHide={() => setShowModalDetail(false)} />
    </div>
  );
}

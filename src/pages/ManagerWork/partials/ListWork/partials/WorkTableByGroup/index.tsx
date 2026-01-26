import React, { useCallback, useContext, useEffect, useState } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Button from "components/button/button";

import { IGroupsFilterRequest } from "model/workOrder/WorkOrderRequestModel";
import { showToast } from "utils/common";
import WorkOrderService from "services/WorkOrderService";
import AddWorkModal from "./partials/AddWorkModal";
import "tippy.js/animations/scale.css";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import Collapsible from "components/collapse";
import TableWorkInColapse from "./partials/TableWorkInColapse";
import AssignWorkModal from "./partials/AssignWorkModal";
import DetailWorkModal from "./partials/DetailWorkModal";
import { UserContext, ContextType } from "contexts/userContext";
import { HEADER_VIEW_MODES, listColors } from "pages/ManagerWork/constant";

export default function WorkTableByGroup(props: any) {
  const { idManagement, isFullPage, showProjectManagement, abortController, setIsFullPage, activeTitleHeader } = props;
  const user = useContext(UserContext) as ContextType;

  const [listGroupWork, setListGroupWork] = useState<any[]>([]);

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalAssign, setShowModalAssign] = useState<boolean>(false);

  const [groupBy, setGroupBy] = useState<any>("status");

  // đoạn này cập nhập tiến động công việc
  const [idWork, setIdWork] = useState<number>(null);

  // đoạn này hiển thị danh sách cập nhật tiến độ công việc
  const [showModalViewWorkInprogress, setShowModalViewWorkInprogress] = useState<boolean>(false);
  const [showModalDetail, setShowModalDetail] = useState<boolean>(false);
  const [paramsGetGroupWork, setParamsGetGroupWork] = useState<any>({});

  console.log("listGroupWork>>>", listGroupWork);

  useEffect(() => {
    getGroupWork({
      groupBy: groupBy,
      projectId: idManagement,
      // employeeId: activeTitleHeader === HEADER_VIEW_MODES.mywork ? user?.dataInfoEmployee?.id ?? null : null,
    });
    setParamsGetGroupWork({
      groupBy: groupBy,
      projectId: idManagement,
      // employeeId: activeTitleHeader === HEADER_VIEW_MODES.mywork ? user?.dataInfoEmployee?.id ?? null : null,
    });
  }, [idManagement, groupBy, user?.dataInfoEmployee?.id, activeTitleHeader]);

  const getGroupWork = async (paramsSearch: IGroupsFilterRequest) => {
    const response = await WorkOrderService.groups(paramsSearch, abortController.signal);

    if (response.code === 0 && response?.result?.buckets) {
      //  response.result;
      if (response.result.buckets.length === 0) {
        setListGroupWork([]);
      } else {
        if (response?.result?.buckets?.length) {
          setListGroupWork(response.result.buckets.map((item) => item));
        }
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      return null;
    }
  };

  const headerCollapsible = useCallback((item, index) => {
    return (
      <div className="collapse-header">
        <div className="group-name" style={{ backgroundColor: item?.color }}>
          <Icon name="Job" />
          {item?.title}
        </div>
        <div className="number-work">{item?.count} công việc</div>
      </div>
    );
  }, []);

  const projectWork =
    localStorage.getItem("projectWorkManagement") && JSON.parse(localStorage.getItem("projectWorkManagement"))
      ? JSON.parse(localStorage.getItem("projectWorkManagement"))
      : null;
  return (
    <div className={`page-content page-work-table-by-group`}>
      <div className="card-box d-flex flex-column">
        <div className={`${""}`}>
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
              <div className="title">{projectWork && projectWork?.name ? projectWork?.name : "Danh sách công việc của dự án"}</div>
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
                    { label: "Nhân viên phụ trách", value: "employee" },
                    { label: "Ưu tiên", value: "priority" },
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
                <div className="item-filter-right">
                  {/* <Input
                    type="text"
                    placeholder="Tìm kiếm công việc..."
                    label={""}
                    fill={true}
                    className="input-search-work"
                    // value={params.name}
                    // onChange={(e) => setParams({ ...params, name: e.target.value, page: 1 })}
                  /> */}
                </div>
                <div className="item-filter-right">
                  {/* <SelectCustom
                    id="employeeId"
                    name="employeeId"
                    label={"Nhân viên"}
                    fill={true}
                    options={[]}
                    value={""}
                    onChange={(e) => setGroupBy(e)}
                    placeholder="Chọn nhân viên"
                  /> */}
                </div>
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
                  key={groupItem?.key || groupIndex}
                  header={headerCollapsible}
                  dataItems={{
                    title: groupItem?.name || "Chưa phân nhóm",
                    count: groupItem?.total || 0,
                    color: listColors[groupIndex % listColors.length],
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
                    setIdWork={setIdWork}
                    setShowModalAdd={setShowModalAdd}
                    setShowModalAssign={setShowModalAssign}
                    setShowModalDetail={setShowModalDetail}
                    paramsFilter={{
                      groupBy: groupBy,
                      groupValue: groupItem?.key == null ? -2 : groupItem?.key,
                      projectId: idManagement,
                      total: groupItem.total,
                      employeeId: activeTitleHeader === HEADER_VIEW_MODES.mywork ? user?.dataInfoEmployee?.id ?? null : null,
                    }}
                    onReload={(reload) => {
                      if (reload) {
                        getGroupWork(paramsGetGroupWork);
                      }
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
            getGroupWork(paramsGetGroupWork);
          }
          setShowModalAdd(false);
        }}
      />
      <AssignWorkModal
        onShow={showModalAssign}
        idWork={idWork}
        idManagement={idManagement}
        onHide={(reload) => {
          if (reload) {
            getGroupWork(paramsGetGroupWork);
          }
          setShowModalAssign(false);
        }}
      />

      <DetailWorkModal
        onShow={showModalDetail}
        idData={idWork}
        onHide={() => {
          setShowModalDetail(false);
          setIdWork(null);
        }}
      />
    </div>
  );
}

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { formatCurrency, getPageOffset } from "reborn-util";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Loading from "components/loading";
import _ from "lodash";
import ReportService from "services/ReportService";
import { showToast } from "utils/common";
import moment from "moment";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { FunnelChart } from "react-funnel-pipeline";
import "react-funnel-pipeline/dist/index.css";
import "./DetailEmployeeModal.scss";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";

export default function DetailEmployeeModal(props: any) {
  const { onShow, data, onHide } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const employeeData = [
    {
      call: "4",
      kpiCall: "5",
      sms: "10",
      kpiSms: "10",
      email: "8",
      kpiEmai: "10",
      book: "10",
      kpiBook: "15",
      meet: "5",
      kpiMeet: "10",
    },
  ];

  const titles = ["Tổng đài (gọi)", "SMS", "Email", "Đặt lịch hẹn", "Gặp trực tiếp"];

  const dataFormat = ["text-center", "text-center", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    <span style={{ fontSize: 14, color: "var(--success-color)" }}>
      <span style={{ fontSize: 14, color: "orange" }}>{item.call}</span>/{item.kpiCall}
    </span>,
    <span style={{ fontSize: 14, color: "var(--success-color)" }}>
      <span style={{ fontSize: 14, color: "orange" }}>{item.sms}</span>/{item.kpiSms}
    </span>,
    <span style={{ fontSize: 14, color: "var(--success-color)" }}>
      <span style={{ fontSize: 14, color: "orange" }}>{item.email}</span>/{item.kpiEmai}
    </span>,
    <span style={{ fontSize: 14, color: "var(--success-color)" }}>
      <span style={{ fontSize: 14, color: "orange" }}>{item.book}</span>/{item.kpiBook}
    </span>,
    <span style={{ fontSize: 14, color: "var(--success-color)" }}>
      <span style={{ fontSize: 14, color: "orange" }}>{item.meet}</span>/{item.kpiMeet}
    </span>,
  ];

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      //   setParams({ ...params, fromTime: fromTime, toTime: toTime });
    }
  };
  return (
    <Fragment>
      <Modal isOpen={onShow} isFade={true} staticBackdrop={true} isCentered={true} size="lg" toggle={() => {}} className="modal-detail-employee">
        <div>
          <ModalHeader
            title={`Hoạt động của nhân viên: ${data?.employeeName}`}
            toggle={() => {
              onHide(false);
            }}
          />

          <ModalBody>
            {/* <div className="card-box">
                        <div className="funnel_chart">
                            <FunnelChart
                                data={[
                                    { name: 'Đầu mối bán hàng', value: 100 },
                                    { name: 'Liên hệ KH', value: 90 },
                                    { name: 'Hẹn KH', value: 70 },
                                    { name: 'Gặp KH', value: 60 },
                                    { name: 'Chốt deal', value: 40 },
                                ]}
                                showValues={true}
                                showNames={true}
                                chartWidth={500}
                                chartHeight={50}
                                style={{ marginLeft: "100px" }}
                                pallette={["#f39c35"]}
                            />

                        </div>
                    </div>   */}

            <div className="card-box">
              {/* <div className="title d-flex align-items-start justify-content-between">
                            <div style={{display: 'flex', alignItems:'center'}}>
                                <h3>Chi tiết các hoạt động</h3>
                            </div>
                        </div> */}
              <div style={{ display: "flex", marginBottom: 10, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: 10, backgroundColor: "orange" }} />
                    <span style={{ fontSize: 14, marginLeft: 5 }}>Chỉ số thực hiện được</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", marginLeft: 15 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 10, backgroundColor: "var(--success-color)" }} />
                    <span style={{ fontSize: 14, marginLeft: 5 }}>Chỉ số được giao</span>
                  </div>
                </div>

                <div className="form-group">
                  <AdvancedDateFilter updateParams={takeFromTimeAndToTime} />
                </div>
              </div>
              {employeeData && employeeData.length > 0 ? (
                <BoxTable
                  name=""
                  // className="table__document"
                  titles={titles}
                  items={employeeData}
                  isPagination={false}
                  //   dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  // listIdChecked={listIdChecked}
                  isBulkAction={true}
                  // bulkActionItems={bulkActionList}
                  striped={true}
                  // setListIdChecked={(listId) => setListIdChecked(listId)}
                  // actions={actionsTable}
                  actionType="inline"
                />
              ) : isLoading ? (
                <Loading />
              ) : (
                <Fragment>
                  {
                    <SystemNotification
                      description={
                        <span>
                          Không có dữ liệu trùng khớp.
                          <br />
                          Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                        </span>
                      }
                      type="no-result"
                    />
                  }
                </Fragment>
              )}
            </div>
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
}

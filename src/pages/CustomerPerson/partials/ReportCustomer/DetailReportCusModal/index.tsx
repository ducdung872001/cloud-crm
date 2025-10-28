import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { formatCurrency, getPageOffset } from "reborn-util";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Loading from "components/loading";
import _ from "lodash";
import { showToast } from "utils/common";

import "./index.scss";
import ReportCustomerService from "services/ReportCustomerService";
import Icon from "components/icon";
import { useNavigate } from "react-router-dom";

export default function DetailReportCusModal(props: any) {
  const { onShow, reportDetail, onHide, paramsFilter } = props;

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listOpt, setListOpt] = useState([]);

  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
  });

  useEffect(() => {
    setParams((prevParams) => ({ ...prevParams, ...paramsFilter }));
  }, [paramsFilter, reportDetail?.key]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: reportDetail?.key == "totalCustomer" ? "Khách hàng" : "Hợp đồng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListReport = async (paramsSearch: any) => {
    setIsLoading(true);
    let response: any = {};
    let paramsTemp = _.cloneDeep(params);

    switch (reportDetail.key) {
      case "totalCustomer":
        // Số KH phát sinh hợp đồng
        response = await ReportCustomerService.totalCurentCustomerDetail(params, abortController.signal);
        break;
      case "totalContractSigned":
        // Hợp đồng đã ký
        paramsTemp.contractPipe = "";
        paramsTemp.fromTime = paramsTemp.startDate;
        paramsTemp.toTime = paramsTemp.endDate;
        response = await ReportCustomerService.totalContractSignerDetail(paramsTemp, abortController.signal);
        break;
      case "totalContractDeal":
        // Hợp đồng đàm phán
        paramsTemp.contractPipe = "negotiated";
        paramsTemp.fromTime = paramsTemp.startDate;
        paramsTemp.toTime = paramsTemp.endDate;
        response = await ReportCustomerService.totalContractSignerDetail(paramsTemp, abortController.signal);
        break;
      case "totalContractTerminate":
        // Hợp đồng đã thanh lý
        paramsTemp.contractPipe = "finalized";
        paramsTemp.fromTime = paramsTemp.startDate;
        paramsTemp.toTime = paramsTemp.endDate;
        response = await ReportCustomerService.totalContractSignerDetail(paramsTemp, abortController.signal);
        break;
      case "totalRevenue":
        // Doanh thu theo hợp đồng
        paramsTemp.contractPipe = "";
        paramsTemp.fromTime = paramsTemp.startDate;
        paramsTemp.toTime = paramsTemp.endDate;
        response = await ReportCustomerService.totalContractSignerDetail(paramsTemp, abortController.signal);
        break;
      case "revenueReceived":
        // Doanh thu nghiệm thu
        paramsTemp.contractPipe = "revenueReceived";
        paramsTemp.fromTime = paramsTemp.startDate;
        paramsTemp.toTime = paramsTemp.endDate;
        response = await ReportCustomerService.totalContractSignerDetail(paramsTemp, abortController.signal);
        break;
      case "revenueNotYetReceived":
        // Doanh thu còn phải thu
        paramsTemp.fromTime = paramsTemp.startDate;
        paramsTemp.toTime = paramsTemp.endDate;
        response = await ReportCustomerService.revenueNotYetReceivedDetail(paramsTemp, abortController.signal);
        break;
      case "revenueTransfer":
        // Doanh thu chuyển tiếp
        paramsTemp.contractPipe = "notPaid";
        response = await ReportCustomerService.totalContractSignerDetail(paramsTemp, abortController.signal);
        break;

      default:
        break;
    }
    if (response?.code === 0) {
      const result = response?.result;

      setListOpt(result.items);
      // setListOpt(result?.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow) {
      getListReport(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }

    return () => {
      abortController.abort();
    };
  }, [params]);

  const titles = ["STT", "Tên khách hàng", "Điện thoại", "Xem"];
  const titleContract = ["STT", "Tên hợp đồng", "Giá trị hợp đồng", "Giai đoạn hợp đồng", "Nhân viên phụ trách", "Tên công ty", "Xem"];

  const dataFormat = ["text-center", "", "", "text-center"];
  const dataFormatContract = ["text-center", "", "", "", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item?.name || "",
    reportDetail?.key == "totalCustomer" ? item?.recommenderPhone || "" : formatCurrency(item?.dealValue) || "",
    ...(reportDetail?.key == "totalCustomer" ? [] : [item?.pipelineName || "", item?.employeeName || "", item?.customerName || ""]),
    <a
      style={{ cursor: "pointer" }}
      onClick={() => {
        if (reportDetail?.key == "totalCustomer") {
          navigate(`/detail_person/customerId/${item?.id}/not_purchase_invoice`);
        } else {
          navigate(`/detail_contract/contractId/${item?.id}`);
        }
      }}
    >
      <Icon name="Eye" className="icon-eye" />
    </a>,
  ];

  const clearParams = () => {
    setParams({
      limit: 10,
      page: 1,
    });
    setPagination({
      ...DataPaginationDefault,
      name: reportDetail?.key == "totalCustomer" ? "Khách hàng" : "Hợp đồng",
      isChooseSizeLimit: true,
      setPage: (page) => {
        setParams((prevParams) => ({ ...prevParams, page: page }));
      },
      chooseSizeLimit: (limit) => {
        setParams((prevParams) => ({ ...prevParams, limit: limit }));
      },
    });
  };
  if (reportDetail?.key) {
    console.log("params-- ", reportDetail?.key, " >>>>", params);
  }

  return (
    <Fragment>
      <Modal isOpen={onShow} isFade={true} staticBackdrop={true} isCentered={true} size="xxl" toggle={() => {}} className="modal-detail-report-opt">
        <div>
          <ModalHeader
            title={"Chi tiết " + reportDetail?.name || ""}
            toggle={() => {
              onHide(false);
              clearParams();
              setListOpt([]);
            }}
          />

          <ModalBody>
            <div className="card-box">
              {!isLoading && listOpt && listOpt.length > 0 ? (
                <BoxTable
                  name=""
                  className="table__document"
                  titles={reportDetail?.key == "totalCustomer" ? titles : titleContract}
                  items={listOpt}
                  isPagination={true}
                  dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={reportDetail?.key == "totalCustomer" ? dataFormat : dataFormatContract}
                  isBulkAction={true}
                  striped={true}
                  actionType="inline"
                />
              ) : (
                <div style={{ minHeight: "300px", textAlign: "center", paddingTop: "140px" }}>Không có dữ liệu</div>
              )}
            </div>
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
}

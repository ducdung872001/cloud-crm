import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { formatCurrency, getPageOffset } from "reborn-util";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Loading from "components/loading";
import _ from "lodash";
import { showToast } from "utils/common";
import ReportOpportunityService from "services/ReportOpportunityService";

import "./index.scss";
import Icon from "components/icon";

export default function ReportOptDetailModal(props: any) {
  const { onShow, reportDetail, onHide, paramsFilter, setShowDetailOpt, setItemDetail } = props;

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
    name: "Cơ hội",
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
      case "totalOpportunity":
        // Tổng số cơ hội
        response = await ReportOpportunityService.totalOpportunityDetail(params, abortController.signal);
        break;
      case "expectedRevenue":
        // Doanh thu dự kiến
        response = await ReportOpportunityService.expectedRevenueDetail(params, abortController.signal);
        break;
      case "totalRevenue":
        // Doanh thu ký hợp đồng
        response = await ReportOpportunityService.contractRevenueDetail(params, abortController.signal);
        break;
      case "successOpportunity":
        // Số cơ hội thành công
        paramsTemp.status = 2;
        response = await ReportOpportunityService.totalOpportunityDetail(paramsTemp, abortController.signal);
        break;
      case "failedOpportunity":
        // Số cơ hội thất bại
        paramsTemp.status = 4;
        response = await ReportOpportunityService.totalOpportunityDetail(paramsTemp, abortController.signal);
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

  const titles = ["STT", "Tên sản phẩm/dịch vụ", "Tên khách hàng", "Nhân viên phụ trách", "Xem"];

  const dataFormat = ["text-center", "", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item?.productName || "",
    item?.customerName || "",
    item?.employeeName || "",
    <a
      style={{ cursor: "pointer" }}
      onClick={() => {
        // props.onShowDetail(item);
        console.log("item-- ", item);
        setShowDetailOpt(true);
        setItemDetail(item);
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
      name: "Cơ hội",
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
                  titles={titles}
                  items={listOpt}
                  isPagination={true}
                  dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
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

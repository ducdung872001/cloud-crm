import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { formatCurrency, getPageOffset } from "reborn-util";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Loading from "components/loading";
import _, { set } from "lodash";
import { showToast } from "utils/common";

import "./index.scss";
import ReportBussinessPartnerService from "services/ReportBussinessPartnerService";
import { useNavigate } from "react-router-dom";
import Icon from "components/icon";

export default function DetailReportPartnerModal(props: any) {
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
    name: reportDetail?.key == "contractBusinessPartner" ? "Đối tác" : "Hợp đồng",
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
    let paramsTemp = _.cloneDeep(params);

    switch (reportDetail.key) {
      case "contractBusinessPartner":
        // Số ĐT phát sinh hợp đồng
        paramsTemp.contractType = "";
        break;
      case "signedContact":
        // Số hợp đồng đã ký
        paramsTemp.contractType = "signed";

        break;
      case "negotiatedContract":
        // Số hợp đồng đàm phán
        paramsTemp.contractType = "negotiated";

        break;
      case "liquidationContract":
        // Số hợp đồng đã thanh lý
        paramsTemp.contractType = "finalized";

        break;
      case "costContract":
        // Chi phí theo hợp đồng
        paramsTemp.contractType = "signed";

        break;
      case "paid":
        // Đã chi
        paramsTemp.contractType = "totalPaid";

        break;
      case "debt":
        // Còn phải chi trong kỳ
        paramsTemp.contractType = "unpaidAmount";
        break;
      case "transitionCost":
        // Chi phí chuyển tiếp
        paramsTemp.contractType = "transitionCost";
        break;
      default:
        break;
    }
    let response = await ReportBussinessPartnerService.reportDetail(paramsTemp, abortController.signal);
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

  const titles = ["STT", "Tên đối tác", "Mã đối tác", "Mã số thuế", "Điện thoại", "Địa chỉ", "Xem"];
  const titleContract = ["STT", "Tên hợp đồng", "Giá trị hợp đồng", "Giai đoạn hợp đồng", "Nhân viên phụ trách", "Tên công ty", "Xem"];

  const dataFormat = ["text-center", "", "", "text-center"];
  const dataFormatContract = ["text-center", "", "", "", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    ...(reportDetail?.key == "contractBusinessPartner"
      ? [
          item?.businessPartnerName || "",
          item?.businessPartnerCode || "",
          item?.businessPartnerTaxCode || "",
          item?.businessPartnerPhone || "",
          item?.businessPartnerAddress || "",
        ]
      : [
          item?.name || "",
          formatCurrency(item?.dealValue) || "",
          item?.pipelineName || "",
          item?.employeeName || "",
          item?.customerName || item?.businessPartnerName || "",
        ]),
    <a
      style={{ cursor: "pointer" }}
      onClick={() => {
        if (reportDetail?.key == "contractBusinessPartner") {
          navigate(`/detail_partner/partnerId/${item?.businessPartnerId}`);
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
      name: reportDetail?.key == "contractBusinessPartner" ? "Đối tác" : "Hợp đồng",
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
                  titles={reportDetail?.key == "contractBusinessPartner" ? titles : titleContract}
                  items={listOpt}
                  isPagination={true}
                  dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={reportDetail?.key == "contractBusinessPartner" ? dataFormat : dataFormatContract}
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

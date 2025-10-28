import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { formatCurrency, getPageOffset } from "reborn-util";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Loading from "components/loading";
import _, { set } from "lodash";
import { showToast } from "utils/common";
import moment from "moment";

import "./index.scss";
import ContractWarrantyService from "services/ContractWarrantyService";
import Icon from "components/icon";
import { useNavigate } from "react-router-dom";

export default function ReportWarantyDetailModal(props: any) {
  const { onShow, reportDetail, onHide, paramsFilter, title } = props;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listOpt, setListOpt] = useState([]);

  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
  });

  useEffect(() => {
    setParams((prevParams) => ({ ...prevParams, ...paramsFilter, status: reportDetail }));
  }, [paramsFilter, reportDetail]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Bảo hành",
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
    if (!params.status) {
      return;
    }
    const response: any = await ContractWarrantyService.list(params, abortController.signal);

    if (response?.code === 0) {
      const result = response?.result;

      setListOpt(result?.items);
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

  const titles = ["STT", "Tên bảo hành", "Hợp đồng gốc", "Tên dự án", "Ngày bắt đầu", "Ngày hết hạn", "Đơn vị thực hiện", "Đơn vị thụ hưởng", "Xem"];

  const dataFormat = ["text-center", "", "", "", "", "", "text-right", "text-right", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    <a
      style={{ cursor: "pointer" }}
      className="text-primary"
      onClick={() => {
        navigate(`/detail_warranty_contract/warrantyId/${item?.id}`);
      }}
    >
      {item.name}
    </a>,
    item.contract?.name || "",
    item?.projectName || "",
    item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : "",
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
    item.cusCompetencyPartner?.name || item.competencyPartner?.name || item.competency?.name || "",
    item.cusBeneficialPartner?.name || item.beneficialPartner?.name || "",
    <a
      style={{ cursor: "pointer" }}
      onClick={() => {
        navigate(`/detail_warranty_contract/warrantyId/${item?.id}`);
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
      name: "Bảo hành",
      isChooseSizeLimit: true,
      setPage: (page) => {
        setParams((prevParams) => ({ ...prevParams, page: page }));
      },
      chooseSizeLimit: (limit) => {
        setParams((prevParams) => ({ ...prevParams, limit: limit }));
      },
    });
  };

  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        size="xxl"
        toggle={() => {}}
        className="modal-detail-report-waranty"
      >
        <div>
          <ModalHeader
            title={title || ""}
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

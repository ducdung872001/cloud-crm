import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import moment from "moment";
import { formatCurrency, getPageOffset } from "reborn-util";
import { showToast } from "utils/common";
import { PaginationProps, DataPaginationDefault } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import { IAction } from "model/OtherModel";
import Icon from "components/icon";
import ModalAddData from "./partials/ModalAddData";
import LoanInformationService from "services/fintech/LoanInformationService";

import "./index.scss";

export default function LoanInformation({ data, onShow, callBack }) {
  const [listLoanInformation, setListLoanInformation] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataLoanInformation, setDataLoanInformation] = useState<any>(null);

  const [params, setParams] = useState<any>({
    name: "",
    customerId: data.id,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Khoản vay LPBank",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListLoanInformation = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await LoanInformationService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListLoanInformation(result.items);

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
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListLoanInformation(params);
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

  const titles = ["STT", "Số hợp đồng vay", "Hạn mức tín dụng", "Xếp hạng tín dụng", "Ngày mở khoản vay", "Ngày đáo hạn",
    "Số tiền vay", "Loại tiền tệ", "Tỷ giá quy đổi", "Lãi suất", "Loại hình vay", "Tình trạng", "Lịch sử thanh toán khoản vay",
    "Tài sản đảm bảo", "Giá trị tài sản đảm bảo", "Nhóm nợ", "Ngày phát sinh nợ xấu", "Số tiền nợ xấu", "Phân loại nợ xấu"
  ];

  const dataFormat = ["text-center", "", "text-right", "", "text-center", "text-center",
    "text-right", "text-center", "text-right", "text-right", "", "", "",
    "", "text-right", "text-center", "text-center", "text-right", "text-center"
  ];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.contractNo,    
    formatCurrency(item.creditLimit, ","),
    item.creditRating,
    item.openingDate ? moment(item.openingDate).format("DD/MM/YYYY") : "",
    item.dateDue ? moment(item.dateDue).format("DD/MM/YYYY") : "",
    formatCurrency(item.loan, ","),
    item.currency,
    item.exchangeRate,
    item.interestRate,
    item.loanType,
    item.status,
    item.paymentHistory,
    item.collateral,
    formatCurrency(item.collateralAsset, ","),
    item.groupDebt,
    item.badDebtDate ? moment(item.badDebtDate).format("DD/MM/YYYY") : "",
    formatCurrency(item.badDebtAmount, ","),
    item.badDebtType
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataLoanInformation(item);
          callBack(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const onDelete = async (id: number) => {
    const response = await LoanInformationService.delete(id);

    if (response.code === 0) {
      showToast("Xóa khoản vay LPBank thành công", "success");
      getListLoanInformation(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa khoản vay LPBank
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <div className={`page-content loan__information${isNoItem ? " bg-white" : ""}`}>
      {!isLoading && listLoanInformation && listLoanInformation.length > 0 ? (
        <BoxTable
          name="Thông tin khoản vay LPBank"
          titles={titles}
          items={listLoanInformation}
          isPagination={true}
          dataPagination={pagination}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          striped={true}
          actions={actionsTable}
          actionType="inline"
        />
      ) : isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          <SystemNotification
            description={
              <span>
                Hiện tại chưa có thông tin khoản vay LPBank nào. <br />
                Hãy thêm mới thông tin khoản vay LPBank đầu tiên nhé!
              </span>
            }
            type="no-item"
            titleButton="Thêm thông tin khoản vay LPBank"
            action={() => {
              setDataLoanInformation(null);
              callBack(true);
            }}
          />
        </Fragment>
      )}

      <ModalAddData
        customerId={params.customerId}
        onShow={onShow}
        onHide={(reload) => {
          if (reload) {
            getListLoanInformation(params);
          }

          callBack(false);
        }}
        dataProps={dataLoanInformation}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

import React, { Fragment, useState, useEffect, useRef } from "react";
import cloneDeep from "lodash/cloneDeep";

import { formatDate } from "utils/dateUtils";

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

import "./index.scss";

export default function DetailInfoCIC({ data, onShow, callBack }) {
  const [listInfoCIC, setListInfoCIC] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataInfoCIC, setDataInfoCIC] = useState<number>(null);

  const [params, setParams] = useState<Record<string, unknown>>({
    name: "",
    customerId: data.id,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Thông tin Khoản vay tại các TCTD",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListInfoCIC = async (paramsSearch: Record<string, unknown>) => {
    setIsLoading(true);

    const response = null;

    if (response.code === 0) {
      const result = response.result;
      setListInfoCIC(result.items);

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
    const paramsTemp = cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListInfoCIC(params);
      const paramsTemp = cloneDeep(params);
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

  const dataMappingArray = (item: Record<string, unknown>, index: number) => [
    getPageOffset(params) + index + 1,
    item.contractNo,    
    formatCurrency(item.creditLimit, ","),
    item.creditRating,
    item.openingDate ? formatDate(item.openingDate) : "",
    item.dateDue ? formatDate(item.dateDue) : "",
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
    item.badDebtDate ? formatDate(item.badDebtDate) : "",
    formatCurrency(item.badDebtAmount, ","),
    item.badDebtType
  ];

  const actionsTable = (item: Record<string, unknown>): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataInfoCIC(item);
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
  const [contentDialog, setContentDialog] = useState<Record<string, unknown>>(null);

  const onDelete = async (id: number) => {
    const response = null;

    if (response.code === 0) {
      showToast("Xóa thông tin khoản vay tại TCTD thành công", "success");
      getListInfoCIC(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: Record<string, unknown>) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa thông tin khoản vay tại TCTD
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
    <div className={`page-content detail__info--cic${isNoItem ? " bg-white" : ""}`}>
      {!isLoading && listInfoCIC && listInfoCIC.length > 0 ? (
        <BoxTable
          name="Thông tin khoản vay tại TCTD"
          titles={titles}
          items={listInfoCIC}
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
                Hiện tại chưa có thông tin khoản vay tại TCTD nào. <br />
                Hãy thêm mới thông tin khoản vay tại TCTD đầu tiên nhé!
              </span>
            }
            type="no-item"
            titleButton="Thêm thông tin khoản vay tại TCTD"
            action={() => {
              setDataInfoCIC(null);
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
            getListInfoCIC(params);
          }

          callBack(false);
        }}
        dataProps={dataInfoCIC}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

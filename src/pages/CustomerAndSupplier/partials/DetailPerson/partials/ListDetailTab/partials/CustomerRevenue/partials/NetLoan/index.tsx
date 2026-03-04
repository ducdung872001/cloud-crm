import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import { formatCurrency, getPageOffset } from "reborn-util";
import moment from "moment";
import { showToast } from "utils/common";
import { PaginationProps, DataPaginationDefault } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import { IAction } from "model/OtherModel";
import Icon from "components/icon";
import ModalAddData from "./partials/ModalAddData";
import NetLoanService from "services/fintech/NetLoanService";

import "./index.scss";

export default function NetLoan({ data, onShow, callBack }) {
  const [listNetLoan, setListNetLoan] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataNetLoan, setDataNetLoan] = useState<number>(null);

  const [params, setParams] = useState<any>({
    name: "",
    customerId: data.id,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "thông tin phí tiền vay",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListNetLoan = async (paramsSearch: any) => {
    setIsLoading(true);
    const response = await NetLoanService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListNetLoan(result.items);

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
      getListNetLoan(params);
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

  const titles = ["STT", "Ngày giao dịch", "Ngắn hạn", "Trung, dài hạn", "Khác"];

  const dataFormat = ["text-center", "text-center", "text-right", "text-right", "text-right"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.transactionDate ? moment(item.transactionDate).format("DD/MM/YYYY") : "",
    formatCurrency(item.shortTerm, ","),
    formatCurrency(item.longTerm, ","),
    formatCurrency(item.other, ","),
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataNetLoan(item);
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
    const response = await NetLoanService.delete(id);

    if (response.code === 0) {
      showToast("Xóa thông tin thu phí tiền vay", "success");
      getListNetLoan(params);
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
          Bạn có chắc chắn muốn xóa thông tin thu phí tiền vay
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
    <div className={`page-content detail__net-loan${isNoItem ? " bg-white" : ""}`}>
      {!isLoading && listNetLoan && listNetLoan.length > 0 ? (
        <BoxTable
          name="Thông tin thu phí tiền vay"
          titles={titles}
          items={listNetLoan}
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
                Hiện tại chưa có thông tin thu phí tiền vay nào. <br />
                Hãy thêm mới thông tin thu phí tiền vay đầu tiên nhé!
              </span>
            }
            type="no-item"
            titleButton="Thêm thông tin thu phí tiền vay"
            action={() => {
              setDataNetLoan(null);
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
            getListNetLoan(params);
          }

          callBack(false);
        }}
        dataProps={dataNetLoan}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

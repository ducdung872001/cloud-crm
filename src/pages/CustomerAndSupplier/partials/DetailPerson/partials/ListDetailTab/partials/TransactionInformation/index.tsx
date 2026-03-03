import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import moment from "moment";
import Button from "components/button/button";
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
import TransactionInformationService from "services/fintech/TransactionInformationService";

import "./index.scss";

export default function TransactionInformation({ data }) {
  const [listTransactionInformation, setListTransactionInformation] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataTransactionInformation, setDataTransactionInformation] = useState<any>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
    customerId: data.id,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Thông tin giao dịch",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTransactionInformation = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await TransactionInformationService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListTransactionInformation(result.items);

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
      getListTransactionInformation(params);
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

  const titles = ["STT", "Ngày giao dịch", "CASA", "FD", "TRF", "Cho vay", "Loại tiền tệ", "Tỷ giá quy đổi", "Lịch sử giao dịch của khách hàng",
    "Tần suất giao dịch của khách hàng"
  ];

  const dataFormat = ["text-center", "text-center", "text-right", "text-right", "text-right", "text-right", "", "text-right", "",
    "text-right"
  ];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.transactionDate ? moment(item.transactionDate).format("DD/MM/YYYY") : "",
    formatCurrency(item.casa, ","),
    formatCurrency(item.fd, ","),
    formatCurrency(item.trf, ","),
    formatCurrency(item.loan, ","),
    item.currency,
    item.exchageRate,
    item.transactionHistory,
    item.transactionFrequency,    
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataTransactionInformation(item);
          setShowModalAdd(true);

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
    const response = await TransactionInformationService.delete(id);

    if (response.code === 0) {
      showToast("Xóa thông tin giao dịch thành công", "success");
      getListTransactionInformation(params);
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
          Bạn có chắc chắn muốn xóa thông tin giao dịch
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
    <div className={`page-content transaction__information${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách thông tin giao dịch</li>
            </ul>
            <Tippy content="Thêm mới thông tin giao dịch" delay={[100, 0]} animation="scale-extreme">
              <div className="add-ticket">
                <Button
                  color="success"
                  onClick={() => {
                    setDataTransactionInformation(null);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
        </div>
        {!isLoading && listTransactionInformation && listTransactionInformation.length > 0 ? (
          <BoxTable
            name="Thông tin giao dịch"
            titles={titles}
            items={listTransactionInformation}
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
                  Hiện tại chưa có thông tin giao dịch nào. <br />
                  Hãy thêm mới thông tin giao dịch đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm thông tin giao dịch"
              action={() => {
                setDataTransactionInformation(null);
                setShowModalAdd(true);
              }}
            />
          </Fragment>
        )}
      </div>
      <ModalAddData
        customerId={params.customerId}
        onShow={showModalAdd}
        onHide={(reload) => {
          if (reload) {
            getListTransactionInformation(params);
          }

          setShowModalAdd(false);
        }}
        dataProps={dataTransactionInformation}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

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
import FullFinancialReportService from "services/fintech/FullFinancialReportService";

import "./index.scss";

export default function FullFinancialReports({ data }) {
  const [listFullFinancialReports, setListFullFinancialReports] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataFullFinancialReports, setDataFullFinancialReports] = useState<any>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
    customerId: data.id,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Báo cáo tài chính đầy đủ",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListFullFinancialReports = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await FullFinancialReportService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListFullFinancialReports(result.items);

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
      getListFullFinancialReports(params);
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

  const titles = ["STT", "Kỳ báo cáo", "Bảng cân đối kế toán", "Báo cáo lưu chuyển tiền tệ",
    "Báo cáo kết quả kinh doanh", "Báo cáo kiểm toán"];

  const dataFormat = ["text-center", "text-center", "", "", "", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    `${item.month}/${item.year}`,
    item.balanceSheet, //Nên dùng icon tốt hơn
    item.cashFlow,
    item.businessReport,
    item.auditReport,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataFullFinancialReports(item);
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
    const response = await FullFinancialReportService.delete(id);

    if (response.code === 0) {
      showToast("Xóa báo cáo tài chính đầy đủ thành công", "success");
      getListFullFinancialReports(params);
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
          Bạn có chắc chắn muốn xóa báo cáo tài chính đầy đủ
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
    <div className={`page-content full_financial--reports${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách báo cáo tài chính đầy đủ</li>
            </ul>
            <Tippy content="Thêm mới báo cáo tài chính đầy đủ" delay={[100, 0]} animation="scale-extreme">
              <div className="add-ticket">
                <Button
                  color="success"
                  onClick={() => {
                    setDataFullFinancialReports(null);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
        </div>
        {!isLoading && listFullFinancialReports && listFullFinancialReports.length > 0 ? (
          <BoxTable
            name="Báo cáo tài chính đầy đủ"
            titles={titles}
            items={listFullFinancialReports}
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
                  Hiện tại chưa có báo cáo tài chính đầy đủ nào. <br />
                  Hãy thêm mới báo cáo tài chính đầy đủ đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm báo cáo tài chính đầy đủ"
              action={() => {
                setDataFullFinancialReports(null);
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
            getListFullFinancialReports(params);
          }

          setShowModalAdd(false);
        }}
        dataProps={dataFullFinancialReports}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

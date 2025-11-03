import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import moment from "moment";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { IPaymentHistoryResponse } from "model/paymentHistory/PaymentHistoryResponseModel";
import { IPaymentHistoryFilterRequest } from "model/paymentHistory/PaymentHistoryRequestModel";
import PaymentHistoryService from "services/PaymentHistoryService";
import { showToast } from "utils/common";
import { formatCurrency, getPageOffset } from 'reborn-util';
import AddPaymentHistoryModal from "./partials/AddPaymentHistoryModal";

export default function PaymentHistoryList() {
  document.title = "Thanh toán hoa hồng";

  const isMounted = useRef(false);

  const [listPaymentHistory, setListPaymentHistory] = useState<IPaymentHistoryResponse[]>([]);
  const [dataPaymentHistory, setDataPaymentHistory] = useState<IPaymentHistoryResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [params, setParams] = useState<IPaymentHistoryFilterRequest>({
    recommenderPhone: "",
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách thanh toán",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Thanh toán hoa hồng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListPaymentHistory = async (paramsSearch: IPaymentHistoryFilterRequest) => {
    setIsLoading(true);

    const response = await PaymentHistoryService.filter(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListPaymentHistory(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && params.recommenderPhone === "" && +params.page === 1) {
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

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListPaymentHistory(params);
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

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          setDataPaymentHistory(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Ngày thanh toán", "Người thụ hưởng", "Số tiền", "Nội dung", "Chứng từ"];

  const dataMappingArray = (item: IPaymentHistoryResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.transDate ? moment(item.transDate).format("DD/MM/YYYY") : "",
    item.recommenderPhone,
    formatCurrency(+item.amount, ","),
    item.content,
    item.bill ? <Image src={item.bill} alt="error-image" width={"64rem"} /> : <Image src="" alt="error-image" width={"64rem"} />,
  ];

  const dataFormat = ["text-center", "text-center", "text-center", "text-right", "", "text-center"];

  const actionsTable = (item: IPaymentHistoryResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataPaymentHistory(item);
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

  const onDelete = async (id: number) => {
    const response = await PaymentHistoryService.delete(id);
    if (response.code === 0) {
      showToast("Xóa thanh toán hoa hồng thành công", "success");
      getListPaymentHistory(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IPaymentHistoryResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "thanh toán hoa hồng " : `${listIdChecked.length} thanh toán hoa hồng đã chọn`}
          {item ? <strong></strong> : ""}? Thao tác này không thể khôi phục.
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

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa thanh toán hoa hồng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-payment${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Thanh toán hoa hồng" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Nội dung thanh toán"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listPaymentHistory && listPaymentHistory.length > 0 ? (
          <BoxTable
            name="Thanh toán hoa hồng"
            titles={titles}
            items={listPaymentHistory}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            bulkActionItems={bulkActionList}
            isBulkAction={true}
            striped={true}
            listIdChecked={listIdChecked}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {!isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có lịch sử thanh toán nào. <br />
                    Hãy thêm mới lịch sử thanh toán đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm lịch sử thanh toán"
                action={() => {
                  setDataPaymentHistory(null);
                  setShowModalAdd(true);
                }}
              />
            ) : (
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
            )}
          </Fragment>
        )}
      </div>
      <AddPaymentHistoryModal
        onShow={showModalAdd}
        data={dataPaymentHistory}
        onHide={(reload) => {
          if (reload) {
            getListPaymentHistory(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

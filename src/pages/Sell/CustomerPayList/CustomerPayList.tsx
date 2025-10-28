import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import Badge from "components/badge/badge";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import { IInvoiceResponse } from "model/invoice/InvoiceResponse";
import { showToast } from "utils/common";
import { formatCurrency, isDifferenceObj, getPageOffset } from "reborn-util";
import InvoiceService from "services/InvoiceService";
import ShowCustomerInvoice from "./partials/ShowCustomerInvoice";
import { ContextType, UserContext } from "contexts/userContext";

export default function CustomerPayList() {
  document.title = "Hóa đơn Khách trả hàng";

  const isMounted = useRef(false);
  const checkUserRoot = localStorage.getItem("user.root");
  const [searchParams, setSearchParams] = useSearchParams();
  const [listCustomerPay, setListCustomerPay] = useState<IInvoiceResponse[]>([]);
  const [showModalCustomerInvoice, setShowModalCustomerInvoice] = useState<boolean>(false);
  const [idCustomerPay, setIdCustomerPay] = useState<number>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [params, setParams] = useState<IInvoiceFilterRequest>({
    invoiceCode: "",
    invoiceTypes: JSON.stringify(["IV2"]),
  });

  const customerFilterList = useMemo(
    () =>
      [
        // ...(+checkUserRoot == 1
        //   ? [
        //       {
        //         key: "branchId",
        //         name: "Chi nhánh",
        //         type: "select",
        //         is_featured: true,
        //         value: searchParams.get("branchId") ?? "",
        //       },
        //     ]
        //   : []),
        {
          key: "time_buy",
          name: "Khoảng thời gian",
          type: "date-two",
          param_name: ["fromDate", "toDate"],
          is_featured: true,
          value: searchParams.get("fromDate") ?? "",
          value_extra: searchParams.get("toDate") ?? "",
          is_fmt_text: true,
        },

        {
          key: "customerId",
          name: "Khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("customerId") ?? "",
        },
        {
          key: "keyword",
          name: "Tìm kiếm tên dịch vụ/sản phẩm",
          type: "input",
          is_featured: true,
          value: searchParams.get("keyword") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách Hóa đơn Khách trả hàng",
      is_active: true,
    },
  ]);

  useEffect(() => {
    if(dataBranch){      
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value}));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Hóa đơn Khách trả hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCustomerPay = async (paramsSearch: IInvoiceFilterRequest) => {
    setIsLoading(true);

    const response = await InvoiceService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result.pagedLst;
      setListCustomerPay(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params.invoiceCode && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListCustomerPay(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  const titles = ["STT", "Mã hóa đơn", "Tên khách hàng", "Ngày trả", "Tổng tiền", "VAT", "Giảm giá", "Đã thanh toán", "Công nợ", "Trạng thái"];

  const dataFormat = ["text-center", "", "", "", "text-right", "text-right", "text-right", "text-right", "text-right", "text-center"];

  const dataMappingArray = (item: IInvoiceResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <span
      key={index}
      style={{ cursor: "pointer" }}
      onClick={() => {
        navigator.clipboard.writeText(item.invoiceCode);
        showToast("Copy thành công", "success");
      }}
    >
      {item.invoiceCode}
    </span>,
    item.customerName,
    moment(item.receiptDate).format("DD/MM/YYYY"),
    formatCurrency(item.amount),
    "0",
    formatCurrency(item.discount ? item.discount : "0"),
    formatCurrency(item.paid),
    formatCurrency(item.debt ? item.debt : "0"),
    <Badge
      key={item.id}
      text={item.status === 1 ? "Hoàn thành" : item.status === 2 ? "Chưa hoàn thành" : "Đã hủy"}
      variant={item.status === 1 ? "success" : item.status === 2 ? "warning" : "error"}
    />,
  ];

  const actionsTable = (item: IInvoiceResponse): IAction[] => {
    return [
      {
        title: "Xem hóa đơn",
        icon: <Icon name="Eye" />,
        callback: () => {
          setIdCustomerPay(item.id);
          setShowModalCustomerInvoice(true);
        },
      },
    ];
  };

  return (
    <div className={`page-content page__customer--pay${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Hóa đơn Khách trả hàng" />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Mã hóa đơn"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listCustomerPay && listCustomerPay.length > 0 ? (
          <BoxTable
            name="Danh sách khách trả hàng"
            titles={titles}
            items={listCustomerPay}
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
            {isNoItem ? (
              <SystemNotification description={<span>Hiện tại chưa có hóa đơn khách trả hàng nào.</span>} type="no-item" />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Không có dữ liệu trùng khớp. <br />
                    Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                  </span>
                }
                type="no-result"
              />
            )}
          </Fragment>
        )}
      </div>

      <ShowCustomerInvoice
        onShow={showModalCustomerInvoice}
        idCustomerPay={idCustomerPay}
        onHide={(hide) => {
          setShowModalCustomerInvoice(false);
        }}
      />
    </div>
  );
}

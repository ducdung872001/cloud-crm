import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import moment from "moment";
import _ from "lodash";
import { Link, useSearchParams } from "react-router-dom";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import { formatCurrency, isDifferenceObj, getPageOffset } from 'reborn-util';
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";

export default function CustomerCareList() {
  document.title = "Chăm sóc khách hàng";

  const [searchParams, setSearchParams] = useSearchParams();
  const [listCustomerCare, setListCustomerCare] = useState<ICustomerResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [dataCustomerCare, setDataCustomerCare] = useState<ICustomerResponse>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách khách hàng",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_buy",
        name: "Thời gian mua gần nhất",
        type: "date-two",
        param_name: ['fmtStartOrderDate', 'fmtEndOrderDate'],
        is_featured: true,
        value: searchParams.get("fmtStartOrderDate") ?? "",
        value_extra: searchParams.get("fmtEndOrderDate") ?? "",
        is_fmt_text: true,
      },
      {
        key: "customer_birthday",
        name: "Sinh nhật khách hàng",
        param_name: ['fmtStartDay', 'fmtEndDay'],
        type: "date-two",
        is_featured: true,
        value: searchParams.get("fmtStartDay") ?? "",
        value_extra: searchParams.get("fmtEndDay") ?? "",
        is_fmt_text: true,
      },
      {
        key: "cardId",
        name: "Theo hạng thẻ",
        type: "select",
        is_featured: true,
        value: searchParams.get("cardId") ?? "",
      },
      {
        key: "lstId",
        name: "Dịch vụ",
        type: "select",
        is_featured: true,
        value: searchParams.get("lstId") ?? "",
      },
    ],
    [searchParams]
  );

  const isMounted = useRef(false);
  const [params, setParams] = useState<ICustomerSchedulerFilterRequest>({
    keyword: "",
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListCustomer = async (paramsSearch: ICustomerSchedulerFilterRequest) => {
    setIsLoading(true);
    
    const response = await CustomerService.filter(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCustomerCare(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && params.keyword === "" && +params.page === 1) {
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
      getListCustomer(params);
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

  const titles = ["STT", "Tên khách hàng", "Điện thoại", "Ngày sinh", "Facebook", "Doanh số", "Doanh thu", "Xếp hạng", "Lịch sử chăm sóc"];

  const dataMappingArray = (item: ICustomerResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.phoneMasked,
    item.birthday ? moment(item.birthday).format("DD/MM/YYYY") : "",
    item.profileLink ? (
      <Link to={item.profileLink} key={index}>
        Đi tới
      </Link>
    ) : (
      ""
    ),
    formatCurrency(item.fee, ","),
    formatCurrency(item.paid, ","),
    item.cardName ?? "",
    <Link to={`#`} key={index}>
      Xem
    </Link>,
  ];

  const dataFormat = ["text-center", "", "text-center", "", "text-center", "text-right", "text-right", "text-center", "text-center"];

  const actionsTable = (item: ICustomerResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataCustomerCare(item);
          setShowModalAdd(true);
        },
      },
    ];
  };

  return (
    <div className={`page-content page-customer${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Chăm sóc khách hàng" />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Khách hàng"
          placeholderSearch="Tìm kiếm theo tên/ Nhóm dịch vụ/ Dịch vụ"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramNew) => setParams(paramNew)}
        />
        {!isLoading && listCustomerCare && listCustomerCare.length > 0 ? (
          <BoxTable
            name="Khách hàng"
            titles={titles}
            items={listCustomerCare}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            striped={true}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {!isNoItem ? (
              <SystemNotification description={<span>Hiện tại chưa có khách hàng nào.</span>} type="no-item" />
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
      <AddCustomerPersonModal
        onShow={showModalAdd}
        data={dataCustomerCare}
        onHide={(reload) => {
          if (reload) {
            getListCustomer(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

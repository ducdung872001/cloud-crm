import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import Loading from "components/loading";
import "./PerformanceEmployee.scss";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { formatCurrency, getPageOffset } from "reborn-util";

function PerformanceEmployee(props: any) {
  const { onShow } = props;


  useEffect(() => {
    getListTopSale();
  }, []);



  const [params, setParams] = useState<any>({
    name: "",
  });
  const [listTopSale, setListTopSale] = useState([]);
  const [isLoadingTopSale, setIsLoadingTopSale] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "nhân viên",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });


  const getListTopSale = async () => {
    setIsLoadingTopSale(true);

    // const response = await CampaignService.list(paramsSearch);

    // if (response.code == 0) {
    //   const result = response.result;
    //   setListTopSale(result.items);

    //   setPagination({
    //     ...pagination,
    //     page: +result.page,
    //     sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
    //     totalItem: +result.total,
    //     totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
    //   });

    //   if (+result.total === 0 && !params?.name && +result.page === 1) {
    //     setIsNoItem(true);
    //   }
    // } else if (response.code == 400) {
    //   setIsPermissions(true);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }

    setListTopSale([
      {
        employeeName: 'Trung Nguyen',
        quatityCall: 20,
        successCall: 15,
        rate: 75,
        revenue: 10000000,
        targetRevenue: 15000000,
        achieve: 80
      },
      {
        employeeName: 'Duc Dung',
        quatityCall: 30,
        successCall: 20,
        rate: 75,
        revenue: 13000000,
        targetRevenue: 15000000,
        achieve: 70
      },
      {
        employeeName: 'Nguyen Tung',
        quatityCall: 20,
        successCall: 15,
        rate: 75,
        revenue: 10000000,
        targetRevenue: 15000000,
        achieve: 80
      },
    ])
    setIsLoadingTopSale(false);
  };



  const titlesTopSale = [
    "STT",
    "Tên nhân viên",
    "Số cuộc gọi",
    "Cuộc gọi thành công",
    "Tỷ lệ chuyển đổi (%)",
    "Doanh thu",
    "Mục tiêu doanh thu",
    "Đạt được (%)"
  ];
  const dataFormatTopSale = ["text-center", "", "", "", "text-right",];

  const dataMappingArrayTopSale = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.employeeName,
    item.quatityCall,
    item.successCall,
    item.rate,
    formatCurrency(item.revenue),
    formatCurrency(item.targetRevenue),
    item.achieve
  ];

  return (
        <div className="card-box box__item" style={{padding: '1.6rem'}}>
            <div className="title d-flex align-items-start justify-content-between">
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3>Báo cáo hiệu xuất Telesales</h3>
              </div>
            </div>
            <div>
              {!isLoadingTopSale && listTopSale && listTopSale.length > 0 ? (
                <BoxTable
                  name=""
                  // className="table__document"
                  titles={titlesTopSale}
                  items={listTopSale}
                  isPagination={false}
                  //   dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArrayTopSale(item, index)}
                  dataFormat={dataFormatTopSale}
                  // listIdChecked={listIdChecked}
                  isBulkAction={true}
                  // bulkActionItems={bulkActionList}
                  striped={true}
                  // setListIdChecked={(listId) => setListIdChecked(listId)}
                  // actions={actionsTable}
                  actionType="inline"
                />
              ) : isLoadingTopSale ? (
                <Loading />
              ) : (
                <Fragment>
                  {<SystemNotification description={<span>Hiện tại chưa có nhân viên nào.</span>} type="no-item" />}
                </Fragment>
              )}
            </div>
        </div>
  );
}

export default memo(PerformanceEmployee);

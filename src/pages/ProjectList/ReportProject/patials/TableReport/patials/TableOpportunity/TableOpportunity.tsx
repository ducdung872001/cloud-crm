import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { getPageOffset } from "reborn-util";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import "./TableOpportunity.scss";
import _ from "lodash";

export default function TableOpportunity({ dataProjectReport }) {
  const isMounted = useRef(false);

  const [listOpportunity, setLisOpportunity] = useState([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    setParams((prevParams) => ({ ...prevParams, projectId: dataProjectReport?.id }));
  }, [dataProjectReport]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "cơ hội",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListOpportunity = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await CustomerService.lstOpportunity(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setLisOpportunity(result.items || []);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
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
      getListOpportunity(params);
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

  const titles = ["STT", "Tên sản phẩm/dịch vụ", "Tên khách hàng", "Người quyết định"];

  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.productName || item.serviceName,
    item.customerName,
    item.contactName,
  ];

  return (
    <div className={`page-content page-opportunity-list-report page-opportunity-list${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        {!isLoading && listOpportunity && listOpportunity.length > 0 ? (
          <BoxTable
            titles={titles}
            items={listOpportunity}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            isBulkAction={true}
            listIdChecked={listIdChecked}
            striped={true}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isPermissions ? (
              <SystemNotification type="no-permission" />
            ) : isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có cơ hội nào. <br />
                  </span>
                }
                type="no-item"
                titleButton=""
                // action={() => }
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
    </div>
  );
}

import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IRelationShipFilterRequest } from "model/relationShip/RelationShipRequest";
import { IRelationShipResposne } from "model/relationShip/RelationShipResposne";
import { ICustomerRelationshipListProps } from "model/relationShip/PropsModal";
import RelationShipService from "services/RelationShipService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from 'reborn-util';

import "./index.scss";
import BoughtCardService from "services/BoughtCardService";
import { ICustomerRoyaltyPointListProps } from "model/loyaltyPoint/PropsModal";
import { IRoyaltyPointResposne } from "model/loyaltyPoint/RoyaltyPointResposne";
import { IRoyaltyPointFilterRequest } from "model/loyaltyPoint/RoyaltyPointRequest";
import moment from "moment";

export default function CustomerLoyaltyPointLedger(props: ICustomerRoyaltyPointListProps) {
  document.title = "Lịch sử điểm tích lũy của khách hàng";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listRoyaltyPoint, setListRoyaltyPoint] = useState<IRoyaltyPointResposne[]>([]);
  const [dataRelationShip, setDataRoyaltyPoint] = useState<IRoyaltyPointResposne>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<IRoyaltyPointFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách lịch sử điểm tích lũy của khách hàng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Lịch sử điểm tích lũy của khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListRoyaltyPoint = async (paramsSearch: IRoyaltyPointFilterRequest) => {
    setIsLoading(true);

    const response = await BoughtCardService.listLoyaltyPoint(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListRoyaltyPoint(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (result.length === 0 && params.name == "") {
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
      getListRoyaltyPoint(params);
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

  const titles = ["STT", "Tên khách hàng", "Mã thẻ", "Ngày tạo", "Điểm tích lũy", "Nội dung", ];

  const dataFormat = ["text-center", "","text-center","text-center","text-center", ""];

  const dataMappingArray = (item: IRoyaltyPointResposne, index: number) => [
    getPageOffset(params) + index + 1,
    item.customerName,
    item.cardNumber,
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY HH:mm") : "",
    <span className={`point__value--${(item.point || 0) >= 0 ? "revenue" : "expenditure"}`}>
      {item.point}
    </span>,
    item.description,
  ];

  return (
    <div className={`page-content page-customer-relationship${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt khách hàng
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách lịch sử điểm tích lũy của khách hàng</h1>
        </div>
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Lịch sử điểm tích lũy của khách hàng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listRoyaltyPoint && listRoyaltyPoint.length > 0 ? (
          <BoxTable
            name="Lịch sử điểm tích lũy của khách hàng"
            titles={titles}
            items={listRoyaltyPoint}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            // isBulkAction={true}
            // listIdChecked={listIdChecked}
            // setListIdChecked={(listId) => setListIdChecked(listId)}
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
                    Hiện tại chưa lịch sử điểm tích lũy của khách hàng nào. <br />
                    Hãy thêm mới lịch sử điểm tích lũy của khách hàng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới lịch sử điểm tích lũy của khách hàng"
                action={() => {
                  setDataRoyaltyPoint(null);
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
    </div>
  );
}

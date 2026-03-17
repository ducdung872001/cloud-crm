import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import "./index.scss";
import AddLoyaltyPointLedgerModal from "./partials/AddLoyaltyPointLedgerModal";
import { IRoyaltyFilterRequest } from "@/model/loyalty/RoyaltyRequest";
import { ILoyaltyPointLedgerResposne } from "@/model/loyalty/RoyaltyResposne";
import LoyaltyService from "@/services/LoyaltyService";
import moment from "moment";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

export default function LoyaltyPointLedger(props) {
  document.title = "Nhật ký điểm hội viên";

  const isMounted = useRef(false);
  const { onBackProps } = props;
  const [listData, setListData] = useState<ILoyaltyPointLedgerResposne[]>([]);
  const [selectedItem, setSelectedItem] = useState<ILoyaltyPointLedgerResposne>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState<IRoyaltyFilterRequest>({ name: "", limit: 10 });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    { key: "all", name: "Nhật ký điểm hội viên", is_active: true },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nhật ký điểm hội viên",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  const abortController = new AbortController();

  const fetchList = async (paramsSearch: IRoyaltyFilterRequest) => {
    setIsLoading(true);
    const response = await LoyaltyService.listLoyaltyPointLedger(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setListData(result.items ?? []);
      setPagination((prev) => ({
        ...prev,
        page: +result.page,
        sizeLimit: paramsSearch.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(paramsSearch.limit ?? DataPaginationDefault.sizeLimit)),
      }));
      if (+result.total === 0 && +result.page === 1) setIsNoItem(true);
    } else if (response.code === 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => { setParams((prev) => ({ ...prev })); }, []);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    fetchList(params);
    return () => { abortController.abort(); };
  }, [params]);

  // const titleActions: ITitleActions = {
  //   actions: [
  //     { title: "Thêm mới", callback: () => { setSelectedItem(null); setShowModalAdd(true); } },
  //   ],
  // };

  // Cột: STT | Khách hàng | Ví điểm | Số điểm | Chương trình thân thiết khách hàng | Đổi thưởng | Nhân viên | Ngày tạo
  const titles = ["STT", "Khách hàng", "Số điểm", "Chương trình thân thiết khách hàng", "Đổi thưởng", "Người phụ trách", "Ngày tạo"];
  const dataFormat = ["text-center", "", "text-center", "", "", "", "text-center"];
  const dataMappingArray = (item: ILoyaltyPointLedgerResposne, index: number) => [
    getPageOffset(params) + index + 1,
    item.customerName ?? "—",
    <span style={{ color: (item.point ?? 0) > 0 ? "green" : (item.point ?? 0) < 0 ? "red" : "inherit" }}>
      {item.point ?? 0}
    </span>,
    item.loyaltyProgramName ?? "—",
    item.loyaltyRewardName ?? "—",
    item.employeeName ?? "—",
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY") : "—",
  ];

  return (
    <div className={`page-content page-category-service${isNoItem ? " bg-white" : ""}`}>
      <HeaderTabMenu
        title="Lịch sử điểm"
        titleBack="Khách hàng thành viên"
        onBackProps={onBackProps}
      />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Nhật ký điểm hội viên"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listData && listData.length > 0 ? (
          <BoxTable
            name="nhật ký điểm hội viên"
            titles={titles}
            items={listData}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
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
                description={<span>Hiện tại chưa có nhật ký điểm hội viên nào.<br />Hãy thêm mới bản ghi đầu tiên nhé!</span>}
                type="no-item"
                titleButton="Thêm mới nhật ký điểm hội viên"
                action={() => { setSelectedItem(null); setShowModalAdd(true); }}
              />
            ) : (
              <SystemNotification
                description={<span>Không có dữ liệu trùng khớp.<br />Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!</span>}
                type="no-result"
              />
            )}
          </Fragment>
        )}
      </div>
      <AddLoyaltyPointLedgerModal
        onShow={showModalAdd}
        data={selectedItem}
        onHide={(reload) => { if (reload) fetchList(params); setShowModalAdd(false); }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

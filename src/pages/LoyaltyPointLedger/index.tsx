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
  document.title = "Lịch sử điểm";

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
    { key: "all", name: "Lịch sử điểm", is_active: true },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Lịch sử điểm",
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

  // Cột: STT | Khách hàng | Số điểm | Lý do | Chương trình thân thiết | Đổi thưởng | Người phụ trách | Ngày tạo
  const titles = ["STT", "Khách hàng", "Số điểm", "Lý do", "Chương trình thân thiết", "Đổi thưởng", "Người phụ trách", "Ngày tạo"];
  const dataFormat = ["text-center", "", "text-right", "", "", "", "", "text-center"];
  const dataMappingArray = (item: ILoyaltyPointLedgerResposne, index: number) => [
    getPageOffset(params) + index + 1,
    item.customerName ?? "—",
    (() => {
      const p = item.point ?? 0;
      const cls = p > 0 ? "ledger-point ledger-point--plus" : p < 0 ? "ledger-point ledger-point--minus" : "ledger-point ledger-point--zero";
      const prefix = p > 0 ? "+" : "";
      return (
        <span className={cls}>
          {prefix}{p.toLocaleString("vi-VN")}
          <span className="ledger-point__unit"></span>
        </span>
      );
    })(),
    item.description
      ? <span className="ledger-description" title={item.description}>{item.description}</span>
      : <span className="ledger-dash">—</span>,
    item.loyaltyProgramName
      ? <span className="ledger-program">{item.loyaltyProgramName}</span>
      : <span className="ledger-dash">—</span>,
    item.loyaltyRewardName
      ? <span className="ledger-reward">{item.loyaltyRewardName}</span>
      : <span className="ledger-dash">—</span>,
    item.employeeName ?? "—",
    item.createdTime
      ? <span className="ledger-date">{moment(item.createdTime).format("DD/MM/YYYY")}</span>
      : <span className="ledger-dash">—</span>,
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
          name="Lịch sử điểm"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listData && listData.length > 0 ? (
          <BoxTable
            name="lịch sử điểm"
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
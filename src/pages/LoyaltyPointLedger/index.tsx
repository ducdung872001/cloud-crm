import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFilterItem, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import "./index.scss";
import AddLoyaltyPointLedgerModal from "./partials/AddLoyaltyPointLedgerModal";
import { ILoyaltyPointLedgerRequest } from "@/model/loyalty/RoyaltyRequest";
import { ILoyaltyPointLedgerResposne } from "@/model/loyalty/RoyaltyResposne";
import LoyaltyService from "@/services/LoyaltyService";
import moment from "moment";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

interface Props {
  onBackProps: (v: boolean) => void;
  /** Nếu được truyền vào, trang sẽ tự filter theo hội viên này ngay khi mở */
  initialCustomerId?: number | null;
}

export default function LoyaltyPointLedger(props: Props) {
  document.title = "Lịch sử điểm";

  const isMounted = useRef(false);
  const { onBackProps, initialCustomerId } = props;

  const [listData, setListData]           = useState<ILoyaltyPointLedgerResposne[]>([]);
  const [selectedItem, setSelectedItem]   = useState<ILoyaltyPointLedgerResposne>(null);
  const [showModalAdd, setShowModalAdd]   = useState<boolean>(false);
  const [showDialog, setShowDialog]       = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading]         = useState<boolean>(true);
  const [isNoItem, setIsNoItem]           = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  // Nếu có initialCustomerId (bấm từ Danh sách thành viên) thì pre-set vào params
  const [params, setParams] = useState<ILoyaltyPointLedgerRequest>({
    limit: 10,
    ...(initialCustomerId ? { customerId: initialCustomerId } : {}),
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    { key: "all", name: "Lịch sử điểm", is_active: true },
  ]);

  // ── Filter: Thành viên (customerId) ──────────────────────────────────────
  // key "customerId" đã được SelectOptionData hỗ trợ sẵn trong filter component
  const filterList = useMemo<IFilterItem[]>(() => [
    {
      key: "customerId",
      name: "Thành viên",
      type: "select",
      is_featured: true,
      value: params.customerId ?? "",
    },
  ], [params.customerId]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Lịch sử điểm",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  const abortController = new AbortController();

  const fetchList = async (paramsSearch: ILoyaltyPointLedgerRequest) => {
    setIsLoading(true);
    setIsNoItem(false);
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

  // ── Table columns ─────────────────────────────────────────────────────────
  const titles = [
    "STT", "Khách hàng", "Số điểm", "Lý do",
    "Chương trình thân thiết", "Đổi thưởng", "Người phụ trách", "Ngày tạo",
  ];
  const dataFormat = ["text-center", "", "text-right", "", "", "", "", "text-center"];

  const dataMappingArray = (item: ILoyaltyPointLedgerResposne, index: number) => [
    getPageOffset(params) + index + 1,
    item.customerName ?? "—",
    // Số điểm
    (() => {
      const p = item.point ?? 0;
      const cls = p > 0
        ? "ledger-point ledger-point--plus"
        : p < 0
          ? "ledger-point ledger-point--minus"
          : "ledger-point ledger-point--zero";
      return (
        <span className={cls}>
          {p > 0 ? "+" : ""}{p.toLocaleString("vi-VN")}
        </span>
      );
    })(),
    // Lý do (description)
    item.description
      ? <span className="ledger-description" title={item.description}>{item.description}</span>
      : <span className="ledger-dash">—</span>,
    // Chương trình thân thiết
    item.loyaltyProgramName
      ? <span className="ledger-program">{item.loyaltyProgramName}</span>
      : <span className="ledger-dash">—</span>,
    // Đổi thưởng
    item.loyaltyRewardName
      ? <span className="ledger-reward">{item.loyaltyRewardName}</span>
      : <span className="ledger-dash">—</span>,
    // Người phụ trách
    item.employeeName
      ? <span className="ledger-employee">{item.employeeName}</span>
      : <span className="ledger-dash">—</span>,
    // Ngày tạo
    item.createdTime
      ? <span className="ledger-date">{moment(item.createdTime).format("DD/MM/YYYY")}</span>
      : <span className="ledger-dash">—</span>,
  ];

  // Tiêu đề động khi đang filter theo 1 thành viên cụ thể
  const filteredCustomerName = useMemo(() => {
    if (!params.customerId) return null;
    const first = listData.find((i) => i.customerId === params.customerId);
    return first?.customerName ?? null;
  }, [params.customerId, listData]);

  return (
    <div className={`page-content page-category-service${isNoItem ? " bg-white" : ""}`}>
      <HeaderTabMenu
        title={filteredCustomerName ? `Lịch sử điểm — ${filteredCustomerName}` : "Lịch sử điểm"}
        titleBack="Khách hàng thành viên"
        onBackProps={onBackProps}
      />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Lịch sử điểm"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={filterList}
          isShowFilterList={true}
          updateParams={(paramsNew) => {
            setParams((prev) => ({
              ...prev,
              ...paramsNew,
              // đảm bảo customerId là number hoặc undefined (không phải string "")
              customerId: paramsNew.customerId ? Number(paramsNew.customerId) : undefined,
              // giữ lại limit hiện tại nếu SearchBox không truyền (tránh limit=undefined)
              limit: paramsNew.limit || prev.limit || 10,
            }));
          }}
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
                description={
                  <span>
                    {params.customerId
                      ? <>Thành viên này chưa có lịch sử điểm nào.</>
                      : <>Hiện tại chưa có nhật ký điểm hội viên nào.</>
                    }
                  </span>
                }
                type="no-item"
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
import React, { Fragment, useState, useEffect, useRef } from "react";

import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import "./index.scss";
import { IRoyaltyFilterRequest } from "@/model/loyalty/RoyaltyRequest";
import { ILoyaltyWalletResponse } from "@/model/loyalty/RoyaltyResposne";
import LoyaltyService from "@/services/LoyaltyService";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";
import MemberCardBarcode from "./MemberCardBarcode";
import BulkImportModal from "./BulkImportModal";

export default function LoyaltyWallet(props) {
  document.title = "Danh sách hội viên";

  // ── Member Card + Bulk Import modals ──
  const [showCard, setShowCard] = useState(false);
  const [cardMember, setCardMember] = useState<ILoyaltyWalletResponse | null>(null);
  const [showImport, setShowImport] = useState(false);

  const isMounted = useRef(false);
  const { onBackProps, onViewHistory } = props;
  const [listData, setListData]         = useState<ILoyaltyWalletResponse[]>([]);
  const [isLoading, setIsLoading]       = useState<boolean>(true);
  const [isNoItem, setIsNoItem]         = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isExporting, setIsExporting]   = useState<boolean>(false);
  const [params, setParams]             = useState<IRoyaltyFilterRequest>({ name: "", limit: 10 });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    { key: "all", name: "Danh sách thành viên", is_active: true },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh sách thành viên",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  const abortController = new AbortController();

  const fetchList = async (paramsSearch: IRoyaltyFilterRequest) => {
    setIsLoading(true);
    const response = await LoyaltyService.listLoyaltyWallet(paramsSearch, abortController.signal);
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

  // ── Export ─────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      // customerId = undefined → xuất tất cả hội viên
      await LoyaltyService.exportLoyaltyWallet(undefined);
      showToast("Xuất Excel thành công", "success");
    } catch (err: unknown) {
      showToast(err?.message ?? "Xuất Excel thất bại. Vui lòng thử lại", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Import hội viên",
        icon: <Icon name="Upload" />,
        callback: () => setShowImport(true),
      },
    ],
    actions_extra: [
      {
        title:    isExporting ? "Đang xuất..." : "Xuất Excel",
        icon:     <Icon name="FileDown" />,
        disabled: isExporting,
        callback: handleExportExcel,
      },
    ],
  };

  // ── Table columns ──────────────────────────────────────────────
  const titles = [
    "STT", "Khách hàng", "Tổng điểm tích lũy", "Điểm hiện tại", "Hạng hội viên", "Trạng thái", "",
  ];
  const dataFormat = ["text-center", "", "text-right", "text-right", "", "text-center", "text-center"];

  const dataMappingArray = (item: ILoyaltyWalletResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.customerName ?? "—",
    <span
      className="loyalty-points loyalty-points--total loyalty-points--link"
      title="Xem lịch sử điểm"
      onClick={() => onViewHistory?.(item.customerId)}
    >
      {(item.totalEarn ?? 0).toLocaleString("vi-VN")}
    </span>,
    <span
      className={`loyalty-points loyalty-points--link${
        (item.currentBalance ?? 0) === 0 ? " loyalty-points--zero" : " loyalty-points--current"
      }`}
      title="Xem lịch sử điểm"
      onClick={() => onViewHistory?.(item.customerId)}
    >
      {(item.currentBalance ?? 0).toLocaleString("vi-VN")}
    </span>,
    item.segmentName ?? "—",
    item.status === 1
      ? <span className="loyalty-status loyalty-status--active">Kích hoạt</span>
      : <span className="loyalty-status loyalty-status--inactive">Không kích hoạt</span>,
    <button
      onClick={(e) => { e.stopPropagation(); setCardMember(item); setShowCard(true); }}
      style={{ padding: "4px 10px", fontSize: 11, background: "#E4F7F3", color: "#0B2E2A", border: "1px solid #00C9A7", borderRadius: 6, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
    >
      Xem thẻ
    </button>,
  ];

  return (
    <div className={`page-content page-category-service${isNoItem ? " bg-white" : ""}`}>
      <HeaderTabMenu
        title="Danh sách thành viên"
        titleBack="Khách hàng thành viên"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Khách hàng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listData && listData.length > 0 ? (
          <BoxTable
            name="danh sách hội viên"
            titles={titles}
            items={listData}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
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
                    Hiện tại chưa có ví điểm nào.
                    <br />
                    Ví điểm được tạo tự động khi khách hàng tham gia chương trình loyalty.
                  </span>
                }
                type="no-item"
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

      {/* Member Card Modal */}
      <MemberCardBarcode
        visible={showCard}
        onClose={() => setShowCard(false)}
        member={cardMember}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        visible={showImport}
        onClose={() => setShowImport(false)}
        onImport={async (rows) => {
          showToast(`Import ${rows.length} hội viên thành công (prototype)`, "success");
          setShowImport(false);
          setParams((prev) => ({ ...prev })); // refresh list
        }}
      />
    </div>
  );
}
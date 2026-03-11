import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
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

export default function LoyaltyWallet() {
  document.title = "Danh sách hội viên";

  const isMounted = useRef(false);

  const [listData, setListData] = useState<ILoyaltyWalletResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState<IRoyaltyFilterRequest>({ name: "", limit: 10 });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    { key: "all", name: "Danh sách hội viên", is_active: true },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh sách hội viên",
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

  // Ví điểm là read-only, không có thao tác thêm/sửa/xóa từ UI
  // Cột: STT | Khách hàng | Tổng điểm tích lũy | Điểm hiện tại | Hạng hội viên | Trạng thái
  const titles = ["STT", "Khách hàng", "Tổng điểm tích lũy", "Điểm hiện tại", "Hạng hội viên", "Trạng thái"];
  const dataFormat = ["text-center", "", "text-center", "text-center", "", "text-center"];
  const dataMappingArray = (item: ILoyaltyWalletResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.customerName ?? "—",
    item.totalEarn ?? 0,
    item.currentBalance ?? 0,
    item.segmentName ?? "—",
    item.status === 1 ? "Kích hoạt" : "Không kích hoạt",
  ];

  return (
    <div className={`page-content page-category-service${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1 className="title-first">Danh sách hội viên</h1>
        </div>
      </div>

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
                description={<span>Hiện tại chưa có ví điểm nào.<br />Ví điểm được tạo tự động khi khách hàng tham gia chương trình loyalty.</span>}
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
    </div>
  );
}

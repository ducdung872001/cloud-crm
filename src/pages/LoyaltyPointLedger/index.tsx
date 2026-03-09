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

export default function LoyaltyPointLedger() {
  document.title = "Nhật ký điểm thưởng";

  const isMounted = useRef(false);

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
    { key: "all", name: "Nhật ký điểm thưởng", is_active: true },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nhật ký điểm thưởng",
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

  const titleActions: ITitleActions = {
    actions: [
      { title: "Thêm mới", callback: () => { setSelectedItem(null); setShowModalAdd(true); } },
    ],
  };

  // Cột: STT | Khách hàng | Ví điểm | Số điểm | Chương trình loyalty | Đổi thưởng | Nhân viên | Ngày tạo
  const titles = ["STT", "Khách hàng", "Ví điểm", "Số điểm", "Chương trình loyalty", "Đổi thưởng", "Người phụ trách", "Ngày tạo"];
  const dataFormat = ["text-center", "", "text-center", "text-center", "", "", "", "text-center"];
  const dataMappingArray = (item: ILoyaltyPointLedgerResposne, index: number) => [
    getPageOffset(params) + index + 1,
    item.customerName ?? "—",
    item.walletId ?? "—",
    item.point ?? 0,
    item.loyaltyProgramName ?? "—",
    item.loyaltyRewardName ?? "—",
    item.employeeName ?? "—",
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY") : "—",
  ];

  const actionsTable = (item: ILoyaltyPointLedgerResposne): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => { if (!isCheckedItem) { setSelectedItem(item); setShowModalAdd(true); } },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => { if (!isCheckedItem) showDialogConfirmDelete(item); },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await LoyaltyService.deleteLoyaltyPointLedger(id);
    if (response.code === 0) {
      showToast("Xóa nhật ký điểm thưởng thành công", "success");
      fetchList(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;
    const arrPromises = selectedIds.map((id) => {
      const found = listData.find((item) => item.id === id);
      return found?.id ? LoyaltyService.deleteLoyaltyPointLedger(found.id) : Promise.resolve(null);
    });
    Promise.all(arrPromises)
      .then((results) => {
        const count = results.filter(Boolean)?.length || 0;
        if (count > 0) {
          showToast(`Xóa thành công ${count} nhật ký điểm thưởng`, "success");
          fetchList(params);
          setListIdChecked([]);
        } else {
          showToast("Không có nhật ký điểm thưởng nào được xóa", "error");
        }
      })
      .finally(() => { setShowDialog(false); setContentDialog(null); });
  };

  const showDialogConfirmDelete = (item?: ILoyaltyPointLedgerResposne) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa nhật ký điểm thưởng</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? <>nhật ký điểm của <strong>{item.customerName}</strong></> : `${listIdChecked.length} bản ghi đã chọn`}?
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => {
        if (item?.id) { onDelete(item.id); return; }
        if (listIdChecked.length > 0) { onDeleteAll(); return; }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    { title: "Xóa nhật ký điểm thưởng", callback: () => showDialogConfirmDelete() },
  ];

  return (
    <div className={`page-content page-category-service${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1 className="title-first">Nhật ký điểm thưởng</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Nhật ký điểm thưởng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listData && listData.length > 0 ? (
          <BoxTable
            name="nhật ký điểm thưởng"
            titles={titles}
            items={listData}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            isBulkAction={true}
            listIdChecked={listIdChecked}
            bulkActionItems={bulkActionList}
            striped={true}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
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
                description={<span>Hiện tại chưa có nhật ký điểm thưởng nào.<br />Hãy thêm mới bản ghi đầu tiên nhé!</span>}
                type="no-item"
                titleButton="Thêm mới nhật ký điểm thưởng"
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

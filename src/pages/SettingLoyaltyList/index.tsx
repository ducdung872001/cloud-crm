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
import AddProgramLoyaltyModal from "./partials/AddProgramLoyaltyModal";
import { IRoyaltyFilterRequest } from "@/model/loyalty/RoyaltyRequest";
import { IProgramRoyaltyResposne } from "@/model/loyalty/RoyaltyResposne";
import LoyaltyService from "@/services/LoyaltyService";
import moment from "moment";
import { ICustomerRoyaltyListProps } from "@/model/loyalty/PropsModal";

export default function SettingLoyaltyList(props: ICustomerRoyaltyListProps) {
  document.title = "Quản lý chương trình khách hàng thân thiết";

  const { onBackProps } = props;
  const isMounted = useRef(false);

  const [listData, setListData] = useState<IProgramRoyaltyResposne[]>([]);
  const [selectedItem, setSelectedItem] = useState<IProgramRoyaltyResposne>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState<IRoyaltyFilterRequest>({ name: "", limit: 10 });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    { key: "all", name: "Chương trình khách hàng thân thiết", is_active: true },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Chương trình khách hàng thân thiết",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  const abortController = new AbortController();

  const fetchList = async (paramsSearch: IRoyaltyFilterRequest) => {
    setIsLoading(true);
    const response = await LoyaltyService.list(paramsSearch, abortController.signal);
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

  useEffect(() => {
    setParams((prev) => ({ ...prev }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    fetchList(params);
    return () => { abortController.abort(); };
  }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => { setSelectedItem(null); setShowModalAdd(true); },
      },
    ],
  };

  // Cột: STT | Tên chương trình | Người phụ trách | Ngày bắt đầu | Ngày kết thúc | Trạng thái
  const titles = ["STT", "Tên chương trình khách hàng thân thiết", "Mã quy trình", "Người phụ trách", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái"];
  const dataFormat = ["text-center", "","", "", "text-center", "text-center", "text-center"];
  const dataMappingArray = (item: IProgramRoyaltyResposne, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.processCode,
    item.employeeName ?? "—",
    item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : "—",
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "—",
    item.active ? "Kích hoạt" : "Không kích hoạt",
  ];

  const actionsTable = (item: IProgramRoyaltyResposne): IAction[] => {
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
    const response = await LoyaltyService.delete(id);
    if (response.code === 0) {
      showToast("Xóa chương trình khách hàng thân thiết thành công", "success");
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
      return found?.id ? LoyaltyService.delete(found.id) : Promise.resolve(null);
    });
    Promise.all(arrPromises)
      .then((results) => {
        const count = results.filter(Boolean)?.length || 0;
        if (count > 0) {
          showToast(`Xóa thành công ${count} chương trình`, "success");
          fetchList(params);
          setListIdChecked([]);
        } else {
          showToast("Không có chương trình nào được xóa", "error");
        }
      })
      .finally(() => { setShowDialog(false); setContentDialog(null); });
  };

  const showDialogConfirmDelete = (item?: IProgramRoyaltyResposne) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa chương trình</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? <><strong>{item.name}</strong></> : `${listIdChecked.length} chương trình đã chọn`}?
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
    { title: "Xóa chương trình", callback: () => showDialogConfirmDelete() },
  ];

  return (
    <div className={`page-content page-category-service${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          > 
           Cài đặt hệ thống tích điểm
            </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Cài đặt chương trình khách hàng thân thiết</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên chương trình khách hàng thân thiết"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listData && listData.length > 0 ? (
          <BoxTable
            name="chương trình khách hàng thân thiết"
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
                description={<span>Hiện tại chưa có chương trình khách hàng thân thiết nào.<br />Hãy thêm mới chương trình khách hàng thân thiết đầu tiên nhé!</span>}
                type="no-item"
                titleButton="Thêm mới chương trình khách hàng thân thiết"
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
      <AddProgramLoyaltyModal
        onShow={showModalAdd}
        data={selectedItem}
        onHide={(reload) => { if (reload) fetchList(params); setShowModalAdd(false); }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

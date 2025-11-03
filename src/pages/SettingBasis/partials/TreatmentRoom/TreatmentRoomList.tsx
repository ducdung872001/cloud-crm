import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _ from "lodash";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import { ITreatmentRoomListProps } from "model/treatmentRoom/PropsModal";
import { useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { ITreatmentRoomFilterRequest } from "model/treatmentRoom/TreatmentRoomRequestModal";
import { ITreatmentRoomResponseModal } from "model/treatmentRoom/TreatmentRoomResponseModal";
import { showToast } from "utils/common";
import TreatmentRoomService from "services/TreatmentRoomService";
import AddTreatmentRoomModal from "./partials/AddTreatmentRoomModal";
import "./TreatmentRoomList.scss";
import { ContextType, UserContext } from "contexts/userContext";

export default function TreatmentRoomList(props: ITreatmentRoomListProps) {
  document.title = "Danh sách phòng điều trị";

  const { onBackProps } = props;

  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [listTreatmentRoom, setListTreatmentRoom] = useState<ITreatmentRoomResponseModal[]>([]);
  const [dataTreatmentRoom, setDataTreatmentRoom] = useState<ITreatmentRoomResponseModal>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState<ITreatmentRoomFilterRequest>({
    name: "",
    page: 1,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách phòng điều trị",
      is_active: true,
    },
  ]);

  useEffect(() => {
    if (dataBranch) {
      setParams({ ...params, branchId: dataBranch.value });
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Phòng điều trị",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      // {
      //   key: "branchId",
      //   name: "Chi nhánh",
      //   type: "select",
      //   is_featured: true,
      //   value: searchParams.get("branchId") ?? "",
      // },
    ],
    [searchParams]
  );

  const abortController = new AbortController();

  const getListTreatmentRoom = async (paramsSearch: ITreatmentRoomFilterRequest) => {
    setIsLoading(true);

    const response = await TreatmentRoomService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListTreatmentRoom(result);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && !params?.name && +result.page === 1) {
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
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListTreatmentRoom(params);

      const paramsTemp = _.cloneDeep(params);

      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }

      Object.keys(paramsTemp).map((key) => {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });

      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }

        Object.keys(paramsTemp).map((key) => {
          paramsTemp[key] === "" ? delete paramsTemp[key] : null;
        });

        // if (isDifferenceObj(searchParams, paramsTemp)) {
        //   if (paramsTemp.page === 1) {
        //     delete paramsTemp["page"];
        //   }
        //   setSearchParams(paramsTemp as Record<string, string | string[]>);
        // }
      }
    }

    return () => {
      abortController.abort();
    };
  }, [params]);

  const titles = ["STT", "Tên phòng", "Số giường", "Nhân viên", "Chi nhánh"];

  const dataFormat = ["text-center", "", "text-right", "", ""];

  const dataMappingArray = (item: ITreatmentRoomResponseModal, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.bedNum,
    item.employeeName,
    item.branchName,
  ];

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          setDataTreatmentRoom(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const actionsTable = (item: ITreatmentRoomResponseModal): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataTreatmentRoom(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await TreatmentRoomService.delete(id);

    if (response.code === 0) {
      showToast("Xóa phòng điều trị thành công", "success");
      getListTreatmentRoom(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ITreatmentRoomResponseModal) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "phòng điều trị " : `${listIdChecked.length} phòng điều trị đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa phòng điều trị",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-treatmentroom${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt cơ sở
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách phòng điều trị</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên phòng điều trị"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listTreatmentRoom && listTreatmentRoom.length > 0 ? (
          <BoxTable
            name="Phòng điều trị"
            titles={titles}
            items={listTreatmentRoom}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            isBulkAction={true}
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
                description={
                  <span>
                    Hiện tại chưa có phòng điều trị nào. <br />
                    Hãy thêm mới phòng điều trị đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới phòng điều trị"
                action={() => {
                  setDataTreatmentRoom(null);
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
      <AddTreatmentRoomModal
        onShow={showModalAdd}
        data={dataTreatmentRoom}
        onHide={(reload) => {
          if (reload) {
            getListTreatmentRoom(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

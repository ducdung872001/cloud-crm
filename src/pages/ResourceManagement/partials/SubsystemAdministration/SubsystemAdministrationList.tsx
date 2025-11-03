import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
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
import { IAction, ISaveSearch, IFilterItem } from "model/OtherModel";
import { ISubsystemAdministrationListProps } from "model/subsystemAdministration/PropsModel";
import { ISubsystemAdministrationFilterRequest } from "model/subsystemAdministration/SubsystemAdministrationRequest";
import { ISubsystemAdministrationResponse } from "model/subsystemAdministration/SubsystemAdministrationResponse";
import SubsystemAdministrationService from "services/SubsystemAdministrationService";
import { showToast } from "utils/common";
import ShowModalSubsystem from "./partials/ShowModalSubsystem";
import AddSubsystemAdministrationModal from "./partials/AddSubsystemAdministrationModal";
import { useSearchParams } from "react-router-dom";
import { getPageOffset } from 'reborn-util';

import "./SubsystemAdministrationList.scss";

export default function SubsystemAdministrationList(props: ISubsystemAdministrationListProps) {
  document.title = "Quản trị phân hệ";

  const { onBackProps } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  const isMounted = useRef(false);

  const [listSubsystemAdministration, setListSubsystemAdministration] = useState<ISubsystemAdministrationResponse[]>([]);
  const [dataSubsystemAdministration, setDataSubsystemAdministration] = useState<ISubsystemAdministrationResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [takePosition, setTakePosition] = useState<any>({
    index: null,
    moduleId: null,
    lstIdModule: [],
  });
  const [currentPosition, setCurrentPosition] = useState<number>(null);
  const [showModalSubsystem, setShowModalSubsystem] = useState<boolean>(false);
  const [params, setParams] = useState<ISubsystemAdministrationFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách phân hệ",
      is_active: true,
    },
  ]);

  const moduleFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "app",
        name: "Ứng dụng",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "crm",
            label: "CRM",
          },
          {
            value: "cms",
            label: "CMS",
          },
          {
            value: "market",
            label: "MARKET",
          },
          {
            value: "community",
            label: "COMMUNITY",
          },
        ],
        value: searchParams.get("app") ?? "",
      }
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Phân hệ",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListSubsystemAdministration = async (paramsSearch: ISubsystemAdministrationFilterRequest) => {
    setIsLoading(true);

    const response = await SubsystemAdministrationService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListSubsystemAdministration(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +params.page === 1) {
        setIsNoItem(true);
      }
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
      getListSubsystemAdministration(params);
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

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          setDataSubsystemAdministration(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Ứng dụng", "Tên phân hệ", "Phân hệ cha", "Thứ tự", "Chức năng"];

  const dataFormat = ["text-center", "", "", "", "text-center", "text-center"];

  const dataMappingArray = (item: ISubsystemAdministrationResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.app,
    item.name,
    item.parentName,
    item.position,
    <a
      key={item.id}
      onClick={() => {
        console.log('moduleId =>', item.id);

        setDataSubsystemAdministration(item);
        setShowModalSubsystem(true);                
        setCurrentPosition(item.id);
        setTakePosition({
          index: index,
          moduleId: item.id,
          lstIdModule: listSubsystemAdministration.map((item) => item.id),
        });
      }}
    >
      Xem thêm
    </a>,
  ];

  console.log(dataSubsystemAdministration);

  const actionsTable = (item: ISubsystemAdministrationResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataSubsystemAdministration(item);
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
    const response = await SubsystemAdministrationService.delete(id);

    if (response.code === 0) {
      showToast("Xóa phân hệ thành công", "success");
      getListSubsystemAdministration(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ISubsystemAdministrationResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "phân hệ " : `${listIdChecked.length} phân hệ đã chọn`}
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
      title: "Xóa phân hệ",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-subsystem-administration${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Quản trị tài nguyên
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Quản trị phân hệ</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên phân hệ"
          params={params}
          isFilter={true}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          listFilterItem={moduleFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listSubsystemAdministration && listSubsystemAdministration.length > 0 ? (
          <BoxTable
            name="Phân hệ"
            titles={titles}
            items={listSubsystemAdministration}
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
            {!isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có phân hệ nào. <br />
                    Hãy thêm mới phân hệ đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới phân hệ"
                action={() => {
                  setDataSubsystemAdministration(null);
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
      <ShowModalSubsystem
        onShow={showModalSubsystem}
        currentPosition={currentPosition}
        takePosition={takePosition}
        setTakePosition={setTakePosition}
        data={dataSubsystemAdministration}
        onHide={(reload) => {
          if (reload) {
            // gọi lại api
          }
          setShowModalSubsystem(false);
        }}
      />
      <AddSubsystemAdministrationModal
        onShow={showModalAdd}
        data={dataSubsystemAdministration}
        onHide={(reload) => {
          if (reload) {
            getListSubsystemAdministration(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

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
import { getPageOffset } from "reborn-util";
import { getPermissions } from "utils/common";
import "./ListWork.scss";
import WorkOrderService from "services/WorkOrderService";
import Button from "components/button/button";
import HandleTask from "pages/MiddleWork/partials/ListWork/partials/HandleTask/HandleTask";

export default function ListWork(props: any) {
  document.title = "Danh sách công việc";

  const { data } = props;

  const isMounted = useRef(false);

  const [listWork, setListWork] = useState([]);
  const [dataWork, setDataWork] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [isHandleTask, setIsHandleTask] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    if (data) {
      setParams((preState) => ({
        ...preState,
        potId: data.potId,
        processId: data.processId,
        // processId: 20
      }));
      setIsHandleTask(false);
    }
  }, [data]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách biểu mẫu",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "công việc",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListWork = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await WorkOrderService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListWork(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +result.page === 1) {
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
      getListWork(params);
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
          // setDataContractEform(null);
          // setShowModalAddEform(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên công việc", "Người xử lý", "Quy trình"];

  const dataFormat = ["text-center", "", "", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.employeeName,
    item.processName || item.nodeName,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      ...(item?.contextData
        ? [
            {
              title: "Xử lý nhiệm vụ",
              icon: <Icon name="CollectInfo" />,
              callback: () => {
                // navigation("/handle_task");
                setDataWork(item);
                setIsHandleTask(true);
              },
            },
          ]
        : []),
      // {
      //     title: "Xem biểu mẫu",
      //     icon: <Icon name="Eye" />,
      //     callback: () => {
      //         setDataContractEform(item);
      //         setIsPreviewEform(true);
      //     },
      // },

      // {
      //     title: "Cài đặt biểu mẫu",
      //     icon: <Icon name="Settings" />,
      //     callback: () => {
      //         setDataContractEform(item);
      //         setIsSettingEform(true);
      //     },
      // },
      // {
      //     title: "Sửa",
      //     icon: <Icon name="Pencil" />,
      //     callback: () => {
      //         setDataContractEform(item);
      //         setShowModalAddEform(true);
      //     },
      // },
      // {
      //     title: "Xóa",
      //     icon: <Icon name="Trash" className="icon-error" />,
      //     callback: () => {
      //         showDialogConfirmDelete(item);
      //     },
      // },
    ].filter((action) => action);
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "biểu mẫu" : `${listIdChecked.length} biểu mẫu đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {},
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    // {
    //   title: "Xóa biểu mẫu",
    //   callback: () => showDialogConfirmDelete(),
    // },
  ];

  return (
    <div className={`page-content page-list-work-process${isNoItem ? " bg-white" : ""}`}>
      <div className={`${isHandleTask ? "d-none" : "card-box d-flex flex-column"}`}>
        {/* <SearchBox
                name="Tên biểu mẫu"
                params={params}
                isSaveSearch={true}
                listSaveSearch={listSaveSearch}
                updateParams={(paramsNew) => setParams(paramsNew)}
            /> */}
        {!isLoading && listWork && listWork.length > 0 ? (
          <BoxTable
            name="Công việc"
            titles={titles}
            items={listWork}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            isBulkAction={false}
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
                    Hiện tại chưa có công việc nào. <br />
                  </span>
                }
                type="no-item"
                titleButton=""
                action={() => {
                  // setDataContractEform(null);
                  // setShowModalAddEform(true);
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

      <div className={isHandleTask ? "" : "d-none"}>
        <div className="container-button">
          <div
            className="button-back"
            onClick={() => {
              setIsHandleTask(false);
            }}
          >
            <Icon name="ChevronLeft" style={{ width: 19, fill: "white", marginRight: 7 }} />
            <span style={{ fontSize: 14, fontWeight: "500", color: "white" }}>Quay lại danh sách</span>
          </div>
        </div>
        <div className="container-form">
          <HandleTask onShow={isHandleTask} dataWork={dataWork} />
        </div>
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

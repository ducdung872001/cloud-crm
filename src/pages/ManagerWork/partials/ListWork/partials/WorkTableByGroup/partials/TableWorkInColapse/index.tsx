import React, { Fragment, useEffect, useRef, useState } from "react";
import { ITableWorkInColapsedProps } from "model/workOrder/PropsModel";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IWorkOrderFilterRequest } from "model/workOrder/WorkOrderRequestModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import { isDifferenceObj } from "reborn-util";
import WorkOrderService from "services/WorkOrderService";
import { showToast } from "utils/common";
import { IAction } from "model/OtherModel";
import Icon from "components/icon";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import moment from "moment";
import StatusTask from "../StatusTask";

export default function TableWorkInColapse(props: ITableWorkInColapsedProps) {
  const { paramsFilter, isOpen, setIdWork, setShowModalAdd, onReload, setShowModalAssign, setShowModalDetail, onReopen } = props;

  const isMounted = useRef(false);

  const currentParamsFilter = useRef(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [params, setParams] = useState<IWorkOrderFilterRequest>({
    name: "",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [listWork, setListWork] = useState<IWorkOrderResponseModel[]>([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });

    setParams((prevParams) => {
      const next: any = {
        ...prevParams,
        ...paramsTemp,
        [paramsFilter.groupBy]: paramsFilter.groupValue,
        projectId: paramsFilter.projectId,
        total: paramsFilter.total,
      };
      if (paramsFilter.assignedId != null) next.assignedId = paramsFilter.assignedId;
      else delete next.assignedId;

      return next;
    });
  }, [paramsFilter]);

  const abortControllerChild = new AbortController();

  const reopenLockRef = useRef(false);
  const prevLimitRef = useRef<number | undefined>(undefined);
  const isReopeningRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const currLimit = params?.limit ?? 10;
    const prevLimit = prevLimitRef.current;

    if (prevLimit === undefined) {
      prevLimitRef.current = currLimit;
      return;
    }

    if (currLimit !== prevLimit) {
      prevLimitRef.current = currLimit;

      if (currLimit > 10 && !reopenLockRef.current) {
        reopenLockRef.current = true;
        isReopeningRef.current = true;

        onReopen?.();

        setTimeout(() => {
          reopenLockRef.current = false;
          isReopeningRef.current = false;
          if (isOpen) {
            getListWork(params, true);
          }
        }, 650);
      }
    }
  }, [params?.limit, isOpen, onReopen]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!isOpen) return;

    if (isReopeningRef.current) return;

    getListWork(params, true);
  }, [params, isOpen]);


  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Công việc",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListWork = async (paramsSearch: IWorkOrderFilterRequest, isReload?: boolean) => {
    if (currentParamsFilter.current && !isDifferenceObj(currentParamsFilter.current, paramsSearch) && !isReload) {
      return;
    }
    setIsLoading(true);
    const response = await WorkOrderService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;

      setListWork(result.items);
      // handleDetailWork(null, result.items?.length);
      const limit = paramsSearch.limit ?? DataPaginationDefault.sizeLimit;

      setPagination((prev) => ({
        ...prev,
        page: +result.page,
        sizeLimit: limit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +limit),
      }));
      if (+result.total === 0 && !params?.name && +result.page === 1) {
        setIsNoItem(true);
      }
      currentParamsFilter.current = _.cloneDeep(paramsSearch);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const titles = [
    // "STT",
    "Tên công việc",
    "Người thực hiện",
    "Thời gian",
    //  "Thuộc dự án",
    // "Tiến độ",
    "Trạng thái công việc",
  ];

  const dataFormat = [
    "text-left",
    "",
    "text-center",
    // "text-center",
    "text-center",
    "text-center",
    "text-center",
  ];

  const dataMappingArray = (item: IWorkOrderResponseModel, index: number, type?: string) => [
    // getPageOffset(params) + index + 1,
    <a
      onClick={() => {
        setIdWork(item?.id);
        setShowModalDetail(true);
      }}
    >
      {item?.name || ""}
    </a>,
    item?.employeeName ? (
      <span
        onClick={() => {
          setShowModalAssign(true);
          setIdWork(item.id);
        }}
      >
        {item?.employeeName}
      </span>
    ) : (
      <a
        onClick={() => {
          setShowModalAssign(true);
          setIdWork(item.id);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <Icon name="UserPlus" className="icon-assign-work" /> Giao việc
      </a>
    ),

    item.startTime || item.endTime ? `${moment(item.startTime).format("DD/MM/YYYY")} - ${moment(item.endTime).format("DD/MM/YYYY")}` : "",
    // <div
    //   key={item.id}
    //   className="percent__finish--work"
    // >
    //   <CircularProgressbar value={item.percent || 0} text={`${item.percent || 0}%`} className="value-percent" />
    // </div>,
    <StatusTask {...item} />,
  ];

  const actionsTable = (item: IWorkOrderResponseModel): IAction[] => {
    return [
      // {
      //   title: "Xem chi tiết",
      //   icon: <Icon name="Eye" />,
      //   callback: () => {
      //     setIdWork(item?.id);
      //     setShowModalDetail(true);
      //   },
      // },

      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setIdWork(item?.id);
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
    const response = await WorkOrderService.delete(id);

    if (response.code === 0) {
      showToast("Xóa công việc thành công", "success");
      reLoadListGroupWork(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllWork = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        WorkOrderService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa công việc thành công", "success");
        reLoadListGroupWork(true);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IWorkOrderResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "công việc " : `${listIdChecked.length} công việc đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (listIdChecked.length > 0) {
          onDeleteAllWork();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa công việc",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const reLoadListGroupWork = (isReload?: boolean) => {
    // getListWork(params, isReload);
    onReload(isReload);
  };

  return (
    <Fragment>
      {/* <SearchBox
        key={customerFilterList.length}
        name="Tên công việc"
        params={params}
        isFilter={true}
        isSaveSearch={true}
        listSaveSearch={listSaveSearch}
        listFilterItem={customerFilterList}
        updateParams={(paramsNew) => setParams(paramsNew)}
      /> */}
      {!isLoading && listWork && listWork.length > 0 ? (
        <BoxTable
          className="table-work-in-colapse"
          name="Công việc"
          titles={titles}
          items={listWork}
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
          {isNoItem ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100px",
                fontSize: "18px",
                color: "#555",
              }}
            >
              <span>
                Hiện tại chưa có công việc nào. <br />
              </span>
            </div>
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
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

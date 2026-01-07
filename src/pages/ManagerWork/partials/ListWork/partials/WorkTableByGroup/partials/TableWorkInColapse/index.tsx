import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { ITableWorkInColapsedProps, ITableWorkOrderProps } from "model/workOrder/PropsModel";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IWorkOrderFilterRequest } from "model/workOrder/WorkOrderRequestModel";
import { CircularProgressbar } from "react-circular-progressbar";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import WorkOrderService from "services/WorkOrderService";
import { showToast } from "utils/common";
import { IAction } from "model/OtherModel";
import Icon from "components/icon";
import { ContextType, UserContext } from "contexts/userContext";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import moment from "moment";

export default function TableWorkInColapse(props: ITableWorkInColapsedProps) {
  const { paramsFilter, isOpen, setIdWork, setShowModalAdd, onReload, setShowModalAssign, setShowModalDetail } = props;
  const { dataInfoEmployee } = useContext(UserContext) as ContextType;

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
    setParams((prevParams) => ({
      ...prevParams,
      ...paramsTemp,
      ...{ [paramsFilter.groupBy]: paramsFilter.groupValue, projectId: paramsFilter.projectId, total: paramsFilter.total },
    }));
  }, [paramsFilter]);

  const abortControllerChild = new AbortController();

  useEffect(() => {
    if (paramsFilter.groupValue == 0) {
      console.log("params changed", params);
    }

    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      if (isOpen) {
        getListWork(params);
      }
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
      }
    }
    // return () => {
    //   abortControllerChild.abort();
    // };
  }, [params]);

  console.log("params isOpen", isOpen);

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
    "Tiến độ",
    "Trạng thái công việc",
  ];

  const dataFormat = ["text-left", "", "text-center", "text-center", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: IWorkOrderResponseModel, index: number, type?: string) => [
    // getPageOffset(params) + index + 1,
    <div>{item?.name || ""}</div>,

    <a
      onClick={() => {
        setShowModalAssign(true);
        setIdWork(item.id);
      }}
    >
      {item?.employeeName ?? "Giao việc"}
    </a>,
    item.startTime || item.endTime ? `${moment(item.startTime).format("DD/MM/YYYY")} - ${moment(item.endTime).format("DD/MM/YYYY")}` : "",
    // item.projectName,
    <div
      key={item.id}
      className="percent__finish--work"
      onClick={() => {
        if (item.percent !== 100 && item.status !== 0 && item.status !== 2 && item.status !== 3 && item.status !== 4) {
          // setShowModalWorkInprogress(true);
          // setIdWork(item.id);
        } else if (item.status == 2 || item.status == 3 || item.status == 4) {
          // setIdWork(item.id);
          // setShowModalViewWorkInprogress(true);
        } else {
          showToast("Công việc đang trong trạng thái chưa được thực hiện", "warning");
        }
      }}
    >
      <CircularProgressbar value={item.percent || 0} text={`${item.percent || 0}%`} className="value-percent" />
    </div>,
    item.status == 0 ? (
      handleUnfulfilled(item.startTime)
    ) : item.status == 1 ? (
      handleProcessing(item.startTime, item.endTime)
    ) : item.status == 2 ? (
      <span className="status-success">Đã hoàn thành</span>
    ) : item.status == 3 ? (
      <span className="status-cancelled">Đã hủy</span>
    ) : (
      <span className="status-pause">Tạm dừng</span>
    ),
  ];
  //! đoạn này xử lý vấn đề hiển thị thông tin xem bao giờ thực hiện
  const handleUnfulfilled = (time) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(time).getTime();

    if (currentTime < startTime) {
      if ((startTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((startTime - currentTime) / (60 * 60 * 1000) >= 1) {
        return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 1000))} phút`}</span>;
      }
    } else {
      if ((currentTime - startTime) / (24 * 60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 ngày thì trả về ngày, không thì trả về giờ
        return <span className="status-cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - startTime) / (60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 giờ thì trả về giờ, không thì trả về phút
        return <span className="status-cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return <span className="status-cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 1000))} phút`}</span>;
      }
    }
  };

  const handleProcessing = (start, end) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const calculatorTime = (endTime - startTime) / 3;

    if (startTime > currentTime) {
      return <span className="status-processing">Đang thực hiện</span>;
    } else if (currentTime >= startTime && currentTime <= endTime) {
      if (endTime - currentTime >= calculatorTime) {
        return <span className="status-processing">Đang thực hiện</span>;
      } else {
        if ((endTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
          return <span className="status-processing--waring">{`Còn ${Math.round((endTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
        } else if ((endTime - currentTime) / (60 * 60 * 1000) >= 1) {
          return <span className="status-processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
        } else {
          return <span className="status-processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 1000))} phút`}</span>;
        }
      }
    } else {
      if ((currentTime - endTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="status-cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - endTime) / (60 * 60 * 1000) >= 1) {
        return <span className="status-cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return (
          <span className="status-cancelled">{`Quá hạn ${
            Math.round((currentTime - endTime) / (60 * 1000)) === 0 ? 1 : Math.round((currentTime - endTime) / (60 * 1000))
          } phút`}</span>
        );
      }
    }
  };

  const actionsTable = (item: IWorkOrderResponseModel): IAction[] => {
    return [
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" />,
        callback: () => {
          setIdWork(item?.id);
          setShowModalDetail(true);
        },
      },

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

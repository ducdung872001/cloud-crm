import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import CustomerSourceService from "services/CustomerSourceService";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";

import "./ProcessSimulation.scss";
import BusinessProcessService from "services/BusinessProcessService";
import moment from "moment";
import Badge from "components/badge/badge";
import { color } from "highcharts";
import { LogErrorTableModal } from "./LogErrorTableModal";

export default function ProcessSimulation(props: any) {
  document.title = "Mô phỏng quy trình";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listData, setListData] = useState([]);
  const [processDetail, setProcessDetail] = useState({});
  const [data, setData] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState<any>({
    keyword: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Mô phỏng quy trình",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "quy trình",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const abortController = new AbortController();

  const getListProcess = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await BusinessProcessService.listBpmTrigger(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListData(result.items);

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

  const handleOpenLogErrorModal = (item: any) => {
    setIsOpen(true);
    setProcessDetail({
      nodeId: item.toNodeId,
      processId: item.processId,
      potId: item.potId,
    });
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
      getListProcess(params);
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
        title: "Làm mới",
        callback: () => {
          getListProcess(params);
        },
      },
    ],
  };

  const titles = ["STT", "ID", "From Node", "To Node", "Pot ID", "Created Time", "Trạng thái", "Process ID"];

  const dataFormat = ["text-center", "", "", "", "", "", "text-center", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.id,
    item.fromNodeId,
    item.toNodeId,
    item.potId,
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY") : "",
    <Badge
      key={index}
      variant={
        item.status === 0
          ? "secondary"
          : item.status === 1
          ? "primary"
          : item.status === 2
          ? "success"
          : item.status === 4 || item.status === 5
          ? "error"
          : "warning"
      }
      text={
        item.status === 0
          ? "Chờ xử lý"
          : item.status === 1
          ? "Chưa hoàn thành"
          : item.status === 2
          ? "Đã xong"
          : item.status === 4 || item.status === 5
          ? "Luồng lỗi"
          : "Tạm dừng luồng"
      }
      className={`${item.status === 4 || item.status === 5 ? "base-badge--clickable" : ""}`.trim()}
      onClick={item.status === 4 ? () => handleOpenLogErrorModal(item) : item.status === 5 ? () => showToast(item.messageError, "error") : undefined}
    />,
    item.processId,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Thực thi",
        icon: <Icon name="Play" />,
        callback: () => {
          //   setData(item);
          showDialogConfirmActive(item);
        },
      },
      // permissions["CUSTOMER_SOURCE_UPDATE"] == 1 && {
      //   title: "Sửa",
      //   icon: <Icon name="Pencil" />,
      //   callback: () => {
      //     setDataCustomerSource(item);
      //     setShowModalAdd(true);
      //   },
      // },
      // permissions["CUSTOMER_SOURCE_DELETE"] == 1 && {
      //   title: "Xóa",
      //   icon: <Icon name="Trash" className="icon-error" />,
      //   callback: () => {
      //     showDialogConfirmDelete(item);
      //   },
      // },
    ].filter((action) => action);
  };

  const onActive = async (id: number) => {
    const response = await BusinessProcessService.activeBpmTrigger(id);
    if (response.code === 0) {
      showToast("Thực thi thành công", "success");
      getListProcess(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmActive = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Thực thi...</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn chạy quy trình id = {item ? <strong>{item.id}</strong> : ""}?</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Thực thi",
      defaultAction: () => onActive(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const onDelete = async (id: number) => {
    const response = await CustomerSourceService.delete(id);

    if (response.code === 0) {
      showToast("Xóa quy trình thành công", "success");
      getListProcess(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  //   const showDialogConfirmDelete = (item?: any) => {
  //     const contentDialog: IContentDialog = {
  //       color: "error",
  //       className: "dialog-delete",
  //       isCentered: true,
  //       isLoading: true,
  //       title: <Fragment>Xóa...</Fragment>,
  //       message: (
  //         <Fragment>
  //           Bạn có chắc chắn muốn xóa {item ? "quy trình " : `${listIdChecked.length} quy trình đã chọn`}
  //           {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
  //         </Fragment>
  //       ),
  //       cancelText: "Hủy",
  //       cancelAction: () => {
  //         setShowDialog(false);
  //         setContentDialog(null);
  //       },
  //       defaultText: "Xóa",
  //       defaultAction: () => onDelete(item.id),
  //     };
  //     setContentDialog(contentDialog);
  //     setShowDialog(true);
  //   };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa quy trình",
      callback: () => {},
    },
  ];

  return (
    <Fragment>
      <div className={`page-content page-process-simulation${isNoItem ? " bg-white" : ""}`}>
        <TitleAction title="Mô phỏng quy trình" titleActions={titleActions} />

        <div className="card-box d-flex flex-column">
          <SearchBox
            name="theo Form Node/To Node/Pot ID"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listData && listData.length > 0 ? (
            <BoxTable
              name="Mô phỏng quy trình"
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
                  description={
                    <span>
                      Hiện tại chưa có quy trình nào. <br />
                    </span>
                  }
                  type="no-item"
                  titleButton=""
                  action={() => {
                    //   setListCustomerSource(null);
                    //   setShowModalAdd(true);
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
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>

      <LogErrorTableModal isOpen={isOpen} setIsOpen={setIsOpen} processDetail={processDetail} />
    </Fragment>
  );
}

import React, { Fragment, useEffect, useRef, useState } from "react";
import moment from "moment";
import Icon from "components/icon";
import { getPermissions, showToast } from "utils/common";
import "./index.scss";
import { IAction, IOption, ISaveSearch } from "model/OtherModel";
import { convertToId, getPageOffset } from "reborn-util";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import BusinessProcessService from "services/BusinessProcessService";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { ITitleActions } from "components/titleAction/titleAction";
import _ from "lodash";
import { IContractPipelineResponse } from "model/contractPipeline/ContractPipelineResponseModel";
import { IContentDialog } from "components/dialog/dialog";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Badge from "components/badge/badge";
import ModalTime from "./ModalTime/ModalTime";

export default function HistoryOfKanban(props) {
  const { dataObject, onReload } = props;

  document.title = "Danh mục loại đối tượng";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listObject, setListOject] = useState([]);
  const [data, setData] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAddOjectGroup, setShowModalAddOjectGroup] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalTime, setShowModalTime] = useState(false);

  const [params, setParams] = useState({
    name: "",
    limit: 10,
    page: 1,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục loại đối tượng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "loại đối tượng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListOjectGroup = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await BusinessProcessService.processedObjectLogPage(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListOject(result?.items);

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
    if (dataObject?.potId) {
      setParams((preState) => ({ ...preState, potId: dataObject.potId }));
    }
  }, [dataObject]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListOjectGroup(params);
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
      // {
      //   title: "Thêm mới",
      //   callback: () => {
      //     setDataObjectGroup(null);
      //     setShowModalAddOjectGroup(true);
      //   },
      // },
    ],
  };

  const titles = ["STT", "Bước xử lý", "Người xử lý", "Thời gian xử lý", "Trạng thái xử lý", "Hành động"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.nodeName || item.processName,
    item.employeeName,
    item.processedTime ? (
      <div
        className="process-time"
        onClick={() => {
          setData(item);
          setShowModalTime(true);
        }}
      >
        <span className="text-time">{moment(item.processedTime).format("DD/MM/YYYY HH:mm")}</span>
      </div>
    ) : (
      ""
    ),
    <Badge
      key={index}
      variant={
        item.status === 0 ? "secondary" : item.status === 1 ? "primary" : item.status === 2 ? "success" : item.status === -1 ? "error" : "warning"
      }
      text={item.status === 0 ? "Chưa xử lý" : item.status === 1 ? "Đang xử lý" : item.status === 2 ? "Hoàn thành" : "Tạm dừng"} // 0 - chưa xử lý, 1-đang xử lý, 2-Hoàn thành, 3-tạm dừng, -1-tạm dừng (lỗi)
    />,
    <a key={item.id} onClick={(e) => {}}>
      Xem
    </a>,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      // {
      //   title: "Cài đặt trường",
      //   icon: <Icon name="Settings" />,
      //   callback: () => {
      //     setDataObject(item);
      //     setShowModalSetting(true);
      //   },
      // },
      // {
      //   title: "Sửa",
      //   icon: <Icon name="Pencil" />,
      //   callback: () => {
      //     setDataObject(item);
      //     setShowModalAddOjectGroup(true);
      //   },
      // },
      // {
      //   title: "Xóa",
      //   icon: <Icon name="Trash" className="icon-error" />,
      //   callback: () => {
      //     showDialogConfirmDelete(item);
      //   },
      // },
    ].filter((action) => action);
  };

  // const onDelete = async (id: number) => {
  //   const response = await ObjectGroupService.delete(id);

  //   if (response.code === 0) {
  //     showToast("Xóa loại đối tượng thành công", "success");
  //     getListOjectGroup(params);
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }
  //   setShowDialog(false);
  //   setContentDialog(null);
  // };

  const showDialogConfirmDelete = (item?: IContractPipelineResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "loại đối tượng " : `${listIdChecked.length} loại đối tượng đã chọn`}
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
        // onDelete(item.id)
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa loại đối tượng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="signed__history--process">
      <div className="card-box d-flex flex-column">
        {/* <SearchBox
          name="Tên loại đối tượng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        /> */}
        {!isLoading && listObject && listObject.length > 0 ? (
          <BoxTable
            name=""
            titles={titles}
            items={listObject}
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
                    Hiện tại chưa có dữ liệu. <br />
                  </span>
                }
                type="no-item"
                titleButton=""
                action={() => {
                  // setDataObjectGroup(null);
                  // setShowModalAddOjectGroup(true);
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

      <ModalTime
        onShow={showModalTime}
        data={data}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setShowModalTime(false);
          setData(null);
        }}
      />
    </div>
  );
}

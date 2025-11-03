import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IDiarySurgeryFilterRequest } from "model/diarySurgery/DiarySurgeryRequestModel";
import { IDiarySurgeryResponseModel } from "model/diarySurgery/DiarySurgeryResponseModel";
import DiarySurgeryService from "services/DiarySurgeryService";
import { showToast } from "utils/common";
import AddDiarySurgeryModal from "./partials/AddDiarySurgeryModal";
import { getPageOffset } from 'reborn-util';

export default function DiarySurgeryList() {
  document.title = "Nhật ký điều trị";

  const isMounted = useRef(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [listDiarySurgery, setListDiarySurgery] = useState<IDiarySurgeryResponseModel[]>([]);
  const [dataDiarySurgery, setDataDiarySurgery] = useState<IDiarySurgeryResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [params, setParams] = useState<IDiarySurgeryFilterRequest>({
    name: "",
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách Nhật ký điều trị",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nhật ký điều trị",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListDiarySurgery = async (paramsSearch: IDiarySurgeryFilterRequest) => {
    setIsLoading(true);

    const response = await DiarySurgeryService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListDiarySurgery(result.items);
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
      getListDiarySurgery(params);
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
          setDataDiarySurgery(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Dịch vụ", "Nhân viên", "Khách hàng", "Thời gian", "Ghi chú"];

  const dataFormat = ["text-center", "", "", "", "text-center", ""];

  const dataMappingArray = (item: IDiarySurgeryResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.serviceName,
    item.employeeName,
    item.customerName,
    `${moment(item.treatmentStart).format("DD/MM/YYYY HH:mm")} - ${moment(item.treatmentEnd).format("DD/MM/YYYY HH:mm")}`,
    item.note,
  ];

  const actionsTable = (item: IDiarySurgeryResponseModel): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataDiarySurgery(item);
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
    const response = await DiarySurgeryService.delete(id);
    if (response.code === 0) {
      showToast("Xóa Nhật ký điều trị thành công", "success");
      getListDiarySurgery(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IDiarySurgeryResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "Nhật ký điều trị " : `${listIdChecked.length} phiếu bảo hành cho khách hàng đã chọn`}
          {item ? <strong>{item.serviceName}</strong> : ""}? Thao tác này không thể khôi phục.
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
      title: "Xóa Nhật ký điều trị",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-diary-surgery${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Nhật ký điều trị" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên, số điện thoại hoặc mã khách hàng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />

        {!isLoading && listDiarySurgery && listDiarySurgery.length > 0 ? (
          <BoxTable
            name="Nhật ký điều trị"
            titles={titles}
            items={listDiarySurgery}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            listIdChecked={listIdChecked}
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
                    Hiện tại chưa có Nhật ký điều trị nào. <br />
                    Hãy thêm mới Nhật ký điều trị đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới Nhật ký điều trị"
                action={() => {
                  setDataDiarySurgery(null);
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
      <AddDiarySurgeryModal
        onShow={showModalAdd}
        data={dataDiarySurgery}
        onHide={(reload) => {
          if (reload) {
            getListDiarySurgery(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

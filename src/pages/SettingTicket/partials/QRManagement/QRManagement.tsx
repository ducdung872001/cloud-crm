import React, { Fragment, useState, useEffect, useRef } from "react";
import moment from "moment";
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
import AddQRManagementModal from "./partials/AddQRManagementModal";
import QrCodeService from "services/QrCodeService";

import "./QRManagement.scss";

export default function QRManagement(props) {
  document.title = "Quản lý QR code";

  const isMounted = useRef(false);

  const { onBackProps } = props;

  const [listQRManagement, setListQRManagement] = useState([]);
  const [dataQRManagement, setDataQRManagement] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "qr code",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListQRManagement = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await QrCodeService.lst(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListQRManagement(result.items);

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
      getListQRManagement(params);
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
          setDataQRManagement(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên mã qr", "Ngày bắt đầu", "Ngày kết thúc"];
  const dataFormat = ["text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    moment(item.startDate).format("DD/MM/YYYY"),
    moment(item.endDate).format("DD/MM/YYYY"),
  ];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataQRManagement(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          showDialogConfirmDelete(item);
          }
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await QrCodeService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa qr thành công`, "success");
      getListQRManagement(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    const arrPromises = selectedIds.map((selectedId) => {
      const found = listQRManagement.find((item) => item.id === selectedId);
      if (found?.id) {
        return QrCodeService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} QR code`, "success");
        getListQRManagement(params);
        setListIdChecked([]);
      } else {
        showToast("Không có QR code nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "qr" : `${listIdChecked.length} 'qr' đã chọn`}
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (item?.id) {
          onDelete(item.id);
          return;
        }
        if (listIdChecked.length>0) {
          onDeleteAll();
          return;
        }
      }
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa qr code",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách qr code",
      is_active: true,
    },
  ]);

  return (
    <div className={`page-content page__management--qr${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className={`title-first`}
            title="Quay lại"
          >
            Cài đặt hỗ trợ
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className={`title-last`}>Quản lý QR Code</h1>
        </div>
        {<TitleAction title="" titleActions={titleActions} />}
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name={`Tên qr`}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          params={params}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listQRManagement && listQRManagement.length > 0 ? (
          <BoxTable
            name="Cài đặt hỗ trợ"
            titles={titles}
            items={listQRManagement}
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
                    Hiện tại chưa có qr code nào. <br />
                    Hãy thêm mới qr code nhé!
                  </span>
                }
                type="no-item"
                titleButton={`Thêm mới qr code`}
                action={() => {
                  setDataQRManagement(null);
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
        <AddQRManagementModal
          onShow={showModalAdd}
          data={dataQRManagement}
          onHide={(reload) => {
            if (reload) {
              getListQRManagement(params);
            }

            setShowModalAdd(false);
          }}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}

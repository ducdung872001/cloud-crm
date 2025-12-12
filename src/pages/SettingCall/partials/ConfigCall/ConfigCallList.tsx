import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IConfigCodeFilterRequest } from "model/configCode/ConfigCodeRequest";
import { IConfigCodeResponseModel } from "model/configCode/ConfigCodeResponse";
import { IConfigCallListProps } from "model/configCode/PropsModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import ConfigCodeService from "services/ConfigCodeService";
import AddConfigCallModal from "./partials/AddConfigCallModal";
import { getPageOffset } from 'reborn-util';

import "./ConfigCallList.scss";

export default function ConfigCallList(props: IConfigCallListProps) {
  document.title = "Cấu hình Tổng đài";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listConfigCall, setListConfigCall] = useState<IConfigCodeResponseModel[]>([]);
  const [dataConfigCall, setDataConfigCall] = useState<IConfigCodeResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState<IConfigCodeFilterRequest>({
    name: "",
    limit: 10,
    type: 1,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách Cấu hình Tổng đài",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Cấu hình Tổng đài",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListConfigCall = async (paramsSearch: IConfigCodeFilterRequest) => {
    setIsLoading(true);

    const response = await ConfigCodeService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListConfigCall(result.items);

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
      getListConfigCall(params);
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
      permissions["GLOBAL_CONFIG_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setShowModalAdd(true);
          setDataConfigCall(null);
        },
      },
    ],
  };

  const titles = ["STT", "Tên cấu hình", "Mã cấu hình", "Thứ tự"];

  const dataFormat = ["text-center", "", "", "text-center"];

  const dataMappingArray = (item: IConfigCodeResponseModel, index: number) => [
    getPageOffset(params) + index + 1, 
    item.name, 
    item.code, 
    item.position
  ];

  const actionsTable = (item: IConfigCodeResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["GLOBAL_CONFIG_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setShowModalAdd(true);
          setDataConfigCall(item);
          }
        },
      },
      permissions["GLOBAL_CONFIG_DELETE"] == 1 && {
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
    const response = await ConfigCodeService.delete(id);

    if (response.code === 0) {
      showToast("Xóa Cấu hình Tổng đài thành công", "success");
      getListConfigCall(params);
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
      const found = listConfigCall.find((item) => item.id === selectedId);
      if (found?.id) {
        return ConfigCodeService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} cấu hình tổng đài`, "success");
        getListConfigCall(params);
        setListIdChecked([]);
      } else {
        showToast("Không có cấu hình tổng đài nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IConfigCodeResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa
          {item ? "Cấu hình Tổng đài" : `${listIdChecked.length} Cấu hình Tổng đài đã chọn`}
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
    permissions["GLOBAL_CONFIG_DELETE"] == 1 && {
      title: "Xóa Cấu hình Tổng đài",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="page-content page-config-call">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt Tổng đài
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Cấu hình Tổng đài</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên cấu hình"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listConfigCall && listConfigCall.length > 0 ? (
          <BoxTable
            name="Cấu hình Tổng đài"
            titles={titles}
            items={listConfigCall}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            isBulkAction={true}
            listIdChecked={listIdChecked}
            bulkActionItems={bulkActionList}
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
                    Hiện tại chưa có cấu hình Tổng đài nào. <br />
                    Hãy thêm mới cấu hình Tổng đài đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới cấu hình Tổng đài"
                action={() => {
                  setDataConfigCall(null);
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
      <AddConfigCallModal
        onShow={showModalAdd}
        data={dataConfigCall}
        onHide={(reload) => {
          if (reload) {
            getListConfigCall(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

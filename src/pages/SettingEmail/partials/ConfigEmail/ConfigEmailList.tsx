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
import { IConfigEmailListProps } from "model/configCode/PropsModel";
import { showToast } from "utils/common";
import ConfigCodeService from "services/ConfigCodeService";
import AddConfigEmailModal from "./partials/AddConfigEmailModal";
import { getPageOffset } from 'reborn-util';

import "./ConfigEmailList.scss";

export default function ConfigEmailList(props: IConfigEmailListProps) {
  document.title = "Cấu hình Email";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listConfigEmail, setListConfigEmail] = useState<IConfigCodeResponseModel[]>([]);
  const [dataConfigEmail, setDataConfigEmail] = useState<IConfigCodeResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [params, setParams] = useState<IConfigCodeFilterRequest>({
    name: "",
    limit: 10,
    type: 2,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách cấu hình Email",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Cấu hình Email",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListConfigEmail = async (paramsSearch: IConfigCodeFilterRequest) => {
    setIsLoading(true);

    const response = await ConfigCodeService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListConfigEmail(result.items);

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
      getListConfigEmail(params);
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
          setShowModalAdd(true);
          setDataConfigEmail(null);
        },
      },
    ],
  };

  const titles = ["STT", "Cấu hình", "Tên", "Thứ tự"];

  const dataFormat = ["text-center", "", "", "text-center"];

  const dataMappingArray = (item: IConfigCodeResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.code,
    item.name,
    item.position
  ];

  const actionsTable = (item: IConfigCodeResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setShowModalAdd(true);
          setDataConfigEmail(item);
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
    const response = await ConfigCodeService.delete(id);

    if (response.code === 0) {
      showToast("Xóa cấu hình email thành công", "success");
      getListConfigEmail(params);
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
      const found = listConfigEmail.find((item) => item.id === selectedId);
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
        showToast(`Xóa thành công ${checkbox} cấu hình email`, "success");
        getListConfigEmail(params);
        setListIdChecked([]);
      } else {
        showToast("Không có cấu hình email nào được xóa", "error");
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
          {item ? "cấu hình email" : `${listIdChecked.length} cấu hình email đã chọn`}
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
    {
      title: "Xóa cấu hình Email",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="page-content page-config-email">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt Email
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Cấu hình Email</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listConfigEmail && listConfigEmail.length > 0 ? (
          <BoxTable
            name="Cấu hình Email"
            titles={titles}
            items={listConfigEmail}
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
                    Hiện tại chưa có cấu hình email nào. <br />
                    Hãy thêm mới cấu hình email đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới cấu hình email"
                action={() => {
                  setDataConfigEmail(null);
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
      <AddConfigEmailModal
        onShow={showModalAdd}
        data={dataConfigEmail}
        onHide={(reload) => {
          if (reload) {
            getListConfigEmail(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

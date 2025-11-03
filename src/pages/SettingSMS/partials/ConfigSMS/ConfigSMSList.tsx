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
import { IConfigSMSListProps } from "model/configCode/PropsModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import ConfigCodeService from "services/ConfigCodeService";
import AddConfigSMSModal from "./partials/AddConfigSMSModal";
import { getPageOffset } from 'reborn-util';

import "./ConfigSMSList.scss";

export default function ConfigSMSList(props: IConfigSMSListProps) {
  document.title = "Cấu hình SMS";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listConfigSMS, setListConfigSMS] = useState<IConfigCodeResponseModel[]>([]);
  const [dataConfigSMS, setDataConfigSMS] = useState<IConfigCodeResponseModel>(null);
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
      name: "Danh sách Cấu hình SMS",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Cấu hình SMS",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListConfigSMS = async (paramsSearch: IConfigCodeFilterRequest) => {
    setIsLoading(true);

    const response = await ConfigCodeService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListConfigSMS(result.items);

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
      getListConfigSMS(params);
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
          setDataConfigSMS(null);
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
    return [
      permissions["GLOBAL_CONFIG_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setShowModalAdd(true);
          setDataConfigSMS(item);
        },
      },
      permissions["GLOBAL_CONFIG_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };
  const onDelete = async (id: number) => {
    const response = await ConfigCodeService.delete(id);

    if (response.code === 0) {
      showToast("Xóa Cấu hình SMS thành công", "success");
      getListConfigSMS(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

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
          {item ? "Cấu hình SMS" : `${listIdChecked.length} Cấu hình SMS đã chọn`}
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
    permissions["GLOBAL_CONFIG_DELETE"] == 1 && {
      title: "Xóa Cấu hình SMS",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="page-content page-config-sms">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt SMS
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Cấu hình SMS</h1>
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
        {!isLoading && listConfigSMS && listConfigSMS.length > 0 ? (
          <BoxTable
            name="Cấu hình SMS"
            titles={titles}
            items={listConfigSMS}
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
                    Hiện tại chưa có cấu hình SMS nào. <br />
                    Hãy thêm mới cấu hình SMS đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới cấu hình SMS"
                action={() => {
                  setDataConfigSMS(null);
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
      <AddConfigSMSModal
        onShow={showModalAdd}
        data={dataConfigSMS}
        onHide={(reload) => {
          if (reload) {
            getListConfigSMS(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

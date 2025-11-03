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
import { ITipGroupConfigListProps } from "model/tipGroupConfig/PropsModel";
import { ITipGroupConfigResponse } from "model/tipGroupConfig/TipGroupConfigResponseModel";
import { ITipGroupConfigFilterRequest } from "model/tipGroupConfig/TipGroupConfigRequestModel";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { formatCurrency, getPageOffset } from 'reborn-util';
import TipGroupConfigService from "services/TipGroupConfigService";
import AddGroupRosesModal from "./partials/AddTipGroupConfigModal";
import "./TipGroupConfigList.scss";

export default function GroupRosesList(props: ITipGroupConfigListProps) {
  document.title = "Cấu hình hoa hồng theo nhóm";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listGroupRoses, setListGroupRoses] = useState<ITipGroupConfigResponse[]>([]);
  const [dataGroupRoses, setDataGroupRoses] = useState<ITipGroupConfigResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState<ITipGroupConfigFilterRequest>({
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách hoa hồng theo nhóm",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Hoa hồng theo nhóm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListGroupRoses = async (paramsSearch: ITipGroupConfigFilterRequest) => {
    setIsLoading(true);

    const response = await TipGroupConfigService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListGroupRoses(result);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +params.page === 1) {
        setIsNoItem(true);
      }
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
      getListGroupRoses(params);
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
          setDataGroupRoses(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên nhóm", "Tên dịch vụ", "Hoa hồng", "Tính theo"];

  const dataFormat = ["text-center", "", "", "text-right", "text-center"];

  const dataMappingArray = (item: ITipGroupConfigResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.serviceName,
    item.serviceName,
    formatCurrency(item.tip, ","),
    item.unit === 1 ? "Tiền mặt" : "%",
  ];

  const actionsTable = (item: ITipGroupConfigResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataGroupRoses(item);
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
    const response = await TipGroupConfigService.delete(id);

    if (response.code === 0) {
      showToast("Xóa hoa hồng theo nhóm thành công", "success");
      getListGroupRoses(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ITipGroupConfigResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "hoa hồng theo nhóm " : `${listIdChecked.length} hoa hồng theo nhóm đã chọn`}
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
      title: "Xóa hoa hồng theo nhóm",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-tip-group-config${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt hoa hồng
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Hoa hồng theo nhóm</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên nhóm"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listGroupRoses && listGroupRoses.length > 0 ? (
          <BoxTable
            name="Hoa hồng theo nhóm"
            titles={titles}
            items={listGroupRoses}
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
            {!isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có hoa hồng theo nhóm nào. <br />
                    Hãy thêm mới hoa hồng theo nhóm đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới hoa hồng theo nhóm"
                action={() => {
                  setDataGroupRoses(null);
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
      <AddGroupRosesModal
        onShow={showModalAdd}
        data={dataGroupRoses}
        onHide={(reload) => {
          if (reload) {
            getListGroupRoses(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

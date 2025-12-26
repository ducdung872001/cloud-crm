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
import { getPageOffset } from 'reborn-util';

import "./ReportDashboard.scss";
import ModalAddReportDashboard from "./partials/ModalAddReportDashboard";
import ReportChartService from "services/ReportChartService";
import SettingReportModal from "./SettingReportModal/SettingReportModal";
import AddRoleModal from "./AddRoleModal/AddRoleModal";

export default function ReportDashboard(props: any) {
  document.title = "Danh sách báo cáo Dashboard";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listReportDashboard, setListReportDashboard] = useState([]);
  const [dataReportDashboard, setDataReportDashboard] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isSetting, setIsSetting] = useState(false);
  const [isAddRole, setIsAddRole] = useState(false);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách báo cáo Dashboard",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListReportDashboard = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ReportChartService.listReportDashboard(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListReportDashboard(result.items);

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
      getListReportDashboard(params);
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
          setDataReportDashboard(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên mẫu báo cáo", ];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
  ];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;;
    return [
      {
        title: "Thêm quyền xem",
        icon: <Icon name="UserAdd" className={isCheckedItem?"icon-disabled" : "icon-success"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setIsAddRole(item);
          setDataReportDashboard(item);
          }
        },
      },
      {
        title: "Cài đặt mẫu báo cáo",
        icon: <Icon name="Settings" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setIsSetting(true);
          setDataReportDashboard(item);
          }
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataReportDashboard(item);
          setShowModalAdd(true);
          }
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
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await ReportChartService.deleteReportDashboard(id);

    if (response.code === 0) {
      showToast("Xóa mẫu báo cáo thành công", "success");
      getListReportDashboard(params);
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
      const found = listReportDashboard.find((item) => item.id === selectedId);
      if (found?.id) {
        return ReportChartService.deleteReportDashboard(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} mẫu báo cáo DashBoard`, "success");
        getListReportDashboard(params);
        setListIdChecked([]);
      } else {
        showToast("Không có mẫu báo cáo DashBoard nào được xóa", "error");
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
          Bạn có chắc chắn muốn xóa {item ? "mẫu báo cáo " : `${listIdChecked.length} mẫu báo cáo đã chọn`}
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
      title: "Xóa mẫu báo cáo",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-report-dashboard${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt báo cáo
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách báo cáo Dashboard</h1>
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
        {!isLoading && listReportDashboard && listReportDashboard.length > 0 ? (
          <BoxTable
            name="Báo cáo Dashboard"
            titles={titles}
            items={listReportDashboard}
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
                    Hiện tại chưa có mẫu báo cáo nào. <br />
                    Hãy thêm mới mẫu báo cáo đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới mẫu báo cáo thông tin"
                action={() => {
                  setListReportDashboard(null);
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
      <ModalAddReportDashboard
        onShow={showModalAdd}
        data={dataReportDashboard}
        onHide={(reload) => {
          if (reload) {
            getListReportDashboard(params);
          }
          setShowModalAdd(false);
        }}
      />
      <SettingReportModal
        onShow={isSetting}
        dataReportDashboard={dataReportDashboard}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsSetting(false);
          setDataReportDashboard(null);
        }}
      />
      <AddRoleModal
        onShow={isAddRole}
        dataReportDashboard={dataReportDashboard}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsAddRole(false);
          setDataReportDashboard(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

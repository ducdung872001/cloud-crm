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
import { IAction } from "model/OtherModel";
import { IKpiObjectFilterRequest } from "model/kpiObject/KpiObjectRequestModel";
import { IKpiObjectResponse } from "model/kpiObject/KpiObjectResponseModel";
import KpiObjectService from "services/KpiObjectService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import Badge from "components/badge/badge";
import DetailKpiObject from "./partials/DetailKpiObject/DetailKpiObject";
import OverViewKpi from "./partials/OverviewKpi";

import "./KpiObjectList.scss";

export default function KpiObjectList(props: any) {
  document.title = "Danh sách KPI";
  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listKpiObject, setListKpiObject] = useState<IKpiObjectResponse[]>([]);
  const [dataKpiObject, setDataKpiObject] = useState<IKpiObjectResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [infoKpi, setInfoKpi] = useState(null);
  const [dataKpi, setDataKpi] = useState(null);
  const [isDetailKpi, setIsDetailKpi] = useState<boolean>(false);

  const [tab, setTab] = useState({
    name: "tab_one",
  });

  const [params, setParams] = useState<IKpiObjectFilterRequest>({
    name: "",
  });

  useEffect(() => {
    setParams({ ...params });
  }, [tab]);

  const listTabs = [
    {
      title: "Danh sách KPI",
      is_active: "tab_one",
    },
    {
      title: "Tổng quan KPI",
      is_active: "tab_two",
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "danh sách KPI",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListKpi = async (paramsSearch: IKpiObjectFilterRequest) => {
    setIsLoading(true);

    const response = await KpiObjectService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListKpiObject(result?.items);

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
      getListKpi(params);
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
    actions: [],
  };

  const name = "kpi";

  useEffect(() => {
    setPagination({ ...pagination, name: name });
  }, [tab]);

  const titles = ["STT", `Người giao`, "Người nhận", "Tên phiếu", "Trạng thái", "Theo dõi kết quả"];

  const dataFormat = ["text-center", "", "", "", "text-center", "text-center"];

  const dataMappingArray = (item: IKpiObjectResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.assignerName,
    item.receiverName,
    item.applyName,
    <Badge key={item.id} text="Hoàn thành" variant="success" />,
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setInfoKpi(item.id);
        setIsDetailKpi(true);
        setDataKpi(item)
        //Chuyển hướng sang trang chi tiết => Giống như trang chi tiết khách hàng
        //1. Nhìn kết quả KPI thực hiện hiện tại
        //2. Vùng trao đổi, bình phẩm về KPI
      }}
    >
      Xem
    </a>,
  ];

  const actionsTable = (item: IKpiObjectResponse): IAction[] => {
    return [
      permissions["KPI_APPLY_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataKpiObject(item);
          setShowModalAdd(true);
        },
      },
      permissions["KPI_APPLY_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await KpiObjectService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa ${name} thành công`, "success");
      getListKpi(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IKpiObjectResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? name : `${listIdChecked.length} ${name} đã chọn`}
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
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
    permissions["KPI_APPLY_DELETE"] == 1 && {
      title: `Xóa ${name}`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-kpi-apply${isNoItem ? " bg-white" : ""}`}>
      {!isDetailKpi && <TitleAction title="Quản lý KPI" titleActions={titleActions} />}

      {!isDetailKpi ? (
        <div className="card-box d-flex flex-column">
          <div className="action-header">
            <div className="title__actions">
              <ul className="menu-list">
                {listTabs.map((item, idx) => (
                  <li
                    key={idx}
                    className={item.is_active == tab.name ? "active" : ""}
                    onClick={(e) => {
                      e && e.preventDefault();
                      setTab({ name: item.is_active });
                    }}
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
            {tab.name === "tab_one" && <SearchBox name={`Tên phiếu giao`} params={params} updateParams={(paramsNew) => setParams(paramsNew)} />}
          </div>

          {tab.name === "tab_one" ? (
            <Fragment>
              {!isLoading && listKpiObject && listKpiObject.length > 0 ? (
                <BoxTable
                  name="Danh sách KPI"
                  titles={titles}
                  items={listKpiObject}
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
                          Hiện tại chưa có {name} nào. <br />
                        </span>
                      }
                      type="no-item"
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
              <Dialog content={contentDialog} isOpen={showDialog} />
            </Fragment>
          ) : (
            <OverViewKpi />
          )}
        </div>
      ) : (
        <div className="detail__management--kpi">
          <div className="action-navigation">
            <div className="action-backup">
              <h1
                onClick={() => {
                  setIsDetailKpi(false);
                }}
                className="title-first"
                title="Quay lại"
              >
                Quản lý Kpi
              </h1>
              <Icon name="ChevronRight" />
              <h1 className="title-last">Chi tiết Kpi</h1>
            </div>
          </div>
          <DetailKpiObject
            idData={infoKpi}
            dataKpi={dataKpi}
            onShow={isDetailKpi}
            onHide={(reload) => {
              if (reload) {
                getListKpi(params);
              }
              // setShowModalAdd(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

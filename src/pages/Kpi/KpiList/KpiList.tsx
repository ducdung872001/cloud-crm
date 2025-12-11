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
import { IKpiFilterRequest } from "model/kpi/KpiRequestModel";
import { IKpiResponse } from "model/kpi/KpiResponseModel";
import KpiService from "services/KpiService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import AddKpiModal from "./partials/AddKpiModal";
import KpiSetupModal from "./partials/KpiSetupModal";
import { getPageOffset } from "reborn-util";

import "./KpiList.scss";

export default function KpiList() {
  document.title = "Danh sách KPI";

  const isMounted = useRef(false);

  const [listKpi, setListKpi] = useState<IKpiResponse[]>([]);
  const [dataKpi, setDataKpi] = useState<IKpiResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalKpiSetup, setShowModalKpiSetup] = useState<boolean>(false);
  const [infoKpi, setInfoKpi] = useState(null);

  const [tab, setTab] = useState({
    name: "tab_one",
  });

  const [params, setParams] = useState<IKpiFilterRequest>({
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
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "cài đặt chỉ số KPI",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListKpi = async (paramsSearch: IKpiFilterRequest) => {
    setIsLoading(true);

    const response = await KpiService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListKpi(result?.items);

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
    actions: [
      permissions["KPI_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataKpi(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const name = "KPI";

  useEffect(() => {
    setPagination({ ...pagination, name: name });
  }, [tab]);

  const titles = ["STT", `Tên KPI`, "Mô tả", "Chỉ tiêu KPI"];

  const dataFormat = ["text-center", "", "", "text-center"];

  const dataMappingArray = (item: IKpiResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.description,
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setInfoKpi({ idKpi: item.id, nameKpi: item.name });
        setShowModalKpiSetup(true);
      }}
    >
      Xem
    </a>,
  ];

  const actionsTable = (item: IKpiResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["KPI_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataKpi(item);
          setShowModalAdd(true);
          }
        },
      },
      permissions["KPI_DELETE"] == 1 && {
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
    const response = await KpiService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa KPI ${name} thành công`, "success");
      getListKpi(params);
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
      const found = listKpi.find((item) => item.id === selectedId);
      if (found?.id) {
        return KpiService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} KPI`, "success");
        getListKpi(params);
        setListIdChecked([]);
      } else {
        showToast("Không có KPI được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IKpiResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa KPI {item ? name : `${listIdChecked.length} ${name} đã chọn`}
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
    permissions["KPI_DELETE"] == 1 && {
      title: `Xóa KPI ${name}`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-ticket-proc${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="KPI" titleActions={titleActions} />
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
          <SearchBox name={`Tên KPI`} params={params} updateParams={(paramsNew) => setParams(paramsNew)} />
        </div>
        {!isLoading && listKpi && listKpi.length > 0 ? (
          <BoxTable
            name="Danh sách KPI"
            titles={titles}
            items={listKpi}
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
                    Hiện tại chưa có KPI {name} nào. <br />
                    Hãy thêm mới KPI {name} nhé!
                  </span>
                }
                type="no-item"
                titleButton={`Thêm mới KPI ${name}`}
                action={() => {
                  setDataKpi(null);
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
        <AddKpiModal
          onShow={showModalAdd}
          data={dataKpi}
          onHide={(reload) => {
            if (reload) {
              getListKpi(params);
            }
            setShowModalAdd(false);
          }}
        />
        <KpiSetupModal
          infoKpi={infoKpi}
          onShow={showModalKpiSetup}
          onHide={(reload) => {
            if (reload) {
              getListKpi(params);
            }

            setShowModalKpiSetup(false);
          }}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}

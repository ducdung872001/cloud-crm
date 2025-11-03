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
import { IKpiApplyFilterRequest } from "model/kpiApply/KpiApplyRequestModel";
import { IKpiApplyResponse } from "model/kpiApply/KpiApplyResponseModel";
import KpiApplyService from "services/KpiApplyService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import AddKpiApplyModal from "./partials/AddKpiApplyModal";
import KpiObjectModal from "./partials/KpiObjectModal";
import { getPageOffset } from "reborn-util";

import "./KpiApplyList.scss";
import moment from "moment";

export default function KpiApplyList(props: any) {
  document.title = "Danh sách phiếu giao KPI";
  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listKpiApply, setListKpiApply] = useState<IKpiApplyResponse[]>([]);
  const [dataKpiApply, setDataKpiApply] = useState<IKpiApplyResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalKpiApply, setShowModalKpiApply] = useState<boolean>(false);
  const [infoKpi, setInfoKpi] = useState(null);

  const [tab, setTab] = useState({
    name: "tab_one",
  });

  const [params, setParams] = useState<IKpiApplyFilterRequest>({
    name: "",
  });

  useEffect(() => {
    setParams({ ...params });
  }, [tab]);

  const listTabs = [
    {
      title: "Danh sách phiếu giao KPI",
      is_active: "tab_one",
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "phiếu giao KPI",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListKpi = async (paramsSearch: IKpiApplyFilterRequest) => {
    setIsLoading(true);

    const response = await KpiApplyService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListKpiApply(result?.items);

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
      permissions["KPI_APPLY_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataKpiApply(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const name = "phiếu giao";

  useEffect(() => {
    setPagination({ ...pagination, name: name });
  }, [tab]);

  const titles = ["STT", `Tên phiếu giao`, "Mô tả", "Thời gian bắt đầu", "Thời gian kết thúc", "Tên KPI", "Đối tượng áp dụng"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center", "", "text-center"];

  const dataMappingArray = (item: IKpiApplyResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.description,
    moment(item.startTime).format("DD/MM/YYYY"),
    moment(item.endTime).format("DD/MM/YYYY"),
    item.kpiName,
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setInfoKpi({ idKpi: item.id, nameKpi: item.name, setKpiId: item.kpiId, setKpiName: item.kpiName });
        setShowModalKpiApply(true);
      }}
    >
      Xem
    </a>,
  ];

  const actionsTable = (item: IKpiApplyResponse): IAction[] => {
    return [
      permissions["KPI_APPLY_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataKpiApply(item);
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
    const response = await KpiApplyService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa ${name} thành công`, "success");
      getListKpi(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IKpiApplyResponse) => {
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
      <TitleAction title="Phiếu giao KPI" titleActions={titleActions} />
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
          <SearchBox name={`Tên phiếu giao`} params={params} updateParams={(paramsNew) => setParams(paramsNew)} />
        </div>
        {!isLoading && listKpiApply && listKpiApply.length > 0 ? (
          <BoxTable
            name="Danh sách phiếu giao"
            titles={titles}
            items={listKpiApply}
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
                    Hãy thêm mới {name} nhé!
                  </span>
                }
                type="no-item"
                titleButton={`Thêm mới ${name}`}
                action={() => {
                  setDataKpiApply(null);
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
        <AddKpiApplyModal
          onShow={showModalAdd}
          data={dataKpiApply}
          onHide={(reload) => {
            if (reload) {
              getListKpi(params);
            }
            setShowModalAdd(false);
          }}
        />
        <KpiObjectModal
          infoKpi={infoKpi}
          onShow={showModalKpiApply}
          onHide={(reload) => {
            if (reload) {
              getListKpi(params);
            }

            setShowModalKpiApply(false);
          }}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}

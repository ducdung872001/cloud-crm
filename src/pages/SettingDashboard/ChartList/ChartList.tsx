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

import "./ChartList.scss";
import CustomerViewService from "services/CustomerViewService";
import ModalViewChart from "./ModalViewChart/ModalViewChart";
import ModalAddChart from "./partials/ModalAddChart";
import ReportChartService from "services/ReportChartService";

export default function ChartList(props: any) {
  document.title = "Danh sách biểu đồ";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [dataChart, setDataChart] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isView, setIsView] = useState(false);

  const [listChart, setListChart] = useState([
    // {
    //     name:'Pie Chart',
    //     code: 'pie_chart'
    // },
    // {
    //     name:'Line Chart',
    //     code:'line_chart'
    // },
    // {
    //     name:'Basic bar chart',
    //     code: 'basic_bar_chart'
    // },
  ])

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách biểu đồ",
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

  const getListChart = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ReportChartService.listReportArtifact(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListChart(result.items);

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
      getListChart(params);
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
          setDataChart(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên biểu đồ", "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.position
  ];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Xem biểu đồ mẫu",
        icon: <Icon name="Eye" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setIsView(true);
          setDataChart(item);
          }
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataChart(item);
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
    const response = await ReportChartService.deleteReportArtifact(id);

    if (response.code === 0) {
      showToast("Xóa biểu đồ xem thành công", "success");
      getListChart(params);
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
      const found = listChart.find((item) => item.id === selectedId);
      if (found?.id) {
        return ReportChartService.deleteReportArtifact(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} biểu đồ`, "success");
        getListChart(params);
        setListIdChecked([]);
      } else {
        showToast("Không có biểu đồ nào được xóa", "error");
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
          Bạn có chắc chắn muốn xóa {item ? "biểu đồ " : `${listIdChecked.length} biể đồ đã chọn`}
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
      title: "Xóa biểu đồ",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-chart-list${isNoItem ? " bg-white" : ""}`}>
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
          <h1 className="title-last">Danh sách biểu đồ</h1>
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
        {!isLoading && listChart && listChart.length > 0 ? (
          <BoxTable
            name="Biểu đồ"
            titles={titles}
            items={listChart}
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
                    Hiện tại chưa có biểu đồ nào. <br />
                  </span>
                }
                type="no-item"
                titleButton=""
                action={() => {}}
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

      <ModalViewChart
        onShow={isView}
        data={dataChart}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsView(false);
        }}
      />

        <ModalAddChart
            onShow={showModalAdd}
            data={dataChart}
            onHide={(reload) => {
            if (reload) {
                getListChart(params);
            }
            setShowModalAdd(false);
            }}
        />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

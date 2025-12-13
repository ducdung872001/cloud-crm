import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch, IFilterItem } from "model/OtherModel";
import { IBranchListProps } from "model/kpiDatasource/PropsModel";
import { IKpiDatasourceResponse } from "model/kpiDatasource/KpiDatasourceResponseModel";
import { IKpiDatasourceFilterRequest } from "model/kpiDatasource/KpiDatasourceRequestModel";
import { showToast } from "utils/common";
import KpiDatasourceService from "services/KpiDatasourceService";
import AddKpiDatasourceModal from "./partials/AddKpiDatasourceModal";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import { useSearchParams } from "react-router-dom";
import Button from "components/button/button";

import "./KpiDatasourceList.scss";

export default function BranchList(props: IBranchListProps) {
  document.title = "Danh sách nguồn cấp dữ liệu KPI";

  const { onBackProps } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  const isMounted = useRef(false);

  const [listDatasource, setListDatasource] = useState<IKpiDatasourceResponse[]>([]);
  const [dataKpiDatasource, setDataKpiDatasource] = useState<IKpiDatasourceResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<IKpiDatasourceFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách nguồn cấp dữ liệu",
      is_active: true,
    },
  ]);

  const moduleFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "type",
        name: "Kiểu nguồn",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "1",
            label: "Bán hàng",
          },
          {
            value: "2",
            label: "Khách hàng",
          },
          {
            value: "3",
            label: "Tổng đài",
          },
          {
            value: "4",
            label: "Chiến dịch",
          },
          {
            value: "5",
            label: "Cơ hội",
          },
          {
            value: "6",
            label: "Hỗ trợ",
          },
          {
            value: "7",
            label: "Bảo hành",
          },
          {
            value: "8",
            label: "Tài chính",
          },
        ],
        value: searchParams.get("type") ?? "",
      }
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nguồn cấp KPI",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListKpiDatasource = async (paramsSearch: IKpiDatasourceFilterRequest) => {
    setIsLoading(true);

    const response = await KpiDatasourceService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListDatasource(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params.name && +result.page === 1) {
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
      getListKpiDatasource(params);
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

  const titles = ["STT", "Tên nguồn cấp", "Mã nguồn cấp", "Mô tả", "Kiểu nguồn", "Thứ tự"];

  const dataFormat = ["text-center", "", "", "", "", "text-center"];

  const getTypeName = (type: number) => {
    switch (type) {
      case 1:
        return "Bán hàng";
      case 2:
        return "Khách hàng";
      case 3:
        return "Tổng đài";
      case 4:
        return "Chiến dịch";
      case 5:
        return "Cơ hội";
      case 6:
        return "Hỗ trợ";
      case 7:
        return "Bảo hành";
      case 8:
        return "Tài chính";
    }
  }

  const dataMappingArray = (item: IKpiDatasourceResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.code,
    item.description,
    getTypeName(item.type),
    item.position,
  ];

  const actionsTable = (item: IKpiDatasourceResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["KPI_DATASOURCE_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataKpiDatasource(item);
          setShowModalAdd(true);
          }
        },
      },
      permissions["KPI_DATASOURCE_DELETE"] == 1 && {
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
    const response = await KpiDatasourceService.delete(id);

    if (response.code === 0) {
      showToast("Xóa nguồn cấp dữ liệu KPI thành công", "success");
      getListKpiDatasource(params);
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
      const found = listDatasource.find((item) => item.id === selectedId);
      if (found?.id) {
        return KpiDatasourceService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} nguồn cấp`, "success");
        getListKpiDatasource(params);
        setListIdChecked([]);
      } else {
        showToast("Không có nguồn cấp nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IKpiDatasourceResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "nguồn cấp " : `${listIdChecked.length} nguồn cấp đã chọn`}
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
    permissions["KPI_DATASOURCE_DELETE"] == 1 && {
      title: "Xóa nguồn cấp",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-kpi-datasource${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt KPI
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách nguồn cấp</h1>
        </div>
        {permissions["KPI_DATASOURCE_ADD"] == 1 && (
          <Button
            className="btn__add--kpi-datasource"
            onClick={(e) => {
              e && e.preventDefault();
              setDataKpiDatasource(null);
              setShowModalAdd(true);
            }}
          >
            Thêm mới
          </Button>
        )}
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên nguồn cấp"
          params={params}
          isFilter={true}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          listFilterItem={moduleFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listDatasource && listDatasource.length > 0 ? (
          <BoxTable
            name="Nguồn cấp KPI"
            titles={titles}
            items={listDatasource}
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
                    Hiện tại chưa có nguồn cấp KPI nào. <br />
                    Hãy thêm mới nguồn cấp KPI đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới nguồn cấp KPI"
                action={() => {
                  setDataKpiDatasource(null);
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
      <AddKpiDatasourceModal
        onShow={showModalAdd}
        data={dataKpiDatasource}
        onHide={(reload) => {
          if (reload) {
            getListKpiDatasource(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

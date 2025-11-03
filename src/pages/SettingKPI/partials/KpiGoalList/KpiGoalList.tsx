import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Badge from "components/badge/badge";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Button from "components/button/button";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IKpiGoalListProps } from "model/kpiGoal/PropsModel";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IKpiGoalFilterRequest } from "model/kpiGoal/KpiGoalRequestModel";
import { IKpiGoalResponse } from "model/kpiGoal/KpiGoalResponseModel";
import { showToast, getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import KpiGoalService from "services/KpiGoalService";
import { useWindowDimensions } from "utils/hookCustom";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import AddKpiGoalModal from "./partials/AddKpiGoalModal";

import "tippy.js/animations/scale.css";
import "./KpiGoalList.scss";

export default function KpiGoalList(props: IKpiGoalListProps) {
  document.title = "Danh sách chỉ tiêu KPI";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listKpiGoal, setListKpiGoal] = useState<IKpiGoalResponse[]>([]);
  const [dataKpiGoal, setDataKpiGoal] = useState<IKpiGoalResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalView, setShowModalView] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showModalViewEmployee, setShowModalViewEmployee] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const { width } = useWindowDimensions();

  const [params, setParams] = useState<IKpiGoalFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách chỉ tiêu KPI",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Chỉ tiêu KPI",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListKpiGoal = async (paramsSearch: IKpiGoalFilterRequest) => {
    setIsLoading(true);

    const response = await KpiGoalService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListKpiGoal(result.items);

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
      getListKpiGoal(params);
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

  const titles = ["STT", "Tên chỉ tiêu", "Tốt theo hướng", "Nhóm chỉ tiêu", "Cách tính", "Nguồn cấp dữ liệu", "Thứ tự"];

  const dataFormat = ["text-center", "", "text-center", "", "", "", "text-center"];

  const dataSize = ["auto", "auto", "auto", "auto", "auto", "auto"];
  const getTypeName = (type: number) => {
    switch (type) {
      case 1:
        return "Tính toán tự động";
      case 2:
        return "Tính thủ công";
      case 3:
        return "Tính theo công thức";
      default:
        return "";
    }
  }

  const getCategoryName = (category: string) => {
    // switch (category) {
    //   case "Strategic":
    //     return "Chiến lược";
    //   case "Operational":
    //     return "Vận hành";
    //   case "Functional":
    //     return "Bộ phận chức năng";
    //   case "Leading":
    //     return "Dẫn dắt/Tụt hậu";
    //   default:
    //     return "Khác";
    // }
    switch (category) {
      case "Finance":
        return "Tài chính";
      case "Customer":
        return "Khách hàng";
      case "Progress":
        return "Quy trình";
      case "People":
        return "Con người";
      default:
        return "Khác";
    }
  }

  const dataMappingArray = (item: IKpiGoalResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.direction == 'asc' ? "Tăng" : "Giảm",
    getCategoryName(item.category || ""),
    getTypeName(item.type),
    item.datasourceName,
    item.position
  ];

  const actionsTable = (item: IKpiGoalResponse): IAction[] => {
    return [
      permissions["KPI_GOAL_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataKpiGoal(item);
          setShowModalAdd(true);
        },
      },
      permissions["KPI_GOAL_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ]
  };

  const onDelete = async (id: number) => {
    const response = await KpiGoalService.delete(id);

    if (response.code === 0) {
      showToast("Xóa chỉ tiêu KPI thành công", "success");
      getListKpiGoal(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IKpiGoalResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "phòng ban " : `${listIdChecked.length} phòng ban đã chọn`}
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
    permissions["KPI_GOAL_DELETE"] == 1 && {
      title: "Xóa phòng ban",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-kpi-goal${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className={`title-first ${showConfig && width <= 768 ? "d-none" : ""}`}
            title="Quay lại"
          >
            Cài đặt KPI
          </h1>
          <Icon
            name="ChevronRight"
            className={`${showConfig && width <= 768 ? "d-none" : ""}`}
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1
            title="Quay lại"
            className={`title-last ${showConfig ? "active" : ""}`}
            onClick={() => {
              setShowConfig(false);
            }}
          >
            Danh sách chỉ tiêu KPI
          </h1>
          {showConfig && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setShowConfig(false);
                }}
              />
              <h1 className="title-last">Cấu hình</h1>
            </Fragment>
          )}
        </div>
        {permissions["KPI_GOAL_ADD"] == 1 && (
          <Button
            className="btn__add--kpi-goal"
            onClick={(e) => {
              e && e.preventDefault();
              setDataKpiGoal(null);
              setShowModalAdd(true);
            }}
          >
            Thêm mới
          </Button>
        )}
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên chỉ tiêu"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listKpiGoal && listKpiGoal.length > 0 ? (
          <BoxTable
            name="Chỉ tiêu KPI"
            titles={titles}
            items={listKpiGoal}
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
                    Hiện tại chưa có chỉ tiêu KPI nào. <br />
                    Hãy thêm mới chỉ tiêu KPI đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới chỉ tiêu KPI"
                action={() => {
                  setDataKpiGoal(null);
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
      <AddKpiGoalModal
        onShow={showModalAdd}
        data={dataKpiGoal}
        onHide={(reload) => {
          if (reload) {
            getListKpiGoal(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

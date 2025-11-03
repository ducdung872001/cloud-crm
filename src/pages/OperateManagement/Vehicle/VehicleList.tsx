import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Button from "components/button/button";
import Badge from "components/badge/badge";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { formatCurrency, showToast } from "utils/common";
import { getPageOffset } from "reborn-util";

import "./VehicleList.scss";
import AddParkingFeeModal from "./partials/AddVehicleModal";
import moment from "moment";
import VehicleService from "services/VehicleService";

export default function VehicleList(props: any) {
  document.title = "Danh sách phương tiện";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listVehicle, setListVehicle] = useState<any[]>([]);
  const [dataVehicle, setDataVehicle] = useState<any>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    licensePlate: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách phương tiện",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Danh sách phương tiện",
      is_active: "tab_one",
      type: 1,
    },
    // {
    //   title: "Sơ đồ phân cấp phương tiện",
    //   is_active: "tab_two",
    //   type: 2,
    // },
  ];

  const [tab, setTab] = useState({
    name: "tab_one",
    type: 1,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "phương tiện",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListVehicle = async (paramsSearch: any) => {
    setIsLoading(true);
    const _params = {
      ...paramsSearch,
    };
    if (_params?.operationProjectId) {
      _params["projectId"] = _params["operationProjectId"];
      delete _params["operationProjectId"];
    }

    const response = await VehicleService.list(_params, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListVehicle(result.items);

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
      getListVehicle(params);
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

  const titles = ["STT", "Căn hộ", "Tòa nhà", "Biển số xe", "Lọai phương tiện", "Ngày đăng ký", "Mã điểm đậu", "Trạng thái"];

  const dataFormat = ["text-center", "text-left", "text-left", "text-left", "text-left", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item?.scrId ? (item?.unitNumber || "") + " - " + (item?.customerName || "") : "",
    item.buildingName || "",
    item.licensePlate,
    item.vehicleType,
    // formatCurrency(item.feePerMonth, ".", " đ", "right"),
    // formatCurrency(item.feePerDay, ".", " đ", "right"),
    moment(item.registerDate).format("DD/MM/YYYY"),
    item.parkingSlotId,
    <Badge key={item.id} text={item.status === 0 ? "Ngừng sử dụng" : "Đang sử dụng"} variant={item.status == 0 ? "warning" : "success"} />,
  ];

  const handleChangeActive = async (item) => {
    const body = {
      id: item.id,
    };

    // let response = null;

    // if (item.status == 2) {
    //   response = await BeautyElectricityRateService.activate(body);
    // } else {
    //   response = await BeautyElectricityRateService.unActivate(body);
    // }

    // if (response.code === 0) {
    //   showToast(`Dự án ${item.status == 2 ? "ngừng hoạt động" : "hoạt động"} thành công`, "success");
    //   getListVehicle(params);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmActiveElectricityRate = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>{item.status == 2 ? "Đang hoạt động" : "Ngừng hoạt động"}...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn chuyển trạng thái {item.status == 2 ? "đang hoạt động" : "ngừng hoạt động"} cho
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleChangeActive(item);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actionsTable = (item: any): IAction[] => {
    return item.headquarter === 1
      ? [
          {
            title: item.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động",
            icon: <Icon name={item.status == 2 ? "Lock" : "Unlock"} />,
            callback: () => {
              showDialogConfirmActiveElectricityRate(item);
            },
          },

          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataVehicle(item);
              setShowModalAdd(true);
            },
          },
        ]
      : [
          // {
          //   title: item.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động",
          //   icon: <Icon name={item.status == 2 ? "Lock" : "Unlock"} />,
          //   callback: () => {
          //     showDialogConfirmActiveElectricityRate(item);
          //   },
          // },
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataVehicle(item);
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
    const response = await VehicleService.delete(id);

    if (response.code === 0) {
      showToast("Xóa phương tiện thành công", "success");
      getListVehicle(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "phương tiện " : `${listIdChecked.length} phương tiện đã chọn`}
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
    {
      title: "Xóa phương tiện",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const listFilter = useMemo(
    () =>
      [
        {
          key: "scrId",
          name: "Căn hộ",
          type: "select",
          is_featured: true,
        },
        {
          key: "buildingId",
          name: "Tòa nhà",
          type: "select",
          is_featured: true,
        },
      ] as IFilterItem[],
    []
  );

  return (
    <div className={`page-content page-branch${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1 className="title-first">Danh sách phương tiện</h1>
        </div>

        <Button
          className="btn__add--branch"
          onClick={(e) => {
            e && e.preventDefault();
            setDataVehicle(null);
            setShowModalAdd(true);
          }}
        >
          Thêm mới
        </Button>
      </div>

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
                    setIsLoading(true);
                    if (tab.type == 1) {
                      setParams({
                        licensePlate: "",
                        limit: 1000,
                      });
                    } else {
                      setParams({
                        licensePlate: "",
                        limit: 10,
                        // page: 1
                      });
                    }
                    setTab({ name: item.is_active, type: item.type });
                  }}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
          {/* {tab.type == 1 ?  */}
          <div className={tab.type == 1 ? "" : "d-none"}>
            <SearchBox
              name="Biển số xe"
              params={params}
              // isSaveSearch={true}
              // listSaveSearch={listSaveSearch}
              isFilter={true}
              listFilterItem={listFilter}
              disabledTextInput={true}
              updateParams={(paramsNew) => setParams(paramsNew)}
            />
          </div>
          {/* : null} */}
        </div>
        {!isLoading && listVehicle && listVehicle.length > 0 ? (
          <BoxTable
            name="Phương tiện"
            titles={titles}
            items={listVehicle}
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
                    Hiện tại chưa có phương tiện nào. <br />
                    Hãy thêm mới phương tiện đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới phương tiện"
                action={() => {
                  setDataVehicle(null);
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
      <AddParkingFeeModal
        onShow={showModalAdd}
        data={dataVehicle}
        onHide={(reload) => {
          if (reload) {
            getListVehicle(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _, { set } from "lodash";
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

import "./BuildingList.scss";
import AddBuildingModal from "./partials/AddBuildingModal";
import BuildingService from "services/BuildingService";
import { useNavigate } from "react-router-dom";
import BuildingFloorList from "../BuildingFloorList/BuildingFloorList";
import AddBuildingFloorModal from "../BuildingFloorList/partials/AddBuildingFloorModal";
import SpaceList from "pages/SettingOperate/partials/Space/SpaceList";
import AddSpaceModal from "../Space/partials/AddSpaceModal";

export default function BuildingList(props: any) {
  document.title = "Danh sách tòa nhà";
  const navigate = useNavigate();

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listBuilding, setListBuilding] = useState<any[]>([]);
  const [dataBuilding, setDataBuilding] = useState<any>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAddBuilding, setShowModalAddBuilding] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách tòa nhà",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Danh sách tòa nhà",
      is_active: "tab_one",
      type: 1,
    },
    // {
    //   title: "Sơ đồ phân cấp tòa nhà",
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
    name: "biểu phí",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListBuilding = async (paramsSearch: any) => {
    setIsLoading(true);

    const _params = {
      ...paramsSearch,
    };
    if (_params?.operationProjectId) {
      _params["projectId"] = _params["operationProjectId"];
      delete _params["operationProjectId"];
    }

    const response = await BuildingService.list(_params, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListBuilding(result.items);

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
      getListBuilding(params);
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

  const titles = [
    "STT",
    "Tên tòa nhà",
    "Mã tòa nhà",
    "Địa chỉ tòa nhà",
    "Dự án",
    "Danh sách tầng",
    //  "Trạng thái"
  ];

  const dataFormat = ["text-center", "text-left", "text-left", "text-left", "text-left", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.code,
    item.address,
    item.projectName || "",
    <div
      key={item.id}
      className={`action__view--customer`}
      onClick={() => {
        setStep(2);
        const updatedListNav = listNav.map((item, index) => {
          if (index === listNav.length - 1) {
            return { ...item, className: "title-first" };
          }
          return item;
        });
        setListNav([
          ...updatedListNav,
          {
            title: "Tầng",
            className: "title-last",
            callback: () => {
              setStep(2);
            },
          },
        ]);
        setDataBuilding(item);
      }}
    >
      <a>Danh sách tầng</a>
    </div>,
    // formatCurrency(item.feePerMonth, ".", " đ", "right"),
    // formatCurrency(item.feePerDay, ".", " đ", "right"),
    // moment(item.effectiveDate).format("DD/MM/YYYY"),
    // moment(item.expiredDate).format("DD/MM/YYYY"),
    // <Badge key={item.id} text={item.status === 2 ? "Ngừng hiệu lực" : "Đang hiệu lực"} variant={item.status == 2 ? "warning" : "success"} />,
  ];

  const handleChangeActive = async (item) => {
    const body = {
      id: item.id,
    };

    // let response = null;

    // if (item.status == 2) {
    //   response = await BeautyBuildingService.activate(body);
    // } else {
    //   response = await BeautyBuildingService.unActivate(body);
    // }

    // if (response.code === 0) {
    //   showToast(`Dự án ${item.status == 2 ? "ngừng hoạt động" : "hoạt động"} thành công`, "success");
    //   getListBuilding(params);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmActiveBuilding = (item?: any) => {
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
              showDialogConfirmActiveBuilding(item);
            },
          },

          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataBuilding(item);
              setShowModalAddBuilding(true);
            },
          },
        ]
      : [
          // {
          //   title: item.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động",
          //   icon: <Icon name={item.status == 2 ? "Lock" : "Unlock"} />,
          //   callback: () => {
          //     showDialogConfirmActiveBuilding(item);
          //   },
          // },
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataBuilding(item);
              setShowModalAddBuilding(true);
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
    const response = await BuildingService.delete(id);

    if (response.code === 0) {
      showToast("Xóa tòa nhà thành công", "success");
      getListBuilding(params);
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
          Bạn có chắc chắn muốn xóa {item ? "tòa nhà " : `${listIdChecked.length} tòa nhà đã chọn`}
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
      title: "Xóa tòa nhà",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const listFilter = useMemo(
    () =>
      [
        {
          key: "operationProjectId",
          name: "Dự án",
          type: "select",
          is_featured: true,
        },
      ] as IFilterItem[],
    []
  );

  const [listNav, setListNav] = useState<any[]>([
    {
      title: "Cài đặt vận hành",
      className: "title-first",
      callback: () => {
        onBackProps(true);
      },
    },
    {
      title: "Tòa nhà",
      className: "title-last",
      callback: () => {
        setStep(1);
      },
    },
  ]);

  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    if (step == 1) {
      setListNav([
        {
          title: "Cài đặt vận hành",
          className: "title-first",
          callback: () => {
            onBackProps(true);
          },
        },
        {
          title: "Tòa nhà",
          className: "title-last",
          callback: () => {
            setStep(1);
          },
        },
      ]);
    } else if (step == 2) {
      setListNav([
        {
          title: "Cài đặt vận hành",
          className: "title-first",
          callback: () => {
            onBackProps(true);
          },
        },
        {
          title: "Tòa nhà",
          className: "title-first",
          callback: () => {
            setStep(1);
          },
        },
        {
          title: "Tầng",
          className: "title-last",
          callback: () => {
            setStep(2);
          },
        },
      ]);
    }
  }, [step]);

  // Đoạn này cho phần tầng
  const [dataBuildingFloor, setDataBuildingFloor] = useState<any>(null);
  const [showModalAddBuildingFloor, setShowModalAddBuildingFloor] = useState<boolean>(false);
  const [isReloadBuildingFloor, setIsReloadBuildingFloor] = useState<boolean>(false);

  // Đoạn này cho phần căn
  const [dataSpace, setDataSpace] = useState<any>(null);
  const [showModalAddSpace, setShowModalAddSpace] = useState<boolean>(false);
  const [reloadSpace, setReloadSpace] = useState<boolean>(false);

  return (
    <div className={`page-content page-branch${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          {listNav.map((item, idx) => (
            <Fragment key={idx}>
              <h1 onClick={item.callback} className={item.className} title="Quay lại">
                {item.title}
              </h1>
              {idx < listNav.length - 1 && (
                <Icon
                  name="ChevronRight"
                  onClick={() => {
                    onBackProps(true);
                  }}
                />
              )}
            </Fragment>
          ))}
        </div>
        <div className="title_action">
          {step > 1 && (
            <Button
              className="btn__add--branch"
              onClick={(e) => {
                e && e.preventDefault();
                setStep(step - 1);
              }}
            >
              Quay lại
            </Button>
          )}
          <Button
            className="btn__add--branch"
            onClick={(e) => {
              e && e.preventDefault();
              if (step == 1) {
                setDataBuilding(null);
                setShowModalAddBuilding(true);
              } else if (step == 2) {
                setDataBuildingFloor(null);
                setShowModalAddBuildingFloor(true);
              } else {
                setDataSpace(null);
                setShowModalAddSpace(true);
              }
            }}
          >
            {step == 1 ? "Thêm mới tòa nhà" : step == 2 ? "Thêm mới tầng" : "Thêm mới căn"}
          </Button>
        </div>
      </div>

      {step == 1 ? (
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
                          name: "",
                          limit: 1000,
                        });
                      } else {
                        setParams({
                          name: "",
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
                name="Tên toà nhà"
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
          {!isLoading && listBuilding && listBuilding.length > 0 ? (
            <BoxTable
              name="Dự án"
              titles={titles}
              items={listBuilding}
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
                      Hiện tại chưa có tòa nhà nào. <br />
                      Hãy thêm mới tòa nhà đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới tòa nhà"
                  action={() => {
                    setDataBuilding(null);
                    setShowModalAddBuilding(true);
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
      ) : step == 2 ? (
        <BuildingFloorList
          dataBuildingFloor={dataBuildingFloor}
          setDataBuildingFloor={setDataBuildingFloor}
          setShowModalAddBuildingFloor={setShowModalAddBuildingFloor}
          isReloadBuildingFloor={isReloadBuildingFloor}
          dataBuilding={dataBuilding}
          setStep={setStep}
          listNav={listNav}
          setListNav={setListNav}
        />
      ) : step == 3 ? (
        <SpaceList
          dataSpace={dataSpace}
          dataBuilding={dataBuilding}
          setDataSpace={setDataSpace}
          setShowModalAddSpace={setShowModalAddSpace}
          reloadSpace={reloadSpace}
          dataBuildingFloor={dataBuildingFloor}
        />
      ) : null}

      <AddBuildingModal
        onShow={showModalAddBuilding}
        data={dataBuilding}
        onHide={(reload) => {
          if (reload) {
            getListBuilding(params);
          }
          setShowModalAddBuilding(false);
        }}
      />
      <AddBuildingFloorModal
        onShow={showModalAddBuildingFloor}
        data={dataBuildingFloor}
        dataBuilding={dataBuilding}
        onHide={(reload) => {
          if (reload) {
            setIsReloadBuildingFloor(!isReloadBuildingFloor);
          }
          setShowModalAddBuildingFloor(false);
        }}
      />
      <AddSpaceModal
        onShow={showModalAddSpace}
        data={dataSpace}
        dataBuilding={dataBuilding}
        dataBuildingFloor={dataBuildingFloor}
        onHide={(reload) => {
          if (reload) {
            setReloadSpace(!reloadSpace);
          }
          setShowModalAddSpace(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

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

import "./CxmSurveyList.scss";

import BuildingService from "services/BuildingService";
import { useNavigate } from "react-router-dom";

import SpaceList from "pages/SettingOperate/partials/Space/SpaceList";
import AddBuildingFloorModal from "pages/SettingOperate/partials/BuildingFloorList/partials/AddBuildingFloorModal";
import AddSpaceModal from "pages/SettingOperate/partials/Space/partials/AddSpaceModal";
import BuildingFloorList from "pages/SettingOperate/partials/BuildingFloorList/BuildingFloorList";
import moment from "moment";
import AddCxmSurvey from "./patials/AddCxmSurvey";
import CxmSurveyService from "services/CxmSurveyService";
import CxmQuestionList from "../CxmQuestionList/CxmQuestionList";
import AddCxmQuestion from "../CxmQuestionList/partials/AddCxmQuestion";
import CxmOptionList from "../CxmOptionList/CxmOptionList";
import AddCxmOption from "../CxmOptionList/partials/AddCxmOption";

export default function CxmSurveyList(props: any) {
  document.title = "Danh sách khảo sát";
  const navigate = useNavigate();

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listBuilding, setListBuilding] = useState<any[]>([]);
  const [dataSurvey, setDataSurvey] = useState<any>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAddCxmSurvey, setShowModalAddCxmSurvey] = useState<boolean>(false);
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
      name: "Danh sách khảo sát",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Danh sách khảo sát",
      is_active: "tab_one",
      type: 1,
    },
    // {
    //   title: "Sơ đồ phân cấp khảo sát",
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
    name: "khảo sát",
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

    const response = await CxmSurveyService.list(_params, abortController.signal);

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
    "Tên chiến dịch",
    "Mô tả khảo sát",
    "Người tạo chiến dịch",
    "Xem bộ câu hỏi",
    "Xem khách hàng",
    "Xem báo cáo",
    "Ngày bắt đầu",
    "Trạng thái",
  ];

  const dataFormat = ["text-center", "text-left", "text-left", "text-left", "text-left", "text-left", "text-left", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item?.title || "",
    item?.description || "",
    item?.employeeName || "",
    <div
      key={item.id}
      className={`action__view--customer`}
      onClick={() => {
        setStepQuestion(2);
        const updatedListNav = listNav.map((item, index) => {
          if (index === listNav.length - 1) {
            return { ...item, className: "title-first" };
          }
          return item;
        });
        setListNav([
          ...updatedListNav,
          {
            title: "Bộ câu hỏi",
            className: "title-last",
            callback: () => {
              setStepQuestion(2);
            },
          },
        ]);
        setDataSurvey(item);
      }}
    >
      <a>Xem bộ câu hỏi</a>
    </div>,
    <div key={item.id} className={`action__view--customer`} onClick={() => console.log("click")}>
      <a>Xem danh sách</a>
    </div>,
    <div key={item.id} className={`action__view--customer`} onClick={() => console.log("click")}>
      <a>Xem báo cáo</a>
    </div>,
    moment(item.createdTime).format("DD/MM/YYYY"),
    <Badge key={item.id} text={item.status === 0 ? "Ngừng khảo sát" : "Đang khảo sát"} variant={item.status == 0 ? "warning" : "success"} />,
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
    const isCheckedItem = listIdChecked?.length > 0;
    return item.headquarter === 1
      ? [
          {
            title: item.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động",
            icon: <Icon name={item.status == 2 ? "Lock" : "Unlock"} className={isCheckedItem ? "icon-disabled" : ""}/>,
            disabled: isCheckedItem,
            callback: () => {
              if (!isCheckedItem) {
              showDialogConfirmActiveBuilding(item);
              }
            },
          },

          {
            title: "Sửa",
            icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
            disabled: isCheckedItem,
            callback: () => {
              if (!isCheckedItem) {
              setDataSurvey(item);
              setShowModalAddCxmSurvey(true);
              }
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
            icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
            disabled: isCheckedItem,
            callback: () => {
              if (!isCheckedItem) {
              setDataSurvey(item);
              setShowModalAddCxmSurvey(true);
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
        ];
  };

  const onDelete = async (id: number) => {
    const response = await BuildingService.delete(id);

    if (response.code === 0) {
      showToast("Xóa khảo sát thành công", "success");
      getListBuilding(params);
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
      const found = listBuilding.find((item) => item.id === selectedId);
      if (found?.id) {
        return BuildingService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} chiến dịch khảo sát`, "success");
        getListBuilding(params);
        setListIdChecked([]);
      } else {
        showToast("Không có chiến dịch khảo sát nào được xóa", "error");
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
          Bạn có chắc chắn muốn xóa {item ? "khảo sát " : `${listIdChecked.length} khảo sát đã chọn`}
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
      title: "Xóa khảo sát",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const listFilter = useMemo(
    () =>
      [
        // {
        //   key: "operationProjectId",
        //   name: "Dự án",
        //   type: "select",
        //   is_featured: true,
        // },
      ] as IFilterItem[],
    []
  );

  const [listNav, setListNav] = useState<any[]>([
    {
      title: "Trải nghiệm khách hàng",
      className: "title-first",
      callback: () => {
        onBackProps(true);
      },
    },
    {
      title: "Danh sách khảo sát",
      className: "title-last",
      callback: () => {
        setStepQuestion(1);
      },
    },
  ]);

  const [stepQuestion, setStepQuestion] = useState<number>(1);

  useEffect(() => {
    if (stepQuestion == 1) {
      setListNav([
        {
          title: "Danh sách khảo sát",
          className: "title-first",
          callback: () => {
            setStepQuestion(1);
          },
        },
      ]);
    } else if (stepQuestion == 2) {
      setListNav([
        {
          title: "Danh sách khảo sát",
          className: "title-first",
          callback: () => {
            setStepQuestion(1);
          },
        },
        {
          title: "Bộ câu hỏi",
          className: "title-last",
          callback: () => {
            setStepQuestion(2);
          },
        },
      ]);
    } else if (stepQuestion == 3) {
      setListNav([
        {
          title: "Danh sách khảo sát",
          className: "title-first",
          callback: () => {
            setStepQuestion(1);
          },
        },
        {
          title: "Bộ câu hỏi",
          className: "title-first",
          callback: () => {
            setStepQuestion(2);
          },
        },
        {
          title: "Lựa chọn",
          className: "title-last",
          callback: () => {
            setStepQuestion(3);
          },
        },
      ]);
    }
  }, [stepQuestion]);

  // Đoạn này cho phần bộ câu hỏi
  const [dataCxmQuestion, setDataCxmQuestion] = useState<any>(null);
  const [showModalAddCxmQuestion, setShowModalAddCxmQuestion] = useState<boolean>(false);
  const [isReloadCxmQuestion, setIsReloadCxmQuestion] = useState<boolean>(false);

  // Đoạn này cho phần căn
  const [dataSpace, setDataSpace] = useState<any>(null);
  const [showModalAddOption, setShowModalAddSpace] = useState<boolean>(false);
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
          {stepQuestion > 1 && (
            <Button
              className="btn__add--branch"
              onClick={(e) => {
                e && e.preventDefault();
                setStepQuestion(stepQuestion - 1);
              }}
            >
              Quay lại
            </Button>
          )}
          <Button
            className="btn__add--branch"
            onClick={(e) => {
              e && e.preventDefault();
              if (stepQuestion == 1) {
                setDataSurvey(null);
                setShowModalAddCxmSurvey(true);
              } else if (stepQuestion == 2) {
                setDataCxmQuestion(null);
                setShowModalAddCxmQuestion(true);
              } else {
                setDataSpace(null);
                setShowModalAddSpace(true);
              }
            }}
          >
            {stepQuestion == 1 ? "Thêm mới khảo sát" : stepQuestion == 2 ? "Thêm mới câu hỏi" : "Thêm mới lựa chọn"}
          </Button>
        </div>
      </div>

      {stepQuestion == 1 ? (
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
                name="Tên khảo sát"
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
                      Hiện tại chưa có khảo sát nào. <br />
                      Hãy thêm mới khảo sát đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới khảo sát"
                  action={() => {
                    setDataSurvey(null);
                    setShowModalAddCxmSurvey(true);
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
      ) : stepQuestion == 2 ? (
        <CxmQuestionList
          setDataCxmQuestion={setDataCxmQuestion}
          setShowModalAddCxmQuestion={setShowModalAddCxmQuestion}
          isReloadCxmQuestion={isReloadCxmQuestion}
          dataSurvey={dataSurvey}
          setStepQuestion={setStepQuestion}
          listNav={listNav}
          setListNav={setListNav}
        />
      ) : stepQuestion == 3 ? (
        <CxmOptionList
          dataQuestion={dataCxmQuestion}
          setDataSpace={setDataSpace}
          setShowModalAddSpace={setShowModalAddSpace}
          reloadSpace={reloadSpace}
          setDataCxmQuestion={setDataCxmQuestion}
        />
      ) : null}

      <AddCxmSurvey
        onShow={showModalAddCxmSurvey}
        data={dataSurvey}
        onHide={(reload) => {
          if (reload) {
            getListBuilding(params);
          }
          setShowModalAddCxmSurvey(false);
        }}
      />
      <AddCxmQuestion
        onShow={showModalAddCxmQuestion}
        data={dataCxmQuestion}
        dataSurvey={dataSurvey}
        onHide={(reload) => {
          if (reload) {
            setIsReloadCxmQuestion(!isReloadCxmQuestion);
          }
          setShowModalAddCxmQuestion(false);
        }}
      />
      <AddCxmOption
        onShow={showModalAddOption}
        data={dataSpace}
        dataSurvey={dataSurvey}
        setDataCxmQuestion={setDataCxmQuestion}
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

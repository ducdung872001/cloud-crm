import React, { Fragment, useState, useEffect, useRef } from "react";
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
import { IAction, ISaveSearch } from "model/OtherModel";
import { IBranchListProps } from "model/beautyBranch/PropsModel";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { showToast } from "utils/common";
import BeautyBranchService from "services/BeautyBranchService";
import AddBranchModal from "./partials/AddBranchModal";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import { Chart } from "react-google-charts";

import "./BranchList.scss";
import EditParentBranch from "./EditParentBranch/EditParentBranch";

export default function BranchList(props: IBranchListProps) {
  document.title = "Danh sách chi nhánh";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listBranch, setListBranch] = useState<IBeautyBranchResponse[]>([]);
  const [dataBranch, setDataBranch] = useState<IBeautyBranchResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalEditParentBranch, setShowModalEditParentBranch] = useState<boolean>(false);
  const [params, setParams] = useState<IBeautyBranchFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách chi nhánh",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Danh sách chi nhánh",
      is_active: "tab_one",
      type: 1,
    },
    {
      title: "Sơ đồ phân cấp chi nhánh",
      is_active: "tab_two",
      type: 2,
    },
  ];

  const [tab, setTab] = useState({
    name: "tab_one",
    type: 1,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Chi nhánh",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListBranch = async (paramsSearch: IBeautyBranchFilterRequest) => {
    setIsLoading(true);

    const response = await BeautyBranchService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListBranch(result.items);

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
      getListBranch(params);
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

  const titles = ["STT", "Tên chi nhánh", "Địa chỉ", "Số điện thoại", "Là trụ sở", "Trạng thái chi nhánh"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: IBeautyBranchResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.address,
    item.phone,
    item.headquarter ? <Icon name="Checked" width="1.6rem" height="1.6rem" /> : "",
    <Badge key={item.id} text={item.status === 2 ? "Ngừng hoạt động" : "Đang hoạt động"} variant={item.status == 2 ? "warning" : "success"} />,
  ];

  const handleChangeActive = async (item) => {
    const body = {
      id: item.id,
    };

    let response = null;

    if (item.status == 2) {
      response = await BeautyBranchService.activate(body);
    } else {
      response = await BeautyBranchService.unActivate(body);
    }

    if (response.code === 0) {
      showToast(`Chi nhánh ${item.status == 2 ? "ngừng hoạt động" : "hoạt động"} thành công`, "success");
      getListBranch(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmActiveBranch = (item?: IBeautyBranchResponse) => {
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

  const actionsTable = (item: IBeautyBranchResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return item.headquarter === 1
      ? [
          {
            title: item.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động",
            icon: <Icon name={item.status == 2 ? "Lock" : "Unlock"} className={isCheckedItem ? "icon-disabled" : ""}/>,
            disabled: isCheckedItem,
            callback: () => {
                        if (!isCheckedItem) {
              showDialogConfirmActiveBranch(item);
                        }
            },
          },
          permissions["BEAUTY_BRANCH_UPDATE"] == 1 && {
            title: "Sửa",
            icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
                    disabled: isCheckedItem,
            callback: () => {
                        if (!isCheckedItem) {
              setDataBranch(item);
              setShowModalAdd(true);
                        }
            },
          },
        ]
      : [
          {
            title: item.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động",
            icon: <Icon name={item.status == 2 ? "Lock" : "Unlock"} className={isCheckedItem ? "icon-disabled" : ""}/>,
                    disabled: isCheckedItem,
            callback: () => {
                        if (!isCheckedItem) {
              showDialogConfirmActiveBranch(item);
                        }
            },
          },
          permissions["BEAUTY_BRANCH_UPDATE"] == 1 && {
            title: "Sửa",
            icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
                    disabled: isCheckedItem,
            callback: () => {
                        if (!isCheckedItem) {
              setDataBranch(item);
              setShowModalAdd(true);
                        }
            },
          },
          permissions["BEAUTY_BRANCH_DELETE"] == 1 && {
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
    const response = await BeautyBranchService.delete(id);

    if (response.code === 0) {
      showToast("Xóa chi nhánh thành công", "success");
      getListBranch(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        BeautyBranchService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xoá chi nhánh thành công", "success");
        getListBranch(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IBeautyBranchResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "chi nhánh " : `${listIdChecked.length} chi nhánh đã chọn`}
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
        if (listIdChecked.length > 0) {
          onDeleteAll();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["BEAUTY_BRANCH_DELETE"] == 1 && {
      title: "Xóa chi nhánh",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  ///Sơ đồ phân câos
  const [dataChart, setDataChart] = useState([]);
  console.log("dataChart", dataChart);
  const [branchId, setBranchId] = useState(null);
  console.log("branchId", branchId);

  const [parentArray, setParentArray] = useState([]);

  useEffect(() => {
    if (listBranch && listBranch.length > 0) {
      const parentArray = [];
      const newArray = [
        [
          {
            v: "",
            f: "",
          },
          "",
          "",
        ],
      ];
      listBranch.map((item) => {
        if (!item.parentId) {
          newArray.push([
            {
              v: item.name,
              f: `${item.name}`,
            },
            "",
            `${item.id}`,
          ]);

          parentArray.push([
            {
              v: item.name,
              f: `${item.name}`,
            },
            "",
            "",
          ]);

          setParentArray(parentArray);
        } else {
          newArray.push([
            {
              v: item.name,
              f: `${item.name}`,
            },
            item.parentName,
            `${item.id}`,
          ]);
        }
      });

      setDataChart(newArray);
    }
  }, [listBranch]);

  const options = {
    allowHtml: true,
  };

  return (
    <div className={`page-content page-branch${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt cơ sở
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách chi nhánh</h1>
        </div>
        {permissions["BEAUTY_BRANCH_ADD"] == 1 && (
          <Button
            className="btn__add--branch"
            onClick={(e) => {
              e && e.preventDefault();
              setDataBranch(null);
              setShowModalAdd(true);
            }}
          >
            Thêm mới
          </Button>
        )}
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
              name="Tên chi nhánh"
              params={params}
              // isSaveSearch={true}
              // listSaveSearch={listSaveSearch}
              updateParams={(paramsNew) => setParams(paramsNew)}
            />
          </div>
          {/* : null} */}
        </div>
        {tab.type == 1 ? (
          !isLoading && listBranch && listBranch.length > 0 ? (
            <BoxTable
              name="Chi nhánh"
              titles={titles}
              items={listBranch}
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
                      Hiện tại chưa có chi nhánh nào. <br />
                      Hãy thêm mới chi nhánh đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới chi nhánh"
                  action={() => {
                    setDataBranch(null);
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
          )
        ) : !isLoading && listBranch && listBranch.length > 0 ? (
          <div style={{ marginTop: 40, backgroundColor: "white", minHeight: "50rem", overflow: "auto", maxHeight: "55rem", padding: "0 2rem" }}>
            <Chart
              chartType="OrgChart"
              data={dataChart}
              options={options}
              width={"100%"}
              // width={parentArray.length > 0 ? `${parentArray.length <= 3 ? (parentArray.length * 40) : (parentArray.length * 20) }rem` : '100%'}
              chartEvents={[
                {
                  eventName: "select",
                  callback({ chartWrapper }) {
                    const chart: any = chartWrapper.getChart();
                    chart.container.addEventListener("click", (ev) => {
                      setBranchId(ev.target.attributes.title.value);
                      setShowModalEditParentBranch(true);
                    });
                  },
                },
              ]}
              // width = "100%"
              // height="400px"
            />
          </div>
        ) : (
          <Loading />
        )}
      </div>
      <AddBranchModal
        onShow={showModalAdd}
        data={dataBranch}
        onHide={(reload) => {
          if (reload) {
            getListBranch(params);
          }
          setShowModalAdd(false);
        }}
      />

      <EditParentBranch
        onShow={showModalEditParentBranch}
        branchId={branchId}
        onHide={(reload) => {
          if (reload) {
            getListBranch(params);
          }
          setShowModalEditParentBranch(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

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
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { formatCurrency, showToast } from "utils/common";
import { getPageOffset } from "reborn-util";

import "./ManagementFeeRateList.scss";
import AddManagementFeeRateModal from "./partials/AddManagementFeeRateModal";
import ManagementFeeService from "services/ManagementFeeService";
import moment from "moment";
import ManagementFeeRateService from "services/ManagementFeeRateService";
import OperationProjectService from "services/OperationProjectService";

export default function ManagementFeeRateList(props: any) {
  document.title = "Danh sách biểu giá phí quản lý";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listManagementFee, setListManagementFee] = useState<any[]>([]);
  const [dataManagementFee, setDataManagementFee] = useState<any>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
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
      name: "Danh sách biểu giá phí quản lý",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Danh sách biểu giá phí quản lý",
      is_active: "tab_one",
      type: 1,
    },
    // {
    //   title: "Sơ đồ phân cấp biểu giá phí quản lý",
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
  const getListManagementFee = async (paramsSearch: any) => {
    setIsLoading(true);

    const _params = {
      ...paramsSearch,
    };
    if (_params?.operationProjectId) {
      _params["projectId"] = _params["operationProjectId"];
      delete _params["operationProjectId"];
    }

    const response = await ManagementFeeRateService.list(_params, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListManagementFee(result.items);

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
      getListManagementFee(params);
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
    "Dự án",
    "Phí quản lý (VNĐ/m2/tháng)",
    "Ngày hiệu lực",
    "Ngày hết hiệu lực",
    //  "Trạng thái"
  ];

  const dataFormat = [
    "text-center",
    "text-left",
    "text-right",
    "text-center",
    "text-center",
    "text-center",
    //  "text-center"
  ];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.projectName || "",
    formatCurrency(item.ratePerM2, ".", " đ", "right"),
    moment(item.effectiveFrom).format("DD/MM/YYYY"),
    moment(item.effectiveTo).format("DD/MM/YYYY"),
    // <Badge key={item.id} text={item.status === 2 ? "Ngừng hiệu lực" : "Đang hiệu lực"} variant={item.status == 2 ? "warning" : "success"} />,
  ];

  const handleChangeActive = async (item) => {
    const body = {
      id: item.id,
    };

    // let response = null;

    // if (item.status == 2) {
    //   response = await BeautyManagementFeeService.activate(body);
    // } else {
    //   response = await BeautyManagementFeeService.unActivate(body);
    // }

    // if (response.code === 0) {
    //   showToast(`Dự án ${item.status == 2 ? "ngừng hoạt động" : "hoạt động"} thành công`, "success");
    //   getListManagementFee(params);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmActiveManagementFee = (item?: any) => {
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
              showDialogConfirmActiveManagementFee(item);
            },
          },

          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataManagementFee(item);
              setShowModalAdd(true);
            },
          },
        ]
      : [
          // {
          //   title: item.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động",
          //   icon: <Icon name={item.status == 2 ? "Lock" : "Unlock"} />,
          //   callback: () => {
          //     showDialogConfirmActiveManagementFee(item);
          //   },
          // },
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataManagementFee(item);
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
    const response = await ManagementFeeRateService.delete(id);

    if (response.code === 0) {
      showToast("Xóa biểu giá phí quản lý thành công", "success");
      getListManagementFee(params);
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
          Bạn có chắc chắn muốn xóa {item ? "biểu giá phí quản lý " : `${listIdChecked.length} biểu giá phí quản lý đã chọn`}
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
      title: "Xóa biểu giá phí quản lý",
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
            Cài đặt vận hành
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách biểu giá phí quản lý</h1>
        </div>

        <Button
          className="btn__add--branch"
          onClick={(e) => {
            e && e.preventDefault();
            setDataManagementFee(null);
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
              name="Tên biểu giá phí quản lý"
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
        {!isLoading && listManagementFee && listManagementFee.length > 0 ? (
          <BoxTable
            name="Dự án"
            titles={titles}
            items={listManagementFee}
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
                    Hiện tại chưa có biểu giá phí quản lý nào. <br />
                    Hãy thêm mới biểu giá phí quản lý đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới biểu giá phí quản lý"
                action={() => {
                  setDataManagementFee(null);
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
      <AddManagementFeeRateModal
        onShow={showModalAdd}
        data={dataManagementFee}
        onHide={(reload) => {
          if (reload) {
            getListManagementFee(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

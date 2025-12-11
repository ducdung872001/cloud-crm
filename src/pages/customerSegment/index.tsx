import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Badge from "components/badge/badge";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import CustomerService from "services/CustomerService";
import { getPageOffset } from "reborn-util";
import AddCustomerSegment from "./partials/AddCustomerSegment";
import ChangeStatusCustomerSegment from "./partials/ChangeStatusCustomerSegment";
import "./index.scss";

export default function CustomerSegment() {
  document.title = "Phân khúc khách hàng";

  const isMounted = useRef(false);

  const navigate = useNavigate();

  const [listCustomerSegment, setListCustomerSegment] = useState([]);
  const [dataCustomerSegment, setDataCustomerSegment] = useState(null);
  const [isChangeStatus, setIsChangeStatus] = useState<boolean>(false);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isViewModalAdd, setIsViewModalAdd] = useState<boolean>(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách phân khúc khách hàng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Phân khúc khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListCustomerSegment = async (paramsSearch) => {
    setIsLoading(true);

    const response = await CustomerService.filterAdvanced(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListCustomerSegment(result.items);

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
      getListCustomerSegment(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: showModalAdd ? "Quay lại" : "Thêm mới",
        callback: () => {
          if (showModalAdd) {
            setShowModalAdd(false);
            setIsViewModalAdd(false);
          } else {
            setDataCustomerSegment(null);
            setShowModalAdd(true);
          }
        },
      },
    ],
  };

  const titles = ["STT", "Tên phân khúc", "Mô tả phân khúc", "Số lượng khách hàng", "Trạng thái"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center"];

  /**
   * Trạng thái bộ lọc:
   * 1. draft: Chưa phê duyệt ==> Đã phê duyệt, Tạm dừng, Hủy.
   * 2. approved: Đã phê duyệt ==> Đang chạy, Tạm dừng, Hủy.
   * 3. paused: Tạm dừng ==> Đang chạy, Đã phê duyệt, Hủy.
   * 4. running: Đang chạy ==> Tạm dừng, Đã phê duyệt, Hủy.
   * 5. canceled: Hủy ==> Không thay đổi trạng thái
   */

  const dataMappingArray = (item, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.description,
    <div
      key={item.id}
      className={`action__view--customer`}
      onClick={() => {
        navigate(`/customer?contactType=-1&filterId=${item.id}`);
      }}
    >
      <a>Xem thêm</a>
    </div>,
    <Badge
      key={item.id}
      text={
        item.status === "draft"
          ? "Chưa phê duyệt"
          : item.status === "approved"
          ? "Đã phê duyệt"
          : item.status === "paused"
          ? "Tạm dừng"
          : // : item.status === "running"
            // ? "Đang chạy"
            "Hủy"
      }
      variant={
        item.status === "draft"
          ? "secondary"
          : item.status === "approved"
          ? "primary"
          : item.status === "paused"
          ? "warning"
          : // : item.status === "running"
            // ? "success"
            "error"
      }
    />,
  ];

  const actionsTable = (item): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Xem",
        icon: <Icon name="Eye" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataCustomerSegment(item);
          setShowModalAdd(true);
          setIsViewModalAdd(true);
          }
        },
      },
      ...(item.status !== "canceled"
        ? [
            {
              title: "Chuyển trạng thái",
              icon: <Icon name="FingerTouch" className={isCheckedItem ?"icon-disabled": "icon-warning"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataCustomerSegment(item);
                setIsChangeStatus(true);
                }
              },
            },
          ]
        : []),
      ...(item.status !== "canceled" && item.status !== "running" && item.status !== "approved"
        ? [
            {
              title: "Sửa",
              icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataCustomerSegment(item);
                setShowModalAdd(true);
                }
              },
            },
          ]
        : []),
      ...(item.status !== "running" && item.status !== "approved" && item.status !== "paused"
        ? [
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
          ]
        : []),
    ];
  };

  const onDelete = async (id: number) => {
    const response = await CustomerService.deleteFilterAdvanced(id);

    if (response.code === 0) {
      showToast("Xóa bộ lọc thành công", "success");
      getListCustomerSegment(params);
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
      const found = listCustomerSegment.find((item) => item.id === selectedId);
      if (found?.id) {
        return CustomerService.deleteFilterAdvanced(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} phân khúc khách hàng`, "success");
        getListCustomerSegment(params);
        setListIdChecked([]);
      } else {
        showToast("Không có phân khúc khách hàng nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "phân khúc khách hàng " : `${listIdChecked.length} phân khúc khách hàng đã chọn`}
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
      title: "Xóa phân khúc khách hàng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page__customer--segment${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              setShowModalAdd(false);
              setIsViewModalAdd(false);
            }}
            className="title-first"
            title="Quay lại"
          >
            Phân khúc khách hàng
          </h1>
          {showModalAdd && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setShowModalAdd(false);
                }}
              />
              <h1 className="title-last">{isViewModalAdd ? "Xem chi tiết" : dataCustomerSegment ? "Chỉnh sửa" : "Thêm mới"}</h1>
            </Fragment>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <div className={`${showModalAdd ? "d-none" : ""}`}>
          <SearchBox
            name="Tên phân khúc khách hàng"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listCustomerSegment && listCustomerSegment.length > 0 ? (
            <BoxTable
              name="Phân khúc khách hàng"
              titles={titles}
              items={listCustomerSegment}
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
              {isNoItem ? (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có phân khúc khách hàng nào. <br />
                      Hãy thêm mới phân khúc khách hàng đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới phân khúc khách hàng"
                  action={() => {
                    setDataCustomerSegment(null);
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

        <div className={`${showModalAdd ? "" : "d-none"}`}>
          <AddCustomerSegment
            data={dataCustomerSegment}
            onShow={showModalAdd}
            isView={isViewModalAdd}
            onReload={(reload) => {
              if (reload) {
                getListCustomerSegment(params);
              }
              setIsViewModalAdd(false);
              setShowModalAdd(false);
            }}
          />
        </div>
      </div>

      <ChangeStatusCustomerSegment
        onShow={isChangeStatus}
        data={dataCustomerSegment}
        onHide={(reload) => {
          if (reload) {
            getListCustomerSegment(params);
          }

          setIsChangeStatus(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

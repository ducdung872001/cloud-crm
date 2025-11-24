import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
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
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import PackageService from "services/PackageService";
import { showToast } from "utils/common";
import { formatCurrency, getPageOffset, isDifferenceObj } from "reborn-util";
import AddPackageModal from "./partials/AddPackageModal";
import { useSearchParams } from "react-router-dom";

import "tippy.js/animations/scale.css";

export default function Package() {
  document.title = "Quản lý gói giá";

  const isMounted = useRef(false);
  const [listPackage, setListPackage] = useState<any[]>();
  const [dataPackage, setDataPackage] = useState<any>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState<any>({
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách gói giá",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Gói giá",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "code",
        name: "Mã ứng dụng",
        type: "select",
        list: [
          { value: "crm", label: "CRM" },
          { value: "cms", label: "CMS" },
          { value: "web", label: "WEB" },
          { value: "app", label: "APP" },
          { value: "market", label: "Market" },
        ],
        is_featured: true,
        value: searchParams.get("code") ?? "",
      },
      {
        key: "status",
        name: "Trạng thái",
        type: "select",
        list: [
          { value: "0", label: "Tạm dừng" },
          { value: "1", label: "Đang hiệu lực" },
        ],
        is_featured: true,
        value: searchParams.get("status") ?? "",
      },
    ],
    [searchParams]
  );

  const abortController = new AbortController();

  const getListPackage = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await PackageService.lst(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListPackage(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +params.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListPackage(params);
      const paramsTemp: any = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
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
          setDataPackage(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên ứng dụng", "Tên gói", "Loại gói", "Giá gốc", "Giá ưu đãi", "Thời gian", "Số tháng tặng", "Trạng thái"];

  const dataFormat = ["text-center", "", "text-left", "text-left", "text-right", "text-right", "text-right", "text-right", "text-center"];

  const getPeriodName = (period: number) => {
    switch (period) {
      case 6:
        return "6 tháng";
      case 12:
        return "12 tháng";
      case 36:
        return "36 tháng";
      case 240:
        return "Vĩnh viễn";
    }
  };

  const getPackageTypeName = (periodType: number) => {
    switch (periodType) {
      case 1:
        return "Gói miễn phí";
      case 2:
        return "Gói cơ bản";
      case 3:
        return "Gói bạc";
      case 4:
        return "Gói vàng";
      case 5:
        return "Gói kim cương";
      default:
        return "";
    }
  };

  // IPackageResponseModel
  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.code,
    item.name,
    getPackageTypeName(item.packageType),
    formatCurrency(item.price, ",", "đ"),
    formatCurrency(item.priceDiscount, ",", "đ"),
    getPeriodName(item.period),
    item.periodBonus,
    <Badge key={index} text={item.status == 1 ? "Đang hiệu lực" : "Tạm dừng"} variant={item.status == 1 ? "success" : "warning"} />,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: item.status === 1 ? "Đang hiệu lực" : "Tạm dừng",
        icon: <Icon name={!item.status ? "WarningCircle" : "CheckedCircle"} className={!item.status ? "icon-warning" : "icon-success"} />,
        callback: () => {
          showDialogConfirm(item);
        },
      },
      ...(item.status !== 1
        ? [
            {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setDataPackage(item);
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
          ]
        : []),
    ];
  };

  const onDelete = async (id: number) => {
    const response = await PackageService.delete(id);

    if (response.code === 0) {
      showToast("Xóa gói giá thành công", "success");
      getListPackage(params);
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
          Bạn có chắc chắn muốn xóa {item ? "gói giá " : `${listIdChecked.length} gói giá đã chọn`}
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

  const handChangeStatus = async (item) => {
    if (!item) return;

    const body = {
      id: item.id,
      status: item.status ? 0 : 1,
    };

    const response = await PackageService.updateStatus(body);

    if (response.code === 0) {
      showToast("Cập nhật trạng thái thành công", "success");
      getListPackage(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirm = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>{item.status === 1 ? "Đang hiệu lực" : "Tạm dừng"}...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn chuyển sang trạng thái <strong>{item.status === 1 ? "tạm dừng" : "đang hiệu lực"}</strong> cho gói
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
        handChangeStatus(item);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa gói giá",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-package${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Quản lý gói giá" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên gói giá"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
          isFilter={true}
          listFilterItem={customerFilterList}
        />
        {!isLoading && listPackage && listPackage.length > 0 ? (
          <BoxTable
            name="Gói giá"
            titles={titles}
            items={listPackage}
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
            {!isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có gói giá nào. <br />
                    Hãy thêm mới gói giá đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới gói giá"
                action={() => {
                  setDataPackage(null);
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
      <AddPackageModal
        onShow={showModalAdd}
        data={dataPackage}
        onHide={(reload) => {
          if (reload) {
            getListPackage(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

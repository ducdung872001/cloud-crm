import React, { Fragment, useState, useEffect, useRef } from "react";
import cloneDeep from "lodash/cloneDeep";

import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IUnitFilterRequest, IUnitRequest } from "model/unit/UnitRequestModel";
import { IUnitResponse } from "model/unit/UnitResponseModel";
import { IProductUnitListProps } from "model/unit/PropsModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import UnitService from "services/UnitService";
import AddUnitModal from "./partials/AddUnitModal";
import { getPageOffset } from "reborn-util";

import "./ProductUnitList.scss";

export default function ProductUnitList(props: IProductUnitListProps) {
  document.title = "Danh mục đơn vị sản phẩm";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listUnit, setListUnit] = useState<IUnitResponse[]>([]);
  const [dataUnit, setDataUnit] = useState<IUnitResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<Record<string, unknown>>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<IUnitFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục đơn vị sản phẩm",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Đơn vị sản phẩm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListUnit = async (paramsSearch: IUnitFilterRequest) => {
    setIsLoading(true);

    const response = await UnitService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListUnit(result?.items ?? result);

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
    const paramsTemp = cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListUnit(params);
      const paramsTemp = cloneDeep(params);
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
      permissions["UNIT_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataUnit(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên đơn vị sản phẩm", "Trạng thái", "Thứ tự"];

  const dataFormat = ["text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item: IUnitResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    BoxViewInventoryStatus(item.status),
    item.position,
  ];
  const BoxViewInventoryStatus = (contractStatus) => {
    const getStatus = (code: number) => {
      switch (code) {
        case 0:
          return "Ngưng sử dụng";
        case 1:
          return "Đang sử dụng";
      }
    };

    const getStatusColor = (code: number) => {
      switch (code) {
        case 0:
          return "secondary";
        case 1:
          return "primary";
      }
    };

    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
        <span className={`status__item--signature status__item--signature-${getStatusColor(contractStatus)}`}>{getStatus(contractStatus)}</span>
      </div>
    );
  };

  const actionsTable = (item: IUnitResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["UNIT_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setDataUnit(item);
            setShowModalAdd(true);
          }
        },
      },
      permissions["UNIT_DELETE"] == 1 && {
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

  /**
   * Xoa don vi san pham:
   * - DVT chua duoc dung (khong co SP/bien the nao tham chieu) → xoa cung
   * - DVT dang duoc dung (co SP/bien the tham chieu) → backend reject, FE hoi chuyen "Ngung su dung"
   * Validate 2 tang: FE goi API delete → BE kiem tra tham chieu → reject neu co
   */
  const onHardDelete = async (id: number, name: string) => {
    try {
      const response = await UnitService.delete(id);
      if (response.code === 0) {
        showToast("Xóa đơn vị sản phẩm thành công", "success");
        getListUnit(params);
      } else {
        // Backend reject — DVT dang duoc su dung
        showToast(response.message ?? response.error ?? "Không thể xóa", "warning");
        setShowDialog(false);
        setContentDialog(null);
        showDialogDeactivateUnit(id, name, response.message ?? response.error ?? "");
        return;
      }
    } catch {
      showToast("Không thể xóa đơn vị sản phẩm", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeactivateUnit = async (id: number) => {
    try {
      const response = await UnitService.update({ id, status: 0 } as IUnitRequest);
      if (response.code === 0) {
        showToast("Đã chuyển đơn vị sang Ngừng sử dụng", "success");
        getListUnit(params);
      } else {
        showToast(response.message ?? response.error ?? "Có lỗi xảy ra", "error");
      }
    } catch {
      showToast("Không thể cập nhật trạng thái", "error");
    } finally {
      setShowDialog(false);
      setContentDialog(null);
    }
  };

  const showDialogDeactivateUnit = (id: number, name: string, reason: string) => {
    const dialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Không thể xóa đơn vị</Fragment>,
      message: (
        <Fragment>
          {reason && <p>{reason}</p>}
          <br />
          Bạn có muốn chuyển đơn vị <strong>{name}</strong> sang trạng thái <strong>Ngừng sử dụng</strong>?
          <br /><small>Các sản phẩm đang dùng đơn vị này sẽ không bị ảnh hưởng.</small>
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Ngừng sử dụng",
      defaultAction: () => onDeactivateUnit(id),
    };
    setContentDialog(dialog);
    setShowDialog(true);
  };

  const onDeleteAll = async () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    let deleted = 0;
    let deactivated = 0;

    for (const selectedId of selectedIds) {
      const found = listUnit.find((item) => item.id === selectedId);
      if (!found?.id) continue;
      const res = await UnitService.delete(found.id).catch(() => ({ code: -1 }));
      if (res.code === 0) {
        deleted++;
      } else {
        await UnitService.update({ id: found.id, status: 0 } as IUnitRequest).catch(() => {});
        deactivated++;
      }
    }

    const msgs: string[] = [];
    if (deleted > 0) msgs.push(`Đã xóa ${deleted} đơn vị`);
    if (deactivated > 0) msgs.push(`Đã ngừng sử dụng ${deactivated} đơn vị đang được dùng`);
    showToast(msgs.join(". ") || "Không có đơn vị nào được xử lý", deleted > 0 ? "success" : "warning");

    getListUnit(params);
    setListIdChecked([]);
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IUnitResponse) => {
    if (!item) {
      // Xoa hang loat
      const dialog: IContentDialog = {
        color: "error",
        className: "dialog-delete",
        isCentered: true,
        isLoading: true,
        title: <Fragment>Xóa đơn vị sản phẩm</Fragment>,
        message: (
          <Fragment>
            Bạn có chắc chắn muốn xử lý <strong>{listIdChecked.length} đơn vị</strong> đã chọn?
            <br /><br />
            <small>• Đơn vị chưa được dùng sẽ bị xóa vĩnh viễn<br />• Đơn vị đang được dùng sẽ chuyển sang Ngừng sử dụng</small>
          </Fragment>
        ),
        cancelText: "Hủy",
        cancelAction: () => { setShowDialog(false); setContentDialog(null); },
        defaultText: "Xác nhận",
        defaultAction: onDeleteAll,
      };
      setContentDialog(dialog);
      setShowDialog(true);
      return;
    }

    // Xoa 1 DVT
    const dialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa đơn vị sản phẩm</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa đơn vị <strong>{item.name}</strong>?
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => onHardDelete(item.id, item.name),
    };
    setContentDialog(dialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["UNIT_DELETE"] == 1 && {
      title: "Xóa đơn vị sản phẩm",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-product-unit${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt bán hàng
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh mục đơn vị</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên đơn vị sản phẩm"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listUnit && listUnit.length > 0 ? (
          <BoxTable
            name="Đơn vị sản phẩm"
            titles={titles}
            items={listUnit}
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
                    Hiện tại chưa có đơn vị sản phẩm nào. <br />
                    Hãy thêm mới đơn vị sản phẩm đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới đơn vị"
                action={() => {
                  setDataUnit(null);
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
      <AddUnitModal
        onShow={showModalAdd}
        data={dataUnit}
        onHide={(reload) => {
          if (reload) {
            getListUnit(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

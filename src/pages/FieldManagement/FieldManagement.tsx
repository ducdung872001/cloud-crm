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
import { showToast } from "utils/common";
import { formatCurrency, getPageOffset, isDifferenceObj } from "reborn-util";
import { useSearchParams } from "react-router-dom";
import FieldService from "services/FieldService";
import ModalAddField from "./ModalAddField/ModalAddField";

export default function FieldMannagement() {
  document.title = "Quản lý lĩnh vực";

  const isMounted = useRef(false);
  const [listField, setListField] = useState<any[]>();
  const [dataField, setDataField] = useState<any>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
    page: 1
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách lĩnh vực",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Lĩnh vực",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit, page: 1 }));
    },
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
    //   {
    //     key: "code",
    //     name: "Mã ứng dụng",
    //     type: "select",
    //     list: [
    //       { value: "crm", label: "CRM" },
    //       { value: "cms", label: "CMS" },
    //       { value: "web", label: "WEB" },
    //       { value: "app", label: "APP" },
    //       { value: "market", label: "Market" },
    //     ],
    //     is_featured: true,
    //     value: searchParams.get("code") ?? "",
    //   },
    //   {
    //     key: "status",
    //     name: "Trạng thái",
    //     type: "select",
    //     list: [
    //       { value: "0", label: "Tạm dừng" },
    //       { value: "1", label: "Đang hiệu lực" },
    //     ],
    //     is_featured: true,
    //     value: searchParams.get("status") ?? "",
    //   },
    ],
    [searchParams]
  );

  const abortController = new AbortController();

  const getListField = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await FieldService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListField(result.items);

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
      getListField(params);
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
          setDataField(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên lĩnh vực", "Mã lĩnh vực", "Tỉ lệ", "Thứ tự"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center"];

  // IPackageResponseModel
  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.code,
    item.name,
    item.rate,
    item.position
    // <Badge key={index} text={item.status == 1 ? "Đang hiệu lực" : "Tạm dừng"} variant={item.status == 1 ? "success" : "warning"} />,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
        {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataField(item);
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
    const response = await FieldService.delete(id);

    if (response.code === 0) {
      showToast("Xóa lĩnh vực thành công", "success");
      getListField(params);
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
          Bạn có chắc chắn muốn xóa {item ? "lĩnh vực " : `${listIdChecked.length} lĩnh vực đã chọn`}
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
      title: "Xóa lĩnh vực",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-field-management${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Quản lý lĩnh vực" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên lĩnh vực"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
          isFilter={true}
          listFilterItem={customerFilterList}
        />
        {!isLoading && listField && listField.length > 0 ? (
          <BoxTable
            name="Lĩnh vực"
            titles={titles}
            items={listField}
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
                    Hiện tại chưa có lĩnh vực nào. <br />
                    Hãy thêm mới lĩnh vực đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới lĩnh vực"
                action={() => {
                  setDataField(null);
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
      <ModalAddField
        onShow={showModalAdd}
        data={dataField}
        onHide={(reload) => {
          if (reload) {
            getListField(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

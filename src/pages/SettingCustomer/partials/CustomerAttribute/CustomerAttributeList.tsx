import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch, IFilterItem } from "model/OtherModel";
import { ICustomerAttributeResponse } from "model/customerAttribute/CustomerAttributeResponse";
import { ICustomerAttributeFilterRequest } from "model/customerAttribute/CustomerAttributeRequest";
import { ICustomerAttributeListProps } from "model/customerAttribute/PropsModel";
import CustomerAttributeService from "services/CustomerAttributeService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import AddCustomerAttributeModal from "./partials/AddCustomerAtributeModal";
import { getPageOffset } from 'reborn-util';
import { useSearchParams } from "react-router-dom";

import "./CustomerAttributeList.scss";

export default function CustomerAttributeList(props: ICustomerAttributeListProps) {
  document.title = "Định nghĩa trường thông tin bổ sung khách hàng";

  const { onBackProps } = props;

  const isMounted = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [listCustomerAttribute, setListCustomerAttribute] = useState<ICustomerAttributeResponse[]>([]);
  const [dataCustomerAttribute, setDataCustomerAttribute] = useState<ICustomerAttributeResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<ICustomerAttributeFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách trường thông tin bổ sung",
      is_active: true,
    },
  ]);

  const customerAttributeFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "custType", 
        name: "Loại khách hàng",
        type: "select",
        is_featured: true,
        value: searchParams.get("custType") ?? "",
      },
      {
        key: "datatype", 
        name: "Kiểu dữ liệu",
        type: "select",
        is_featured: true,
        value: searchParams.get("datatype") ?? "",
      },
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Trường thông tin bổ sung",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit, page: 1 }));
    },
  });

  const abortController = new AbortController();

  const getListCustomerAttribute = async (paramsSearch: ICustomerAttributeFilterRequest) => {
    setIsLoading(true);

    const response = await CustomerAttributeService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCustomerAttribute(result?.items);

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
      getListCustomerAttribute(params);
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

  const titleActions: ITitleActions = {
    actions: [
      permissions["CUSTOMER_ATTRIBUTE_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataCustomerAttribute(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Loại khách hàng", "Tên trường thông tin", "Kiểu dữ liệu", "Bắt buộc", "Thứ tự hiển thị", "Thuộc nhóm"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center", ""];

  const getCustTypeName = (custType: number) => {
    switch (custType) {
      case 0:
        return "Cá nhân";
      default:
        return "Doanh nghiệp";
    }
  }

  const dataMappingArray = (item: ICustomerAttributeResponse, index: number) => [
    getPageOffset(params) + index + 1,
    getCustTypeName(item.custType),
    item.name,
    item.datatype,
    item.required === 1 ? 
      <Icon name='Checked' style={{width: 20, fill:'var(--success-color'}} />
      : null,
    item.position,
    item.parentName
  ];

  const actionsTable = (item: ICustomerAttributeResponse): IAction[] => {
        const isCheckedItem = listIdChecked?.includes(item.id);
    return [
      permissions["CUSTOMER_ATTRIBUTE_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataCustomerAttribute(item);
          setShowModalAdd(true);
        },
      },
      permissions["CUSTOMER_ATTRIBUTE_DELETE"] == 1 && {
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

  const onDelete = async (id: number) => {
    const response = await CustomerAttributeService.delete(id);

    if (response.code === 0) {
      showToast("Xóa trường thông tin khách hàng thành công", "success");
      getListCustomerAttribute(params);
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
      const found = listCustomerAttribute.find((item) => item.id === selectedId);
      if (found?.id) {
        return CustomerAttributeService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} trường thông tin khách hàng`, "success");
        getListCustomerAttribute(params);
        setListIdChecked([]);
      } else {
        showToast("Không có trường thông tin khách hàng nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: ICustomerAttributeResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "trường thông tin khách hàng " : `${listIdChecked.length} trường thông tin khách hàng đã chọn`}
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
    permissions["CUSTOMER_ATTRIBUTE_DELETE"] == 1 && {
      title: "Xóa trường thông tin khách hàng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-customer-customer-attribute${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt khách hàng
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách trường thông tin bổ sung</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên trường thông tin"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerAttributeFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listCustomerAttribute && listCustomerAttribute.length > 0 ? (
          <BoxTable
            name="Trường thông tin khách hàng"
            titles={titles}
            items={listCustomerAttribute}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            isBulkAction={true}
            listIdChecked={listIdChecked}
            bulkActionItems={bulkActionList}
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
                    Hiện tại chưa có trường thông tin bổ sung nào. <br />
                    Hãy thêm mới trường thông tin bổ sung đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới trường thông tin bổ sung khách hàng"
                action={() => {
                  setListCustomerAttribute(null);
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
      <AddCustomerAttributeModal
        onShow={showModalAdd}
        data={dataCustomerAttribute}
        onHide={(reload) => {
          if (reload) {
            getListCustomerAttribute(params);
          }
          setShowModalAdd(false);
          setDataCustomerAttribute(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

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
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from 'reborn-util';
import { useSearchParams } from "react-router-dom";
import "./ServiceAttributeList.scss";
import AddServiceAttributeModal from "./partials/AddServiceAttributeModal";
import ServiceAttributeService from "services/ServiceAttributeService";

export default function ServiceAttributeList(props: any) {
  document.title = "Định nghĩa trường thông tin bổ sung dịch vụ";

  const { onBackProps } = props;

  const isMounted = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [listAttribute, setListAttribute] = useState([]);
  const [dataAttribute, setDataAttribute] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState({
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
    //   {
    //     key: "custType", 
    //     name: "Loại khách hàng",
    //     type: "select",
    //     is_featured: true,
    //     value: searchParams.get("custType") ?? "",
    //   },
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
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListAttribute = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ServiceAttributeService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListAttribute(result.items);

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
      getListAttribute(params);
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
      {
        title: "Thêm mới",
        callback: () => {
          setDataAttribute(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên trường thông tin", "Kiểu dữ liệu", "Thứ tự hiển thị", "Thuộc nhóm"];

  const dataFormat = ["text-center", "text-center", "", "text-center", "text-center", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.datatype,
    item.position,
    item.parentName
  ];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataAttribute(item);
          setShowModalAdd(true);
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
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await ServiceAttributeService.delete(id);

    if (response.code === 0) {
      showToast("Xóa trường thông tin dịch vụ thành công", "success");
      getListAttribute(params);
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
      const found = listAttribute.find((item) => item.id === selectedId);
      if (found?.id) {
        return ServiceAttributeService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} trường thông tin bổ sung`, "success");
        getListAttribute(params);
        setListIdChecked([]);
      } else {
        showToast("Không có trường thông tin nào được xóa", "error");
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
          Bạn có chắc chắn muốn xóa {item ? "trường thông tin dịch vụ " : `${listIdChecked.length} trường thông tin dịch vụ đã chọn`}
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
      title: "Xóa trường thông tin dịch vụ",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-service-attribute${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt dịch vụ
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
        {!isLoading && listAttribute && listAttribute.length > 0 ? (
          <BoxTable
            name="Trường thông tin dịch vụ"
            titles={titles}
            items={listAttribute}
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
                titleButton="Thêm mới trường thông tin bổ sung dịch vụ"
                action={() => {
                  setListAttribute(null);
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
      <AddServiceAttributeModal
        onShow={showModalAdd}
        data={dataAttribute}
        onHide={(reload) => {
          if (reload) {
            getListAttribute(params);
          }
          setShowModalAdd(false);
          setDataAttribute(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { IWorkTypeResponse } from "model/workType/WorkTypeResponseModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import CustomerService from "services/CustomerService";
import "./OpportunityList.scss";
import { useSearchParams } from "react-router-dom";
import ReportOpportunity from "./partials/ReportOpportunity";
import ModalAddOpp from "./partials/ModalAddOpp";

export default function OpportunityList() {
  document.title = "Danh sách cơ hội";

  const isMounted = useRef(false);

  const [listOpportunity, setLisOpportunity] = useState([]);
  const [dataOpportunity, setDataOpportunity] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const isCreate = searchParams.get("isCreate") || null;

  useEffect(() => {
    if (isCreate) {
      setDataOpportunity(null);
      setShowModalAdd(true);
    }
  }, [isCreate]);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch, setListSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách cơ hội",
      is_active: true,
    },
    // {
    //   key: "report",
    //   name: "Báo cáo cơ hội",
    //   is_active: false,
    // },
  ]);
  const [tabActive, setTabActive] = useState("all");

  useEffect(() => {
    setListSaveSearch(
      listSaveSearch.map((item) => {
        return {
          ...item,
          is_active: item.key === tabActive,
        };
      })
    );
  }, [tabActive]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "customerId",
        name: "Khách hàng",
        type: "select",
        is_featured: true,
        value: searchParams.get("customerId") ?? "",
      },
      {
        key: "employeeId",
        name: "Nhân viên",
        type: "select",
        is_featured: true,
        value: searchParams.get("employeeId") ?? "",
      },
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "cơ hội",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListOpportunity = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await CustomerService.lstOpportunity(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setLisOpportunity(result.items || []);

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
      getListOpportunity(params);
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
          setDataOpportunity(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên sản phẩm/dịch vụ", "Tên khách hàng", "Người quyết định"];

  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.productName || item.serviceName,
    item.customerName,
    item.contactName,
  ];

  const actionsTable = (item: IWorkTypeResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataOpportunity(item);
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
    ];
  };

  const onDelete = async (id: number) => {
    const response = await CustomerService.deleteOpportunity(id);

    if (response.code === 0) {
      showToast("Xóa loại cơ hội thành công", "success");
      getListOpportunity(params);
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
      const found = listOpportunity.find((item) => item.id === selectedId);
      if (found?.id) {
        return CustomerService.deleteOpportunity(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} cơ hội`, "success");
        getListOpportunity(params);
        setListIdChecked([]);
      } else {
        showToast("Không có cơ hội nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IWorkTypeResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "cơ hội " : `${listIdChecked.length} cơ hội đã chọn`}
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
      title: "Xóa loại cơ hội",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-opportunity-list${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Danh sách cơ hội" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên cơ hội"
          setTabActive={setTabActive}
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          // isFilter={true}
          isFilter={tabActive == "all" ? true : false}
          isHiddenSearch={tabActive == "all" ? false : true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {tabActive == "all" ? (
          <>
            {!isLoading && listOpportunity && listOpportunity.length > 0 ? (
              <BoxTable
                name="Danh sách cơ hội"
                titles={titles}
                items={listOpportunity}
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
                        Hiện tại chưa có cơ hội nào. <br />
                        Hãy thêm mới loại công việc đầu tiên nhé!
                      </span>
                    }
                    type="no-item"
                    titleButton="Thêm mới cơ hội"
                    action={() => {
                      setDataOpportunity(null);
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
          </>
        ) : (
          <>
            <ReportOpportunity />
          </>
        )}
      </div>

      <ModalAddOpp
        onShow={showModalAdd}
        data={dataOpportunity}
        onHide={(reload) => {
          if (reload) {
            getListOpportunity(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

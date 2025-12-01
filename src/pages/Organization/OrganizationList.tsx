import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import { isDifferenceObj, showToast } from "utils/common";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { useSearchParams } from "react-router-dom";
import _ from "lodash";
import moment from "moment";
import BeautySalonService from "services/BeautySalonService";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { getPageOffset } from "reborn-util";
import Badge from "components/badge/badge";
import AddOrg from "./partials/AddOrg";
import DetailApplication from "./partials/DetailApplication";

export default function OrganizationList() {
  document.title = "Danh sách tổ chức";

  const takeIdUserAdmin = localStorage.getItem("idUserAdmin");

  const [searchParams, setSearchParams] = useSearchParams();
  const [listBeautySalon, setListBeautySalon] = useState<any[]>([]);
  const [dataOrganization, setDataOrganization] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Tất cả tổ chức",
      is_active: true,
    },
  ]);

  const isMounted = useRef(false);

  const [params, setParams] = useState<any>({
    name: "",
  });

  const defaultFilterList: any = useMemo(
    () => [
      {
        key: "createdTime",
        name: "Thời gian",
        type: "date-two",
        param_name: ["startDate", "endDate"],
        is_featured: true,
        value: searchParams.get("startDate") ?? "",
        value_extra: searchParams.get("endDate") ?? "",
        is_fmt_text: true,
      },
      {
        key: "published",
        name: "Trạng thái",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "-3",
            label: "Tất cả",
          },
          {
            value: "-1",
            label: "Đã xóa",
          },
          {
            value: "1",
            label: "Được phê duyệt",
          },
          {
            value: "0",
            label: "Chưa phê duyệt",
          },
        ],
        value: searchParams.get("published") ?? "",
      },
      {
        key: "appCode",
        name: "Ứng dụng",
        type: "select",
        list: [
          { value: "crm", label: "CRM" },
          { value: "cms", label: "CMS" },
          { value: "web", label: "WEB" },
          { value: "app", label: "APP" },
          { value: "market", label: "Market" },
        ],
        is_featured: true,
        value: searchParams.get("appCode") ?? "",
      },
      ...(params?.appCode
        ? [
            {
              key: "appStatus",
              name: "Trạng thái gói",
              type: "select",
              list: [
                { value: "0", label: "Tất cả" },
                { value: "1", label: "Còn hiệu lực" },
                { value: "2", label: "Hết hạn trong 30 ngày" },
                { value: "3", label: "Đã hết hạn" },
              ],
              is_featured: true,
              value: searchParams.get("appStatus") ?? "",
            },
            {
              key: "packageId",
              name: "Danh sách gói giá",
              type: "select",
              is_featured: true,
              value: searchParams.get("packageId") ?? "",
            },
          ]
        : []),
    ],
    [searchParams, params]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Tổ chức",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListBeautySalon = async (paramsSearch: any) => {
    paramsSearch.sortedBy = "newest";

    setIsLoading(true);
    const response = await BeautySalonService.list(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setListBeautySalon(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && params.keyword === "" && +params.page === 1) {
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
    const paramsTemp = _.cloneDeep(params);

    if (!params?.appCode) {
      delete paramsTemp["appStatus"];
      delete paramsTemp["packageId"];

      setParams(paramsTemp);
    }
  }, [params?.appCode]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListBeautySalon(params);
      const paramsTemp = _.cloneDeep(params);
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
        if (!paramsTemp.appCode) {
          delete paramsTemp["appStatus"];
          delete paramsTemp["packageId"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  const [showModalAdd, setShowModalAdd] = useState<boolean>(() => {
    return takeIdUserAdmin ? true : false;
  });

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          setShowModalAdd(true);
          setDataOrganization(null);
        },
      },
    ],
  };

  const titles = ["STT", "Tên tổ chức", "Địa chỉ", "Số điện thoại", "Trạng thái", "Ngày tham gia", "Ứng dụng đã dùng"];

  const getPublishedName = (published: number) => {
    if (published == -1) {
      return "Đã xóa";
    }

    if (published == 1) {
      return "Được phê duyệt";
    }

    return "Chưa phê duyệt";
  };

  const [viewApplication, setViewApplication] = useState<boolean>(false);

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    <a
      key={item.id}
      target={"_blank"}
      href={`https://${process.env.APP_DOMAIN}/tham-my-vien/${item.pageLink}`}
      style={item.markDeleted == 1 ? { textDecoration: "line-through" } : {}}
      rel="noreferrer"
    >
      {item.name}
    </a>,
    item.address,
    item.phone,
    <Badge key={item.id} text={getPublishedName(item.published)} variant={item.published ? "success" : "warning"} />,
    moment(item.createdTime).format("DD/MM/YYYY HH:mm:ss"),
    <a
      key={item.id}
      onClick={() => {
        setViewApplication(true);
        setDataOrganization(item);
      }}
    >
      Xem
    </a>,
  ];

  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-center", "text-center"];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setShowModalAdd(true);
          setDataOrganization(item);
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

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa tổ chức</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "tổ chức " : `${listIdChecked.length} tổ chức đã chọn`}
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

  const onDelete = async (id: number) => {
    const response = await BeautySalonService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa tổ chức thành công`, "success");
      getListBeautySalon(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  return (
    <div className={`page-content page-beautysalon-next${isNoItem ? " bg-white" : ""}`}>
      {!viewApplication ? (
        <Fragment>
          <TitleAction title="Tổ chức" titleActions={titleActions} />
          <div className="card-box d-flex flex-column">
            <SearchBox
              name="Tổ chức"
              placeholderSearch="Tìm kiếm theo tên tổ chức"
              params={params}
              isSaveSearch={true}
              listSaveSearch={listSaveSearch}
              isFilter={true}
              listFilterItem={defaultFilterList}
              updateParams={(paramsNew) => {
                setParams(paramsNew);
              }}
            />

            {!isLoading && listBeautySalon && listBeautySalon.length > 0 ? (
              <BoxTable
                name="Tổ chức"
                titles={titles}
                items={listBeautySalon}
                isPagination={true}
                dataPagination={pagination}
                dataMappingArray={(item, index) => dataMappingArray(item, index)}
                dataFormat={dataFormat}
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
                        Hiện tại chưa có tổ chức nào. <br />
                      </span>
                    }
                    type="no-item"
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
            <AddOrg
              onShow={showModalAdd}
              onHide={(reload) => {
                if (reload) {
                  getListBeautySalon(params);
                }
                localStorage.removeItem("idUserAdmin");
                setShowModalAdd(false);
              }}
              id={dataOrganization?.id}
              idUserAdmin={+takeIdUserAdmin}
            />
            <Dialog content={contentDialog} isOpen={showDialog} />
          </div>
        </Fragment>
      ) : (
        <DetailApplication onShow={viewApplication} onHide={() => setViewApplication(false)} data={dataOrganization} />
      )}
    </div>
  );
}

import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { ICategoryServiceListProps } from "model/categoryService/PropsModel";
import { ICategoryServiceFilterRequest } from "model/categoryService/CategoryServiceRequestModel";
import { ICategoryServiceResponseModel } from "model/categoryService/CategoryServiceResponseModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import CategoryServiceService from "services/CategoryServiceService";
import { getPageOffset } from 'reborn-util';

import "./CategoryProductList.scss";
import AddCategoryProductModal from "./partials/AddCategoryProductModal";

export default function CategoryProductList(props: ICategoryServiceListProps) {
  document.title = "Danh mục sản phẩm";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listCategoryProduct, setListCategoryProduct] = useState<ICategoryServiceResponseModel[]>([]);
  const [dataCategoryProduct, setDataCategoryProduct] = useState<ICategoryServiceResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<ICategoryServiceFilterRequest>({
    keyword: "",
    limit: 10,
    type: 2
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục sản phẩm",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh mục sản phẩm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCategoryProduct = async (paramsSearch: ICategoryServiceFilterRequest) => {
    setIsLoading(true);

    const response = await CategoryServiceService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCategoryProduct(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && !params?.keyword && +result.page === 1) {
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
      getListCategoryProduct(params);
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
      permissions["PRODUCT_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataCategoryProduct(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Ảnh đại diện", "Tên danh mục", "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "text-center", "", "text-center"];

  const dataMappingArray = (item: ICategoryServiceResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    <a key={item.id} data-fancybox="gallery" href={item.avatar}>
      <Image src={item.avatar} alt={item.name} width={"64rem"} />
    </a>,
    item.name,
    item.position,
  ];

  const actionsTable = (item: ICategoryServiceResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return [
      permissions["PRODUCT_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataCategoryProduct(item);
          setShowModalAdd(true);
        },
      },
      permissions["PRODUCT_DELETE"] == 1 && {
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
    const response = await CategoryServiceService.delete(id);

    if (response.code === 0) {
      showToast("Xóa danh mục sản phẩm thành công", "success");
      getListCategoryProduct(params);
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
      const found = listCategoryProduct.find((item) => item.id === selectedId);
      if (found?.id) {
        return CategoryServiceService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} danh mục sản phẩm`, "success");
        getListCategoryProduct(params);
        setListIdChecked([]);
      } else {
        showToast("Không có danh mục sản phẩm nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: ICategoryServiceResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "danh mục sản phẩm " : `${listIdChecked.length} danh mục sản phẩm đã chọn`}
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
    permissions["PRODUCT_DELETE"] == 1 && {
      title: "Xóa danh mục sản phẩm",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-category-product${isNoItem ? " bg-white" : ""}`}>
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
          <h1 className="title-last">Danh mục sản phẩm</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên danh mục sản phẩm"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listCategoryProduct && listCategoryProduct.length > 0 ? (
          <BoxTable
            name="Dịch vụ"
            titles={titles}
            items={listCategoryProduct}
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
                    Hiện tại chưa có danh mục sản phẩm nào. <br />
                    Hãy thêm mới danh mục sản phẩm đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới danh mục sản phẩm"
                action={() => {
                  setDataCategoryProduct(null);
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
      <AddCategoryProductModal
        onShow={showModalAdd}
        data={dataCategoryProduct}
        onHide={(reload) => {
          if (reload) {
            getListCategoryProduct(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

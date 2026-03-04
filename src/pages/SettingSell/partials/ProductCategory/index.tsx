// ProductCategoryList.tsx
import React, { Fragment, useState, useEffect, useRef } from "react";
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
import { IAction } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { MOCK_PRODUCT_CATEGORIES } from "@/assets/mock/Product";
// import { MOCK_PRODUCT_CATEGORIES } from "assets/mock/ProductCategory";
import AddProductCategoryModal from "./partials/AddNewCategory"
import "./styles.scss";
import { getPageOffset } from "reborn-util";

export default function ProductCategoryList(props: any) {
  document.title = "Danh mục nhóm sản phẩm";

  const { onBackProps } = props;
  const isMounted = useRef(false);

  const [listCategory, setListCategory] = useState([]);
  const [dataCategory, setDataCategory] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions] = useState(getPermissions());

  const [params, setParams] = useState({
    name: "",
    limit: 10,
    page: 1,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nhóm sản phẩm",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  // Lấy danh sách (mock)
  const getListCategory = (paramsSearch: any) => {
    setIsLoading(true);

    setTimeout(() => {
      let filtered = MOCK_PRODUCT_CATEGORIES.filter((item) =>
        item.name.toLowerCase().includes((paramsSearch.name ?? "").toLowerCase())
      );

      const total = filtered.length;
      const page = paramsSearch.page ?? 1;
      const limit = paramsSearch.limit ?? 10;
      const items = filtered.slice((page - 1) * limit, page * limit);

      setListCategory(items);
      setPagination((prev) => ({
        ...prev,
        page,
        sizeLimit: limit,
        totalItem: total,
        totalPage: Math.ceil(total / limit),
      }));

      if (total === 0 && page === 1) setIsNoItem(true);
      else setIsNoItem(false);

      setIsLoading(false);
    }, 300); // giả lập delay API
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    getListCategory(params);
  }, [params]);

  useEffect(() => {
    getListCategory(params);
  }, []);

  // Title actions
  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          setDataCategory(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  // Table config
  const titles = ["STT", "Tên nhóm sản phẩm", "Số sản phẩm", "Thứ tự", "Trạng thái"];
  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center"];

  const renderStatus = (status: number) => (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
      <span className={`status__item--signature status__item--signature-${status === 1 ? "primary" : "secondary"}`}>
        {status === 1 ? "Đang sử dụng" : "Ngừng sử dụng"}
      </span>
    </div>
  );

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.productCount,
    item.position,
    renderStatus(item.status),
  ];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setDataCategory(item);
            setShowModalAdd(true);
          }
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) showDialogConfirmDelete(item);
        },
      },
    ];
  }; 

  // Delete
  const onDelete = (id: number) => {
    // TODO: gọi API xóa thực tế
    showToast("Xóa nhóm sản phẩm thành công", "success");
    getListCategory(params);
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = () => {
    if (!listIdChecked.length) return;
    // TODO: gọi API xóa hàng loạt
    showToast(`Xóa thành công ${listIdChecked.length} nhóm sản phẩm`, "success");
    getListCategory(params);
    setListIdChecked([]);
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: any) => {
    const content: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa nhóm sản phẩm</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa{" "}
          {item ? (
            <>nhóm sản phẩm <strong>{item.name}</strong></>
          ) : (
            <>{listIdChecked.length} nhóm sản phẩm đã chọn</>
          )}
          ? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        item?.id ? onDelete(item.id) : onDeleteAll();
      },
    };
    setContentDialog(content);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa nhóm sản phẩm",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-product-category${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1 onClick={() => onBackProps(true)} className="title-first" title="Quay lại">
            Cài đặt bán hàng
          </h1>
          <Icon name="ChevronRight" onClick={() => onBackProps(true)} />
          <h1 className="title-last">Danh mục nhóm sản phẩm</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên nhóm sản phẩm"
          params={params}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />

        {!isLoading && listCategory.length > 0 ? (
          <BoxTable
            name="Nhóm sản phẩm"
            titles={titles}
            items={listCategory}
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
                    Hiện tại chưa có nhóm sản phẩm nào. <br />
                    Hãy thêm mới nhóm sản phẩm đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới nhóm"
                action={() => {
                  setDataCategory(null);
                  setShowModalAdd(true);
                }}
              />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Không có dữ liệu trùng khớp. <br />
                    Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                  </span>
                }
                type="no-result"
              />
            )}
          </Fragment>
        )}
      </div>

      <AddProductCategoryModal
        onShow={showModalAdd}
        data={dataCategory}
        onHide={(reload) => {
          if (reload) getListCategory(params);
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
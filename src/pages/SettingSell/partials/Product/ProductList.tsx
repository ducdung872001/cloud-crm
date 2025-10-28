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
import { IProductListProps } from "model/product/PropsModel";
import { IProductFilterRequest } from "model/product/ProductRequestModel";
import { IProductResponse } from "model/product/ProductResponseModel";
import { showToast } from "utils/common";
import { formatCurrency, getPageOffset } from "reborn-util";
import ProductService from "services/ProductService";
import AddProductModal from "./partials/AddProductModal";
import { getPermissions } from "utils/common";
import "./ProductList.scss";
import ConfigProductModal from "./ConfigProductModal/ConfigProductModal";
import CustomerCharacteristics from "pages/Common/CustomerCharacteristics";
import PermissionService from "services/PermissionService";
import Tippy from "@tippyjs/react";
import ConfigIntegrateModal from "./ConfigIntegrateModal/ConfigIntegrateModal";
import DetailProductModal from "./DetailProduct/DetailProductModal";

export default function ProductList(props: IProductListProps) {
  document.title = "Danh sách sản phẩm";

  const { onBackProps } = props;

  const isMounted = useRef(false);
  const targetBsnId_product = localStorage.getItem("targetBsnId_product");
  // console.log('targetBsnId_product', targetBsnId_product);

  const [listProduct, setListProduct] = useState<IProductResponse[]>([]);
  const [idProduct, setIdProduct] = useState<number>(null);
  const [dataProduct, setDataProduct] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalConfig, setShowModalConfig] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [tab, setTab] = useState("tab_one");
  const [listPartner, setListPartner] = useState([]);
  const [showModalDetail, setShowModalDetail] = useState<boolean>(false);

  // console.log('listPartner', listPartner);
  const [targetBsnId, setTargetBsnId] = useState(targetBsnId_product ? +targetBsnId_product : null);
  useEffect(() => {
    localStorage.setItem("targetBsnId_product", JSON.stringify(targetBsnId));
  }, [targetBsnId]);

  const [params, setParams] = useState<IProductFilterRequest>({
    name: "",
    limit: 10,
    page: 1,
  });

  const [paramsProductPartner, setParamsProductPartner] = useState({
    name: "",
    limit: 10,
    page: 1,
    targetBsnId: null,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách sản phẩm",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Danh sách sản phẩm",
      is_active: "tab_one",
    },
    {
      title: "Danh sách sản phẩm của đối tác",
      is_active: "tab_two",
    },
  ];

  const colorData = [
    "#E98E4C",
    "#ED6665",
    "#FFBF00",
    "#9966CC",
    "#6A5ACD",
    "#007FFF",
    "#993300",
    "#F0DC82",
    "#CC5500",
    "#C41E3A",
    "#ACE1AF",
    "#7FFF00",
    "#FF7F50",
    "#BEBEBE",
    "#FF00FF",
    "#C3CDE6",
    "#FFFF00",
    "#40826D",
    "#704214",
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Sản phẩm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [paginationPartner, setPaginationPartner] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Sản phẩm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParamsProductPartner((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParamsProductPartner((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListProduct = async (paramsSearch: any, tab) => {
    setIsLoading(true);

    let response = null;

    if (tab === "tab_one") {
      response = await ProductService.list(paramsSearch, abortController.signal);
    } else {
      if (!paramsSearch.targetBsnId) {
        setListProduct([]);
        setIsLoading(false);
        setIsNoItem(true);
        return;
      } else {
        response = await ProductService.listShared(paramsSearch, abortController.signal);
      }
    }

    if (response.code === 0) {
      const result = response.result;
      setListProduct(result.items);

      if (tab === "tab_one") {
        setPagination({
          ...pagination,
          page: +result.page,
          sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
        });
      } else {
        setPaginationPartner({
          ...paginationPartner,
          page: +result.page,
          sizeLimit: paramsProductPartner.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(paramsProductPartner.limit ?? DataPaginationDefault.sizeLimit)),
        });
      }

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
      if (tab === "tab_one") {
        getListProduct(params, tab);
      }

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
  }, [params, tab]);

  const getListPartner = async () => {
    const params = {
      limit: 100,
      status: 1,
      requestCode: "product",
    };

    const response = await PermissionService.requestPermissionSource(params);

    if (response.code === 0) {
      const result = response.result.items || [];
      const newList = [];
      result.map((item, index) => {
        if (newList.filter((el) => el.targetBsnId === item.targetBsnId).length === 0) {
          newList.push({
            name: item.targetBranchName,
            targetBsnId: item.targetBsnId,
            color: colorData[index],
          });
        }
      });

      setListPartner(newList);

      // const newList = result.items?.map((el, index) => {
      //   return {
      //     name: el.targetBranchName,
      //     targetBsnId: el.targetBsnId,
      //     color: colorData[index],
      //   }
      // })
      // setListPartner(newList);
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getListPartner();
  }, []);

  const titleActions: ITitleActions = {
    actions: [
      ...(tab === "tab_one"
        ? [
            permissions["PRODUCT_ADD"] == 1 && {
              title: "Thêm mới",
              callback: () => {
                setIdProduct(null);
                setShowModalAdd(true);
              },
            },
          ]
        : []),
    ],
  };

  const titles = ["STT", "Tên sản phẩm", "Phân loại", "Ảnh sản phẩm", "Thứ tự hiển thị", "Đơn vị tính", "Giá bán"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-center", "text-right"];

  const dataMappingArray = (item: IProductResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.type == 1 ? "Thành phẩm" : "Vật tư tiêu hao",
    <a key={item.id} data-fancybox="gallery" href={item.avatar}>
      <Image src={item.avatar} alt={item.name} width={"64rem"} />
    </a>,
    item.position,
    item.unitName,
    formatCurrency(item.price),
  ];

  const actionsTable = (item: IProductResponse): IAction[] => {
    return [
      ...(tab === "tab_one"
        ? [
            {
              title: "Đặc trưng khách hàng",
              icon: <Icon name="Tag" style={{ width: 18 }} />,
              callback: () => {
                setIdProduct(item.id);
                setShowModalConfig(true);
              },
            },
            {
              title: "Chi tiết sản phẩm",
              icon: <Icon name="CollectInfo" style={{ width: 17 }} />,
              callback: () => {
                setDataProduct(item);
                setShowModalDetail(true);
              },
            },
            permissions["PRODUCT_UPDATE"] == 1 && {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setIdProduct(item.id);
                setShowModalAdd(true);
                setDataProduct(item);
              },
            },
            permissions["PRODUCT_DELETE"] == 1 && {
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
    const response = await ProductService.delete(id);

    if (response.code === 0) {
      showToast("Xóa sản phẩm thành công", "success");
      getListProduct(params, tab);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IProductResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "sản phẩm " : `${listIdChecked.length} sản phẩm đã chọn`}
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
    permissions["PRODUCT_DELETE"] == 1 && {
      title: "Xóa sản phẩm",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const handlClickPartner = (e, value) => {
    setTargetBsnId(value);
  };

  useEffect(() => {
    if (listPartner && listPartner.length > 0) {
      setParamsProductPartner({ ...paramsProductPartner, targetBsnId: targetBsnId ? targetBsnId : listPartner[0].targetBsnId });

      if (!targetBsnId) {
        setTargetBsnId(listPartner[0].targetBsnId);
      }
    }
  }, [targetBsnId, listPartner]);

  useEffect(() => {
    if (tab === "tab_two") {
      getListProduct(paramsProductPartner, tab);
    }
  }, [paramsProductPartner, tab]);

  const [isConfigIntegrateModal, setIsConfigIntegrateModal] = useState(false);

  return (
    <div className={`page-content page-product${isNoItem ? " bg-white" : ""}`}>
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
          <h1 className="title-last">Danh sách sản phẩm</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column" style={tab === "tab_one" ? {} : { marginTop: "2rem" }}>
        {/* <SearchBox
          name="Tên sản phẩm"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        /> */}

        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              {listTabs.map((item, idx) =>
                listPartner && listPartner.length > 0 ? (
                  <li
                    key={idx}
                    className={item.is_active == tab ? "active" : ""}
                    onClick={(e) => {
                      e && e.preventDefault();
                      setTab(item.is_active);
                    }}
                  >
                    {item.title}
                  </li>
                ) : item.is_active === "tab_one" ? (
                  <li
                    key={idx}
                    className={item.is_active == tab ? "active" : ""}
                    onClick={(e) => {
                      e && e.preventDefault();
                      setTab(item.is_active);
                    }}
                  >
                    {item.title}
                  </li>
                ) : null
              )}
            </ul>

            <Tippy content="Cấu hình tích hợp">
              <div
                className="setting_action"
                onClick={() => {
                  setIsConfigIntegrateModal(true);
                }}
              >
                <Icon name="Settings" style={{ width: 23 }} />
              </div>
            </Tippy>
          </div>

          {tab === "tab_two" && listPartner && listPartner.length > 0 ? (
            <div className="list-partner">
              <div className="list__relationship">
                {listPartner.map((item, idx) => {
                  return item.name ? (
                    <div
                      key={idx}
                      className={`relationship-item ${item.targetBsnId == targetBsnId ? "active__relationship--item" : ""}`}
                      style={{ backgroundColor: item.color, color: item.colorText }}
                      onClick={(e) => {
                        e && e.preventDefault();
                        handlClickPartner(e, item.targetBsnId);
                      }}
                    >
                      {item.name}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ) : null}

          {/* <div className={tab == 'tab_one' ? "" : "d-none"}> */}
          <SearchBox
            name="Tên sản phẩm"
            params={tab == "tab_one" ? params : paramsProductPartner}
            // isSaveSearch={true}
            // listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => {
              if (tab == "tab_one") {
                setParams(paramsNew);
              } else {
                setParamsProductPartner(paramsNew);
              }
            }}
          />
          {/* </div> */}
        </div>

        {!isLoading && listProduct && listProduct.length > 0 ? (
          <BoxTable
            name="Sản phẩm"
            titles={titles}
            items={listProduct}
            isPagination={true}
            dataPagination={tab === "tab_one" ? pagination : paginationPartner}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            listIdChecked={tab === "tab_one" ? listIdChecked : null}
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
                    Hiện tại chưa có sản phẩm nào. <br />
                    {tab == "tab_one" ? `Hãy thêm mới sản phẩm đầu tiên nhé!` : ""}
                  </span>
                }
                type="no-item"
                titleButton={tab == "tab_one" ? "Thêm mới sản phẩm" : ""}
                action={() => {
                  if (tab == "tab_one") {
                    setIdProduct(null);
                    setShowModalAdd(true);
                  }
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
      <AddProductModal
        onShow={showModalAdd}
        idProduct={idProduct}
        data={dataProduct}
        onHide={(reload) => {
          if (reload) {
            getListProduct(params, tab);
          }
          setShowModalAdd(false);
          setDataProduct(null);
        }}
      />

      {/* <ConfigProductModal
        onShow={showModalConfig}
        idProduct={idProduct}
        onHide={(reload) => {
          // if (reload) {
          //   getListProduct(params);
          // }
          setShowModalConfig(false);
        }}
      /> */}
      <CustomerCharacteristics
        onShow={showModalConfig}
        data={idProduct}
        typeProps="product"
        onHide={(reload) => {
          if (reload) {
            // nếu có thì làm gì đó ở đây
          }

          setShowModalConfig(false);
        }}
      />

      <ConfigIntegrateModal
        onShow={isConfigIntegrateModal}
        type="product"
        onHide={(reload) => {
          if (reload) {
            // setShowModalSetingFS(true);
          }

          setIsConfigIntegrateModal(false);
        }}
      />
      <DetailProductModal
        onShow={showModalDetail}
        data={dataProduct}
        onHide={(reload) => {
          if (reload) {
            getListProduct(params, tab);
          }
          setShowModalDetail(false);
          setDataProduct(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

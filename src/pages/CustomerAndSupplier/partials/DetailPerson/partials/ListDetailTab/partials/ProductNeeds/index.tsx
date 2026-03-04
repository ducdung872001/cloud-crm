import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import moment from "moment";
import Button from "components/button/button";
import { formatCurrency, getPageOffset } from "reborn-util";
import { showToast } from "utils/common";
import { PaginationProps, DataPaginationDefault } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import { IAction } from "model/OtherModel";
import Icon from "components/icon";
import ModalAddData from "./partials/ModalAddData";
import ProductDemandService from "services/fintech/ProductDemandService";

import "./index.scss";

export default function ProductNeeds({ data }) {
  const [listProductNeeds, setListProductNeeds] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataProductNeeds, setDataProductNeeds] = useState<any>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
    customerId: data.id,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nhu cầu sản phẩm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListProductNeeds = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ProductDemandService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListProductNeeds(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params?.name && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListProductNeeds(params);
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

  const titles = ["STT", "Loại sản phẩm", "Tên sản phẩm", "Thời gian sử dụng", "Số lượng đã dùng", "Sản phẩm yêu thích", "Đánh giá sản phẩm", "Chi phí sử dụng sản phẩm"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center", "", "", "text-right"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.type,
    item.name,
    item.usedTime ? moment(item.usedTime).format("DD/MM/YYYY") : "",
    item.quantity,
    item.favorites,
    item.statistics,
    formatCurrency(item.costs, ","),
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataProductNeeds(item);
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

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const onDelete = async (id: number) => {
    const response = await ProductDemandService.delete(id);

    if (response.code === 0) {
      showToast("Xóa nhu cầu sản phẩm thành công", "success");
      getListProductNeeds(params);
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
          Bạn có chắc chắn muốn xóa nhu cầu sản phẩm
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

  return (
    <div className={`page-content product-needs${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách nhu cầu sản phẩm</li>
            </ul>
            <Tippy content="Thêm mới nhu cầu sản phẩm" delay={[100, 0]} animation="scale-extreme">
              <div className="add-ticket">
                <Button
                  color="success"
                  onClick={() => {
                    setDataProductNeeds(null);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
        </div>
        {!isLoading && listProductNeeds && listProductNeeds.length > 0 ? (
          <BoxTable
            name="Nhu cầu sản phẩm"
            titles={titles}
            items={listProductNeeds}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            <SystemNotification
              description={
                <span>
                  Hiện tại chưa có nhu cầu sản phẩm nào. <br />
                  Hãy thêm mới nhu cầu sản phẩm đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm nhu cầu sản phẩm"
              action={() => {
                setDataProductNeeds(null);
                setShowModalAdd(true);
              }}
            />
          </Fragment>
        )}
      </div>
      <ModalAddData
        customerId={params.customerId}
        onShow={showModalAdd}
        onHide={(reload) => {
          if (reload) {
            getListProductNeeds(params);
          }

          setShowModalAdd(false);
        }}
        dataProps={dataProductNeeds}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

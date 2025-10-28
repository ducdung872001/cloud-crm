import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import moment from "moment";
import Button from "components/button/button";
import { formatCurrency, getPageOffset } from "reborn-util";
import { CircularProgressbar } from "react-circular-progressbar";
import { showToast } from "utils/common";
import { PaginationProps, DataPaginationDefault } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import AddManagementOpportunityModal from "pages/ManagementOpportunity/partials/AddManagementOpportunityModal";

import "./CustomerOpportunity.scss";
import { IAction } from "model/OtherModel";
import Icon from "components/icon";

export default function CustomerOpportunity({ dataCustomer }) {
  const [listOpportunity, setListOpportunity] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idOpportunity, setIdOpportunity] = useState<number>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
    customerId: dataCustomer.id,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Cơ hội",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListManagementOpportunity = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await CampaignOpportunityService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListOpportunity(result.items);

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
      getListManagementOpportunity(params);
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

  const titles = [
    "STT",
    "Tên chiến dịch",
    "Ngày kết thúc",
    "Khách hàng",
    "Người phụ trách",
    "Sản phẩm/Dịch vụ",
    "Doanh thu dự kiến",
    "Xác suất thành công",
  ];

  const dataFormat = ["text-center", "", "text-center", "", "", "", "text-right", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.campaignName,
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
    item.customerName,
    item.saleName,
    item.opportunity.productName || item.opportunity.serviceName,
    formatCurrency(item.expectedRevenue || "0"),
    <div key={item.id} className="percent__finish--opportunity">
      <CircularProgressbar value={item.percent || 0} text={`${item.percent || 0}%`} className="value-percent" />
    </div>,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      ...(item.status == 2 || item.status == 3
        ? []
        : [
            {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setIdOpportunity(item.id);
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
          ]),
    ];
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const onDelete = async (id: number) => {
    const response = await CampaignOpportunityService.delete(id);

    if (response.code === 0) {
      showToast("Xóa cơ hội thành công", "success");
      getListManagementOpportunity(params);
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
          Bạn có chắc chắn muốn xóa cơ hội
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
    <div className={`page-content customer__opportunity${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách cơ hội</li>
            </ul>
            <Tippy content="Thêm mới cơ hội" delay={[100, 0]} animation="scale-extreme">
              <div className="add-ticket">
                <Button
                  color="success"
                  onClick={() => {
                    setIdOpportunity(null);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
        </div>
        {!isLoading && listOpportunity && listOpportunity.length > 0 ? (
          <BoxTable
            name="Cơ hội"
            titles={titles}
            items={listOpportunity}
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
                  Hiện tại chưa có cơ hội nào. <br />
                  Hãy thêm mới cơ hội đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm mới cơ hội"
              action={() => {
                setIdOpportunity(null);
                setShowModalAdd(true);
              }}
            />
          </Fragment>
        )}
      </div>
      <AddManagementOpportunityModal
        onShow={showModalAdd}
        idData={idOpportunity}
        dataCustomerProps={dataCustomer}
        onHide={(reload) => {
          if (reload) {
            getListManagementOpportunity(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

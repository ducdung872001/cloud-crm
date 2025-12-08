import React, { Fragment, useState, useEffect } from "react";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction from "components/titleAction/titleAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAction } from "model/OtherModel";
import { IInvoiceDetailFilterRequest } from "model/invoice/InvoiceRequestModel";
import { IInvoiceCreateResponse, IInvoiceDetailResponse } from "model/invoice/InvoiceResponse";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import InvoiceService from "services/InvoiceService";
import ProductImportService from "services/ProductImportService";
import AddProductImportModal from "./partials/AddProductImportModal/AddProductImportModal";
import PaymentImportInvoices from "./PaymentImportInvoices";
import { getPageOffset } from "reborn-util";

import "./CreateReceipt.scss";

export default function CreateReceipt() {
  document.title = "Tạo phiếu nhập hàng";

  const [invoiceId, setInvoiceId] = useState<number>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listInvoiceDetail, setListInvoiceDetail] = useState<IInvoiceDetailResponse[]>([]);
  const [dataInvoiceDetail, setDataInvoiceDetail] = useState<IInvoiceDetailResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  //! Biến này tạo ra với mục đích lấy thông tính toán hóa đơn nhập hàng
  const [dataCreate, setDataCreate] = useState<IInvoiceCreateResponse>({
    id: 0,
    amount: 0,
    discount: 0,
    fee: 0,
    paid: 0,
    debt: 0,
    paymentType: 1,
    vatAmount: 0,
    receiptDate: "",
    inventoryId: null,
    invoiceType: "IV4",
  });

  const [params] = useState<IInvoiceDetailFilterRequest>({
    invoiceType: "IV4",
  });

  const abortController = new AbortController();

  const getListInvoiceDetail = async (paramsSearch: IInvoiceDetailFilterRequest) => {
    setIsLoading(true);
    const response = await InvoiceService.invoiceDetail(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result.importedProducts;
      const idInvoice = response.result.invoiceId;
      setListInvoiceDetail(result);
      setInvoiceId(idInvoice);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getListInvoiceDetail(params);
  }, [params]);

  useEffect(() => {
    let totalAmount = 0;

    if (listInvoiceDetail?.length == 0) {
      setListIdChecked([]);
    }

    listInvoiceDetail?.map((item) => {
      const amountItem = (item.mainCost || 0) * (item.quantity || 1);
      totalAmount += amountItem;
    });

    setDataCreate({
      ...dataCreate,
      id: invoiceId,
      amount: totalAmount,
      fee: totalAmount,
      paid: totalAmount,
    });
  }, [listInvoiceDetail, invoiceId]);

  const titles = ["STT", "Tên sản phẩm", "Số lô", "Ngày sản xuất", "Ngày hết hạn", "Đơn vị tính", "Số lượng", "Giá nhập", "Thành tiền"];

  const dataFormat = ["text-center", "", "text-right", "text-center", "text-center", "text-center", "text-right", "text-right", "text-right"];

  const dataMappingArray = (item: IInvoiceDetailResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.productName,
    item.batchNo,
    item.mfgDate ? moment(item.mfgDate).format("DD/MM/YYYY") : "",
    moment(item.expiryDate).format("DD/MM/YYYY"),
    item.unitName,
    item.quantity,
    formatCurrency(item.mainCost),
    formatCurrency((item.mainCost ? +item.mainCost : 0) * (item.quantity ? +item.quantity : 1)),
  ];

  const actionsTable = (item: IInvoiceDetailResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataInvoiceDetail(item);
          setShowModalAdd(true);
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
    const response = await ProductImportService.delete(id);
    if (response.code === 0) {
      showToast("Xóa sản phẩm thành công", "success");
      getListInvoiceDetail(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllProductImportService = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        ProductImportService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa sản phẩm thành công", "success");
        getListInvoiceDetail(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IInvoiceDetailResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "sản phẩm " : `${listIdChecked.length} sản phẩm đã chọn`}
          {item ? <strong>{item.productName}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (listIdChecked.length > 0) {
          onDeleteAllProductImportService();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa sản phẩm",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="page-content page__create--invoice">
      <TitleAction title="Tạo phiếu nhập hàng" />
      <div className="wrapper__product--import">
        <div className="card-box d-flex flex-column">
          <div className="action__header">
            <ul className="action__header--title">
              <li className="active">Thông tin sản phẩm cần nhập</li>
            </ul>

            <div className="add__product">
              <Button
                color="primary"
                onClick={() => {
                  setDataInvoiceDetail(null);
                  setShowModalAdd(true);
                }}
              >
                Thêm sản phẩm
              </Button>
            </div>
          </div>

          {!isLoading && listInvoiceDetail && listInvoiceDetail.length > 0 ? (
            <BoxTable
              name="Sản phẩm"
              titles={titles}
              items={listInvoiceDetail}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              isBulkAction={true}
              bulkActionItems={bulkActionList}
              listIdChecked={listIdChecked}
              striped={true}
              setListIdChecked={(listId) => setListIdChecked(listId)}
              actions={actionsTable}
              actionType="inline"
            />
          ) : isLoading ? (
            <Loading />
          ) : (
            <SystemNotification
              description={
                <span>
                  Hiện tại chưa có đơn nhập hàng nào. <br />
                  Hãy thêm mới đơn nhập hàng đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Chọn sản phẩm cần nhập"
              action={() => {
                setDataInvoiceDetail(null);
                setShowModalAdd(true);
              }}
            />
          )}
        </div>
        <AddProductImportModal
          invoiceId={invoiceId}
          onShow={showModalAdd}
          data={dataInvoiceDetail}
          onHide={(reload) => {
            if (reload) {
              getListInvoiceDetail(params);
            }
            setShowModalAdd(false);
          }}
        />

        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>

      <PaymentImportInvoices data={dataCreate} listInvoiceDetail={listInvoiceDetail} />
    </div>
  );
}

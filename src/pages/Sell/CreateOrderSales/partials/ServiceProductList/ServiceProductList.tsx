import React, { Fragment, useState, useEffect } from "react";
import { IAction } from "model/OtherModel";
import { IServiceProductListProps } from "model/customer/PropsModel";
import { IProductInvoiceServiceResponse } from "model/invoice/InvoiceResponse";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import InvoiceService from "services/InvoiceService";
import BoughtProductService from "services/BoughtProductService";
import BoughtServiceService from "services/BoughtServiceService";
import AddBoughtServiceModal from "./partials/AddBoughtServiceModal/AddBoughtServiceModal";
import AddBoughtProductModal from "./partials/AddBoughtProductModal/AddProductInvoiceModal";
import Image from "components/image";
import ImageThirdGender from "assets/images/third-gender.png";

export default function ServiceProductList(props: IServiceProductListProps) {
  const {
    tab,
    idCustomer,
    showModalAddProduct,
    setShowModalAddProduct,
    dataProduct,
    setDataProduct,
    showModalAddService,
    setShowModalAddService,
    dataService,
    setDataService,
    dataPaymentBill,
    setDataPaymentBill,
    listIdProduct,
    setListIdProduct,
    listIdService,
    setListIdService,
    setProductIdGetCode,
    dataSuggestedProduct,
    setDataSuggestedProduct,
  } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [invoiceId, setInvoiceId] = useState<number>(0);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [listProductInvoiceService, setListProductInvoiceService] = useState<IProductInvoiceServiceResponse[]>([]);

  const getListProductInvoiceService = async () => {
    setIsLoading(true);

    const response = await InvoiceService.invoiceDetailCustomer(idCustomer);

    if (response.code === 0) {
      const result = response.result;
      setInvoiceId(result.invoiceId);

      if (result.products || result.services) {
        const takeIdProducts = (result.products || []).map((item) => item.bptId);
        const takeIdServices = (result.services || []).map((item) => item.bseId);

        setListIdProduct(takeIdProducts);
        setListIdService(takeIdServices);
        setListProductInvoiceService([...result.products, ...result.services]);
        setProductIdGetCode(result.products && result.products.length > 0 ? result.products[0].productId : null);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (idCustomer && tab === "tab_one") {
      getListProductInvoiceService();
    }
  }, [idCustomer, tab]);

  useEffect(() => {
    let totalAmount = 0;

    listProductInvoiceService?.map((item) => {
      const amountItem = item.fee;
      totalAmount += amountItem;
    });

    if (listProductInvoiceService.length == 0) {
      setListIdChecked([]);
    }

    setDataPaymentBill({ ...dataPaymentBill, id: invoiceId, amount: totalAmount, fee: totalAmount, paid: totalAmount });
  }, [listProductInvoiceService, invoiceId]);

  const titles = ["STT", "Ảnh mặt hàng", "Tên mặt hàng", "Số lượng", "Giá bán", "Thành tiền"];

  const dataFormat = ["text-center", "text-center", "", "text-right", "text-right", "text-right"];

  const dataMappingArray = (item: IProductInvoiceServiceResponse, index: number) => [
    index + 1,
    <Image key={index} src={item.productAvatar || item.serviceAvatar || ImageThirdGender} alt={item.name} />,
    !item.batchNo ? (
      item.serviceName
    ) : (
      <Fragment>
        <span>{item.name}</span>
        <br />
        <span>
          <strong>Số lô: </strong>
          {item.batchNo}
        </span>
        <br />
        <span>
          <strong>Đơn vị tính: </strong>
          {item.unitName}
        </span>
      </Fragment>
    ),
    item.qty ? item.qty : 1,
    formatCurrency(
      item.discount && item.discountUnit == 1
        ? (item.priceDiscount ? item.priceDiscount : item.price) - (item.priceDiscount ? item.priceDiscount : item.price) * (item.discount / 100)
        : (item.priceDiscount ? item.priceDiscount : item.price) - item.discount
    ),
    formatCurrency(item.fee ? item.fee : "0"),
  ];

  const actionsTable = (item: IProductInvoiceServiceResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: async () => {
          if (item.bptId > 0) {
            const response = await BoughtProductService.detail(item.bptId);
            if (response.code === 0) {
              const result = response.result;
              setDataProduct(result);
              setShowModalAddProduct(true);
            } else {
              showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
            }
          }

          if (item.bseId > 0) {
            const response = await BoughtServiceService.detail(item.bseId);
            if (response.code === 0) {
              const result = response.result;
              setDataService(result);
              setShowModalAddService(true);
            } else {
              showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
            }
          }
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

  const onDeleteService = async (id: number) => {
    const response = await BoughtServiceService.delete(id);
    if (response.code === 0) {
      showToast("Xóa dịch vụ thành công", "success");
      getListProductInvoiceService();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteProduct = async (id: number) => {
    const response = await BoughtProductService.delete(id);
    if (response.code === 0) {
      showToast("Xóa sản phẩm thành công", "success");
      getListProductInvoiceService();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllServiceProduct = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    const arrPromises = selectedIds.map((selectedId) => {
      const found = listProductInvoiceService.find((x) => (x.bptId || x.bseId) === selectedId);
      if (found?.bptId) {
        return BoughtProductService.delete(found.bptId);
      }
      if (found?.bseId) {
        return BoughtServiceService.delete(found.bseId);
      }
      return Promise.resolve(null);
    });

    Promise.all(arrPromises)
      .then((results) => {
        const ok = results?.filter(Boolean)?.length || 0;
        if (ok > 0) {
          showToast("Xóa dịch vụ/sản phẩm đã chọn thành công", "success");
          getListProductInvoiceService();
          setListIdChecked([]);
        } else {
          showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
      })
      .finally(() => {
        setShowDialog(false);
        setContentDialog(null);
      });
  };

  const showDialogConfirmDelete = (item?: IProductInvoiceServiceResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? (item.bptId ? "sản phẩm" : "dịch vụ") : `${listIdChecked.length} dịch vụ/sản phẩm cần bán đã chọn`}
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
        if (listIdChecked.length > 0) {
          onDeleteAllServiceProduct();
          return;
        }
        if (item?.bptId) {
          onDeleteProduct(item.bptId);
          return;
        }
        if (item?.bseId) {
          onDeleteService(item.bseId);
          return;
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa dịch vụ/sản phẩm cần bán",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <Fragment>
      {!isLoading && listProductInvoiceService && listProductInvoiceService.length > 0 ? (
        <BoxTable
          name="dịch vụ/sản phẩm cần bán đã chọn"
          titles={titles}
          dataFormat={dataFormat}
          items={listProductInvoiceService.map((item) => ({ ...item, id: item.bptId || item.bseId }))}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          listIdChecked={listIdChecked}
          bulkActionItems={bulkActionList}
          isBulkAction={true}
          setListIdChecked={(listId) => setListIdChecked(listId)}
          actions={actionsTable}
          striped={true}
          actionType="inline"
        />
      ) : isLoading ? (
        <Loading />
      ) : (
        <SystemNotification
          description={
            <span>
              Hiện tại chưa có dịch vụ/sản phẩm nào. <br />
              Hãy thêm mới dịch vụ/sản phẩm đầu tiên nhé!
            </span>
          }
          type="no-item"
          titleButton="Thêm dịch vụ"
          titleButton01="Thêm sản phẩm"
          disabled={idCustomer === undefined || idCustomer === null}
          action={() => {
            setDataService(null);
            setShowModalAddService(true);
          }}
          action01={() => {
            setDataProduct(null);
            setShowModalAddProduct(true);
          }}
        />
      )}
      <AddBoughtProductModal
        onShow={showModalAddProduct}
        data={dataProduct}
        idCustomer={idCustomer}
        invoiceId={invoiceId}
        dataSuggestedProduct={dataSuggestedProduct}
        onHide={(reload) => {
          if (reload) {
            getListProductInvoiceService();
          }
          setShowModalAddProduct(false);
          setDataSuggestedProduct(null);
        }}
      />
      <AddBoughtServiceModal
        onShow={showModalAddService}
        data={dataService}
        idCustomer={idCustomer}
        invoiceId={invoiceId}
        onHide={(reload) => {
          if (reload) {
            getListProductInvoiceService();
          }
          setShowModalAddService(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

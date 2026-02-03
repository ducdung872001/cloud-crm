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
import AddBoughtCustomerCardModal from "./partials/AddBoughtCustomerCard/AddBoughtCustomerCard";
import CardService from "services/CardService";

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
    showModalAddCustomerCard,
    setShowModalAddCustomerCard,
    dataCustomerCard,
    setDataCustomerCard,
  } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [invoiceId, setInvoiceId] = useState<number>(0);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [listProductInvoiceService, setListProductInvoiceService] = useState<IProductInvoiceServiceResponse[]>([]);
  const [cardInfoMap, setCardInfoMap] = useState<Record<number, { name: string; avatar: string; price: number }>>({});

  const getListProductInvoiceService = async () => {
    setIsLoading(true);

    const response = await InvoiceService.invoiceDetailCustomer(idCustomer);

    if (response.code === 0) {
      const result = response.result;
      setInvoiceId(result.invoiceId);

      if (result.products || result.services || result.boughtCards) {
        const takeIdProducts = (result.products || []).map((item) => item.bptId);
        const takeIdServices = (result.services || []).map((item) => item.bseId);
        const takeIdCards = (result.boughtCards || []).map((item) => item.cardId);

        setListIdProduct(takeIdProducts);
        setListIdService(takeIdServices);
        setListProductInvoiceService([...result.products, ...result.services, ...result.boughtCards]);
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

  // Lấy thông tin card name, avatar từ cardId
  useEffect(() => {
    const fetchCardInfo = async () => {
      // Lấy tất cả cardId unique từ boughtCards
      const cardIds = listProductInvoiceService
        .map((item: any) => item.cardId)
        .filter((cardId): cardId is number => cardId !== undefined && cardId !== null);

      if (cardIds.length === 0) {
        setCardInfoMap({});
        return;
      }

      // Gọi API để lấy thông tin tất cả cards
      const response = await CardService.list({});

      if (response.code === 0) {
        const cards = response.result.items || [];
        const map: Record<number, { name: string; avatar: string; price: number }> = {};

        // Tạo map cardId -> {name, avatar, price}
        cardIds.forEach((cardId) => {
          const card = cards.find((card: any) => card.id === cardId);
          if (card) {
            map[cardId] = {
              name: card.name || "",
              avatar: card.avatar || "",
              price: card.price || 0,
            };
          }
        });

        setCardInfoMap(map);
      }
    };

    fetchCardInfo();
  }, [listProductInvoiceService]);

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

  const dataMappingArray = (item: IProductInvoiceServiceResponse, index: number) => {
    // Kiểm tra xem item có phải là boughtCard không
    const cardId = (item as any).cardId;
    const isBoughtCard = cardId !== undefined && cardId !== null;
    const cardInfo = isBoughtCard ? cardInfoMap[cardId] : null;

    return [
      index + 1,
      <Image 
        key={index} 
        src={
          isBoughtCard && cardInfo?.avatar 
            ? cardInfo.avatar 
            : item.productAvatar || item.serviceAvatar || item.avatarCard || ImageThirdGender
        } 
        alt={isBoughtCard && cardInfo?.name ? cardInfo.name : item.name} 
      />,
      isBoughtCard ? (
        <Fragment>
          <span>{cardInfo?.name || item.name}</span>
        </Fragment>
      ) : !item.batchNo ? (
        <>
          <span>{item.name}</span>
          <br />
          <span>{item.serviceName}</span>
        </>
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
      isBoughtCard && cardInfo?.price !== undefined
        ? cardInfo.price
        : item.discount && item.discountUnit == 1
        ? (item.priceDiscount ? item.priceDiscount : item.price) - (item.priceDiscount ? item.priceDiscount : item.price) * (item.discount / 100)
        : (item.priceDiscount ? item.priceDiscount : item.price) - item.discount
    ),
    formatCurrency(item.fee ? item.fee : "0"),
    ];
  };

  const actionsTable = (item: IProductInvoiceServiceResponse): IAction[] => {
        const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
                    disabled: isCheckedItem,
        callback: async () => {
                    if (!isCheckedItem) {
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

  const onDeleteService = async (id: number) => {
    const response = await BoughtServiceService.delete(id);
    if (response.code === 0) {
      showToast("Xóa dịch vụ thành công", "success");
      setListIdChecked((prev) => prev.filter((checkedId) => checkedId !== id));
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
      setListIdChecked((prev) => prev.filter((checkedId) => checkedId !== id));
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
        const checkbox = results?.filter(Boolean)?.length || 0;
        if (checkbox > 0) {
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
        
        if (item?.bptId) {
          onDeleteProduct(item.bptId);
          return;
        }
        if (item?.bseId) {
          onDeleteService(item.bseId);
          return;   
        }
        
        if (listIdChecked.length > 0) {
          onDeleteAllServiceProduct();
          return;
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa dịch vụ/sản phẩm/thẻ hạng thành viên cần bán",
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
              Hiện tại chưa có dịch vụ/sản phẩm/thẻ thành viên nào. <br />
              Hãy thêm mới dịch vụ/sản phẩm/thẻ thành viên đầu tiên nhé!
            </span>
          }
          type="no-item"
          titleButton="Thêm dịch vụ"
          titleButton01="Thêm sản phẩm"
          titleButton02="Thêm thẻ hạng thành viên"
          disabled={idCustomer === undefined || idCustomer === null}
          action={() => {
            setDataService(null);
            setShowModalAddService(true);
          }}
          action01={() => {
            setDataProduct(null);
            setShowModalAddProduct(true);
          }}
          action02={() => {
            if (setDataCustomerCard) {
              setDataCustomerCard(null);
            }
            if (setShowModalAddCustomerCard) {
              setShowModalAddCustomerCard(true);
            }
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
      <AddBoughtCustomerCardModal
        onShow={showModalAddCustomerCard}
        data={dataCustomerCard}
        idCustomer={idCustomer}
        invoiceId={invoiceId}
        onHide={(reload) => {
          if (reload) {
            getListProductInvoiceService();
          }
          setShowModalAddCustomerCard(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

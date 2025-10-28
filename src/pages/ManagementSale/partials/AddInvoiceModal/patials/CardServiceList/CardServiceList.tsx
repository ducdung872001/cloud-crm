import React, { Fragment, useState, useEffect } from "react";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import Image from "components/image";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAction } from "model/OtherModel";
import { ICardServiceListProps } from "model/sell/PropsModel";
import { ICardInvoiceServiceResponse } from "model/invoice/InvoiceResponse";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import ImageThirdGender from "assets/images/third-gender.png";
import InvoiceService from "services/InvoiceService";
import BoughtCardService from "services/BoughtCardService";
import AddCardServiceModal from "./partials/AddCardServiceModal";
import UpdateCardServiceModal from "./partials/UpdateCardServiceModal";
import "tippy.js/dist/tippy.css";

export default function CardServiceList(props: ICardServiceListProps) {
  const { tab, idCustomer, showModalAdd, setShowModalAdd, dataService, setDataService,
    dataPaymentBill, setDataPaymentBill, setListIdCardService } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [invoiceId, setInvoiceId] = useState<number>(0);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [listCardService, setListCardService] = useState<ICardInvoiceServiceResponse[]>([]);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const [showModalUpdate, setShowModalUpdate] = useState<boolean>(false);

  const getListCardService = async () => {
    setIsLoading(true);

    const response = await InvoiceService.cardService(idCustomer);

    if (response.code === 0) {
      const result = response.result;
      setInvoiceId(result.invoiceId);
      if (result.boughtCardServices) {
        setListCardService(result.boughtCardServices);

        const resultIdCardService = result.boughtCardServices.map((item) => item.id);

        if (resultIdCardService.length > 0) {
          setListIdCardService([...resultIdCardService]);
        }
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (idCustomer && tab === "tab_two") {
      getListCardService();
    }
  }, [idCustomer, tab]);

  useEffect(() => {
    let totalAmount = 0;

    if (listCardService.length == 0) {
      setListIdChecked([]);
    }

    listCardService?.map((item) => {
      const amountItem = item.account;
      totalAmount += amountItem;
    });

    setDataPaymentBill({ ...dataPaymentBill, id: invoiceId, amount: totalAmount, fee: totalAmount, paid: totalAmount });
  }, [listCardService, invoiceId]);

  const titles = ["STT", "Ảnh thẻ dịch vụ", "Thẻ dịch vụ", "Mã thẻ", "Giá trị thẻ", "Giá bán"];

  const dataFormat = ["text-center", "text-center", "", "", "text-right", "text-right"];

  const dataMappingArray = (item: ICardInvoiceServiceResponse, index: number) => [
    index + 1,
    <Image key={item.id} src={item.avatar || ImageThirdGender} alt={item.name} width={"64rem"} />,
    item.name,
    item.cardNumber && (
      <div className="update__code--card">
        <span>{item.cardNumber}</span>

        <Tippy content="Sửa mã thẻ">
          <span
            className="icon__update--code-card"
            onClick={(e) => {
              e && e.preventDefault();
              setDataService(item);
              setShowModalUpdate(true);
            }}
          >
            <Icon name="Pencil" />
          </span>
        </Tippy>
      </div>
    ),
    formatCurrency(item.cash ? item.cash : "0"),
    formatCurrency(item.account ? item.account : "0"),
  ];

  const actionsTable = (item: ICardInvoiceServiceResponse): IAction[] => {
    return [
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await BoughtCardService.delete(id);
    if (response.code === 0) {
      showToast("Xóa thẻ dịch vụ cần bán thành công", "success");
      getListCardService();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllCardService = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        BoughtCardService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa thẻ dịch vụ cần bán thành công", "success");
        getListCardService();
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: ICardInvoiceServiceResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "thẻ dịch vụ cần bán " : `${listIdChecked.length} thẻ dịch vụ được bán đã chọn`}
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
          onDeleteAllCardService();
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
      title: "Xóa thẻ dịch vụ cần bán",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <Fragment>
      {!isLoading && listCardService && listCardService.length > 0 ? (
        <BoxTable
          name="Dịch vụ cần bán"
          titles={titles}
          dataFormat={dataFormat}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          items={listCardService}
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
              Hiện tại khách hàng chưa mua thẻ dịch vụ nào. <br />
              Hãy thêm mới thẻ dịch vụ đầu tiên nhé!
            </span>
          }
          type="no-item"
          titleButton="Thêm mới thẻ dịch vụ"
          disabled={idCustomer === null || idCustomer === undefined}
          action={() => {
            setDataService(null);
            setShowModalAdd(true);
          }}
        />
      )}
      <UpdateCardServiceModal
        onShow={showModalUpdate}
        data={dataService}
        onHide={(reload) => {
          if (reload) {
            getListCardService();
          }
          setShowModalUpdate(false);
        }}
      />
      <AddCardServiceModal
        invoiceId={invoiceId}
        customerId={idCustomer}
        onShow={showModalAdd}
        data={dataService}
        onHide={(reload) => {
          if (reload) {
            getListCardService();
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

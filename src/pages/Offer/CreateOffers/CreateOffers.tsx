import React, { Fragment, useEffect, useState } from "react";
import { getSearchParameters } from "reborn-util";
import { IMenuTab } from "model/OtherModel";
import { IInvoiceCreateRequest } from "model/invoice/InvoiceRequestModel";
import { ICardInvoiceServiceResponse } from "model/invoice/InvoiceResponse";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { IBoughtServiceResponse } from "model/boughtService/BoughtServiceResponseModel";
import { IBoughtProductResponse } from "model/boughtProduct/BoughtProductResponseModel";
import Input from "components/input/input";
import Button from "components/button/button";
import { showToast } from "utils/common";
import SelectCustom from "components/selectCustom/selectCustom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import ImageThirdGender from "assets/images/third-gender.png";
import ImgPushCustomer from "assets/images/img-push.png";
import { INVOICE_PURCHASE, INVOICE_PURCHASE_CARD } from "utils/constant";
import CardServiceList from "./partials/CardServiceList/CardServiceList";
import ServiceProductList from "./partials/ServiceProductList/ServiceProductList";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";
import CustomerService from "services/CustomerService";
import PaymentBill from "./PaymentBill";
import "./CreateOffers.scss";

interface IDataOptionCustomer {
  value: number;
  label: string;
  avatar: string;
  address: string;
  phoneMasked?: string;
}

export default function CreateOrderSales() {
  document.title = "Tạo báo giá";

  const [tab, setTab] = useState<string>("tab_one");

  const takeParamsUrl = getSearchParameters();

  const checkParamsUrl = takeParamsUrl && takeParamsUrl?.customerId;

  const [detailCustomer, setDetailCustomer] = useState<IDataOptionCustomer>(null);

  const [dataCardService, setDataCardService] = useState<ICardInvoiceServiceResponse>(null);
  const [showModalCardService, setShowModalCardService] = useState<boolean>(false);

  const [dataProduct, setDataProduct] = useState<IBoughtProductResponse>(null);
  const [showModalAddProduct, setShowModalAddProduct] = useState<boolean>(false);

  const [dataService, setDataService] = useState<IBoughtServiceResponse>(null);
  const [showModalAddService, setShowModalAddService] = useState<boolean>(false);

  const [listIdProduct, setListIdProduct] = useState<number[]>([]);
  const [listIdService, setListIdService] = useState<number[]>([]);
  const [listIdCardService, setListIdCardService] = useState<number[]>([]);

  const titleItems: IMenuTab[] = [
    {
      title: "Danh sách dịch vụ/sản phẩm",
      is_active: "tab_one",
    },
    // {
    //   title: "Danh sách thẻ dịch vụ",
    //   is_active: "tab_two",
    // },
  ];

  //! đoạn này xử lý call api lấy ra thông tin khách hàng
  const loadOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
    };
    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới khách hàng", isShowModal: true, avatar: "custom" }] : []),
          ...(dataOption.length > 0
            ? dataOption.map((item: ICustomerResponse) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  address: item.address,
                  phoneMasked: item.phoneMasked,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  //! đoạn này xử lý vấn đề thay đổi khách hàng
  const handleChangeValueInfoCustomer = (e) => {
    if (e?.isShowModal) {
      setShowModalAddCustomer(true);
    } else {
      setDetailCustomer(e);
    }
  };

  //! đoạn này xử lý vấn đề hiển thị hình ảnh người dùng
  const formatOptionLabelCustomer = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar" style={avatar == "custom" ? { width: "1.8rem", height: "1.8rem" } : {}}>
          <img src={avatar == "custom" ? ImgPushCustomer : avatar ? avatar : ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý vấn đề hình thành phiếu thanh toán
  const [dataPaymentBill, setDataPaymentBill] = useState<IInvoiceCreateRequest>({
    id: 0,
    amount: 0,
    discount: 0,
    fee: 0,
    paid: 0,
    debt: 0,
    paymentType: 1,
    vatAmount: 0,
    receiptDate: "",
    account: "[]",
    amountCard: 0,
    branchId: null,
    invoiceType: "",
    customerId: null,
  });

  useEffect(() => {
    if (detailCustomer) {
      setDataPaymentBill({ ...dataPaymentBill, customerId: detailCustomer?.value });
    }
  }, [detailCustomer]);

  useEffect(() => {
    if (tab === "tab_one") {
      setDataPaymentBill({ ...dataPaymentBill, invoiceType: INVOICE_PURCHASE });
    } else {
      setDataPaymentBill({ ...dataPaymentBill, invoiceType: INVOICE_PURCHASE_CARD });
    }
  }, [tab]);

  const getDetailCustomer = async (id: number) => {
    if (!id) return;

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDetailCustomer({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        address: result.address,
        phoneMasked: result.phoneMasked,
      });
    } else {
      showToast("Có lỗi xảy ra vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (checkParamsUrl) {
      getDetailCustomer(+takeParamsUrl?.customerId);
    }
  }, [checkParamsUrl]);

  const [showModalAddCustomer, setShowModalAddCustomer] = useState<boolean>(false);

  const takeInfoCustomer = (data) => {
    if (data) {
      setDetailCustomer({
        value: data.id,
        label: data.name,
        avatar: data.avatar,
        address: data.address,
        phoneMasked: data.phoneMasked,
      });
    }
  };

  return (
    <div className="page-content page-create-order--sale">
      <TitleAction title="Tạo báo giá" />

      <div className="card-box wrapper__info--customer">
        <h3 className="title__info">Thông tin khách hàng</h3>

        <div className="list-form-group">
          <div className="form-group">
            <SelectCustom
              id="nameCustomer"
              name="nameCustomer"
              label="Họ tên"
              fill={true}
              required={true}
              options={[]}
              value={detailCustomer}
              onChange={(e) => handleChangeValueInfoCustomer(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn khách hàng"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionCustomer}
              formatOptionLabel={formatOptionLabelCustomer}
              disabled={checkParamsUrl}
            />
          </div>

          <div className="form-group">
            <Input
              id="phoneCustomer"
              name="nameCustomer"
              fill={true}
              disabled={true}
              label="Số điện thoại"
              placeholder="Chọn khách hàng để xem số điện thoại"
              value={detailCustomer?.phoneMasked || ""}
            />
          </div>

          <div className="form-group">
            <Input
              id="address"
              name="address"
              label="Địa chỉ"
              fill={true}
              placeholder="Chọn khách hàng để xem địa chỉ"
              value={detailCustomer?.address || ""}
              disabled={true}
            />
          </div>
        </div>
      </div>

      <div className="wrapper__info--items">
        <div className="card-box d-flex flex-column">
          <div className="action__header">
            <ul className="action__header--title">
              {titleItems.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className={item.is_active == tab ? "active" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      setTab(item.is_active);
                    }}
                  >
                    {item.title}
                  </li>
                );
              })}
            </ul>

            <div className="add__items">
              {tab === "tab_one" ? (
                <Fragment>
                  <Button
                    color="primary"
                    disabled={detailCustomer === null}
                    onClick={(e) => {
                      e.preventDefault();
                      setDataService(null);
                      setShowModalAddService(true);
                    }}
                  >
                    Thêm dịch vụ
                  </Button>
                  <Button
                    color="primary"
                    disabled={detailCustomer === null}
                    onClick={(e) => {
                      e.preventDefault();
                      setDataProduct(null);
                      setShowModalAddProduct(true);
                    }}
                  >
                    Thêm sản phẩm
                  </Button>
                </Fragment>
              ) : (
                <Button
                  color="primary"
                  disabled={detailCustomer === null}
                  onClick={(e) => {
                    e.preventDefault();
                    setDataCardService(null);
                    setShowModalCardService(true);
                  }}
                >
                  Thêm thẻ dịch vụ
                </Button>
              )}
            </div>
          </div>

          {tab === "tab_one" ? (
            <ServiceProductList
              tab={tab}
              idCustomer={detailCustomer?.value}
              // action product
              showModalAddProduct={showModalAddProduct}
              setShowModalAddProduct={setShowModalAddProduct}
              dataProduct={dataProduct}
              setDataProduct={setDataProduct}
              // action service
              showModalAddService={showModalAddService}
              setShowModalAddService={setShowModalAddService}
              dataService={dataService}
              setDataService={setDataService}
              dataPaymentBill={dataPaymentBill}
              setDataPaymentBill={setDataPaymentBill}
              // action delete all
              listIdProduct={listIdProduct}
              setListIdProduct={setListIdProduct}
              listIdService={listIdService}
              setListIdService={setListIdService}
            />
          ) : (
            <CardServiceList
              tab={tab}
              idCustomer={detailCustomer?.value}
              showModalAdd={showModalCardService}
              setShowModalAdd={setShowModalCardService}
              dataService={dataCardService}
              setDataService={setDataCardService}
              dataPaymentBill={dataPaymentBill}
              setDataPaymentBill={setDataPaymentBill}
              setListIdCardService={setListIdCardService}
            />
          )}
        </div>
      </div>

      <div className="card-box wrapper__info--paymentbill">
        <PaymentBill
          tab={tab}
          listIdCardService={listIdCardService}
          listIdService={listIdService}
          listIdProduct={listIdProduct}
          dataPaymentBill={dataPaymentBill}
          idCustomer={detailCustomer?.value}
        />
      </div>

      <AddCustomerPersonModal onShow={showModalAddCustomer} onHide={() => setShowModalAddCustomer(false)} takeInfoCustomer={takeInfoCustomer} />
    </div>
  );
}

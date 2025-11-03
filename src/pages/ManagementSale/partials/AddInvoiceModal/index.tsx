import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal, IMenuTab } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICampaignOpportunityRequestModel } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import CampaignService from "services/CampaignService";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";
import CustomerService from "services/CustomerService";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import ImgPushCustomer from "assets/images/img-push.png";
import { IInvoiceCreateRequest } from "model/invoice/InvoiceRequestModel";
import { INVOICE_PURCHASE, INVOICE_PURCHASE_CARD } from "utils/constant";
import ServiceProductList from "./patials/ServiceProductList/ServiceProductList";
import Button from "components/button/button";
import SelectCustom from "components/selectCustom/selectCustom";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import CardServiceList from "./patials/CardServiceList/CardServiceList";
import PaymentBill from "./PaymentBill";

export default function AddInvoiceModal(props: any) {
  const { onShow, onHide, idData, saleflowId, dataInvoice } = props;
  console.log("dataInvoice", dataInvoice);

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [detailCustomer, setDetailCustomer] = useState(null);

  const [tab, setTab] = useState<string>("tab_one");
  const [dataCardService, setDataCardService] = useState(null);
  const [showModalCardService, setShowModalCardService] = useState<boolean>(false);

  const [dataProduct, setDataProduct] = useState(null);
  const [showModalAddProduct, setShowModalAddProduct] = useState<boolean>(false);

  const [dataService, setDataService] = useState(null);
  const [showModalAddService, setShowModalAddService] = useState<boolean>(false);

  const [listIdProduct, setListIdProduct] = useState<number[]>([]);
  const [productIdGetCode, setProductIdGetCode] = useState<number>(null);
  const [listIdService, setListIdService] = useState<number[]>([]);
  const [listIdCardService, setListIdCardService] = useState<number[]>([]);
  const [invoiceCode, setInvoiceCode] = useState(null);

  const [data, setData] = useState(null);

  const titleItems: IMenuTab[] = [
    {
      title: "Danh sách dịch vụ/sản phẩm cần bán",
      is_active: "tab_one",
    },
    {
      title: "Danh sách thẻ dịch vụ cần bán",
      is_active: "tab_two",
    },
  ];

  //! đoạn này xử lý call api lấy ra thông tin khách hàng
  const loadOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };
    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          // ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới khách hàng", isShowModal: true, avatar: "custom" }] : []),
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

  useEffect(() => {
    if (dataBranch) {
      loadOptionCustomer("", undefined, { page: 1 });
    }
  }, [dataBranch]);

  const handleChangeValueInfoCustomer = (e) => {
    if (e?.isShowModal) {
      setShowModalAddCustomer(true);
    } else {
      setDetailCustomer(e);
      setInvoiceCode(null);
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
    campaignId: 0,
    saleflowId: 0,
  });

  console.log("dataPaymentBill", dataPaymentBill);

  useEffect(() => {
    if (detailCustomer) {
      setDataPaymentBill({
        ...dataPaymentBill,
        customerId: detailCustomer?.value,
        branchId: dataBranch.value,
        receiptDate: dataInvoice?.invoiceResponse?.receiptDate,
      });
    }
  }, [detailCustomer, dataBranch, dataInvoice]);

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
    if (onShow && dataInvoice && dataInvoice?.customerId) {
      getDetailCustomer(dataInvoice?.customerId);
    }
  }, [dataInvoice, onShow]);

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

  const takeHideSuggestedProduct = localStorage.getItem("hideSuggestedProduct");

  const [isShowSuggestedProduct, setIsShowSuggestedProduct] = useState<boolean>(() => {
    return takeHideSuggestedProduct ? JSON.parse(takeHideSuggestedProduct) : true;
  });

  useEffect(() => {
    if (onShow && idData) {
    }
  }, [onShow, idData]);

  const handClearForm = () => {
    onHide(false);
    setDetailCustomer(null);
    setDataPaymentBill({
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
      campaignId: 0,
    });

    setDataService(null);
    setDataCardService(null);
    setDataProduct(null);
    setDetailSaleflow(null);
    setValidateSaleflow(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        // buttons: [
        //   {
        //     title: "Hủy",
        //     color: "primary",
        //     variant: "outline",
        //     disabled: isSubmit,
        //     callback: () => {
        //       // !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
        //     },
        //   },
        //   {
        //     title: idData ? "Cập nhật" : "Tạo mới",
        //     type: "submit",
        //     color: "primary",
        //     disabled:
        //       isSubmit,
        //       // !isDifferenceObj(formData.values, values) ||
        //       // (formData.errors && Object.keys(formData.errors).length > 0),
        //     is_loading: isSubmit,
        //   },
        // ],
      },
    }),
    [isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);
        handClearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  // Chi tiết 1 quy trình
  const [detailSaleflow, setDetailSaleflow] = useState(null);
  const [validateSaleflow, setValidateSaleflow] = useState<boolean>(false);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm()}
        className="modal-add-management-sale"
        size="xxl"
      >
        <form className="form-add-management-sale">
          <ModalHeader title={`${dataInvoice ? "Chỉnh sửa" : "Thêm mới"} hoá đơn`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="box-add-invoice">
              <div className="card-box wrapper__info--customer">
                <h3 className="title__info">Thông tin khách hàng</h3>

                <div className="list-form-group">
                  <div className="form-group">
                    <SelectCustom
                      key={dataBranch ? dataBranch.value : "no-branch"}
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
                      // disabled={checkParamsUrl}
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

                  <div className="form-group">
                    <NummericInput
                      id="dept_customer"
                      name="dept_customer"
                      label="Khách còn nợ"
                      fill={true}
                      placeholder="Khách còn nợ"
                      value={0}
                      disabled={true}
                    />
                  </div>

                  <div className="form-group">
                    <NummericInput
                      id="accumulated_points"
                      name="accumulated_points"
                      label="Điểm tích lũy"
                      fill={true}
                      placeholder="Điểm tích lũy"
                      value={0}
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
                      setProductIdGetCode={setProductIdGetCode}
                      listIdService={listIdService}
                      setListIdService={setListIdService}
                      dataInvoice={dataInvoice}
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
                  productIdGetCode={productIdGetCode}
                  invoiceCode={invoiceCode}
                  setInvoiceCode={setInvoiceCode}
                  saleflowId={saleflowId}
                  onHide={onHide}
                  handClearForm={handClearForm}
                  detailSaleflow={detailSaleflow}
                  setDetailSaleflow={setDetailSaleflow}
                  validateSaleflow={validateSaleflow}
                  setValidateSaleflow={setValidateSaleflow}
                  dataInvoice={dataInvoice}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

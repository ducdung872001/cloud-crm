import { ICustomerExchangeResponseModel, ICustomerFeedbackResponseModel, ICustomerInvoiceResponse, ICustomerResponse } from "./CustomerResponseModel";
import { ICardInvoiceServiceResponse } from "model/invoice/InvoiceResponse";
import { IInvoiceCreateRequest } from "model/invoice/InvoiceRequestModel";
import { IBoughtProductResponse } from "model/boughtProduct/BoughtProductResponseModel";
import { IBoughtServiceResponse } from "model/boughtService/BoughtServiceResponseModel";

interface IFilterUser {
  id: number;
  avatar: string;
  name: string;
  gender: number;
}
export interface AddCustomerModalProps {
  onShow: boolean;
  data?: ICustomerResponse;
  lstDataOrigin?: any;
  onHide: (reload?: boolean, nextModal?: boolean) => void;
  takeInfoCustomer?: (data: ICustomerResponse) => void;
  nameCustomer?: string;
  avatarCustomer?: string;
  zaloUserId?: number | string;
}

export interface AddSchedulerModalProps {
  onShow: boolean;
  dataScheduler?: any;
  dataCustomer?: ICustomerResponse;
  onHide: (reload: boolean) => void;
}

export interface ListCustomerInvoiceProps {
  idCustomer: number;
  tab: string;
}

export interface ListBoughtServiceByCustomerProps {
  idCustomer: number;
  tab: string;
}

export interface ListBoughtProductByCustomerProps {
  idCustomer: number;
  tab: string;
}

export interface ListBoughtCardServiceProps {
  idCustomer: number;
  tab: string;
}

export interface InfoServiceProductProps {
  tab: string;
  idCustomer: number;
  infoCustomer: ICustomerResponse;
  dataProduct: IBoughtProductResponse;
  setDataProduct: (item: IBoughtProductResponse) => void;
  showModalAddProduct: boolean;
  setShowModalAddProduct: (item: boolean) => void;
  dataService: IBoughtServiceResponse;
  setDataService: (item: IBoughtServiceResponse) => void;
  showModalAddService: boolean;
  setShowModalAddService: (item: boolean) => void;
  dataItem: IInvoiceCreateRequest;
  setDataItem: (item: IInvoiceCreateRequest) => void;
}

export interface IServiceProductListProps {
  tab: string;
  idCustomer: number;
  // props product
  showModalAddProduct: boolean;
  setShowModalAddProduct: any;
  dataProduct: IBoughtProductResponse;
  setDataProduct: any;
  dataSuggestedProduct: any;
  setDataSuggestedProduct: any;
  // props service
  showModalAddService: boolean;
  setShowModalAddService: any;
  dataService: IBoughtServiceResponse;
  setDataService: any;
  dataPaymentBill: IInvoiceCreateRequest;
  setDataPaymentBill: any;
  // props delete all
  listIdProduct: number[];
  setListIdProduct: any;
  listIdService: number[];
  setListIdService: any;
  setProductIdGetCode: any;
  dataInvoice?: any;
}

export interface InfoCardServiceProps {
  tab: string;
  idCustomer: number;
  infoCustomer: ICustomerResponse;
  showModalAdd: boolean;
  setShowModalAdd: (item: boolean) => void;
  dataInfoCardService: ICardInvoiceServiceResponse;
  setDataInfoCardService: (item: ICardInvoiceServiceResponse) => void;
  dataItem: IInvoiceCreateRequest;
  setDataItem: (item: IInvoiceCreateRequest) => void;
}

export interface InfoCustomerProps {
  tab: string;
  idCustomer: number;
  infoCustomer: ICustomerResponse;
  data: IInvoiceCreateRequest;
}

export interface UpdateCommonModalProps {
  titleProps: string;
  listId: number[];
  onShow: boolean;
  isActiveCustomerGroup: boolean;
  isActiveCustomeRelationship: boolean;
  isActiveCustomerSource: boolean;
  isActiveCustomerEmployee: boolean;
  onHide: (reload: boolean) => void;
}

export interface BillModalProps {
  idInvoice: number;
  onShow: boolean;
  data: ICustomerInvoiceResponse;
  onHide: (reload: boolean) => void;
}

export interface IInfoPersonProps {
  data: ICustomerResponse;
}

export interface IViewDetailPersonProps {
  data: ICustomerResponse;
  callback: any;
  dataOther: any;
  deleteSignal: boolean;
  setDeleteSignal: (deleteSignal: boolean) => void;
}

export interface IListTabDetailProps {
  data: ICustomerResponse;
}

export interface IExchangePersonListProps {
  idCustomer: number;
}

export interface IFeedbackPersonListProps {
  idCustomer: number;
}

export interface IListBillProps {
  tab: string;
}

export interface IServiceCardPurchasedProps {
  tab: string;
}

export interface IPurchasedProductProps {
  tab: string;
}

export interface IPurchasedServiceProps {
  tab: string;
}

export interface IWarrantyListProps {
  idCustomer: number;
}

export interface ITicketPersonListProps {
  idCustomer: number;
}

export interface IAttachmentsListProps {
  idCustomer: number;
}

export interface IMessageChatExchangePersonProps {
  idCustomer: number;
  dataExchange: ICustomerExchangeResponseModel;
  onReload: (reload: boolean) => void;
}

export interface IMessageChatFeedbackPersonProps {
  idCustomer: number;
  dataFeedback: ICustomerFeedbackResponseModel;
  onReload: (reload: boolean) => void;
}

export interface IChooseTemplateSMSModelProps {
  onShow: boolean;
  idBrandname: number;
  firstIdBrandname: number;
  callBack: any;
  onHide: () => void;
}

export interface IAddCustomerSendSMSModalProps {
  onShow: boolean;
  type?: string;
  listIdCustomer: number[];
  callBack?: any;
  onHide: (isHide: boolean) => void;
}

export interface IAddCustomerSendEmailModalProps {
  onShow: boolean;
  type?: string;
  listIdCustomer: number[];
  lstCustomer: IFilterUser[];
  callBack?: any;
  onHide: () => void;
}

export interface IModalImportCustomerProps {
  onShow: boolean;
  onHide: (reload?: boolean) => void;
}

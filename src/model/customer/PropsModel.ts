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
  lstDataOrigin?: unknown[];
  onHide: (reload?: boolean, nextModal?: boolean) => void;
  takeInfoCustomer?: (data: ICustomerResponse) => void;
  nameCustomer?: string;
  avatarCustomer?: string;
  zaloUserId?: number | string;
  phoneQuickAdd?: string;
}

export interface AddSchedulerModalProps {
  onShow: boolean;
  dataScheduler?: Record<string, unknown>;
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
  setShowModalAddProduct: (show: boolean) => void;
  dataProduct: IBoughtProductResponse;
  setDataProduct: (item: IBoughtProductResponse) => void;
  dataSuggestedProduct: unknown[];
  setDataSuggestedProduct: (items: unknown[]) => void;
  // props service
  showModalAddService: boolean;
  setShowModalAddService: (show: boolean) => void;
  dataService: IBoughtServiceResponse;
  setDataService: (item: IBoughtServiceResponse) => void;
  dataPaymentBill: IInvoiceCreateRequest;
  setDataPaymentBill: (item: IInvoiceCreateRequest) => void;
  // props delete all
  listIdProduct: number[];
  setListIdProduct: (ids: number[]) => void;
  listIdService: number[];
  setListIdService: (ids: number[]) => void;
  setProductIdGetCode: (id: number) => void;
  dataInvoice?: Record<string, unknown>;
  // props customer card
  showModalAddCustomerCard?: boolean;
  setShowModalAddCustomerCard?: (show: boolean) => void;
  dataCustomerCard?: Record<string, unknown>;
  setDataCustomerCard?: (data: Record<string, unknown>) => void;
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
  callback: () => void;
  dataOther: Record<string, unknown>;
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
  callBack: (data: unknown) => void;
  onHide: () => void;
}

export interface IAddCustomerSendSMSModalProps {
  onShow: boolean;
  type?: string;
  listIdCustomer: number[];
  callBack?: (data: unknown) => void;
  onHide: (isHide: boolean) => void;
}

export interface IAddCustomerSendEmailModalProps {
  onShow: boolean;
  type?: string;
  listIdCustomer: number[];
  lstCustomer: IFilterUser[];
  callBack?: (data: unknown) => void;
  onHide: () => void;
}

export interface IModalImportCustomerProps {
  onShow: boolean;
  onHide: (reload?: boolean) => void;
}

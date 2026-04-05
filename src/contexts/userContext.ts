import React from "react";

export interface ProductStore {
  name?: string;
  address?: string;
  phone?: string;
}

export interface DataExpired {
  numDay: number | null;
  name: string;
  endDate: string;
}

export interface LanguageValue {
  name: string;
  shortName: string;
}

export interface DataInfoEmployee {
  id: number;
  departmentId?: number;
  [key: string]: unknown;
}

export interface NotificationPayload {
  title?: string;
  body?: string;
  data?: Record<string, string>;
  [key: string]: unknown;
}

export interface RoleItem {
  id: number;
  name?: string;
  [key: string]: unknown;
}

export interface ContextType {
  id: number;
  idEmployee: number;
  username: string;
  name: string;
  phone: string;
  avatar: string;
  email: string;
  token: string;
  role: string;
  gender: number;
  permissions: Record<string, boolean>;
  isCollapsedSidebar: boolean;
  setIsCollapsedSidebar: (e: boolean) => void;
  dataBranch: boolean;
  setDataBranch: (e: boolean) => void;
  isShowFeedback: boolean;
  setIsShowFeedback: (e: boolean) => void;
  product_store: ProductStore;
  countUnread: number;
  setCountUnread: (value: number) => void;
  newNotificationPayload?: NotificationPayload | null;

  //chatbot
  isShowChatBot: boolean;
  setIsShowChatBot: (e: boolean) => void;

  dataExpired: DataExpired;
  valueLanguage: LanguageValue;
  setValueLanguage: (value: LanguageValue) => void;
  dataInfoEmployee: DataInfoEmployee | null;
  dataBeauty: unknown;
  setDataBeauty: (value: unknown) => void;
  showModalPackage: boolean;
  setShowModalPackage: (e: boolean) => void;
  lastShowModalPayment: boolean;
  setLastShowModalPayment: (e: boolean) => void;
  lstRole: RoleItem[];
  callState: string;
  incomingNumber: string;
  makeCall: (number: string) => void;
  hangup: () => void;
  answer: () => void;
  transfer: (number: string) => void;
}
export const UserContext = React.createContext({});
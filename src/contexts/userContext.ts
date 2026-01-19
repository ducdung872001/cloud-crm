import React from "react";

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
  permissions: any;
  isCollapsedSidebar: boolean;
  setIsCollapsedSidebar: (e: boolean) => void;
  dataBranch: any;
  setDataBranch: any;
  isShowFeedback: boolean;
  setIsShowFeedback: (e: boolean) => void;
  product_store: any;

  //chatbot
  isShowChatBot: boolean;
  setIsShowChatBot: (e: boolean) => void;

  dataExpired: any;
  valueLanguage: {
    name: string;
    shortName: string;
  };
  setValueLanguage: (value: any) => void;
  dataInfoEmployee: any;
  dataBeauty: any;
  setDataBeauty: (value: any) => void;
  showModalPackage: boolean;
  setShowModalPackage: (e: boolean) => void;
  lastShowModalPayment: boolean;
  setLastShowModalPayment: (e: boolean) => void;
  lstRole: any[];
  callState: string;
  incomingNumber: string;
  makeCall: (number: string) => void;
  hangup: () => void;
  answer: () => void;
  transfer: (number: string) => void;
}
export const UserContext = React.createContext({});

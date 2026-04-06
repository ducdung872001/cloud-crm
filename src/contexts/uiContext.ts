import React, { useContext } from "react";
import { NotificationPayload } from "./userContext";

export interface UIContextType {
  isCollapsedSidebar: boolean;
  setIsCollapsedSidebar: (e: boolean) => void;
  dataBranch: boolean;
  setDataBranch: (e: boolean) => void;
  isShowFeedback: boolean;
  setIsShowFeedback: (e: boolean) => void;
  isShowChatBot: boolean;
  setIsShowChatBot: (e: boolean) => void;
  showModalPackage: boolean;
  setShowModalPackage: (e: boolean) => void;
  lastShowModalPayment: boolean;
  setLastShowModalPayment: (e: boolean) => void;
  countUnread: number;
  setCountUnread: (value: number) => void;
  newNotificationPayload?: NotificationPayload | null;
}

export const UIContext = React.createContext<UIContextType | null>(null);

export function useUI(): UIContextType {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIContext.Provider");
  return ctx;
}

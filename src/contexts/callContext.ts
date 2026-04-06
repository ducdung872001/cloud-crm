import React, { useContext } from "react";

export interface CallContextType {
  callState: string;
  incomingNumber: string;
  makeCall: (number: string) => void;
  hangup: () => void;
  answer: () => void;
  transfer: (number: string) => void;
}

export const CallContext = React.createContext<CallContextType | null>(null);

export function useCall(): CallContextType {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallContext.Provider");
  return ctx;
}

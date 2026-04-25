import React from "react";

type WebRtcCallIncomeModalProps = {
  onShow?: boolean;
  onHide?: () => void;
  makeCall?: (...args: unknown[]) => void;
  hangup?: (...args: unknown[]) => void;
  answer?: (...args: unknown[]) => void;
  transfer?: (...args: unknown[]) => void;
  callState?: unknown;
  incomingNumber?: unknown;
};

export default function WebRtcCallIncomeModal(_props: WebRtcCallIncomeModalProps) {
  return null;
}

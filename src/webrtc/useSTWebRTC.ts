import { useEffect, useRef, useState } from "react";
import { CallState } from "./types";

interface UseSTWebRTCOptions {
  extension: string;
  pbxCustomerCode: string;
}

export function useSTWebRTC(options: UseSTWebRTCOptions) {
  const { extension, pbxCustomerCode } = options;

  const [callState, setCallState] = useState<CallState>("idle");
  const [incomingNumber, setIncomingNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!window.STWebRTCEmbed) {
      setError("STWebRTCEmbed not loaded");
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    setCallState("registering");

    window.STWebRTCEmbed.init({
      config: {
        extension,
        key: pbxCustomerCode,
      },
      callbacks: {
        embed_success_handle: () => {
          console.log("WebRTC embed success");
        },

        embed_error_handle: (data: any) => {
          setError(data?.message || "Embed error");
          setCallState("error");
        },

        background_registered_handle: () => {
          setCallState("ready");
        },

        background_unregistered_handle: () => {
          setCallState("idle");
        },

        background_registrationFailed_handle: (data: any) => {
          setError(data?.cause || "Registration failed");
          setCallState("error");
        },

        background_outgoingcall_handle: () => {
          setCallState("calling");
        },

        background_outgoingringing_handle: () => {
          setCallState("ringing");
        },

        background_incomingcall_handle: (data: any) => {
          setIncomingNumber(data.customernumber);
          setCallState("incoming");
        },

        background_accepted_handle: () => {
          setCallState("oncall");
        },

        background_ended_handle: () => {
          setIncomingNumber(null);
          setCallState("ended");
        },

        background_failed_handle: (data: any) => {
          setError(data?.failed_cause || "Call failed");
          setCallState("error");
        },
      },
    });
  }, [extension, pbxCustomerCode]);

  // ===== ACTIONS =====
  const makeCall = async (phone: string) => {
    // Thực hiện cuộc gọi ra
    return window.STWebRTCEmbed.makecall(phone);
  };

  const answer = async () => {
    // Trả lời cuộc gọi đến
    return window.STWebRTCEmbed.answer();
  };

  const hangup = async () => {
    // Kết thúc cuộc gọi
    setIncomingNumber(null);
    return window.STWebRTCEmbed.hangup();
  };

  const muteToggle = async () => {
    // Bật/tắt mic
    return window.STWebRTCEmbed.muteAndUnmute();
  };

  const holdToggle = async () => {
    // Giữ/tiếp tục cuộc gọi
    return window.STWebRTCEmbed.holdAndUnhold();
  };

  const setDND = async (status: boolean) => {
    // Đặt trạng thái DND
    return window.STWebRTCEmbed.setDND(status);
  };

  const transfer = async (ext: string) => {
    // Chuyển cuộc gọi
    return window.STWebRTCEmbed.transfer(ext);
  };

  const sendDTMF = async (tones: string) => {
    // Gửi tín hiệu DTMF
    return window.STWebRTCEmbed.sendDTMF(tones);
  };

  return {
    callState,
    incomingNumber,
    error,

    makeCall,
    answer,
    hangup,
    muteToggle,
    holdToggle,
    setDND,
    transfer,
    sendDTMF,
  };
}

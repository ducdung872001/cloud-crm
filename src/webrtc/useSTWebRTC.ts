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
      setError("STWebRTC: STWebRTCEmbed not loaded");
      return;
    }
    if (!extension) {
      setError("STWebRTC: Extension not loaded");
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
        },

        embed_error_handle: (data: Record<string, unknown>) => {
          // Xử lý lỗi nhúng
          console.error("STWebRTC: Có lỗi nhúng:", data);
          setError((data?.message as string) || "Embed error");
          setCallState("error");
        },

        background_registered_handle: () => {
          // Đăng ký SIP thành công
          setCallState("ready");
        },

        background_unregistered_handle: () => {
          // Đăng xuất SIP
          setCallState("idle");
        },

        background_registrationFailed_handle: (data: Record<string, unknown>) => {
          // Đăng ký SIP thất bại
          console.error("STWebRTC: Đăng ký SIP thất bại:", data);
          setError((data?.cause as string) || "Registration failed");
          setCallState("error");
        },

        background_outgoingcall_handle: () => {
          // Cuộc gọi đi được thực hiện
          setCallState("calling");
        },

        background_outgoingringing_handle: () => {
          // Cuộc gọi đi đang đổ chuông
          setCallState("ringing");
        },

        background_incomingcall_handle: (data: Record<string, unknown>) => {
          // Có cuộc gọi đến
          setIncomingNumber(data.customernumber as string);
          setCallState("incoming");
        },

        background_accepted_handle: () => {
          // Cuộc gọi đã được trả lời
          setCallState("oncall");
        },

        background_ended_handle: () => {
          // Cuộc gọi đã kết thúc
          setIncomingNumber(null);
          setCallState("ended");
        },

        background_failed_handle: (data: Record<string, unknown>) => {
          // Cuộc gọi thất bại
          console.error("STWebRTC: Cuộc gọi thất bại:", data);
          setError((data?.failed_cause as string) || "Call failed");
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

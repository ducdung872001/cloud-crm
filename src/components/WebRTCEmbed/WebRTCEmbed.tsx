import { useEffect } from "react";

export default function WebRTCEmbed() {
  useEffect(() => {
    // Load script 1 lần
    const script = document.createElement("script");
    script.src = "https://livecall.worldfone.vn/public/js/webrtc_embed.js";
    script.async = true;

    script.onload = () => {
      initWebRTC();
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initWebRTC = () => {
    if (!window.STWebRTCEmbed) return;

    window.STWebRTCEmbed.init({
      config: {
        // extension: 'YOUR_EXTENSION',
        // key: 'PBX_CUSTOMER_CODE',

        extension: "470",
        key: "d9cf985baac44238b3d930ae569d9f0912",

        // extension: 'YOUR_EXTENSION',
        // key: '6e2f44e0c8ccdee4a4e69ff780230d60'
      },
      callbacks: {
        embed_success_handle: () => { /* noop */ },

        embed_error_handle: (error) => {
          console.error("Embed error", error);
        },

        background_registered_handle: () => { /* noop */ },

        background_unregistered_handle: () => { /* noop */ },

        background_registrationFailed_handle: (data) => {
          console.error("Register failed", data);
        },

        background_incomingcall_handle: (data) => {
          // Hiển thị popup incoming call tại đây
        },

        background_outgoingcall_handle: () => { /* noop */ },

        background_outgoingringing_handle: () => { /* noop */ },

        background_accepted_handle: () => { /* noop */ },

        background_ended_handle: () => { /* noop */ },

        background_failed_handle: (data) => {
          console.error("Call failed", data);
        },
      },
    });
  };

  return null; // WebRTC chạy ngầm
}

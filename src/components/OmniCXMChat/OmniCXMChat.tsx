import { OmniChatPayload, useOmniCXM } from "@/hooks/useOmniCXM";

interface OmniCXMChatProps {
  secretKey: string;
  environment?: string;
  enabled?: boolean;
  onPick?:       (payload: OmniChatPayload) => void;
  onReassigned?: (payload: OmniChatPayload) => void;
  onSolved?:     (payload: OmniChatPayload) => void;
  onSpam?:       (payload: OmniChatPayload) => void;
  onLinkPeople?: (payload: OmniChatPayload) => void;
}

/**
 * OmniCXMChat
 * - Load CSS từ: https://omni-api.worldfone.cloud/embed_app/application/public/css/embed.css
 * - Load JS từ:  https://omni-api.worldfone.cloud/embed_app/application/embed.js
 * - Gọi:         STOmniCXMEmbedApp.init({ key: secretKey })
 * - Widget được render bởi embed.js, component này không sinh DOM
 */
export default function OmniCXMChat(props: OmniCXMChatProps) {
  useOmniCXM(props);
  return null;
}

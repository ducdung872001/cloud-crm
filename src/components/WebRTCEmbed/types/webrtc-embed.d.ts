export {};

declare global {
  interface Window {
    STWebRTCEmbed: {
      init: (options: {
        config: {
          key: string;
          extension: string;
        };
        callbacks?: Record<string, (data: Record<string, unknown>) => void>;
      }) => void;

      makecall: (phone: string) => Promise<Record<string, unknown>>;
      answer: () => Promise<Record<string, unknown>>;
      hangup: () => Promise<Record<string, unknown>>;
      setDND: (status: boolean) => Promise<Record<string, unknown>>;
      transfer: (extension: string) => Promise<Record<string, unknown>>;
      sendDTMF: (tones: string) => Promise<Record<string, unknown>>;
      holdAndUnhold: () => Promise<Record<string, unknown>>;
      muteAndUnmute: () => Promise<Record<string, unknown>>;
      getInformation: () => Promise<Record<string, unknown>>;
    };
  }
}

declare global {
  interface Window {
    STWebRTCEmbed: {
      init: (options: Record<string, unknown>) => void;
      makecall: (phone: string) => Promise<void>;
      answer: () => Promise<void>;
      hangup: () => Promise<void>;
      muteAndUnmute: () => Promise<void>;
      holdAndUnhold: () => Promise<void>;
      setDND: (status: boolean) => Promise<void>;
      transfer: (extension: string) => Promise<void>;
      sendDTMF: (tones: string) => Promise<void>;
      getInformation: () => Promise<Record<string, unknown>>;
    };
  }
}
export {};

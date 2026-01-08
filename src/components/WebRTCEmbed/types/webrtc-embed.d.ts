export {};

declare global {
  interface Window {
    STWebRTCEmbed: {
      init: (options: {
        config: {
          key: string;
          extension: string;
        };
        callbacks?: Record<string, (data: any) => void>;
      }) => void;

      makecall: (phone: string) => Promise<any>;
      answer: () => Promise<any>;
      hangup: () => Promise<any>;
      setDND: (status: boolean) => Promise<any>;
      transfer: (extension: string) => Promise<any>;
      sendDTMF: (tones: string) => Promise<any>;
      holdAndUnhold: () => Promise<any>;
      muteAndUnmute: () => Promise<any>;
      getInformation: () => Promise<any>;
    };
  }
}

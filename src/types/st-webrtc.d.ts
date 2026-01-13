declare global {
  interface Window {
    STWebRTCEmbed: {
      init: (options: any) => void;
      makecall: (phone: string) => Promise<any>;
      answer: () => Promise<any>;
      hangup: () => Promise<any>;
      muteAndUnmute: () => Promise<any>;
      holdAndUnhold: () => Promise<any>;
      setDND: (status: boolean) => Promise<any>;
      transfer: (extension: string) => Promise<any>;
      sendDTMF: (tones: string) => Promise<any>;
      getInformation: () => Promise<any>;
    };
  }
}
export {};

export function useWebRTC() {

    const makeCall = (phone) => {
        window.STWebRTCEmbed?.makecall(phone)
          .then(console.log)
          .catch(console.error);
    };
     
  
    const answer = () =>
      window.STWebRTCEmbed?.answer();
  
    const hangup = () =>
      window.STWebRTCEmbed?.hangup();
  
    return { makeCall, answer, hangup };
  }
  
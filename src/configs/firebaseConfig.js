import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

var firebaseConfig = {
  apiKey: "AIzaSyD9OUVhQ_QR-McUSan_hG1WI_7BLE1D7Ts",
  authDomain: "reborn-crm.firebaseapp.com",
  projectId: "reborn-crm",
  storageBucket: "reborn-crm.appspot.com",
  messagingSenderId: "175031404504",
  appId: "1:175031404504:web:868bf345f199a3281dd4ad",
  measurementId: "G-4T77GWKS8C"
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const fetchToken = () => {
  return getToken(messaging, {
    vapidKey: "BDbnAgiZyRkZeJ6R_fSEMrb6mIQhuusbkdVHh2l2qYw29Ew-fllpz9ZRVoUf8JtY1cZk-Lf8NtomLqg5sFkdY7Y",
  })
    .then((currentToken) => {
      if (currentToken) {
        console.log(currentToken);
        return currentToken;
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
    });
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

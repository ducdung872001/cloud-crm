import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

var firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "reborn-crm.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "reborn-crm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "reborn-crm.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "175031404504",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const fetchToken = () => {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  return getToken(messaging, { vapidKey })
    .then((currentToken) => {
      if (currentToken) {
        return currentToken;
      } else {
        console.warn("No registration token available. Request permission to generate one.");
      }
    })
    .catch((err) => {
      console.warn("An error occurred while retrieving token. ", err);
    });
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

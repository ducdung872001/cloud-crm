import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

var firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Chỉ khởi tạo khi có đủ config
let firebaseApp = null;
let messaging = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase config missing — push notifications disabled.");
}

export const fetchToken = () => {
  if (!messaging) return Promise.resolve(null);
  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  })
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

export const onMessageListener = () => {
  if (!messaging) return Promise.resolve(null);
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

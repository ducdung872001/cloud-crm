import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";

var firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey && firebaseConfig.appId);
const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const messaging = firebaseApp ? getMessaging(firebaseApp) : null;

// Phone Auth — yc Hiền Đỗ 2026-05-11: OTP qua Firebase SDK client-side (yc BE 2026-05-12).
// Flow: signInWithPhoneNumber(auth, phone, recaptcha) → user nhập OTP → confirm
// → idToken gửi lên Market endpoint, Market call Auth verify-id-token nội bộ.
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const isFirebasePhoneAuthAvailable = Boolean(firebaseAuth);

export const fetchToken = () => {
  if (!messaging) return Promise.resolve(undefined);
  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
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
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

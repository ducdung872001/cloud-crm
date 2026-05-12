import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";

// ── Default app — FCM messaging (per-env config qua biến môi trường) ──────
// Mỗi env (dev/uat/prod) trỏ FCM project khác nhau qua VITE_FIREBASE_*.
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

// ── Secondary app — Phone Auth (hardcode project reborn-303801) ───────────
// Lý do KHÔNG dùng default app:
//   - Default app cấu hình qua env VITE_FIREBASE_* khác nhau theo env (dev/uat/prod) —
//     mỗi env có thể trỏ project FCM riêng (vd prod = test-noti-bd32d) chỉ có Push,
//     KHÔNG bật Phone Auth → `auth/configuration-not-found` trên prod.
//   - Phone Auth của Reborn nằm ở project chung `reborn-303801` (đã enable Phone
//     provider, có user thật, brand reborn). Reborn-sso + BPM đều dùng project này.
//
// Web API key là PUBLIC theo design Firebase (security qua Authorized Domains +
// Auth Rules), an toàn hardcode.
const PHONE_AUTH_APP_NAME = "community-hub-phone-auth";
const phoneAuthConfig = {
  apiKey:            "AIzaSyBv9EvG0ZkpST3UY6lAqU6K3CthPlJxBU4",
  authDomain:        "reborn-303801.firebaseapp.com",
  projectId:         "reborn-303801",
  storageBucket:     "reborn-303801.appspot.com",
  messagingSenderId: "357545188498",
  appId:             "1:357545188498:web:f623e55db0948c60cd1a4b",
  measurementId:     "G-G6HE55D8N4",
};

let phoneAuthApp = null;
try {
  const existing = getApps().find((a) => a.name === PHONE_AUTH_APP_NAME);
  phoneAuthApp = existing || initializeApp(phoneAuthConfig, PHONE_AUTH_APP_NAME);
} catch (e) {
  // Hi hữu — log để debug, không crash app.
  console.warn("[firebaseConfig] init phone-auth secondary app failed:", e);
}

export const firebaseAuth = phoneAuthApp ? getAuth(phoneAuthApp) : null;
if (firebaseAuth) firebaseAuth.languageCode = "vi";
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

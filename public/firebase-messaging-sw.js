// importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");
// 1. Nhúng thư viện Firebase dành riêng cho Service Worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js",
);
// NOTE: Placeholders được replace lúc build bởi vite plugin "firebase-sw-env".
// Dev local cần copy giá trị thật từ .env vào đây hoặc chạy build.
const firebaseConfig = {
  apiKey:            "__VITE_FIREBASE_API_KEY__",
  authDomain:        "__VITE_FIREBASE_AUTH_DOMAIN__",
  projectId:         "__VITE_FIREBASE_PROJECT_ID__",
  storageBucket:     "__VITE_FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__VITE_FIREBASE_MESSAGING_SENDER_ID__",
  appId:             "__VITE_FIREBASE_APP_ID__",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

//Xử lý thông báo ở chế độ nền
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
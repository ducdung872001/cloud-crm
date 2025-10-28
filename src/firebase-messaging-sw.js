importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyD9OUVhQ_QR-McUSan_hG1WI_7BLE1D7Ts",
  authDomain: "reborn-crm.firebaseapp.com",
  projectId: "reborn-crm",
  storageBucket: "reborn-crm.appspot.com",
  messagingSenderId: "175031404504",
  appId: "1:175031404504:web:868bf345f199a3281dd4ad",
  measurementId: "G-4T77GWKS8C"
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
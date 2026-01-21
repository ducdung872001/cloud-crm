import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import UserService from "services/UserService";

// Tải FingerprintJS và sinh mã định danh duy nhất
async function getDeviceId() {
  const fp = await FingerprintJS.load();
  const result = await fp.get(); // Sinh mã định danh
  return result.visitorId; // Trả về ID duy nhất
}

function parseJwt(token) {
  if (!token) {
    console.error("Token is null or undefined");
    return null;
  }

  try {
    const base64Url = token.split(".")[1]; // Lấy phần payload
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Chuyển đổi về dạng base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
    return JSON.parse(jsonPayload); // Chuyển payload về object JSON
  } catch (error) {
    console.error("Invalid JWT:", error);
    return null;
  }
}

const firebaseConfig = {
  // Chạy thật
  apiKey: "AIzaSyCu0hGqHdkOiHwBra4gKz3j2QPw8vKWkOI",
  authDomain: "bpm1-9b048.firebaseapp.com",
  projectId: "bpm1-9b048",
  storageBucket: "bpm1-9b048.firebasestorage.app",
  messagingSenderId: "643006751836",
  appId: "1:643006751836:web:d223a2260eb598f045f299",
  measurementId: "G-2PQCPHTE25",
};

// const firebaseConfig = {
//   // Test Local
//   apiKey: "AIzaSyAcFW1ZZR6fuKzs9xJLn9DgeYRhj3HL71w",
//   authDomain: "test-noti-firebase-dc732.firebaseapp.com",
//   projectId: "test-noti-firebase-dc732",
//   storageBucket: "test-noti-firebase-dc732.firebasestorage.app",
//   messagingSenderId: "611354039567",
//   appId: "1:611354039567:web:2d191e82687e185f9b1a7a",
// };

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const saveFCM = async (token, deviceId, employeeId, userId) => {
  const params = {
    registrationToken: token,
    deviceId: deviceId,
    employeeId: employeeId,
    userId: userId,
    type: "web",
  };
  const response = await UserService.fcmDevice(params);
  if (response.code === 0) {
    // showToast("Đăng ký thiết bị thành công", "success");
  } else {
    // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  }
};

export const requestPermission = async (jwtToken) => {
  if (!("Notification" in window)) {
    console.error("Trình duyệt không hỗ trợ Notifications.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Quyền thông báo đã được cấp.");

      try {
        console.log("Đang lấy token FCM...");
        const token = await getToken(messaging, {
          vapidKey: "BEwUxtPTJ8etCqMlF-hgkr5LpWlkSeR_4YBILQLeXDeN6N-eCkflDnSmR2hHoL6lwsgSBxjxg7rHzdegX3NMpZA", // Chạy thật
          // vapidKey: "BBsV3m5BrNLxFgR544iD9ziyzna2pmBqqnR53pqsPRkPfHYF-Y9QFwHimgrVQU-TS9lXgLzNvWezDtl3W-K8tHw", // Test Local
        });
        console.log("FCM Token:", token);
        //Lưu token này xuống dưới cơ sở dữ liệu
        try {
          const deviceId = await getDeviceId();

          console.log("jwtToken =>", jwtToken);
          const payload = parseJwt(jwtToken);
          console.log("Payload:", payload);
          console.log("DeviceId:", deviceId);

          let employeeId = 0;
          let userId = 0;
          if (payload) {
            let user = JSON.parse(payload.user);
            if (user) {
              employeeId = user.employeeId || 0;
              userId = user.id || 0;
            }
          }

          //Gọi hàm lưu token xuống
          console.log("EmployeeID:", employeeId);
          try {
            saveFCM(token, deviceId, employeeId, userId);
          } catch (error) {
            console.error("Lỗi khi saveFCM:", error);
          }
        } catch (error) {
          console.error("Lỗi khi lấy deviceId:", error);
        }
      } catch (error) {
        console.error("Lỗi khi lấy token:", error);
      }

      // // Lấy Token
      // const token = await getToken(messaging, {
      //   // vapidKey: "BEwUxtPTJ8etCqMlF-hgkr5LpWlkSeR_4YBILQLeXDeN6N-eCkflDnSmR2hHoL6lwsgSBxjxg7rHzdegX3NMpZA",
      //   vapidKey: "BBsV3m5BrNLxFgR544iD9ziyzna2pmBqqnR53pqsPRkPfHYF-Y9QFwHimgrVQU-TS9lXgLzNvWezDtl3W-K8tHw",
      // });
      // console.log("FCM Token:", token);
    } else {
      console.log("Quyền thông báo bị từ chối.");
    }
  } catch (error) {
    console.error("Lỗi khi yêu cầu quyền thông báo:", error);
  }
};

export { messaging };

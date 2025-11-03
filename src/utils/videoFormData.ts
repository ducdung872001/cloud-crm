/* eslint-disable prefer-const */
import { getCookie } from "reborn-util";

/**
 *
 * @param {Tên jwt cần lấy} jwt (có thể là jwt)
 */
function getToken() {
  try {
    const token = getCookie("token");
    return `Bearer ${token}`;
  } catch (e) {
    return `Bearer`;
  }
}

export const uploadVideoFormData = (data, onSuccess, onError, onProgress) => {
  if (data) {
    let formData = new FormData();
    formData.append("file", data);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://reborn.vn/api/upload/file");
    // xhr.setRequestHeader(
    //   'Content-Type',
    //   'multipart/form-data;boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    // );
    xhr.setRequestHeader("Authorization", getToken());

    let percent = 0;
    xhr.onload = () => {
      percent = 100;
      if (typeof onProgress === "function") onProgress(percent);
    };

    xhr.upload.onprogress = (event: { loaded: number; total: number }) => {
      const { loaded, total } = event;
      const calculatorProgress = (loaded / total).toFixed(2);
      percent = +calculatorProgress * 100;
      if (typeof onProgress === "function") {
        onProgress(percent);
      }
    };

    xhr.onerror = (event) => {
      if (typeof onError === "function") onError(event);
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200 && typeof onSuccess === "function") {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response && response.code === 0) {
            onSuccess(response.result);
          } else {
            onError(response);
          }
        } catch (error) {
          onError(error);
        }
      }
    };
    // send file in body
    xhr.send(formData);
  } else {
    if (typeof onError === "function") {
      onError({
        code: 500,
        message: "",
      });
    } else {
      console.error("");
    }
  }
};

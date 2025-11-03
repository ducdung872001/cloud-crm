import { urlsApi } from "configs/urls";
import { getCookie } from "reborn-util";

const processError = (err) => {
  console.log(err);
};

/**
 * Dùng link cdn.reborn.vn
 * @param uploadURL
 * @param param1
 */
const uploadFile = (uploadURL, { data, onSuccess, onError, onProgress }) => {
  if (data) {
    const formData = new FormData();
    formData.append("file", data);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadURL);

    const token = `Bearer ${getCookie("token")}`;
    xhr.setRequestHeader("Authorization", token);

    let percent = 0;
    xhr.onload = () => {
      percent = 100;
      if (typeof onProgress === "function") onProgress(percent);
    };

    xhr.upload.onprogress = (event) => {
      const { loaded, total } = event;
      const result = (loaded / total) as any;

      percent = result.toFixed(2) * 100;
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

const uploadVideo = (uploadURL, { data, onSuccess, onError, onProgress }) => {
  if (data) {
    const formData = new FormData();
    formData.append("file_upload", data);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadURL);
    // xhr.setRequestHeader(
    //   'Content-Type',
    //   'multipart/form-data;boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    // );

    const token = `Bearer ${getCookie("token")}`;
    xhr.setRequestHeader("Authorization", token);

    let percent = 0;
    xhr.onload = () => {
      percent = 100;
      if (typeof onProgress === "function") onProgress(percent);
    };

    xhr.upload.onprogress = (event) => {
      const { loaded, total } = event;
      const result = (loaded / total) as any;

      percent = result.toFixed(2) * 100;
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

export default {
  uploadVideo: (params) => uploadVideo(urlsApi.image.uploadNoron, params),
  uploadFile: (params) => uploadFile(urlsApi.file.upload, params),
  getFavicon: (host) => fetch(`https://s2.googleusercontent.com/s2/favicons?domain=${host}`),
};

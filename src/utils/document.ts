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

/**
 * Đẩy lên CDN
 * @param data
 * @param onSuccess
 * @param onError
 * @param onProgress
 */
export const uploadDocumentFormData = (
  data,
  onSuccess,
  onError,
  onProgress?: any,
  type?: "customer" | "partner" | "contract" | "guarantee" | "contact" | "contractWarranty" | "processData",
  parmas?: any
) => {
  if (data) {
    let formData = new FormData();

    if (type === "processData") {
      formData.append("file", data?.file);
      formData.append("processId", data?.processId);

      if (data?.nodeId) {
        formData.append("nodeId", data?.nodeId);
      }
      if (data?.subprocessId) {
        formData.append("subprocessId", data?.subprocessId);
      }
    } else {
      formData.append("file", data);
    }

    let xhr = new XMLHttpRequest();
    const linkUpload = process.env.APP_API_URL;
    const importBPM = process.env.APP_BPM_URL;

    xhr.open(
      "POST",
      `${
        type
          ? type === "customer"
            ? `${linkUpload}/adminapi/customer/import/uploadFile?custType=${parmas}`
            : type === "contact"
            ? `${linkUpload}/adminapi/contact/import/uploadFile`
            : type === "partner"
            ? `${linkUpload}/adminapi/businessPartner/import/uploadFile`
            : type === "contract"
            ? `${linkUpload}/adminapi/contract/import/uploadFile?isCustomer=${parmas}`
            : type === "guarantee"
            ? `${linkUpload}/adminapi/guarantee/import/uploadFile`
            : type === "contractWarranty"
            ? `${linkUpload}/adminapi/contractWarranty/import/uploadFile`
            : type === "processData"
            ? `${importBPM}/bpmapi/businessProcess/importExcel`
            : ""
          : "https://reborn.vn/api/upload/file"
      }`
    );
    // xhr.setRequestHeader(
    //   'Content-Type',
    //   'multipart/form-data;boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    // );
    xhr.setRequestHeader("Authorization", getToken());
    xhr.setRequestHeader("Hostname", location.hostname || "");

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
      } else if (xhr.status != 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          onError(response);
        } catch (error) {
          console.error(error);
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

/**
 * Đẩy trực tiếp lên server
 * @param data
 * @param onSuccess
 * @param onError
 * @param onProgress
 */
export const uploadDocumentDirectFormData = (data, onSuccess, onError, onProgress) => {
  if (data) {
    let formData = new FormData();
    formData.append("file", data);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", `https://cloud.reborn.vn/adminapi/customer/import`); //Không test ở local
    xhr.setRequestHeader("Authorization", getToken());
    xhr.setRequestHeader("Hostname", location.hostname || "");

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

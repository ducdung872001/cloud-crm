import { urlsApi } from "configs/urls";
import { getCookie } from "reborn-util";

const processError = (err) => {
  console.log(err);
};

const uploadFile = (uploadURL, { data, onSuccess, onError = processError, onProgress }) => {
  if (data) {
    // eslint-disable-next-line prefer-const
    let token = `Bearer ${getCookie("token")}`;

    // eslint-disable-next-line prefer-const
    let xhr = new XMLHttpRequest();
    xhr.open("POST", uploadURL);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", token);

    let percent: any = 0;
    xhr.onload = () => {
      percent = 100;
      if (typeof onProgress === "function") onProgress(percent);
    };

    xhr.upload.onprogress = (event) => {
      // eslint-disable-next-line prefer-const, @typescript-eslint/ban-types
      let loaded: Number = event.loaded;
      // eslint-disable-next-line prefer-const, @typescript-eslint/ban-types
      let total: Number = event.total;
      // eslint-disable-next-line prefer-const
      let result: any = loaded.valueOf() / total.valueOf();

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
            console.log(response);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    // send file in body
    const index = data.indexOf(";base64,") + 7;
    xhr.send(JSON.stringify({ data: data.substr(index) }));
  } else {
    if (typeof onError === "function") {
      onError({
        code: 500,
        message: "To upload image, you have pass token and image data as base 64 string",
      });
    } else {
      console.error("To upload image, you have pass token and image data as base 64 string");
    }
  }
};

export default {
  uploadImage: (params) => uploadFile(urlsApi.image.upload, params),
  getFavicon: (host) => fetch(`https://s2.googleusercontent.com/s2/favicons?domain=${host}`),
};

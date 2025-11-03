import { v4 as uuidv4 } from "uuid";
import imageApi from "services/ImageService";
import { showToast } from "./common";
import { imagesSize, replaceImageURL } from "./generation";
import { getFileBase64, getImageBase64KeepFileType } from "utils/file";

/**
 * UPLOAD IMAGE
 * @param {*} url
 * @param {*} imageElement
 */
export const readRemoteImageFromURL = (url, imageElement) => {
  let imageURL;
  try {
    imageURL = new URL(url);
  } catch (error) {
    return false;
  }

  if (imageURL) {
    // eslint-disable-next-line prefer-const
    let request = new XMLHttpRequest();
    request.open("GET", imageURL.href, true);
    request.responseType = "blob";
    request.onload = function () {
      if (request && request.response) {
        // eslint-disable-next-line prefer-const
        let reader = new FileReader();
        reader.onload = function (event) {
          // upload base64 was read
          // eslint-disable-next-line prefer-const
          let base64Value = event.target.result;
          imageElement.src = base64Value;
          imageApi.uploadImage({
            data: base64Value,
            onSuccess: (uploadedImage) => {
              imageElement.setAttribute(
                "src",
                `${uploadedImage.image_url}` //?w=${imagesSize.content}
              );
            },
          });
        };
        reader.readAsDataURL(request.response);
      }
    };

    request.onerror = function (event) {
      if (event) {
        imageElement.parentNode.removeChild(imageElement);
        alert("Không thể chèn ảnh này.");
      }
    };

    request.send();
  }
};

export const setKeyForImageFile = (files) => {
  const filesObject = {};
  files.map((file) => {
    const key = uuidv4();
    Object.assign(filesObject, { [key]: file });
  });
  return filesObject;
};

/**
 *
 * @param {*} files
 * @param {*} callback Xử lý xong thì gọi lại hàm callback
 * @param {*} autoConvertToJPG
 * @param {*} getProgress Callback lấy % hoàn thành
 */
export const uploadImageFromFiles = (files, callback, autoConvertToJPG, getProgress?: any) => {
  files = setKeyForImageFile([...files]);
  const convertToBase64 = autoConvertToJPG ? getFileBase64 : getImageBase64KeepFileType;
  Object.keys(files).map((key) => {
    // eslint-disable-next-line prefer-const
    let requiredFiles = ["image/jpg", "image/gif", "image/png", "image/jpeg"];
    if (files && requiredFiles.indexOf(files[key].type) > -1) {
      convertToBase64(files[key]).then((data) => {
        imageApi.uploadImage({
          data,
          onSuccess: (res) => {
            // this.showImage(res.image_url, key);
            callback(res.image_url, key);
          },
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onProgress: (percent) => {
            // console.log("percent =>", percent);
            getProgress && getProgress(percent);
          },
          onError: (error) => {
            // console.log(error);
            showToast("Có lỗi xảy ra trong quá trình upload ảnh", "error");
          },
        });
      });
    } else {
      showToast("Chỉ hỗ trợ định dạng ảnh jpg, gif, png, jpeg", "error");
    }
  });
};

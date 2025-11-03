import { v4 as uuidv4 } from "uuid";
import videoApi from "services/FileService";
import imageApi from "services/ImageService";
import { FILE_VIDEO_MAX } from "./constant";

export const setKeyForVideoFile = (files) => {
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
 * @param {*} callback
 * @param {*} showStatus Hiển thị phần trăm hoàn thành
 * @param {*} onAddVideoThumbnail Lấy về ảnh thumbnail của video
 * @param {*} onError Lỗi thì báo lại
 */
export const uploadVideoFromFiles = (files, callback, showStatus, onAddVideoThumbnail, onError) => {
  files = setKeyForVideoFile([...files]);
  Object.keys(files).map((key) => {
    const requiredFiles = ["video/mp4", "video/avi", "video/quicktime"];
    if (files && requiredFiles.indexOf(files[key].type) > -1) {
      // 300MB
      if (files[key].size > FILE_VIDEO_MAX) {
        setTimeout(() => onError(key, `Chỉ hỗ trợ video có dung lượng không quá ${FILE_VIDEO_MAX / 1024 / 1024}MB`), 0);
        return;
      }

      //Xử lý ảnh thumbnail
      if (typeof onAddVideoThumbnail === "function") {
        const fileReader = new FileReader();
        fileReader.onload = function () {
          const blob = new Blob([fileReader.result], {
            type: files[key].type,
          });
          const url = URL.createObjectURL(blob);
          const video = document.createElement("video");
          const snapImage = function (video) {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = canvas.toDataURL("image/jpeg", 0.5);
            imageApi.uploadImage({
              data: image,
              onSuccess: (res) => {
                onAddVideoThumbnail(res.image_url, key);
              },
              onError: (error) => {
                console.log(error);
              },
            });
            URL.revokeObjectURL(url);
            return true;
          };

          const onplay = function () {
            setTimeout(() => {
              if (snapImage(video)) {
                video.removeEventListener("play", onplay);
                video.pause();
              }
            }, 1000);
          };
          video.addEventListener("play", onplay);

          video.preload = "metadata";
          video.src = url;

          // Load video in Safari / IE11
          video.muted = true;
          video.playsInline = true;
          const readyStateChangeIntervalCheck = setInterval(() => {
            if (video.readyState > 0) {
              clearInterval(readyStateChangeIntervalCheck);
              video.currentTime = Math.floor(video.duration / 2);
              video.play();
            }
          }, 300);
        };

        fileReader.readAsArrayBuffer(files[key]);
      }

      videoApi.uploadVideo({
        data: files[key],
        onSuccess: (res) => {
          callback(res.file_url, key);
        },
        onProgress: (percent) => {
          if (typeof showStatus === "function") {
            showStatus(percent, key);
          }
        },
        onError: (error) => {
          console.log(error);
          // setTimeout(() => onError(key, error), 0);
        },
      });
    } else {
      setTimeout(() => {
        if (onError) {
          onError(key, "Chỉ hỗ trợ định dạng mp4, avi và mov");
        }
      }, 0);
    }
  });
};

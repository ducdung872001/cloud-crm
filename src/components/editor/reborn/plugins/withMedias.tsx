import isUrl from "is-url";
import { ImageElement, LinkElement, VideoElement } from "../../custom-types";
import { Transforms } from "slate";
import imageApi from "services/ImageService";
import { uploadVideoFromFiles } from "utils/videoBlob";
import { getMeta } from "reborn-util";

const withMedias = (editor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === "image" || element.type === "video" ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    const { files } = data;
    let thumbnail = "";

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split("/");

        if (mime === "image") {
          reader.addEventListener("load", () => {
            const url = reader.result;

            //Upload ảnh data lên cdn
            uploadImageFromDirect(
              url,
              (imageLink) => {
                insertImage(editor, imageLink);
              },
              (percent) => {
                console.log("percent =>", percent);
              }
            );
          });

          reader.readAsDataURL(file);
        }

        if (mime === "video") {
          uploadVideoFromFiles(
            files,
            (videoLink) => {
              console.log("videoLink =>", videoLink, thumbnail);
              insertVideo(editor, videoLink, thumbnail);
            },
            (percent) => {
              console.log("percent =>", percent);
            },
            (imageLink) => {
              console.log("thumbnail =>", imageLink);
              thumbnail = imageLink;
            },
            null
          );
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else if (isVideoUrl(text)) {
      insertVideo(editor, text, "");
    } else {
      insertData(data);
    }
  };

  return editor;
};

/**
 * Xử lý khi người dùng kéo ảnh trực tiếp từ ngoài vào trình soạn thảo | copy-paste link từ ngoài vào trong trình soạn thảo
 * @param data
 * @param callback
 * @param showStatus
 */
const uploadImageFromDirect = (data, callback, showStatus) => {
  imageApi.uploadImage({
    data,
    onSuccess: (res) => {
      callback(res.image_url);
    },
    onProgress: (percent) => {
      if (typeof showStatus === "function") {
        showStatus(percent);
      }
    },
    onError: (error) => {
      alert("Có lỗi xảy ra trong quá trình upload ảnh");
    },
  });
};

const insertVideo = (editor, url, thumbnail) => {
  const text = { text: "" };
  const video: VideoElement = { type: "video", url, children: [text] };
  Transforms.insertNodes(editor, video);

  //Chèn bổ sung một khối empty paragraph
  Transforms.insertNodes(editor, { type: "paragraph", children: [text] });
};

/**
 * Chèn ảnh lần đầu vào trình soạn thảo
 * @param editor
 * @param url
 */
const insertImage = (editor, url) => {
  //Tự detect cỡ ảnh ban đầu ở đây
  getMeta(url, (err, img) => {
    console.log(img.naturalWidth, img.naturalHeight);

    const text = { text: "" };
    const image: ImageElement = { type: "image", url, width: img.naturalWidth, height: img.naturalHeight, children: [text] };

    Transforms.insertNodes(editor, image);
  });
};

/**
 * Tìm và thay thế ảnh (Dùng cho cập nhật lại thuộc tính của ảnh)
 * @param editor
 * @param url
 * @param newUrl
 * @param link
 * @param width
 * @param height
 * @param desc
 * @param point
 */
const updateImage = (editor, url, newUrl, link, width, height, desc, align, point) => {
  let imgObj = {
    type: "image",
    url: newUrl,
    alt: `${desc}`,
    longdesc: link || "",
    width,
    height,
    align,
    point,
    children: [{ text: "" }],
  };

  //Trường hợp có link
  if (link) {
    Transforms.setNodes(editor, imgObj, {
      at: Range,
      match: (n: any) => n.type == "image" && n.url == url && (n.point ? n.point < point : true),
    });

    console.log("end fuck");
    return;
  }

  //Trường hợp cập nhật không có link trong ảnh
  Transforms.setNodes(editor, imgObj, {
    at: Range,
    match: (n: any) => n.type == "image" && n.url == url && (n.point ? n.point < point : true),
  });
};

const isVideoUrl = (url) => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split(".").pop();

  console.log("ext =>", ext);
  return ["mp3", "mp4", "avi"].includes(ext); //Mở rộng tay ở đây
};

const isImageUrl = (url) => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split(".").pop();

  console.log("ext =>", ext);
  return ["png", "jpg", "jpeg"].includes(ext); //Mở rộng tay ở đây
};

export { insertVideo, insertImage, updateImage, withMedias };

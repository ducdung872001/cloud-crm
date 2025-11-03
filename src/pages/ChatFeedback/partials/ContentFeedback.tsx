import React, { useEffect, useRef, useState } from "react";
import HeadlessTippy from "@tippyjs/react/headless";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { FILE_IMAGE_MAX } from "utils/constant";
import UploadMedia from "./UploadMedia";
import UploadDocument from "./UploadDocument";
import FeedbackService from "services/FeedbackService";
import FileService from "services/FileService";
import { uploadVideoFormData } from "utils/videoFormData";
import { uploadDocumentFormData } from "utils/document";
import "./ContentFeedback.scss";

interface IContentFeedbackProps {
  data: any;
  onHide: (reload: boolean) => void;
}

export default function ContentFeedback(props: IContentFeedbackProps) {
  const { data, onHide } = props;

  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const [loadingSend, setLoadingSend] = useState<boolean>(false);
  const [showModalOption, setShowModalOption] = useState<boolean>(false);

  const [messageChat, setMessageChat] = useState({
    id: null,
    content: "",
  });

  // call api khi click vào icon send
  const handleSendChat = async (e) => {
    e.preventDefault();

    if (!messageChat.content) return;

    setLoadingSend(true);

    const body = {
      ...messageChat,
    };

    const response = await FeedbackService.update(body);

    if (response.code === 0) {
      setMessageChat({ ...messageChat, content: "" });
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setLoadingSend(false);
  };

  // call api khi ấn nút enter trên bàn phím khi nhập nội dung
  const handleEnterSendChat = async () => {
    if (messageChat.content) {
      setLoadingSend(true);

      const body = {
        ...messageChat,
      };

      const response = await FeedbackService.update(body);

      if (response.code === 0) {
        setMessageChat({ ...messageChat, content: "" });
        onHide(true);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setLoadingSend(false);
    }
  };

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEnterSendChat();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [textareaRef.current?.value]);

  const handleTextareaChange = (e) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }

    const value = e.target.value;
    setMessageChat({ ...messageChat, content: value });
  };

  const [showModalMedia, setShowModalMedia] = useState<boolean>(false);

  const [infoMedia, setInfoMedia] = useState({
    type: "",
    url: "",
    fileName: "",
  });

  const [infoDocument, setInfoDocument] = useState({
    type: "",
    url: "",
    fileSize: 0,
    fileName: "",
  });

  const [checkType, setCheckType] = useState<string>(null);
  const [showProgress, setShowProgress] = useState<number>(0);

  const [optionUploadFile] = useState([
    {
      icon: <Icon name="Document" />,
      name: "Tài liệu",
      is_show: false,
      action: 1,
    },
    {
      icon: <Icon name="Image" />,
      name: "Ảnh hoặc video",
      is_show: false,
      action: 2,
    },
  ]);

  const onClickOutside = () => {
    setShowModalOption(false);
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setInfoMedia({ ...infoMedia, type: "image", url: result });
  };

  const [showModalDocument, setShowModalDocument] = useState<boolean>(false);

  const onSuccessDocument = (data) => {
    if (data) {
      setInfoDocument({ type: data.extension, url: data.fileUrl, fileSize: data.fileSize, fileName: data.fileName });
    }
  };

  const onErrorDocument = (message) => {
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    setShowModalDocument(false);
  };

  const onProgressDocument = (percent) => {
    if (percent) {
      setShowProgress(percent);

      if (percent >= 99) {
        setShowProgress(0);
      }
    }
  };

  //* Xử lý video
  let onSuccess = (data) => {
    if (data) {
      setInfoMedia({ ...infoMedia, type: data.fileType, url: data.fileUrl });
    }
  };

  let onError = (message) => {
    showToast(message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  let onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent);

      if (percent >= 99) {
        setShowProgress(0);
      }
    }
  };

  const handleChangeUpload = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files[0].size > FILE_IMAGE_MAX) {
        showToast(`Ảnh tải lên giới hạn dung lượng không quá ${FILE_IMAGE_MAX / 1024 / 1024}MB`, "warning");
        e.target.value = "";
      } else {
        const typeUpload = e.target.files[0].type;

        if (typeUpload.startsWith("video")) {
          setCheckType("video");
          setShowModalMedia(true);
          uploadVideoFormData(e.target.files[0], onSuccess, onError, onProgress);
        }

        if (typeUpload.startsWith("image")) {
          setCheckType("image");
          setShowModalMedia(true);
          handUploadFile(e.target.files[0]);
          // uploadImageFromFiles(e.target.files, showImage, false, getProgress);
        }

        if (typeUpload.startsWith("application")) {
          setShowModalDocument(true);
          uploadDocumentFormData(e.target.files[0], (onSuccess = onSuccessDocument), (onError = onErrorDocument), (onProgress = onProgressDocument));
        }

        e.target.value = null;
      }
    }
  };

  useEffect(() => {
    if (data) {
      if (data.medias) {
        const conditionMedia = data.medias[0]["type"];
        const dataMedia = data.medias[0];

        if (conditionMedia === "image" || conditionMedia === "video") {
          setShowModalMedia(true);
          setInfoMedia({ type: dataMedia.type, url: dataMedia.url, fileName: "" });
        } else {
          setShowModalDocument(true);
          setInfoDocument({ ...infoDocument, type: dataMedia.type, url: dataMedia.url, fileName: dataMedia.fileName, fileSize: dataMedia.fileSize });
        }
      } else {
        setMessageChat({ ...messageChat, id: data.id, content: data.content });
      }
    }
  }, [data]);

  return (
    <div className="wrapper__content--feedback">
      <div className="content-message">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Soạn tin"
          value={messageChat.content}
          autoFocus={true}
          onKeyDown={handleOnKeyDown}
          className="detail-message"
          onChange={handleTextareaChange}
        />
      </div>

      <div className={`file-document ${showModalOption ? "active" : ""}`}>
        <HeadlessTippy
          interactive
          visible={showModalOption}
          render={(attrs) => (
            <div className="popover-option" {...attrs}>
              <ul className="menu-item">
                {optionUploadFile.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setTimeout(() => setShowModalOption(item.is_show), 300);
                    }}
                  >
                    <label style={{ cursor: "pointer" }} htmlFor={`imageUpload-${item.action}`}>
                      <span className="icon-item">{item.icon}</span>
                      <span className="title-item">{item.name}</span>
                    </label>
                    <input
                      ref={inputRef}
                      type="file"
                      id={`imageUpload-${item.action}`}
                      accept={item.action === 2 ? "video/*,image/*" : ".xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"}
                      className="d-none"
                      onChange={(e) => handleChangeUpload(e)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
          offset={[0, 18]}
          onClickOutside={onClickOutside}
        >
          <span className="icon-attach--file" onClick={() => setShowModalOption(!showModalOption)}>
            <Icon name="AttachFile" />
          </span>
        </HeadlessTippy>
      </div>

      <div className={`${messageChat.content ? "active__send--message" : "hide__send--message"}`} onClick={(e) => handleSendChat(e)}>
        {loadingSend ? <Icon name="Refresh" className="icon-refresh" /> : <Icon name="Send" />}
      </div>

      <UploadMedia
        infoMedia={infoMedia}
        onShow={showModalMedia}
        id={data?.id}
        onHide={(reload) => {
          if (reload) {
            onHide(true);
          }

          setShowModalMedia(false);
          setInfoMedia({ type: "", url: "", fileName: "" });
        }}
        content={data?.content}
      />

      <UploadDocument
        onShow={showModalDocument}
        infoDocument={infoDocument}
        progress={showProgress}
        id={data?.id}
        onHide={(reload) => {
          if (reload) {
            onHide(true);
          }

          setShowModalDocument(false);
          setInfoDocument({ type: "", url: "", fileName: "", fileSize: 0 });
        }}
        content={data?.content}
      />
    </div>
  );
}

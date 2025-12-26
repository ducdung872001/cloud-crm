import React, { Fragment, useEffect, useRef, useState } from "react";
import HeadlessTippy from "@tippyjs/react/headless";
import Icon from "components/icon";
import { FILE_IMAGE_MAX } from "utils/constant";
import WorkOrderService from "services/WorkOrderService";
import { showToast } from "utils/common";
import { uploadVideoFormData } from "utils/videoFormData";
// import { uploadImageFromFiles } from "utils/image";
import { uploadDocumentFormData } from "utils/document";
import FileService from "services/FileService";
import EmojiChat from "../EmojiChat";
import UploadMedia from "../UploadMedia";
import UploadDocument from "../UploadDocument";
import "./index.scss";

interface IContentChatProps {
  dataMessage: any;
  worId: number;
  employeeId: number;
  onHide: (reload) => void;
}

export default function ContentChat(props: IContentChatProps) {
  const { dataMessage, worId, employeeId, onHide } = props;

  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const [showModalOption, setShowModalOption] = useState<boolean>(false);
  const [showEmojiChat, setShowEmojiChat] = useState<boolean>(false);
  const [loadingSend, setLoadingSend] = useState<boolean>(false);

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

  const [messageChat, setMessageChat] = useState({
    id: null,
    content: "",
  });

  useEffect(() => {
    if (dataMessage) {
      setMessageChat({
        id: dataMessage.id,
        content: dataMessage.content,
      });
    }
  }, [dataMessage]);

  const [showModalMedia, setShowModalMedia] = useState<boolean>(false);
  const [showModalDocument, setShowModalDocument] = useState<boolean>(false);

  const conditionWorId = dataMessage ? dataMessage.worId : worId;
  const conditionEmployeeId = dataMessage ? dataMessage.employeeId : employeeId;

  // call api khi click vào icon send
  const handleSendChat = async (e) => {
    e.preventDefault();

    if (!messageChat.content) return;

    setLoadingSend(true);

    const body = {
      ...messageChat,
      worId: conditionWorId,
      employeeId: conditionEmployeeId,
    };

    const response = await WorkOrderService.addWorkExchange(body);

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
        worId: conditionWorId,
        employeeId: conditionEmployeeId,
      };

      const response = await WorkOrderService.addWorkExchange(body);

      if (response.code === 0) {
        setMessageChat({ ...messageChat, content: "" });
        onHide(true);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setLoadingSend(false);
    }
  };

  const updateTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const handleOnKeyDown = (e) => {
    if (e.altKey && e.key === "Enter") {
      // Ngăn chặn sự kiện mặc định (ngăn chặn xuống dòng)
      e.preventDefault();

      // Thêm dòng mới vào vị trí hiện tại của con trỏ
      const { selectionStart, selectionEnd } = e.target;
      const newText = messageChat.content.slice(0, selectionStart) + "\n" + messageChat.content.slice(selectionEnd);

      // Cập nhật nội dung của textarea
      setMessageChat({ ...messageChat, content: newText });

      // Cập nhật chiều cao của textarea
      updateTextareaHeight();

      // Cộng thêm 1 dòng chiều cao
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + textareaRef.current.offsetHeight}px`;

      // Cập nhật con trỏ sau dòng mới
      e.target.setSelectionRange(selectionStart + 1, selectionStart + 1);
    }

    if (e.key === "Enter" && !e.altKey) {
      e.preventDefault();
      // Gọi hàm hoặc API tại đây
      handleEnterSendChat();
    }
  };

  const onClickOutside = () => {
    setShowModalOption(false);
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

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setInfoMedia({ ...infoMedia, type: "image", url: result });
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

  //* Xử lý tài liệu
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

  //* Xử lý ảnh
  const showImage = (url) => {
    if (url) {
      setInfoMedia({ ...infoMedia, type: "image", url: url });
    }
  };

  const getProgress = (percent) => {
    if (percent) {
      setShowProgress(percent);

      if (percent >= 99) {
        setShowProgress(0);
      }
    }
  };

  return (
    <Fragment>
      <div className="wrapper__message--chat--exchange">
        <div className={`icon-emotion ${showEmojiChat ? "isShowEmotion" : ""}`}>
          <Icon name="Happy" onClick={() => setShowEmojiChat(!showEmojiChat)} />
          <EmojiChat
            onShow={showEmojiChat}
            dataMessage={messageChat}
            setDataMessage={setMessageChat}
            onHide={() => {
              setShowEmojiChat(false);
            }}
          />
        </div>

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
          checkType={checkType}
          infoMedia={infoMedia}
          onShow={showModalMedia}
          id={messageChat.id}
          worId={worId}
          employeeId={conditionEmployeeId}
          onHide={(reload) => {
            if (reload) {
              onHide(true);
            }

            setShowModalMedia(false);
            setInfoMedia({ type: "", url: "", fileName: "" });
          }}
        />
        <UploadDocument
          onShow={showModalDocument}
          infoDocument={infoDocument}
          progress={showProgress}
          id={messageChat.id}
          worId={worId}
          employeeId={conditionEmployeeId}
          onHide={(reload) => {
            if (reload) {
              onHide(true);
            }

            setShowModalDocument(false);
            setInfoDocument({ type: "", url: "", fileName: "", fileSize: 0 });
          }}
        />
      </div>
    </Fragment>
  );
}

import React, { Fragment, useState, useEffect, useRef } from "react";
import HeadlessTippy from "@tippyjs/react/headless";
import { IMessageChatFeedbackPersonProps } from "model/customer/PropsModel";
import { ICustomerFeedbackUpdateRequestModel } from "model/customer/CustomerRequestModel";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import EmojiChat from "./partials/EmojiChat/EmojiChat";
import UploadMediaModal from "./partials/UploadMedia/UploadMediaModal";
import UploadDocumentModal from "./partials/UploadDocument/UploadDocumentModal";
import { showToast } from "utils/common";
import { FILE_IMAGE_MAX } from "utils/constant";
import { uploadVideoFormData } from "utils/videoFormData";
// import { uploadImageFromFiles } from "utils/image";
import FileService from "services/FileService";
import { uploadDocumentFormData } from "utils/document";
import "./MessageChatFeedbackPerson.scss";

export default function MessageChatFeedbackPerson(props: IMessageChatFeedbackPersonProps) {
  const { idCustomer, dataFeedback, onReload } = props;

  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const [showModalOption, setShowModalOption] = useState<boolean>(false);
  const [showEmojiChat, setShowEmojiChat] = useState<boolean>(false);
  const [loadingSend, setLoadingSend] = useState<boolean>(false);
  const [infoMedia, setInfoMedia] = useState({
    type: "",
    url: "",
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

  const [messageChatFeedback, setMessageChatFeedback] = useState<ICustomerFeedbackUpdateRequestModel>({
    content: "",
    type: 2,
    media: null,
    customerId: idCustomer,
  });

  const [showModalMedia, setShowModalMedia] = useState<boolean>(false);
  const [showModalDocument, setShowModalDocument] = useState<boolean>(false);

  const updateTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (dataFeedback) {
      if (dataFeedback.media) {
        const conditionMedia = dataFeedback.media.type;
        const dataMedia = dataFeedback.media;
        if (conditionMedia === "image" || conditionMedia === "video") {
          setShowModalMedia(true);
          setInfoMedia({ type: dataMedia.type, url: dataMedia.url });
        } else {
          setShowModalDocument(true);
          setInfoDocument({ ...infoDocument, type: dataMedia.type, url: dataMedia.url, fileName: dataMedia.fileName });
        }
      } else {
        setMessageChatFeedback({ ...messageChatFeedback, content: dataFeedback.content, id: dataFeedback.id });
        textareaRef.current.focus();
      }
    } else {
      setMessageChatFeedback({ ...messageChatFeedback, content: "", media: "", id: null });
    }
  }, [dataFeedback]);

  useEffect(() => {
    setMessageChatFeedback({ ...messageChatFeedback, customerId: idCustomer, content: "" });
  }, [idCustomer]);

  // call api khi click vào icon send
  const handleSendChat = async (e) => {
    e.preventDefault();

    if (!messageChatFeedback.content) return;

    setLoadingSend(true);

    const body: ICustomerFeedbackUpdateRequestModel = {
      ...(messageChatFeedback as ICustomerFeedbackUpdateRequestModel),
    };

    const response = await CustomerService.customerExchangeUpdate(body);

    if (response.code === 0) {
      setMessageChatFeedback({ ...messageChatFeedback, content: "", id: 0 });
      onReload(true);
    } else {
      setMessageChatFeedback({ ...messageChatFeedback, content: "", id: 0 });
    }

    setLoadingSend(false);
  };

  const onSubmit = async () => {
    setLoadingSend(true);

    const body: ICustomerFeedbackUpdateRequestModel = {
      ...(messageChatFeedback as ICustomerFeedbackUpdateRequestModel),
    };

    const response = await CustomerService.customerExchangeUpdate(body);

    if (response.code === 0) {
      setMessageChatFeedback({ ...messageChatFeedback, content: "", id: 0 });
      onReload(true);
    } else {
      setMessageChatFeedback({ ...messageChatFeedback, content: "", id: 0 });
    }

    setLoadingSend(false);
  };

  const handleOnKeyDown = (e) => {
    if (e.altKey && e.key === "Enter") {
      // Ngăn chặn sự kiện mặc định (ngăn chặn xuống dòng)
      e.preventDefault();

      // Thêm dòng mới vào vị trí hiện tại của con trỏ
      const { selectionStart, selectionEnd } = e.target;
      const newText = messageChatFeedback.content.slice(0, selectionStart) + "\n" + messageChatFeedback.content.slice(selectionEnd);

      // Cập nhật nội dung của textarea
      setMessageChatFeedback({ ...messageChatFeedback, content: newText });

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
      onSubmit();
    }
  };

  const onClickOutside = () => {
    setShowModalOption(false);
  };

  const [heightTagTextarea, setHeightTagTextarea] = useState(null);

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
      setHeightTagTextarea(textareaRef.current.scrollHeight);
    }

    const value = e.target.value;
    setMessageChatFeedback({ ...messageChatFeedback, content: value });
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
      setInfoMedia({ type: data.fileType, url: data.fileUrl });
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

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setInfoMedia({ ...infoMedia, type: "image", url: result });
  };

  return (
    <Fragment>
      <div className="message-chat-feedback">
        <div className={`icon-emotion ${showEmojiChat ? "isShowEmotion" : ""}`}>
          <Icon name="Happy" onClick={() => setShowEmojiChat(!showEmojiChat)} />
          {showEmojiChat && (
            <div className="emoji-chat">
              <EmojiChat
                onShow={showEmojiChat}
                dataMessage={messageChatFeedback}
                setDataMessage={messageChatFeedback}
                onHide={() => {
                  setShowEmojiChat(false);
                }}
              />
            </div>
          )}
        </div>
        <div className="content-message">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Soạn tin"
            value={messageChatFeedback.content}
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
        <div className={`${messageChatFeedback.content ? "active__send--message" : "hide__send--message"}`} onClick={(e) => handleSendChat(e)}>
          {loadingSend ? <Icon name="Refresh" className="icon-refresh" /> : <Icon name="Send" />}
        </div>
        <UploadMediaModal
          checkType={checkType}
          infoMedia={infoMedia}
          idItem={dataFeedback?.id}
          onShow={showModalMedia}
          mailboxId={idCustomer}
          onAddUpload={(upload) => {
            if (upload) {
              inputRef.current.click();
            }
          }}
          onHideForm={(reload) => {
            if (reload) {
              onReload(true);
            }
            setShowModalMedia(false);
            setInfoMedia({ type: "", url: "" });
          }}
          content={dataFeedback?.content || ""}
        />
        <UploadDocumentModal
          onShow={showModalDocument}
          infoDocument={infoDocument}
          idItem={dataFeedback?.id}
          mailboxId={idCustomer}
          progress={showProgress}
          content={dataFeedback?.content || ""}
          onEditUpload={(upload) => {
            if (upload) {
              inputRef.current.click();
            }
          }}
          onHideForm={(reload) => {
            if (reload) {
              onReload(true);
            }
            setShowModalDocument(false);
            setInfoDocument({ type: "", url: "", fileName: "", fileSize: 0 });
          }}
        />
      </div>
    </Fragment>
  );
}

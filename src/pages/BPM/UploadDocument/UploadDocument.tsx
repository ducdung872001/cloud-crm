import React, { useEffect, useState } from "react";
import parser from "html-react-parser";
import { formatCurrency, getSearchParameters } from "reborn-util";
import DocumentService from "services/DocumentService";
import FileService from "services/FileService";
import { FILE_DOC_MAX, FILE_IMAGE_MAX } from "utils/constant";
import { handDownloadFileOrigin, showToast } from "utils/common";
import "./UploadDocument.scss";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import ImgRar from "assets/images/img-rar.png";
import ImgZip from "assets/images/img-zip.png";
import ImgFilePDF from "assets/images/img-pdf.png";
import ImgFileDoc from "assets/images/img-word.png";
import ImgFileExcel from "assets/images/img-excel.png";
import ImgFilePowerpoint from "assets/images/img-powerpoint.png";
import ModalViewDocument from "./ModalViewDocument/ModalViewDocument";

/**
 * Nhận tham số đầu vào gồm nodeId, processId, potId, fieldName => Cho phép render ra form tương ứng
 * @returns
 */
export default function UploadDocument() {
  document.title = ""; //Ảnh hoặc file theo định dạng
  const params: any = getSearchParameters();
  console.log("paramsDocument", params);

  //Định dạng là mảng JSON
  const [dataAttachment, setDataAttachment] = useState([]);
  const [nodeId, setNodeId] = useState("");
  const [processId, setProcessId] = useState(0);
  const [workId, setWorkId] = useState(0);
  const [potId, setPotId] = useState(0);
  const [fieldName, setFieldName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [indexNewUpload, setIndexNewUpload] = useState(null);
  const [isModalViewDocument, setIsModalViewDocument] = useState(false);
  const [dataDoc, setDataDoc] = useState(null);

  console.log(dataAttachment);

  const handleImageUpload = (e) => {
    e.preventDefault();
    console.log("e.target.files[0]", e.target.files[0]);

    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files[0].size > FILE_DOC_MAX) {
        showToast(`Tài liệu tải lên giới hạn dung lượng không quá ${FILE_DOC_MAX / 1024 / 1024}MB`, "warning");
        setDataAttachment([
          ...dataAttachment,
          {
            fileUrl: "",
            fileName: e.target.files[0]?.name,
            fileSize: e.target.files[0]?.size,
            extension: e.target.files[0]?.name.split(".").pop(),
            fileType: e.target.files[0]?.type,
            fileSizeExceed: true,
          },
        ]);
        e.target.value = "";
      } else {
        setIndexNewUpload(dataAttachment.length);
        setDataAttachment([
          ...dataAttachment,
          {
            fileUrl: "",
            fileName: e.target.files[0]?.name,
            fileSize: e.target.files[0]?.size,
            extension: e.target.files[0]?.name.split(".").pop(),
            fileType: e.target.files[0]?.type,
          },
        ]);
        handUploadFile(e.target.files[0]);
        e.target.value = null;
      }
    }
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    console.log("result123", result);

    showImage(data);
    setIsLoadingFile(false);
    setDataAttachment([data, ...dataAttachment]);
  };

  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState(0);

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent.toFixed(0));
      // if (percent === 100) {
      //   setShowProgress(0);
      // }
    }
  };

  useEffect(() => {
    if (isLoadingFile === false) {
      setShowProgress(0);
    }
  }, [isLoadingFile]);

  const [dragging, setDragging] = useState<boolean>(false);

  function handleDragStart(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const newFiles = [...dataAttachment];
    const droppedFiles: any = Array.from(e.dataTransfer.files);
    console.log("droppedFiles", droppedFiles);

    droppedFiles.forEach((file) => {
      const checkFile = file.type;

      if (!newFiles.find((f) => f.name === file.name)) {
        setIsLoadingFile(true);
        handUploadFile(file);
        // if (checkFile.startsWith("image")) {
        //   handUploadFile(file);
        // }
        // if (checkFile.startsWith("application")) {
        //   uploadDocumentFormData(file, onSuccess, onError, onProgress);
        // }
      }
    });

    setDataAttachment(newFiles);
  }

  const handUploadFile = async (file) => {
    setIsLoadingFile(true);
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess, onError, onProgress });
  };

  //* Đoạn này nếu như mà lỗi không tải lên được thì bắn ra thông báo
  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  /**
   * Show ra thông tin tải ảnh lên => Dùng thông tin này lưu vào tiếp vào data => Save vào db
   * @param item
   */
  const showImage = (item) => {
    //Đẩy luôn res xuống db
    handSubmitForm(item);
  };

  /**
   * Lấy ra các tài liệu được cung cấp
   * @param id
   * @returns
   */
  const getDocuments = async (nodeId: string, processId: number, potId: number, fieldName: string, workId: number, documentType: string) => {
    if (!nodeId || !processId || !potId || !fieldName || !documentType) return;
    setNodeId(nodeId);
    setProcessId(processId);
    setWorkId(workId);
    setPotId(potId);
    setFieldName(fieldName);
    setDocumentType(documentType);

    const response = await DocumentService.detail(nodeId, processId, potId, fieldName, workId, documentType);
    if (response.code === 0) {
      const result = response.result;

      setDataAttachment(result == null ? [] : JSON.parse(result?.data || []));
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    getDocuments(params?.nodeId, +params?.processId, +params?.potId, params?.fieldName, params?.workId, params?.documentType);
  }, []);

  /**
   * Tải tài liệu lên (Luôn là 1 phần tử)
   * @param e
   */
  const handSubmitForm = async (item: any) => {
    let dataSubmit = {
      nodeId,
      processId,
      workId,
      potId,
      fieldName,
      documentType: documentType || null,
      data: JSON.stringify(item),
    };

    console.log("item>>>>", item);

    const response = await DocumentService.update(dataSubmit);

    //Tải lại lấy danh sách
    getDocuments(nodeId, processId, potId, fieldName, workId, documentType);
  };
  // const handDelete = async (item: any) => {
  //   console.log("data>>>>", dataAttachment);
  //   setDataAttachment(dataAttachment.filter((x) => x !== item));
  //   console.log(item);

  //   const response = await DocumentService.delete(item.id);
  //   console.log(response);

  //   //Tải lại lấy danh sách
  //   getDocuments(nodeId, processId, potId, fieldName, workId);
  //   // getDocuments(nodeId, processId, potId, fieldName);
  // };

  const handDelete = async (item: any) => {
    console.log("data>>>>", dataAttachment);
    setDataAttachment(dataAttachment.filter((x) => x !== item));
    console.log("item>>>>", item);
    const response = await DocumentService.deleteByUrl(nodeId, processId, potId, fieldName, item.fileUrl, documentType);
    // console.log(response);

    //Tải lại lấy danh sách
    // getDocuments(nodeId, processId, potId, fieldName);
  };

  console.log("data>>>>", dataAttachment);
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // const onDownloadAll = async () => {
  //   const arrayPromise = [];

  //   data.map((item) => {
  //     const promise = new Promise((resolve, reject) => {
  //       // BusinessProcessService.delete(item).then((res) => resolve(res));
  //       handDownloadFileOrigin(item.fileUrl, item.fileName);
  //     });

  //     arrayPromise.push(promise);
  //   });

  //   Promise.all(arrayPromise).then((result) => {
  //     // if (result.length > 0) {
  //     //   showToast("Xoá quy trình  thành công", "success");
  //     //   getListBusinessProcess(params);
  //     //   setListIdChecked([]);
  //     // } else {
  //     //   showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //     // }
  //     // setShowDialog(false);
  //     // setContentDialog(null);
  //   });
  // };

  const [downloadAll, setDownloadAll] = useState(false);
  // Hàm để tải và nén các file
  const downloadAndZipFiles = async (listFile) => {
    const zip = new JSZip();
    const folder = zip.folder("files");

    // Tải từng file và thêm vào file nén
    for (const url of listFile) {
      const response = await fetch(url.fileUrl);
      const blob = await response.blob();
      const fileName = url.fileName;
      folder.file(fileName, blob);
    }

    // Tạo file nén và tải xuống
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "files.zip");
    });
    setDownloadAll(false);
  };

  // Gọi hàm khi người dùng nhấn vào nút tải xuống tất cả
  const handleDownloadAll = () => {
    setDownloadAll(true);
    downloadAndZipFiles(dataAttachment);

    window.parent.postMessage(
      {
        type: "EXPORT_DOCUMENT_ALL",
        dataAttachment: dataAttachment,
      },
      "*"
    );
  };

  const handleClick = (name, url) => {
    console.log("url", url);
    console.log("applink", `${process.env.APP_LINK}/app/view_document?name=${name}&url=${url}`);

    // window.open(`${process.env.APP_LINK}/app/view_document?name=${name}&url=${url}`, "_blank", "noopener,noreferrer");
    window.parent.postMessage(
      {
        type: "VIEW_DOCUMENT_TAB",
        dataLink: `${process.env.APP_LINK}/app/view_document?name=${name}&url=${url}`,
      },
      "*"
    );
  };

  return (
    <div className="page__link--upload_document">
      <form style={{ width: `100%` }} className="form__add--upload" onSubmit={(e) => handSubmitForm(e)}>
        <div className="header__add--upload">
          <label htmlFor="">Tài liệu đính kèm</label>
        </div>
        <div
          className="drop_area"
          draggable="true"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
        >
          <div className="drop_button">
            <label htmlFor="imageUpload" className="action-upload-image">
              <div className={`wrapper-upload`}>
                <div>
                  <Icon name="UploadRox" />
                </div>
                <div>Nhấn hoặc thả vào để tải lên</div>
              </div>
            </label>
            <div>
              <input className="d-none" type="file" id="imageUpload" name="Upload" accept="/*" onChange={(e) => handleImageUpload(e)} />
            </div>
          </div>
        </div>
        <div className="header__list--upload">
          <div className="header__list--left">Đã tải lên</div>
          {downloadAll ? (
            <div className="header__list--right">
              Đang nén
              <Icon name="Loading" />
            </div>
          ) : (
            <div
              className="header__list--right"
              onClick={() => {
                handleDownloadAll();
              }}
            >
              <Icon name="DownLoadNew" />
              Tải xuống tất cả
            </div>
          )}
        </div>
        <div className="body__list--upload">
          {dataAttachment != null && (dataAttachment?.length || 0) > 0
            ? dataAttachment.map((item, idx) => {
                return (
                  <div
                    className="item--upload"
                    onDoubleClick={() => {
                      // setIsModalViewDocument(true);
                      // setDataDoc({
                      //   fileUrl: item.fileUrl,
                      //   fileName: item.fileName
                      // })
                      handleClick(item.fileName, item.fileUrl);
                    }}
                  >
                    <div className="item--upload__left">
                      {item?.fileType == "image" ? (
                        <img src={item?.fileUrl} width={36} height={36} style={{ marginLeft: "8px" }} />
                      ) : (
                        // <Icon name="FileXls" />
                        <img
                          width={36}
                          height={36}
                          style={{ marginLeft: "8px" }}
                          src={
                            item?.extension === "docx" || item?.extension === "doc"
                              ? ImgFileDoc
                              : item?.extension === "xlsx"
                              ? ImgFileExcel
                              : item?.extension === "pdf" || item?.extension === "PDF"
                              ? ImgFilePDF
                              : item?.extension === "pptx"
                              ? ImgFilePowerpoint
                              : item?.extension === "zip"
                              ? ImgZip
                              : ImgRar
                          }
                          alt="File đã tải"
                        />
                      )}
                    </div>
                    <div className="item--upload__right">
                      <div className="right--top">
                        <div>
                          <Tippy content={item?.fileName || "File name"} maxWidth="100rem">
                            <div className="file-name">{item?.fileName || ""}</div>
                          </Tippy>
                        </div>

                        <div onClick={() => handDelete(item)} style={{ cursor: "pointer" }} title="Xoá file">
                          <Icon name="Times" />
                        </div>
                      </div>
                      {indexNewUpload === idx && isLoadingFile ? (
                        <div className="right--bottom">
                          <div className="progress">
                            <div className="slot">
                              <div style={{ width: showProgress + "%" }} className="rate" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {item?.fileSizeExceed ? (
                            <div className="right--bottom">
                              <div style={{ color: "#ed1b34" }}>Dung lượng file vượt quá 50MB</div>
                              <label htmlFor="imageUpload" style={{ cursor: "pointer" }}>
                                <Icon name="ArrowClockwise" />
                              </label>
                            </div>
                          ) : (
                            <div className="right--bottom">
                              <div className="size">{formatFileSize(item?.fileSize)}</div>
                              <label
                                htmlFor={item.fileUrl}
                                title="Tải xuống"
                                style={{ cursor: "pointer" }}
                                className="download"
                                onClick={() => {
                                  handDownloadFileOrigin(item.fileUrl, item.fileName);
                                  console.log("mở được file không nhỉ");
                                  window.parent.postMessage(
                                    {
                                      type: "EXPORT_DOCUMENT",
                                      fileUrl: item.fileUrl,
                                      fileName: item.fileName,
                                    },
                                    "*"
                                  );
                                }}
                              >
                                <Icon name="DownLoadNew" />
                              </label>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            : null}
          {/* <div className="item--upload">
            <div className="item--upload__left">
              <Icon name="FileXls" />
            </div>
            <div className="item--upload__right">
              <div className="right--top">
                <div>report_2021.pdf</div>
                <div>
                  <Icon name="Times" />
                </div>
              </div>
              <div className="right--bottom">
                <div className="progress">
                  <div className="slot">
                    <div style={{ width: "50%" }} className="rate" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="item--upload">
            <div className="item--upload__left">
              <Icon name="FileXls" />
            </div>
            <div className="item--upload__right">
              <div className="right--top">
                <div>report_2021.pdf</div>
                <div>
                  <Icon name="Times" />
                </div>
              </div>
              <div className="right--bottom">
                <div style={{ color: "#ed1b34" }}>Dung lượng file vượt quá 50MB</div>
                <div>
                  <Icon name="ArrowClockwise" />
                </div>
              </div>
            </div>
          </div>
          <div className="item--upload">
            <div className="item--upload__left">
              <Icon name="FileXls" />
            </div>
            <div className="item--upload__right">
              <div className="right--top">
                <div>report_2021.pdf</div>
                <div>
                  <Icon name="Times" />
                </div>
              </div>
              <div className="right--bottom">
                <div className="size">50 KB</div>
              </div>
            </div>
          </div> */}
        </div>
        {/* <div className="evaluate__upload">
          <div className="lst__star--rating">
            {data != null && data.length > 0
              ? data.map((item, idx) => {
                  return (
                    <div key={idx} className="item_upload">
                      <img src={item?.fileUrl} width={96} height={96} />
                      <span className="icon-delete" onClick={() => handDelete(item)}>
                        <Icon name="Trash" />
                      </span>
                    </div>
                  );
                })
              : null}

            {isLoadingFile ? (
              <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                <Icon name="Refresh" />
                <span className="name-loading">Đang tải...{showProgress}%</span>
              </div>
            ) : (
              <>
                <label htmlFor="imageUpload" className="add-image">
                  <Icon name="PlusCircleFill" />
                </label>
                <div>
                  <input className="d-none" type="file" id="imageUpload" name="Upload" accept="image/*" onChange={(e) => handleImageUpload(e)} />
                </div>
              </>
            )}
          </div>
        </div> */}
      </form>
      <ModalViewDocument
        onShow={isModalViewDocument}
        dataDoc={dataDoc}
        onHide={(reload) => {
          if (reload) {
          }
          setIsModalViewDocument(false);
          setDataDoc(null);
        }}
      />
    </div>
  );
}

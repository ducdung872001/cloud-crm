import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import { IAction, IActionModal } from "model/OtherModel";

import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import ImageAvatar from "assets/images/avatar-rox.png";
import "./index.scss";

import { convertToFileName } from "reborn-util";
import { IColumnGrid } from "../..";
import Button from "components/button/button";
import Icon from "components/icon";
import Input from "components/input/input";
import { is } from "bpmn-js/lib/util/ModelUtil";
import ImgRar from "assets/images/img-rar.png";
import ImgZip from "assets/images/img-zip.png";
import ImgFilePDF from "assets/images/img-pdf.png";
import ImgFileDoc from "assets/images/img-word.png";
import ImgFileExcel from "assets/images/img-excel.png";
import ImgError from "assets/images/error.png";
import ImgFilePowerpoint from "assets/images/img-powerpoint.png";
import GridService from "services/GridService";
import { set } from "lodash";
import { showToast } from "utils/common";

interface IImportModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  nodeId: string;
  potId: number;
  fieldName: string;
  workId: number;
  rowKey: string;
  columnKey: string;
}

export default function ModalComment(props: IImportModalProps) {
  const { onShow, onHide, nodeId, potId, fieldName, workId, rowKey, columnKey } = props;

  const [reload, setReload] = useState<boolean>(false);

  const clearForm = () => {
    onHide(reload);
    setDataComment([]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
  };

  const [dataComment, setDataComment] = useState<any[]>([
    // {
    //   id: 1,
    //   avatar: "",
    //   name: "Nguyễn Văn A",
    //   time: "13/01/2025 - 18:00",
    //   content: "Nội dung bình luận - Ví dụ: Lorem ipsum abc Nội dung bình luận",
    //   files: [
    //     {
    //       fileName: "File đính kèm 1",
    //       fileUrl: "",
    //       fileType: "pdf",
    //       fileSize: "1.2MB",
    //       extension: "pdf",
    //     },
    //     {
    //       fileName: "File đính kèm 1 File đính kèm 1 ",
    //       fileUrl: "",
    //       fileType: "docx",
    //       fileSize: "1.2MB",
    //       extension: "docx",
    //     },
    //     {
    //       fileName: "File đính kèm 1 File đính kèm 1 ",
    //       fileUrl: "",
    //       fileType: "image",
    //       fileSize: "1.2MB",
    //       extension: "png",
    //     },
    //   ],
    //   childrent: [
    //     {
    //       id: 1,
    //       avatar: "",
    //       name: "Nguyễn Văn A.1",
    //       time: "13/01/2025 - 18:00",
    //       content: "Nội dung bình luận - Ví dụ: Lorem ipsum abc Nội dung bình luận",
    //       files: [
    //         {
    //           fileName: "File đính kèm",
    //           fileUrl: "",
    //           fileType: "xlsx",
    //           fileSize: "1.2MB",
    //           extension: "xlsx",
    //         },
    //         {
    //           fileName: "File đính kèm 1 File đính kèm 1 ",
    //           fileUrl: "",
    //           fileType: "pptx",
    //           fileSize: "1.2MB",
    //           extension: "pptx",
    //         },
    //       ],
    //       isEdit: false,
    //       isReply: false,
    //     },
    //     {
    //       id: 2,
    //       avatar: "",
    //       name: "Nguyễn Văn A.2",
    //       time: "13/01/2025 - 18:00",
    //       content: "Nội dung bình luận - Ví dụ: Lorem ipsum abc Nội dung bình luận",
    //       isEdit: false,
    //       isReply: false,
    //     },
    //   ],
    //   isEdit: false,
    //   isReply: false,
    // },
    // {
    //   id: 2,
    //   avatar: "",
    //   name: "Nguyễn Văn B",
    //   time: "13/01/2025 - 18:00",
    //   content: "Nội dung bình luận - Ví dụ: Lorem ipsum abc Nội dung bình luận",
    //   isEdit: false,
    //   isReply: false,
    // },
    // {
    //   id: 3,
    //   avatar: "",
    //   name: "Nguyễn Văn C",
    //   time: "13/01/2025 - 18:00",
    //   content: "Nội dung bình luận - Ví dụ: Lorem ipsum abc Nội dung bình luận",
    //   isEdit: false,
    //   isReply: false,
    // },
  ]);

  const [newComment, setNewComment] = useState<string>("");

  const handleSubmitNewComment = async (parentId?: number, reply?: string, indexParent?: number, indexChild?: number) => {
    if (newComment || reply) {
      const param = {
        nodeId: nodeId || "Activity_0n3i8dv",
        potId: potId || 496,
        fieldName: fieldName || "boq",
        workId: workId || 1813,
        rowKey: rowKey || "",
        columnKey: columnKey || "",
        content: parentId ? reply : newComment,
        parentId: parentId || 0,
      };

      const response = await GridService.updateComment(param);
      // return;
      if (response.code === 0) {
        if (!parentId) {
          setNewComment("");
        }
        getListComment(indexParent, indexChild);
        setReload(true);
      } else {
        if (parentId) {
          setNewComment("");
        }
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  const getListComment = async (indexParentReply?: number, indexChildReply?: number) => {
    const param = {
      nodeId: nodeId || "Activity_0n3i8dv",
      potId: potId || 496,
      fieldName: fieldName || "boq",
      workId: workId || 1813,
      rowKey: rowKey || "",
      columnKey: columnKey || "",
      limit: 100,
    };
    const response = await GridService.listComment(param);
    if (response.code === 0) {
      if (response?.result?.items && response?.result?.items?.length > 0) {
        const listCommentSort = response.result.items.sort((a, b) => {
          return new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime();
        });
        const listCommentFomat = listCommentSort.map((item) => {
          const date = new Date(item.createdTime);
          const formattedDate = date
            .toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(",", " -");
          return { ...item, createdTime: formattedDate };
        });

        const listCommentParent = listCommentFomat.filter((item) => item.parentId === 0);
        listCommentParent.forEach((itemParent) => {
          itemParent.childrent = listCommentFomat.filter((item) => item.parentId === itemParent.id);
        });

        setDataComment(
          listCommentParent.map((item, index) => {
            if (dataComment[index]) {
              return {
                ...item,
                ...dataComment[index],
                isReply:
                  typeof indexParentReply != "undefined" && indexParentReply == index
                    ? typeof indexChildReply == "undefined"
                      ? false
                      : dataComment[index]?.isReply
                    : dataComment[index]?.isReply,
                replyContent:
                  typeof indexParentReply != "undefined" && indexParentReply == index
                    ? typeof indexChildReply == "undefined"
                      ? ""
                      : dataComment[index]?.isReply
                      ? dataComment[index].replyContent
                      : ""
                    : dataComment[index]?.replyContent
                    ? dataComment[index].replyContent
                    : "",
                childrent: item?.childrent
                  ? item.childrent.map((child, indexChild) => {
                      if (dataComment[index]?.childrent[indexChild]) {
                        return {
                          ...child,
                          ...dataComment[index]?.childrent[indexChild],
                          isReply:
                            typeof indexChildReply != "undefined" && indexChildReply == indexChild
                              ? false
                              : dataComment[index]?.childrent[indexChild]?.isReply,
                          replyContent:
                            typeof indexChildReply != "undefined" && indexChildReply == indexChild
                              ? ""
                              : dataComment[index]?.childrent[indexChild]?.replyContent
                              ? dataComment[index]?.childrent[indexChild].replyContent
                              : "",
                        };
                      } else {
                        return {
                          ...child,
                          isReply: false,
                          replyContent: "",
                        };
                      }
                    })
                  : [],
              };
            } else {
              return {
                ...item,
                isReply: false,
                replyContent: "",
              };
            }
          })
        );
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow) {
      getListComment();
    }
  }, [onShow]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => onHide(reload)}
        className="modal__comment--backup"
        size={"xl"}
      >
        <form className="form__import--backup" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={name} toggle={() => clearForm()} /> */}
          <div className="container-header">
            <div className="box-title">
              <div className="title">{"Bình luận"}</div>
              <div className="number-comment">
                <div className="count">{dataComment?.length || 0}</div>
              </div>
            </div>
            <div className="container-button">
              <Button onClick={() => clearForm()} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                <Icon name="Times" />
              </Button>
            </div>
          </div>
          <ModalBody>
            <div className="body-container">
              {dataComment?.length ? (
                <div className="list-comment">
                  {dataComment.map((item, index) => {
                    return (
                      <div className="item-parent" key={index}>
                        <div className="item-comment">
                          <div className={item?.childrent?.length ? "line-comment" : "d-none"}></div>
                          <div className="item-comment--top">
                            <div className="avatar">
                              <img src={item?.employeeAvatar || ImageAvatar} alt="avatar" style={{ objectFit: "cover", width: 24, height: 24 }} />
                            </div>
                            <div className="name">{item?.employeeName || ""}</div>
                            <div className="time">{item?.createdTime || ""}</div>
                          </div>
                          <div className="item-comment--content">
                            <div className="content">{item?.content || ""}</div>
                            {item?.files?.length ? (
                              <div className="files">
                                {item.files.map((file, indexFile) => {
                                  return (
                                    <div className="file" key={indexFile}>
                                      <div className="icon">
                                        <Icon name="Download" />
                                      </div>
                                      <div className="image-file">
                                        {file?.fileType == "image" ? (
                                          <img src={file?.fileUrl || ImgError} width={55} height={36} style={{ objectFit: "contain" }} />
                                        ) : (
                                          <img
                                            width={36}
                                            height={36}
                                            style={{ marginLeft: "8px" }}
                                            src={
                                              file?.extension === "docx" || file?.extension === "doc"
                                                ? ImgFileDoc
                                                : file?.extension === "xlsx"
                                                ? ImgFileExcel
                                                : file?.extension === "pdf" || file?.extension === "PDF"
                                                ? ImgFilePDF
                                                : file?.extension === "pptx"
                                                ? ImgFilePowerpoint
                                                : file?.extension === "zip"
                                                ? ImgZip
                                                : ImgRar
                                            }
                                            alt="File đã tải"
                                          />
                                        )}
                                      </div>
                                      <div className="file-info">
                                        <div className="file-info-name">{file?.fileName || ""}</div>
                                        <div className="file-info-size">{file?.fileSize || ""}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                          {!item?.isReply ? (
                            <div
                              className="item-comment--bottom"
                              onClick={() => {
                                const dataCommentTemp = [...dataComment];
                                dataCommentTemp[index].isReply = true;
                                setDataComment(dataCommentTemp);
                              }}
                            >
                              <div className="reply">
                                {" "}
                                <Icon name="ChatText" />
                                Trả lời bình luận
                              </div>
                            </div>
                          ) : (
                            <div
                              className="item-comment--bottom"
                              onClick={() => {
                                const dataCommentTemp = [...dataComment];
                                dataCommentTemp[index].isReply = false;
                                setDataComment(dataCommentTemp);
                              }}
                            >
                              <div className="reply-cancel">
                                {" "}
                                <Icon name="Times" />
                                Huỷ
                              </div>
                            </div>
                          )}
                          {item?.isReply ? (
                            <div className="input-container-reply">
                              <div className="input-area">
                                <div className="input-area--add">
                                  <div className="count">+</div>
                                </div>
                                <div className="input-area--input">
                                  <Input
                                    name=""
                                    value={item?.replyContent || ""}
                                    onChange={(e) => {
                                      const dataCommentTemp = [...dataComment];
                                      dataCommentTemp[index].replyContent = e.target.value;
                                      setDataComment(dataCommentTemp);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        // Thực hiện hành động khi nhấn Enter
                                        handleSubmitNewComment(item.id, dataComment[index].replyContent, index);
                                      }
                                    }}
                                    placeholder={`< Nhập nội dung trả lời >`}
                                  />
                                </div>
                                <div
                                  className="input-area--send"
                                  onClick={() => {
                                    handleSubmitNewComment(item.id, dataComment[index].replyContent, index);
                                  }}
                                >
                                  <Icon name="ArrowSmallUp" />
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        {item?.childrent?.length ? (
                          <div className="list-childrent">
                            {item.childrent.map((child, indexChild) => {
                              return (
                                <div className="item-childrent" key={indexChild}>
                                  <div className={indexChild < item.childrent.length - 1 ? "line-comment" : "d-none"}></div>
                                  <div className="item-childrent--top">
                                    <div className="avatar">
                                      <img
                                        src={child?.employeeAvatar || ImageAvatar}
                                        alt="avatar"
                                        style={{ objectFit: "cover", width: 24, height: 24 }}
                                      />
                                    </div>
                                    <div className="name">{child?.employeeName || ""}</div>
                                    <div className="time">{child?.createdTime || ""}</div>
                                  </div>
                                  <div className="item-childrent--content">
                                    <div className="content">{child?.content || ""}</div>
                                    {child?.files && child?.files?.length ? (
                                      <div className="files">
                                        {child.files.map((file, indexFile) => {
                                          return (
                                            <div className="file" key={indexFile}>
                                              <div className="icon">
                                                <Icon name="Download" />
                                              </div>
                                              <div className="image-file">
                                                {file?.fileType == "image" ? (
                                                  <img src={file?.fileUrl || ImgError} width={55} height={36} style={{ objectFit: "cover" }} />
                                                ) : (
                                                  <img
                                                    width={36}
                                                    height={36}
                                                    style={{ marginLeft: "8px" }}
                                                    src={
                                                      file?.extension === "docx" || file?.extension === "doc"
                                                        ? ImgFileDoc
                                                        : file?.extension === "xlsx"
                                                        ? ImgFileExcel
                                                        : file?.extension === "pdf" || file?.extension === "PDF"
                                                        ? ImgFilePDF
                                                        : file?.extension === "pptx"
                                                        ? ImgFilePowerpoint
                                                        : file?.extension === "zip"
                                                        ? ImgZip
                                                        : ImgRar
                                                    }
                                                    alt="File đã tải"
                                                  />
                                                )}
                                              </div>
                                              <div className="file-info">
                                                <div className="file-info-name">{file?.fileName || ""}</div>
                                                <div className="file-info-size">{file?.fileSize || ""}</div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : null}
                                  </div>
                                  {!child?.isReply ? (
                                    <div
                                      className="item-childrent--bottom"
                                      onClick={() => {
                                        const dataCommentTemp = [...dataComment];
                                        dataCommentTemp[index].childrent[indexChild].isReply = true;
                                        setDataComment(dataCommentTemp);
                                      }}
                                    >
                                      <div className="reply">
                                        {" "}
                                        <Icon name="ChatText" />
                                        Trả lời bình luận
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className="item-childrent--bottom"
                                      onClick={() => {
                                        const dataCommentTemp = [...dataComment];
                                        dataCommentTemp[index].childrent[indexChild].isReply = false;
                                        setDataComment(dataCommentTemp);
                                      }}
                                    >
                                      <div className="reply-cancel">
                                        {" "}
                                        <Icon name="Times" />
                                        Huỷ
                                      </div>
                                    </div>
                                  )}
                                  {child?.isReply ? (
                                    <div className="input-container-reply">
                                      <div className="input-area">
                                        <div className="input-area--add">
                                          <div className="count">+</div>
                                        </div>
                                        <div className="input-area--input">
                                          <Input
                                            name=""
                                            value={child?.replyContent || ""}
                                            onChange={(e) => {
                                              const dataCommentTemp = [...dataComment];
                                              dataCommentTemp[index].childrent[indexChild].replyContent = e.target.value;
                                              setDataComment(dataCommentTemp);
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                // Thực hiện hành động khi nhấn Enter
                                                handleSubmitNewComment(
                                                  item.id,
                                                  dataComment[index].childrent[indexChild].replyContent,
                                                  index,
                                                  indexChild
                                                );
                                              }
                                            }}
                                            placeholder={`< Nhập nội dung trả lời >`}
                                          />
                                        </div>
                                        <div
                                          className="input-area--send"
                                          onClick={() => {
                                            handleSubmitNewComment(item.id, dataComment[index].childrent[indexChild].replyContent, index, indexChild);
                                          }}
                                        >
                                          <Icon name="ArrowSmallUp" />
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <div className="input-container">
              <div className="input-area">
                <div className="input-area--add">
                  <div className="count">+</div>
                </div>
                <div className="input-area--input">
                  <Input
                    name="newComment"
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                    }}
                    placeholder={`< Nhập nội dung bình luận >`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Thực hiện hành động khi nhấn Enter
                        handleSubmitNewComment();
                      }
                    }}
                  />
                </div>
                <div
                  className="input-area--send"
                  onClick={() => {
                    handleSubmitNewComment();
                  }}
                >
                  <Icon name="ArrowSmallUp" />
                </div>
              </div>
            </div>
          </ModalBody>
        </form>
      </Modal>
      {/* <AddCustomerPersonModal onShow={showModalCustomer} onHide={() => setShowModalCustomer(false)} data={dataDuplicate} lstDataOrigin={lstData} /> */}
    </Fragment>
  );
}

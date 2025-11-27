import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import ApprovalService from "services/ApprovalService";
import { ContextType, UserContext } from "contexts/userContext";
import "./NoteField.scss";
import ImageThirdGender from "assets/images/third-gender.png";
import TextArea from "components/textarea/textarea";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import { set } from "lodash";

export interface INoteData {
  id: number;
  avatar: string;
  name: string;
  time: string;
  content: string;
  isEdit: boolean;
}
interface INoteFieldProps {
  onShow: boolean;
  onHide?: (reload: boolean) => void;
  data: INoteData[];
}

export default function NoteField(props: INoteFieldProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const { dataInfoEmployee } = useContext(UserContext) as ContextType;

  const onSubmit = async (e) => {
    e.preventDefault();

    const body: any = {};

    setIsSubmit(true);

    // const response = await BlackListService.update(body);

    // if (response.code === 0) {
    //   showToast(`${data ? "Cập nhật" : "Thêm mới"} đối tượng thành công`, "success");
    //   onHide(true);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //   setIsSubmit(false);
    // }
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [listNote, setListNote] = useState<INoteData[]>([
    // {
    //   id: 1,
    //   avatar: ImageThirdGender,
    //   name: "Hoàng Văn Lợi",
    //   time: "21:01 Hôm qua",
    //   content: "Comment đầu",
    //   isEdit: false,
    // },
    // {
    //   id: 2,
    //   avatar: ImageThirdGender,
    //   name: "Hoàng Văn Lợi",
    //   time: "21:01 Hôm qua",
    //   content: "Comment thứ 2",
    //   isEdit: false,
    // },
    // {
    //   id: 3,
    //   avatar: ImageThirdGender,
    //   name: "Hoàng Văn Lợi",
    //   time: "21:01 Hôm qua",
    //   content: "Comment thứ 2",
    //   isEdit: false,
    // },
    // {
    //   id: 4,
    //   avatar: ImageThirdGender,
    //   name: "Hoàng Văn Lợi",
    //   time: "21:01 Hôm qua",
    //   content: "Comment thứ 2",
    //   isEdit: false,
    // },
  ]);

  useEffect(() => {
    setListNote(data);
  }, [data]);

  const [newNote, setNewNote] = useState<string>("");

  const handleSaveNote = async () => {
    const listNoteTemp = [...listNote];
    listNoteTemp.push({
      id: 5,
      avatar: dataInfoEmployee?.avatar,
      name: dataInfoEmployee?.name,
      time: new Date().toLocaleTimeString(),
      content: newNote,
      isEdit: false,
    });
    setListNote(listNoteTemp);
    setNewNote("");
  };

  return (
    <div className="modal-add-note">
      <form className="form-note-group" onSubmit={(e) => onSubmit(e)}>
        {listNote?.length ? (
          <div className="list-note">
            {listNote.map((note, index) => (
              <div className="note-item">
                <div className="header-note">
                  <div className="header-note--left">
                    <div className="avatar">
                      <img
                        src={note.avatar}
                        alt="avatar"
                        style={{
                          objectFit: location.origin.includes("sor") ? "contain" : "cover",
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                        }}
                      />
                    </div>
                    <div className="info">
                      <div className="d-none d-md-block">{note.name}</div>
                      <div className="d-none d-md-block">{note.time}</div>
                    </div>
                  </div>
                  <div className="header-note--right">
                    {!note.isEdit && (
                      <div className="action">
                        <div
                          className="edit"
                          onClick={() => {
                            const listNoteTemp = [...listNote];
                            listNoteTemp[index].isEdit = true;
                            setListNote(listNoteTemp);
                          }}
                        >
                          <Icon name="Pencil" />
                        </div>
                        <div className="delete">
                          <Icon name="Trash" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="body-note">
                  {note.isEdit ? (
                    <div>
                      <div className="content">
                        <TextArea
                          name={"content"}
                          value={note.content}
                          fill={true}
                          onChange={(e) => {
                            setListNote((prev) => {
                              const listNoteTemp = [...prev];
                              listNoteTemp[index].content = e.target.value;
                              return listNoteTemp;
                            });
                          }}
                        />
                      </div>
                      <div className="button-form-edit">
                        <Button
                          color={"secondary"}
                          onClick={() => {
                            const listNoteTemp = [...listNote];
                            listNoteTemp[index].isEdit = false;
                            setListNote(listNoteTemp);
                          }}
                        >
                          Huỷ
                        </Button>
                        <Button
                          color={"primary"}
                          onClick={() => {
                            const listNoteTemp = [...listNote];
                            listNoteTemp[index].isEdit = false;
                            setListNote(listNoteTemp);
                          }}
                        >
                          Lưu
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="content">{note.content}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <div className="text-area--add_note">
          <TextArea
            name={"note"}
            row={1}
            value={newNote}
            placeholder={`Nhập ghi chú`}
            fill={true}
            onChange={(e) => setNewNote(e.target.value)}
            maxLength={459}
          />
          <div className="action__confirm">
            <Button variant="outline" onClick={() => setNewNote("")}>
              Huỷ
            </Button>
            <Button
              disabled={false}
              onClick={() => {
                handleSaveNote();
              }}
            >
              {listNote?.length ? "Trả lời" : "Lưu"}
            </Button>
          </div>
        </div>
      </form>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

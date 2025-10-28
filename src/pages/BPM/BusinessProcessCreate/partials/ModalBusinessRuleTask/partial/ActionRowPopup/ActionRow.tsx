import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import ApprovalService from "services/ApprovalService";
import { ContextType, UserContext } from "contexts/userContext";
import "./ActionRow.scss";
import ImageThirdGender from "assets/images/third-gender.png";
import TextArea from "components/textarea/textarea";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import { set } from "lodash";
import Popover from "components/popover/popover";

export interface INoteData {
  id: number;
  avatar: string;
  name: string;
  time: string;
  content: string;
  isEdit: boolean;
}

export interface IDetailAction {
  rowIndex: number;
  action: string;
  position: "top" | "bottom";
  stype?: string;
}
interface INoteFieldProps {
  onShow: boolean;
  onHide?: (reload: boolean) => void;
  rowIndex: number;
  callBack: (detailAction: IDetailAction) => void;
}

export default function ActionRow(props: INoteFieldProps) {
  const { onShow, onHide, rowIndex, callBack } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const { dataInfoEmployee } = useContext(UserContext) as ContextType;

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${true ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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
  const [listTypeTitle, setListTypeTitle] = useState([
    { id: 1, name: "H1", isShow: false },
    { id: 2, name: "H2", isShow: false },
    { id: 3, name: "H3", isShow: false },
    { id: 4, name: "H4", isShow: false },
  ]);

  return (
    <div className="modal-action-row">
      <form className="form-action-group">
        <div className="list-action">
          <div
            className="item-action"
            onClick={() => {
              callBack({
                rowIndex: rowIndex,
                action: "insert",
                position: "top",
              });
            }}
          >
            Chèn 1 hàng lên trên
          </div>
          <div
            className="item-action"
            onClick={() => {
              callBack({
                rowIndex: rowIndex,
                action: "insert",
                position: "bottom",
              });
            }}
          >
            Chèn 1 hàng xuống dưới
          </div>
          {/* {listTypeTitle.map((item, index) => {
            return (
              <div
                key={index}
                className="item-action"
                onClick={() => {
                  let newList = [...listTypeTitle];
                  newList.map((item) => {
                    item.isShow = false;
                  });
                  newList[index].isShow = true;
                  setListTypeTitle(newList);
                }}
              >
                Chèn tiêu đề
                {item.name === "H1" ? (
                  <h1>{item.name}</h1>
                ) : item.name === "H2" ? (
                  <h2>{item.name}</h2>
                ) : item.name === "H3" ? (
                  <h3>{item.name}</h3>
                ) : (
                  <h4>{item.name}</h4>
                )}
                <Icon name="CaretRight" />
                {item.isShow ? (
                  <>
                    <div
                      className="sub-action"
                      onClick={() => {
                        callBack({
                          rowIndex: rowIndex,
                          action: "insertTitle",
                          position: "top",
                          stype: item.name,
                        });
                      }}
                    >
                      Lên trên
                    </div>
                    <div
                      className="sub-action"
                      onClick={() => {
                        callBack({
                          rowIndex: rowIndex,
                          action: "insertTitle",
                          position: "bottom",
                          stype: item.name,
                        });
                      }}
                    >
                      Xuống dưới
                    </div>
                  </>
                ) : null}
              </div>
            );
          })} */}
          <div
            className="item-action action-delete"
            onClick={() => {
              callBack({
                rowIndex: rowIndex,
                action: "delete",
                position: "bottom",
              });
            }}
          >
            Xoá hàng
          </div>
        </div>
      </form>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

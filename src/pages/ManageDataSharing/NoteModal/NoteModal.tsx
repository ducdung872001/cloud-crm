import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import "./NoteModal.scss";

export default function NoteModal(props: any) {
  const { onShow, data, onHide } = props;  

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);  

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              onHide(false);
            },
          },
        //   {
        //     title: type === 'approve' ? "Phê duyệt" : 'Từ chối',
        //     type: "submit",
        //     color: "primary",
        //     disabled: 
        //         isSubmit,
        //         // || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
        //     is_loading: isSubmit,
        //   },
        ],
      },
    }),
    []
  );


  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-note-permission-group"
      >
        <form className="form-note-permission-group">
          <ModalHeader title={`Ghi chú`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div>
                <span style={{fontSize: 14, fontWeight:'400'}}>{data?.targetNote}</span>
            </div>

          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

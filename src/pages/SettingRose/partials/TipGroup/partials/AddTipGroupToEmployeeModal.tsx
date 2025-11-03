import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddTipGroupToTipGroupEmployeeModalProps } from "model/tipGroup/PropsModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import { SelectOptionData } from "utils/selectCommon";

export default function AddTipGroupToEmployeeModal(props: AddTipGroupToTipGroupEmployeeModalProps) {
  const { onShow, onHide, groupId } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const onSubmit = async (e) => {
    e.preventDefault();
  };

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => !isSubmit && onHide(false)}>
        <form className="" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Thêm mới nhân viên" toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <h1>Ú òa 🥴🥴🥴 mình chỉ là người đến sau</h1>
          </ModalBody>
          <ModalFooter />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

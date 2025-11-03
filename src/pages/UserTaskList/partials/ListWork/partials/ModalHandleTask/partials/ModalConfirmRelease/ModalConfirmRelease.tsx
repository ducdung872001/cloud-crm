import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { formatFileSize, showToast } from "utils/common";
import { isDifferenceObj, trimContent } from "reborn-util";
import "./ModalConfirmRelease.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import SupplierService from "services/SupplierService";
import _, { at, get, set } from "lodash";
import { use } from "i18next";
import SupplierAccountService from "services/SupplierAccountService";
import Icon from "components/icon";

export default function ModalConfirmRelease(props: any) {
  const { onShow, onHide, data, typeAccept, isAddNew } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  useEffect(() => {
    if (data && onShow) {
    }
  }, [data, onShow]);

  const values = useMemo(
    () =>
      ({
        id: data?.id ?? 0,
        active: 0,
      } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });
  // console.log('formData', formData);

  const validations: IValidation[] = [
    {
      name: "taxCode",
      rules: "required",
    },
    {
      name: "name",
      rules: "required",
    },
  ];

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async () => {
    setIsSubmit(true);
    handClearForm(true);
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setIsSubmit(false);
  };

  const actions = useMemo<any>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handClearForm(false) : showDialogConfirmCancel();
            },
          },

          ...(data
            ? [
                {
                  title: "Đổi mật khẩu",
                  type: "button",
                  color: "outline",
                  callback: () => {},
                },
              ]
            : []),
        ],
      },
    }),
    [formData, values, isSubmit, data]
  );

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
        handClearForm(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-accept-release"
        size="sm"
      >
        <form className="form-accept-release">
          <ModalBody>
            <div className="container-accept">
              <div className="box-title">
                <span style={{ fontSize: 20, fontWeight: "600", color: "#ED1B34" }}>Xác nhận phát hành hồ sơ mời thầu</span>
              </div>
              <div className="box-content">
                <span style={{ fontSize: 14, fontWeight: "400", color: "#2C2C2C" }}>Bạn có chắc chắn muốn phát hành hồ sơ mời thầu?</span>
              </div>
              <div className="box-footer">
                <div
                  className="button-cancel"
                  onClick={() => {
                    handClearForm(false);
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: "500" }}>Huỷ</span>
                </div>
                <div
                  className="button-accept"
                  onClick={() => {
                    if (!isSubmit) {
                      onSubmit();
                    }
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: "500" }}>Tôi chắc chắn</span>

                  {isSubmit ? <Icon name="Loading" /> : null}
                </div>
              </div>
            </div>
          </ModalBody>
          {/* <ModalFooter actions={actions} /> */}
        </form>
      </Modal>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

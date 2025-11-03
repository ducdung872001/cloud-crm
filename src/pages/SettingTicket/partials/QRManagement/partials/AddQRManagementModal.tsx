import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Icon from "components/icon";
import Input from "components/input/input";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { generateRandomString, showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import Button from "components/button/button";
import QrCodeService from "services/QrCodeService";

import "./AddQRManagementModal.scss";

export default function AddQRManagementModal(props) {
  const { onShow, onHide, data } = props;

  const qrCodeRef = useRef(null);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        startDate: data?.startDate ?? new Date(),
        endDate: data?.endDate ?? "",
        link: data?.link ?? "",
        code: data?.code ?? generateRandomString(6),
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "startDate",
      rules: "required",
    },
    {
      name: "endDate",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const downloadQRCode = useCallback((e) => {
    e.preventDefault();

    const svgElement = qrCodeRef.current.children[0];
    const svgData = new XMLSerializer().serializeToString(svgElement);

    const img = new Image();
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;

    img.onload = () => {
      // Tạo canvas để vẽ hình ảnh
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // Tạo link tải xuống từ canvas
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "qrcode-feedback.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }, []);

  const handleCopyLink = () => {
    const value = formData?.values?.link;

    if (!value) {
      showToast("Bạn chưa nhập link qr code!", "warning");
    } else {
      navigator.clipboard
        .writeText(`${value}?code=${formData?.values?.code}`)
        .then(() => {
          showToast("Copy link thành công", "success");
        })
        .catch(() => {
          showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        });
    }
  };

  const combinedValue = formData?.values?.link ? `${formData?.values?.link}?code=${formData?.values?.code}` : "";

  const handleChangeValueLink = (e) => {
    const value = e.target.value.split("?code=")[0];
    setFormData({ ...formData, values: { ...formData.values, link: value } });
  };

  const listField: IFieldCustomize[] = [
    {
      label: "Tên qr code",
      name: "name",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "Mã qr code",
      name: "code",
      type: "text",
      fill: true,
      required: true,
      disabled: true,
    },
    {
      label: "Bắt đầu",
      name: "startDate",
      type: "date",
      fill: true,
      required: true,
      maxDate: new Date(formData?.values?.endDate),
      placeholder: "Nhập ngày bắt đầu",
    },
    {
      label: "Kết thúc",
      name: "endDate",
      type: "date",
      fill: true,
      required: true,
      minDate: new Date(formData?.values?.startDate),
      placeholder: "Nhập ngày kết thúc",
    },
    {
      name: "link",
      label: "link",
      type: "custom",
      snippet: (
        <div className="">
          <Input
            name="link"
            label={"Link qr code"}
            fill={true}
            required={true}
            value={combinedValue}
            icon={<Icon name="Copy" />}
            iconPosition="left"
            iconClickEvent={() => handleCopyLink()}
            onChange={(e) => handleChangeValueLink(e)}
            placeholder="Nhập link qr code"
          />
        </div>
      ),
    },
  ];

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(formData.values as any),
      ...(data ? { id: data.id } : {}),
    };

    const response = await QrCodeService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} qr code thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
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
        onHide(false);
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
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-qr-code"
      >
        <form className="form-add-qr-code-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} qr code`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}
              <div className="form-group">
                <div className="view__qr--code">
                  <label className="name-code">Quét QR</label>

                  <div className="box__scan">
                    <div ref={qrCodeRef}>
                      <QRCodeSVG
                        value={`${formData?.values?.link}?code=${formData?.values?.code}`}
                        level="H"
                        renderingIntent="canvas"
                        bgColor="#FFFFFF"
                        size={150}
                      />
                    </div>
                    <Button color="secondary" type="button" onClick={downloadQRCode}>
                      Tải xuống
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

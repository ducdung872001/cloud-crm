import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ITemplateEmailRequestModel } from "model/templateEmail/TemplateEmailRequestModel";
import { IAddTemplateEmailModelProps } from "model/templateEmail/PropsModel";
import TemplateEmailService from "services/TemplateEmailService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { SelectOptionData } from "utils/selectCommon";
import { isDifferenceObj } from 'reborn-util';
import SelectCustom from "components/selectCustom/selectCustom";
import "./AddTemplateEmailModal.scss";

export default function AddTemplateEmailModal(props: IAddTemplateEmailModelProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listConfigCode, setListConfigCode] = useState<IOption[]>([]);
  const [isLoadingConfigCode, setIsLoadingConfigCode] = useState<boolean>(false);

  const onSelectOpenConfigCode = async () => {
    if (!listConfigCode || listConfigCode.length === 0) {
      setIsLoadingConfigCode(true);

      const dataOption = await SelectOptionData("tcyId");
      if (dataOption) {
        setListConfigCode([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingConfigCode(false);
    }
  };

  const values = useMemo(
    () =>
    ({
      title: data?.title ?? "",
      content: data?.content ?? "",
      contentDelta: data?.contentDelta,
      type: data?.type ?? "",
      tcyId: data?.tcyId ?? "",
    } as ITemplateEmailRequestModel),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "tcyId",
      rules: "required",
    },
  ];

  const listFieldSecond = useMemo(
    () =>
      [
        {
          label: "Chủ đề email",
          name: "tcyId",
          type: "select",
          options: listConfigCode,
          onMenuOpen: onSelectOpenConfigCode,
          fill: true,
          required: true,
          isLoading: isLoadingConfigCode,
        },
      ] as IFieldCustomize[],
    [listConfigCode, isLoadingConfigCode]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const [selectedTcyId, setSelectedTcyId] = useState<any>(null); // State riêng cho dropdown chọn chủ đề

  // Khởi tạo dữ liệu form khi mở modal
  useEffect(() => {
    if (onShow) {
      setFormData({ values: values, errors: {} });
      setIsSubmit(false);

      // Khởi tạo giá trị cho dropdown nếu đang sửa
      let initialSelection = null;
      if (data?.tcyId) {
        initialSelection = { value: data.tcyId, label: "" };
      }
      setSelectedTcyId(initialSelection);
    }
  }, [onShow]); // Chỉ chạy 1 lần khi mở modal

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors: any = {};
    if (!selectedTcyId || !selectedTcyId.value) {
      errors.tcyId = "Vui lòng chọn Chủ đề email";
    }

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: ITemplateEmailRequestModel = {
      ...(formData.values as ITemplateEmailRequestModel),
      ...(data ? { id: data.id } : {}),
      tcyId: selectedTcyId?.value ? Number(selectedTcyId.value) : 0, // Lấy tcyId từ state riêng
    };

    try {
      const response = await TemplateEmailService.update(body);

      if (response.code === 0) {
        showToast(`Lưu mẫu Email thành công`, "success");
        onHide(true);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        setIsSubmit(false);
      }
    } catch (error) {
      console.error("API Error:", error);
      showToast("Lỗi kết nối hoặc xử lý dữ liệu", "error");
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
            disabled: isSubmit,
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
    [formData, values, showDialog, focusedElement, onHide] // Thêm các dependencies còn thiếu
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
        className="modal-add-template-email"
      >
        <form className="form-template-email" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={"Lưu mẫu Email"} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  label="Chủ đề email"
                  required
                  fill
                  options={listConfigCode ?? []}
                  onMenuOpen={onSelectOpenConfigCode}
                  isLoading={isLoadingConfigCode}
                  value={selectedTcyId}
                  onChange={(e) => {
                    setSelectedTcyId(e);
                    // Xóa lỗi hiển thị (nếu có) khi chọn
                    if (formData.errors.tcyId) {
                      setFormData(p => ({ ...p, errors: { ...p.errors, tcyId: "" } }));
                    }
                  }}
                  error={formData.errors && !!formData.errors.tcyId}
                  message={formData.errors ? formData.errors.tcyId : ""}
                  placeholder="Chọn chủ đề email"
                />
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

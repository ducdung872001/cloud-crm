import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddDataKeywordModalProps } from "model/keywordData/PropsModel";
import { IKeyWordDataResquest } from "model/keywordData/KeywordDataRequest";
import KeywordDataService from "services/KeywordDataService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import { SelectOptionData } from "utils/selectCommon";
import "./AddKeywordDataModal.scss";

export default function AddKeywordDataModal(props: AddDataKeywordModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listIndustry, setListIndustry] = useState<IOption[]>(null);
  const [isLoadingIndustry, setIsLoadingIndustry] = useState<boolean>(false);

  const onSelectOpenIndustry = async () => {
    if (!listIndustry || listIndustry.length === 0) {
      setIsLoadingIndustry(true);
      const dataOption = await SelectOptionData("industryId");
      if (dataOption) {
        setListIndustry([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingIndustry(false);
    }
  };

  useEffect(() => {
    if (data?.industryId) {
      onSelectOpenIndustry();
    }

    if (data?.industryId === null) {
      setListIndustry([]);
    }
  }, [data]);

  const values = useMemo(
    () =>
    ({
      name: data?.name ?? "",
      nameSub: data?.nameSub ?? "",
      nameXor: data?.nameXor ?? "",
      language: data?.language?.toString() ?? "1",
      type: data?.type?.toString() ?? "0",
      industryId: data?.industryId ?? null,
    } as IKeyWordDataResquest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Lĩnh vực từ khóa",
          name: "industryId",
          type: "select",
          options: listIndustry,
          onMenuOpen: onSelectOpenIndustry,
          isLoading: isLoadingIndustry,
          fill: true,
          required: true,
        },
        {
          label: "Từ khóa chính",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Từ khóa phụ",
          name: "nameSub",
          type: "text",
          fill: true,
        },
        {
          label: "Từ khóa loại trừ",
          name: "nameXor",
          type: "text",
          fill: true,
        },
        {
          label: "Ngôn ngữ",
          name: "language",
          type: "radio",
          fill: true,
          options: [
            {
              value: "2",
              label: "EN",
            },
            {
              value: "1",
              label: "VN",
            },
            {
              value: "0",
              label: "Khác",
            },
          ],
        },
        {
          label: "Đối tượng",
          name: "type",
          type: "radio",
          fill: true,
          options: [
            {
              value: "2",
              label: "Bên mua",
            },
            {
              value: "1",
              label: "Bên bán",
            },
            {
              value: "0",
              label: "Khác",
            },
          ],
        },
      ] as IFieldCustomize[],
    [isLoadingIndustry, listIndustry]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);
    const body: IKeyWordDataResquest = {
      ...(formData.values as IKeyWordDataResquest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await KeywordDataService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} từ khóa thành công`, "success");
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
        className="modal-add-keywordata"
      >
        <form className="form-keywordata-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} từ khóa`} toggle={() => !isSubmit && onHide(false)} />
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
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

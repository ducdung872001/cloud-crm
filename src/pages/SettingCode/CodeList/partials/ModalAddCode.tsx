import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./ModalAddCode.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import CodeService from "services/CodeService";

export default function ModalAddCode(props: any) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataEntityName, setDataEntityName] = useState(null);

  useEffect(() => {
    if (onShow && data) {
      setDataEntityName(
        data.entityName === "customer"
          ? { value: "customer", label: "Khách hàng" }
          : data.entityName === "contract"
          ? { value: "contract", label: "Hợp đồng" }
          : data.entityName === "business_partner"
          ? { value: "business_partner", label: "Đối tác" }
          : null
      );
    }
  }, [data, onShow]);

  const values = useMemo(
    () =>
      ({
        codePrefix: data?.codePrefix ?? "",
        codeLength: data?.codeLength ?? 0,
        regexPattern: data?.regexPattern ?? "",
        currentCode: data?.currentCode ?? "",
        entityName: data?.entityName ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "codePrefix",
      rules: "required",
    },
    {
      name: "codeLength",
      rules: "required",
    },
    {
      name: "regexPattern",
      rules: "required",
    },
    {
      name: "currentCode",
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

  const listField = useMemo(
    () =>
      [
        {
          label: "Tiền tố",
          name: "codePrefix",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Độ dài mã",
          name: "codeLength",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Mẫu quy luật",
          name: "regexPattern",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Giá trị tăng",
          name: "currentCode",
          type: "number",
          fill: true,
          required: true,
        },
        {
          name: "entityName",
          type: "custom",
          snippet: (
            <SelectCustom
              id="entityName"
              name="entityName"
              label="Tên thực thể"
              special={true}
              options={[
                {
                  value: "customer",
                  label: "Khách hàng",
                },
                {
                  value: "contract",
                  label: "Hợp đồng",
                },
                {
                  value: "business_partner",
                  label: "Đối tác",
                },
              ]}
              fill={true}
              value={dataEntityName}
              required={true}
              onChange={(e) => handleChangeValueEntity(e)}
              isAsyncPaginate={false}
              isFormatOptionLabel={false}
              placeholder="Chọn tên thực thể"
              // additional={{
              //   page: 1,
              // }}
              // loadOptionsPaginate={loadedOptionEmployee}
              // formatOptionLabel={formatOptionLabelEmployee}
              // error={checkFieldEmployee}
              // message="Người phụ trách không được bỏ trống"
            />
          ),
        },
      ] as IFieldCustomize[],
    [formData?.values, dataEntityName]
  );

  const handleChangeValueEntity = (e) => {
    setDataEntityName(e);
    setFormData({ ...formData, values: { ...formData?.values, entityName: e.value } });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const body: any = {
      ...(formData.values as any),
      ...(data ? { id: data.id } : {}),
    };

    const response = await CodeService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} mã thành công`, "success");
      clearForm(true);
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

  const clearForm = (acc) => {
    setDataEntityName(null);
    onHide(acc);
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
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-add-code"
      >
        <form className="form-add-code" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} mã`} toggle={() => !isSubmit && clearForm(false)} />
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
      <Dialog content={contentDialog} isOpen={showDialog} />{" "}
    </Fragment>
  );
}

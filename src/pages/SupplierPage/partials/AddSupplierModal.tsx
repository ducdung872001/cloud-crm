import React, { useState, useEffect, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IFieldCustomize, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import InventorySupplierService, { ISupplierItem } from "services/InventorySupplierService";

interface Props {
  onShow: boolean;
  data: ISupplierItem | null;
  onHide: (reload?: boolean) => void;
}

interface IFormValues {
  code:          string;
  name:          string;
  phone:         string;
  email:         string;
  address:       string;
  taxCode:       string;
  contactPerson: string;
  website:       string;
  groupName:     string;
  note:          string;
}

const EMPTY: IFormValues = {
  code:          "",
  name:          "",
  phone:         "",
  email:         "",
  address:       "",
  taxCode:       "",
  contactPerson: "",
  website:       "",
  groupName:     "",
  note:          "",
};

export default function AddSupplierModal({ onShow, data, onHide }: Props) {
  const isEdit = !!data;

  const initValues = useMemo<IFormValues>(() => ({
    code:          data?.code          ?? "",
    name:          data?.name          ?? "",
    phone:         data?.phone         ?? "",
    email:         data?.email         ?? "",
    address:       data?.address       ?? "",
    taxCode:       data?.taxCode       ?? "",
    contactPerson: data?.contactPerson ?? "",
    website:       data?.website       ?? "",
    groupName:     data?.groupName     ?? "",
    note:          data?.note          ?? "",
  }), [data, onShow]);

  const [formData, setFormData]   = useState<IFormValues>(initValues);
  const [errors,   setErrors]     = useState<Record<string, string>>({});
  const [isSubmit, setIsSubmit]   = useState(false);

  useEffect(() => {
    if (onShow) {
      setFormData(initValues);
      setErrors({});
      setIsSubmit(false);
    }
  }, [onShow, initValues]);

  const validations: IValidation[] = [
    { name: "name", rules: "required" },
  ];

  const listField: IFieldCustomize[] = [
    {
      label:       "Mã nhà cung cấp",
      name:        "code",
      type:        "text",
      fill:        true,
      placeholder: "VD: NCC001 (để trống sẽ tự động tạo)",
    },
    {
      label:       "Tên nhà cung cấp",
      name:        "name",
      type:        "text",
      fill:        true,
      required:    true,
      placeholder: "Nhập tên nhà cung cấp",
      maxLength:   300,
    },
    {
      label:       "Số điện thoại",
      name:        "phone",
      type:        "text",
      fill:        true,
      placeholder: "Số điện thoại liên hệ",
    },
    {
      label:       "Email",
      name:        "email",
      type:        "text",
      fill:        true,
      placeholder: "Email liên hệ",
    },
    {
      label:       "Địa chỉ",
      name:        "address",
      type:        "text",
      fill:        true,
      placeholder: "Địa chỉ cơ sở kinh doanh",
    },
    {
      label:       "Mã số thuế",
      name:        "taxCode",
      type:        "text",
      fill:        true,
      placeholder: "MST doanh nghiệp / hộ kinh doanh",
    },
    {
      label:       "Người liên hệ",
      name:        "contactPerson",
      type:        "text",
      fill:        true,
      placeholder: "Tên người liên hệ chính",
    },
    {
      label:       "Website",
      name:        "website",
      type:        "text",
      fill:        true,
      placeholder: "https://...",
    },
    {
      label:       "Nhóm nhà cung cấp",
      name:        "groupName",
      type:        "text",
      fill:        true,
      placeholder: "VD: Nhóm A, Hàng thiết yếu, Đồ uống...",
    },
    {
      label:       "Ghi chú",
      name:        "note",
      type:        "textarea",
      fill:        true,
      placeholder: "Ghi chú thêm về nhà cung cấp",
    },
  ];

  const onChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (isSubmit) {
      handleChangeValidate(field, { ...formData, [field]: value }, validations, errors, setErrors);
    }
  };

  const handleSubmit = async () => {
    setIsSubmit(true);
    const newErrors = Validate(formData, validations);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const body: any = {
      ...formData,
      ...(isEdit ? { id: data!.id } : {}),
    };

    const res = await InventorySupplierService.update(body);
    if (res?.code === 0) {
      showToast(
        isEdit ? "Cập nhật nhà cung cấp thành công" : "Thêm nhà cung cấp thành công",
        "success"
      );
      onHide(true);
    } else {
      showToast(res?.message ?? "Có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  };

  return (
    <Modal
      isOpen={onShow}
      onClose={() => onHide(false)}
      className="modal-add-supplier"
    >
      <ModalHeader>
        {isEdit ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
      </ModalHeader>

      <ModalBody>
        <div className="form-grid">
          {listField.map((field) => (
            <div
              key={field.name}
              className={
                field.name === "address" ||
                field.name === "note"
                  ? "form-col-full"
                  : ""
              }
            >
              <FieldCustomize
                field={field}
                formData={formData}
                errors={errors}
                handleChange={onChange}
              />
            </div>
          ))}
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => onHide(false)}
        >
          Hủy
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleSubmit}
        >
          {isEdit ? "Lưu thay đổi" : "Thêm mới"}
        </button>
      </ModalFooter>
    </Modal>
  );
}

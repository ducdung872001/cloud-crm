import React, { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IActionModal } from "model/OtherModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import InventorySupplierService, { ISupplierItem } from "services/InventorySupplierService";

interface Props {
  onShow: boolean;
  data: ISupplierItem | null;
  onHide: (reload?: boolean) => void;
}

// ── Danh sách fields ────────────────────────────────────────────
const LIST_FIELD: IFieldCustomize[] = [
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
    label:       "Nhóm nhà cung cấp",
    name:        "groupName",
    type:        "text",
    fill:        true,
    placeholder: "VD: Nhóm A, Hàng thiết yếu...",
  },
  {
    label:       "Website",
    name:        "website",
    type:        "text",
    fill:        true,
    placeholder: "https://...",
  },
  {
    label:       "Địa chỉ",
    name:        "address",
    type:        "text",
    fill:        true,
    placeholder: "Địa chỉ cơ sở kinh doanh",
  },
  {
    label:       "Ghi chú",
    name:        "note",
    type:        "textarea",
    fill:        true,
    placeholder: "Ghi chú thêm về nhà cung cấp",
  },
];

const VALIDATIONS: IValidation[] = [
  { name: "name", rules: "required" },
];

function buildInitFormData(item: ISupplierItem | null): IFormData {
  return {
    values: {
      code:          item?.code          ?? "",
      name:          item?.name          ?? "",
      phone:         item?.phone         ?? "",
      email:         item?.email         ?? "",
      taxCode:       item?.taxCode       ?? "",
      contactPerson: item?.contactPerson ?? "",
      groupName:     item?.groupName     ?? "",
      website:       item?.website       ?? "",
      address:       item?.address       ?? "",
      note:          item?.note          ?? "",
    },
    errors: {},
  };
}

export default function AddSupplierModal({ onShow, data, onHide }: Props) {
  const isEdit = !!data;

  const [formData, setFormData] = useState<IFormData>(buildInitFormData(data));
  const [isSubmit, setIsSubmit] = useState(false);

  // Reset form mỗi lần mở
  useEffect(() => {
    if (onShow) {
      setFormData(buildInitFormData(data));
      setIsSubmit(false);
    }
  }, [onShow]);

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Validate
    const errors = Validate(VALIDATIONS, formData, LIST_FIELD);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      setIsSubmit(true);
      return;
    }

    setIsSubmit(true);
    const v = formData.values;

    const body: any = {
      code:          v.code          || undefined,
      name:          v.name,
      phone:         v.phone         || undefined,
      email:         v.email         || undefined,
      taxCode:       v.taxCode       || undefined,
      contactPerson: v.contactPerson || undefined,
      groupName:     v.groupName     || undefined,
      website:       v.website       || undefined,
      address:       v.address       || undefined,
      note:          v.note          || undefined,
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
      setIsSubmit(false);
    }
  };

  // ── ModalFooter actions (dùng đúng IActionModal interface) ──────
  const actions: IActionModal = {
    actions_right: {
      buttons: [
        {
          title:    "Hủy",
          color:    "secondary",
          variant:  "outline",
          callback: () => onHide(false),
        },
        {
          title:    isEdit ? "Lưu thay đổi" : "Thêm mới",
          color:    "primary",
          callback: handleSubmit,
          disabled: isSubmit,
        },
      ],
    },
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <Modal
      isFade={true}
      isOpen={onShow}
      isCentered={true}
      staticBackdrop={true}
      toggle={() => { if (!isSubmit) onHide(false); }}
      size="md"
      className="modal-add-supplier"
    >
      <ModalHeader
        title={isEdit ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
        toggle={() => { if (!isSubmit) onHide(false); }}
      />

      <ModalBody>
        <div className="list-form-group">
          {LIST_FIELD.map((field, index) => (
            <FieldCustomize
              key={index}
              field={field}
              formData={formData}
              handleUpdate={(value) =>
                handleChangeValidate(
                  value,
                  field,
                  formData,
                  VALIDATIONS,
                  LIST_FIELD,
                  setFormData
                )
              }
            />
          ))}
        </div>
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
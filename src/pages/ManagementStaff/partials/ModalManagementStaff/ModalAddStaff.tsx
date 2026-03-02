import React, { useMemo, useState, useEffect } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IFormData, IFieldCustomize } from "model/FormModel";
import { handleChangeValidate } from "utils/validate";
import "./ModalAddStaff.scss";

export default function ModalAddStaff(props: any) {
  const { onShow, onHide, data } = props;

  const initialValues = useMemo(
    () => ({
      name: data?.name ?? "",
      code: data?.code ?? "",
      pin: "",
      role: data?.role ?? "Thu ngân",
      useShiftManager: data?.isShiftManager ?? true,
    }),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: initialValues, errors: {} });

  useEffect(() => {
    setFormData({ values: initialValues, errors: {} });
  }, [initialValues]);

  const listField = useMemo(
    () =>
      [
        { label: "Tên nhân viên", name: "name", type: "text", placeholder: "Nguyễn Văn B", fill: true, required: true },
        { label: "Mã số", name: "code", type: "text", placeholder: "NV005", fill: true, required: true },
        { label: "Khẩu hiệu (PIN)", name: "pin", type: "password", placeholder: "****", fill: true, required: true },
        {
          label: "Vai trò (Role)",
          name: "role",
          type: "select",
          options: [
            { value: "Thu ngân", label: "Thu ngân" },
            { value: "Quản lý", label: "Quản lý" },
          ],
          fill: true,
        },
      ] as IFieldCustomize[],
    []
  );

  return (
    <Modal isOpen={onShow} className="modal-add-staff" toggle={onHide}>
      <div className="form-staff">
        <ModalHeader title={data ? "Cập nhật nhân viên" : "Thêm Nhân viên mới"} toggle={onHide} />
        {/* <ModalBody>
          <div className="list-form-group">
            {listField.map((field, index) => (
              <FieldCustomize
                key={index}
                field={field}
                formData={formData}
                handleUpdate={(value) => handleChangeValidate(value, field, formData, [], listField, (d) => setFormData(d as any))}
              />
            ))}

            <div className="base-switch-wrapper d-flex justify-content-between align-items-center mt-16">
              <label className="fw-700">Sử dụng tính năng quản lý ca</label>
              <input
                type="checkbox"
                className="base-switch"
                checked={formData.values.useShiftManager}
                onChange={(e) => setFormData({ ...formData, values: { ...formData.values, useShiftManager: e.target.checked } })}
              />
            </div>
          </div>
        </ModalBody> */}
        <ModalBody>
          <div className="list-form-group">
            <FieldCustomize
              field={listField[0]}
              formData={formData}
              handleUpdate={(value) => handleChangeValidate(value, listField[0], formData, [], listField, (d) => setFormData(d as any))}
            />

            <div className="form-row-2">
              {[listField[1], listField[2]].map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  formData={formData}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, [], listField, (d) => setFormData(d as any))}
                />
              ))}
            </div>

            <FieldCustomize
              field={listField[3]}
              formData={formData}
              handleUpdate={(value) => handleChangeValidate(value, listField[3], formData, [], listField, (d) => setFormData(d as any))}
            />

            <div className="base-switch-wrapper d-flex justify-content-between align-items-center mt-16">
              <label className="fw-700 mr-2">Sử dụng tính năng quản lý ca</label>
              <input
                type="checkbox"
                className="base-switch"
                checked={formData.values.useShiftManager}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    values: {
                      ...formData.values,
                      useShiftManager: e.target.checked,
                    },
                  })
                }
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter
          actions={{
            actions_right: {
              buttons: [
                { title: "Hủy", variant: "outline", color: "primary", callback: onHide },
                { title: data ? "Cập nhật" : "Thêm nhân viên", color: "primary", callback: onHide },
              ],
            },
          }}
        />
      </div>
    </Modal>
  );
}

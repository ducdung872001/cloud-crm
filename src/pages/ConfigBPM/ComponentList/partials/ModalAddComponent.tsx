import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddContractPipelineModalProps } from "model/contractPipeline/PropsModel";
import { IContractPipelineRequest } from "model/contractPipeline/ContractPipelineRequestModel";
import ContractPipelineService from "services/ContractPipelineService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./ModalAddComponent.scss";
import ContractCategoryService from "services/ContractCategoryService";
import ArtifactService from "services/ArtifactService";

export default function ModalAddComponent(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);

  const values = useMemo(
    () =>
    ({
      id: data?.id ?? 0,
      name: data?.name ?? "",
      code: data?.code ?? "",
      description: data?.description ?? "",
      type: data?.type ?? "",
      position: Number.isFinite(Number(data?.position)) ? Number(data?.position) : 0,
      paste: "",
      bulkPaste: "",
    } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values });

  const validations: IValidation[] = [
    { name: "name", rules: "required" },
    { name: "code", rules: "required" },
    { name: "type", rules: "required" },
    { name: "position", rules: "required|numeric|min:0|max:1000000" },
  ];

  const handlePasteData = useCallback((raw: string) => {
    if (!raw) return;

    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return;

    const isHeader =
      lines[0].toLowerCase().includes("tên") &&
      lines[0].toLowerCase().includes("mã") &&
      lines[0].toLowerCase().includes("loại");

    const dataLine = isHeader ? lines[1] : lines[0];
    if (!dataLine) return;

    const cols = dataLine.split("\t").map((x) => (x ?? "").trim());
    const [name, code, type, position] = cols;

    setFormData((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        name: name ?? "",
        code: code ?? "",
        type: type ?? "",
        position: Number(position) || 0,
      },
    }));
  }, []);

  const parseBulkPaste = (raw: string) => {
    const lines = (raw || "")
      .trim()
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return [];

    const first = lines[0].toLowerCase();
    const hasHeader = first.includes("tên") && first.includes("mã") && first.includes("loại");

    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines
      .map((line, idx) => {
        const cols = line.split("\t").map((x) => (x ?? "").trim());
        const [name, code, type, position] = cols;
        if (!name || !code || !type) return null;

        const pos = Number(position);
        return {
          name,
          code,
          type,
          position: Number.isFinite(pos) ? pos : 0,
          __line: idx + 1,
        };
      })
      .filter(Boolean) as any[];
  };

  const onBulkCreate = async () => {
    const raw = String((formData.values as any)?.bulkPaste ?? "");
    const rows = parseBulkPaste(raw);

    if (!rows.length) {
      showToast("Không có dòng dữ liệu hợp lệ để tạo", "error");
      return;
    }

    setIsSubmit(true);

    const ok: any[] = [];
    const fail: any[] = [];

    for (const row of rows) {
      const pos = Number(row.position);
      if (!Number.isInteger(pos) || pos < 0 || pos > 1000000) {
        fail.push({ row, error: `Dòng ${row.__line}: Thứ tự không hợp lệ` });
        continue;
      }

      const { __line, ...body } = row;

      try {
        const res = await ArtifactService.update(body);
        if (res.code === 0) ok.push(row);
        else fail.push({ row, error: `Dòng ${row.__line}: ${res.message || "Lỗi tạo mới"}` });
      } catch (e: any) {
        fail.push({ row, error: `Dòng ${row.__line}: Lỗi mạng/exception` });
      }
    }

    setIsSubmit(false);

    if (ok.length) showToast(`Tạo thành công ${ok.length} thành phần`, "success");
    if (fail.length) showToast(`Thất bại ${fail.length} dòng (mở console xem chi tiết)`, "error");
    if (fail.length) console.log("Bulk create failed rows:", fail);

    if (ok.length) onHide(true);
  };

  const listFieldBasic = useMemo(() => {
    if (isBulkMode && !data) {
      return [
        {
          label: "Dán nhiều dòng (tạo hàng loạt)",
          name: "bulkPaste",
          type: "textarea",
          fill: true,
          placeholder: "Mỗi dòng: Tên<TAB>Mã<TAB>Loại<TAB>Thứ tự",
        },
      ] as IFieldCustomize[];
    }

    return [
      {
        label: "Tên thành phần",
        name: "name",
        type: "text",
        fill: true,
        required: true,
        placeholder: "Nhập tên thành phần",
      },
      {
        label: "Mã thành phần",
        name: "code",
        type: "text",
        fill: true,
        required: true,
        placeholder: "Nhập mã thành phần",
      },
      {
        label: "Thứ tự ưu tiên",
        name: "position",
        type: "text",
        fill: true,
        required: true,
        inputMode: "numeric",
        placeholder: "Thứ tự ưu tiên",
      },
      {
        label: "Loại thành phần",
        name: "type",
        type: "text",
        fill: true,
        required: true,
        placeholder: "Nhập loại thành phần",
      },
      {
        label: "Mô tả",
        name: "description",
        type: "textarea",
        fill: true,
        placeholder: "Nhập mô tả",
      },
      {
        label: "Dán nhanh dữ liệu",
        name: "paste",
        type: "textarea",
        fill: true,
        placeholder: "Dán 1 dòng từ Excel (Tên | Mã | Loại | Thứ tự)",
      },
    ] as IFieldCustomize[];
  }, [isBulkMode, data]);

  useEffect(() => {
    setFormData({ values, errors: {} } as any);
    setIsSubmit(false);

    if (data) setIsBulkMode(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values, data]);

  const onSubmit = async (e: any) => {
    e.preventDefault();

    if (isBulkMode && !data) {
      await onBulkCreate();
      return;
    }

    const posRaw = (formData.values as any)?.position;
    const pos = Number(posRaw);

    if (!Number.isFinite(pos) || !Number.isInteger(pos) || pos < 0 || pos > 1000000) {
      setFormData((prev) => ({
        ...prev,
        errors: { ...(prev.errors ?? {}), position: "Chỉ được nhập số tự nhiên < 1,000,000" },
      }));
      return;
    }

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors }));
      return;
    }

    setIsSubmit(true);

    const { paste, bulkPaste, ...restValues } = (formData.values as any) || {};

    const body: any = {
      ...restValues,
      position: pos,
      ...(data ? { id: data.id } : {}),
    };

    const response = await ArtifactService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} thành phần thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => onHide(false);

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
              !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : isBulkMode ? "Tạo hàng loạt" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              (data ? !isDifferenceObj(formData.values, values) : false) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, data, isBulkMode]
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
    (e: any) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) focusedElement.blur();
        } else {
          onHide(false);
        }
      }
    },
    [formData, values, showDialog, focusedElement]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => window.removeEventListener("keydown", checkKeyDown);
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-component"
        size="lg"
      >
        <form className="form-add-component" onSubmit={onSubmit}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} thành phần`}
            toggle={() => {
              !isSubmit && onHide(false);
            }}
          />

          <ModalBody>
            <div className="list-form-group">
              <div className="list-field-item list-field-basic">
                {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    formData={formData}
                    handleUpdate={(value: any) => {
                      handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData);

                      if (field.name === "paste") {
                        handlePasteData(String(value ?? ""));
                      }
                    }}
                  />
                ))}
              </div>
              {!data && (
                <div className="bulk-toggle-ios">
                  <span className="bulk-toggle-label">Tạo nhiều dòng</span>

                  <label className="ios-switch">
                    <input
                      type="checkbox"
                      checked={isBulkMode}
                      disabled={isSubmit}
                      onChange={(e) => {
                        const next = e.target.checked;
                        setIsBulkMode(next);

                        setFormData((prev) => ({
                          ...prev,
                          errors: {},
                          values: {
                            ...prev.values,
                            paste: "",
                            ...(next
                              ? { name: "", code: "", type: "", position: 0, description: "" }
                              : { bulkPaste: "" }),
                          },
                        }));
                      }}
                    />
                    <span className="slider" />
                  </label>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Select from "react-select";
import { AsyncPaginate } from "react-select-async-paginate";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import "./index.scss";
import { AddLoyaltyRewardProps } from "@/model/loyalty/PropsModal";
import { ILoyaltyRewardRequest } from "@/model/loyalty/RoyaltyRequest";
import LoyaltyService from "@/services/LoyaltyService";
import ProductService from "@/services/ProductService";

interface IRewardItem {
  productId: number | null;
  productLabel: string;
  quantity: number;
}

const emptyItem = (): IRewardItem => ({ productId: null, productLabel: "", quantity: 1 });

export default function AddLoyaltyRewardModal(props: AddLoyaltyRewardProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // dynamic reward items rows
  const [rewardItems, setRewardItems] = useState<IRewardItem[]>([emptyItem()]);

  const parseInitialItems = (raw: string | any[]): IRewardItem[] => {
    try {
      const parsed: { productId: number; quantity: number }[] =
        typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => ({ productId: p.productId, productLabel: "", quantity: p.quantity }));
      }
    } catch (_) { }
    return [emptyItem()];
  };

  const values = useMemo(
    () =>
    ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      pointsRequired: data?.pointsRequired ?? 0,
      status: data?.status ?? 1,
    } as ILoyaltyRewardRequest),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    { name: "name", rules: "required" },
    { name: "pointsRequired", rules: "required" },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên phần thưởng",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Điểm cần để đổi",
          name: "pointsRequired",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Trạng thái",
          name: "status",
          type: "select",
          fill: true,
          options: [
            { label: "Kích hoạt", value: 1 },
            { label: "Không kích hoạt", value: 0 },
          ],
        },
        {
          label: "Mô tả",
          name: "description",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [formData]
  );

  // Fetch label sản phẩm cho mục đích edit
  useEffect(() => {
    if (!onShow || !data || !data.rewardItems) return;

    const fetchLabels = async () => {
      try {
        const items = parseInitialItems(data.rewardItems);
        const itemIds = items.map((item) => item.productId).filter((id) => id !== null);
        if (itemIds.length === 0) return;

        const resById = await ProductService.listById({ lstId: itemIds.join(",") });
        if (resById && resById.code === 0) {
          const products = resById.result?.items || resById.result || [];

          setRewardItems((prev) =>
            prev.map(item => {
              if (item.productId && !item.productLabel) {
                const found = products.find((p: any) => p.id === item.productId);
                return { ...item, productLabel: found ? String(found.name) : "" };
              }
              return item;
            })
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải label sản phẩm theo ID:", error);
      }
    };

    fetchLabels();
  }, [onShow, data]);

  // reset form when data changes
  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setRewardItems(parseInitialItems(data?.rewardItems ?? ""));
    setIsSubmit(false);
    return () => { setIsSubmit(false); };
  }, [values]);

  const loadProductOptions = async (search: string, loadedOptions: any, { page }: any) => {
    try {
      const res = await ProductService.list({ name: search, page, limit: 10 });
      if (res && res.code === 0) {
        const dataList = res.result?.items || res.result || [];

        const mapped = dataList.map((product: any) => ({
          value: product.id,
          label: product.name,
        }));

        return {
          options: mapped,
          hasMore: res.result?.loadMoreAble ?? false,
          additional: { page: page + 1 },
        };
      }
    } catch { }
    return { options: [], hasMore: false };
  };

  const addRow = () => setRewardItems((prev) => [...prev, emptyItem()]);

  const removeRow = (idx: number) =>
    setRewardItems((prev) => {
      if (prev.length === 1) return [emptyItem()];
      return prev.filter((_, i) => i !== idx);
    });

  const updateProduct = (idx: number, option: IOption | null) => {
    setRewardItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, productId: option ? (option.value as number) : null, productLabel: option ? String(option.label) : "" }
          : item
      )
    );
  };

  const updateQuantity = (idx: number, qty: number) => {
    setRewardItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, quantity: qty < 1 ? 1 : qty } : item))
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }
    setIsSubmit(true);

    const validItems = rewardItems
      .filter((item) => item.productId !== null)
      .map((item) => ({ productId: item.productId, quantity: item.quantity }));

    const body: ILoyaltyRewardRequest = {
      ...(formData.values as ILoyaltyRewardRequest),
      ...(data ? { id: data.id } : {}),
      rewardItems: validItems.length > 0 ? JSON.stringify(validItems) : "",
    };
    const response = await LoyaltyService.updateLoyaltyReward(body);
    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} phần thưởng thành công`, "success");
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
            disabled: isSubmit || !isDifferenceObj(formData.values, values),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const content: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận",
      defaultAction: () => { onHide(false); setShowDialog(false); setContentDialog(null); },
    };
    setContentDialog(content);
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
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
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => { window.removeEventListener("keydown", checkKeyDown); };
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal isFade isOpen={onShow} isCentered staticBackdrop toggle={() => !isSubmit && onHide(false)} className="modal-add-loyalty-reward">
        <form className="form-loyalty-reward" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} phần thưởng`} toggle={() => !isSubmit && onHide(false)} />
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

              {/* ── Reward Items ── */}
              <div className="reward-items-section">
                <label className="reward-items-label">Danh sách vật phẩm đổi thưởng</label>
                <div className="reward-items-list">
                  {rewardItems.map((item, idx) => (
                    <div key={idx} className="reward-item-row">
                      {/* Product Select */}
                      <div className="reward-item-select">
                        <AsyncPaginate
                          placeholder="Chọn sản phẩm"
                          loadOptions={loadProductOptions}
                          additional={{ page: 1 }}
                          debounceTimeout={300}
                          value={
                            item.productId
                              ? { value: item.productId, label: item.productLabel || String(item.productId) }
                              : null
                          }
                          onChange={(opt) => updateProduct(idx, opt as any)}
                          classNamePrefix="rs"
                          menuPortalTarget={document.body}
                          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                          noOptionsMessage={() => "Không tìm thấy dữ liệu"}
                        />
                      </div>

                      {/* Quantity Input */}
                      <div className="reward-item-qty">
                        <input
                          type="number"
                          className="form-control"
                          min={1}
                          value={item.quantity || ""}
                          onChange={(e) => updateQuantity(idx, parseInt(e.target.value) || 1)}
                          placeholder="Số lượng"
                        />
                      </div>

                      {/* Add row button */}
                      <button
                        type="button"
                        className="btn-icon btn-add-row"
                        onClick={addRow}
                        title="Thêm dòng"
                      >
                        <Icon name="PlusCircleFill" />
                      </button>

                      {/* Remove row button */}
                      <button
                        type="button"
                        className="btn-icon btn-remove-row"
                        onClick={() => removeRow(idx)}
                        title="Xóa dòng"
                      >
                        <Icon name="Trash" />
                      </button>
                    </div>
                  ))}
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

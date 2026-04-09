import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import Toggle from "@/components/toggle";
import ProductService from "services/ProductService";
import "./ConfigDisplayModal.scss";

const WEBSITE_SETTING_CONFIG = [
  { key: "showOnWebsite",     label: "Hiển thị sản phẩm trên website" },
  { key: "showImage",         label: "Hiển thị hình ảnh sản phẩm",    backendKey: "showImage"        },
  { key: "showUnit",          label: "Hiển thị đơn vị tính",          backendKey: "showUnit"         },
  { key: "showDescription",   label: "Hiển thị mô tả chi tiết",       backendKey: "showDescription"  },
  { key: "showPromotionPrice",label: "Hiển thị giá khuyến mãi",       backendKey: "showPromotionPrice"},
  { key: "showWholesalePrice",label: "Hiển thị giá sỉ",               backendKey: "showWholesalePrice"},
  { key: "showInventory",     label: "Hiển thị số lượng tồn kho",     backendKey: "showInventory"    },
  { key: "showBarcode",       label: "Hiển thị mã vạch / barcode",    backendKey: "showBarcode"      },
  { key: "showVariant",       label: "Hiển thị phân loại / biến thể", backendKey: "showVariant"      },
  { key: "hideWhenOutOfStock",label: "Tự động ẩn sản phẩm hết hàng",  backendKey: "hideWhenOutOfStock"},
];

const WEBSITE_SETTING_DEFAULTS: Record<string, boolean> = {
  showOnWebsite: true,
  showImage: true,
  showUnit: true,
  showDescription: true,
  showPromotionPrice: false,
  showWholesalePrice: false,
  showInventory: true,
  showBarcode: false,
  showVariant: true,
  hideWhenOutOfStock: true,
};

const readToggleValue = (value: unknown, fallback: boolean) =>
  value === undefined || value === null ? fallback : value === 1 || value === true;

function responseToState(res: Record<string, unknown>): Record<string, boolean> {
  const state: Record<string, boolean> = { ...WEBSITE_SETTING_DEFAULTS };
  WEBSITE_SETTING_CONFIG.forEach(({ key, backendKey }) => {
    const responseKey = backendKey ?? key;
    state[key] = readToggleValue(res?.[responseKey], WEBSITE_SETTING_DEFAULTS[key]);
  });
  return state;
}

function stateToBody(state: Record<string, boolean>): Record<string, number> {
  const body: Record<string, number> = {};
  WEBSITE_SETTING_CONFIG.forEach(({ key, backendKey }) => {
    body[backendKey ?? key] = state[key] ? 1 : 0;
  });
  return body;
}

interface ConfigDisplayModalProps {
  onShow: boolean;
  onHide: (reload?: boolean) => void;
}

export default function ConfigDisplayModal({ onShow, onHide }: ConfigDisplayModalProps) {
  const [isSubmit, setIsSubmit]           = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [settings, setSettings]           = useState<Record<string, boolean>>({});
  const [initialSettings, setInitialSettings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!onShow) return;
    setIsLoading(true);
    ProductService.wWebsiteSettingDefaultGet()
      .then((res) => {
        if (res.code === 0 && res.result) {
          const state = responseToState(res.result);
          setSettings(state);
          setInitialSettings(state);
        } else {
          setSettings({ ...WEBSITE_SETTING_DEFAULTS });
          setInitialSettings({ ...WEBSITE_SETTING_DEFAULTS });
        }
      })
      .catch(() => showToast("Không thể tải cài đặt hiển thị", "error"))
      .finally(() => setIsLoading(false));
  }, [onShow]);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const handleToggle = (key: string) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmit(true);
    try {
      const body = stateToBody(settings);
      const res = await ProductService.wWebsiteSettingDefaultUpdate(body);
      if (res.code === 0) {
        showToast("Lưu cài đặt hiển thị thành công", "success");
        setInitialSettings({ ...settings });
        onHide(true);
      } else {
        showToast(res.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } catch {
      showToast("Lỗi kết nối. Vui lòng thử lại sau", "error");
    } finally {
      setIsSubmit(false);
    }
  };

  const clearForm = () => onHide(false);

  const showDialogConfirmCancel = () => {
    setContentDialog({
      color: "warning",
      isCentered: true,
      title: <Fragment>Hủy bỏ thao tác</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy? Các thay đổi chưa lưu sẽ bị mất.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận",
      defaultAction: () => { clearForm(); setShowDialog(false); setContentDialog(null); },
    });
    setShowDialog(true);
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
            callback: () => (hasChanges ? showDialogConfirmCancel() : clearForm()),
          },
          {
            title: "Lưu cài đặt",
            type: "submit",
            color: "primary",
            disabled: isSubmit || isLoading,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, hasChanges, isLoading]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && clearForm()}
        className="modal-config-display"
        size="md"
      >
        <form onSubmit={onSubmit}>
          <ModalHeader
            title="Cài đặt hiển thị Website (Toàn hệ thống)"
            toggle={() => !isSubmit && clearForm()}
          />
          <ModalBody>
            <div className="cfg-display__warning">
              ⚠️ Cài đặt này áp dụng mặc định cho toàn bộ sản phẩm. Bạn có thể ghi đè cho từng sản phẩm riêng lẻ.
            </div>

            {isLoading ? (
              <div className="cfg-display__loading">
                <div className="cfg-display__spinner" />
                <span>Đang tải cài đặt...</span>
              </div>
            ) : (
              <div className="cfg-display__list">
                {WEBSITE_SETTING_CONFIG.map((cfg) => (
                  <div key={cfg.key} className="cfg-display__item">
                    <span className="cfg-display__label">{cfg.label}</span>
                    <Toggle
                      checked={!!settings[cfg.key]}
                      onChange={() => handleToggle(cfg.key)}
                    />
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

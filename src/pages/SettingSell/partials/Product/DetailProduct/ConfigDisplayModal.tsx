import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import Toggle from "@/components/toggle";
import ProductService from "services/ProductService";
import "./ConfigDisplayModal.scss";

// Map từ key frontend → field name backend
const WEBSITE_SETTING_CONFIG = [
  { key: "showImage",         label: "Hiển thị hình ảnh sản phẩm",    backendKey: "showImage"        },
  { key: "showUnit",          label: "Hiển thị đơn vị tính",          backendKey: "showUnit"         },
  { key: "showDesc",          label: "Hiển thị mô tả chi tiết",       backendKey: "showDescription"  },
  { key: "showPromoPrice",    label: "Hiển thị giá khuyến mãi",       backendKey: "showPromotionPrice"},
  { key: "showWholesalePrice",label: "Hiển thị giá sỉ",               backendKey: "showWholesalePrice"},
  { key: "showInventory",     label: "Hiển thị số lượng tồn kho",     backendKey: "showInventory"    },
  { key: "showBarcode",       label: "Hiển thị mã vạch / barcode",    backendKey: "showBarcode"      },
  { key: "showCategory",      label: "Hiển thị danh mục / nhóm",     backendKey: "showVariant"      },
  { key: "showSoldCount",     label: "Hiển thị số lượng đã bán",      backendKey: "showSoldCount"    },
  { key: "autoHideOutOfStock",label: "Tự động ẩn sản phẩm hết hàng", backendKey: "hideWhenOutOfStock"},
];

// Convert response từ backend (Integer 0/1) sang state FE (boolean)
function responseToState(res: Record<string, any>): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  WEBSITE_SETTING_CONFIG.forEach(({ key, backendKey }) => {
    state[key] = res[backendKey] === 1 || res[backendKey] === true;
  });
  return state;
}

// Convert state FE sang body gửi backend
function stateToBody(state: Record<string, boolean>): Record<string, number> {
  const body: Record<string, number> = {};
  WEBSITE_SETTING_CONFIG.forEach(({ key, backendKey }) => {
    body[backendKey] = state[key] ? 1 : 0;
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

  // Load từ API khi mở modal
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
          // Fallback defaults nếu chưa có record trong DB
          const defaults: Record<string, boolean> = {};
          WEBSITE_SETTING_CONFIG.forEach((cfg) => {
            defaults[cfg.key] = ["showImage","showUnit","showDesc","showInventory","showCategory","autoHideOutOfStock"].includes(cfg.key);
          });
          setSettings(defaults);
          setInitialSettings(defaults);
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
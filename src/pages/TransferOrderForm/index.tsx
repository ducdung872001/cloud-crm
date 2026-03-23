import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddTransferOrderForm from "./partials/AddTransferOrderForm";
import urls from "@/configs/urls";

/**
 * Route: /inventory_transfer_document
 *
 * ?mode=create  → form tạo mới phiếu chuyển kho
 * ?id=123       → form xem/sửa phiếu id=123
 * (không có param) → redirect về Quản lý kho tab Chuyển kho
 */
export default function TransferOrderForm() {
  document.title = "Phiếu điều chuyển kho";

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const modeFromUrl = searchParams.get("mode");
  const idFromUrl   = searchParams.get("id");

  const isCreate = modeFromUrl === "create";
  const isEdit   = !!idFromUrl;

  // Nếu không có params hợp lệ → redirect về list
  useEffect(() => {
    if (!isCreate && !isEdit) {
      navigate(urls.inventory_checking, { replace: true });
    }
  }, [isCreate, isEdit]);

  if (!isCreate && !isEdit) return null;

  const handleHide = (reload: boolean) => {
    navigate(urls.inventory_checking, { replace: true });
  };

  return (
    <div className="page-content">
      <AddTransferOrderForm
        onShow={true}
        id={isEdit ? +idFromUrl : null}
        onHide={handleHide}
      />
    </div>
  );
}
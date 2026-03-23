import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddAdjustmentSlip from "./partials/AddAdjustmentSlip/AddAdjustmentSlip";
import urls from "@/configs/urls";

/**
 * Route: /adjustment_slip
 *
 * ?id=123  → form xem/sửa phiếu id=123
 * (không có param) → form tạo mới
 *
 * Không còn trang list trung gian — navigate thẳng vào form.
 * List phiếu kiểm hiển thị trong tab "Phiếu kiểm" của Quản lý kho (/inventory_checking).
 */
export default function AdjustmentSlip() {
  document.title = "Phiếu kiểm kho";

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get("id");

  return (
    <div className="page-content">
      <AddAdjustmentSlip
        onShow={true}
        id={idFromUrl ? +idFromUrl : null}
        onHide={() => navigate(urls.inventory_checking, { replace: true })}
      />
    </div>
  );
}
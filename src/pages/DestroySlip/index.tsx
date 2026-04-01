import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddDestroySlip from "./partials/AddDestroySlip";
import urls from "@/configs/urls";

export default function DestroySlip() {
  document.title = "Phiếu xuất hủy";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get("id");
  const isViewMode = searchParams.get("mode") === "view";

  return (
    <div className="page-content">
      <AddDestroySlip
        id={idFromUrl ? +idFromUrl : null}
        isViewMode={isViewMode}
        onHide={() => navigate(`${urls.inventory_checking}?tab=destroy`, { replace: true })}
      />
    </div>
  );
}

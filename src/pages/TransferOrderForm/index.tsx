import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddTransferOrderForm from "./partials/AddTransferOrderForm";
import urls from "@/configs/urls";

export default function TransferOrderForm() {
  document.title = "Phiếu điều chuyển kho";

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get("id");

  return (
    <div className="page-content">
      <AddTransferOrderForm
        id={idFromUrl ? +idFromUrl : null}
        onHide={() => navigate(urls.inventory_checking, { replace: true })}
      />
    </div>
  );
}
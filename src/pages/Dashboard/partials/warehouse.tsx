import React, { useState } from "react";
import { IOption } from "model/OtherModel";
import { formatCurrency } from "reborn-util";

interface WarehouseProps {
  classNames?: string;
}

export default function Warehouse(props: WarehouseProps) {
  const { classNames } = props;

  const [warehouse] = useState<IOption[]>([
    {
      label: "Dịch vụ dưới định mức",
      value: 20,
      type: "number",
    },
    {
      label: "Số tồn kho",
      value: 10,
      type: "number",
    },
    {
      label: "Giá trị tồn kho",
      value: 550000,
      type: "amount",
    },
  ]);

  return (
    <div className={`card-box warehouse${classNames ? ` ${classNames}` : ""}`}>
      <div className="title d-flex align-items-start justify-content-between">
        <h2>Thông tin kho</h2>
      </div>
      <ul className="d-flex flex-column">
        {warehouse.map((w, index) => (
          <li key={index} className="d-flex align-items-center justify-content-between">
            <span className="label">{w.label}</span>
            <span className="value">{w.type === "amount" ? formatCurrency(w.value, ".") : w.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

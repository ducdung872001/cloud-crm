import React from "react";

interface CreateOrderButtonProps {
  label: string;
  disabled?: boolean;
  onCreateOrder: () => void;
}

export default function CreateOrderButton(props: CreateOrderButtonProps) {
  const { label, disabled, onCreateOrder } = props;

  return (
    <button type="button" className="create-order-button" onClick={onCreateOrder} disabled={disabled}>
      {label}
    </button>
  );
}

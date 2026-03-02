// Toggle.tsx
import React from "react";
import "./styles.scss";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <div
      className={`toggle ${checked ? "toggle--on" : "toggle--off"} ${disabled ? "toggle--disabled" : ""}`}
      onClick={() => !disabled && onChange()}
    >
      <div className="toggle__thumb" />
    </div>
  );
}
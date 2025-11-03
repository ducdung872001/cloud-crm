import React from "react";
import "./radio.scss";

export interface RadioProps {
  label?: string | number;
  onChange?: any;
  name?: string;
  value?: string | number;
  checked?: boolean;
  defaultChecked?: boolean;
  id?: string;
  disabled?: boolean;
  onClick?: any;
  className?: string;
}
export default function Radio(props: RadioProps) {
  const { label, onChange, onClick, name, value, id, disabled, checked, defaultChecked, className } = props;

  return (
    <div
      className={`base-radio${className ? " " + className : ""}${label ? "" : " base-radio__no-label"}${checked ? " on-checked" : ""}${
        disabled ? " has-disabled" : ""
      }`}
    >
      <label onClick={onClick}>
        <input
          disabled={disabled}
          type="radio"
          checked={checked}
          defaultChecked={defaultChecked}
          name={name}
          value={value}
          id={id}
          onChange={onChange}
        />
        <span className="checkmark"></span>
        {label}
      </label>
    </div>
  );
}

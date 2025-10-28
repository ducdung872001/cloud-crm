import React from "react";
import Icon from "components/icon";
import "./checkbox.scss";

export interface CheckboxProps {
  value?: string | number;
  label?: string | number;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: any;
  onClick?: any;
  className?: string;
  disabled?: boolean;
}
export default function Checkbox(props: CheckboxProps) {
  const { value, label, checked, defaultChecked, indeterminate, onChange, onClick, className, disabled } = props;
  return (
    <div
      className={`base-checkbox${className ? " " + className : ""}${label ? "" : " base-checkbox__no-label"}${checked ? " on-checked" : ""}${
        indeterminate ? " on-indeterminate" : ""
      }${disabled ? " has-disabled" : ""}`}
    >
      <label onClick={onClick}>
        <input type="checkbox" onChange={onChange} checked={checked} value={value} disabled={disabled} defaultChecked={defaultChecked}></input>
        <span className="checkmark">
          <Icon name="Minus" className="minus" />
          <Icon name="Checked" className="check" />
        </span>
        {label}
      </label>
    </div>
  );
}

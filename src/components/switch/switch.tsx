import React from "react";
import "./switch.scss";

interface SwitchProps {
  id?: string;
  name?: string;
  label?: string;
  className?: string;
  onChange?: any;
  checked?: boolean;
  onClick?: any;
}

export default function Switch(props: SwitchProps) {
  const { checked, id, onChange, name, onClick, label } = props;
  return (
    <div className="base-switch">
      <label onClick={onClick}>
        <input id={id} type="checkbox" onChange={onChange} checked={checked} name={name} />
        <span className="slider"></span>
      </label>
      <span className="label-name">{label}</span>
    </div>
  );
}

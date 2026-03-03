import React from "react";
import "./ButtonOnOff.scss";

export default function ButtonOnOff(props: any) {
  const { checked, onChange, disabled } = props;

  return (
    <div className="container-button_on_off">
      <label className="button_on_off" style={disabled ? { cursor: "not-allowed", opacity: "0.4" } : {}}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => {
            const value = e.target.checked;
            if (!disabled) {
              onChange(value);
            }
          }}
        />
        <span className="__extra"></span>
      </label>
    </div>
  );
}

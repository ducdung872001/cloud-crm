import React from "react";
import "./button.scss";
export interface ButtonProps {
  color?: "primary" | "destroy" | "success" | "warning" | "transparent" | "link" | "secondary";
  variant?: "outline";
  children?: any;
  disabled?: boolean;
  onClick?: any;
  type?: "submit" | "button";
  className?: string;
  hasIcon?: boolean; // Dành cho color filter
  onlyIcon?: boolean;
  size?: "slim" | "large";
  refButton?: any;
  dataTip?: any;
  autoFocus?: boolean;
}
export default function Button(props: ButtonProps) {
  const { color, variant, children, disabled, onClick, type, className, hasIcon, onlyIcon, size, refButton, dataTip, autoFocus } = props;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      ref={refButton ?? null}
      className={`base-button${color ? " base-button--color-" + color : ""}${
        variant && (!color || color !== "transparent") ? " base-button--variant-" + variant : ""
      }${onlyIcon ? " base-button__only-icon" : ""}${hasIcon ? " base-button__has-icon" : ""}${size ? " base-button__size-" + size : ""}${
        className ? " " + className : ""
      }`}
      data-tip={dataTip}
      autoFocus={autoFocus}
    >
      {children}
    </button>
  );
}

import React from "react";
import "./badge.scss";

interface BadgeProps {
  text: string;
  style?: any;
  variant: "error" | "success" | "warning" | "primary" | "secondary" | "transparent";
}

export default function Badge(props: BadgeProps) {
  const { text, variant, style } = props;
  return (
    <span className={`base-badge base-badge--${variant}`} style={style}>
      {text}
    </span>
  );
}

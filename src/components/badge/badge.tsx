import React, { memo } from "react";
import "./badge.scss";

interface BadgeProps {
  text: string;
  style?: React.CSSProperties;
  variant: "error" | "success" | "warning" | "primary" | "secondary" | "transparent" | "done" | "wait-collect";
}

function Badge(props: BadgeProps) {
  const { text, variant, style } = props;
  return (
    <span className={`base-badge base-badge--${variant}`} style={style}>
      {text}
    </span>
  );
}

export default memo(Badge);

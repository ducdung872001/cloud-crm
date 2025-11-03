import React from "react";
import Icon from "components/icon";

export default function Loading() {
  return (
    <div className="loading__wrapper d-flex align-items-center justify-content-center">
      <div className="loading d-flex align-items-center justify-content-center">
        <Icon name="Loading" />
      </div>
    </div>
  );
}

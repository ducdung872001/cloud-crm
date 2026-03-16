import React from "react";
import TitleAction from "components/titleAction/titleAction";
import OpenShiftTab from "./OpenShiftTab";

export default function OpenShiftPage() {
  document.title = "Vào ca làm việc";

  return (
    <div className="page-content">
      <TitleAction title="Mở ca làm việc" />
      <div className="card-box d-flex flex-column">
        <OpenShiftTab />
      </div>
    </div>
  );
}

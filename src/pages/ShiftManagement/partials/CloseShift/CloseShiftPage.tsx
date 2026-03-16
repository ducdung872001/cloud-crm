import React from "react";
import TitleAction from "components/titleAction/titleAction";
import CloseShiftTab from "./CloseShiftTab";

export default function CloseShiftPage() {
  document.title = "Kết thúc ca làm việc";

  return (
    <div className="page-content">
      <TitleAction title="Kết thúc ca làm việc" />
      <div className="card-box d-flex flex-column">
        <CloseShiftTab />
      </div>
    </div>
  );
}

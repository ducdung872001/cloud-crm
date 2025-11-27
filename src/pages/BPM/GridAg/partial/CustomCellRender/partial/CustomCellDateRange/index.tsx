import React, { useState, useEffect } from "react";
import { useGridAg } from "pages/BPM/GridAg/GridAgContext";
import moment from "moment";

const CustomCellDateRange = (props) => {
  const { rowData } = useGridAg();
  const [labelDateRange, setLabelDateRange] = useState("");

  useEffect(() => {
    const timeRange = JSON.parse(props?.colDef.cellRendererParams.timeRange);
    const dataRow = rowData.find((item) => item.rowKey === props.data.rowKey);
    if (typeof timeRange?.startDate !== "undefined" && typeof timeRange?.endDate !== "undefined" && dataRow) {
      if (dataRow[timeRange.startDate] === dataRow[timeRange.endDate] || !dataRow[timeRange.startDate] || !dataRow[timeRange.endDate]) {
        setLabelDateRange("");
        return;
      }
      const startDate = typeof dataRow[timeRange.startDate] !== "undefined" ? moment(new Date(dataRow[timeRange.startDate]), "MM/DD/YYYY") : moment();
      const endDate = typeof dataRow[timeRange.endDate] !== "undefined" ? moment(new Date(dataRow[timeRange.endDate]), "MM/DD/YYYY") : moment();

      let count = 0;
      const currentDate = startDate.clone();

      while (currentDate.isSameOrBefore(endDate)) {
        // const dayOfWeek = currentDate.day();
        // if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        //   // 0 là Chủ nhật, 6 là Thứ 7
        //   count++;
        // }
        currentDate.add(1, "days");
      }
      count++;
      setLabelDateRange(count + " Ngày");
    }
  }, [props, rowData]);

  return (
    <div className="text-truncate" title={labelDateRange}>
      {labelDateRange}
    </div>
  );
};

export default CustomCellDateRange;

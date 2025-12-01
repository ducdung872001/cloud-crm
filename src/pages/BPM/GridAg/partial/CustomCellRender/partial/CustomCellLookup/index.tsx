import React, { useState, memo, useCallback, useEffect } from "react";
import { useGridAg } from "pages/BPM/GridAg/GridAgContext";
import { genKeyLookupGrid } from "pages/BPM/GridAg/function/lookupGrid";

const CustomCellLookup = (props) => {
  const { lookupValues } = useGridAg();
  const [labelLookup, setLabelLookup] = useState("");

  let key = genKeyLookupGrid(props.colDef.cellRendererParams);

  useEffect(() => {
    setLabelLookup(
      lookupValues[key]?.listValue && lookupValues[key].listValue.find((item) => item.value === props.value)
        ? lookupValues[key].listValue.find((item) => item.value === props.value).label || props.value
        : props.value || ""
    );
  }, [props.value, key, lookupValues]);

  return (
    <div className="text-truncate" title={labelLookup}>
      {labelLookup}
    </div>
  );
};

export default CustomCellLookup;

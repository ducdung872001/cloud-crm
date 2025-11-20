import React, { useState, memo, useCallback, useEffect } from "react";
import { useGridAg } from "pages/BPM/GridAg/GridAgContext";

const CustomCellLookup = (props) => {
  const { lookupValues } = useGridAg();
  const [labelLookup, setLabelLookup] = useState("");

  useEffect(() => {
    setLabelLookup(
      lookupValues[props.lookup]?.listValue && lookupValues[props.lookup].listValue.find((item) => item.value === props.value)
        ? lookupValues[props.lookup].listValue.find((item) => item.value === props.value).label || props.value
        : props.value
    );
  }, [props.value, props.lookup, lookupValues]);

  return (
    <div className="text-truncate" title={labelLookup}>
      {labelLookup}
    </div>
  );
};

export default CustomCellLookup;

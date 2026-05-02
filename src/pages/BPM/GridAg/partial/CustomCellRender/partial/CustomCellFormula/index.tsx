import React, { useState, useEffect } from "react";
import { useGridAg } from "pages/BPM/GridAg/GridAgContext";
import { Parser } from "formula-functionizer";

const CustomCellFormula = (props) => {
  const { rowData } = useGridAg();
  const [labelFormula, setLabelFormula] = useState("");
  const parser = new Parser();

  useEffect(() => {
    // Phân tích biểu thức thành một hàm
    const formula = parser.parse(JSON.parse(props.colDef.cellRendererParams.formula)?.formula);
    const result = formula({
      ...props.data,
    });
    setLabelFormula(result);
  }, [props, rowData]);

  return (
    <div className="text-truncate" title={labelFormula}>
      {labelFormula}
    </div>
  );
};

export default CustomCellFormula;

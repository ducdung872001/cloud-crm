import React from "react";
import { IAction } from "model/OtherModel";
import "./tablePrintA5.scss";

export interface ITablePrintA5Props {
  actions?: (item: any) => IAction[];
  dataFormat?: string[];
}

export default function TablePrintA5(props) {
  return <div>TablePrintA5</div>;
}

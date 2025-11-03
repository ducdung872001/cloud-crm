import React, { Fragment } from "react";
import { formatCurrency } from "reborn-util";
import "./index.scss";

interface IInfoSignatureProps {
  name: string;
  type: string;
  lstData: any;
}

export default function InfoSignature(props: IInfoSignatureProps) {
  const { name, type, lstData } = props;

  return (
    <div className="box__info--signature">
      <h3 className="namefs">{name}</h3>
      {lstData && (
        <table className="table__form-fs">
          <thead>
            <tr>
              {lstData.lstThead.map((item, idx) => {
                return (
                  <th key={idx} style={{ textAlign: `${item.type === "number" ? "right" : item.type === "select" ? "center" : "left"}` }}>
                    {item.name}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {lstData.lstTbody.map((item, idx) => {
              return (
                <tr key={idx}>
                  {item.map((el, index) => {
                    return (
                      <td key={index} style={{ textAlign: `${el.type === "number" ? "right" : el.type === "select" ? "center" : "left"}` }}>
                        {el.type === "number" ? formatCurrency(Object.values(el)[0], ",", "") : Object.values(el)[0]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

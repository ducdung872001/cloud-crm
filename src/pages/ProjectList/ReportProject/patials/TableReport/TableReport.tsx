/* eslint-disable prefer-const */
import React, { useState } from "react";
import "./TableReport.scss";
import TableContractReport from "./patials/TableContract/TableContractReport";
import TableOpportunity from "./patials/TableOpportunity/TableOpportunity";
import TableWorkReport from "./patials/TableWorkReport/TableWorkReport";
import CashBookTable from "./patials/CashBookTable/CashBookTable";
import { useSearchParams } from "react-router-dom";

export default function TableReport({ dataProjectReport }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState({
    name: "tab_one",
    type: 1,
  });
  const listTabs = [
    {
      title: "Hợp đồng",
      is_active: "tab_one",
      type: 1,
    },
    {
      title: "Cơ hội",
      is_active: "tab_two",
      type: 2,
    },
    {
      title: "Công việc",
      is_active: "tab_three",
      type: 3,
    },
    {
      title: "Thu chi",
      is_active: "tab_four",
      type: 4,
    },
  ];

  return (
    <div className={`page-content page-table-project_report bg-white`}>
      <div className={`card-box d-flex flex-column`}>
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              {listTabs.map((item, idx) => (
                <li
                  key={idx}
                  className={item.is_active == tab.name ? "active" : ""} // đoạn này cần set nốt đk là xong thôi
                  onClick={() => {
                    setTab({ name: item.is_active, type: item.type });
                  }}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {tab.type === 1 ? (
          <TableContractReport dataProjectReport={dataProjectReport} />
        ) : tab.type === 2 ? (
          <TableOpportunity dataProjectReport={dataProjectReport} />
        ) : tab.type === 3 ? (
          <TableWorkReport dataProjectReport={dataProjectReport} />
        ) : tab.type === 4 ? (
          <CashBookTable dataProjectReport={dataProjectReport} />
        ) : null}
      </div>
    </div>
  );
}

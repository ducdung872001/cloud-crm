import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ContractPaymentProgress.scss";
import Button from "components/button/button";
import PaymentProgress from "./PaymentProgress/PaymentProgress";
import ContractorPayment from "./ContractorPayment/ContractorPayment";
import ContractProgress from "./ContractProgress/ContractProgress";
import { getDomain } from "reborn-util";
import { getRootDomain } from "utils/common";

export default function ContractPaymentProgress(props: any) {
  const { contractId, detailContract, dataContract } = props;
  const navigate = useNavigate();
  const [tab, setTab] = useState(1);

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));

  const tntecoTab = [
    {
      value: 1,
      label: "Tiến độ thu từ khách hàng",
    },
    {
      value: 2,
      label: "Tiến độ chi cho nhà thầu",
    },
  ];

  const otherTab = [
    {
      value: 1,
      label: "Tiến độ thanh toán",
    },
    {
      value: 2,
      label: "Thanh toán cho nhà thầu",
    },
    {
      value: 3,
      label: "Tiến độ triển khai dự án",
    },
  ];

  const dataTab = sourceDomain == "tnteco.reborn.vn" ? tntecoTab : otherTab;

  return (
    <div className="card-box wrapper__info--payment-progress">
      <div className="action-header-payment-progress">
        <div className="title__actions">
          <ul className="menu-list">
            {dataTab.map((item, index) => (
              <li
                key={index}
                className={tab === item.value ? "active" : ""}
                onClick={(e) => {
                  setTab(item.value);
                }}
              >
                {item.label}
              </li>
            ))}
          </ul>
          {/* <div style={{marginRight: '2rem'}}>
                        <Button
                            // type="submit"
                            color="primary"
                            // disabled={}
                            onClick = {() => {
                                setDataPaymentProgress(null);
                                setIsAddPaymentProgress(true)
                            }}
                        >
                            Thêm kỳ thanh toán
                        </Button>
                    </div> */}
        </div>
      </div>

      {tab === 1 && contractId ? <PaymentProgress contractId={contractId} dataContract={dataContract} /> : null}

      {tab === 2 && contractId ? <ContractorPayment contractId={contractId} /> : null}

      {tab === 3 && contractId ? <ContractProgress contractId={contractId} /> : null}

      {detailContract ? null : (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 1.6rem 1.6rem 0" }}>
          <Button
            color="primary"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              navigate("/contract");
            }}
          >
            Danh sách hợp đồng
          </Button>
        </div>
      )}
    </div>
  );
}

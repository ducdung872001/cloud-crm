import React, { useContext } from "react";
import TopHighestRevenue from "./partials/TopHighestRevenue";
import TopSpendersCustomer from "./partials/TopSpendersCustomer";
import HighValueCustomers from "./partials/HighValueCustomers";
import { ContextType, UserContext } from "contexts/userContext";
import "./index.scss";

export default function TransactionHistory() {
  const { dataBranch } = useContext(UserContext) as ContextType;

  return (
    <div className="page__transaction--history">
      <div className="header__transaction--history">
        <TopHighestRevenue branchId={dataBranch?.value} />
      </div>
      <div className="body__transaction--history">
        <TopSpendersCustomer branchId={dataBranch?.value} />
      </div>
      <div className="footer__transaction--history">
        <HighValueCustomers branchId={dataBranch?.value} />
      </div>
    </div>
  );
}

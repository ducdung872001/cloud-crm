import React, { useContext } from "react";
import TopLoyalCustomers from "./partials/TopLoyalCustomers";
import QuantityLoyaltyPoints from "./partials/QuantityLoyaltyPoints";
import QuantityCustomerGroup from "./partials/QuantityCustomerGroup";
import QuantityCustomerSource from "./partials/QuantityCustomerSource";
import { ContextType, UserContext } from "contexts/userContext";
import "./index.scss";

export default function Other() {
  const { dataBranch } = useContext(UserContext) as ContextType;

  return (
    <div className="page__other">
      <div className="header__other">
        <TopLoyalCustomers branchId={dataBranch?.value} />
        <QuantityLoyaltyPoints branchId={dataBranch?.value} />
      </div>
      <div className="footer__other">
        <QuantityCustomerGroup branchId={dataBranch?.value} />
        <QuantityCustomerSource branchId={dataBranch?.value} />
      </div>
    </div>
  );
}

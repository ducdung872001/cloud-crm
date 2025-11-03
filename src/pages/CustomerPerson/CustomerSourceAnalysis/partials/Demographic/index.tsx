import React, { useContext } from "react";
import QuantityByAge from "./partials/QuantityByAge";
import AccordingGenderCustomer from "./partials/AccordingGenderCustomer";
import AccordingCustomerOccupation from "./partials/AccordingCustomerOccupation";
import AccordingBehaviInteres from "./partials/AccordingBehaviInteres";
import AccordingProvincialDistribution from "./partials/AccordingProvincialDistribution";
import AccordingBasicInformation from "./partials/AccordingBasicInformation";
import { ContextType, UserContext } from "contexts/userContext";
import "./index.scss";

export default function Demographic() {
  const { dataBranch } = useContext(UserContext) as ContextType;

  return (
    <div className="page__demo--graphic">
      <div className="header__demo--graphic">
        <QuantityByAge branchId={dataBranch?.value} />
      </div>
      <div className="body__demo--graphic">
        <div className="__top--graphic">
          <AccordingGenderCustomer branchId={dataBranch?.value} />
          <AccordingCustomerOccupation branchId={dataBranch?.value} />
        </div>
        <div className="__bottom--graphic">
          <AccordingBehaviInteres branchId={dataBranch?.value} />
          <AccordingProvincialDistribution branchId={dataBranch?.value} />
        </div>
      </div>
      <div className="footer__demo--graphic">
        <AccordingBasicInformation branchId={dataBranch?.value} />
      </div>
    </div>
  );
}

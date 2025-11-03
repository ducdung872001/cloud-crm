import React, { useContext } from "react";
import QuantityInteractionFrequency from "./partials/QuantityInteractionFrequency";
import QuantityNonInteractionDay from "./partials/QuantityNonInteractionDay";
import HighlyEngagedCustomers from "./partials/HighlyEngagedCustomers";
import InteractedAcrossChannels from "./partials/InteractedAcrossChannels";
import CampaignAffiliatedCustomers from "./partials/CampaignAffiliatedCustomers";
import BuyingPotential from "./partials/BuyingPotential";
import { ContextType, UserContext } from "contexts/userContext";
import "./index.scss";

export default function BehaviorOrInterests() {
  const { dataBranch } = useContext(UserContext) as ContextType;

  return (
    <div className="page__behavior__interests">
      <div className="__header">
        <HighlyEngagedCustomers branchId={dataBranch?.value} />
      </div>
      <div className="__body">
        <QuantityInteractionFrequency branchId={dataBranch?.value} />
        <QuantityNonInteractionDay branchId={dataBranch?.value} />
      </div>
      <div className="__footer">
        <InteractedAcrossChannels branchId={dataBranch?.value} />
        <CampaignAffiliatedCustomers branchId={dataBranch?.value} />
      </div>
      <BuyingPotential branchId={dataBranch?.value} />
    </div>
  );
}

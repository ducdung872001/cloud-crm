import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";

import "./TippyCustomerInfo.scss";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import CampaignService from "services/CampaignService";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import ShowCampaignListModal from "./ShowCampaignListModal";

export default function TippyCustomerInfo(props: any) {
  const { detailCustomer } = props;

  const [valueShowPhone, setValueShowPhone] = useState(null);
  const [valueShowEmail, setValueShowEmail] = useState(null);

  const handShowPhone = async (id: number) => {
    const response = await CustomerService.viewPhone(id);
    if (response.code == 0) {
      const result = response.result;
      setValueShowPhone(result);
    } else if (response.code == 400) {
      // showToast("Bạn không có quyền xem số điện thoại !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  const handShowEmail = async (id: number) => {
    const response = await CustomerService.viewEmail(id);
    if (response.code == 0) {
      const result = response.result;
      setValueShowEmail(result);
    } else if (response.code == 400) {
      // showToast("Bạn không có quyền xem email!", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  const [quantityCampaign, setQuantityCampaign] = useState(null);
  const [campaignList, setCampaignList] = useState([]);
  const handShowQuantityCampaign = async (id: number) => {
    const params = {
      customerId: id,
    };
    const response = await CampaignOpportunityService.list(params);
    if (response.code == 0) {
      const result = response.result;
      setQuantityCampaign(result?.total);
      setCampaignList(result?.items);
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem số điện thoại !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  useEffect(() => {
    if (detailCustomer.customerId) {
      handShowPhone(detailCustomer.customerId);
      handShowEmail(detailCustomer.customerId);
      handShowQuantityCampaign(detailCustomer.customerId);
    }
  }, [detailCustomer.customerId]);

  const [showModalCampaignList, setShowModalCampaignList] = useState(false);

  return (
    <div className="tippy_customer_info">
      <span style={{ fontSize: 14, fontWeight: "600" }}>{detailCustomer.customerName}</span>
      <div style={{ display: "flex" }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: "400" }}>Số điện thoại: {valueShowPhone || detailCustomer.customerPhone}</span>
        </div>
      </div>
      {valueShowEmail && (
        <div>
          <span style={{ fontSize: 12, fontWeight: "400" }}>Email: {valueShowEmail || detailCustomer.customerEmail}</span>
        </div>
      )}
      {detailCustomer.sourceName ? (
        <div>
          <span style={{ fontSize: 12, fontWeight: "400" }}>Nguồn: {detailCustomer.sourceName}</span>
        </div>
      ) : null}
      <div>
        <span style={{ fontSize: 12, fontWeight: "400" }}>Xác suất thành công: {detailCustomer.percent || 0}%</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: "400" }}>Đã có trong {quantityCampaign || 0} chiến dịch</span>
        </div>
        <Tippy content={<span style={{ fontSize: 12, color: "#1c8cff" }}>Danh sách chiến dịch</span>}>
          <div className="icon_view_all" onClick={() => setShowModalCampaignList(true)}>
            <Icon
              name="ViewAll"
              // style={{ width: 14, height: 14,  fill: '#fff', cursor: 'pointer'}}
            />
          </div>
        </Tippy>
      </div>
      <ShowCampaignListModal onShow={showModalCampaignList} campaignList={campaignList} onHide={() => setShowModalCampaignList(false)} />
    </div>
  );
}

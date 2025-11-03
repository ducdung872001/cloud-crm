import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";

import "./TippyInvoiceInfo.scss";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import CampaignService from "services/CampaignService";
import CampaignOpportunityService from "services/CampaignOpportunityService";

export default function TippyInvoiceInfo(props: any) {
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

  useEffect(() => {
    if (detailCustomer.customerId) {
      handShowPhone(detailCustomer.customerId);
      handShowEmail(detailCustomer.customerId);
    }
  }, [detailCustomer.customerId]);



  return (
    <div className="tippy_customer_info">
        <span style={{fontSize: 14, fontWeight:'600'}}>{detailCustomer.customerName}</span>
        <div style={{display:'flex',}}>
            <div>
                <span style={{fontSize: 12, fontWeight:'400'}}>Số điện thoại: {valueShowPhone || detailCustomer.customerPhone}</span>
            </div>
        </div>

        {detailCustomer.customerEmail &&
          <div>
              <span style={{fontSize: 12, fontWeight:'400'}}>Email: {valueShowEmail || detailCustomer.customerEmail}</span>
          </div>
        }
{/*        
        <div>
            <span style={{fontSize: 12, fontWeight:'400'}}>Xác suất thành công: {detailCustomer.percent || 0}%</span>
        </div> */}
       
    </div>
  );
}

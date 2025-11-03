import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import CustomerList from "./partials/ListCustomer";
import CallHistory from "./partials/CallHistory";
import Button from "components/button/button";
import "./CallCenterList.scss";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";
import ReportStatistic from "./partials/ReportStatistic/ReportStatistic";

export default function CallCenterList() {
  document.title = "Tổng đài";

  const [tab, setTab] = useState({ name: "tab_one", namePagination: "Khách hàng", status: null });
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);

  const listTabs = [
    {
      name: "Khách hàng",
      is_active: "tab_one",
      status: null,
    },
    {
      name: "Tất cả cuộc gọi",
      is_active: "tab_two",
      status: null,
    },
    {
      name: "Gọi đi",
      is_active: "tab_three",
      status: 1,
    },
    {
      name: "Gọi đến",
      is_active: "tab_four",
      status: 2,
    },
    {
      name: "Gọi đi lỡ",
      is_active: "tab_five",
      status: 3,
    },
    {
      name: "Gọi đến lỡ",
      is_active: "tab_six",
      status: 4,
    },
    {
      name: "Báo cáo thống kê",
      is_active: "tab_seven",
      status: null,
    },
  ];  

  return (
    <div className={`page-content page__call--center`}>
      <TitleAction title="Tổng đài" />
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              {listTabs.map((item, idx) => (
                <li
                  key={idx}
                  className={item.is_active == tab.name ? "active" : ""}
                  onClick={(e) => {
                    e && e.preventDefault();
                    setTab({ ...tab, name: item.is_active, status: item.status, namePagination: item.name });
                  }}
                >
                  {item.name}
                </li>
              ))}
            </ul>
            <div className="button-add-customer">
                <Button 
                  type="button"  
                  onClick={() => setShowModalAdd(true)}
                >
                  Tạo mới khách hàng 
                </Button>
            </div>
          </div>
        </div>

        {tab.name == "tab_one" 
          ? <CustomerList tab={tab} reload = {reload} setReload={setReload}/> 
            : tab.name == "tab_seven" ? <ReportStatistic/>
              : <CallHistory tab={tab} 
        />}
      </div>

      <AddCustomerPersonModal
        onShow={showModalAdd}
        onHide={(reload) => {
          if (reload) {
            setReload(reload)
          }
          setShowModalAdd(false)
        }}
      />
    </div>
  );
}

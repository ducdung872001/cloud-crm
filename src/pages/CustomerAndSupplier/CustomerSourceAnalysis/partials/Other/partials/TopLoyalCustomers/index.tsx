import React, { useState } from "react";

export default function TopLoyalCustomers(props) {
  const { branchId } = props;

  const fakeDataLoyalCustomer = [
    {
      id: 1,
      name: "Lê Văn A",
      point: 90,
    },
    {
      id: 2,
      name: "Nguyễn Văn B",
      point: 75,
    },
    {
      id: 3,
      name: "Hoàng Thị X",
      point: 70,
    },
    {
      id: 4,
      name: "Nguyễn Hoàng A",
      point: 65,
    },
    {
      id: 5,
      name: "Trần Kim A",
      point: 55,
    },
  ];

  const [lstCustomerLoyal, setLstCustomerLoyal] = useState(fakeDataLoyalCustomer);

  return (
    <div className="page__toployal--customer">
      <div className="title__common d-flex align-items-start justify-content-between">
        <h2 className="name-common">Top 05 khách hàng trung thành</h2>
      </div>

      <div className="lst__toployal--customer">
        {lstCustomerLoyal.map((item, idx) => {
          return (
            <div key={idx} className={`item__toployal--customer ${idx % 2 === 0 ? "customer__even" : "customer__odd"}`}>
              <div className="name__customer">
                <span className="stt">{idx + 1}</span>
                <span className="name">{item.name}</span>
              </div>
              <div className="point__customer">{item.point} điểm</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { Fragment } from "react";
import Icon from "components/icon";
import Input from "components/input/input";
import Fancybox from "components/fancybox/fancybox";
import ThirdGender from "assets/images/third-gender.png";
import { IInfoCustomerTicketProps } from "model/ticket/PropsModel";
import "./InfoCustomerTicket.scss";

export default function InfoCustomerTicket(props: IInfoCustomerTicketProps) {
  const { data } = props;

  return (
    <Fragment>
      <div className="info-left">
        <span className="avatar-person">
          <img src={data.customerAvatar ? data.customerAvatar : ThirdGender} alt={data.customerName} />
        </span>
        <div className="detail-info">
          <span className="name">{data.customerName}</span>
          <span className="phone">
            <Icon name="Telephone" />
            {data.customerPhone}
          </span>
        </div>
      </div>
      <div className="info-right">
        <div className="info-customer-item">
          <div className="show-service">
            <Input label="Mã phiếu" defaultValue={data.code} disabled={true} fill={true} iconPosition="left" icon={<Icon name="Copy" />} />
          </div>
          <div className="show-reason">
            <Input label="Nhân viên tiếp nhận ban đầu" defaultValue={data.creatorName} disabled={true} fill={true} />
          </div>
          <Fancybox>
            <div className="show-image">
              {data && data?.docLink?.length > 0
                ? JSON.parse(data.docLink).map((item, idx) => {
                    return (
                      <div key={idx} className="image-item">
                        <a data-fancybox="gallery" href={item.url}>
                          <img src={item.url} alt="" />
                        </a>
                      </div>
                    );
                  })
                : ""}
            </div>
          </Fancybox>
        </div>
      </div>
    </Fragment>
  );
}

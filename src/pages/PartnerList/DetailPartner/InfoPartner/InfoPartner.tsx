import React, { Fragment, useState, useEffect, useMemo } from "react";
import parser from "html-react-parser";
import { IInfoPersonProps } from "model/customer/PropsModel";
import ThirdGender from "assets/images/third-gender.png";
import Icon from "components/icon";
import { useWindowDimensions } from "utils/hookCustom";
import "./InfoPartner.scss";
import Tippy from "@tippyjs/react";

export default function InfoPartner(props: any) {
  const { data } = props;

  const { width } = useWindowDimensions();

  return (
    <Fragment>
      <div className="info-partner-left">
        <span className="avatar-person">
          <img src={data.avatar || ThirdGender} alt={data.name} />
        </span>
        <div className="detail-info">
          <span className="name">{data.name}</span>
          <span className="phone">
            <Icon name="Telephone" />
            {data.phoneUnmasked || data.phoneMasked}
          </span>
          <span className="person">
            <Icon name="Person" />
            <span style={{marginRight: 5}}>{data.contactName}</span>
          </span>
        </div>
      </div>
      {/* <div className="info-partner-right">
        <div className="person-charge vertical-tiles">
          <label className="title">Người đại diện</label>
          {data?.contactName ? (
            <div className="info-person-charge">
              <div className="avatar-person-charge">
                <img src={data.employeeAvatar ? data.employeeAvatar : ThirdGender} alt={data.employeeName} />
              </div>
              <div className="detail-person-charge">
                <span className="name">{data.contactName}</span>
              </div>
            </div>
          ) : (
            <div className="undefined__employee">
              <span>Chưa chỉ định</span>
              <span>Người đại diện</span>
            </div>
          )}
        </div>
        <div className="interactive vertical-tiles">
          <label className="title">Tương tác</label>
          <span>
            {data.contactCount || 0} <span style={{ fontSize: "12px" }}>Lần</span>
          </span>
        </div>
      </div> */}
    </Fragment>
  );
}

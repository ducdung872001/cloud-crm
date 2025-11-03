import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import { formatCurrency } from "reborn-util";
import "./ReportOverview.scss";

function ReportOverview(props: any) {
  const { onShow } = props;

  const data = [
    {
        label: 'Tổng khách hàng',
        value: 20000
    },
    {
        label: 'Tổng cuộc gọi',
        value: 13000
    },
    {
        label: 'Cuộc gọi đi thành công',
        value: 11000
    },
    {
        label: 'Cuộc gọi đi thất bại',
        value: 2000
    },
    {
        label: 'Cuộc gọi đến thành công',
        value: 2000
    },
    {
        label: 'Cuộc gọi đến lỡ',
        value: 1000
    },
    {
        label: 'Thời gian trung bình bắt máy',
        value: '30 giây'
    },
    {
        label: 'Thời gian trung bình đàm thoại',
        value: '1 phút 20 giây'
    },
  ]

  return (
        <div className="card-box box__item report-overview">
            <div className="title d-flex align-items-start justify-content-between">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{fontSize: 18, fontWeight:'600'}}>Báo cáo tổng quan</span>
              </div>
            </div>
            <div className="list-report">
                {data && data.map((item, index) => (
                    <div key={index} className="item-report">
                        <div className="title-report">
                            <span style={{fontSize: 14, fontWeight:'500'}}>{item.label}</span>
                        </div>
                        <div className="content-report">
                            <span style={{fontSize: 14, fontWeight:'400'}}>{ typeof(item.value) === 'string' ? item.value : formatCurrency(item.value || 0, ',', '')}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
  );
}

export default memo(ReportOverview);

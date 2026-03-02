import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _ from "lodash";
import TitleAction from "components/titleAction/titleAction";
import "./MultiChannelSales.scss";
import Overview from "./Overview/Overview";
import MultiChannelOrders from "./MultiChannelOrders/MultiChannelOrders";

export default function MultiChannelSales() {
  document.title = "Bán hàng đa kênh";

  const [tab, setTab] = useState(1);

  const tabList = [
    {
        lable: 'Tổng quan',
        value: 1,
        des: "Quản lý tất cả kênh bán hàng tại một nơi"
    },
    {
        lable: 'Đơn hàng đa kênh',
        value: 2,
        des: "Tổng hợp đơn từ tất cả kênh bán hàng"
    },
    {
        lable: 'Kênh kết nối',
        value: 3,
        des: "Quản lý các sàn TMĐT và mạng xã hội được tích hợp"
    },
    {
        lable: 'Website bán hàng',
        value: 4,
        des: "Cửa hàng trực tuyến của bạn"
    },
    {
        lable: 'Cấu hình',
        value: 5,
        des: "Thiết lập đồng bộ tồn kho, giá và đơn hàng"
    },
  ]

  const overviewList = [
    {
        id: 1,
        lable: 'Doanh thu hôm nay',
        value: '100.3M',
        des: "+12.4% so với hôm qua",
        color: 'red',
    },
    {
        id: 2,
        lable: 'Tổng đơn hàng',
        value: '194',
        des: "+8 đơn so với hôm qua",
        color: 'blue',
    },
    {
        id: 3,
        lable: 'Kênh đang hoạt động',
        value: '5/6',
        des: "1 kênh đang chờ kết nối",
        color: 'green'
    },
    {
        id: 4,
        lable: 'Đơn chờ xử lý',
        value: '23',
        des: "Cần xử lý ngay",
        color: 'orange'
    },
  ]

  const dataApp = [
    {
        id: 1,
        lable: 'Shopee',
        content: '72 đơn · Đồng bộ lần cuối 5 phút trước',
        value: '18.3M',
        color: '#FF3300',
        percent: 100
    },
    {
        id: 2,
        lable: 'Lazada',
        content: '49 đơn · Đồng bộ lần cuối 12 phút trước',
        value: '12.3M',
        color: '#0033CC',
        percent: 80
    },

    {
        id: 3,
        lable: 'Facebook Shop',
        content: '22 đơn · Đồng bộ lần cuối 3 phút trước',
        value: '8.8M',
        color: '#3366FF',
        percent: 50
    },
    {
        id: 4,
        lable: 'Website bán hàng',
        content: '11 đơn · Trực tiếp',
        value: '4.0M',
        color: '#999999',
        percent: 30
    },
  ]

  return (
    <div className={`page-content page-multi-channel-sale`}>
        <div style={{display:'flex'}}>
            <div className="container-tab-list">
                {tabList.map((item, index) => (
                    <div 
                        key={index} 
                        className={item.value === tab ? "item-tab item-tab--active" : "item-tab item-tab--inactive"}
                        onClick={() => {
                            setTab(item.value);
                        }}
                    >
                        <span style={{fontSize: 14, fontWeight: '700'}}>{item.lable}</span>
                    </div>
                ))}
                
            </div>
        </div>
        
        {tab === 1 && <Overview/>}
        {tab === 2 && <MultiChannelOrders/>}
    
    </div>
  );
}

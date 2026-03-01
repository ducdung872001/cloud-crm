import React, { useState } from "react";
import _ from "lodash";
import "./Overview.scss";
import ModalAddChannel from "./ModalAddChannel/ModalAddChannel";

export default function Overview() {
  document.title = "Bán hàng đa kênh";

  const [modalConnect, setModalConnect] = useState(false);  

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
        logo: 'SPE',
        content: '72 đơn · Đồng bộ lần cuối 5 phút trước',
        value: '18.3M',
        color: '#FF3300',
        percent: 100,
        backgroundLogo: '#FF6633'
    },
    {
        id: 2,
        lable: 'Lazada',
        content: '49 đơn · Đồng bộ lần cuối 12 phút trước',
        value: '12.3M',
        color: '#0033CC',
        percent: 80,
        backgroundLogo: '#FF3333',
        logo: 'LZD',
    },

    {
        id: 3,
        lable: 'Facebook Shop',
        content: '22 đơn · Đồng bộ lần cuối 3 phút trước',
        value: '8.8M',
        color: '#3366FF',
        percent: 50,
        backgroundLogo: '#3366FF',
        logo: 'FB',
    },
    {
        id: 4,
        lable: 'Website bán hàng',
        content: '11 đơn · Trực tiếp',
        value: '4.0M',
        color: '#999999',
        percent: 30,
        backgroundLogo: 'black',
        logo: 'WEB',
    },
  ]

  return (
    <div className="overview-page">
        <div className="conatiner-header">
            <div>
                <span style={{fontSize: 24, fontWeight: '700', color: 'var(--text-primary-color)'}}>Bán hàng đa kênh</span>
                <div>
                    <span style={{fontSize: 16, fontWeight: '500', color: '#939394', fontFamily: 'none'}}>Quản lý tất cả kênh bán hàng tại một nơi</span>
                </div>
            </div>

            <div className="conatiner-button">
                <div className="button-export">
                    <span style={{fontSize: 14, fontWeight: '500'}}>Xuất báo cáo</span>
                </div>
                <div className="button-connect" onClick={() => setModalConnect(true)}>
                    <span style={{fontSize: 14, fontWeight: '500'}}>Kết nối kênh mới</span>
                </div>
            </div>
        </div>

        <div className="list-overview-report">
            {overviewList.map((item, index) => (
                <div 
                    key={index} 
                    className="item-overview"
                    style={{borderTop: '5px solid', borderTopColor: item.color}}
                >
                    <div>
                        <span style={{fontSize: 16, fontWeight: '700', color: '#939394'}}>{item.lable}</span>
                    </div>
                    <div>
                        <span style={{fontSize: 24, fontWeight: '600'}}>{item.value}</span>
                    </div>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '600', color: item.id === 1 || item.id === 2 ? 'green' : item.id ===  3 ? 'var(--extra-color-50)' : 'red'}}>{item.des}</span>
                    </div>
                </div>
            ))}
        </div>

        <div className="table-result-app">
            <div className="table-header">
                <span style={{fontSize: 16, fontWeight: '700'}}>Hiệu quả từng kênh hôm nay</span>

                <div className="button-export">
                    <span style={{fontSize: 14, fontWeight: '500'}}>Xuất tất cả đơn</span>
                </div>
            </div>

            <div className="table-body">
                {dataApp.map((item, index) => (
                    <div key={index} className='line-body'>
                        <div style={{display: 'flex', gap: '0 1.5rem', alignItems: 'center'}}>
                            <div className="avatar" style={{backgroundColor: item.backgroundLogo}}>
                                <span style={{fontSize: 14, fontWeight: '700', color: 'white'}}>{item.logo}</span>
                            </div>
                            <div>
                                <span style={{fontSize: 14, fontWeight: '700'}}>{item.lable}</span>
                                <div>
                                    <span style={{fontSize: 12, fontWeight: '500', color: 'var(--extra-color-50)'}}>{item.content}</span>
                                </div>
                            </div>
                        </div>

                        <div className="box-rate">
                            <div className="line-load">
                                <div 
                                    style={{
                                        width: `${item.percent}%`, 
                                        borderRadius: '2rem',
                                        height: '0.5rem',
                                        backgroundColor: item.color
                                    }}/>
                            </div>
                            <span style={{fontSize: 14, fontWeight: '700'}}>{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <ModalAddChannel
            onShow={modalConnect}
            onHide={() => setModalConnect(false)}
        />
    </div>
  );
}

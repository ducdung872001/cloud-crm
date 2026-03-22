import React, { useState } from "react";
import _ from "lodash";
import "./ConnectionChannel.scss";
import ModalAddChannel from "../Overview/ModalAddChannel/ModalAddChannel";

export default function ConnectionChannel() {
  document.title = "Đơn hàng đa kênh";

  const [modalConnect, setModalConnect] = useState(false);  
  const [listChannel, setListChannel] = useState([
    {
        logo: 'SPE',
        color: '#FF3300',
        lable: 'Shopee',
        des: 'Chưa kết nối · Kết nối để bán hàng trên Shopee',
        order: '',
        benifit: '',
        rate: '',
        time: '',
        active: 0
    },
    {
        logo: 'LZD',
        color: '#0033CC',
        lable: 'Lazada',
        des: 'lazada.vn/shop/posme · 892 sản phẩm sync',
        order: 49,
        benifit: '12.5M',
        rate: '4.6★',
        time: '12 phút trước',
        active: 1
    },
    {
        logo: 'TKI',
        lable: 'Tiki',
        color: '#0099FF',
        des: 'Chưa kết nối · Kết nối để bán hàng trên Tiki',
        order: '',
        benifit: '',
        rate: '',
        time: '',
        active: 0
    },
    {
        logo: 'FB',
        color: '#3366FF',
        lable: 'Facebook Shop',
        des: 'Chưa kết nối · Kết nối để bán hàng trên Facebook Shop',
        order: '',
        benifit: '',
        rate: '',
        time: '',
        active: 0
    },
    {
        logo: 'ZLO',
        color: '#3366FF',
        lable: 'Zalo OA',
        des: 'Chưa kết nối · Kết nối để bán hàng trên Zalo OA',
        order: '',
        benifit: '',
        rate: '',
        time: '',
        active: 0
    },
    {
        logo: 'SĐO',
        color: '#FF3333',
        lable: 'Sendo',
        des: 'Chưa kết nối · Kết nối để bán hàng trên Sendo',
        order: '',
        benifit: '',
        rate: '',
        time: '',
        active: 0
    },
  ]);

  return (
    <div className="connection-channel-page">
        <div className="conatiner-header">
            <div>
                <span style={{fontSize: 24, fontWeight: '700', color: 'var(--text-primary-color)'}}>Kênh kết nối</span>
                <div>
                    <span style={{fontSize: 16, fontWeight: '500', color: '#939394', fontFamily: 'none'}}>Quản lý các sàn TMĐT và mạng xã hội được tích hợp</span>
                </div>
            </div>

            <div className="conatiner-button">
                <div className="button-connect" onClick={() => setModalConnect(true)}>
                    <span style={{fontSize: 14, fontWeight: '500'}}>Thêm kênh mới</span>
                </div>
            </div>
        </div>

        <div className="list-app">
            {listChannel.map((item, index) => (
                <div key={index} className='item-app' style={item.active === 1 ? {borderColor: 'green'} : {}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div className="logo" style={{backgroundColor: item.color}}>
                            <span style={{fontSize: 14, fontWeight: '700', color: 'white'}}>{item.logo}</span>
                        </div>

                        {item.active ? 
                            <div style={{width: 10, height: 10, backgroundColor: 'green', borderRadius: 50}}/>
                        : null}
                    </div>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '600'}}>{item.lable}</span>
                    </div>
                    <div>
                        <span style={{fontSize: 12, fontWeight: '400'}}>{item.des}</span>
                    </div>
                    <div className="report-app">
                        <div className="order">
                            <span style={{fontSize: 20, fontWeight: '700'}}>{item.order || '-'}</span>
                            <div>
                                <span style={{fontSize: 13, fontWeight: '500', color: 'var(--extra-color-30)'}}>Đơn hôm nay</span>
                            </div>
                        </div>

                        <div className="benifit">
                            <span style={{fontSize: 20, fontWeight: '700'}}>{item.benifit || '-'}</span>
                            <div>
                                <span style={{fontSize: 13, fontWeight: '500', color: 'var(--extra-color-30)'}}>Doanh thu</span>
                            </div>
                        </div>

                        <div className="rate">
                            <span style={{fontSize: 20, fontWeight: '700'}}>{item.rate || '-'}</span>
                            <div>
                                <span style={{fontSize: 13, fontWeight: '500', color: 'var(--extra-color-30)'}}>Đánh giá</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer">
                        <div>
                            {item.time ? 
                                <span style={{fontSize: 12}}>Đồng bộ: {item.time}</span>
                                :
                                <span style={{fontSize: 12}}>Chưa kết nối</span>
                            }
                        </div>

                        {item.active === 1 ? 
                            <div className="button-connected">
                                <span style={{fontSize: 12, fontWeight: '500', color: 'white'}}>Đã kết nối</span>
                            </div>
                            :
                            <div className="button-connect" onClick={() => setModalConnect(true)}>
                                <span style={{fontSize: 12, fontWeight: '500', color: 'white'}}>Kết nối</span>
                            </div>
                        }
                    </div>
                </div>
            ))}
        </div>

        <ModalAddChannel
            onShow={modalConnect}
            onHide={() => setModalConnect(false)}
        />

    </div>
  );
}
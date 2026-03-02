import React, { useState } from "react";
import _ from "lodash";
import "./SalesWebsite.scss";
import Input from "@/components/input/input";
import TextArea from "@/components/textarea/textarea";
import ButtonOnOff from "@/components/ButtonOnOff/ButtonOnOff";

export default function SalesWebsite() {
  document.title = "Website bán hàng";

  const [dataInfo, setDataInfo] = useState({
    domain: 'reborn.store',
    storeName: 'Reborn Fashion Store',
    des: 'Cửa hàng thời trang nam nữ chất lượng cao, cập nhật xu hướng mới nhất 2026.',
    shipping_fee: '30.000₫',
    freeship_form: '500.000₫'
  });

  const [infoDisplay, setInfoDisplay] = useState([
    {
        lable: 'Hiển thị số lượng bán',
        des: 'Hiện "Đã bán X" trên trang sản phẩm',
        active: 1
    },
    {
        lable: 'Ẩn sản phẩm hết hàng',
        des: 'Tự động ẩn khi tồn kho = 0',
        active: 1
    },
    {
        lable: 'Hiển thị giá sỉ',
        des: 'Hiện mức giá sỉ cho khách đăng ký',
        active: 1
    },
    {
        lable: 'Danh mục nổi bật',
        des: 'Hiện section danh mục ở trang chủ',
        active: 1
    },
    {
        lable: 'Video cửa hàng',
        des: 'Phát video giới thiệu ở trang chủ',
        active: 0
    },
  ]);

  return (
    <div className="sales-website-page">
        <div className="conatiner-header">
            <div>
                <span style={{fontSize: 24, fontWeight: '700', color: 'var(--text-primary-color)'}}>Website bán hàng</span>
                <div>
                    <span style={{fontSize: 16, fontWeight: '500', color: '#939394', fontFamily: 'none'}}>Cửa hàng trực tuyến của bạn</span>
                </div>
            </div>

            <div className="conatiner-button">
                <div className="button-export">
                    <span style={{fontSize: 14, fontWeight: '500'}}>Xem Website</span>
                </div>
                <div className="button-connect">
                    <span style={{fontSize: 14, fontWeight: '500'}}>Lưu cài đặt</span>
                </div>
            </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem'}}>
            <div className="info-web">
                <span style={{fontSize: 14, fontWeight: '700'}}>Tên miền & Cửa hàng</span>

                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div className="input-group" style={{width: '49%'}}>
                        <Input
                            label="Tên miền chính"
                            name=""
                            fill={true}
                            required={false}
                            value={dataInfo?.domain}
                            placeholder=""
                            onChange={(e) => {
                                const value = e.target.value;
                                setDataInfo({ ...dataInfo, domain: value });
                            }}
                        />
                    </div>

                    <div className="input-group" style={{width: '49%'}}>
                        <Input
                            label="Tên cửa hàng"
                            name=""
                            fill={true}
                            required={false}
                            value={dataInfo?.storeName}
                            placeholder=""
                            onChange={(e) => {
                                const value = e.target.value;
                                setDataInfo({ ...dataInfo, storeName: value });
                            }}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <TextArea
                    label="Mô tả cửa hàng"
                    name="note"
                    value={dataInfo?.des}
                    fill={true}
                    onChange={(e) => {
                        const value = e.target.value;
                        setDataInfo({ ...dataInfo, des: value });
                    }}
                    placeholder="Nhập mô tả"
                    />
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div className="input-group" style={{width: '49%'}}>
                        <Input
                            label="Phí vận chuyển mặc định"
                            name=""
                            fill={true}
                            required={false}
                            value={dataInfo?.shipping_fee}
                            placeholder=""
                            onChange={(e) => {
                                const value = e.target.value;
                                setDataInfo({ ...dataInfo, shipping_fee: value });
                            }}
                        />
                    </div>

                    <div className="input-group" style={{width: '49%'}}>
                        <Input
                            label="Đơn miễn phí ship từ"
                            name=""
                            fill={true}
                            required={false}
                            value={dataInfo?.freeship_form}
                            placeholder=""
                            onChange={(e) => {
                                const value = e.target.value;
                                setDataInfo({ ...dataInfo, freeship_form: value });
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="status-web">
                <span style={{fontSize: 14, fontWeight: '700'}}>Trạng thái website</span>

                <div className="box-status">
                    <div className="dot-active"/>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '600', color: 'green'}}>Website đang hoạt động</span>
                        <div>
                            <span  style={{fontSize: 12, fontWeight: '600'}}>posme.store · Uptime 99.9%</span>
                        </div>
                    </div>
                </div>

                <div style={{padding: '1rem 0', display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid'}}>
                    <span style={{fontSize: 14, fontWeight: '400'}}>Lượt truy cập hôm nay</span>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '500'}}>1.234</span>
                    </div>
                </div>
                <div style={{padding: '1rem 0', display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid'}}>
                    <span style={{fontSize: 14, fontWeight: '400'}}>Tỷ lệ chuyển đổi</span>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '500', color: 'green'}}>2.8%</span>
                    </div>
                </div>
                <div style={{padding: '1rem 0', display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid'}}>
                    <span style={{fontSize: 14, fontWeight: '400'}}>Hết hạn SSL</span>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '500'}}>28/02/2027</span>
                    </div>
                </div>
                <div style={{padding: '1rem 0', display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontSize: 14, fontWeight: '400'}}>Tên miền hết hạn</span>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '500'}}>15/06/2026</span>
                    </div>
                </div>
            </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem', alignItems: 'flex-start'}}>
            <div className="info-display">
                <span style={{fontSize: 14, fontWeight: '700'}}>Giao diện & Trình bày</span>

                <div>
                    {infoDisplay.map((item, index) => (
                        <div key={index} className="item-display">
                            <div>
                                <span style={{fontSize: 14, fontWeight: '600'}}>{item.lable}</span>
                                <div>
                                    <span style={{fontSize: 12, fontWeight: '400', color: '#939394'}}>{item.des}</span>
                                </div>
                            </div>

                            <div>
                                <ButtonOnOff
                                    checked={item.active === 1 ? true : false}
                                    onChange={value => {
                                    if (value) {
                                        setInfoDisplay((current) =>
                                            current.map((obj, idx) => {
                                            if (index === idx) {
                                                return { ...obj, active: 1 };
                                            }
                                            return obj;
                                            })
                                        );
                                    } else {
                                        setInfoDisplay((current) =>
                                            current.map((obj, idx) => {
                                            if (index === idx) {
                                                return { ...obj, active: 0 };
                                            }
                                            return obj;
                                            })
                                        );
                                    }
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card-store">
                <span style={{fontSize: 14, fontWeight: '700'}}>Danh thiếp cửa hàng</span>

                <div className="card">
                    <div>
                        <span style={{fontSize: 20, fontWeight: '600', color: 'white'}}>Reborn Fashion Store</span>
                    </div>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '500', color: 'white'}}>reborn.store</span>
                    </div>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '500', color: 'white'}}>23 Nguyễn Huệ, Q.1, TP.HCM</span>
                    </div>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '500', color: 'white'}}>0901 234 567</span>
                    </div>
                </div>
            </div>
        </div>

    </div>
  );
}

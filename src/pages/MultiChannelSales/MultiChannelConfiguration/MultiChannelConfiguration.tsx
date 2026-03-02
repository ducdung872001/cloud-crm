import React, { useState } from "react";
import _ from "lodash";
import "./MultiChannelConfiguration.scss";
import ButtonOnOff from "@/components/ButtonOnOff/ButtonOnOff";
import SelectCustom from "@/components/selectCustom/selectCustom";
import Input from "@/components/input/input";
import Icon from "@/components/icon";

export default function MultiChannelConfiguration() {
  document.title = "Cấu hình đa kênh";

  const [inventory, setInventory] = useState([
    {
        lable: 'Tự động đồng bộ tồn kho',
        des: 'Cập nhật tồn kho tất cả kênh khi có thay đổi',
        active: 1
    },
    {
        lable: 'Đồng bộ theo thời gian thực',
        des: 'Cập nhật ngay khi bán được hàng',
        active: 1
    },
    {
        lable: 'Cảnh báo hàng sắp hết',
        des: 'Thông báo khi tồn kho < 5 sản phẩm',
        active: 1
    },
  ]);

  const [minute, setMinute] = useState({value: 5, label: '5 phút'});

  const [dataPrice, setDataPrice] = useState([
    {
        lable: 'Đồng bộ giá tất cả kênh',
        des: 'Tất cả kênh dùng cùng một bảng giá',
        active: 0
    },
    {
        lable: 'Giá riêng theo sàn',
        des: 'Cho phép đặt giá khác nhau mỗi kênh',
        active: 1
    },
    {
        lable: 'Hiển thị giá khuyến mãi',
        des: 'Đồng bộ chương trình KM lên các sàn',
        active: 1
    },
    {
        lable: 'Giá liên hệ',
        des: 'Ẩn giá, hiện "Liên hệ để biết giá"',
        active: 0
    }
  ]);

  return (
    <div className="multi-channel-configuration-page">
        <div className="conatiner-header">
            <div>
                <span style={{fontSize: 24, fontWeight: '700', color: 'var(--text-primary-color)'}}>Cấu hình đa kênh</span>
                <div>
                    <span style={{fontSize: 16, fontWeight: '500', color: '#939394', fontFamily: 'none'}}>Thiết lập đồng bộ tồn kho, giá và đơn hàng</span>
                </div>
            </div>
        </div>

        <div style={{display: 'flex', marginTop: '2rem', justifyContent: 'space-between'}}>
            <div className="synchronize-inventory">
                <span style={{fontSize: 14, fontWeight: '700'}}>Đồng bộ tồn kho</span>

                <div>
                    {inventory.map((item, index) => (
                        <div key={index} className="item-inventory">
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
                                        setInventory((current) =>
                                            current.map((obj, idx) => {
                                            if (index === idx) {
                                                return { ...obj, active: 1 };
                                            }
                                            return obj;
                                            })
                                        );
                                    } else {
                                        setInventory((current) =>
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

                    <div style={{marginTop: '1rem'}}>
                        <SelectCustom
                            id=""
                            name=""
                            label="Chu kỳ đồng bộ (phút)"
                            special={true}
                            options={[
                                {
                                    value: 5,
                                    label: '5 phút'
                                },
                                {
                                    value: 15,
                                    label: '15 phút'
                                },
                                {
                                    value: 30,
                                    label: '30 phút'
                                },
                            ]}
                            fill={true}
                            value={minute}
                            required={true}
                            onChange={(e) => setMinute(e)}
                            isAsyncPaginate={false}
                            isFormatOptionLabel={false}
                            placeholder=""
                            additional={{
                                page: 1,
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="synchronize-price">
                <span style={{fontSize: 14, fontWeight: '700'}}>Đồng bộ giá bán</span>

                <div>
                    {dataPrice.map((item, index) => (
                        <div key={index} className="item-price">
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
                                        setDataPrice((current) =>
                                            current.map((obj, idx) => {
                                            if (index === idx) {
                                                return { ...obj, active: 1 };
                                            }
                                            return obj;
                                            })
                                        );
                                    } else {
                                        setDataPrice((current) =>
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
        </div>

        <div className="info-connect">
            <span style={{fontSize: 14, fontWeight: '700'}}>Thông tin kết nối API</span>

            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div className="info-right">
                    <div className="input-group">
                        <Input
                            label="Shopee Partner Key"
                            name=""
                            fill={true}
                            required={false}
                            value={'sk_live_••••••••••••3f9a'}
                            placeholder=""
                            disabled={true}
                            onChange={(e) => {}}
                            iconPosition='right'
                            icon={<Icon name='Copy'/>}
                        />
                    </div>

                    <div className="input-group">
                        <Input
                            label="Tiki Client ID"
                            name=""
                            fill={true}
                            required={false}
                            value={'tiki_••••••••••••7c1d'}
                            placeholder=""
                            disabled={true}
                            onChange={(e) => {}}
                            iconPosition='right'
                            icon={<Icon name='Copy'/>}
                        />
                    </div>
                </div>

                <div className="info-left">
                    <div className="input-group">
                        <Input
                            label="Lazada App Key"
                            name=""
                            fill={true}
                            required={false}
                            value={'lz_app_••••••••••2b8e'}
                            placeholder=""
                            disabled={true}
                            onChange={(e) => {}}
                            iconPosition='right'
                            icon={<Icon name='Copy'/>}
                        />
                    </div>

                    <div className="input-group">
                        <Input
                            label="Facebook Page Token"
                            name=""
                            fill={true}
                            required={false}
                            value={'EAAb••••••••••••••5Xd'}
                            placeholder=""
                            disabled={true}
                            onChange={(e) => {}}
                            iconPosition='right'
                            icon={<Icon name='Copy'/>}
                        />
                    </div>
                </div>
            </div>
        </div>

    </div>
  );
}

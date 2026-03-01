import React, { useEffect, useState } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./ModalAddChannel.scss";
import Input from "@/components/input/input";

export default function ModalAddChannel(props: any) {
  const { onShow, onHide } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  useEffect(() => {
    if (onShow) {
      setIsSubmit(false);
    }
  }, [onShow]);

  const [selectApp, setSelectApp] = useState({
    id: 1,
    lable: 'Shopee',
    logo: 'SPE',
    des: 'Sàn TMĐT #1'
});

  const listApp = [
    {
        id: 1,
        lable: 'Shopee',
        logo: 'SPE',
        des: 'Sàn TMĐT #1',
        backgroundLogo: '#FF6633'
    },
    {
        id: 2,
        lable: 'Sendo',
        logo: 'SĐO',
        des: 'Chưa kết nối',
        backgroundLogo: '#FF3333'
    },
    {
        id: 3,
        lable: 'TikTok Shop',
        logo: 'TTK',
        des: 'Mới nhất 2024',
        backgroundLogo: 'black'
    },
  ]

  const dataStep = [
    {
        step: 1,
        title: 'Đăng nhập tài khoản Seller',
        content: 'Truy cập Seller Center của sàn và đăng nhập bằng tài khoản người bán của bạn.'
    },
    {
        step: 2,
        title: 'Nhập App ID & Secret Key',
        content: 'Nhập App ID & Secret Key'
    },
    {
        step: 3,
        title: 'Xác thực & Uỷ quyền',
        content: 'Nhấn "Kết nối" để POSME yêu cầu quyền truy cập tài khoản của bạn trên sàn.'
    },
  ]

  const onSubmit = async (e) => {
    e.preventDefault();
  };

  const actions: IActionModal = {
    actions_right: {
      buttons: [
        {
          title: "Hủy",
          color: "primary",
          variant: "outline",
          disabled: isSubmit,
          callback: () => onHide(),
        },
        {
          title: "Kết nối ngay",
          type: "submit",
          color: "primary",
          disabled: isSubmit,
          is_loading: isSubmit,
          callback: () => {
            setIsSubmit(true);
          },
        },
      ],
    },
  };



  return (
    <Modal 
        isOpen={onShow} 
        className="modal-connect-channel" 
        isFade={true} 
        staticBackdrop={true} 
        toggle={() => !isSubmit && onHide()} 
        isCentered={true}
    >
      <form className="form-connect" onSubmit={(e) => onSubmit(e)}>
        <ModalHeader title={`Kết nối kênh bán hàng mới`} toggle={() => !isSubmit && onHide()} />
        <ModalBody>
          <div>
            <span style={{fontSize: 16, fontWeight: '500'}}>Chọn sàn TMĐT hoặc kênh bán hàng bạn muốn kết nối với hệ thống</span>
          </div>

          <div className="list-app">
            {listApp.map((item, index) => (
                <div 
                    key={index} 
                    className="item-app" 
                    style={selectApp.id === item.id ? {borderColor: 'green'} : {}}
                    onClick={() => setSelectApp(item)}
                >
                    <div className="avatar" style={{backgroundColor: item.backgroundLogo}}>
                        <span style={{fontSize: 16, fontWeight: '700', color: 'white'}}>{item.logo}</span>
                    </div>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '700'}}>{item.lable}</span>
                    </div>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '500', color: 'var(--extra-color-30)'}}>{item.des}</span>
                    </div>
                </div>
            ))}
          </div>

          <div className="selected-app">
            <span style={{fontSize: 14, fontWeight: '600', color: 'green' }}>Đã chọn: {selectApp.lable} · Làm theo các bước bên dưới</span>
          </div>

          <div className="list-step">
            {dataStep.map((item, index) => (
                <div key={index} className="item-step">
                    <div className="number">
                        <span style={{fontSize: 14, fontWeight: '600', color: 'white'}}>{item.step}</span>
                    </div>

                    <div className="body">
                        <div>
                            <span style={{fontSize: 16, fontWeight: '600'}}>{item.title}</span>
                        </div>
                        <div>
                            <span style={{fontSize: 12, fontWeight: '400'}}>{item.content}</span>
                        </div>

                        {item.step === 2 ? 
                            <div className="input-id">
                                <div className="input-group">
                                    <Input
                                        label="App ID / Partner ID"
                                        name="id"
                                        fill={true}
                                        required={false}
                                        // value={item.bankName}
                                        placeholder="Nhập App ID"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                    
                                        }}
                                    />
                                </div>
                                <div className="input-group">
                                    <Input
                                        label="Secret Key"
                                        name="key"
                                        fill={true}
                                        required={false}
                                        // value={item.bankName}
                                        placeholder="*********"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                    
                                        }}
                                    />
                                </div>
                            </div>
                        : null}
                    </div>
                </div>
            ))}
            
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </form>
    </Modal>
  );
}

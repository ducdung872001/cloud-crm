import React, {Fragment, useState, useEffect, useCallback, useMemo, memo} from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./ModalConfirm.scss";

import Icon from "components/icon";


const style_fontSize_fontWeight_color: React.CSSProperties = { fontSize: 20, fontWeight: '600', color: '#ED1B34' };
const style_fontSize_fontWeight_color_1: React.CSSProperties = { fontSize: 14, fontWeight: '400', color: '#2C2C2C' };
const style_fontSize_fontWeight: React.CSSProperties = { fontSize: 14, fontWeight: '500' };
function ModalConfirm(props: { onShow: boolean; onHide: (value: boolean) => void; title: string; content: string; onSubmit: () => void; isSubmit?: boolean }) {
  const { onShow, onHide, title, content, onSubmit, isSubmit} = props;


  const handClearForm = (acc) => {
    onHide(acc);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-confirm"
        size="sm"
      >
        <form className="form-confirm">
          <ModalBody>
            <div className="container-confirm">
                <div className="box-title">
                    <span style={style_fontSize_fontWeight_color}>Xác nhận {title}</span>
                </div>
                <div className="box-content">
                    <span style={style_fontSize_fontWeight_color_1}>Bạn có chắc chắn muốn {content}?</span>
                </div>
                <div className="box-footer">
                    <div className="button-cancel"
                      onClick={() => {
                          handClearForm(false)
                      }}
                    >
                        <span style={style_fontSize_fontWeight}>Huỷ</span>
                    </div>
                    <div 
                      className="button-accept"
                      onClick={() => {
                        if(!isSubmit){
                          onSubmit();
                        }
                      }}
                    >
                        <span style={style_fontSize_fontWeight}>Tôi chắc chắn</span>
                        {isSubmit ? 
                          <Icon name="Loading" />
                        : null}
                    </div>
                </div>
            </div>
            
          </ModalBody>
        </form>
      </Modal>

    </Fragment>
  );
}

export default memo(ModalConfirm);

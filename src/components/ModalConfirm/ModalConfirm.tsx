import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./ModalConfirm.scss";
import _, { at, get, set } from "lodash";
import Icon from "components/icon";

export default function ModalConfirm(props: any) {
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
                    <span style={{fontSize: 20, fontWeight: '600', color: '#ED1B34'}}>Xác nhận {title}</span>
                </div>
                <div className="box-content">
                    <span style={{fontSize: 14, fontWeight: '400', color: '#2C2C2C'}}>Bạn có chắc chắn muốn {content}?</span>
                </div>
                <div className="box-footer">
                    <div className="button-cancel"
                      onClick={() => {
                          handClearForm(false)
                      }}
                    >
                        <span style={{fontSize: 14, fontWeight: '500'}}>Huỷ</span>
                    </div>
                    <div 
                      className="button-accept"
                      onClick={() => {
                        if(!isSubmit){
                          onSubmit();
                        }
                      }}
                    >
                        <span style={{fontSize: 14, fontWeight: '500'}}>Tôi chắc chắn</span>
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

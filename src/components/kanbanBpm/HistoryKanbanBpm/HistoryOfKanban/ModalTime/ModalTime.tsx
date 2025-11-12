import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./ModalTime.scss";
import moment from "moment";

export default function ModalTime(props: any) {
  const { onShow, data, onHide } = props;  

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() =>  onHide(false)}
        className="modal-time"
      >
        {/* <form className="form-add-campaign" onSubmit={(e) => onSubmit(e)}> */}
          <ModalHeader title={`Thời gian`} toggle={() => onHide(false)} />
          <ModalBody>
            <div className="form-time">
              <div style={{display:'flex', alignItems:'center'}}>
                <div style={{width: '24%'}}>
                  <span style={{fontSize: 14}}>Thời gian chuyển:</span>
                </div>
                <div style={{flex: 1}}>
                  <span style={{fontSize: 14, fontWeight: '600'}}>{data?.transitTime ? moment(data.transitTime).format('DD/MM/YYYY HH:mm') : ''}</span>
                </div>
              </div>

              <div style={{display:'flex', alignItems:'center'}}>
                <div style={{width: '24%'}}>
                  <span style={{fontSize: 14}}>Thời gian tiếp nhận:</span>
                </div>
                <div style={{flex: 1}}>
                  <span style={{fontSize: 14, fontWeight: '600'}}>{data?.receivedTime ? moment(data.receivedTime).format('DD/MM/YYYY HH:mm') : ''}</span>
                </div>
              </div>

              <div style={{display:'flex', alignItems:'center'}}>
                <div style={{width: '24%'}}>
                  <span style={{fontSize: 14}}>Thời gian xử lý:</span>
                </div>
                <div style={{flex: 1}}>
                  <span style={{fontSize: 14, fontWeight: '600'}}>{data?.processedTime ? moment(data.processedTime).format('DD/MM/YYYY HH:mm') : ''}</span>
                </div>
              </div>
            </div>
          </ModalBody>
          {/* <ModalFooter actions={setupStep == 1 ? actions : actionsMethods} /> */}
        {/* </form> */}
      </Modal>
      {/* <Dialog content={contentDialog} isOpen={showDialog} /> */}
    </Fragment>
  );
}

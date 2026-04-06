import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./ModalTime.scss";
import { formatDateTime } from "utils/dateUtils";



const style_display_alignItems: React.CSSProperties = { display:'flex', alignItems:'center' };
const style_fontSize_fontWeight: React.CSSProperties = { fontSize: 14, fontWeight: '600' };
export default function ModalTime(props: { onShow: boolean; data: Record<string, unknown>; onHide: (reload: boolean) => void }) {
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
              <div style={style_display_alignItems}>
                <div style={{width: '24%'}}>
                  <span style={{fontSize: 14}}>Thời gian chuyển:</span>
                </div>
                <div style={{flex: 1}}>
                  <span style={style_fontSize_fontWeight}>{data?.transitTime ? formatDateTime(data.transitTime) : ''}</span>
                </div>
              </div>

              <div style={style_display_alignItems}>
                <div style={{width: '24%'}}>
                  <span style={{fontSize: 14}}>Thời gian tiếp nhận:</span>
                </div>
                <div style={{flex: 1}}>
                  <span style={style_fontSize_fontWeight}>{data?.receivedTime ? formatDateTime(data.receivedTime) : ''}</span>
                </div>
              </div>

              <div style={style_display_alignItems}>
                <div style={{width: '24%'}}>
                  <span style={{fontSize: 14}}>Thời gian xử lý:</span>
                </div>
                <div style={{flex: 1}}>
                  <span style={style_fontSize_fontWeight}>{data?.processedTime ? formatDateTime(data.processedTime) : ''}</span>
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

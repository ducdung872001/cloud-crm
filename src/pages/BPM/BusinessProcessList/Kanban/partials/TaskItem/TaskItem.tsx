import React, { Fragment, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import Icon from "components/icon";
import { ITaskItemProps } from "model/workOrder/PropsModel";
import OtherGenders from "assets/images/third-gender.png";
import "./TaskItem.scss";
import Checkbox from "components/checkbox/checkbox";
import Tippy from "@tippyjs/react";
// import TippyInvoiceInfo from "./partials/TippyInvoiceInfo";
import { formatCurrency } from "reborn-util";
import moment from "moment";

export default function TaskItem(props: any) {
  const { item, 
          index, 
          column,
          callbackHistory,
          callBackAction
        } = props;
  
  return (
    <Fragment>
      <Draggable
        key={item.id}
        draggableId={item.id.toString()}
        isDragDisabled={true}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              userSelect: "none",
              backgroundColor: snapshot.isDragging ? "white" : "white",
              ...provided.draggableProps.style,
            }}
            className="task__item--bpm"
            onDoubleClick={(e) => {
              callbackHistory(item);
              
              // setIdWork(item.id);
              // setShowModalView(true);
            }}
          >
            {/* <Tippy 
              content={<TippyInvoiceInfo detailCustomer={item}/>} 
              delay={[120, 100]} 
              animation="scale" 
            //   interactive={true}
            > */}
              {/* <div className={`task-infomation ${item?.status === 1  ? "disabled__task--item" : ""}`}> */}
              <div className={`task-infomation`}>
                {/* <h4 className="title--job">{item.invoiceResponse?.invoiceCode || ''}</h4> */}
                {/* <Tippy 
                  content={<TippyInvoiceInfo detailCustomer={item}/>} 
                  delay={[120, 100]} 
                  animation="scale" 
                //   interactive={true}
                > */}
                  <div style={{display:'flex', cursor:'pointer'}}>
                    <div style={{}}>
                      <Icon 
                        name="CollectInfo" 
                        style={{ width: 13, top: 0,fill: '#1c8cff', cursor: 'pointer' }} 
                      />
                    </div>
                    <div>
                      <span style={{fontSize: 12, fontWeight:'500', marginLeft: 5}}>{item.processedObject?.name}</span>
                    </div>
                  </div>
                {/* </Tippy> */}

                <div>
                    <span style={{fontSize: 12, fontWeight:'400'}}>Người trình: {item.employeeName}</span>
                </div>
                <div>
                    <span style={{fontSize: 12, fontWeight:'400'}}>Thời gian trình: {item.startTime ? moment(item.startTime).format('DD/MM/YYYY') : ''}</span>
                </div>

                <div>
                    <span style={{fontSize: 12, fontWeight:'400'}}>Trạng thái: </span>
                </div>

                <div style={{display: 'flex', justifyContent:'flex-end', width: '100%'}}>
                  <Tippy content='Xoá'>
                    <div 
                      style={{ cursor: 'pointer'}}
                      onClick={() => {
                        callBackAction(item, 'delete');
                      }}
                    >
                      <Icon 
                        name="Trash" 
                        style={{ width: 15, top: 0, fill: 'var(--error-color)' }} 
                      />
                    </div>
                  </Tippy>
                </div>



              </div>
            {/* </Tippy> */}
          </div>
        )}
      </Draggable>
      {/* <ViewWorkModal
        idWork={idWork}
        onShow={showModalView}
        onHide={(reload) => {
          setShowModalView(false);
        }}
      /> */}
    </Fragment>
  );
}

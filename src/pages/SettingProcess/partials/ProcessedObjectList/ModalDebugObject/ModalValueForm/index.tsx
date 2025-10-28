import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, getPageOffset } from "reborn-util";
import "./index.scss";
import { showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

export default function ModalValueForm({ onShow, onHide, data, dataObject }) {
    console.log('data', data);
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [dataForm, setDataForm] = useState([]);

  const getDataForm= async (potId, nodeId ) => {
      setIsLoading(true);

      const params = {
        potId: potId, 
        nodeId: nodeId
      }

      const response = await BusinessProcessService.listBpmFormData(params);

      if (response.code == 0) {
          const result = response.result;
          setDataForm(result?.items);


      } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setIsLoading(false);
  };

  useEffect(() => {
    if(onShow && dataObject && data ){
        getDataForm(dataObject?.id, data?.nodeId );
    }
      
  }, [onShow, dataObject,])

  const actions = useMemo<IActionModal>(
      () => ({
        actions_right: {
          buttons: [
            {
              title: "Đóng",
              color: "primary",
              variant: "outline",
              callback: () => {
                handleClearForm();
              },
            },
          //   {
          //     title:  "Xác nhận",
          //     // type: "submit",
          //     color: "primary",
          //     disabled: lstAttributeSelected?.length > 0 ? false : true,
          //     // is_loading: isSubmit,
          //     callback: () => {
          //       handleSubmit(lstAttributeSelected)
          //     },
          //   },
          ],
        },
      }),
      []
    );

  const handleClearForm = () => {
    onHide(false);
    // setDataVar({});
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        // size="lg"
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-value-form"
      >
        <form className="form-value-form">
          <ModalHeader title={`Giá trị Form`} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
                {isLoading ? 
                    <Loading/>
                    :

                    (dataForm && dataForm.length > 0 ? 
                        <div style={{maxHeight:'52rem', overflow:'auto', padding: '1.6rem 2rem 1.6rem 2rem'}}>
                            {dataForm.map((item, index) => {
                                const attributeValue = item.attributeValue && JSON.parse(item.attributeValue) || {};
                                return (
                                    <div key={index} className='item-data-form'>
                                        <div>
                                            <span style={{fontSize: 14, fontWeight: '500'}}>Lần {dataForm.length - index}</span>
                                        </div>
                                        <JsonView
                                            src={attributeValue}
                                            // style={{fontSize: 11, fontWeight:'700'}}
                                            // name=''
                                            // enableClipboard={false}
                                            collapsed={false}
                                        />
                                    </div>
                                )
                            })}
                            
                        </div>      
                        : 
                        <div style={{display:'flex', alignItems:'center', justifyContent: 'center', padding: '1.6rem'}}>
                            <span style={{fontSize: 14, fontWeight: '500'}}>Chưa có dữ liệu</span>
                        </div>
                    )
                       
                }   
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

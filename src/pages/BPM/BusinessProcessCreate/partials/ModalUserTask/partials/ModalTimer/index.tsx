import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";
import NummericInput from "components/input/numericInput";
import _ from "lodash";
import BusinessProcessService from "services/BusinessProcessService";
import RadioList from "components/radio/radioList";
import Input from "components/input/input";

export default function ModalTimer(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, dataNode, disable } = props;
  // console.log('dataApproach', dataApproach);
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [type, setType] = useState('0');
  const [validationLink, setValidationLink] = useState("");

  useEffect(() => {
    if(dataNode?.id && onShow){
      getDetailTimer(dataNode?.id);
    }
  }, [dataNode, onShow])

  const getDetailTimer = async (nodeId) => {
    const params = {
      nodeId: nodeId,
    };
    
    const response = await BusinessProcessService.detailUserTask(nodeId);
    if (response.code === 0) {
      const result = response.result;

      setValidationLink(result?.validationLink || "");

      const type = result.type ? result.type.toString() : '0';
      setType(type);

      const configTimer = result.configTimer && JSON.parse(result.configTimer) || ''
      if(configTimer){
        setValueTimer(configTimer)
      } else {
        setValueTimer({...valueTimer});
      }

    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

  };

  const [valueTimer, setValueTimer] = useState({
    day: '',
    hour: '',
    minute: '',
  })     

  const onSubmit = async (e) => {
    e && e.preventDefault();
    setIsSubmit(true);

    const bodyTypeBpm = {
      nodeId: dataNode?.id,
      type: type,
      validationLink: validationLink
    };    
    const resutlResponseType = await BusinessProcessService.updateType(bodyTypeBpm);

    const body = {
      nodeId: dataNode?.id,
      configTimer: JSON.stringify(valueTimer),
    };    
    const resutlResponseTime = await BusinessProcessService.updateTimer(body);

    if (resutlResponseTime.code === 0 && resutlResponseType.code === 0) {
      handClearForm(true);
      showToast(`Cài Eform thành công`, "success");
      setIsSubmit(false);
    } else {
      showToast((resutlResponseTime.message || resutlResponseType.message) ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  // const submitTimer = async (e) => {
  //   e && e.preventDefault();
  //   setIsSubmit(true);

  //   const body = {
  //       nodeId: dataNode?.id,
  //       configTimer: JSON.stringify(valueTimer)
  //   };    
    
  //   const resutlResponseTime = await BusinessProcessService.updateTimer(body);
  //   if (resutlResponseTime.code === 0) {
  //     onHide(true);
  //     // showToast(`Cài Timer thành công`, "success");
  //     setIsSubmit(false);
  //   } else {
  //     showToast((resutlResponseTime.message) ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //     setIsSubmit(false);
  //   }
  // };

  const handClearForm = (acc) => {
    onHide(acc);
    setIsSubmit(false);
    setType('0');
    setValueTimer({
      day: '',
      hour: '',
      minute: '',
    });
    setValidationLink("");    
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Huỷ",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handClearForm(false);
                // _.isEqual(formData.values, valueSetting) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: 'Áp dụng',
            type: "submit",
            color: "primary",
            disabled:
              isSubmit,
              // (!isDifferenceObj(formData.values, valueSetting) || ),
            // _.isEqual(formData.values, valueSetting),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác cài đặt`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);
        handClearForm(false);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-setting-timer"
        // size="lg"
      >
        <form className="form-setting-timer" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt Eform`} toggle={() => !isSubmit && handClearForm(false)} />
          <ModalBody>
            <div className="setting-timer">
              <div className="box_bpm_type">
                {/* <div>
                  <span style={{fontSize: 14, fontWeight: '600'}}>Loại Eform:</span>
                </div> */}
                <div className="bpm_type">
                  <RadioList
                    options={[
                      {
                        value: '3',
                        label: 'Form khởi tạo'
                      },
                      {
                        value: '0',
                        label: 'Form thông thường'
                      },
                      {
                        value: '1',
                        label: 'Form trình duyệt'
                      },
                      {
                        value: '2',
                        label: 'Form phê duyệt tuần tự'
                      },
                      {
                        value: '4',
                        label: 'Form phê duyệt song song'
                      },
                      
                    ]}
                    // className="options-auth"
                    required={false}
                    title="Loại Eform"
                    name="type"
                    value={type}
                    onChange={(e) => {
                      const value = e.target.value;
                      setType(value);
                                              
                    }}
                  />
                </div>
              </div>

              <div style={{marginTop: '1.6rem'}}>
                <Input
                  id="validationLink"
                  name="validationLink"
                  label="Kiểm tra dữ liệu (Link)"
                  fill={true}
                  required={false}
                  placeholder={"https://....."}
                  value={validationLink}
                  onChange={(e) => {
                    const value = e.target.value;
                    setValidationLink(value)
                  }}
                />
              </div>

              <div style={{border: '1px solid #EEEEEF', marginTop: '1.2rem'}}/>

              {/* <div style={{marginTop: '1rem'}}>
                <span style={{fontSize: 14, fontWeight: '500'}}>Cài đặt Timer</span>
              </div> */}
              <div className="box_line_date">
                  <span className="title_time">Thời gian chờ tối đa (Timer):</span>
                  <div className="box_setting_time">
                      <div className="box_time">
                          <div className="form-group">
                              <NummericInput
                                  name="score"
                                  id="score"
                                  // label="Số lượng thực tế"
                                  fill={false}
                                  value={valueTimer.day}
                                  disabled={disable}
                                  onBlur={(e) => {
                                    const body = {
                                      ...valueTimer,
                                      day: e.target.value
                                    }     
                                    // if(body.day){
                                    //   updateResponseTime(body);
                                    // }                                 
                                  }}
                                  onChange={(e) => {
                                      const value = e.target.value || ''
                                      setValueTimer({ ...valueTimer, day: value});
                                  }}
                              />
                          </div>
                          <div>
                              <span className="title_time">ngày</span>
                          </div>
                      </div>

                      <div className="box_time">
                          <div className="form-group">
                              <NummericInput
                                  name="score"
                                  id="score"
                                  // label="Số lượng thực tế"
                                  fill={false}
                                  value={valueTimer.hour}
                                  disabled={disable}
                                  onBlur={(e) => {
                                    const body = {
                                      ...valueTimer,
                                      hour: e.target.value
                                    }     
                                    // if(body.hour){
                                    //   updateResponseTime(body);
                                    // }                                 
                                    
                                  }}
                                  onChange={(e) => {
                                      const value = e.target.value || ''
                                      setValueTimer({ ...valueTimer, hour: value});
                                  }}
                              />
                          </div>
                          <div>
                              <span className="title_time">giờ</span>
                          </div>
                      </div>

                      <div className="box_time">
                          <div className="form-group">
                              <NummericInput
                                  name="score"
                                  id="score"
                                  // label="Số lượng thực tế"
                                  fill={false}
                                  value={valueTimer.minute}
                                  disabled={disable}
                                  onBlur={(e) => {
                                    const body = {
                                      ...valueTimer,
                                      minute: e.target.value
                                    }            
                                    // if(body.minute){
                                    //   updateResponseTime(body);
                                    // }                          
                                  }}
                                  onChange={(e) => {
                                      const value = e.target.value || ''
                                      setValueTimer({ ...valueTimer, minute: value});
                                  }}
                              />
                          </div>
                          <div>
                              <span className="title_time">phút</span>
                          </div>
                      </div>

                  </div>
              </div>
            </div>
            
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

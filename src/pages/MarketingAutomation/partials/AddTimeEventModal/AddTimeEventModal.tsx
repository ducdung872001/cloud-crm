import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { AddContactModalProps } from "model/contact/PropsModel";
import { IContactRequest } from "model/contact/ContactRequestModel";
import ContactService from "services/ContactService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import { SelectOptionData } from "utils/selectCommon";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import Input from "components/input/input";
import "./AddTimeEventModal.scss";
import Radio from "components/radio/radio";
import Checkbox from "components/checkbox/checkbox";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import { listDay } from "pages/CalendarCommon/partials/MockData";
import DatePicker from "react-datepicker";

export default function AddTimeEventModal(props: any) {
  const { onShow, onHide, data } = props;
  

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [infoEvent, setInfoEvent] = useState({
    timeType: '',
    day_of_week: [],
    day_of_month: [],
    time_action:''

  })

  console.log('infoEvent', infoEvent);
  
  
  const [target, setTarget] = useState(
    [
      {
        condition_name: '',
        condition_other: '',
        condition_content:'',
        group_customer: [],
        soure_customer: []
      }
    ]
  )

  console.log('target', target);
  

  const conditionData = [
    {
      label: 'Tên khách hàng',
      value: 'Tên khách hàng'
    },
    {
      label: 'Địa chỉ',
      value: 'Địa chỉ'
    },
    {
      label: 'Email',
      value: 'Email'
    },
    {
      label: 'Loại khách hàng',
      value: 'Loại khách hàng'
    },
    {
      label: 'Đối tượng khách hàng',
      value: 'Đối tượng khách hàng'
    },
    {
      label: 'Người phụ trách',
      value: 'Người phụ trách'
    },
    {
      label: 'Giới tính',
      value: 'Giới tính'
    },
  ]

  const soureCustomer = [
    {
      label: 'Khách lẻ',
      value: 'Khách lẻ'
    },
    {
      label: 'Quảng cáo',
      value: 'Quảng cáo'
    },
    {
      label: 'Khách hàng giới thiệu',
      value: 'Khách hàng giới thiệu'
    },
  ]

  const groupCustomer = [
    {
      label: 'Facebook',
      value: 'Facebook'
    },
    {
      label: 'Zalo',
      value: 'Zalo'
    },
    {
      label: 'Khách vip',
      value: 'Khách vip'
    },
  ]

  const conditionOther1Data = [
    {
      label: 'Bằng',
      value: 'Bằng'
    },
    {
      label: 'Không bằng',
      value: 'Không bằng'
    },
    {
      label: 'Chứa',
      value: 'Chứa'
    },
    {
      label: 'Không chứa',
      value: 'Không chứa'
    },
  ]

  const conditionOther2Data = [
    {
      label: 'Trong số',
      value: 'Trong số'
    },
    {
      label: 'Không trong số',
      value: 'Không trong số'
    },
  ]

  const timeType = [
    {
        label: 'Theo ngày',
        vale: 'day'
    },
    {
        label: 'Theo tuần',
        vale: 'week'
    },
    

  ]

  const dayOfWeek = [
    {
        label: 'T2',
        value: 'T2'
    },
    {
        label: 'T3',
        value: 'T3'
    },
    {
        label: 'T4',
        value: 'T4'
    },
    {
        label: 'T5',
        value: 'T5'
    },
    {
        label: 'T6',
        value: 'T6'
    },
    {
        label: 'T7',
        value: 'T7'
    },
    {
        label: 'CN',
        value: 'CN'
    },
  ]


  const handleSelectTimeType = (value) => {
    if(value !== infoEvent.timeType){
        setInfoEvent((preState) => ({...preState, timeType: value, day_of_week: [], day_of_month:[] }))
    }   

  }

  useEffect(() => {
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [infoEvent]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const body = {
        timeType: infoEvent.timeType,
        day_of_week: infoEvent.day_of_week,
        day_of_month: infoEvent.day_of_month,
        time_action: moment(infoEvent.time_action).format('HH:mm'),
        target: target
    }
    console.log('body', body);

    if(body.target && body.target.length > 0 && body.target.filter(el => !el.condition_name).length > 0 
        || body.target.filter(el => !el.condition_other).length > 0

        || body.target.filter(el => !el.condition_other).length > 0

      ){
      showToast("Vui lòng nhập đẩy đủ thông tin mục tiêu gửi", "error");
      return
    }
    


    setIsSubmit(true);

    // const body: IContactRequest = {
    //   ...(formData.values as IContactRequest),
    //   ...(data ? { id: data.id } : {}),
    // };

    // return;

    // const response = await ContactService.update(body);

    // if (response.code === 0) {
    //   showToast(`${data ? "Cập nhật" : "Thêm mới"} liên hệ thành công`, "success");
    //   onHide(true);
    //   setAddFieldEmail([{email: '', emailType: 1, isPrimary: 1}]);
    //   setAddFieldCustomer([{id:0, customerId: 0, isPrimary: 1 }]);
    //   setValidateCustomer([])

    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //   setIsSubmit(false);
    // }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              showDialogConfirmCancel()
            //   !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            //   setAddFieldCustomer([{id:0, customerId: 0, isPrimary: 1 }]);
            //   setAddFieldEmail([{ email: '', emailType: 1, isPrimary: 1}]);
            //   setValidateCustomer([])
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !infoEvent.timeType ||
              (infoEvent.timeType === 'week' && infoEvent.day_of_week.length === 0) ||
              (infoEvent.timeType === 'day' && infoEvent.day_of_month.length === 0) ||
              (!infoEvent.time_action),
            //   !isDifferenceObj(formData.values, values) ||
            //   validateCustomer.length > 0 ||
            //   (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [ isSubmit, infoEvent]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
        setInfoEvent({
          timeType: '',
          day_of_week: [],
          day_of_month: [],
          time_action:''
        })

        setTarget([
          {
            condition_name: '',
            condition_other: '',
            condition_content:'',
            group_customer: [],
            soure_customer: []
          }
        ])
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
        toggle={() => {
                if(!isSubmit){
                    onHide(false);
                    setInfoEvent({
                        timeType: '',
                        day_of_week: [],
                        day_of_month: [],
                        time_action:''
                    })

                    setTarget([
                      {
                        condition_name: '',
                        condition_other: '',
                        condition_content:'',
                        group_customer: [],
                        soure_customer: []
                      }
                    ])
                }
              }}
        className="modal-add-event"
      >
        <form className="form-event" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader 
            title={`Theo thời gian`} 
            toggle={() => {
                    if(!isSubmit){
                        onHide(false);
                        setInfoEvent({
                            timeType: '',
                            day_of_week: [],
                            day_of_month: [],
                            time_action:''
                        })
                        setTarget([
                          {
                            condition_name: '',
                            condition_other: '',
                            condition_content:'',
                            group_customer: [],
                            soure_customer: []
                          }
                        ])
                    }
                  }} 
          />
          <ModalBody>
            <div className="list-form-modal">
                <span style={{fontWeight: '500'}}>Tần Suất gửi:</span>
                <div className="container">
                    {timeType.map((el, idx) => (
                        <div key={idx} className="form-box">
                            <div className="time_type" key={idx} onClick={() => handleSelectTimeType(el.vale)}>
                                <span>
                                    <Radio
                                        checked={el.vale === infoEvent.timeType}
                                        disabled={true}
                                    />
                                </span>

                                <label>
                                    {el.label}
                                    {el.vale === infoEvent.timeType && <span className="required"> * </span>}
                                </label>
                            </div>

                            {el.vale === 'day' ? 
                                <div className="day">
                                    {/* <DatePickerCustom
                                        label=""
                                        name=""
                                        fill={true}
                                        value={infoEvent.day.toString()}
                                        onChange={(e) => {
                                            const newDate = new Date(moment(e).format("YYYY/MM/DD "));
                                            setInfoEvent({...infoEvent, day: newDate})
                                        }}
                                        placeholder="Chọn ngày"
                                        // required={true}
                                        iconPosition="left"
                                        icon={<Icon name="Calendar" />}
                                        isMaxDate={false}
                                        // error={validateFieldSignDate}
                                        // message="Vui lòng chọn ngày"
                                    /> */}
                                    <SelectCustom
                                        className="select_day"
                                        // label={contactAttribute.name}
                                        options={listDay || []}
                                        // onMenuOpen={onSelectOpenCustomer}
                                        // isLoading={isLoadingCustomer}
                                        fill={true}
                                        // required={!!contactAttribute.required}
                                        // readOnly={!!contactAttribute.readonly}
                                        isMulti ={true}
                                        special={true}
                                        disabled={infoEvent.timeType !== 'day'}
                                        value={infoEvent.day_of_month}
                                        placeholder="Chọn ngày"
                                        onChange={(e) => {                                        
                                            setInfoEvent({...infoEvent, day_of_month: e})
                                        }}
                                    />
                                    <span style={{fontSize: 14, fontWeight:'400'}} >hàng tháng</span>
                            </div>
                                : null
                            }

                            {el.vale === 'week' ?
                                <div className="day-of-week">
                                    {dayOfWeek.map((item, index) => (
                                        <Checkbox
                                            key={index}
                                            className="checkbox"
                                            disabled = {infoEvent.timeType !== 'week'}
                                            checked={infoEvent.day_of_week.includes(item.value)}
                                            label={item.label}
                                            onChange={(e) => {
                                                if(infoEvent.day_of_week.includes(item.value)){
                                                    const dayArray = infoEvent.day_of_week.filter(el => el !== item.value)
                                                    setInfoEvent((preState) => ({...preState, day_of_week: dayArray}))
                                                } else {
                                                    const dayArray = [...infoEvent.day_of_week]
                                                    dayArray.push(item.value)
                                                    setInfoEvent((preState) => ({...preState, day_of_week: dayArray}))
                                                }
                                                
                                            }} 
                                        />
                                    ))}
                                    
                                </div>
                                : null
                            }
                        </div>
                    
                    ))}
                </div>
            </div>

            <div className="list-form-modal">
                <div style={{display: 'flex', marginTop: 20, alignItems:'center'}}>
                    <span style={{fontWeight: '500', marginRight: 10}}>Thời gian gửi:<span style={{color: 'var(--error-color)'}}> * </span></span>
                    <div>
                        <DatePicker
                            className = 'date-picker'
                            selected={infoEvent.time_action}
                            onChange={(date) => {
                                setInfoEvent({...infoEvent, time_action: date})
                            }}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="HH:mm"
                            timeFormat="HH:mm"
                            placeholderText= "hh: mm"
                        />
                    </div>
                </div>
            </div>

            <div className="list-form-modal">
                <div style={{marginTop: 20, alignItems:'center'}}>
                    <span style={{fontWeight: '500', marginRight: 10}}>Nhắm mục tiêu:<span style={{color: 'var(--error-color)'}}> * </span></span>
                    <div style={{marginTop: 10}}>
                      {target.map((item, index) => (
                        <div key={index} style={{border: '1px solid #d3d5d7',  padding:' 1.6rem', borderRadius: 5, borderStyle: 'dotted', marginBottom: 15}}>
                          <div key={index} className = "condition_form">
                            <SelectCustom
                              className="condition_name"
                              // label={'Vui lòng chọn'}
                              options={conditionData}
                              // onMenuOpen={onSelectOpenCustomer}
                              // isLoading={isLoadingCustomer}
                              fill={true}
                              // required={!!contactAttribute.required}
                              // readOnly={!!contactAttribute.readonly}
                              // disabled={infoEvent.timeType !== 'day'}
                              value={item.condition_name}
                              placeholder="Vui lòng chọn"
                              onChange={(e) => {                                        
                                    setTarget((prev) =>
                                      prev.map((item, idx) => {
                                        if (idx === index) {
                                          return { ...item, condition_name: e.value, condition_other:'', group_customer: [], soure_customer: [] };
                                        }
                                        return item;
                                      })
                                    );
                                  }}
                            />
                            
                            <SelectCustom
                              className="condition_other"
                              // label={'Vui lòng chọn'}
                              options={
                                item.condition_name ? 
                                  (
                                    (item.condition_name === 'Đối tượng khách hàng' || item.condition_name === 'Loại khách hàng') ?
                                    conditionOther2Data 
                                    :
                                    conditionOther1Data
                                  )
                                  : []
                              }
                              // onMenuOpen={onSelectOpenCustomer}
                              // isLoading={isLoadingCustomer}
                              fill={true}
                              // required={!!contactAttribute.required}
                              // disabled={infoEvent.timeType !== 'day'}
                              value={item.condition_other}
                              placeholder="Vui lòng chọn"
                              onChange={(e) => {                                        
                                    setTarget((prev) =>
                                      prev.map((item, idx) => {
                                        if (idx === index) {
                                          return { ...item, condition_other: e.value };
                                        }
                                        return item;
                                      })
                                    );
                                  }}
                            />

                            {index === 0 ?
                              <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                <span
                                  className="icon-add"
                                  onClick={() => {
                                    setTarget([...target, { condition_name: '', condition_other: '', condition_content:'', group_customer: [], soure_customer:[] } ]);
                                  }}
                                >
                                  <Icon name="PlusCircleFill" />
                                </span>
                              </Tippy>
                              :

                              <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                <span 
                                  className="icon-remove" 
                                  onClick={() => {
                                    const newTargetArray =  [...target]
                                    newTargetArray.splice(index, 1)
                                    setTarget(newTargetArray)
                                  }}
                                >
                                  <Icon name="Trash" />
                                </span>
                              </Tippy>
                            }
                          </div>
                          
                          {item.condition_name ? 
                            (item.condition_name === 'Đối tượng khách hàng' || item.condition_name === 'Loại khách hàng' ? 
                                <div style={{marginTop: 10}}>
                                  <SelectCustom
                                    options={
                                      (item.condition_name === 'Đối tượng khách hàng') ? soureCustomer 
                                        : (item.condition_name === 'Loại khách hàng') ? groupCustomer : []
                                    }
                                    // onMenuOpen={onSelectOpenCustomer}
                                    // isLoading={isLoadingCustomer}
                                    fill={true}
                                    // required={!!contactAttribute.required}
                                    // disabled={infoEvent.timeType !== 'day'}
                                    isMulti ={true}
                                    special={true}
                                    value={
                                      (item.condition_name === 'Đối tượng khách hàng') ? item.soure_customer 
                                        : (item.condition_name === 'Loại khách hàng') ? item.group_customer : []
                                    }
                                    placeholder="Vui lòng chọn"
                                    onChange={(e) => {  
                                      console.log('e', e);
                                      // const newArray = (item.condition_name === 'Đối tượng khách hàng') ? [...item.soure_customer ]
                                      // : (item.condition_name === 'Loại khách hàng') ? [...item.group_customer] : []
                                      // newArray.push(e)
                                      // console.log('newArray', newArray);
                                      
                                                                                                                  
                                        setTarget((prev) =>
                                          prev.map((item, idx) => {
                                            if (idx === index) {
                                              if(item.condition_name === 'Đối tượng khách hàng'){
                                                return { ...item, soure_customer: e };
                                              } 
                                              else if(item.condition_name === 'Loại khách hàng') {
                                                return { ...item, group_customer: e };
                                              }
                                            }
                                            return item;
                                          })
                                      );
                                    }}
                                  />
                                </div>
                              : 
                                <div style={{marginTop: 10}}>
                                  <Input
                                      // id={`Id${contactAttribute.id}`}
                                      // label={contactAttribute.name}
                                      fill={true}
                                      value={item.condition_content}
                                      placeholder={'Vui lòng nhập'}
                                      // disabled={true}
                                      onChange={(e) => {                                        
                                        setTarget((prev) =>
                                          prev.map((item, idx) => {
                                            if (idx === index) {
                                              return { ...item, condition_content: e.target.value };
                                            }
                                            return item;
                                          })
                                        );
                                      }}
                                  />
                                </div>
                            )
                          : null}
                        </div>
                      ))}
                      
                        
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

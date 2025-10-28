import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Tippy from "@tippyjs/react";
import { AddProductProps } from "model/product/PropsModel";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IProductRequest } from "model/product/ProductRequestModel";
import { IProductResponse } from "model/product/ProductResponseModel";
import ProductService from "services/ProductService";
import Icon from "components/icon";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon"; 
import FileUpload from "components/fileUpload/fileUpload";
import SelectCustom from "components/selectCustom/selectCustom";
import NummericInput from "components/input/numericInput";
import "tippy.js/animations/scale-extreme.css";
import "./ConfigProductModal.scss";
import Input from "components/input/input";
import Radio from "components/radio/radio";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import { before } from "lodash";
import CustomerSourceService from "services/CustomerSourceService";
import CustomerService from "services/CustomerService";
import { IListWarehouseProductFilterRequest } from "model/warehouse/WarehouseRequestModel";
import ImageThirdGender from "assets/images/third-gender.png";
import BeautyBranchService from "services/BeautyBranchService";


export default function ConfigProductModal(props: any) {
  const { onShow, onHide, idProduct } = props;

  const focusedElement = useActiveElement();

    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
    const [tabData, setTabData] = useState([]);
    const [addFieldCondition, setAddFieldCondition] = useState([
        // {
        //     id: 'action_1',
        //     label: 'action 1',
        //     value:'',
        //     connect:''
        // }
    ])
    console.log('addFieldCondition', addFieldCondition);

//////Time
    const [time, setTime] = useState({
        type:'before',
        beforeTime:'',
        afterTime:'',
        startTime:'',
        endTime:''
    })

    // console.log('time', time);

//////Đối tượng khách hàng
    const [valueSource, setValueSource] = useState(null);
    
    //? đoạn này xử lý vấn đề call api lấy ra nguồn khách hàng
    const loadOptionSource = async (search, loadedOptions, { page }) => {
        const param: any = {
            name: search,
            page: page,
            limit: 1000,
        };
        const response = await CustomerSourceService.list(param);

        if (response.code === 0) {
        const dataOption = response.result;

        return {
            options: [
            ...(dataOption.length > 0
                ? dataOption.map((item: any) => {
                    return {
                        value: item.id,
                        label: item.name,
                    };
                })
                : []),
            ],
            hasMore: false,
            additional: {
                page: page + 1,
            },
        };
        }

        return { options: [], hasMore: false };
    };

    // thay đổi giá trị đối tượng kh
    const handleChangeValueSource = (e) => {
        setValueSource(e);
    };

/////TotalPayment
    const [totalPayment, setTotalPayment] = useState({
        type:'totalPaymentMin',
        paymentMin: 0,
        paymentFrom: 0,
        paymentTo: 0,
    })

/////Vị trí địa lý
    const [locationData, setLocationData] = useState({
        city: '',
        district: '',
        subdistrict: ''
    })

    const [districtOption, setDistrictOption] = useState([]);
    const [isLoadingDistrict, setIsLoadingDistrict] = useState(false);

    const [subdistrictOption, setSubdistrictOption] = useState([]);
    const [isLoadingSubdistrict, setIsLoadingSubdistrict] = useState(false);
    
    //chọn tỉnh thành phố
    const loadOptionCity = async (search, loadedOptions, { page }) => {
        const param: any = {
            name: search,
            parentId: 0,
            page: page,
            limit: 100,
        };
        const response = await CustomerService.areaList(param);

        if (response.code === 0) {
        const dataOption = response.result;

        return {
            options: [
            ...(dataOption.length > 0
                ? dataOption.map((item: any) => {
                    return {
                        value: item.id,
                        label: item.name,
                    };
                })
                : []),
            ],
            hasMore: false,
            additional: {
                page: page + 1,
            },
        };
        }

        return { options: [], hasMore: false };
    };

    const handleSelectCity = (e) => {
        setLocationData({...locationData, city: e, district:'', subdistrict:''});
        loadOptionDistrict(e.value)
    }

    //chọn quận huyện
    const loadOptionDistrict = async (cityId: number) => {
        if (!cityId) return;

        const param: any = {
            name: '',
            parentId: cityId,
            page: 1,
            limit: 1000,
        };
    
        setIsLoadingDistrict(true);
    
        const response = await CustomerService.areaList(param);
    
        if (response.code === 0) {
          const dataOption = response.result;
          setDistrictOption([
            ...(dataOption.length > 0
              ? dataOption.map((item) => {
                  return {
                    value: item.id,
                    label: item.name,
                  };
                })
              : []),
          ]);
        }
    
        setIsLoadingDistrict(false);
      };

    const handleSelectDistrict = (e) => {
        setLocationData({...locationData,  district: e, subdistrict:''});
        loadOptionSubdistrict(e.value)
    }

    //chọn phường xã
    const loadOptionSubdistrict = async (districtId: number) => {
        if (!districtId) return;

        const param: any = {
            name: '',
            parentId: districtId,
            page: 1,
            limit: 1000,
        };
    
        setIsLoadingSubdistrict(true);
    
        const response = await CustomerService.areaList(param);
    
        if (response.code === 0) {
          const dataOption = response.result;
          setSubdistrictOption([
            ...(dataOption.length > 0
              ? dataOption.map((item) => {
                  return {
                    value: item.id,
                    label: item.name,
                  };
                })
              : []),
          ]);
        }
    
        setIsLoadingSubdistrict(false);
      };

    const handleSelectSubdistrict = (e) => {
        setLocationData({...locationData, subdistrict: e});
    }
////////////

//////Kênh bán
    const [saleChannel, setSaleChannel] = useState(null);
    // console.log('saleChannel', saleChannel);
    
    //? đoạn này xử lý vấn đề call api lấy ra nguồn khách hàng
    const loadOptionBranch = async (search, loadedOptions, { page }) => {
        const param: any = {
            name: search,
            page: page,
            limit: 10,
        };
        const response = await BeautyBranchService.list(param);

        if (response.code === 0) {
        const dataOption = response.result.items;

        return {
            options: [
            ...(dataOption.length > 0
                ? dataOption.map((item: any) => {
                    return {
                        value: item.id,
                        label: item.name,
                    };
                })
                : []),
            ],
            hasMore: false,
            additional: {
                page: page + 1,
            },
        };
        }

        return { options: [], hasMore: false };
    };

    // thay đổi giá trị kênh bán
    const handleChangeValueSaleChannel = (e) => {
        setSaleChannel(e);
    };

////// Chọn sản phẩm liên quan
    const [dataProduct, setDataProduct] = useState([]);    
    //! đoạn này xử lý vấn đề call api lấy ra danh sách sản phẩm
    const loadedOptionProduct = async (search, loadedOptions, { page }) => {
        const param = {
            name: search,
            limit: 10,
        }

        const response = await ProductService.list(param);

        if (response.code === 0) {
        const dataOption = response.result.items;

        return {
            options: [
            ...(dataOption.length > 0
                ? dataOption.map((item) => {
                    return {
                        avatar: item.avatar,
                        value: item.id,
                        label: item.name,
                    };
                })
                : []),
            ],
            hasMore: response.result.loadMoreAble,
            additional: {
            page: page + 1,
            },
        };
        }

        return { options: [], hasMore: false };
    };

    const handleChangeValueProduct = (e) => {
        setDataProduct(e)
    }

    //! đoạn này xử lý vấn đề hiển thị hình ảnh sản phẩm
    const formatOptionLabelProduct = ({ label, avatar }) => {
        return (
        <div className="selected--item">
            <div className="avatar">
            <img src={avatar || ImageThirdGender} alt={label} />
            </div>
            {label}
        </div>
        );
    };
/////
    const actionData = [
        {
            lable: 'Thời gian',
            value: 'time'
        },
        {
            lable: 'Vị trí địa lý',
            value: 'location'
        },
        {
            lable: 'Đối tượng khách hàng',
            value: 'sourceCustomer'
        },
        {
            lable: 'Tổng chi tiêu',
            value: 'totalPayment'
        },
        {
            lable: 'Kênh bán',
            value: 'saleChannel'
        },
    ]

    const connectData = [
        {
            label: 'Hoặc',
            value :'or'
        },
        {
            label: 'Và',
            value: 'and'
        }
    ]

    const timeData = [
        {
            label: 'Trước mốc thời gian',
            value: 'before'
        },
        {
            label: 'Sau mốc thời gian',
            value: 'after'
        },
        {
            label: 'Trong khoảng thời gian',
            value: 'inTime'
        },
    ]

    const paymentData = [
        {
            label: 'Chi tiêu tối thiểu',
            value: 'totalPaymentMin'
        },
        {
            label: 'Chi tiêu trong khoảng',
            value: 'inPayment'
        },
    ]


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
                //   !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
                    showDialogConfirmCancel()
                },
            },
            {
                title: "Cập nhật",
                type: "submit",
                color: "primary",
                disabled: isSubmit ,
                // || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
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
            title: <Fragment>{`Hủy bỏ thao tác cấu hình`}</Fragment>,
            message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
            cancelText: "Quay lại",
            cancelAction: () => {
                setShowDialog(false);
                setContentDialog(null);
            },
            defaultText: "Xác nhận",
            defaultAction: () => {
                handleClearForm();
                setShowDialog(false);
            },
        };
        setContentDialog(contentDialog);
        setShowDialog(true);
    };

//   const checkKeyDown = useCallback(
//     (e) => {
//       const { keyCode } = e;
//       if (keyCode === 27 && !showDialog) {
//         if (isDifferenceObj(formData.values, values)) {
//           showDialogConfirmCancel();
//           if (focusedElement instanceof HTMLElement) {
//             focusedElement.blur();
//           }
//         } else {
//           onHide(false);
//         }
//       }
//     },
//     [formData]
//   );

//   useEffect(() => {
//     window.addEventListener("keydown", checkKeyDown);

//     return () => {
//       window.removeEventListener("keydown", checkKeyDown);
//     };
//   }, [checkKeyDown]);




    //xoá thời gian
    const handleRemoveTime = (value, index) => {
        const newArray = [...addFieldCondition];
        newArray.splice(index, 1);
        setAddFieldCondition(newArray)

        setTime({
            type: 'before', 
            beforeTime:'', 
            afterTime: '', 
            startTime: '', 
            endTime: ''
        })

        const newTab = tabData.filter(el => el !== value);
        setTabData(newTab)
    }

    //xoá đối tương khách hàng
    const handleRemoveSource = (value, index) => {
        const newArray = [...addFieldCondition];
        newArray.splice(index, 1);
        setAddFieldCondition(newArray)

        setValueSource(null)

        const newTab = tabData.filter(el => el !== value);
        setTabData(newTab)
    }


    //Xoá tổng chi tiêu
    const handleRemoveTotalPayment = (value, index) => {
        const newArray = [...addFieldCondition];
        newArray.splice(index, 1);
        setAddFieldCondition(newArray)

        setTotalPayment({
            type:'totalPaymentMin',
            paymentMin: 0,
            paymentFrom: 0,
            paymentTo: 0,
        })

        const newTab = tabData.filter(el => el !== value);
        setTabData(newTab)
    }

    //Xoá vị trí địa lý
    const handleRemoveLocation = (value, index) => {
        const newArray = [...addFieldCondition];
        newArray.splice(index, 1);
        setAddFieldCondition(newArray)

        setLocationData({
            city: '',
            district: '',
            subdistrict: ''
        })

        const newTab = tabData.filter(el => el !== value);
        setTabData(newTab)
    }

    //xoá đối kênh bán
    const handleRemoveSaleChannel = (value, index) => {
        const newArray = [...addFieldCondition];
        newArray.splice(index, 1);
        setAddFieldCondition(newArray)

        setSaleChannel(null)

        const newTab = tabData.filter(el => el !== value);
        setTabData(newTab)
    }


    const onSubmit = async (e) => {
        e.preventDefault();

        // const errors = Validate(validations, formData, [...listFieldBasic, ...listFieldAdvanced, ...listFieldOption]);

        // if (Object.keys(errors).length > 0) {
        //   setFormData((prevState) => ({ ...prevState, errors: errors }));
        //   return;
        // }

        // setIsSubmit(true);

        // const body: IProductRequest = {
        //   ...(detailProduct ? { id: detailProduct?.id } : {}),
        //   ...(formData.values as IProductRequest),
        // };

        // const response = await ProductService.update(body);

        // if (response.code === 0) {
        //   showToast(`${detailProduct ? "Cập nhật" : "Thêm mới"} sản phẩm thành công`, "success");
        //   onHide(true);
        //   setDetailProduct(null);
        //   setAddFieldExchange([]);
        // } else {
        //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        //   setIsSubmit(false);
        // }

        const newInfo = [...addFieldCondition];

        if(!newInfo || newInfo.length === 0){
            showToast( "Vui lòng chọn điều kiện đề xuất", "error");
            return;
        }

        newInfo[0] = {
            id:  newInfo[0].id,
            label:  newInfo[0].label,
            connect:  '',
            value: newInfo[0],
        }

        ///check time
        const indexTime = newInfo.findIndex(el => el.id === 'time');
        if(indexTime !== -1){
            if(time.type === 'before' && !time.beforeTime){
                showToast( "Vui lòng nhập mốc thời gian", "error");
                return;
            }

            if(time.type === 'after' && !time.afterTime){
                showToast( "Vui lòng nhập mốc thời gian", "error");
                return;
            }

            if(time.type === 'inTime' ){
                if(!time.startTime){
                    showToast( "Vui lòng nhập từ ngày nào ", "error");
                    return;
                }

                if(!time.endTime){
                    showToast( "Vui lòng nhập đến ngày nào ", "error");
                    return;
                }
                
            }
            newInfo[indexTime] = {
                id:  newInfo[indexTime].id,
                label:  newInfo[indexTime].label,
                connect:  newInfo[indexTime].connect,
                value: time,
            }
        }

        //check đối tượng khách hàng
        const indexSourceCustomer = newInfo.findIndex(el => el.id === 'sourceCustomer');
        if(indexSourceCustomer !== -1){
            if(!valueSource){
                showToast( "Vui lòng chọn đối tượng khách hàng", "error");
                return;
            }

            newInfo[indexSourceCustomer] = {
                id:  newInfo[indexSourceCustomer].id,
                label:  newInfo[indexSourceCustomer].label,
                connect:  newInfo[indexSourceCustomer].connect,
                value: valueSource,
            }
        }


        ///check chi tieu
        const indexTotalPayment = newInfo.findIndex(el => el.id === 'totalPayment');
        if(indexTotalPayment !== -1){
            if(totalPayment.type === 'totalPaymentMin' && !totalPayment.paymentMin){
                showToast( "Vui lòng nhập chi tiêu tối thiểu", "error");
                return;
            }

            if(totalPayment.type === 'inPayment' ){
                if(!totalPayment.paymentFrom){
                    showToast( "Vui lòng nhập chi tiêu từ mức nào ", "error");
                    return;
                }

                if(!totalPayment.paymentTo){
                    showToast( "Vui lòng nhập chi tiêu đến mức nào ", "error");
                    return;
                }
                
            }
            newInfo[indexTotalPayment] = {
                id:  newInfo[indexTotalPayment].id,
                label:  newInfo[indexTotalPayment].label,
                connect:  newInfo[indexTotalPayment].connect,
                value: totalPayment,
            }
        }

        //check vị trí địa lý
        const indexLocation = newInfo.findIndex(el => el.id === 'location');
        if(indexLocation !== -1){
            if(!locationData.city){
                showToast( "Vui lòng chọn tỉnh/thành phố", "error");
                return;
            }

            newInfo[indexLocation] = {
                id:  newInfo[indexLocation].id,
                label:  newInfo[indexLocation].label,
                connect:  newInfo[indexLocation].connect,
                value: locationData,
            }
        }

        //check kênh bán
        const indexSaleChannel = newInfo.findIndex(el => el.id === 'saleChannel');
        if(indexSaleChannel !== -1){
            if(!saleChannel){
                showToast( "Vui lòng chọn kênh bán", "error");
                return;
            }

            newInfo[indexSaleChannel] = {
                id:  newInfo[indexSaleChannel].id,
                label:  newInfo[indexSaleChannel].label,
                connect:  newInfo[indexSaleChannel].connect,
                value: saleChannel,
            }
        }

        // console.log('newInfo', newInfo);

        if(dataProduct.length === 0){
            showToast( "Vui lòng chọn phẩm được đề xuất", "error");
            return;
        }


        const body = {
            conditions: newInfo,
            recommendProducts: dataProduct
        }

        console.log('body', body);
        
         
    };

    const handleClearForm = () => {
        onHide(false);
        setTabData([]);
        setAddFieldCondition([])
        setTime({
            type: 'before', 
            beforeTime:'', 
            afterTime: '', 
            startTime: '', 
            endTime: ''
        })
        setValueSource(null)

        setTotalPayment({
            type:'totalPaymentMin',
            paymentMin: 0,
            paymentFrom: 0,
            paymentTo: 0,
        })

        setLocationData({
            city: '',
            district: '',
            subdistrict: ''
        })

        setDataProduct([])

        setSaleChannel(null)
    };


  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-config-product"
        size="lg"
      >
        <form className="form-product-config" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`Đề xuất sản phẩm liên quan`}
            toggle={() => {
              if(!isSubmit){
                handleClearForm()
              };
            }}
          />
          <ModalBody>
            <div 
                style={{maxHeight:'48rem', overflow:'auto'}}
            > 
                <div style={{marginTop: '1.6rem'}}>
                    <span style={{fontSize: 16, fontWeight:'600'}}>Điều kiện đề xuất</span>
                </div>  
                <div className="tab-form">
                    {actionData.map((item, index) => (
                        <div 
                            key={index} 
                            className= {tabData.includes(item.value ) ? 'tab-box-active' : 'tab-box'}
                            onClick={() => {
                                if(tabData.includes(item.value )){
                                    
                                } else {
                                    if(addFieldCondition.length > 0){
                                        setTabData(oldArray => [...oldArray, item.value])
                                        setAddFieldCondition(oldArray => [...oldArray, {id: item.value, label: item.lable, value:'', connect:'or'}])
                                    } else {
                                        setTabData(oldArray => [...oldArray, item.value])
                                        setAddFieldCondition(oldArray => [...oldArray, {id: item.value, label: item.lable, value:'', connect:''}])
                                    }
                                }
                                
                            }}
                        >
                            <span style={{fontSize: 14}}>{item.lable}</span>
                        </div>
                    ))}
                </div>

                {addFieldCondition.map((item, ind) => (
                    <div key={ind}>
                        {ind === 0 ? null :
                            <div style={{marginTop: '1.5rem', display:'flex', marginLeft: 10}}>
                                {connectData.map((el, idx) => (
                                    <div key={idx}
                                        style={{display:'flex', alignItems:'center', marginRight: 20}}
                                        onClick= {() => {
                                            setAddFieldCondition(current =>
                                                current.map((obj, index) => {
                                                    if (index === ind) {
                                                        return {...obj, connect: el.value};
                                                    }
                                                    return obj;
                                                }),
                                            );
                                        }}
                                    >
                                        <Radio
                                            // value={item.isPrimary}
                                            checked={item.connect === el.value}
                                            // defaultChecked={defaultValue && defaultValue === option.value}
                                            // name={name}
                                            disabled={true}
                                            onChange={(e) => {}}
                                            onClick={(e) => {}}
                                        />
                                        <span style={{marginBottom: 4, fontSize: 14}}>{el.label}</span>
                                    </div>
                                ))}
                            </div>
                        }
                        {/* <div key={ind}  className="input-action">
                            <div style={{ width: '95%'}}>
                                <Input
                                    type="text"
                                    placeholder={`Nhập ${item.label}`}
                                    value={item.value}
                                    fill={true}
                                    autoFocus={true}
                                    onChange={(e) => {
                                        setAddFieldCondition(current =>
                                            current.map((obj, index) => {
                                                if (index === ind) {
                                                    return {...obj, value: e.target.value};
                                                }
                                        
                                                return obj;
                                            }),
                                        );
                                    }}
                                />
                            </div>


                            { ind !== 0 ? 
                                <div className="action__remove--approach" title="Xóa" 
                                    onClick={() => handleRemoveCondition(item.id, ind)}
                                >
                                    <Icon name="Trash" />
                                </div>
                            : null}
                        </div> */}

                        {item.id === 'time' ? 
                            <div className="time-box">
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                                    <span style={{fontSize: 16, fontWeight:'600'}}>Thời gian</span>
                                    <div className="action__remove--approach" title="Xóa" 
                                        onClick={() => handleRemoveTime(item.id, ind)}
                                    >
                                        <Icon name="Trash" />
                                    </div>
                                </div>
                                <div style={{display:'flex', marginTop: 10}}>
                                    {timeData.map((el, idx) => (
                                        <div key={idx} className="radio-select-time"
                                            onClick={() => {
                                                if(time.type !== el.value){
                                                    setTime({
                                                        type: el.value, 
                                                        beforeTime:'', 
                                                        afterTime: '', 
                                                        startTime: '', 
                                                        endTime: ''
                                                    })
                                                }
                                                
                                            }}
                                        >
                                            <Radio
                                                // value={item.isPrimary}
                                                checked={time.type === el.value}
                                                // defaultChecked={defaultValue && defaultValue === option.value}
                                                // name={name}
                                                disabled={true}
                                                onChange={(e) => {}}
                                                onClick={(e) => {}}
                                            />
                                            <span style={{marginBottom: 4, fontSize: 14}}>{el.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {time.type === 'before' ? 
                                    <div style={{marginTop: 10}}>
                                        <DatePickerCustom
                                            label="Trước mốc thời gian"
                                            name="the_day"
                                            fill={true}
                                            isFmtText={true}
                                            required={true}
                                            value={time.beforeTime ?  moment(time.beforeTime).format("DD/MM/YYYY") : ''}
                                            onChange={(e) => setTime({ ...time, beforeTime: e })}
                                            // disabled={formData.never !== "1"}
                                            placeholder="DD/MM/YYYY"
                                        />
                                    </div>
                                : null}

                                {time.type === 'after' ? 
                                    <div style={{marginTop: 10}}>
                                        <DatePickerCustom
                                            label="Sau mốc thời gian"
                                            name="the_day"
                                            fill={true}
                                            required={true}
                                            isFmtText={true}
                                            value={time.afterTime ?  moment(time.afterTime).format("DD/MM/YYYY") : ''}
                                            onChange={(e) => setTime({ ...time, afterTime: e })}
                                            // disabled={formData.never !== "1"}
                                            placeholder="DD/MM/YYYY"
                                        />
                                    </div>
                                : null}

                                {time.type === 'inTime' ? 
                                    <div className="inTime-box">
                                        <div style={{width: '48%'}}>
                                            <DatePickerCustom
                                                label="Từ ngày"
                                                name="the_day"
                                                fill={true}
                                                required={true}
                                                isFmtText={true}
                                                value={time.startTime ?  moment(time.startTime).format("DD/MM/YYYY") : ''}
                                                onChange={(e) => setTime({ ...time, startTime: e })}
                                                // disabled={formData.never !== "1"}
                                                placeholder="DD/MM/YYYY"
                                                maxDate={time.endTime}
                                            />
                                        </div>
                                        
                                        <div style={{width: '48%'}}>
                                            <DatePickerCustom
                                                label="Đến ngày"
                                                name="the_day"
                                                fill={true}
                                                required={true}
                                                isFmtText={true}
                                                value={time.endTime ?  moment(time.endTime).format("DD/MM/YYYY") : ''}
                                                onChange={(e) => setTime({ ...time, endTime: e })}
                                                // disabled={formData.never !== "1"}
                                                placeholder="DD/MM/YYYY"
                                                minDate={time.startTime}
                                            />
                                        </div>
                                    </div>
                                : null}
                                
                            </div>
                        : null}

                        {item.id === 'sourceCustomer' ? 
                            <div className="source-box">
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
                                    <span style={{fontSize: 16, fontWeight:'600'}}>Đối tượng khách hàng</span>
                                    <div className="action__remove--approach" title="Xóa" 
                                        onClick={() => handleRemoveSource(item.id, ind)}
                                    >
                                        <Icon name="Trash" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <SelectCustom
                                        id="sourceId"
                                        name="sourceId"
                                        fill={true}
                                        required={true}
                                        options={[]}
                                        value={valueSource}
                                        onChange={(e) => handleChangeValueSource(e)}
                                        isAsyncPaginate={true}
                                        placeholder="Chọn đối tượng khách hàng"
                                        additional={{
                                            page: 1,
                                        }}
                                        loadOptionsPaginate={loadOptionSource}
                                    />
                                </div>
                            </div>
                        : null}

                        {item.id === 'totalPayment' ? 
                            <div className="totalPayment-box">
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                                    <span style={{fontSize: 16, fontWeight:'600'}}>Tổng chi tiêu</span>
                                    <div className="action__remove--approach" title="Xóa" 
                                        onClick={() => handleRemoveTotalPayment(item.id, ind)}
                                    >
                                        <Icon name="Trash" />
                                    </div>
                                </div>
                                <div style={{display:'flex', marginTop: 10}}>
                                    {paymentData.map((el, idx) => (
                                        <div key={idx} className="radio-select-payment"
                                            onClick={() => {
                                                if(time.type !== el.value){
                                                    setTotalPayment({
                                                        type: el.value,
                                                        paymentMin: 0,
                                                        paymentFrom: 0,
                                                        paymentTo: 0,
                                                    })
                                                }
                                            }}
                                        >
                                            <Radio
                                                // value={item.isPrimary}
                                                checked={totalPayment.type === el.value}
                                                // defaultChecked={defaultValue && defaultValue === option.value}
                                                // name={name}
                                                disabled={true}
                                                onChange={(e) => {}}
                                                onClick={(e) => {}}
                                            />
                                            <span style={{marginBottom: 4, fontSize: 14}}>{el.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {totalPayment.type === 'totalPaymentMin' ? 
                                    <div style={{marginTop: 10}}>
                                        <NummericInput
                                            label={'Chi tiêu tối thiểu'}
                                            name="payment"
                                            fill={true}
                                            value={totalPayment.paymentMin}
                                            thousandSeparator={true}
                                            onValueChange={(e) => setTotalPayment({...totalPayment, paymentMin: +e.value})}
                                        />
                                    </div>
                                : null}

                                {totalPayment.type === 'inPayment' ? 
                                    <div style={{marginTop: 10, display: 'flex', justifyContent:'space-between'}}>
                                        <div style={{width: '48%'}}>
                                            <NummericInput
                                                label={'Từ mức'}
                                                name="payment"
                                                fill={true}
                                                value={totalPayment.paymentFrom}
                                                thousandSeparator={true}
                                                onValueChange={(e) => {
                                                    setTotalPayment({...totalPayment, paymentFrom: +e.value})
                                                }}
                                            />
                                        </div>

                                        <div style={{width: '48%'}}>
                                            <NummericInput
                                                label={'Đến mức'}
                                                name="payment"
                                                fill={true}
                                                value={totalPayment.paymentTo}
                                                thousandSeparator={true}
                                                onValueChange={(e) => setTotalPayment({...totalPayment, paymentTo: +e.value})}
                                            />
                                        </div>

                                    </div>
                                : null}
                                
                            </div>
                        : null}

                        {item.id === 'location' ? 
                            <div className="location-box">
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
                                    <span style={{fontSize: 16, fontWeight:'600'}}>Vị trí địa lý</span>
                                    <div className="action__remove--approach" title="Xóa" 
                                        onClick={() => handleRemoveLocation(item.id, ind)}
                                    >
                                        <Icon name="Trash" />
                                    </div>
                                </div>

                                <div className="location-form">
                                    <div className="form-group">
                                        <SelectCustom
                                            id="cityId"
                                            name="cityId"
                                            label={'Tỉnh/thành phố'}
                                            fill={true}
                                            required={true}
                                            options={[]}
                                            value={locationData.city}
                                            onChange={(e) => handleSelectCity(e)}
                                            isAsyncPaginate={true}
                                            placeholder="Chọn tỉnh/thành phố"
                                            additional={{
                                                page: 1,
                                            }}
                                            loadOptionsPaginate={loadOptionCity}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <SelectCustom
                                            id="districtId"
                                            name="districtId"
                                            label={'Quận/huyện'}
                                            options={districtOption}
                                            special={true}
                                            value={locationData.district}
                                            fill={true}
                                            required={false}
                                            disabled={!locationData.city}
                                            isLoading={isLoadingDistrict}
                                            placeholder="Chọn quận/huyện"
                                            onChange={(e) => handleSelectDistrict(e)}
                                        />
                                    </div>

                                    <div className="form-group">

                                        <SelectCustom
                                            id="subdistrictId"
                                            name="subdistrictId"
                                            label={'Phường/xã'}
                                            options={subdistrictOption}
                                            special={true}
                                            value={locationData.subdistrict}
                                            fill={true}
                                            required={false}
                                            disabled={!locationData.district}
                                            isLoading={isLoadingSubdistrict}
                                            placeholder="Chọn phường/xã"
                                            onChange={(e) => handleSelectSubdistrict(e)}
                                        />
                                        
                                    </div>
                                </div>
                            </div>
                        : null}

                        {item.id === 'saleChannel' ? 
                            <div className="source-box">
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
                                    <span style={{fontSize: 16, fontWeight:'600'}}>Kênh bán</span>
                                    <div className="action__remove--approach" title="Xóa" 
                                        onClick={() => handleRemoveSaleChannel(item.id, ind)}
                                    >
                                        <Icon name="Trash" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <SelectCustom
                                        id="branchId"
                                        name="branchId"
                                        fill={true}
                                        required={true}
                                        options={[]}
                                        value={saleChannel}
                                        onChange={(e) => handleChangeValueSaleChannel(e)}
                                        isAsyncPaginate={true}
                                        placeholder="Chọn kênh bán"
                                        additional={{
                                            page: 1,
                                        }}
                                        loadOptionsPaginate={loadOptionBranch}
                                    />
                                </div>
                            </div>
                        : null}


                    </div>
                ))}

                <div style={{border: '0.5px dashed', marginTop:'3rem', width: '100%'}}></div>

                <div style={{marginTop: '2rem', marginBottom: '1.6rem'}}>
                    <span style={{fontSize: 16, fontWeight:'600'}}>Sản phẩm được đề xuất <span style={{color:'red'}}>*</span></span>

                    <div className="input-product">
                        <SelectCustom
                            id="productId"
                            name="productId"
                            // label="Sản phẩm"
                            fill={true}
                            required={true}
                            options={[]}
                            isMulti={true}
                            value={dataProduct}
                            onChange={(e) => handleChangeValueProduct(e)}
                            isAsyncPaginate={true}
                            isFormatOptionLabel={true}
                            placeholder="Chọn sản phẩm"
                            additional={{
                                page: 1,
                            }}
                            loadOptionsPaginate={loadedOptionProduct}
                            formatOptionLabel={formatOptionLabelProduct}
                            // error={validateProduct}
                            // message="Vui lòng chọn sản phẩm"
                            // disabled={formData?.values?.inventoryId ? false : true}
                        />
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

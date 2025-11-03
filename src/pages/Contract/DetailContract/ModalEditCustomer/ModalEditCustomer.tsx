import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./ModalEditCustomer.scss";
import ContractAttachmentService from "services/ContractAttachmentService";
import SelectCustom from "components/selectCustom/selectCustom";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import CustomerService from "services/CustomerService";
import ImageThirdGender from "assets/images/third-gender.png";
import Input from "components/input/input";
import PartnerService from "services/PartnerService";
import ContractService from "services/ContractService";
import ContractExtraInfoService from "services/ContractExtraInfoService";

export default function ModalEditCustomer(props: any) {
  const { onShow, onHide, data, } = props;
  
  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [typeContract, setTypeContract] = useState('1');

  const [isSubmit, setIsSubmit] = useState(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [dataCustomer, setDataCustomer] = useState(null);
  const [dataPartner, setDataPartner] = useState(null);
  const [contractExtraInfos, setContractExtraInfos] = useState<any>([]);

  const getDetailCustomer = async (id: number) => {
    if (!id) return;

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDataCustomer({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        address: result.address,
        phoneMasked: result.phoneMasked,
        taxCode: result.taxCode,
        custType: result.custType,
        groupName: result.groupName,
        sourceName: result.sourceName,
      });
    } else {
      showToast("Có lỗi xảy ra vui lòng thử lại sau", "error");
    }
  };


  const getDetailPartner = async (id: number) => {
    if (!id) return;

    const response = await PartnerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDataPartner({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        address: result.address,
        phoneMasked: result.phoneMasked,
        taxCode: result.taxCode,
      });
    } else {
      showToast("Có lỗi xảy ra vui lòng thử lại sau", "error");
    }
  };

  const getContractExtraInfos = async () => {    
    const response = await ContractExtraInfoService.list(data?.id);
    // console.log("response =>", response);
    if(response.code === 0){
      const result = response.result?.map(item => {
        return {
          attributeId: item.attributeId,
          contractId: item.contractId,
          attributeValue: item.attributeValue
        }
      })
      setContractExtraInfos(result);
    }
    
  };

  useEffect(() => {
    if(data && onShow){
        getContractExtraInfos();

        if(data.customerId){
            getDetailCustomer(data.customerId);
            setTypeContract('1');
        } 

        if(data.businessPartnerId){
            getDetailPartner(data.businessPartnerId);
            setTypeContract('0');
        }
    }
    
  }, [data, onShow])
  


  const values = useMemo(
    () =>
    ({
      ...data,
      taxCode: data?.taxCode ?? '',
      customerId: data?.customerId ?? '',
      custType: data?.custType ?? '',
      businessPartnerId: data?.businessPartnerId ?? '',
      businessPartnerName: data?.businessPartnerName ?? '',
    } as any),
    [data]
  ); 
  

    const validations: IValidation[] = [
        {
        name: "name",
        rules: "required",
        },
    ]

  const [formData, setFormData] = useState<IFormData>({ values: values });    

      //! đoạn này xử lý call api lấy ra thông tin khách hàng
      const loadOptionCustomer = async (search, loadedOptions, { page }) => {
        const param: ICustomerFilterRequest = {
          keyword: search,
          page: page,
          limit: 10,
          branchId: dataBranch.value,
        };
        const response = await CustomerService.filter(param);
    
        if (response.code === 0) {
          const dataOption = response.result.items;
    
          return {
            options: [
              ...(dataOption.length > 0
                ? dataOption.map((item: ICustomerResponse) => {
                    return {
                        value: item.id,
                        label: item.name,
                        avatar: item.avatar,
                        address: item.address,
                        phoneMasked: item.phoneMasked,
                        taxCode: item.taxCode,
                        custType: item.custType,
                        groupName: item.groupName,
                        sourceName: item.sourceName,
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
    
    const handleChangeValueCustomer = (e) => {
        setDataCustomer(e);
        setFormData({ ...formData, values: { ...formData?.values,customerId: e.value, taxCode: e.taxCode ? e.taxCode : "", custType: e.custType } });
    };

    const formatOptionLabelCustomer = ({ label, avatar }) => {
        return (
            <div className="selected--item">
                <div className="avatar">
                    <img src={avatar || ImageThirdGender} alt={label} />
                </div>
                {label}
            </div>
        );
    };

    const loadOptionPartner = async (search, loadedOptions, { page }) => {
        const param: any = {
          keyword: search,
          page: page,
          limit: 10,
          branchId: dataBranch.value,
        };
    
        const response = await PartnerService.list(param);
    
        if (response.code === 0) {
          const dataOption = response.result.items;
    
          return {
            options: [
              ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới đối tác", isShowModal: true, avatar: "custom" }] : []),
              ...(dataOption.length > 0
                ? dataOption.map((item: ICustomerResponse) => {
                    return {
                      value: item.id,
                      label: item.name,
                      avatar: item.avatar,
                      address: item.address,
                      phoneMasked: item.phoneMasked,
                      taxCode: item.taxCode,
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

    const handleChangeValuePartner= (e) => {
        setDataPartner(e);
        setFormData({ ...formData, values: { ...formData?.values, businessPartnerId: e.value,  businessPartnerName: e.label, taxCode: e.taxCode ? e.taxCode : ""} }); 
    };


  const listFieldBasic = useMemo(
    () =>
      [
        {
            name: "lstCustomerId",
            type: "custom",
            snippet: (
                <SelectCustom
                    key={(dataBranch ? dataBranch.value : "no-branch") && typeContract }
                    id="nameCustomer"
                    name="nameCustomer"
                    label="Họ tên"
                    fill={true}
                    required={true}
                    options={[]}
                    value={typeContract === '1' ? dataCustomer : dataPartner}
                    onChange={(e) => {
                        if(typeContract === '1'){
                            handleChangeValueCustomer(e)
                        } else {
                            handleChangeValuePartner(e)
                        }
                    }}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder={`Chọn ${typeContract === '1' ? 'khách hàng' : 'đối tác'}`}
                    additional={{
                        page: 1,
                    }}
                    loadOptionsPaginate={typeContract === '1' ? loadOptionCustomer : loadOptionPartner}
                    formatOptionLabel={formatOptionLabelCustomer}
                />
            ),
        },
        {
            name: "taxCode",
            type: "custom",
            snippet: (
                <Input
                    id="taxCode"
                    name="taxCode"
                    fill={true}
                    disabled={true}
                    label="Mã số thuế"
                    placeholder={(typeContract === '1') ? "Chọn khách hàng để xem SĐT" : "Chọn đối tác để xem MST"}
                    value={(typeContract === '1' ? dataCustomer?.taxCode : dataPartner?.taxCode) || ""}
                />
            ),
        },
        {
            name: "phoneCustomer",
            type: "custom",
            snippet: (
                <Input
                    id="phoneCustomer"
                    name="nameCustomer"
                    fill={true}
                    disabled={true}
                    label="Số điện thoại"
                    placeholder={(typeContract === '1') ? "Chọn khách hàng để xem SĐT" : "Chọn đối tác để xem SĐT"}
                    value={(typeContract === '1' ? dataCustomer?.phoneMasked : dataPartner?.phoneMasked) || ""}
                />
            ),
        },
        {
            name: "address",
            type: "custom",
            snippet: (
                <Input
                  id="address"
                  name="address"
                  label={`Địa chỉ ${typeContract === '1' ? '(ĐKKD)' : ''}`}
                  fill={true}
                  placeholder={(typeContract === '1') ? "Chọn khách hàng để xem SĐT" : "Chọn đối tác để xem địa chỉ"}
                  value={(typeContract === '1' ? dataCustomer?.address : dataPartner?.address) || ""}
                  disabled={true}
                />
            ),
        },

        ...(typeContract === '1' ? [
            {
                name: "sourceName",
                type: "custom",
                snippet: (
                    <Input
                        id="sourceName"
                        name="sourceName"
                        label="Đối tượng khách hàng"
                        fill={true}
                        placeholder={dataCustomer?.value ? "" : "Vui lòng chọn khách hàng"}
                        value={dataCustomer?.sourceName || ""}
                        disabled={true}
                    />
                ),
            },
    
            {
                name: "groupName",
                type: "custom",
                snippet: (
                    <Input
                        id="groupName"
                        name="groupName"
                        label="Phân loại khách hàng"
                        fill={true}
                        placeholder={dataCustomer?.value ? "" : "Vui lòng chọn khách hàng"}
                        value={dataCustomer?.groupName || ""}
                        disabled={true}
                    />
                ),
            },
        ] : []),
        
       
      ] as IFieldCustomize[],
    [formData?.values, dataCustomer, dataPartner, typeContract]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);



  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body = {
        ...(formData.values as any),
        contractExtraInfos: contractExtraInfos,
    };

    const response = await ContractService.update(body);

    if (response.code === 0) {
        showToast(`Chỉnh sửa ${typeContract === '1' ? 'khách hàng' : 'đối tác'} thành công`, "success");
        setIsSubmit(false);
        onHide(true);
        setFormData({ values: values, errors: {} });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
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
              !isDifferenceObj(formData.values, values) ? handleClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác chỉnh sửa`}</Fragment>,
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
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClearForm = () => {
    onHide(false);
    setFormData({ values: values, errors: {} });
  }

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-edit-customer"
        size="lg"
      >
        <form className="form-edit-customer" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`Chỉnh sửa ${typeContract === '1' ? 'khách hàng' : 'đối tác'}`}
            toggle={() => {
              !isSubmit && handleClearForm();
            }}
          />
          <ModalBody>
            <div className="box-edit-customer">
                <div className="list-form-group">
                    {listFieldBasic.map((field, index) => (
                        <FieldCustomize
                            key={index}
                            field={field}
                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                            formData={formData}
                        />
                    ))}
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

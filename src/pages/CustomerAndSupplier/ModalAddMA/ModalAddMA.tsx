import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICampaignOpportunityRequestModel } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import CampaignService from "services/CampaignService";
import CustomerService from "services/CustomerService";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import "./ModalAddMA.scss";
import { ContextType, UserContext } from "contexts/userContext";
import MarketingAutomationService from "services/MarketingAutomationService";

export default function ModalAddMA(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, idData, idCustomer } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [data, setData] = useState(null);

  //   const getDetailMA = async () => {
  //     const response = await CampaignOpportunityService.detail(idData);

  //     if (response.code === 0) {
  //       const result: any = response.result;

  //       if (result.customerId) {
  //         setDataCustomer({ value: result.customerId, label: result.customerName, avatar: result.customerAvatar });
  //       }

  //       if (result.employeeId) {
  //         setDataEmployee({ value: result.employeeId, label: result.employeeName, avatar: result.employeeAvatar, phone: result.employeePhone });
  //       }

  //       setData({
  //         id: result.id,
  //         employeeId: result.employeeId,
  //         customerId: result.customerId,
  //         maId: result.maId,

  //       });
  //     }
  //   };

  //   useEffect(() => {
  //     if (onShow && idData) {
  //       getDetailMA();
  //     }
  //   }, [onShow, idData]);

  const values = useMemo(
    () =>
      ({
        employeeId: data?.employeeId ?? null,
        customerId: data?.customerId ?? null,
        maId: data?.maId ?? null,
      } as any),
    [onShow, data]
  );

  const validations: IValidation[] = [];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const getDetailCustomer = async (id: number) => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      const detailDataCustomer = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      };

      const detailDataEmployee = {
        value: result.employeeId,
        label: result.employeeName,
        avatar: result.employeeAvatar,
        phone: result.employeePhone,
      };

      setDataCustomer(detailDataCustomer);
      setDataEmployee(detailDataEmployee);
      setFormData({ ...formData, values: { ...formData?.values, customerId: result.id, employeeId: result.employeeId } });
    }

    setIsLoadingCustomer(false);
  };

  // Nếu như có id khách hàng fill mặc định khách hàng vào và không cho sửa
  useEffect(() => {
    if (idCustomer && onShow) {
      getDetailCustomer(idCustomer);
    }
  }, [idCustomer, onShow]);

  // Xử lý dữ liệu khách hàng, nhân viên
  const [dataCustomer, setDataCustomer] = useState(null);
  const [dataEmployee, setDataEmployee] = useState(null);
  const [checkFieldCustomer, setCheckFieldCustomer] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách khách hàng
  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
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
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  employeeId: item.employeeId,
                  employeeName: item.employeeName,
                  employeeAvatar: item.employeeAvatar,
                  employeePhone: item.employeePhone,
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

  const handleChangeValueCustomer = (e) => {
    setCheckFieldCustomer(false);
    setDataCustomer(e);

    setFormData({ ...formData, values: { ...formData?.values, customerId: e.value, employeeId: e.employeeId } });
  };

  // lấy người bán
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const [dataSale, setDataSale] = useState(null);
  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  //   const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
  //     const param: IEmployeeFilterRequest = {
  //       name: search,
  //       page: page,
  //       limit: 10,
  //       // branchId: dataBranch.value,
  //     };

  //     if(dataCampaign.type === 'biz' || dataCampaign.saleDistributionType === 'manual'){
  //       const response = await EmployeeService.list(param);

  //       if (response?.code === 0) {
  //         const dataOption = response.result.items;

  //         return {
  //           options: [
  //             ...(dataOption.length > 0
  //               ? dataOption.map((item) => {
  //                   return {
  //                     value: item.id,
  //                     label: item.name,
  //                     avatar: item.avatar,
  //                     departmentName: item.departmentName,
  //                     branchName: item.branchName
  //                   };
  //                 })
  //               : []),
  //           ],
  //           hasMore: response.result.loadMoreAble,
  //           additional: {
  //             page: page + 1,
  //           },
  //         };
  //       }

  //       return { options: [], hasMore: false };
  //     } else {

  //       const response = await CampaignService.listSale({campaignId: dataCampaign?.value});

  //       if (response?.code === 0) {
  //         const dataOption = response.result;

  //         let optionSale = [];
  //         if(dataOption && dataOption.length > 0){
  //           dataOption.map(item => {
  //             if(item.employeeId){
  //               optionSale.push({
  //                 value: item.employeeId,
  //                 label: item.employeeName,
  //                 avatar: item.employeeAvatar,
  //                 departmentName: item.departmentName,
  //                 branchName: item.branchName
  //               })
  //             }
  //           })
  //         }

  //         return {
  //           options: optionSale,
  //           // options: [
  //           //   ...(dataOption.length > 0
  //           //     ? dataOption.map((item) => {
  //           //         return {
  //           //           value: item.employeeId,
  //           //           label: item.employeeName,
  //           //           avatar: item.employeeAvatar,
  //           //         };
  //           //       })
  //           //     : []),
  //           // ],
  //           hasMore: false,
  //           additional: {
  //             page: page + 1,
  //           },
  //         };
  //       }

  //       return { options: [], hasMore: false };

  //     }

  //   };

  //   const formatOptionLabelEmployee = ({ label, avatar, departmentName, branchName }) => {
  //     return (
  //       <div className="selected--item">
  //         <div className="avatar">
  //           <img src={avatar || ImageThirdGender} alt={label} />
  //         </div>
  //         <div>
  //           <div>
  //             {label}
  //           </div>
  //           <div>
  //             <span style={{fontSize: 10, fontWeight:'200', marginTop: 3}}>
  //               {`${departmentName} (${branchName})`}
  //             </span>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   };

  //   const handleChangeValueEmployee = (e) => {
  //     setCheckFieldEmployee(false);
  //     setDataSale(e);
  //     setFormData({ ...formData, values: { ...formData?.values, saleId: e.value } });
  //   };

  // Xử lý vấn đề lấy danh sách chiến dịch, phương pháp tiếp cận
  const [dataMA, setDataMA] = useState(null);
  const [checkFieldMA, setCheckFieldMA] = useState<boolean>(false);

  const loadedOptionMA = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      status: 1,
    };

    const response = await MarketingAutomationService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  startDate: item.startDate,
                  endDate: item.endDate,
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

  const formatOptionLabelMA = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueMA = (e) => {
    setCheckFieldMA(false);
    setDataMA(e);
    setDataCustomer(null);
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        maId: e.value,
      },
    });
  };

  const getDetailMA = async (id: number) => {
    const response = await CampaignService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDataMA({
        value: result.id,
        label: result.name,
        avatar: result.cover,
        startDate: result.startDate,
        endDate: result.endDate,
        type: result.type,
        saleDistributionType: result.saleDistributionType,
      });

      // loadCampaignApproaches(result.id);
    }
  };

  useEffect(() => {
    if (data?.maId) {
      getDetailMA(data?.maId);
    }
  }, [data?.maId]);

  const listField = useMemo(
    () =>
      [
        {
          name: "maId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="maId"
              name="maId"
              label="Quản lý Marketing Automation"
              options={[]}
              fill={true}
              value={dataMA}
              required={true}
              onChange={(e) => handleChangeValueMA(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn chương trình"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionMA}
              formatOptionLabel={formatOptionLabelMA}
              error={checkFieldMA}
              message="Chương tình MA không được để trống"
              // disabled={data?.id ? true : false}
            />
          ),
        },

        // {
        //   label: "Ngày bắt đầu",
        //   name: "startDate",
        //   type: "date",
        //   fill: true,
        //   icon: <Icon name="Calendar" />,
        //   iconPosition: "left",
        //   placeholder: "Nhập ngày bắt đầu",
        //   disabled: true,
        // },
        // {
        //   label: "Ngày kết thúc",
        //   name: "endDate",
        //   type: "date",
        //   fill: true,
        //   icon: <Icon name="Calendar" />,
        //   iconPosition: "left",
        //   placeholder: "Nhập ngày kết thúc",
        //   disabled: true,
        // },
        // {
        //     name: "customerId",
        //     type: "custom",
        //     snippet: (
        //       <SelectCustom
        //         key={dataCampaign?.type}
        //         id="customerId"
        //         name="customerId"
        //         label="Khách hàng"
        //         options={[]}
        //         fill={true}
        //         value={dataCustomer}
        //         required={true}
        //         onChange={(e) => handleChangeValueCustomer(e)}
        //         isAsyncPaginate={true}
        //         isFormatOptionLabel={true}
        //         placeholder="Chọn khách hàng"
        //         additional={{
        //           page: 1,
        //         }}
        //         loadOptionsPaginate={loadedOptionCustomer}
        //         formatOptionLabel={formatOptionLabelCustomer}
        //         error={checkFieldCustomer}
        //         message="Khách hàng không được bỏ trống"
        //         // disabled={data?.id || idCustomer ? true : false}
        //         disabled={idCustomer ? true : false}
        //         isLoading={idCustomer ? isLoadingCustomer : null}
        //       />
        //     ),
        // },
      ] as IFieldCustomize[],
    [dataCustomer, checkFieldCustomer, data, dataEmployee, formData?.values, idCustomer, isLoadingCustomer]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (!dataMA) {
      setCheckFieldMA(true);
      return;
    }

    setIsSubmit(true);

    const body: ICampaignOpportunityRequestModel = {
      ...(formData.values as ICampaignOpportunityRequestModel),
      ...(data ? { id: data.id } : {}),
    };

    let response;
    // if (isBatch) {
    //   response = await CampaignOpportunityService.updateBatch(body);
    // } else {
    //   response = await CampaignOpportunityService.update(body);
    // }

    if (response.code === 0) {
      setTimeout(() => {
        onHide(true);
        setDataCustomer(null);
        setDataEmployee(null);
        setCheckFieldCustomer(false);
        setCheckFieldMA(false);
        setDataMA(null);
        setData(null);
        // showToast(`${data ? "Cập nhật" : "Thêm mới"} cơ hội thành công`, "success");
        setData(null);
      }, 3000);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDataCustomer(null);
    setDataEmployee(null);
    setDataMA(null);
    setCheckFieldMA(false);
    setData(null);
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
              !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: idData ? "Cập nhật" : "Thêm",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              //   checkFieldCustomer ||
              checkFieldMA ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldCustomer, idData, checkFieldMA, checkFieldEmployee]
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
        setShowDialog(false);
        setContentDialog(null);
        handClearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

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
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => !isSubmit && onHide(false)} className="modal-add-ma">
        <form className="form-add-ma" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${idData ? "Chỉnh sửa" : "Thêm mới"} khách hàng vào MA`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="list-form-group-addMA">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ImageThirdGender from "assets/images/third-gender.png";
import { useActiveElement } from "utils/hookCustom";
import { handleChangeValidate } from "utils/validate";
import EmployeeService from "services/EmployeeService";
import { ContextType, UserContext } from "contexts/userContext";

import "./FilterAdvanceModal.scss";
import CustomerSourceService from "services/CustomerSourceService";
import ModalAddNameFilter from "./ModalAddNameFilter/ModalAddNameFilter";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";

export default function FilterAdvanceModal(props: any) {
  const { onShow, onHide, filterAdvance, setFilterAdvance, takeParamsUrl, takeUrlFilterAdvance, params } = props;
  console.log('takeParamsUrl', takeParamsUrl);
  console.log('takeUrlFilterAdvance', takeUrlFilterAdvance);
  
  //   const takeEmployeeId = localStorage.getItem("employeeId_local") && JSON.parse(localStorage.getItem("employeeId_local")) || null;

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [listFilterOption, setListFilterOption] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);

  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();
    if (response.code == 0) {
      const result = response.result;
      setEmployeeId(result?.id);
      const takeFilterOption =
        (localStorage.getItem(`listFilterOption_${result?.id}`) && JSON.parse(localStorage.getItem(`listFilterOption_${result?.id}`))) || null;

      if (takeFilterOption?.length > 0 && takeFilterOption[0].employeeId === result.id) {
        setListFilterOption(takeFilterOption);
      }
    }
  };

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isAddNameFilter, setIsAddNameFilter] = useState(false);
  const [dataEmployee, setDataEmployee] = useState(null);
  const [dataCustomerSource, setDataCustomerSource] = useState(null);
  const [dataCallStatus, setDataCallStatus] = useState(null);  
  const [dataStatusCashloan, setDataStatusCashloan] = useState(null);  
  const [dataStatusCreditline, setDataStatusCreditline] = useState(null);
  const [dataStatusTBoss, setDataStatusTBoss] = useState(null);

  const extractStatusData = (customerExtraInfo, fieldName) => {
    const item = customerExtraInfo.find(info => info.fieldName === fieldName);
    if (!item || !item.attributeValue) return [];
    
    return item.attributeValue.split("::").filter(el => el !== 'empty').map(el => ({
      value: el,
      label: el === "empty" ? "Chưa có trạng thái" : el,
    }));
  };

  useEffect(() => {
    if (takeParamsUrl && takeUrlFilterAdvance && onShow) {
      if (takeParamsUrl.sourceIds && takeUrlFilterAdvance.sourceIds) {
        setDataCustomerSource(takeUrlFilterAdvance.sourceIds);
      } else {
        setDataCustomerSource([]);
      }

      if (takeParamsUrl.employeeIds && takeUrlFilterAdvance.employeeIds) {
        setDataEmployee(takeUrlFilterAdvance.employeeIds);
      } else {
        setDataEmployee([]);
      }

      if (takeParamsUrl.callStatuses && takeUrlFilterAdvance.callStatuses) {
        setDataCallStatus(takeUrlFilterAdvance.callStatuses);
      } else {
        setDataCallStatus([]);
      }

      if (takeParamsUrl.customerExtraInfo && takeUrlFilterAdvance.customerExtraInfo) {
        const paramsCustomerExtraInfo = params?.customerExtraInfo && JSON.parse(params?.customerExtraInfo)
        const customerExtraInfo = [...paramsCustomerExtraInfo];
        // const customerExtraInfo = [...takeUrlFilterAdvance.customerExtraInfo];

        console.log('customerExtraInfo12', customerExtraInfo);
        
        
        if (customerExtraInfo.length > 0) {
          setDataStatusCashloan(extractStatusData(customerExtraInfo, "Trangthaikhoanvaycashloan"));
          setDataStatusCreditline(extractStatusData(customerExtraInfo, "Trangthaikhoanvaycreditline"));
          setDataStatusTBoss(extractStatusData(customerExtraInfo, "TrangThaiKhoanVayTBoss"));
        }
        
        
      } else {
        setDataStatusCashloan([]);
        setDataStatusCreditline([]);
        setDataStatusTBoss([]);
      }
      getDetailEmployeeInfo();
    }
  }, [takeParamsUrl, takeUrlFilterAdvance, onShow, params]);

  const values = useMemo(
    () => ({
      employeeIds: filterAdvance?.employeeIds || [],
      sourceIds: filterAdvance?.sourceIds || [],
      callStatuses: filterAdvance?.callStatuses || [],
      customerExtraInfo: filterAdvance?.customerExtraInfo || [],
    }),
    [filterAdvance, onShow]
  );

  const validations: IValidation[] = [];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items || [];
      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
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

  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
    const takeIdEmployee = e.map((item) => item.value);
    setFormData({ ...formData, values: { ...formData?.values, employeeIds: e } });
  };

  //! đoạn này xử lý call api lấy ra thông tin nguồn khách hàng
  const loadOptionCustomerSource = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 100,
    };
    const response = await CustomerSourceService.list(param);

    if (response.code === 0) {
      const dataOption = response.result?.items;

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
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueCustomerSource = (e) => {
    setDataCustomerSource(e);
    const takeId = e.map((item) => item.value);
    setFormData({ ...formData, values: { ...formData?.values, sourceIds: e } });
  };

  //   const formatOptionLabelCustomer = ({ label, avatar }) => {
  //     return (
  //       <div className="selected--item">
  //         <div className="avatar">
  //           <img src={avatar || ImageThirdGender} alt={label} />
  //         </div>
  //         {label}
  //       </div>
  //     );
  //   };

  const handleChangeValueCallStatus = (e) => {
    setDataCallStatus(e);
    const takeId = e.map((item) => item.value);
    setFormData({ ...formData, values: { ...formData?.values, callStatuses: e } });
  };

  const handleChangeValueStatusCashloan = (e) => {
    setDataStatusCashloan(e);
    // const dataStatusCashloan = e.map(item => {
    //   return  {
    //     fieldName: 'Trangthaikhoanvaycashloan',
    //     attributeValue: item.value
    //   }
    // })
    // setFormData({ ...formData, values: { ...formData?.values, customerExtraInfo: [...formData?.values.customerExtraInfo, dataStatusCashloan] } });
  };

  const handleChangeValueStatusCreditline = (e) => {
    setDataStatusCreditline(e);
  };

  const handleChangeValueStatusTBoss = (e) => {
    setDataStatusTBoss(e);
  };

  const listField = useMemo(
    () =>
      [
        {
          name: "employeeIds",
          type: "custom",
          snippet: (
            <SelectCustom
              id="employeeIds"
              name="employeeIds"
              label="Người phụ trách"
              fill={true}
              options={[]}
              isMulti={true}
              value={dataEmployee}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionEmployee}
              placeholder="Chọn người phụ trách"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelEmployee}
            />
          ),
        },

        {
          name: "sourceIds",
          type: "custom",
          snippet: (
            <SelectCustom
              id="sourceIds"
              name="sourceIds"
              label="Nguồn khách hàng"
              fill={true}
              options={[]}
              isMulti={true}
              value={dataCustomerSource}
              onChange={(e) => handleChangeValueCustomerSource(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadOptionCustomerSource}
              placeholder="Chọn nguồn khách hàng"
              additional={{
                page: 1,
              }}
              //   formatOptionLabel={formatOptionLabelCustomer}
            />
          ),
        },

        {
          name: "callStatuses",
          type: "custom",
          snippet: (
            <SelectCustom
              id="callStatuses"
              name="callStatuses"
              label="Trạng thái cuộc gọi"
              fill={true}
              options={[
                // {
                //     value: 'empty',
                //     label: 'Chưa có trạng thái'
                // },
                {
                  value: "KH không nghe máy",
                  label: "KH không nghe máy",
                },
                {
                  value: "KH bận gọi lại sau",
                  label: "KH bận gọi lại sau",
                },
                {
                  value: "SĐT khách hàng thuê bao",
                  label: "SĐT khách hàng thuê bao",
                },
                {
                  value: "SĐT không đúng hoặc đang tạm khóa",
                  label: "SĐT không đúng hoặc đang tạm khóa",
                },
                {
                  value: "KH đăng ký bằng SĐT khác",
                  label: "KH đăng ký bằng SĐT khác",
                },
                {
                  value: "KH đã thực hiện đăng ký khoản vay trước đó",
                  label: "KH đã thực hiện đăng ký khoản vay trước đó",
                },
                {
                  value: "KH đang cân nhắc khoản vay, gọi lại hỗ trợ sau",
                  label: "KH đang cân nhắc khoản vay, gọi lại hỗ trợ sau",
                },
                {
                  value: "KH từ chối đăng ký do không đủ điều kiện vay",
                  label: "KH từ chối đăng ký do không đủ điều kiện vay",
                },
                {
                  value: "KH nghe máy, không có nhu cầu vay",
                  label: "KH nghe máy, không có nhu cầu vay",
                },
                {
                  value: "(Cashloan) KH đồng ý vay nhưng chưa thực hiện đăng ký",
                  label: "(Cashloan) KH đồng ý vay nhưng chưa thực hiện đăng ký",
                },
                {
                  value: "(T-Boss) KH đồng ý vay nhưng chưa thực hiện đăng ký",
                  label: "(T-Boss) KH đồng ý vay nhưng chưa thực hiện đăng ký",
                },
                {
                  value: "(Cashloan) KH đăng ký thành công",
                  label: "(Cashloan) KH đăng ký thành công",
                },
                {
                  value: "(T-Boss) KH đăng ký thành công",
                  label: "(T-Boss) KH đăng ký thành công",
                },
              ]}
              isMulti={true}
              value={dataCallStatus}
              special={true}
              onChange={(e) => handleChangeValueCallStatus(e)}
              isAsyncPaginate={false}
              isFormatOptionLabel={false}
              // loadOptionsPaginate={loadOptionCustomerSource}
              placeholder="Chọn trạng thái cuộc gọi"
              // additional={{
              //   page: 1,
              // }}
              //   formatOptionLabel={formatOptionLabelCustomer}
            />
          ),
        },
      ] as IFieldCustomize[],
    [dataEmployee, dataCustomerSource, dataCallStatus, dataBranch, filterAdvance, formData]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const createCollectStatus = (fieldName, data) => {
    if (!data?.length) return null;
    return {
      fieldName,
      attributeValue: data.map((item) => item.value).join("::"),
      datatype: "list_string",
      operator: "in",
    };
  };

  const onSubmit = (e) => {
    e && e.preventDefault();

    if (formData?.values) {
      const collectEmployee = [...formData?.values?.employeeIds];
      const collectCustomerSource = [...formData?.values?.sourceIds];
      const collectCallStatus = [...formData?.values?.callStatuses];

      const collectStatusCashloan = createCollectStatus("Trangthaikhoanvaycashloan", dataStatusCashloan);
      const collectStatusCreditline = createCollectStatus("Trangthaikhoanvaycreditline", dataStatusCreditline);
      const collectStatusTBoss = createCollectStatus("TrangThaiKhoanVayTBoss", dataStatusTBoss);      
      
      //lấy ra danh sách trường động đang lọc
      let paramsCustomerExtraInfo = params?.customerExtraInfo && JSON.parse(params?.customerExtraInfo) || [];
      
      // Danh sách các status thu được
      const collectStatuses = [collectStatusCashloan, collectStatusCreditline, collectStatusTBoss].filter(Boolean);
      
      // Lọc bỏ fieldName trùng trong paramsCustomerExtraInfo
      const excludeFieldNames = collectStatuses.map((s) => s.fieldName);
      
      const filteredParamsExtra = paramsCustomerExtraInfo?.filter((el) => !excludeFieldNames.includes(el.fieldName));
      
      // Kết hợp lại dữ liệu mới
      const customerExtraInfo = [...filteredParamsExtra, ...collectStatuses];

      setFilterAdvance({
        employeeIds: collectEmployee,
        sourceIds: collectCustomerSource,
        callStatuses: collectCallStatus,
        customerExtraInfo,

        // customerExtraInfo: [...(paramsCustomerExtraInfo ? [...paramsCustomerExtraInfo] : []),...customerExtraInfo],
      });
      onHide();
    }
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác tìm kiếm</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide();
        setShowDialog(false);
        setContentDialog(null);
        clearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Lưu bộ lọc",
            color: "primary",
            // variant: "outline",
            disabled: isSubmit,
            callback: () => {
              setIsAddNameFilter(true);
            },
          },
          {
            title: "Huỷ tìm kiếm",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              //   !isDifferenceObj(formData.values, values) ? onHide() : showDialogConfirmCancel();
              clearForm();
              setFilterAdvance({
                employeeIds: [],
                sourceIds: [],
                callStatuses: [],
                customerExtraInfo: [],
              });
            },
          },
          {
            title: "Tìm kiếm",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            // (!isDifferenceObj(formData.values, values) && !formData.values.branchId) ||
            // dataStatusCashloan.length === 0,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, filterAdvance, dataStatusCashloan, dataStatusCreditline]
  );

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
          onHide();
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

  const clearForm = () => {
    onHide();
    setDataEmployee(null);
    setDataCustomerSource(null);
    setDataCallStatus(null);
    setDataStatusCashloan(null);
    setDataStatusCreditline(null);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          if (!isSubmit) {
            clearForm();
          }
        }}
        className="modal-filter-customer-advance"
        size="lg"
      >
        <form className="form-filter-customer-advance-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title="Dữ liệu tìm kiếm"
            toggle={() => {
              if (!isSubmit) {
                clearForm();
              }
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              {listFilterOption?.length > 0 ? (
                <div>
                  <div style={{ marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: "600" }}>Bộ lọc đã lưu</span>
                  </div>
                  <div className="filter-option">
                    {listFilterOption.map((item, index) => (
                      <div key={index} className="filter-item">
                        <div
                          onClick={() => {
                            // setFilterAdvance(item.data);
                            setFormData({ ...formData, values: item.data });
                            setDataEmployee(item.data.employeeIds);
                            setDataCustomerSource(item.data.sourceIds);
                            setDataCallStatus(item.data.callStatuses);

                            if (item.data.customerExtraInfo?.length > 0) {
                              if (item.data.customerExtraInfo.filter((el) => el.fieldName === "Trangthaikhoanvaycashloan")?.length > 0) {
                                const newData = item.data.customerExtraInfo
                                  .filter((el) => el.fieldName === "Trangthaikhoanvaycashloan")
                                  .map((item) => {
                                    return {
                                      value: item.attributeValue,
                                      label: item.attributeValue,
                                    };
                                  });
                                setDataStatusCashloan(newData);
                              }

                              if (item.data.customerExtraInfo.filter((el) => el.fieldName === "Trangthaikhoanvaycreditline")?.length > 0) {
                                const newData = item.data.customerExtraInfo
                                  .filter((el) => el.fieldName === "Trangthaikhoanvaycreditline")
                                  .map((item) => {
                                    return {
                                      value: item.attributeValue,
                                      label: item.attributeValue,
                                    };
                                  });
                                setDataStatusCreditline(newData);
                              }

                              if (item.data.customerExtraInfo.filter((el) => el.fieldName === "TrangThaiKhoanVayTBoss")?.length > 0) {
                                const newData = item.data.customerExtraInfo
                                  .filter((el) => el.fieldName === "TrangThaiKhoanVayTBoss")
                                  .map((item) => {
                                    return {
                                      value: item.attributeValue,
                                      label: item.attributeValue,
                                    };
                                  });
                                setDataStatusTBoss(newData);
                              }
                            }
                          }}
                        >
                          <span style={{ fontSize: 14, fontWeight: "400" }}>{item.name}</span>
                        </div>
                        <Tippy content={"Xoá"}>
                          <div
                            className="icon-remove"
                            onClick={() => {
                              const listFilter = [...listFilterOption];
                              listFilter.splice(index, 1);
                              setListFilterOption(listFilter);
                              localStorage.setItem(`listFilterOption_${employeeId}`, JSON.stringify(listFilter));
                            }}
                          >
                            <Icon name="Trash" />
                          </div>
                        </Tippy>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}

              <div className="form-group">
                <SelectCustom
                  id="Trangthaikhoanvaycashloan"
                  name="Trangthaikhoanvaycashloan"
                  label="Trạng thái khoản vay Cashloan"
                  fill={true}
                  options={[
                    // {
                    //   value: 'empty',
                    //   label: 'Chưa có trạng thái'
                    // },
                    {
                      value: "Đã khởi tạo đơn vay (AUTHENTICATE)",
                      label: "Đã khởi tạo đơn vay (AUTHENTICATE)",
                    },
                    {
                      value: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
                      label: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
                    },
                    {
                      value: "Khoản vay bị từ chối (REJECTED)",
                      label: "Khoản vay bị từ chối (REJECTED)",
                    },
                    {
                      value: "Khoản vay bị từ chối, cho đăng ký lại (TEMP_REJECT)",
                      label: "Khoản vay bị từ chối, cho đăng ký lại (TEMP_REJECT)",
                    },
                    {
                      value: "Chờ giải ngân (For_Disbursement)",
                      label: "Chờ giải ngân (For_Disbursement)",
                    },
                    {
                      value: "Đã giải ngân (CLOSED)",
                      label: "Đã giải ngân (CLOSED)",
                    },
                    {
                      value: "Chưa có khoản vay (null,Init,Draft)",
                      label: "Chưa có khoản vay (null,Init,Draft)",
                    },
                    {
                      value: "Chờ KH ký hợp đồng (Forsign)",
                      label: "Chờ KH ký hợp đồng (Forsign)",
                    },
                    {
                      value: "Quá hạn ký hợp đồng (Expired)",
                      label: "Quá hạn ký hợp đồng (Expired)",
                    },
                  ]}
                  isMulti={true}
                  value={dataStatusCashloan}
                  special={true}
                  onChange={(e) => handleChangeValueStatusCashloan(e)}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  // loadOptionsPaginate={loadOptionCustomerSource}
                  placeholder="Chọn trạng thái khoản vay Cashloan"
                  // additional={{
                  //   page: 1,
                  // }}
                  //   formatOptionLabel={formatOptionLabelCustomer}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="Trangthaikhoanvaycreditline"
                  name="Trangthaikhoanvaycreditline"
                  label="Trạng thái khoản vay creditline"
                  fill={true}
                  options={[
                    // {
                    //   value: 'empty',
                    //   label: 'Chưa có trạng thái'
                    // },
                    {
                      value: "Chưa có khoản vay (null,Init,Draft)",
                      label: "Chưa có khoản vay (null,Init,Draft)",
                    },
                    {
                      value: "Đã khởi tạo đơn vay (Signed)",
                      label: "Đã khởi tạo đơn vay (Signed)",
                    },
                    {
                      value: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
                      label: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
                    },
                    {
                      value: "Khoản vay bị từ chối (REJECTED)",
                      label: "Khoản vay bị từ chối (REJECTED)",
                    },
                    {
                      value: "Đã cấp hạn mức (Disbursement)",
                      label: "Đã cấp hạn mức (Disbursement)",
                    },
                    {
                      value: "Đã giải ngân (CLOSED)",
                      label: "Đã giải ngân (CLOSED)",
                    },
                  ]}
                  isMulti={true}
                  value={dataStatusCreditline}
                  special={true}
                  onChange={(e) => handleChangeValueStatusCreditline(e)}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  // loadOptionsPaginate={loadOptionCustomerSource}
                  placeholder="Chọn trạng thái khoản vay creditline"
                  // additional={{
                  //   page: 1,
                  // }}
                  //   formatOptionLabel={formatOptionLabelCustomer}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="TrangThaiKhoanVayTBoss"
                  name="TrangThaiKhoanVayTBoss"
                  label="Trạng thái khoản vay T-Boss"
                  fill={true}
                  options={[
                    // {
                    //   value: 'empty',
                    //   label: 'Chưa có trạng thái'
                    // },
                    {
                      value: "Đã khởi tạo đơn vay (AUTHENTICATE)",
                      label: "Đã khởi tạo đơn vay (AUTHENTICATE)",
                    },
                    {
                      value: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
                      label: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
                    },
                    {
                      value: "Khoản vay bị từ chối (REJECTED)",
                      label: "Khoản vay bị từ chối (REJECTED)",
                    },
                    {
                      value: "Khoản vay bị từ chối, cho đăng ký lại (TEMP_REJECT)",
                      label: "Khoản vay bị từ chối, cho đăng ký lại (TEMP_REJECT)",
                    },
                    {
                      value: "Chờ giải ngân (For_Disbursement)",
                      label: "Chờ giải ngân (For_Disbursement)",
                    },
                    {
                      value: "Đã giải ngân (CLOSED)",
                      label: "Đã giải ngân (CLOSED)",
                    },
                    {
                      value: "Chưa có khoản vay (null,Init,Draft)",
                      label: "Chưa có khoản vay (null,Init,Draft)",
                    },
                    {
                      value: "Chờ KH ký hợp đồng (Forsign)",
                      label: "Chờ KH ký hợp đồng (Forsign)",
                    },
                    {
                      value: "Chờ KH ký hợp đồng (Forsign)",
                      label: "Chờ KH ký hợp đồng (Forsign)",
                    },
                    {
                      value: "Quá hạn ký hợp đồng (Expired)",
                      label: "Quá hạn ký hợp đồng (Expired)",
                    },
                    {
                      value: "Chờ thông tin DTM (WAITING_DATAMART)",
                      label: "Chờ thông tin DTM (WAITING_DATAMART)",
                    },
                  ]}
                  isMulti={true}
                  value={dataStatusTBoss}
                  special={true}
                  onChange={(e) => handleChangeValueStatusTBoss(e)}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  // loadOptionsPaginate={loadOptionCustomerSource}
                  placeholder="Chọn trạng thái khoản vay T-Boss"
                  // additional={{
                  //   page: 1,
                  // }}
                  //   formatOptionLabel={formatOptionLabelCustomer}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalAddNameFilter
        onShow={isAddNameFilter}
        listFilterOption={listFilterOption}
        dataStatusCashloan={dataStatusCashloan}
        dataStatusCreditline={dataStatusCreditline}
        dataFilter={formData?.values}
        employeeId={employeeId}
        setListFilterOption={setListFilterOption}
        onHide={() => {
          setIsAddNameFilter(false);
        }}
      />
    </Fragment>
  );
}

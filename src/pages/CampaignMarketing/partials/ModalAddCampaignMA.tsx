import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Input from "components/input/input";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import "./ModalAddCampaignMA.scss";
import { ContextType, UserContext } from "contexts/userContext";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import FileUpload from "components/fileUpload/fileUpload";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import ServiceService from "services/ServiceService";
import ProductService from "services/ProductService";
import NummericInput from "components/input/numericInput";
import CampaignMarketingService from "services/CampaignMarketingService";

export default function ModalAddCampaignMA(props: any) {
  const { onShow, onHide, idData } = props;
  console.log("idData", idData);

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [data, setData] = useState(null);

  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();

    if (response.code == 0) {
      const result = response.result;
      setDataEmployee({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        departmentName: result.departmentName,
        branchName: result.branchName,
      });
      setFormData({ ...formData, values: { ...formData?.values, employeeId: result.id } });
    }
  };

  useEffect(() => {
    if (onShow && !idData) {
      getDetailEmployeeInfo();
    }
  }, [onShow, data, idData]);

  const getDetailCampaignMA = async () => {
    const response = await CampaignMarketingService.detail(idData);

    if (response.code === 0) {
      const result: any = response.result;

      if (result.employeeId) {
        setDataEmployee({ value: result.employeeId, label: result.employeeName, avatar: result.employeeAvatar });
      }

      if (result?.lstCoordinator && result?.lstCoordinator.length > 0) {
        const newLstCoordinator = result?.lstCoordinator?.map((item) => {
          return {
            value: item.id,
            label: item.name,
            avatar: item.avatar,
            departmentName: item.departmentName,
            branchName: item.branchName,
          };
        });
        setLstCoordinator(newLstCoordinator || []);
      }

      if (result?.lstProduct && result?.lstProduct.length > 0) {
        const newLstProduct = result?.lstProduct?.map((item) => {
          return {
            value: item.id,
            label: item.name,
            avatar: item.avatar,
          };
        });
        setDataProducts(newLstProduct || []);
      }

      if (result?.lstService && result?.lstService.length > 0) {
        const newLstProduct = result?.lstService?.map((item) => {
          return {
            value: item.id,
            label: item.name,
            avatar: item.avatar,
          };
        });
        setDataServices(newLstProduct || []);
      }

      setData({
        id: result.id,
        code: result?.code ?? "",
        name: result?.name ?? "",
        cover: result?.cover ?? "",
        startDate: result?.startDate ?? "",
        endDate: result?.endDate ?? "",
        employeeId: result?.employeeId ?? null,
        coordinators: result?.coordinators ?? "[]",
        totalBudget: result?.totalBudget ?? "",
        services: result?.services ?? "[]",
        products: result?.products ?? "[]",
        status: result?.status ?? "1",
      });
    }
  };

  useEffect(() => {
    if (onShow && idData) {
      getDetailCampaignMA();
    }
  }, [onShow, idData]);

  const values = useMemo(
    () =>
      ({
        code: data?.code ?? "",
        name: data?.name ?? "",
        cover: data?.cover ?? "",
        startDate: data?.startDate ?? "",
        endDate: data?.endDate ?? "",
        employeeId: data?.employeeId ?? null,
        coordinators: data?.coordinators ?? "[]",
        totalBudget: data?.totalBudget ?? "",
        services: data?.services ?? "[]",
        products: data?.products ?? "[]",
        status: data?.status ?? "1",
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

  // lấy thông tin ngày bắt đầu chiến dịch, và ngày cuối cùng chiến dịch
  const startDay = new Date(formData.values.startDate).getTime();
  const endDay = new Date(formData.values.endDate).getTime();

  //* ngày bắt đầu
  const [checkFieldStartDate, setCheckFieldStartDate] = useState<boolean>(false);
  const handleChangeValueStartDate = (e) => {
    setCheckFieldStartDate(false);

    setFormData({ ...formData, values: { ...formData?.values, startDate: e } });
  };

  //* ngày kết thúc
  const [checkFieldEndDate, setCheckFieldEndDate] = useState<boolean>(false);
  const handleChangeValueEndDate = (e) => {
    setCheckFieldEndDate(false);

    setFormData({ ...formData, values: { ...formData?.values, endDate: e } });
  };

  // người phụ trách
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const [dataEmployee, setDataEmployee] = useState(null);
  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await EmployeeService.list(param);

    if (response?.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  departmentName: item.departmentName,
                  branchName: item.branchName,
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

  const formatOptionLabelEmployee = ({ label, avatar, departmentName, branchName }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div>
          <div>{label}</div>
          {departmentName ? (
            <div>
              <span style={{ fontSize: 10, fontWeight: "200", marginTop: 3 }}>{`${departmentName}`}</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    setCheckFieldEmployee(false);
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };

  //người phối hợp
  const [lstCoordinator, setLstCoordinator] = useState([]);
  const handleChangeValueCoordinators = (e) => {
    setLstCoordinator(e);
    const newLstCoordinator = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, coordinators: JSON.stringify(newLstCoordinator) } });
  };

  //Chọn dịch vụ
  const [dataServices, setDataServices] = useState([]);
  //! đoạn này xử lý vấn đề lấy ra danh sách dịch vụ
  const loadedOptionService = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ServiceService.filter(param);

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

  const handleChangeValueServices = (e) => {
    setDataServices(e);
    const newServices = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, services: JSON.stringify(newServices) } });
  };

  //chọn sản phẩm
  const [dataProducts, setDataProducts] = useState([]);

  const loadedOptionProduct = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ProductService.list(param);

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

  const handleChangeValueProducts = (e) => {
    setDataProducts(e);
    const newProducts = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, products: JSON.stringify(newProducts) } });
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();

    // const errors = Validate(validations, formData);

    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    setIsSubmit(true);

    const body: any = {
      ...(formData.values as any),
      ...(data ? { id: data.id } : {}),
    };

    const response = await CampaignMarketingService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} chiến dịch Marketing thành công`, "success");
      handClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setData(null);
    setCheckFieldEmployee(false);
    setCheckFieldStartDate(false);
    setCheckFieldEndDate(false);
    setDataEmployee(null);
    setLstCoordinator([]);
    setDataServices([]);
    setDataProducts([]);
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
              !isDifferenceObj(formData.values, values) ? handClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: idData ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, idData, checkFieldEmployee]
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
        handClearForm(false);
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
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-add-campaign-marketing"
        size="lg"
      >
        <form className="form-add-campaign-marketing" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${idData ? "Chỉnh sửa" : "Thêm mới"} chiến dịch Marketing`} toggle={() => !isSubmit && handClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="box-avatar">
                <FileUpload label="Ảnh chiến dịch" type="cover" name="cover" formData={formData} setFormData={setFormData} />
              </div>
              <div className="box-name-code">
                <Input
                  label="Tên chiến dịch"
                  name="name"
                  fill={true}
                  required={true}
                  value={formData.values?.name}
                  placeholder="Tên chiến dịch"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, values: { ...formData.values, name: value } });
                  }}
                />

                <Input
                  label="Mã chiến dịch"
                  name="code"
                  fill={true}
                  required={true}
                  value={formData.values?.code}
                  placeholder="Mã chiến dịch"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, values: { ...formData.values, code: value } });
                  }}
                />
              </div>

              <div className="form-group">
                <DatePickerCustom
                  label="Ngày bắt đầu"
                  name="startDate"
                  fill={true}
                  value={formData?.values?.startDate}
                  onChange={(e) => handleChangeValueStartDate(e)}
                  placeholder="Chọn ngày bắt đầu"
                  required={false}
                  iconPosition="left"
                  icon={<Icon name="Calendar" />}
                  error={checkFieldStartDate || startDay > endDay}
                  message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày kết thúc" : "Vui lòng chọn ngày bắt đầu"}
                />
              </div>

              <div className="form-group">
                <DatePickerCustom
                  label="Ngày kết thúc"
                  name="endDate"
                  fill={true}
                  value={formData?.values?.endDate}
                  onChange={(e) => handleChangeValueEndDate(e)}
                  placeholder="Chọn ngày kết thúc"
                  required={false}
                  iconPosition="left"
                  icon={<Icon name="Calendar" />}
                  error={checkFieldEndDate || endDay < startDay}
                  message={endDay < startDay ? "Ngày kết thúc lớn hơn ngày bắt đầu" : "Vui lòng chọn ngày kết thúc"}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="employeeId"
                  name="employeeId"
                  label="Người phụ trách"
                  fill={true}
                  required={false}
                  // error={validateFieldPipeline}
                  // message="Loại hợp đồng không được bỏ trống"
                  options={[]}
                  value={dataEmployee}
                  onChange={(e) => handleChangeValueEmployee(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn người phụ trách"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEmployee}
                  formatOptionLabel={formatOptionLabelEmployee}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="coordinators"
                  name="coordinators"
                  label="Người phối hợp"
                  fill={true}
                  required={false}
                  isMulti={true}
                  // error={validateFieldPipeline}
                  // message="Loại hợp đồng không được bỏ trống"
                  options={[]}
                  value={lstCoordinator}
                  onChange={(e) => handleChangeValueCoordinators(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn người phối hợp"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEmployee}
                  formatOptionLabel={formatOptionLabelEmployee}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="services"
                  name="services"
                  label="Dịch vụ"
                  options={[]}
                  fill={true}
                  isMulti={true}
                  value={dataServices}
                  required={false}
                  onChange={(e) => handleChangeValueServices(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={false}
                  placeholder="Chọn dịch vụ"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionService}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="products"
                  name="product"
                  label="Sản phẩm"
                  options={[]}
                  fill={true}
                  isMulti={true}
                  value={dataProducts}
                  required={false}
                  onChange={(e) => handleChangeValueProducts(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={false}
                  placeholder="Chọn sản phẩm"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionProduct}
                />
              </div>

              <div className="form-group">
                <NummericInput
                  label="Tổng ngân sách"
                  name="totalBudget"
                  fill={true}
                  required={true}
                  thousandSeparator={true}
                  value={formData.values?.totalBudget}
                  placeholder="Tổng ngân sách"
                  onValueChange={(e) => {
                    const value = e.floatValue;
                    setFormData({ ...formData, values: { ...formData.values, totalBudget: value } });
                  }}
                />
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

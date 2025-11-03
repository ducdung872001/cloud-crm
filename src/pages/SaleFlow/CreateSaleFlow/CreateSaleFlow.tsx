import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, getSearchParameters, isDifferenceObj } from "reborn-util";
import Input from "components/input/input";
import { getPermissions, showToast } from "utils/common";
import SelectCustom from "components/selectCustom/selectCustom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import ImageThirdGender from "assets/images/third-gender.png";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { ContextType, UserContext } from "contexts/userContext";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import CampaignService from "services/CampaignService";
import { ICampaignRequestModel } from "model/campaign/CampaignRequestModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import "./CreateSaleFlow.scss";
import Icon from "components/icon";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import FileUpload from "components/fileUpload/fileUpload";
import { IAction, IActionModal } from "model/OtherModel";
import Validate from "utils/validate";
import NummericInput from "components/input/numericInput";
import Radio from "components/radio/radio";
import Button from "components/button/button";
import Tippy from "@tippyjs/react";
// import ModalSettingSLA from "./ModalSettingSLA";
// import ModalSettingActionApproach from "./ModalSettingActionApproach";
import Loading from "components/loading";
import SaleFlowService from "services/SaleFlowService";
import SaleflowApproachService from "services/SaleflowApproachService";
import ModalSettingActionApproach from "../ModalSettingActionApproach";
import ModalSettingSLA from "../ModalSettingSLA";
import ModalSaleDepartment from "../ModalSaleDepartment";

interface IDataApproach {
  id?: number;
  step?: number;
  name?: string;
  activities?: any;
  checkName?: boolean;
}

export default function CreateSaleflow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const refOptionSpecialize = useRef();
  const refContainerSpecialize = useRef();

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //Chia làm 2 bước cấu hình (1 - cài đặt thông tin cơ bản chiến dịch, 2 - Quy trình bán hàng)
  const [setupStep, setSetupStep] = useState<number>(1);
  // console.log('setupStep', setupStep);

  const [saleflowId, setSaleflowId] = useState<number>(0);

  const [listApproach, setListApproach] = useState<IDataApproach[]>([]);
  // console.log('listApproach', listApproach);

  useEffect(() => {
    if (id) {
      setSaleflowId(+id);
      //lấy danh sách các quy trình bán
      loadSaleflowApproaches(+id);
    }
  }, [id]);

  const dataStep = [
    {
      value: 1,
      label: "Thông tin quy trình bán hàng",
    },
    {
      value: 2,
      label: "Cài đặt quy trình bán hàng",
    },
  ];

  const [checkFieldApproach, setCheckFieldApproach] = useState<boolean>(false);

  const [isOptionRank, setIsOptionRank] = useState<boolean>(false);
  useOnClickOutside(refOptionSpecialize, () => setIsOptionRank(false), ["option__rank"]);

  const [data, setData] = useState(null);

  const handleDetailData = async () => {
    const response = await SaleFlowService.detail(+id);

    if (response.code === 0) {
      const result: any = response.result;

      if (result.employeeId) {
        setDataEmployee({
          value: result.employeeId,
          label: result.employeeName,
          avatar: result.employeeAvatar,
        });
      }

      setData({
        id: result.id,
        name: result.name,
        code: result.code,
        cover: result.cover,
        startDate: result.startDate,
        endDate: result.endDate,
        position: result.position,
        employeeId: result.employeeId,
        sales: result.sales,
        coordinators: result.coordinators,
      });

      //người phối hợp
      if (result.lstCoordinator?.length > 0) {
        const newCoordinator = result.lstCoordinator.map((item) => {
          return {
            value: item.id,
            label: item.name,
            avatar: item.avatar,
          };
        });

        setDataCoordinators(newCoordinator);
      }
    }
  };

  useEffect(() => {
    if (id) {
      handleDetailData();
    }
  }, [id]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        code: data?.code ?? "",
        cover: data?.cover ?? "",
        startDate: data?.startDate ?? "",
        endDate: data?.endDate ?? "",
        position: data?.position ?? "",
        employeeId: data?.employeeId ?? "",
        coordinators: data?.coordinators || "[]",
      } as any),
    [data]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // lấy người phụ trách
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const [dataEmployee, setDataEmployee] = useState(null);
  const [dataCoordinators, setDataCoordinators] = useState(null);

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
    setCheckFieldEmployee(false);
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };

  const handleChangeValueCoordinators = (e) => {
    setDataCoordinators(e);
    const newCoordinators = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, coordinators: JSON.stringify(newCoordinators) } });
  };

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

  // lấy thông tin ngày bắt đầu chiến dịch, và ngày cuối cùng chiến dịch
  const startDay = new Date(formData.values.startDate).getTime();
  const endDay = new Date(formData.values.endDate).getTime();

  const onSubmit = async () => {
    // e && e.preventDefault();

    // const errors = Validate(validations, formData, listField);

    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    if (!formData?.values?.employeeId) {
      setCheckFieldEmployee(true);
      return;
    }

    if (!formData?.values?.startDate) {
      setCheckFieldStartDate(true);
      return;
    }

    if (!formData?.values?.endDate) {
      setCheckFieldEndDate(true);
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(data || saleflowId ? { id: data?.id || saleflowId } : {}),
      ...(formData?.values as any),
    };

    console.log("body", body);

    const response = await SaleFlowService.update(body);

    if (response.code == 0) {
      // setDataEmployee(null);
      // setListSales([{ employee: null, rank: { label: "Khá", value: 6 } }]);
      // setLstIdSale([]);

      //Chuyển qua bước 2
      setSetupStep(2);
      setSaleflowId(response.result?.id);
      loadSaleflowApproaches(response.result?.id);
      showToast("Cài đặt thông tin quy trình bán hàng thành công", "success");
      // setValueBranch([]);
      // setDataDepartment([])
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const handClearForm = () => {
    navigate(`/sales_flow`);
  };

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
          navigate(`/sales_campaign`);
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

  ///step 2

  /**
   * Lấy danh sách Quy trình bán hàng
   */
  const loadSaleflowApproaches = async (saleflowId: number) => {
    const body: any = {
      saleflowId,
    };

    const response = await SaleflowApproachService.list(body);
    if (response.code == 0) {
      setListApproach(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  /**
   * Cập nhật lại
   * @param item
   */
  const updateSaleflowApproach = async (item: any) => {
    const response = await SaleflowApproachService.update(item);
    if (response.code == 0) {
      loadSaleflowApproaches(saleflowId);
      // showToast( "Cập nhật hành động thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  /**
   * Thêm mới Quy trình bán hàng
   * @param saleflowId
   */
  const addSaleflowApproach = async (step: number) => {
    const body: any = {
      name: "",
      step,
      activities: "[]",
      saleflowId,
    };

    const response = await SaleflowApproachService.update(body);
    if (response.code == 0) {
      //Lấy lại danh sách
      loadSaleflowApproaches(saleflowId);
      showToast("Thêm quy trình thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  // Thay đổi tên quy trình bán hàng
  const handleBlurValueApproach = async (e, idx) => {
    setCheckFieldApproach(false);

    const value = e.target.value;
    let item: any = {};

    if (value) {
      listApproach.map((obj, index) => {
        if (index === idx) {
          item.id = obj.id;
          item.name = value; //Tên mới
          item.step = item.step || index + 1;
          item.activities = obj.activities;
          item.saleflowId = saleflowId;
        }
      });

      updateSaleflowApproach(item);
    } else {
      setListApproach((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, checkName: true };
          }
          return obj;
        })
      );
    }
  };

  const handleChangeValueApproach = async (e, idx) => {
    setCheckFieldApproach(false);

    const value = e.target.value;
    setListApproach((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, name: value, checkName: false };
        }
        return obj;
      })
    );
  };

  //! xóa đi một quy trình bán hàng
  const handleRemoveApproach = (id, idx) => {
    const result = [...listApproach];

    //Những item cần được cập nhật
    const newData = [];
    result.map((item, index) => {
      if (index > idx) {
        newData.push({ ...item, step: item.step - 1 });
      }
    });

    const arrPromise = [];
    const promise = new Promise((resolve, reject) => {
      SaleflowApproachService.delete(id).then((res) => resolve(res));
    });
    arrPromise.push(promise);

    if (newData.length > 0) {
      newData.map((item) => {
        const promise = new Promise((resolve, reject) => {
          SaleflowApproachService.update(item).then((res) => resolve(res));
        });

        arrPromise.push(promise);
      });
    }

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa quy trình thành công", "success");
        loadSaleflowApproaches(saleflowId);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    });
  };

  //Cài đặt hành động
  const [modalSettingAction, setModalSettingAction] = useState(false);
  const [approachData, setApproachData] = useState(null);

  //Cài đặt SLA
  const [modalSettingSLA, setModalSettingSLA] = useState(false);
  const [dataApproach, setDataApproach] = useState(null);

  //Bộ phận bán hàng
  const [modalSaleDepartment, setModalSaleDepartment] = useState(false);

  return (
    <div className="page-content page-create-sale_flow">
      <TitleAction title={`${id ? "Chỉnh sửa" : "Tạo"} quy trình bán hàng`} />

      <div style={{ display: "flex", marginBottom: 10 }}>
        {dataStep.map((item, index) => (
          <div
            key={index}
            style={{
              borderBottom: setupStep === item.value ? "1px solid" : "",
              paddingLeft: 12,
              paddingRight: 12,
              paddingBottom: 3,
              cursor: "pointer",
            }}
            onClick={() => {
              // if(id){
              setSetupStep(item.value);
              // }
            }}
          >
            <span style={{ fontSize: 16, fontWeight: "500", color: setupStep === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {setupStep === 1 && (
        <div>
          <div className="card-box wrapper__info--sale-flow">
            <h3 className="title__info">Thông tin quy trình bán hàng</h3>

            <div className="info__sale-flow">
              <div className="info__basic">
                <div
                  className={`form__left ${checkFieldStartDate || checkFieldEndDate ? "one__error" : ""} ${
                    (checkFieldStartDate && checkFieldEndDate) || (startDay > endDay && endDay < startDay) ? "two__error" : ""
                  }`}
                >
                  <FileUpload type="cover" formData={formData} setFormData={setFormData} />
                </div>

                <div className="form__right">
                  <div className="form__right__top">
                    <div className="form-group">
                      <Input
                        label="Tên quy trình"
                        name="name"
                        fill={true}
                        required={true}
                        value={formData?.values?.name}
                        placeholder="Tên quy trình"
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, values: { ...formData?.values, name: value } });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <Input
                        label="Mã quy trình"
                        name="code"
                        fill={true}
                        required={false}
                        value={formData?.values?.code}
                        placeholder="Mã quy trình"
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, values: { ...formData?.values, code: value } });
                        }}
                      />
                    </div>
                  </div>

                  <div className="form__right__bottom">
                    <div className="form-group">
                      <DatePickerCustom
                        label="Bắt đầu"
                        name="startDate"
                        fill={true}
                        value={formData?.values?.startDate}
                        onChange={(e) => handleChangeValueStartDate(e)}
                        placeholder="Chọn ngày bắt đầu"
                        required={true}
                        iconPosition="left"
                        icon={<Icon name="Calendar" />}
                        error={checkFieldStartDate || startDay > endDay}
                        message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày kết thúc" : "Vui lòng chọn ngày bắt đầu"}
                      />
                    </div>

                    <div className="form-group">
                      <DatePickerCustom
                        label="Kết thúc"
                        name="endDate"
                        fill={true}
                        value={formData?.values?.endDate}
                        onChange={(e) => handleChangeValueEndDate(e)}
                        placeholder="Chọn ngày kết thúc"
                        required={true}
                        iconPosition="left"
                        icon={<Icon name="Calendar" />}
                        error={checkFieldEndDate || endDay < startDay}
                        message={endDay < startDay ? "Ngày kết thúc lớn hơn ngày bắt đầu" : "Vui lòng chọn ngày kết thúc"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="info__basic" style={{ marginTop: 15 }}>
                <div className="form__left">
                  <SelectCustom
                    id="employeeId"
                    name="employeeId"
                    label="Người phụ trách"
                    options={[]}
                    fill={true}
                    value={dataEmployee}
                    required={true}
                    onChange={(e) => handleChangeValueEmployee(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn người phụ trách"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionEmployee}
                    formatOptionLabel={formatOptionLabelEmployee}
                    error={checkFieldEmployee}
                    message="Người phụ trách không được bỏ trống"
                  />
                </div>

                <div className="form__right">
                  <SelectCustom
                    id="employeeId"
                    name="employeeId"
                    label="Người điều phối"
                    options={[]}
                    fill={true}
                    isMulti={true}
                    value={dataCoordinators}
                    required={false}
                    onChange={(e) => handleChangeValueCoordinators(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn người điều phối"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionEmployee}
                    formatOptionLabel={formatOptionLabelEmployee}
                    // error={checkFieldEmployee}
                    // message="Người phụ trách không được bỏ trống"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {setupStep === 2 && (
        <div className="step__2">
          <div className="card-box wrapper__approach_sale-flow">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
              <div>
                <h3 className="title__info">Quy trình bán hàng</h3>
              </div>
              {/* <div style={{width: '70%', justifyContent:'center', display:'flex'}}>
                                <div
                                    className="action__add--approach"
                                    onClick={() => {
                                        if(campaignId){
                                            addCampaignApproach(listApproach.length + 1)
                                        }
                                        
                                    }}
                                    // onClick={() => {
                                    //     setListApproachNew(oldArray => [...oldArray, {name: '', step:listApproach.length + 1,   activities:[], }])
                                    // }}
                                >
                                    <Icon name="PlusCircleFill" />
                                    Thêm quy trình
                                </div>
                            </div> */}
              <div style={{ flex: 1, justifyContent: "flex-end", display: "flex" }}>
                <div
                  className="button_add_approach"
                  onClick={() => {
                    if (saleflowId) {
                      addSaleflowApproach(listApproach.length + 1);
                    }
                  }}
                >
                  <Icon name="PlusCircleFill" />
                  <span className="title_button">Thêm quy trình </span>
                </div>
              </div>
            </div>
            {listApproach.map((item, index) => (
              <div key={index} className="container_approach_sale">
                <div style={{ width: "53%" }}>
                  <Input
                    fill={true}
                    label="Tên quy trình"
                    required={true}
                    value={item?.name}
                    onBlur={(e) => handleBlurValueApproach(e, index)}
                    onChange={(e) => handleChangeValueApproach(e, index)}
                    placeholder="Nhập bước tiếp theo"
                    // error={item.name ? false : checkFieldApproach}
                    error={item.checkName}
                    message="Bước tiếp theo không được để trống"
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {/* <div>
                                        <span style={{fontSize: 14, fontWeight:'600'}}>Lựa chọn hành động</span>
                                    </div> */}
                  <div className="container_setting_action">
                    <div
                      className="setting_action"
                      onClick={() => {
                        setModalSaleDepartment(true);
                        setDataApproach(item);
                      }}
                    >
                      <Icon name="Settings" style={{ width: 18 }} />
                      <span className="title_setting">Bộ phận bán hàng</span>
                    </div>

                    <div
                      className="setting_action"
                      onClick={() => {
                        setModalSettingAction(true);
                        setApproachData(item);
                      }}
                    >
                      <Icon name="Settings" style={{ width: 18 }} />
                      <span className="title_setting">Cài đặt hành động</span>
                    </div>
                    <div
                      className="setting_action"
                      onClick={() => {
                        setModalSettingSLA(true);
                        setDataApproach(item);
                      }}
                    >
                      <Icon name="Settings" style={{ width: 18 }} />
                      <span className="title_setting">Cài đặt SLA</span>
                    </div>
                  </div>
                </div>
                {listApproach.length > 1 && (
                  <div className="action__remove--approach" title="Xóa" onClick={() => handleRemoveApproach(item.id, index)}>
                    <Icon name="Trash" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="button_bottom">
        {setupStep === 1 ? null : (
          <div>
            <Button
              color="primary"
              variant="outline"
              onClick={(e) => {
                if (setupStep === 2) {
                  setSetupStep(1);
                  // loadCampaignApproaches(0);
                }
              }}
            >
              Quay lại
            </Button>
          </div>
        )}
        <div>
          <Button
            // type="submit"
            color="primary"
            disabled={isSubmit}
            onClick={() => {
              if (setupStep === 1) {
                // setSetupStep(2)
                onSubmit();
              } else if (setupStep === 2) {
                showToast("Cài đặt quy trình bán hàng thành công", "success");
                navigate(`/sale_flow`);
              }
            }}
          >
            {setupStep === 2 ? "Cập nhật" : "Tiếp tục"}
            {isSubmit ? <Icon name="Loading" /> : null}
          </Button>
        </div>
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />

      <ModalSettingActionApproach
        onShow={modalSettingAction}
        approachData={approachData}
        onHide={(reload) => {
          if (reload) {
            // loadCampaignApproaches(campaignId);
          }
          setModalSettingAction(false);
          setApproachData(null);
        }}
      />

      <ModalSettingSLA
        onShow={modalSettingSLA}
        dataApproach={dataApproach}
        onHide={(reload) => {
          if (reload) {
            loadSaleflowApproaches(saleflowId);
          }
          setModalSettingSLA(false);
          setDataApproach(null);
        }}
      />

      <ModalSaleDepartment
        onShow={modalSaleDepartment}
        dataApproach={dataApproach}
        onHide={(reload) => {
          if (reload) {
            // loadSaleflowApproaches(saleflowId);
          }
          setModalSaleDepartment(false);
          setDataApproach(null);
        }}
      />
    </div>
  );
}

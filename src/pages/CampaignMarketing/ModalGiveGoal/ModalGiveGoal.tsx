import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { formatCurrency, isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Input from "components/input/input";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import "./ModalGiveGoal.scss";
import { ContextType, UserContext } from "contexts/userContext";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import NummericInput from "components/input/numericInput";
import CampaignMarketingService from "services/CampaignMarketingService";
import EmployeeService from "services/EmployeeService";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import CustomerService from "services/CustomerService";
import Tippy from "@tippyjs/react";

export default function ModalGiveGoal(props: any) {
  const { onShow, onHide, idData, idCampaign } = props;
  console.log("idData", idData);
  console.log("idCampaign", idCampaign);

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [data, setData] = useState(null);
  const [detaiCampaign, setDetailCampaign] = useState(null);
  const [dataEmployee, setDataEmployee] = useState(null);

  const getDetailMABudget = async () => {
    const response = await CampaignMarketingService.detailMABudget(idData);

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

      if (result?.lstSegment && result?.lstSegment.length > 0) {
        const newLstSegment = result?.lstSegment?.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        setDataSegment(newLstSegment || []);
      }

      if (result?.measurements) {
        if (JSON.parse(result?.measurements).length > 0) {
          setDataMeasurement(JSON.parse(result?.measurements));
        }
      }

      setData({
        id: result.id,
        budget: result?.budget ?? 0,
        startDate: result?.startDate ?? "",
        endDate: result?.endDate ?? "",
        employeeId: result?.employeeId ?? null,
        coordinators: result?.coordinators ?? "[]",
        marketingId: result?.marketingId ?? 0,
        channelId: result?.channelId ?? 0,
        segments: result?.segments ?? "[]",
        measurements: result?.measurements ?? "[]",
      });
    }
  };

  const getDetailCampaignMA = async () => {
    const response = await CampaignMarketingService.detail(idCampaign);

    if (response.code === 0) {
      const result: any = response.result;
      setDetailCampaign(result);
    }
  };

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
    if (onShow && idData) {
      getDetailMABudget();
    }
    if (onShow && idCampaign) {
      getDetailCampaignMA();
    }
    // if (onShow && !dataEmployee) {
    //     getDetailEmployeeInfo();
    // }
  }, [onShow, idData, idCampaign]);

  const values = useMemo(
    () =>
      ({
        budget: data?.budget ?? 0,
        startDate: data?.startDate ?? "",
        endDate: data?.endDate ?? "",
        employeeId: data?.employeeId ?? null,
        coordinators: data?.coordinators ?? "[]",
        marketingId: data?.marketingId ?? idCampaign ?? 0,
        channelId: data?.channelId ?? 0,
        segments: data?.segments ?? "[]",
        measurements: data?.measurements ?? "[]",
        status: 3,
      } as any),
    [onShow, data, idCampaign]
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

  // người phụ trách
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
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

  // phân khúc khách hàng
  const [checkFieldSegment, setCheckFieldSegment] = useState<boolean>(false);
  const [dataSegment, setDataSegment] = useState([]);

  const loadedOptionSegment = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await CustomerService.filterAdvanced(param);

    if (response?.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
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

  const handleChangeValueSegment = (e) => {
    setCheckFieldSegment(false);
    setDataSegment(e);
    const newLstSegment = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, segments: JSON.stringify(newLstSegment) } });
  };

  // đo lường
  const [checkFieldMeasurement, setCheckFieldMeasurement] = useState<boolean>(false);
  const [dataMeasurement, setDataMeasurement] = useState([
    {
      id: "",
      name: "",
      value: "",
      unit: "",
    },
  ]);

  console.log("dataMeasurement", dataMeasurement);

  const loadedOptionMeasurement = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      //   limit: 10,
    };

    const response = await CampaignMarketingService.listMAMeasurement(param);

    if (response?.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  unit: item.unit,
                };
              })
            : []),
        ],
        hasMore: false,
        // additional: {
        //     page: page + 1,
        // },
      };
    }
    return { options: [], hasMore: false };
  };

  const handleChangeValueMeasurement = (e, idx) => {
    setDataMeasurement((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, id: e.value, name: e.label, unit: e.unit };
        }
        return obj;
      })
    );
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();

    // const errors = Validate(validations, formData);

    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    if (!formData.values.employeeId) {
      showToast("Vui lòng chọn người phụ trách", "error");
      setCheckFieldEmployee(true);
      return;
    }

    if (dataSegment?.length === 0) {
      showToast("Vui lòng chọn phân khúc khách hàng", "error");
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(formData.values as any),
      ...(data ? { id: data.id } : {}),
      ...{ measurements: JSON.stringify(dataMeasurement) },
    };

    const response = await CampaignMarketingService.updateMABudget(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} phân bổ kênh truyền thông thành công`, "success");
      handClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setData(null);
    setDataEmployee(null);
    setCheckFieldEmployee(false);
    setLstCoordinator([]);
    setCheckFieldSegment(false);
    setDataSegment([]);
    setCheckFieldMeasurement(false);
    setDataMeasurement([
      {
        id: "",
        name: "",
        value: "",
        unit: "",
      },
    ]);
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
            title: idData ? "Cập nhật" : "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            // checkFieldEmployee ||
            // !isDifferenceObj(formData.values, values) ||
            // (formData.errors && Object.keys(formData.errors).length > 0),
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
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "giao chỉ tieu"}`}</Fragment>,
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
        className="modal-give-goal"
        size="lg"
      >
        <form className="form-give-goal" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${idData ? "Chỉnh sửa giao chỉ tiêu" : "Giao chỉ tiêu"}`} toggle={() => !isSubmit && handClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  id="employeeId"
                  name="employeeId"
                  label="Người phụ trách"
                  fill={true}
                  required={true}
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

              <div style={{ width: "100%" }}>
                <SelectCustom
                  id="segments"
                  name="segments"
                  label="Phân khúc khách hàng"
                  fill={true}
                  required={true}
                  isMulti={true}
                  error={checkFieldSegment}
                  message="Phân khúc khách hàng không được bỏ trống"
                  options={[]}
                  value={dataSegment}
                  onChange={(e) => handleChangeValueSegment(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn phân khúc khách hàng"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionSegment}
                />
              </div>

              <div style={{ marginTop: "1.2rem", width: "100%" }}>
                <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "1.4rem", fontWeight: "700" }}>Đo lường</span>
                  <div
                    className="box-add"
                    onClick={() => {
                      setDataMeasurement((oldArray) => [...oldArray, { id: "", name: "", unit: "", value: "" }]);
                    }}
                  >
                    <span className="icon_add">
                      <Icon name="PlusCircle" />
                    </span>
                    <span style={{ fontSize: 12, fontWeight: "400", marginLeft: 5, marginTop: 4 }}>Thêm đo lường</span>
                  </div>
                </div>

                {dataMeasurement && dataMeasurement.length > 0
                  ? dataMeasurement.map((item, index) => (
                      <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ width: "48%" }}>
                          <SelectCustom
                            id="measurements"
                            name="measurements"
                            label=""
                            fill={true}
                            required={false}
                            isMulti={false}
                            // error={checkFieldMeasurement}
                            // message="Đo lường không được bỏ trống"
                            options={[]}
                            value={item.id ? { value: item.id, label: item.name } : null}
                            onChange={(e) => handleChangeValueMeasurement(e, index)}
                            isAsyncPaginate={true}
                            isFormatOptionLabel={true}
                            placeholder="Chọn đo lường"
                            additional={{
                              page: 1,
                            }}
                            loadOptionsPaginate={loadedOptionMeasurement}
                          />
                        </div>
                        <div style={{ width: "48%" }}>
                          <NummericInput
                            label=""
                            name="value"
                            fill={true}
                            required={false}
                            thousandSeparator={true}
                            value={item.value}
                            placeholder="Giá trị"
                            onValueChange={(e) => {
                              const value = e.floatValue;
                              setDataMeasurement((current) =>
                                current.map((obj, idx) => {
                                  if (index === idx) {
                                    return { ...obj, value: value };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>
                        {dataMeasurement.length > 1 ? (
                          <Tippy content="Xóa" placement="right">
                            <span
                              className="icon-delete"
                              onClick={() => {
                                const newList = [...dataMeasurement];
                                newList.splice(index, 1);
                                setDataMeasurement(newList);
                              }}
                            >
                              <Icon name="Trash" />
                            </span>
                          </Tippy>
                        ) : null}
                      </div>
                    ))
                  : null}
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

import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IBeautyBranchRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { showToast } from "utils/common";
import { createArrayFromTo, getMaxDay, isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import "./AddSpaceCustomerModal.scss";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";

import SpaceCustomerService from "services/SpaceCustomerService";
import SpaceService from "services/SpaceService";
import CustomerService from "services/CustomerService";
import SelectCustom from "components/selectCustom/selectCustom";
import OperationProjectService from "services/OperationProjectService";
import BuildingService from "services/BuildingService";
import BuildingFloorService from "services/BuildingFloorService";
import { floor, set } from "lodash";

export default function AddSpaceCustomerModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        customerId: data?.customerId ?? "",
        spaceId: data?.spaceId ?? "",
        contractId: data?.contractId ?? "",
        startDate: data?.startDate ?? "",
        endDate: data?.endDate ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "customerId",
      rules: "required",
    },
    {
      name: "spaceId",
      rules: "required",
    },
    {
      name: "startDate",
      rules: "required",
    },
    {
      name: "endDate",
      rules: "required",
    },
  ];
  const [formData, setFormData] = useState<IFormData>({ values: values });

  const [dataSpaceGet, setDataSpaceGet] = useState<any>(null);

  const fetchDetailSpace = async (id) => {
    const response = await SpaceService.detail(id);

    if (response.code === 0) {
      const data = response.result;
      setDataSpaceGet(data);
    }
  };

  useEffect(() => {
    if (data?.spaceId && onShow) {
      fetchDetailSpace(data.spaceId);
    } else {
      setDataProject(null);
      setDataBuilding(null);
      setDataFloor(null);
      setDataSpace(null);
      setIsDisableBuilding(true);
      setIsDisableFloor(true);
      setIsDisableSpace(true);
    }
  }, [onShow]);

  useEffect(() => {
    if (dataSpaceGet) {
      setFormData((prevState) => ({
        ...prevState,
        values: {
          ...prevState.values,
          spaceId: dataSpaceGet.id,
          projectId: dataSpaceGet.projectId,
          buildingId: dataSpaceGet.buildingId,
          floorId: dataSpaceGet.floorId,
        },
      }));
      setIsDisableBuilding(false);
      setIsDisableFloor(false);
      setIsDisableSpace(false);
    }
  }, [dataSpaceGet]);

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Dự án",
          name: "projectId",
          type: "select",
          // options: listProject,
          fill: true,
          required: true,
        },
        {
          label: "Toà nhà",
          name: "buildingId",
          type: "select",
          // options: listBuilding,
          fill: true,
          required: true,
        },
        {
          label: "Tầng",
          name: "floorId",
          type: "select",
          // options: listBuildingFloor,
          fill: true,
          required: true,
        },
        {
          label: "Căn hộ",
          name: "spaceId",
          type: "select",
          // options: listSpace,
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    []
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
    const body: IBeautyBranchRequest = {
      ...(formData.values as IBeautyBranchRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await SpaceCustomerService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} căn hộ/văn phòng thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
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
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
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

  const [startDay, setStartDay] = useState<number>(new Date(formData.values.startDate).getTime());
  const [endDay, setEndDay] = useState<number>(new Date(formData.values.endDate).getTime());
  useEffect(() => {
    setStartDay(new Date(formData.values.startDate).getTime());
    setEndDay(new Date(formData.values.endDate).getTime());
  }, [formData.values.startDate, formData.values.endDate]);

  // Khách hàng
  const [dataCustomer, setDataCustomer] = useState(null);
  useEffect(() => {
    setDataCustomer(data?.customerId ? { value: data?.customerId, label: data?.customerName || null } : null);
  }, [data]);
  const [validateFieldCustomer, setValidateFieldCustomer] = useState(false);

  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
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
    setValidateFieldCustomer(false);
    setDataCustomer(e);
    setFormData({ ...formData, values: { ...formData?.values, customerId: e.value } });
  };

  const [isDisableBuilding, setIsDisableBuilding] = useState<boolean>(false);
  const [isDisableFloor, setIsDisableFloor] = useState<boolean>(false);
  const [isDisableSpace, setIsDisableSpace] = useState<boolean>(false);

  // Dự án
  const [dataProject, setDataProject] = useState(null);

  useEffect(() => {
    setDataProject(dataSpaceGet?.projectId ? { value: dataSpaceGet?.projectId, label: dataSpaceGet?.projectName || null } : null);
  }, [dataSpaceGet]);

  const [validateFieldProject, setValidateFieldProject] = useState(false);

  const loadedOptionProject = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await OperationProjectService.list(param);

    if (response.code === 0) {
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

  const handleChangeValueProject = (e) => {
    setValidateFieldProject(false);
    setDataProject(e);
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        projectId: e.value,
        buildingId: null,
        floorId: null,
        spaceId: null,
      },
    });
    setIsDisableBuilding(false);
    setDataBuilding(null);
    setDataFloor(null);
    setDataSpace(null);
  };

  // Tòa nhà
  const [dataBuilding, setDataBuilding] = useState(null);

  useEffect(() => {
    setDataBuilding(dataSpaceGet?.buildingId ? { value: dataSpaceGet?.buildingId, label: dataSpaceGet?.buildingName || null } : null);
  }, [dataSpaceGet]);

  const [validateFieldBuilding, setValidateFieldBuilding] = useState(false);

  const loadedOptionBuilding = async (search, loadedOptions, { page }) => {
    if (!dataProject?.value) {
      return { options: [], hasMore: false };
    }
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      projectId: dataProject?.value,
    };

    const response = await BuildingService.list(param);

    if (response.code === 0) {
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
  // Chỗ này để reset phân trang trong select
  useEffect(() => {
    loadedOptionBuilding("", undefined, { page: 1 });
  }, [dataProject]);

  const handleChangeValueBuilding = (e) => {
    setValidateFieldBuilding(false);
    setDataBuilding(e);
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        buildingId: e.value,
        floorId: null,
        spaceId: null,
      },
    });
    setIsDisableFloor(false);
    setDataFloor(null);
    setDataSpace(null);
  };

  // Tầng
  const [dataFloor, setDataFloor] = useState(null);

  useEffect(() => {
    setDataFloor(dataSpaceGet?.floorId ? { value: dataSpaceGet?.floorId, label: dataSpaceGet?.floorName || null } : null);
  }, [dataSpaceGet]);

  const [validateFieldFloor, setValidateFieldFloor] = useState(false);

  const loadedOptionFloor = async (search, loadedOptions, { page }) => {
    if (!dataBuilding?.value) {
      return { options: [], hasMore: false };
    }
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      buildingId: dataBuilding?.value,
    };

    const response = await BuildingFloorService.list(param);

    if (response.code === 0) {
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
  // Chỗ này để reset phân trang trong select
  useEffect(() => {
    loadedOptionFloor("", undefined, { page: 1 });
  }, [dataBuilding]);

  const handleChangeValueFloor = (e) => {
    setValidateFieldFloor(false);
    setDataFloor(e);
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        floorId: e.value,
        spaceId: null,
      },
    });
    setIsDisableSpace(false);
    setDataSpace(null);
  };

  // Căn hộ
  const [dataSpace, setDataSpace] = useState(null);

  useEffect(() => {
    setDataSpace(dataSpaceGet?.unitNumber ? { value: dataSpaceGet?.unitNumber, label: dataSpaceGet?.unitNumber || null } : null);
  }, [dataSpaceGet]);

  const [validateFieldSpace, setValidateFieldSpace] = useState(false);

  const loadedOptionSpace = async (search, loadedOptions, { page }) => {
    if (!dataFloor?.value) {
      return { options: [], hasMore: false };
    }
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      floorId: dataFloor?.value,
    };

    const response = await SpaceService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.unitNumber,
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
  // Chỗ này để reset phân trang trong select
  useEffect(() => {
    loadedOptionSpace("", undefined, { page: 1 });
  }, [dataFloor]);

  const handleChangeValueSpace = (e) => {
    setValidateFieldSpace(false);
    setDataSpace(e);
    setFormData({ ...formData, values: { ...formData?.values, spaceId: e.value } });
  };

  useEffect(() => {
    if (!dataProject?.value) {
      setIsDisableBuilding(true);
      setIsDisableFloor(true);
      setIsDisableSpace(true);
    }
  }, [dataProject]);

  useEffect(() => {
    if (!dataBuilding?.value) {
      setIsDisableFloor(true);
      setIsDisableSpace(true);
    }
  }, [dataBuilding]);

  useEffect(() => {
    if (!dataFloor?.value) {
      setIsDisableSpace(true);
    }
  }, [dataFloor]);

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
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              formData?.values?.startDate === "" ||
              checkFieldStartDate ||
              startDay > endDay ||
              isSubmit ||
              !dataProject?.value ||
              !dataBuilding?.value ||
              !dataFloor?.value ||
              !dataSpace?.value ||
              !dataCustomer?.value ||
              !isDifferenceObj(formData.values, values),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [
      formData,
      values,
      isSubmit,
      startDay,
      endDay,
      checkFieldStartDate,
      checkFieldEndDate,
      dataProject,
      dataBuilding,
      dataFloor,
      dataSpace,
      dataCustomer,
    ]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-space_customer"
      >
        <form className="form-space_customer-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} căn hộ/văn phòng`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-space_customer">
                <div className="form-group-customer">
                  <SelectCustom
                    id="customerId"
                    name="customerId"
                    label="Khách hàng"
                    fill={true}
                    required={true}
                    error={validateFieldCustomer}
                    message="Khách hàng không được bỏ trống"
                    options={[]}
                    value={dataCustomer}
                    onChange={(e) => handleChangeValueCustomer(e)}
                    isAsyncPaginate={true}
                    placeholder="Khách hàng"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionCustomer}
                  />
                </div>
                <div className="form-group">
                  <SelectCustom
                    id="projectId"
                    name="projectId"
                    label="Dự án"
                    fill={true}
                    required={true}
                    error={validateFieldProject}
                    message="Dự án không được bỏ trống"
                    options={[]}
                    value={dataProject}
                    onChange={(e) => handleChangeValueProject(e)}
                    isAsyncPaginate={true}
                    placeholder="Dự án"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionProject}
                  />
                </div>
                <div className="form-group">
                  <SelectCustom
                    key={dataProject?.value}
                    id="buildingId"
                    name="buildingId"
                    label="Tòa nhà"
                    fill={true}
                    required={true}
                    error={validateFieldBuilding}
                    message="Tòa nhà không được bỏ trống"
                    options={[]}
                    disabled={isDisableBuilding}
                    value={dataBuilding}
                    onChange={(e) => handleChangeValueBuilding(e)}
                    isAsyncPaginate={true}
                    placeholder="Tòa nhà"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionBuilding}
                  />
                </div>
                <div className="form-group">
                  <SelectCustom
                    key={dataBuilding?.value}
                    id="floorId"
                    name="floorId"
                    label="Tầng"
                    fill={true}
                    required={true}
                    error={validateFieldFloor}
                    message="Tầng không được bỏ trống"
                    options={[]}
                    disabled={isDisableFloor}
                    value={dataFloor}
                    onChange={(e) => handleChangeValueFloor(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn tầng"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionFloor}
                  />
                </div>
                <div className="form-group">
                  <SelectCustom
                    key={dataFloor?.value}
                    id="spaceId"
                    name="spaceId"
                    label="Căn hộ"
                    fill={true}
                    required={true}
                    error={validateFieldSpace}
                    message="Căn hộ không được bỏ trống"
                    options={[]}
                    disabled={isDisableSpace}
                    value={dataSpace}
                    onChange={(e) => handleChangeValueSpace(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn căn hộ"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionSpace}
                  />
                </div>
                {/* {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                    formData={formData}
                  />
                ))} */}
                <div className="form-group">
                  <DatePickerCustom
                    label="Ngày bắt đầu"
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

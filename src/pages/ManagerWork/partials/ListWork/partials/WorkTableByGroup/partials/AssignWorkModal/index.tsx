import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import _ from "lodash";
import { getSearchParameters, isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddWorkModelProps } from "model/workOrder/PropsModel";
import { IWorkOrderRequestModel } from "model/workOrder/WorkOrderRequestModel";
import { IWorkProjectFilterRequest } from "model/workProject/WorkProjectRequestModel";
import { IWorkTypeFilterRequest } from "model/workType/WorkTypeRequestModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { listDay, listHour, listMinute } from "pages/CalendarCommon/partials/MockData";
import ImageThirdGender from "assets/images/third-gender.png";
import WorkTypeService from "services/WorkTypeService";
import WorkOrderService from "services/WorkOrderService";
import WorkProjectService from "services/WorkProjectService";
import { ContextType, UserContext } from "contexts/userContext";

import "./index.scss";
import AttachmentUploader, { UploadedItem } from "components/attachmentUpload";
import moment from "moment";

interface IDataListNotificationProps {
  method: string[];
  time: {
    day: number;
    hour: number;
    minute: number;
  };
}

export default function AssignWorkModal(props: IAddWorkModelProps) {
  const { type, onShow, onHide, idWork, idManagement, startDate, endDate, dataProjectProps, dataOptProps, statusProps, customerId, customerName } =
    props;

  const params: any = getSearchParameters();

  const takeIdProjectManagement = Object.keys(params).length > 0 && +params?.projectId > 0 ? +params?.projectId : null;
  const { name, avatar } = useContext(UserContext) as ContextType;

  const [data, setData] = useState<IWorkOrderResponseModel>(null);

  const refOptionTimeWorkLoad = useRef();
  const refContainerTimeWorkLoad = useRef();

  const refOptionDecisionTime = useRef();

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [validateWordLoad, setValidateWordLoad] = useState<boolean>(false);
  const [validateProject, setValidateProject] = useState<boolean>(false);
  const [dataManager, setDataManager] = useState(null);

  //! đoạn này call API chi tiết khi update
  const getDetailWork = async (id: number) => {
    const response = await WorkOrderService.detail(id);

    if (response.code == 0) {
      const result: IWorkOrderResponseModel = response.result;

      const takeLstParticipant = (response.result?.lstParticipant || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        };
      });

      setDataParticipants(takeLstParticipant);

      setDataWorkProject({
        value: result.projectId,
        label: result.projectName,
      });

      if (result?.employeeId) {
        setDataEmployee({
          value: result.employeeId,
          label: result?.employeeName ?? result.employeeId,
        });
      }

      if (result.managerId) {
        setDataManager({
          value: result.managerId,
          label: result?.managerName ?? result.managerId,
        });
      } else {
        setDataManager({
          value: name,
          label: name,
          avatar: avatar,
        });
      }

      setDataWorkType({
        value: result.wteId,
        label: result.workTypeName,
      });

      const takeNotification = JSON.parse(result?.notification);
      setDataListNotification(takeNotification);

      setData({
        id: result.id,
        name: result.name,
        content: result.content,
        employeeId: result.employeeId,
        managerId: result.managerId,
        projectId: result.projectId,
        opportunityId: result.opportunityId,
        priorityLevel: result.priorityLevel,
        customers: result.customers,
        docLink: result.docLink,
        startTime: result.startTime,
        endTime: result.endTime,
        notification: result.notification,
        workLoad: result.workLoad,
        workLoadUnit: result.workLoadUnit,
        wteId: result.wteId,
        participants: result.participants,
        status: result.status,
        percent: result.percent,
      });
    }
  };

  useEffect(() => {
    if (idWork && onShow) {
      getDetailWork(idWork);
    }
  }, [onShow, idWork]);

  const listOptionTimeWorkLoad = [
    {
      value: "D",
      label: "Ngày",
    },
    {
      value: "H",
      label: "Giờ",
    },
    {
      value: "M",
      label: "Phút",
    },
  ];

  const [isOptionTimeWorkLoad, setIsOptionTimeWorkLoad] = useState<boolean>(false);
  useOnClickOutside(refOptionTimeWorkLoad, () => setIsOptionTimeWorkLoad(false), ["option__time--workload"]);

  const [dataTimeWorkLoad, setDataTimeWorkLoad] = useState({
    value: "H",
    label: "Giờ",
  });

  useEffect(() => {
    if (data && data.workLoadUnit) {
      const result = listOptionTimeWorkLoad.find((item) => item.value === data.workLoadUnit);
      setDataTimeWorkLoad(result);
    }
  }, [data]);

  const [valueDecisionTime, setValueDecisionTime] = useState({
    value: "3",
    label: "Phút",
  });
  const [valueTime, setValueTime] = useState(null);
  const [isOptionDecisionTime, setIsOptionDecisionTime] = useState<boolean>(false);
  useOnClickOutside(refOptionDecisionTime, () => setIsOptionDecisionTime(false), ["decision-time"]);

  useEffect(() => {
    if (valueDecisionTime) {
      setValueTime(valueDecisionTime.value == "1" ? listDay[0] : valueDecisionTime.value == "2" ? listHour[0] : listMinute[0]);
    }
  }, [valueDecisionTime]);

  const [dataListNotification, setDataListNotification] = useState<IDataListNotificationProps[]>([]);

  const [dataEmployee, setDataEmployee] = useState(null);
  const [dataParticipants, setDataParticipants] = useState([]);
  const [dataWorkProject, setDataWorkProject] = useState(null);

  useEffect(() => {
    if (dataProjectProps) {
      setDataWorkProject(dataProjectProps);
    } else {
      setDataWorkProject(null);
    }
  }, [dataProjectProps]);

  //! đoạn này xử lý vấn đề callAPI chi tiết 1 dự án khi thêm mới
  const getDetailProject = async () => {
    const response = await WorkProjectService.detail(idManagement ? idManagement : takeIdProjectManagement);

    if (response.code == 0) {
      const result = response.result;

      setDataWorkProject({
        value: result.id,
        label: result.name,
      });

      const dataParticipant = (result?.lstParticipant || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        };
      });

      setDataParticipants(dataParticipant);
    }
  };

  useEffect(() => {
    if (onShow && (idManagement > 0 || takeIdProjectManagement) && !idWork && !dataProjectProps) {
      getDetailProject();
    }
  }, [onShow, idManagement, idWork, takeIdProjectManagement, dataProjectProps]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        content: data?.content ?? "",
        // startTime: idWork ? data?.startTime : startDate ? startDate : moment().format("MM/DD/YYYY"),
        startTime: data?.startTime ? moment(data?.startTime) : "",
        endTime: data?.endTime ? moment(data?.endTime) : "",
        workLoad: data?.workLoad ?? "",
        workLoadUnit: data?.workLoadUnit ?? "H",
        wteId: data?.wteId ?? null,
        docLink: JSON.parse(data?.docLink || "[]") ?? [],
        projectId: data?.projectId ? data?.projectId : dataWorkProject?.value,
        employeeId: data?.employeeId ? data?.employeeId : null,
        participants: data?.participants ? JSON.parse(data?.participants || "[]") : dataParticipants?.map((item) => item.value),
        customers: JSON.parse(data?.customers || "[]") ?? [],
        status: statusProps ?? data?.status ?? 0,
        percent: data?.percent ?? 0,
        priorityLevel: data?.priorityLevel?.toString() ?? "2",
        notification: JSON.parse(data?.notification || "[]") ?? [],
      } as IWorkOrderRequestModel),
    [onShow, data, idWork, startDate, endDate, dataParticipants, dataWorkProject, statusProps]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "startTime",
      rules: "required",
    },
    {
      name: "endTime",
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

  //* đoạn này xử lý vấn đề hiển thị hình ảnh người quản lý
  const formatOptionLabelManager = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý vấn đề lấy người nhận việc
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    if (!dataWorkProject) return { options: [], hasMore: false };
    const response = await WorkOrderService.projectEmployeeAssignees({
      workProjectId: dataWorkProject ? dataWorkProject.value : null,
    });

    if (response.code === 0) {
      const dataOption = response.result;

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

  useEffect(() => {
    if (!dataWorkProject) return;
    loadedOptionEmployee("", [], {
      page: 1,
    });
  }, [dataWorkProject]);

  //? đoạn này xử lý vấn đề thay đổi người nhận việc
  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };

  //* đoạn này xử lý vấn đề hiển thị hình ảnh người nhận việc
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

  //! đoạn này xử lý vấn đề lấy loại công việc
  const [dataWorkType, setDataWorkType] = useState(null);

  const loadedOptionWorkType = async (search, loadedOptions, { page }) => {
    const param: IWorkTypeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await WorkTypeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

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

  //? đoạn này xử lý vấn đề thay đổi loại công việc
  const handleChangeValueWorkType = (e) => {
    setDataWorkType(e);
  };

  useEffect(() => {
    if (dataWorkType) {
      setFormData({ ...formData, values: { ...formData?.values, wteId: dataWorkType.value } });
    }
  }, [dataWorkType]);

  useEffect(() => {
    if (dataParticipants.length > 0) {
      const listIdParticipants = dataParticipants.map((item) => item.value);
      setFormData({ ...formData, values: { ...formData?.values, participants: listIdParticipants } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, participants: [] } });
    }
  }, [dataParticipants]);

  //! đoạn này lấy ra danh sách ảnh công việc
  const [listImageWork, setListImageWork] = useState([]);

  //! đoạn này xử lý vấn đề khi mà dataTimeWorkLoad thay đổi thì update vào biến workLoadUnit
  useEffect(() => {
    setFormData({ ...formData, values: { ...formData?.values, workLoadUnit: dataTimeWorkLoad.value } });
  }, [dataTimeWorkLoad]);

  useEffect(() => {
    if (data && data.docLink) {
      const result = JSON.parse(data.docLink || "[]");
      setListImageWork(result);
    }
  }, [data]);

  useEffect(() => {
    if (listImageWork && listImageWork.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, docLink: listImageWork } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, docLink: [] } });
    }
  }, [listImageWork]);

  //? đoạn này xử lý vấn đề thay đổi số lượng công việc
  const handleChangeValueWorkLoad = (e) => {
    oninput = () => {
      setValidateWordLoad(false);
    };
    const value = e.value;
    setFormData({ ...formData, values: { ...formData?.values, workLoad: +value } });
  };

  const loadedOptionWorkProject = async (search, loadedOptions, { page }) => {
    const param: IWorkProjectFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      // parentId: -1,
    };
    const response = await WorkProjectService.list(param);
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

  //? đoạn này xử lý vấn đề thay đổi dự án
  const handleChangeValueWorkProject = (e) => {
    setValidateProject(false);
    setDataWorkProject(e);
    setDataEmployee(null);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: null, projectId: dataWorkProject.value } });
  };

  // Thông báo
  useEffect(() => {
    if (dataListNotification && dataListNotification.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, notification: dataListNotification } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, notification: [] } });
    }
  }, [dataListNotification]);

  // lấy thông tin ngày bắt đầu, ngày kết thúc
  const startDay = new Date(formData.values.startTime).getTime();
  const endDay = new Date(formData.values.endTime).getTime();

  const refOptionStartTime = useRef();

  const refOptionEndTime = useRef();

  const [isChooseStartTime, setIsChooseStartTime] = useState<boolean>(false);
  const [isChooseEndTime, setIsChooseEndTime] = useState<boolean>(false);

  useOnClickOutside(refOptionStartTime, () => setIsChooseStartTime(false), ["choose__start--time"]);
  useOnClickOutside(refOptionEndTime, () => setIsChooseEndTime(false), ["choose__end--time"]);

  // memoize handler để ref ổn định
  const handleChange = useCallback((newList: UploadedItem[]) => {
    setListImageWork(newList);
  }, []);

  const listFieldAddWork = useMemo(
    () =>
      [
        {
          name: "projectId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="projectId"
              name="projectId"
              label="Dự án"
              options={[]}
              fill={true}
              required={true}
              value={dataWorkProject}
              onChange={(e) => handleChangeValueWorkProject(e)}
              isAsyncPaginate={true}
              placeholder="Chọn dự án"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionWorkProject}
              error={validateProject}
              message="Vui lòng chọn dự án"
            />
          ),
        },
        {
          name: "wteId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="wteId"
              name="wteId"
              label="Loại công việc"
              options={[]}
              fill={true}
              value={dataWorkType ? dataWorkType : ""}
              onChange={(e) => handleChangeValueWorkType(e)}
              isAsyncPaginate={true}
              placeholder="Chọn loại công việc"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionWorkType}
            />
          ),
        },
        {
          label: "Tên công việc",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Nội dung công việc",
          name: "content",
          type: "textarea",
          fill: true,
        },
        {
          name: "docLink",
          type: "custom",
          snippet: (
            <AttachmentUploader value={listImageWork} placeholderLabel="Tải tài liệu lên" onChange={handleChange} multiple={true} maxFiles={10} />
          ),
        },
      ] as IFieldCustomize[],
    [formData?.values, listImageWork, dataWorkProject, validateProject, dataWorkType]
  );

  const listFieldAssign = useMemo(
    () =>
      [
        {
          name: "managerId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="managerId"
              name="managerId"
              label="Người giao việc"
              options={dataManager ? [dataManager] : []}
              fill={true}
              required={true}
              readOnly={true}
              value={dataManager && dataManager?.value ? dataManager?.value : ""}
              isFormatOptionLabel={true}
              placeholder="Chọn người giao việc"
              formatOptionLabel={formatOptionLabelManager}
            />
          ),
        },
        {
          name: "managerId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={
                dataWorkProject && dataWorkProject?.value
                  ? dataWorkProject.value
                  : "null" + "_" + dataEmployee && dataEmployee?.value
                  ? dataEmployee.value
                  : "null"
              }
              id="employeeId"
              name="employeeId"
              label="Người nhận việc"
              options={[]}
              fill={true}
              required={true}
              disabled={!dataWorkProject}
              value={dataEmployee}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn người nhận việc"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              error={!dataWorkProject}
              message="Vui lòng chọn dự án trước khi chọn người nhận việc"
            />
          ),
        },
        {
          name: "workLoad",
          type: "custom",
          snippet: (
            <div className="wrapper__workload">
              <NummericInput
                id="workLoad"
                name="workLoad"
                label="Khối lượng công việc"
                value={formData?.values?.workLoad}
                fill={true}
                placeholder="Nhập khối lượng công việc"
                required={true}
                error={validateWordLoad || (formData?.values?.workLoad !== "" && formData?.values?.workLoad == 0)}
                message={`${
                  validateWordLoad
                    ? "Vui lòng nhập khối lượng công việc"
                    : formData?.values?.workLoad !== "" && formData?.values?.workLoad == 0
                    ? "Khối lượng công việc cần lớn hơn 0"
                    : ""
                }`}
                onValueChange={(e) => handleChangeValueWorkLoad(e)}
              />

              <div className="option__time--workload" ref={refContainerTimeWorkLoad}>
                <div
                  className="selected__item--workload"
                  onClick={() => {
                    setIsOptionTimeWorkLoad(!isOptionTimeWorkLoad);
                  }}
                >
                  {dataTimeWorkLoad.label}
                  <Icon name="ChevronDown" />
                </div>
                {isOptionTimeWorkLoad && (
                  <ul className="menu__time--workload" ref={refOptionTimeWorkLoad}>
                    {listOptionTimeWorkLoad.map((item, idx) => (
                      <li
                        key={idx}
                        className={`item--workload ${dataTimeWorkLoad.value === item.value ? "active__item--workload" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setDataTimeWorkLoad(item);
                          setIsOptionTimeWorkLoad(false);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ),
        },
        {
          label: "Mức độ ưu tiên",
          name: "priorityLevel",
          type: "radio",
          options: [
            {
              label: "Thấp",
              value: "1",
            },
            {
              label: "Trung bình",
              value: "2",
            },
            {
              label: "Cao",
              value: "3",
            },
            {
              label: "Rất cao",
              value: "4",
            },
          ],
          fill: true,
          required: true,
        },
        {
          label: "Bắt đầu",
          name: "startTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          isWarning: startDay > endDay,
          hasSelectTime: true,
          placeholder: "Nhập ngày bắt đầu",
          messageWarning: "Ngày bắt đầu nhỏ hơn ngày kết thúc",
        },
        {
          label: "Kết thúc",
          name: "endTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          isWarning: endDay < startDay,
          hasSelectTime: true,
          placeholder: "Nhập ngày kết thúc",
          messageWarning: "Ngày kết thúc lớn hơn ngày bắt đầu",
        },
      ] as IFieldCustomize[],
    [
      startDay,
      endDay,
      listOptionTimeWorkLoad,
      isOptionTimeWorkLoad,
      dataTimeWorkLoad,
      validateWordLoad,
      formData?.values,
      listImageWork,
      dataWorkProject,
      validateProject,
      dataManager,
      dataEmployee,
      dataParticipants,
      valueDecisionTime,
      valueTime,
      isOptionDecisionTime,
      dataListNotification,
      customerId,
      isChooseStartTime,
      isChooseEndTime,
    ]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listFieldAddWork);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    // if (!formData?.values?.workLoad) {
    //   setValidateWordLoad(true);
    //   return;
    // }

    if (!formData?.values?.projectId) {
      setValidateProject(true);
      return;
    }

    setIsSubmit(true);

    const body: IWorkOrderRequestModel = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as IWorkOrderRequestModel),
      docLink: JSON.stringify(formData.values.docLink),
      customers: JSON.stringify(formData.values.customers),
      participants: JSON.stringify(formData.values.participants),
      notification: JSON.stringify(formData.values.notification),
      managerId: 54,
      // Nếu status == 0 (vừa tạo) và chưa có người nhận việc thì set status = 1 để kích hoạt quy trình, những lần sau status == null để đánh dấu là cập nhật
      status: data.status === 0 && !data.employeeId ? (formData.values.employeeId ? 1 : null) : null,
    };

    console.log("data>>", data);
    console.log("formData.values>>", formData.values);

    console.log("body", body);
    // setIsSubmit(false);
    // return;

    const response = await WorkOrderService.updateInitProcess(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} công việc thành công`, "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setDataEmployee(null);
    setDataManager(null);
    setDataParticipants([]);
    setDataWorkProject(null);
    setDataWorkType(null);
    setDataTimeWorkLoad({ value: "H", label: "Giờ" });
    setValueDecisionTime({ value: "3", label: "Phút" });
    setValueTime(null);
    setDataListNotification([]);
    setData(null);
    setListImageWork([]);
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
              _.isEqual(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              startDay > endDay ||
              endDay < startDay ||
              validateWordLoad ||
              validateProject ||
              (formData?.values?.workLoad !== "" && formData?.values?.workLoad == 0) ||
              _.isEqual(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, startDay, endDay, validateWordLoad, validateProject, startDate, endDate, idWork]
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
        handleClearForm(false);
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
          handleClearForm(false);
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
        size="xl"
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-assign-work-backlog"
      >
        <form className="form-assign-work-backlog" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${idWork ? "Chỉnh sửa" : "Thêm mới"} công việc`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              {idWork ? (
                <div className="list-form-group__assign">
                  <div className="title-work">Giao việc</div>
                  {listFieldAssign.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldAssign, setFormData)}
                      formData={formData}
                    />
                  ))}
                </div>
              ) : null}
              <div className="list-form-group__add">
                <div className="title-work">Nội dung công việc</div>
                {listFieldAddWork.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldAddWork, setFormData)}
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

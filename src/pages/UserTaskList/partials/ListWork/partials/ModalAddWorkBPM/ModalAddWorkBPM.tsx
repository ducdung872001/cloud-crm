import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { getSearchParameters, isDifferenceObj, trimContent } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import Switch from "components/switch/switch";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import CheckboxList from "components/checkbox/checkboxList";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast, formatFileSize } from "utils/common";
import ImgExcel from "assets/images/img-excel.png";
import ImgWord from "assets/images/img-word.png";
import ImgPowerpoint from "assets/images/img-powerpoint.png";
import FileService from "services/FileService";
import ImageThirdGender from "assets/images/third-gender.png";
import EmployeeService from "services/EmployeeService";
import WorkOrderService from "services/WorkOrderService";
import { ContextType, UserContext } from "contexts/userContext";
import { uploadDocumentFormData } from "utils/document";

import "./ModalAddWorkBPM.scss";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";

export default function ModalAddWorkBpm(props: any) {
  const { onShow, onHide, idWork } = props;

  const params: any = getSearchParameters();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [data, setData] = useState(null);

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [dataEmployee, setDataEmployee] = useState(null);
  const [dataParticipants, setDataParticipants] = useState([]);
  const [priorityLevel, setPriorityLevel] = useState({ value: 4, label: "Gấp" });

  const [valueResponse, setValueResponse] = useState({
    id: "",
    day: "",
    hour: "",
    minute: "",
    timeType: "response",
  });

  const [valueProcess, setValueProcess] = useState({
    id: "",
    day: "",
    hour: "",
    minute: "",
    timeType: "process",
  });
  //! đoạn này call API chi tiết khi update
  const getDetailWork = async (id: number) => {
    const response = await WorkOrderService.detail(id);

    if (response.code == 0) {
      const result: any = response.result;

      const takeLstParticipant = (response.result?.lstParticipant || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        };
      });

      setDataParticipants(takeLstParticipant);

      setDataEmployee({
        value: result.employeeId,
        label: result.employeeName,
      });

      if (result && result.docLink) {
        const dataAttachment = JSON.parse(result.docLink || "[]");
        setListAttactment(dataAttachment);
      }

      if (result && result.ola) {
        const dataOla = result.ola ? JSON.parse(result.ola) : null;
        setValueProcess(dataOla?.processTime || []);
        setValueResponse(dataOla?.responseTime || []);
      }

      setPriorityLevel({
        value: result.priorityLevel,
        label: result.priorityLevel === 4 ? "Gấp" : result.priorityLevel === 3 ? "Ưu tiên" : "Không ưu tiên",
      });

      // setData(result);
      if (result.taskType === "assigned_task") {
        setData({
          ...result,
          endTime: "",
        });
      } else {
        setData(result);
      }
    }
  };

  useEffect(() => {
    if (idWork && onShow) {
      getDetailWork(idWork);
    }
  }, [onShow, idWork]);

  //! đoạn này xử lý vấn đề call employee init để lấy ra người giao việc và người nhận việc
  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();

    if (response.code == 0) {
      const result = response.result;
      setFormData({ ...formData, values: { ...formData?.values, managerId: result.id } });
    }
  };

  useEffect(() => {
    if (onShow && !idWork) {
      getDetailEmployeeInfo();
    }
  }, [onShow, idWork]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        content: data?.content ?? "",
        managerId: data?.managerId ?? "",
        startTime: idWork ? data?.startTime : "",
        endTime: idWork ? data?.endTime : "",
        docLink: data?.docLink || "[]",
        employeeId: data?.employeeId ? data?.employeeId : null,
        participants: data?.participants ? JSON.parse(data?.participants || "[]") : [],
        status: data?.status ?? 0,
        priorityLevel: data?.priorityLevel ?? 4,
        scope: "external", // internal - công việc tạo ra từ quy trình /external - công việc tạo ngoài
        ola: data?.old || "",
        taskType: data?.taskType || "assigned_task",
      } as any),
    [onShow, data]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "content",
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
  }, [values, onShow]);

  //! đoạn này xử lý vấn đề lấy người nhận việc
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    // const response = await WorkOrderService.employeeAssignees();
    const param = {
      name: search,
      page: page,
      limit: 10,
      // branchId: dataBranch.value,
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

  const loadedOptionParticipant = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      // branchId: dataBranch.value,
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

  const handleChangeValueParticipant = (e) => {
    setDataParticipants(e);
  };

  //* đoạn này hiển thị hình ảnh người tham gia
  const formatOptionLabelParticipant = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  // useEffect(() => {
  //   if (dataParticipants.length > 0) {
  //     const listIdParticipants = dataParticipants.map((item) => item.value);
  //     setFormData({ ...formData, values: { ...formData?.values, participants: listIdParticipants } });
  //   } else {
  //     setFormData({ ...formData, values: { ...formData?.values, participants: [] } });
  //   }
  // }, [dataParticipants]);

  const [listAttactment, setListAttactment] = useState([]);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<number>(0);

  //! đoạn này xử lý hình ảnh
  const handleUploadDocument = (e) => {
    e.preventDefault();

    const file = e.target.files[0];

    const checkFile = file?.type;
    setIsLoadingFile(true);
    if (checkFile?.startsWith("image")) {
      handUploadFile(file);
    }

    if (checkFile?.startsWith("application")) {
      uploadDocumentFormData(file, onSuccess, onError, onProgress);
    }
  };

  const onSuccess = (data) => {
    if (data) {
      const result = {
        fileUrl: data.fileUrl,
        type: data.extension,
        fileName: data.fileName,
        fileSize: data.fileSize,
      };

      setListAttactment([result, ...listAttactment]);
      setIsLoadingFile(false);
    }
  };

  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent.toFixed(0));
    }
  };

  useEffect(() => {
    if (isLoadingFile === false) {
      setShowProgress(0);
    }
  }, [isLoadingFile]);

  const [dragging, setDragging] = useState<boolean>(false);

  function handleDragStart(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const newFiles = [...listAttactment];
    const droppedFiles: any = Array.from(e.dataTransfer.files);

    droppedFiles.forEach((file) => {
      const checkFile = file.type;

      if (!newFiles.find((f) => f.name === file.name)) {
        setIsLoadingFile(true);
        if (checkFile.startsWith("image")) {
          handUploadFile(file);
        }

        if (checkFile.startsWith("application")) {
          uploadDocumentFormData(file, onSuccess, onError, onProgress);
        }
      }
    });

    setListAttactment(newFiles);
  }

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess, onError: uploadError, onProgress });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    const changeResult = {
      fileUrl: result,
      type: "image",
      fileName: data.fileName,
      fileSize: data?.fileSize,
    };
    setListAttactment([changeResult, ...listAttactment]);
    setIsLoadingFile(false);
  };

  const uploadError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const handleRemoveImageItem = (idx) => {
    const result = [...listAttactment];
    result.splice(idx, 1);
    setListAttactment(result);
  };

  //* đoạn này hiển thị format loại ưu tiên
  const formatOptionLabelPriority = ({ label, value }) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="avatar">
          {/* <img src={avatar || ImageThirdGender} alt={label} /> */}
          <Icon
            name="Star"
            style={{
              width: 15,
              height: 15,
              fill: value === 4 ? "#ED1B34" : value === 3 ? "#FDE047" : "var(--extra-color-30)",
              marginTop: -4,
              marginRight: 3,
            }}
          />
        </div>
        <div>{label}</div>
      </div>
    );
  };

  // lấy thông tin ngày bắt đầu, ngày kết thúc
  const startDay = new Date(formData.values.startTime).getTime();
  const endDay = new Date(formData.values.endTime).getTime();

  const listField = useMemo(
    () =>
      [
        {
          label: "",
          name: "taskType",
          type: "radio",
          options: [
            {
              value: "assigned_task",
              label: "Giao việc",
            },
            {
              value: "my_task",
              label: "Công việc của tôi",
            },
          ],
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
          required: true,
        },

        {
          name: "docLink",
          type: "custom",
          snippet: (
            <div className="attachments">
              <label className="title-attachment">Tài liệu đính kèm</label>
              <div
                className={"wrapper-list-image"}
                draggable="true"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
              >
                {/* <div className={listAttactment.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}> */}
                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                  <label htmlFor="imageUpload" className="action-upload-image">
                    <div className={`wrapper-upload`}>
                      <div>
                        <Icon name="UploadRox" />
                      </div>
                      <div>Nhấn hoặc thả vào để tải lên</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="list-attachment">
                {isLoadingFile ? (
                  <div className="item-attachment">
                    <Icon name="FileXls" />
                    <div className="data-file">
                      <span style={{ fontSize: 14, fontWeight: "500" }}>Đang tải...</span>
                      <div className="container-loading">
                        <div className="item-loading" style={{ width: `${showProgress}%` }} />
                      </div>
                    </div>
                  </div>
                ) : null}
                {listAttactment && listAttactment.length > 0
                  ? listAttactment.map((item, index) => (
                      <div
                        key={index}
                        className="item-attachment"
                        onDoubleClick={() => {
                          window.open(
                            `${process.env.APP_CRM_LINK}/crm/view_document?name=${item.fileName}&url=${item.fileUrl}`,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                      >
                        {item?.type == "image" ? <img src={item?.fileUrl} width={36} height={36} /> : <Icon name="FileXls" />}
                        {/* <Icon name='FileXls'/> */}
                        <div className="data-file">
                          <span style={{ fontSize: 14, fontWeight: "500" }}>
                            {item?.fileName ? trimContent(item?.fileName, 50, true, true) : ``}
                            {item?.fileName.length > 50 ? `.${item?.type}` : ""}
                          </span>
                          <div>
                            <span style={{ fontSize: 12, fontWeight: "400", color: "#999999" }}>
                              {item?.fileSize ? formatFileSize(item?.fileSize) : ``}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{ marginTop: "-1rem", cursor: "pointer" }}
                          onClick={() => {
                            handleRemoveImageItem(index);
                          }}
                        >
                          <Icon name="Times" style={{ width: "2rem", height: "2rem" }} />
                        </div>
                      </div>
                    ))
                  : null}
              </div>
              <input
                type="file"
                accept="image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
                className="d-none"
                id="imageUpload"
                onChange={(e) => handleUploadDocument(e)}
              />
            </div>
          ),
        },

        ...(formData?.values.taskType === "assigned_task"
          ? [
              {
                name: "employeeId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    id="employeeId"
                    name="employeeId"
                    label="Người nhận việc"
                    options={[]}
                    fill={true}
                    required={true}
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
                  />
                ),
              },
              {
                name: "participants",
                type: "custom",
                snippet: (
                  <SelectCustom
                    id="participants"
                    name="participants"
                    label="Người tham gia"
                    fill={true}
                    options={[]}
                    isMulti={true}
                    value={dataParticipants}
                    onChange={(e) => handleChangeValueParticipant(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    loadOptionsPaginate={loadedOptionParticipant}
                    placeholder="Chọn người tham gia"
                    additional={{
                      page: 1,
                    }}
                    formatOptionLabel={formatOptionLabelParticipant}
                  />
                ),
              },
              {
                name: "ola",
                type: "custom",
                snippet: (
                  <div className="setting-OLA">
                    <div className="box_line_date">
                      <span className="title_time">Thời gian phản hồi:</span>
                      <div className="box_setting_time">
                        <div className="box_time">
                          <div className="form-group">
                            <NummericInput
                              name="score"
                              id="score"
                              // label="Số lượng thực tế"
                              fill={false}
                              value={valueResponse.day}
                              onChange={(e) => {
                                const value = e.target.value || "";
                                setValueResponse({ ...valueResponse, day: value });
                              }}
                            />
                          </div>
                          <div>
                            <span className="title_time">ngày</span>
                          </div>
                        </div>

                        <div className="box_time">
                          <div className="form-group">
                            <NummericInput
                              name="score"
                              id="score"
                              // label="Số lượng thực tế"
                              fill={false}
                              value={valueResponse.hour}
                              onChange={(e) => {
                                const value = e.target.value || "";
                                setValueResponse({ ...valueResponse, hour: value });
                              }}
                            />
                          </div>
                          <div>
                            <span className="title_time">giờ</span>
                          </div>
                        </div>

                        <div className="box_time">
                          <div className="form-group">
                            <NummericInput
                              name="score"
                              id="score"
                              // label="Số lượng thực tế"
                              fill={false}
                              value={valueResponse.minute}
                              onChange={(e) => {
                                const value = e.target.value || "";
                                setValueResponse({ ...valueResponse, minute: value });
                              }}
                            />
                          </div>
                          <div>
                            <span className="title_time">phút</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="box_line_date">
                      <span className="title_time">Thời gian xử lý:</span>
                      <div className="box_setting_time">
                        <div className="box_time">
                          <div className="form-group">
                            <NummericInput
                              name="score"
                              id="score"
                              // label="Số lượng thực tế"
                              fill={false}
                              value={valueProcess.day}
                              onChange={(e) => {
                                const value = e.target.value || "";
                                setValueProcess({ ...valueProcess, day: value });
                              }}
                            />
                          </div>
                          <div>
                            <span className="title_time">ngày</span>
                          </div>
                        </div>

                        <div className="box_time">
                          <div className="form-group">
                            <NummericInput
                              name="score"
                              id="score"
                              // label="Số lượng thực tế"
                              fill={false}
                              value={valueProcess.hour}
                              onChange={(e) => {
                                const value = e.target.value || "";
                                setValueProcess({ ...valueProcess, hour: value });
                              }}
                            />
                          </div>
                          <div>
                            <span className="title_time">giờ</span>
                          </div>
                        </div>

                        <div className="box_time">
                          <div className="form-group">
                            <NummericInput
                              name="score"
                              id="score"
                              // label="Số lượng thực tế"
                              fill={false}
                              value={valueProcess.minute}
                              onChange={(e) => {
                                const value = e.target.value || "";
                                setValueProcess({ ...valueProcess, minute: value });
                              }}
                            />
                          </div>
                          <div>
                            <span className="title_time">phút</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]
          : [
              {
                name: "time",
                type: "custom",
                snippet: (
                  <div className="container-time">
                    <div className="form-group">
                      <DatePickerCustom
                        label="Thời gian bắt đầu:"
                        name="startTime"
                        fill={true}
                        required={true}
                        value={formData.values.startTime ? moment(formData.values.startTime).format("DD/MM/YYYY - HH:mm") : ""}
                        onChange={(e) => {
                          setFormData({ ...formData, values: { ...formData?.values, startTime: e } });
                        }}
                        placeholder="DD/MM/YYYY"
                        maxDate={formData.values.endTime}
                        icon={<Icon name="Calendar" />}
                        iconPosition="right"
                        hasSelectTime={true}
                      />
                    </div>
                    <div className="form-group">
                      <DatePickerCustom
                        label="Thời gian kết thúc:"
                        name="endTime"
                        fill={true}
                        required={true}
                        value={formData.values.endTime ? moment(formData.values.endTime).format("DD/MM/YYYY - HH:mm") : ""}
                        onChange={(e) => {
                          setFormData({ ...formData, values: { ...formData?.values, endTime: e } });
                        }}
                        placeholder="DD/MM/YYYY"
                        minDate={formData.values.startTime}
                        icon={<Icon name="Calendar" />}
                        iconPosition="right"
                        hasSelectTime={true}
                      />
                    </div>
                  </div>
                ),
              },
              // {
              //   label: "Bắt đầu",
              //   name: "startTime",
              //   type: "date",
              //   fill: true,
              //   required: true,
              //   icon: <Icon name="Calendar" />,
              //   iconPosition: "left",
              //   isWarning: startDay > endDay,
              //   hasSelectTime: true,
              //   placeholder: "Nhập ngày bắt đầu",
              //   messageWarning: "Ngày bắt đầu nhỏ hơn ngày kết thúc",
              // },
              // {
              //   label: "Kết thúc",
              //   name: "endTime",
              //   type: "date",
              //   fill: true,
              //   required: true,
              //   icon: <Icon name="Calendar" />,
              //   iconPosition: "left",
              //   isWarning: endDay < startDay,
              //   hasSelectTime: true,
              //   placeholder: "Nhập ngày kết thúc",
              //   messageWarning: "Ngày kết thúc lớn hơn ngày bắt đầu",
              // },
            ]),

        {
          name: "priorityLevel",
          type: "custom",
          snippet: (
            <SelectCustom
              id="priorityLevel"
              name="priorityLevel"
              label="Loại ưu tiên"
              fill={true}
              special={true}
              options={[
                {
                  value: 4,
                  label: "Gấp",
                },
                {
                  value: 3,
                  label: "Ưu tiên",
                },
                {
                  value: 2,
                  label: "Không ưu tiên",
                },
              ]}
              value={priorityLevel}
              onChange={(e) => {
                setPriorityLevel(e);
                setFormData({ ...formData, values: { ...formData?.values, priorityLevel: e.value } });
              }}
              isAsyncPaginate={false}
              isFormatOptionLabel={true}
              placeholder="Chọn loại ưu tiên"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelPriority}
            />
          ),
        },
      ] as IFieldCustomize[],
    [
      startDay,
      endDay,
      formData,
      listAttactment,
      dataEmployee,
      dataParticipants,
      isLoadingFile,
      showProgress,
      valueResponse,
      valueProcess,
      priorityLevel,
    ]
  );

  useEffect(() => {
    if (formData?.values.taskType === "assigned_task") {
      setFormData({ ...formData, values: { ...formData?.values, startTime: "", endTime: "", employeeId: "", status: 0 } });
      setDataEmployee(null);
    } else if (formData?.values.taskType === "my_task") {
      setFormData({ ...formData, values: { ...formData?.values, employeeId: formData?.values.managerId, status: 1 } });
      setDataParticipants([]);
      setValueProcess({
        id: "",
        day: "",
        hour: "",
        minute: "",
        timeType: "process",
      });

      setValueResponse({
        id: "",
        day: "",
        hour: "",
        minute: "",
        timeType: "response",
      });
    }
  }, [formData?.values.taskType]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const listIdParticipants = dataParticipants.map((item) => item.value);

    setIsSubmit(true);

    const body: any = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as any),
      docLink: JSON.stringify(listAttactment),
      participants: JSON.stringify(listIdParticipants || []),
      ola: JSON.stringify({ responseTime: valueResponse, processTime: valueProcess }),
    };

    const response = await WorkOrderService.update(body);

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
    setDataParticipants([]);
    setData(null);
    setListAttactment([]);
    setPriorityLevel({ value: 4, label: "Gấp" });
    setValueProcess({
      id: "",
      day: "",
      hour: "",
      minute: "",
      timeType: "process",
    });

    setValueResponse({
      id: "",
      day: "",
      hour: "",
      minute: "",
      timeType: "response",
    });
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
            title: "Áp dụng",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !formData?.values.name ||
              !formData?.values.content ||
              !formData?.values.employeeId ||
              (formData?.values.taskType === "my_task" ? !formData?.values.startTime || !formData?.values.endTime : "") ||
              (_.isEqual(formData.values, values) &&
                (data?.ola
                  ? _.isEqual(JSON.parse(data?.ola).responseTime, valueResponse) && _.isEqual(JSON.parse(data?.ola).processTime, valueProcess)
                  : "")) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, data, valueResponse, valueProcess]
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
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-work-bpm"
        size="sm"
      >
        <form className="form-add-work-bpm" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${idWork ? "Chỉnh sửa" : "Thêm mới"} công việc`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
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

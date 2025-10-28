import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, convertToFileName } from "reborn-util";
import "./index.scss";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import Tippy from "@tippyjs/react";
import RadioList from "components/radio/radioList";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Checkbox from "components/checkbox/checkbox";
import { uploadDocumentFormData } from "utils/document";
import { handDownloadFileOrigin, showToast } from "utils/common";
import FileService from "services/FileService";
import ImgRar from "assets/images/img-rar.png";
import ImgZip from "assets/images/img-zip.png";
import ImgFilePDF from "assets/images/img-pdf.png";
import ImgFileDoc from "assets/images/img-word.png";
import ImgFileExcel from "assets/images/img-excel.png";
import ImgFilePowerpoint from "assets/images/img-powerpoint.png";
import DepartmentService from "services/DepartmentService";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";
import BusinessProcessService from "services/BusinessProcessService";
import Button from "components/button/button";
import ModalSetting from "../ModalUserTask/partials/ModalSetting";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";

export default function ModalManualTask({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [data, setData] = useState(null);
  const [dataDepartment, setDataDepartment] = useState(null);
  const [dataAssigness, setDataAssigness] = useState([]);
  const [dataWorkflow, setDataWorkflow] = useState(null);

  const [checkFieldStartDate, setCheckFieldStartDate] = useState<boolean>(false);
  const [checkFieldEndDate, setCheckFieldEndDate] = useState<boolean>(false);
  const [childProcessId, setChildProcessId] = useState(null);
  useEffect(() => {
    if (dataNode && onShow) {
      getDetailTask(dataNode.id);
      if (dataNode?.businessObject?.$parent?.id && dataNode.businessObject?.$parent?.$type === "bpmn:SubProcess") {
        getDetailNode(dataNode?.id);
      }
    }
  }, [dataNode, onShow]);

  const getDetailNode = async (nodeId) => {
    const response = await BusinessProcessService.bpmDetailNode(nodeId);

    if (response.code == 0) {
      const result = response.result;
      setChildProcessId(result?.processId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailTask = async (id) => {
    const response = await BusinessProcessService.detailManualTask(id);

    if (response.code == 0) {
      const result = response.result;
      const assignees = (result?.assignees && JSON.parse(result.assignees)) || [];
      if (assignees?.length > 0) {
        setDataAssigness(assignees);
      }
      const attachments = (result?.attachments && JSON.parse(result.attachments)) || [];
      setListAttactment(attachments);

      const department = (result?.department && JSON.parse(result.department)) || null;
      const data = {
        ...result,
        department: department,
      };
      setData(data);
      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const values = useMemo(
    () => ({
      id: null,
      name: data?.name ?? "",
      code: data?.code ?? "",
      description: data?.description ?? "",
      assignees: data?.assignees ?? "[]",
      startDate: data?.startDate ?? "",
      endDate: data?.endDate ?? "",
      status: data?.status?.toString() ?? "1", //1 - Hoan thanh, 2 - Dang tien hanh, 3 - tri hoan
      outcome: data?.outcome ?? "",
      attachments: "",
      department: data?.department ?? null,
      confirmation: data?.confirmation ?? 0,
      nodeId: dataNode?.id ?? null,
      processId: childProcessId ?? processId ?? null,
      workflowId: data?.workflowId ?? null,
    }),
    [onShow, data, dataNode, processId, childProcessId]
  );

  const [formData, setFormData] = useState(values);

  const startDay = new Date(formData.startDate).getTime();
  const endDay = new Date(formData.endDate).getTime();

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // const dataAttactment = (listAttactment || []).map((item) => {
    //     return {
    //       fileUrl: item.url,
    //       // fileName: `${convertToFileName(item?.fileName || '')}`,
    //       fileName: item?.fileName,
    //     };
    // });

    setIsSubmit(true);
    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      code: formData?.code ?? "",
      department: JSON.stringify(formData?.department) ?? null,
      description: formData?.description ?? "",
      assignees: formData?.assignees ?? null,
      startDate: formData?.startDate ?? "",
      endDate: formData?.endDate ?? "",
      status: formData?.status ?? "1",
      outcome: formData?.outcome ?? "",
      attachments: JSON.stringify(listAttactment) ?? "[]",
      confirmation: formData?.confirmation ?? 0,
      nodeId: dataNode?.id ?? null,
      processId: formData?.processId ?? null,
      workflowId: formData?.workflowId ?? null,
    };

    console.log("body", body);

    const response = await BusinessProcessService.updateManualTask(body);

    if (response.code === 0) {
      showToast(`Cập nhật biểu mẫu thành công`, "success");
      handleClear(false);
      changeNameNodeXML(dataNode, body.name);
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
            title: disable ? "Đóng" : "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData, values) ? handleClear(false) : showDialogConfirmCancel();
            },
          },
          ...(disable
            ? []
            : ([
                {
                  title: "Cập nhật",
                  type: "submit",
                  color: "primary",
                  disabled: isSubmit,
                  // || !isDifferenceObj(formData, values),
                  is_loading: isSubmit,
                },
              ] as any)),
        ],
      },
    }),
    [formData, values, isSubmit, disable]
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
        handleClear(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClear = (acc) => {
    onHide(acc);
    setData(null);
    setDataAssigness(null);
    setDataDepartment(null);
    setCheckFieldStartDate(false);
    setCheckFieldEndDate(false);
    setDataWorkflow(null);
  };

  const loadedOptionDepartment = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: 1,
      limit: 1000,
    };
    const response = await DepartmentService.list(params);

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
        // hasMore: response.result.loadMoreAble,
        // additional: {
        //   page: page + 1,
        // },
      };
    }

    return { options: [], hasMore: false };
  };

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      departmentId: formData.department?.value,
      // branchId: dataBranch.value,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result?.items;

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
    loadedOptionEmployee("", undefined, { page: 1 });
  }, [formData.department]);

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

  const [listAttactment, setListAttactment] = useState([]);
  // console.log('listAttactment', listAttactment);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<number>(0);

  //! đoạn này xử lý hình ảnh
  const handleUploadDocument = (e) => {
    e.preventDefault();

    const file = e.target.files[0];

    const checkFile = file.type;
    setIsLoadingFile(true);
    if (checkFile.startsWith("image")) {
      handUploadFile(file);
    }

    if (checkFile.startsWith("application")) {
      uploadDocumentFormData(file, onSuccess, onError, onProgress);
    }
  };

  //* Xử lý tài liệu
  const onSuccess = (data) => {
    if (data) {
      const result = {
        url: data.fileUrl,
        type: data.extension,
        fileName: data.fileName,
      };

      setListAttactment([...listAttactment, result]);
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

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess, onError: uploadError });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    const changeResult = {
      url: result,
      type: "image",
      fileName: data.fileName,
    };
    setListAttactment([...listAttactment, changeResult]);
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
  const download = (link, name) => {
    const type = link.includes(".docx")
      ? "docx"
      : link.includes(".xlsx")
      ? "xlsx"
      : link.includes(".pdf") || link.includes(".PDF")
      ? "pdf"
      : link.includes(".pptx")
      ? "pptx"
      : link.includes(".zip")
      ? "zip"
      : "rar";
    const nameDownload = `${name}.${type}`;

    handDownloadFileOrigin(link, nameDownload);
  };

  const loadedOptionWorkflow = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
      processId: processId,
    };
    const response = await BusinessProcessService.listStep(params);

    if (response.code === 0) {
      const dataOption = response.result?.items || [];
      const options = dataOption.filter((el) => el.stepName);

      return {
        options: [
          ...(options.length > 0
            ? options.map((item) => {
                return {
                  value: item.id,
                  label: item.stepName,
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-manual-task"
      >
        <form className="form-manual-task" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={`Cài đặt biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt biểu mẫu"}</h4>
            </div>
            <ListButtonHeader
              data={data}
              dataNode={dataNode}
              processId={processId}
              disable={disable}
              isSubmit={isSubmit}
              setIsModalClone={() => setIsModalClone(true)}
              setIsModalSetting={() => setIsModalSetting(true)}
              setIsModalDebug={() => setIsModalDebug(true)}
              handleClear={() => handleClear(false)}
            />
          </div>
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <Input
                  id="name"
                  name="name"
                  label="Tên nhiệm vụ"
                  fill={true}
                  required={true}
                  placeholder={"Tên nhiệm vụ"}
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, name: value });
                  }}
                />
              </div>

              <div className="form-group">
                <Input
                  id="code"
                  name="code"
                  label="Mã nhiệm vụ"
                  fill={true}
                  required={false}
                  placeholder={"Mã nhiệm vụ"}
                  value={formData.code}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, code: value });
                  }}
                />
              </div>

              <div className="form-group">
                <TextArea
                  name="note"
                  value={formData.description}
                  label="Mô tả nhiệm vụ"
                  fill={true}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, description: value });
                  }}
                  placeholder="Nhập mô tả"
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="departmentId"
                  name="departmentId"
                  label="Phòng ban thực hiện"
                  fill={true}
                  required={true}
                  options={[]}
                  value={formData.department}
                  onChange={(e) => {
                    // setDataDepartment(e);
                    setFormData({ ...formData, department: e });
                  }}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={false}
                  placeholder="Chọn phòng ban thực hiện"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionDepartment}
                  // formatOptionLabel={formatOptionLabelCustomer}
                  // disabled={checkParamsUrl}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  key={formData.department?.value}
                  id="assignees"
                  name="assignees"
                  label="Người thực hiện"
                  fill={true}
                  isMulti={true}
                  required={false}
                  options={[]}
                  value={dataAssigness}
                  onChange={(e) => {
                    setDataAssigness(e);
                    // const listEmployeeIds = e.map(item => {
                    //   return item.value
                    // })
                    setFormData({ ...formData, assignees: JSON.stringify(e) });
                  }}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={false}
                  placeholder="Chọn người thực hiện"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEmployee}
                  formatOptionLabel={formatOptionLabelEmployee}
                  // disabled={checkParamsUrl}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="status"
                  name="status"
                  label="Tình trạng nhiệm vụ"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: "1",
                      label: "Hoàn thành",
                    },
                    {
                      value: "2",
                      label: "Đang tiến hành",
                    },
                    {
                      value: "3",
                      label: "Trì hoãn",
                    },
                  ]}
                  value={
                    formData.status
                      ? {
                          value: formData.status,
                          label: formData.status === "1" ? "Hoàn thành" : formData.status === "2" ? "Đang tiến hành" : "Trì hoãn",
                        }
                      : null
                  }
                  onChange={(e) => {
                    setFormData({ ...formData, status: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn tình trạng nhiệm vụ"
                  // additional={{
                  //     page: 1,
                  // }}
                  // loadOptionsPaginate={loadOptionSaleflow}
                  // formatOptionLabel={formatOptionLabelCustomer}
                  // disabled={checkParamsUrl}
                />
              </div>

              <div className="form-group">
                <DatePickerCustom
                  label="Ngày bắt đầu"
                  name="startDate"
                  fill={true}
                  value={formData?.startDate}
                  onChange={(e) => {
                    setCheckFieldStartDate(false);
                    setFormData({ ...formData, startDate: e });
                  }}
                  placeholder="Chọn ngày bắt đầu"
                  required={false}
                  iconPosition="left"
                  icon={<Icon name="Calendar" />}
                  error={checkFieldStartDate || startDay > endDay}
                  message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày hoàn thành" : "Vui lòng chọn ngày bắt đầu"}
                />
              </div>

              <div className="form-group">
                <DatePickerCustom
                  label="Ngày hoàn thành"
                  name="endDate"
                  fill={true}
                  value={formData?.endDate}
                  onChange={(e) => {
                    setCheckFieldEndDate(false);
                    setFormData({ ...formData, endDate: e });
                  }}
                  placeholder="Chọn ngày hoàn thành"
                  required={false}
                  iconPosition="left"
                  icon={<Icon name="Calendar" />}
                  error={checkFieldEndDate || endDay < startDay}
                  message={endDay < startDay ? "Ngày hoàn thành lớn hơn ngày bắt đầu" : "Vui lòng chọn ngày hoàn thành"}
                />
              </div>

              <div className="form-group">
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Xác nhận hoàn thành</span>
                </div>
                <div style={{ marginLeft: 10 }}>
                  <Checkbox
                    checked={formData.confirmation === 1 ? true : false}
                    label="Hoàn thành"
                    onChange={() => {
                      setFormData({
                        ...formData,
                        confirmation: formData.confirmation === 1 ? 0 : 1,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <TextArea
                  name="outcome"
                  value={formData.outcome}
                  label="Kết quả thực hiện"
                  fill={true}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, outcome: value });
                  }}
                  placeholder="Nhập kết quả thực hiện"
                />
              </div>

              <div className="attachments">
                <label className="title-attachment">Tài liệu đính kèm</label>
                <div className={listAttactment.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                  {listAttactment.length === 0 ? (
                    <label htmlFor="imageUpload" className="action-upload-image">
                      <div className={`wrapper-upload ${isLoadingFile ? "d-none" : ""}`}>
                        <Icon name="Upload" />
                        Tải tài liệu lên
                      </div>

                      <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                        <Icon name="Refresh" />
                        <span className="name-loading">Đang tải...{showProgress}%</span>
                      </div>
                    </label>
                  ) : (
                    <Fragment>
                      <div className="d-flex align-items-center">
                        {listAttactment.map((item, idx) => (
                          <div key={idx} className={item.type === "image" ? "image-item" : "file-item"}>
                            <img
                              src={
                                // item.type == "xlsx" ? ImgExcel
                                // : item.type === "docx" ? ImgWord
                                // : item.type === "pptx" ? ImgPowerpoint
                                // : item.url
                                item.type === "docx"
                                  ? ImgFileDoc
                                  : item.type === "xlsx"
                                  ? ImgFileExcel
                                  : item.type === "pdf" || item.type === "PDF"
                                  ? ImgFilePDF
                                  : item.type === "pptx"
                                  ? ImgFilePowerpoint
                                  : item.type === "zip"
                                  ? ImgZip
                                  : item.type === "zip"
                                  ? ImgRar
                                  : item.url
                              }
                              alt="image-warranty"
                            />
                            {item.type !== "image" && (
                              <div className="file-name">
                                <h5 style={{ fontSize: 14 }}>{item?.fileName ? item?.fileName : `${convertToFileName(item?.fileName)}`}</h5>
                              </div>
                            )}
                            <Tippy content="Tải xuống">
                              <span
                                className="icon-download"
                                onClick={() => {
                                  download(item?.url, item?.fileName);
                                }}
                              >
                                <Icon name="Download" />
                              </span>
                            </Tippy>
                            <Tippy content="Xoá">
                              <span className="icon-delete" onClick={() => handleRemoveImageItem(idx)}>
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          </div>
                        ))}

                        <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                          <Icon name="Refresh" />
                          <span className="name-loading">Đang tải...{showProgress}%</span>
                        </div>

                        <label htmlFor="imageUpload" className="add-image">
                          <Icon name="PlusCircleFill" />
                        </label>
                      </div>
                    </Fragment>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
                  className="d-none"
                  id="imageUpload"
                  onChange={(e) => handleUploadDocument(e)}
                />
              </div>
              <div className="form-group">
                <SelectCustom
                  // key={listAttribute.length}
                  id=""
                  name="name"
                  label={"Luồng công việc"}
                  fill={true}
                  required={false}
                  // error={item.checkMapping}
                  // message="Biến quy trình không được để trống"
                  options={[]}
                  value={dataWorkflow}
                  onChange={(e) => {
                    setDataWorkflow(e);
                    setFormData({ ...formData, workflowId: e.value });
                  }}
                  isAsyncPaginate={true}
                  placeholder="Chọn luồng công việc"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionWorkflow}
                  // formatOptionLabel={formatOptionLabelAttribute}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalSetting
        onShow={isModalSetting}
        dataNode={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalSetting(false);
        }}
      />
      <ModalSelectNodeOther
        onShow={isModalClone}
        data={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            getDetailTask(dataNode.id);
          }
          setIsModalClone(false);
        }}
      />
      <ModalDebug
        onShow={isModalDebug}
        dataNode={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalDebug(false);
        }}
      />
    </Fragment>
  );
}

import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import "./ModalAddAction.scss";
import { ContextType, UserContext } from "contexts/userContext";
import NummericInput from "components/input/numericInput";
import _ from "lodash";
import Checkbox from "components/checkbox/checkbox";
import ImageThirdGender from "assets/images/third-gender.png";
import SelectCustom from "components/selectCustom/selectCustom";
import ContractApproachService from "services/ContractApproachService";
import ContractEformService from "services/ContractEformService";
import ContractPipelineService from "services/ContractPipelineService";

export default function ModalAddAction(props: any) {
  const { onShow, onHide, approachData, activityData, actionList } = props;
  console.log("activityData", activityData);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [activityOption, setActivityAction] = useState([]);

  const optionInit = [
    {
      value: "email",
      label: "Gửi Email",
    },
    {
      value: "fs",
      label: "Tạo FS",
    },
    {
      value: "quote",
      label: "Tạo Báo giá",
    },
    {
      value: "collectInfo",
      label: "Thu thập thông tin",
    },
    {
      value: "sign",
      label: "Trình ký",
    },
    {
      value: "appendix",
      label: "Thêm phụ lục",
    },
    {
      value: "warranty",
      label: "Tạo bảo hành",
    },
    {
      value: "attachment",
      label: "Đính kèm tài liệu",
    },
    {
      value: "payment",
      label: "Thanh toán",
    },
    {
      value: "childProcess",
      label: "Chuyển quy trình",
    },
  ];

  useEffect(() => {
    if (actionList && actionList.length > 0) {
      let newList = [...optionInit];
      actionList.map((item) => {
        const newArray = newList.filter((el) => el.value !== item.code);
        newList = newArray;
      });
      setActivityAction(newList);
    } else {
      setActivityAction(optionInit);
    }
  }, [actionList]);

  const [valueConfig, setValueConfig] = useState({
    code: "",
    required: 0,
    hasVoc: 0,
    eformId: 0,
    pipelineId: 0,
  });
  // console.log('valueSetting', valueSetting);

  const getActivityName = (code: string) => {
    switch (code) {
      case "email":
        return "Email";
      case "fs":
        return "Tạo FS";
      case "quote":
        return "Tạo báo giá";
      case "collectInfo":
        return "Thu thập thông tin";
      case "sign":
        return "Trình ký";
      case "appendix":
        return "Thêm phụ lục";
      case "warranty":
        return "Tạo bảo hành";
      case "attachment":
        return "Đính kèm tài liệu";
      case "payment":
        return "Thanh toán";
      case "childProcess":
        return "Chuyển quy trình";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (activityData) {
      setValueConfig({
        code: activityData.code,
        required: activityData.required,
        hasVoc: activityData.hasVoc,
        eformId: activityData.eformId,
        pipelineId: activityData.pipelineId,
      });

      setDetailAction({
        value: activityData.code,
        label: getActivityName(activityData.code),
      });

      setDataEform({ value: activityData.eformId, label: activityData.eformName });
      setDataSubPipelineId({ value: activityData.pipelineId, label: activityData.pipelineName });
    } else {
      setValueConfig({
        code: "",
        required: 0,
        hasVoc: 0,
        eformId: 0,
        pipelineId: 0,
      });
      setDetailAction(null);
      setDataSubPipelineId(null);
    }
  }, [activityData]);

  const [formData, setFormData] = useState(valueConfig);

  useEffect(() => {
    setFormData(valueConfig);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [valueConfig, onShow]);

  const [detailAction, setDetailAction] = useState(null);

  const [checkFieldAction, setCheckFieldAction] = useState<boolean>(false);

  //   const loadedOptionAction = async (search, loadedOptions, { page }) => {
  //     const param: IEmployeeFilterRequest = {
  //       name: search,
  //       page: page,
  //       limit: 10,
  //     };

  //     const response = await EmployeeService.list(param);

  //     if (response.code === 0) {
  //       const dataOption = response.result.items;

  //       return {
  //         options: [
  //           ...(dataOption.length > 0
  //             ? dataOption.map((item) => {
  //                 return {
  //                   value: item.id,
  //                   label: item.name,
  //                   avatar: item.avatar,
  //                   departmentName: item.departmentName,
  //                   branchName: item.branchName
  //                 };
  //               })
  //             : []),
  //         ],
  //         hasMore: response.result.loadMoreAble,
  //         additional: {
  //           page: page + 1,
  //         },
  //       };
  //     }

  //     return { options: [], hasMore: false };
  //   };

  const formatOptionLabelEmployee = ({ label, avatar, departmentName, branchName }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div>
          <div>{label}</div>
          <div>
            <span style={{ fontSize: 10, fontWeight: "200", marginTop: 3 }}>{`${departmentName} (${branchName})`}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleChangeValueAction = (e) => {
    setCheckFieldAction(false);
    setDetailAction(e);
    setFormData({ ...formData, code: e.value });
  };

  const [dataEform, setDataEform] = useState(null);
  const [checkFieldEform, setCheckFieldEform] = useState<boolean>(false);

  const [dataSubPipelineId, setDataSubPipelineId] = useState(null);
  const [checkFieldSubPipelineId, setCheckFieldSubPipelineId] = useState<boolean>(false);

  const loadedOptionEform = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ContractEformService.list(param);

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

  const handleChangeValueEform = (e) => {
    setCheckFieldEform(false);
    setDataEform(e);
    setFormData({ ...formData, eformId: e.value });
  };

  /**
   * Lấy danh sách quy trình (Lất toàn bộ => Không nhiều)
   * @param search
   * @param loadedOptions
   * @param param2
   * @returns
   */
  const loadedOptionSubPipeline = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 100,
    };

    const response = await ContractPipelineService.list(param);

    if (response.code === 0) {
      const dataOption = response.result || [];

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

  const handleChangeValueChildProcess = (e) => {
    setCheckFieldSubPipelineId(false);
    setDataSubPipelineId(e);
    setFormData({ ...formData, pipelineId: e.value });
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (detailAction === null) {
      setCheckFieldAction(true);
      return;
    }
    if (detailAction && detailAction.value === "collectInfo" && dataEform === null) {
      setCheckFieldEform(true);
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(formData as any),
      ...(activityData ? { id: activityData.id } : {}),
      ...{ approachId: approachData.id },
    };

    console.log("body", body);

    const response = await ContractApproachService.updateActivity(body);
    if (response.code === 0) {
      onHide(true);
      setDetailAction(null);
      setDataEform(null);
      showToast(`Thêm hành động thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDetailAction(null);
    setDataEform(null);
    setDataSubPipelineId(null);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              // _.isEqual(formData, valueConfig) ? handClearForm() : showDialogConfirmCancel();
              handClearForm();
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldAction ||
              checkFieldEform ||
              //   !isDifferenceObj(formData.values, valueSetting),
              _.isEqual(formData, valueConfig),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, valueConfig, checkFieldEform]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác cài đặt`}</Fragment>,
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-action"
        size="lg"
      >
        <form className="form-add-action" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Thêm hành động`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="container-add-action">
              <div style={{ width: "60%" }}>
                <SelectCustom
                  id="actionId"
                  name="actionId"
                  label=""
                  options={activityOption}
                  fill={true}
                  value={detailAction}
                  special={true}
                  required={true}
                  onChange={(e) => handleChangeValueAction(e)}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn hành động"
                  // additional={{
                  //     page: 1,
                  // }}
                  // loadOptionsPaginate={loadedOptionEmployee}
                  // formatOptionLabel={formatOptionLabelEmployee}
                  error={checkFieldAction}
                  message="Hành động không được bỏ trống"
                />
              </div>

              <div className="option">
                <div className="option-item">
                  <Checkbox
                    label="Bắt buộc"
                    checked={formData.required === 1 ? true : false}
                    onChange={(e) => {
                      if (formData.required === 1) {
                        setFormData({ ...formData, required: 0 });
                      } else {
                        setFormData({ ...formData, required: 1 });
                      }
                    }}
                  />
                </div>
                <div className="option-item">
                  <Checkbox
                    label="Thu thập VOC"
                    checked={formData.hasVoc === 1 ? true : false}
                    onChange={(e) => {
                      if (formData.hasVoc === 1) {
                        setFormData({ ...formData, hasVoc: 0 });
                      } else {
                        setFormData({ ...formData, hasVoc: 1 });
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {detailAction?.value === "collectInfo" ? (
              <div style={{ marginTop: "2rem" }}>
                <SelectCustom
                  id="eformId"
                  name="eformId"
                  label="Chọn biểu mẫu"
                  options={[]}
                  fill={true}
                  value={dataEform}
                  special={true}
                  required={true}
                  onChange={(e) => handleChangeValueEform(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={false}
                  placeholder="Chọn biểu mẫu"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEform}
                  // formatOptionLabel={formatOptionLabelEmployee}
                  error={checkFieldEform}
                  message="Biểu mẫu không được bỏ trống"
                />
              </div>
            ) : null}

            {/* Chọn quy trình con */}
            {detailAction?.value === "childProcess" ? (
              <div style={{ marginTop: "2rem" }}>
                <SelectCustom
                  id="pipelineId"
                  name="pipelineId"
                  label="Chọn pha hợp đồng"
                  options={[]}
                  fill={true}
                  value={dataSubPipelineId}
                  special={true}
                  required={true}
                  onChange={(e) => handleChangeValueChildProcess(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={false}
                  placeholder="Chọn pha hợp đồng"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionSubPipeline}
                  error={checkFieldEform}
                  message="Pha hợp đồng không được bỏ trống"
                />
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

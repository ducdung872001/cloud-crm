import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import CheckboxList from "components/checkbox/checkboxList";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";

import "./index.scss";
import { showToast } from "utils/common";
import ApprovalService from "services/ApprovalService";

interface IApprovalBellModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
}

export default function ApprovalBellModal(props: IApprovalBellModalProps) {
  const { onShow, onHide, data } = props;

  const lstTypeBell = [
    {
      value: "email",
      label: "Email",
    },
    {
      value: "sms",
      label: "SMS",
    },
  ];

  const lstOptionNotify = [
    {
      value: "signer",
      label: "Người trình ký",
    },
    {
      value: "nextSigner",
      label: "Người ký tiếp theo",
    },
  ];

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [lstTemplateEmail, setLstTemplateEmail] = useState([]);
  const [isLoadingTemplateEmail, setIsLoadingTemplateEmail] = useState<boolean>(false);

  const [lstTemplateSMS, setLstTemplateSMS] = useState([]);
  const [isLoadingTemplateSMS, setIsLoadingTemplateSMS] = useState<boolean>(false);

  const [templateEmailSuccessId, setTemplateEmailSuccessId] = useState(null);
  const [templateEmailFailId, setTemplateEmailFailId] = useState(null);
  const [templateEmailNextSignerId, setTemplateEmailNextSignerId] = useState(null);

  const [templateSmsSuccessId, setTemplateSmsSuccessId] = useState(null);
  const [templateSmsFailId, setTemplateSmsFailId] = useState(null);
  const [templateSmsNextSignerId, setTemplateSmsNextSignerId] = useState(null);

  const onSelectOpenTemplateEmail = async () => {
    setIsLoadingTemplateEmail(true);
    const dataOption = await SelectOptionData("templateEmailId");
    if (dataOption) {
      setLstTemplateEmail([...(dataOption.length > 0 ? dataOption : [])]);
    }
    setIsLoadingTemplateEmail(false);
  };

  const onSelectOpenTemplateSMS = async () => {
    setIsLoadingTemplateSMS(true);
    const dataOption = await SelectOptionData("templateSmsId");
    if (dataOption) {
      setLstTemplateSMS([...(dataOption.length > 0 ? dataOption : [])]);
    }
    setIsLoadingTemplateSMS(false);
  };

  const values = useMemo(
    () => ({
      from: "signer",
      type: "email", // thông báo qua đâu
      templateEmailSuccessId: null,
      templateEmailFailId: null,
      templateEmailNextSignerId: null,

      templateSmsSuccessId: null,
      templateSmsFailId: null,
      templateSmsNextSignerId: null,
    }),
    []
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    if (data) {
      const config = (data.alertConfig && JSON.parse(data.alertConfig)) || null;

      if (config) {
        onSelectOpenTemplateEmail();
        onSelectOpenTemplateSMS();
        if (config.alertStrategies && config.alertStrategies.length > 0) {
          const alertStrategies = config.alertStrategies || [];
          const haveSigner = alertStrategies.filter((el) => el.target === 1).length > 0 ? true : false;
          const haveNextSigner = alertStrategies.filter((el) => el.target === 2).length > 0 ? true : false;
          let checkFrom = "";
          let checkTypeSuccess = "";
          let checkTypeFail = "";
          let checkTypeNext = "";
          let checkType = "";

          if (haveNextSigner && haveSigner) {
            // setFormData({ ...formData, from:  "signer,nextSigner" });
            checkFrom = "signer,nextSigner";
          } else if (haveSigner) {
            checkFrom = "signer";
          } else if (haveNextSigner) {
            checkFrom = "nextSigner";
          }

          if (haveSigner) {
            const dataSuccess = alertStrategies.find((el) => el.status === 1) || null;
            const dataFail = alertStrategies.find((el) => el.status === 0) || null;
            if (dataSuccess) {
              const channels = dataSuccess.channels || [];
              const channelEmail = channels.find((el) => el.channel === "email") || null;
              const channelSms = channels.find((el) => el.channel === "sms") || null;

              if (channelEmail && channelSms) {
                // setFormData({ ...formData, type:  "email,sms" });
                checkTypeSuccess = "email,sms";
              } else if (channelEmail) {
                checkTypeSuccess = "email";
              } else if (channelSms) {
                checkTypeSuccess = "sms";
              }

              if (channelEmail && channelEmail.templateId) {
                setTemplateEmailSuccessId({ value: channelEmail.templateId, label: channelEmail.templateName });
              }

              if (channelSms && channelSms.templateId) {
                setTemplateSmsSuccessId({ value: channelSms.templateId, label: channelSms.templateName });
              }
            }

            if (dataFail) {
              const channels = dataFail.channels || [];
              const channelEmail = channels.find((el) => el.channel === "email") || null;
              const channelSms = channels.find((el) => el.channel === "sms") || null;

              if (channelEmail && channelSms) {
                checkTypeFail = "email,sms";
              } else if (channelEmail) {
                checkTypeFail = "email";
              } else if (channelSms) {
                checkTypeFail = "sms";
              }

              if (channelEmail && channelEmail.templateId) {
                setTemplateEmailFailId({ value: channelEmail.templateId, label: channelEmail.templateName });
              }

              if (channelSms && channelSms.templateId) {
                setTemplateSmsFailId({ value: channelSms.templateId, label: channelSms.templateName });
              }
            }
          }

          if (haveNextSigner) {
            const dataSend = alertStrategies.find((el) => el.target === 2) || null;
            if (dataSend) {
              const channels = dataSend.channels || [];
              const channelEmail = channels.find((el) => el.channel === "email") || null;
              const channelSms = channels.find((el) => el.channel === "sms") || null;

              if (channelEmail && channelSms) {
                // setFormData({ ...formData, type:  "email,sms" });
                checkTypeNext = "email,sms";
              } else if (channelEmail) {
                checkTypeNext = "email";
              } else if (channelSms) {
                checkTypeNext = "sms";
              }

              if (channelEmail && channelEmail.templateId) {
                setTemplateEmailNextSignerId({ value: channelEmail.templateId, label: channelEmail.templateName });
              }

              if (channelSms && channelSms.templateId) {
                setTemplateSmsNextSignerId({ value: channelSms.templateId, label: channelSms.templateName });
              }
            }
          }

          const checkTypeList = `${checkTypeSuccess},${checkTypeFail},${checkTypeNext}`;

          if (checkTypeList.includes("email") && checkTypeList.includes("sms")) {
            checkType = "email,sms";
          } else if (checkTypeList.includes("email")) {
            checkType = "email";
          } else if (checkTypeList.includes("sms")) {
            checkType = "sms";
          }

          setFormData({ ...formData, from: checkFrom, type: checkType });
        }
      } else {
        setFormData(values);
      }
    }
  }, [data, values, onShow]);

  // useEffect(() => {
  //   setFormData(values);

  //   return () => {
  //     setIsSubmit(false);
  //   };
  // }, [values]);

  const handleChangeValueType = (e) => {
    const value = e || "email";
    // setFormData({ ...formData, type: value ? value : "email" });

    if (!value.split(",").includes("email")) {
      setFormData({ ...formData, templateEmailSuccessId: null, templateEmailFailId: null, templateEmailNextSignerId: null, type: value });

      setTemplateEmailSuccessId(null);
      setTemplateEmailFailId(null);
      setTemplateEmailNextSignerId(null);
    } else if (!value.split(",").includes("sms")) {
      setFormData({ ...formData, templateSmsSuccessId: null, templateSmsFailId: null, templateSmsNextSignerId: null, type: value });

      setTemplateSmsSuccessId(null);
      setTemplateSmsFailId(null);
      setTemplateSmsNextSignerId(null);
    } else {
      setFormData({ ...formData, type: value ? value : "email" });
    }
  };

  const handleChangeValueFrom = (e) => {
    const value = e || "signer";
    // setFormData({ ...formData, from: value ? value : "signer" });
    if (!value.split(",").includes("signer")) {
      setFormData({
        ...formData,
        templateEmailSuccessId: null,
        templateEmailFailId: null,
        templateSmsSuccessId: null,
        templateSmsFailId: null,
        from: value,
      });

      setTemplateEmailSuccessId(null);
      setTemplateEmailFailId(null);
      setTemplateSmsSuccessId(null);
      setTemplateSmsFailId(null);
    } else if (!value.split(",").includes("nextSigner")) {
      setFormData({
        ...formData,

        templateEmailNextSignerId: null,
        templateSmsNextSignerId: null,
        from: value,
      });
      setTemplateEmailNextSignerId(null);
      setTemplateSmsNextSignerId(null);
    } else {
      setFormData({ ...formData, from: value ? value : "signer" });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const config = {
      approvalId: data.id,
      alertStrategies: [
        ...(formData.from.split(",").includes("signer")
          ? [
              {
                target: 1,
                status: 1,
                channels: [
                  ...(formData.type.split(",").includes("email")
                    ? [
                        {
                          channel: "email",
                          templateId: templateEmailSuccessId?.value,
                          templateName: templateEmailSuccessId?.label,
                        },
                      ]
                    : []),

                  ...(formData.type.split(",").includes("sms")
                    ? [
                        {
                          channel: "sms",
                          templateId: templateSmsSuccessId?.value,
                          templateName: templateSmsSuccessId?.label,
                        },
                      ]
                    : []),
                ],
              },
              {
                target: 1,
                status: 0,
                channels: [
                  ...(formData.type.split(",").includes("email")
                    ? [
                        {
                          channel: "email",
                          templateId: templateEmailFailId?.value,
                          templateName: templateEmailFailId?.label,
                        },
                      ]
                    : []),

                  ...(formData.type.split(",").includes("sms")
                    ? [
                        {
                          channel: "sms",
                          templateId: templateSmsFailId?.value,
                          templateName: templateSmsFailId?.label,
                        },
                      ]
                    : []),
                ],
              },
            ]
          : []),

        ...(formData.from.split(",").includes("nextSigner")
          ? [
              {
                target: 2,
                status: null,
                channels: [
                  ...(formData.type.split(",").includes("email")
                    ? [
                        {
                          channel: "email",
                          templateId: templateEmailNextSignerId?.value,
                          templateName: templateEmailNextSignerId?.label,
                        },
                      ]
                    : []),

                  ...(formData.type.split(",").includes("sms")
                    ? [
                        {
                          channel: "sms",
                          templateId: templateSmsNextSignerId?.value,
                          templateName: templateSmsNextSignerId?.label,
                        },
                      ]
                    : []),
                ],
              },
            ]
          : []),
      ],
    };

    const body = {
      id: data.id,
      config: JSON.stringify(config),
    };

    const response = await ApprovalService.updateAlert(body);

    if (response.code === 0) {
      showToast(`Cài đặt cảnh báo thành công`, "success");
      setIsSubmit(false);
      onHide(true);
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
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData, values) ? handleClear(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            // || !isDifferenceObj(formData, values),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
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
    setTemplateEmailSuccessId(null);
    setTemplateEmailFailId(null);
    setTemplateEmailNextSignerId(null);

    setTemplateSmsSuccessId(null);
    setTemplateSmsFailId(null);
    setTemplateSmsNextSignerId(null);
    setFormData(values);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-add-bell-approval"
        size="lg"
      >
        <form className="form-add-bell-approval-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt cảnh báo ${data?.name?.toLowerCase()}`} toggle={() => !isSubmit && handleClear(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <CheckboxList title="Cảnh báo qua" value={formData.type} options={lstTypeBell} onChange={(e) => handleChangeValueType(e)} />
              </div>

              <div className="form-group">
                <CheckboxList title={"Cảnh báo đến"} value={formData.from} options={lstOptionNotify} onChange={(e) => handleChangeValueFrom(e)} />
              </div>

              {formData.from.split(",").includes("signer") ? (
                <div className="container-send-signer">
                  <div style={{ marginBottom: "1rem" }}>
                    <span style={{ fontSize: 16, fontWeight: "600" }}>Thông báo tới người trình ký</span>
                  </div>

                  {formData.type.split(",").includes("email") && (
                    <div className="merge-form">
                      <div className="form-group">
                        <SelectCustom
                          name="templateEmailSuccessId"
                          label="Mẫu Email thành công"
                          fill={true}
                          required={true}
                          special={true}
                          options={lstTemplateEmail}
                          value={templateEmailSuccessId}
                          isLoading={isLoadingTemplateEmail}
                          onMenuOpen={onSelectOpenTemplateEmail}
                          placeholder="Chọn mẫu email"
                          onChange={(e) => {
                            setTemplateEmailSuccessId(e);
                            setFormData({ ...formData, templateEmailSuccessId: e.value });
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <SelectCustom
                          name="templateEmailFailId"
                          label="Mẫu Email thất bại"
                          fill={true}
                          required={true}
                          special={true}
                          value={templateEmailFailId}
                          options={lstTemplateEmail}
                          isLoading={isLoadingTemplateEmail}
                          onMenuOpen={onSelectOpenTemplateEmail}
                          placeholder="Chọn mẫu email"
                          onChange={(e) => {
                            setTemplateEmailFailId(e);
                            setFormData({ ...formData, templateEmailFailId: e.value });
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {formData.type.split(",").includes("sms") && (
                    <div className="merge-form">
                      <div className="form-group">
                        <SelectCustom
                          name="templateSmsSuccessId"
                          label="Mẫu SMS thành công"
                          fill={true}
                          required={true}
                          options={lstTemplateSMS}
                          special={true}
                          value={templateSmsSuccessId}
                          isLoading={isLoadingTemplateSMS}
                          onMenuOpen={onSelectOpenTemplateSMS}
                          placeholder="Chọn mẫu sms"
                          onChange={(e) => {
                            setTemplateSmsSuccessId(e);
                            setFormData({ ...formData, templateSmsSuccessId: e.value });
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <SelectCustom
                          name="templateSmsFailId"
                          label="Mẫu SMS thất bại"
                          fill={true}
                          required={true}
                          options={lstTemplateSMS}
                          special={true}
                          value={templateSmsFailId}
                          isLoading={isLoadingTemplateSMS}
                          onMenuOpen={onSelectOpenTemplateSMS}
                          placeholder="Chọn mẫu sms"
                          onChange={(e) => {
                            setTemplateSmsFailId(e);
                            setFormData({ ...formData, templateSmsFailId: e.value });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {formData.from.split(",").includes("nextSigner") ? (
                <div className="container-send-nextSigner">
                  <div style={{ marginBottom: "1rem" }}>
                    <span style={{ fontSize: 16, fontWeight: "600" }}>Thông báo tới người ký tiếp theo</span>
                  </div>

                  <div className="merge-form">
                    {formData.type.split(",").includes("email") && (
                      <div className="form-group">
                        <SelectCustom
                          name="templateEmailNextSignerId"
                          label="Mẫu Email"
                          fill={true}
                          required={true}
                          special={true}
                          options={lstTemplateEmail}
                          value={templateEmailNextSignerId}
                          isLoading={isLoadingTemplateEmail}
                          onMenuOpen={onSelectOpenTemplateEmail}
                          placeholder="Chọn mẫu email"
                          onChange={(e) => {
                            setTemplateEmailNextSignerId(e);
                            setFormData({ ...formData, templateEmailNextSignerId: e.value });
                          }}
                        />
                      </div>
                    )}

                    {formData.type.split(",").includes("sms") && (
                      <div className="form-group">
                        <SelectCustom
                          name="templateSmsNextSignerId"
                          label="Mẫu SMS"
                          fill={true}
                          required={true}
                          options={lstTemplateSMS}
                          special={true}
                          value={templateSmsNextSignerId}
                          isLoading={isLoadingTemplateSMS}
                          onMenuOpen={onSelectOpenTemplateSMS}
                          placeholder="Chọn mẫu sms"
                          onChange={(e) => {
                            setTemplateSmsNextSignerId(e);
                            setFormData({ ...formData, templateSmsNextSignerId: e.value });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import CampaignApproachService from "services/CampaignApproachService";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";
import NummericInput from "components/input/numericInput";
import _ from "lodash";
import Checkbox from "components/checkbox/checkbox";
import SelectCustom from "components/selectCustom/selectCustom";
import TemplateEmailService from "services/TemplateEmailService";
import TemplateSMSService from "services/TemplateSMSService";

export default function ModalSettingSLA(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, dataApproach } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const notifyData = [
    {
      value: "1",
      label: "Quản lý chiến dịch",
    },
    {
      value: "2",
      label: "Điều phối chiến dịch",
    },
    {
      value: "3",
      label: "Nhân viên bán hàng",
    },
  ];

  const channelData = [
    {
      value: "email",
      label: "Qua Email",
    },
    {
      value: "sms",
      label: "Qua SMS",
    },
  ];

  useEffect(() => {
    if (dataApproach) {
      setValueSetting({
        ...valueSetting,
        id: dataApproach.id,
        ...(dataApproach?.slaConfig ? { slaConfig: JSON.parse(dataApproach.slaConfig) } : {}),
      });

      // if(dataApproach?.slaConfig){
      //     const targets = JSON.parse(dataApproach?.slaConfig)?.violation?.targets || [];
      //     const channels = JSON.parse(dataApproach?.slaConfig)?.violation?.channels || [];
      //     setNotifyList(targets);
      //     setChannelList(channels);
      // }
    }
  }, [dataApproach]);

  const [valueSetting, setValueSetting] = useState({
    id: "",
    slaConfig: {
      violation: {
        targets: [],
        channels: [],
      },
      processTime: {
        day: "",
        hour: "",
        minute: "",
      },
    },
  });

  const [formData, setFormData] = useState<IFormData>({ values: valueSetting });

  useEffect(() => {
    setFormData({ ...formData, values: valueSetting, errors: {} });
    setIsSubmit(false);
    setNotifyList(valueSetting.slaConfig?.violation?.targets || []);
    // setChannelList(valueSetting.slaConfig?.violation?.channels || []);
    const channelList = valueSetting.slaConfig?.violation?.channels || [];
    const channelNew = [];
    channelList.map((item) => {
      channelNew.push({
        type: item.type || item,
        templateId: item.templateId || null,
        templateName: item.templateName || null,
      });
    });
    setChannelList(channelNew);

    const emailData = channelNew.find((el) => el.type === "email") || null;
    if (emailData) {
      setDetailTemplateEmail({
        value: emailData.templateId,
        label: emailData.templateName,
      });
    }

    const smsData = channelNew.find((el) => el.type === "sms") || null;
    if (smsData) {
      setDetailTemplateSMS({
        value: smsData.templateId,
        label: smsData.templateName,
      });
    }

    return () => {
      setIsSubmit(false);
    };
  }, [valueSetting]);

  const [notifyList, setNotifyList] = useState([]);
  const [channelList, setChannelList] = useState([]);
  const [detailTemplateEmail, setDetailTemplateEmail] = useState(null);
  const [detailTemplateSMS, setDetailTemplateSMS] = useState(null);

  useEffect(() => {
    setFormData({
      ...formData,
      values: {
        ...formData.values,
        slaConfig: { ...formData.values.slaConfig, violation: { ...formData.values.slaConfig.violation, targets: notifyList } },
      },
    });
  }, [notifyList]);

  useEffect(() => {
    setFormData({
      ...formData,
      values: {
        ...formData.values,
        slaConfig: { ...formData.values.slaConfig, violation: { ...formData.values.slaConfig.violation, channels: channelList } },
      },
    });
  }, [channelList]);

  const loadedOptionTemplateEmail = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
    };

    const response = await TemplateEmailService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.title,
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

  const changeTemplateEmail = (e) => {
    setDetailTemplateEmail(e);
    const newChannel = [...channelList];
    const index = newChannel.findIndex((el) => el.type === "email");
    newChannel[index].templateId = e.value;
    newChannel[index].templateName = e.label;
    setChannelList(newChannel);
  };

  const loadedOptionTemplateSMS = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
    };

    const response = await TemplateSMSService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.title,
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

  const changeTemplateSMS = (e) => {
    setDetailTemplateSMS(e);
    const newChannel = [...channelList];
    const index = newChannel.findIndex((el) => el.type === "sms");
    newChannel[index].templateId = e.value;
    newChannel[index].templateName = e.label;
    setChannelList(newChannel);
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();

    // const errors = Validate(validations, formData, listField);

    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    setIsSubmit(true);

    const body = {
      id: formData.values.id,
      slaConfig: JSON.stringify(formData.values.slaConfig),
    };

    const response = await CampaignApproachService.updateSLA(body);
    if (response.code === 0) {
      onHide(true);
      showToast(`Cài đặt SLA thành công`, "success");
      setNotifyList([]);
      setChannelList([]);
      setDetailTemplateEmail(null);
      setDetailTemplateSMS(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setNotifyList([]);
    setChannelList([]);
    setDetailTemplateEmail(null);
    setDetailTemplateSMS(null);
    setValueSetting({
      id: "",
      slaConfig: {
        violation: {
          targets: [],
          channels: [],
        },
        processTime: {
          day: "",
          hour: "",
          minute: "",
        },
      },
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
              _.isEqual(formData.values, valueSetting) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              //   !isDifferenceObj(formData.values, valueSetting),
              _.isEqual(formData.values, valueSetting),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, valueSetting]
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
        className="modal-setting-SlA"
      >
        <form className="form-setting-SLA" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt SLA`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="setting-SLA">
              <div className="box_line_date">
                <span className="title_time">Thời gian dừng:</span>
                <div className="box_setting_time">
                  <div className="box_time">
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={formData.values?.slaConfig.processTime.day}
                        onValueChange={(e) => {
                          const value = e.floatValue || "";
                          setFormData({
                            ...formData,
                            values: {
                              ...formData.values,
                              slaConfig: { ...formData.values.slaConfig, processTime: { ...formData.values.slaConfig.processTime, day: value } },
                            },
                          });
                          // setValueSetting({...valueSetting, slaConfig: {...valueSetting.slaConfig, processTime: {...valueSetting.slaConfig.processTime, day: value}}});
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_time">ngày,</span>
                    </div>
                  </div>

                  <div className="box_time">
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={formData.values?.slaConfig.processTime.hour}
                        onValueChange={(e) => {
                          const value = e.floatValue;
                          setFormData({
                            ...formData,
                            values: {
                              ...formData.values,
                              slaConfig: { ...formData.values.slaConfig, processTime: { ...formData.values.slaConfig.processTime, hour: value } },
                            },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_time">giờ,</span>
                    </div>
                  </div>

                  <div className="box_time">
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={formData.values?.slaConfig.processTime.minute}
                        onValueChange={(e) => {
                          const value = e.floatValue;
                          setFormData({
                            ...formData,
                            values: {
                              ...formData.values,
                              slaConfig: { ...formData.values.slaConfig, processTime: { ...formData.values.slaConfig.processTime, minute: value } },
                            },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_time">phút</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="violation_sla">
                    <span className="title_violation">Vi phạm SLA:</span>
                    <div className="box_violation">

                        <div style={{paddingLeft: '1.6rem', marginTop: 5}}>
                            <span style={{fontSize: '1.4rem', fontWeight:'600'}}>Thông báo cho</span>
                            <div style={{display:'flex', gap: '0 2rem', marginTop: 5, marginLeft: 15}}>
                                {notifyData.map((item, index) => (
                                    <div key={index}>
                                        <Checkbox
                                            value={item.value}
                                            label={item.label}
                                            onChange={(e) => {
                                                const value = +e.target.value;
                                                if(notifyList.includes(value)){
                                                    const newArray = notifyList.filter(el => el !== value);
                                                    setNotifyList(newArray)
                                                } else {
                                                    setNotifyList([...notifyList, value])
                                                }
                                            }}
                                            checked={notifyList.includes(+item.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{paddingLeft: '1.6rem', marginTop: 10}}>
                            <span style={{fontSize: '1.4rem', fontWeight:'600'}}>Kênh thông báo</span>
                            <div style={{display:'flex', gap: '0 2rem', marginTop: 5, marginLeft: 15}}>
                                {channelData.map((item, index) => (
                                    <div key={index}>
                                        <Checkbox
                                            value={item.value}
                                            label={item.label}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if(channelList.filter(el => el.type === value).length > 0){
                                                    const newArray = channelList.filter(el => el.type !== value);
                                                    setChannelList(newArray);
                                                    if(value === 'email'){
                                                      setDetailTemplateEmail(null);
                                                    } else if(value === 'sms'){
                                                      setDetailTemplateSMS(null);
                                                    }
                                                } else {
                                                    setChannelList([...channelList, {type: value, templateId: null}])
                                                }
                                            }}
                                            // checked={channelList.includes(item.value)}
                                            checked={channelList.filter(el => el.type === item.value).length > 0}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {channelList.length > 0 &&
                          <div style={{paddingLeft: '1.6rem', marginTop: 10}}>
                            {channelList.filter((el) => el.type === 'email').length > 0 &&
                              <div className="form-group">
                                  <SelectCustom
                                      id="templateEmailId"
                                      name="templateEmailId"
                                      label="Mẫu Email"
                                      options={[]}
                                      fill={true}
                                      value={detailTemplateEmail}
                                      required={true}
                                      onChange={(e) => changeTemplateEmail(e)}
                                      isAsyncPaginate={true}
                                      isFormatOptionLabel={true}
                                      placeholder="Chọn mẫu Email"
                                      additional={{
                                          page: 1,
                                      }}
                                      loadOptionsPaginate={loadedOptionTemplateEmail}
                                      // formatOptionLabel={formatOptionLabelCustomer}
                                      // error={checkFieldCustomer}
                                      // message="Khách hàng không được bỏ trống"
                                      // isLoading={data?.customerId ? isLoadingCustomer : null}
                                  />
                              </div>
                            }

                            {channelList.filter((el) => el.type === 'sms').length > 0 &&
                              <div className="form-group">
                                  <SelectCustom
                                      id="templateSMSlId"
                                      name="templateSMSId"
                                      label="Mẫu SMS"
                                      options={[]}
                                      fill={true}
                                      value={detailTemplateSMS}
                                      required={true}
                                      onChange={(e) => changeTemplateSMS(e)}
                                      isAsyncPaginate={true}
                                      isFormatOptionLabel={true}
                                      placeholder="Chọn mẫu SMS"
                                      additional={{
                                          page: 1,
                                      }}
                                      loadOptionsPaginate={loadedOptionTemplateSMS}
                                      // formatOptionLabel={formatOptionLabelCustomer}
                                      // error={checkFieldCustomer}
                                      // message="Khách hàng không được bỏ trống"
                                      // isLoading={data?.customerId ? isLoadingCustomer : null}
                                  />
                              </div>
                            }

                          </div>
                      }
                    </div>
                </div> */}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

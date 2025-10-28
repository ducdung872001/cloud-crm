import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import "./index.scss";
import _ from "lodash";
import Checkbox from "components/checkbox/checkbox";
import SelectCustom from "components/selectCustom/selectCustom";
import TemplateEmailService from "services/TemplateEmailService";
import TemplateSMSService from "services/TemplateSMSService";
import CampaignService from "services/CampaignService";

export default function ViolationWarning(props: any) {
  const { onShow, onHide, campaignId, setDataViolation } = props;
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

  const [valueSetting, setValueSetting] = useState({
    id: "",
    violation: {
      targets: [],
      channels: [],
    },
  });
  // console.log('valueSetting', valueSetting);

  const [formData, setFormData] = useState<IFormData>({ values: valueSetting });

  const [dataSla, setDataSla] = useState(null);

  useEffect(() => {
    if (dataSla) {
      setValueSetting({ ...valueSetting, ...(dataSla ? { violation: dataSla.violation } : {}) });
    }
  }, [dataSla]);

  const handleDetailData = async () => {
    const response = await CampaignService.detail(campaignId);

    if (response.code === 0) {
      const result: any = response.result;

      //SLA
      if (result.slaInfo) {
        setDataSla(result.slaInfo);
      }
    }
  };

  useEffect(() => {
    handleDetailData();
  }, []);

  useEffect(() => {
    setDataViolation(formData.values);
  }, [formData.values]);

  useEffect(() => {
    setFormData({ ...formData, values: valueSetting, errors: {} });
    setNotifyList(valueSetting.violation?.targets || []);
    const channelList = valueSetting.violation?.channels || [];
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
  }, [valueSetting]);

  const [notifyList, setNotifyList] = useState([]);
  const [channelList, setChannelList] = useState([]);
  const [detailTemplateEmail, setDetailTemplateEmail] = useState(null);
  const [detailTemplateSMS, setDetailTemplateSMS] = useState(null);

  useEffect(() => {
    setFormData({ ...formData, values: { ...formData.values, violation: { ...formData.values.violation, targets: notifyList } } });
  }, [notifyList]);

  useEffect(() => {
    setFormData({ ...formData, values: { ...formData.values, violation: { ...formData.values.violation, channels: channelList } } });
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

  return (
    <div className="violation_sla">
      <span className="title_violation">Vi phạm SLA:</span>
      <div className="box_violation">
        <div style={{ paddingLeft: "1.6rem", marginTop: 5 }}>
          <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>Thông báo cho</span>
          <div style={{ display: "flex", gap: "0 2rem", marginTop: 5, marginLeft: 15 }}>
            {notifyData.map((item, index) => (
              <div key={index}>
                <Checkbox
                  value={item.value}
                  label={item.label}
                  onChange={(e) => {
                    const value = +e.target.value;
                    if (notifyList.includes(value)) {
                      const newArray = notifyList.filter((el) => el !== value);
                      setNotifyList(newArray);
                    } else {
                      setNotifyList([...notifyList, value]);
                    }
                  }}
                  checked={notifyList.includes(+item.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingLeft: "1.6rem", marginTop: 10 }}>
          <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>Kênh thông báo</span>
          <div style={{ display: "flex", gap: "0 2rem", marginTop: 5, marginLeft: 15 }}>
            {channelData.map((item, index) => (
              <div key={index}>
                <Checkbox
                  value={item.value}
                  label={item.label}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (channelList.filter((el) => el.type === value).length > 0) {
                      const newArray = channelList.filter((el) => el.type !== value);
                      setChannelList(newArray);
                      if (value === "email") {
                        setDetailTemplateEmail(null);
                      } else if (value === "sms") {
                        setDetailTemplateSMS(null);
                      }
                    } else {
                      setChannelList([...channelList, { type: value, templateId: null }]);
                    }
                  }}
                  // checked={channelList.includes(item.value)}
                  checked={channelList.filter((el) => el.type === item.value).length > 0}
                />
              </div>
            ))}
          </div>
        </div>

        {channelList.length > 0 && (
          <div style={{ paddingLeft: "1.6rem", marginTop: 10 }}>
            {channelList.filter((el) => el.type === "email").length > 0 && (
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
            )}

            {channelList.filter((el) => el.type === "sms").length > 0 && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

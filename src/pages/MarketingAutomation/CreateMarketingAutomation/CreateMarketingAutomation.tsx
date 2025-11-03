import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSearchParameters, isDifferenceObj } from "reborn-util";
import Slider from "rc-slider";
import Tippy from "@tippyjs/react";
import { showToast } from "utils/common";
import TitleAction from "components/titleAction/titleAction";
import { useActiveElement } from "utils/hookCustom";
import { ContextType, UserContext } from "contexts/userContext";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import CampaignService from "services/CampaignService";
import { ICampaignRequestModel } from "model/campaign/CampaignRequestModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Icon from "components/icon";
import Checkbox from "components/checkbox/checkbox";
import Validate, { handleChangeValidate } from "utils/validate";
import Button from "components/button/button";
import DataSupplySource from "services/DataSupplySource";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import SelectCustom from "components/selectCustom/selectCustom";
import MarketingAutomationService from "services/MarketingAutomationService";

import "./CreateMarketingAutomation.scss";

export default function CreateMarketingAutomation() {
  const { id } = useParams();

  document.title = `${id ? "Chỉnh sửa" : "Thêm mới"} chương trình Marketing Automation`;

  const navigate = useNavigate();

  const takeParamsUrl = getSearchParameters();
  const mbtId = takeParamsUrl && takeParamsUrl?.mbtId;

  const focusedElement = useActiveElement();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [data, setData] = useState(null);

  const handleDetailData = async () => {
    const response = await MarketingAutomationService.detail(+id);

    if (response.code === 0) {
      const result: any = response.result;
      setValuePoint([result.campaignPoint]);
      if (result.campaignId) {
        setValueCampaign({
          value: result.campaignId,
          label: result.campaign?.name,
        });
      }

      setData(result);

      ///nguồn cấp dữ liệu
      if (result?.dataSourceProvidersDto?.filter((el) => el.type === "filter").length > 0) {
        const dataFilter = result?.dataSourceProvidersDto?.filter((el) => el.type === "filter")[0].data;
        const newDataFilter = dataFilter
          ? JSON.parse(dataFilter).map((item) => {
              return {
                value: item.id,
                label: item.name,
              };
            })
          : [];
        setDataSupplySourceFromFilter(newDataFilter);
      }

      setDataSourceProvider(result?.dataSourceProvidersDto);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (id) {
      handleDetailData();
    }
  }, [id]);

  const [valuePoint, setValuePoint] = useState([0]);
  const [valueCampaign, setValueCampaign] = useState(null);

  const trackStyle = { backgroundColor: "var(--primary-color-70)" };

  const marks = {};
  for (let i = 0; i <= 150; i += 5) {
    marks[i] = i;
  }

  const handleChangePoint = (value) => {
    setFormData({ ...formData, values: { ...formData.values, campaignPoint: value[0] } });
    setValuePoint(value);
  };

  const loadedOptionCampaign = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await CampaignService.list(param);

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

  const handleChangeValueCampaign = (e) => {
    const value = e;

    setFormData({ ...formData, values: { ...formData.values, campaignId: value.value } });
    setValueCampaign(value);
  };

  const values = useMemo(
    () => ({
      name: data?.name ?? "",
      startDate: id ? data?.startDate : "",
      endDate: id ? data?.endDate : "",
      dataSourceProvidersDto: id ? data?.dataSourceProvidersDto : [],
      campaignId: id ? data?.campaignId : null,
      campaignPoint: data?.campaignPoint ?? 50,
    }),
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

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên chương trình",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Bắt đầu",
          name: "startDate",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          hasSelectTime: false,
          placeholder: "Nhập ngày bắt đầu",
          maxDate: new Date(formData?.values?.endDate),
        },
        {
          label: "Kết thúc",
          name: "endDate",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          hasSelectTime: false,
          placeholder: "Nhập ngày kết thúc",
          minDate: new Date(formData?.values?.startDate),
        },
      ] as IFieldCustomize[],
    [formData?.values]
  );

  const dataSupplySource = [
    {
      value: "direct",
      label: "Nguồn trực tiếp",
    },
    {
      value: "filter",
      label: "Nguồn từ phân khúc khách hàng",
    },
  ];

  const [dataSourceProvider, setDataSourceProvider] = useState([]);

  useEffect(() => {
    setFormData({ ...formData, values: { ...formData?.values, dataSourceProvidersDto: dataSourceProvider } });
  }, [dataSourceProvider]);

  const [dataSupplySourceFromFilter, setDataSupplySourceFromFilter] = useState([]);

  const loadedOptionDataSupplySourceFromFilter = async (search, loadedOptions, { page }) => {

    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await DataSupplySource.list(param);

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

  const handleChangeDataSupplySourceFromFilter = (e) => {
    setDataSupplySourceFromFilter(e);
    const ids = e.map((item) => {
      return item.value;
    });

    // eslint-disable-next-line prefer-const
    let newArr = [...dataSourceProvider];
    const index = dataSourceProvider.findIndex((el) => el.type === "filter");
    if (index !== -1) {
      newArr[index] = {
        type: "filter",
        ids: ids,
      };
    }
    setDataSourceProvider(newArr);
  };

  const [validateFieldSourceProvider, setValidateFieldSourceProvider] = useState<boolean>(false);

  const onSubmit = async () => {
    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (dataSourceProvider.length === 0) {
      setValidateFieldSourceProvider(true);
      return;
    }

    if (
      dataSourceProvider.length > 0 &&
      dataSourceProvider.filter((el) => el.type === "filter").length > 0 &&
      dataSourceProvider.filter((el) => el.type === "filter")[0].ids?.length === 0
    ) {
      showToast("Vui lòng chọn phân khúc khách hàng", "error");
      return;
    }

    // if(!valueCampaign){
    //   showToast("Vui lòng chọn chiến dịch bán hàng", "error");
    //   return;
    // }

    setIsSubmit(true);

    const body: ICampaignRequestModel = {
      ...(data ? { id: data?.id } : {}),
      ...(formData?.values as ICampaignRequestModel),
      ...(formData?.values.campaignId ? { campaignPoint: formData?.values.campaignPoint } : { campaignPoint: 0 }),
    };

    const response = await MarketingAutomationService.update(body);

    if (response.code == 0) {
      showToast(`${id ? "Chỉnh sửa" : "Thêm mới"} chương trình MA thành công`, "success");
      navigate(`/marketing_automation`);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const handClearForm = () => {
    navigate(`/marketing_automation`);
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
          navigate(`/marketing_automation`);
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
    <div className="page-content page-create-marketing_automation">
      <TitleAction title={`${id ? "Chỉnh sửa" : "Tạo"} chương trình Marketing Automation`} />

      <div className="card-box">
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
      </div>

      <div className="card-box wrapper__data_supply_source">
        <h3 className="title__info">Nguồn cấp dữ liệu</h3>
        <div className="data_supply_source">
          {dataSupplySource.map((item, index) => (
            <div key={index} className="item_data_supply_source">
              <Checkbox
                value={item.value}
                label={item.label}
                onChange={(e) => {
                  setValidateFieldSourceProvider(false);

                  const value = e.target.value;

                  if (dataSourceProvider.filter((el) => el.type === value).length > 0) {
                    const newArray = dataSourceProvider.filter((el) => el.type !== value);
                    setDataSourceProvider(newArray);
                  } else {
                    const newArray = [...dataSourceProvider];
                    newArray.push({ type: value, ids: [] });
                    setDataSourceProvider(newArray);
                  }
                }}
                checked={dataSourceProvider?.filter((el) => el.type === item.value).length > 0}
              />

              {item.value === "filter" && dataSourceProvider?.filter((el) => el.type === "filter").length > 0 ? (
                <div className="select_data_supply_source">
                  <SelectCustom
                    // id="employeeId"
                    // name="employeeId"
                    // label="Người điều phối"
                    options={[]}
                    fill={true}
                    isMulti={true}
                    value={dataSupplySourceFromFilter}
                    required={false}
                    disabled={dataSourceProvider?.filter((el) => el.type === item.value).length > 0 ? false : true}
                    onChange={(e) => handleChangeDataSupplySourceFromFilter(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn nguồn từ phân khúc"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionDataSupplySourceFromFilter}
                    // formatOptionLabel={formatOptionLabelEmployee}
                    // error={checkFieldEmployee}
                    // message="Người phụ trách không được bỏ trống"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {validateFieldSourceProvider && <div className="message__source--provider">Bạn cần chọn ít nhất 1 nguồn cấp dữ liệu</div>}
      </div>

      {data && data.pointMax ? (
        <div className="card-box wrapper__data-sales-campaign">
          <h3 className="title__info__campaign">Cấu hình đẩy sang chiến dịch bán hàng</h3>

          <div className="box__info--campaign">
            <div className="__info-campaign--header">
              <div className="__info-campaign--left">
                <div className="range-slider-point">
                  <span className="name--slider">Đẩy {valuePoint[0]} điểm sang chiến dịch bán hàng</span>
                  <Slider
                    range
                    min={0}
                    max={data.pointMax}
                    marks={marks}
                    step={1}
                    value={valuePoint}
                    onChange={handleChangePoint}
                    trackStyle={trackStyle}
                  />
                </div>
              </div>
              <div className="choose-campaign">
                <SelectCustom
                  id="campaignId"
                  name="campaignId"
                  label="Chọn chiến dịch bán hàng"
                  options={[]}
                  fill={true}
                  required={false}
                  value={valueCampaign}
                  onChange={(e) => handleChangeValueCampaign(e)}
                  isAsyncPaginate={true}
                  placeholder="Chọn chiến dịch"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionCampaign}
                />
              </div>
            </div>

            {/* <div className="note__point">
              <span className="name">Điểm đẩy sang chiến dịch bán hàng</span>
              <span className="point">{valuePoint[0]}</span>
            </div> */}
          </div>
        </div>
      ) : null}

      {data?.status === 1 ? (
        <div className="button_bottom">
          <div>
            <Button
              color="destroy"
              variant="outline"
              onClick={(e) => {
                handClearForm();
              }}
            >
              Huỷ thao tác
            </Button>
          </div>

          <div>
            <Button
              color="primary"
              disabled={isSubmit || validateFieldSourceProvider}
              onClick={() => {
                showToast("Chương trình đã được duyệt, không được phép chỉnh sửa", "error");
              }}
            >
              {id ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="button_bottom">
          <div>
            <Button
              color="destroy"
              variant="outline"
              onClick={(e) => {
                // navigate(`/sales_campaign`);
                showDialogConfirmCancel();
              }}
            >
              Huỷ thao tác
            </Button>
          </div>

          <div>
            <Button
              color="primary"
              disabled={isSubmit || validateFieldSourceProvider}
              onClick={() => {
                onSubmit();
              }}
            >
              {id ? "Cập nhật" : "Tạo mới"}
              {isSubmit ? <Icon name="Loading" /> : null}
            </Button>
          </div>
        </div>
      )}

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

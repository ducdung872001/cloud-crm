import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddCampaignOpportunityModel } from "model/campaignOpportunity/PropsModel";
import { ICampaignOpportunityRequestModel } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import { ICampaignOpportunityResponseModel } from "model/campaignOpportunity/CampaignOpportunityResponseModel";
import { ICustomerSourceFilterRequest } from "model/customerSource/CustomerSourceRequest";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import CampaignService from "services/CampaignService";
import CustomerService from "services/CustomerService";
import CustomerSourceService from "services/CustomerSourceService";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import { ContextType, UserContext } from "contexts/userContext";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import ImgPushCustomer from "assets/images/img-push.png";

import "./index.scss";
import CreateOpportunityB2B from "../CreateOpportunityB2B/CreateOpportunityB2B";
import CampaignPipelineService from "services/CampaignPipelineService";

export default function AddManagementOpportunityModal(props: IAddCampaignOpportunityModel) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, idData, idCustomer, isBatch, listId, conditionCampain, dataCustomerProps } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [isCreateOpportunityB2B, setIsCreateOpportunityB2B] = useState(false);

  const [data, setData] = useState<ICampaignOpportunityResponseModel>(null);

  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();

    if (response.code == 0) {
      const result = response.result;
      setDataSale({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        departmentName: result.departmentName,
        branchName: result.branchName,
      });
      // setFormData({ ...formData, values: { ...formData?.values, saleId: result.id } });
    }
  };

  useEffect(() => {
    if (onShow && !idData) {
      getDetailEmployeeInfo();
    }
  }, [onShow, data, idData]);

  const getDetailManagementOpportunity = async () => {
    const response = await CampaignOpportunityService.detail(idData);

    if (response.code === 0) {
      const result: ICampaignOpportunityResponseModel = response.result;

      if (result.customerId) {
        setDataCustomer({ value: result.customerId, label: result.customerName, avatar: result.customerAvatar });
      }

      if (result.employeeId) {
        setDataEmployee({ value: result.employeeId, label: result.employeeName, avatar: result.employeeAvatar, phone: result.employeePhone });
      }

      if (result.sourceId) {
        setDataSourceCustomer({ value: result.sourceId, label: result.sourceName });
      }

      if (result.opportunityId) {
        setDataOpportunity({ value: result.opportunityId, label: result.opportunity?.productName || result.opportunity?.serviceName });
      }

      if (result.saleId) {
        getDetailEmployee(result.saleId);
        // setDataSale({ value: result.saleId, label: result.saleName, avatar: result.saleAvatar });
      }

      setData({
        id: result.id,
        employeeId: result.employeeId,
        customerId: result.customerId,
        sourceId: result.sourceId,
        campaignId: result.campaignId,
        type: result.type,
        refId: result.refId,
        approachId: result.approachId || null,
        expectedRevenue: result.expectedRevenue,
        endDate: result.endDate,
        startDate: result.startDate,
        saleId: result.saleId,
        opportunityId: result.opportunityId,
        note: result?.note ?? "",
        percent: result?.percent,
        status: result?.status ?? null,
        pipelineId: result?.pipelineId ?? null,
      });

      getListCampaignPipeline(result.campaignId);
      setDataPipeline(result?.pipelineId ? { value: result?.pipelineId, label: result?.pipelineName } : null);
    }
  };

  useEffect(() => {
    if (onShow && idData) {
      getDetailManagementOpportunity();
    }
  }, [onShow, idData]);

  const [dataSale, setDataSale] = useState(null);

  const values = useMemo(
    () =>
      ({
        employeeId: data?.employeeId ?? null,
        customerId: data?.customerId ?? idCustomer ?? dataCustomerProps?.id ?? null,
        sourceId: data?.sourceId ?? null,
        campaignId: data?.campaignId ?? null,
        type: data?.type ?? "per",
        refId: 0,
        approachId: data?.approachId ?? null,
        expectedRevenue: data?.expectedRevenue ?? 0,
        startDate: data?.startDate ?? "",
        endDate: data?.endDate ?? "",
        saleId: data?.saleId ?? null,
        opportunityId: data?.opportunityId ?? null,
        note: data?.note ?? "",
        percent: data?.percent || "",
        status: data?.status ?? null,
        pipelineId: data?.pipelineId ?? null,
      } as ICampaignOpportunityRequestModel),
    [onShow, data, idCustomer, dataCustomerProps]
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

  const getDetailEmployee = async (id: number) => {
    if (!id) return;

    const response = await EmployeeService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataSale({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        departmentName: result.departmentName,
        branchName: result.branchName,
      });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailCustomer = async (id: number) => {
    setIsLoadingCustomer(true);
    if (!id) return;

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      const detailDataCustomer = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      };

      const detailDataEmployee = {
        value: result.employeeId,
        label: result.employeeName,
        avatar: result.employeeAvatar,
        phone: result.employeePhone,
      };

      setDataCustomer(detailDataCustomer);
      setDataEmployee(detailDataEmployee);
      // setFormData({ ...formData, values: { ...formData?.values, customerId: result.id, employeeId: result.employeeId } });
    }

    setIsLoadingCustomer(false);
  };

  // Nếu như có id khách hàng fill mặc định khách hàng vào và không cho sửa
  useEffect(() => {
    if ((idCustomer || dataCustomerProps) && onShow) {
      getDetailCustomer(idCustomer ? idCustomer : dataCustomerProps?.id);
    }
  }, [idCustomer, onShow, dataCustomerProps]);

  // Xử lý dữ liệu khách hàng, nhân viên
  const [dataCustomer, setDataCustomer] = useState(null);
  const [dataEmployee, setDataEmployee] = useState(null);
  const [checkFieldCustomer, setCheckFieldCustomer] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách khách hàng
  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
      custType: dataCampaign?.type === "per" || dataCustomerProps?.custType == 0 ? 0 : 1,
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
                  avatar: item.avatar,
                  employeeId: item.employeeId,
                  employeeName: item.employeeName,
                  employeeAvatar: item.employeeAvatar,
                  employeePhone: item.employeePhone,
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

  const formatOptionLabelCustomer = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCustomer = (e) => {
    setCheckFieldCustomer(false);
    setDataCustomer(e);
    setDataOpportunity(null);

    setFormData({ ...formData, values: { ...formData?.values, customerId: e.value, employeeId: e.employeeId, opportunityId: null } });
  };

  // lấy người bán
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    if (dataCampaign?.type === "biz" || dataCustomerProps?.custType == 1 || dataCampaign.saleDistributionType === "manual") {
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
    } else {
      const response = await CampaignService.listSale({ campaignId: dataCampaign?.value });

      if (response?.code === 0) {
        const dataOption = response.result;

        const optionSale = [];
        if (dataOption && dataOption.length > 0) {
          dataOption.map((item) => {
            if (item.employeeId) {
              optionSale.push({
                value: item.employeeId,
                label: item.employeeName,
                avatar: item.employeeAvatar,
                departmentName: item.departmentName,
                branchName: item.branchName,
              });
            }
          });
        }

        return {
          options: optionSale,
          hasMore: false,
          additional: {
            page: page + 1,
          },
        };
      }

      return { options: [], hasMore: false };
    }
  };

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

  const handleChangeValueEmployee = (e) => {
    setCheckFieldEmployee(false);
    setDataSale(e);
    setFormData({ ...formData, values: { ...formData?.values, saleId: e.value } });
  };

  // Xử lý lấy nguồn khách hàng
  const [dataSourceCustomer, setDataSourceCustomer] = useState(null);

  const loadOptionSource = async (search, loadedOptions, { page }) => {
    const param: ICustomerSourceFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await CustomerSourceService.list(param);

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

  const handleChangeValueSource = (e) => {
    setDataSourceCustomer(e);
    setFormData({ ...formData, values: { ...formData?.values, sourceId: e?.value } });
  };

  // Xử lý vấn đề lấy danh sách chiến dịch, phương pháp tiếp cận
  const [dataCampaign, setDataCampaign] = useState(null);
  const [checkFieldCampaign, setCheckFieldCampaign] = useState<boolean>(false);

  const loadedOptionCampaign = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      ...(conditionCampain ? conditionCampain : {}),
      ...(dataCustomerProps ? { type: dataCustomerProps.custType == 0 ? "per" : "biz" } : {}),
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
                  avatar: item.cover,
                  startDate: item.startDate,
                  endDate: item.endDate,
                  type: item.type,
                  saleDistributionType: item.saleDistributionType,
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

  const formatOptionLabelCampaign = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCampaign = (e) => {
    getListCampaignPipeline(e.value);
    setDataPipeline(null);

    setCheckFieldCampaign(false);
    setDataCampaign(e);
    if (!dataCustomerProps && !idCustomer) {
      setDataCustomer(null);
    }

    if (e.type === "biz") {
      setDataSourceCustomer(null);
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          campaignId: e.value,
          type: e.type,
          startDate: e.startDate,
          endDate: e.endDate,
          customerId: !dataCustomerProps && !idCustomer ? null : formData?.values?.customerId,
          employeeId: null,
          sourceId: null,
          pipelineId: null,
        },
      });
    } else {
      setDataOpportunity(null);
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          campaignId: e.value,
          type: e.type,
          startDate: e.startDate,
          endDate: e.endDate,
          opportunityId: null,
          customerId: !dataCustomerProps && !idCustomer ? null : formData?.values?.customerId,
          pipelineId: null,
        },
      });
    }
  };

  const [listPipeline, setListPipeline] = useState([]);
  const [dataPipeline, setDataPipeline] = useState(null);

  useEffect(() => {
    if (!data && listPipeline && listPipeline.length > 0) {
      setDataPipeline({ value: listPipeline[0].value, label: listPipeline[0].label });
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          pipelineId: listPipeline[0].value,
        },
      });
    }
  }, [data, listPipeline]);

  const getListCampaignPipeline = async (campaignId: any) => {
    const param = {
      limit: 100,
      campaignId: campaignId,
    };

    const response = await CampaignPipelineService.list(param);

    if (response.code === 0) {
      const result = (response.result || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setListPipeline(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setListPipeline([]);
    }
  };

  const handleChangeValuePipeline = (e) => {
    setDataPipeline(e);
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        pipelineId: e.value,
      },
    });
  };

  //chọn cơ hội khi là chiến dịch cho doanh nghiệp
  const [dataOpportunity, setDataOpportunity] = useState(null);
  const [checkFieldOpportunity, setCheckFieldOpportunity] = useState<boolean>(false);

  const loadedOptionOpportunity = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      customerId: dataCustomer?.value,
    };

    const response = await CampaignOpportunityService.listOpportunity(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      const newData = dataOption.map((item) => {
        return {
          value: item.id,
          label: item.productName || item.serviceName,
          customerId: item.customerId,
          customerName: item.customerName,
        };
      });

      newData.push({ value: "", label: "Thêm mới cơ hội", isShowModal: true, avatar: "custom" });

      return {
        options: newData,
        // [
        //   ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới cơ hội", isShowModal: true, avatar: "custom" }] : []),
        //   ...(dataOption.length > 0
        //     ? dataOption.map((item) => {
        //         return {
        //           value: item.id,
        //           label: item.productName || item.serviceName,
        //           customerId: item.customerId,
        //           customerName: item.customerName,
        //         };
        //       })
        //     : []),
        // ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const formatOptionOpportunity = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar" style={avatar == "custom" ? { width: "1.8rem", height: "1.8rem" } : {}}>
          <img src={avatar == "custom" ? ImgPushCustomer : avatar ? avatar : ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  useEffect(() => {
    if (onShow) {
      loadedOptionOpportunity("", undefined, { page: 1 });
      loadedOptionCustomer("", undefined, { page: 1 });
    }
  }, [dataCustomer, dataCampaign, onShow]);

  const handleChangeValueOpportunity = (e) => {
    if (e?.isShowModal) {
      setIsCreateOpportunityB2B(true);
    } else {
      setCheckFieldOpportunity(false);
      setDataOpportunity(e);

      //lấy ra khách
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          opportunityId: e.value,
        },
      });
    }
  };

  const takeInfoOpportunity = (data) => {
    setDataOpportunity({
      value: data.id,
      label: data.label,
      customerId: data.customerId,
      customerName: data.customerName,
    });

    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        // customerId: e.customerId,
        opportunityId: data.id,
      },
    });
  };

  /**
   * Lấy danh sách Quy trình bán hàng
   */
  // const loadCampaignApproaches = async (campaignId: number) => {
  //   const body: ICampaignApproachFilterRequest = {
  //     campaignId
  //   };

  //   const response = await CampaignApproachService.list(body);
  //   if (response.code == 0) {
  //     let items = response.result?.map(item => {
  //       return {
  //         value: item.id,
  //         label: item.name
  //       }
  //     });

  //     setListApproach(items);
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }
  // }

  // useEffect(() => {
  //   if (listApproach && listApproach.length > 0) {
  //     if (data?.approachId > 0) {
  //       listApproach.map(item => {
  //         if (item.value == data.approachId) {
  //           setDataApproach({ value: item.value, label: item.label })
  //         }
  //       })
  //     } else {
  //       setDataApproach({ value: listApproach[0].value, label: listApproach[0].label })
  //     }
  //   }
  // }, [listApproach]);

  // const handleChangeValueStep = (e) => {
  //   setDataApproach(e);
  // };

  // useEffect(() => {
  //   if (dataApproach) {
  //     setFormData({ ...formData, values: { ...formData?.values, approachId: dataApproach.value } });
  //   }
  // }, [dataApproach]);

  const getDetailCampaign = async (id: number) => {
    const response = await CampaignService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDataCampaign({
        value: result.id,
        label: result.name,
        avatar: result.cover,
        startDate: result.startDate,
        endDate: result.endDate,
        type: result.type,
        saleDistributionType: result.saleDistributionType,
      });

      // loadCampaignApproaches(result.id);
    }
  };

  useEffect(() => {
    if (data?.campaignId) {
      getDetailCampaign(data?.campaignId);
    }
  }, [data?.campaignId]);

  const listField = useMemo(
    () =>
      [
        {
          name: "campaignId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="campaignId"
              name="campaignId"
              label="Chọn chiến dịch"
              options={[]}
              fill={true}
              value={dataCampaign}
              required={true}
              onChange={(e) => handleChangeValueCampaign(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn chiến dịch"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionCampaign}
              formatOptionLabel={formatOptionLabelCampaign}
              error={checkFieldCampaign}
              message="Chiến dịch không được bỏ trống"
            />
          ),
        },
        ...(listPipeline && listPipeline.length > 0
          ? [
              {
                name: "pipelineId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    id="pipelineId"
                    name="pipelineId"
                    label="Pha chiến dịch"
                    options={listPipeline}
                    fill={true}
                    value={dataPipeline}
                    placeholder="Chọn pha chiến dịch"
                    special={true}
                    disabled={data?.id ? false : true}
                    onChange={(e) => handleChangeValuePipeline(e)}
                  />
                ),
              },
            ]
          : []),

        {
          label: "Ngày bắt đầu",
          name: "startDate",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập ngày bắt đầu",
          disabled: true,
        },
        {
          label: "Ngày kết thúc",
          name: "endDate",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập ngày kết thúc",
          disabled: true,
        },
        {
          name: "customerId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={dataCampaign?.type}
              id="customerId"
              name="customerId"
              label="Khách hàng"
              options={[]}
              fill={true}
              value={dataCustomer}
              required={true}
              onChange={(e) => handleChangeValueCustomer(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn khách hàng"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionCustomer}
              formatOptionLabel={formatOptionLabelCustomer}
              error={checkFieldCustomer}
              message="Khách hàng không được bỏ trống"
              disabled={idCustomer || dataCustomerProps ? true : false}
              isLoading={idCustomer ? isLoadingCustomer : null}
            />
          ),
        },
        ...(dataCampaign?.type === "biz" || dataCustomerProps?.custType == 1
          ? [
              {
                name: "opportunityId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    // key={dataCustomer?.value && dataOpportunity}
                    key={dataCustomer?.value}
                    id="opportunityId"
                    name="opportunityId"
                    label="Cơ hội"
                    options={[]}
                    fill={true}
                    value={dataOpportunity}
                    required={true}
                    onChange={(e) => handleChangeValueOpportunity(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={false}
                    placeholder="Chọn cơ hội"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionOpportunity}
                    formatOptionLabel={formatOptionOpportunity}
                    error={checkFieldOpportunity}
                    message="Cơ hội không được bỏ trống"
                    disabled={dataCustomer?.value ? false : true}
                  />
                ),
              },
            ]
          : []),

        {
          name: "saleId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={dataCampaign?.value}
              id="saleId"
              name="saleId"
              label="Người phụ trách"
              options={[]}
              fill={true}
              value={dataSale}
              required={false}
              onChange={(e) => handleChangeValueEmployee(e)}
              placeholder="Chọn người phụ trách"
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              disabled={dataCampaign?.value ? false : true}
            />
          ),
        },

        {
          label: "Doanh thu dự kiến",
          name: "expectedRevenue",
          type: "number",
          fill: true,
        },

        ...(dataCampaign?.type === "biz"
          ? []
          : [
              {
                name: "sourceId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    key={dataCampaign?.type}
                    id="sourceId"
                    name="sourceId"
                    label="Nguồn khách hàng"
                    options={[]}
                    fill={true}
                    value={dataSourceCustomer}
                    onChange={(e) => handleChangeValueSource(e)}
                    placeholder="Chọn nguồn khách hàng"
                    isAsyncPaginate={true}
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadOptionSource}
                  />
                ),
              },
            ]),
      ] as IFieldCustomize[],
    [
      dataCustomer,
      checkFieldCustomer,
      data,
      dataEmployee,
      dataSourceCustomer,
      dataCampaign,
      dataSale,
      dataOpportunity,
      checkFieldOpportunity,
      checkFieldCampaign,
      formData?.values,
      idCustomer,
      isLoadingCustomer,
      isBatch,
      dataCustomerProps,
      listPipeline,
      dataPipeline,
    ]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (!dataCampaign) {
      setCheckFieldCampaign(true);
      return;
    }

    if (dataCampaign.type === "per" && !dataCustomer) {
      setCheckFieldCustomer(true);
      return;
    }

    setIsSubmit(true);

    const body: ICampaignOpportunityRequestModel = {
      ...(formData.values as ICampaignOpportunityRequestModel),
      ...(data ? { id: data.id } : {}),
      lstCustomerId: listId,
    };

    let response;
    if (isBatch) {
      response = await CampaignOpportunityService.updateBatch(body);
    } else {
      response = await CampaignOpportunityService.update(body);
    }

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} cơ hội thành công`, "success");
      handClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setDataCustomer(null);
    setDataEmployee(null);
    setDataCampaign(null);
    setDataSale(null);
    setDataOpportunity(null);

    setDataSourceCustomer(null);
    setData(null);
    setCheckFieldOpportunity(false);
    setCheckFieldCustomer(false);
    setCheckFieldCampaign(false);
    setDataPipeline(null);
    setListPipeline([]);
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
            title: idData ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldCustomer ||
              checkFieldCampaign ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldCustomer, idData, checkFieldCampaign, checkFieldEmployee]
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
        className="modal-add-management-opportunity"
      >
        <form className="form-add-management-opportunity" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${idData ? "Chỉnh sửa cơ hội trong chiến dịch" : "Thêm cơ hội vào chiến dịch"}`}
            toggle={() => !isSubmit && handClearForm(false)}
          />
          <ModalBody>
            <div className={listPipeline && listPipeline.length > 0 ? "list-new-form-group" : "list-form-group"}>
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
      <CreateOpportunityB2B
        onShow={isCreateOpportunityB2B}
        idCustomer={dataCustomer?.value}
        takeInfoOpportunity={takeInfoOpportunity}
        onHide={(reload) => {
          if (reload) {
            // getListCustomer(params, activeTitleHeader);
            loadedOptionOpportunity("", undefined, { page: 1 });
          }
          setIsCreateOpportunityB2B(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

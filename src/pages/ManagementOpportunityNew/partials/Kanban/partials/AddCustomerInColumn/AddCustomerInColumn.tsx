import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddCampaignOpportunityModel } from "model/campaignOpportunity/PropsModel";
import { ICampaignOpportunityRequestModel } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import { ICampaignOpportunityResponseModel } from "model/campaignOpportunity/CampaignOpportunityResponseModel";
import { ICustomerSourceFilterRequest } from "model/customerSource/CustomerSourceRequest";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { ICampaignFilterRequest } from "model/campaign/CampaignRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
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
import CampaignApproachService from "services/CampaignApproachService";
import { ICampaignApproachFilterRequest, ICampaignApproachRequestModel } from "model/campaignApproach/CampaignApproachRequestModel";
import "./AddCustomerInColumn.scss";
import { ContextType, UserContext } from "contexts/userContext";
import EmployeeService from "services/EmployeeService";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import ImgPushCustomer from "assets/images/img-push.png";
import CreateOpportunityB2B from "pages/ManagementOpportunity/partials/CreateOpportunityB2B/CreateOpportunityB2B";
import CampaignPipelineService from "services/CampaignPipelineService";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";
import AddCustomerCompanyModal from "pages/CustomerPerson/partials/AddCustomerCompanyModal";
import AddCustomerSourceModal from "pages/SettingCustomer/partials/CustomerResources/partials/AddCustomerSourceModal";

export default function AddCustomerInColumn(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, idData, idCustomer, isBatch, listId, dataColumn } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [isCreateOpportunityB2B, setIsCreateOpportunityB2B] = useState(false);
  const [dataCampaign, setDataCampaign] = useState(null);

  const [data, setData] = useState(null);

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

      setData({
        id: result.id,
        employeeId: result.employeeId,
        customerId: result.customerId,
        sourceId: result.sourceId,
        campaignId: result.campaignId,
        refId: result.refId,
        approachId: result.approachId,
        expectedRevenue: result.expectedRevenue,
        endDate: result.endDate,
        startDate: result.startDate,
        type: result.type,
        saleId: result.saleId,
        opportunityId: result.opportunityId,
        pipelineId: result?.pipelineId ?? null,
      });
    }
  };

  useEffect(() => {
    if (onShow && idData) {
      getDetailManagementOpportunity();
    }
  }, [onShow, idData]);

  const values = useMemo(
    () =>
      ({
        employeeId: data?.employeeId ?? null,
        customerId: data?.customerId ?? null,
        sourceId: data?.sourceId ?? null,
        campaignId: data?.campaignId || dataColumn?.campaignId || null,
        type: dataCampaign?.type ?? data?.type ?? "per",
        refId: 0,
        approachId: data?.approachId || dataColumn?.id || null,
        expectedRevenue: data?.expectedRevenue ?? 0,
        endDate: data?.endDate ?? "",
        startDate: data?.startDate ?? "",
        saleId: data?.saleId ?? null,
        opportunityId: data?.opportunityId ?? null,

        note: data?.note ?? "",
        percent: data?.percent ?? "",
        status: data?.status || (dataColumn?.id ? 1 : null),
        pipelineId: data?.pipelineId ?? null,
      } as ICampaignOpportunityRequestModel),
    [onShow, data, dataColumn, dataCampaign]
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

  const getDetailCustomer = async (id: number) => {
    setIsLoadingCustomer(true);

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
      setFormData({ ...formData, values: { ...formData?.values, customerId: result.id, employeeId: result.employeeId } });
    }

    setIsLoadingCustomer(false);
  };

  // Nếu như có id khách hàng fill mặc định khách hàng vào và không cho sửa
  useEffect(() => {
    if (idCustomer && onShow) {
      getDetailCustomer(idCustomer);
    }
  }, [idCustomer, onShow]);

  // Xử lý dữ liệu khách hàng, nhân viên
  const [dataCustomer, setDataCustomer] = useState(null);
  const [dataEmployee, setDataEmployee] = useState(null);
  const [checkFieldCustomer, setCheckFieldCustomer] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách khách hàng
  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
      custType: dataCampaign?.type === "per" ? 0 : 1,
    };

    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới khách hàng", isShowModal: true, avatar: "custom" }] : []),
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
        <div className="avatar" style={avatar == "custom" ? { width: "1.8rem", height: "1.8rem" } : {}}>
          <img src={avatar == "custom" ? ImgPushCustomer : avatar ? avatar : ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const [detailCustomer, setDetailCustomer] = useState(null);
  const [showModalAddCustomer, setShowModalAddCustomer] = useState<boolean>(false);
  const [showModalAddCompany, setShowModalAddCompany] = useState<boolean>(false);
  const takeInfoCustomer = (data) => {
    if (data) {
      setDetailCustomer({
        value: data.id,
        label: data.name,
        avatar: data.avatar,
      });
    }
  };
  const handleChangeValueCustomer = (e) => {
    if (e?.isShowModal) {
      if (dataCampaign?.type === "per") {
        setShowModalAddCustomer(true);
        localStorage.setItem("customer.custType", "0");
      } else {
        setShowModalAddCompany(true);
        localStorage.setItem("customer.custType", "1");
      }
      // setShowModalAddCompany(true);
      // dataCampaign?.type === "per" ? 0 : 1
    } else {
      setCheckFieldCustomer(false);
      setDataCustomer(e);
      setDataOpportunity(null);

      const takeEmployee = {
        value: e.employeeId,
        label: e.employeeName,
        avatar: e.employeeAvatar,
        phone: e.employeePhone,
      };

      if (takeEmployee) {
        setDataEmployee(takeEmployee);
      }

      setFormData({ ...formData, values: { ...formData?.values, customerId: e.value, employeeId: e.employeeId, opportunityId: null } });
    }
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
        //           customerName: item.customerName
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

  const handleChangeValueOpportunity = (e) => {
    if (e?.isShowModal) {
      setIsCreateOpportunityB2B(true);
    } else {
      setCheckFieldOpportunity(false);
      setDataOpportunity(e);
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          // customerId: e.customerId,
          opportunityId: e.value,
        },
      });
    }
  };

  // Xử lý lấy nguồn khách hàng
  const [showModalAddSource, setShowModalAddSource] = useState(false);

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
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới nguồn khách hàng", isShowModal: true, avatar: "custom" }] : []),
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

      // return {
      //   options: [
      //     ...(dataOption.length > 0
      //       ? dataOption.map((item) => {
      //           return {
      //             value: item.id,
      //             label: item.name,
      //           };
      //         })
      //       : []),
      //   ],
      //   hasMore: response.result.loadMoreAble,
      //   additional: {
      //     page: page + 1,
      //   },
      // };
    }

    return { options: [], hasMore: false };
  };

  const [countCheckAddSource, setCountCheckAddSource] = useState(0);

  useEffect(() => {
    if (!showModalAddSource) {
      setCountCheckAddSource(countCheckAddSource + 1);
      loadOptionSource("", undefined, { page: 1 });
    }
  }, [showModalAddSource]);

  const formatOptionLabelSource = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar" style={avatar == "custom" ? { width: "1.8rem", height: "1.8rem" } : {}}>
          <img src={avatar == "custom" ? ImgPushCustomer : avatar ? avatar : ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueSource = (e) => {
    if (e?.isShowModal) {
      setShowModalAddSource(true);
      setDataSourceCustomer(null);
      setFormData({ ...formData, values: { ...formData?.values, sourceId: null } });
    } else {
      setDataSourceCustomer(e);
      setFormData({ ...formData, values: { ...formData?.values, sourceId: e?.value } });
    }
  };

  // Xử lý vấn đề lấy danh sách chiến dịch, phương pháp tiếp cận
  // const [listApproach, setListApproach] = useState([]);
  // const [dataApproach, setDataApproach] = useState(null);
  const [checkFieldCampaign, setCheckFieldCampaign] = useState<boolean>(false);

  const loadedOptionCampaign = async (search, loadedOptions, { page }) => {
    const param: ICampaignFilterRequest = {
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
    setCheckFieldCampaign(false);
    setDataCampaign(e);
    // setDataApproach(null);
    // loadCampaignApproaches(e.value);

    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        campaignId: e.value,
        startDate: e.startDate,
        endDate: e.endDate,
      },
    });
  };

  const getDetailCampaign = async (id: number) => {
    const response = await CampaignService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      getListCampaignPipeline(result.id);
      setDataCampaign({
        value: result.id,
        label: result.name,
        avatar: result.cover,
        startDate: result.startDate,
        endDate: result.endDate,
        type: result.type,
        saleDistributionType: result.saleDistributionType,
      });

      // setFormData({
      //   ...formData,
      //   values: {
      //     ...formData?.values,
      //     approachId:
      //     campaignId: id,
      //     type: result.type,
      //   },
      // });

      // if (dataColumn && data) {
      //   setData({
      //     ...data,
      //     endDate: result.endDate,
      //     startDate: result.startDate,
      //   });
      // }

      // loadCampaignApproaches(result.id);
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
    if (data?.customerId) {
      setDetailCustomer({
        value: data.customerId,
        label: data?.customerName || "",
        avatar: data?.customerAvatar || "",
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

  const [listApproachStep, setListApproachStep] = useState<IOption[]>([]);

  const getApproachList = async (id: number) => {
    const body: ICampaignApproachFilterRequest = {
      campaignId: id,
    };
    const response = await CampaignApproachService.list(body);

    if (response.code === 0) {
      const result = response.result;

      const takeLstApproachInDetailCampaign = (result || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });

      if (takeLstApproachInDetailCampaign?.length > 0) {
        setListApproachStep(takeLstApproachInDetailCampaign);
      }
    }
  };

  useEffect(() => {
    if (data?.campaignId || dataColumn) {
      getDetailCampaign(data?.campaignId || dataColumn?.campaignId);
      getApproachList(data?.campaignId || dataColumn?.campaignId);
    }
  }, [data?.campaignId, dataColumn]);

  useEffect(() => {
    if (onShow) {
      loadedOptionOpportunity("", undefined, { page: 1 });
      loadedOptionCustomer("", undefined, { page: 1 });
    }
  }, [dataCustomer, dataCampaign, onShow]);

  // lấy người bán
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const [dataSale, setDataSale] = useState(null);
  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    if (dataCampaign.type === "biz" || dataCampaign.saleDistributionType === "manual") {
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

        let optionSale = [];
        if (dataOption && dataOption.length > 0) {
          dataOption.map((item) => {
            if (item.employeeId) {
              optionSale.push({
                value: item.employeeId,
                label: item.employeeName,
                avatar: item.employeeAvatar,
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

  const handleChangeValueEmployee = (e) => {
    setCheckFieldEmployee(false);
    setDataSale(e);
    setFormData({ ...formData, values: { ...formData?.values, saleId: e.value } });
  };

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
              label="Quản lý chiến dịch"
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
              disabled={true}
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
          label: "Quy trình",
          name: "approachId",
          type: "select",
          fill: true,
          required: true,
          options: listApproachStep,
          disabled: true,
          placeholder: !dataColumn?.id ? "Chưa bắt đầu" : "",
        },
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
              // disabled={data?.id || idCustomer ? true : false}
              disabled={idCustomer ? true : false}
              isLoading={idCustomer ? isLoadingCustomer : null}
            />
          ),
        },
        ...(dataCampaign?.type === "biz"
          ? [
              {
                name: "opportunityId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    // key={dataCustomer?.value && dataOpportunity}
                    key={dataCustomer?.value}
                    id="coyId"
                    name="coyId"
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
                    // isLoading={idCustomer ? isLoadingCustomer : null}
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
              // error={checkFieldEmployee}
              // message="Người phụ trách không được bỏ trống"
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
                    key={`${dataCampaign?.type}_${countCheckAddSource}`}
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
                    formatOptionLabel={formatOptionLabelSource}
                  />
                ),
              },
            ]),

        {
          label: "Xác suất cơ hội",
          name: "percent",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [
      dataCustomer,
      checkFieldCustomer,
      data,
      dataEmployee,
      dataSourceCustomer,
      dataCampaign,
      dataOpportunity,
      dataSale,
      // dataApproach,
      // listApproach,
      listApproachStep,
      dataColumn,
      checkFieldCampaign,
      checkFieldOpportunity,
      formData?.values,
      idCustomer,
      isLoadingCustomer,
      isBatch,
      listPipeline,
      dataPipeline,
      countCheckAddSource,
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
      setTimeout(() => {
        onHide(true);
        setDataCustomer(null);
        setDataEmployee(null);
        setDataCampaign(null);
        setDataSourceCustomer(null);
        setDataOpportunity(null);
        setDataSale(null);
        showToast(`${data ? "Cập nhật" : "Thêm mới"} cơ hội thành công`, "success");
        // setDataApproach(null);
        setData(null);
      }, 3000);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDataCustomer(null);
    setDataEmployee(null);
    setDataCampaign(null);
    setDataSourceCustomer(null);
    setDataOpportunity(null);
    setDataSale(null);
    // setDataApproach(null);
    setData(null);
    setCheckFieldCustomer(false);
    setCheckFieldCampaign(false);
    setCheckFieldOpportunity(false);
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
              !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
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
    [formData, values, isSubmit, checkFieldCustomer, idData, checkFieldCampaign]
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm()}
        className="modal-add-in-column"
      >
        <form className="form-add-in-column" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${idData ? "Chỉnh sửa cơ hội" : dataCampaign?.type === "biz" ? "Thêm cơ hội vào chiến dịch" : "Thêm mới cơ hội vào chiến dịch"}`}
            toggle={() => !isSubmit && handClearForm()}
          />
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
      <CreateOpportunityB2B
        onShow={isCreateOpportunityB2B}
        idCustomer={dataCustomer?.value}
        takeInfoOpportunity={takeInfoOpportunity}
        onHide={(reload) => {
          if (reload) {
            loadedOptionOpportunity("", undefined, { page: 1 });
          }
          setIsCreateOpportunityB2B(false);
        }}
      />
      <AddCustomerPersonModal
        onShow={showModalAddCustomer}
        data={dataCustomer}
        // onHide={() => setShowModalAddCustomer(false)}
        takeInfoCustomer={(data) => {
          if (dataCustomer) {
            getDetailCustomer(dataCustomer?.id);
          } else {
            takeInfoCustomer(data);
          }
        }}
        onHide={(reload, nextModal) => {
          setShowModalAddCustomer(false);
          //Nếu true thì bật cái kia
          if (nextModal) {
            setShowModalAddCompany(true);
          }
        }}
      />

      <AddCustomerCompanyModal
        onShow={showModalAddCompany}
        data={dataCustomer}
        takeInfoCustomer={(data) => {
          if (dataCustomer) {
            getDetailCustomer(dataCustomer?.id);
          } else {
            takeInfoCustomer(data);
          }
        }}
        onHide={(reload, nextModal) => {
          setShowModalAddCompany(false);

          if (nextModal) {
            setShowModalAddCustomer(true);
          }
        }}
      />
      <AddCustomerSourceModal
        onShow={showModalAddSource}
        data={null}
        onHide={(reload) => {
          // if (reload) {
          //   getListCustomerSource(params);
          // }
          setShowModalAddSource(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

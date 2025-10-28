import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { json, useLocation, useNavigate, useParams } from "react-router-dom";
import { formatCurrency, getSearchParameters, isDifferenceObj } from "reborn-util";
import { IContractRequest } from "model/contract/ContractRequestModel";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import Input from "components/input/input";
import { getPermissions, showToast } from "utils/common";
import SelectCustom from "components/selectCustom/selectCustom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import ImageThirdGender from "assets/images/third-gender.png";
import ImgPushCustomer from "assets/images/img-push.png";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";
import CustomerService from "services/CustomerService";
import PaymentBill from "./PaymentBill";
import ContractService from "services/ContractService";

import "./CreateContracts.scss";
import EmployeeService from "services/EmployeeService";
import AddCustomerCompanyModal from "pages/CustomerPerson/partials/AddCustomerCompanyModal";
// import ModalChooseProject from "./partials/ChooseProject/ModalChooseProject";
import { ContextType, UserContext } from "contexts/userContext";
import ContractProduct from "services/ContractProduct";
import RentalTypeService from "services/RentalTypeService";
import NummericInput from "components/input/numericInput";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import Button from "components/button/button";
import Icon from "components/icon";
import { IContentDialog } from "components/dialog/dialog";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import ContractAppendix from "../ContractAppendix/ContractAppendix";
import ContractPaymentProgress from "../ContractPaymentProgress/ContractPaymentProgress";
import ContractAttachment from "../ContractAttachment/ContractAttachment";
import ContractPipelineService from "services/ContractPipelineService";
import SearchBox from "components/searchBox/searchBox";
import PartnerService from "services/PartnerService";
import RadioList from "components/radio/radioList";
import ModalAddPartner from "pages/PartnerList/partials/ModalAddPartner";
import ChangeHistoryModal from "../ChangeHistoryModal/ChangeHistoryModal";
import Tippy from "@tippyjs/react";

interface IDataOptionCustomer {
  value: number;
  label: string;
  avatar: string;
  address: string;
  phoneMasked?: string;
  taxCode?: string;
  custType?: number;
  groupName?: string;
  sourceName?: string;
}

/**
 * Các trường hiển thị thông tin chi tiết hơn (ví dụ như date, ...)
 * @returns
 */
export default function CreateContracts() {
  const { id } = useParams();
  const checkCustType = localStorage.getItem("customer.custType")?.toString() || "0";
  const { dataBranch } = useContext(UserContext) as ContextType;

  document.title = `${id && +id > 0 ? "Cập nhật" : "Tạo"} hợp đồng`;
  const [permissions, setPermissions] = useState(getPermissions());

  const location = useLocation();
  const opportunityId = location.state?.opportunityId || null;

  const takeParamsUrl = getSearchParameters();
  const checkParamsUrl = takeParamsUrl && takeParamsUrl?.customerId;
  const checkCampaignIdUrl = takeParamsUrl && takeParamsUrl?.campaignId;

  const leadIdUrl = takeParamsUrl && takeParamsUrl?.leadId;
  const pipelineUrl = takeParamsUrl && takeParamsUrl?.pipelineId;

  const [typeContract, setTypeContract] = useState("1");
  const [detailCustomer, setDetailCustomer] = useState(null);
  //dataCustomer dùng để lấy toàn bộ thông tin khách hàng, sử dụng để edit thông tin khách hàng
  const [dataCustomer, setDataCustomer] = useState(null);
  const [showModalChooseProject, setShowModalChooseProject] = useState<boolean>(false);
  const [dataProject, setDataProject] = useState(null);
  const [detailPartner, setDetailPartner] = useState(null);
  const [dataPartner, setDataPartner] = useState(null);

  const [contractId, setContractId] = useState(null);

  useEffect(() => {
    setContractId(id || null);
  }, [id]);

  //   useEffect(() => {
  //     if (!id && !leadIdUrl) {
  //       setShowModalChooseProject(true);
  //     }
  //   }, [id, leadIdUrl]);

  const [detailLead, setDetailLead] = useState(null);
  const [detailPipeline, setDetailPipeline] = useState(null);

  //   const getDetailLead = async (id) => {
  //     const response = await ContractService.leadDetail(id);

  //     if (response.code === 0) {
  //       const result = response.result;
  //       setDetailLead(result);
  //     } else {
  //       showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //     }
  //   }

  //   useEffect(() => {
  //     if(leadIdUrl){
  //       getDetailLead(leadIdUrl);
  //     }
  //   }, leadIdUrl)

  //   useEffect(() => {
  //     if(detailLead){
  //       getDetailCustomer(detailLead.customerId);
  //       getDetailProject(detailLead.projectId, detailLead.floorId, detailLead.unitId)
  //     }
  //   }, [detailLead])

  const [tab, setTab] = useState(1);
  const tabData = [
    {
      value: 1,
      label: "Thông tin hợp đồng",
    },
    {
      value: 2,
      label: "Thông tin phụ lục",
    },
    {
      value: 3,
      label: "Thông tin tiến độ",
    },
    {
      value: 4,
      label: "Quản lý cọc",
    },
    {
      value: 5,
      label: "Tài liệu",
    },
  ];

  //TODO: Sau khi chọn dự án vs tầng ở phần modal xong thì lấy data ở đoạn này
  const takeDataProject = (data) => {
    if (!data) return;
    setDataProject(data);
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề call employee init để lấy ra người phụ trách
  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();

    if (response.code == 0) {
      const result = response.result;

      setDataPaymentBill({ ...dataPaymentBill, employeeId: result.id, employeeName: result.name });
    }
  };

  useEffect(() => {
    if (id || contractId) {
      getDetailContract();
      getLogValue();
    }
    if (!id) {
      getDetailEmployeeInfo();
    }
  }, [id, contractId]);

  const getDetailProject = async (id: number, floorId: number, unitId: number) => {
    const response = await ContractProduct.detail(id);

    if (response.code === 0) {
      const result = response.result;

      const changeDataProject = {
        value: result.id,
        label: result.name,
        address: result.address,
        blankArea: result.blankArea,
        fillArea: result.fillArea,
        nfaArea: result.nfaArea,
        outsideNfaArea: result.outsideNfaArea,
        rteId: result.rteId,
        rentalTypeName: result.rentalTypeName,
      };

      const changeDataFloor = result.lstProjectFloor.find((item) => item.id === floorId);

      const changeDataUnit = result.lstProjectFloor.find((item) => item.id === floorId).lstProjectUnit.find((el) => el.id === unitId);

      const resultObject = {
        project: changeDataProject,
        floor: {
          value: changeDataFloor.id,
          label: changeDataFloor.name,
        },
        unit: {
          value: changeDataUnit.id,
          label: changeDataUnit.name,
        },
      };

      setDataProject(resultObject);
    }
  };

  /**
   * Chi tiết hợp đồng
   */
  const getDetailContract = async () => {
    setIsLoading(true);
    const response = await ContractService.detail(+id || contractId);

    if (response.code === 0) {
      const result = response.result;
      setDataPaymentBill(result);
      if (result.customerId) {
        getDetailCustomer(result.customerId);
        setTypeContract("1");
      }
      if (result.businessPartnerId) {
        getDetailPartner(result.businessPartnerId);
        setTypeContract("0");
      }
      // getDetailProject(result.projectId, result.floorId, result.unitId);
      setListService(result.products);

      if (result?.template && result.template.includes("fileName")) {
        const dataTemplate = JSON.parse(result.template);
        if (dataTemplate && dataTemplate?.fileUrl) {
          setInfoFile({
            fileName: dataTemplate.fileName,
            fileUrl: dataTemplate.fileUrl,
            extension: dataTemplate.fileUrl.includes(".docx")
              ? "docx"
              : dataTemplate.fileUrl.includes(".xlsx")
              ? "xlsx"
              : dataTemplate.fileUrl.includes(".pdf") || dataTemplate.fileUrl.includes(".PDF")
              ? "pdf"
              : dataTemplate.fileUrl.includes(".pptx")
              ? "pptx"
              : dataTemplate.fileUrl.includes(".zip")
              ? "zip"
              : "rar",
          });
        }
      } else {
        if (result.template.includes("http")) {
          setInfoFile({
            fileUrl: result.template,
            extension: result.template.includes(".docx")
              ? "docx"
              : result.template.includes(".xlsx")
              ? "xlsx"
              : result.template.includes(".pdf") || result.template.includes(".PDF")
              ? "pdf"
              : result.template.includes(".pptx")
              ? "pptx"
              : result.template.includes(".zip")
              ? "zip"
              : "rar",
          });
        } else {
          setInfoFile(null);
        }
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  //lấy danh sách lịch sử thay đổi các trường thông tin của hợp đồng
  const [listLogValue, setListLogValue] = useState(null);
  const [fieldData, setFieldData] = useState(null);
  const [showModalLog, setShowModalLog] = useState(false);

  const getLogValue = async () => {
    const param = {
      id: +id || contractId,
      limit: 1000,
    };
    const response = await ContractService.logValues(param);

    if (response.code === 0) {
      const result = response.result;
      if (result?.items?.length > 0) {
        setListLogValue(result?.items);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //! đoạn này xử lý call api lấy ra thông tin khách hàng
  const loadOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới khách hàng", isShowModal: true, avatar: "custom" }] : []),
          ...(dataOption.length > 0
            ? dataOption.map((item: ICustomerResponse) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  address: item.address,
                  phoneMasked: item.phoneMasked,
                  taxCode: item.taxCode,
                  custType: item.custType,
                  groupName: item.groupName,
                  sourceName: item.sourceName,
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

  //! đoạn này xử lý call api lấy ra thông tin đối tác
  const loadOptionPartner = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await PartnerService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới đối tác", isShowModal: true, avatar: "custom" }] : []),
          ...(dataOption.length > 0
            ? dataOption.map((item: ICustomerResponse) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  address: item.address,
                  phoneMasked: item.phoneMasked,
                  taxCode: item.taxCode,
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
    if (dataBranch) {
      loadOptionCustomer("", undefined, { page: 1 });
      loadOptionPartner("", undefined, { page: 1 });
    }
  }, [dataBranch, typeContract, detailCustomer, detailPartner]);

  //! đoạn này xử lý vấn đề thay đổi khách hàng
  const handleChangeValueInfoCustomer = (e) => {
    if (e?.isShowModal) {
      setDataCustomer(null);
      if (checkCustType == "0" || !checkCustType) {
        setShowModalAddCustomer(true);
      } else {
        setShowModalAddCompany(true);
      }
    } else {
      // setDetailCustomer(e);
      getDetailCustomer(e.value);
      setDataPaymentBill({ ...dataPaymentBill, taxCode: e.taxCode ? e.taxCode : "", custType: e.custType });
    }
  };

  //! đoạn này xử lý vấn đề thay đổi đối tác
  const handleChangeValueInfoPartner = (e) => {
    if (e?.isShowModal) {
      setDataPartner(null);
      setShowModalAddPartner(true);
    } else {
      // setDetailPartner(e);
      getDetailPartner(e.value);
      setDataPaymentBill({ ...dataPaymentBill, taxCode: e.taxCode ? e.taxCode : "", businessPartnerId: e.value, businessPartnerName: e.label });
    }
  };

  //! đoạn này xử lý vấn đề hiển thị hình ảnh người dùng
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

  const [listService, setListService] = useState([]);
  //! đoạn này xử lý vấn đề hình thành phiếu thanh toán
  const [dataPaymentBill, setDataPaymentBill] = useState<IContractRequest>({
    id: 0,
    customerId: null,
    businessPartnerId: null,
    businessPartnerName: "",
    name: "",
    taxCode: "",
    contractNo: "",
    signDate: "",
    endDate: "",
    adjustDate: "",
    affectedDate: "",
    dealValue: "",
    employeeId: 0,
    employeeName: "",
    categoryId: 0,
    categoryName: "",
    pipelineId: 0,
    pipelineName: "",
    stageId: 0,
    stageName: "",
    branchId: 0,
    peopleInvolved: "[]",
    custType: 0,
    template: "",
    requestId: 0,
    requestCode: "",
    products: [],
    projectId: null,
    projectName: "",
    fsId: 0,
    fsName: "",
    opportunityId: opportunityId,
  });

  const [infoFile, setInfoFile] = useState(null);

  const getDetailPipeline = async (pipelineId) => {
    const response = await ContractPipelineService.detail(pipelineId);

    if (response.code === 0) {
      const result = response.result;
      setDetailPipeline({ value: result.id, label: result.name });
    }
  };

  useEffect(() => {
    if (pipelineUrl) {
      getDetailPipeline(pipelineUrl);
    }
  }, [pipelineUrl]);

  useEffect(() => {
    if (detailCustomer || dataProject || dataBranch || detailLead || detailPipeline || detailPartner) {
      setDataPaymentBill({
        ...dataPaymentBill,
        branchId: dataBranch.value,
        customerId: detailCustomer?.value || null,
        ...(detailPipeline
          ? {
              pipelineId: detailPipeline?.value || 0,
              pipelineName: detailPipeline?.label || "",
            }
          : {}),
      });
    }
  }, [detailCustomer, dataProject, dataBranch, detailLead, detailPipeline, detailPartner]);

  const getDetailCustomer = async (id: number) => {
    if (!id) return;

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataCustomer(result);
      setDetailCustomer({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        address: result.address,
        phoneMasked: result.phoneMasked,
        taxCode: result.taxCode,
        custType: result.custType,
        groupName: result.groupName,
        sourceName: result.sourceName,
      });
    } else {
      showToast("Có lỗi xảy ra vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (checkParamsUrl) {
      getDetailCustomer(+takeParamsUrl?.customerId);
    }
  }, [checkParamsUrl]);

  const getDetailPartner = async (id: number) => {
    if (!id) return;

    const response = await PartnerService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataPartner(result);
      setDetailPartner({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        address: result.address,
        phoneMasked: result.phoneMasked,
        taxCode: result.taxCode,
      });
    } else {
      showToast("Có lỗi xảy ra vui lòng thử lại sau", "error");
    }
  };

  const [showModalAddCustomer, setShowModalAddCustomer] = useState<boolean>(false);
  const [showModalAddCompany, setShowModalAddCompany] = useState<boolean>(false);

  const takeInfoCustomer = (data) => {
    if (data) {
      setDetailCustomer({
        value: data.id,
        label: data.name,
        avatar: data.avatar,
        address: data.address,
        phoneMasked: data.phoneMasked || data.phone,
        taxCode: data.taxCode,
        custType: data.custType,
        groupName: data.groupName,
        sourceName: data.sourceName,
      });
    }
  };

  const [showModalAddPartner, setShowModalAddPartner] = useState<boolean>(false);

  const takeInfoPartner = (data) => {
    if (data) {
      setDetailPartner({
        value: data.id,
        label: data.name,
        avatar: data.avatar,
        address: data.address,
        phoneMasked: data.phoneMasked,
        taxCode: data.taxCode,
      });
    }
  };

  return (
    <div className="page-content page-create-order--sale">
      <TitleAction title={`${id && +id > 0 ? "Cập nhật" : "Tạo"} hợp đồng`} />

      <div style={{ display: "flex", marginBottom: 10 }}>
        {tabData.map((item, index) => (
          <div
            key={index}
            style={{ borderBottom: tab === item.value ? "1px solid" : "", paddingLeft: 12, paddingRight: 12, paddingBottom: 3, cursor: "pointer" }}
            onClick={() => {
              if (contractId) {
                setTab(item.value);
              }
            }}
          >
            <span style={{ fontSize: 16, fontWeight: "500", color: tab === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className={tab === 1 ? "" : "d-none"}>
        <div className="card-box wrapper__info--customer">
          <div className="type-contract">
            <RadioList
              options={[
                {
                  value: "1",
                  label: "Khách hàng",
                },
                {
                  value: "0",
                  label: "Đối tác",
                },
              ]}
              title={""}
              value={typeContract}
              required={true}
              name={""}
              onChange={(e) => {
                const value = e.target.value;

                setTypeContract(value);
                if (value === "1") {
                  setDataPartner(null);
                  setDetailPartner(null);
                  setDataPaymentBill({ ...dataPaymentBill, taxCode: "", businessPartnerId: null, businessPartnerName: "" });
                } else {
                  setDataCustomer(null);
                  setDetailCustomer(null);
                  setDataPaymentBill({ ...dataPaymentBill, taxCode: "", custType: null, customerId: null });
                }
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h3 className="title__info">{`Thông tin ${typeContract === "1" ? "khách hàng" : "đối tác"}`}</h3>
            {(detailCustomer || detailPartner) && (detailCustomer ? permissions["CUSTOMER_UPDATE"] == 1 : permissions["PARTNER_UPDATE"] == 1) && (
              <div>
                <Tippy content={`Sửa thông tin ${detailCustomer ? `khách hàng` : detailPartner ? "đối tác" : ""}`}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      if (detailCustomer) {
                        localStorage.setItem("customer.custType", detailCustomer.custType.toString());
                        if (+detailCustomer.custType === 0) {
                          setShowModalAddCustomer(true);
                        } else {
                          setShowModalAddCompany(true);
                        }
                      } else {
                        setShowModalAddPartner(true);
                      }
                    }}
                  >
                    <Icon name="Pencil" style={{ width: 18, height: 18, marginBottom: "2rem", fill: "var(--primary-color)", marginLeft: 10 }} />
                  </span>
                </Tippy>
              </div>
            )}
          </div>

          <div className="list-form-group-customer">
            <div className={`form-group ${typeContract === "1" ? "" : "d-none"}`}>
              <SelectCustom
                key={(dataBranch ? dataBranch.value : "no-branch") && detailCustomer?.value}
                id="nameCustomer"
                name="nameCustomer"
                label="Họ tên"
                fill={true}
                required={true}
                options={[]}
                value={detailCustomer}
                onChange={(e) => {
                  handleChangeValueInfoCustomer(e);
                }}
                isAsyncPaginate={true}
                isFormatOptionLabel={true}
                placeholder={`Chọn khách hàng`}
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadOptionCustomer}
                formatOptionLabel={formatOptionLabelCustomer}
                disabled={checkParamsUrl}
              />
            </div>

            <div className={`form-group ${typeContract === "1" ? "d-none" : ""}`}>
              <SelectCustom
                key={(dataBranch ? dataBranch.value : "no-branch") && detailPartner?.value}
                id="namePartner"
                name="namePartner"
                label="Họ tên"
                fill={true}
                required={true}
                options={[]}
                value={detailPartner}
                onChange={(e) => {
                  handleChangeValueInfoPartner(e);
                }}
                isAsyncPaginate={true}
                isFormatOptionLabel={true}
                placeholder={`Chọn đối tác`}
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadOptionPartner}
                formatOptionLabel={formatOptionLabelCustomer}
                disabled={checkParamsUrl}
              />
            </div>

            <div className="form-group">
              <Input
                id="taxCode"
                name="taxCode"
                fill={true}
                disabled={true}
                label="Mã số thuế"
                placeholder={typeContract === "1" ? "Chọn khách hàng để xem MST" : "Chọn đối tác để xem MST"}
                value={(typeContract === "1" ? detailCustomer?.taxCode : detailPartner?.taxCode) || ""}
              />
            </div>

            <div className="form-group">
              <Input
                id="phoneCustomer"
                name="nameCustomer"
                fill={true}
                disabled={true}
                label="Số điện thoại"
                placeholder={typeContract === "1" ? "Chọn khách hàng để xem SĐT" : "Chọn đối tác để xem SĐT"}
                value={(typeContract === "1" ? detailCustomer?.phoneMasked : detailPartner?.phoneMasked) || ""}
              />
            </div>

            <div className="form-group">
              <Input
                id="address"
                name="address"
                label={`Địa chỉ ${typeContract === "1" ? "(ĐKKD)" : ""}`}
                fill={true}
                placeholder={typeContract === "1" ? "Chọn khách hàng để xem địa chỉ" : "Chọn đối tác để xem địa chỉ"}
                value={(typeContract === "1" ? detailCustomer?.address : detailPartner?.address) || ""}
                disabled={true}
              />
            </div>

            {typeContract === "1" ? (
              <div className="form-group">
                <Input
                  id="sourceName"
                  name="sourceName"
                  label="Đối tượng khách hàng"
                  fill={true}
                  placeholder={detailCustomer?.value ? "" : "Vui lòng chọn khách hàng"}
                  value={detailCustomer?.sourceName || ""}
                  disabled={true}
                />
              </div>
            ) : null}
            {typeContract === "1" ? (
              <div className="form-group">
                <Input
                  id="groupName"
                  name="groupName"
                  label="Phân loại khách hàng"
                  fill={true}
                  placeholder={detailCustomer?.value ? "" : "Vui lòng chọn khách hàng"}
                  value={detailCustomer?.groupName || ""}
                  disabled={true}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="card-box wrapper__info--paymentbill">
          <PaymentBill
            data={dataPaymentBill}
            setDataPaymentBill={setDataPaymentBill}
            idCustomer={detailCustomer?.value}
            title={`${(id && +id > 0) || contractId ? "Cập nhật" : "Tạo"} hợp đồng`}
            setContractId={setContractId}
            setTab={setTab}
            contractId={contractId}
            pipelineUrl={pipelineUrl}
            setInfoFile={setInfoFile}
            infoFile={infoFile}
            setListService={setListService}
            listService={listService}
            listLogValue={listLogValue}
            fieldData={fieldData}
            setFieldData={setFieldData}
            showModalLog={showModalLog}
            setShowModalLog={setShowModalLog}
            callback={(reload) => {
              getLogValue();
              if (reload) {
                getDetailContract();
              }
            }}
          />
        </div>
      </div>

      {/* {tab === 2 && */}

      <div className={tab === 2 ? "" : "d-none"}>
        <ContractAppendix contractId={contractId} />
      </div>
      {/* } */}

      <div className={tab === 3 ? "" : "d-none"}>
        <ContractPaymentProgress contractId={contractId} dataContract={dataPaymentBill} />
      </div>

      <div className={tab === 5 ? "" : "d-none"}>
        <ContractAttachment contractId={contractId} />
      </div>

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

      <ModalAddPartner
        onShow={showModalAddPartner}
        data={dataPartner}
        takeInfoPartner={(data) => {
          if (dataPartner) {
            getDetailPartner(dataPartner?.id);
          } else {
            takeInfoPartner(data);
          }
        }}
        onHide={(reload, nextModal) => {
          // if (reload) {
          //   getListPartner(params);
          // }
          setShowModalAddPartner(false);
        }}
      />

      {/* <ChangeHistoryModal
        onShow={showModalLog}
        dataLog={listLogValue}
        fieldData={fieldData}
        dataPaymentBill={dataPaymentBill}
        onHide={(reload) => {
          // if (reload) {
          //   getListPartner(params);
          // }
          setShowModalLog(false);
          setFieldData(null);
        }}
      /> */}

      {/* <ModalChooseProject
        onShow={showModalChooseProject}
        onHide={() => setShowModalChooseProject(false)}
        takeData={(data) => takeDataProject(data)}
      /> */}
    </div>
  );
}

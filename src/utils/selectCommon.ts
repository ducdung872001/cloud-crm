import { showToast } from "./common";
import CustomerService from "services/CustomerService";
import EmployeeService from "services/EmployeeService";
import BeautyBranchService from "services/BeautyBranchService";
import DepartmentService from "services/DepartmentService";
import TipGroupService from "services/TipGroupService";
import ServiceService from "services/ServiceService";
import UnitService from "services/UnitService";
import CareerService from "services/CareerService";
import CustomerSourceService from "services/CustomerSourceService";
import CustomerGroupService from "services/CustomerGroupService";
import ProductService from "services/ProductService";
import CardService from "services/CardService";
import RelationShipService from "services/RelationShipService";
import IndustryService from "services/IndustryService";
import PartnerSMSService from "services/PartnerSMSService";
import PartnerEmailService from "services/PartnerEmailService";
import BrandNameService from "services/BrandNameService";
import TemplateCategoryService from "services/TemplateCategoryService";
import TemplateSMSService from "services/TemplateSMSService";
import WorkProjectService from "services/WorkProjectService";
import WorkTypeService from "services/WorkTypeService";
import CategoryService from "services/CategoryService";
import SubsystemAdministrationService from "services/SubsystemAdministrationService";
import CampaignService from "services/CampaignService";
import InventoryService from "services/InventoryService";
import CategoryServiceService from "services/CategoryServiceService";
import PositionService from "services/PositionService";
import ContractPipelineService from "services/ContractPipelineService";
import ContractStageService from "services/ContractStageService";
import KpiService from "services/KpiService";
import ContactService from "services/ContactService";
import ContractService from "services/ContractService";
import ContractAttachmentService from "services/ContractAttachmentService";
import TemplateEmailService from "services/TemplateEmailService";
import ContactPipelineService from "services/ContactPipelineService";
import TicketProcService from "services/TicketProcService";
import TicketCategoryService from "services/TicketCategoryService";
import ProjectService from "services/ProjectService";
import OperationProjectService from "services/OperationProjectService";
import VehicleService from "services/VehicleService";
import SpaceTypeService from "services/SpaceTypeService";
import SpaceCustomerService from "services/SpaceCustomerService";
import BuildingService from "services/BuildingService";
import CustomerMarketingLeadService from "services/CustomerMarketingLeadService";
import RoleService from "services/RoleService";
import CampaignMarketingService from "services/CampaignMarketingService";

// Function lấy dữ liệu danh sách từ service
export async function SelectOptionData(key: string, params?: any) {
  let response = null;
  params = { ...params, limit: 100 };

  switch (key) {
    case "datatype":
      return [
        { value: "text", label: "Text" },
        { value: "textarea", label: "Textarea" },
        { value: "number", label: "Number" },
        { value: "dropdown", label: "Dropdown" },
        { value: "multiselect", label: "MultiSelect" },
        { value: "checkbox", label: "Checkbox" },
        { value: "radio", label: "Radio" },
        { value: "date", label: "Date" },
        { value: "lookup", label: "Lookup" },
        { value: "formula", label: "Formula" },
      ];

    case "custType":
      return [
        { value: "0", label: "Cá nhân" },
        { value: "1", label: "Doanh nghiệp" },
      ];
  }

  switch (key) {
    case "categoryId":
    case "category":
      response = await CategoryService.list(params);
      break;
    case "categoryServiceId":
      response = await CategoryServiceService.list(params);
      break;
    case "categoryItemId":
      response = await CategoryServiceService.list(params);
      break;
    case "groupId":
    case "groupTip":
      response = await TipGroupService.list(params);
      break;
    case "unitId":
    case "unit":
      response = await UnitService.list(params);
      break;
    case "supplier":
      break;
    case "customer":
    case "customerId":
      response = await CustomerService.filter(params);
      break;
    case "customerSource":
      response = await CustomerSourceService.list(params);
      break;
    case "customerSourceId":
      response = await CustomerSourceService.list(params);
      break;
    case "uploadId":
      response = await CustomerService.lstUpload(params);
      break;
    case "filterId":
      response = await CustomerService.filterAdvanced(params);
      break;
    case "employee":
    case "employeeId":
    case "creatorId":
      response = await EmployeeService.list(params);
      break;
    case "saleId":
    case "saleId":
      response = await EmployeeService.list(params);
      break;
    //Chỉ lấy nhân viên chưa cấu hình hoa hồng
    case "employeeTip":
      response = await EmployeeService.listExTip(params);
      break;
    case "beautyBranch":
    case "branchId":
      response = await BeautyBranchService.list(params);
      break;
    case "department":
    case "departmentId":
      response = await DepartmentService.list(params);
      break;
    case "lstId":
    case "serviceId":
    case "service":
      response = await ServiceService.filter(params);
      break;
    case "careerId":
    case "career":
      response = await CareerService.list(params);
      break;
    case "marketingSendLeadSource":
    case "marketingSendLeadSource":
      response = await CustomerMarketingLeadService.list(params);
      break;
    case "marketingId":
      response = await CampaignMarketingService.list(params);
      break;
    case "marketingChanelId":
      response = await CampaignMarketingService.listMAChannel(params);
      break;
    case "sourceId":
    case "source":
      response = await CustomerSourceService.list(params);
      break;
    case "cgpId":
    case "cgp":
      response = await CustomerGroupService.list(params);
      break;
    case "productId":
    case "product":
      response = await ProductService.list(params);
      break;
    case "cardId":
      response = await CardService.list(params);
      break;
    case "relationshipId":
      response = await RelationShipService.list(params);
      break;
    case "industryId":
      response = await IndustryService.list(params);
      break;
    case "partnerEmailId":
      response = await PartnerEmailService.list(params);
      break;
    case "partnerSMSId":
      response = await PartnerSMSService.list(params);
      break;
    case "brandnameId":
      response = await BrandNameService.list(params);
      break;
    case "tcyId":
      response = await TemplateCategoryService.list(params);
      break;
    case "templateId":
      response = await TemplateSMSService.list(params);
      break;
    case "projectId":
      response = await WorkProjectService.list({ ...params, parentId: -1 });
      break;
    case "operationProjectId":
      response = await OperationProjectService.list(params);
      break;
    case "wteId":
      response = await WorkTypeService.list(params);
      break;
    case "parentIdStemAdmin":
      response = await SubsystemAdministrationService.list(params);
      break;
    case "campaignId":
      response = await CampaignService.list(params);
      break;
    case "inventoryId":
      response = await InventoryService.list(params);
      break;
    case "positionId":
      response = await PositionService.list(params);
      break;
    case "pipelineId":
      response = await ContractPipelineService.list(params);
      break;
    case "stageId":
      response = await ContractStageService.list(params);
      break;
    case "contactId":
      response = await ContactService.list(params);
      break;
    case "contractId":
      response = await ContractService.list(params);
      break;
    case "templateEmailId":
      response = await TemplateEmailService.list(params);
      break;
    case "templateSmsId":
      response = await TemplateSMSService.list(params);
      break;

    case "contact_pipelineId":
      response = await ContactPipelineService.list(params);
      break;

    case "cityId":
      response = await CustomerService.areaList(params);
      break;
    case "attachmentId":
      response = await ContractAttachmentService.list(params);
      break;
    case "kpiId":
      response = await KpiService.list(params);
      break;

    case "supportId":
      response = await TicketProcService.list(params);
      break;

    case "ticketCategoryId":
      response = await TicketCategoryService.list(params);
      break;
    case "vehicleId":
      response = await VehicleService.list(params);
      break;
    case "steId":
      response = await SpaceTypeService.list(params);
      break;
    case "scrId":
      response = await SpaceCustomerService.list(params);
      break;
    case "buildingId":
      response = await BuildingService.list(params);
      break;
    case "rolePermission":
      response = await RoleService.list(params);
      break;
  }
  if (response) {
    if (response.code === 0) {
      return [...(response.result.items ? response.result.items : response.result)].map((item) => {
        if (key === "customer" || key === "customerId") {
          return { value: item.id, label: `${item.name} - ${item.phoneMasked}` };
        }
        if (key === "categoryItemId") {
          return { value: item.name, label: `${item.name}` };
        }
        if (key === "customerSource" || key === "customerSourceId" ) {
          return { value: item.name, label: `${item.name}` };
        }
        if (key === "marketingId"|| key === "marketingChanelId" ) {
          return { value: item.name, label: `${item.name}` };
        }
        if (key === "scrId") {
          return { value: item.id, label: `${item.unitNumber} - ${item.customerName}` };
        }
        if (key === "marketingSendLeadSource") {
          return { value: item.name, label: `${item.name}` };
        }
        if (key === "serviceId") {
          return { 
            value: item.id, 
            label: `${item.name}`,
            service_price: item.price || 0,
            service_discount: item.discount || 0
          };
        }
        return {
          value: item.id || item.uploadId,
          label: item.name || item.title || item.parentName || item.productName || item.partnerName || item.fileName || item.licensePlate,
        };
      });
    } else {
      showToast(response.message, "error");
    }
    return [];
  }
}

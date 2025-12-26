/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Grid } from "swiper";
import { getSearchParameters, getPageOffset, getDomain } from "reborn-util";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { ExportExcel } from "exports";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { useOnClickOutside, useWindowDimensions } from "utils/hookCustom";
import { showToast, getPermissions } from "utils/common";
import { formatCurrency, isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";
import { IRelationShipResposne } from "model/relationShip/RelationShipResposne";
import { UserContext, ContextType } from "contexts/userContext";
import UpdateCommon from "./partials/UpdateCommon";
import AddCustomerPersonModal from "./partials/AddCustomerPersonModal";
import AddCustomerViewerModal from "./partials/AddCustomerViewerModal/AddCustomerViewerModal";
import AddEditSendSMS from "pages/Common/AddEditSendSMS/AddEditSendSMS";
import RelationShipService from "services/RelationShipService";
import RecoverPublicDebts from "pages/Common/RecoverPublicDebts";
import ImportModal from "components/importModalBackup";
import ExportListModal from "pages/Common/ExportListModal/ExportListModal";
import AddTreamentHistoryModal from "pages/TreatmentHistory/partials/AddTreamentHistoryModal/AddTreamentHistoryModal";
import AddBTwoBModal from "./partials/AddBTwoBModal";
import ViewOpportunityBTwoB from "./partials/ViewOpportunityBTwoB";
import AddModalOther from "./partials/AddModalOther";

//Thêm riêng lẻ 1 cơ hội vào chiến dịch bán hàng (quy trình bán hàng)
import AddManagementOpportunityModal from "pages/ManagementOpportunity/partials/AddManagementOpportunityModal";
import "swiper/css/grid";
import "swiper/css/navigation";
import "./CustomerPersonList.scss";
import Button from "components/button/button";
import BoxTableAdvanced from "components/boxTableAdvanced/boxTableAdvanced";
import Checkbox from "components/checkbox/checkbox";
import Input from "components/input/input";
import Popover from "components/popover/popover";
import CustomerSourceAnalysis from "./CustomerSourceAnalysis";
import AddCustomerCompanyModal from "./partials/AddCustomerCompanyModal";
import ModalAddMA from "./ModalAddMA/ModalAddMA";
import AddEditSendEmail from "pages/Common/AddEditSendEmail/AddEditSendEmail";
import AddMaModal from "./partials/AddMaModal";
import PermissionService from "services/PermissionService";
import ReportCustomer from "./partials/ReportCustomer";
import FilterAdvanceModal from "./partials/FilterAdvanceModal/FilterAdvanceModal";
import ModalExportCustomer from "./ModalExportCustomer/ModalExportCustomer";
import { addDays } from "components/addDays/addDays";
import SplitDataCustomerModal from "./partials/SplitDataCustomerModal";
import { StyleHeaderTable } from "components/StyleHeaderTable/StyleHeaderTable";
// import PurchaseInvoiceList from "./partials/PurchaseInvoice/PurchaseInvoiceList";

export default function CustomerPersonList() {
  const [showPageSendSMS, setShowPageSendSMS] = useState<boolean>(false);
  const [showPageSendEmail, setShowPageSendEmail] = useState<boolean>(false);
  const [activeTitleHeader, setActiveTitleHeader] = useState(1);
  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");
  const takeUrlFilterAdvance = (localStorage.getItem("filterAdvance") && JSON.parse(localStorage.getItem("filterAdvance"))) || null;

  document.title = `${
    showPageSendEmail ? "Gửi email" : showPageSendSMS ? "Gửi SMS" : activeTitleHeader === 1 ? "Danh sách khách hàng" : "Phân tích nguồn khách hàng"
  }`;

  const navigate = useNavigate();

  const { name, avatar, dataBranch } = useContext(UserContext) as ContextType;
  const checkCustType = localStorage.getItem("customer.custType");

  const checkUserRoot = localStorage.getItem("user.root");
  const swiperRelationshipRef = useRef(null);
  const targetBsnId_customer = localStorage.getItem("targetBsnId_customer");

  const [searchParams, setSearchParams] = useSearchParams();

  const [listCustomer, setListCustomer] = useState<ICustomerResponse[]>([]);  
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalDebt, setShowModalDebt] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalAddManagementOpportunity, setShowModalAddManagementOpportunity] = useState<boolean>(false);
  const [showModalAddMA, setShowModalAddMA] = useState<boolean>(false);
  const [showModalImport, setShowModalImport] = useState<boolean>(false);
  const [isBatch, setIsBatch] = useState<boolean>(false);

  const { width } = useWindowDimensions();
  const takeParamsUrl = getSearchParameters();
  console.log('takeParamsUrl', takeParamsUrl);
  

  //! đoạn này call API mối quan hệ khách hàng
  const [listRelationship, setListRelationship] = useState<IRelationShipResposne[]>([]);
  const [idRelationship, setIdRelationship] = useState<number>(() => {
    return takeParamsUrl?.relationshipId ? takeParamsUrl?.relationshipId : null;
  });

  // biến này tạo ra với mục đích tìm kiếm nhanh
  const [contactType, setContactType] = useState<number>(() => {
    return takeParamsUrl?.contactType ? takeParamsUrl?.contactType : -1;
  });

  const [cityId, setCityId] = useState<number>(() => {
    return takeParamsUrl?.cityId ? takeParamsUrl?.cityId : "";
  });

  const [listPartner, setListPartner] = useState([]);
  const [targetBsnId, setTargetBsnId] = useState(targetBsnId_customer ? +targetBsnId_customer : null);
  useEffect(() => {
    localStorage.setItem("targetBsnId_customer", JSON.stringify(targetBsnId));
  }, [targetBsnId]);

  const colorData = [
    "#E98E4C",
    "#ED6665",
    "#FFBF00",
    "#9966CC",
    "#6A5ACD",
    "#007FFF",
    "#993300",
    "#F0DC82",
    "#CC5500",
    "#C41E3A",
    "#ACE1AF",
    "#7FFF00",
    "#FF7F50",
    "#BEBEBE",
    "#FF00FF",
    "#C3CDE6",
    "#FFFF00",
    "#40826D",
    "#704214",
  ];

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách khách hàng",
      is_active: true,
    },
  ]);

  const [idCustomer, setIdCustomer] = useState<number>(null);
  const [idxCustomer, setIdxCustomer] = useState<number>(null);
  const [isShowPhone, setIsShowPhone] = useState<boolean>(false);
  const [valueShowPhone, setValueShowPhone] = useState<string>("");

  const customerFilterList = useMemo(
    () =>
      [
        // ...(+checkUserRoot == 1
        //   ? [
        //       {
        //         key: "branchId",
        //         name: "Chi nhánh",
        //         type: "select",
        //         is_featured: true,
        //         value: searchParams.get("branchId") ?? "",
        //       },
        //     ]
        //   : []),
        {
          key: "cityId",
          name: "Khu vực",
          type: "select",
          is_featured: true,
          value: searchParams.get("cityId") ?? "",
          params: {
            parentId: 0,
            limit: 1000,
          },
        },

        // ...(cityId ? [
        //     {
        //       key: "districtId",
        //       name: "Quận/huyện",
        //       type: "select",
        //       is_featured: true,
        //       value: searchParams.get("cityId") ?? "",
        //       params: {
        //         parentId: 0,
        //         limit: 1000
        //       }
        //     },
        //   ] : []
        // ) ,
        {
          key: "time_buy",
          name: "Thời gian mua gần nhất",
          type: "date-two",
          param_name: ["fmtStartOrderDate", "fmtEndOrderDate"],
          is_featured: true,
          value: searchParams.get("fmtStartOrderDate") ?? "",
          value_extra: searchParams.get("fmtEndOrderDate") ?? "",
          is_fmt_text: true,
        },

        {
          key: "checkDebt",
          name: "Công nợ",
          type: "select",
          is_featured: true,
          list: [
            {
              value: "-1",
              label: "Tất cả",
            },
            {
              value: "1",
              label: "Còn nợ",
            },
            {
              value: "2",
              label: "Đã xong",
            },
          ],
          value: searchParams.get("checkDebt") ?? "",
        },
        {
          key: "cgpId",
          name: "Nhóm khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("cgpId") ?? "",
        },
        {
          key: "custType",
          name: "Loại khách hàng",
          type: "select",
          is_featured: true,
          list: [
            {
              value: "0",
              label: "Khách hàng cá nhân",
            },
            {
              value: "1",
              label: "Khách hàng doanh nghiệp",
            },
          ],
          value: searchParams.get("custType") ?? "",
        },
        {
          key: "careerId",
          name: "Ngành nghề khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("careerId") ?? "",
        },
        {
          key: "sourceId",
          name: "Nguồn khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("sourceId") ?? "",
        },
        {
          key: "employeeId",
          name: "Người phụ trách",
          type: "select",
          is_featured: true,
          value: searchParams.get("employeeId") ?? "",
        },
        {
          key: "productId",
          name: "Lọc theo sản phẩm đã mua",
          type: "select",
          is_featured: true,
          value: searchParams.get("productId") ?? "",
        },
        {
          key: "serviceId",
          name: "Lọc theo dịch vụ đã mua",
          type: "select",
          is_featured: true,
          value: searchParams.get("serviceId") ?? "",
        },
        {
          key: "uploadId",
          name: "Lọc theo lượt upload",
          type: "select",
          is_featured: true,
          value: searchParams.get("uploadId") ?? "",
        },
        {
          key: "",
          name: "Lọc theo MA",
          type: "select",
          is_featured: true,
          value: searchParams.get("") ?? "",
        },
        {
          key: "filterId",
          name: "Lọc theo phân khúc khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("filterId") ?? "",
        },
      ] as IFilterItem[],
    [searchParams, cityId]
  );

  //TNEX
  const customerFilterListTNEX = useMemo(
    () =>
      [
        {
          key: "employeeId",
          name: "Người phụ trách",
          type: "select",
          is_featured: true,
          value: searchParams.get("employeeId") ?? "",
        },
        {
          key: "sourceId",
          name: "Nguồn khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("sourceId") ?? "",
        },
        {
          key: "marketingSendLeadSource",
          name: "Nguồn Marketing gửi Lead",
          type: "select",
          is_featured: true,
          value: searchParams.get("marketingSendLeadSource") ?? "",
        },
        // {
        //   key: "numCall",
        //   name: "Số lần gọi",
        //   type: "input",
        //   is_featured: true,
        //   value: searchParams.get("numCall") ?? "",
        // },
        {
          key: "time_sync",
          name: "Thời gian nhận dữ liệu",
          type: "date-two",
          param_name: ["startSyncDate", "endSyncDate"],
          is_featured: true,
          value: searchParams.get("startSyncDate") ?? "",
          value_extra: searchParams.get("endSyncDate") ?? "",
          is_fmt_text: true,
        },
        {
          key: "numCall",
          name: "Số lần gọi",
          type: "select",
          list: [
            {
              value: "0",
              label: "0",
            },
            {
              value: "1",
              label: "1",
            },
            {
              value: "2",
              label: "2",
            },
            {
              value: "3",
              label: "3",
            },
          ],
          is_featured: true,
          value: searchParams.get("numCall") ?? "",
        },
        {
          key: "callStatus",
          name: "Trạng thái cuộc gọi gần nhất",
          type: "select",
          list: [
            // {
            //   value: 'empty',
            //   label: 'Chưa có trạng thái'
            // },
            {
              value: "KH không nghe máy",
              label: "KH không nghe máy",
            },
            {
              value: "KH bận gọi lại sau",
              label: "KH bận gọi lại sau",
            },
            {
              value: "SĐT khách hàng thuê bao",
              label: "SĐT khách hàng thuê bao",
            },
            {
              value: "SĐT không đúng hoặc đang tạm khóa",
              label: "SĐT không đúng hoặc đang tạm khóa",
            },
            {
              value: "KH đăng ký bằng SĐT khác",
              label: "KH đăng ký bằng SĐT khác",
            },
            {
              value: "KH đã thực hiện đăng ký khoản vay trước đó",
              label: "KH đã thực hiện đăng ký khoản vay trước đó",
            },
            {
              value: "KH đang cân nhắc khoản vay, gọi lại hỗ trợ sau",
              label: "KH đang cân nhắc khoản vay, gọi lại hỗ trợ sau",
            },
            {
              value: "KH từ chối đăng ký do không đủ điều kiện vay",
              label: "KH từ chối đăng ký do không đủ điều kiện vay",
            },
            {
              value: "KH nghe máy, không có nhu cầu vay",
              label: "KH nghe máy, không có nhu cầu vay",
            },
            {
              value: "(Cashloan) KH đồng ý vay nhưng chưa thực hiện đăng ký",
              label: "(Cashloan) KH đồng ý vay nhưng chưa thực hiện đăng ký",
            },
            {
              value: "(T-Boss) KH đồng ý vay nhưng chưa thực hiện đăng ký",
              label: "(T-Boss) KH đồng ý vay nhưng chưa thực hiện đăng ký",
            },
            {
              value: "(Cashloan) KH đăng ký thành công",
              label: "(Cashloan) KH đăng ký thành công",
            },
            {
              value: "(T-Boss) KH đăng ký thành công",
              label: "(T-Boss) KH đăng ký thành công",
            },
            {
              value: "KH không đủ điều kiện vay SP TBOSS",
              label: "KH không đủ điều kiện vay SP TBOSS",
            },
          ],
          is_featured: true,
          value: searchParams.get("callStatus") ?? "",
        },
        {
          key: "time_call",
          name: "Thời gian cập nhật cuộc gọi gần nhất",
          type: "date-two",
          param_name: ["callStartDate", "callEndDate"],
          is_featured: true,
          value: searchParams.get("callStartDate") ?? "",
          value_extra: searchParams.get("callEndDate") ?? "",
          is_fmt_text: true,
        },
        {
          key: "Trangthaikhoanvaycashloan",
          name: "Trạng thái khoản vay Cashloan",
          type: "select",
          list: [
            {
              value: "empty",
              label: "Chưa có trạng thái",
            },
            {
              value: "Đã khởi tạo đơn vay (AUTHENTICATE)",
              label: "Đã khởi tạo đơn vay (AUTHENTICATE)",
            },
            {
              value: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
              label: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
            },
            {
              value: "Khoản vay bị từ chối (REJECTED)",
              label: "Khoản vay bị từ chối (REJECTED)",
            },
            {
              value: "Khoản vay bị từ chối, cho đăng ký lại (TEMP_REJECT)",
              label: "Khoản vay bị từ chối, cho đăng ký lại (TEMP_REJECT)",
            },
            {
              value: "Chờ giải ngân (For_Disbursement)",
              label: "Chờ giải ngân (For_Disbursement)",
            },
            {
              value: "Đã giải ngân (CLOSED)",
              label: "Đã giải ngân (CLOSED)",
            },
            {
              value: "Chưa có khoản vay (null,Init,Draft)",
              label: "Chưa có khoản vay (null,Init,Draft)",
            },
            {
              value: "Chờ KH ký hợp đồng (Forsign)",
              label: "Chờ KH ký hợp đồng (Forsign)",
            },
            {
              value: "Quá hạn ký hợp đồng (Expired)",
              label: "Quá hạn ký hợp đồng (Expired)",
            },
          ],
          is_featured: true,
          value: searchParams.get("Trangthaikhoanvaycashloan") ?? "",
        },
        {
          key: "Cashloan_Approve",
          name: "Ngày đăng ký Cashloan",
          type: "date-two",
          param_name: ["cashLoanApproveStartDate", "cashLoanApproveEndDate"],
          is_featured: true,
          value: searchParams.get("cashLoanApproveStartDate") ?? "",
          value_extra: searchParams.get("cashLoanApproveEndDate") ?? "",
          is_fmt_text: true,
        },
        {
          key: "Trangthaikhoanvaycreditline",
          name: "Trạng thái khoản vay Creditline",
          type: "select",
          list: [
            {
              value: "empty",
              label: "Chưa có trạng thái",
            },
            {
              value: "Chưa có khoản vay (null,Init,Draft)",
              label: "Chưa có khoản vay (null,Init,Draft)",
            },
            {
              value: "Đã khởi tạo đơn vay (Signed)",
              label: "Đã khởi tạo đơn vay (Signed)",
            },
            {
              value: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
              label: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
            },
            {
              value: "Khoản vay bị từ chối (REJECTED)",
              label: "Khoản vay bị từ chối (REJECTED)",
            },
            {
              value: "Đã cấp hạn mức (Disbursement)",
              label: "Đã cấp hạn mức (Disbursement)",
            },
            {
              value: "Đã giải ngân (CLOSED)",
              label: "Đã giải ngân (CLOSED)",
            },
          ],
          is_featured: true,
          value: searchParams.get("Trangthaikhoanvaycreditline") ?? "",
        },
        {
          key: "Creditline_Approve",
          name: "Ngày đăng ký Creditline",
          type: "date-two",
          param_name: ["creditLineApproveStartDate", "creditLineApproveEndDate"],
          is_featured: true,
          value: searchParams.get("creditLineApproveStartDate") ?? "",
          value_extra: searchParams.get("creditLineApproveEndDate") ?? "",
          is_fmt_text: true,
        },
        {
          key: "TrangThaiKhoanVayTBoss",
          name: "Trạng thái khoản vay T-Boss",
          type: "select",
          list: [
            {
              value: "empty",
              label: "Chưa có trạng thái",
            },
            {
              value: "Đã khởi tạo đơn vay (AUTHENTICATE)",
              label: "Đã khởi tạo đơn vay (AUTHENTICATE)",
            },
            {
              value: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
              label: "Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL)",
            },
            {
              value: "Khoản vay bị từ chối (REJECTED)",
              label: "Khoản vay bị từ chối (REJECTED)",
            },
            {
              value: "Khoản vay bị từ chối, cho đăng ký lại (TEMP_REJECT)",
              label: "Khoản vay bị từ chối, cho đăng ký lại (TEMP_REJECT)",
            },
            {
              value: "Chờ giải ngân (For_Disbursement)",
              label: "Chờ giải ngân (For_Disbursement)",
            },
            {
              value: "Đã giải ngân (CLOSED)",
              label: "Đã giải ngân (CLOSED)",
            },
            {
              value: "Chưa có khoản vay (null,Init,Draft)",
              label: "Chưa có khoản vay (null,Init,Draft)",
            },
            {
              value: "Chờ KH ký hợp đồng (Forsign)",
              label: "Chờ KH ký hợp đồng (Forsign)",
            },
            {
              value: "Chờ KH ký hợp đồng (Forsign)",
              label: "Chờ KH ký hợp đồng (Forsign)",
            },
            {
              value: "Quá hạn ký hợp đồng (Expired)",
              label: "Quá hạn ký hợp đồng (Expired)",
            },
            {
              value: "Chờ thông tin DTM (WAITING_DATAMART)",
              label: "Chờ thông tin DTM (WAITING_DATAMART)",
            },
          ],
          is_featured: true,
          value: searchParams.get("TrangThaiKhoanVayTBoss") ?? "",
        },
        {
          key: "TBoss_Approve",
          name: "Ngày đăng ký T-Boss",
          type: "date-two",
          param_name: ["tBossApproveStartDate", "tBossApproveEndDate"],
          is_featured: true,
          value: searchParams.get("tBossApproveStartDate") ?? "",
          value_extra: searchParams.get("tBossApproveEndDate") ?? "",
          is_fmt_text: true,
        },
        {
          key: "TrangthaiOnboard",
          name: "Trạng thái Onboarding",
          type: "select",
          list: [
            {
              value: "empty",
              label: "Chưa có trạng thái",
            },
            {
              value: "Chưa tạo tài khoản",
              label: "Chưa tạo tài khoản",
            },
            {
              value: "Đã Onboard thành công",
              label: "Đã Onboard thành công",
            },
          ],
          is_featured: true,
          value: searchParams.get("TrangthaiOnboard") ?? "",
        },
        {
          key: "time_assign",
          name: "Thời gian nhận phụ trách",
          type: "date-two",
          param_name: ["employeeAssignStartDate", "employeeAssignEndDate"],
          is_featured: true,
          value: searchParams.get("employeeAssignStartDate") ?? "",
          value_extra: searchParams.get("employeeAssignEndDate") ?? "",
          is_fmt_text: true,
        },
        {
          key: "LyDo",
          name: "Lý do từ chối",
          type: "select",
          list: [
            {
              value: "Đã vay được bên khác",
              label: "Đã vay được bên khác",
            },
            {
              value: "Quá tuổi hoặc chưa đủ tuổi",
              label: "Quá tuổi hoặc chưa đủ tuổi",
            },
            {
              value: "Xoay được tiền nên hết nhu cầu",
              label: "Xoay được tiền nên hết nhu cầu",
            },
            {
              value: "KH mặc định nợ xấu không vay được nên từ chối",
              label: "KH mặc định nợ xấu không vay được nên từ chối",
            },
            {
              value: "Thủ tục đăng ký phức tạp",
              label: "Thủ tục đăng ký phức tạp",
            },
            {
              value: "KH ấn nhầm hoặc không để lại nhu cầu",
              label: "KH ấn nhầm hoặc không để lại nhu cầu",
            },
            {
              value: "Không muốn vay qua app sợ lừa đảo",
              label: "Không muốn vay qua app sợ lừa đảo",
            },
            {
              value: "Lãi suất cao ",
              label: "Lãi suất cao ",
            },
            {
              value: "Tham khảo lãi suất",
              label: "Tham khảo lãi suất",
            },
            {
              value: "Sợ gọi tham chiếu người thân",
              label: "Sợ gọi tham chiếu người thân",
            },
            {
              value: "Thời hạn vay ngắn",
              label: "Thời hạn vay ngắn",
            },
            {
              value: "Hạn mức gói vay thấp",
              label: "Hạn mức gói vay thấp",
            },
            {
              value: "Thấy đánh giá app TNEX không tốt nên không vay",
              label: "Thấy đánh giá app TNEX không tốt nên không vay",
            },
            {
              value: "KH không kinh doanh sàn TMĐT",
              label: "KH không kinh doanh sàn TMĐT",
            },
            {
              value: "Shop không đủ thời gian kinh doanh",
              label: "Shop không đủ thời gian kinh doanh",
            },
            {
              value: "Shop không đủ doanh thu",
              label: "Shop không đủ doanh thu",
            },
            {
              value: "Tỉnh thành không hỗ trợ TBOSS",
              label: "Tỉnh thành không hỗ trợ TBOSS",
            },
            {
              value: "Tỉnh thành không hỗ trợ Cashloan",
              label: "Tỉnh thành không hỗ trợ Cashloan",
            },
            {
              value: "KH không đồng ý ủy quyền liên kết Shop",
              label: "KH không đồng ý ủy quyền liên kết Shop",
            },
            {
              value: "Đã có khoản giải ngân cashloan",
              label: "Đã có khoản giải ngân cashloan",
            },
          ],
          is_featured: true,
          value: searchParams.get("LyDo") ?? "",
        },
        {
          key: "sotienpheduyetcashloan",
          name: "Số tiền phê duyệt Cashloan",
          type: "input",
          is_featured: true,
          value: searchParams.get("quantityCall") ?? "",
        },
      ] as IFilterItem[],
    [searchParams, cityId]
  );

  //modal chia data khách hàng TNEX
  const [isModalSplitData, setIsModalSplitData] = useState(false);
  const [isModalFilterAdvance, setIsModalFilterAdvance] = useState(false);
  const [filterAdvance, setFilterAdvance] = useState(() => {
    return (takeParamsUrl.sourceIds || takeParamsUrl.employeeIds || takeParamsUrl.callStatuses || takeParamsUrl.customerExtraInfo) &&
      takeUrlFilterAdvance
      ? takeUrlFilterAdvance
      : {
          employeeIds: [],
          sourceIds: [],
          callStatuses: [],
          customerExtraInfo: [],
        };
  });  

  useEffect(() => {
    // if (filterAdvance.employeeIds.length > 0 || filterAdvance.sourceIds.length > 0 || filterAdvance.callStatuses.length > 0) {
    const newParam = { ...params };
    if (filterAdvance.sourceIds?.length === 0) {
      delete newParam.sourceIds;
    }
    if (filterAdvance.employeeIds?.length === 0) {
      delete newParam.employeeIds;
    }
    if (filterAdvance.callStatuses?.length === 0) {
      delete newParam.callStatuses;
    }
    if (
      filterAdvance.customerExtraInfo?.length === 0 &&
      !(
        takeParamsUrl.customerExtraInfo &&
        (takeParamsUrl.Trangthaikhoanvaycashloan ||
          takeParamsUrl.Trangthaikhoanvaycreditline ||
          takeParamsUrl.TrangThaiKhoanVayTBoss ||
          takeParamsUrl.TrangthaiOnboard ||
          takeParamsUrl.LyDo ||
          takeParamsUrl.marketingSendLeadSource)
      )
    ) {
      delete newParam.customerExtraInfo;
    }

    const employeeIds = filterAdvance.employeeIds.map((item) => item.value) || [];
    const sourceIds = filterAdvance.sourceIds.map((item) => item.value) || [];
    const callStatuses = filterAdvance.callStatuses.map((item) => item.value) || [];
    const customerExtraInfo = filterAdvance.customerExtraInfo || [];

    setParams({
      ...newParam,
      ...(employeeIds?.length > 0 ? { employeeIds: JSON.stringify(employeeIds) } : {}),
      ...(sourceIds?.length > 0 ? { sourceIds: JSON.stringify(sourceIds) } : {}),
      ...(callStatuses?.length > 0 ? { callStatuses: JSON.stringify(callStatuses) } : {}),
      ...(customerExtraInfo?.length > 0 ? { customerExtraInfo: JSON.stringify(customerExtraInfo) } : {}),
    });

    localStorage.setItem("filterAdvance", JSON.stringify(filterAdvance));

    // }
  }, [filterAdvance]);

  ///

  const isMounted = useRef(false);

  const [params, setParams] = useState<ICustomerSchedulerFilterRequest>({
    keyword: "",
    contactType,
    ...(checkSubdomainTNEX ? { queryFromTnex: 1 } : {}),
    // branchId: 0
  });   

  const [paramsCustomerPartner, setParamsCustomerPartner] = useState({
    name: "",
    limit: 10,
    page: 1,
    targetBsnId: null,
  });

  useEffect(() => {
    setCityId(takeParamsUrl?.cityId ? takeParamsUrl?.cityId : "");
  }, [params, takeParamsUrl]);

  const getListRelationship = async () => {
    const response = await RelationShipService.list();

    if (response.code === 0) {
      const result = response.result;
      setListRelationship(result?.items);
    }
  };

  useEffect(() => {
    getListRelationship();
  }, []);

  //! đoạn này xử lý vấn đề khi mà biến contactType thay đổi thì update lại setParams
  useEffect(() => {
    if (dataBranch && contactType) {
      // setParams({ ...params, contactType, });
      if (activeTitleHeader === 1) {
        setParams((prevParams) => ({ ...prevParams, contactType: contactType, branchId: dataBranch.value }));
      } else {
        setParamsCustomerPartner((prevParams) => ({ ...prevParams, contactType: contactType }));
      }
    }
  }, [contactType, dataBranch, activeTitleHeader]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: sourceDomain === "hasedu.reborn.vn" ? "Học sinh" : "Khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit, page: 1 }));
    },
  });
  console.log('pagination', pagination);
  

  const [paginationPartner, setPaginationPartner] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: sourceDomain === "hasedu.reborn.vn" ? "Học sinh" : "Khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParamsCustomerPartner((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParamsCustomerPartner((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  //TODO: Đoạn này là vùng sử lý dữ liệu table
  const refColumn = useRef();
  const refColumnContainer = useRef();
  const [widthColumns, setWidthColumns] = useState(() => {
    const storedData = localStorage.getItem("widthColumnCustomer");
    return storedData ? JSON.parse(storedData) : [];
  });

  useEffect(() => {
    if (widthColumns && widthColumns.length > 0) {
      const changeDataWidthColumns = [...widthColumns];

      // Chia nhóm dữ liệu theo giá trị của 'colId'
      const groupedData = changeDataWidthColumns.reduce((groups, item) => {
        const key = item.colId;
        groups[key] = groups[key] || [];
        groups[key].push(item);
        return groups;
      }, {});

      // Lấy ra các đối tượng { width, colId } của phần tử cuối cùng trong từng nhóm
      const uniqueWidths = Object.values(groupedData).map((group?: any) => ({
        width: group[group.length - 1].width,
        colId: group[group.length - 1].colId,
      }));

      localStorage.setItem("widthColumnCustomer", JSON.stringify(uniqueWidths));
    }
  }, [widthColumns]);

  const [isShowColumn, setIsShowColumn] = useState(false);
  useOnClickOutside(refColumn, () => setIsShowColumn(false), ["custom-header"]);

  const HeaderButton = ({
    column,
    api,
    searchField,
    setSearchField,
    isConfirmData,
    setIsConfirmData,
    isShowColumn,
    setIsShowColumn,
    dataConfirm,
    setDataConfirm,
    lstFieldActive,
    lstFieldUnActive,
  }) => {
    return (
      <Fragment>
        <div className="custom-header" ref={refColumnContainer}>
          <button onClick={() => setIsShowColumn((prev) => !prev)}>
            <Tippy content="Thêm cột">
              <span>
                <Icon name="PlusCircleFill" />
              </span>
            </Tippy>
          </button>

          {isShowColumn && (
            <Popover alignment="right" isTriangle={true} className="popover-column-header" refContainer={refColumnContainer} refPopover={refColumn}>
              <div className="box__add--column">
                <span className="select-field">Chọn trường</span>
                <div className="search-column">
                  <Input
                    name="search_field"
                    value={searchField}
                    fill={true}
                    iconPosition="left"
                    icon={<Icon name="Search" />}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchField(value);
                      getLstFieldCustomer(value);
                    }}
                    placeholder="Tìm kiếm tên trường"
                  />
                </div>
                <div className="lst__columns">
                  <div className="lst__columns--show">
                    <div className="summary__qty--column">
                      <span className="title__show--column">Các trường hiển thị trong bảng</span>
                      <span className="qty-total">{`${lstFieldActive.length + defaultFieldTableDis.length}/${
                        lstFieldActive.length + lstFieldUnActive.length + defaultFieldTableDis.length
                      }`}</span>
                    </div>
                    <div className="lst__items lst__items--show">
                      {(lstFieldActive || defaultFieldTableDis) &&
                        (lstFieldActive.length > 0 || defaultFieldTableDis.length > 0) &&
                        [...defaultFieldTableDis, ...lstFieldActive].map((el, idx) => {
                          return (
                            <Checkbox
                              key={idx}
                              value={el.value}
                              label={el.label}
                              disabled={el.hide ? true : false}
                              defaultChecked={el.isTable}
                              onChange={(e) => {
                                const isCheck = e.target.checked;

                                const changeData = {
                                  ...el,
                                  ...(el.type ? { type: el.type } : {}),
                                  isTable: isCheck ? true : false,
                                };

                                if (isCheck) {
                                  setDataConfirm([...dataConfirm, changeData]);
                                } else {
                                  const newData = dataConfirm.filter((ol) => ol.fieldName !== el.fieldName);
                                  setDataConfirm(newData);
                                }
                              }}
                            />
                          );
                        })}
                    </div>
                  </div>
                  <div className="lst__columns--hide">
                    <span className="title__hide--column">Các trường không hiển thị trong bảng</span>

                    <div className="lst__items lst__items--show">
                      {lstFieldUnActive &&
                        lstFieldUnActive.length > 0 &&
                        lstFieldUnActive.map((el, idx) => {
                          return (
                            <Checkbox
                              key={idx}
                              value={el.value}
                              label={el.label}
                              defaultChecked={el.isTable}
                              onChange={(e) => {
                                const isCheck = e.target.checked;

                                const changeData = {
                                  ...el,
                                  isTable: isCheck ? true : false,
                                };

                                if (isCheck) {
                                  setDataConfirm([...dataConfirm, changeData]);
                                } else {
                                  const newData = dataConfirm.filter((ol) => ol.fieldName !== el.fieldName);
                                  setDataConfirm(newData);
                                }
                              }}
                            />
                          );
                        })}
                    </div>
                  </div>
                </div>
                <div className="action__confirm">
                  <Button variant="outline" onClick={() => setIsShowColumn(false)}>
                    Đóng
                  </Button>
                  <Button
                    disabled={_.isEqual(dataConfirm, lstFieldActive)}
                    onClick={() => {
                      setIsShowColumn(false);
                      setIsConfirmData(!isConfirmData);
                    }}
                  >
                    Xác nhận
                  </Button>
                </div>
              </div>
            </Popover>
          )}
        </div>
      </Fragment>
    );
  };

  const isBeauty = localStorage.getItem("isBeauty");

  const ActionRenderer = (props) => {
    let data = props.data;
    let params = props.params;

    return (
      <div className="lst__action--cell">
        <div
          className="item__action add__view"
          onClick={() => {
            setDataCustomer(data.dataItem);
            setShowModalAddViewer(true);
          }}
        >
          <Tippy content="Thêm người xem">
            <span className="icon__item icon__user--add">
              <Icon name="UserAdd" />
            </span>
          </Tippy>
        </div>

        <div className="item__action create__sales" onClick={() => navigate(`/create_sale_add?customerId=${data.id}`)}>
          <Tippy content="Thêm hóa đơn">
            <span className="icon__item icon__create--sales">
              <Icon name="PlusCircle" />
            </span>
          </Tippy>
        </div>

        <div
          className="item__action view__invoice"
          onClick={() => {
            localStorage.setItem("backUpUrlCustomer", JSON.stringify(params));
            navigate(`/detail_person/customerId/${data.id}/purchase_invoice`);
          }}
        >
          <Tippy content="Hóa đơn đã mua">
            <span className="icon__item icon-invoice">
              <Icon name="Bill" />
            </span>
          </Tippy>
        </div>

        {isBeauty && isBeauty == "1" && (
          <div
            className="item__action view__contract"
            onClick={() => {
              setIdCustomer(data.id);
              setShowModalAddScheduler(true);
            }}
          >
            <Tippy content="Thêm mới yêu cầu thực hiện dịch vụ">
              <span className="icon__item icon-invoice">
                <Icon name="Calendar" />
              </span>
            </Tippy>
          </div>
        )}

        {permissions["CUSTOMER_UPDATE"] == 1 && (
          <div
            className="item__action update"
            onClick={() => {
              localStorage.setItem("customer.custType", data.dataItem?.custType?.toString());
              setDataCustomer(data.dataItem);

              if (data.dataItem?.custType == 0) {
                setShowModalAdd(true);
              } else {
                setShowModalCompanyAdd(true);
              }
            }}
          >
            <Tippy content="Sửa">
              <span className="icon__item icon__update">
                <Icon name="Pencil" />
              </span>
            </Tippy>
          </div>
        )}

        {permissions["CUSTOMER_DELETE"] == 1 && (
          <div className="item__action delete" onClick={() => handleCheckCustomerDelete(data.dataItem, params, "one")}>
            <Tippy content="Xóa">
              <span className="icon__item icon__delete">
                <Icon name="Trash" />
              </span>
            </Tippy>
          </div>
        )}
      </div>
    );
  };

  const LinkToAction = ({ data }) => {
    return (
      <Link
        key={data.id}
        to={`/detail_person/customerId/${data.id}/not_purchase_invoice`}
        onClick={() => {
          // localStorage.setItem("backUpUrlCustomer", JSON.stringify(params));
        }}
        className="detail-person"
      >
        {data.name}
      </Link>
    );
  };

  const PhoneToAction = (props) => {
    let data = props.data;

    let isShowPhone = props.isShowPhone;
    let valueShowPhone = props.valueShowPhone;
    let idCustomer = props.idCustomer;

    return (
      <div className="has__phone">
        <span className="view-phone">{isShowPhone && data.id == idCustomer && valueShowPhone ? valueShowPhone : data.phoneMasked}</span>
        {data.phoneMasked && !data.phoneUnmasked ? (
          <span className="isEye" onClick={(e) => handClickEye(e, data, data.index, idCustomer)}>
            <Icon name={isShowPhone && data.id == idCustomer && valueShowPhone ? "EyeSlash" : "Eye"} />
          </span>
        ) : null}

        {checkSubdomainTNEX ? (
          <Tippy content="Copy">
            <span className="isEye" onClick={(e) => handleCopy(valueShowPhone ? valueShowPhone : data.phoneUnmasked || data.phoneMasked)}>
              <Icon name={"Copy"} style={{ width: 18, height: 18 }} />
            </span>
          </Tippy>
        ) : null}
      </div>
    );
  };

  const handleCopy = async (content) => {
    const textToCopy = content;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  const SocialToAction = ({ data }) => {
    return data.profileLink ? (
      <Link to={data.profileLink} target="_blank">
        Đi tới
      </Link>
    ) : (
      ""
    );
  };

  const DeptToAction = ({ data }) => {
    return data.dataItem.debt ? (
      <Tippy key={data.id} content="Click vào để thu hồi công nợ">
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            setIdCustomer(data.id);
            setShowModalDebt(true);
          }}
        >
          {formatCurrency(+data.dataItem.debt)}
        </span>
      </Tippy>
    ) : (
      formatCurrency("0")
    );
  };

  const TelesaleCall = (props) => {
    let data = props.data;
    const index = props.index;
    const dataTelesaleCall = data?.teleSaleCall[index];

    return (
      <div>
        <div>
          <span style={{ fontSize: 14, fontWeight: "600" }}>{dataTelesaleCall?.callStatus}</span>
        </div>
        {dataTelesaleCall?.callTime ? (
          <div>
            <span style={{ fontSize: 14, fontWeight: "400" }}>
              Ngày cập nhật:{" "}
              <span style={{ fontWeight: "600" }}>
                {dataTelesaleCall?.callTime ? moment(dataTelesaleCall?.callTime).format("DD/MM/YYYY HH:mm") : ""}
              </span>
            </span>
          </div>
        ) : null}
      </div>
    );
  };

  const [createBTwoB, setCreateBTwoB] = useState<boolean>(false);

  const [typeCampain, setTypeCampain] = useState({ type: "" });

  const takeChangeDataCustomer = (lstData) => {
    if (!lstData && lstData.length === 0) return;

    let type = "";

    if (lstData.every((item) => item.custType === 1)) {
      type = "biz";
    } else if (lstData.every((item) => item.custType === 0)) {
      type = "per";
    } else {
      type = "all";
    }

    setTypeCampain({ type });
  };

  const handDeleteOpportunity = async (id: number, param) => {
    if (!id) return;

    const response = await CustomerService.deleteOpportunity(id);
    if (response.code === 0) {
      showToast(`Xóa cơ hội thành công`, "success");
      getListCustomer(param, activeTitleHeader);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDeleteOppor = (item, param?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa khách hàng</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa cơ hội chào bán {item.productName ? "sản phẩm" : "dịch vụ"}
          {item ? <strong> {item.productName || item.serviceName}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => handDeleteOpportunity(item.id, param),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [idOpportunity, setIdOpportunity] = useState(null);
  const [viewOpportunityBTwoB, setViewOpportunityBTwoB] = useState({
    isView: false,
    idCustomer: null,
    count: 0,
    special: false,
  });

  const CreateOpporToAction = (props) => {
    let data = props.data;
    let params = props.params;

    // return data.custType === 0 ? (
    return false ? (
      <Tippy content="Tạo cơ hội">
        <span
          key={data.id}
          className="btn__create--oppor"
          onClick={() => {
            setIdCustomer(data.id);
            setTypeCampain({ type: "per" });
            setShowModalAddManagementOpportunity(true);
          }}
        >
          <Icon name="PlusCircleFill" />
        </span>
      </Tippy>
    ) : (
      <div className="wrapper__b--two--b">
        {/* Sau có dữ liệu thì map ở đây */}
        <div className={`lst__b--two--b`}>
          {data.lstOpportunity &&
            data.lstOpportunity.slice(0, 2).map((item, idx) => {
              return (
                <div key={idx} className={`item__b--two--b ${data.lstOpportunity.length >= 3 ? "fade-out" : ""}`}>
                  <div className="__header">
                    <span
                      className="name__pro"
                      onClick={() => {
                        setIdOpportunity(item.id);
                        setCreateBTwoB(true);
                        setIdCustomer(data.id);
                        setPushCampaign(false);
                      }}
                    >
                      {item.productName || item.serviceName || "Chưa xác định..."}
                    </span>
                    <span className="action__pro" onClick={() => showDialogConfirmDeleteOppor(item, params)}>
                      <Icon name="Trash" />
                    </span>
                  </div>
                </div>
              );
            })}

          {/* Hiển thị nút "Xem thêm" nếu có nhiều hơn 3 item */}
          {data.lstOpportunity && data.lstOpportunity.length >= 3 && (
            <div
              className="item__more"
              onClick={() => setViewOpportunityBTwoB({ isView: true, idCustomer: data.id, count: data.lstOpportunity.length, special: false })}
            >
              Xem thêm
            </div>
          )}
        </div>

        <Tippy content="Tạo cơ hội">
          <div
            className="btn__create--oppor"
            onClick={() => {
              setIdOpportunity(null);
              setCreateBTwoB(true);
              setIdCustomer(data.id);
              setDataCustomer(data.dataItem);
              setPushCampaign(false);
            }}
          >
            <Icon name="PlusCircleFill" />
          </div>
        </Tippy>
      </div>
    );
  };

  const defaultValueColumnDefs = [
    {
      field: "checkbox",
      width: 45,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      showDisabledCheckboxes: true,
      resizable: false,
      suppressSizeToFit: true,
      pinned: "left",
    },
    {
      headerName: "STT",
      field: "idx",
      width: 61,
      resizable: false,
      suppressSizeToFit: true,
    },
    { headerName: "Id", field: "id", hide: true },
    { headerName: "dataItem", field: "data", hide: true },
    { headerName: sourceDomain === "hasedu.reborn.vn" ? "Tên học sinh" : "Tên khách hàng", field: "name", cellRenderer: LinkToAction },
    {
      headerName: "Điện thoại",
      headerComponent: StyleHeaderTable,
      width: 135,
      field: "phoneMasked",
      cellRenderer: PhoneToAction,
      cellRendererParams: { isShowPhone, valueShowPhone, idCustomer },
    },

    ...(checkSubdomainTNEX
      ? [
          { headerName: "Nguồn khách hàng", width: 140, field: "sourceName" },
          {
            headerName: "Follow 1",
            headerComponent: StyleHeaderTable,
            field: "teleSaleCall",
            cellRenderer: TelesaleCall,
            cellRendererParams: { index: 0 },
            autoHeight: true,
          },
          {
            headerName: "Follow 2",
            headerComponent: StyleHeaderTable,
            field: "teleSaleCall",
            cellRenderer: TelesaleCall,
            cellRendererParams: { index: 1 },
          },
          {
            headerName: "Follow 3",
            headerComponent: StyleHeaderTable,
            field: "teleSaleCall",
            cellRenderer: TelesaleCall,
            cellRendererParams: { index: 2 },
          },
          { 
            headerName: "Ngày CRM nhận dữ liệu",
            headerComponent: StyleHeaderTable,
            width: 140, 
            field: "syncTime", 
            cellStyle: { display: 'flex', justifyContent: 'center'}
          },
          { 
            headerName: "Ngày nhận phụ trách", 
            headerComponent: StyleHeaderTable,
            width: 140, 
            field: "employeeAssignDate",
            cellStyle: { display: 'flex', justifyContent: 'center'},
          },
          { 
            headerName: "Ngày phân bổ cho Telesale", 
            headerComponent: StyleHeaderTable,
            width: 140, 
            field: "saleAssignDate",
            cellStyle: { display: 'flex', justifyContent: 'center'},
          },
        ]
      : []),

    // { headerName: "Facebook", width: 130, field: "profileLink", cellRenderer: SocialToAction },
    // { headerName: "Ngày mua cuối", width: 140, field: "lastBoughtDate" },
    // { headerName: "Tổng doanh số", width: 140, field: "fee", type: "rightAligned" },
    // { headerName: "Tổng doanh thu", width: 145, field: "paid", type: "rightAligned" },
    // { headerName: "Công nợ", width: 100, field: "debt", type: "rightAligned", cellRenderer: DeptToAction },
    {
      headerName: "Tạo cơ hội",
      headerComponent: StyleHeaderTable,
      field: "createOpportunities",
      width: 220,
      cellRenderer: CreateOpporToAction,
      cellRendererParams: { params },
      autoHeight: true,
    },
    {
      headerName: "Hành động",
      headerComponent: StyleHeaderTable,
      width: isBeauty && isBeauty == "1" ? 185 : 155,
      field: "action",
      cellRendererParams: { params },
      cellRenderer: ActionRenderer,
    },
    {
      headerName: "",
      field: "addColumn",
      width: 70,
      resizable: false,
      suppressSizeToFit: true,
      headerComponent: HeaderButton,
      headerComponentParams: { isShowColumn, setIsShowColumn },
    },
  ];

  let defaultValueColumnDefsPartner = [
    {
      field: "checkbox",
      width: 45,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      showDisabledCheckboxes: true,
      resizable: false,
      suppressSizeToFit: true,
      pinned: "left",
    },
    {
      headerName: "STT",
      field: "idx",
      width: 61,
      resizable: false,
      suppressSizeToFit: true,
    },
    { headerName: "Id", field: "id", hide: true },
    { headerName: "dataItem", field: "data", hide: true },
    { headerName: sourceDomain === "hasedu.reborn.vn" ? "Tên học sinh" : "Tên khách hàng", field: "name", cellRenderer: LinkToAction },
    {
      headerName: "Điện thoại",
      width: 135,
      field: "phoneMasked",
      cellRenderer: PhoneToAction,
      cellRendererParams: { isShowPhone, valueShowPhone, idCustomer },
    },
    { headerName: "Facebook", width: 130, field: "profileLink", cellRenderer: SocialToAction },
    { headerName: "Ngày mua cuối", width: 140, field: "lastBoughtDate" },
    { headerName: "Tổng doanh số", width: 140, field: "fee", type: "rightAligned" },
    { headerName: "Tổng doanh thu", width: 145, field: "paid", type: "rightAligned" },
    { headerName: "Công nợ", width: 100, field: "debt", type: "rightAligned", cellRenderer: DeptToAction },
  ];

  const [columnDefs, setColumnDefs] = useState<any>(defaultValueColumnDefs);

  useEffect(() => {
    if (activeTitleHeader === 1) {
      setColumnDefs(defaultValueColumnDefs);
    }
    if (activeTitleHeader === 3) {
      setColumnDefs(defaultValueColumnDefsPartner);
    }
  }, [activeTitleHeader]);

  const defaultFieldCustomer = [
    { id: 1, name: "Mã khách hàng", fieldName: "code", isTable: false },

    { value: 9, name: "Ngày mua cuối", fieldName: "lastBoughtDate", isTable: false },
    { value: 10, name: "Tổng doanh số", fieldName: "fee", isTable: false },
    { value: 11, name: "Tổng doanh thu", fieldName: "pavalue", isTable: false },
    { value: 12, name: "Công nợ", fieldName: "debt", isTable: false },

    { id: 3, name: "Giới tính", fieldName: "gender", isTable: false },
    { id: 4, name: "Ngày sinh", fieldName: "birthday", isTable: false },
    { id: 5, name: "Địa chỉ", fieldName: "address", isTable: false },
    { id: 6, name: "Email", fieldName: "emailMasked", isTable: false },
    { id: 14, name: "Chiều cao", fieldName: "height", isTable: false, type: "rightAligned" },
    { id: 15, name: "Cân nặng", fieldName: "weight", isTable: false, type: "rightAligned" },
    { id: 8, name: "Facebook", fieldName: "profileLink", isTable: false },
    { id: 16, name: "Người tạo", fieldName: "creatorId", isTable: false },
    { id: 17, name: "Đối tượng khách hàng", fieldName: "cardId", isTable: false },
    { id: 18, name: "Nhóm khách hàng", fieldName: "cgpId", isTable: false },
    { id: 19, name: "Chi nhánh", fieldName: "branchId", isTable: false },
    { id: 20, name: "Nhân viên", fieldName: "employeeName", isTable: false },
  ] as any[];

  const defaultFieldTableDis = [
    { value: 2, label: "Tên khách hàng", fieldName: "name", isTable: true, hide: true },
    { value: 7, label: "Điện thoại", fieldName: "phoneMasked", isTable: true, hide: true },
    // { value: 8, label: "Facebook", fieldName: "profileLink", isTable: true, hide: true },
    // { value: 9, label: "Ngày mua cuối", fieldName: "lastBoughtDate", isTable: true, hide: true },
    // { value: 10, label: "Tổng doanh số", fieldName: "fee", isTable: true, hide: true },
    // { value: 11, label: "Tổng doanh thu", fieldName: "pavalue", isTable: true, hide: true },
    // { value: 12, label: "Công nợ", fieldName: "debt", isTable: true, hide: true },
    { value: 13, label: "Tạo cơ hội", fieldName: "createOpportunities", isTable: true, hide: true },
  ];

  const [lstFieldCustomer, setLstFieldCustomer] = useState(defaultFieldCustomer);
  const [lstFieldActive, setLstFieldActive] = useState(() => {
    const storedData = localStorage.getItem("fieldActiveCustomer");
    return storedData ? JSON.parse(storedData) : [];
  });
  const [lstFieldUnActive, setLstFieldUnActive] = useState([]);

  const [dataConfirm, setDataConfirm] = useState([]);
  const [isConfirmData, setIsConfirmData] = useState<boolean>(false);

  const takeFieldActiveContact = JSON.parse(localStorage.getItem("fieldActiveCustomer"));

  useEffect(() => {
    if (lstFieldActive) {
      setDataConfirm([...dataConfirm, ...lstFieldActive]);
    }
  }, []);

  useEffect(() => {
    if (isConfirmData) {
      const changeLstFieldUnActive = lstFieldCustomer
        .filter((item) => {
          return !dataConfirm.some((el) => el.fieldName === item.fieldName);
        })
        .map((ol) => {
          return {
            value: ol.id,
            label: ol.name,
            fieldName: ol.fieldName,
            isTable: ol.isTable,
            type: ol.type ? ol.type : ol.datatype,
          };
        });

      if (dataConfirm && dataConfirm.length > 0) {
        const changeDataConfirm: any = dataConfirm.map((el) => {
          return {
            headerName: el.label,
            field: el.fieldName,
            type: el.type === "number" ? "rightAligned" : el.type ? el.type : "",
          };
        });

        let elementsToKeep = defaultValueColumnDefs.slice(-3);
        elementsToKeep.unshift(changeDataConfirm);

        let newDataTable = defaultValueColumnDefs.slice(0, -3).concat(elementsToKeep.flat());

        localStorage.setItem("fieldActiveCustomer", JSON.stringify(dataConfirm));

        setColumnDefs(newDataTable);
        setLstFieldActive(dataConfirm);
      } else {
        localStorage.setItem("fieldActiveCustomer", JSON.stringify([]));

        setLstFieldActive([]);
        setColumnDefs(defaultValueColumnDefs);
      }

      setLstFieldUnActive(changeLstFieldUnActive);
    }
  }, [isConfirmData, dataConfirm]);

  const [lstCustomerExtraInfo, setLstCustomerExtraInfo] = useState([]);

  const takeColumnCustomer = JSON.parse(localStorage.getItem("widthColumnCustomer"));

  useEffect(() => {
    if (takeColumnCustomer) {
      const changeDataColumnDefs = columnDefs.map((item) => {
        const matchingColumn = takeColumnCustomer.find((el) => item.field === el.colId);

        if (matchingColumn) {
          return {
            ...item,
            width: matchingColumn.width,
          };
        }

        return item;
      });

      setColumnDefs(changeDataColumnDefs);
    }
  }, [lstCustomerExtraInfo]);

  useEffect(() => {
    if (isShowColumn) {
      setIsConfirmData(false);
    }
  }, [isShowColumn]);

  const [searchField, setSearchField] = useState("");

  const getLstFieldCustomer = async (name?: string) => {
    const params = {
      name: name || "",
      limit: 100,
    };

    const response = await CustomerService.filterTable(params);

    if (response.code === 0) {
      const result = response.result.items;
      setLstFieldCustomer([...lstFieldCustomer, ...result]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    getLstFieldCustomer();
  }, []);

  const [rowData, setRowData] = useState([]);
  const [rowMapping, setRowMapping] = useState([]);

  const handleGetOpportunity = async (customerId) => {
    const param = {
      customerId: customerId,
    };

    const response = await CustomerService.lstOpportunity(param);

    if (response.code === 0) {
      const result = response.result.items;
      return result;
    } else {
      // showToast("Danh sách cơ hội đang bị lỗi", "error");
      return [];
    }
  };

  useEffect(() => {
    if (listCustomer && listCustomer.length >= 0) {
      const fetchData = async () => {
        const changeDataCustomer = await Promise.all(
          listCustomer.map(async (item, index) => {
            const result =
              (await Promise.all(
                rowMapping
                  .filter((el) => el.customerId === item.id)
                  .map(async (item) => {
                    const key = Object.keys(item).find((key) => key !== "customerId");
                    const value = item[key];
                    return {
                      [key]: item.type == "number" ? formatCurrency(+value) : value,
                    };
                  })
              )) || [];

            const body = Object.assign(
              {
                idx: getPageOffset(params) + index + 1,
                ...item,
                id: item.id,
                dataItem: item,
                name: item.name,
                phoneMasked: item.phoneUnmasked || item.phoneMasked,
                profileLink: item.profileLink ? "Đi tới" : "",
                lastBoughtDate: item.lastBoughtDate ? moment(item.lastBoughtDate).format("DD/MM/YYYY") : "",
                fee: formatCurrency(+item.fee || "0"),
                paid: formatCurrency(+item.paid || "0"),
                debt: item.debt ? "Tạo" : formatCurrency(+item.debt || "0"),
                createOpportunities: "Tạo",
                gender: item.gender === 1 ? "Nữ" : "Nam",
                birthday: item.birthday ? moment(item.birthday).format("DD/MM/YYYY") : "",
                lstOpportunities: item.custType ? await handleGetOpportunity(item.id) : null,
                // dùng cho TNEX
                sourceName: item.sourceName,
                teleSaleCall: item.telesaleCall, /// trạng thái cuộc gọi - dùng cho TNEX,
                syncTime: item.syncTime ? moment(item.syncTime).format("DD/MM/YYYY HH:mm") : "", // ngày CRM nhận dữ liệu - dùng cho TNEX
                employeeAssignDate: item.employeeAssignDate ? moment(item.employeeAssignDate).format("DD/MM/YYYY HH:m") : "", // Ngày nhận phụ trách - dùng cho TNEX
                saleAssignDate: item.saleAssignDate ? moment(item.saleAssignDate).format("DD/MM/YYYY HH:mm") : "", // ngày phân bổ dữ liệu cho Telesale - dùng cho TNEX
              },
              ...result
            );

            return body;
          })
        );

        setRowData(changeDataCustomer);
      };

      fetchData();
    }
  }, [listCustomer, rowMapping, params]);

  useEffect(() => {
    if (lstCustomerExtraInfo && lstCustomerExtraInfo.length > 0 && lstFieldCustomer && lstFieldCustomer.length > 0) {
      const resultArray = [];

      for (const item1 of lstCustomerExtraInfo) {
        for (const item2 of lstFieldCustomer) {
          if (item1.attributeId === item2.id) {
            // Lấy tất cả các thuộc tính của item2
            const keys = Object.keys(item2);

            // Lặp qua các thuộc tính của item2 và kiểm tra có 'fieldName' không
            keys.forEach((key) => {
              if (key === "fieldName") {
                // Thêm đối tượng mới với key và value động
                const dynamicKey = item2[key];
                const dynamicValue = item1.attributeValue;
                const customerId = item1.customerId;

                const dynamicObject = {
                  [dynamicKey]: dynamicValue,
                  type: item1.datatype,
                  customerId: customerId,
                };

                resultArray.push(dynamicObject);
              }
            });

            break;
          }
        }
      }

      setRowMapping(resultArray);
    }
  }, [lstCustomerExtraInfo, lstFieldCustomer]);

  useEffect(() => {
    setColumnDefs((prevColumnDefs) => {
      const newColumnDefs = [...prevColumnDefs];
      // Tìm index của cột cần cập nhật trong mảng columnDefs
      const addColumnIndex = newColumnDefs.findIndex((col) => col.field === "addColumn");
      // Nếu tìm thấy cột, cập nhật giá trị isShowColumn trong headerComponentParams
      if (addColumnIndex !== -1) {
        newColumnDefs[addColumnIndex].headerComponentParams = {
          searchField,
          setSearchField,
          isShowColumn,
          setIsShowColumn,
          isConfirmData,
          setIsConfirmData,
          dataConfirm,
          setDataConfirm,
          lstFieldActive,
          lstFieldUnActive,
        };
      }
      return newColumnDefs;
    });
  }, [isShowColumn, lstFieldActive, lstFieldUnActive, isConfirmData, dataConfirm, searchField]);

  useEffect(() => {
    setColumnDefs((prevColumnDefs) => {
      const newColumnDefs = [...prevColumnDefs];

      const addColumnActionIndex = newColumnDefs.findIndex((col) => col.field === "action");
      const addColumnCreateOpportunitiesIndex = newColumnDefs.findIndex((col) => col.field === "createOpportunities");

      if (addColumnActionIndex !== -1) {
        newColumnDefs[addColumnActionIndex].cellRendererParams = {
          params,
        };
      }

      if (addColumnCreateOpportunitiesIndex !== -1) {
        newColumnDefs[addColumnCreateOpportunitiesIndex].cellRendererParams = {
          params,
        };
      }

      return newColumnDefs;
    });
  }, [params]);

  useEffect(() => {
    setColumnDefs((prevColumnDefs) => {
      const newColumnDefs = [...prevColumnDefs];
      const addColumnPhoneIndex = newColumnDefs.findIndex((col) => col.field === "phoneMasked");

      if (addColumnPhoneIndex !== -1) {
        newColumnDefs[addColumnPhoneIndex].cellRendererParams = {
          isShowPhone,
          valueShowPhone,
          idCustomer,
        };
      }
      return newColumnDefs;
    });
  }, [isShowPhone, valueShowPhone, idCustomer]);

  useEffect(() => {
    if (!isLoading && ((lstCustomerExtraInfo && lstCustomerExtraInfo.length > 0) || (lstFieldCustomer && lstFieldCustomer.length > 0))) {
      const result = lstFieldCustomer.map((item1) => {
        const matchingItem = lstCustomerExtraInfo.find((item2) => item2.attributeId === item1.id);

        return {
          value: item1.id,
          label: item1.name,
          fieldName: item1.fieldName,
          customerId: matchingItem?.customerId,
          isTable: false,
        };
      });

      const checkDataLocalStorage = takeFieldActiveContact
        ? result.filter((item) => {
            return !takeFieldActiveContact.some((el) => el.fieldName === item.fieldName);
          })
        : result;

      setLstFieldUnActive(checkDataLocalStorage);
    }
  }, [lstCustomerExtraInfo, lstFieldCustomer, isLoading]);

  useEffect(() => {
    if (takeFieldActiveContact) {
      const changeDataTakeFieldActiveContact: any = takeFieldActiveContact.map((el) => {
        return {
          headerName: el.label,
          field: el.fieldName,
          type: el.type === "number" ? "rightAligned" : el.type ? el.type : "",
        };
      });

      let elementsToKeep = defaultValueColumnDefs.slice(-3);
      elementsToKeep.unshift(changeDataTakeFieldActiveContact);

      let newDataTable = defaultValueColumnDefs.slice(0, -3).concat(elementsToKeep.flat());

      setColumnDefs(newDataTable);
      setLstFieldActive(takeFieldActiveContact);
    }
  }, []);

  const [titleExport, setTitleExport] = useState([]);

  useEffect(() => {
    if (columnDefs) {
      let changeDataColumnDefs = [...columnDefs];

      // Bỏ đi phần tử đầu tiên
      changeDataColumnDefs = changeDataColumnDefs.slice(1);

      // Lọc bỏ đi hai phần tử cuối cùng
      changeDataColumnDefs = changeDataColumnDefs.slice(0, changeDataColumnDefs.length - 2);

      // Lọc bỏ đi các phần tử có thuộc tính "hide" là true
      changeDataColumnDefs = changeDataColumnDefs
        .filter((item) => !item.hide && item.field !== "createOpportunities")
        .map((el) => {
          return {
            field: el.field,
            headerName: el.headerName,
            type: el.type === "number" ? "rightAligned" : el.type ? el.type : "",
          };
        });

      setTitleExport(changeDataColumnDefs);
    }
  }, [columnDefs]);

  const abortController = new AbortController();
  const getListCustomer = async (paramsSearch: ICustomerSchedulerFilterRequest, activeTitleHeader?) => {
    setIsLoading(true);
    // const response = await CustomerService.filter(paramsSearch, abortController.signal);

    let response = null;

    if (activeTitleHeader === 1) {
      response = await CustomerService.filter(paramsSearch, abortController.signal);
    } else {
      if (!paramsSearch.targetBsnId) {
        setListCustomer([]);
        setIsLoading(false);
        setIsNoItem(true);
        return;
      } else {
        response = await CustomerService.listshared(paramsSearch, abortController.signal);
      }
    }

    if (response.code === 0) {
      localStorage.setItem("backUpUrlCustomer", JSON.stringify(params));
      const result = response.result;

      const changeResult = result.items
        .filter((item) => (item.lstCustomerExtraInfo || []).length > 0)
        .map((el) => el.lstCustomerExtraInfo)
        .flat()
        .map((ol) => {
          if (ol.datatype === "date") {
            return { ...ol, attributeValue: moment(ol.attributeValue).format("DD/MM/YYYY") };
          }

          return ol;
        });

      setLstCustomerExtraInfo(changeResult);
      setListCustomer(result.items);

      if (activeTitleHeader === 1) {
        setPagination({
          ...pagination,
          page: +result.page,
          sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
        });
      } else {
        setPaginationPartner({
          ...paginationPartner,
          page: +result.page,
          sizeLimit: paramsCustomerPartner.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(paramsCustomerPartner.limit ?? DataPaginationDefault.sizeLimit)),
        });
      }

      if (+result.total === 0 && !params.keyword && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      if (activeTitleHeader === 1) {
        getListCustomer(params, activeTitleHeader);
      }

      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
    return () => {
      abortController.abort();
    };
  }, [params, activeTitleHeader]);

  const getListPartner = async () => {
    const params = {
      limit: 100,
      status: 1,
      requestCode: "customer",
    };

    const response = await PermissionService.requestPermissionSource(params);

    if (response.code === 0) {
      const result = response.result.items || [];
      const newList = [];
      result.map((item, index) => {
        if (newList.filter((el) => el.targetBsnId === item.targetBsnId).length === 0) {
          newList.push({
            name: item.targetBranchName,
            targetBsnId: item.targetBsnId,
            color: colorData[index],
          });
        }
      });

      setListPartner(newList);
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getListPartner();
  }, []);

  //! Đoạn này tạo ra một mảng phục vụ việc tìm kiếm nhanh
  const dataQuickSearchLeft = [
    {
      title: "Tất cả",
      type: "all",
      contactType: -1,
    },
    {
      title: "Mới cập nhật",
      type: "update",
      contactType: 1,
    },
    {
      title: "Đừng quên",
      type: "not_forget",
      contactType: 2,
    },
  ];

  const titleActions: ITitleActions = {
    actions: [
      ...(activeTitleHeader !== 3
        ? [
            permissions["CUSTOMER_ADD"] == 1 && {
              title: "Thêm mới",
              callback: () => {
                setDataCustomer(null);
                //Lưu cũ là gì để bật popup tương ứng (null, undefined hoặc 0)
                if (checkCustType == "0" || !checkCustType) {
                  //Test trước
                  setShowModalAdd(true);
                } else {
                  //Khách hàng doanh nghiệp
                  setShowModalCompanyAdd(true);
                }
              },
            },
          ]
        : []),
    ],
    actions_extra: [
      permissions["CUSTOMER_IMPORT"] == 1 && {
        title: "Nhập danh sách",
        icon: <Icon name="Upload" />,
        callback: () => {
          setShowModalImport(true);
        },
      },
      permissions["CUSTOMER_EXPORT"] == 1 && {
        title: "Xuất danh sách",
        icon: <Icon name="Download" />,
        callback: () => {
          setOnShowModalExport(true);
        },
      },
    ],
  };


  const [showModalAddViewer, setShowModalAddViewer] = useState<boolean>(false);

  const handClickEye = (e, item, index, idCustomer) => {
    e && e.preventDefault();

    setValueShowPhone("");
    setIdCustomer(item.id);
    setIsShowPhone(true);
    setIdxCustomer(index);
    setDataCustomer(item);

    if (item.id == idCustomer) {
      setIsShowPhone(false);
      setIdCustomer(null);
    }
  };

  const dataMappingArray = (item: ICustomerResponse, index: number, type?: string) => [
    getPageOffset(params) + index + 1,
    ...(type !== "export"
      ? [
          <Link
            key={item.id}
            to={`/detail_person/customerId/${item.id}/not_purchase_invoice`}
            onClick={() => {
              localStorage.setItem("backUpUrlCustomer", JSON.stringify(params));
            }}
            className="detail-person"
          >
            {item.name}
          </Link>,
          <div key={index} className="has__phone">
            <span className="view-phone">{isShowPhone && item.id == idCustomer && valueShowPhone ? valueShowPhone : item.phoneMasked}</span>
            {/* {item.phoneMasked ? (
              <span className="isEye" onClick={(e) => handClickEye(e, item, index)}>
                <Icon name={isShowPhone && item.id == idCustomer && valueShowPhone ? "EyeSlash" : "Eye"} />
              </span>
            ) : null} */}
          </div>,
          item.profileLink ? (
            <Link to={item.profileLink} key={index} target="_blank">
              Đi tới
            </Link>
          ) : (
            ""
          ),
          item.lastBoughtDate ? moment(item.lastBoughtDate).format("DD/MM/YYYY") : "",
          formatCurrency(+item.fee || "0"),
          formatCurrency(+item.paid || "0"),
          item.debt ? (
            <Tippy key={item.id} content="Click vào để thu hồi công nợ">
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setIdCustomer(item.id);
                  setShowModalDebt(true);
                }}
              >
                {formatCurrency(+item.debt)}
              </span>
            </Tippy>
          ) : (
            formatCurrency("0")
          ),
          <span
            key={item.id}
            style={{ color: "var(--primary-color-90)", fontWeight: "500", cursor: "pointer" }}
            onClick={() => {
              setIdCustomer(item.id);
              setShowModalAddManagementOpportunity(true);
            }}
          >
            Tạo
          </span>,
        ]
      : [
          item.name,
          item.phoneMasked,
          item.lastBoughtDate ? moment(item.lastBoughtDate).format("DD/MM/YYYY") : "",
          +item.fee,
          +item.paid,
          +item.debt,
        ]),
  ];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "text-right", "text-right", "text-right", "text-center"];

  const formatExcel = ["center", "top", "center", "center", "right", "right", "right"];

  const actionsTable = (item: ICustomerResponse): IAction[] => {
    return [
      {
        title: "Thêm người xem",
        icon: <Icon name="UserAdd" className="icon-success" />,
        callback: () => {
          setDataCustomer(item);
          setShowModalAddViewer(true);
        },
      },
      {
        title: "Thêm hóa đơn",
        icon: <Icon name="PlusCircle" />,
        callback: () => {
          navigate(`/create_sale_add?customerId=${item.id}`);
        },
      },
      {
        title: "Hóa đơn đã mua",
        icon: <Icon name="Bill" className="icon-invoice" />,
        callback: () => {
          localStorage.setItem("backUpUrlCustomer", JSON.stringify(params));
          navigate(`/detail_person/customerId/${item.id}/purchase_invoice`);
        },
      },
      {
        title: "Thêm mới yêu cầu thực hiện dịch vụ",
        icon: <Icon name="Calendar" />,
        callback: () => {
          setIdCustomer(item.id);
          setShowModalAddScheduler(true);
        },
      },
      permissions["CUSTOMER_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          //Set lại kiểu khách hàng
          localStorage.setItem("customer.custType", item?.custType?.toString());
          setDataCustomer(item);

          if (item?.custType == 0) {
            setShowModalAdd(true);
          } else {
            setShowModalCompanyAdd(true);
          }
        },
      },
      permissions["CUSTOMER_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number, parma: any) => {
    const response = await CustomerService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa khách hàng thành công`, "success");
      getListCustomer(parma, activeTitleHeader);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalCompanyAdd, setShowModalCompanyAdd] = useState<boolean>(false);
  const [dataCustomer, setDataCustomer] = useState<ICustomerResponse>(null);

  const [titleProps, setTitleProps] = useState<string>("");
  const [showModalAddScheduler, setShowModalAddScheduler] = useState<boolean>(false);
  const [showModalUpdateCommon, setShowModalUpdateCommon] = useState<boolean>(false);
  const [isActiveCustomerGroup, setIsActiveCustomerGroup] = useState<boolean>(false);
  const [isActiveCustomeRelationship, setIsActiveCustomeRelationship] = useState<boolean>(false);
  const [isActiveCustomerSource, setIsActiveCustomerSource] = useState<boolean>(false);
  const [isActiveCustomerEmployee, setIsActiveCustomerEmployee] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const handleCheckCustomerDelete = async (item?: any, params?: any, type?: "one" | "all") => {
    const body = {
      customerIds: type === "one" ? [item.id] : listIdChecked,
    };

    const response = await CustomerService.checkInProcess(body);

    if (response.code === 0) {
      const result = response.result;

      if (result.alert) {
        type === "one" ? showDialogConfirmDelete(item, params, result) : showDialogConfirmDelete(null, null, result);
      } else {
        type === "one" ? showDialogConfirmDelete(item, params) : showDialogConfirmDelete();
      }
    } else {
      showToast("Kiểm tra khách hàng đang trong chiến dịch, hợp đồng đang lỗi!", "error");
    }
  };

  const onDeleteAllCustomer = async () => {
    const body = {
      customerIds: listIdChecked,
      ignoreCheck: true,
    };

    const response = await CustomerService.deleteAll(body);

    if (response.code === 0) {
      showToast("Xóa khách hàng thành công", "success");
      getListCustomer(params, activeTitleHeader);
      setListIdChecked([]);
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICustomerResponse, param?: any, dataCheckDeleteCustomer?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa khách hàng</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa{" "}
          {item ? (
            <span>
              khách hàng <strong>{item.name}</strong>
            </span>
          ) : (
            <span>
              <strong>{listIdChecked.length}</strong> khách hàng đã chọn
              {dataCheckDeleteCustomer && listIdChecked.length > 1 && (
                <Fragment>
                  , trong đó{" "}
                  {dataCheckDeleteCustomer.inCampaigns?.length > 0 ? (
                    <Fragment>
                      <strong>{dataCheckDeleteCustomer.inCampaigns.length}</strong> khách hàng có chiến dịch bán hàng
                    </Fragment>
                  ) : (
                    ""
                  )}
                  {dataCheckDeleteCustomer.inContract?.length > 0 ? (
                    <Fragment>
                      <strong>, {dataCheckDeleteCustomer.inContract.length}</strong> khách hàng có hợp đồng
                    </Fragment>
                  ) : (
                    ""
                  )}
                </Fragment>
              )}
              {dataCheckDeleteCustomer && listIdChecked.length === 1 && (
                <Fragment>
                  , khách hàng đang có{" "}
                  {dataCheckDeleteCustomer.inCampaigns.length > 0 && dataCheckDeleteCustomer.inContract?.length <= 0 ? (
                    <Fragment>
                      <strong>{dataCheckDeleteCustomer.inCampaigns.length}</strong> chiến dịch bán hàng
                    </Fragment>
                  ) : dataCheckDeleteCustomer.inContract?.length > 0 && dataCheckDeleteCustomer.inCampaigns.length <= 0 ? (
                    <Fragment>
                      <strong>{dataCheckDeleteCustomer.inContract.length}</strong> khách hàng có hợp đồng
                    </Fragment>
                  ) : (
                    <Fragment>
                      <strong>{dataCheckDeleteCustomer.inCampaigns.length}</strong> chiến dịch bán hàng và khách hàng có{" "}
                      <strong>{dataCheckDeleteCustomer.inContract.length}</strong> hợp đồng
                    </Fragment>
                  )}
                </Fragment>
              )}
            </span>
          )}
          {item && dataCheckDeleteCustomer ? (
            <span>
              <strong>{item.name}</strong>, khách hàng đang có{" "}
              {dataCheckDeleteCustomer.inCampaigns.length > 0 && dataCheckDeleteCustomer.inContract?.length <= 0 ? (
                <Fragment>
                  <strong>{dataCheckDeleteCustomer.inCampaigns.length}</strong> chiến dịch bán hàng
                </Fragment>
              ) : dataCheckDeleteCustomer.inContract?.length > 0 && dataCheckDeleteCustomer.inCampaigns.length <= 0 ? (
                <Fragment>
                  <strong>{dataCheckDeleteCustomer.inContract.length}</strong> khách hàng có hợp đồng
                </Fragment>
              ) : (
                <Fragment>
                  <strong>{dataCheckDeleteCustomer.inCampaigns.length}</strong> chiến dịch bán hàng và khách hàng có{" "}
                  <strong>{dataCheckDeleteCustomer.inContract.length}</strong> hợp đồng
                </Fragment>
              )}
            </span>
          ) : (
            ""
          )}
          ? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (listIdChecked.length > 0) {
          onDeleteAllCustomer();
        } else {
          onDelete(item.id, param);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const reloadData = async (listIdCustomer) => {
    const body = {
      lstId: listIdCustomer
    };

    const response = await CustomerService.reloadData(body);

    if (response.code === 0) {
      setIsLoading(true);
      setTimeout(() => {
        showToast("Chạy lại dữ liệu thành công", "success");
        getListCustomer(params, activeTitleHeader);
        setListIdChecked([]);
      }, 2000)
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  }

  const [showModalOther, setShowModalOther] = useState<boolean>(false);

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Đổi người phụ trách khách hàng",
      callback: () => {
        setShowModalUpdateCommon(true);
        setIsActiveCustomerEmployee(true);
        setTitleProps("Cập nhật người phụ trách khách hàng");
        setIsActiveCustomeRelationship(false);
        setIsActiveCustomerGroup(false);
        setIsActiveCustomerSource(false);
      },
    },
    {
      title: "Đổi nguồn khách hàng",
      callback: () => {
        setShowModalUpdateCommon(true);
        setIsActiveCustomerSource(true);
        setTitleProps("Cập nhật nguồn khách hàng");
        setIsActiveCustomerGroup(false);
        setIsActiveCustomeRelationship(false);
        setIsActiveCustomerEmployee(false);
      },
    },
    {
      title: "Đổi nhóm khách hàng",
      callback: () => {
        setShowModalUpdateCommon(true);
        setIsActiveCustomerGroup(true);
        setTitleProps("Cập nhật nhóm khách hàng");
        setIsActiveCustomerSource(false);
        setIsActiveCustomeRelationship(false);
        setIsActiveCustomerEmployee(false);
      },
    },
    {
      title: "Đổi mối quan hệ",
      callback: () => {
        setShowModalUpdateCommon(true);
        setIsActiveCustomeRelationship(true);
        setTitleProps("Cập nhật mối quan hệ khách hàng");
        setIsActiveCustomerGroup(false);
        setIsActiveCustomerSource(false);
        setIsActiveCustomerEmployee(false);
      },
    },

    {
      title: "Chọn nhân viên xem khách hàng",
      callback: () => {
        setShowModalOther(true);
      },
    },
    {
      title: "Thêm vào chiến dịch bán hàng",
      callback: () => {
        if (typeCampain && typeCampain.type != "all") {
          setIsBatch(true);
          setShowModalAddManagementOpportunity(true);
        } else {
          showToast("Bạn cần chọn cụ thể, tạo cơ hội cho khách hàng cá nhân hay khách hàng doanh nghiệp !", "warning");
        }
      },
    },
    {
      title: "Thêm vào Marketing Automation ",
      callback: () => {
        setShowModalAddMA(true);
        // if (typeCampain && typeCampain.type != "all") {
        //   setIsBatch(true);
        //   setShowModalAddManagementOpportunity(true);
        // } else {
        //   showToast("Bạn cần chọn cụ thể, tạo cơ hội cho khách hàng cá nhân hay khách hàng doanh nghiệp !", "warning");
        // }
      },
    },
    {
      title: "Gửi Email",
      callback: () => {
        setShowPageSendEmail(true);
      },
    },
    {
      title: "Gửi SMS",
      callback: () => {
        setShowPageSendSMS(true);
      },
    },
    {
      title: "Chạy lại dữ liệu",
      callback: () => {
        reloadData(listIdChecked);
      },
    },
    permissions["CUSTOMER_DELETE"] == 1 && {
      title: "Xóa khách hàng",
      callback: () => handleCheckCustomerDelete(),
    },
  ];

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);

  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả khách hàng ",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} khách hàng phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, params]
  );

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await CustomerService.filter({
        ...params,
        // page: type === "current_page" ? 1 : params.page,
        page: type === "current_page" ? params.page || 1 : 1,
        limit: type === "all" || type === "current_search" ? pagination.totalItem : params.limit,
      });

      if (response.code === 0) {
        const result = response.result;

        // if (extension === "excel") {
        //   ExportExcel({
        //     fileName: "KhachHang",
        //     title: "Khách hàng",
        //     header: titles("export"),
        //     formatExcel: formatExcel,
        //     data: result.map((item, idx) => dataMappingArray(item, idx, "export")),
        //     info: { name },
        //   });
        // }

        const changeResult = result.items
          .filter((item) => (item.lstCustomerExtraInfo || []).length > 0)
          .map((el) => el.lstCustomerExtraInfo)
          .flat()
          .map((ol) => {
            if (ol.datatype === "date") {
              return { ...ol, attributeValue: moment(ol.attributeValue).format("DD/MM/YYYY") };
            }

            return ol;
          });

        const resultArray = [];

        for (const item1 of changeResult) {
          for (const item2 of lstFieldCustomer) {
            if (item1.attributeId === item2.id) {
              // Lấy tất cả các thuộc tính của item2
              const keys = Object.keys(item2);

              // Lặp qua các thuộc tính của item2 và kiểm tra có 'fieldName' không
              keys.forEach((key) => {
                if (key === "fieldName") {
                  // Thêm đối tượng mới với key và value động
                  const dynamicKey = item2[key];
                  const dynamicValue = item1.attributeValue;
                  const customerId = item1.customerId;

                  const dynamicObject = {
                    [dynamicKey]: dynamicValue,
                    customerId: customerId,
                  };

                  resultArray.push(dynamicObject);
                }
              });

              break;
            }
          }
        }

        const dataExport: any = result.items.map((item, index) => {
          const result = rowMapping.filter((el) => el.customerId === item.id) || [];

          const changeDataResult = result.map((item) => {
            const key = Object.keys(item).find((key) => key !== "customerId");
            const value = item[key];
            return {
              [key]: value,
            };
          });

          const body = Object.assign(
            {
              idx: getPageOffset(params) + index + 1,
              ...item,
              name: item.name,
              phoneMasked: item.phoneMasked,
              profileLink: item.profileLink ? "Đi tới" : "",
              lastBoughtDate: item.lastBoughtDate ? moment(item.lastBoughtDate).format("DD/MM/YYYY") : "",
              fee: +item.fee || 0,
              paid: +item.paid || 0,
              debt: item.debt || 0,
              gender: item.gender === 1 ? "Nữ" : "Nam",
              birthday: item.birthday ? moment(item.birthday).format("DD/MM/YYYY") : "",
            },
            ...changeDataResult
          );

          return body;
        });

        let newDataCustomer = null;
        if (checkSubdomainTNEX) {
          const listCustomerId = dataExport.map((item) => {
            return item.id;
          });
          const response = await CustomerService.viewFullPhone({ id: JSON.stringify(listCustomerId) });
          if (response.code == 0) {
            const result = response.result;
            newDataCustomer = result;
          } else {
            showToast(response.message, "error");
          }
        }

        const compareArrays = (arr1, arr2) => {
          const result = [];

          for (const item2 of arr2) {
            const matchedItem = [];

            for (const field of titleExport) {
              const fieldName = field.field;

              if (item2.hasOwnProperty(fieldName)) {
                matchedItem.push(item2[fieldName]);
              } else {
                matchedItem.push(null); // Hoặc giá trị mặc định nếu không có giá trị
              }
            }

            result.push(matchedItem);
          }

          return result;
        };

        const dataMappingArray = compareArrays(titleExport, checkSubdomainTNEX ? newDataCustomer : dataExport);

        if (extension === "excel") {
          ExportExcel({
            fileName: "KhachHang",
            title: "Khách hàng",
            header: titleExport.map((item) => item.headerName), // titles("export")
            formatExcel: formatExcel,
            data: dataMappingArray,
            info: { name },
          });
        }
        showToast("Xuất file thành công", "success");
        setOnShowModalExport(false);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
        setOnShowModalExport(false);
      }
    },
    [params, titleExport]
  );

  const handlClickOptionRelationship = (e, id) => {
    setIdRelationship(id);
    if (activeTitleHeader === 1) {
      setParams({ ...params, relationshipId: id });
    } else {
      setParamsCustomerPartner((prevParams) => ({ ...prevParams, relationshipId: id }));
    }

    if (id == idRelationship) {
      setIdRelationship(0);
      if (activeTitleHeader === 1) {
        setParams({ ...params, relationshipId: 0 });
      } else {
        setParamsCustomerPartner((prevParams) => ({ ...prevParams, relationshipId: 0 }));
      }
    }
  };

  const handShowPhone = async (id: number) => {
    const response = await CustomerService.viewPhone(id);
    if (response.code == 0) {
      const result = response.result;
      setValueShowPhone(result);
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem số điện thoại !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  useEffect(() => {
    if (isShowPhone && idCustomer) {
      handShowPhone(idCustomer);
    }
  }, [isShowPhone, idCustomer]);

  useEffect(() => {
    if (dataCustomer && valueShowPhone && idCustomer) {
      setListCustomer((prevState) => {
        const newArray = [...prevState];

        newArray[idxCustomer] = { ...newArray[idxCustomer], phoneMasked: dataCustomer?.phoneMasked };

        return newArray;
      });
    }

    if (!isShowPhone && dataCustomer) {
      setListCustomer((prevState) => {
        const newArray = [...prevState];

        newArray[idxCustomer] = { ...newArray[idxCustomer], phoneMasked: dataCustomer?.phoneMasked };

        return newArray;
      });
    }
  }, [valueShowPhone, idxCustomer, idCustomer, dataCustomer, isShowPhone]);

  const lstTitleHeader = [
    {
      name: sourceDomain === "hasedu.reborn.vn" ? "Danh sách học sinh" : "Danh sách khách hàng",
      type: 1,
    },
    {
      name: "Danh sách khách hàng của đối tác",
      type: 3,
    },
    {
      name: "Thống kê khách hàng",
      type: 5,
    },
    // {
    //   name: "Thống kê khách hàng",
    //   type: 4,
    // },
    {
      name: sourceDomain === "hasedu.reborn.vn" ? "Phân tích nguồn học sinh" : "Phân tích nguồn khách hàng",
      type: 2,
    },
  ];

  const [pushCampaign, setPushCampaign] = useState<boolean>(false);

  const handlClickPartner = (e, value) => {
    setTargetBsnId(value);
  };

  useEffect(() => {
    if (listPartner && listPartner.length > 0) {
      setParamsCustomerPartner({ ...paramsCustomerPartner, targetBsnId: targetBsnId ? targetBsnId : listPartner[0].targetBsnId });

      if (!targetBsnId) {
        setTargetBsnId(listPartner[0].targetBsnId);
      }
    }
  }, [targetBsnId, listPartner]);

  useEffect(() => {
    if (activeTitleHeader === 3) {
      getListCustomer(paramsCustomerPartner, activeTitleHeader);
    }
  }, [paramsCustomerPartner, activeTitleHeader]);

  const statusFieldsTnex = [
    {
      key: "Trangthaikhoanvaycashloan",
      label: "Trạng thái khoản vay Cashloan",
    },
    {
      key: "Trangthaikhoanvaycreditline",
      label: "Trạng thái khoản vay Creditline",
    },
    {
      key: "TrangThaiKhoanVayTBoss",
      label: "Trạng thái khoản vay T-Boss",
    },
  ];

  return (
    <Fragment>
      <div
        className={`page-content page-customer${isNoItem ? " bg-white" : ""}${showPageSendSMS ? " d-none" : ""}${showPageSendEmail ? " d-none" : ""}`}
      >
        <TitleAction title={sourceDomain === "hasedu.reborn.vn" ? "Học sinh" : "Khách hàng"} titleActions={titleActions} />
        <div className="card-box d-flex flex-column">
          <div className="quick__search">
            <ul className="quick__search--left">
              {dataQuickSearchLeft.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className={`${item.contactType == contactType ? "active" : ""}`}
                    onClick={(e) => {
                      e && e.preventDefault();
                      setContactType(item.contactType);
                    }}
                  >
                    {item.title}
                  </li>
                );
              })}
            </ul>
            <div className="quick__search--right">
              {width < 1440 && width > 768 && listRelationship?.length > 6 ? (
                <Swiper
                  onInit={(core: SwiperCore) => {
                    swiperRelationshipRef.current = core.el;
                  }}
                  className="relationship-slider"
                  grid={{
                    rows: 1,
                  }}
                  navigation={true}
                  modules={[Grid, Navigation]}
                  slidesPerView={6}
                  spaceBetween={8}
                >
                  {listRelationship?.map((item, idx) => {
                    return (
                      <SwiperSlide key={idx} className="list__relationship--slide">
                        <div
                          className={`item-relationship ${item.id == idRelationship ? "active__item-block" : ""}`}
                          style={{ backgroundColor: item.color, color: item.colorText }}
                          onClick={(e) => {
                            e && e.preventDefault();
                            handlClickOptionRelationship(e, item.id);
                          }}
                        >
                          {item.name}
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              ) : (
                <div className="list__relationship">
                  {listRelationship?.map((item, idx) => {
                    return (
                      <div
                        key={idx}
                        className={`relationship-item ${item.id == idRelationship ? "active__relationship--item" : ""}`}
                        style={{ backgroundColor: item.color, color: item.colorText }}
                        onClick={(e) => {
                          e && e.preventDefault();
                          handlClickOptionRelationship(e, item.id);
                        }}
                      >
                        {item.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="search__box--customer">
            <ul className="line__height--customer">
              {lstTitleHeader.map((item, idx) => {
                return listPartner && listPartner.length > 0 ? (
                  <li
                    key={idx}
                    className={`item-title ${activeTitleHeader === item.type ? "active__item--title" : ""}`}
                    onClick={() => setActiveTitleHeader(item.type)}
                  >
                    {item.name}
                  </li>
                ) : item.type === 1 || item.type === 2 || item.type === 5 ? (
                  <li
                    key={idx}
                    className={`item-title ${activeTitleHeader === item.type ? "active__item--title" : ""}`}
                    onClick={() => setActiveTitleHeader(item.type)}
                  >
                    {item.name}
                  </li>
                ) : null;
              })}
            </ul>

            {activeTitleHeader === 3 && listPartner && listPartner.length > 0 ? (
              <div className="list-partner">
                <div className="list__relationship">
                  {listPartner.map((item, idx) => {
                    return item.name ? (
                      <div
                        key={idx}
                        className={`relationship-item ${item.targetBsnId == targetBsnId ? "active__relationship--item" : ""}`}
                        style={{ backgroundColor: item.color, color: item.colorText }}
                        onClick={(e) => {
                          e && e.preventDefault();
                          handlClickPartner(e, item.targetBsnId);
                        }}
                      >
                        {item.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ) : null}

            {(activeTitleHeader == 1 || activeTitleHeader == 3 || activeTitleHeader == 4) && (
              <div className="desc__search">
                <div style={{ flex: 1 }}>
                  <SearchBox
                    name="Khách hàng"
                    placeholderSearch="Theo Tên/ĐT/Email/Mã KH/Mã ST"
                    params={activeTitleHeader === 1 ? params : paramsCustomerPartner}
                    isFilter={true}
                    isSaveSearch={false}
                    listSaveSearch={listSaveSearch}
                    listFilterItem={checkSubdomainTNEX ? customerFilterListTNEX : customerFilterList}
                    updateParams={(paramsNew) => {
                      console.log('paramsNew', paramsNew);
                      
                      if (activeTitleHeader === 1) {
                        // setParams(paramsNew);
                        if (checkSubdomainTNEX) {
                          // Hàm tiện ích kiểm tra field tồn tại
                          const hasField = (key) => Object.prototype.hasOwnProperty.call(paramsNew, key);
                          if (
                            Object.keys(paramsNew).find((el) => el === "Trangthaikhoanvaycashloan") 
                            || Object.keys(paramsNew).find((el) => el === "Trangthaikhoanvaycreditline") 
                            || Object.keys(paramsNew).find((el) => el === "TrangThaiKhoanVayTBoss") 
                            || Object.keys(paramsNew).find((el) => el === "TrangthaiOnboard") 
                            || Object.keys(paramsNew).find((el) => el === "LyDo") 
                            || Object.keys(paramsNew).find((el) => el === "marketingSendLeadSource") 
                            

                            //Trường ngày
                            || Object.keys(paramsNew).find((el) => el === "cashLoanApproveStartDate") 
                            || Object.keys(paramsNew).find((el) => el === "cashLoanApproveEndDate")
                            || Object.keys(paramsNew).find((el) => el === "sotienpheduyetcashloan")
                          ) {

                            let customerExtraInfoParamsNew = paramsNew?.customerExtraInfo && JSON.parse(paramsNew?.customerExtraInfo) || []                            
                            
                            let customerExtraInfo = [];

                            // 🔹 Các field kiểu text (Có datatype/operator)
                            const listStringFields = [
                              "Trangthaikhoanvaycashloan",
                              "Trangthaikhoanvaycreditline",
                              "TrangThaiKhoanVayTBoss"
                            ];

                            listStringFields.forEach((field) => {
                              if (hasField(field)) {
                                customerExtraInfoParamsNew = customerExtraInfoParamsNew.filter(
                                  (el) => el.fieldName !== field
                                );
                                customerExtraInfo.push({
                                  fieldName: field,
                                  attributeValue: paramsNew[field],
                                  datatype: paramsNew[field] === "empty" ? "string" : "list_string",
                                  operator: paramsNew[field] === "empty" ? "eq" : "in"
                                });
                                delete paramsNew[field];
                              }
                            });

                            // 🔹 Các field kiểu text (không có datatype/operator)
                            ["TrangthaiOnboard", "LyDo", "marketingSendLeadSource"].forEach((field) => {
                              if (hasField(field)) {
                                customerExtraInfo.push({
                                  fieldName: field,
                                  attributeValue: paramsNew[field]
                                });
                              }
                            });

                            // 🔹 Field số tiền phê duyệt
                            if (hasField("sotienpheduyetcashloan")) {
                              customerExtraInfoParamsNew = customerExtraInfoParamsNew.filter((el) => el.fieldName !== "sotienpheduyetcashloan");

                              customerExtraInfo.push({
                                fieldName: "sotienpheduyetcashloan",
                                attributeValueNumber: paramsNew["sotienpheduyetcashloan"],
                                datatype: "number",
                                operator: "gte"
                              });
                            }


                            // 🔹 Hàm xử lý các field ngày (dùng chung cho cashloan, creditline, TBoss)
                            const handleDateRange = (startKey, endKey, fieldName) => {
                              if (hasField(startKey)) {
                                customerExtraInfoParamsNew = customerExtraInfoParamsNew.filter(
                                  (el) => el.fieldName !== fieldName
                                );

                                customerExtraInfo.push({
                                  fieldName,
                                  attributeValueDate: paramsNew[startKey],
                                  datatype: "date",
                                  operator: "gte"
                                });
                              } else {
                                // Nếu không có startKey thì cũng xoá field cũ (nếu có)
                                customerExtraInfoParamsNew = customerExtraInfoParamsNew.filter(
                                  (el) => el.fieldName !== fieldName
                                );
                              }

                              if (hasField(endKey)) {
                                customerExtraInfo.push({
                                  fieldName,
                                  attributeValueDate: addDays(paramsNew[endKey], 1),
                                  datatype: "date",
                                  operator: "lt"
                                });
                              }
                            };


                            // Gọi xử lý các nhóm ngày
                            handleDateRange("cashLoanApproveStartDate", "cashLoanApproveEndDate", "ngaypheduyetcashloan");
                            handleDateRange("creditLineApproveStartDate", "creditLineApproveEndDate", "ngaypheduyetcreditline");
                            handleDateRange("tBossApproveStartDate", "tBossApproveEndDate", "NgayPheDuyetTBoss");

                            setParams({
                              ...paramsNew,
                              customerExtraInfo: JSON.stringify([...customerExtraInfoParamsNew, ...customerExtraInfo])
                            });

                          } else if (filterAdvance.customerExtraInfo.length > 0 && takeUrlFilterAdvance) {
                            setParams(paramsNew);
                          } else {
                            delete paramsNew.customerExtraInfo;
                            setParams(paramsNew);
                          }
                        } else {
                          setParams(paramsNew);
                        }
                      } else {
                        setParamsCustomerPartner(paramsNew);
                      }
                    }}
                  />
                </div>
                {checkSubdomainTNEX ? (
                  <div className="form-group-filter">
                    <Tippy content={"Lọc nâng cao"}>
                      <div
                        className="button-filter-advance"
                        onClick={() => {
                          setIsModalFilterAdvance(true);
                        }}
                      >
                        <Icon name="Filter" />
                      </div>
                    </Tippy>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {checkSubdomainTNEX ? (
            <div>
              {filterAdvance?.sourceIds?.length > 0 ||
              filterAdvance?.employeeIds?.length > 0 ||
              filterAdvance?.callStatuses?.length > 0 ||
              params?.customerExtraInfo?.length > 0 ? (
                <div className="filter_advance">
                  {filterAdvance.sourceIds.length > 0 ? (
                    <div className="item_advance">
                      <div className="advance_text">
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 400 }}>
                            <span style={{ fontWeight: 500 }}>Nguồn khách hàng:</span>{" "}
                            <span style={{ fontSize: 14, fontWeight: 400 }}>
                              {filterAdvance.sourceIds.map((item, index) => (
                                <span key={index}>
                                  {item.label}, {` `}
                                </span>
                              ))}
                            </span>
                          </span>
                        </div>
                        {/* <div>
                          <span style={{fontSize: 14, fontWeight: 400}}>{filterAdvance.sourceIds.map((item, index) => (<span key={index}>{item.label}, {` `}</span>))}</span>
                        </div> */}
                      </div>
                      <div
                        className="advance_close"
                        onClick={() => {
                          setFilterAdvance({
                            ...filterAdvance,
                            sourceIds: [],
                          });
                        }}
                      >
                        <Icon name="Times" />
                      </div>
                    </div>
                  ) : null}

                  {filterAdvance.employeeIds.length > 0 ? (
                    <div className="item_advance">
                      <div className="advance_text">
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 400 }}>
                            <span style={{ fontWeight: 500 }}>Người phụ trách:</span>{" "}
                            <span style={{ fontSize: 14, fontWeight: 400 }}>
                              {filterAdvance.employeeIds.map((item, index) => (
                                <span key={index}>
                                  {item.label}, {` `}
                                </span>
                              ))}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div
                        className="advance_close"
                        onClick={() => {
                          setFilterAdvance({
                            ...filterAdvance,
                            employeeIds: [],
                          });
                        }}
                      >
                        <Icon name="Times" />
                      </div>
                    </div>
                  ) : null}

                  {filterAdvance.callStatuses.length > 0 ? (
                    <div className="item_advance">
                      <div className="advance_text">
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 400 }}>
                            <span style={{ fontWeight: 500 }}>Trạng thái cuộc gọi:</span>{" "}
                            <span style={{ fontSize: 14, fontWeight: 400 }}>
                              {filterAdvance.callStatuses.map((item, index) => (
                                <span key={index}>
                                  {item.label}, {` `}
                                </span>
                              ))}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div
                        className="advance_close"
                        onClick={() => {
                          setFilterAdvance({
                            ...filterAdvance,
                            callStatuses: [],
                          });
                        }}
                      >
                        <Icon name="Times" />
                      </div>
                    </div>
                  ) : null}

                  {statusFieldsTnex.map(({ key, label }) => {
                    const field = params?.customerExtraInfo && JSON.parse(params?.customerExtraInfo) && JSON.parse(params?.customerExtraInfo).find((el) => el.fieldName === key);
                    if (!field) return null;

                    const values = field.attributeValue?.split("::") || [];
                    return (
                      <div key={key} className="item_advance">
                        <div className="advance_text">
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 400 }}>
                              <span style={{ fontWeight: 500 }}>{label}:</span>{" "}
                              <span style={{ fontSize: 14, fontWeight: 400 }}>
                                {values.map((item, index) => (
                                  <span key={index}>
                                    {item === "empty" ? "Chưa có trạng thái" : item}
                                    {index < values.length - 1 ? ", " : ""}
                                  </span>
                                ))}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div
                          className="advance_close"
                          onClick={() => {
                            // const newFilter = params.customerExtraInfo.filter((el) => el.fieldName !== key);
                            // setFilterAdvance({
                            //   ...filterAdvance,
                            //   customerExtraInfo: newFilter,
                            // });
                            const newFilter = JSON.parse(params?.customerExtraInfo)?.filter((el) => el.fieldName !== key);
                            setParams({
                              ...params,
                              customerExtraInfo: JSON.stringify(newFilter),
                            });
                          }}
                        >
                          <Icon name="Times" />
                        </div>
                      </div>
                    );
                  })}
                  
                </div>
              ) : null}
            </div>
          ) : null}

          {checkSubdomainTNEX ? (
            <div className="header-table-tnex" >
              <div style={{ fontSize: 14, fontWeight: "400" }}>
                Hiển thị kết quả từ {pagination?.page > 1 ? (pagination?.page - 1) * pagination?.sizeLimit + 1 : 1} -{" "}
                {isNaN(
                  pagination?.page * pagination?.sizeLimit < pagination?.totalItem ? pagination?.page * pagination?.sizeLimit : pagination?.totalItem
                )
                  ? 1
                  : pagination?.page * pagination?.sizeLimit < pagination?.totalItem
                  ? pagination?.page * pagination?.sizeLimit
                  : pagination?.totalItem}{" "}
                trên tổng
                {` ${isNaN(pagination?.totalItem) ? 1 : pagination?.totalItem}`}
              </div>

              <div 
                className="button-split-data"
                onClick={() => {
                  if(listIdChecked && listIdChecked.length > 0){
                    setIsModalSplitData(true);
                  } else {
                    showToast("Vui lòng chọn dữ liệu khách hàng", "warning");
                  }
                  
                }}
              >
                <span style={{fontSize: 14, fontWeight: '500'}}>Chia dữ liệu</span>
              </div>
            </div>
          ) : null}

          {activeTitleHeader === 1 || activeTitleHeader === 3 ? (
            !isLoading && listCustomer && listCustomer.length > 0 ? (
              <BoxTableAdvanced
                name="Khách hàng"
                columnDefs={columnDefs}
                rowData={rowData}
                dragColumnDefs={false}
                isPagination={true}
                dataPagination={activeTitleHeader === 1 ? pagination : paginationPartner}
                isBulkAction={true}
                bulkActionItems={bulkActionList}
                listIdChecked={activeTitleHeader === 1 ? listIdChecked : null}
                widthColumns={widthColumns}
                setWidthColumns={(data) => setWidthColumns(data)}
                setListIdChecked={(listId, lstData) => {
                  takeChangeDataCustomer(lstData);
                  setListIdChecked(listId);
                }}
              />
            ) : isLoading ? (
              <Loading />
            ) : (
              <Fragment>
                {isNoItem ? (
                  <SystemNotification
                    description={
                      <span>
                        Hiện tại chưa có khách hàng nào. <br />
                        {activeTitleHeader === 1 ? `Hãy thêm mới khách hàng đầu tiên nhé!` : ""}
                      </span>
                    }
                    type="no-item"
                    titleButton={activeTitleHeader === 1 ? "Thêm mới khách hàng" : ""}
                    action={() => {
                      if (activeTitleHeader === 1) {
                        setDataCustomer(null);
                        //Lưu cũ là gì để bật popup tương ứng (null, undefined hoặc 0)
                        if (checkCustType == "0" || !checkCustType) {
                          //Test trước
                          setShowModalAdd(true);
                        } else {
                          //Khách hàng doanh nghiệp
                          setShowModalCompanyAdd(true);
                        }
                      }
                    }}
                  />
                ) : (
                  <SystemNotification
                    description={
                      <span>
                        Không có dữ liệu trùng khớp.
                        <br />
                        Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                      </span>
                    }
                    type="no-result"
                  />
                )}
              </Fragment>
            )
          ) : activeTitleHeader === 5 ? (
            <ReportCustomer />
          ) : (
            <CustomerSourceAnalysis />
          )}
        </div>
        <AddCustomerPersonModal
          onShow={showModalAdd}
          data={dataCustomer}
          onHide={(reload, nextModal) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setShowModalAdd(false);

            //Nếu true thì bật cái kia
            if (nextModal) {
              setShowModalCompanyAdd(true);
            }
          }}
          zaloUserId={dataCustomer?.zaloUserId}
        />

        {/* Khách hàng doanh nghiệp */}
        <AddCustomerCompanyModal
          onShow={showModalCompanyAdd}
          data={dataCustomer}
          onHide={(reload, nextModal) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setShowModalCompanyAdd(false);

            if (nextModal) {
              setShowModalAdd(true);
            }
          }}
        />

        <AddTreamentHistoryModal
          onShow={showModalAddScheduler}
          idCustomer={idCustomer}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setShowModalAddScheduler(false);
          }}
        />
        <UpdateCommon
          onShow={showModalUpdateCommon}
          listId={listIdChecked}
          titleProps={titleProps}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
              setListIdChecked([]);
            }
            setShowModalUpdateCommon(false);
          }}
          isActiveCustomerGroup={isActiveCustomerGroup}
          isActiveCustomerSource={isActiveCustomerSource}
          isActiveCustomerEmployee={isActiveCustomerEmployee}
          isActiveCustomeRelationship={isActiveCustomeRelationship}
        />
        <AddManagementOpportunityModal
          onShow={showModalAddManagementOpportunity}
          idCustomer={idCustomer}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }

            setShowModalAddManagementOpportunity(false);
          }}
          isBatch={isBatch}
          listId={listIdChecked}
          conditionCampain={typeCampain}
        />

        {/* <ModalAddMA onShow={showModalAddMA} idCustomer={idCustomer} onHide={() => setShowModalAddMA(false)} /> */}

        <ViewOpportunityBTwoB
          totalOpportunity={viewOpportunityBTwoB.count}
          onShow={viewOpportunityBTwoB.isView}
          idCustomer={viewOpportunityBTwoB.idCustomer}
          special={viewOpportunityBTwoB.special}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }

            setViewOpportunityBTwoB({ idCustomer: null, isView: false, count: 0, special: false });
          }}
          handlePushCampaign={(action, idOpportunity, idCustomer) => {
            if (action) {
              setViewOpportunityBTwoB({ idCustomer: null, isView: false, count: 0, special: false });
              setCreateBTwoB(true);
              setPushCampaign(true);
              setIdOpportunity(idOpportunity);
              setIdCustomer(idCustomer);
            }
          }}
        />
        <RecoverPublicDebts
          onShow={showModalDebt}
          idCustomer={idCustomer}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setShowModalDebt(false);
          }}
        />
        <AddBTwoBModal
          onShow={createBTwoB}
          idCustomer={idCustomer}
          dataCustomer={dataCustomer}
          idOpportunity={idOpportunity}
          special={pushCampaign}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setCreateBTwoB(false);
          }}
          onBackup={(idCustomer, reload) => {
            const takeCountOpportunity = rowData.find((item) => item.id === idCustomer).lstOpportunities.length;
            setCreateBTwoB(false);
            setViewOpportunityBTwoB({ idCustomer: idCustomer, isView: true, count: takeCountOpportunity, special: reload });
          }}
        />
        <ModalExportCustomer
          name="Khách hàng"
          params={params}
          onShow={onShowModalExport}
          onHide={() => setOnShowModalExport(false)}
          options={optionsExport}
          total={pagination.totalItem}
          callback={(type, extension) => exportCallback(type, extension)}
        />
        <ImportModal
          name="Nhập danh sách khách hàng"
          onShow={showModalImport}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setShowModalImport(false);
          }}
          type="customer"
        />
        <AddModalOther
          onShow={showModalOther}
          data={listIdChecked}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
              setListIdChecked([]);
            }
            setShowModalOther(false);
          }}
        />
        <AddMaModal
          onShow={showModalAddMA}
          data={listIdChecked}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
              setListIdChecked([]);
            }
            setShowModalAddMA(false);
          }}
        />
        <AddCustomerViewerModal onShow={showModalAddViewer} dataCustomer={dataCustomer} onHide={() => setShowModalAddViewer(false)} />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
      <div className={`${showPageSendSMS ? "" : "d-none"}`}>
        <AddEditSendSMS
          type="customer"
          onShow={showPageSendSMS}
          listIdCustomerProps={listIdChecked}
          paramCustomerProps={params}
          onHide={() => {
            setListIdChecked([]);
            getListCustomer(params, activeTitleHeader);
            setShowPageSendSMS(false);
          }}
        />
      </div>
      <div className={`${showPageSendEmail ? "" : "d-none"}`}>
        <AddEditSendEmail
          type="customer"
          onShow={showPageSendEmail}
          listIdCustomerProps={listIdChecked}
          paramCustomerProps={params}
          onHide={() => {
            setListIdChecked([]);
            getListCustomer(params, activeTitleHeader);
            setShowPageSendEmail(false);
          }}
        />
      </div>

      <FilterAdvanceModal
        onShow={isModalFilterAdvance}
        takeParamsUrl={takeParamsUrl}
        takeUrlFilterAdvance={takeUrlFilterAdvance}
        filterAdvance={filterAdvance}
        params={params}
        setFilterAdvance={setFilterAdvance}
        onHide={() => {
          setIsModalFilterAdvance(false);
        }}
      />

      <SplitDataCustomerModal
        onShow={isModalSplitData}
        paramsCustomerList={params}
        pagination={pagination}
        listIdChecked={listIdChecked}
        onHide={(reload) => {
          if (reload) {
            getListCustomer(params, activeTitleHeader);
            setListIdChecked([]);
          }
          setIsModalSplitData(false);
        }}
      />
    </Fragment>
  );
}

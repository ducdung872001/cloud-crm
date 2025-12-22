import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Slider from "rc-slider";
import { formatCurrency, getSearchParameters, isDifferenceObj } from "reborn-util";
import Input from "components/input/input";
import { getPermissions, showToast } from "utils/common";
import SelectCustom from "components/selectCustom/selectCustom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import ImageThirdGender from "assets/images/third-gender.png";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { ContextType, UserContext } from "contexts/userContext";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { ICampaignResponseModel } from "model/campaign/CampaignResponseModel";
import CampaignService from "services/CampaignService";
import { ICampaignRequestModel } from "model/campaign/CampaignRequestModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import "./CreateCampaign.scss";
import BeautyBranchService from "services/BeautyBranchService";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import DepartmentService from "services/DepartmentService";
import CampaignApproachService from "services/CampaignApproachService";
import Icon from "components/icon";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import FileUpload from "components/fileUpload/fileUpload";
import { ICampaignApproachFilterRequest, ICampaignApproachRequestModel } from "model/campaignApproach/CampaignApproachRequestModel";
import { IAction, IActionModal } from "model/OtherModel";
import Validate from "utils/validate";
import NummericInput from "components/input/numericInput";
import Radio from "components/radio/radio";
import Button from "components/button/button";
import FilterComponent from "./partials/FilterComponent";
import Tippy from "@tippyjs/react";
import DataSupplySource from "services/DataSupplySource";
import ModalSettingSLA from "./ModalSettingSLA";
import KpiGoalService from "services/KpiGoalService";
import { getPageOffset } from "reborn-util";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import BoxTable from "components/boxTable/boxTable";
import ModalConfigKpiEmployee from "./ModalConfigKpiEmployee/ModalConfigKpiEmployee";
import KpiService from "services/KpiService";
import { async } from "@firebase/util";
import KpiSetupService from "services/KpiSetupService";
import { SystemNotification } from "components/systemNotification/systemNotification";
import ModalSettingActionApproach from "./ModalSettingActionApproach";
import Loading from "components/loading";
import ServiceService from "services/ServiceService";
import ProductService from "services/ProductService";
import ModalConfigContactGoal from "./ModalConfigContactGoal";
import ViolationWarning from "./ViolationWarning";
import MarketingAutomationService from "services/MarketingAutomationService";
import KpiContact from "./KpiContact";
import SettingPineline from "./SettingPipeline/SettingPineline";
import { set } from "lodash";
import BusinessProcessService from "services/BusinessProcessService";

interface IDataApproach {
  id?: number;
  step?: number;
  name?: string;
  activities?: any;
  checkName?: boolean;
}

interface IDataSales {
  employee: {
    value: number;
    label: string;
    avatar: string;
  };
  rank: {
    value: number;
    label: string;
  };
}

export default function CreateCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  const parentCampaign = state?.parentCampaign || null;
  const isParent = state?.isParent || false;

  const refOptionSpecialize = useRef();
  const refContainerSpecialize = useRef();

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //Chia làm 2 bước cấu hình (1 - cài đặt thông tin cơ bản chiến dịch, 2 - Quy trình bán hàng)
  const [setupStep, setSetupStep] = useState<number>(1);
  const [childStepOfStep6, setChildStepOfStep6] = useState(2);
  const [childStepOfStep7, setChildStepOfStep7] = useState(1);

  const [campaignId, setCampaignId] = useState<number>(0);

  const [indexSale, setIndexSale] = useState<number>(null);
  const [listApproach, setListApproach] = useState<IDataApproach[]>([]);

  useEffect(() => {
    if (id) {
      setCampaignId(+id);
      //lấy danh sách các quy trình bán
      loadCampaignApproaches(+id);
    }
  }, [id]);

  const typeCampaign = [
    {
      value: "per",
      label: "Khách hàng cá nhân",
    },
    {
      value: "biz",
      label: "Khách hàng doanh nghiệp",
    },
  ];

  const dataStep = [
    {
      value: 1,
      label: " Cài đặt chiến dịch",
    },
    ...(isParent
      ? []
      : [
          {
            value: 2,
            label: " Cài đặt quy trình",
          },
          {
            value: 8,
            label: " Cài đặt pha",
          },
          {
            value: 6,
            label: " Cài đặt đo lường",
          },
          {
            value: 7,
            label: " Cài đặt điều hành",
          },
        ]),
    // {
    //   value: 3,
    //   label: " Cài đặt tính điểm khách hàng",
    // },
    // {
    //   value: 4,
    //   label: " Cài đặt tính điểm nhân viên",
    // },
    // {
    //   value: 5,
    //   label: " Cài đặt KPI nhân viên",
    // },
  ];

  const childDataOf6 = [
    {
      value: 2,
      label: "Chấm điểm cơ hội",
    },
    {
      value: 1,
      label: "Hiệu suất nhân viên",
    },
  ];

  const childDataOf7 = [
    {
      value: 1,
      label: "Giao điểm tín dụng",
    },
    {
      value: 2,
      label: "Chỉ tiêu tương tác",
    },
    {
      value: 3,
      label: "Cảnh báo vi phạm",
    },
  ];

  const [checkFieldApproach, setCheckFieldApproach] = useState<boolean>(false);

  const listActivity = [
    {
      value: "call",
      label: "Gọi điện",
    },
    {
      value: "sms",
      label: "SMS",
    },
    {
      value: "email",
      label: "Email",
    },
    {
      value: "zalo",
      label: "Zalo",
    },
    {
      value: "schedule",
      label: "Đặt lịch",
    },
    {
      value: "face",
      label: "Gặp trực tiếp",
    },
  ];

  const rankData = [
    {
      label: "Trung bình",
      value: 5,
    },
    {
      label: "Khá",
      value: 6,
    },
    {
      label: "Tốt",
      value: 8,
    },
    {
      label: "Xuất sắc",
      value: 10,
    },
  ];

  const [isOptionRank, setIsOptionRank] = useState<boolean>(false);
  useOnClickOutside(refOptionSpecialize, () => setIsOptionRank(false), ["option__rank"]);

  const [data, setData] = useState(null);

  const handleDetailData = async () => {
    const response = await CampaignService.detail(+id);
    console.log("response detail campaign: ", response);

    if (response.code === 0) {
      const result: any = response.result;
      if (result.sales) {
        const takeSales = JSON.parse(result.sales || "[]");

        if (takeSales?.length > 0) {
          const result = takeSales.map((item) => {
            return {
              employee: {
                value: item.employeeId,
                label: item.employeeName,
                avatar: item.employeeAvatar,
                departmentName: item.departmentName,
                branchName: item.branchName,
              },

              rank: {
                value: item.rank,
                label: item.rank == 5 ? "Trung bình" : item.rank == 6 ? "Khá" : item.rank == 8 ? "Tốt" : "Xuất sắc",
              },
            };
          });

          setListSales(result);
        }
      }

      if (result.employeeId) {
        setDataEmployee({
          value: result.employeeId,
          label: result.employeeName,
          avatar: result.employeeAvatar,
        });
      }
      if (result.processId) {
        setDataProcess({
          value: result.processId,
          label: result.processName,
          code: result.processCode,
        });
      }

      setData({
        id: result.id,
        name: result.name,
        code: result.code,
        type: result.type,
        cover: result.cover,
        startDate: result.startDate,
        endDate: result.endDate,
        position: result.position,
        employeeId: result.employeeId,
        totalRevenue: result.totalRevenue,
        totalCustomer: result.totalCustomer,
        averageConvertRate: result.averageConvertRate,
        divisionMethod: result.divisionMethod,
        sales: result.sales,
        parentId: result.parentId,
        parentName: result.parentName,
        coordinators: result.coordinators,
        services: result.services,
        products: result.products,
        // approach: result.approach,
        status: result.status,

        dataSourceProviderDto: result?.dataSourceProviderDto,
        saleDistributionType: result?.saleDistributionType,
        saleDistributionSetting: result?.saleDistributionSettingResponse,
      });

      ///nguồn cấp dữ liệu
      if (result?.dataSourceProviderDto?.filter((el) => el.type === "filter").length > 0) {
        const dataFilter = result?.dataSourceProviderDto?.filter((el) => el.type === "filter")[0].data;
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

      if (result?.dataSourceProviderDto?.filter((el) => el.type === "ma").length > 0) {
        const dataMA = result?.dataSourceProviderDto?.filter((el) => el.type === "ma")[0].data;
        const newDataFilter = dataMA
          ? JSON.parse(dataMA).map((item) => {
              return {
                value: item.id,
                label: item.name,
              };
            })
          : [];
        setDataSupplySourceFromMA(newDataFilter);
      }

      setDataSourceProvider(result?.dataSourceProviderDto);

      ////chi nhánh/ phòng ban/ nhân viên/ bộ filter
      if (result.saleDistributionType === "basic") {
        const dataBranch = result.saleDistributionSettingResponse[0]?.branch;

        const branches0 = dataBranch?.branches0 || [];
        const branches1 = dataBranch?.branches1 || [];
        const branches2 = dataBranch?.branches2 || [];
        const branches3 = dataBranch?.branches3 || [];
        const branches4 = dataBranch?.branches4 || [];
        const dataBranchList = result.lstBranch;

        let listBranchLevel0 = branches0.map((item) => {
          return { value: item.id, label: item.name };
        });
        let listBranchLevel1 = branches1.map((item) => {
          return { value: item.id, label: item.name };
        });
        let listBranchLevel2 = branches2.map((item) => {
          return { value: item.id, label: item.name };
        });
        let listBranchLevel3 = branches3.map((item) => {
          return { value: item.id, label: item.name };
        });
        let listBranchLevel4 = branches4.map((item) => {
          return { value: item.id, label: item.name };
        });

        // if(branches0?.length > 0){
        //     branches0.map(item => {
        //     const newBranch = dataBranchList.find(el => el.id === item);
        //     if(newBranch){
        //         listBranchLevel0.push({
        //         value: newBranch.id,
        //         label: newBranch.name
        //         });
        //     }

        //     })
        // }

        // if(branches1?.length > 0){
        //     branches1.map(item => {
        //     const newBranch = dataBranchList.find(el => el.id === item);
        //     if(newBranch){
        //         listBranchLevel1.push({
        //         value: newBranch.id,
        //         label: newBranch.name,
        //         parentId: newBranch.parentId
        //         });
        //     }
        //     })
        // }

        // if(branches2?.length > 0){
        //     branches2.map(item => {
        //     const newBranch = dataBranchList.find(el => el.id === item);
        //     if(newBranch){
        //         listBranchLevel2.push({
        //         value: newBranch.id,
        //         label: newBranch.name,
        //         parentId: newBranch.parentId
        //         });
        //     }
        //     })
        // }

        // if(branches3?.length > 0){
        //     branches3.map(item => {
        //     const newBranch = dataBranchList.find(el => el.id === item);
        //     if(newBranch){
        //         listBranchLevel3.push({
        //         value: newBranch.id,
        //         label: newBranch.name,
        //         parentId: newBranch.parentId
        //         });
        //     }
        //     })
        // }

        // if(branches4?.length > 0){
        //     branches4.map(item => {
        //     const newBranch = dataBranchList.find(el => el.id === item);
        //     if(newBranch){
        //         listBranchLevel4.push({
        //         value: newBranch.id,
        //         label: newBranch.name,
        //         parentId: newBranch.parentId
        //         });
        //     }
        //     })
        // }

        setListBranchValue([
          ...(listBranchLevel0.length > 0
            ? [
                {
                  id: "level_0",
                  value: listBranchLevel0,
                },
              ]
            : []),

          ...(listBranchLevel1.length > 0
            ? [
                {
                  id: "level_1",
                  value: listBranchLevel1,
                },
              ]
            : []),

          ...(listBranchLevel2.length > 0
            ? [
                {
                  id: "level_2",
                  value: listBranchLevel2,
                },
              ]
            : []),
          ...(listBranchLevel3.length > 0
            ? [
                {
                  id: "level_3",
                  value: listBranchLevel3,
                },
              ]
            : []),

          ...(listBranchLevel4.length > 0
            ? [
                {
                  id: "level_4",
                  value: listBranchLevel4,
                },
              ]
            : []),
        ]);

        /// Phòng ban
        const lstDepartment = result.saleDistributionSettingResponse[0]?.departments;
        const lstDepartmentId = result.saleDistributionSettingResponse[0]?.departmentIds;

        if (lstDepartment.length > 0) {
          // const newDepartmentId = lstDepartment.map(item => {
          //     return item.id
          // });

          const newDataDepartment = lstDepartment.map((item) => {
            return {
              value: item.id,
              label: item.name,
              branchName: item.branchName,
            };
          });

          setDepartmentId(lstDepartmentId);
          setDataDepartment(newDataDepartment);
        }

        setDataMethod2({
          ...dataMethod2,
          id: result.saleDistributionSettingResponse[0]?.id,
          divisionMethod: result.saleDistributionSettingResponse[0]?.divisionMethod,
          branches0: listBranchLevel0.map((item) => {
            return item.value;
          }),
          branches1: listBranchLevel1.map((item) => {
            return item.value;
          }),
          branches2: listBranchLevel2.map((item) => {
            return item.value;
          }),
          branches3: listBranchLevel3.map((item) => {
            return item.value;
          }),
          branches4: listBranchLevel4.map((item) => {
            return item.value;
          }),
          departmentIds: lstDepartmentId,
          isAllEmployee: result.saleDistributionSettingResponse[0]?.isAllEmployee,
          sales: result.saleDistributionSettingResponse[0]?.sales?.map((item) => {
            return {
              employeeId: item.id,
              rank: item.rank,
            };
          }) || ["33"],
        });
        if (result.saleDistributionSettingResponse[0]?.isAllEmployee === 0) {
          setSelectAllSales(false);

          const resultEmployee = result.saleDistributionSettingResponse[0]?.sales.map((item) => {
            return {
              employee: {
                value: item.id,
                label: item.name,
                avatar: item.avatar,
                departmentName: item.departmentName,
                branchName: item.branchName,
              },

              rank: {
                value: item.rank,
                label: item.rank == 5 ? "Trung bình" : item.rank == 6 ? "Khá" : item.rank == 8 ? "Tốt" : "Xuất sắc",
              },
            };
          });
          setListSales(resultEmployee);
        } else {
          setSelectAllSales(true);
          setListSales([]);
        }
      } else if (result.saleDistributionType === "advance") {
        const saleDistributionSetting = result.saleDistributionSettingResponse || [];
        // const saleDistributionSettingNew = [];
        //Chi nhánh
        const saleDistributionSettingNew = saleDistributionSetting.map((item) => {
          return {
            id: item.id,
            name: item.ruleName,
            divisionMethod: item.divisionMethod,
            logical: item.filter.logical,
            rule: item.filter.rule,
            blockRule: item.filter.blockRule,
            branches0: item.branch?.branches0?.map((el) => {
              return el.id;
            }),
            branches1: item.branch?.branches1?.map((el) => {
              return el.id;
            }),
            branches2: item.branch?.branches2?.map((el) => {
              return el.id;
            }),
            branches3: item.branch?.branches3?.map((el) => {
              return el.id;
            }),
            branches4: item.branch?.branches4?.map((el) => {
              return el.id;
            }),

            listBranchValue: [
              ...(item.branch?.branches0?.length > 0
                ? [
                    {
                      id: "level_0",
                      value: item.branch?.branches0.map((el) => {
                        return {
                          value: el.id,
                          label: el.name,
                        };
                      }),
                    },
                  ]
                : []),

              ...(item.branch?.branches1.length > 0
                ? [
                    {
                      id: "level_1",
                      value: item.branch?.branches1.map((el) => {
                        return {
                          value: el.id,
                          label: el.name,
                        };
                      }),
                    },
                  ]
                : []),

              ...(item.branch?.branches2.length > 0
                ? [
                    {
                      id: "level_2",
                      value: item.branch?.branches2.map((el) => {
                        return {
                          value: el.id,
                          label: el.name,
                        };
                      }),
                    },
                  ]
                : []),

              ...(item.branch?.branches3.length > 0
                ? [
                    {
                      id: "level_3",
                      value: item.branch?.branches3.map((el) => {
                        return {
                          value: el.id,
                          label: el.name,
                        };
                      }),
                    },
                  ]
                : []),
              ...(item.branch?.branches4.length > 0
                ? [
                    {
                      id: "level_4",
                      value: item.branch?.branches4.map((el) => {
                        return {
                          value: el.id,
                          label: el.name,
                        };
                      }),
                    },
                  ]
                : []),
            ],
            departmentIds: item.departmentIds,
            dataDepartment: item.departments?.map((el) => {
              return {
                value: el.id,
                label: el.name,
                branchName: el.branchName,
              };
            }),
            isAllEmployee: item.isAllEmployee,
            sales: item.sales?.map((el) => {
              return {
                employeeId: el.id,
                employeeName: el.name,
                rank: el.rank,
                departmentName: el.departmentName,
                branchName: el.branchName,
              };
            }),
          };
        });

        setListRuleData(saleDistributionSettingNew);
      }

      //người phối hợp
      if (result.lstCoordinator?.length > 0) {
        const newCoordinator = result.lstCoordinator.map((item) => {
          return {
            value: item.id,
            label: item.name,
            avatar: item.avatar,
          };
        });

        setDataCoordinators(newCoordinator);
      }

      //sản phẩm
      if (result.productDetail?.length > 0) {
        const newProduct = result.productDetail.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        setDataProducts(newProduct);
      }

      //dịch vụ
      if (result.serviceDetail?.length > 0) {
        const newService = result.serviceDetail.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        setDataServices(newService);
      }
    }
  };

  useEffect(() => {
    if (id) {
      handleDetailData();
    }
  }, [id]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        code: data?.code ?? "",
        type: data?.type ?? "per",
        cover: data?.cover ?? "",
        status: typeof data?.status != "undefined" ? String(data?.status) : "1",
        startDate: data?.startDate ?? "",
        endDate: data?.endDate ?? "",
        position: data?.position ?? "",
        employeeId: data?.employeeId ?? "",
        coordinators: data?.coordinators || "[]",
        services: data?.services || "[]",
        products: data?.products || "[]",
        totalRevenue: data?.totalRevenue ?? "",
        totalCustomer: data?.totalCustomer ?? "",
        averageConvertRate: data?.averageConvertRate ?? "",
        parentId: data?.parentId ?? parentCampaign?.id ?? 0,
        //   dataSupplySource: data?.dataSupplySource ?? [],

        //   divisionMethod: data?.divisionMethod?.toString() ?? "1",
        //   divisionMethod_2: data?.divisionMethod_2?.toString() ?? "",

        //   sales: data?.sales ?? "[]",
        // approach: data?.approach ?? "[]",
        //   branches0: '[]',
        //   branches1: '[]',
        //   branches2: '[]',
        //   branches3: '[]',
        //   branches4: '[]',
        //   departments: '[]',

        //   lstGroupFilter: [],

        //////
        dataSourceProviderDto: data?.dataSourceProviderDto ?? [],
        saleDistributionType: data?.saleDistributionType ?? "manual",
        saleDistributionSetting: data?.saleDistributionSettingResponse ?? [],
      } as ICampaignRequestModel),
    [data]
  );

  useEffect(() => {
    if (data?.parentId) {
      setDataCampaign({
        value: data?.parentId || "",
        label: data?.parentName || "",
      });
    }
  }, [data]);

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

  const [dataCampaign, setDataCampaign] = useState(null);
  useEffect(() => {
    if (parentCampaign) {
      setDataCampaign({
        value: parentCampaign?.id || "",
        label: parentCampaign?.name || "",
      });
      setFormData({ ...formData, values: { ...formData?.values, parentId: parentCampaign?.id } });
    }
  }, [parentCampaign]);

  const [dataProcess, setDataProcess] = useState(null);
  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionProcess = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await BusinessProcessService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  code: item.code,
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

  // lấy người phụ trách
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const [dataEmployee, setDataEmployee] = useState(null);

  const [dataCoordinators, setDataCoordinators] = useState(null);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await EmployeeService.list(param);

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

  const handleChangeValueStatus = (e) => {
    setFormData({ ...formData, values: { ...formData?.values, status: e.value } });
  };
  const handleChangeValueEmployee = (e) => {
    setCheckFieldEmployee(false);
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };
  //! đoạn này xử lý vấn đề lấy ra danh sách chiến dịch
  const loadedOptionCampaign = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
      // parentId: 0,
      campaignType: 0,
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

  const formatOptionLabelCampaign = ({ label, avatar }) => {
    return (
      <div className="selected--item" style={{ marginBottom: "3px" }}>
        {/* <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div> */}
        {label}
      </div>
    );
  };

  const handleChangeValueCampaign = (e) => {
    setDataCampaign(e);
    setFormData({ ...formData, values: { ...formData?.values, parentId: e.value } });
  };

  const handleChangeValueCoordinators = (e) => {
    setDataCoordinators(e);
    const newCoordinators = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, coordinators: JSON.stringify(newCoordinators) } });
  };

  const handleChangeValueProcess = (e) => {
    setDataProcess(e);
    setFormData({ ...formData, values: { ...formData?.values, processId: e.value, processName: e.label, processCode: e?.code || "" } });
  };

  //Chọn dịch vụ
  const [dataServices, setDataServices] = useState([]);
  //! đoạn này xử lý vấn đề lấy ra danh sách dịch vụ
  const loadedOptionService = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ServiceService.filter(param);

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

  const handleChangeValueServices = (e) => {
    setDataServices(e);
    const newServices = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, services: JSON.stringify(newServices) } });
  };

  //chọn sản phẩm
  const [dataProducts, setDataProducts] = useState([]);

  const loadedOptionProduct = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ProductService.list(param);

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

  const handleChangeValueProducts = (e) => {
    setDataProducts(e);
    const newProducts = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, products: JSON.stringify(newProducts) } });
  };

  // nguồn cấp dữ liệu
  const [dataSourceProvider, setDataSourceProvider] = useState([]);

  useEffect(() => {
    setFormData({ ...formData, values: { ...formData?.values, dataSourceProviderDto: dataSourceProvider } });
  }, [dataSourceProvider]);

  const [dataSupplySourceFromMA, setDataSupplySourceFromMA] = useState([]);

  const loadedOptionDataSupplySourceFromMA = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await MarketingAutomationService.list(param);

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

  const handleChangeDataSupplySourceFromMA = (e) => {
    setDataSupplySourceFromMA(e);
    const ids = e.map((item) => {
      return item.value;
    });

    let newArr = [...dataSourceProvider];
    const index = dataSourceProvider.findIndex((el) => el.type === "ma");
    if (index !== -1) {
      newArr[index] = {
        type: "ma",
        ids: ids,
      };
    }
    setDataSourceProvider(newArr);
  };

  const [dataSupplySourceFromFilter, setDataSupplySourceFromFilter] = useState([]);

  const loadedOptionDataSupplySourceFromFilter = async (search, loadedOptions, { page }) => {
    const param: any = {
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

    const [checkFieldBranch, setcheckFieldBranch] = useState<boolean>(false);


  ///phương pháp thứ 2
  const defaultFormDataMethod2 = {
    id: null,
    name: "",
    divisionMethod: 1,
    logical: "",
    rule: [],
    blockRule: [],

    branches0: [],
    branches1: [],
    branches2: [],
    branches3: [],
    branches4: [],
    departmentIds: [],
    isAllEmployee: 0,
    sales: [],
  };
  const [dataMethod2, setDataMethod2] = useState(defaultFormDataMethod2);

  useEffect(() => {
    if (formData.values.saleDistributionType === "basic") {
      setListRuleData([dataMethod2]);
    }
  }, [dataMethod2, formData.values.saleDistributionType]);

  // lấy chi nhanh
  const [listBranchId, setListBranchId] = useState({
    level0: [],
    level1: [],
    level2: [],
    level3: [],
    level4: [],
  });

  useEffect(() => {
    // setFormData({ ...formData, values: { ...formData?.values,
    //                                     branches0: JSON.stringify(listBranchId.level0),
    //                                     branches1: JSON.stringify(listBranchId.level1),
    //                                     branches2: JSON.stringify(listBranchId.level2),
    //                                     branches3: JSON.stringify(listBranchId.level3),
    //                                     branches4: JSON.stringify(listBranchId.level4),
    //                                     }});
    setDataMethod2({
      ...dataMethod2,
      branches0: listBranchId.level0,
      branches1: listBranchId.level1,
      branches2: listBranchId.level2,
      branches3: listBranchId.level3,
      branches4: listBranchId.level4,
    });
  }, [listBranchId]);

  const [listBranchValue, setListBranchValue] = useState([
    {
      id: "level_0",
      value: [],
    },
  ]);

  const [listBranchDeleted0, setListBranchDelete0] = useState([]);

  const [listBranchDeleted1, setListBranchDelete1] = useState([]);

  const [listBranchDeleted2, setListBranchDelete2] = useState([]);

  const [listBranchDeleted3, setListBranchDelete3] = useState([]);

  useEffect(() => {
    if (listBranchValue && listBranchValue.length > 0) {
      let idArray_0 = [];
      let idArray_1 = [];
      let idArray_2 = [];
      let idArray_3 = [];
      let idArray_4 = [];

      listBranchValue.map((item) => {
        if (item.id === "level_0") {
          idArray_0 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_1") {
          idArray_1 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_2") {
          idArray_2 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_3") {
          idArray_3 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_4") {
          idArray_4 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }

        setListBranchId({
          level0: idArray_0,
          level1: idArray_1,
          level2: idArray_2,
          level3: idArray_3,
          level4: idArray_4,
        });
      });
    }
  }, [listBranchValue]);

  const loadedOptionBranchLevel_0 = async (search, loadedOptions, { page }) => {
    const param: IBeautyBranchFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);
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
  const loadedOptionBranchLevel_1 = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      lstId: listBranchId.level0,
    };
    const response = await BeautyBranchService.childList(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  parentId: item.parentId,
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
  const loadedOptionBranchLevel_2 = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      lstId: listBranchId.level1,
    };
    const response = await BeautyBranchService.childList(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  parentId: item.parentId,
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
  const loadedOptionBranchLevel_3 = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      lstId: listBranchId.level2,
    };
    const response = await BeautyBranchService.childList(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  parentId: item.parentId,
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
  const loadedOptionBranchLevel_4 = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      lstId: listBranchId.level3,
    };
    const response = await BeautyBranchService.childList(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  parentId: item.parentId,
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

  const formatOptionLabelBranch = ({ label, avatar }) => {
    return (
      <div className="selected--item" style={{ marginBottom: "3px" }}>
        {/* <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div> */}
        {label}
      </div>
    );
  };

  //reload lại danh sách option chi nhánh của các cấp
  useEffect(() => {
    // if (dataBranch) {
    //   loadOptionCustomer("", undefined, { page: 1 });
    // }
    if (listBranchId.level0.length > 0) {
      loadedOptionBranchLevel_1("", undefined, { page: 1 });
    }
    if (listBranchId.level1.length > 0) {
      loadedOptionBranchLevel_2("", undefined, { page: 1 });
    }
    if (listBranchId.level2.length > 0) {
      loadedOptionBranchLevel_3("", undefined, { page: 1 });
    }
    if (listBranchId.level3.length > 0) {
      loadedOptionBranchLevel_4("", undefined, { page: 1 });
    }
  }, [listBranchId]);

  const handleChangeValueBranch = (e, ind) => {
    // setValueBranch(e);
    setcheckFieldBranch(false);
    setListBranchValue((current) =>
      current.map((obj, index) => {
        if (index === ind) {
          return { ...obj, value: e };
        }
        return obj;
      })
    );

    //lấy ra branchId bị xoá đi
    const branchIdArray = e.map((item) => {
      return item.value;
    });

    const listBranch = [...listBranchValue];
    const arrayBranch = listBranch[ind];

    if (arrayBranch.value.length > 0) {
      arrayBranch.value.map((item) => {
        if (ind === 0 && !branchIdArray.includes(item.value)) {
          // setListBranchDelete0(item.value);
          setListBranchDelete0((oldArray) => [...oldArray, item.value]);
        }
        if (ind === 1 && !branchIdArray.includes(item.value)) {
          setListBranchDelete1((oldArray) => [...oldArray, item.value]);
        }
        if (ind === 2 && !branchIdArray.includes(item.value)) {
          setListBranchDelete2((oldArray) => [...oldArray, item.value]);
        }
        if (ind === 3 && !branchIdArray.includes(item.value)) {
          setListBranchDelete3((oldArray) => [...oldArray, item.value]);
        }
      });
    }
  };

  //Xoá 1 chi nhánh ở level 0
  useEffect(() => {
    if (listBranchDeleted0 && listBranchDeleted0.length > 0 && listBranchValue.length >= 2) {
      let newlistBranch1 = [...listBranchValue[1].value];

      let newListBranchDeleted1 = [];
      if (listBranchValue[1].value.length > 0) {
        listBranchDeleted0.map((item) => {
          const array = newlistBranch1.filter((el) => el.parentId !== item) || [];
          newlistBranch1 = array;

          const arrayDeleted = listBranchValue[1].value.filter((el) => el.parentId === item) || [];
          if (arrayDeleted.length > 0) {
            arrayDeleted.map((el) => {
              newListBranchDeleted1.push(el.value);
            });
          }
        });
      }

      setListBranchValue((current) =>
        current.map((obj, index) => {
          if (index === 1) {
            return { ...obj, value: newlistBranch1 };
          }
          return obj;
        })
      );
      if (listBranchValue.length > 2) {
        setListBranchDelete1(newListBranchDeleted1);
      }

      setTimeout(() => {
        setListBranchDelete0([]);
      }, 1000);
    }
  }, [listBranchDeleted0]);

  //Xoá 1 chi nhánh ở level 1
  useEffect(() => {
    if (listBranchDeleted1 && listBranchDeleted1.length > 0 && listBranchValue.length >= 3) {
      let newlistBranch2 = [...listBranchValue[2].value];

      let newListBranchDeleted2 = [];
      if (listBranchValue[2].value.length > 0) {
        listBranchDeleted1.map((item) => {
          const array = newlistBranch2.filter((el) => el.parentId !== item) || [];
          newlistBranch2 = array;

          // const array = listBranchValue[2].value.filter(el => el.parentId !== item ) || [];
          // if(array.length > 0){
          //   array.map(el => {
          //     newlistBranch2.push(el);
          //   })
          // }

          const arrayDeleted = listBranchValue[2].value.filter((el) => el.parentId === item) || [];
          if (arrayDeleted.length > 0) {
            arrayDeleted.map((el) => {
              newListBranchDeleted2.push(el.value);
            });
          }
        });
      }

      setListBranchValue((current) =>
        current.map((obj, index) => {
          if (index === 2) {
            return { ...obj, value: newlistBranch2 };
          }
          return obj;
        })
      );
      if (listBranchValue.length > 3) {
        setListBranchDelete2(newListBranchDeleted2);
      }

      setTimeout(() => {
        setListBranchDelete1([]);
      }, 1000);
    }
  }, [listBranchDeleted1]);

  //Xoá 1 chi nhánh ở level 3
  useEffect(() => {
    if (listBranchDeleted2 && listBranchDeleted2.length > 0 && listBranchValue.length >= 4) {
      let newlistBranch3 = [...listBranchValue[3].value];
      let newListBranchDeleted3 = [];
      if (listBranchValue[3].value.length > 0) {
        listBranchDeleted2.map((item) => {
          const array = newlistBranch3.filter((el) => el.parentId !== item) || [];
          newlistBranch3 = array;

          const arrayDeleted = listBranchValue[3].value.filter((el) => el.parentId === item) || [];
          if (arrayDeleted.length > 0) {
            arrayDeleted.map((el) => {
              newListBranchDeleted3.push(el.value);
            });
          }
        });
      }
      setListBranchValue((current) =>
        current.map((obj, index) => {
          if (index === 3) {
            return { ...obj, value: newlistBranch3 };
          }
          return obj;
        })
      );
      if (listBranchValue.length > 4) {
        setListBranchDelete3(newListBranchDeleted3);
      }
      setTimeout(() => {
        setListBranchDelete2([]);
      }, 1000);
    }
  }, [listBranchDeleted2]);

  //Xoá 1 chi nhánh ở level 3
  useEffect(() => {
    if (listBranchDeleted3 && listBranchDeleted3.length > 0 && listBranchValue.length >= 5) {
      let newlistBranch4 = [...listBranchValue[4].value];
      if (listBranchValue[4].value.length > 0) {
        listBranchDeleted3.map((item) => {
          const array = newlistBranch4.filter((el) => el.parentId !== item) || [];
          newlistBranch4 = array;
        });
      }
      setListBranchValue((current) =>
        current.map((obj, index) => {
          if (index === 4) {
            return { ...obj, value: newlistBranch4 };
          }
          return obj;
        })
      );
      setTimeout(() => {
        setListBranchDelete3([]);
      }, 1000);
    }
  }, [listBranchDeleted3]);

  const handleRemoveBranch = (index) => {
    const newArray = [...listBranchValue];
    newArray.splice(index, 1);
    setListBranchValue(newArray);
  };

  // lấy phong ban
  const [dataDepartment, setDataDepartment] = useState([]);
  const [listDepartmentId, setDepartmentId] = useState([]);

  const [listDepartment, setListDeparment] = useState([]);

  useEffect(() => {
    // setFormData({ ...formData, values: { ...formData?.values, departments: JSON.stringify(listDepartmentId) } });
    setDataMethod2({ ...dataMethod2, departmentIds: listDepartmentId });
  }, [listDepartmentId]);

  const loadedOptionDepartment = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      // page: page,
      limit: 1000,
      // branchId: dataBranch.value,
      lstLevel0: listBranchId.level0,
      lstLevel1: listBranchId.level1,
      lstLevel2: listBranchId.level2,
      lstLevel3: listBranchId.level3,
      lstLevel4: listBranchId.level4,
    };

    const response = await DepartmentService.list_branch(param);

    if (response.code === 0) {
      const dataOption = response.result || [];
      let optionDepartment = [];

      if (dataOption.length > 0) {
        optionDepartment = [
          {
            value: -1,
            label: "Tất cả phòng ban",
            branchName: "",
          },
        ];

        dataOption.map((item) => {
          optionDepartment.push({
            value: item.id,
            label: item.name,
            branchName: item.branchName,
          });
        });
      }

      setListDeparment(optionDepartment);
      return {
        options: optionDepartment,
        // options: [
        //   ...(dataOption.length > 0
        //     ? dataOption.map((item) => {
        //       return {
        //         value: item.id,
        //         label: item.name,
        //         branchName: item.branchName
        //       };
        //     })
        //     : []),
        // ],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const formatOptionLabelDepartment = ({ label, branchName }) => {
    return <div style={{ paddingTop: 0.5, paddingBottom: 0.5 }}>{branchName ? `${label} (${branchName})` : `${label}`}</div>;
  };

  useEffect(() => {
    loadedOptionDepartment("", undefined, { page: 1 });
  }, [listBranchId]);

  const handleChangeValueDepartment = (e, listDepartment) => {
    if (e.length > 0) {
      if (e[e.length - 1].value === -1) {
        const arrayDepartment = listDepartment.filter((el) => el.value !== -1) || [];
        if (arrayDepartment.length > 0) {
          const newDeptIdlist = arrayDepartment.map((item) => {
            return item.value;
          });
          setDepartmentId(newDeptIdlist);
        }
        // setDepartmentId([-1])
        setDataDepartment([
          {
            value: -1,
            label: "Tất cả phòng ban",
            branchName: "",
          },
        ]);
      } else {
        const arrayDepartment = e.filter((el) => el.value !== -1);
        const newDeptIdlist = arrayDepartment.map((item) => {
          return item.value;
        });
        setDepartmentId(newDeptIdlist);
        setDataDepartment(arrayDepartment);
      }
    } else {
      setDepartmentId([]);
      setDataDepartment(e);
    }
  };

  // const [listSales, setListSales] = useState<IDataSales[]>([{ employee: null, rank: { label: "Khá", value: 6 } }]);
  const [listSales, setListSales] = useState<IDataSales[]>([]);
  const [allSales, setAllSales] = useState([{ employeeId: -1, rank: -1 }]);
  const [selectAllSales, setSelectAllSales] = useState(false);
  const [checkFieldSales, setCheckFieldSales] = useState<boolean>(false);
  const [lstIdSale, setLstIdSale] = useState([]);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionSales = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      LstId: listDepartmentId,
    };

    const response = await EmployeeService.list_department(param);

    if (response.code === 0) {
      const dataOption = (response.result.items || []).filter((item) => {
        return !lstIdSale.some((el) => el === item.id);
      });

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
  };

  useEffect(() => {
    loadedOptionSales("", undefined, { page: 1 });
  }, [listDepartmentId]);

  const formatOptionLabelSales = ({ label, avatar, departmentName, branchName }) => {
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

  const handleChangeValueSales = (e, idx) => {
    setCheckFieldSales(false);

    setListSales((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, employee: e };
        }
        return obj;
      })
    );
  };

  useEffect(() => {
    if (listSales.length > 0) {
      const result = listSales.map((item) => {
        if (item.employee) {
          return item.employee?.value;
        } else {
          return [];
        }
      });
      setLstIdSale([...result]);
    }
  }, [listSales]);

  //! Xóa đi một người bán
  const handleRemoveSale = (idx) => {
    const result = [...listSales];
    result.splice(idx, 1);
    setListSales(result);
    setLstIdSale(() => {
      return result.map((item) => item.employee?.value);
    });
    setCheckFieldSales(false);
  };

  useEffect(() => {
    if (selectAllSales) {
      //   setFormData({ ...formData, values: { ...formData?.values, sales: JSON.stringify(allSales) } });
      setDataMethod2({ ...dataMethod2, sales: [], isAllEmployee: 1 });
    } else {
      // if (listSales.length > 0) {
      const result = listSales.map((item) => {
        return {
          employeeId: item.employee?.value,
          rank: item.rank?.value,
        };
      });

      // setFormData({ ...formData, values: { ...formData?.values, sales: JSON.stringify(result) } });
      setDataMethod2({ ...dataMethod2, sales: result, isAllEmployee: 0 });
      // }
    }
  }, [listSales, selectAllSales]);

  //* ngày bắt đầu
  const [checkFieldStartDate, setCheckFieldStartDate] = useState<boolean>(false);
  const handleChangeValueStartDate = (e) => {
    setCheckFieldStartDate(false);

    setFormData({ ...formData, values: { ...formData?.values, startDate: e } });
  };

  //* ngày kết thúc
  const [checkFieldEndDate, setCheckFieldEndDate] = useState<boolean>(false);
  const handleChangeValueEndDate = (e) => {
    setCheckFieldEndDate(false);

    setFormData({ ...formData, values: { ...formData?.values, endDate: e } });
  };

  // lấy thông tin ngày bắt đầu chiến dịch, và ngày cuối cùng chiến dịch
  const startDay = new Date(formData.values.startDate).getTime();
  const endDay = new Date(formData.values.endDate).getTime();

  const dataSupplySource = [
    {
      value: "direct",
      label: "Nguồn trực tiếp",
    },
    {
      value: "ma",
      label: "Nguồn từ Marketing Automation",
    },
    {
      value: "filter",
      label: "Nguồn từ phân khúc khách hàng",
    },
  ];

  const optionDivisionMethod = [
    {
      value: "manual",
      label: "Phân chia thủ công",
    },
    {
      value: "basic",
      label: "Phân chia tự động đơn giản",
    },
    {
      value: "advance",
      label: "Phân chia tự động nâng cao",
    },
  ];

  const optionDivisionMethod_2 = [
    {
      value: "1",
      label: "Phân chia theo năng lực bán hàng",
    },
    {
      value: "2",
      label: "Phân chia đều cơ hội",
    },
    {
      value: "3",
      label: "Phân chia theo tỉ lệ chốt đơn",
    },
  ];

  const [saleDistributionSetting, setSaleDistributionSetting] = useState([]);

  const [listRuleData, setListRuleData] = useState([]);

  useEffect(() => {
    if (listRuleData && listRuleData.length > 0) {
      const newArray = [];
      listRuleData.map((item) => {
        newArray.push({
          id: item.id,
          divisionMethod: item.divisionMethod,
          ruleName: item.name,
          type: "simple",
          branch: {
            branches0: item.branches0,
            branches1: item.branches1,
            branches2: item.branches2,
            branches3: item.branches3,
            branches4: item.branches4,
          },
          departmentIds: item.departmentIds,
          isAllEmployee: item.isAllEmployee,
          sales: item.sales.map((el) => {
            return { employeeId: el.employeeId, rank: el.rank };
          }),
          filter:
            formData.values?.saleDistributionType === "basic"
              ? null
              : {
                  logical: item.logical,
                  rule: item.rule,
                  blockRule: item.blockRule,
                },
        });
      });
      setSaleDistributionSetting(newArray);
    } else {
      setSaleDistributionSetting([]);
    }
  }, [listRuleData, formData.values?.saleDistributionType]);

  useEffect(() => {
    setFormData({ ...formData, values: { ...formData?.values, saleDistributionSetting: saleDistributionSetting } });
  }, [saleDistributionSetting]);

  const [isFilter, setIsFilter] = useState(false);
  const [dataRule, setDataRule] = useState(null);
  const [indexRule, setIndexRule] = useState(null);

  const onSubmit = async () => {
    // e && e.preventDefault();

    // const errors = Validate(validations, formData, listField);

    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    if (!formData?.values?.name?.trim()) {
      showToast("Tên chiến dịch không được bỏ trống", "error");
      return;
    }

    if (!formData?.values?.averageConvertRate?.trim()) {
      showToast("Tỷ lệ chuyển đổi toàn chiến dịch không được bỏ trống", "error");
      return;
    }

    if (formData.values.type === "per" && !isParent && formData.values?.saleDistributionType === "basic") {
      const hasBranchSelected = listBranchId.level0.length > 0 || 
                                listBranchId.level1.length > 0 || 
                                listBranchId.level2.length > 0 || 
                                listBranchId.level3.length > 0 || 
                                listBranchId.level4.length > 0;
      
      if (!hasBranchSelected) {
        setcheckFieldBranch(true);
        showToast("Vui lòng chọn ít nhất một chi nhánh", "error");
        return;
      }
    }


    if (!formData?.values?.employeeId) {
      setCheckFieldEmployee(true);
      return;
    }

    if (!formData?.values?.startDate) {
      setCheckFieldStartDate(true);
      return;
    }

    if (!formData?.values?.endDate) {
      setCheckFieldEndDate(true);
      return;
    }

    const checkEmtySales = listSales.filter((item) => item.employee == null);
    if (checkEmtySales.length > 0) {
      setCheckFieldSales(true);
      return;
    }

    setIsSubmit(true);

    const body: ICampaignRequestModel = {
      ...(data || campaignId ? { id: data?.id || campaignId } : {}),
      ...(formData?.values as ICampaignRequestModel),
    };

    const response = await CampaignService.update(body);

    if (response.code == 0) {
      // setDataEmployee(null);
      // setListSales([{ employee: null, rank: { label: "Khá", value: 6 } }]);
      // setLstIdSale([]);

      //Chuyển qua bước 2
      // setSetupStep(2);
      setCampaignId(response.result?.id);
      loadCampaignApproaches(response.result?.id);
      showToast("Cài đặt chiến dịch thành công", "success");
      // setValueBranch([]);
      // setDataDepartment([])
    } else {
      showToast(response.message ?? response.error?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const handClearForm = () => {
    const takeUrlCampaign = JSON.parse(localStorage.getItem("backupCampaign"));

    if (takeUrlCampaign) {
      navigate(takeUrlCampaign);
    } else {
      navigate(`/sales_campaign`);
    }

    // setDataEmployee(null);
    // setData(null);
    // setListApproach([]);
    // setLstIdSale([]);
    // setListSales([]);
    // setSetupStep(1);
    // setValueBranch([]);
    // setDataDepartment([]);
    // setListBranchValue([
    //   {
    //     id: 'level_0',
    //     value: [],
    //   }
    // ]);
    // setListBranchId({
    //   level0: [],
    //   level1: [],
    //   level2: [],
    //   level3: [],
    //   level4: [],
    // });
    // setListBranchDelete0([]);
    // setListBranchDelete1([]);
    // setListBranchDelete2([]);
    // setListBranchDelete3([]);
    // setCheckFieldSales(false)
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
          navigate(`/sales_campaign`);
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

  ///step 2

  /**
   * Lấy danh sách Quy trình bán hàng
   */
  const loadCampaignApproaches = async (campaignId: number) => {
    const body: ICampaignApproachFilterRequest = {
      campaignId,
    };

    const response = await CampaignApproachService.list(body);
    if (response.code == 0) {
      setListApproach(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  /**
   * Cập nhật lại
   * @param item
   */
  const updateCampaignApproach = async (item: ICampaignApproachRequestModel) => {
    const response = await CampaignApproachService.update(item);
    if (response.code == 0) {
      loadCampaignApproaches(campaignId);
      // showToast( "Cập nhật hành động thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  /**
   * Thêm mới Quy trình bán hàng
   * @param campaignId
   */
  const addCampaignApproach = async (step: number) => {
    const body: ICampaignApproachRequestModel = {
      name: "",
      step,
      activities: "[]",
      campaignId,
    };

    const response = await CampaignApproachService.update(body);
    if (response.code == 0) {
      //Lấy lại danh sách
      loadCampaignApproaches(campaignId);
      showToast("Thêm quy trình thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  // Thay đổi tên quy trình bán hàng
  const handleBlurValueApproach = async (e, idx) => {
    setCheckFieldApproach(false);

    const value = e.target.value;
    let item: ICampaignApproachRequestModel = {};

    if (value) {
      listApproach.map((obj, index) => {
        if (index === idx) {
          item.id = obj.id;
          item.name = value; //Tên mới
          item.step = item.step || index + 1;
          item.activities = obj.activities;
          item.campaignId = campaignId;
        }
      });

      updateCampaignApproach(item);
    } else {
      setListApproach((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, checkName: true };
          }
          return obj;
        })
      );
    }
  };

  const handleChangeValueApproach = async (e, idx) => {
    setCheckFieldApproach(false);

    const value = e.target.value;
    setListApproach((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, name: value, checkName: false };
        }
        return obj;
      })
    );
  };

  const handleChangeValueActivity = (activities, idx) => {
    activities = JSON.stringify(activities.split(","));
    let item: ICampaignApproachRequestModel = {};
    listApproach.map((obj, index) => {
      if (index === idx) {
        item.id = obj.id;
        item.name = obj.name;
        item.step = item.step || index + 1;
        item.activities = activities;
        item.campaignId = campaignId;
      }
    });

    if (item.name) {
      setListApproach((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, activities: activities };
          }
          return obj;
        })
      );

      //Cũng thực hiện update thực sự
      updateCampaignApproach(item);
    } else {
      setListApproach((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, checkName: true };
          }
          return obj;
        })
      );
    }
  };

  //! xóa đi một quy trình bán hàng
  const handleRemoveApproach = (id, idx) => {
    const result = [...listApproach];

    //Những item cần được cập nhật
    const newData = [];
    result.map((item, index) => {
      if (index > idx) {
        newData.push({ ...item, step: item.step - 1 });
      }
    });

    const arrPromise = [];
    const promise = new Promise((resolve, reject) => {
      CampaignApproachService.delete(id).then((res) => resolve(res));
    });
    arrPromise.push(promise);

    if (newData.length > 0) {
      newData.map((item) => {
        const promise = new Promise((resolve, reject) => {
          CampaignApproachService.update(item).then((res) => resolve(res));
        });

        arrPromise.push(promise);
      });
    }

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa quy trình thành công", "success");
        loadCampaignApproaches(campaignId);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    });
  };

  //Cài đặt hành động
  const [modalSettingAction, setModalSettingAction] = useState(false);
  const [approachData, setApproachData] = useState(null);

  //Cài đặt SLA
  const [modalSettingSLA, setModalSettingSLA] = useState(false);
  const [dataApproach, setDataApproach] = useState(null);

  ///step 3
  /**
   * Lấy danh sách action step 3
   */

  const [dataStepAction, setDataStepAction] = useState([]);
  const [listActionEmail, setListActionEmail] = useState([]);
  const [listActionZalo, setListActionZalo] = useState([]);
  const [listActionSms, setListActionSms] = useState([]);
  const [listActionCall, setListActionCall] = useState([]);

  const loadCampaignStep3 = async (campaignId: number) => {
    const body: ICampaignApproachFilterRequest = {
      campaignId: campaignId,
    };

    const response = await CampaignService.listDataStep3(body);
    if (response.code == 0) {
      const result = response.result;
      setDataStepAction(result.scores);

      if (result.customerClassifications) {
        const changeResult = result.customerClassifications.map((item) => {
          return {
            name: item.name,
            color:
              item.code == "cold"
                ? "var(--primary-color-70)"
                : item.code == "cool"
                ? "var(--primary-color)"
                : item.code == "warn"
                ? "var(--warning-color)"
                : "var(--error-darker-color)",
            during: `${item.minValue} - ${item.maxValue}`,
            code: item.code,
          };
        });

        setValueAnnotate(() => {
          return result.customerClassifications.slice(0, -1).map((item) => item.maxValue);
        });

        setLstAnnotate(changeResult);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [settingEmail, setSettingEmail] = useState([
    {
      id: "",
      action: null,
      time: null,
      point: "",
    },
  ]);

  const loadedOptionEmailAction = async (search, loadedOptions, { page }) => {
    const param: any = {
      type: "email",
    };
    const response = await CampaignService.listActionScore(param);
    if (response.code === 0) {
      const dataOption = response.result;
      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  actionLevels: item.actionLevels,
                };
              })
            : []),
        ],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const [settingZalo, setSettingZalo] = useState([
    {
      id: "",
      action: null,
      time: null,
      point: "",
    },
  ]);

  const loadedOptionZaloAction = async (search, loadedOptions, { page }) => {
    const param: any = {
      type: "zalo",
    };
    const response = await CampaignService.listActionScore(param);
    if (response.code === 0) {
      const dataOption = response.result;
      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  actionLevels: item.actionLevels,
                };
              })
            : []),
        ],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const [settingSms, setSettingSms] = useState([
    {
      id: "",
      action: null,
      time: null,
      point: "",
    },
  ]);

  const loadedOptionSmsAction = async (search, loadedOptions, { page }) => {
    const param: any = {
      type: "sms",
    };
    const response = await CampaignService.listActionScore(param);
    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  actionLevels: item.actionLevels,
                };
              })
            : []),
        ],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const [settingCall, setSettingCall] = useState([
    {
      id: "",
      action: null,
      time: null,
      point: "",
    },
  ]);

  const loadedOptionCallAction = async (search, loadedOptions, { page }) => {
    const param: any = {
      type: "call",
    };
    const response = await CampaignService.listActionScore(param);
    if (response.code === 0) {
      const dataOption = response.result;
      setListActionCall(dataOption);

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  actionLevels: item.actionLevels,
                };
              })
            : []),
        ],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const loadedEmailAction = async () => {
    const param: any = {
      type: "email",
    };
    const response = await CampaignService.listActionScore(param);
    if (response.code === 0) {
      const dataOption = response.result;
      setListActionEmail(dataOption);
    }
  };

  const loadedZaloAction = async () => {
    const param: any = {
      type: "email",
    };
    const response = await CampaignService.listActionScore(param);
    if (response.code === 0) {
      const dataOption = response.result;
      setListActionEmail(dataOption);
    }
  };

  const loadedCallAction = async () => {
    const param: any = {
      type: "email",
    };
    const response = await CampaignService.listActionScore(param);
    if (response.code === 0) {
      const dataOption = response.result;
      setListActionEmail(dataOption);
    }
  };

  useEffect(() => {
    loadedEmailAction();
    loadedZaloAction();
    loadedCallAction();
  }, []);

  useEffect(() => {
    if (dataStepAction && dataStepAction.length > 0) {
      const arrayEmail = [];
      const arraySms = [];
      const arrayZalo = [];
      const arrayCall = [];

      dataStepAction.map((item) => {
        if (item.scoreAction?.type === "email") {
          const actionLevels = listActionEmail.find((el) => el.id === item.scoreAction.id)?.actionLevels || [];
          arrayEmail.push({
            id: item.id,
            action: {
              value: item.scoreAction?.id,
              label: item.scoreAction?.name,
              actionLevels: actionLevels.map((el) => {
                return { value: el.id, label: el.name };
              }),
            },
            point: item.score,
            time: {
              value: item.actionLevel?.id,
              label: item.actionLevel?.name,
            },
          });
        }

        if (item.scoreAction?.type === "zalo") {
          const actionLevels = listActionZalo.find((el) => el.id === item.scoreAction.id)?.actionLevels || [];
          arrayZalo.push({
            id: item.id,
            action: {
              value: item.scoreAction?.id,
              label: item.scoreAction?.name,
              actionLevels: actionLevels.map((el) => {
                return { value: el.id, label: el.name };
              }),
            },
            point: item.score,
            time: {
              value: item.actionLevel?.id,
              label: item.actionLevel?.name,
            },
          });
        }

        if (item.scoreAction?.type === "sms") {
          arraySms.push({
            id: item.id,
            action: {
              value: item.scoreAction?.id,
              label: item.scoreAction?.name,
              actionLevels: [],
            },
            point: item.score,
            time: "",
          });
        }

        if (item.scoreAction?.type === "call") {
          const actionLevels = listActionCall.find((el) => el.id === item.scoreAction.id)?.actionLevels || [];
          arrayCall.push({
            id: item.id,
            action: {
              value: item.scoreAction.id,
              label: item.scoreAction.name,
              actionLevels: actionLevels.map((el) => {
                return { value: el.id, label: el.name };
              }),
            },
            point: item.score,
            time: {
              value: item.actionLevel.id,
              label: item.actionLevel.name,
            },
          });
        }
      });

      if (arrayEmail.length > 0) {
        setSettingEmail(arrayEmail);
      }
      if (arrayZalo.length > 0) {
        setSettingZalo(arrayZalo);
      }

      if (arraySms.length > 0) {
        setSettingSms(arraySms);
      }
      if (arrayCall.length > 0) {
        setSettingCall(arrayCall);
      }
    }
  }, [dataStepAction, listActionEmail, listActionZalo, listActionCall]);

  const [scoreSetting, setScoreSetting] = useState([]);

  useEffect(() => {
    const data = [];
    settingEmail.map((item) => {
      data.push({
        id: item.id,
        actionId: item.action?.value,
        actionLevelId: item.time?.value,
        campaignId: campaignId,
        score: item.point,
      });
    });

    settingZalo.map((item) => {
      data.push({
        id: item.id,
        actionId: item.action?.value,
        actionLevelId: item.time?.value,
        campaignId: campaignId,
        score: item.point,
      });
    });
    settingSms.map((item) => {
      data.push({
        id: item.id,
        actionId: item.action?.value,
        actionLevelId: item.time?.value,
        campaignId: campaignId,
        score: item.point,
      });
    });

    settingCall.map((item) => {
      data.push({
        id: item.id,
        actionId: item.action?.value,
        actionLevelId: item.time?.value,
        campaignId: campaignId,
        score: item.point,
      });
    });
    setScoreSetting(data);
  }, [settingEmail, settingSms, settingZalo, settingCall]);

  const handleAnnotate = (lstData) => {
    const result = lstData.map((item) => {
      const changeDuring = item.during.split("-");

      return {
        name: item.name,
        code: item.code,
        minValue: +changeDuring[0],
        maxValue: +changeDuring[changeDuring.length - 1],
      };
    });

    return result;
  };

  const onSubmitStep3 = async () => {
    const body = {
      campaignId: campaignId,
      scores: scoreSetting,
      customerClassifications: handleAnnotate(lstAnnotate),
    };

    setIsSubmit(true);

    const response = await CampaignService.updateStep3(body);

    if (response.code == 0) {
      showToast("Cài đặt tính điểm khách hàng thành công", "success");
      // setSetupStep(4);
      loadCampaignStep4(campaignId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  //step 4

  const [scoreEmployee, setScoreEmployee] = useState(0);
  const [timeExpireContact, setTimeExpireContact] = useState(0);
  const [timeExpireFinish, setTimeExpireFinish] = useState(0);

  const [minusPoints, setMinusPoints] = useState({
    getLead: 0,
    leadFail: 0,
    leadTakeBack: {
      point: 0,
      expireContact: {
        day: 0,
        hour: 0,
        minute: 0,
      },
      expireFinish: {
        day: 0,
        hour: 0,
        minute: 0,
      },
    },
    sla: 0,
  });

  const [plusPoints, setPlusPoints] = useState({
    getContact: 0,
    leadSuccess: 0,
  });

  const loadCampaignStep4 = async (campaignId: number) => {
    const body: ICampaignApproachFilterRequest = {
      campaignId: campaignId,
    };

    const response = await CampaignService.listDataScoreEmployee(body);
    if (response.code == 0) {
      const result = response.result;
      setScoreEmployee(result?.scorePerSale);
      if (result?.criteria && result?.criteria.length > 0) {
        let hasAOpportunity = 0;
        let SLAViolate = 0;
        let hasAFailOppertunity = 0;
        let hasARevokeOppertunity = 0;
        let overdueInteraction = 0;
        let expiredDeadline = 0;

        let hasAInteraction = 0;
        let hasASuccessOppertunity = 0;

        const moment = require("moment");

        result?.criteria.map((item) => {
          if (item.name === "hasAOpportunity") {
            hasAOpportunity = item.value * -1 || 0;
          }
          if (item.name === "SLAViolate") {
            SLAViolate = item.value * -1 || 0;
          }
          if (item.name === "hasAFailOppertunity") {
            hasAFailOppertunity = item.value * -1 || 0;
          }
          if (item.name === "hasARevokeOppertunity") {
            hasARevokeOppertunity = item.value * -1 || 0;
          }

          if (item.name === "overdueInteraction") {
            overdueInteraction = item.value || 0;
          }
          if (item.name === "expiredDeadline") {
            expiredDeadline = item.value || 0;
          }

          if (item.name === "hasAInteraction") {
            hasAInteraction = item.value * -1 || 0;
          }
          if (item.name === "hasASuccessOppertunity") {
            hasASuccessOppertunity = item.value * -1 || 0;
          }
        });

        let expireContact = overdueInteraction;
        var diffExpireContact = new moment.duration(expireContact * 1000);

        let expireFinish = expiredDeadline;
        var diffExpireFinish = new moment.duration(expireFinish * 1000);

        setMinusPoints({
          getLead: hasAOpportunity,
          leadFail: hasAFailOppertunity,
          leadTakeBack: {
            point: hasARevokeOppertunity,
            expireContact: {
              day: Math.floor(diffExpireContact.asDays()) || 0,
              hour: Math.floor(diffExpireContact.asHours()) % 24 || 0,
              minute: Math.floor(diffExpireContact.asMinutes()) % 60 || 0,
            },
            expireFinish: {
              day: Math.floor(diffExpireFinish.asDays()) || 0,
              hour: Math.floor(diffExpireFinish.asHours()) % 24 || 0,
              minute: Math.floor(diffExpireFinish.asMinutes()) % 60 || 0,
            },
          },
          sla: SLAViolate,
        });

        setPlusPoints({
          getContact: hasAInteraction,
          leadSuccess: hasASuccessOppertunity,
        });
      }
    } else if (response.code == 404) {
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    const day = minusPoints.leadTakeBack.expireContact.day;
    const hour = minusPoints.leadTakeBack.expireContact.hour;
    const minute = minusPoints.leadTakeBack.expireContact.minute;

    const seconds = day * 24 * 60 * 60 + hour * 60 * 60 + minute * 60;
    setTimeExpireContact(seconds);
  }, [minusPoints.leadTakeBack.expireContact]);

  useEffect(() => {
    const day = minusPoints.leadTakeBack.expireFinish.day;
    const hour = minusPoints.leadTakeBack.expireFinish.hour;
    const minute = minusPoints.leadTakeBack.expireFinish.minute;

    const seconds = day * 24 * 60 * 60 + hour * 60 * 60 + minute * 60;
    setTimeExpireFinish(seconds);
  }, [minusPoints.leadTakeBack.expireFinish]);

  const onSubmitStep4 = async () => {
    if (!scoreEmployee) {
      showToast("Vui lòng nhập Điểm tín dụng/nhân viên", "error");
      return;
    }

    const body = {
      campaignId: campaignId,
      scorePerSale: scoreEmployee,
      criteria: [
        {
          name: "hasAOpportunity",
          type: "score",
          value: -minusPoints.getLead,
        },
        {
          name: "SLAViolate",
          type: "score",
          value: -minusPoints.sla,
        },
        {
          name: "hasAFailOppertunity",
          type: "score",
          value: -minusPoints.leadFail,
        },
        {
          name: "hasARevokeOppertunity",
          type: "score",
          value: -minusPoints.leadTakeBack.point,
        },
        {
          name: "overdueInteraction",
          type: "time",
          value: timeExpireContact,
        },
        {
          name: "expiredDeadline",
          type: "time",
          value: timeExpireFinish,
        },

        {
          name: "hasAInteraction",
          type: "score",
          value: plusPoints.getContact,
        },
        {
          name: "hasASuccessOppertunity",
          type: "score",
          value: plusPoints.leadSuccess,
        },
      ],
    };

    setIsSubmit(true);

    const response = await CampaignService.updateStep4(body);

    if (response.code == 0) {
      showToast("Cài đặt tính điểm nhân viên thành công", "success");
      // setSetupStep(5);
      // loadCampaignStep5(campaignId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  //step 5

  const [tabKpi, setTabKpi] = useState(1);
  const [dataKpi, setDataKpi] = useState(null);
  const [dataKpiGoal, setDataKpiGoal] = useState([]);

  const [sumWeight, setSumWeight] = useState(0);

  const [kayId, setKayId] = useState(null);

  useEffect(() => {
    if (dataKpiGoal.length > 0) {
      let sumWeight = 0;
      dataKpiGoal.map((item) => {
        sumWeight += item.weight;
      });
      setSumWeight(sumWeight);
    }
  }, [dataKpiGoal]);
  //kiểm tra chiến dịch có kpi chưa
  const checkKpiCampaign = async (campaignId: number) => {
    const body = {
      campaignId: campaignId,
    };

    const response = await KpiService.checkKpiCampaign(body);
    if (response.code == 0) {
      const result = response.result;
      if (result?.kpiId) {
        setDataKpi({ value: result.kpiId, label: result.kpiName });
        getKpiGoal(result?.kpiId);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const loadCampaignStep5 = (campaignId) => {
    checkKpiCampaign(campaignId);
  };

  const loadedOptionKpi = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      limit: 10,
      page: page,
    };
    const response = await KpiService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      let optionSelect = dataOption;

      if (dataKpiGoal && dataKpiGoal.length > 0) {
        dataKpiGoal.map((item) => {
          const newDataOption = optionSelect.filter((el) => el.id !== item.value);
          optionSelect = newDataOption;
        });
      }

      return {
        // options: [
        //     ...(dataOption.length > 0
        //     ? dataOption.map((item) => {
        //         return {
        //             value: item.id,
        //             label: item.name,
        //         };
        //     })
        //     : []),
        // ],
        options: [
          ...(optionSelect.length > 0
            ? optionSelect.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const selectKpiGoal = async (e) => {
    setDataKpi(e);
    // setDataKpiGoal((oldArray) => [...oldArray, {value: e.value, label: e.label, weight: 0, percent: 0}]);
    getKpiGoal(e.value);
  };

  const getKpiGoal = async (kpiId: number) => {
    const response = await KpiSetupService.list({ kpiId: kpiId });

    if (response.code === 0) {
      const result = response.result;
      const goalList = result.map((item) => {
        return {
          value: item.goalId,
          label: item.goalName,
          weight: item.weight,
        };
      });
      setDataKpiGoal(goalList);
    } else if (response.code == 400) {
      // setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleRemoveKpiGoal = (index) => {
    const newData = [...dataKpiGoal];
    newData.splice(index, 1);
    setDataKpiGoal(newData);
  };

  const onSubmitSaveKpi = async () => {
    const body = {
      campaignId: campaignId,
      kpiId: dataKpi.value,
    };

    if (!body.kpiId) {
      showToast("Vui lòng chọn bộ KPI", "error");
      return;
    }
    const response = await KpiService.updateKpi(body);

    if (response.code == 0) {
      const result = response.result;
      showToast("Thêm bộ Kpi thành công", "success");
      getListEmployeeKpi(result.id);
      setKayId(result.id);
      setTabKpi(2);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //lấy danh sách kpi của nhân viên
  const [dataKpiEmployee, setDataKpiEmployee] = useState([]);
  const [isLoadingKpiEmployee, setIsLoadingKpiEmployee] = useState(false);

  const getListEmployeeKpi = async (id: number) => {
    const body = {
      kayId: id,
      isCampaign: 1,
    };
    setIsLoadingKpiEmployee(true);

    const response = await KpiService.listEmployeeKpi(body);

    if (response.code == 0) {
      const result = response.result.items;
      const employeeList = result.map((item) => {
        return {
          kotId: item.id,
          employeeName: item.receiverName,
          employeeId: item.receiverId,
          departmentName: item.departmentName,
          branchName: item.branchName,
        };
      });
      setDataKpiEmployee(employeeList);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoadingKpiEmployee(false);
  };

  const [paramsKpi, setParamsKpi] = useState({
    name: "",
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "kpi cho nhân viên",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParamsKpi((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParamsKpi((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [kpiEmployeeData, setKpiEmployeeData] = useState(null);

  const titles = ["STT", "Tên nhân viên", "Phòng ban", "Chi nhánh", "Chỉ tiêu"];

  const dataFormat = ["text-center", "", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number, type) => [
    getPageOffset(paramsKpi) + index + 1,
    ...(type === "kpi"
      ? [
          item.employeeName,
          item.departmentName,
          item.branchName,
          <a
            key={item.id}
            onClick={(e) => {
              setShowModalConfigKpi(true);
              setKpiEmployeeData(item);
            }}
          >
            Xem chi tiết
          </a>,
        ]
      : []),
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      //   {
      //     title: "Sửa",
      //     icon: <Icon name="Pencil" />,
      //     callback: () => {
      //         setShowModalConfigKpi(true);
      //         setKpiEmployeeData(item);
      //     },
      //   },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const [showModalConfigKpi, setShowModalConfigKpi] = useState(false);

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa nhân viên đã chọn
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: async () => {
        const response = await KpiService.deleteEmployeeKpi(item.kotId);
        if (response.code === 0) {
          showToast("Xóa nhân viên thành công", "success");
          getListEmployeeKpi(kayId);
        } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  // đoạn này dùng cho phân loại khách hàng
  const defaultValues = [
    {
      name: "Lạnh",
      color: "var(--primary-color-70)",
      during: "0 - 25",
      code: "cold",
    },
    {
      name: "Mát",
      color: "var(--primary-color)",
      during: "26 - 50",
      code: "cool",
    },
    {
      name: "Ấm",
      color: "var(--warning-color)",
      during: "51 - 75",
      code: "warn",
    },
    {
      name: "Nóng",
      color: "var(--error-darker-color)",
      during: "76 - 100",
      code: "hot",
    },
  ];

  const [lstAnnotate, setLstAnnotate] = useState(defaultValues);

  const step = 1; // Bước nhảy
  const pushable = step * 10; // Khoảng giữa các giá trị được kéo

  const [valueAnnotate, setValueAnnotate] = useState([25, 50, 75]);

  const handleChangeAnnotate = (newValues) => {
    const newAnnotations = [];
    let start = 0;
    for (let i = 0; i < newValues.length; i++) {
      const end = newValues[i];
      const name = lstAnnotate[i].name;
      const color = lstAnnotate[i].color;
      const code = lstAnnotate[i].code;
      const during = `${start} - ${end}`;
      newAnnotations.push({ name, color, code, during });
      start = end + 1;
    }
    // Tính lại khoảng giá trị "Nóng"
    const hotIndex = newValues.length;
    const hotStart = newValues[hotIndex - 1] + 1;
    const hotEnd = 100;
    const hotName = lstAnnotate[hotIndex].name;
    const hotColor = lstAnnotate[hotIndex].color;
    const hotCode = lstAnnotate[hotIndex].code;
    const hotDuring = `${hotStart} - ${hotEnd}`;
    newAnnotations.push({ name: hotName, color: hotColor, code: hotCode, during: hotDuring });

    setLstAnnotate(newAnnotations);

    setValueAnnotate(newValues);
  };

  const trackStyle = { backgroundColor: "var(--primary-color-70)" };

  const marks = {};
  for (let i = 0; i <= 100; i += 10) {
    marks[i] = i;
  }

  // useEffect(() => {
  //   if (lstAnnotate && lstAnnotate.length > 0) {
  //     const result = lstAnnotate.map((item) => {
  //       const changeDuring = item.during.split("-");

  //       return {
  //         name: item.name,
  //         code: item.code,
  //         ["min_value"]: +changeDuring[0],
  //         ["max_value"]: +changeDuring[changeDuring.length - 1],
  //       };
  //     });

  //   }
  // }, [lstAnnotate]);

  //cảnh báo vi phạm SLA
  const [dataViolation, setDataViolation] = useState(null);

  const onSubmitViolation = async () => {
    const body = {
      ...dataViolation,
      campaignId: campaignId,
    };

    if (body.violation?.targets?.length === 0) {
      showToast("Vui lòng chọn thông báo cho ai", "error");
      return;
    }

    if (body.violation?.channels?.length === 0) {
      showToast("Vui lòng chọn kênh thông báo", "error");
      return;
    }

    if (
      body.violation?.channels?.length > 0 &&
      body.violation?.channels?.find((el) => el.type === "email") &&
      !body.violation?.channels?.find((el) => el.type === "email").templateId
    ) {
      showToast("Vui lòng chọn mẫu Email gửi đi", "error");
      return;
    }

    if (
      body.violation?.channels?.length > 0 &&
      body.violation?.channels?.find((el) => el.type === "sms") &&
      !body.violation?.channels?.find((el) => el.type === "sms").templateId
    ) {
      showToast("Vui lòng chọn mẫu SMS gửi đi", "error");
      return;
    }

    const response = await CampaignService.updateConfigSLA(body);

    if (response.code == 0) {
      const result = response.result;
      showToast("Cài đặt cảnh báo vi phạm thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <div className="page-content page-create-sale_campaign">
      <TitleAction title={`${id ? "Chỉnh sửa" : "Tạo"} chiến dịch ${isParent ? " cha" : ""}`} />

      <div style={{ display: "flex", marginBottom: 10 }}>
        {dataStep.map(
          (item, index) => (
            // formData.values.type === "biz" ? (
            //   item.value === 3 || item.value === 4 ? null : (
            //     <div
            //       key={index}
            //       style={{
            //         borderBottom: setupStep === item.value ? "1px solid" : "",
            //         paddingLeft: 12,
            //         paddingRight: 12,
            //         paddingBottom: 3,
            //         cursor: "pointer",
            //       }}
            //       onClick={() => {
            //         if (id) {
            //           setSetupStep(item.value);
            //           if (item.value === 5) {
            //             loadCampaignStep5(campaignId);
            //           }
            //         }
            //       }}
            //     >
            //       <span style={{ fontSize: 16, fontWeight: "500", color: setupStep === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
            //     </div>
            //   )
            // ) : (
            <div
              key={index}
              style={{
                borderBottom: setupStep === item.value ? "1px solid" : "",
                paddingLeft: 12,
                paddingRight: 12,
                paddingBottom: 3,
                cursor: "pointer",
              }}
              onClick={() => {
                if (campaignId) {
                  setSetupStep(item.value);
                  if (formData.values.type === "per") {
                    setChildStepOfStep6(2);
                    setChildStepOfStep7(1);
                  }
                  if (formData.values.type === "biz") {
                    setChildStepOfStep6(1);
                    setChildStepOfStep7(2);
                  }

                  // if (item.value === 3) {
                  //   loadCampaignStep3(campaignId);
                  // }
                  // if (item.value === 4) {
                  //   loadCampaignStep4(campaignId);
                  // }
                  // if (item.value === 5) {
                  //   loadCampaignStep5(campaignId);
                  // }
                  if (item.value === 6) {
                    loadCampaignStep3(campaignId);
                    loadCampaignStep5(campaignId);
                  }
                  if (item.value === 7) {
                    loadCampaignStep4(campaignId);
                  }
                }
              }}
            >
              <span style={{ fontSize: 16, fontWeight: "500", color: setupStep === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
            </div>
          )
          // )
        )}
      </div>

      {setupStep === 1 && (
        <div>
          <div className="card-box wrapper__info--customer">
            <h3 className="title__info">Thông tin chiến dịch</h3>

            <div className="info__campaign">
              <div
                className={`form__left special-item ${checkFieldStartDate || checkFieldEndDate ? "one__error" : ""} ${
                  (checkFieldStartDate && checkFieldEndDate) || (startDay > endDay && endDay < startDay) ? "two__error" : ""
                }`}
              >
                <FileUpload type="cover" formData={formData} setFormData={setFormData} />
              </div>

              <div className="form-group">
                <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>Loại chiến dịch</span>
                <div className="option_select_type_campaign">
                  {typeCampaign.map((item, index) => (
                    <div key={index}>
                      <Radio
                        value={item.value}
                        label={item.label}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "biz") {
                            setDataSourceProvider([{ type: "direct", ids: [] }]);
                            setFormData({
                              ...formData,
                              values: { ...formData?.values, type: value, saleDistributionType: "manual", products: "[]", services: "[]" },
                            });

                            setListBranchValue([
                              {
                                id: "level_0",
                                value: [],
                              },
                            ]);
                            setListBranchDelete0([]);
                            setListBranchDelete1([]);
                            setListBranchDelete2([]);
                            setListBranchDelete3([]);
                            setDataDepartment([]);
                            setDepartmentId([]);
                            setListSales([]);
                            setListRuleData([]);
                            setDataServices([]);
                            setDataProducts([]);
                            setChildStepOfStep6(1);
                            setChildStepOfStep7(2);
                          } else {
                            setFormData({ ...formData, values: { ...formData?.values, type: value } });
                          }
                        }}
                        checked={formData.values.type === item.value}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {isParent ? (
                <div className={"form-group"}></div>
              ) : (
                <div className="form-group">
                  <SelectCustom
                    id="parentId"
                    name="parentId"
                    label="Chiến dịch cha"
                    options={[]}
                    fill={true}
                    value={dataCampaign}
                    disabled={parentCampaign}
                    onChange={(e) => handleChangeValueCampaign(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn chiến dịch cha"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionCampaign}
                    formatOptionLabel={formatOptionLabelCampaign}
                  />
                </div>
              )}
              <div className="form-group">
                <Input
                  label="Tên chiến dịch"
                  name="name"
                  fill={true}
                  required={true}
                  value={formData?.values?.name}
                  placeholder="Tên chiến dịch"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, values: { ...formData?.values, name: value } });
                  }}
                />
              </div>

              <div className="form-group">
                <Input
                  label="Mã chiến dịch"
                  name="code"
                  fill={true}
                  required={false}
                  value={formData?.values?.code}
                  placeholder="Mã chiến dịch"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, values: { ...formData?.values, code: value } });
                  }}
                />
              </div>

              <div className="form-group">
                <DatePickerCustom
                  label="Bắt đầu"
                  name="startDate"
                  fill={true}
                  value={formData?.values?.startDate}
                  onChange={(e) => handleChangeValueStartDate(e)}
                  placeholder="Chọn ngày bắt đầu"
                  required={true}
                  iconPosition="left"
                  icon={<Icon name="Calendar" />}
                  error={checkFieldStartDate || startDay > endDay}
                  message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày kết thúc" : "Vui lòng chọn ngày bắt đầu"}
                />
              </div>

              <div className="form-group">
                <DatePickerCustom
                  label="Kết thúc"
                  name="endDate"
                  fill={true}
                  value={formData?.values?.endDate}
                  onChange={(e) => handleChangeValueEndDate(e)}
                  placeholder="Chọn ngày kết thúc"
                  required={true}
                  iconPosition="left"
                  icon={<Icon name="Calendar" />}
                  error={checkFieldEndDate || endDay < startDay}
                  message={endDay < startDay ? "Ngày kết thúc lớn hơn ngày bắt đầu" : "Vui lòng chọn ngày kết thúc"}
                />
              </div>
            </div>
            <div className="info__campaign">
              <div className="form-group">
                <SelectCustom
                  id="status"
                  name="status"
                  label="Trạng thái"
                  options={[
                    { value: "1", label: "Đang thực hiện" },
                    { value: "0", label: "Tạm dừng" },
                    { value: "-1", label: "Đã huỷ" },
                  ]}
                  fill={true}
                  value={formData?.values?.status}
                  required={true}
                  onChange={(e) => handleChangeValueStatus(e)}
                  placeholder="Chọn trạng thái"
                  message="Trạng thái không được bỏ trống"
                />
              </div>
              <div className="form-group">
                <SelectCustom
                  id="employeeId"
                  name="employeeId"
                  label="Người phụ trách"
                  options={[]}
                  fill={true}
                  value={dataEmployee}
                  required={true}
                  onChange={(e) => handleChangeValueEmployee(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn người phụ trách"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEmployee}
                  formatOptionLabel={formatOptionLabelEmployee}
                  error={checkFieldEmployee}
                  message="Người phụ trách không được bỏ trống"
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="employeeId"
                  name="employeeId"
                  label="Người phối hợp"
                  options={[]}
                  fill={true}
                  isMulti={true}
                  value={dataCoordinators}
                  required={false}
                  onChange={(e) => handleChangeValueCoordinators(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn người phối hợp"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEmployee}
                  formatOptionLabel={formatOptionLabelEmployee}
                />
              </div>
              <div className="form-group">
                <SelectCustom
                  id="processId"
                  name="processId"
                  label="Quy trình chiến dịch"
                  options={[]}
                  fill={true}
                  // isMulti={true}
                  value={dataProcess}
                  required={false}
                  onChange={(e) => handleChangeValueProcess(e)}
                  isAsyncPaginate={true}
                  // isFormatOptionLabel={true}
                  placeholder="Chọn quy trình"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionProcess}
                  // formatOptionLabel={formatOptionLabelEmployee}
                />
              </div>
            </div>
          </div>

          {formData.values.type === "per" && (
            <div className="card-box  wrapper__select-service-product">
              <div className="select-service-product">
                <div className="select-service">
                  <SelectCustom
                    id="services"
                    name="services"
                    label="Dịch vụ"
                    options={[]}
                    fill={true}
                    isMulti={true}
                    value={dataServices}
                    required={false}
                    onChange={(e) => handleChangeValueServices(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={false}
                    placeholder="Chọn dịch vụ"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionService}
                  />
                </div>

                <div className="select-product">
                  <SelectCustom
                    id="products"
                    name="product"
                    label="Sản phẩm"
                    options={[]}
                    fill={true}
                    isMulti={true}
                    value={dataProducts}
                    required={false}
                    onChange={(e) => handleChangeValueProducts(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={false}
                    placeholder="Chọn sản phẩm"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionProduct}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="card-box  wrapper__target__campaign">
            <h3 className="title__info">Mục tiêu chiến dịch</h3>

            <div className="target__campaign">
              <div className="form-group">
                <NummericInput
                  label="Tổng doanh thu chiến dịch"
                  name="totalRevenue"
                  fill={true}
                  required={false}
                  value={formData?.values?.totalRevenue}
                  thousandSeparator={true}
                  placeholder="Tổng doanh thu chiến dịch"
                  decimalScale={0}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, values: { ...formData?.values, totalRevenue: value.replace(/,/g, "") } });
                  }}
                />
              </div>

              <div className="form-group">
                <NummericInput
                  label="Tổng đơn hàng thành công"
                  name="totalCustomer"
                  fill={true}
                  required={false}
                  value={formData?.values?.totalCustomer}
                  thousandSeparator={true}
                  placeholder="Tổng đơn hàng thành công"
                  decimalScale={0}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, values: { ...formData?.values, totalCustomer: value.replace(/,/g, "") } });
                  }}
                />
              </div>

              <div className="form-group">
                <NummericInput
                  label="Tỷ lệ chuyển đổi toàn chiến dịch (%)"
                  name="averageConvertRate"
                  fill={true}
                  required={true}
                  value={formData?.values?.averageConvertRate}
                  placeholder="Nhập giá trị tỷ lệ chuyển đổi toàn chiến dịch (%)"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, values: { ...formData?.values, averageConvertRate: value } });
                  }}
                />
              </div>
            </div>
          </div>

          {formData.values.type === "per" && !isParent ? (
            <div className="card-box  wrapper__data_supply_source">
              <h3 className="title__info">Nguồn cấp dữ liệu</h3>
              <div className="data_supply_source">
                {dataSupplySource.map((item, index) => (
                  <div key={index} className="item_data_supply_source">
                    <Checkbox
                      value={item.value}
                      label={item.label}
                      onChange={(e) => {
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
                      checked={dataSourceProvider.filter((el) => el.type === item.value).length > 0}
                    />
                    {item.value === "ma" && dataSourceProvider.filter((el) => el.type === "ma").length > 0 ? (
                      <div className="select_data_supply_source">
                        <SelectCustom
                          options={[]}
                          fill={true}
                          isMulti={true}
                          value={dataSupplySourceFromMA}
                          required={false}
                          disabled={dataSourceProvider.filter((el) => el.type === item.value).length > 0 ? false : true}
                          onChange={(e) => handleChangeDataSupplySourceFromMA(e)}
                          isAsyncPaginate={true}
                          isFormatOptionLabel={true}
                          placeholder="Chọn nguồn từ MA"
                          additional={{
                            page: 1,
                          }}
                          loadOptionsPaginate={loadedOptionDataSupplySourceFromMA}
                        />
                      </div>
                    ) : null}

                    {item.value === "filter" && dataSourceProvider.filter((el) => el.type === "filter").length > 0 ? (
                      <div className="select_data_supply_source">
                        <SelectCustom
                          options={[]}
                          fill={true}
                          isMulti={true}
                          value={dataSupplySourceFromFilter}
                          required={false}
                          disabled={dataSourceProvider.filter((el) => el.type === item.value).length > 0 ? false : true}
                          onChange={(e) => handleChangeDataSupplySourceFromFilter(e)}
                          isAsyncPaginate={true}
                          isFormatOptionLabel={true}
                          placeholder="Chọn nguồn từ phân khúc"
                          additional={{
                            page: 1,
                          }}
                          loadOptionsPaginate={loadedOptionDataSupplySourceFromFilter}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {formData.values.type === "per" && !isParent ? (
            <div className="card-box  wrapper__opportunity_sale">
              <h3 className="title__info">Phân bổ cơ hội cho nhân viên bán hàng</h3>
              <div className="opportunity_sale">
                <div className="option_select">
                  {optionDivisionMethod.map((item, index) => (
                    <div key={index}>
                      <Radio
                        value={item.value}
                        label={item.label}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "basic") {
                            // setListRuleData([])
                            setFormData({
                              ...formData,
                              values: {
                                ...formData.values,
                                saleDistributionType: value,
                                // divisionMethod_2: '1'
                              },
                            });
                          } else {
                            setFormData({
                              ...formData,
                              values: {
                                ...formData.values,
                                saleDistributionType: value,
                                // divisionMethod_2: ''
                              },
                            });

                            setListBranchValue([
                              {
                                id: "level_0",
                                value: [],
                              },
                            ]);
                            setListBranchDelete0([]);
                            setListBranchDelete1([]);
                            setListBranchDelete2([]);
                            setListBranchDelete3([]);
                            setDataDepartment([]);
                            setDepartmentId([]);
                            setListSales([]);
                            setcheckFieldBranch(false);

                            if (value === "advance") {
                              setListRuleData([]);
                              // if(listRuleData.length === 0){
                              setIsFilter(true);
                              // }
                            } else if (value === "manual") {
                              setListRuleData([]);
                            }
                          }
                        }}
                        checked={formData.values?.saleDistributionType === item.value}
                      />
                    </div>
                  ))}
                </div>

                {formData.values?.saleDistributionType === "basic" ? (
                  <div className="option_select_divisionMethod_2">
                    <div className="option_select">
                      {optionDivisionMethod_2.map((item, index) => (
                        <div key={index}>
                          <Radio
                            value={item.value}
                            label={item.label}
                            onChange={(e) => {
                              const value = +e.target.value;
                              setDataMethod2({ ...dataMethod2, divisionMethod: value });
                              // setFormData({ ...formData, values: { ...formData.values, divisionMethod_2: value} });
                            }}
                            checked={dataMethod2?.divisionMethod === +item.value}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ marginTop: "2rem" }}>
                        {listBranchValue.map((item, index) => {
                          return (
                            <div key={index} className="box_branch" style={index > 0 ? { marginTop: 20 } : {}}>
                              <div className="select_branch">
                                <SelectCustom
                                  key={
                                    index === 1
                                      ? listBranchId.level0.length
                                      : index === 2
                                      ? listBranchId.level1.length
                                      : index === 3
                                      ? listBranchId.level2.length
                                      : index === 4
                                      ? listBranchId.level3.length
                                      : "no"
                                  }
                                  id="branchId"
                                  name="branchId"
                                  label={index === 0 ? "Chi nhánh" : ""}
                                  options={[]}
                                  fill={true}
                                  isMulti={true}
                                  value={item.value}
                                  required={true}
                                  disabled={
                                    index === 1
                                      ? listBranchId.level0.length === 0
                                        ? true
                                        : false
                                      : index === 2
                                      ? listBranchId.level1.length === 0
                                        ? true
                                        : false
                                      : index === 3
                                      ? listBranchId.level2.length === 0
                                        ? true
                                        : false
                                      : index === 4
                                      ? listBranchId.level3.length === 0
                                        ? true
                                        : false
                                      : false
                                  }
                                  onChange={(e) => handleChangeValueBranch(e, index)}
                                  isAsyncPaginate={true}
                                  isFormatOptionLabel={true}
                                  placeholder="Chọn chi nhánh"
                                  additional={{
                                    page: 1,
                                  }}
                                  loadOptionsPaginate={
                                    index === 0
                                      ? loadedOptionBranchLevel_0
                                      : index === 1
                                      ? loadedOptionBranchLevel_1
                                      : index === 2
                                      ? loadedOptionBranchLevel_2
                                      : index === 3
                                      ? loadedOptionBranchLevel_3
                                      : index === 4
                                      ? loadedOptionBranchLevel_4
                                      : ""
                                  }
                                  formatOptionLabel={formatOptionLabelBranch}
                                  error={checkFieldBranch}
                                  message="Chi nhánh không được bỏ trống"
                                />
                              </div>

                              {index === 0 ? (
                                listBranchValue.length === 5 ? null : (
                                  <div
                                    className="action__add--branch_field"
                                    onClick={() => {
                                      setListBranchValue([
                                        ...listBranchValue,
                                        {
                                          id: `level_${listBranchValue.length}`,
                                          value: [],
                                        },
                                      ]);
                                    }}
                                  >
                                    <Icon name="PlusCircleFill" />
                                  </div>
                                )
                              ) : index === listBranchValue.length - 1 ? (
                                <div className="action__remove--branch_field" title="Xóa" onClick={() => handleRemoveBranch(index)}>
                                  <Icon name="Trash" />
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ marginTop: "2rem" }}>
                        <SelectCustom
                          key={
                            listBranchId.level0.length ||
                            listBranchId.level1.length ||
                            listBranchId.level2.length ||
                            listBranchId.level3.length ||
                            listBranchId.level4.length
                          }
                          id="departmentId"
                          name="departmentId"
                          label="Phòng ban"
                          options={[]}
                          fill={true}
                          isMulti={true}
                          disabled={
                            listBranchId.level0.length === 0 &&
                            listBranchId.level1.length === 0 &&
                            listBranchId.level2.length === 0 &&
                            listBranchId.level3.length === 0 &&
                            listBranchId.level4.length === 0
                              ? true
                              : false
                          }
                          value={dataDepartment}
                          required={false}
                          onChange={(e) => handleChangeValueDepartment(e, listDepartment)}
                          isAsyncPaginate={true}
                          isFormatOptionLabel={true}
                          placeholder="Chọn phòng ban"
                          additional={{
                            page: 1,
                          }}
                          loadOptionsPaginate={loadedOptionDepartment}
                          formatOptionLabel={formatOptionLabelDepartment}
                          // error={checkFieldEmployee}
                          // message="Người phụ trách không được bỏ trống"
                        />
                      </div>

                      <div className="wrapper__sales">
                        <h4>Danh sách người bán</h4>
                        {listDepartmentId.length > 0 ? (
                          <div>
                            <Checkbox
                              // value="-1"
                              label="Tất cả nhân viên"
                              onChange={(e) => {
                                if (selectAllSales === true) {
                                  setSelectAllSales(false);
                                } else if (selectAllSales === false) {
                                  setSelectAllSales(true);
                                  setListSales([]);
                                  setCheckFieldSales(false);
                                }
                              }}
                              checked={selectAllSales}
                            />
                          </div>
                        ) : null}
                        <div className="list__sales">
                          <div
                            className="action__add--sales"
                            onClick={() => {
                              if (listDepartmentId.length > 0) {
                                setListSales([...listSales, { employee: null, rank: { label: "Khá", value: 6 } }]);
                                setSelectAllSales(false);
                              } else {
                                showToast("Vui lòng chọn phòng ban", "error");
                              }
                            }}
                          >
                            <Icon
                              name="PlusCircleFill"
                              style={{ fill: listDepartmentId.length > 0 ? "var(--primary-color-90)" : "var(--extra-color-50)" }}
                            />
                            Thêm người bán
                          </div>

                          {listSales.map((item, idx) => {
                            return (
                              <div key={idx} className="item__sales">
                                <div className="info__detail--sale">
                                  <SelectCustom
                                    key={listDepartmentId.length}
                                    id="saleId"
                                    name="saleId"
                                    options={[]}
                                    fill={true}
                                    disabled={listDepartmentId.length > 0 ? false : true}
                                    value={item.employee}
                                    required={true}
                                    onChange={(e) => handleChangeValueSales(e, idx)}
                                    isAsyncPaginate={true}
                                    isFormatOptionLabel={true}
                                    placeholder="Chọn người bán"
                                    additional={{
                                      page: 1,
                                    }}
                                    loadOptionsPaginate={loadedOptionSales}
                                    formatOptionLabel={formatOptionLabelSales}
                                    error={item.employee ? false : checkFieldSales}
                                    message="Vui lòng chọn người bán"
                                  />

                                  <div
                                    className={`option__rank ${isOptionRank && indexSale == idx ? "prioritize" : ""}`}
                                    ref={refContainerSpecialize}
                                    style={item.employee ? { height: "4.25rem" } : { height: "3.8rem" }}
                                  >
                                    <div
                                      className="select__rank"
                                      onClick={() => {
                                        setIsOptionRank(!isOptionRank);
                                        setIndexSale(idx);
                                      }}
                                    >
                                      {item.rank?.label}
                                      <Icon name="ChevronDown" />
                                    </div>

                                    {isOptionRank && indexSale == idx && (
                                      <ul className="menu__option--rank" ref={refOptionSpecialize}>
                                        {rankData.map((el, index) => (
                                          <li
                                            key={index}
                                            className={`item--rank ${item.rank?.value === el.value ? "active__item--rank" : ""}`}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setListSales((current) =>
                                                current.map((obj, i) => {
                                                  if (i === idx) {
                                                    return { ...obj, rank: el };
                                                  }
                                                  return obj;
                                                })
                                              );
                                              setIsOptionRank(false);
                                            }}
                                          >
                                            {el.label}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>

                                {/* {listSales.length > 1 && ( */}
                                <div className="action__remove--sale" title="Xóa" onClick={() => handleRemoveSale(idx)}>
                                  <Icon name="Trash" />
                                </div>
                                {/* )} */}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {formData.values?.saleDistributionType === "advance" ? (
                  <div className="option_select_divisionMethod_3">
                    <div className="box_title">
                      <h3 className="title__info_list_rule">Danh sách các luật</h3>
                      <div
                        className="button_add_rule"
                        onClick={() => {
                          setIsFilter(true);
                        }}
                      >
                        <Icon name="PlusCircleFill" />
                        <span style={{ fontSize: 14, fontWeight: "400", marginLeft: 5 }}>Thêm luật</span>
                      </div>
                    </div>

                    {listRuleData.length > 0 &&
                      listRuleData.map((item, index) => (
                        <div key={index} className="box_rule">
                          <div>
                            <span style={{ fontSize: 14, fontWeight: "500" }}>{item.name}</span>
                          </div>
                          <div className="icon_rule">
                            <Tippy content={"Sửa luật"}>
                              <div
                                className="icon_edit_rule"
                                onClick={() => {
                                  setDataRule(item);
                                  setIsFilter(true);
                                  setIndexRule(index);
                                }}
                              >
                                <Icon name="Pencil" />
                              </div>
                            </Tippy>
                            {listRuleData.length > 1 ? (
                              <Tippy content={"Xoá luật"}>
                                <div
                                  className="icon_delete_rule"
                                  onClick={() => {
                                    const newArray = [...listRuleData];
                                    newArray.splice(index, 1);
                                    setListRuleData(newArray);
                                  }}
                                >
                                  <Icon name="Trash" />
                                </div>
                              </Tippy>
                            ) : null}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {setupStep === 2 && (
        <div className="step__2">
          <div className="card-box wrapper__approach_sale">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
              <div>
                <h3 className="title__info">Quy trình bán hàng</h3>
              </div>
              {/* <div style={{width: '70%', justifyContent:'center', display:'flex'}}>
                                <div
                                    className="action__add--approach"
                                    onClick={() => {
                                        if(campaignId){
                                            addCampaignApproach(listApproach.length + 1)
                                        }
                                        
                                    }}
                                    // onClick={() => {
                                    //     setListApproachNew(oldArray => [...oldArray, {name: '', step:listApproach.length + 1,   activities:[], }])
                                    // }}
                                >
                                    <Icon name="PlusCircleFill" />
                                    Thêm quy trình
                                </div>
                            </div> */}
              <div style={{ flex: 1, justifyContent: "flex-end", display: "flex" }}>
                <div
                  className="button_add_approach"
                  onClick={() => {
                    if (campaignId) {
                      addCampaignApproach(listApproach.length + 1);
                    }
                  }}
                >
                  <Icon name="PlusCircleFill" />
                  <span className="title_button">Thêm quy trình </span>
                </div>
              </div>
            </div>
            {listApproach.map((item, index) => (
              <div key={index} className="container_approach_sale">
                <div style={{ width: "63%" }}>
                  <Input
                    fill={true}
                    label="Tên quy trình"
                    required={true}
                    value={item?.name}
                    onBlur={(e) => handleBlurValueApproach(e, index)}
                    onChange={(e) => handleChangeValueApproach(e, index)}
                    placeholder="Nhập bước tiếp theo"
                    // error={item.name ? false : checkFieldApproach}
                    error={item.checkName}
                    message="Bước tiếp theo không được để trống"
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {/* <div>
                                        <span style={{fontSize: 14, fontWeight:'600'}}>Lựa chọn hành động</span>
                                    </div> */}
                  <div className="container_setting_action">
                    {/* <div className="info__activity">
                                            <CheckboxList
                                                title=""
                                                options={listActivity}
                                                value={item?.activities ? JSON.parse(item?.activities).join() : ""}
                                                onChange={(e) => handleChangeValueActivity(e, index)}
                                            />
                                        </div> */}
                    <div
                      className="setting_action"
                      onClick={() => {
                        setModalSettingAction(true);
                        setApproachData(item);
                      }}
                    >
                      <Icon name="Settings" style={{ width: 18 }} />
                      <span className="title_setting">Cài đặt hành động</span>
                    </div>
                    <div
                      className="setting_action"
                      onClick={() => {
                        setModalSettingSLA(true);
                        setDataApproach(item);
                      }}
                    >
                      <Icon name="Settings" style={{ width: 18 }} />
                      <span className="title_setting">Cài đặt SLA</span>
                    </div>
                  </div>
                </div>
                {listApproach.length > 1 && (
                  <div className="action__remove--approach" title="Xóa" onClick={() => handleRemoveApproach(item.id, index)}>
                    <Icon name="Trash" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {setupStep === 8 && (
        <div style={{ marginBottom: "2rem" }}>
          <SettingPineline campaignId={campaignId} />
        </div>
      )}

      {setupStep === 6 && (
        <div className="card-box step_6">
          <div className="header_tab">
            {childDataOf6.map((item, index) =>
              formData.values.type === "biz" ? (
                item.value === 2 ? null : (
                  <div
                    key={index}
                    className={childStepOfStep6 === item.value ? "box_tab_active" : "box_tab_inactive"}
                    onClick={() => {
                      setChildStepOfStep6(item.value);
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: "500", color: childStepOfStep6 === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
                  </div>
                )
              ) : (
                <div
                  key={index}
                  className={childStepOfStep6 === item.value ? "box_tab_active" : "box_tab_inactive"}
                  onClick={() => {
                    setChildStepOfStep6(item.value);
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: "500", color: childStepOfStep6 === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
                </div>
              )
            )}
          </div>

          {formData.values.type === "per" && childStepOfStep6 === 2 && (
            <div className="card-box wrapper__setting_point_customer">
              {/* <h3 className="title__info">Cài đặt tính điểm khách hàng</h3> */}
              <div className="box_action">
                <span style={{ fontSize: 16, fontWeight: "500" }}>Email</span>
                <div style={{ marginTop: 10 }}>
                  {settingEmail.map((item, index) => (
                    <div key={index} className="setting">
                      <div style={{ width: "30%" }}>
                        <SelectCustom
                          id=""
                          name=""
                          label="Hành động"
                          options={[]}
                          fill={true}
                          special={true}
                          value={item.action}
                          required={false}
                          onChange={(e) => {
                            const newData = {
                              value: e.value,
                              label: e.label,
                              actionLevels:
                                e.actionLevels?.map((el) => {
                                  return { value: el.id, label: el.name };
                                }) || [],
                            };
                            setSettingEmail((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, action: newData };
                                }
                                return obj;
                              })
                            );
                          }}
                          isAsyncPaginate={true}
                          isFormatOptionLabel={true}
                          placeholder="Chọn hành động"
                          loadOptionsPaginate={loadedOptionEmailAction}
                          additional={{
                            page: 1,
                          }}
                        />
                      </div>

                      <div style={{ width: "30%" }}>
                        <SelectCustom
                          id=""
                          name=""
                          label="Thời gian"
                          options={item.action?.actionLevels?.length > 0 ? item.action?.actionLevels : []}
                          fill={true}
                          special={true}
                          value={item.time}
                          required={false}
                          onChange={(e) => {
                            setSettingEmail((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, time: e };
                                }
                                return obj;
                              })
                            );
                          }}
                          isAsyncPaginate={false}
                          isFormatOptionLabel={false}
                          placeholder="Chọn thời gian"
                          // additional={{
                          //     page: 1,
                          // }}
                        />
                      </div>

                      <div style={{ width: "30%" }}>
                        <NummericInput
                          fill={true}
                          value={item?.point}
                          thousandSeparator={true}
                          label={"Cộng điểm"}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSettingEmail((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, point: value };
                                }
                                return obj;
                              })
                            );
                          }}
                          placeholder="Nhập số điểm"
                          // error={item.name ? false : checkFieldApproach}
                          // error={item.checkName}
                          // message="Bước tiếp theo không được để trống"
                        />
                      </div>
                      <div
                        className="action__add--active"
                        onClick={() => {
                          // setIsFilter(true);
                          setSettingEmail((oldArray) => [...oldArray, { id: "", action: null, time: null, point: "" }]);
                        }}
                      >
                        <Icon name="PlusCircleFill" />
                      </div>

                      {settingEmail.length > 1 ? (
                        <div
                          className="action_remove_active"
                          title="Xóa"
                          onClick={() => {
                            const newArray = [...settingEmail];
                            newArray.splice(index, 1);
                            setSettingEmail(newArray);
                          }}
                        >
                          <Icon name="Trash" />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="box_action">
                <span style={{ fontSize: 16, fontWeight: "500" }}>Zalo</span>
                <div style={{ marginTop: 10 }}>
                  {settingZalo.map((item, index) => (
                    <div key={index} className="setting">
                      <div style={{ width: "30%" }}>
                        <SelectCustom
                          id=""
                          name=""
                          label="Hành động"
                          options={[]}
                          fill={true}
                          special={true}
                          value={item.action}
                          required={false}
                          onChange={(e) => {
                            const newData = {
                              value: e.value,
                              label: e.label,
                              actionLevels:
                                e.actionLevels?.map((el) => {
                                  return { value: el.id, label: el.name };
                                }) || [],
                            };
                            setSettingZalo((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, action: newData };
                                }
                                return obj;
                              })
                            );
                          }}
                          isAsyncPaginate={true}
                          isFormatOptionLabel={true}
                          placeholder="Chọn hành động"
                          loadOptionsPaginate={loadedOptionZaloAction}
                          additional={{
                            page: 1,
                          }}
                        />
                      </div>

                      <div style={{ width: "30%" }}>
                        <SelectCustom
                          id=""
                          name=""
                          label="Thời gian"
                          options={item.action?.actionLevels?.length ? item.action?.actionLevels : []}
                          fill={true}
                          special={true}
                          value={item.time}
                          required={false}
                          onChange={(e) => {
                            setSettingZalo((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, time: e };
                                }
                                return obj;
                              })
                            );
                          }}
                          isAsyncPaginate={false}
                          isFormatOptionLabel={false}
                          placeholder="Chọn thời gian"
                          // additional={{
                          //     page: 1,
                          // }}
                        />
                      </div>

                      <div style={{ width: "30%" }}>
                        <NummericInput
                          fill={true}
                          value={item?.point}
                          thousandSeparator={true}
                          label={"Cộng điểm"}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSettingZalo((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, point: value };
                                }
                                return obj;
                              })
                            );
                          }}
                          placeholder="Nhập số điểm"
                          // error={item.name ? false : checkFieldApproach}
                          // error={item.checkName}
                          // message="Bước tiếp theo không được để trống"
                        />
                      </div>
                      <div
                        className="action__add--active"
                        onClick={() => {
                          setSettingZalo((oldArray) => [...oldArray, { id: "", action: null, time: null, point: "" }]);
                        }}
                      >
                        <Icon name="PlusCircleFill" />
                      </div>

                      {settingZalo.length > 1 ? (
                        <div
                          className="action_remove_active"
                          title="Xóa"
                          onClick={() => {
                            const newArray = [...settingZalo];
                            newArray.splice(index, 1);
                            setSettingZalo(newArray);
                          }}
                        >
                          <Icon name="Trash" />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="box_action">
                <span style={{ fontSize: 16, fontWeight: "500" }}>SMS</span>
                <div style={{ marginTop: 10 }}>
                  {settingSms.map((item, index) => (
                    <div key={index} className="setting">
                      <div style={{ width: "30%" }}>
                        <SelectCustom
                          id=""
                          name=""
                          label="Hành động"
                          options={[]}
                          fill={true}
                          special={true}
                          value={item.action}
                          required={false}
                          onChange={(e) => {
                            const newData = {
                              value: e.value,
                              label: e.label,
                              actionLevels:
                                e.actionLevels?.map((el) => {
                                  return { value: el.id, label: el.name };
                                }) || [],
                            };
                            setSettingSms((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, action: newData };
                                }
                                return obj;
                              })
                            );
                          }}
                          isAsyncPaginate={true}
                          isFormatOptionLabel={true}
                          placeholder="Chọn hành động"
                          additional={{
                            page: 1,
                          }}
                          loadOptionsPaginate={loadedOptionSmsAction}
                        />
                      </div>

                      {/* <div style={{width: '30%'}}>
                                              <SelectCustom
                                                  id=""
                                                  name=""
                                                  label="Thời gian"
                                                  options={[
                                                      {
                                                          value: '7',
                                                          label:"Trong vòng 7 ngày"
                                                      },
                                                      {
                                                          value: '30',
                                                          label:'Trong vòng 30 ngày'
                                                      },
                                                      {
                                                          value: 'unlimit',
                                                          label: 'Không giới hạn'
                                                      },
                                                  ]}
                                                  fill={true}
                                                  special={true}
                                                  value={item.time    }
                                                  required={false}
                                                  onChange={(e) => {
                                                      setSettingSms((current) =>
                                                          current.map((obj, idx) => {
                                                              if (index === idx) {
                                                                  return { ...obj, time: e };
                                                              }
                                                              return obj;
                                                          })
                                                      );

                                                  }}
                                                  isAsyncPaginate={false}
                                                  isFormatOptionLabel={false}
                                                  placeholder="Chọn thời gian"
                                                  // additional={{
                                                  //     page: 1,
                                                  // }}
                                              />
                                          </div> */}

                      <div style={{ width: "30%" }}>
                        <NummericInput
                          fill={true}
                          value={item?.point}
                          thousandSeparator={true}
                          label={"Cộng điểm"}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSettingSms((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, point: value };
                                }
                                return obj;
                              })
                            );
                          }}
                          placeholder="Nhập số điểm"
                          // error={item.name ? false : checkFieldApproach}
                          // error={item.checkName}
                          // message="Bước tiếp theo không được để trống"
                        />
                      </div>
                      <div
                        className="action__add--active"
                        onClick={() => {
                          setSettingSms((oldArray) => [...oldArray, { id: "", action: null, time: null, point: "" }]);
                        }}
                      >
                        <Icon name="PlusCircleFill" />
                      </div>

                      {settingSms.length > 1 ? (
                        <div
                          className="action_remove_active"
                          title="Xóa"
                          onClick={() => {
                            const newArray = [...settingSms];
                            newArray.splice(index, 1);
                            setSettingSms(newArray);
                          }}
                        >
                          <Icon name="Trash" />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="box_action">
                <span style={{ fontSize: 16, fontWeight: "500" }}>Call</span>
                <div style={{ marginTop: 10 }}>
                  {settingCall.map((item, index) => (
                    <div key={index} className="setting">
                      <div style={{ width: "30%" }}>
                        <SelectCustom
                          id=""
                          name=""
                          label="Hành động"
                          options={[]}
                          fill={true}
                          special={true}
                          value={item.action}
                          required={false}
                          onChange={(e) => {
                            const newData = {
                              value: e.value,
                              label: e.label,
                              actionLevels:
                                e.actionLevels?.map((el) => {
                                  return { value: el.id, label: el.name };
                                }) || [],
                            };
                            setSettingCall((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, action: newData };
                                }
                                return obj;
                              })
                            );
                          }}
                          isAsyncPaginate={true}
                          isFormatOptionLabel={true}
                          placeholder="Chọn hành động"
                          loadOptionsPaginate={loadedOptionCallAction}
                          additional={{
                            page: 1,
                          }}
                        />
                      </div>

                      <div style={{ width: "30%" }}>
                        <SelectCustom
                          id=""
                          name=""
                          label="Thời gian"
                          options={item.action?.actionLevels?.length ? item.action?.actionLevels : []}
                          fill={true}
                          special={true}
                          value={item.time}
                          required={false}
                          onChange={(e) => {
                            setSettingCall((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, time: e };
                                }
                                return obj;
                              })
                            );
                          }}
                          isAsyncPaginate={false}
                          isFormatOptionLabel={false}
                          placeholder="Chọn thời gian"
                          // additional={{
                          //     page: 1,
                          // }}
                        />
                      </div>

                      <div style={{ width: "30%" }}>
                        <NummericInput
                          fill={true}
                          value={item?.point}
                          thousandSeparator={true}
                          label={"Cộng điểm"}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSettingCall((current) =>
                              current.map((obj, idx) => {
                                if (index === idx) {
                                  return { ...obj, point: value };
                                }
                                return obj;
                              })
                            );
                          }}
                          placeholder="Nhập số điểm"
                          // error={item.name ? false : checkFieldApproach}
                          // error={item.checkName}
                          // message="Bước tiếp theo không được để trống"
                        />
                      </div>
                      <div
                        className="action__add--active"
                        onClick={() => {
                          setSettingCall((oldArray) => [...oldArray, { id: "", action: null, time: null, point: "" }]);
                        }}
                      >
                        <Icon name="PlusCircleFill" />
                      </div>

                      {settingCall.length > 1 ? (
                        <div
                          className="action_remove_active"
                          title="Xóa"
                          onClick={() => {
                            const newArray = [...settingCall];
                            newArray.splice(index, 1);
                            setSettingCall(newArray);
                          }}
                        >
                          <Icon name="Trash" />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <h3 className="title__info">Phân loại khách hàng</h3>
                <div className="box_division_customer">
                  <div className="range-slider">
                    <Slider
                      range
                      min={0}
                      max={100}
                      marks={marks}
                      step={1}
                      pushable={pushable}
                      value={valueAnnotate}
                      onChange={handleChangeAnnotate}
                      trackStyle={trackStyle}
                    />
                    <span className="percent-range">%</span>
                  </div>

                  <div className="lst__annotate">
                    {lstAnnotate.map((item, idx) => {
                      return (
                        <div key={idx} className="item-annotate">
                          <span className="color" style={{ color: item.color, background: item.color }} />

                          <div className="__info--annotate">
                            <span className="name">{item.name}</span>
                            <span className="during">{item.during}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {childStepOfStep6 === 1 && (
            <div>
              {tabKpi === 1 && (
                <div className="card-box wrapper__setting_kpi_step_1">
                  <div>
                    <SelectCustom
                      key={dataKpiGoal.length}
                      id=""
                      name=""
                      label="Bộ chỉ tiêu"
                      options={[]}
                      fill={true}
                      // isMulti={true}
                      // special={true}
                      value={dataKpi}
                      required={false}
                      onChange={(e) => {
                        selectKpiGoal(e);
                      }}
                      isAsyncPaginate={true}
                      isFormatOptionLabel={true}
                      placeholder="Chọn bộ chỉ tiêu"
                      loadOptionsPaginate={loadedOptionKpi}
                      additional={{
                        page: 1,
                      }}
                    />
                  </div>

                  <div className="container-kpi-goal">
                    {dataKpiGoal && dataKpiGoal.length > 0
                      ? dataKpiGoal.map((item, index) => (
                          <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div className="box-kpi-goal">
                              <div className="name-kpi-goal">
                                <span style={{ fontSize: 14, fontWeight: "400" }}>{item.label}</span>
                              </div>

                              <div className="box-weight">
                                <div style={{ width: "35%" }}>
                                  <span style={{ fontSize: 14, fontWeight: "400" }}>Trọng số: </span>
                                </div>
                                <div className="form-group">
                                  <span className="style-weight">{item.weight}</span>
                                  {/* <NummericInput
                                                                name="weight"
                                                                id="weight"
                                                                // label="Số lượng thực tế"
                                                                fill={false}
                                                                value={item.weight === 0 ? '' : item.weight}
                                                                onValueChange={(e) => {
                                                                    const value = e.floatValue
                                                                    setDataKpiGoal((current) =>
                                                                        current.map((obj, idx) => {
                                                                            if (index === idx) {
                                                                            return { ...obj, weight: value || 0 };
                                                                            }
                                                                            return obj;
                                                                        })
                                                                    );
                                                                }}
                                                            /> */}
                                </div>
                              </div>

                              <div className="box-percent">
                                <span style={{ fontSize: 14, fontWeight: "400" }}>
                                  {sumWeight
                                    ? Number.isInteger((item.weight / sumWeight) * 100)
                                      ? (item.weight / sumWeight) * 100
                                      : ((item.weight / sumWeight) * 100).toFixed(1)
                                    : 0}
                                  %
                                </span>
                              </div>
                            </div>
                            {/* <div className="action__remove--kpi_goal" title="Xóa" 
                                                    onClick={() => handleRemoveKpiGoal(index)}
                                                >
                                                    <Icon name="Trash" />
                                                </div> */}
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              )}

              {tabKpi === 2 && (
                <div className="card-box wrapper__setting_kpi_step_2">
                  <div>
                    <div style={{ justifyContent: "flex-end", display: "flex" }}>
                      <Button
                        onClick={(e) => {
                          setShowModalConfigKpi(true);
                        }}
                      >
                        Thêm nhân viên
                      </Button>
                    </div>

                    {!isLoadingKpiEmployee && dataKpiEmployee && dataKpiEmployee.length > 0 ? (
                      <BoxTable
                        name=""
                        // className="table__document"
                        titles={titles}
                        items={dataKpiEmployee}
                        isPagination={false}
                        dataPagination={pagination}
                        dataMappingArray={(item, index) => dataMappingArray(item, index, "kpi")}
                        dataFormat={dataFormat}
                        // listIdChecked={listIdChecked}
                        isBulkAction={true}
                        // bulkActionItems={bulkActionList}
                        striped={true}
                        // setListIdChecked={(listId) => setListIdChecked(listId)}
                        actions={actionsTable}
                        actionType="inline"
                      />
                    ) : isLoadingKpiEmployee ? (
                      <Loading />
                    ) : (
                      <SystemNotification
                        description={
                          <span>
                            Hiện tại chưa có nhân viên nào. <br />
                            Hãy thêm mới nhân viên đầu tiên nhé!
                          </span>
                        }
                        type="no-item"
                        // titleButton="Thêm mới chiến dịch bán hàng"
                        // action={() => {
                        //     setIdCampaign(null);
                        //     // setShowModalAdd(true);
                        //     navigate("/create_sale_campaign");
                        // }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {setupStep === 7 && (
        <div className="card-box step_7">
          <div className="header_tab">
            {childDataOf7.map((item, index) =>
              formData.values.type === "biz" ? (
                item.value === 1 ? null : (
                  <div
                    key={index}
                    className={childStepOfStep7 === item.value ? "box_tab_active" : "box_tab_inactive"}
                    onClick={() => {
                      setChildStepOfStep7(item.value);
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: "500", color: childStepOfStep7 === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
                  </div>
                )
              ) : (
                <div
                  key={index}
                  className={childStepOfStep7 === item.value ? "box_tab_active" : "box_tab_inactive"}
                  onClick={() => {
                    setChildStepOfStep7(item.value);
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: "500", color: childStepOfStep7 === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
                </div>
              )
            )}
          </div>

          {formData.values.type === "per" && childStepOfStep7 === 1 && (
            <div className="card-box wapper_setting_operating_tab_1">
              {/* <h3 className="title__info">Giao điểm tín dụng</h3> */}
              <div className="setting_score_employee">
                <span style={{ fontSize: 18, fontWeight: "500" }}>Điểm tín dụng/Nhân viên:</span>
                <div className="form-group">
                  <NummericInput
                    name="quantity"
                    id="quantity"
                    // label="Số lượng thực tế"
                    fill={false}
                    value={scoreEmployee === 0 ? "" : scoreEmployee}
                    onValueChange={(e) => {
                      const value = e.floatValue;
                      setScoreEmployee(value);
                    }}
                  />
                </div>
              </div>
              <div className="container_score">
                <div className="container_left">
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: "500" }}>Trừ điểm</span>
                  </div>

                  <div className="box_line">
                    <span className="title_minus">Nhận 1 cơ hội:</span>
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={minusPoints.getLead === 0 ? "" : minusPoints.getLead}
                        onValueChange={(e) => {
                          const value = +e.floatValue || 0;
                          setMinusPoints({ ...minusPoints, getLead: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_point">điểm</span>
                    </div>
                  </div>

                  <div className="box_line">
                    <span className="title_minus">Vi phạm SLA:</span>
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={minusPoints.sla === 0 ? "" : minusPoints.sla}
                        onValueChange={(e) => {
                          const value = +e.floatValue || 0;
                          setMinusPoints({ ...minusPoints, sla: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_point">điểm</span>
                    </div>
                  </div>

                  <div className="box_line">
                    <span className="title_minus">Có 1 cơ hội thất bại:</span>
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={minusPoints.leadFail === 0 ? "" : minusPoints.leadFail}
                        onValueChange={(e) => {
                          const value = +e.floatValue || 0;
                          setMinusPoints({ ...minusPoints, leadFail: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_point">điểm</span>
                    </div>
                  </div>

                  <div className="box_line">
                    <span className="title_minus">Có 1 cơ hội bị thu hồi:</span>
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={minusPoints.leadTakeBack.point === 0 ? "" : minusPoints.leadTakeBack.point}
                        onValueChange={(e) => {
                          const value = +e.floatValue || 0;
                          setMinusPoints({ ...minusPoints, leadTakeBack: { ...minusPoints.leadTakeBack, point: value } });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_point">điểm</span>
                    </div>
                  </div>

                  {/* ///Thời gian quá hạn bị thu hồi */}
                  <div style={{ paddingLeft: "3rem" }}>
                    <div className="box_line_date">
                      <span className="title_expire">Quá hạn tương tác:</span>

                      <div className="box_expire">
                        <div className="box_time">
                          <div className="form-group">
                            <NummericInput
                              name="score"
                              id="score"
                              // label="Số lượng thực tế"
                              fill={false}
                              value={minusPoints.leadTakeBack.expireContact.day === 0 ? "" : minusPoints.leadTakeBack.expireContact.day}
                              onValueChange={(e) => {
                                const value = +e.floatValue || 0;
                                setMinusPoints({
                                  ...minusPoints,
                                  leadTakeBack: {
                                    ...minusPoints.leadTakeBack,
                                    expireContact: { ...minusPoints.leadTakeBack.expireContact, day: value },
                                  },
                                });
                              }}
                              error={timeExpireContact > timeExpireFinish ? true : false}
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
                              value={minusPoints.leadTakeBack.expireContact.hour === 0 ? "" : minusPoints.leadTakeBack.expireContact.hour}
                              onValueChange={(e) => {
                                const value = +e.floatValue || 0;
                                setMinusPoints({
                                  ...minusPoints,
                                  leadTakeBack: {
                                    ...minusPoints.leadTakeBack,
                                    expireContact: { ...minusPoints.leadTakeBack.expireContact, hour: value },
                                  },
                                });
                              }}
                              error={timeExpireContact > timeExpireFinish ? true : false}
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
                              value={minusPoints.leadTakeBack.expireContact.minute === 0 ? "" : minusPoints.leadTakeBack.expireContact.minute}
                              onValueChange={(e) => {
                                const value = +e.floatValue || 0;
                                setMinusPoints({
                                  ...minusPoints,
                                  leadTakeBack: {
                                    ...minusPoints.leadTakeBack,
                                    expireContact: { ...minusPoints.leadTakeBack.expireContact, minute: value },
                                  },
                                });
                              }}
                              error={timeExpireContact > timeExpireFinish ? true : false}
                            />
                          </div>
                          <div>
                            <span className="title_time">phút</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {timeExpireContact > timeExpireFinish ? (
                      <div style={{ marginTop: -15, paddingLeft: "8rem" }}>
                        <span style={{ fontSize: 10, color: "red" }}>Thời gian quá hạn tương tác không được lớn hơn thời gian giá hạn chốt</span>
                      </div>
                    ) : null}

                    <div className="box_line_date">
                      <span className="title_expire">Quá hạn chốt:</span>

                      <div className="box_expire">
                        <div className="box_time">
                          <div className="form-group">
                            <NummericInput
                              name="score"
                              id="score"
                              // label="Số lượng thực tế"
                              fill={false}
                              value={minusPoints.leadTakeBack.expireFinish.day === 0 ? "" : minusPoints.leadTakeBack.expireFinish.day}
                              onValueChange={(e) => {
                                const value = +e.floatValue || 0;
                                setMinusPoints({
                                  ...minusPoints,
                                  leadTakeBack: {
                                    ...minusPoints.leadTakeBack,
                                    expireFinish: { ...minusPoints.leadTakeBack.expireFinish, day: value },
                                  },
                                });
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
                              value={minusPoints.leadTakeBack.expireFinish.hour === 0 ? "" : minusPoints.leadTakeBack.expireFinish.hour}
                              onValueChange={(e) => {
                                const value = +e.floatValue || 0;
                                setMinusPoints({
                                  ...minusPoints,
                                  leadTakeBack: {
                                    ...minusPoints.leadTakeBack,
                                    expireFinish: { ...minusPoints.leadTakeBack.expireFinish, hour: value },
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
                              value={minusPoints.leadTakeBack.expireFinish.minute === 0 ? "" : minusPoints.leadTakeBack.expireFinish.minute}
                              onValueChange={(e) => {
                                const value = +e.floatValue || 0;
                                setMinusPoints({
                                  ...minusPoints,
                                  leadTakeBack: {
                                    ...minusPoints.leadTakeBack,
                                    expireFinish: { ...minusPoints.leadTakeBack.expireFinish, minute: value },
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
                  </div>
                  {/* /// */}
                </div>

                <div className="container_right">
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: "500" }}>Cộng điểm</span>
                  </div>

                  <div className="box_line">
                    <span className="title_minus">Có 1 tương tác:</span>
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={plusPoints.getContact === 0 ? "" : plusPoints.getContact}
                        onValueChange={(e) => {
                          const value = +e.floatValue || 0;
                          setPlusPoints({ ...plusPoints, getContact: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_point">điểm</span>
                    </div>
                  </div>

                  <div className="box_line">
                    <span className="title_minus">Có 1 cơ hội thành công:</span>
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={plusPoints.leadSuccess === 0 ? "" : plusPoints.leadSuccess}
                        onValueChange={(e) => {
                          const value = +e.floatValue || 0;
                          setPlusPoints({ ...plusPoints, leadSuccess: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_point">điểm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {childStepOfStep7 === 2 && (
            <div className="card-box wapper_setting_operating_tab_2">
              <KpiContact campaignId={campaignId} setDataViolation={setDataViolation} />
            </div>
          )}

          {childStepOfStep7 === 3 && (
            <div className="card-box wapper_setting_operating_tab_3">
              <ViolationWarning campaignId={campaignId} setDataViolation={setDataViolation} />
            </div>
          )}
        </div>
      )}

      <div className="button_bottom">
        {campaignId ? (
          <div style={{ display: "flex", gap: "0 2rem" }}>
            <Button
              color="primary"
              variant="outline"
              onClick={(e) => {
                handClearForm();
              }}
            >
              Danh sách chiến dịch
            </Button>

            {setupStep === 6 && childStepOfStep6 === 1 && tabKpi === 2 ? (
              <Button
                color="primary"
                variant="outline"
                onClick={(e) => {
                  setTabKpi(1);
                }}
              >
                Quay lại
              </Button>
            ) : null}
          </div>
        ) : (
          <Button
            color="primary"
            variant="outline"
            onClick={(e) => {
              handClearForm();
            }}
          >
            Danh sách chiến dịch
          </Button>
        )}

        <div>
          <Button
            // type="submit"
            color="primary"
            disabled={isSubmit}
            onClick={() => {
              // if (formData.values.type === "biz") {
              //   if (setupStep === 1) {
              //     onSubmit();
              //   } else if (setupStep === 2) {
              //     setSetupStep(5);
              //     showToast("Cài đặt quy trình thành công", "success");
              //     loadCampaignStep5(campaignId);
              //   }
              //   else if(setupStep === 6){
              //     if (tabKpi === 1) {
              //       onSubmitSaveKpi();
              //     } else if (tabKpi === 2) {
              //       handClearForm();
              //     }
              //   }

              // } else {
              if (setupStep === 1) {
                onSubmit();
              } else if (setupStep === 2) {
                // setSetupStep(3);
                showToast("Cài đặt quy trình thành công", "success");
                loadCampaignStep3(campaignId);
              }
              // else if (setupStep === 3) {
              //   onSubmitStep3();
              // }
              // else if (setupStep === 4) {
              //   if (timeExpireContact > timeExpireFinish) {
              //     showToast("Thời gian quá hạn tương tác không được lớn hơn thời gian giá hạn chốt", "error");
              //   } else {
              //     onSubmitStep4();
              //   }
              // }
              // else if (setupStep === 5) {
              //   if (tabKpi === 1) {
              //     onSubmitSaveKpi();
              //   } else if (tabKpi === 2) {
              //     handClearForm();
              //   }
              // }
              else if (setupStep === 6) {
                if (childStepOfStep6 === 2) {
                  onSubmitStep3();
                } else {
                  if (tabKpi === 1) {
                    onSubmitSaveKpi();
                  } else if (tabKpi === 2) {
                    handClearForm();
                  }
                }
              } else if (setupStep === 7) {
                if (childStepOfStep7 === 1) {
                  if (timeExpireContact > timeExpireFinish) {
                    showToast("Thời gian quá hạn tương tác không được lớn hơn thời gian giá hạn chốt", "error");
                  } else {
                    onSubmitStep4();
                  }
                }

                if (childStepOfStep7 === 3) {
                  onSubmitViolation();
                }
              }
              // }
            }}
          >
            {setupStep === 1 && !campaignId ? "Tạo chiến dịch" : "Cập nhật"}
            {/* { (setupStep === 6 && childStepOfStep6 === 2)  ? (tabKpi === 1 ? "Cập nhật" : "Đóng") : "Cập nhật"} */}
            {isSubmit ? <Icon name="Loading" /> : null}
          </Button>
        </div>
      </div>

      <FilterComponent
        onShow={isFilter}
        listRuleData={listRuleData}
        setListRuleData={setListRuleData}
        indexRule={indexRule}
        dataRule={dataRule}
        onHide={(check) => {
          if (check) {
            setFormData({ ...formData, values: { ...formData.values, saleDistributionType: "manual" } });
          }
          setIsFilter(false);
          setDataRule(null);
          setIndexRule(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />

      <ModalSettingActionApproach
        onShow={modalSettingAction}
        approachData={approachData}
        onHide={(reload) => {
          if (reload) {
            // loadCampaignApproaches(campaignId);
          }
          setModalSettingAction(false);
          setApproachData(null);
        }}
      />

      <ModalSettingSLA
        onShow={modalSettingSLA}
        dataApproach={dataApproach}
        onHide={(reload) => {
          if (reload) {
            loadCampaignApproaches(campaignId);
          }
          setModalSettingSLA(false);
          setDataApproach(null);
        }}
      />

      <ModalConfigKpiEmployee
        onShow={showModalConfigKpi}
        data={kpiEmployeeData}
        kayId={kayId}
        onHide={(reload) => {
          if (reload) {
            setTimeout(() => {
              getListEmployeeKpi(kayId);
            }, 2000);
          } else {
            setShowModalConfigKpi(false);
            setKpiEmployeeData(null);
          }
        }}
      />
    </div>
  );
}

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IAddCampaignModalProps } from "model/campaign/PropsModel";
import { ICampaignRequestModel } from "model/campaign/CampaignRequestModel";
import { ICampaignResponseModel } from "model/campaign/CampaignResponseModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Icon from "components/icon";
import Input from "components/input/input";
import FileUpload from "components/fileUpload/fileUpload";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import ImageThirdGender from "assets/images/third-gender.png";
import CampaignService from "services/CampaignService";
import CampaignApproachService from "services/CampaignApproachService";
import { ICampaignApproachFilterRequest, ICampaignApproachRequestModel } from "model/campaignApproach/CampaignApproachRequestModel";
import EmployeeService from "services/EmployeeService";
import SelectCustom from "components/selectCustom/selectCustom";
import CheckboxList from "components/checkbox/checkboxList";
import "./AddCampaignModal.scss";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import DepartmentService from "services/DepartmentService";
import { ContextType, UserContext } from "contexts/userContext";
import Radio from "components/radio/radio";
import Checkbox from "components/checkbox/checkbox";

interface IDataApproach {
  id: number;
  step: number;
  name: string;
  activities: string;
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

export default function AddCampaignModal(props: IAddCampaignModalProps) {
  const { onShow, idData, onHide } = props;

  const refOptionSpecialize = useRef();
  const refContainerSpecialize = useRef();

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //Chia làm 2 bước cấu hình (1 - cài đặt thông tin cơ bản chiến dịch, 2 - Quy trình bán hàng)
  const [setupStep, setSetupStep] = useState<number>(1);

  const [campaignId, setCampaignId] = useState<number>(0);

  const [indexSale, setIndexSale] = useState<number>(null);
  const [listApproach, setListApproach] = useState<IDataApproach[]>([]);

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

  const [data, setData] = useState<any>(null);

  const handleDetailData = async () => {
    const response = await CampaignService.detail(idData);

    if (response.code === 0) {
      const result: ICampaignResponseModel = response.result;

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

      setData({
        id: result.id,
        name: result.name,
        code: result.code,
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
        // approach: result.approach,
      });

      const branches0 = JSON.parse(result.branches0);
      const branches1 = JSON.parse(result.branches1);
      const branches2 = JSON.parse(result.branches2);
      const branches3 = JSON.parse(result.branches3);
      const branches4 = JSON.parse(result.branches4);
      const dataBranchList = result.lstBranch;

      let listBranchLevel0 = [];
      let listBranchLevel1 = [];
      let listBranchLevel2 = [];
      let listBranchLevel3 = [];
      let listBranchLevel4 = [];

      if (branches0.length > 0) {
        branches0.map((item) => {
          const newBranch = dataBranchList.find((el) => el.id === item);
          if (newBranch) {
            listBranchLevel0.push({
              value: newBranch.id,
              label: newBranch.name,
            });
          }
        });
      }

      if (branches1.length > 0) {
        branches1.map((item) => {
          const newBranch = dataBranchList.find((el) => el.id === item);
          if (newBranch) {
            listBranchLevel1.push({
              value: newBranch.id,
              label: newBranch.name,
              parentId: newBranch.parentId,
            });
          }
        });
      }

      if (branches2.length > 0) {
        branches2.map((item) => {
          const newBranch = dataBranchList.find((el) => el.id === item);
          if (newBranch) {
            listBranchLevel2.push({
              value: newBranch.id,
              label: newBranch.name,
              parentId: newBranch.parentId,
            });
          }
        });
      }

      if (branches3.length > 0) {
        branches3.map((item) => {
          const newBranch = dataBranchList.find((el) => el.id === item);
          if (newBranch) {
            listBranchLevel3.push({
              value: newBranch.id,
              label: newBranch.name,
              parentId: newBranch.parentId,
            });
          }
        });
      }

      if (branches4.length > 0) {
        branches4.map((item) => {
          const newBranch = dataBranchList.find((el) => el.id === item);
          if (newBranch) {
            listBranchLevel4.push({
              value: newBranch.id,
              label: newBranch.name,
              parentId: newBranch.parentId,
            });
          }
        });
      }

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
      const lstDepartment = result.lstDepartment;
      if (lstDepartment.length > 0) {
        const newDepartmentId = lstDepartment.map((item) => {
          return item.id;
        });

        const newDataDepartment = lstDepartment.map((item) => {
          return {
            value: item.value,
            label: item.name,
            branchName: item.branchName,
          };
        });

        setDepartmentId(newDepartmentId);
        setDataDepartment(newDataDepartment);
      }
    }
  };

  useEffect(() => {
    if (idData && onShow) {
      handleDetailData();
    }
  }, [onShow, idData]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        code: data?.code ?? "",
        cover: data?.cover ?? "",
        startDate: data?.startDate ?? "",
        endDate: data?.endDate ?? "",
        position: data?.position ?? "",
        employeeId: data?.employeeId ?? "",
        totalRevenue: data?.totalRevenue ?? "",
        totalCustomer: data?.totalCustomer ?? "",
        averageConvertRate: data?.averageConvertRate ?? "",
        divisionMethod: data?.divisionMethod?.toString() ?? "1",
        sales: data?.sales ?? "[]",
        // approach: data?.approach ?? "[]",
        branches0: "[]",
        branches1: "[]",
        branches2: "[]",
        branches3: "[]",
        branches4: "[]",
        departments: "[]",
      } as ICampaignRequestModel),
    [data, onShow]
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

  // lấy người phụ trách
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const [dataEmployee, setDataEmployee] = useState(null);

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

  const handleChangeValueEmployee = (e) => {
    setCheckFieldEmployee(false);
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };

  // lấy chi nhanh
  const [listBranchId, setListBranchId] = useState({
    level0: [],
    level1: [],
    level2: [],
    level3: [],
    level4: [],
  });

  useEffect(() => {
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        branches0: JSON.stringify(listBranchId.level0),
        branches1: JSON.stringify(listBranchId.level1),
        branches2: JSON.stringify(listBranchId.level2),
        branches3: JSON.stringify(listBranchId.level3),
        branches4: JSON.stringify(listBranchId.level4),
      },
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

  const [checkFieldBranch, setCheckFieldBranch] = useState<boolean>(false);
  const [valueBranch, setValueBranch] = useState([]);

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
  // useEffect(() => {
  //   if(listBranchDeleted0 && listBranchValue.length >= 2){
  //     const newlistBranch1 = listBranchValue[1] && listBranchValue[1].value.length > 0
  //       && listBranchValue[1].value.filter(el => el.parentId !== listBranchDeleted0) || [];

  //     setListBranchValue(current =>
  //       current.map((obj, index) => {
  //           if (index === 1) {
  //               return {...obj, value: newlistBranch1};
  //           }
  //           return obj;
  //       }),
  //     );

  //     const newListBranchDeleted1 = listBranchValue[1] && listBranchValue[1].value.length > 0
  //       && listBranchValue[1].value.filter(el => el.parentId === listBranchDeleted0) || [];

  //     const newArrayBranchDeleted = newListBranchDeleted1 && newListBranchDeleted1.length > 0
  //       && newListBranchDeleted1.map(item => {
  //         return item.value;
  //       })

  //     setListBranchDelete0(null)
  //     setListBranchDelete1(newArrayBranchDeleted);

  //   }

  // }, [listBranchDeleted0])
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
    setFormData({ ...formData, values: { ...formData?.values, departments: JSON.stringify(listDepartmentId) } });
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
      setFormData({ ...formData, values: { ...formData?.values, sales: JSON.stringify(allSales) } });
    } else {
      // if (listSales.length > 0) {
      const result = listSales.map((item) => {
        return {
          employeeId: item.employee?.value,
          rank: item.rank?.value,
        };
      });

      setFormData({ ...formData, values: { ...formData?.values, sales: JSON.stringify(result) } });
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
        showToast("Xóa thành công", "success");
        loadCampaignApproaches(campaignId);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    });
  };

  /**
   * Thực hiện bước 1
   */
  const listField = useMemo(
    () =>
      [
        {
          label: "Tên chiến dịch",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mã chiến dịch",
          name: "code",
          type: "text",
          fill: true,
        },
        {
          name: "mergeForm",
          type: "custom",
          snippet: (
            <div className="wrapper__merge--form">
              <div
                className={`form__left ${checkFieldStartDate || checkFieldEndDate ? "one__error" : ""} ${
                  (checkFieldStartDate && checkFieldEndDate) || (startDay > endDay && endDay < startDay) ? "two__error" : ""
                }`}
              >
                <FileUpload label="Ảnh chiến dịch" type="cover" formData={formData} setFormData={setFormData} />
              </div>
              <div className="form__right">
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
          ),
        },
        {
          name: "employeeId",
          type: "custom",
          snippet: (
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
          ),
        },
        {
          label: "Tổng doanh thu chiến dịch",
          name: "totalRevenue",
          type: "number",
          fill: true,
        },
        {
          label: "Tổng đơn hàng thành công",
          name: "totalCustomer",
          type: "number",
          fill: true,
        },
        {
          label: "Tỷ lệ chuyển đổi toàn chiến dịch (%)",
          name: "averageConvertRate",
          type: "text",
          fill: true,
        },
        {
          label: "Phân chia cơ hội",
          name: "divisionMethod",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Phân chia cơ hội theo năng lực sale",
            },
            {
              value: "2",
              label: "Phân chia đều cơ hội",
            },
            {
              value: "3",
              label: "Phân chia theo tỉ lệ chốt đơn",
            },
            {
              value: "4",
              label: "Phân chia theo thủ công",
            },
          ],
        },

        {
          name: "branchId",
          type: "custom",
          snippet: (
            <div>
              {/* <SelectCustom
                  id="branchId"
                  name="branchId"
                  label="Chi nhánh"
                  options={[]}
                  fill={true}
                  isMulti={true}
                  value={valueBranch}
                  required={true}
                  onChange={(e) => handleChangeValueBranch(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn chi nhánh"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionBranch}
                  // formatOptionLabel={formatOptionLabelEmployee}
                  // error={checkFieldEmployee}
                  // message="Người phụ trách không được bỏ trống"
                /> */}

              {listBranchValue.map((item, index) => {
                return (
                  <div className="box_branch" style={index > 0 ? { marginTop: 20 } : {}}>
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
                        // formatOptionLabel={formatOptionLabelEmployee}
                        // error={checkFieldEmployee}
                        // message="Người phụ trách không được bỏ trống"
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
          ),
        },

        {
          name: "departmentId",
          type: "custom",
          snippet: (
            // <div>
            //   <div className="box_branch">
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
            //   </div>
            // </div>
          ),
        },

        {
          name: "sales",
          type: "custom",
          snippet: (
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
                  <Icon name="PlusCircleFill" style={{ fill: listDepartmentId.length > 0 ? "var(--primary-color-90)" : "var(--extra-color-50)" }} />
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
                          style={item.employee ? { height: "4.3rem" } : { height: "3.8rem" }}
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
          ),
        },
      ] as IFieldCustomize[],
    [
      formData,
      dataEmployee,
      checkFieldEmployee,
      checkFieldStartDate,
      checkFieldEndDate,
      data,
      listSales,
      isOptionRank,
      formData?.values,
      indexSale,
      startDay,
      endDay,
      checkFieldSales,
      lstIdSale,
      valueBranch,
      dataDepartment,
      listBranchValue,
      listBranchId,
      listDepartment,
      selectAllSales,
    ]
  );

  /**
   * Thực hiện bước 2
   */
  const listFieldMethods = useMemo(
    () =>
      [
        {
          name: "approach",
          type: "custom",
          snippet: (
            <div className="wrapper__approach">
              <h4>Quy trình bán hàng</h4>

              <div className="list__approach">
                <div className="action__add--approach" onClick={() => addCampaignApproach(listApproach.length + 1)}>
                  <Icon name="PlusCircleFill" />
                  Thêm quy trình
                </div>

                {listApproach.map((item, idx) => {
                  return (
                    <div key={idx} className="item__approach">
                      <div className="info__approach">
                        <Input
                          fill={true}
                          value={item?.name}
                          onBlur={(e) => handleBlurValueApproach(e, idx)}
                          onChange={(e) => handleChangeValueApproach(e, idx)}
                          placeholder="Nhập bước tiếp theo"
                          // error={item.name ? false : checkFieldApproach}
                          error={item.checkName}
                          message="Bước tiếp theo không được để trống"
                        />
                        {listApproach.length > 1 && (
                          <div className="action__remove--approach" title="Xóa" onClick={() => handleRemoveApproach(item.id, idx)}>
                            <Icon name="Trash" />
                          </div>
                        )}
                      </div>
                      {/* Danh sách các activities */}
                      <div className="info__activity">
                        <CheckboxList
                          title=""
                          options={listActivity}
                          value={item?.activities ? JSON.parse(item?.activities).join() : ""}
                          onChange={(e) => handleChangeValueActivity(e, idx)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ),
        },
      ] as IFieldCustomize[],
    [formData, data, listApproach, checkFieldApproach]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
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
      ...(data ? { id: data?.id } : {}),
      ...(formData?.values as ICampaignRequestModel),
    };

    const response = await CampaignService.update(body);

    if (response.code == 0) {
      // setDataEmployee(null);
      // setListSales([{ employee: null, rank: { label: "Khá", value: 6 } }]);
      // setLstIdSale([]);

      //Chuyển qua bước 2
      setSetupStep(2);
      setCampaignId(response.result?.id);
      loadCampaignApproaches(response.result?.id);
      // setValueBranch([]);
      // setDataDepartment([])
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

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
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  /**
   * Cập nhật phương thức bán hàng => Chỉ kiểm tra xem thằng nào chưa validate => Yêu cầu validate
   * @param e
   * @returns
   */
  const validateFormMethod = async (e) => {
    e && e.preventDefault();
    const errors = Validate(validations, formData, listFieldMethods);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const checkEmtyApproach = listApproach.filter((el) => el.name === "");
    if (checkEmtyApproach.length > 0) {
      setCheckFieldApproach(true);
      return;
    }

    showToast(`Cập nhật chiến dịch thành công`, "success");
    setDataEmployee(null);
    setData(null);
    setListApproach([]);
    onHide(true);
    setListSales([]);
    setLstIdSale([]);

    // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // setIsSubmit(false);
  };

  const handClearForm = () => {
    onHide(false);
    setDataEmployee(null);
    setData(null);
    setListApproach([]);
    setLstIdSale([]);
    setListSales([]);
    setSetupStep(1);
    setValueBranch([]);
    setDataDepartment([]);
    setListBranchValue([
      {
        id: "level_0",
        value: [],
      },
    ]);
    setListBranchId({
      level0: [],
      level1: [],
      level2: [],
      level3: [],
      level4: [],
    });
    setListBranchDelete0([]);
    setListBranchDelete1([]);
    setListBranchDelete2([]);
    setListBranchDelete3([]);
    setCheckFieldSales(false);
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
            // title: data ? "Cập nhật" : "Tạo mới",
            title: "Tiếp theo",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldEmployee ||
              checkFieldStartDate ||
              checkFieldEndDate ||
              startDay > endDay ||
              endDay < startDay ||
              // checkFieldApproach ||
              checkFieldSales ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            // ||
            // (!isDifferenceObj(formData.values, values) && valueBranch.length === 0 && dataDepartment.length === 0 ),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [
      formData,
      values,
      checkFieldEmployee,
      checkFieldEndDate,
      checkFieldStartDate,
      isSubmit,
      data,
      startDay,
      endDay,
      checkFieldApproach,
      checkFieldSales,
      valueBranch,
      dataDepartment,
    ]
  );

  const actionsMethods = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Quay lại",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              // !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
              setSetupStep(1);
              setCampaignId(0);
              loadCampaignApproaches(0);
            },
          },
          {
            title: "Cập nhật",
            // type: "submit",
            color: "primary",
            disabled: isSubmit || checkFieldApproach || (formData.errors && Object.keys(formData.errors).length > 0),
            // is_loading: isSubmit,
            callback: () => {
              onHide(true);
              setDataEmployee(null);
              setData(null);
              setListApproach([]);
              setLstIdSale([]);
              setListSales([]);
              setTimeout(() => {
                setSetupStep(1);
              }, 2000);
              // setValueBranch([]);
              // setDataDepartment([])
              setListBranchValue([
                {
                  id: "level_0",
                  value: [],
                },
              ]);
              setListBranchId({
                level0: [],
                level1: [],
                level2: [],
                level3: [],
                level4: [],
              });
              setListBranchDelete0([]);
              setListBranchDelete1([]);
              setListBranchDelete2([]);
              setListBranchDelete3([]);
              setCheckFieldSales(false);
            },
          },
        ],
      },
    }),
    [
      formData,
      values,
      checkFieldEmployee,
      checkFieldEndDate,
      checkFieldStartDate,
      isSubmit,
      data,
      startDay,
      endDay,
      checkFieldApproach,
      checkFieldSales,
    ]
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-campaign"
      >
        <form className="form-add-campaign" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${idData ? "Chỉnh sửa" : "Thêm mới"} chiến dịch bán hàng`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="list-form-group">
              {setupStep == 1
                ? listField.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                      formData={formData}
                    />
                  ))
                : listFieldMethods.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldMethods, setFormData)}
                      formData={formData}
                    />
                  ))}
            </div>
          </ModalBody>
          <ModalFooter actions={setupStep == 1 ? actions : actionsMethods} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

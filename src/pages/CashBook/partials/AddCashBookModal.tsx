import React, { useState, useEffect, useMemo, Fragment, useCallback, useContext } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICashbookRequest } from "model/cashbook/CashbookRequestModel";
import { ICategoryFilterRequest } from "model/category/CategoryResquestModel";
import { AddCashBookModalProps } from "model/cashbook/PropsModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import FileUpload from "components/fileUpload/fileUpload";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import ImageThirdGender from "assets/images/third-gender.png";
import InvoiceService from "services/InvoiceService";
import EmployeeService from "services/EmployeeService";
import CustomerService from "services/CustomerService";
import CashbookService from "services/CashbookService";
import CategoryService from "services/CategoryService";
import "./AddCashBookModal.scss";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import { ContextType, UserContext } from "contexts/userContext";
import WorkProjectService from "services/WorkProjectService";
import ContractService from "services/ContractService";

export default function AddCashBookModal(props: AddCashBookModalProps) {
  const { onShow, onHide, dataCashBook, type, dataContractPayment } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [listCategory, setListCategory] = useState<IOption[]>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState<boolean>(false);

  const [listBeautyBranch, setListBeautyBranch] = useState<IOption[]>(null);
  const [isLoadingBeautyBranch, setIsLoadingBeautyBranch] = useState<boolean>(false);

  const [dataEmployee, setDataEmployee] = useState(null);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);

  const [isShowCustomer, setIsShowCustomer] = useState<boolean>(false);

  const getDetailCashbook = async (id: number) => {
    const response = await CashbookService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      if (result?.projectId) {
        setDataProject({ value: result?.projectId, label: result?.projectName });
      }
      if (result?.contractId) {
        setDataContract({ value: result?.contractId, label: result?.contractName });
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

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

  //! đoạn này xử lý vấn đề hiển thị hình ảnh nhân viên
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

  //! đoạn này xử lý vấn đề thay đổi nhân viên
  const handleChangeValueEmployee = (e) => {
    setCheckFieldEmployee(false);
    setDataEmployee(e);
  };

  const getDetailEmployee = async () => {
    setIsLoadingEmployee(true);

    const response = await EmployeeService.detail(dataCashBook?.employeeId);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      };

      setDataEmployee(detailData);
    }

    setIsLoadingEmployee(false);
  };

  useEffect(() => {
    if (dataCashBook?.employeeId && onShow) {
      getDetailEmployee();
    }
  }, [dataCashBook?.employeeId, onShow]);

  useEffect(() => {
    if (dataCashBook) {
      getDetailCashbook(dataCashBook.id);
    }
  }, [dataCashBook]);

  //! call api chi tiết loại thu hoặc loại chi
  const getDetailCategory = async (id: number) => {
    const response = await CategoryService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      if (result?.source) {
        setIsShowCustomer(true);
      }
    }
  };

  useEffect(() => {
    if (onShow && dataCashBook?.categoryId) {
      getDetailCategory(dataCashBook.categoryId);
    }
  }, [onShow, dataCashBook?.categoryId]);

  //Call API danh sách loại thu chi
  const onSelectOpenCategory = async () => {
    setIsLoadingCategory(true);

    const params: ICategoryFilterRequest = {
      name: "",
      type,
    };

    const dataOption = await CategoryService.list(params);
    if (dataOption && dataOption.code === 0) {
      setListCategory([
        ...dataOption.result.map((item) => {
          return {
            value: item.id,
            label: item.name,
            source: item.source,
          };
        }),
      ]);
    }

    setIsLoadingCategory(false);
  };

  useEffect(() => {
    if (dataCashBook?.categoryId && type) {
      onSelectOpenCategory();
    }

    if (dataCashBook?.categoryId === null) {
      setListCategory([]);
    }
  }, [dataCashBook, type]);

  //Thay đổi kiểu thu chi
  const handleChangeValueCategory = (e) => {
    if (e.source) {
      setIsShowCustomer(true);
    } else {
      setIsShowCustomer(false);
    }
  };

  // khách hàng
  const [dataCustomer, setDataCustomer] = useState(null);
  // console.log('dataCustomer', dataCustomer);

  const [checkFieldCustomer, setCheckFieldCustomer] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách khách hàng
  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
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
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: `${item.name} - ${item.phoneMasked}`,
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
    setDataDebtInvoice(null);
    onSelectOpenDebtInvoice(e.value);
  };

  // đoạn này xử lý lấy ra danh sách tiền thu, chi từ khách hàng
  const [listDebtInvoice, setListDebtInvoice] = useState<IOption[]>([]);
  const [isLoadingDebtInvoice, setIsLoadingDebtInvoice] = useState<boolean>(false);
  const [dataDebtInvoice, setDataDebtInvoice] = useState(null);
  const [infoInvoice, setInfoInvoice] = useState({
    total: 0,
    debt: 0,
    fee: 0,
    paid: 0,
    discount: 0,
  });

  const onSelectOpenDebtInvoice = async (id: number) => {
    if (!id) return;

    setIsLoadingDebtInvoice(true);

    const response = await InvoiceService.debtInvoice(id);

    if (response.code === 0) {
      const dataOption = response.result;
      setListDebtInvoice([
        ...(dataOption.length > 0
          ? dataOption.map((item) => {
              return {
                value: item.id,
                label: item.invoiceCode,
                amount: item.amount,
                fee: item.fee,
                debt: item.debt,
                paid: item.paid,
                discount: item.discount,
                invoiceType: item.invoiceType,
              };
            })
          : []),
      ]);
    }

    setIsLoadingDebtInvoice(false);
  };

  // thay đổi hóa đơn
  const handleChangeValueDebtInvoice = (e) => {
    setDataDebtInvoice(e);
  };

  const getDetailInvoice = async (idInvoice: number) => {
    const response = await InvoiceService.listInvoiceDetail(idInvoice);

    if (response.code === 0) {
      const result = response.result.invoice;
      setDataCustomer({
        value: result.customerId,
        label: `${result.customerName} - ${result.customerPhone}`,
        avatar: result.customerAvatar,
      });

      setDataDebtInvoice({
        value: result.id,
        label: result.invoiceCode,
        amount: result.amount,
        fee: result.fee,
        debt: result.debt,
        paid: result.paid,
        discount: result.discount,
        invoiceType: result.invoiceType,
      });
    }
  };

  const [dataProject, setDataProject] = useState(null);

  const loadOptionProject = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      parentId: -1,
    };
    const response = await WorkProjectService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: any) => {
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

  const handleChangeValueProject = (e) => {
    setDataProject(e);
    setFormData({ ...formData, values: { ...formData?.values, projectId: e.value } });
  };

  const [dataContract, setDataContract] = useState(null);

  const loadOptionContract = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await ContractService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: any) => {
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

  const handleChangeValueContract = (e) => {
    setDataContract(e);
    setFormData({ ...formData, values: { ...formData?.values, contractId: e.value } });
  };

  //! xử lý call lấy chi tiết hóa đơn
  useEffect(() => {
    if (dataCashBook?.categoryId && dataCashBook?.invoiceId && onShow && isShowCustomer) {
      getDetailInvoice(dataCashBook.invoiceId);
    }
  }, [dataCashBook?.categoryId, dataCashBook?.invoiceId, onShow, isShowCustomer]);

  useEffect(() => {
    if (dataDebtInvoice) {
      setInfoInvoice({
        total: dataDebtInvoice.amount,
        debt: dataDebtInvoice.debt,
        discount: dataDebtInvoice.discount,
        paid: dataDebtInvoice.paid,
        fee: dataDebtInvoice.fee,
      });
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          invoiceId: dataDebtInvoice.value,
          invoiceType: dataDebtInvoice.invoiceType,
        },
      });
    } else {
      setInfoInvoice({
        total: 0,
        debt: 0,
        discount: 0,
        paid: 0,
        fee: 0,
      });
    }
  }, [dataDebtInvoice]);

  // CallAPI danh sách chi nhánh

  const [branchId, setBranchId] = useState(null);

  const branchList = async () => {
    const param: IBeautyBranchFilterRequest = {
      name: "",
      page: 1,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;
      if (dataOption?.length === 1) {
        setBranchId(dataOption[0].id);
      }
    }
  };

  useEffect(() => {
    // if(!dataCashBook?.branchId && !dataCashBook?.id){
    //   branchList()
    // } else {
    //   setBranchId(null)
    // }
    setBranchId(dataBranch.value);
  }, [dataCashBook, onShow, dataBranch]);

  const onSelectOpenBeautyBranch = async () => {
    if (!listBeautyBranch || listBeautyBranch.length === 0) {
      setIsLoadingBeautyBranch(true);
      const dataOption = await SelectOptionData("beautyBranch");
      if (dataOption) {
        setListBeautyBranch([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingBeautyBranch(false);
    }
  };

  useEffect(() => {
    if (dataCashBook?.branchId && checkUserRoot == "1") {
      onSelectOpenBeautyBranch();
    }
    if (dataCashBook?.branchId == null && !dataCashBook?.id) {
      if (dataBranch && checkUserRoot == "1") {
        onSelectOpenBeautyBranch();
      } else {
        setListBeautyBranch([]);
      }
    }
  }, [dataCashBook, checkUserRoot, branchId, dataBranch]);

  useEffect(() => {
    if (dataEmployee) {
      setFormData({ ...formData, values: { ...formData?.values, employeeId: dataEmployee.value } });
    }
  }, [dataEmployee]);

  const values = useMemo(
    () =>
      ({
        transDate: dataCashBook?.transDate ?? "",
        categoryId: dataCashBook?.categoryId ?? null,
        employeeId: dataCashBook?.employeeId ?? null,
        branchId: dataCashBook?.branchId ?? dataBranch.value ?? null,
        amount: dataCashBook?.amount ?? "",
        note: dataCashBook?.note,
        type: dataCashBook?.type ?? type,
        bill: dataCashBook?.bill ?? "",
        invoiceId: dataCashBook?.invoiceId ?? null,
        invoiceType: dataCashBook?.invoiceType ?? "",
        projectId: dataCashBook?.projectId ?? "",
        contractId: dataCashBook?.contractId ?? "",
      } as ICashbookRequest),
    [dataCashBook, onShow, branchId, dataBranch]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "categoryId",
      rules: "required",
    },
    {
      name: "transDate",
      rules: "required",
    },
    {
      name: "branchId",
      rules: "required",
    },
    {
      name: "amount",
      rules: `required|min:0|max:${infoInvoice.debt}`,
    },
  ];

  const listField = useMemo(
    () =>
      [
        // {
        //   label: "Chi nhánh",
        //   name: "branchId",
        //   type: "select",
        //   fill: true,
        //   required: true,
        //   disabled: true,
        //   options: listBeautyBranch,
        //   onMenuOpen: onSelectOpenBeautyBranch,
        //   isLoading: isLoadingBeautyBranch,
        // },
        {
          label: "Ngày tạo",
          name: "transDate",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          required: true,
          hasSelectTime: true,
          placeholder: "Chọn ngày tạo",
        },
        {
          label: `Loại ${type == 1 ? "thu" : "chi"}`,
          name: "categoryId",
          type: "select",
          fill: true,
          required: true,
          options: listCategory,
          onMenuOpen: onSelectOpenCategory,
          isLoading: isLoadingCategory,
          onChange: (e) => handleChangeValueCategory(e),
        },
        ...(isShowCustomer
          ? ([
              {
                name: "customerId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    key={formData.values.categoryId}
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
                  />
                ),
              },
              {
                name: "debtInvoice",
                type: "custom",
                snippet: (
                  <SelectCustom
                    id="debtInvoice"
                    name="debtInvoice"
                    label="Hóa đơn"
                    options={listDebtInvoice}
                    special={true}
                    value={dataDebtInvoice}
                    fill={true}
                    required={true}
                    isLoading={isLoadingDebtInvoice}
                    placeholder="Chọn hóa đơn"
                    onChange={(e) => handleChangeValueDebtInvoice(e)}
                  />
                ),
              },
              {
                name: "totalInvoice",
                type: "custom",
                snippet: (
                  <NummericInput
                    id="totalInvoice"
                    name="totalInvoice"
                    fill={true}
                    label="Tổng tiền hóa đơn"
                    thousandSeparator={true}
                    disabled={true}
                    value={infoInvoice.total}
                    placeholder="Tổng tiền từ hóa đơn"
                  />
                ),
              },
              {
                name: "discount",
                type: "custom",
                snippet: (
                  <NummericInput
                    id="discount"
                    name="discount"
                    fill={true}
                    label="Giảm giá"
                    thousandSeparator={true}
                    disabled={true}
                    value={infoInvoice.discount || 0}
                    placeholder="Được giảm giá"
                  />
                ),
              },
              {
                name: "fee",
                type: "custom",
                snippet: (
                  <NummericInput
                    id="fee"
                    name="fee"
                    fill={true}
                    label="Tổng tiền khách phải trả"
                    thousandSeparator={true}
                    disabled={true}
                    value={infoInvoice.fee}
                    placeholder="Tổng tiền khách phải trả"
                  />
                ),
              },
              {
                name: "paid",
                type: "custom",
                snippet: (
                  <NummericInput
                    id="paid"
                    name="paid"
                    fill={true}
                    label="Khách đã trả"
                    thousandSeparator={true}
                    disabled={true}
                    value={infoInvoice.paid}
                    placeholder="Khách đã trả"
                  />
                ),
              },
              {
                name: "debt",
                type: "custom",
                snippet: (
                  <NummericInput
                    id="debt"
                    name="debt"
                    fill={true}
                    label="Còn nợ"
                    thousandSeparator={true}
                    disabled={true}
                    value={infoInvoice.debt}
                    placeholder="Khách còn nợ"
                  />
                ),
              },
            ] as IFieldCustomize[])
          : []),
        {
          name: "employeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={formData.values?.categoryId}
              id="employeeId"
              name="employeeId"
              label={`Người ${type == 1 ? "thu" : "chi"}`}
              options={[]}
              fill={true}
              value={dataEmployee}
              required={true}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder={`Chọn người ${type == 1 ? "thu" : "chi"}`}
              additional={{
                page: 1,
              }}
              error={checkFieldEmployee}
              message={`Người ${type == 1 ? "thu" : "chi"} không được bỏ trống`}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              isLoading={dataCashBook?.employeeId ? isLoadingEmployee : null}
            />
          ),
        },
        {
          label: "Số tiền",
          name: "amount",
          type: "number",
          fill: true,
          required: true,
        },

        ...(type === 2
          ? [
              {
                name: "projectId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    key={formData.values?.projectId}
                    id="projectId"
                    name="projectId"
                    label={`Dự án`}
                    options={[]}
                    fill={true}
                    value={dataProject}
                    required={false}
                    onChange={(e) => handleChangeValueProject(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder={`Chọn dự án`}
                    additional={{
                      page: 1,
                    }}
                    // error={checkFieldEmployee}
                    // message={`Người ${type == 1 ? "thu" : "chi"} không được bỏ trống`}
                    loadOptionsPaginate={loadOptionProject}
                    // formatOptionLabel={formatOptionLabelEmployee}
                    // isLoading={dataCashBook?.employeeId ? isLoadingEmployee : null}
                  />
                ),
              },

              {
                name: "contractId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    key={formData.values?.projectId}
                    id="contractId"
                    name="contractId"
                    label={`Hợp đồng`}
                    options={[]}
                    fill={true}
                    value={dataContract}
                    required={false}
                    onChange={(e) => handleChangeValueContract(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder={`Chọn hợp đồng`}
                    additional={{
                      page: 1,
                    }}
                    // error={checkFieldEmployee}
                    // message={`Người ${type == 1 ? "thu" : "chi"} không được bỏ trống`}
                    loadOptionsPaginate={loadOptionContract}
                    // formatOptionLabel={formatOptionLabelEmployee}
                    // isLoading={dataCashBook?.employeeId ? isLoadingEmployee : null}
                  />
                ),
              },
            ]
          : []),

        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [
      dataEmployee,
      isLoadingEmployee,
      checkFieldEmployee,
      listBeautyBranch,
      isLoadingBeautyBranch,
      listCategory,
      isLoadingCategory,
      type,
      isShowCustomer,
      dataCustomer,
      checkFieldCustomer,
      listDebtInvoice,
      isLoadingDebtInvoice,
      infoInvoice,
      dataDebtInvoice,
      formData,
      dataProject,
      dataContract,
    ]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const handClearForm = (acc) => {
    onHide(acc);
    setDataCustomer(null);
    setDataEmployee(null);
    setDataDebtInvoice(null);
    setIsShowCustomer(false);
    setInfoInvoice({ total: 0, debt: 0, paid: 0, discount: 0, fee: 0 });
    setListDebtInvoice([]);
    setDataProject(null);
    setDataContract(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (!dataEmployee) {
      setCheckFieldEmployee(true);
      return;
    }

    if (isShowCustomer && !dataCustomer) {
      setCheckFieldCustomer(true);
      return;
    }

    setIsSubmit(true);

    const body: ICashbookRequest = {
      ...(dataCashBook ? { id: dataCashBook?.id } : {}),
      ...(dataContractPayment ? { contractId: dataContractPayment?.contractId } : {}),
      ...(dataContractPayment ? { paymentId: dataContractPayment?.id } : {}),
      ...(formData.values as ICashbookRequest),
    };

    const response = await CashbookService.update(body);

    if (response.code === 0) {
      showToast(
        dataCashBook ? `Cập nhật phiếu ${type == 1 ? "thu" : "chi"} thành công` : `Thêm mới phiếu ${type == 1 ? "thu" : "chi"} thành công`,
        "success"
      );
      handClearForm(true);
    } else {
      showToast(response.message ?? response.error ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
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
            title: dataCashBook ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldEmployee ||
              (isShowCustomer ? checkFieldCustomer : false) ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldEmployee, checkFieldCustomer, isShowCustomer]
  );

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác sửa phiếu ${type == 1 ? "thu" : "chi"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
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
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-customer-add-cashbook"
      >
        <form className="form-customer-cashbook-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={dataCashBook ? `Chỉnh sửa phiếu ${type == 1 ? "thu" : "chi"}` : `Thêm mới phiếu ${type == 1 ? "thu" : "chi"}`}
            toggle={() => !isSubmit && handClearForm(false)}
          />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) =>
                field.name !== "note" ? (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                    formData={formData}
                  />
                ) : null
              )}

              <FileUpload label="Chứng từ" type="bill" formData={formData} setFormData={setFormData} />

              {listField.map((field, index) =>
                field.name === "note" ? (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                    formData={formData}
                  />
                ) : null
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

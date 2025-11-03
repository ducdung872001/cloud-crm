import React, { useState, useEffect, useMemo, Fragment, useCallback, useContext } from "react";
import { IRecoverPublicDebtsProps } from "model/common/PropsModel";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICashbookRequest } from "model/cashbook/CashbookRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import FileUpload from "components/fileUpload/fileUpload";
import { isDifferenceObj } from "reborn-util";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { showToast } from "utils/common";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import ImageThirdGender from "assets/images/third-gender.png";
import BeautyBranchService from "services/BeautyBranchService";
import InvoiceService from "services/InvoiceService";
import EmployeeService from "services/EmployeeService";
import CustomerService from "services/CustomerService";
import CashbookService from "services/CashbookService";
import CategoryService from "services/CategoryService";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";

export default function RecoverPublicDebts(props: IRecoverPublicDebtsProps) {
  const { onShow, onHide, idCustomer, dataInvoice } = props;

  const { dataBranch } = useContext(UserContext) as ContextType;

  const focusedElement = useActiveElement();

  const checkUserRoot = localStorage.getItem("user.root");

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [dataCategory, setDataCategory] = useState(null);
  const [checkCategory, setCheckCategory] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState<boolean>(false);

  const getDetailCategory = async () => {
    setIsLoadingCategory(true);

    const params = {
      name: "",
      type: 1,
    };

    const dataOption = await CategoryService.list(params);

    if (dataOption && dataOption.code === 0) {
      const result = dataOption.result?.map(item => {
        return {
          value: item.id,
          label: item.name
        }
      }) || []
      setCategoryList(result);

      // const result = dataOption.result.find((item) => item.source == 1);
      // setDataCategory({
      //   value: result.id,
      //   label: result.name,
      // });
    }

    setIsLoadingCategory(false);
  };

  useEffect(() => {
    if (onShow && idCustomer) {
      getDetailCategory();
    }
  }, [onShow, idCustomer]);

  const handleChangeValueCategory = (e) => {
    setDataCategory(e);
    setCheckCategory(false);
  }

  // // xử lý chi nhánh
  // const [dataBranch, setDataBranch] = useState(null);
  // const [checkFieldBranch, setCheckFieldBranch] = useState<boolean>(false);

  // //? đoạn này xử lý vấn đề call api lấy ra danh sách chi nhánh
  // const loadOptionBranch = async (search, loadedOptions, { page }) => {
  //   const param: IBeautyBranchFilterRequest = {
  //     name: search,
  //     page: page,
  //     limit: 10,
  //   };
  //   const response = await BeautyBranchService.list(param);

  //   if (response.code === 0) {
  //     const dataOption = response.result.items;

  //     return {
  //       options: [
  //         ...(dataOption.length > 0
  //           ? dataOption.map((item) => {
  //               return {
  //                 value: item.id,
  //                 label: item.name,
  //               };
  //             })
  //           : []),
  //       ],
  //       hasMore: response.result.loadMoreAble,
  //       additional: {
  //         page: page + 1,
  //       },
  //     };
  //   }

  //   return { options: [], hasMore: false };
  // };

  // //? đoạn này xử lý vấn đề thay đổi chi nhánh
  // const handleChangeValueBranch = (e) => {
  //   setCheckFieldBranch(false);
  //   setDataBranch(e);
  // };

  // xử lý nhân viên
  const [dataEmployee, setDataEmployee] = useState(null);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
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

  // xử lý khách hàng
  const [dataCustomer, setDataCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const getDetailCustomer = async (id: number) => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: `${result.name} - ${result.phoneMasked}`,
        avatar: result.avatar,
      };

      setDataCustomer(detailData);
    }

    setIsLoadingCustomer(false);
  };

  // danh sách hóa đơn có công nợ
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

  const getListDebtInvoice = async (id: number) => {
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

  useEffect(() => {
    if (onShow && idCustomer) {
      getDetailCustomer(idCustomer);
    }
  }, [onShow, idCustomer]);

  useEffect(() => {
    if (!dataInvoice && onShow && idCustomer) {
      getListDebtInvoice(idCustomer);
    }
  }, [dataInvoice, onShow, idCustomer]);

  useEffect(() => {
    if (dataInvoice) {
      setDataDebtInvoice({
        value: dataInvoice.id,
        label: dataInvoice.invoiceCode,
        amount: dataInvoice.amount,
        fee: dataInvoice.fee,
        debt: dataInvoice.debt,
        paid: dataInvoice.paid,
        discount: dataInvoice.discount,
        invoiceType: dataInvoice.invoiceType,
      });
    }
  }, [dataInvoice]);

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

  const values = useMemo(
    () =>
      ({
        transDate: "",
        categoryId: dataCategory?.value ?? null,
        employeeId: null,
        branchId: dataBranch.value ?? null,
        amount: "",
        note: "",
        type: 1,
        bill: "",
        invoiceId: dataInvoice?.id ?? null,
        invoiceType: dataInvoice?.invoiceType ?? "",
      } as ICashbookRequest),
    [idCustomer, onShow, dataCategory, dataBranch]
  );

  const validations: IValidation[] = [
    {
      name: "transDate",
      rules: "required",
    },
    {
      name: "amount",
      rules: `required|min:0|max_equal:${infoInvoice.debt}`,
    },
  ];

  const listField = useMemo(
    () =>
      [
        // ...(checkUserRoot == "1"
        //   ? ([
        //       {
        //         name: "branchId",
        //         type: "custom",
        //         snippet: (
        //           <SelectCustom
        //             id="branchId"
        //             name="branchId"
        //             label="Chi nhánh"
        //             fill={true}
        //             required={true}
        //             options={[]}
        //             special={true}
        //             value={dataBranch}
        //             onChange={(e) => handleChangeValueBranch(e)}
        //             isAsyncPaginate={true}
        //             placeholder="Chọn chi nhánh"
        //             additional={{
        //               page: 1,
        //             }}
        //             error={checkFieldBranch}
        //             message="Chi nhánh không được bỏ trống"
        //             loadOptionsPaginate={loadOptionBranch}
        //           />
        //         ),
        //       },
        //     ] as IFieldCustomize[])
        //   : []),
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
          isMaxDate: true,
        },
        {
          name: "categoryId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="categoryId"
              name="categoryId"
              label="Loại thu"
              options={categoryList}
              fill={true}
              value={dataCategory}
              special={true}
              required={true}
              placeholder="Chọn Loại thu"
              isLoading={isLoadingCategory}
              disabled={false}
              onChange={(e) => handleChangeValueCategory(e)}
              error={checkCategory}
              message={'Vui lòng chọn loại thu'}
            />
          ),
        },
        {
          name: "customerId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="customerId"
              name="customerId"
              label="Khách hàng"
              options={[]}
              fill={true}
              value={dataCustomer}
              special={true}
              required={true}
              isFormatOptionLabel={true}
              placeholder="Chọn khách hàng"
              isLoading={isLoadingCustomer}
              formatOptionLabel={formatOptionLabelCustomer}
              disabled={true}
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
        {
          name: "employeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="employeeId"
              name="employeeId"
              label="Người thu"
              options={[]}
              fill={true}
              value={dataEmployee}
              required={true}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn người thu"
              additional={{
                page: 1,
              }}
              error={checkFieldEmployee}
              message="Người thu không được bỏ trống"
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
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
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [
      dataEmployee,
      checkFieldEmployee,
      checkCategory,
      // dataBranch,
      dataCategory,
      isLoadingCategory,
      dataCustomer,
      isLoadingCustomer,
      listDebtInvoice,
      isLoadingDebtInvoice,
      infoInvoice,
      dataDebtInvoice,
      // checkFieldBranch,
      checkUserRoot,
      categoryList
    ]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

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

  useEffect(() => {
    if (dataEmployee) {
      setFormData({ ...formData, values: { ...formData?.values, employeeId: dataEmployee.value } });
    }
  }, [dataEmployee]);

  // useEffect(() => {
  //   if (dataBranch) {
  //     setFormData({ ...formData, values: { ...formData?.values, branchId: dataBranch.value } });
  //   }
  // }, [dataBranch]);

  useEffect(() => {
    if (dataCategory) {
      setFormData({ ...formData, values: { ...formData?.values, categoryId: dataCategory.value } });
    }
  }, [dataCategory]);

  const handClearForm = (acc) => {
    onHide(acc);
    // setDataBranch(null);
    setDataCategory(null);
    setDataCustomer(null);
    setDataEmployee(null);
    setDataDebtInvoice(null);
    setInfoInvoice({ total: 0, debt: 0, paid: 0, discount: 0, fee: 0 });
    setListDebtInvoice([]);
    setCheckCategory(false);
    setCheckFieldEmployee(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if(!dataCategory){
      setCheckCategory(true);
      showToast("Vui lòng chọn loại thu", "error");
      return;
    }

    if (!dataEmployee) {
      setCheckFieldEmployee(true);
      return;
    }

    // if (checkUserRoot == "1" && !dataBranch) {
    //   setCheckFieldBranch(true);
    // }

    setIsSubmit(true);

    const body: ICashbookRequest = {
      ...(formData.values as ICashbookRequest),
    };

    const response = await CashbookService.update(body);

    if (response.code === 0) {
      showToast("Thu hồi công nợ thành công", "success");
      handClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldEmployee ||
              // (checkUserRoot == "1" ? checkFieldBranch : false) ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [ 
      formData, 
      values, 
      isSubmit, 
      checkFieldEmployee, 
      // checkFieldBranch, 
      checkUserRoot
    ]
  );

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác thu hồi công nợ</Fragment>,
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
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-recover-public-debts"
      >
        <form className="form-recover-public-debts-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Thu hồi công nợ" toggle={() => !isSubmit && handClearForm(false)} />
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

              <FileUpload label="Chứng từ" type="bill" formData={formData} setFormData={setFormData} />
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

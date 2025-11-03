import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { AddBoughtProductModalProps } from "model/boughtProduct/PropsModel";
import { IActionModal, IOption } from "model/OtherModel";
import { IListWarehouseProductFilterRequest } from "model/warehouse/WarehouseRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IBoughtProductRequest } from "model/boughtProduct/BoughtProductRequestModel";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import ImageThirdGender from "assets/images/third-gender.png";
import BoughtProductService from "services/BoughtProductService";
import InventoryService from "services/InventoryService";
import WarehouseService from "services/WarehouseService";
import EmployeeService from "services/EmployeeService";
import "./AddBoughtProductModal.scss";
import { ContextType, UserContext } from "contexts/userContext";

interface IOptionData {
  value: string;
  label: string;
  price: number;
  quantity: number;
}

export default function AddBoughtProductModal(props: AddBoughtProductModalProps) {
  const { onShow, onHide, invoiceId, idCustomer, data } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listInventory, setListInventory] = useState<IOption[]>(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);

  const [dataUnit, setDataUnit] = useState(null);

  //! đoạn này lấy ra thông tin kho
  const onSelectOpenInventory = async () => {
    if (!listInventory || listInventory.length == 0) {
      setIsLoadingInventory(true);

      const response = await InventoryService.import();

      if (response.code === 0) {
        const dataOption = response.result || [];

        setListInventory([
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ]);
      }

      setIsLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (data?.inventoryId) {
      onSelectOpenInventory();
    }

    if (data?.inventoryId == null) {
      setListInventory([]);
    }
  }, [data]);

  const [dataProduct, setDataProduct] = useState(null);
  const [listUnit, setListUnit] = useState<IOptionData[]>([]);

  const [dataEmployee, setDataEmployee] = useState(null);

  const [isPriceAdjustment, setIsPriceAdjustment] = useState<boolean>(false);

  useEffect(() => {
    if (data?.discountUnit == 1 || data?.discountUnit == 2) {
      setIsPriceAdjustment(true);
    } else {
      setIsPriceAdjustment(false);
    }
  }, [data]);

  //? đoạn này thay đổi đơn vị sản phẩm
  const handleChangeValueUnit = (e) => {
    setDataUnit(e);
  };
  

  //* đoạn này xử lý vấn đề validate trường sản phẩm vs trường người bán
  const [validateProduct, setValidateProduct] = useState<boolean>(false);
  const [validateEmployee, setValidateEmployee] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề call api lấy ra danh sách sản phẩm
  const loadedOptionProduct = async (search, loadedOptions, { page }) => {
    const param: IListWarehouseProductFilterRequest = {
      keyword: search,
      inventoryId: formData?.values?.inventoryId,
      page: page,
      limit: 10,
    };

    const response = await WarehouseService.productList(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: `${item.productId}_${item.batchNo}`,
                  label: item.productName,
                  avatar: item.productAvatar,
                  productId: item.productId,
                  lstWarehouse: item.lstWarehouse,
                  batchNo: item.batchNo,
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


  //! đoạn này xử lý vấn đề update lấy ra thông tin kho để fill dữ liệu
  const getDetailWarehouseProduct = async (id) => {
    const param = {
      inventoryId: id,
    };
    const response = await WarehouseService.productList(param);

    if (response.code === 0) {
      const result = response.result.items;

      const takeProduct = (result || []).find((item) => {
        return item.productId === data?.productId && item.batchNo === data?.batchNo;
      });

      setDataProduct({
        value: `${takeProduct.productId}_${takeProduct.batchNo}`,
        label: takeProduct.productName,
        productId: takeProduct.productId,
        avatar: takeProduct.productAvatar,
        lstWarehouse: takeProduct.lstWarehouse,
        batchNo: takeProduct.batchNo,
      });

      const takeUnit = (takeProduct?.lstWarehouse || []).find((item) => item.unitId === data?.unitId);
      setDataUnit({
        value: takeUnit.unitId,
        label: takeUnit?.unitName,
        quantity: takeUnit.quantity,
        price: takeUnit.price,
        priceSample: formData?.values?.priceSample,
      });

      setListUnit(() => {
        return (takeProduct.lstWarehouse || []).map((item) => {
          return {
            value: item.unitId,
            label: item.unitName,
            quantity: item.quantity,
            price: item.price,
            priceSample: item.price,
          };
        });
      });
    }
  };

  //! đoạn này xử lý vấn đề kiểm tra điều kiện call chi tiết 1 sản phẩm khi cập nhật
  useEffect(() => {
    if (data?.inventoryId && onShow) {
      getDetailWarehouseProduct(data?.inventoryId);
    }
  }, [data?.inventoryId, onShow]);

  //! đoạn này xử lý vấn đề hiển thị hình ảnh sản phẩm
  const formatOptionLabelProduct = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý vấn đề thay đổi sản phẩm
  const handleChangeValueProduct = (e) => {
    setValidateProduct(false);
    setDataProduct(e);
    setDataUnit(null);
    setFormData({
      ...formData,
      values: { ...formData?.values, productId: e.productId, batchNo: e.batchNo, price: 0 },
    });

    const result = (e.lstWarehouse || []).map((item) => {
      return {
        value: item.unitId,
        label: item.unitName,
        price: item.price,
        priceSample: item.price,
        quantity: item.quantity,
      };
    });
    setListUnit(result);
  };

  //? đoạn này xử lý vấn đề call api lấy ra danh sách người bán
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value
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

  //? call api chi tiết người bán
  const getDetailEmployee = async (id) => {
    const response = await EmployeeService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDataEmployee({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      });
    }
  };

  //? đoạn này kiểm tra điều kiện callApi chi tiết người bán khi cập nhật
  useEffect(() => {
    if (data?.saleId && onShow) {
      getDetailEmployee(data?.saleId);
    }

    return () => setDataEmployee(null);
  }, [data?.saleId, onShow]);

  //? đoạn này xử lý vấn đề lấy ra ảnh người bán
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

  //? đoạn này xử lý vấn đề thay đổi người bán
  const handleChangeValueEmployee = (e) => {
    setValidateEmployee(false);
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, saleId: e.value } });
  };

  const values = useMemo(
    () =>
      ({
        invoiceId: data?.invoiceId ?? invoiceId,
        customerId: data?.customerId ?? idCustomer,
        inventoryId: data?.inventoryId ?? null,
        productId: data?.productId ?? null,
        unitId: data?.unitId ?? null,
        price: data?.price ?? 0,
        priceDiscount: 0,
        qty: data?.qty ?? 0,
        fee: data?.fee ?? 0,
        discountUnit: data?.discountUnit?.toString() ?? "0",
        discount: data?.discount ?? 0,
        saleId: data?.saleId ?? null,
        note: data?.note ?? "",
        batchNo: data?.batchNo ?? "",
        priceSample:
          data?.discountUnit == 0
            ? data?.price
            : data?.discountUnit == 2
            ? data?.price - data?.discount
            : data?.discountUnit == 1
            ? data?.price - data?.price * (data?.discount / 100)
            : 0,
      } as IBoughtProductRequest),
    [data, onShow, idCustomer, invoiceId]
  );

  const validations: IValidation[] = [
    {
      name: "qty",
      rules: `required|min:0|max_equal:${dataUnit?.quantity}`,
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const listField = useMemo(
    () =>
      [
        {
          label: "Kho hàng",
          name: "inventoryId",
          type: "select",
          fill: true,
          required: true,
          isLoading: isLoadingInventory,
          options: listInventory,
          onMenuOpen: onSelectOpenInventory,
        },
        {
          type: "custom",
          name: "productId",
          snippet: (
            <SelectCustom
              key ={formData?.values?.inventoryId}
              id="productId"
              name="productId"
              label="Sản phẩm"
              fill={true}
              required={true}
              options={[]}
              value={dataProduct}
              onChange={(e) => handleChangeValueProduct(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn sản phẩm"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionProduct}
              formatOptionLabel={formatOptionLabelProduct}
              error={validateProduct}
              message="Vui lòng chọn sản phẩm"
              disabled={formData?.values?.inventoryId ? false : true}
            />
          ),
        },
        {
          name: "unitId",
          type: "custom",
          snippet: (
            <SelectCustom
              name="unitId"
              label="Đơn vị tính"
              fill={true}
              required={true}
              options={listUnit}
              value={dataUnit?.value}
              placeholder="Chọn đơn vị"
              onChange={(e) => handleChangeValueUnit(e)}
              disabled={formData?.values?.productId ? false : true}
            />
          ),
        },
        {
          label: "Số lô",
          name: "batchNo",
          type: "text",
          fill: true,
          disabled: true,
        },
        {
          label: "Sản phẩm trong kho",
          name: "productInventory",
          type: "number",
          fill: true,
          disabled: true,
        },
        {
          label: "Giá gốc",
          name: "price",
          type: "number",
          fill: true,
          disabled: true,
        },
        {
          name: "priceAdjustment",
          type: "custom",
          snippet: (
            <div
              className={`price__adjustment ${isPriceAdjustment ? "active__price--adjustment" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setIsPriceAdjustment(!isPriceAdjustment);
              }}
            >
              <Icon name="PlusCircleFill" />
              Điều chỉnh giá bán
            </div>
          ),
        },
        ...(isPriceAdjustment
          ? [
              {
                label: "Giảm giá thêm",
                name: "discountUnit",
                type: "radio",
                fill: true,
                options: [
                  {
                    value: "1",
                    label: "Phần trăm (%)",
                  },
                  {
                    value: "2",
                    label: "Tiền mặt (VNĐ)",
                  },
                ],
              },
              {
                label: `${formData?.values?.discountUnit == "1" ? "Phần trăm (%)" : "Tiền mặt"} được giảm`,
                name: "discount",
                type: "number",
                fill: true,
                isWarning: formData?.values?.discountUnit == "2" && formData?.values?.discount > formData?.values?.priceSample,
                messageWarning: "Tiền mặt được giảm nhỏ hơn giá gốc",
              },
            ]
          : []),
        {
          label: "Giá bán",
          name: "priceSample",
          type: "number",
          fill: true,
          required: true,
          disabled: true,
        },
        {
          label: "Số lượng",
          name: "qty",
          type: "number",
          fill: true,
          required: true,
          disabled: formData?.values?.productId === null,
        },

        {
          label: "Tổng tiền phải thanh toán",
          name: "fee",
          type: "number",
          fill: true,
          disabled: true,
        },
        {
          type: "custom",
          name: "saleId",
          snippet: (
            <SelectCustom
              id="saleId"
              name="saleId"
              label="Người bán"
              fill={true}
              required={true}
              options={[]}
              value={dataEmployee}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn người bán"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              error={validateEmployee}
              message="Vui lòng chọn người bán"
            />
          ),
        },
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [isLoadingInventory, dataProduct, validateProduct, listUnit, , dataUnit, isPriceAdjustment, formData?.values, dataEmployee, validateEmployee]
  );

  useEffect(() => {
    if (formData?.values?.inventoryId) {
      loadedOptionProduct("", undefined, { page: 1 });
    }
  }, [formData?.values?.inventoryId]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if (isPriceAdjustment) {
      setFormData({ ...formData, values: { ...formData?.values, discountUnit: "1" } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, discountUnit: "0", discount: 0 } });
    }
  }, [isPriceAdjustment]);

  useEffect(() => {
    if (dataUnit) {
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          unitId: dataUnit.value,
          price: dataUnit.price,
          priceSample: dataUnit.priceSample,
          productInventory: dataUnit?.quantity,
        },
      });
    }
    values.productInventory = dataUnit?.quantity;
  }, [dataUnit]);

  //? Đoạn này xử lí tính toán khi người dùng trọn giảm giá theo % hoặc tiền mặt
  useEffect(() => {
    //! đoạn này là xử lý trường hợp tính theo %
    if (formData?.values?.discountUnit == "1" && +formData?.values?.discount) {
      const result = +formData?.values?.price * (formData?.values?.discount / 100);
      setDataUnit({ ...dataUnit, priceSample: +formData?.values?.price - result });
      setFormData({
        ...formData,
        values: { ...formData?.values, priceSample: +formData?.values?.price - result },
      });
    }

    if (+formData?.values?.discount > 100) {
      setFormData({ ...formData, values: { ...formData?.values, discount: 100 } });
    }

    //! đoạn này là xử lý trường hợp tính theo tiền mặt được giảm
    if (formData?.values?.discountUnit == "2" && +formData?.values?.discount) {
      const result = +formData?.values?.price - +formData?.values?.discount;
      setDataUnit({ ...dataUnit, priceSample: result });
      setFormData({ ...formData, values: { ...formData?.values, priceSample: result } });
    }
    if (+formData?.values?.discount > +formData?.values?.price) {
      setDataUnit({ ...dataUnit, priceSample: 0 });
      setFormData({ ...formData, values: { ...formData?.values, priceSample: 0, fee: 0 } });
    }

    //* trường hợp chung
    if (!formData?.values?.discount) {
      setFormData({ ...formData, values: { ...formData?.values, priceSample: formData?.values?.price } });
    }
  }, [formData?.values?.discountUnit, formData?.values?.discount, formData?.values?.price]);

  //! đoạn này xử lý vấn đề nếu như mà số lượng lớn hơn 0 thì tính tổng tiền
  useEffect(() => {
    if (formData?.values?.qty > 0) {
      const result = +formData?.values?.priceSample * +formData?.values?.qty;
      setFormData({ ...formData, values: { ...formData.values, fee: result } });
    } else {
      setFormData({ ...formData, values: { ...formData.values, fee: 0 } });
    }
  }, [formData?.values?.qty, formData?.values?.priceSample]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (dataProduct === null) {
      setValidateProduct(true);
      return;
    }

    if (dataEmployee === null) {
      setValidateEmployee(true);
      return;
    }

    if(!formData.values?.qty){
      showToast("Vui lòng nhập số lượng", "error");
      return;
    }

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: IBoughtProductRequest = {
      ...(formData?.values as IBoughtProductRequest),
      ...(data ? { id: data.id } : {}),
    };

    delete body.priceSample;
    delete body.productInventory;

    const response = await BoughtProductService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} sản phẩm cần bán thành công`, "success");
      onHide(true);
      setDataProduct(null);
      setDataEmployee(null);
      setDataUnit(null);
      setListInventory(null);
      setIsPriceAdjustment(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDataProduct(null);
    setDataEmployee(null);
    setDataUnit(null);
    setListInventory(null);
    setIsPriceAdjustment(false);
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
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              validateProduct ||
              validateEmployee ||
              (formData?.values?.discountUnit == "2" ? formData?.values?.priceSample < formData?.values?.discount : false) ||
              (formData?.values?.discountUnit == "1" ? +formData?.values?.discount > 100 : false) ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, validateProduct, validateEmployee]
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
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
        setDataProduct(null);
        setDataEmployee(null);
        setDataUnit(null);
        setListInventory(null);
        setIsPriceAdjustment(false);
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
        className="modal-add-bought-product"
      >
        <form className="form-add-bought-product" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} sản phẩm được bán`}
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setIsPriceAdjustment(false);
              !isSubmit && setDataProduct(null);
              !isSubmit && setDataEmployee(null);
              !isSubmit && setDataUnit(null);
              !isSubmit && setListInventory(null);
              !isSubmit && setIsPriceAdjustment(false);
            }}
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
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

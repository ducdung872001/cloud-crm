import React, { useState, useEffect, useMemo, Fragment, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import FileService from "services/FileService";
import CustomerService from "services/CustomerService";
import PromotionService from "services/PromotionService";
import { UserContext, ContextType } from "contexts/userContext";
import "./EmailConfirm.scss";
import { useLocation } from "react-router-dom";
import Button from "components/button/button";
import EmailService from "services/EmailService";

export default function VoucherForm() {
  const location = useLocation();

  // Lấy các tham số từ query parameters của URL
  const queryParams = new URLSearchParams(location.search);
  const processCode = queryParams.get("code") || "QTB";
  const customerIdParam = queryParams.get("customerId");
  const voucherIdParam = queryParams.get("promotionId");

  const { id, dataBranch } = useContext(UserContext) as ContextType;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [succesSubmit, setSuccesSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState<boolean>(false);
  const [voucherInfo, setVoucherInfo] = useState<any>(null);

  const [listImageTicket, setListImageTicket] = useState([]);

  const values = useMemo(
    () =>
      ({
        id: null,
        name: "",
        requestNo: "",
        departmentId: null,
        employeeId: null,
        customerId: null,
        type: "",
        categoryId: null,
        categoryName: "",
        productId: null,
        productName: "",
        companyName: "",
        contractId: null,
        compensationMax: null,
        status: null,
        notes: "",
        recordingUrl: "",
        docLink: "[]",
        consultedInfo: "",
        creatorId: null,
        creatorName: "",
        departmentName: "",
        employeeName: "",
        bsnId: null,
        clientId: "",
        qrCode: "",
        potId: "",
        processId: "",
        branchId: null,
        branchName: "",
        createdAt: "",
        updatedAt: "",
        productSchemaVersion: "",
        productSchemaSnapshot: "",
        productData: null,
        insurObject: null,
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        riskAddress: "",
        registrationNo: "",
        manufactureYear: null,
        brand: "",
        model: "",
        sumInsured: null,
        coverageStart: "",
        coverageEnd: "",
        coverageDay: null,
        usagePurpose: "",
        deductible: null,
        beneficiary: "",
        productSchemaSnapshotJson: "",
        productDataJson: "",
        confirm: null,
        voucherId: null,
        voucherName: "",
        voucherStartTime: "",
        voucherEndTime: "",
      } as any),
    []
  );

  const validations: IValidation[] = [
    {
      name: "confirm",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  const [detailCustomer, setDetailCustomer] = useState(null);

  //! Lấy thông tin voucher theo ID
  const getVoucherDetail = async (voucherId: number) => {
    setIsLoadingVoucher(true);
    try {
      const param: any = {
        id: voucherId,
        limit: 1,
      };

      const response = await PromotionService.list(param);

      if (response.code === 0 && response.result?.items?.length > 0) {
        const voucher = response.result.items[0];
        setVoucherInfo(voucher);
        setFormData({
          ...formData,
          values: {
            ...formData.values,
            voucherId: voucher.id,
            voucherName: voucher.name,
          },
        });
      } else {
        showToast("Không tìm thấy thông tin voucher", "error");
      }
    } catch (error) {
      showToast("Lỗi khi lấy thông tin voucher. Vui lòng thử lại sau", "error");
    } finally {
      setIsLoadingVoucher(false);
    }
  };

  //! Tự động load thông tin khách hàng từ customerId trong URL
  useEffect(() => {
    if (customerIdParam) {
      const customerId = parseInt(customerIdParam);
      if (customerId) {
        handleDetailCustomer(customerId);
      }
    }
  }, [customerIdParam]);

  //! Tự động load thông tin voucher từ voucherId trong URL
  useEffect(() => {
    if (voucherIdParam) {
      const voucherId = parseInt(voucherIdParam);
      if (voucherId) {
        getVoucherDetail(voucherId);
      }
    }
  }, [voucherIdParam]);

  const handleDetailCustomer = async (id: number) => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDetailCustomer({
        value: result.id,
        label: `${result.name} - ${result.phoneMasked}`,
        phone: result.phoneMasked,
        email: result.emailMasked,
        name: result.name,
        employeeId: result.employeeId,
        employeePhone: result.employeePhone,
        employeeName: result.employeeName,
        address: result.address,
        taxCode: result.taxCode,
      });

      // Tự động điền thông tin khách hàng vào form
      setFormData({
        ...formData,
        values: {
          ...formData.values,
          customerId: result.id,
          employeeId: result.employeeId,
          employeeName: result.employeeName,
          customerName: result.name,
          customerPhone: result.phoneMasked,
          customerEmail: result.emailMasked,
        },
      });
    } else {
      showToast(response.message || "Chi tiết khách hàng lỗi. Vui lòng thử lại sau !", "error");
    }

    setIsLoadingCustomer(false);
  };

  const listFieldVoteInfo: any[] = [
    {
      label: "Tên khách hàng",
      name: "customerName",
      type: "text",
      fill: true,
      disabled: true,
    },
    {
      label: "Số điện thoại khách hàng",
      name: "customerPhone",
      type: "text",
      fill: true,
      disabled: true,
    },
    {
      label: "Email khách hàng",
      name: "customerEmail",
      type: "text",
      fill: true,
      disabled: true,
    },
    {
      label: "Tên voucher",
      name: "voucherName",
      type: "text",
      fill: true,
      disabled: true,
    },
    {
      label: "Ngày bắt đầu",
      name: "voucherStartTime",
      type: "text",
      fill: true,
      disabled: true,
    },
    {
      label: "Ngày kết thúc",
      name: "voucherEndTime",
      type: "text",
      fill: true,
      disabled: true,
    },
    {
      name: "confirm",
      type: "custom",
      snippet: (
        <SelectCustom
          label="Xác nhận ưu đãi"
          name="confirm"
          fill={true}
          required={true}
          options={[
            { value: 1, label: "Đồng ý" },
            { value: 0, label: "Không đồng ý" },
          ]}
          value={formData?.values?.confirm}
          onChange={(e) =>
            setFormData({
              ...formData,
              values: { ...formData.values, confirm: e?.value },
            })
          }
          placeholder="Chọn xác nhận"
        />
      ),
    },
  ];


  //! Cập nhật thông tin voucher vào form khi load xong
  useEffect(() => {
    if (voucherInfo) {
      setFormData({
        ...formData,
        values: {
          ...formData.values,
          voucherName: voucherInfo.name || "",
          voucherStartTime: voucherInfo.startTime ? new Date(voucherInfo.startTime).toLocaleDateString("vi-VN") : "",
          voucherEndTime: voucherInfo.endTime ? new Date(voucherInfo.endTime).toLocaleDateString("vi-VN") : "",
        },
      });
    }
  }, [voucherInfo]);

  useEffect(() => {
    const result = JSON.parse(formData.values.docLink).map((item) => item.url);
    setListImageTicket(result);
  }, [formData.values.docLink]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldVoteInfo]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    // Lấy thông tin từ context
    const branchId = dataBranch?.value || null;
    const branchName = dataBranch?.label || "";
    const creatorId = id || null;
    const creatorName = ""; // Có thể lấy từ context nếu có

    // Tạo body với tất cả các trường
    const body: any = {
      id: formData.values.id || null,
      name: formData.values.name || "",
      requestNo: formData.values.requestNo || "",
      departmentId: formData.values.departmentId || null,
      employeeId: formData.values.employeeId || null,
      customerId: formData.values.customerId || null,
      type: formData.values.type || "",
      categoryId: formData.values.categoryId || null,
      categoryName: formData.values.categoryName || "",
      productId: formData.values.productId || null,
      productName: formData.values.productName || "",
      companyName: formData.values.companyName || "",
      contractId: formData.values.contractId || null,
      compensationMax: formData.values.compensationMax || null,
      status: formData.values.status || null,
      notes: formData.values.notes || "",
      recordingUrl: formData.values.recordingUrl || "",
      docLink: formData.values.docLink || "[]",
      consultedInfo: formData.values.consultedInfo || "",
      creatorId: creatorId,
      creatorName: creatorName,
      departmentName: formData.values.departmentName || "",
      employeeName: formData.values.employeeName || "",
      bsnId: formData.values.bsnId || null,
      clientId: formData.values.clientId || "ieabgaiifh",
      qrCode: processCode,
      potId: formData.values.potId || "",
      processId: formData.values.processId || "",
      branchId: branchId,
      branchName: branchName,
      createdAt: formData.values.createdAt || "",
      updatedAt: formData.values.updatedAt || "",
      productSchemaVersion: formData.values.productSchemaVersion || "",
      productSchemaSnapshot: formData.values.productSchemaSnapshot || "",
      productData: formData.values.productData || null,
      insurObject: formData.values.insurObject || null,
      customerName: formData.values.customerName || "",
      customerPhone: formData.values.customerPhone || "",
      customerEmail: formData.values.customerEmail || "",
      riskAddress: formData.values.riskAddress || "",
      registrationNo: formData.values.registrationNo || "",
      manufactureYear: formData.values.manufactureYear || null,
      brand: formData.values.brand || "",
      model: formData.values.model || "",
      sumInsured: formData.values.sumInsured || null,
      coverageStart: formData.values.coverageStart || "",
      coverageEnd: formData.values.coverageEnd || "",
      coverageDay: formData.values.coverageDay || null,
      usagePurpose: formData.values.usagePurpose || "",
      deductible: formData.values.deductible || null,
      beneficiary: formData.values.beneficiary || "",
      productSchemaSnapshotJson: formData.values.productSchemaSnapshotJson || "",
      productDataJson: formData.values.productDataJson || "",
      confirm: formData.values.confirm !== null ? formData.values.confirm : null, // 0 hoặc 1
    };

    console.log("body", body);
    // return;

    const response = await EmailService.sendVoucher(body, { processCode, confirm: body.confirm });

    if (response.code === 0) {
      showToast(`Tạo phiếu thành công`, "success");
      setSuccesSubmit(true);
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
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${"thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        // onHide(false);
        setShowDialog(false);
        setContentDialog(null);
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
          //   onHide(false);
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

  // xử lý hình ảnh
  // const handleImageUpload = (e) => {
  //   e.preventDefault();

  //   if (e.target.files && e.target.files.length > 0) {
  //     const maxSize = 1048576;

  //     if (e.target.files[0].size > maxSize) {
  //       showToast("Ảnh tải lên giới hạn dung lượng không quá 2MB", "warning");
  //       e.target.value = "";
  //     } else {
  //       handUploadFile(e.target.files[0]);
  //       e.target.value = null;
  //     }
  //   }
  // };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setListImageTicket([...listImageTicket, result]);
  };

  useEffect(() => {
    if (listImageTicket && listImageTicket.length > 0) {
      const result = listImageTicket.map((item) => {
        return {
          type: "image",
          url: item,
        };
      });
      setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(result) } });
    }
  }, [listImageTicket]);

  // const handleRemoveImageItem = (idx) => {
  //   const result = JSON.parse(formData.values.docLink);
  //   result.splice(idx, 1);
  //   setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(result) } });
  // };
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(0);
  };
  return (
    <Fragment>
      <div className="page-collect-ticket">
        <form className="form-ticket-group" onSubmit={(e) => onSubmit(e)}>
          <div className="header-form">
            <h1>THÔNG TIN ƯU ĐÃI</h1>
          </div>
          {succesSubmit ? (
            <div className="list-form-group" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              GỬI THÔNG TIN ƯU ĐÃI THÀNH CÔNG
              <Button onClick={handleGoBack} type="button" color="primary" size="large" className="custom-button-rollback">
                Quay lại
              </Button>
            </div>
          ) : (
            <>
              <ModalBody>
                <div className="list-form-group">
                  <div className="wrapper-field-ticket-service">
                    <div className="list-field">
                      {listFieldVoteInfo.map((field, index) => (
                        <FieldCustomize
                          key={index}
                          field={field}
                          handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldVoteInfo, setFormData)}
                          formData={formData}
                        />
                      ))}
                    </div>
                    
                  </div>
                </div>
              </ModalBody>
              <ModalFooter actions={actions} />
            </>
          )}
        </form>
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
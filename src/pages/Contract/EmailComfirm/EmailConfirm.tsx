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
import { EMAIL_REGEX } from "utils/constant";
import { UserContext, ContextType } from "contexts/userContext";
import "./EmailConfirm.scss";
import { useLocation } from "react-router-dom";
import Button from "components/button/button";
import EmailService from "services/EmailService";
import ScheduleConsultantService from "services/ScheduleConsultantService";

export default function EmailConfirm() {
  // const { onShow, data, idCustomer, saleflowId, sieId } = props;
  const location = useLocation();

  // Lấy trường code từ query parameters của URL
  const queryParams = new URLSearchParams(location.search);
  const processCode = queryParams.get("code") || "QTB";
  const customerIdParam = queryParams.get("customerId");
  const voucherIdParam = queryParams.get("promotionId");
  const rawScheduleConsultantIdParam = queryParams.get("scheduleConsultantId");
  const rawPotIdParam = queryParams.get("potId");

  const parsedScheduleParams = useMemo(() => {
    if (rawScheduleConsultantIdParam && rawScheduleConsultantIdParam.includes("?potId=") && !rawPotIdParam) {
      const [scheduleId, potId] = rawScheduleConsultantIdParam.split("?potId=");
      return {
        scheduleConsultantId: scheduleId,
        potId: potId,
      };
    }

    return {
      scheduleConsultantId: rawScheduleConsultantIdParam,
      potId: rawPotIdParam,
    };
  }, [rawScheduleConsultantIdParam, rawPotIdParam]);

  const scheduleConsultantIdParam = parsedScheduleParams.scheduleConsultantId;
  const potIdParam = parsedScheduleParams.potId;

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
  const [voucherList, setVoucherList] = useState<any[]>([]);
  const [voucherOptions, setVoucherOptions] = useState<IOption[]>([]);

  const values = useMemo(
    () =>
    ({
      id: null,
      name: "",
      topic: "",
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
  const [scheduleInfo, setScheduleInfo] = useState<any>(null);
  //! Tự động load thông tin khách hàng từ customerId trong URL
  useEffect(() => {
    if (customerIdParam) {
      const customerId = parseInt(customerIdParam);
      if (customerId) {
        handleDetailCustomer(customerId);
      }
    }
  }, [customerIdParam]);

  //! Lấy thông tin lịch tư vấn theo scheduleConsultantId
  const getScheduleDetail = async (scheduleId: number) => {
    try {
      const response = await ScheduleConsultantService.detail(scheduleId);
      if (response.code === 0 && response.result) {
        const info = response.result;
        setScheduleInfo(info);
        setFormData((prev) => ({
          ...prev,
          values: {
            ...prev.values,
            name: info.title || "",
            customerName: info.customerName || prev.values.customerName,
            employeeName: info.consultantName || prev.values.employeeName,
            coverageStart: info.startTime ? new Date(info.startTime).toLocaleString("vi-VN") : prev.values.coverageStart,
            coverageEnd: info.endTime ? new Date(info.endTime).toLocaleString("vi-VN") : prev.values.coverageEnd,
          },
        }));
      }
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    if (scheduleConsultantIdParam) {
      const scheduleId = parseInt(scheduleConsultantIdParam);
      if (scheduleId) getScheduleDetail(scheduleId);
    }
  }, [scheduleConsultantIdParam]);

  //! Tự động set potId từ URL vào form
  useEffect(() => {
    if (potIdParam) {
      setFormData((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          potId: potIdParam,
        },
      }));
    }
  }, [potIdParam]);

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
      });
      // Tự động điền thông tin khách hàng vào form
      setFormData((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          customerId: result.id,
          employeeId: result.employeeId,
          employeeName: result.employeeName,
          customerName: result.name,
          customerPhone: result.phoneMasked,
          customerEmail: result.emailMasked,
        },
      }));
    } else {
      showToast(response.message || "Chi tiết khách hàng lỗi. Vui lòng thử lại sau !", "error");
    }

    setIsLoadingCustomer(false);
  };

  // useEffect(() => {
  //   if ((idCustomer || data?.customerId) && onShow) {
  //     handleDetailCustomer(idCustomer || data?.customerId);
  //   }
  // }, [idCustomer, onShow, data?.customerId]);

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
        setFormData((prev) => ({
          ...prev,
          values: {
            ...prev.values,
            voucherId: voucher.id,
            voucherName: voucher.name,
            voucherStartTime: voucher.startTime ? new Date(voucher.startTime).toLocaleDateString("vi-VN") : "",
            voucherEndTime: voucher.endTime ? new Date(voucher.endTime).toLocaleDateString("vi-VN") : "",
          },
        }));
      } else {
        showToast("Không tìm thấy thông tin voucher", "error");
      }
    } catch (error) {
      showToast("Lỗi khi lấy thông tin voucher. Vui lòng thử lại sau", "error");
    } finally {
      setIsLoadingVoucher(false);
    }
  };

  //! Tự động load thông tin voucher từ voucherId trong URL
  useEffect(() => {
    if (voucherIdParam) {
      const voucherId = parseInt(voucherIdParam);
      if (voucherId) {
        getVoucherDetail(voucherId);
      }
    }
  }, [voucherIdParam]);

  const fetchVoucherList = useCallback(
    async (params: { scheduleConsultantId?: number; potId?: string | number }) => {
      if (!params.scheduleConsultantId && !params.potId) {
        return;
      }

      setIsLoadingVoucher(true);
      try {
        const requestParams: any = {
          limit: 50,
        };

        if (params.scheduleConsultantId) {
          requestParams.scheduleConsultantId = params.scheduleConsultantId;
        }

        if (params.potId) {
          requestParams.potId = params.potId;
        }

        const response = await PromotionService.list(requestParams);

        if (response.code !== 0) {
          showToast(response.message || "Không lấy được danh sách voucher", "error");
          setVoucherList([]);
          setVoucherOptions([]);
          return;
        }

        const results: any[] = response?.result?.items || [];
        setVoucherList(results);
        const opts = results.map((v) => ({ value: v.id, label: v.name }));
        setVoucherOptions(opts);

        if (results.length === 0) {
          return;
        }

        setFormData((prev) => {
          const currentVoucher = results.find((item) => item.id === prev.values.voucherId);
          const pickedVoucher = currentVoucher || results[0];

          if (!pickedVoucher) {
            return prev;
          }

          return {
            ...prev,
            values: {
              ...prev.values,
              voucherId: pickedVoucher.id,
              voucherName: pickedVoucher.name || "",
              voucherStartTime: pickedVoucher.startTime ? new Date(pickedVoucher.startTime).toLocaleDateString("vi-VN") : "",
              voucherEndTime: pickedVoucher.endTime ? new Date(pickedVoucher.endTime).toLocaleDateString("vi-VN") : "",
            },
          };
        });
      } catch (error) {
        showToast("Không lấy được danh sách voucher", "error");
        setVoucherList([]);
        setVoucherOptions([]);
      } finally {
        setIsLoadingVoucher(false);
      }
    },
    []
  );

  useEffect(() => {
    const scheduleId = scheduleConsultantIdParam ? parseInt(scheduleConsultantIdParam, 10) : undefined;
    const normalizedScheduleId = scheduleId && !Number.isNaN(scheduleId) ? scheduleId : undefined;
    const normalizedPotId = potIdParam || undefined;

    if (normalizedScheduleId || normalizedPotId) {
      fetchVoucherList({ scheduleConsultantId: normalizedScheduleId, potId: normalizedPotId });
    }
  }, [scheduleConsultantIdParam, potIdParam, fetchVoucherList]);

  const listFieldVoteInfo: any[] = [
    {
      label: "Tiêu đề",
      name: "name",
      type: "text",
      fill: true,
      disabled: true,
    },
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
      regex: new RegExp(EMAIL_REGEX),
      messageErrorRegex: "Email không đúng định dạng",
      disabled: true,
    },
    {
      label: "Chuyên viên tư vấn",
      name: "employeeName",
      type: "text",
      fill: true,
      disabled: true,
    },
    {
      name: "voucherSelect",
      type: "custom",
      snippet: (
        <SelectCustom
          label="Chọn voucher"
          name="voucherSelect"
          fill={true}
          required={true}
          disabled={isLoadingVoucher}
          options={voucherOptions}
          value={voucherOptions.find((o) => o.value === formData?.values?.voucherId) || null}
          onChange={(opt) => {
            const selectedId = opt?.value;
            const selected = voucherList.find((v) => v.id === selectedId);
            setFormData((prev) => ({
              ...prev,
              values: {
                ...prev.values,
                voucherId: selected?.id || null,
                voucherName: selected?.name || "",
                voucherStartTime: selected?.startTime ? new Date(selected.startTime).toLocaleDateString("vi-VN") : "",
                voucherEndTime: selected?.endTime ? new Date(selected.endTime).toLocaleDateString("vi-VN") : "",
              },
            }));
          }}
          placeholder="Chọn voucher"
        />
      ),
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
        <div className="field-custom-radio">
          <label style={{ display: "block", marginBottom: 8 }}>Xác nhận ưu đãi</label>
          <div style={{ display: "flex", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="confirm"
                value={1}
                checked={(formData?.values?.confirm ?? 1) === 1}
                onChange={() => setFormData((prev) => ({ ...prev, values: { ...prev.values, confirm: 1 } }))}
              />
              Đồng ý
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="confirm"
                value={0}
                checked={formData?.values?.confirm === 0}
                onChange={() => setFormData((prev) => ({ ...prev, values: { ...prev.values, confirm: 0 } }))}
              />
              Không đồng ý
            </label>
          </div>
        </div>
      ),
    },
  ];

  //! Cập nhật thông tin voucher vào form khi load xong
  useEffect(() => {
    if (voucherInfo) {
      setFormData((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          voucherName: voucherInfo.name || "",
          voucherStartTime: voucherInfo.startTime ? new Date(voucherInfo.startTime).toLocaleDateString("vi-VN") : "",
          voucherEndTime: voucherInfo.endTime ? new Date(voucherInfo.endTime).toLocaleDateString("vi-VN") : "",
        },
      }));
    }
  }, [voucherInfo]);

  //! Mặc định confirm = 1 (Đồng ý)
  useEffect(() => {
    if (formData?.values?.confirm === null || formData?.values?.confirm === undefined) {
      setFormData((prev) => ({ ...prev, values: { ...prev.values, confirm: 1 } }));
    }
  }, [formData?.values?.confirm]);

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

    // const body: ITicketRequestModel = {
    //   ...(formData.values as ITicketRequestModel),
    //   ...{ supportId: 85, clientId: "ieabgaiifh", qrCode: processCode },
    // };
    // Tạo body với tất cả các trường
    const body: any = {
      id: formData.values.id || null,
      name: formData.values.name || "",
      topic: formData.values.topic || "",
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
      voucherId: formData.values.voucherId || null,
      voucherName: formData.values.voucherName || "",
      voucherStartTime: formData.values.voucherStartTime || "",
      voucherEndTime: formData.values.voucherEndTime || "",
      scheduleConsultantId: scheduleConsultantIdParam ? parseInt(scheduleConsultantIdParam) : null,
    };
    console.log("body", body);
    // return;

    const response = await EmailService.sendEmailSale(body, { processCode, confirm: body.confirm });

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
      setFormData((prev) => ({ ...prev, values: { ...prev.values, docLink: JSON.stringify(result) } }));
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
            <h1>PHIẾU XÁC NHẬN ƯU ĐÃI</h1>
          </div>
          {succesSubmit ? (
            <div className="list-form-group" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              NỘP PHIẾU XÁC NHẬN ƯU ĐÃI THÀNH CÔNG, CHÚNG TÔI SẼ LIÊN HỆ VỚI BẠN TRONG THỜI GIAN SỚM NHẤT
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
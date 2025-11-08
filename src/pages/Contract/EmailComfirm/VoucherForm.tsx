import React, { useState, useEffect, useMemo, Fragment, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import FileService from "services/FileService";
import CustomerService from "services/CustomerService";
import PromotionService from "services/PromotionService";
import ScheduleConsultantService from "services/ScheduleConsultantService";
import { UserContext, ContextType } from "contexts/userContext";
import "./EmailConfirm.scss";
import Button from "components/button/button";
import EmailService from "services/EmailService";

export default function VoucherForm() {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy các tham số từ query parameters của URL
  const queryParams = new URLSearchParams(location.search);
  const processCode = queryParams.get("code") || "QTB";
  const customerIdParam = queryParams.get("customerId");
  const voucherIdParam = queryParams.get("promotionId");
  const rawScheduleConsultantIdParam = queryParams.get("scheduleConsultantId");
  const rawPotIdParam = queryParams.get("potId");
  const topicParam = queryParams.get("topicId");
  const nodeIdParam = queryParams.get("nodeId");
  const currentRequestIdParam = queryParams.get("currentRequestId");
  const messageIdParam = queryParams.get("messageId");
  const fmtStartDateParam = queryParams.get("fmtStartDate");

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
  const [scheduleInfo, setScheduleInfo] = useState<any>(null);

  const [listImageTicket, setListImageTicket] = useState<string[]>([]);
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
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      cardName: "",
      manufactureYear: null,
      brand: "",
      model: "",
      sumInsured: null,
      coverageStart: "",
      coverageEnd: "",
      confirm: null,
      voucherId: null,
      voucherName: "",
      voucherStartTime: "",
      voucherEndTime: "",
      nodeId: null,
      currentRequestId: null,
      messageId: null,
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
    errors: {},
  });

  // Safe JSON parse helper
  const safeParse = (txt: string) => {
    try {
      return JSON.parse(txt);
    } catch (e) {
      return null;
    }
  };

  //! Lấy thông tin lịch tư vấn theo ID
  const getScheduleDetail = useCallback(async (scheduleId: number) => {
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
    } catch (error) {
      // silent
    }
  }, []);

  //! Tự động load thông tin lịch tư vấn từ scheduleConsultantId trong URL
  useEffect(() => {
    if (scheduleConsultantIdParam) {
      const scheduleId = parseInt(scheduleConsultantIdParam);
      if (scheduleId) {
        getScheduleDetail(scheduleId);
      }
    }
  }, [scheduleConsultantIdParam, getScheduleDetail]);

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

  //! Tự động set nodeId, currentRequestId, messageId từ URL vào form
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        ...(nodeIdParam && { nodeId: nodeIdParam }),
        ...(currentRequestIdParam && { currentRequestId: currentRequestIdParam }),
        ...(messageIdParam && { messageId: messageIdParam }),
        ...(topicParam && { topic: topicParam }),
      },
    }));
  }, [nodeIdParam, currentRequestIdParam, messageIdParam, topicParam]);

  const [detailCustomer, setDetailCustomer] = useState(null);

  //! Lấy thông tin voucher theo ID
  const getVoucherDetail = useCallback(async (voucherId: number) => {
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
  }, []);

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
  }, [voucherIdParam, getVoucherDetail]);

  const fetchVoucherList = useCallback(
    async (fmtStartDate?: string) => {
      setIsLoadingVoucher(true);
      try {
        const requestParams: any = {
          limit: 50,
        };

        if (fmtStartDate) {
          requestParams.fmtStartDate = fmtStartDate;
        }

        const response = await PromotionService.list(requestParams);

        if (response.code !== 0) {
          showToast(response.message || "Không lấy được danh sách voucher", "error");
          setVoucherList([]);
          setVoucherOptions([]);
          setFormData((prev) => ({
            ...prev,
            values: {
              ...prev.values,
              voucherId: 0,
              voucherName: "",
              voucherStartTime: "",
              voucherEndTime: "",
            },
          }));
          return;
        }

        const results: any[] = response?.result?.items || [];
        setVoucherList(results);
        const opts = results.map((v) => ({ value: v.id, label: v.name }));
        setVoucherOptions(opts);

        if (results.length === 0) {
          setFormData((prev) => ({
            ...prev,
            values: {
              ...prev.values,
              voucherId: 0,
              voucherName: "",
              voucherStartTime: "",
              voucherEndTime: "",
            },
          }));
          return;
        }

        setFormData((prev) => {
          const currentVoucher = results.find((item) => item.id === prev.values.voucherId);
          const pickedVoucher = currentVoucher || null;

          if (!pickedVoucher) {
            return {
              ...prev,
              values: {
                ...prev.values,
                voucherId: 0,
                voucherName: "",
                voucherStartTime: "",
                voucherEndTime: "",
              },
            };
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
        setFormData((prev) => ({
          ...prev,
          values: {
            ...prev.values,
            voucherId: 0,
            voucherName: "",
            voucherStartTime: "",
            voucherEndTime: "",
          },
        }));
      } finally {
        setIsLoadingVoucher(false);
      }
    },
    []
  );

  useEffect(() => {
    const fmtStartDate = fmtStartDateParam || new Date().toLocaleDateString("vi-VN");
    fetchVoucherList(fmtStartDate);
  }, [fmtStartDateParam, fetchVoucherList]);

  const handleDetailCustomer = useCallback(async (idCust: number) => {
    setIsLoadingCustomer(true);

    try {
      const response = await CustomerService.detail(idCust);

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
            cardName: result.cardName,
          },
        }));
      } else {
        showToast(response.message || "Chi tiết khách hàng lỗi. Vui lòng thử lại sau !", "error");
      }
    } catch (err) {
      showToast("Lỗi khi lấy chi tiết khách hàng", "error");
    } finally {
      setIsLoadingCustomer(false);
    }
  }, []);

  const selectedVoucherOption = useMemo(() => {
    const id = formData?.values?.voucherId;
    if (!id || id === 0) return null;
    return voucherOptions.find(opt => Number(opt.value) === Number(id)) || null;

  }, [formData?.values?.voucherId, voucherOptions]);
  console.log("selectedVoucherOption:", selectedVoucherOption);
  console.log("voucherOptions:", voucherOptions);
  console.log("voucherId:", formData.values.voucherId);



  // Memoize các field để tránh tạo lại snippet mỗi render
  const listFieldVoteInfo: any[] = useMemo(() => [
    {
      label: "Tiêu đề",
      name: "name",
      type: "text",
      fill: true,
      disabled: true,
    },
    {
      label: "Bắt đầu lịch",
      name: "coverageStart",
      type: "text",
      fill: true,
      disabled: true,
    },
    {
      label: "Kết thúc lịch",
      name: "coverageEnd",
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
          value={formData.values.voucherId}
          onChange={(opt) => {

            const selectedId = opt.value;
            const selected = voucherList.find((v) => v.id === selectedId);

            setFormData((prev) => ({
              ...prev,
              values: {
                ...prev.values,
                voucherId: selected?.id || 0,
                voucherName: selected?.name || "",
                voucherStartTime: selected?.startTime
                  ? new Date(selected.startTime).toLocaleDateString("vi-VN")
                  : "",
                voucherEndTime: selected?.endTime
                  ? new Date(selected.endTime).toLocaleDateString("vi-VN")
                  : "",
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
  ], [voucherOptions, selectedVoucherOption, isLoadingVoucher, voucherList, formData?.values?.confirm]);

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
    setFormData((prev) => {
      if (prev.values.confirm === null || prev.values.confirm === undefined) {
        return { ...prev, values: { ...prev.values, confirm: 1 } };
      }
      return prev;
    });
  }, []);

  //! Đảm bảo tất cả các trường string không bị undefined
  useEffect(() => {
    setFormData((prev) => {
      const updatedValues = { ...prev.values };
      let hasChanges = false;

      const stringFields = [
        "name", "topic", "requestNo", "type", "categoryName", "productName", "companyName",
        "notes", "recordingUrl", "docLink", "consultedInfo", "creatorName", "departmentName",
        "employeeName", "clientId", "qrCode", "potId", "processId", "branchName", "createdAt",
        "updatedAt", "productSchemaVersion", "productSchemaSnapshot", "customerName", "customerPhone",
        "customerEmail", "cardName", "riskAddress", "registrationNo", "brand", "model",
        "coverageStart", "coverageEnd", "usagePurpose", "beneficiary", "productSchemaSnapshotJson",
        "productDataJson", "voucherName", "voucherStartTime", "voucherEndTime"
      ];

      stringFields.forEach((key) => {
        if (updatedValues[key] === undefined || updatedValues[key] === null) {
          updatedValues[key] = "";
          hasChanges = true;
        }
      });

      if (hasChanges) {
        return { ...prev, values: updatedValues };
      }
      return prev;
    });

  }, []);

  useEffect(() => {
    const parsed = safeParse(formData.values.docLink);
    if (Array.isArray(parsed)) {
      const result = parsed.map((item: any) => item.url).filter(Boolean);
      setListImageTicket(result);
    } else {
      setListImageTicket([]);
    }
  }, [formData.values.docLink]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, values: values, errors: {} }));
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Đảm bảo tất cả các trường string không bị undefined trước khi validate
    const sanitizedFormData = {
      ...formData,
      values: {
        ...formData.values,
        name: formData.values.name ?? "",
        topic: formData.values.topic ?? "",
        requestNo: formData.values.requestNo ?? "",
        type: formData.values.type ?? "",
        categoryName: formData.values.categoryName ?? "",
        recordingUrl: formData.values.recordingUrl ?? "",
        docLink: formData.values.docLink ?? "[]",
        creatorName: formData.values.creatorName ?? "",
        departmentName: formData.values.departmentName ?? "",
        employeeName: formData.values.employeeName ?? "",
        clientId: formData.values.clientId ?? "",
        qrCode: formData.values.qrCode ?? "",
        potId: formData.values.potId ?? "",
        processId: formData.values.processId ?? "",
        branchName: formData.values.branchName ?? "",
        createdAt: formData.values.createdAt ?? "",
        updatedAt: formData.values.updatedAt ?? "",
        customerName: formData.values.customerName ?? "",
        customerPhone: formData.values.customerPhone ?? "",
        customerEmail: formData.values.customerEmail ?? "",
        cardName: formData.values.cardName ?? "",
        coverageStart: formData.values.coverageStart ?? "",
        coverageEnd: formData.values.coverageEnd ?? "",
        voucherName: formData.values.voucherName ?? "",
        voucherStartTime: formData.values.voucherStartTime ?? "",
        voucherEndTime: formData.values.voucherEndTime ?? "",
        confirm: formData.values.confirm != null ? String(formData.values.confirm) : 1, // default = 1
        coverageDay: formData.values.coverageDay != null ? String(formData.values.coverageDay) : "",
        voucherId: formData.values.voucherId != null ? formData.values.voucherId : 0

      } as any,
    };


    const errors = Validate(validations, sanitizedFormData, [...listFieldVoteInfo]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    setFormData(sanitizedFormData);

    const branchId = dataBranch?.value || null;
    const branchName = dataBranch?.label || "";
    const creatorId = id || null;
    const creatorName = "";

    const body: any = {
      id: sanitizedFormData.values.id || null,
      name: sanitizedFormData.values.name || "",
      topic: sanitizedFormData.values.topic || "",
      requestNo: sanitizedFormData.values.requestNo || "",
      employeeId: sanitizedFormData.values.employeeId || null,
      customerId: sanitizedFormData.values.customerId || null,
      type: sanitizedFormData.values.type || "",
      status: sanitizedFormData.values.status || null,
      docLink: sanitizedFormData.values.docLink || "[]",
      creatorId: creatorId,
      creatorName: creatorName,
      employeeName: sanitizedFormData.values.employeeName || "",
      bsnId: sanitizedFormData.values.bsnId || null,
      clientId: sanitizedFormData.values.clientId || "",
      qrCode: processCode,
      code: processCode,
      potId: sanitizedFormData.values.potId || "",
      processId: sanitizedFormData.values.processId || "",
      scheduleConsultantId: scheduleConsultantIdParam ? parseInt(scheduleConsultantIdParam) : null,
      branchId: branchId,
      branchName: branchName,
      customerName: sanitizedFormData.values.customerName || "",
      customerPhone: sanitizedFormData.values.customerPhone || "",
      customerEmail: sanitizedFormData.values.customerEmail || "",
      cardName: sanitizedFormData.values.cardName || "",
      email: sanitizedFormData.values.customerEmail || "",
      manufactureYear: sanitizedFormData.values.manufactureYear || null,
      coverageStart: sanitizedFormData.values.coverageStart || "",
      coverageEnd: sanitizedFormData.values.coverageEnd || "",
      coverageDay: sanitizedFormData.values.coverageDay || null,
      confirm: sanitizedFormData.values.confirm !== null ? sanitizedFormData.values.confirm : null, // 0 hoặc 1
      voucherId: sanitizedFormData.values.voucherId || 0,
      nodeId: sanitizedFormData.values.nodeId || null,
      currentRequestId: sanitizedFormData.values.currentRequestId || sanitizedFormData.values.requestNo || null,
      messageId: sanitizedFormData.values.messageId || null,
    };

    // console.log("body", body);

    try {
      const response = await EmailService.sendVoucher(body, { processCode, confirm: body.confirm });

      if (response.code === 0) {
        showToast(`Tạo phiếu thành công`, "success");
        setSuccesSubmit(true);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        setIsSubmit(false);
      }
    } catch (err) {
      showToast("Lỗi khi gửi phiếu", "error");
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

  const showDialogConfirmCancel = useCallback(() => {
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
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  }, []);

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
          // nothing
        }
      }
    },
    [formData, showDialog, values, focusedElement, showDialogConfirmCancel]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  // xử lý hình ảnh
  const handUploadFile = async (file: File) => {
    try {
      await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
    } catch (err) {
      showToast("Lỗi upload ảnh", "error");
    }
  };

  const processUploadSuccess = (data: any) => {
    const result = data?.fileUrl;
    if (result) {
      setListImageTicket((prev) => [...prev, result]);
    }
  };

  useEffect(() => {
    if (listImageTicket && listImageTicket.length > 0) {
      const result = listImageTicket.map((item) => ({ type: "image", url: item }));
      setFormData((prev) => ({ ...prev, values: { ...prev.values, docLink: JSON.stringify(result) } }));
    }
  }, [listImageTicket]);

  // const handleRemoveImageItem = (idx) => {
  //   const result = JSON.parse(formData.values.docLink);
  //   result.splice(idx, 1);
  //   setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(result) } });
  // };

  const handleGoBack = () => {
    // nếu mục đích là quay lại trang trước => navigate(-1)
    navigate(-1);
  };

  return (
    <Fragment>
      <div className="page-collect-ticket">
        <form className="form-ticket-group" onSubmit={(e) => onSubmit(e)}>
          <div className="header-form">
            <h1>THÔNG TIN ƯU ĐÃI VÀ ĐẶT LỊCH HẸN TƯ VẤN</h1>
          </div>
          {succesSubmit ? (
            <div className="list-form-group" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              GỬI THÔNG TIN THÀNH CÔNG
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
                          key={field.name ?? index}
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

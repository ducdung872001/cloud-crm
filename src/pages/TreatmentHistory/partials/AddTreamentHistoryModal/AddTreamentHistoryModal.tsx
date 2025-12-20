import React, { useState, useEffect, useMemo, Fragment, useCallback, useContext } from "react";
import moment from "moment";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IAddTreatmentHistoryModelProps } from "model/treatmentHistory/PropsModel";
import { ITreatmentHistoryRequestModel } from "model/treatmentHistory/TreatmentHistoryRequestModel";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import FileUpload from "components/fileUpload/fileUpload";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { isDifferenceObj, convertToFileName } from "reborn-util";
import { handDownloadFileOrigin, showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import CustomerService from "services/CustomerService";
import EmployeeService from "services/EmployeeService";
import TreatmentHistoryService from "services/TreatmentHistoryService";
import BoughtServiceService from "services/BoughtServiceService";
import "./AddTreamentHistoryModal.scss";
import { ContextType, UserContext } from "contexts/userContext";
import { IServiceFilterRequest } from "model/service/ServiceRequestModel";
import ServiceService from "services/ServiceService";
import ImgRar from "assets/images/img-rar.png";
import ImgZip from "assets/images/img-zip.png";
import ImgFilePDF from "assets/images/img-pdf.png";
import ImgFileDoc from "assets/images/img-word.png";
import ImgFileExcel from "assets/images/img-excel.png";
import ImgFilePowerpoint from "assets/images/img-powerpoint.png";
import Tippy from "@tippyjs/react";
import { uploadDocumentFormData } from "utils/document";
import FileService from "services/FileService";

const FILE_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "heic", "heif", "tif", "tiff"];

const getFileExtension = (name?: string): string => {
  if (!name) return "";
  const lastDotIndex = name.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return name.substring(lastDotIndex + 1).toLowerCase();
};

const normalizeAttachmentPayload = (payload: any, originFile?: File) => {
  if (!payload) return null;
  const fileUrl = payload.fileUrl || payload.url || "";
  const fallbackFileNameFromUrl = fileUrl ? convertToFileName(fileUrl.split("/").pop()) : "";
  const fileName = payload.fileName || originFile?.name || fallbackFileNameFromUrl || "";
  const extensionCandidate =
    (payload.extension || payload.type || getFileExtension(fileName) || getFileExtension(fileUrl))?.toString().toLowerCase() || "";
  const mineType = (payload.mineType || payload.mimeType || payload.fileType || originFile?.type || "")?.toString().toLowerCase();
  const fileType = (payload.fileType || (mineType && mineType.includes("/") ? mineType.split("/")[0] : mineType) || "")?.toString().toLowerCase();
  const isImage =
    fileType === "image" ||
    (mineType && mineType.startsWith("image")) ||
    FILE_IMAGE_EXTENSIONS.includes(extensionCandidate);

  return {
    width: payload.width ?? null,
    height: payload.height ?? null,
    fileUrl,
    url: fileUrl,
    fileName,
    fileSize: payload.fileSize ?? originFile?.size ?? null,
    fileType: payload.fileType ?? (isImage ? "image" : payload.fileType ?? "application"),
    mineType: payload.mineType ?? payload.mimeType ?? originFile?.type ?? (isImage ? "image" : "application"),
    extension: isImage ? extensionCandidate || "image" : extensionCandidate,
    type: isImage ? "image" : extensionCandidate || "file",
  };
};

const serializeAttachmentItem = (item) => ({
  width: item?.width ?? null,
  height: item?.height ?? null,
  fileUrl: item?.fileUrl ?? item?.url ?? "",
  fileName: item?.fileName ?? "",
  fileSize: item?.fileSize ?? null,
  fileType: item?.fileType ?? null,
  mineType: item?.mineType ?? null,
  extension: item?.extension ?? null,
});

const normalizeCommitsString = (value?: string) => {
  if (!value) return "";

  try {
    const parsed = JSON.parse(value);
    const list = (Array.isArray(parsed) ? parsed : [parsed])
      .map((item) => normalizeAttachmentPayload(item))
      .filter((item) => item)
      .map((item) => serializeAttachmentItem(item));

    if (list.length === 0) return "";
    return JSON.stringify(list.length === 1 ? list[0] : list);
  } catch (error) {
    return "";
  }
};

interface IDataServiceOption {
  value: number;
  serviceId: number;
  label: string;
  avatar: string;
  isCombo: number;
  treatmentNum: number;
  totalTreatment: number;
  cardNumber: string;
  serviceNumber: string;
}

export default function AddTreamentHistoryModal(props: IAddTreatmentHistoryModelProps) {
  const { onShow, onHide, data, idCustomer } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listBuyService, setListBuyService] = useState<IDataServiceOption[]>([]);
  const [isLoadingBuyService, setIsLoadingBuyService] = useState<boolean>(false);

  const [detailCustomer, setDetailCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [detailEmployee, setDetailEmployee] = useState(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);

  const [detailService, setDetailService] = useState(null);
  const [detailCard, setDetailCard] = useState(null);
  const [listAttactment, setListAttactment] = useState([]);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<number>(0);

  useEffect(() => {
    if (!onShow) {
      setListAttactment([]);
      return;
    }

    if (!data?.commits) {
      setListAttactment([]);
      return;
    }

    const normalized = normalizeCommitsString(data.commits);

    if (!normalized) {
      setListAttactment([]);
      return;
    }

    try {
      const parsed = JSON.parse(normalized);
      const mapping = (Array.isArray(parsed) ? parsed : [parsed])
        .map((item) => normalizeAttachmentPayload(item))
        .filter((item) => item);
      setListAttactment(mapping);
    } catch (error) {
      setListAttactment([]);
    }
  }, [onShow, data?.commits]);

  //!validate
  const [checkFieldCustomer, setCheckFieldCustomer] = useState<boolean>(false);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const [checkFieldService, setCheckFieldService] = useState<boolean>(false);

  const values = useMemo(
    () =>
    ({
      customerId: data?.customerId ?? null,
      customerPhone: detailCustomer?.phoneMasked ?? "",
      serviceId: data?.serviceId ?? null,
      treatmentStart: data?.treatmentStart ?? new Date(),
      treatmentEnd: data?.treatmentEnd ?? "",
      procDesc: data?.procDesc ?? "",
      afterProof: data?.afterProof ?? "",
      prevProof: data?.prevProof ?? "",
      scheduleNext: data?.scheduleNext ?? "",
      employeeId: data?.employeeId ?? null,
      note: data?.note ?? "",
      treatmentTh: data?.totalTreatment ?? 0,
      serviceNumber: data?.serviceNumber ?? null,
      cardNumber: data?.cardNumber ?? null,
      commits: normalizeCommitsString(data?.commits),
    } as ITreatmentHistoryRequestModel),
    [data, onShow, detailCustomer?.phoneMasked]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //? đoạn này sử lý vấn đề lấy chi tiết 1 khách hàng khi thêm mới
  const getDetailCustomerOneCreate = async (id: number) => {
    if (!id) return;
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        phoneMasked: result.phoneMasked,
      };

      setDetailCustomer(detailData);
    }

    setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (idCustomer) {
      getDetailCustomerOneCreate(idCustomer);
    }
  }, [idCustomer]);

  //! đoạn này sử lý vấn đề lấy ra danh sách khách hàng
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
                label: item.name,
                avatar: item.avatar,
                phoneMasked: item.phoneMasked,
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
    setDetailCustomer(e);
    setDetailService(null);
    setDetailCard(null);
    onSelectOpenBuyService(e.value);
    setFormData({ ...formData, values: { ...formData?.values, customerId: e.value, customerPhone: e.phoneMasked, treatmentTh: 0 } });
  };

  const getDetailCustomer = async () => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(data?.customerId);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        phoneMasked: result.phoneMasked,
      };

      setDetailCustomer(detailData);
    }

    setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (data?.customerId && onShow) {
      getDetailCustomer();
    }
  }, [data?.customerId, onShow]);

  //? đoạn này xử lý vấn đề khi mà detailCustomer thay đổi thì update lại vào formData
  useEffect(() => {
    if (detailCustomer) {
      setFormData({ ...formData, values: { ...formData?.values, customerPhone: detailCustomer?.phoneMasked } });
    }
  }, [detailCustomer]);

  //! đoạn này xử lý vấn đề lấy ra danh sách thẻ dịch vụ đã mua
  const onSelectOpenBuyService = async (idCustomer?: number) => {
    if (!idCustomer) return;

    setIsLoadingBuyService(true);

    const response = await BoughtServiceService.getByCustomerId(idCustomer);

    if (response.code === 0) {
      const dataOption = (response.result || []).sort((a, b) => a.totalTreatment - b.totalTreatment);

      setListBuyService([
        ...(dataOption.length > 0
          ? dataOption.map((item) => {
            return {
              value: item.id,
              serviceId: item.serviceId,
              label: item.serviceName,
              avatar: item.serviceAvatar,
              isCombo: item.isCombo,
              treatmentNum: item.treatmentNum,
              totalTreatment: item.totalTreatment + 1,
              serviceNumber: item.serviceNumber,
              cardNumber: item.cardNumber,
            };
          })
          : []),
      ]);

      const takeDetailService = dataOption.find(
        (item) => (item.serviceNumber && item.serviceNumber == data?.serviceNumber) || (item.cardNumber && item.cardNumber == data?.cardNumber)
      );

      if (takeDetailService) {
        setDetailService({
          value: takeDetailService?.id,
          serviceId: takeDetailService.serviceId,
          label: takeDetailService.serviceName,
          avatar: takeDetailService.serviceAvatar,
          isCombo: takeDetailService.isCombo,
          treatmentNum: takeDetailService.treatmentNum,
          totalTreatment: takeDetailService.totalTreatment,
          serviceNumber: data?.serviceNumber ? data?.serviceNumber : takeDetailService.serviceNumber,
          cardNumber: data?.cardNumber ? data?.cardNumber : takeDetailService.cardNumber,
        });
        setDetailCard({
          value: takeDetailService.id,
          serviceId: takeDetailService.serviceId,
          label: takeDetailService.serviceName,
          avatar: takeDetailService.serviceAvatar,
          isCombo: takeDetailService.isCombo,
          treatmentNum: takeDetailService.treatmentNum,
          totalTreatment: takeDetailService.totalTreatment + 1,
          serviceNumber: data?.serviceNumber ? data?.serviceNumber : takeDetailService.serviceNumber,
          cardNumber: data?.cardNumber ? data?.cardNumber : takeDetailService.cardNumber,
        });
      }
    }

    setIsLoadingBuyService(false);
  };

  useEffect(() => {
    if ((data?.customerId || idCustomer) && onShow) {
      onSelectOpenBuyService(data?.customerId || idCustomer);
    }
  }, [data, onShow, idCustomer]);

  const formatOptionLabelBuyService = (option) => {
    const { label, avatar, cardNumber, serviceNumber } = option || {};
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div>
          <div>
            <strong>{cardNumber || "Không có mã thẻ"}</strong>
            {serviceNumber ? ` • ${serviceNumber}` : ""}
          </div>
          <div className="sub">{label}</div>
        </div>
      </div>
    );
  };

  //! đoạn này xử lý vấn đề thay đổi dịch vụ
  const handleChangeValueService = (e) => {
    setCheckFieldService(false);
    setDetailService(e);
  };

  const handleChangeValueCard = (e) => {
    setDetailCard(e);
    // đồng bộ sang trường Dịch vụ khi chọn thẻ dịch vụ
    if (e) {
      setDetailService({
        value: e?.serviceId,
        serviceId: e?.serviceId,
        label: e?.label,
        avatar: e?.avatar,
        isCombo: e?.isCombo,
        treatmentNum: e?.treatmentNum,
        totalTreatment: e?.totalTreatment,
        serviceNumber: e?.serviceNumber,
        cardNumber: e?.cardNumber,
      });
    }
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        serviceId: e?.serviceId,
        serviceNumber: e?.serviceNumber,
        cardNumber: e?.cardNumber,
        treatmentTh: e?.totalTreatment || 1,
      },
    });
  };

  useEffect(() => {
    if (detailService) {
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          serviceId: detailService.serviceId,
          serviceNumber: detailService.serviceNumber,
          cardNumber: detailService.cardNumber,
          treatmentTh: detailService.totalTreatment || 1,
        },
      });
    }
  }, [detailService]);

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
  const loadedOptionService = async (search, loadedOptions, { page }) => {
    const param: IServiceFilterRequest = {
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
  const uploadError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };
  const handleRemoveImageItem = (idx) => {
    const result = [...listAttactment];
    result.splice(idx, 1);
    setListAttactment(result);
  };

  const appendAttachment = (data, originFile?: File) => {
    const attachment = normalizeAttachmentPayload(data, originFile);
    if (attachment) {
      setListAttactment((prev) => [...prev, attachment]);
    }
    setIsLoadingFile(false);
  };

  const handUploadFile = async (file: File) => {
    await FileService.uploadFile({
      data: file,
      onSuccess: (response) => appendAttachment(response, file),
      onError: uploadError,
    });
  };

  const download = (link, name) => {
    if (!link) return;
    const type = link.includes(".docx")
      ? "docx"
      : link.includes(".xlsx")
        ? "xlsx"
        : link.includes(".pdf") || link.includes(".PDF")
          ? "pdf"
          : link.includes(".pptx")
            ? "pptx"
            : link.includes(".zip")
              ? "zip"
              : "rar";
    const fallbackName = name || convertToFileName(link.split("/").pop());
    const nameDownload = `${fallbackName}.${type}`;

    handDownloadFileOrigin(link, nameDownload);
  };

  const isAttachmentImage = (item) => {
    if (!item) return false;
    const type = (item.type || "").toString().toLowerCase();
    const extension = (item.extension || "").toString().toLowerCase();
    const mineType = (item.mineType || item.fileType || "").toString().toLowerCase();
    return type === "image" || mineType.startsWith("image") || FILE_IMAGE_EXTENSIONS.includes(extension);
  };

  const getAttachmentThumbnail = (item) => {
    if (!item) return "";
    if (isAttachmentImage(item)) {
      return item.fileUrl || item.url;
    }

    const extension = (item.extension || item.type || "").toString().toLowerCase();

    switch (extension) {
      case "doc":
      case "docx":
        return ImgFileDoc;
      case "xls":
      case "xlsx":
        return ImgFileExcel;
      case "pdf":
        return ImgFilePDF;
      case "ppt":
      case "pptx":
        return ImgFilePowerpoint;
      case "zip":
        return ImgZip;
      case "rar":
        return ImgRar;
      default:
        return ImgFileDoc;
    }
  };

  const handleUploadDocument = (e) => {
    e.preventDefault();

    const file = e.target.files[0];

    const checkFile = file.type;
    setIsLoadingFile(true);
    if (checkFile.startsWith("image")) {
      handUploadFile(file);
      return;
    }

    uploadDocumentFormData(
      file,
      (response) => appendAttachment(response, file),
      onError,
      onProgress
    );
  };

  const onError = (message) => {
      setIsLoadingFile(false);
      showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    };

    useEffect(() => {
        if (isLoadingFile === false) {
          setShowProgress(0);
        }
      }, [isLoadingFile]);

  useEffect(() => {
    setFormData((prevState) => {
      if (!prevState?.values) return prevState;
      const payload = listAttactment.map(serializeAttachmentItem).filter((item) => item);
      const commitValue = payload.length === 0 ? "" : JSON.stringify(payload.length === 1 ? payload[0] : payload);
      if (prevState.values.commits === commitValue) return prevState;
      return {
        ...prevState,
        values: {
          ...prevState.values,
          commits: commitValue,
        },
      };
    });
  }, [listAttactment]);

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent.toFixed(0));
    }
  };

  const handleChangeValueEmployee = (e) => {
    setCheckFieldEmployee(false);
    setDetailEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };

  const getDetailEmployee = async () => {
    setIsLoadingEmployee(true);
    const response = await EmployeeService.detail(data?.employeeId);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      };

      setDetailEmployee(detailData);
    }
    setIsLoadingEmployee(false);
  };

  useEffect(() => {
    if (data?.employeeId && onShow) {
      getDetailEmployee();
    }
  }, [data?.employeeId, onShow]);

  const validations: IValidation[] = [
    {
      name: "treatmentStart",
      rules: "required",
    },
    {
      name: "treatmentEnd",
      rules: "required",
    },
  ];

  // lấy thông tin ngày bắt đầu tiếp nhận, và ngày cuối cùng tiếp nhận
  const startMoment = useMemo(() => moment(formData.values.treatmentStart), [formData.values.treatmentStart]);
  const endMoment = useMemo(() => moment(formData.values.treatmentEnd), [formData.values.treatmentEnd]);

  const isStartAfterEnd = startMoment.isAfter(endMoment);
  const isEndBeforeStart = endMoment.isBefore(startMoment);
  const isScheduleNextBeforeNow = useMemo(() => {
    try {
      if (!formData?.values?.scheduleNext) return false;
      return moment(formData.values.scheduleNext).isBefore(moment(), 'minute'); // so sánh đến phút
    } catch (e) {
      return false;
    }
  }, [formData?.values?.scheduleNext]);

  const listField = useMemo(
    () =>
      [
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
              value={detailCustomer}
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
              isLoading={data?.customerId ? isLoadingCustomer : null}
            />
          ),
        },
        {
          label: "Số điện thoại khách hàng",
          name: "customerPhone",
          type: "text",
          fill: true,
          disabled: true,
        },
        {
          name: "serviceId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="serviceId"
              name="serviceId"
              label="Dịch vụ"
              options={[]}
              fill={true}
              value={detailService}
              required={true}
              onChange={(e) => handleChangeValueService(e)}
              isAsyncPaginate={true}
              disabled={true}
              isFormatOptionLabel={true}
              placeholder="Chọn dịch vụ"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionService}
              // formatOptionLabel={formatOptionLabelService}
              error={checkFieldService}
              message="Dịch vụ không được bỏ trống"
              isLoading={data?.serviceId ? isLoadingBuyService : null}
            />
          ),
        },
        {
          name: "cardNumberSelect",
          type: "custom",
          snippet: (
            <SelectCustom
              id="cardNumberSelect"
              name="cardNumberSelect"
              label="Thẻ dịch vụ"
              required={true}
              options={listBuyService}
              fill={true}
              value={detailCard}
              special={true}
              onChange={(e) => handleChangeValueCard(e)}
              disabled={!detailCustomer}
              isFormatOptionLabel={true}
              placeholder="Chọn thẻ dịch vụ"
              formatOptionLabel={formatOptionLabelBuyService}
              isLoading={isLoadingBuyService}
            />
          ),
        },
        {
          name: "cardTreatmentNum",
          type: "custom",
          snippet: (
            <NummericInput
              label="Số buổi trong thẻ"
              name="cardTreatmentNum"
              value={detailCard?.treatmentNum || detailService?.treatmentNum || 0}
              placeholder="Số buổi của thẻ"
              fill={true}
              disabled={true}
            />
          ),
        },
        {
          name: "treatmentTh",
          type: "custom",
          snippet: (
            <NummericInput
              label="Buổi điều trị thứ"
              name="treatmentTh"
              value={formData?.values?.treatmentTh}
              placeholder="Nhập số buổi"
              fill={true}
              warning={formData?.values?.treatmentTh > detailService?.treatmentNum}
              messageWarning="Đã vượt quá số buổi điều trị"
              disabled={true}
            />
          ),
        },
        {
          label: "Bắt đầu",
          name: "treatmentStart",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập ngày bắt đầu",
          hasSelectTime: true,
          isWarning: isStartAfterEnd,
          messageWarning: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
        },
        {
          label: "Kết thúc",
          name: "treatmentEnd",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          required: true,
          placeholder: "Nhập ngày kết thúc",
          hasSelectTime: true,
          isWarning: isEndBeforeStart,
          messageWarning: "Ngày kết thúc phải lớn hơn ngày bắt đầu",
        },
        {
          label: "Nội dung thực hiện",
          name: "procDesc",
          type: "textarea",
          fill: true,
        },
        {
          name: "uploadImage",
          type: "custom",
          snippet: (
            <div className="upload__img--after--before">
              <FileUpload label="Ảnh trước thực hiện" type="prevProof" name="prevProof" formData={formData} setFormData={setFormData} />
              <FileUpload label="Ảnh sau thực hiện" type="afterProof" name="afterProof" formData={formData} setFormData={setFormData} />
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
              label="Nhân viên thực hiện"
              options={[]}
              fill={true}
              value={detailEmployee}
              required={true}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn nhân viên"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              error={checkFieldEmployee}
              message="Nhân viên không được bỏ trống"
              isLoading={data?.employeeId ? isLoadingEmployee : null}
            />
          ),
        },
        {
          label: "Lưu ý thêm",
          name: "note",
          type: "text",
          fill: true,
        },
        {
          name: "commits",
          type: "custom",
          snippet: (
            <div className="attachments">
              <label className="title-attachment">Tài liệu đính kèm</label>
              <div className={listAttactment.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                {listAttactment.length === 0 ? (
                  <label htmlFor="imageUpload" className="action-upload-image">
                    <div className={`wrapper-upload ${isLoadingFile ? "d-none" : ""}`}>
                      <Icon name="Upload" />
                      Tải tài liệu lên
                    </div>
                    <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                      <Icon name="Refresh" />
                      <span className="name-loading">Đang tải...{showProgress}%</span>
                    </div>
                  </label>
                ) : (
                  <Fragment>
                    <div className="d-flex align-items-center">
                      {listAttactment.map((item, idx) => (
                        <div key={idx} className={isAttachmentImage(item) ? "image-item" : "file-item"}>
                          <img
                            src={getAttachmentThumbnail(item)}
                            alt="image-warranty"
                          />
                          {!isAttachmentImage(item) && (
                            <div className="file-name">
                              <h5 style={{ fontSize: 14 }}>
                                {item?.fileName || convertToFileName(item?.fileUrl || item?.url)}
                              </h5>
                            </div>
                          )}
                          <Tippy content="Tải xuống">
                            <span
                              className="icon-download"
                              onClick={() => download(item?.fileUrl || item?.url, item?.fileName)}
                            >
                              <Icon name="Download" />
                            </span>
                          </Tippy>
                          <Tippy content="Xoá">
                            <span className="icon-delete" onClick={() => handleRemoveImageItem(idx)}>
                              <Icon name="Trash" />
                            </span>
                          </Tippy>
                        </div>
                      ))}

                      <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                        <Icon name="Refresh" />
                        <span className="name-loading">Đang tải...{showProgress}%</span>
                      </div>

                      <label htmlFor="imageUpload" className="add-image">
                        <Icon name="PlusCircleFill" />
                      </label>
                    </div>
                  </Fragment>
                )}
              </div>
              <input
                type="file"
                accept="image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
                className="d-none"
                id="imageUpload"
                onChange={(e) => handleUploadDocument(e)}
              />
            </div>
          ),
        },
        {
          label: "Thời gian thực hiện tiếp theo",
          name: "scheduleNext",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập thời gian thực hiện tiếp theo",
          hasSelectTime: true,
          isMinDate: true,
          isWarning: isScheduleNextBeforeNow,
          messageWarning: "Thời gian thực hiện tiếp theo phải lớn hơn thời gian hiện tại",
        },
      ] as IFieldCustomize[],
    [
      detailCustomer,
      detailEmployee,
      listBuyService,
      checkFieldService,
      isLoadingBuyService,
      formData,
      checkFieldEmployee,
      checkFieldCustomer,
      isLoadingCustomer,
      isLoadingEmployee,
      detailService,
      data,
      isStartAfterEnd,
      isEndBeforeStart,
      listAttactment,
      isLoadingFile,
      showProgress,
    ]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, [...listField]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (detailCustomer === null) {
      setCheckFieldCustomer(true);
      return;
    }

    if (detailService == null) {
      setCheckFieldService(true);
      return;
    }

    if (detailEmployee === null) {
      setCheckFieldEmployee(true);
      return;
    }

    // Validate: 'scheduleNext' must not be greater than current time
    if (formData?.values?.scheduleNext) {
      const scheduleNextMoment = moment(formData.values.scheduleNext);
      const now = moment();
      if (scheduleNextMoment.isSameOrBefore(now, 'minute')) { // <= hiện tại → lỗi
        const newErrors = { 
          ...(formData.errors || {}), 
          scheduleNext: "Thời gian thực hiện tiếp theo phải lớn hơn thời gian hiện tại" 
        };
        setFormData((prev) => ({ ...prev, errors: newErrors }));
        return;
      }
    }

    setIsSubmit(true);

    const body: ITreatmentHistoryRequestModel[] = [
      {
        ...(formData.values as ITreatmentHistoryRequestModel),
        ...(data ? { id: data.id } : {}),
        treatmentStart: moment(formData.values.treatmentStart).format('YYYY-MM-DDTHH:mm:ss'),
        treatmentEnd: moment(formData.values.treatmentEnd).format('YYYY-MM-DDTHH:mm:ss'),
        
      },
    ];

    const response = await TreatmentHistoryService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} yêu cầu thực hiện dịch vụ thành công`, "success");
      setDetailCustomer(null);
      setListBuyService([]);
      setDetailEmployee(null);
      setDetailService(null);
      setDetailCard(null);
      onHide(true);
    } else {
      showToast(response.error ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDetailCustomer(null);
    setListBuyService([]);
    setDetailEmployee(null);
    setDetailService(null);
    setDetailCard(null);
    setIsLoadingBuyService(false);
    setListAttactment([]);
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
              isStartAfterEnd ||
              isEndBeforeStart ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, isStartAfterEnd, isEndBeforeStart]
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
        className="modal-add-treament-history"
      >
        <form className="form-treament-history-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} yêu cầu thực hiện dịch vụ`}
            toggle={() => {
              if (!isSubmit) {
                onHide(false);
                setDetailCustomer(null);
                setDetailEmployee(null);
                setDetailService(null);
                setListBuyService([]);
                setDetailCard(null);
                setListAttactment([]);
              }
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

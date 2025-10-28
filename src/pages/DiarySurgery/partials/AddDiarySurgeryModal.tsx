import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { isDifferenceObj } from "reborn-util";
import moment from "moment";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddDiarySurgeryModelProps } from "model/diarySurgery/PropsModel";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { ITreatmentHistoryListByCustomerFilterRequest } from "model/treatmentHistory/TreatmentHistoryRequestModel";
import { IDiarySurgeryRequestModel } from "model/diarySurgery/DiarySurgeryRequestModel";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import { useActiveElement } from "utils/hookCustom";
// import { uploadImageFromFiles } from "utils/image";
import FileService from "services/FileService";
import CustomerService from "services/CustomerService";
import DiarySurgeryService from "services/DiarySurgeryService";
import BoughtServiceService from "services/BoughtServiceService";
import TreatmentHistoryService from "services/TreatmentHistoryService";
import "./AddDiarySurgeryModal.scss";

interface IDataServiceOption {
  value: number;
  serviceId: number;
  label: string;
  avatar: string;
  cardNumber: string;
  serviceNumber: string;
}

interface IDateTreatmentHistoryOption {
  value: number;
  label: string;
  date: string;
  treatmentTh: number;
}

export default function AddDiarySurgeryModal(props: IAddDiarySurgeryModelProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [detailCustomer, setDetailCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [listTreatmentHistory, setListTreatmentHistory] = useState<IDateTreatmentHistoryOption[]>([]);
  const [detaiTreatmentHistory, setDetailTreatmentHistory] = useState<IDateTreatmentHistoryOption>(null);

  //!validate
  const [checkFieldCustomer, setCheckFieldCustomer] = useState<boolean>(false);
  const [checkFieldService, setCheckFieldService] = useState<boolean>(false);
  const [checkFieldTreatmentHistory, setCheckFieldTreatmentHistory] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách khách hàng
  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
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
    setDetailCustomer(e);
    setDetailService(null);
    onSelectOpenBuyService(e.value);
    setFormData({ ...formData, values: { ...formData?.values, customerId: e.value } });
  };

  //! lấy khách hàng lúc update
  const getDetailCustomer = async () => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(data?.customerId);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: `${result.name} - ${result.phoneMasked}`,
        avatar: result.avatar,
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

  const [detailService, setDetailService] = useState(null);

  const [listBuyService, setListBuyService] = useState<IDataServiceOption[]>([]);
  const [isLoadingBuyService, setIsLoadingBuyService] = useState<boolean>(false);

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
          serviceId: takeDetailService?.serviceId,
          label: takeDetailService.serviceName,
          serviceNumber: takeDetailService.serviceNumber,
          avatar: takeDetailService.serviceAvatar,
          cardNumber: takeDetailService.cardNumber,
        });
      }
    }

    setIsLoadingBuyService(false);
  };

  useEffect(() => {
    if (data?.customerId) {
      onSelectOpenBuyService(data?.customerId);
    }
  }, [data]);

  const formatOptionLabelBuyService = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý vấn đề thay đổi dịch vụ
  const handleChangeValueService = (e) => {
    setCheckFieldService(false);
    setDetailService(e);
  };

  //! đoạn này hình thành tham số call api lấy danh sách số buổi
  const getListByCustomer = async () => {
    const param: ITreatmentHistoryListByCustomerFilterRequest = {
      customerId: detailCustomer.value,
      serviceId: detailService.serviceId,
      serviceNumber: detailService.serviceNumber ? detailService.serviceNumber : "",
      cardNumber: detailService.cardNumber ? detailService.cardNumber : "",
    };

    const response = await TreatmentHistoryService.listByCustomer(param);

    if (response.code == 0) {
      const dataOption = (response.result || []).map((item) => {
        return {
          value: item.id,
          label: item.employeeName,
          treatmentTh: item.treatmentTh,
          date: item.treatmentStart,
        };
      });

      setListTreatmentHistory(dataOption);
    }
  };

  useEffect(() => {
    if (detailCustomer && detailService) {
      getListByCustomer();
    }
  }, [detailCustomer, detailService]);

  //! xử lý thay đổi buổi điều trị
  const handleChangeValueTreatmentHistory = (e) => {
    setDetailTreatmentHistory(e);
  };

  const formatOptionLabelTreatmentHistory = ({ label, date, treatmentTh }) => {
    return (
      <div className="selected--item">
        <div className="d-flex align-items-start justify-content-start flex-column">
          {`Buổi điều trị số: ${treatmentTh} - Nhân viên: ${label}`}
          <span className="subsidiary">Ngày bắt đầu: {moment(date).format("DD/MM/YYYY")}</span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (detaiTreatmentHistory) {
      setFormData({ ...formData, values: { ...formData?.values, thyId: detaiTreatmentHistory.value } });
    }
  }, [detaiTreatmentHistory]);

  useEffect(() => {
    if (data && listTreatmentHistory.length > 0) {
      const result = (listTreatmentHistory || []).find((item) => item.value == data.thyId);

      setDetailTreatmentHistory(result);
    }
  }, [data, listTreatmentHistory]);

  //! đoạn này lấy ra danh sách ảnh diary
  const [listImageDiary, setListImageDiary] = useState([]);

  const values = useMemo(
    () =>
      ({
        thyId: data?.thyId ?? null,
        diaryDate: data?.diaryDate ?? "",
        medias: data?.medias ?? "[]",
        note: data?.note ?? "",
      } as IDiarySurgeryRequestModel),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const validations: IValidation[] = [
    {
      name: "diaryDate",
      rules: "required",
    },
  ];

  useEffect(() => {
    if (JSON.parse(formData.values.medias || "[]").length > 0) {
      const result = JSON.parse(formData.values.medias).map((item) => item.url);
      setListImageDiary(result);
    }
  }, [formData.values.medias]);

  //! đoạn này xử lý hình ảnh
  const handleImageUpload = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      const maxSize = 1048576;

      if (e.target.files[0].size > maxSize) {
        showToast("Ảnh tải lên giới hạn dung lượng không quá 2MB", "warning");
        e.target.value = "";
      } else {
        // uploadImageFromFiles(e.target.files, showImage, false);
        handUploadFile(e.target.files[0]);
        e.target.value = null;
      }
    }
  };

  const showImage = (url, filekey) => {
    setListImageDiary([...listImageDiary, url]);
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setListImageDiary([...listImageDiary, result]);
  };

  useEffect(() => {
    const merge = listImageDiary.map((item) => {
      return {
        url: item,
        type: "image",
      };
    });
    setFormData({ ...formData, values: { ...formData.values, medias: JSON.stringify(merge) } });
  }, [listImageDiary]);

  const handleRemoveImageItem = (idx) => {
    const result = JSON.parse(formData.values.medias);
    result.splice(idx, 1);
    setFormData({ ...formData, values: { ...formData.values, medias: JSON.stringify(result) } });
  };

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
          name: "serviceId",
          type: "custom",
          snippet: (
            <SelectCustom
              label="Dịch vụ"
              id="serviceId"
              name="serviceId"
              options={listBuyService}
              fill={true}
              required={true}
              value={detailService}
              special={true}
              isLoading={isLoadingBuyService}
              onMenuOpen={onSelectOpenBuyService}
              isFormatOptionLabel={true}
              formatOptionLabel={(e) => formatOptionLabelBuyService(e)}
              onChange={(e) => handleChangeValueService(e)}
              placeholder="Chọn dịch vụ"
              error={checkFieldService}
              message="Dịch vụ không được để trống"
              disabled={!detailCustomer}
            />
          ),
        },
        {
          name: "thyId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="thyId"
              name="thyId"
              fill={true}
              required={true}
              options={listTreatmentHistory}
              special={true}
              value={detaiTreatmentHistory}
              label="Buổi điều trị thứ"
              placeholder="Chọn số buổi điều trị"
              disabled={!detailService}
              error={checkFieldTreatmentHistory}
              message="Số buổi điều trị không được bỏ trống"
              onChange={(e) => handleChangeValueTreatmentHistory(e)}
              isFormatOptionLabel={true}
              formatOptionLabel={(e) => formatOptionLabelTreatmentHistory(e)}
            />
          ),
        },
        {
          label: "Ngày ghi nhận",
          name: "diaryDate",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập ngày ghi nhận",
          hasSelectTime: true,
        },
        {
          type: "custom",
          name: "medias",
          snippet: (
            <div className="medias">
              <label className="title-medias">Tải ảnh khách hàng</label>
              <div className={listImageDiary.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                {JSON.parse(formData.values.medias || "[]").length === 0 ? (
                  <label htmlFor="imageUpload" className="action-upload-image">
                    <div className="wrapper-upload">
                      <Icon name="Upload" />
                      Tải ảnh lên
                    </div>
                  </label>
                ) : (
                  <Fragment>
                    <div className="d-flex align-items-center">
                      {JSON.parse(formData.values.medias || "[]").map((item, idx) => (
                        <div key={idx} className="image-item">
                          <img src={item.url} alt="image-warranty" />
                          <span className="icon-delete" onClick={() => handleRemoveImageItem(idx)}>
                            <Icon name="Trash" />
                          </span>
                        </div>
                      ))}
                      <label htmlFor="imageUpload" className="add-image">
                        <Icon name="PlusCircleFill" />
                      </label>
                    </div>
                  </Fragment>
                )}
              </div>
              <input
                type="file"
                accept="image/gif,image/jpeg,image/png,image/jpg"
                className="d-none"
                id="imageUpload"
                onChange={(e) => handleImageUpload(e)}
              />
            </div>
          ),
        },
        {
          label: "Ý kiến khách hàng",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [
      formData?.values,
      listImageDiary,
      checkFieldCustomer,
      detailCustomer,
      checkFieldCustomer,
      isLoadingCustomer,
      detailService,
      checkFieldService,
      isLoadingBuyService,
      checkFieldTreatmentHistory,
      listTreatmentHistory,
      detaiTreatmentHistory,
      checkFieldTreatmentHistory,
      listBuyService,
    ]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

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

    if (detaiTreatmentHistory == null) {
      setCheckFieldTreatmentHistory(true);
      return;
    }

    setIsSubmit(true);

    const body: IDiarySurgeryRequestModel = {
      ...(formData.values as IDiarySurgeryRequestModel),
      ...(data ? { id: data.id } : {}),
    };

    const response = await DiarySurgeryService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} Nhật ký điều trị thành công`, "success");
      onHide(true);
      setListBuyService([]);
      setDetailCustomer(null);
      setDetailService(null);
      setDetailTreatmentHistory(null);
      setListTreatmentHistory([]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setListBuyService([]);
    setDetailCustomer(null);
    setDetailService(null);
    setDetailTreatmentHistory(null);
    setListTreatmentHistory([]);
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
              checkFieldCustomer ||
              checkFieldService ||
              checkFieldTreatmentHistory ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldCustomer, checkFieldService, checkFieldTreatmentHistory]
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
        className="modal-add-diary-surgery"
      >
        <form className="form-diary-surgery-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} Nhật ký điều trị`}
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setListBuyService([]);
              !isSubmit && setDetailCustomer(null);
              !isSubmit && setDetailService(null);
              !isSubmit && setDetailTreatmentHistory(null);
              !isSubmit && setListTreatmentHistory([]);
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

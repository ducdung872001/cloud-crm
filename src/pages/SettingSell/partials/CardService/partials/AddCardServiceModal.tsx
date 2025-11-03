import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import SelectCustom from "components/selectCustom/selectCustom";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IServiceFilterRequest } from "model/service/ServiceRequestModel";
import { AddCardServiceModalProps } from "model/cardService/PropsModel";
import { ICardServiceRequest } from "model/cardService/CardServiceRequestModel";
import CardServiceService from "services/CardServiceService";
import ServiceService from "services/ServiceService";
import ImageThirdGender from "assets/images/third-gender.png";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./AddCardServiceModal.scss";

export default function AddCardServiceModal(props: AddCardServiceModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [dataService, setDataService] = useState(null);

  const [listPriceVariation, setListPriceVariation] = useState([]);
  const [dataPriceVariation, setDataPriceVariation] = useState(null);
  const [validateServiceCombo, setValidateServiceCombo] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách dịch vụ
  const loadedOptionService = async (search, loadedOptions, { page }) => {
    const param: IServiceFilterRequest = {
      name: search,
      isCombo: 1,
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
                  price: item.price,
                  discount: item.discount ? item.discount : item.price,
                  priceVariation: item.priceVariation,
                  treatmentNum: item?.treatmentNum,
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

  //! đoạn này xử lý vấn đề hiển thị hình ảnh dịch vụ
  const formatOptionLabelService = ({ label, avatar }) => {
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
    setDataPriceVariation(null);
    setDataService(e);
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        serviceId: e.value,
        treatmentNum: e?.treatmentNum || 0,
        cash: 0,
        account: 0,
      },
    });

    const takePriceVariation = (Array.isArray(JSON.parse(e.priceVariation)) ? JSON.parse(e.priceVariation) : []).map((item) => {
      return {
        value: item.priceId,
        label: item.name,
        price: item.price,
        discount: item.discount,
        treatmentNum: item?.treatmentNum,
      };
    });
    setListPriceVariation(takePriceVariation);
  };

  //! đoạn này lấy ra chi tiết dịch vụ khi cập nhật
  const getDetailService = async () => {
    const response = await ServiceService.detail(data?.serviceId);

    if (response.code === 0) {
      const result = response.result;

      setDataService({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        price: result.price,
        discount: result.discount,
        priceVariation: result.priceVariation,
        treatmentNum: result?.treatmentNum,
      });

      const takePriceVariation = JSON.parse(result.priceVariation || "[]").map((item) => {
        return {
          value: item.priceId,
          label: item.name,
          price: item.price,
          discount: item.discount,
          treatmentNum: item?.treatmentNum,
        };
      });
      setListPriceVariation(takePriceVariation);
    }
  };

  useEffect(() => {
    if (data?.serviceId && onShow) {
      getDetailService();
    }
  }, [data, onShow]);

  //? đoạn này thay đổi giá trị chọn gói
  const handleChangeValuePriceVariation = (e) => {
    setValidateServiceCombo(false);
    setDataPriceVariation(e);
  };

  const values = useMemo(
    () =>
      ({
        id: data?.id ?? 0,
        name: data?.name ?? "",
        code: data?.code ?? "",
        note: data?.note ?? "",
        cash: data?.cash ?? 0,
        account: data?.account ?? 0,
        avatar: data?.avatar ?? "",
        multiPurpose: data?.multiPurpose?.toString() ?? "1",
        serviceId: data?.serviceId ?? 0,
        serviceCombo: data?.serviceCombo ?? "[]",
        treatmentNum: data?.treatmentNum ?? 0,
      } as ICardServiceRequest),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "code",
      rules: "required",
    },
    {
      name: "cash",
      rules: "required|min:0",
    },
    {
      name: "account",
      rules: "required|min:0",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Loại thẻ",
          name: "multiPurpose",
          type: "radio",
          fill: true,
          options: [
            {
              value: "1",
              label: "Thẻ đa năng",
            },
            {
              value: "2",
              label: "Thẻ liệu trình",
            },
          ],
        },
        ...(formData?.values?.multiPurpose == 2
          ? ([
              {
                name: "serviceId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    id="serviceId"
                    name="serviceId"
                    label="Dịch vụ"
                    fill={true}
                    options={[]}
                    value={dataService}
                    onChange={(e) => handleChangeValueService(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn dịch vụ"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionService}
                    formatOptionLabel={formatOptionLabelService}
                  />
                ),
              },
              ...(listPriceVariation && listPriceVariation?.length > 0
                ? [
                    {
                      name: "priceVariation",
                      type: "custom",
                      snippet: (
                        <SelectCustom
                          label="Chọn combo"
                          name="priceVariation"
                          options={listPriceVariation}
                          value={dataPriceVariation}
                          error={validateServiceCombo}
                          message="Vui lòng chọn combo"
                          fill={true}
                          special={true}
                          required={dataService ? true : false}
                          placeholder="Chọn combo theo dịch vụ"
                          onChange={(e) => handleChangeValuePriceVariation(e)}
                          disabled={!dataService}
                        />
                      ),
                    },
                  ]
                : []),
              {
                label: "Số buổi điều trị",
                name: "treatmentNum",
                type: "number",
                fill: true,
                disabled: true,
              },
            ] as IFieldCustomize[])
          : []),
        {
          label: "Tên thẻ",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mã thẻ",
          name: "code",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Giá bán",
          name: "cash",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Giá trị thẻ",
          name: "account",
          type: "number",
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [formData?.values, dataService, listPriceVariation, dataPriceVariation, validateServiceCombo]
  );

  const listFieldNote: IFieldCustomize[] = [
    {
      label: "Ghi chú",
      name: "note",
      type: "textarea",
      fill: true,
    },
  ];

  useEffect(() => {
    if (formData?.values?.multiPurpose == 1) {
      setFormData({ ...formData, values: { ...formData?.values, serviceId: 0, serviceCombo: JSON.stringify("") } });
      setDataService(null);
    }

    if (formData?.values?.multiPurpose == 2 && !formData?.values?.serviceId) {
      setFormData({ ...formData, values: { ...formData?.values, serviceId: 0, serviceCombo: JSON.stringify("") } });
    }
  }, [formData?.values?.multiPurpose, formData?.values?.serviceId]);

  //! xử lý vấn đề khi update thẻ liệu trình
  useEffect(() => {
    if (listPriceVariation.length > 0 && data?.serviceCombo) {
      const dataServiceComboProps = JSON.parse(formData?.values?.serviceCombo || "");

      const result = (listPriceVariation || []).find((item) => item.value == dataServiceComboProps.priceId);
      setDataPriceVariation(result);
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          treatmentNum: result?.treatmentNum,
        },
      });
    }
  }, [listPriceVariation, data?.serviceCombo]);

  //! đoạn này khi mà người dùng chọn thẻ liệu trình
  useEffect(() => {
    if (dataPriceVariation) {
      const serviceCombo = {
        priceId: dataPriceVariation.value,
        name: dataPriceVariation.label,
        price: dataPriceVariation.price,
        discount: dataPriceVariation.discount,
        treatmentNum: dataPriceVariation?.treatmentNum,
      };

      setFormData({
        ...formData,
        values: {
          ...formData.values,
          treatmentNum: dataPriceVariation?.treatmentNum,
          account: dataPriceVariation.price,
          cash: dataPriceVariation.discount,
          serviceCombo: JSON.stringify(serviceCombo),
        },
      });
    }
  }, [dataPriceVariation]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBasic, ...listFieldNote]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (formData?.values?.multiPurpose == 2 && dataService && listPriceVariation.length > 0 && dataPriceVariation == null) {
      setValidateServiceCombo(true);
      return;
    }

    setIsSubmit(true);

    const body: ICardServiceRequest = {
      ...(formData.values as ICardServiceRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await CardServiceService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} thẻ dịch vụ thành công`, "success");
      onHide(true);
      setDataService(null);
      setDataPriceVariation(null);
      setListPriceVariation([]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDataService(null);
    setDataPriceVariation(null);
    setListPriceVariation([]);
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
        className="modal-add-cardservice"
      >
        <form className="form-cardservice-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} thẻ dịch vụ`}
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setDataService(null);
              !isSubmit && setDataPriceVariation(null);
              !isSubmit && setListPriceVariation([]);
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              <div className="list-field-item list-field-basic">
                {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>

              <div className="list-field-item list-field-note">
                <FileUpload label="Ảnh thẻ" type="avatar" formData={formData} setFormData={setFormData} />

                {listFieldNote.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldNote, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { formatCurrency, isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Input from "components/input/input";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import "./ModalAllocateBudget.scss";
import { ContextType, UserContext } from "contexts/userContext";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import NummericInput from "components/input/numericInput";
import CampaignMarketingService from "services/CampaignMarketingService";

export default function ModalAllocateBudget(props: any) {
  const { onShow, onHide, idData, idCampaign } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [data, setData] = useState(null);
  const [detaiCampaign, setDetailCampaign] = useState(null);

  const getDetailMABudget = async () => {
    const response = await CampaignMarketingService.detailMABudget(idData);

    if (response.code === 0) {
      const result: any = response.result;

      if (result.channelId) {
        setDataChannel({ value: result.channelId, label: result.channelName });
      }

      setData({
        id: result.id,
        budget: result?.budget ?? 0,
        startDate: result?.startDate ?? "",
        endDate: result?.endDate ?? "",
        employeeId: result?.employeeId ?? null,
        coordinators: result?.coordinators ?? "[]",
        marketingId: result?.marketingId ?? 0,
        channelId: result?.channelId ?? 0,
        segments: result?.segments ?? "[]",
        measurements: result?.measurements ?? "[]",
      });
    }
  };

  const getDetailCampaignMA = async () => {
    const response = await CampaignMarketingService.detail(idCampaign);

    if (response.code === 0) {
      const result: any = response.result;
      setDetailCampaign(result);
    }
  };

  useEffect(() => {
    if (onShow && idData) {
      getDetailMABudget();
    }
    if (onShow && idCampaign) {
      getDetailCampaignMA();
    }
  }, [onShow, idData, idCampaign]);

  const values = useMemo(
    () =>
      ({
        budget: data?.budget ?? 0,
        startDate: data?.startDate ?? "",
        endDate: data?.endDate ?? "",
        employeeId: data?.employeeId ?? null,
        coordinators: data?.coordinators ?? "[]",
        marketingId: data?.marketingId ?? idCampaign ?? 0,
        channelId: data?.channelId ?? 0,
        segments: data?.segments ?? "[]",
        measurements: data?.measurements ?? "[]",
      } as any),
    [onShow, data, idCampaign]
  );

  const validations: IValidation[] = [];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // lấy thông tin ngày bắt đầu chiến dịch, và ngày cuối cùng chiến dịch
  const startDay = new Date(formData.values.startDate).getTime();
  const endDay = new Date(formData.values.endDate).getTime();

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

  // người phụ trách
  const [checkFieldChannel, setCheckFieldChannel] = useState<boolean>(false);
  const [dataChannel, setDataChannel] = useState(null);
  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionChannel = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
    };

    const response = await CampaignMarketingService.listMAChannel(param);

    if (response?.code === 0) {
      const dataOption = response.result;

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
        hasMore: false,
        // additional: {
        //     page: page + 1,
        // },
      };
    }
    return { options: [], hasMore: false };
  };

  const handleChangeValueChannel = (e) => {
    setCheckFieldChannel(false);
    setDataChannel(e);
    setFormData({ ...formData, values: { ...formData?.values, channelId: e.value } });
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();

    // const errors = Validate(validations, formData);

    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    if (!formData.values?.channelId) {
      setCheckFieldChannel(true);
      showToast("Vui lòng chọn kênh Marketing", "error");
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(formData.values as any),
      ...(data ? { id: data.id } : {}),
    };

    const response = await CampaignMarketingService.updateMABudget(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} phân bổ kênh Marketing thành công`, "success");
      handClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setData(null);
    setCheckFieldChannel(false);
    setCheckFieldStartDate(false);
    setCheckFieldEndDate(false);
    setDataChannel(null);
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
            title: idData ? "Cập nhật" : "Xác nhận",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldChannel ||
              checkFieldStartDate ||
              checkFieldEndDate ||
              endDay < startDay ||
              formData.values.budget > (detaiCampaign?.totalBudget || 0) ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, idData, checkFieldChannel, detaiCampaign]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "phân bổ"}`}</Fragment>,
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
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-allocate-budget"
        size="lg"
      >
        <form className="form-allocate-budget" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${idData ? "Chỉnh sửa" : "Phân bổ"} ngân sách kênh Marketing`} toggle={() => !isSubmit && handClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  id="channelId"
                  name="channelId"
                  label="Kênh Marketing"
                  fill={true}
                  required={true}
                  error={checkFieldChannel}
                  message="Kênh Marketing không được bỏ trống"
                  options={[]}
                  value={dataChannel}
                  onChange={(e) => handleChangeValueChannel(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={false}
                  placeholder="Chọn kênh Marketing"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionChannel}
                />
              </div>

              <div className="form-group">
                <NummericInput
                  label="Ngân sách"
                  name="totalBudget"
                  fill={true}
                  required={true}
                  thousandSeparator={true}
                  value={!formData.values?.budget ? "" : formData.values?.budget}
                  placeholder="Ngân sách"
                  onValueChange={(e) => {
                    const value = e.floatValue;
                    setFormData({ ...formData, values: { ...formData.values, budget: value } });
                  }}
                  error={formData.values.budget > (detaiCampaign?.totalBudget || 0) ? true : false}
                  message={
                    formData.values.budget > (detaiCampaign?.totalBudget || 0)
                      ? `Ngân sách cho kênh không được lớn hơn tổng ngân sách chiến dịch (${formatCurrency(detaiCampaign?.totalBudget || 0)})`
                      : ""
                  }
                />
              </div>

              <div className="form-group">
                <DatePickerCustom
                  label="Ngày bắt đầu"
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
              </div>

              <div className="form-group">
                <DatePickerCustom
                  label="Ngày kết thúc"
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
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

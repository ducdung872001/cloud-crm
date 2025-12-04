import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddChangeProbabilityModelProps } from "model/campaignOpportunity/PropsModel";
import { IOpportunityProcessUpdateRequestModel } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import CampaignService from "services/CampaignService";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import "./index.scss";
import { ICampaignApproachFilterRequest } from "model/campaignApproach/CampaignApproachRequestModel";
import CampaignApproachService from "services/CampaignApproachService";

export default function AddChangeProbabilityModal(props: IAddChangeProbabilityModelProps) {
  const { onShow, onHide, idCampaign, idData, idApproach, status, dataWork, qualityColum, percentProp } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        id: dataWork?.id,
        employeeId: dataWork?.employeeId,
        customerId: dataWork?.customerId,
        sourceId: dataWork?.sourceId,
        campaignId: dataWork?.campaignId,
        refId: dataWork?.refId,
        approachId: idApproach,
        expectedRevenue: dataWork?.expectedRevenue,
        startDate: dataWork?.startDate ?? "",
        endDate: dataWork?.endDate,
        saleId: dataWork?.saleId,
        opportunityId: dataWork?.opportunityId,
        type: dataWork?.type ?? "per",
        pipelineId: dataWork?.pipelineId ?? null,

        // coyId: idData,
        // approachId: idApproach,
        note: "",
        percent: percentProp || "",
        status: status ?? "1",
      } as IOpportunityProcessUpdateRequestModel),
    [onShow, idData, dataWork, percentProp, status]
  );

  const validations: IValidation[] = [
    {
      name: "approachId",
      rules: "required",
    },
    {
      name: "percent",
      rules: "required|min:0",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const [disableChangePercent, setDisableChangePercent] = useState(false);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const [listApproachStep, setListApproachStep] = useState<IOption[]>([]);

  const getDetailCampaign = async (id: number) => {
    const body: ICampaignApproachFilterRequest = {
      campaignId: id,
    };
    const response = await CampaignApproachService.list(body);

    if (response.code === 0) {
      const result = response.result;

      const takeLstApproachInDetailCampaign = (result || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });

      if (takeLstApproachInDetailCampaign?.length > 0) {
        setListApproachStep(takeLstApproachInDetailCampaign);
      }
    }
  };

  useEffect(() => {
    if (idCampaign && onShow) {
      getDetailCampaign(idCampaign);
    }
  }, [idCampaign, onShow]);

  const listField = useMemo(
    () =>
      [
        {
          label: "Quy trình",
          name: "approachId",
          type: "select",
          fill: true,
          required: true,
          options: listApproachStep,
          disabled: true,
        },
        {
          label: "Xác suất thành công (%)",
          name: "percent",
          type: "number",
          placeholder: "Nhập xác suất",
          fill: true,
          disabled: disableChangePercent,
          required: true,
        },
        {
          label: "Trạng thái cơ hội",
          name: "status",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Đang xử lý",
            },
            {
              value: "2",
              label: "Thành công",
            },
            // {
            //   value: "3",
            //   label: "Đã hủy",
            // },
            {
              value: "4",
              label: "Thất bại",
            },
          ],
        },
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [listApproachStep, disableChangePercent]
  );

  // useEffect(() => {
  //   if(percentProp){
  //     setFormData({ ...formData, values: { ...formData?.values, percent: percentProp } });
  //   }
  // }, [percentProp])
  useEffect(() => {
    if (formData?.values.status == "2") {
      setFormData({ ...formData, values: { ...formData?.values, percent: 100 } });
      setDisableChangePercent(true);
    } else if (formData?.values.status == "4") {
      setFormData({ ...formData, values: { ...formData?.values, percent: 0 }, errors: {} });
      setDisableChangePercent(true);
    } else if (formData?.values.status == "1") {
      setFormData({ ...formData, values: { ...formData?.values, percent: "" } });
      setDisableChangePercent(false);
    }
  }, [formData?.values.status]);

  useEffect(() => {
    if (formData?.values.percent && formData?.values.percent >= 100) {
      setFormData({ ...formData, values: { ...formData?.values, percent: 100, status: "2" } });
    }
    // else if(formData?.values.percent && formData?.values.percent < 100 && formData?.values.percent > 0){
    //   setFormData({ ...formData, values: { ...formData?.values, status: "1"} });
    // }
  }, [formData?.values.percent]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0 && formData.values?.status !== "4") {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const body: IOpportunityProcessUpdateRequestModel = {
      ...(formData.values as IOpportunityProcessUpdateRequestModel),
    };

    // console.log('body', body);

    // updateApproach()

    // const response = await CampaignOpportunityService.opportunityProcessUpdate(body);

    const response = await CampaignOpportunityService.update(body);

    if (response.code === 0) {
      showToast("Cập nhật tiến trình bán hàng thành công", "success");
      onHide(true);
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
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              (!isDifferenceObj(formData.values, values) && formData.values?.status !== "4" && !percentProp) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, percentProp]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
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
        className="modal-add-chance-probability"
      >
        <form className="form-chance-probability" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Tiến trình bán hàng" toggle={() => !isSubmit && onHide(false)} />
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

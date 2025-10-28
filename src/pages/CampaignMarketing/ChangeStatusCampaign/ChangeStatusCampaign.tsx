import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./ChangeStatusCampaign.scss";
import CampaignMarketingService from "services/CampaignMarketingService";

interface IChangeStatusCampaignProps {
  data: any;
  onShow: boolean;
  onHide: (reload: boolean) => void;
}

export default function ChangeStatusCampaign(props: IChangeStatusCampaignProps) {
  const { data, onShow, onHide } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const values = useMemo(
    () =>
      ({
        status: data?.statusOther?.toString() ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "status",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const listField = useMemo(
    () =>
      [
        {
          label: "",
          name: "status",
          type: "radio",
          options: [
            ...(data && data.statusOther !== 1
              ? [
                  {
                    value: "1",
                    label: "Đang thực hiện",
                  },
                ]
              : []),

            ...(data && data.statusOther !== 2
              ? [
                  {
                    value: "2",
                    label: "Hoàn thành",
                  },
                ]
              : []),

            ...(data && data.statusOther !== 3
              ? [
                  {
                    value: "3",
                    label: "Tạm dừng",
                  },
                ]
              : []),
          ],

          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [data]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body = {
      id: data?.id,
      statusOther: formData.values.status,
    };

    const response = await CampaignMarketingService.updateStatus(body);

    if (response.code === 0) {
      showToast(`Thay đổi trạng thái thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
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
              onHide(false);
            },
          },
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal__change--status-campaign"
      >
        <form className="form__change--status-campaign" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Thay đổi trạng thái`} toggle={() => !isSubmit && onHide(false)} />
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
    </Fragment>
  );
}

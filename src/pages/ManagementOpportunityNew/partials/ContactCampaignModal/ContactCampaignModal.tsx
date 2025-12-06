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
import "./ContactCampaignModal.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import ContactService from "services/ContactService";
import ImageThirdGender from "assets/images/third-gender.png";
import CampaignOpportunityService from "services/CampaignOpportunityService";

export default function ContactCampaignModal(props: any) {
  const { onShow, onHide, dataCoy, dataCustomer, idApproach } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);

  const getDetailContactCampaign = async (coyId: number, approachId: number) => {
    const params = {
      coyId: coyId,
      approachId: approachId,
    };

    const response = await CampaignOpportunityService.detailOpportunityContact(params);

    if (response.code === 0) {
      const result = response.result;
      setData(result);
      setDetailContact(result.contactId ? { value: result.contactId, label: result.contactName } : null);

      const newCoordinators = result?.lstCoordinator?.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      // const coordinatorsId = newCoordinators?.map(item => { return item.value })

      setDataCoordinators(newCoordinators);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow && dataCustomer) {
      getDetailContactCampaign(dataCustomer.coyId, dataCustomer.approachId);
    }
  }, [dataCustomer, onShow]);

  const values = useMemo(
    () =>
      ({
        contactId: data?.contactId ?? 0,
        coordinators: data?.lstCoordinatorId ? JSON.stringify(data?.lstCoordinatorId) : "[]",
        approachId: data?.approachId || idApproach || 0,
        coyId: data?.coyId || dataCoy?.id || 0,
      } as any),
    [onShow, data, dataCoy, idApproach]
  );

  const validations: IValidation[] = [
    {
      name: "contactId",
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

  // Đầu mối phụ trách
  const [detailContact, setDetailContact] = useState(null);
  const [checkFieldContact, setCheckFieldContact] = useState<boolean>(false);
  const [isLoadingOption, setIsLoadingOption] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách người liên hệ
  const loadedOptionContact = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      customerId: dataCoy?.customerId || dataCustomer?.id,
    };

    setIsLoadingOption(true);

    const response = await ContactService.list(param);

    setIsLoadingOption(false);

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

  const formatOptionLabelContact = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueContact = (e) => {
    setCheckFieldContact(false);
    setDetailContact(e);
    setFormData({ ...formData, values: { ...formData?.values, contactId: e.value } });
  };

  //Đầu mối phối hợp
  const [dataCoordinators, setDataCoordinators] = useState([]);
  const [isLoadingOptionCoordinator, setIsLoadingOptionCoordinator] = useState<boolean>(false);

  const loadedOptionCoordinator = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      customerId: dataCoy?.customerId || dataCustomer?.id,
    };

    setIsLoadingOptionCoordinator(true);

    const response = await ContactService.list(param);

    setIsLoadingOptionCoordinator(false);

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

  const handleChangeValueCoordinators = (e) => {
    setDataCoordinators(e);
  };

  useEffect(() => {
    const coordinatorsId =
      dataCoordinators?.map((item) => {
        return item.value;
      }) || [];
    setFormData({ ...formData, values: { ...formData?.values, coordinators: JSON.stringify(coordinatorsId) } });
  }, [dataCoordinators]);

  useEffect(() => {
    if (onShow) {
      loadedOptionContact("", undefined, { page: 1 });
      loadedOptionCoordinator("", undefined, { page: 1 });
    }
  }, [dataCoy, dataCustomer, onShow]);

  const listField = useMemo(
    () =>
      [
        {
          name: "contactId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={dataCoy || dataCustomer}
              id="contactId"
              name="contactID"
              label="Đầu mối phụ trách"
              options={[]}
              fill={true}
              value={detailContact}
              required={true}
              onChange={(e) => handleChangeValueContact(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn đầu mối phụ trách"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionContact}
              formatOptionLabel={formatOptionLabelContact}
              error={checkFieldContact}
              message="Đầu mối phụ trách không được bỏ trống"
              // isLoading={isLoadingOption}
            />
          ),
        },

        {
          name: "coordinators",
          type: "custom",
          snippet: (
            <SelectCustom
              key={dataCoy || dataCustomer}
              id="coordinators"
              name="coordinators"
              label="Đầu mối phối hợp"
              options={[]}
              fill={true}
              isMulti={true}
              value={dataCoordinators}
              required={false}
              onChange={(e) => handleChangeValueCoordinators(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn đầu mối phối hợp"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionCoordinator}
              formatOptionLabel={formatOptionLabelContact}
              isLoading={isLoadingOptionCoordinator}
            />
          ),
        },
      ] as IFieldCustomize[],
    [detailContact, checkFieldContact, dataCoy, dataCoordinators, isLoadingOptionCoordinator, formData]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0 && formData.values?.status !== "4") {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (!formData.values.contactId) {
      setCheckFieldContact(true);
      return;
    }

    // setIsSubmit(true);
    const body: any = {
      ...(formData.values as any),
      ...(data ? { id: data.id } : {}),
    };

    console.log("body", body);

    const response = await CampaignOpportunityService.opportunityContact(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm"} đầu mối làm việc thành công`, "success");
      if (!data) {
        onHide(true);
      } else {
        onHide(false);
      }
      setDetailContact(null);
      setDataCoordinators([]);
      setCheckFieldContact(false);
      setData(null);
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
            title: data ? "Cập nhật" : "Thêm",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0) ||
              checkFieldContact,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, data]
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

  const handleClearForm = () => {
    onHide(false);
    setDetailContact(null);
    setDataCoordinators([]);
    setCheckFieldContact(false);
    setData(null);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-add-chance-probability"
      >
        <form className="form-chance-probability" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Đầu mối làm việc" toggle={() => !isSubmit && handleClearForm()} />
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

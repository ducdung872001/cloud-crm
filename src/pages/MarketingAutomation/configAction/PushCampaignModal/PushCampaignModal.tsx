import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICampaignOpportunityRequestModel } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import CampaignService from "services/CampaignService";
import "./PushCampaignModal.scss";
import { ContextType, UserContext } from "contexts/userContext";
import MarketingAutomationService from "services/MarketingAutomationService";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Input from "components/input/input";
import _ from "lodash";

export default function PushCampaignModal(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, dataNode, setDataNode, statusMA } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [nodeName, setNodeName] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (dataNode?.name) {
      setNodeName(dataNode.name);
    }

    if (dataNode?.configData) {
      setDataCampaign({ value: dataNode?.configData.campaignId, label: dataNode?.configData.campaignName });
      setData(dataNode?.configData);
    }
  }, [dataNode]);

  const values = useMemo(
    () =>
      ({
        campaignId: data?.campaignId ?? null,
      } as any),
    [onShow, data]
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

  // Xử lý vấn đề lấy danh sách chiến dịch, phương pháp tiếp cận
  const [dataCampaign, setDataCampaign] = useState(null);
  const [checkFieldCampaign, setCheckFieldCampaign] = useState<boolean>(false);

  const loadedOptionCampaign = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await CampaignService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  startDate: item.startDate,
                  endDate: item.endDate,
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

  const formatOptionLabelCampaign = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCampaign = (e) => {
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        campaignId: e.value,
      },
    });

    setDataCampaign(e);
  };

  const getDetailCampaigin = async (id: number) => {
    const response = await CampaignService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDataCampaign({
        value: result.id,
        label: result.name,
        avatar: result.cover,
        startDate: result.startDate,
        endDate: result.endDate,
        type: result.type,
        saleDistributionType: result.saleDistributionType,
      });

      // loadCampaignApproaches(result.id);
    }
  };

  // useEffect(() => {
  //   if (data?.campaignId) {
  //     getDetailCampaigin(data?.campaignId);
  //   }
  // }, [data?.campaignId]);

  const listField = useMemo(
    () =>
      [
        {
          name: "campaignId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="campaignId"
              name="campaignId"
              label="Quản lý chiến dịch"
              options={[]}
              fill={true}
              value={dataCampaign}
              required={true}
              onChange={(e) => handleChangeValueCampaign(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn chiến dịch"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionCampaign}
              formatOptionLabel={formatOptionLabelCampaign}
              error={checkFieldCampaign}
              message="Chiến dịch không được để trống"
              // disabled={data?.id ? true : false}
            />
          ),
        },

        // {
        //   label: "Ngày bắt đầu",
        //   name: "startDate",
        //   type: "date",
        //   fill: true,
        //   icon: <Icon name="Calendar" />,
        //   iconPosition: "left",
        //   placeholder: "Nhập ngày bắt đầu",
        //   disabled: true,
        // },
        // {
        //   label: "Ngày kết thúc",
        //   name: "endDate",
        //   type: "date",
        //   fill: true,
        //   icon: <Icon name="Calendar" />,
        //   iconPosition: "left",
        //   placeholder: "Nhập ngày kết thúc",
        //   disabled: true,
        // },
      ] as IFieldCustomize[],
    [data, formData?.values]
  );

  const onSubmit = async () => {
    // e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...dataNode,
      configData: { campaignId: dataCampaign?.value, campaignName: dataCampaign?.label },
    };

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật hành động thành công`, "success");
      onHide(true);
      setDataCampaign(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDataCampaign(null);
    setCheckFieldCampaign(false);
    setData(null);
    setEditName(true);
    setNodeName(null);
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
            title: "Xác nhận",
            // type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !nodeName ||
              statusMA === 1 ||
              checkFieldCampaign ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
              if (_.isEqual(nodeName, dataNode?.name)) {
                onSubmit();
              } else {
                onHide(true);
                setEditName(true);
                setDataCampaign(null);
              }
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldCampaign, nodeName, dataNode, statusMA]
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
        setShowDialog(false);
        setContentDialog(null);
        handClearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [editName, setEditName] = useState(true);

  const changeNodeName = async () => {
    if (!nodeName) {
      showToast("Vui lòng nhập tên hành động", "error");
      return;
    }
    const body: any = {
      ...dataNode,
      name: nodeName,
      configData: { campaignId: dataCampaign?.value, campaignName: dataCampaign?.label },
    };

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật hành động thành công`, "success");
      onHide("not_close");
      setEditName(true);
      setDataNode({ ...dataNode, name: nodeName });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-push-campaign"
      >
        <form className="form-push-campaign">
          <ModalHeader title={dataNode?.name} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="container-name">
              <div className="box-name">
                <span className="name-group">Tên hành động</span>
                <Tippy content="Đổi tên hành động">
                  <div
                    onClick={() => {
                      if (statusMA !== 1) {
                        setEditName(false);
                      }
                    }}
                  >
                    <Icon
                      name="Pencil"
                      style={{
                        width: 18,
                        height: 18,
                        fill: statusMA === 1 ? "var(--extra-color-20)" : "#015aa4",
                        cursor: "pointer",
                        marginBottom: 3,
                      }}
                    />
                  </div>
                </Tippy>
              </div>

              <div className="edit-name">
                <div style={{ flex: 1 }}>
                  <Input
                    name="search_field"
                    value={nodeName}
                    fill={true}
                    iconPosition="right"
                    disabled={editName}
                    onBlur={() => {
                      if (!_.isEqual(nodeName, dataNode?.name)) {
                        changeNodeName();
                      } else {
                        setEditName(true);
                      }
                    }}
                    // icon={<Icon name="Times" />}
                    // iconClickEvent={() => {
                    //   setEditName(false);
                    //   setNodeName(dataNode?.name)
                    // }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNodeName(value);
                    }}
                    placeholder="Nhập tên điều kiện"
                  />
                </div>
              </div>
            </div>
            <div className="list-form-group-push-campaign">
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

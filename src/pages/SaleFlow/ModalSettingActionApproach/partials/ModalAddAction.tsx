import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import "./ModalAddAction.scss";
import _ from "lodash";
import Checkbox from "components/checkbox/checkbox";
import ImageThirdGender from "assets/images/third-gender.png";
import SelectCustom from "components/selectCustom/selectCustom";
import SaleflowApproachService from "services/SaleflowApproachService";
import ContractEformService from "services/ContractEformService";

export default function ModalAddAction(props: any) {
  const { onShow, onHide, approachData, activityData, actionList } = props;
  console.log("activityData", activityData);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [activityOption, setActivityAction] = useState([]);

  const optionInit = [
    // {
    //     value: 'create_invoice',
    //     label: 'Tạo đơn hàng'
    // },
    {
      value: "create_export",
      label: "Tạo phiếu xuất kho",
    },
    {
      value: "delivery_info",
      label: "Nhập thông tin giao vận",
    },
    // {
    //     value: 'create_warranty',
    //     label: 'Tạo phiếu bảo hành'
    // },
    // {
    //     value: 'create_ticket',
    //     label: 'Tạo phiếu hỗ trợ'
    // },
    // {
    //     value: 'detail_warranty',
    //     label: 'Xem chi tiết bảo hành'
    // },
    // {
    //     value: 'detail_ticket',
    //     label: 'Xem chi tiết hỗ trợ'
    // },
  ];

  useEffect(() => {
    if (actionList && actionList.length > 0) {
      let newList = [...optionInit];
      actionList.map((item) => {
        const newArray = newList.filter((el) => el.value !== item.code);
        newList = newArray;
      });
      setActivityAction(newList);
    } else {
      setActivityAction(optionInit);
    }
  }, [actionList]);

  const [valueConfig, setValueConfig] = useState({
    code: "",
    required: 0,
    hasVoc: 0,
    eformId: 0,
  });
  // console.log('valueSetting', valueSetting);

  const getActivityName = (code: string) => {
    switch (code) {
      case "create_invoice":
        return "Tạo đơn hàng";
      case "create_export":
        return "Tạo phiếu xuất kho";
      case "delivery_info":
        return "Nhập thông tin giao vận";
      case "create_warranty":
        return "Tạo phiếu bảo hành";
      case "create_ticket":
        return "Tạo phiếu hỗ trợ";
      case "detail_warranty":
        return "Xem chi tiết bảo hành";
      case "detail_ticket":
        return "Xem chi tiết hỗ trợ";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (activityData) {
      setValueConfig({
        code: activityData.code,
        required: activityData.required,
        hasVoc: activityData.hasVoc,
        eformId: activityData.eformId,
      });

      setDetailAction({
        value: activityData.code,
        label: getActivityName(activityData.code),
      });

      setDataEform({ value: activityData.eformId, label: activityData.eformName });
    } else {
      setValueConfig({
        code: "",
        required: 0,
        hasVoc: 0,
        eformId: 0,
      });
      setDetailAction(null);
    }
  }, [activityData]);

  const [formData, setFormData] = useState(valueConfig);

  useEffect(() => {
    setFormData(valueConfig);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [valueConfig, onShow]);

  const [detailAction, setDetailAction] = useState(null);

  const [checkFieldAction, setCheckFieldAction] = useState<boolean>(false);

  //   const loadedOptionAction = async (search, loadedOptions, { page }) => {
  //     const param: IEmployeeFilterRequest = {
  //       name: search,
  //       page: page,
  //       limit: 10,
  //     };

  //     const response = await EmployeeService.list(param);

  //     if (response.code === 0) {
  //       const dataOption = response.result.items;

  //       return {
  //         options: [
  //           ...(dataOption.length > 0
  //             ? dataOption.map((item) => {
  //                 return {
  //                   value: item.id,
  //                   label: item.name,
  //                   avatar: item.avatar,
  //                   departmentName: item.departmentName,
  //                   branchName: item.branchName
  //                 };
  //               })
  //             : []),
  //         ],
  //         hasMore: response.result.loadMoreAble,
  //         additional: {
  //           page: page + 1,
  //         },
  //       };
  //     }

  //     return { options: [], hasMore: false };
  //   };

  const formatOptionLabelEmployee = ({ label, avatar, departmentName, branchName }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div>
          <div>{label}</div>
          <div>
            <span style={{ fontSize: 10, fontWeight: "200", marginTop: 3 }}>{`${departmentName} (${branchName})`}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleChangeValueAction = (e) => {
    setCheckFieldAction(false);
    setDetailAction(e);
    setFormData({ ...formData, code: e.value });
  };

  const [dataEform, setDataEform] = useState(null);
  const [checkFieldEform, setCheckFieldEform] = useState<boolean>(false);

  const loadedOptionEform = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ContractEformService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items || [];

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

  const handleChangeValueEform = (e) => {
    setCheckFieldEform(false);
    setDataEform(e);
    setFormData({ ...formData, eformId: e.value });
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (detailAction === null) {
      setCheckFieldAction(true);
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(formData as any),
      ...(activityData ? { id: activityData.id } : {}),
      ...{ approachId: approachData.id },
    };

    console.log("body", body);

    const response = await SaleflowApproachService.updateActivity(body);
    if (response.code === 0) {
      onHide(true);
      setDetailAction(null);
      setDataEform(null);
      showToast(`Thêm hành động thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDetailAction(null);
    setDataEform(null);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              // _.isEqual(formData, valueConfig) ? handClearForm() : showDialogConfirmCancel();
              handClearForm();
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldAction ||
              //   !isDifferenceObj(formData.values, valueSetting),
              _.isEqual(formData, valueConfig),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, valueConfig]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác cài đặt`}</Fragment>,
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-action"
        size="lg"
      >
        <form className="form-add-action" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Thêm hành động`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="container-add-action">
              <div style={{ width: "60%" }}>
                <SelectCustom
                  id="actionId"
                  name="actionId"
                  label=""
                  options={activityOption}
                  fill={true}
                  value={detailAction}
                  special={true}
                  required={true}
                  onChange={(e) => handleChangeValueAction(e)}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn hành động"
                  // additional={{
                  //     page: 1,
                  // }}
                  // loadOptionsPaginate={loadedOptionEmployee}
                  // formatOptionLabel={formatOptionLabelEmployee}
                  error={checkFieldAction}
                  message="Hành động không được bỏ trống"
                />
              </div>

              <div className="option">
                <div className="option-item">
                  <Checkbox
                    label="Bắt buộc"
                    checked={formData.required === 1 ? true : false}
                    onChange={(e) => {
                      if (formData.required === 1) {
                        setFormData({ ...formData, required: 0 });
                      } else {
                        setFormData({ ...formData, required: 1 });
                      }
                    }}
                  />
                </div>
                <div className="option-item">
                  <Checkbox
                    label="Thu thập VOC"
                    checked={formData.hasVoc === 1 ? true : false}
                    onChange={(e) => {
                      if (formData.hasVoc === 1) {
                        setFormData({ ...formData, hasVoc: 0 });
                      } else {
                        setFormData({ ...formData, hasVoc: 1 });
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {detailAction?.value === "delivery_info" ? (
              <div style={{ marginTop: "2rem" }}>
                <SelectCustom
                  id="eformId"
                  name="eformId"
                  label="Chọn biểu mẫu thông tin"
                  options={activityOption}
                  fill={true}
                  value={dataEform}
                  special={true}
                  required={true}
                  onChange={(e) => handleChangeValueEform(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={false}
                  placeholder="Chọn biểu mẫu"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEform}
                  // formatOptionLabel={formatOptionLabelEmployee}
                  error={checkFieldEform}
                  message="Biểu mẫu không được bỏ trống"
                />
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

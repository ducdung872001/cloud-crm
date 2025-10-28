import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./AddPermissionModal.scss";
import BeautyBranchService from "services/BeautyBranchService";
import PermissionService from "services/PermissionService";

export default function AddPermissionModal(props: any) {
  const { onShow, onHide } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataSearch, setDataSearch] = useState(null);
  const [infoPartner, setInfoPartner] = useState(null);
  console.log("infoPartner", infoPartner);

  const [isAddPermission, setIsAddPermission] = useState(false);

  const values = useMemo(
    () =>
      ({
        code: dataSearch?.code ?? "",
      } as any),
    [dataSearch, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "code",
      rules: "required",
    },
  ];

  const listField: IFieldCustomize[] = [
    {
      label: "Mã đối tác",
      placeholder: "Nhập mã đối tác",
      name: "code",
      type: "text",
      fill: true,
      required: true,
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

  const onSubmit = async () => {
    // e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: any = {
      ...(formData.values as any),
    };

    const response = await BeautyBranchService.getBeautyBranchByCode(body);

    if (response.code === 0) {
      const result = response.result;

      showToast(`Tìm kiếm đối tác thành công`, "success");
      setDataSearch({ code: formData.values.code });
      setInfoPartner(result);
      setIsSubmit(false);
      //   onHide(true);
    } else {
      showToast(response.message || "Không tìm thấy đối tác. Vui lòng thử lại sau", "warning");
      setDataSearch({ code: formData.values.code });
      setInfoPartner(null);
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
              !isDifferenceObj(formData.values, values) ? handleClear(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Tìm kiếm",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
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
      title: <Fragment>{`Hủy bỏ thao tác tìm kiếm`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleClear(false);
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

  const handleClear = (acc) => {
    onHide(acc);
    setDataSearch(null);
    setInfoPartner(null);
    setIsAddPermission(false);
  };

  const handleBack = () => {
    setIsAddPermission(false);
  };

  ////THÊM YÊU CẦU
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);
  const [isSubmitAdd, setIsSubmitAdd] = useState<boolean>(false);

  const valuesAdd = useMemo(
    () =>
      ({
        targetBranchId: infoPartner?.id ?? 0,
        targetBsnId: infoPartner?.bsnId ?? 0,
        // requestCode: 'product',
        requestCodeList: "",
        sourceNote: "",
      } as any),
    [isAddPermission, infoPartner]
  );

  const validationsAdd: IValidation[] = [
    {
      name: "code",
      rules: "required",
    },
    {
      name: "requestCode",
      rules: "required",
    },
  ];

  const listFieldAdd: IFieldCustomize[] = [
    {
      label: "Dữ liệu cần chia sẻ",
      name: "requestCodeList",
      type: "checkbox",
      required: true,
      options: [
        {
          value: "product",
          label: "Sản phẩm",
        },
        {
          value: "service",
          label: "Dịch vụ",
        },
        {
          value: "customer",
          label: "Khách hàng",
        },
      ],
      fill: true,
    },
    {
      label: "Ghi chú",
      name: "sourceNote",
      type: "textarea",
      fill: true,
    },
  ];

  const [formDataAdd, setFormDataAdd] = useState<IFormData>({ values: valuesAdd });

  useEffect(() => {
    setFormDataAdd({ ...formData, values: valuesAdd, errors: {} });
    setIsSubmitAdd(false);

    return () => {
      setIsSubmitAdd(false);
    };
  }, [valuesAdd, isAddPermission]);

  const onSubmitAdd = async () => {
    // e.preventDefault();

    const errors = Validate(validationsAdd, formDataAdd, listFieldAdd);
    if (Object.keys(errors).length > 0) {
      setFormDataAdd((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const requestCodeList = formDataAdd.values.requestCodeList ? formDataAdd.values.requestCodeList?.split(",") : [];
    if (requestCodeList?.length === 0) {
      showToast("Vui lòng chọn dữ liệu cần chia sẻ", "error");
      return;
    }

    setIsSubmitAdd(true);

    if (requestCodeList?.length > 0) {
      const arrPromise = [];

      requestCodeList.map((item) => {
        const body = {
          targetBranchId: formDataAdd.values?.targetBranchId ?? 0,
          targetBsnId: formDataAdd.values?.targetBsnId ?? 0,
          requestCode: item,
          sourceNote: formDataAdd.values?.sourceNote ?? "",
        };
        const promise = new Promise((resolve, reject) => {
          PermissionService.updateRequestPermission(body).then((res) => {
            resolve(res);
          });
        });

        arrPromise.push(promise);
      });

      Promise.all(arrPromise).then((result) => {
        if (result.length > 0) {
          showToast(`Gửi yêu cầu xin quyền truy cập thành công`, "success");
          handleClear(true);
        } else {
          showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          setIsSubmitAdd(false);
        }
      });
    }

    // const body: any = {
    //   ...(formDataAdd.values as any),
    // };
    // console.log('body', body);

    // const response = await PermissionService.updateRequestPermission(body);

    // if (response.code === 0) {
    //     showToast(`Gửi yêu cầu xin quyền truy cập thành công`, "success");
    //     handleClear(true);
    // } else {
    //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //     setIsSubmitAdd(false);
    // }
  };

  const actionsAdd = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Quay lại",
            color: "primary",
            variant: "outline",
            disabled: isSubmitAdd,
            callback: () => {
              !isDifferenceObj(formDataAdd.values, valuesAdd) ? handleBack() : showDialogConfirmBack();
            },
          },
          {
            title: "Xác nhận",
            // type: "submit",
            color: "primary",
            disabled: isSubmitAdd || !isDifferenceObj(formDataAdd, valuesAdd) || (formDataAdd.errors && Object.keys(formDataAdd.errors).length > 0),
            is_loading: isSubmitAdd,
            callback: () => {
              // onSubmit();
              onSubmitAdd();
            },
          },
        ],
      },
    }),
    [formDataAdd, valuesAdd, isSubmitAdd]
  );

  const showDialogConfirmBack = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleBack();
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
    };
    setContentDialogAdd(contentDialog);
    setShowDialogAdd(true);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-add-permission-group"
      >
        <form className="form-permission-group">
          <ModalHeader title={isAddPermission ? `Yêu cầu xin quyền truy cập` : `Tìm kiếm đối tác`} toggle={() => !isSubmit && handleClear(false)} />
          <ModalBody>
            {!isAddPermission ? (
              <div className="container-search-partner">
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

                {infoPartner ? (
                  <div className="info-partner">
                    <span style={{ fontSize: 14, fontWeight: "600" }}>Chọn đối tác</span>
                    {/* <Tippy content={'Chọn đối tác'} delay={[120, 100]} animation="scale"> */}
                    <div
                      className="item-partner"
                      onClick={() => {
                        setIsAddPermission(true);
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: "500" }}>
                        {infoPartner.name} (
                        <span style={{ fontSize: 12, fontWeight: "400" }}>
                          Mã: <span style={{ fontWeight: "500" }}>{infoPartner.code}</span>
                        </span>
                        )
                      </span>

                      <div>
                        <span style={{ fontSize: 12, fontWeight: "400" }}>
                          Số điện thoại: <span style={{ fontWeight: "500" }}>{infoPartner.phone}</span>
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: "400" }}>
                          Địa chỉ: <span style={{ fontWeight: "500" }}>{infoPartner.address}</span>
                        </span>
                      </div>
                    </div>
                    {/* </Tippy> */}
                  </div>
                ) : null}
              </div>
            ) : (
              <div>
                <div className="info-partner">
                  <span style={{ fontSize: 14, fontWeight: "600" }}>Thông tin đối tác</span>
                  <div
                    className="item-partner"
                    onClick={() => {
                      // setIsAddPermission(true);
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: "500" }}>
                      {infoPartner?.name} (
                      <span style={{ fontSize: 12, fontWeight: "400" }}>
                        Mã: <span style={{ fontWeight: "500" }}>{infoPartner?.code}</span>
                      </span>
                      )
                    </span>

                    <div>
                      <span style={{ fontSize: 12, fontWeight: "400" }}>
                        Số điện thoại: <span style={{ fontWeight: "500" }}>{infoPartner?.phone}</span>
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: "400" }}>
                        Địa chỉ: <span style={{ fontWeight: "500" }}>{infoPartner?.address}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="list-form-add-permission">
                  {listFieldAdd.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formDataAdd, validationsAdd, listFieldAdd, setFormDataAdd)}
                      formData={formDataAdd}
                    />
                  ))}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter actions={isAddPermission ? actionsAdd : actions} />
        </form>
      </Modal>
      <Dialog content={isAddPermission ? contentDialogAdd : contentDialog} isOpen={isAddPermission ? showDialogAdd : showDialog} />
    </Fragment>
  );
}

import React, { useState, useEffect, useMemo, Fragment, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddTicketModalProps } from "model/ticket/PropsModel";
import { ITicketRequestModel } from "model/ticket/TicketRequestModel";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import FileService from "services/FileService";
import TicketService from "services/TicketService";
import TicketCategoryService from "services/TicketCategoryService";
import CustomerService from "services/CustomerService";
import { EMAIL_REGEX } from "utils/constant";
import { UserContext, ContextType } from "contexts/userContext";
import "./index.scss";
import { useLocation } from "react-router-dom";
import Button from "components/button/button";

export default function CollectTicket() {
  // const { onShow, data, idCustomer, saleflowId, sieId } = props;
  const location = useLocation();

  // Lấy trường code từ query parameters của URL
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get("code");

  const { id, dataBranch } = useContext(UserContext) as ContextType;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [succesSubmit, setSuccesSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [listSupport, setListSupport] = useState<IOption[]>(null);
  const [isLoadingSupport, setIsLoadingSupport] = useState<boolean>(false);

  const [listImageTicket, setListImageTicket] = useState([]);

  // Chọn lý do bảo hành
  const onSelectOpenSupport = async () => {
    const param = {
      type: 1,
    };

    if (!listSupport || listSupport.length === 0) {
      setIsLoadingSupport(true);
      const response = await TicketCategoryService.list(param);
      if (response.code === 0) {
        const dataOption = response.result;
        setListSupport([
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ]);
      }
      setIsLoadingSupport(false);
    }
  };

  // useEffect(() => {
  //   if (data?.supportId) {
  //     onSelectOpenSupport();
  //   }

  //   if (data?.supportId === null) {
  //     setListSupport([]);
  //   }
  // }, [data]);

  const values = useMemo(
    () =>
      ({
        employeeId: null,
        customerId: null,
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        startDate: new Date(),
        endDate: "",
        phone: "",
        supportId: null,
        content: "",
        docLink: "[]",
        statusId: null,
      } as any),
    []
  );

  const validations: IValidation[] = [
    {
      name: "startDate",
      rules: "required",
    },
    {
      name: "endDate",
      rules: "required",
    },
    {
      name: "supportId",
      rules: "required",
    },
    {
      name: "customerPhone",
      rules: "required",
    },
    {
      name: "customerEmail",
      rules: "regex",
    },
    {
      name: "content",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  const [detailCustomer, setDetailCustomer] = useState(null);

  //! đoạn này xử lý vấn đề lấy ra danh sách khách hàng
  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: any = {
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
                  label: `${item.name} - ${item.phoneMasked}`,
                  phone: item.phoneMasked,
                  email: item.emailMasked,
                  name: item.name,
                  employeeId: item.employeeId,
                  employeePhone: item.employeePhone,
                  employeeName: item.employeeName,
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

  const handleChangeValueCustomer = (e) => {
    setDetailCustomer(e);
  };

  useEffect(() => {
    if (detailCustomer) {
      setFormData({ ...formData, values: { ...formData?.values, customerId: detailCustomer.value } });
    }
  }, [detailCustomer]);

  const handleDetailCustomer = async (id: number) => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDetailCustomer({
        value: result.id,
        label: `${result.name} - ${result.phoneMasked}`,
        phone: result.phoneMasked,
        email: result.emailMasked,
        name: result.name,
        employeeId: result.employeeId,
        employeePhone: result.employeePhone,
        employeeName: result.employeeName,
      });
    } else {
      showToast(response.message || "Chi tiết khách hàng lỗi. Vui lòng thử lại sau !", "error");
    }

    setIsLoadingCustomer(false);
  };

  // useEffect(() => {
  //   if ((idCustomer || data?.customerId) && onShow) {
  //     handleDetailCustomer(idCustomer || data?.customerId);
  //   }
  // }, [idCustomer, onShow, data?.customerId]);

  const listFieldVoteInfo: any[] = [
    {
      label: "Tên khách hàng",
      name: "customerName",
      type: "text",
      fill: true,
      required: true,
      // disabled: idCustomer ? true : false,
      disabled: false,
    },
    {
      label: "Số điện thoại khách hàng",
      name: "customerPhone",
      type: "text",
      fill: true,
      required: true,
      disabled: false,
    },
    {
      label: "Email khách hàng",
      name: "customerEmail",
      type: "text",
      fill: true,
      regex: new RegExp(EMAIL_REGEX),
      messageErrorRegex: "Email không đúng định dạng",
      disabled: false,
    },
    {
      label: "Nội dung hỗ trợ",
      name: "content",
      type: "textarea",
      fill: true,
      required: true,
    },
  ];

  const listFieldDate: IFieldCustomize[] = [
    {
      label: "Ngày tiếp nhận",
      name: "startDate",
      type: "date",
      fill: true,
      required: true,
      hasSelectTime: true,
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
      maxDate: new Date(formData?.values?.endDate),
      placeholder: "Nhập ngày tiếp nhận",
    },
    {
      label: "Ngày dự kiến kết thúc",
      name: "endDate",
      type: "date",
      fill: true,
      required: true,
      hasSelectTime: true,
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
      placeholder: "Chọn ngày dự kiến kết thúc",
      minDate: new Date(formData?.values?.startDate),
    },
  ];

  useEffect(() => {
    if (detailCustomer) {
      setFormData({
        ...formData,
        values: {
          ...formData.values,
          employeeId: detailCustomer.employeeId,
          phone: detailCustomer.employeePhone,
          customerName: detailCustomer.name,
          customerPhone: detailCustomer.phone,
          customerEmail: detailCustomer.email,
        },
      });
    }
  }, [detailCustomer]);

  useEffect(() => {
    const result = JSON.parse(formData.values.docLink).map((item) => item.url);
    setListImageTicket(result);
  }, [formData.values.docLink]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldVoteInfo, ...listFieldDate]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: ITicketRequestModel = {
      ...(formData.values as ITicketRequestModel),
      ...{ supportId: 85, clientId: "ieabgaiifh", qrCode: code },
    };

    console.log("body", body);
    // return;

    const response = await TicketService.collect(body, { processCode: "QTTKDM" });

    if (response.code === 0) {
      showToast(`Tạo phiếu hỗ trợ thành công`, "success");
      setSuccesSubmit(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          //   {
          //     title: "Hủy",
          //     color: "primary",
          //     variant: "outline",
          //     disabled: isSubmit,
          //     callback: () => {
          //       !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
          //     },
          //   },
          {
            title: "Tạo mới",
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
      title: <Fragment>{`Hủy bỏ thao tác ${"thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        // onHide(false);
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
          //   onHide(false);
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

  // xử lý hình ảnh
  const handleImageUpload = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      const maxSize = 1048576;

      if (e.target.files[0].size > maxSize) {
        showToast("Ảnh tải lên giới hạn dung lượng không quá 2MB", "warning");
        e.target.value = "";
      } else {
        handUploadFile(e.target.files[0]);
        e.target.value = null;
      }
    }
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setListImageTicket([...listImageTicket, result]);
  };

  useEffect(() => {
    if (listImageTicket && listImageTicket.length > 0) {
      const result = listImageTicket.map((item) => {
        return {
          type: "image",
          url: item,
        };
      });
      setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(result) } });
    }
  }, [listImageTicket]);

  const handleRemoveImageItem = (idx) => {
    const result = JSON.parse(formData.values.docLink);
    result.splice(idx, 1);
    setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(result) } });
  };
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(0);
  };
  return (
    <Fragment>
      <div className="page-collect-ticket">
        <form className="form-ticket-group" onSubmit={(e) => onSubmit(e)}>
          <div className="header-form">
            <h1>PHIẾU HỖ TRỢ</h1>
          </div>
          {succesSubmit ? (
            <div className="list-form-group" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              NỘP PHIẾU HỖ TRỢ THÀNH CÔNG, CHÚNG TÔI SẼ LIÊN HỆ VỚI BẠN TRONG THỜI GIAN SỚM NHẤT
              <Button onClick={handleGoBack} type="button" color="primary" size="large" className="custom-button-rollback">
                Quay lại
              </Button>
            </div>
          ) : (
            <>
              <ModalBody>
                <div className="list-form-group">
                  <div className="wrapper-field-ticket-service">
                    <div className="list-field">
                      {listFieldVoteInfo.map((field, index) => (
                        <FieldCustomize
                          key={index}
                          field={field}
                          handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldVoteInfo, setFormData)}
                          formData={formData}
                        />
                      ))}
                    </div>
                    <div className="attachments">
                      <label className="title-attachment">Tải ảnh lên</label>
                      <div className={JSON.parse(formData.values.docLink).length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                        {JSON.parse(formData.values.docLink || "[]").length === 0 ? (
                          <label htmlFor="imageUpload" className="action-upload-image">
                            <div className="wrapper-upload">
                              <Icon name="Upload" />
                              Tải ảnh lên
                            </div>
                          </label>
                        ) : (
                          <Fragment>
                            <div className="d-flex align-items-center">
                              {JSON.parse(formData.values.docLink).map((item, idx) => (
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
                    <div className="lst-field--date">
                      {listFieldDate.map((field, index) => (
                        <FieldCustomize
                          key={index}
                          field={field}
                          handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldDate, setFormData)}
                          formData={formData}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter actions={actions} />
            </>
          )}
        </form>
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

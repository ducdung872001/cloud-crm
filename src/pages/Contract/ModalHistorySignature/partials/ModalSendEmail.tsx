import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { capitalize, convertToId, isDifferenceObj, removeAccents, removeHtmlTags } from "reborn-util";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import { handDownloadFileOrigin, showToast } from "utils/common";
import "./ModalSendEmail.scss";
import Input from "components/input/input";
import { IConfigCodeResponseModel } from "model/configCode/ConfigCodeResponse";
import ConfigCodeService from "services/ConfigCodeService";
import RebornEditor from "components/editor/reborn";
import { serialize } from "utils/editor";
import Checkbox from "components/checkbox/checkbox";
import EmailConfigService from "services/EmailConfigService";
import Image from "components/image";
import AvatarFemale from "assets/images/avatar-female.jpg";
import AvatarMale from "assets/images/avatar-male.jpg";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import _ from "lodash";
import { validateIsEmpty } from "reborn-validation";
import AddTemplateEmailModal from "pages/Common/AddEditSendEmail/partials/AddTemplateEmailModal";
import ViewTemplateEmailModal from "pages/Common/AddEditSendEmail/partials/ViewTemplateEmailModal";
import ImageExcel from "assets/images/img-excel.png";
import ImageWord from "assets/images/img-word.png";
import Tippy from "@tippyjs/react";
import { ContextType, UserContext } from "contexts/userContext";
import CheckboxList from "components/checkbox/checkboxList";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { handleChangeValidate } from "utils/validate";
import SelectCustom from "components/selectCustom/selectCustom";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import ContractService from "services/ContractService";
import PlaceholderService from "services/PlaceholderService";

export default function ModalSendEmail(props: any) {
  const { onShow, onHide, dataContract, customerIdlist } = props;

  const focusedElement = useActiveElement();
  const { dataInfoEmployee } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [sendToData, setSendToData] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [fileBase64, setFilebase64] = useState(null);

  const sendToList = [
    {
      value: "customer",
      label: "Khách hàng",
    },
    {
      value: "employees",
      label: "Nội bộ tổ chức",
    },
  ];

  const values = useMemo(
    () =>
      ({
        title: "",
        content: "",
        templateId: null,
        customerIds: [],
        employeeIds: [],
      } as any),
    [onShow]
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

  const listField = useMemo(
    () =>
      [
        {
          name: "sendTo",
          type: "custom",
          snippet: (
            <div className="notification-calendar">
              <div className="info-notification">
                <div className="choose-notification">
                  <CheckboxList
                    title="Gửi đến"
                    required={true}
                    options={sendToList}
                    value={sendToData.join()}
                    onChange={(e) => handleSelectSendTo(e)}
                  />
                </div>
              </div>
            </div>
          ),
        },
      ] as IFieldCustomize[],
    [formData?.values, sendToData]
  );

  const handleSelectSendTo = (e) => {
    if (e) {
      setSendToData(e ? e.split(",") : []);

      if (!e.split(",").includes("customer")) {
        setCustomerList([]);
        setFormData({ ...formData, values: { ...formData?.values, customerIds: 0 } });
      }

      if (!e.split(",").includes("employees")) {
        setEmployeeList([]);
        setFormData({ ...formData, values: { ...formData?.values, employeeIds: [] } });
      }
    } else {
      setSendToData([...sendToData]);
      if (sendToData.includes("customer")) {
        setCustomerList(customerList);
      }

      if (sendToData.includes("employees")) {
        setEmployeeList([...employeeList]);
      }
    }
  };

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await EmployeeService.list(param);

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

  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    setEmployeeList(e);
    const employeeIds = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, employeeIds: employeeIds } });
  };

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
    setCustomerList(e);
    const customerIds = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, customerIds: customerIds } });
  };

  // biến này tạo ra với mục đích hiển thị những khách hàng nhận email
  const [filterUser, setFilterUser] = useState([]);

  // đoạn này bật modal chọn mẫu
  const [showModalAddTemplateEmail, setShowModalAddTemplateEmail] = useState<boolean>(false);
  const [showModalViewTemplateEmail, setShowModalViewTemplateEmail] = useState<boolean>(false);

  // biến này tạo ra với mục đích thay đổi tiêu đề email
  const [titleEmail, setTitleEmail] = useState<string>("");

  //! biến này tạo ra với mục đích validate tiêu đề email
  const [errorTitleEmail, setErrorTitleEmail] = useState<boolean>(false);

  //! lấy mã code email fill vào nội dung
  const [dataCodeEmail, setDataCodeEmail] = useState<string>("");

  //! lấy nội dung email
  const [contentEmail, setContentEmail] = useState<string>("");

  /**
   * Xử lý khi lựa chọn mẫu email
   * @param item
   */
  const loadTemplateEmail = async (item) => {
    if (item) {
      setTitleEmail(item.title);
      setErrorTitleEmail(false);

      setFormData({ ...formData, values: { ...formData.values, title: item.title } });
      setContentEmail(item.content);
    }
  };

  /**
   * Lưu lại mẫu
   * @param e
   * @returns
   */
  const saveTemplate = async (e) => {
    e && e.preventDefault();

    //Validate thủ công
    if (validateIsEmpty(titleEmail)) {
      showToast("Vui lòng nhập Tiêu đề Email", "error");
      return;
    }

    //Validate nội dung
    if (validateIsEmpty(removeHtmlTags(contentEmail))) {
      showToast("Vui lòng nhập Nội dung Email", "error");
      return;
    }

    //Ok thì hiển thị popup ...
    setShowModalAddTemplateEmail(true);
  };

  //? đoạn này sử xử lý thay đổi giá trị tiêu đề email
  const handleChangeValueTitleEmail = (e) => {
    const value = e.target.value;
    oninput = () => {
      setErrorTitleEmail(false);
    };
    setTitleEmail(value);
    setFormData({ ...formData, values: { ...formData.values, title: value } });
  };

  //! đoạn này xử lý validate form khi chưa nhập title
  const handleChangeBlueTitleEmail = (e) => {
    const value = e.target.value;

    if (value.length === 0) {
      setErrorTitleEmail(true);
    }
  };

  //? Danh sách code email
  // const [listCodeEmail, setListCodeEmail] = useState<IConfigCodeResponseModel[]>([]);
  // const [isLoadingCodeEmail, setIsLoadingCodeEmail] = useState<boolean>(false);

  // //! Call API code email
  // const getListCodeEmail = async () => {
  //   setIsLoadingCodeEmail(true);

  //   const param = {
  //     type: 2,
  //   };

  //   const response = await ConfigCodeService.list(param);

  //   if (response.code === 0) {
  //     const result = response.result.items;
  //     setListCodeEmail(result);
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }

  //   setIsLoadingCodeEmail(false);
  // };

  // useEffect(() => {
  //   if (onShow) {
  //     getListCodeEmail();
  //   }
  // }, [onShow]);

  // đoạn này lấy mã email
  const handlePointerContent = (data) => {
    const value = data.code;
    setDataCodeEmail(value);
  };

  //! đoạn này thay đổi giá trị văn bản
  const handleChangeContentEmail = (dataConent) => {
    const convertContent = serialize({ children: dataConent });
    setContentEmail(convertContent);
    setValidateContentEmail(false);
    // setFormData({ ...formData, values: { ...formData?.values, content: convertContent } });
  };

  const detailCustomerUpdate = async (takeIdCustomer: number[]) => {
    if (takeIdCustomer.length <= 0) return;

    const param: any = {
      lstId: takeIdCustomer.join(","),
      page: 1,
      limit: 1000,
    };

    const response = await CustomerService.listById(param);

    if (response.code === 0) {
      const result = response.result;
      //   setIsLoadMoreAble(result?.loadMoreAble);

      //   const newDataCustomer = pageCustomer == 1 ? [] : filterUser;
      const newDataCustomer = [];

      (result.items || []).map((item) => {
        newDataCustomer.unshift(item);
      });

      const convertData = newDataCustomer.map((item: any) => {
        return {
          id: item.id,
          avatar: item.avatar,
          name: item.name,
          gender: item.gender,
        };
      });
      setFilterUser(convertData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    // setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (onShow && customerIdlist && customerIdlist.length > 0) {
      const listCustomerHasEmail = customerIdlist.map((item) => {
        return item;
      });
      const takeIdCustomer = listCustomerHasEmail || [];
      detailCustomerUpdate(takeIdCustomer);
    }
  }, [onShow, customerIdlist]);

  const [validateContentEmail, setValidateContentEmail] = useState<boolean>(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    // const errors = Validate(validations, formData);

    // if (Object.keys(errors).length > 0) {
    //     setFormData((prevState) => ({ ...prevState, errors: errors }));
    //     return;
    // }

    if (sendToData?.length === 0) {
      showToast("Vui lòng chọn gửi đến ai", "error");
      return;
    }

    if (sendToData.length > 0 && sendToData.includes("customer") && formData.values.customerIds.length === 0) {
      showToast("Vui lòng chọn khách hàng", "error");
      return;
    }

    if (sendToData.length > 0 && sendToData.includes("employees") && formData.values.employeeIds.length === 0) {
      showToast("Vui lòng chọn nhân viên", "error");
      return;
    }

    setIsSubmit(true);
    const fileName = `${convertFileName(dataContract?.name || "")}.docx`;
    const newFormData = _.cloneDeep(formData.values);
    // const newCustomerList = customerIdlist.map((item) => {
    //   return { id: item, coyId: item.coyId };
    // });

    const body = {
      ...newFormData,
      //   customerId: customerIdlist[0],
      content: contentEmail,
      // emailId: listIdSourceEmail[0],
      email: dataInfoEmployee.email || null,
      fileData: fileBase64,
      fileName: fileName,
    };

    const response = await ContractService.sendContract(body);

    if (response.code === 0) {
      showToast("Gửi Email thành công", "success");
      clearForm(true);
      setIsSubmit(false);
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
              !isDifferenceObj(formData.values, values) ? clearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Gửi",
            type: "submit",
            color: "primary",
            disabled: isSubmit || validateContentEmail,
            //   || (!isDifferenceObj(formData.values, values) && formData.values?.status !== '4' && !percentProp)
            //   || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, validateContentEmail]
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
        clearForm(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const clearForm = (acc) => {
    onHide(acc);
    setTitleEmail("");
    setDataCodeEmail("");
    setTimeout(() => {
      setContentEmail("");
    }, 1000);

    setSendToData([]);
    setCustomerList([]);
    setEmployeeList([]);
  };

  const convertFileName = (name) => {
    let fieldName = convertToId(name) || "";
    fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

    return fieldName;
  };

  const download = (link, name) => {
    const type = link.includes(".docx")
      ? "docx"
      : link.includes(".xlsx")
      ? "xlsx"
      : link.includes(".pdf")
      ? "pdf"
      : link.includes(".pptx")
      ? "pptx"
      : link.includes(".zip")
      ? "zip"
      : "rar";
    const nameDownload = `${name}.${type}`;

    handDownloadFileOrigin(link, nameDownload);
  };

  useEffect(() => {
    if (onShow && dataContract?.template) {
      var request = new XMLHttpRequest();
      request.open("GET", dataContract.template, true);
      request.responseType = "blob";
      request.onload = function () {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload = function (e: any) {
          setFilebase64(e.target.result.split(",")[1]);
        };
      };
      request.send();
    }
  }, [onShow, dataContract]);

  const [listApproach, setListApproach] = useState<any>([
    {
      value: "customer",
      label: "Khách hàng",
      color: "#9966CC",
      isActive: true,
      listPlaceholder: [],
    },
    // {
    //   value: "contact",
    //   label: "Người liên hệ",
    //   color: "#6A5ACD",
    //   isActive: false,
    //   listPlaceholder: [],
    // },
    // {
    //   value: "contract",
    //   label: "Hợp đồng",
    //   color: "#007FFF",
    //   isActive: false,
    //   listPlaceholder: [],
    // },
    // {
    //   value: "guarantee",
    //   label: "Bảo lãnh",
    //   color: "#ED6665",
    //   isActive: false,
    //   listPlaceholder: [],
    // },
  ]);

  const [placeholder, setPlaceholder] = useState<any>(listApproach[0]);

  useEffect(() => {
    for (let i = 0; i < listApproach.length; i++) {
      const element = listApproach[i];
      if (element.value == placeholder.value) {
        setPlaceholder(element);
      }
    }
  }, [listApproach]);

  const getListplaceholderCustomer = async () => {
    const param = {};
    const response = await PlaceholderService.customer(param);

    if (response.code === 0) {
      const result = response.result.items;
      const newListplaceholderCustomer = result.map((item) => ({
        code: "{{" + item.name + "}}",
        name: item.title,
      }));

      setListApproach(
        listApproach.map((item) => ({
          ...item,
          listPlaceholder:
            item.value == "customer"
              ? newListplaceholderCustomer.map((item) => ({ value: item.code, label: item.name, code: item.code }))
              : item.listPlaceholder,
        }))
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const fetchPlaceholder = async () => {
    if (placeholder.value == "customer") {
      await getListplaceholderCustomer();
    }
    // else if (placeholder.value == "contact") {
    //   await getListplaceholderContact();
    // } else if (placeholder.value == "contract") {
    //   await getListplaceholderContract();
    // } else if (placeholder.value == "guarantee") {
    //   await getListplaceholderGuarantee();
    // }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-send-email-contract-template"
        size="lg"
      >
        <form className="form-send-email-contract-template" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Gửi Email" toggle={() => !isSubmit && clearForm(false)} />
          <ModalBody>
            <div className="wrapper-send-email">
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

              {sendToData.includes("customer") && (
                <div className="form-group">
                  <SelectCustom
                    id="customerId"
                    name="customerId"
                    label="Khách hàng"
                    options={[]}
                    fill={true}
                    value={customerList}
                    required={true}
                    isMulti={true}
                    onChange={(e) => handleChangeValueCustomer(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn khách hàng"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionCustomer}
                    formatOptionLabel={formatOptionLabelCustomer}
                    // error={checkFieldCustomer}
                    // message="Khách hàng không được bỏ trống"
                    // isLoading={data?.customerId ? isLoadingCustomer : null}
                  />
                </div>
              )}

              {sendToData.includes("employees") && (
                <div>
                  <SelectCustom
                    id="employeeId"
                    name="employeeId"
                    label="Nhân viên"
                    options={[]}
                    fill={true}
                    value={employeeList}
                    required={true}
                    isMulti={true}
                    onChange={(e) => handleChangeValueEmployee(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn nhân viên"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionEmployee}
                    formatOptionLabel={formatOptionLabelEmployee}
                    // error={checkFieldEmployee}
                    // message="Nhân viên thực hiện tư vấn không được bỏ trống"
                    // isLoading={data?.consultantId ? isLoadingEmployee : null}
                  />
                </div>
              )}

              {/* <div className="list-customer">
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: "600" }}>Gửi đến khách hàng</span>
                </div>
                <div className="container-list-customer">
                  {filterUser.length > 0 ? (
                    filterUser.map((item, index) => (
                      <div key={index} className="wrapper-user">
                        <div className="info-user">
                          {item.avatar === "" ? (
                            <Image src={item.gender == 2 ? AvatarMale : AvatarFemale} alt={item.name} />
                          ) : (
                            <Image src={item.avatar} alt={item.name} />
                          )}

                          {item.name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="notification-user">Chưa có khách hàng nào!</span>
                  )}
                </div>
              </div> */}

              <div className="wrapper-code-email">
                <div className="action-option">
                  <span
                    className="option-template"
                    onClick={() => {
                      setShowModalViewTemplateEmail(true);
                    }}
                  >
                    Chọn mẫu
                  </span>
                  <span
                    className="save-template"
                    onClick={() => {
                      saveTemplate(null);
                    }}
                  >
                    Lưu mẫu
                  </span>
                </div>
              </div>

              <div className="title-email">
                <Input
                  type="text"
                  value={titleEmail}
                  fill={true}
                  required={true}
                  placeholder="Nhập tiêu đề email"
                  error={errorTitleEmail}
                  message="Tiêu đề không được để trống"
                  onChange={(e) => handleChangeValueTitleEmail(e)}
                  onBlur={(e) => handleChangeBlueTitleEmail(e)}
                />
              </div>

              <div className="wrapper-code-email">
                {/* <div className="list-code-email">
                  {listCodeEmail.map((item, idx) => (
                    <span key={idx} className="name-code" onClick={() => handlePointerContent(item)}>
                      {item.name}
                    </span>
                  ))}
                </div> */}
                <div className="code-email-select">
                  {/* <div className="left">
                        <SelectCustom
                          id="placeholderType"
                          name="placeholderType"
                          label="Chọn đối tượng"
                          options={listApproach}
                          fill={true}
                          value={placeholder.value}
                          onChange={(e) => {
                            setListApproach(listApproach.map((i) => ({ ...i, isActive: e.value === i.value ? true : false })));
                            setPlaceholder(e);
                          }}
                          placeholder={"Chọn đối tượng"}
                        />
                      </div> */}
                  <div className="right">
                    <SelectCustom
                      id="placeholder"
                      name="placeholder"
                      // label={"Chọn trường thông tin " + placeholder.label}
                      options={placeholder.listPlaceholder}
                      fill={true}
                      value={null}
                      onMenuOpen={() => fetchPlaceholder()}
                      onChange={(e) => handlePointerContent(e)}
                      placeholder={"Chọn trường thông tin " + placeholder.label}
                    />
                  </div>
                </div>
              </div>

              {/* Nội dung email gửi đi */}
              <div className="form-group-editor">
                {/* TODO: lỗi phần này do trình soạn thảo */}
                <RebornEditor
                  name="content"
                  fill={true}
                  initialValue={contentEmail ? contentEmail : ""}
                  dataText={dataCodeEmail}
                  onChangeContent={(e) => handleChangeContentEmail(e)}
                  error={validateContentEmail}
                  message="Nội dung của bạn chưa có link thu thập VOC"
                />
              </div>

              <div className="quote-attachment">
                <div>
                  <span style={{ fontSize: 16, fontWeight: "500" }}>Mẫu hợp đồng đính kèm</span>
                </div>
                <div className="img-document">
                  <div className="info-document">
                    <div className="__avatar--doc">
                      <img src={ImageWord} alt={"tailieu"} />
                    </div>
                    <div className="__detail">
                      <span className="name-document">{convertFileName(dataContract?.name || "")}.docx</span>
                      <Tippy content="Tải xuống">
                        <div
                          className="download"
                          onClick={() => {
                            download(dataContract?.template, convertFileName(dataContract?.name || ""));
                          }}
                        >
                          <Icon name="Download" />
                        </div>
                      </Tippy>
                      {/* <span className="size-document">
                                {item.fileSize > 1048576 ? `${(item.fileSize / 1048576).toFixed(2)} MB` : `${(item.fileSize / 1024).toFixed(1)} KB`}
                            </span> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />

      <AddTemplateEmailModal
        onShow={showModalAddTemplateEmail}
        onHide={() => setShowModalAddTemplateEmail(false)}
        //contentDelta -> Chưa lưu
        data={{ id: 0, title: titleEmail, content: contentEmail, type: 1, tcyId: 0 } as any}
      />

      <ViewTemplateEmailModal
        onShow={showModalViewTemplateEmail}
        onHide={(reload) => {
          setShowModalViewTemplateEmail(false);
        }}
        callback={loadTemplateEmail}
      />
    </Fragment>
  );
}

/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Input from "components/input/input";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import "./ModalAddWebhook.scss";
import { ContextType, UserContext } from "contexts/userContext";
import { Parser } from "formula-functionizer";
import SelectCustom from "components/selectCustom/selectCustom";
import WebhookService from "services/WebhookService";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import ReactJson from "react-json-view";

import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import InstallApplicationService from "services/InstallApplicationService";
import ContractService from "services/ContractService";

export default function ModalAddWebhook(props: any) {
  const { onShow, data, onHide } = props;

  const focusedElement = useActiveElement();
  const parser = new Parser();

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        entityName: data?.entityName ?? "",
        eventName: data?.eventName ?? "",
        link: data?.link ?? "",
        appId: data?.appId ?? null,
        mapper: data?.mapper ?? "[]",
        method: data?.method ?? "",
      } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listCustomer, setListCustomer] = useState([]);
  const [listContract, setListContract] = useState([]);
  const [listContractAttribute, setListContractAttribute] = useState([]);
  const [listCustomerAttribute, setListCustomerAttribute] = useState([]);

  const getListContractAttribute = async () => {
    const response = await CustomerService.customerAttributes();

    if (response.code == 0) {
      const result = response.result || null;

      setListContractAttribute(result?.items || []);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };
  const getListCustomerAttribute = async () => {
    const response = await CustomerService.customerAttributes();

    if (response.code == 0) {
      const result = response.result || null;
      // const newResult = result?.items?.map(item => {
      //     return {
      //         // attId: item.attId,
      //         name: item.name,
      //         // title: item.title,
      //         // type: item.type,
      //         attributeMapping: ''
      //     }
      // }) || [];

      setListCustomerAttribute(result?.items || []);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getListCustomer = async () => {
    const param = {
      limit: 1,
    };
    const response = await CustomerService.filter(param);

    if (response.code == 0) {
      const result = response.result || null;
      if (result?.items && result?.items?.length > 0) {
        setListCustomer(result?.items || []);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getListContract = async () => {
    const param = {
      limit: 1,
    };
    const response = await ContractService.list(param);

    if (response.code == 0) {
      const result = response.result || null;
      if (result?.items && result?.items?.length > 0) {
        setListContract(result?.items || []);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //lấy về thông tin các trường động đã được nhập
  // const getCustomerExtraInfos = async () => {
  //   const response = await CustomerExtraInfoService.list(data?.id, 0);
  //   setCustomerExtraInfos(response.code === 0 ? response.result : []);
  // };

  // useEffect(() => {
  //   if (onShow && data?.entityName) {
  //     if (data?.entityName === "customer") {
  //       getListCustomerAttribute();
  //     } else if (data?.entityName === "contract") {
  //       getListContractAttribute();
  //     }
  //   }
  // }, [onShow, data]);

  useEffect(() => {
    if (onShow && formData?.values?.entityName) {
      if (formData?.values?.entityName === "customer") {
        getListCustomerAttribute();
      } else if (formData?.values?.entityName === "contract") {
        getListContractAttribute();
      }
    }
  }, [onShow, formData?.values?.entityName]);

  const getTitle = (name, entityName, listAttribute) => {
    let newTitle = "";

    if (entityName === "customer") {
      const newResult = listAttribute.find((el) => el.name === name) || null;
      if (newResult) {
        newTitle = newResult.title;
      }
    }

    return newTitle;
  };

  useEffect(() => {
    if (onShow && data) {
      setDataMethod({ value: data.method, label: data.method });
      setDataEventName({
        value: data.eventName,
        label: data.eventName === "update" ? "Thêm" : data.eventName === "edit" ? "Sửa" : "",
      });

      setDataEntityName({
        value: data.entityName,
        label:
          data.entityName === "customer"
            ? "Khách hàng"
            : data.entityName === "contract"
            ? "Hợp đồng"
            : data.entityName === "business_partner"
            ? "Đối tác"
            : "",
      });

      setDataApp({ value: data.appId, label: data.appName });

      if (data.entityName === "customer") {
        getListCustomer();
        getListCustomerAttribute();
        //cách làm cũ dùng mảng
        // const newListAttribute = data.mapper && JSON.parse(data.mapper) && Array.isArray(JSON.parse(data.mapper)) && JSON.parse(data.mapper).length > 0 ? JSON.parse(data.mapper)  : [];
        // const listAttributeData = newListAttribute.map(item => {
        //     const name = Object.entries(item)[0][0];
        //     const attributeMapping = Object.entries(item)[0][1];
        //     const title = getTitle(name, data.entityName, data.entityName === 'customer' ? listCustomerAttribute : []);

        //     return {
        //         name: name,
        //         title: title,
        //         attributeMapping: attributeMapping,
        //         checkName: false,
        //         checkMapping: false
        //     }
        // })

        // setListAttribute(listAttributeData);

        //cách làm mới
        const newListAttribute = data.mapper && JSON.parse(data.mapper) ? JSON.parse(data.mapper) : {};
        setDataJsonCustomer(newListAttribute);
      } else if (data?.entityName === "contract") {
        getListContractAttribute();
        //cách làm mới
        const newListAttribute = data.mapper && JSON.parse(data.mapper) ? JSON.parse(data.mapper) : {};
        setDataJsonContract(newListAttribute);
      }
    }
  }, [data, onShow]);

  useEffect(() => {
    if (formData) {
      if (formData?.values?.entityName === "customer") {
        getListCustomer();
      } else if (formData?.values?.entityName === "contract") {
        getListContract();
      }
    }
  }, [formData?.values?.entityName]);
  console.log("data.entityName>>>>", data?.entityName);

  const [dataMethod, setDataMethod] = useState(null);
  const [validateFieldMethod, setValidateFieldMethod] = useState(false);

  const [dataEntityName, setDataEntityName] = useState(null);
  const [validateFieldEntityName, setValidateFieldEntityName] = useState(false);

  const [dataEventName, setDataEventName] = useState(null);
  const [validateFieldEventName, setValidateFieldEventName] = useState(false);

  const [dataApp, setDataApp] = useState(null);
  const [validateFieldApp, setValidateFieldApp] = useState(false);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
  ];

  const [listAttribute, setListAttribute] = useState([
    {
      name: "",
      title: "",
      attributeMapping: "",
      checkName: false,
      checkMapping: false,
    },
  ]);

  const loadedOptionAttribute = async (search, loadedOptions, { page }) => {
    const response = await CustomerService.customerAttributes();

    if (response.code === 0) {
      // const dataOption = response.result?.items;

      // let newOtion = [];
      // listAttribute.map(item => {
      //   const newData = dataOption.filter(el => el.name !== item.name);
      //   newOtion = []
      //   newData.map(el => {
      //     newOtion.push(el)
      //   })
      // })

      const dataOption = (response.result.items || []).filter((item) => {
        return !listAttribute.some((el) => el.name === item.name);
      });

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.name,
                  label: item.name,
                  title: item.title,
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

  const formatOptionLabelAttribute = ({ label, title }) => {
    return (
      <div className="selected--item">
        {label} {`${title ? `(${title})` : ""}`}
      </div>
    );
  };

  const loadedOptionApp = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await InstallApplicationService.list(param);

    if (response.code === 0) {
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
        // hasMore: response.result.loadMoreAble,
        // additional: {
        //   page: page + 1,
        // },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueAppp = (e) => {
    setValidateFieldApp(false);
    setDataApp(e);
    setFormData({ ...formData, values: { ...formData?.values, appId: e.value } });
  };

  useEffect(() => {
    loadedOptionAttribute("", undefined, { page: 1 });
  }, [listAttribute]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!dataMethod) {
      setValidateFieldMethod(true);
      return;
    }

    if (!dataEntityName) {
      setValidateFieldEntityName(true);
      return;
    }
    if (!dataEventName) {
      setValidateFieldEventName(true);
      return;
    }

    if (!dataApp) {
      setValidateFieldApp(true);
      return;
    }

    // const listAttributeData = [...listAttribute];
    // const checkName = listAttributeData.map((item, index) => {
    //   if(!item.name){
    //     return {
    //       ...item,
    //       checkName: true
    //     }
    //   } else if (!item.attributeMapping){
    //     return {
    //       ...item,
    //       checkMapping: true
    //     }
    //   } else {
    //     return item
    //   }
    // })

    // if(checkName && checkName.length > 0 && checkName.filter(el => el.checkName).length > 0){
    //   setListAttribute(checkName);
    //   return;
    // }

    // if(checkName && checkName.length > 0 && checkName.filter(el => el.checkMapping).length > 0){
    //   setListAttribute(checkName);
    //   return;
    // }

    setIsSubmit(true);

    // const listAttributeSubmit = (listAttributeData || []).map(item => {
    //     return {
    //         [item.name]: item.attributeMapping
    //     }
    // })

    const body: any = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as any),
      // ...{mapper: JSON.stringify(listAttributeSubmit)}
      ...{ mapper: dataEntityName?.value == "contract" ? JSON.stringify(dataJsonContract) : JSON.stringify(dataJsonCustomer) },
    };

    const response = await WebhookService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} Webhook thành công`, "success");
      clearForm(true);
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
              !isDifferenceObj(formData.values, values) ? clearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              // !isDifferenceObj(formData.values, values) ||
              // (formData.errors && Object.keys(formData.errors).length > 0) ||
              validateFieldEntityName ||
              validateFieldEventName ||
              validateFieldMethod,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, validateFieldEntityName, validateFieldEventName, validateFieldMethod]
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
        clearForm(false);
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

  const clearForm = (acc) => {
    onHide(acc);

    setDataMethod(null);
    setValidateFieldMethod(false);

    setDataEntityName(null);
    setValidateFieldEntityName(false);

    setDataEventName(null);
    setValidateFieldEventName(false);

    setDataApp(null);
    setValidateFieldApp(false);

    setListAttribute([
      {
        name: "",
        title: "",
        attributeMapping: "",
        checkName: false,
        checkMapping: false,
      },
    ]);

    setListCustomer([]);
    setDataJsonCustomer({});
  };

  const [dataJsonCustomer, setDataJsonCustomer] = useState({
    // name: 'John Doe',
    // age: 30
  });

  const [dataJsonContract, setDataJsonContract] = useState({});
  const [dataJsonBusinessPartner, setDataJsonBusinessPartner] = useState({});

  const handleAddAttribute = () => {
    // add.value chứa giá trị mới được thêm vào
    // Ví dụ xử lý dữ liệu trước khi cập nhật state
    const newAttribute = {
      name: "",
      value: "",
    };
    setDataJsonCustomer((prevData) => ({
      ...prevData,
      [newAttribute.name]: newAttribute.value,
    }));
  };

  const handleAdd = (add) => {
    // Cập nhật lại JSON sau khi thêm mới
    // setDataJson(add.updated_src);
    if (dataEntityName?.value === "customer") {
      setDataJsonCustomer(add.src);
    }
    if (dataEntityName?.value === "contract") {
      setDataJsonContract(add.src);
    }
    if (dataEntityName?.value === "business_partner") {
      setDataJsonBusinessPartner(add.src);
    }
  };

  const handleEdit = (edit) => {
    // edit.updated_src chứa JSON sau khi chỉnh sửa
    // edit.name là tên của mục được chỉnh sửa
    // edit.value là giá trị mới của mục đó

    // Cập nhật dữ liệu trong state với dữ liệu chỉnh sửa mới
    // setDataJson(edit.updated_src);
    console.log("vaof ddaay >>>><<<<<<<", edit);
    console.log("dataEntityName >>>><<<<<<<", dataEntityName);

    if (dataEntityName?.value === "customer") {
      setDataJsonCustomer(edit.src);
    }
    if (dataEntityName?.value === "contract") {
      console.log("vaof ddaay >>>>", edit);

      setDataJsonContract(edit.src);
    }
    if (dataEntityName?.value === "business_partner") {
      setDataJsonBusinessPartner(edit.src);
    }
  };

  const handleDelete = (deleteEvent) => {
    // deleteEvent.updated_src chứa JSON sau khi xóa
    // deleteEvent.name là tên của mục được xóa
    // deleteEvent.value là giá trị của mục đó trước khi xóa

    // Cập nhật dữ liệu trong state với JSON đã xóa mục
    // setDataJson(deleteEvent.updated_src);
    if (deleteEvent.indexOrName) {
      if (dataEntityName?.value === "customer") {
        setDataJsonCustomer(deleteEvent.src);
      }
      if (dataEntityName?.value === "contract") {
        setDataJsonContract(deleteEvent.src);
      }
      if (dataEntityName?.value === "business_partner") {
        setDataJsonBusinessPartner(deleteEvent.src);
      }
    }
  };

  const handleSelect = (selected) => {
    // selected.name: Tên của phần tử đã được chọn
    // selected.value: Giá trị của phần tử đã được chọn
    // selected.namespace: Mảng chứa đường dẫn đến phần tử đã được chọn
  };

  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        size="xl"
        toggle={() => {
          if (!isSubmit) {
            clearForm(false);
          }
        }}
        className="modal-add-webhook"
      >
        <form className="form-add-webhook" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} Webhook`}
            toggle={() => {
              if (!isSubmit) {
                clearForm(false);
              }
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              <div className="basic-info">
                <div className="form-group">
                  <Input
                    label="Tên Webhook"
                    name="name"
                    fill={true}
                    required={true}
                    value={formData.values?.name}
                    placeholder="Nhập tên Webhook"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData.values, name: value } });
                    }}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id="appId"
                    name="appId"
                    label="Ứng dụng"
                    fill={true}
                    required={true}
                    error={validateFieldApp}
                    message="Ứng dụng không được để trống"
                    options={[]}
                    value={dataApp}
                    onChange={(e) => handleChangeValueAppp(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn ứng dụng"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionApp}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id="method"
                    name="method"
                    label="Phương thức"
                    fill={true}
                    special={true}
                    required={true}
                    error={validateFieldMethod}
                    message="Phương thức không được bỏ trống"
                    options={[
                      {
                        value: "POST",
                        label: "POST",
                      },
                      {
                        value: "GET",
                        label: "GET",
                      },
                    ]}
                    value={dataMethod}
                    onChange={(e) => {
                      setValidateFieldMethod(false);
                      setDataMethod(e);
                      setFormData({ ...formData, values: { ...formData?.values, method: e.value } });
                    }}
                    isAsyncPaginate={false}
                    placeholder="Chọn phương thức"
                    // additional={{
                    //     page: 1,
                    // }}
                    // loadOptionsPaginate={loadedOptionGuaranteeType}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id="entityName"
                    name="entityName"
                    label="Tên thực thể"
                    special={true}
                    options={[
                      {
                        value: "customer",
                        label: "Khách hàng",
                      },
                      {
                        value: "contract",
                        label: "Hợp đồng",
                      },
                      {
                        value: "business_partner",
                        label: "Đối tác",
                      },
                    ]}
                    fill={true}
                    value={dataEntityName}
                    required={true}
                    onChange={(e) => {
                      setValidateFieldEntityName(false);
                      setDataEntityName(e);
                      setFormData({ ...formData, values: { ...formData?.values, entityName: e.value } });
                      // setDataJson({})
                      if (e.value === "customer") {
                        // getListCustomerAttribute();
                        getListCustomer();
                      }

                      if (e.value === "contract") {
                        // setListAttribute([
                        //   {
                        //     name: '',
                        //     title: '',
                        //     attributeMapping: '',
                        //     checkName: false,
                        //     checkMapping: false
                        //   }
                        // ]);
                        setListCustomer([]);
                      }
                      if (e.value === "business_partner") {
                        // setListAttribute([
                        //   {
                        //     name: '',
                        //     title: '',
                        //     attributeMapping: '',
                        //     checkName: false,
                        //     checkMapping: false
                        //   }
                        // ])
                        setListCustomer([]);
                      }
                    }}
                    isAsyncPaginate={false}
                    isFormatOptionLabel={false}
                    placeholder="Chọn tên thực thể"
                    // additional={{
                    //   page: 1,
                    // }}
                    // loadOptionsPaginate={loadedOptionEmployee}
                    // formatOptionLabel={formatOptionLabelEmployee}
                    error={validateFieldEntityName}
                    message="Tên thực thể không được bỏ trống"
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id="eventName"
                    name="eventName"
                    label="Tên sự kiện"
                    fill={true}
                    special={true}
                    required={true}
                    error={validateFieldEventName}
                    message="Sự kiện không được bỏ trống"
                    options={[
                      {
                        value: "update",
                        label: "Thêm",
                      },
                      {
                        value: "edit",
                        label: "Sửa",
                      },
                    ]}
                    value={dataEventName}
                    onChange={(e) => {
                      setValidateFieldEventName(false);
                      setDataEventName(e);
                      setFormData({ ...formData, values: { ...formData?.values, eventName: e.value } });
                    }}
                    isAsyncPaginate={false}
                    placeholder="Chọn sự kiện"
                    // additional={{
                    //     page: 1,
                    // }}
                    // loadOptionsPaginate={loadedOptionGuaranteeType}
                  />
                </div>

                <div className="form-group">
                  <Input
                    label="Link API"
                    name="link"
                    fill={true}
                    required={true}
                    value={formData.values?.link}
                    placeholder="Nhập link API"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData.values, link: value } });
                    }}
                  />
                </div>
              </div>

              {/* {dataEntityName && listAttribute && listAttribute.length > 0 ? 
                <div style={{marginTop: '1.2rem'}}>
                    <div>
                        <span style={{fontSize: 14, fontWeight: '700'}}>Ánh xạ trường thông tin</span>
                    </div>
                    <div className="mapping-attribute">
                        {listAttribute && listAttribute.length > 0 ? 
                            listAttribute.map((item, index) => (
                                <div key={index} className="item-mapping">
                                 
                                  <div className="form-group">
                                    <SelectCustom
                                      key={listAttribute.length}
                                      id=""
                                      name="name"
                                      label=""
                                      fill={true}
                                      required={true}
                                      error={item.checkName}
                                      message="Trường nguồn không được bỏ trống"
                                      options={[]}
                                      value={item.name ? {value: item.name, label: item.name, title: item.title} : null}
                                      onChange={(e) => {
                                        setListAttribute((current) =>
                                                current.map((obj, idx) => {
                                                    if (index === idx) {
                                                        return { ...obj, name: e.value, title: e.title, checkName: false };
                                                    }
                                                    return obj;
                                                })
                                            );
                                      }}
                                      isAsyncPaginate={true}
                                      placeholder="Chọn trường nguồn"
                                      additional={{
                                          page: 1,
                                      }}
                                      loadOptionsPaginate={
                                        dataEntityName?.value === 'customer'?
                                          loadedOptionAttribute  
                                          : null
                                      }
                                      formatOptionLabel={formatOptionLabelAttribute}
                                    />
                                  </div> 
                                  <div className="form-group">
                                      <Input
                                          label=""
                                          name="name"
                                          fill={true}
                                          required={false}
                                          error={item.checkMapping}
                                          message="Trường đích không được bỏ trống"
                                          value={item.attributeMapping}
                                          placeholder="Nhập trường đích"
                                          onChange={(e) => {
                                              const value = e.target.value;
                                              setListAttribute((current) =>
                                                  current.map((obj, idx) => {
                                                      if (index === idx) {
                                                          return { ...obj, attributeMapping: value, checkMapping: false };
                                                      }
                                                      return obj;
                                                  })
                                              );
                                          }}
                                      />
                                  </div>
                                    <div className="add-attribute">
                                      <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                        <span
                                          className="icon-add"
                                          onClick={() => {
                                            setListAttribute([
                                              ...listAttribute,
                                              { 
                                                name: '',
                                                title: '',
                                                attributeMapping: '',
                                                checkName: false,
                                                checkMapping: false
                                              },
                                            ]);
                                          }}
                                        >
                                          <Icon name="PlusCircleFill" />
                                        </span>
                                      </Tippy>
                                    </div>

                                    {listAttribute.length > 1 ? 
                                      <div className="remove-attribute">
                                        <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                          <span className="icon-remove" 
                                            onClick={() => {
                                              const newList = [...listAttribute];
                                              newList.splice(index, 1);
                                              setListAttribute(newList);
                                            }}
                                          >
                                            <Icon name="Trash" />
                                          </span>
                                        </Tippy>
                                      </div>
                                    : null}
                                </div>
                            ))
                            
                        : null}
                    </div>
                </div>
              : null} */}

              {listCustomer && listCustomer.length > 0 && dataEntityName?.value === "customer" ? (
                <div className="mapping-json">
                  <div className="container-json-view">
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.6rem" }}>
                      <span style={{ fontSize: 16, fontWeight: "600" }}>Dữ liệu mẫu (nguồn)</span>
                    </div>
                    <div className="content-json-view">
                      <JsonView
                        src={listCustomer[0]}
                        // style={{fontSize: 11, fontWeight:'700'}}
                        // name=''
                        // enableClipboard={false}
                        collapsed={false}
                      />
                    </div>
                  </div>

                  <div className="container-json-edit">
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.6rem" }}>
                      <span style={{ fontSize: 16, fontWeight: "600" }}>Cấu hình mapping</span>
                    </div>
                    <div className="content-json-edit">
                      <JsonView
                        editable
                        src={dataJsonCustomer}
                        // style={{fontSize: 11, fontWeight:'700'}}
                        collapsed={false}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        // onSelect={handleSelect}
                        // enableClipboard={false} // Tùy chọn: để không hiện clipboard
                        // displayDataTypes={false} // Tùy chọn: ẩn loại dữ liệu
                      />
                    </div>
                  </div>
                </div>
              ) : listContract && listContract.length > 0 && dataEntityName?.value === "contract" ? (
                <div className="mapping-json">
                  <div className="container-json-view">
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.6rem" }}>
                      <span style={{ fontSize: 16, fontWeight: "600" }}>Dữ liệu mẫu (nguồn)</span>
                    </div>
                    <div className="content-json-view">
                      <JsonView
                        src={listContract[0]}
                        // style={{fontSize: 11, fontWeight:'700'}}
                        // name=''
                        // enableClipboard={false}
                        collapsed={false}
                      />
                    </div>
                  </div>

                  <div className="container-json-edit">
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.6rem" }}>
                      <span style={{ fontSize: 16, fontWeight: "600" }}>Cấu hình mapping</span>
                    </div>
                    <div className="content-json-edit">
                      <JsonView
                        editable
                        src={dataJsonContract}
                        // style={{fontSize: 11, fontWeight:'700'}}
                        collapsed={false}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        // onSelect={handleSelect}
                        // enableClipboard={false} // Tùy chọn: để không hiện clipboard
                        // displayDataTypes={false} // Tùy chọn: ẩn loại dữ liệu
                      />
                    </div>
                  </div>
                </div>
              ) : null}
              {/* <div>
                <h1>JSON Editor</h1>
               
                <Editor
                  ref={editorRef}
                    value={jsonData}
                    onChange={handleChange}
                    mode="tree" // Có thể thay đổi thành "code", "form", "text" tùy thuộc vào cách bạn muốn hiển thị
                />
                 <div onClick={addNewField}>Add New Field</div>
                <pre>{JSON.stringify(jsonData, null, 2)}</pre>
              </div> */}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import Icon from "components/icon";
import Button from "components/button/button";
import TextArea from "components/textarea/textarea";
import BoxTable from "components/boxTable/boxTable";
import { showToast } from "utils/common";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Badge from "components/badge/badge";

import "./index.scss";
import ProcessedObjectService from "services/ProcessedObjectService";
import BpmFormService from "services/BpmFormService";
import BpmFormArtifactService from "services/BpmFormArtifactService";
import ContractEformService from "services/ContractEformService";
import { IOption } from "model/OtherModel";
import { convertToId } from "reborn-util";
import { Parser } from "formula-functionizer";
import { SelectOptionData } from "utils/selectCommon";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import RadioList from "components/radio/radioList";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import NummericInput from "components/input/numericInput";
import Input from "components/input/input";
import Loading from "components/loading";

export default function DetailHistoryProcess(props) {
  const { dataObject, onReload } = props;

  const parser = new Parser();

  // đoạn này là lấy ra thông tin của trình ký đã ký
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [dataAction, setDataAction] = useState(null);
  const [valueNote, setValueNote] = useState<string>("");

  const lstAction = [
    { name: "Phê duyệt", status: 1, color: "success" },
    // { name: "Phê duyệt có lưu ý", status: 1, color: "warning" },
    { name: "Từ chối", status: 0, color: "destroy" },
  ];

  const handleSigned = async (item) => {
    setIsSubmit(true);

    const body = {
      id: dataObject?.id,
      processId: dataObject?.processId,
    };

    const response = await ProcessedObjectService.bpmStart(body);

    if (response.code === 0) {
      showToast(`${item.status === 1 ? "Phê duyệt" : item.name} thành công`, "success");
      onReload(true);
      getListNode(dataObject.id);
      getListHistory(dataObject.id);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
    setIsSubmit(false);
  };

  const [listNode, setListNode] = useState([]);
  const [tabNode, setTabNode] = useState(null);
  const [listTabInNode, setListTabInNode] = useState([]);
  const [tabInNode, setTabInNode] = useState(null);
  const [listArtifact, setListArtifact] = useState([]);
  const [listEformAttribute, setListEformAttribute] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contractExtraInfos, setContractExtraInfos] = useState<any>([]);

  const [listHistory, setListHistory] = useState([]);

  //Dùng cho lookup
  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);

  useEffect(() => {
    if (listNode && listNode.length === 1) {
      setTabNode(listNode[0].id);
    }
  }, [listNode]);

  useEffect(() => {
    if (listTabInNode && listTabInNode.length > 0) {
      setTabInNode(listTabInNode[0].id);
    }
  }, [listTabInNode]);

  //lấy về danh sách các node
  const getListNode = async (objectId) => {
    const body = {
      potId: objectId,
    };

    const response = await ProcessedObjectService.bpmExecListNode(body);

    if (response.code === 0) {
      const result = response.result;
      setListNode(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  //lấy về danh sách các tab trong node
  const handleLstTabInNode = async (nodeId: number) => {
    if (!nodeId) return;

    const param = {
      nodeId: nodeId,
    };

    const response = await BpmFormService.list(param);

    if (response.code === 0) {
      const result = response.result;
      setListTabInNode(result);
    } else {
      showToast(response.message || "Lỗi tab đang bị lỗi. Vui lòng thử lại sau !", "error");
    }
  };

  //lấy về danh sách các component trong tab
  const getListArtifact = async (formId) => {
    const params = {
      formId: formId,
    };

    const response = await BpmFormArtifactService.list(params);

    if (response.code === 0) {
      const result = response.result;
      setListArtifact(result);
    } else {
      showToast(response.message || "Lỗi tab đang bị lỗi. Vui lòng thử lại sau !", "error");
    }
  };

  //lấy về dữ liệu trong eform
  const getListEformAttribute = async (eformId) => {
    const params = {
      limit: 1000,
      eformId: eformId,
    };

    const response = await ContractEformService.listEformExtraInfo(params);

    if (response.code === 0) {
      const result = response.result;
      setListEformAttribute(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getInfoEform = async (bfatId, potId) => {
    const params = {
      bfatId: bfatId,
      potId: potId,
    };
    const response = await ProcessedObjectService.bpmArtifactData(params);

    if (response?.code === 0) {
      const result = response.result;
      if (result) {
        const attributeNew = result.attributeValue && JSON.parse(result.attributeValue);

        if (attributeNew && Object.entries(attributeNew).length > 0) {
          const newArray = Object.entries(attributeNew).map((item) => {
            return {
              [item[0]]: item[1],
            };
          });

          setContractExtraInfos(newArray);
        }
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getListHistory = async (potId) => {
    const params = {
      potId: potId,
      limit: 1000,
    };

    const response = await ProcessedObjectService.bpmParticipantProcesslog(params);

    if (response.code === 0) {
      const result = response.result;
      setListHistory(result.items);
    } else {
      showToast(response.message || "Lỗi tab đang bị lỗi. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (dataObject && dataObject.id) {
      getListNode(dataObject.id);
      getListHistory(dataObject.id);
    }
  }, [dataObject]);

  useEffect(() => {
    if (tabNode) {
      handleLstTabInNode(tabNode);
    }
  }, [tabNode]);

  useEffect(() => {
    if (tabInNode) {
      getListArtifact(tabInNode);
    }
  }, [tabInNode]);

  useEffect(() => {
    if (listArtifact && listArtifact.length > 0) {
      const dataEform = listArtifact.find((el) => el.eformId) || null;
      if (dataEform) {
        getListEformAttribute(dataEform.eformId);
        if (listHistory && listHistory.length > 0 && listHistory.filter((el) => el.status === 2)?.length > 0) {
          getInfoEform(dataEform.id, dataObject.id);
        }
      }
    }
  }, [listArtifact, dataObject, listHistory]);

  const getContractAttributeFormula = (attributes) => {
    let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attrObj = {};
    (contractExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        attrObj["contractAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });

    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  const getContractAttributeValue = (attributeId, attributeFieldName) => {
    let attributeValue = "";
    (contractExtraInfos || []).map((item, idx) => {
      // if (item.attributeId == attributeId) {
      //   attributeValue = item.attributeValue;
      // }
      if (Object.entries(item)[0][0] == attributeFieldName) {
        attributeValue = Object.entries(item)[0][1];
      }
    });

    return attributeValue;
  };

  const updateContractMultiselectAttribute = (attributeId, e, attributeFieldName) => {
    let attributeValue = e ? e.split(",") : [];
    updateContractAttribute(attributeId, JSON.stringify(attributeValue), attributeFieldName);
  };

  const updateContractAttribute = (attributeId, attributeValue, attributeFieldName) => {
    // let contractId = data?.id || 0;

    let found = false;

    const newdata = (contractExtraInfos || []).map((item, idx) => {
      // if (item.attributeId == attributeId) {
      //   item.attributeValue = attributeValue;
      //   found = true;
      // }

      if (Object.entries(item)[0][0] == attributeFieldName) {
        found = true;
        return {
          [attributeFieldName]: attributeValue,
        };
      } else {
        return item;
      }
    });

    if (!found) {
      const item: any = {
        [attributeFieldName]: attributeValue,
      };
      // item.attributeId = attributeId;
      // item.attributeValue = attributeValue;

      contractExtraInfos[contractExtraInfos.length] = item;
    }
    if (found) {
      setContractExtraInfos([...newdata]);
    } else {
      setContractExtraInfos([...contractExtraInfos]);
    }
  };

  const onSelectOpenCustomer = async () => {
    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingCustomer(true);
      const dataOption = await SelectOptionData("customerId");

      if (dataOption) {
        setListCustomer([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomer(false);
    }
  };

  const handleChangeValueCustomerItem = (e, contractAttribute, attributeFieldName) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value, attributeFieldName);
  };

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId");

      if (dataOption) {
        setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };
  const handleChangeValueEmployeeItem = (e, contractAttribute, attributeFieldName) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value, attributeFieldName);
  };

  const onSelectOpenContract = async () => {
    if (!listContract || listContract.length === 0) {
      setIsLoadingContract(true);
      const dataOption = await SelectOptionData("contractId");

      if (dataOption) {
        setListContract([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingContract(false);
    }
  };

  const handleChangeValueContractItem = (e, contractAttribute, attributeFieldName) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value, attributeFieldName);
  };

  const onSelectOpenContact = async () => {
    if (!listContact || listContact.length === 0) {
      setIsLoadingContact(true);
      const dataOption = await SelectOptionData("contactId");

      if (dataOption) {
        setListContact([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingContact(false);
    }
  };

  const handleChangeValueContactItem = (e, contractAttribute, attributeFieldName) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value, attributeFieldName);
  };

  const getDecimalScale = (attributes) => {
    attributes = attributes ? JSON.parse(attributes) : {};
    let numberFormat = attributes?.numberFormat || "";
    if (numberFormat.endsWith(".#")) {
      return 1;
    }

    if (numberFormat.endsWith(".##")) {
      return 2;
    }

    if (numberFormat.endsWith(".###")) {
      return 3;
    }

    return 0;
  };

  /**
   * Trả về loại control theo kiểu dữ liệu tương ứng
   */
  const getControlByType = (contractAttribute) => {
    let CustomControl = (
      <Input
        id={`Id${contractAttribute.id}`}
        label={contractAttribute.name}
        fill={true}
        value={getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
        onChange={(e) => updateContractAttribute(contractAttribute.id, e.target.value, contractAttribute.fieldName)}
        placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
        required={!!contractAttribute.required}
        readOnly={!!contractAttribute.readonly}
      />
    );

    switch (contractAttribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={contractAttribute.name}
            name={contractAttribute.name}
            value={getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            fill={true}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            onChange={(e) => updateContractAttribute(contractAttribute.id, e.target.value, contractAttribute.fieldName)}
            maxLength={459}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={contractAttribute.name}
            name={contractAttribute.name}
            fill={true}
            required={!!contractAttribute.required}
            value={getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
            thousandSeparator={true}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            decimalScale={getDecimalScale(contractAttribute.attributes)}
            onChange={(e) => {
              const value = e.target.value;
              let valueNum = value?.replace(/,/g, "");
              updateContractAttribute(contractAttribute.id, valueNum, contractAttribute.fieldName);
            }}
          />
        );
        break;
      case "dropdown":
        CustomControl = (
          <SelectCustom
            name={contractAttribute.name}
            label={contractAttribute.name}
            fill={true}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            // error={validateFieldPipeline}
            // message="Loại hợp đồng không được bỏ trống"
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            value={getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
            onChange={(e) => {
              updateContractAttribute(contractAttribute.id, e.value, contractAttribute.fieldName);
            }}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "multiselect":
        let attris = getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName);
        CustomControl = (
          <CheckboxList
            title={contractAttribute.name}
            required={!!contractAttribute.required}
            disabled={!!contractAttribute.readonly}
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            value={attris ? JSON.parse(attris).join(",") : ""}
            onChange={(e) => {
              updateContractMultiselectAttribute(contractAttribute.id, e, contractAttribute.fieldName);
            }}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            checked={!!getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
            label={contractAttribute.name}
            onChange={(e) => {
              updateContractAttribute(contractAttribute.id, e.target.checked, contractAttribute.fieldName);
            }}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={contractAttribute.name}
            title={contractAttribute.name}
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            value={getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
            onChange={(e) => {
              updateContractAttribute(contractAttribute.id, e.target.value, contractAttribute.fieldName);
            }}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={contractAttribute.name}
            name={contractAttribute.name}
            fill={true}
            value={getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
            onChange={(e) => {
              const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
              updateContractAttribute(contractAttribute.id, newDate, contractAttribute.fieldName);
            }}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            iconPosition="left"
            icon={<Icon name="Calendar" />}
            isMaxDate={false}
            // error={validateFieldSignDate}
            // message={`Vui lòng chọn ${contractAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "lookup":
        let attrs = contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : {};

        //1. Trường hợp là customer (khách hàng)
        //2. Trường hợp là employee (nhân viên)
        //3. Trường hợp là contract (hợp đồng)
        //4. Trường hợp là contact (người liên hệ)
        switch (attrs?.refType) {
          case "customer":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItem(e, contractAttribute, contractAttribute.fieldName)}
              />
            );
            break;
          case "employee":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                onMenuOpen={onSelectOpenEmployee}
                isLoading={isLoadingEmployee}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueEmployeeItem(e, contractAttribute, contractAttribute.fieldName)}
              />
            );
            break;
          case "contract":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                onMenuOpen={onSelectOpenContract}
                isLoading={isLoadingContract}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContractItem(e, contractAttribute, contractAttribute.fieldName)}
              />
            );
            break;
          case "contact":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                onMenuOpen={onSelectOpenContact}
                isLoading={isLoadingContact}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContactItem(e, contractAttribute, contractAttribute.fieldName)}
              />
            );
            break;
          default:
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id, contractAttribute.fieldName)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItem(e, contractAttribute, contractAttribute.fieldName)}
              />
            );
        }
        break;
      case "formula":
        //Công thức được lấy từ trường động và trường tĩnh
        //{contract.dealValue + contractAttribute.xyz} => sẽ cần parser từ 2 đối tượng là contract và contractAttribute

        //Chỉ hiển thị chứ không lưu giá trị (nếu thêm mới thì không hiển thị?, sửa mới hiển thị)
        CustomControl = (
          <Input
            id={`Id${contractAttribute.id}`}
            label={contractAttribute.name}
            fill={true}
            value={getContractAttributeFormula(contractAttribute?.attributes)}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );

        break;
    }

    return CustomControl;
  };

  const convertArrayToObject = (array, key?) => {
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [Object.keys(item)]: Object.values(item)[0],
      };
    }, initialValue);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // const errors = Validate(validations, formData, [...listFieldBasic]);
    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    if (listEformAttribute && listEformAttribute.length > 0) {
      let checkArray = [];

      listEformAttribute.map((item) => {
        if (item.required === 1 && item.parentId !== 0) {
          checkArray.push(item);
        }
      });

      if (checkArray.length > 0) {
        if (contractExtraInfos.length === 0) {
          showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
          return;
        } else {
          let check = false;
          checkArray.map((i) => {
            const index = contractExtraInfos.findIndex((el) => el.attributeId === i.id);
            if (index === -1) {
              check = true;
            }
          });

          if (check) {
            showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
            return;
          }
        }
      }
    }

    const newExtraInfos = convertArrayToObject(contractExtraInfos);

    const newListArtifact = listArtifact.map((item) => {
      if (item.eformId) {
        return {
          id: 0,
          bfatId: item.id,
          attributeValue: JSON.stringify(newExtraInfos),
        };
      } else {
        return {
          id: 0,
          bfatId: item.id,
          attributeValue: null,
        };
      }
    });

    setIsSubmit(true);

    const body: any = {
      id: 0,
      nodeId: tabNode,
      // attributeValue: JSON.stringify(contractExtraInfos),
      formId: tabInNode,
      potId: dataObject.id,
      processId: dataObject.processId,
      lstBpmArtifactData: newListArtifact,
      content: "",
    };

    const response = await ProcessedObjectService.bpmProcess(body);

    if (response.code === 0) {
      showToast(`Phê duyệt biểu mẫu thành công`, "success");
      getListNode(dataObject.id);
      getListHistory(dataObject.id);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const [tabHistory, setTabHistory] = useState(1);
  const listTabHistory = [
    {
      value: 1,
      label: "Lịch sử xử lý",
    },
    {
      value: 2,
      label: "Công việc",
    },
  ];

  return (
    <div className="signed__history--process">
      {listNode && listNode.length > 0 ? (
        <div className="lst__history">
          {listNode && listNode.length > 0 ? (
            <div style={{ display: "flex", marginBottom: "1.2rem" }}>
              {listNode.map((item, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: tabNode === item.id ? "1px solid" : "",
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingBottom: 3,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setTabNode(item.id);
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: "500", color: tabNode === item.id ? "" : "#d3d5d7" }}>{item.name}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="data-tab">
            {listTabInNode && listTabInNode.length > 0 ? (
              <div style={{ display: "flex", marginBottom: "1.2rem" }}>
                {listTabInNode.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      borderBottom: tabInNode === item.id ? "1px solid" : "",
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingBottom: 3,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setTabInNode(item.id);
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: "500", color: tabInNode === item.id ? "" : "#d3d5d7" }}>{item.name}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="preview-eform-container">
              {!isLoading && listEformAttribute && listEformAttribute.length > 0 ? (
                <div className="list__contract--attribute">
                  <Fragment>
                    {listEformAttribute.map((contractAttribute, index: number) => (
                      <Fragment key={index}>
                        {/* {!contractAttribute.parentId ? (
                            <label className= {index === 0 ? 'label-title-first' :  "label-title"}>
                              {contractAttribute.name}
                            </label>
                          ) : null} */}
                        {/* {contractAttribute.parentId ? ( */}
                        <div
                          className={`form-group ${contractAttribute.name.length >= 38 || listEformAttribute.length == 2 ? "special-case" : ""}`}
                          id={`Field${convertToId(contractAttribute.name)}`}
                        >
                          {getControlByType(contractAttribute)}
                        </div>
                        {/* ) : null} */}
                      </Fragment>
                    ))}
                  </Fragment>
                </div>
              ) : isLoading ? (
                <Loading />
              ) : (
                <SystemNotification
                  description={
                    <span>
                      Biểu mẫu chưa có trường thông tin nào cả.
                      <br />
                      Bạn hãy thêm trường thông tin cho biểu mẫu nhé!
                    </span>
                  }
                  type="no-item"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {listNode && listNode.length > 0 ? (
        <div style={{ justifyContent: "flex-end", display: "flex" }}>
          <div className="lst__action">
            <Button
              color={"success"}
              onClick={(e) => {
                onSubmit(e);
              }}
              disabled={isSubmit}
            >
              {"Phê duyệt"}
            </Button>
            <Button
              color={"destroy"}
              onClick={(e) => {
                // onSubmit(e);
              }}
              disabled={isSubmit}
            >
              {"Từ chối"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="container-history">
        {listTabHistory && listTabHistory.length > 0 ? (
          <div style={{ display: "flex", marginBottom: "1.2rem" }}>
            {listTabHistory.map((item, index) => (
              <div
                key={index}
                style={{
                  borderBottom: tabHistory === item.value ? "1px solid" : "",
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingBottom: 3,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setTabHistory(item.value);
                }}
              >
                <span style={{ fontSize: 14, fontWeight: "500", color: tabHistory === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="list-history">
          {listHistory && listHistory.length > 0
            ? listHistory.map((item, index) => (
                <div key={index} className="item-history">
                  <div style={{ width: "40%" }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: "400" }}>
                        Tên người xử lý: <span style={{ fontWeight: "500" }}>{item.employeeName}</span>
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: "400" }}>
                        Thời gian xử lý:{" "}
                        <span style={{ fontWeight: "500" }}>{item.processedTime ? moment(item.processedTime).format("DD/MM/YYYY") : ""}</span>
                      </span>
                    </div>
                  </div>
                  <div style={{ width: "40%" }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: "400" }}>
                        Bước xử lý: <span style={{ fontWeight: "500" }}>{item.nodeName}</span>
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: "400" }}>
                        Trạng thái:{" "}
                        <span
                          style={{
                            fontWeight: "500",
                            color: item.status === 1 ? "var(--primary-color)" : item.status === 2 ? "var(--success-color)" : "var(--error-color)",
                          }}
                        >
                          {item.status === 1 ? "Đang xử lý" : item.status === 2 ? "Đã xử lý" : "Từ chối xử lý"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>

      {/* {( (listNode && listNode.length > 0) || (listHistory && listHistory.length > 0 && (
        listHistory.filter(el => el.status === 2)?.length > 0)) ? null 
        :
        <div className="submit__form--signature">
          <div className="form-group">
            <TextArea
              fillColor={true}
              label="Ghi chú xử lý"
              value={valueNote}
              placeholder="Nhập ghi chú xử lý"
              onChange={(e) => setValueNote(e.target.value)}
            />
          </div>

          <div className="lst__action">
            {lstAction.map((item, idx) => {
              return (
                <Button
                  key={idx}
                  color={item.color as any}
                  onClick={() => {
                    handleSigned(item);
                    setDataAction(item);
                  }}
                  disabled={isSubmit}
                >
                  {item.name} 
                </Button>
              );
            })}
          </div>
        </div>
      )} */}
    </div>
  );
}

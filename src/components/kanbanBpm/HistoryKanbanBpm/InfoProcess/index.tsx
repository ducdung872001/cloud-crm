import Checkbox from "components/checkbox/checkbox";
import CheckboxList from "components/checkbox/checkboxList";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import RadioList from "components/radio/radioList";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import moment from "moment";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { convertToId, formatCurrency } from "reborn-util";
import "./index.scss";
import { Parser } from "formula-functionizer";
import { IOption } from "model/OtherModel";
import ObjectAttributeService from "services/ObjectAttributeService";
import { SelectOptionData } from "utils/selectCommon";
import { ContextType, UserContext } from "contexts/userContext";
import ObjectExtraInfoService from "services/ObjectExtraInfoService";
import WorkOrderService from "services/WorkOrderService";
import { showToast } from "utils/common";
import ListWork from "./ListWork/ListWork";
import ObjectInfo from "../ObjectInfo";

export default function InfoProcess(props: any) {
  const { data } = props;
  // console.log('data', data);

  const parser = new Parser();
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [detailObjectType, setDetailObjectType] = useState(null);

  useEffect(() => {
    if (data?.processedObject) {
      setDetailObjectType(data?.processedObject.groupId ? { value: data.processedObject.groupId, label: data.processedObject.groupName } : null);
    }
    setTab(1);
  }, [data]);

  const [objectExtraInfos, setObjectExtraInfos] = useState<any>([]);

  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [tab, setTab] = useState(1);
  const tabData = [
    {
      value: 1,
      label: "Thông tin đối tượng",
    },
    {
      value: 2,
      label: "Công việc cần xử lý",
    },
    {
      value: 3,
      label: "Thông tin hồ sơ",
    },
  ];

  //Người đại diện pháp luật
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [mapObjectAttribute, setMapObjectAttribute] = useState<any>(null);

  const getObjectAttributes = async (groupId) => {
    // if (!mapObjectAttribute || mapObjectAttribute.length === 0) {
    //   const response = await ObjectAttributeService.listAll(groupId);
    //   if (response.code === 0) {
    //     const dataOption = response.result;
    //     setMapObjectAttribute(dataOption || {});
    //   }
    // }
    const response = await ObjectAttributeService.listAll(groupId);
    if (response.code === 0) {
      const dataOption = response.result;
      setMapObjectAttribute(dataOption || {});
    }
  };

  const onSelectOpenEmployee = async (data?: any) => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId");
      // const dataOption = await SelectOptionData("employeeId", { branchId: dataBranch.value });
      if (dataOption) {
        // setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
        setListEmployee([...(dataOption.length > 0 ? (data ? [data, ...dataOption] : dataOption) : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  const onSelectOpenContract = async () => {
    if (!listContact || listContact.length === 0) {
      setIsLoadingContract(true);
      const dataOption = await SelectOptionData("contractId");
      if (dataOption) {
        setListContract([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingContract(false);
    }
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

  useEffect(() => {
    if (detailObjectType?.value) {
      getObjectAttributes(detailObjectType?.value);
    }

    if (data) {
      onSelectOpenEmployee();
      onSelectOpenContact();
      onSelectOpenContract();
      onSelectOpenCustomer();
    }
  }, [detailObjectType]);

  useEffect(() => {
    //Lấy thông tin objectExtraInfos
    if (data?.processedObject?.id && mapObjectAttribute) {
      getObjectExtraInfos(data?.processedObject?.id);
    }
  }, [data, mapObjectAttribute]);

  const getObjectExtraInfos = async (objectId) => {
    const response = await ObjectExtraInfoService.list(objectId);
    setObjectExtraInfos(response.code === 0 ? response.result : []);
  };

  const updateCustomerMultiselectAttribute = (attributeId, e) => {
    let attributeValue = e ? e.split(",") : [];
    updateCustomerAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const updateCustomerAttribute = (attributeId, attributeValue) => {
    let objectId = data?.id || 0;

    let found = false;
    (objectExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        item.objectId = objectId;
        found = true;
      }
    });

    if (!found) {
      let item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      item.objectId = objectId;
      objectExtraInfos[objectExtraInfos.length] = item;
    }

    setObjectExtraInfos([...objectExtraInfos]);
  };

  const getCustomerAttributeValue = (attributeId) => {
    let attributeValue = "";
    (objectExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return attributeValue;
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

  const handleChangeValueCustomerItemC = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueEmployeeItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueContactItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueContractItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  /**
   * Hiển thị giá trị theo công thức
   * @param attributes
   * @param isFormula
   */
  const getCustomerAttributeFormula = (attributes) => {
    let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attrObj = {};
    (objectExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        attrObj["customerAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });
    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  /**
   * Trả về loại control theo kiểu dữ liệu tương ứng
   */
  const getControlByType = (customerAttribute) => {
    let CustomControl = (
      <Input
        id={`Id${customerAttribute.id}`}
        label={customerAttribute.name}
        fill={true}
        value={getCustomerAttributeValue(customerAttribute.id)}
        onChange={(e) => updateCustomerAttribute(customerAttribute.id, e.target.value)}
        placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
        required={!!customerAttribute.required}
        disabled={true}
      />
    );

    switch (customerAttribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={customerAttribute.name}
            name={customerAttribute.name}
            value={getCustomerAttributeValue(customerAttribute.id)}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            fill={true}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            onChange={(e) => updateCustomerAttribute(customerAttribute.id, e.target.value)}
            maxLength={459}
            disabled={true}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={customerAttribute.name}
            name={customerAttribute.name}
            fill={true}
            required={!!customerAttribute.required}
            value={getCustomerAttributeValue(customerAttribute.id)}
            thousandSeparator={true}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            decimalScale={getDecimalScale(customerAttribute.attributes)}
            onChange={(e) => {
              const value = e.target.value;
              let valueNum = value?.replace(/,/g, "");
              updateCustomerAttribute(customerAttribute.id, valueNum);
            }}
            disabled={true}
          />
        );
        break;
      case "dropdown":
        CustomControl = (
          <SelectCustom
            name={customerAttribute.name}
            label={customerAttribute.name}
            fill={true}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            // error={validateFieldPipeline}
            // message="Loại hợp đồng không được bỏ trống"
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.value);
            }}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );
        break;
      case "multiselect":
        let attris = getCustomerAttributeValue(customerAttribute.id);
        CustomControl = (
          <CheckboxList
            title={customerAttribute.name}
            required={!!customerAttribute.required}
            disabled={!!customerAttribute.readonly}
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={attris ? JSON.parse(attris).join(",") : ""}
            onChange={(e) => {
              updateCustomerMultiselectAttribute(customerAttribute.id, e);
            }}
            disabled={true}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            checked={!!getCustomerAttributeValue(customerAttribute.id)}
            label={customerAttribute.name}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.target.checked);
            }}
            disabled={true}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={customerAttribute.name}
            title={customerAttribute.name}
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.target.value);
            }}
            disabled={true}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={customerAttribute.name}
            name={customerAttribute.name}
            fill={true}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
              updateCustomerAttribute(customerAttribute.id, newDate);
            }}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            iconPosition="left"
            icon={<Icon name="Calendar" />}
            isMaxDate={false}
            disabled={true}
            // error={validateFieldSignDate}
            // message={`Vui lòng chọn ngày ký`}
          />
        );
        break;
      case "lookup":
        let attrs = customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : {};

        //1. Trường hợp là customer (khách hàng)
        //2. Trường hợp là employee (nhân viên)
        //3. Trường hợp là contract (hợp đồng)
        //4. Trường hợp là contact (người liên hệ)
        switch (attrs?.refType) {
          case "customer":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItemC(e, customerAttribute)}
                disabled={true}
              />
            );
            break;
          case "employee":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listEmployee || []}
                onMenuOpen={onSelectOpenEmployee}
                isLoading={isLoadingEmployee}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueEmployeeItem(e, customerAttribute)}
                disabled={true}
              />
            );
            break;
          case "contract":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listContract || []}
                onMenuOpen={onSelectOpenContract}
                isLoading={isLoadingContract}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContractItem(e, customerAttribute)}
                disabled={true}
              />
            );
            break;
          case "contact":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listContact || []}
                onMenuOpen={onSelectOpenContact}
                isLoading={isLoadingContact}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContactItem(e, customerAttribute)}
                disabled={true}
              />
            );
            break;
          default:
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItemC(e, customerAttribute)}
                disabled={true}
              />
            );
        }
        break;
      case "formula":
        //Công thức được lấy từ trường động và trường tĩnh
        //{contract.dealValue + customerAttribute.xyz} => sẽ cần parser từ 2 đối tượng là contract và customerAttribute

        //Chỉ hiển thị chứ không lưu giá trị (nếu thêm mới thì không hiển thị?, sửa mới hiển thị)
        CustomControl = (
          <Input
            id={`Id${customerAttribute.id}`}
            label={customerAttribute.name}
            fill={true}
            value={getCustomerAttributeFormula(customerAttribute?.attributes)}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );
        break;
    }

    return CustomControl;
  };

  return (
    <div className="box__info-object">
      {/* <h3 className="namefs">{name}</h3>
      {lstData && (
        <table className="table__form-fs">
          <thead>
            <tr>
              {lstData.lstThead.map((item, idx) => {
                return (
                  <th key={idx} style={{ textAlign: `${item.type === "number" ? "right" : item.type === "select" ? "center" : "left"}` }}>
                    {item.name}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {lstData.lstTbody.map((item, idx) => {
              return (
                <tr key={idx}>
                  {item.map((el, index) => {
                    return (
                      <td key={index} style={{ textAlign: `${el.type === "number" ? "right" : el.type === "select" ? "center" : "left"}` }}>
                        {el.type === "number" ? formatCurrency(Object.values(el)[0], ",", "") : Object.values(el)[0]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )} */}
      <div style={{ display: "flex", marginBottom: "1.2rem" }}>
        {tabData.map((item, index) => (
          <div
            key={index}
            style={{
              borderBottom: tab === item.value ? "1px solid" : "",
              paddingLeft: 12,
              paddingRight: 12,
              paddingBottom: 3,
              cursor: "pointer",
            }}
            onClick={() => {
              setTab(item.value);
            }}
          >
            <span style={{ fontSize: 14, fontWeight: "500", color: tab === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {tab === 1 ? (
        <div className="list-form-group">
          <div className="form-group">
            <SelectCustom
              id="groupId"
              name="groupId"
              label="Chọn loại đối tượng"
              fill={true}
              required={true}
              disabled={true}
              options={[]}
              value={detailObjectType}
              isAsyncPaginate={true}
              placeholder="Chọn loại đối tượng"
            />
          </div>

          <div className="form-group">
            <Input
              label="Tên đối tượng"
              name="name"
              fill={true}
              required={true}
              value={data?.processedObject?.name || ""}
              placeholder="Tên đối tượng"
              disabled={true}
            />
          </div>

          {mapObjectAttribute ? (
            <div className="list__object--attribute">
              {Object.entries(mapObjectAttribute).map((lstEformAttribute: any, key: number) => (
                <Fragment key={key}>
                  {(lstEformAttribute[1] || []).map((eformAttribute, index: number) => (
                    <Fragment key={index}>
                      <div
                        // className={`form-group ${eformAttribute.name.length >= 38 || lstEformAttribute[1].length == 2 ? "special-case" : ""}`}
                        className={`form-group `}
                        id={`Field${convertToId(eformAttribute.name)}`}
                        key={`index_${key}_${index}`}
                      >
                        {getControlByType(eformAttribute)}
                      </div>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 2 ? (
        <div className="list-work-order">
          <ListWork data={data} />
        </div>
      ) : null}
      {tab === 3 ? (
        <div className="list-work-order">
          <ObjectInfo data={data} />
        </div>
      ) : null}
    </div>
  );
}

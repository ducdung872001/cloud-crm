import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import SelectCustom from "components/selectCustom/selectCustom";
import Icon from "components/icon";
import "./index.scss";
import Tippy from "@tippyjs/react";
import BusinessProcessService from "services/BusinessProcessService";
import Input from "components/input/input";
import DecisionTableInputService from "services/DecisionTableInputService";
import DecisionTableOutputService from "services/DecisionTableOutputService";

export default function Reference({ processId, dataBusinessRule, listMappingInput, setListMappingInput, listMappingOutput, setListMappingOutput }) {
  const extractKeysAndPaths = (components) => {
    const result = [];
    components.forEach((component) => {
      if (component.key) {
        result.push({
          value: component.key,
          label: `${component.key} ${
            component.type === "datetime"
              ? component.dateLabel
              : component.label
              ? ` - ${component.type === "datetime" ? component.dateLabel : component.label} `
              : ""
          }`,
        });
      }
      if (component.path) {
        if (component.type === "group") {
          component.components.map((el) => {
            result.push({
              value: `${component.path}.${el.key}`,
              label: `${component.path}.${el.key} ${el.label ? ` - ${el.label}` : ""}`,
            });
          });
        } else if (component.type === "dynamiclist") {
          result.push({
            value: `${component.path}`,
            label: `${component.path}${component.label ? ` - ${component.label}` : ""}`,
          });
          component.components.map((el) => {
            result.push({
              value: `${component.path}.${el.key}`,
              label: `${component.path}.${el.key} ${el.label ? ` - ${el.label}` : ""}`,
            });
          });
        } else {
          result.push({
            value: component.path,
            label: `${component.path} ${component.label ? ` - ${component.label}` : ""}`,
          });
        }
      }

      // Bỏ qua các thành phần 'components' bên trong
      if (component.components) {
        if (component.type === "group") {
          component.components.map((el) => {
            result.push({
              value: `${component.type}.${el.key}`,
              label: `${component.type}.${el.key} ${el.label ? ` - ${el.label}` : ""}`,
            });
          });
        } else {
          return;
        }
      } else {
        if (component.type === "iframe") {
          if (component?.properties) {
            result.push({
              value: `${component.type}${component?.properties?.name ? `.${component.properties.name}` : ""}`,
              label: `${component.type}${component?.properties?.name ? `.${component.properties.name}` : ""} ${
                component.label ? ` - ${component.label}` : ""
              }`,
            });
          }
        }
      }
    });

    return result;
  };

  const dataTab = [
    {
      value: "input",
      label: "Dữ liệu đầu vào nghiệp vụ",
    },
    {
      value: "output",
      label: "Dữ liệu đầu ra nghiệp vụ",
    },
  ];
  const [tabMapping, setTabMapping] = useState("input");

  const [formData, setFormData] = useState({
    mappingType: 1,
    ruleField: "",
    ruleFieldName: "",
    mappingField: "",
    mappingFieldName: "",
  });

  const handleChangeValueMapping = (e) => {
    setFormData({
      ...formData,
      mappingField: e.value,
      mappingFieldName: e.label,
    });
  };

  const handleChangeValueRule = (e) => {
    setFormData({
      ...formData,
      ruleField: e.value,
      ruleFieldName: e.label,
    });
  };

  const loadedOptionAttribute = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
      processId: processId,
    };
    const response = await BusinessProcessService.listVariableDeclare(params);

    if (response.code === 0) {
      const dataOption = response.result?.items;
      let listVar = [];
      dataOption &&
        dataOption.length > 0 &&
        dataOption.map((item) => {
          const body = (item.body && JSON.parse(item.body)) || [];
          body.map((el) => {
            listVar.push({
              value: `var_${item.name}.${el.name}`,
              label: `var_${item.name}.${el.name}`,
              nodeId: item.nodeId,
            });
          });
        });

      return {
        options: [
          ...(listVar.length > 0
            ? listVar.map((item) => {
                return {
                  isDisabled: formData?.mappingType === 2 ? listMappingOutput.some((el) => el.mappingField === item.value) : false,
                  value: item.value,
                  label: item.label,
                  nodeId: item.nodeId,
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

  const loadedOptionForm = async (search, loadedOptions, { page }) => {
    const params = {
      code: search,
      page: page,
      limit: 10,
      processId: processId,
    };
    const response = await BusinessProcessService.listBpmForm(params);

    if (response.code === 0) {
      const dataOption = response.result || [];

      let listForm = [];
      dataOption &&
        dataOption.length > 0 &&
        dataOption.map((item) => {
          const components =
            (item.config && JSON.parse(item.config) && JSON.parse(item.config).components && JSON.parse(item.config).components) || [];
          const result = extractKeysAndPaths(components) || [];
          result?.map((el) => {
            listForm.push({
              value: `frm_${item.code}.${el.value}`,
              label: `frm_${item.code}.${el.label}`,
              nodeId: item.nodeId,
            });
          });
        });

      return {
        options: [
          ...(listForm.length > 0
            ? listForm.map((item) => {
                return {
                  value: item.value,
                  label: item.label,
                  nodeId: item.nodeId,
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

  const loadedOptionInput = async (search, loadedOptions, { page }) => {
    const params = {
      code: search,
      page: page,
      limit: 10,
      businessRuleId: dataBusinessRule?.id,
    };
    const response = await DecisionTableInputService.list(params);

    if (response.code === 0) {
      const dataOption = response.result?.items || [];
      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  isDisabled: listMappingInput.some((el) => el.ruleField === item.code),
                  value: item.code,
                  label: item.code + " - " + item.name,
                  id: item.id,
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

  const loadedOptionOutput = async (search, loadedOptions, { page }) => {
    const params = {
      code: search,
      page: page,
      limit: 10,
      businessRuleId: dataBusinessRule?.id,
    };
    const response = await DecisionTableOutputService.list(params);

    if (response.code === 0) {
      const dataOption = response.result?.items || [];

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  isDisabled: listMappingOutput.some((el) => el.ruleField === item.code),
                  value: item.code,
                  label: item.code + " - " + item.name,
                  id: item.id,
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

  const formatOptionLabelCustomer = ({ label, isDisabled }) => {
    return (
      <div className="selected--item">
        <div style={isDisabled ? { color: "#757070" } : {}}>{label}</div>
      </div>
    );
  };

  return (
    <div className="form-reference">
      <h4>Dữ liệu vào/ra nghiệp vụ tham chiếu</h4>
      <div className="list-form-reference">
        <div style={{ display: "flex", marginBottom: "1.2rem" }}>
          {dataTab &&
            dataTab.map((item, index) => (
              <div
                key={index}
                style={{
                  borderBottom: tabMapping === item.value ? "1px solid" : "",
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingBottom: 3,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setTabMapping(item.value);
                  setFormData({
                    mappingType: item.value == "output" ? 2 : 1,
                    ruleField: "",
                    ruleFieldName: "",
                    mappingField: "",
                    mappingFieldName: "",
                  });
                }}
              >
                <span style={{ fontSize: 14, fontWeight: "500", color: tabMapping === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
              </div>
            ))}
        </div>

        <div className="container-mapping">
          {tabMapping === "input" ? (
            <div className="form-group">
              <SelectCustom
                key={tabMapping + "_" + dataBusinessRule?.id + listMappingInput?.length}
                label={""}
                id="fieldName"
                name="fieldName"
                options={[]}
                fill={true}
                value={formData.ruleField ? { value: formData.ruleField, label: formData.ruleFieldName } : null}
                special={true}
                required={true}
                onChange={(e) => handleChangeValueRule(e)}
                isAsyncPaginate={true}
                isFormatOptionLabel={true}
                placeholder="Chọn trường nghiệp vụ"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadedOptionInput}
                formatOptionLabel={formatOptionLabelCustomer}
              />
            </div>
          ) : null}

          {tabMapping === "output" ? (
            <div className="form-group">
              <SelectCustom
                key={tabMapping + "_" + dataBusinessRule?.id + listMappingOutput?.length}
                label={""}
                id="fieldName"
                name="fieldName"
                options={[]}
                fill={true}
                value={formData.ruleField ? { value: formData.ruleField, label: formData.ruleFieldName } : null}
                special={true}
                required={true}
                onChange={(e) => handleChangeValueRule(e)}
                isAsyncPaginate={true}
                isFormatOptionLabel={false}
                placeholder="Chọn trường nghiệp vụ"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadedOptionOutput}
              />
            </div>
          ) : null}

          <div className="form-group">
            <div className={"container-select-mapping"}>
              {formData.mappingType == 0 ? (
                <div className="input-text">
                  <Input
                    name="fielName"
                    fill={false}
                    value={formData.mappingField}
                    onChange={(e) => {
                      setFormData({ ...formData, mappingField: e.target.value });
                    }}
                    placeholder={`Nhập giá trị`}
                  />
                </div>
              ) : (
                <div className="select-mapping">
                  <SelectCustom
                    key={formData?.mappingType + "_" + tabMapping + "_" + listMappingOutput?.length}
                    id="fielName"
                    name="fielName"
                    label=""
                    options={[]}
                    fill={false}
                    value={formData.mappingField ? { value: formData.mappingField, label: formData.mappingFieldName } : null}
                    special={true}
                    required={true}
                    onChange={(e) => handleChangeValueMapping(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={formData?.mappingType === 2 ? true : false}
                    placeholder={formData.mappingType === 2 ? "Chọn biến" : "Chọn trường trong form"}
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={formData?.mappingType === 2 ? loadedOptionAttribute : loadedOptionForm}
                    formatOptionLabel={formatOptionLabelCustomer}
                  />
                </div>
              )}

              {tabMapping == "input" ? (
                <Tippy
                  content={
                    formData.mappingType === 0
                      ? "Chuyển chọn trường trong form"
                      : formData.mappingType === 1
                      ? "Chuyển chọn biến"
                      : "Chuyển nhập giá trị"
                  }
                >
                  <div
                    className={"icon-change-select"}
                    onClick={(e) => {
                      setFormData({
                        ...formData,
                        mappingType: formData.mappingType === 0 ? 1 : formData.mappingType === 1 ? 2 : 0,
                        mappingField: "",
                        mappingFieldName: "",
                      });
                    }}
                  >
                    <Icon name="ResetPassword" style={{ width: 18 }} />
                  </div>
                </Tippy>
              ) : null}
            </div>
          </div>

          <div className={"action-children"}>
            <Tippy content={"Thêm mapping"}>
              <div
                className={`${formData.ruleField && formData.mappingField ? "icon-unchecked" : "icon-checked"}`}
                onClick={(e) => {
                  if (formData.ruleField && formData.mappingField) {
                    if (tabMapping === "input") {
                      let newList = [...listMappingInput, formData];
                      setListMappingInput(newList);
                      setFormData({
                        mappingType: 1, // 0: input, 1: frm, 2: var
                        ruleField: "",
                        ruleFieldName: "",
                        mappingField: "",
                        mappingFieldName: "",
                      });
                    } else {
                      let newList = [...listMappingOutput, formData];
                      setListMappingOutput(newList);
                      setFormData({
                        mappingType: 2, // 0: input, 1: frm, 2: var
                        ruleField: "",
                        ruleFieldName: "",
                        mappingField: "",
                        mappingFieldName: "",
                      });
                    }
                  }
                }}
              >
                <Icon name="Plus" style={{ width: 18 }} />
              </div>
            </Tippy>
          </div>
        </div>
        {tabMapping === "input" ? (
          <div>
            {listMappingInput && listMappingInput.length > 0
              ? listMappingInput.map((item, index) => (
                  <div key={index} className="container-mapping-show">
                    <div className="form-group">
                      <Input
                        fill={true}
                        name="ruleFieldName"
                        label={index == 0 ? "Trường nghiệp vụ" : ""}
                        value={item.ruleFieldName || item.ruleField}
                        readOnly={true}
                        onChange={(e) => {}}
                        placeholder=""
                      />
                    </div>

                    <div className="form-group">
                      <Input
                        fill={true}
                        name="mappingFieldName"
                        label={index == 0 ? "Trường mapping" : ""}
                        value={item.mappingFieldName || item.mappingField}
                        readOnly={true}
                        onChange={(e) => {}}
                        placeholder=""
                      />
                    </div>

                    <div className={"action-children"}>
                      <Tippy content="Xóa">
                        <div
                          className="action-children-item action-children-delete"
                          onClick={(e) => {
                            let newList = [...listMappingInput];
                            newList.splice(index, 1);
                            setListMappingInput(newList);
                          }}
                        >
                          <Icon name="Trash" />
                        </div>
                      </Tippy>
                    </div>
                  </div>
                ))
              : null}
          </div>
        ) : (
          <div>
            {listMappingOutput && listMappingOutput.length > 0
              ? listMappingOutput.map((item, index) => (
                  <div key={index} className="container-mapping-show">
                    <div className="form-group">
                      <Input
                        fill={true}
                        name="ruleFieldName"
                        label={index == 0 ? "Trường nghiệp vụ" : ""}
                        value={item.ruleFieldName || item.ruleField}
                        readOnly={true}
                        onChange={(e) => {}}
                        placeholder=""
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        fill={true}
                        name="mappingFieldName"
                        label={index == 0 ? "Biến mapping" : ""}
                        value={item.mappingFieldName || item.mappingField}
                        readOnly={true}
                        onChange={(e) => {}}
                        placeholder=""
                      />
                    </div>

                    <div className={"action-children"}>
                      <Tippy content="Xóa">
                        <div
                          className="action-children-item action-children-delete"
                          onClick={(e) => {
                            let newList = [...listMappingOutput];
                            newList.splice(index, 1);
                            setListMappingOutput(newList);
                          }}
                        >
                          <Icon name="Trash" />
                        </div>
                      </Tippy>
                    </div>
                  </div>
                ))
              : null}
          </div>
        )}
      </div>
    </div>
  );
}

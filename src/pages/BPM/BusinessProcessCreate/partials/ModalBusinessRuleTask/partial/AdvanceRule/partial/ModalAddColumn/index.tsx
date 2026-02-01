import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";

import "./index.scss";

import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import BusinessProcessService from "services/BusinessProcessService";
import { set } from "lodash";
import { showToast } from "utils/common";

export default function ModalAddColumn({ onShow, onHide, dataNode, processId, setListColumn, listKeyColumn, dataColumn, columnIndex = -1 }) {
  const isEdit = columnIndex >= 0 && dataColumn;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [addFieldAttributes, setAddFieldAttributes] = useState<any[]>([{ value: "", label: "" }]);

  const [formData, setFormData] = useState({
    name: "",
    key: "",
    keyType: 0,
    compareType: "equal",
    type: "text",
    columnType: "condition",
    children: [],
    options: [],
  });

  const [valueKey, setValueKey] = useState<any>(null);

  useEffect(() => {
    if (onShow && dataColumn) {
      setFormData({
        name: dataColumn.name || "",
        key: dataColumn.key || "",
        keyType: dataColumn.keyType ?? 0,
        compareType: dataColumn.compareType || "equal",
        type: dataColumn.type || "text",
        columnType: dataColumn.columnType || "condition",
        children: dataColumn.children || [],
        options: dataColumn.options || [],
      });
      if (dataColumn.type === "select" || dataColumn.type === "radio" || dataColumn.type === "multiselect") {
        setAddFieldAttributes(
          dataColumn.options && dataColumn.options.length > 0
            ? dataColumn.options.map((opt) => ({ value: opt.value ?? opt, label: opt.label ?? opt }))
            : [{ value: "", label: "" }]
        );
      } else {
        setAddFieldAttributes([{ value: "", label: "" }]);
      }
      setValueKey(dataColumn.key ? { value: dataColumn.key, label: dataColumn.key } : null);
    }
  }, [onShow, dataColumn]);

  const listKeyColumnExcludeCurrent = isEdit && dataColumn?.key ? listKeyColumn.filter((k) => k !== dataColumn.key) : listKeyColumn;

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
              clearForm(false);
            },
          },
          {
            title: isEdit ? "Cập nhật" : "Thêm cột",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
            callback: async () => {
              if (listKeyColumnExcludeCurrent.includes(formData.key)) {
                showToast("Biến đã được khai báo ở cột khác", "error");
                return;
              }
              const newColumn = {
                key: formData.key,
                name: formData.name,
                type: formData.type,
                columnType: formData.columnType,
                compareType: formData.compareType,
                options: formData.type === "select" || formData.type === "radio" || formData.type === "multiselect" ? addFieldAttributes : [],
                children:
                  formData.compareType === "range"
                    ? [
                        { key: "min", name: "min", type: formData.type, value: 0 },
                        { key: "max", name: "max", type: formData.type, value: 0 },
                      ]
                    : [],
              };
              if (isEdit && columnIndex >= 0) {
                setListColumn((prev) => {
                  const newList = [...prev];
                  newList[columnIndex] = newColumn;
                  return newList;
                });
              } else {
                setListColumn((prev) => {
                  const newList = [...prev];
                  const numberColumnCondition = prev.filter((column) => column.columnType === "condition").length;
                  if (numberColumnCondition === 0) {
                    const lastConditionIndex = newList.findLastIndex((column) => column.columnType === "stt");
                    newList.splice(lastConditionIndex + 1, 0, newColumn);
                    return newList;
                  } else {
                    const lastConditionIndex = newList.findLastIndex((column) => column.columnType === "condition");
                    newList.splice(lastConditionIndex + 1, 0, newColumn);
                    return newList;
                  }
                });
              }
              clearForm(true);
            },
          },
        ],
      },
    }),
    [formData, isSubmit, setListColumn, addFieldAttributes, isEdit, columnIndex, listKeyColumnExcludeCurrent]
  );

  const clearForm = (acc) => {
    onHide(acc);
    setFormData({
      name: "",
      key: "",
      keyType: 0,
      compareType: "equal",
      type: "text",
      columnType: "condition",
      children: [],
      options: [],
    });
    setValueKey(null);
    setAddFieldAttributes([{ value: "", label: "" }]);
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
      const dataOption = response.result?.filter((el) => el.code) || [];
      let listForm = [];
      dataOption &&
        dataOption.length > 0 &&
        dataOption.map((item) => {
          const components =
            (item.config && JSON.parse(item.config) && JSON.parse(item.config).components && JSON.parse(item.config).components) || [];
          components.map((el) => {
            if (el.key || el.path) {
              listForm.push({
                value: `frm_${item.code}.${el.key || el.path}`,
                label: `frm_${item.code}.${el.key || el.path}`,
                nodeId: item.nodeId,
                datatype: el.type || null,
              });
            } else {
              if (el.type === "group") {
                el.components.map((il) => {
                  if (il.key || il.path) {
                    listForm.push({
                      value: `frm_${item.code}.${el.type}.${il.key || il.path}`,
                      label: `frm_${item.code}.${el.type}.${il.key || il.path}`,
                      nodeId: item.nodeId,
                      datatype: il.type || null,
                    });
                  } else {
                    if (il.type === "group") {
                      il.components.map((ol) => {
                        if (ol.key || ol.path) {
                          listForm.push({
                            value: `frm_${item.code}.${el.type}.${il.type}.${ol.key || ol.path}`,
                            label: `frm_${item.code}.${el.type}.${il.type}.${ol.key || ol.path}`,
                            nodeId: item.nodeId,
                            datatype: ol.type || null,
                          });
                        } else {
                          if (ol.type === "group") {
                          }
                        }
                      });
                    }

                    if (il.type === "iframe") {
                      listForm.push({
                        value: `frm_${item.code}.${el.type}.${il.type}`,
                        label: `frm_${item.code}.${el.type}.${il.type}`,
                        nodeId: item.nodeId,
                        datatype: el.type || null,
                      });
                    }
                  }
                });
              }

              if (el.type === "iframe") {
                listForm.push({
                  value: `frm_${item.code}.${el.type}.${el.properties?.name}`,
                  label: `frm_${item.code}.${el.type}.${el.properties?.name}`,
                  nodeId: item.nodeId,
                  datatype: el.type || null,
                });
              }
            }
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

  //! đoạn này xử lý vấn đề lấy nhãn của attribute khi thêm nhiều
  const handleChangeLabelAttributeItem = (e, idx) => {
    const value = e.target.value;

    setAddFieldAttributes((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, label: value };
        }
        return obj;
      })
    );
  };

  //! đoạn này xử lý vấn đề lấy giá trị của attribute khi thêm nhiều
  const handleChangeValueAttributeItem = (e, idx) => {
    const value = e.target.value;

    setAddFieldAttributes((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, value: value };
        }
        return obj;
      })
    );
  };

  //! xóa đi 1 item attribute
  const handleRemoveItemAttribute = (idx) => {
    const result = [...addFieldAttributes];
    result.splice(idx, 1);

    setAddFieldAttributes(result);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-add-column-decision"
      >
        <div className="form-mapping">
          <div className="container-header">
            <div className="box-title">
              <h4>{isEdit ? "Chỉnh sửa cột điều kiện" : "Thêm cột điều kiện"}</h4>
            </div>
          </div>
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <Input
                  name={"name"}
                  label={`Tên cột`}
                  fill={true}
                  value={formData.name}
                  required={true}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                  }}
                  placeholder={`Nhập tên cột`}
                />
              </div>
              <div className="form-group">
                <div className="input-key">
                  <label>
                    Chọn biến <span>*</span>
                  </label>
                  <div className={"container-select-mapping"}>
                    {formData.keyType == 1 ? (
                      <div className="input-text">
                        <Input
                          name={"key"}
                          fill={false}
                          value={formData.key}
                          error={listKeyColumnExcludeCurrent.includes(formData.key)}
                          message="Biến đã được khai báo trong cột khác"
                          disabled={false}
                          onChange={(e) => {
                            setFormData({ ...formData, key: e.target.value });
                          }}
                          placeholder={`Nhập giá trị`}
                        />
                      </div>
                    ) : (
                      <div className="select-mapping">
                        <SelectCustom
                          key={"key"}
                          id="key"
                          className="select"
                          fill={false}
                          required={false}
                          options={[]}
                          value={valueKey}
                          error={listKeyColumnExcludeCurrent.includes(formData.key)}
                          message="Biến đã được khai báo trong cột khác"
                          isAsyncPaginate={true}
                          isFormatOptionLabel={false}
                          placeholder={formData.keyType === 2 ? "Chọn biến" : "Chọn trường trong form"}
                          additional={{
                            page: 1,
                          }}
                          loadOptionsPaginate={formData.keyType === 2 ? loadedOptionAttribute : loadedOptionForm}
                          onChange={(e) => {
                            setFormData({ ...formData, key: e.value });
                            setValueKey(e);
                          }}
                        />
                      </div>
                    )}

                    <Tippy
                      content={
                        formData.keyType === 0 ? "Chuyển chọn trường trong form" : formData.keyType === 1 ? "Chuyển chọn biến" : "Chuyển nhập giá trị"
                      }
                    >
                      <div
                        className={"icon-change-select"}
                        onClick={(e) => {
                          setFormData({
                            ...formData,
                            key: "",
                            keyType: formData.keyType === 0 ? 1 : formData.keyType === 1 ? 2 : 0,
                          });
                          setValueKey(null);
                        }}
                      >
                        <Icon name="ResetPassword" style={{ width: 18 }} />
                      </div>
                    </Tippy>
                  </div>
                </div>
              </div>
              <div className="form-group-full">
                <SelectCustom
                  key={"compareType"}
                  id="compareType"
                  label={`Kiểu điều kiện`}
                  className="compareType"
                  fill={true}
                  required={true}
                  options={[
                    { value: "equal", label: "So sánh bằng : Variables = value OR Variables != value" },
                    {
                      value: "range",
                      label: "So sánh trong khoảng : min <= Variables <= max OR min <= Variables OR Variables <= max",
                    },
                    { value: "in", label: "Nằm trong nhóm : Variables in value[] OR Variables not_in value[]" },
                  ]}
                  value={formData.compareType}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      compareType: e.value,
                      type: e.value === "range" ? "number" : formData.type,
                      children:
                        e.value === "range"
                          ? [
                              { key: "min", name: "min", type: "number", value: 0 },
                              { key: "max", name: "max", type: "number", value: 0 },
                            ]
                          : [],
                    });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder={`Chọn kiểu điều kiện`}
                />
              </div>
              {formData.compareType === "equal" || formData.compareType === "range" ? (
                <div className="form-group">
                  <SelectCustom
                    key={"type"}
                    id="type"
                    label={`Kiểu dữ liệu so sánh`}
                    className="type"
                    fill={true}
                    required={true}
                    options={
                      formData.compareType === "range"
                        ? [
                            { value: "number", label: "Number (Khoảng số)" },
                            { value: "date", label: "Date (Khoảng ngày)" },
                          ]
                        : [
                            { value: "text", label: "Text" },
                            { value: "number", label: "Number" },
                            { value: "date", label: "Date" },
                            {
                              value: "select",
                              label: "Dropdown",
                            },
                          ]
                    }
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        type: e.value,
                        children:
                          formData.compareType === "range"
                            ? [
                                { key: "min", name: "min", type: e.value, value: 0 },
                                { key: "max", name: "max", type: e.value, value: 0 },
                              ]
                            : [],
                        options: e.value === "select" || e.value === "radio" || e.value === "multiselect" ? [{ value: "", label: "" }] : [],
                      });
                    }}
                    isAsyncPaginate={false}
                    isFormatOptionLabel={false}
                    placeholder={`Chọn kiểu dữ liệu so sánh`}
                  />
                </div>
              ) : null}{" "}
              {/* Trường hợp là dropdown hoặc radio hoặc multiselect */}
              {formData?.type == "select" || formData?.type == "radio" || formData?.type == "multiselect" ? (
                <div className="form-group-full">
                  <div className="list__attribute">
                    <div>
                      <span style={{ fontSize: 14, fontWeight: "700" }}>Lựa chọn</span>
                    </div>
                    {addFieldAttributes.map((item, idx) => {
                      return (
                        <div key={idx} className="attribute__item">
                          <div className="list-field-attribute">
                            <div className="form-group">
                              <Input
                                // label={idx == 0 ? 'Lựa chọn' : ''}
                                fill={true}
                                required={true}
                                value={item.label}
                                placeholder="Nhập nhãn"
                                onChange={(e) => handleChangeLabelAttributeItem(e, idx)}
                              />
                            </div>
                            <div className="form-group">
                              <Input
                                // label={idx == 0 ? 'Lựa chọn' : ''}
                                fill={true}
                                required={true}
                                value={item.value}
                                placeholder="Nhập giá trị"
                                onChange={(e) => handleChangeValueAttributeItem(e, idx)}
                              />
                            </div>
                          </div>
                          {idx == 0 ? (
                            <span className="add-attribute">
                              <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                <span
                                  className="icon-add"
                                  onClick={() => {
                                    setAddFieldAttributes([...addFieldAttributes, { value: "", label: "" }]);
                                  }}
                                >
                                  <Icon name="PlusCircleFill" />
                                </span>
                              </Tippy>
                            </span>
                          ) : (
                            <span className="remove-attribute">
                              <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                <span className="icon-remove" onClick={() => handleRemoveItemAttribute(idx)}>
                                  <Icon name="Trash" />
                                </span>
                              </Tippy>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

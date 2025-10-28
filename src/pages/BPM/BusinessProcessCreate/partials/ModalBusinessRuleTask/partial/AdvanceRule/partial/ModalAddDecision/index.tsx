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
import { convertToId } from "reborn-util";
import { showToast } from "utils/common";

export default function ModalAddDecision({ onShow, onHide, setListColumn, listKeyColumn }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [addFieldAttributes, setAddFieldAttributes] = useState<any[]>([{ value: "", label: "" }]);
  const [listAttribute, setListAttribute] = useState([
    {
      name: "",
      type: null,
      key: "",
      value: "",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    key: "",
    keyType: 0,
    decisionType: "text",
    type: "text",
    columnType: "decision",
    children: [],
    options: [],
  });

  function hasDuplicateKeys(listAttribute: { key: string }[]): boolean {
    const keySet = new Set<string>();

    for (const item of listAttribute) {
      if (keySet.has(item.key)) {
        return true; // Có phần tử trùng lặp
      }
      keySet.add(item.key);
    }

    return false; // Không có phần tử trùng lặp
  }

  function hasEmptyFields(listAttribute: { key?: string; name?: string; type?: any }[]): boolean {
    console.log("listAttribute", listAttribute);

    return listAttribute.some((item) => !item.key?.trim() || !item.name?.trim() || !item.type?.value.trim());
  }

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
            title: "Thêm cột",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
            callback: async () => {
              if (listKeyColumn.includes(formData.key)) {
                showToast("Cột đã tồn tại", "error");
                return;
              }
              if (hasEmptyFields(listAttribute) && formData.decisionType === "object") {
                showToast("Trường, Tên trường, Kiểu dữ liệu trường không được để trống", "error");
                return;
              }
              if (hasDuplicateKeys(listAttribute) && formData.decisionType === "object") {
                showToast("Trường không được trùng nhau", "error");
                return;
              }
              setListColumn((prev) => {
                const newColumn = {
                  key: formData.key,
                  name: formData.name,
                  type: formData.type,
                  columnType: formData.columnType,
                  decisionType: formData.decisionType,
                  options: formData.type === "select" || formData.type === "radio" || formData.type === "multiselect" ? addFieldAttributes : [], // Chỉ thêm options nếu type là select, radio hoặc multiselect
                  children:
                    formData.decisionType === "object" && listAttribute.length > 0
                      ? listAttribute.map((item) => ({
                          key: item.key,
                          name: item.name,
                          type: item.type.value || "text",
                          value: item.value,
                        }))
                      : [],
                };
                return [...prev, newColumn];
              });
              clearForm(true);
            },
          },
        ],
      },
    }),
    [formData, isSubmit, setListColumn, listAttribute, listKeyColumn]
  );

  const clearForm = (acc) => {
    onHide(acc);
    setFormData({
      name: "",
      key: "",
      keyType: 0,
      decisionType: "text",
      type: "text",
      columnType: "decision",
      children: [],
      options: [],
    });
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

  const [valueKey, setValueKey] = useState<any>(null);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-add-decision-rule"
      >
        <div className="form-mapping">
          <div className="container-header">
            <div className="box-title">
              <h4>{"Thêm cột kết quả"}</h4>
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
                  error={listKeyColumn.includes(formData.key)}
                  message={"Cột đã tồn tại"}
                  required={true}
                  onChange={(e) => {
                    let key = convertToId(e.target.value) || "";
                    key = key.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");
                    const value = key.charAt(0).toLowerCase() + key.slice(1);
                    setFormData({ ...formData, name: e.target.value, key: value });
                  }}
                  placeholder={`Nhập tên cột`}
                />
              </div>
              <div className="form-group">
                <SelectCustom
                  key={"type"}
                  id="type"
                  label={`Kiểu dữ liệu kết quả`}
                  className="type"
                  fill={true}
                  required={true}
                  options={[
                    { value: "text", label: "Text" },
                    { value: "number", label: "Number" },
                    { value: "date", label: "Date" },
                    // {
                    //   value: "select",
                    //   label: "Dropdown",
                    // },
                    { value: "object", label: "Object" },
                  ]}
                  value={formData.decisionType}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      decisionType: e.value,
                      type: e.value,
                      options: e.value === "select" || e.value === "radio" || e.value === "multiselect" ? [{ value: "", label: "" }] : [],
                    });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder={`Chọn kiểu dữ liệu so sánh`}
                />
              </div>
              {formData.decisionType === "object" ? (
                <div className="form-group-full">
                  <div className="list-attribute">
                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: "600" }}>Trường dữ liệu</span>
                    </div>
                    {listAttribute && listAttribute.length > 0
                      ? listAttribute.map((item, index) => (
                          <div key={index} className="item-attribute">
                            <div className="box-attribute">
                              <div className="name-attribute">
                                <Input
                                  id="key"
                                  name="key"
                                  // label={index === 0 ? "Tên trường" : ''}
                                  fill={true}
                                  required={true}
                                  placeholder={"Nhập trường (viết liền không dấu)"}
                                  value={item.key}
                                  onChange={(e) => {
                                    // const value = (e.target.value);
                                    let fieldName = convertToId(e.target.value) || "";
                                    fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");
                                    const value = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
                                    setListAttribute((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, key: value };
                                        }
                                        return obj;
                                      })
                                    );
                                  }}
                                />
                              </div>
                              <div className="type-attribute">
                                <SelectCustom
                                  id="type"
                                  name="type"
                                  // label={index === 0 ? "Kiểu dữ liệu" : ""}
                                  fill={true}
                                  special={true}
                                  required={true}
                                  options={[
                                    { value: "text", label: "Text" },
                                    { value: "number", label: "Number" },
                                    { value: "date", label: "Date" },
                                  ]}
                                  value={item.type}
                                  onChange={(e) => {
                                    setListAttribute((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, type: e };
                                        }
                                        return obj;
                                      })
                                    );
                                  }}
                                  isAsyncPaginate={false}
                                  isFormatOptionLabel={false}
                                  placeholder="Chọn kiểu dữ liệu"
                                  // additional={{
                                  //   page: 1,
                                  // }}
                                  // loadOptionsPaginate={loadedOptionWorkflow}
                                />
                              </div>
                              <div className="desc-attribute">
                                <Input
                                  id="name"
                                  name="name"
                                  // label={index === 0 ? "Mô tả" : ""}
                                  fill={true}
                                  required={true}
                                  placeholder={"Nhập tên trường"}
                                  value={item.name}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setListAttribute((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, name: value };
                                        }
                                        return obj;
                                      })
                                    );
                                  }}
                                />
                              </div>

                              <div className="desc-attribute">
                                <Input
                                  id="value"
                                  name="value"
                                  // label={index === 0 ? "Mô tả" : ""}
                                  fill={true}
                                  required={true}
                                  placeholder={"Nhập giá trị mặc định"}
                                  value={item.value}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setListAttribute((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, value: value };
                                        }
                                        return obj;
                                      })
                                    );
                                  }}
                                />
                              </div>
                            </div>

                            <div className="button">
                              <span
                                className="add-button"
                                // style={ dataHeaderHTTP.length > 1 ? {} : {marginRight: 5}}
                              >
                                <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                  <span
                                    className="icon-add"
                                    onClick={() => {
                                      setListAttribute([...listAttribute, { key: "", type: null, name: "", value: "" }]);
                                    }}
                                  >
                                    <Icon name="PlusCircleFill" />
                                  </span>
                                </Tippy>
                              </span>

                              {listAttribute.length > 1 ? (
                                <span className="remove-button">
                                  <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                    <span
                                      className="icon-remove"
                                      onClick={() => {
                                        const data = [...listAttribute];
                                        data.splice(index, 1);
                                        setListAttribute(data);
                                      }}
                                    >
                                      <Icon name="Trash" />
                                    </span>
                                  </Tippy>
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ))
                      : null}
                  </div>
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

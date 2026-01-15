import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Tippy from "@tippyjs/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import { IActionModal } from "model/OtherModel";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";
import { getField } from "utils/common";
import { showToast } from "utils/common";
import { useOnClickOutside } from "utils/hookCustom";

import "./AddTemplateQuote.scss";

export default function AddTemplateQuote({ onShow, onHide, data }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [hasAddField, setHasAddField] = useState<boolean>(false);

  const [lstField, setLstField] = useState([]);
  const [dataField, setDataField] = useState(null);

  const refOption = useRef();
  const refOptionContainer = useRef();

  const [lstFieldChooseFormula, setLstFieldChooseFormula] = useState([]);
  const [isShowFieldChoose, setIsShowFieldChoose] = useState<boolean>(false);

  useOnClickOutside(refOption, () => setIsShowFieldChoose(false), ["choose__formula"]);

  const handLstSheetField = async (data: any) => {
    const params = {
      sheetId: data.id,
    };

    const response = await SheetFieldQuoteFormService.lst(params);

    if (response.code === 0) {
      const result = response.result.items;
      setLstField(result);
      setLstFieldChooseFormula(() => {
        return result
          .filter((el) => el.type == "number")
          .map((item) => {
            return {
              name: item.name,
              code: item.code,
            };
          });
      });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  useEffect(() => {
    if (onShow && data) {
      handLstSheetField(data);
    }
  }, [onShow, data]);

  const defaultFormData = useMemo(
    () => ({
      name: dataField?.name ?? "",
      code: dataField?.code ?? "",
      type: dataField?.type ?? "",
      formula: dataField?.formula ?? "",
      position: dataField?.position ?? 0,
      options: dataField?.options ? JSON.parse(dataField.options) : [],
    }),
    [dataField, hasAddField]
  );

  const defaultValueLstOption = {
    value: "",
    label: "",
  };

  const lstTypeField = [
    {
      value: "text",
      label: "Text",
    },
    {
      value: "number",
      label: "Number",
    },
    {
      value: "select",
      label: "Select",
    },
  ];

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    setFormData(defaultFormData);
  }, [defaultFormData]);

  const handleChangeValueName = (e) => {
    const value = e.target.value;

    setFormData({ ...formData, name: value, code: getField(value) });
  };

  const handleChangeValueCode = (e) => {
    const value = e.target.value;

    setFormData({ ...formData, code: getField(value) });
  };

  const handleChangeValueType = (e) => {
    const value = e.value;

    if (value == "select") {
      setFormData({ ...formData, type: value, options: [defaultValueLstOption] });
    } else {
      setFormData({ ...formData, type: value, options: [] });
    }
  };

  const handleChangeValueFormula = (e) => {
    const value = e.target.value;

    setFormData({ ...formData, formula: value });
  };

  const inputRef = useRef(null);
  const cursorPositionRef = useRef(null);

  const handleClickField = (itemCode) => {
    const input = inputRef.current;
    const cursorPosition = input.selectionStart;
    cursorPositionRef.current = cursorPosition + itemCode.length;

    const value = formData.formula;
    const newValue = value.slice(0, cursorPosition) + itemCode + value.slice(cursorPosition);

    setFormData({ ...formData, formula: newValue });
  };

  useEffect(() => {
    if (cursorPositionRef.current !== null) {
      const input = inputRef.current;
      const newCursorPosition = cursorPositionRef.current;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
      cursorPositionRef.current = null;
    }
  }, [formData]);

  const handleChangeValueOption = (e, idx) => {
    const value = e.target.value;

    setFormData({
      ...formData,
      options: formData.options.map((item, index) => {
        if (index === idx) {
          return {
            ...item,
            value: value,
          };
        }

        return item;
      }),
    });
  };

  const handleChangeLabelOption = (e, idx) => {
    const value = e.target.value;

    setFormData({
      ...formData,
      options: formData.options.map((item, index) => {
        if (index === idx) {
          return {
            ...item,
            label: value,
          };
        }

        return item;
      }),
    });
  };

  const handleDeleteOption = (idx) => {
    const newData = [...formData.options];
    newData.splice(idx, 1);

    setFormData({ ...formData, options: newData });
  };

  const [isDeleteField, setIsDeleteField] = useState<boolean>(false);

  const handleDeleteField = async (id: number) => {
    if (!id) return;

    setIsDeleteField(true);

    const response = await SheetFieldQuoteFormService.delete(id);

    if (response.code === 0) {
      showToast("Xóa trường dữ liệu thành công", "success");
      handLstSheetField(data);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsDeleteField(false);
  };

  const handleAddEditField = async (dataProps) => {
    if (!dataProps) return;
    setIsSubmit(true);

    const body = {
      ...formData,
      sheetId: data?.id,
      options: JSON.stringify(formData.options),
      ...(dataField ? { id: dataField?.id } : {}),
    };

    const response = await SheetFieldQuoteFormService.update(body);

    if (response.code === 0) {
      setHasAddField(false);
      setFormData(defaultFormData);
      handLstSheetField(data);
      showToast(`${dataField ? "Chỉnh sửa" : "Thêm mới"} trường dữ liệu thành công.`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsSubmit(false);
  };

  //TODO: thay đổi vị trí các trường
  const handleUpdatePosition = async (body) => {
    if (!body) return;

    const response = await SheetFieldQuoteFormService.updatePostion(body);

    if (response.code === 0) {
      handLstSheetField(data);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    const reorderedForm = [...lstField];
    const [movedItem] = reorderedForm.splice(source.index, 1);
    reorderedForm.splice(destination.index, 0, movedItem);

    //! biến này tạo ra với mục đích lấy cột cuối muốn kéo thả đến
    const dragItem = reorderedForm[+destination.index];

    const body = {
      id: dragItem.id,
      position: destination.index,
    };

    handleUpdatePosition(body);

    setLstField(reorderedForm);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: hasAddField ? "Quay lại" : "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              if (hasAddField) {
                setHasAddField(false);
                setDataField(null);
              } else {
                onHide(false);
              }
            },
          },
          ...(hasAddField
            ? ([
                {
                  title: dataField ? "Cập nhật" : "Tạo mới",
                  color: "primary",
                  disabled: isSubmit || !formData.name || !formData.code || !formData.type,
                  is_loading: isSubmit,
                  callback: () => {
                    handleAddEditField(formData);
                  },
                },
              ] as any[])
            : []),
        ],
      },
    }),
    [isSubmit, hasAddField, dataField, formData]
  );

  const isOverLength = formData.name.length > 300;
  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-template-quote"
      >
        <ModalHeader title={`Cấu hình trường dữ liệu`} toggle={() => !isSubmit && onHide(false)} />
        <ModalBody>
          <div className="wrapper__lst__add--field">
            {hasAddField ? (
              <div className="info__field--config">
                <div className="form-group">
                  <Input
                    name="name"
                    label="Tên trường thông tin"
                    value={formData.name}
                    fill={true}
                    required={true}
                    placeholder="Nhập tên trường thông tin"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={isOverLength}
                    message="Không được nhập quá 300 ký tự"
                  />
                </div>

                <div className="merge-form">
                  <div className="form-group">
                    <Input
                      name="code"
                      label="Mã trường thông tin"
                      value={formData.code}
                      fill={true}
                      required={true}
                      placeholder="Nhập mã trường thông tin"
                      onChange={(e) => handleChangeValueCode(e)}
                    />
                  </div>
                  <div className="form-group">
                    <SelectCustom
                      name="type"
                      label="Kiểu dữ liệu"
                      value={formData.type}
                      options={lstTypeField}
                      fill={true}
                      required={true}
                      placeholder="Chọn kiểu dữ liệu"
                      onChange={(e) => handleChangeValueType(e)}
                    />
                  </div>
                </div>

                {formData && formData.type === "select" && (
                  <div className="box__data--select">
                    <span className="name-lst">Danh sách lựa chọn</span>

                    <div className="lst__data">
                      {formData.options.map((item, idx) => {
                        return (
                          <div key={idx} className="item-data">
                            <div className="info__data">
                              <div className="form-group">
                                <Input
                                  name="value"
                                  value={item.value}
                                  fill={true}
                                  onChange={(e) => handleChangeValueOption(e, idx)}
                                  placeholder="Nhập key"
                                />
                              </div>
                              <div className="form-group">
                                <Input
                                  name="label"
                                  value={item.label}
                                  fill={true}
                                  onChange={(e) => handleChangeLabelOption(e, idx)}
                                  placeholder="Nhập value"
                                />
                              </div>
                            </div>
                            <div className="action-data">
                              <span
                                className="action-data--item action-data--add"
                                onClick={() => setFormData({ ...formData, options: [...formData.options, defaultValueLstOption] })}
                              >
                                <Icon name="PlusCircleFill" />
                              </span>
                              {formData.options.length > 1 && (
                                <span className="action-data--item action-data--delete" onClick={() => handleDeleteOption(idx)}>
                                  <Icon name="Trash" />
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="form-group form-special">
                  <Input
                    name="formula"
                    label="Công thức trường thông tin"
                    value={formData.formula}
                    fill={true}
                    refInput={inputRef}
                    placeholder="Nhập công thức trường thông tin"
                    onChange={(e) => handleChangeValueFormula(e)}
                  />

                  <div className="choose__formula" ref={refOptionContainer}>
                    <Tippy content="Chọn trường">
                      <span
                        style={lstFieldChooseFormula && lstFieldChooseFormula.length === 0 ? { cursor: "no-drop" } : {}}
                        className="name__choose"
                        onClick={() => {
                          lstFieldChooseFormula && lstFieldChooseFormula.length > 0 && setIsShowFieldChoose(!isShowFieldChoose);
                        }}
                      >
                        <Icon name="CaretDown" />
                      </span>
                    </Tippy>

                    {isShowFieldChoose && (
                      <div className="lst-field-choose-formula" ref={refOption}>
                        <span className="suggested__formula">Chọn các trường dữ liệu</span>

                        <div className="lst__formula">
                          {lstFieldChooseFormula.map((item, idx) => {
                            return (
                              <span
                                key={idx}
                                className="name-formula"
                                onClick={() => {
                                  setIsShowFieldChoose(false);
                                  handleClickField(item.code);
                                }}
                              >
                                {`${item.name} - ${item.code}`}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="box__lst--field">
                <span className="title-name">Danh sách các trường dữ liệu</span>

                <div className="lst__field--data">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="your-droppable-id">
                      {(provided) => (
                        <div
                          className="lst-data"
                          style={lstField && lstField.length === 0 ? { padding: "0rem" } : {}}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {lstField.map((item, idx) => {
                            return (
                              <Draggable key={idx} draggableId={`${idx}`} index={idx}>
                                {(provided) => (
                                  <div className="item__data" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                    <span className="name-data">{item.name}</span>
                                    <div className="action-data">
                                      <span
                                        className="action-data--item action-data--edit"
                                        onClick={() => {
                                          setHasAddField(true);
                                          setDataField(item);
                                        }}
                                      >
                                        <Icon name="Pencil" />
                                      </span>
                                      <span
                                        className="action-data--item action-data--delete"
                                        onClick={() => {
                                          handleDeleteField(item.id);
                                          setDataField(item);
                                        }}
                                      >
                                        {isDeleteField && dataField && dataField.id === item.id ? <Icon name="Loading" /> : <Icon name="Trash" />}
                                      </span>
                                      <Tippy content="Kéo thay đổi vị trí" placement="left">
                                        <span className="action-data--item action-data--change">
                                          <Icon name="FingerTouch" />
                                        </span>
                                      </Tippy>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  <div
                    className="item__data item__data--add"
                    onClick={() => {
                      setDataField(null);
                      setHasAddField(true);
                      setFormData(defaultFormData);
                    }}
                  >
                    <Icon name="PlusCircleFill" /> Thêm mới trường dữ liệu
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
    </Fragment>
  );
}

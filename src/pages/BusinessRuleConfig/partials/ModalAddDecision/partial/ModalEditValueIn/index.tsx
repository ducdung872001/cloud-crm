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

export default function ModalEditValueIn({ onShow, onHide, dataFieldEdit, setInputs, setOutputs }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [addFieldAttributes, setAddFieldAttributes] = useState<any[]>([""]);

  useEffect(() => {
    if (onShow) {
      if (dataFieldEdit?.value) {
        if (Array.isArray(dataFieldEdit?.value)) {
          setAddFieldAttributes(dataFieldEdit?.value);
        } else {
          setAddFieldAttributes([dataFieldEdit?.value]);
        }
      }
    }
  }, [onShow]);

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
            title: "Áp dụng",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
            callback: async () => {
              if (dataFieldEdit.type === "input") {
                setInputs((current) => {
                  const result = [...current];
                  let dataNew = [];
                  addFieldAttributes.forEach((item) => {
                    if (item.trim() !== "") {
                      dataNew.push(item);
                    }
                  });
                  result[dataFieldEdit.index].value = dataNew;
                  return result;
                });
              }
              if (dataFieldEdit.type === "output") {
                setOutputs((current) => {
                  const result = [...current];
                  let dataNew = [];
                  addFieldAttributes.forEach((item) => {
                    if (item.trim() !== "") {
                      dataNew.push(item);
                    }
                  });
                  result[dataFieldEdit.index].value = dataNew;
                  return result;
                });
              }
              clearForm(true);
            },
          },
        ],
      },
    }),
    [isSubmit, addFieldAttributes]
  );

  const clearForm = (acc) => {
    onHide(acc);
    setAddFieldAttributes([""]);
  };

  const handleChangeValueAttributeItem = (e, idx) => {
    const value = e.target.value;

    setAddFieldAttributes((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return value;
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
        size="sm"
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-edit-value-in"
      >
        <div className="form-mapping">
          <div className="container-header">
            <div className="box-title">
              <h4>{"Sửa danh sách giá trị"}</h4>
            </div>
          </div>
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group-full">
                <div className="list__attribute">
                  {addFieldAttributes.map((item, idx) => {
                    return (
                      <div key={idx} className="attribute__item">
                        <div className="list-field-attribute">
                          <div className="form-group">
                            <Input
                              fill={true}
                              required={true}
                              value={item}
                              placeholder="Nhập giá trị"
                              onChange={(e) => handleChangeValueAttributeItem(e, idx)}
                            />
                          </div>
                        </div>
                        <span className="remove-attribute">
                          <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                            <span
                              className="icon-remove"
                              onClick={() => {
                                handleRemoveItemAttribute(idx);
                              }}
                            >
                              <Icon name="Trash" />
                            </span>
                          </Tippy>
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="add-value"
                  onClick={() => {
                    setAddFieldAttributes([...addFieldAttributes, ""]);
                  }}
                >
                  <span className="add-attribute">
                    <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                      <span className="icon-add">
                        <Icon name="PlusCircleFill" />
                      </span>
                    </Tippy>
                  </span>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

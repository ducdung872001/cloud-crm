import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import "./CallApiModal.scss";
import MarketingAutomationService from "services/MarketingAutomationService";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Input from "components/input/input";
import _ from "lodash";
import Radio from "components/radio/radio";
import NummericInput from "components/input/numericInput";
import Button from "components/button/button";

export default function CallApiModal(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, dataNode, setDataNode, statusMA } = props;
  //   console.log('dataNode', dataNode);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [nodeName, setNodeName] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (dataNode?.name) {
      setNodeName(dataNode.name);
    }

    if (dataNode?.configData) {
      setData(dataNode?.configData);
    }
  }, [dataNode]);

  const dataTab = [
    {
      value: 1,
      label: "Đối tác Reborn",
    },
    {
      value: 2,
      label: "Đối tác ngoài Reborn",
    },
  ];

  const values = useMemo(
    () =>
      ({
        option: data?.option ?? 1,
        partnerCode: data?.partnerCode ?? "",
        linkApi: data?.linkApi ?? "",
      } as any),
    [onShow, data]
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

  const onSubmit = async () => {
    // e.preventDefault();

    // const errors = Validate(validations, formData, listField);

    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    setIsSubmit(true);

    const config = {
      option: formData.values?.option,
      partnerCode: formData.values?.partnerCode,
      linkApi: formData.values?.linkApi,
    };

    if (config.option === 1 && !config.partnerCode) {
      showToast("Vui lòng nhập mã đối tác", "error");
      return;
    }

    if (config.option === 2 && !config.linkApi) {
      showToast("Vui lòng nhập link API", "error");
      return;
    }

    const body: any = {
      ...dataNode,
      configData: config,
    };

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật hành động thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setData(null);
    setEditName(true);
    setNodeName(null);

    setIsTest(false);
    setAttributeData([
      {
        name: "name",
        value: "",
      },
      {
        name: "phone",
        value: "",
      },
    ]);
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
              !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
            // type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !nodeName ||
              statusMA === 1 ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
              if (_.isEqual(nodeName, dataNode?.name)) {
                onSubmit();
              } else {
                onHide(true);
                setEditName(true);
              }
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, nodeName, dataNode, statusMA]
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
        setShowDialog(false);
        setContentDialog(null);
        handClearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [editName, setEditName] = useState(true);

  const changeNodeName = async () => {
    if (!nodeName) {
      showToast("Vui lòng nhập tên hành động", "error");
      return;
    }

    const config = {
      option: formData.values?.option,
      partnerCode: formData.values?.partnerCode,
      linkApi: formData.values?.linkApi,
    };

    if (config.option === 1 && !config.partnerCode) {
      showToast("Vui lòng nhập mã đối tác", "error");
      return;
    }

    if (config.option === 2 && !config.linkApi) {
      showToast("Vui lòng nhập link API", "error");
      return;
    }

    const body: any = {
      ...dataNode,
      name: nodeName,
      configData: config,
    };

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật hành động thành công`, "success");
      onHide("not_close");
      setEditName(true);
      setDataNode({ ...dataNode, name: nodeName });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handleChangeOption = (value) => {
    console.log("value", value);

    if (value === 1) {
      setIsTest(false);
      setAttributeData([
        {
          name: "name",
          value: "",
        },
        {
          name: "phone",
          value: "",
        },
      ]);
      setFormData({ ...formData, values: { ...formData.values, option: value, linkApi: "" } });
    }
    if (value === 2) {
      setFormData({ ...formData, values: { ...formData.values, option: value, partnerCode: "" } });
    }
  };

  const [isTest, setIsTest] = useState(false);
  const [attributeData, setAttributeData] = useState([
    {
      name: "name",
      value: "",
    },
    {
      name: "phone",
      value: "",
    },
  ]);

  console.log("attributeData", attributeData);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-call-api"
        // size="lg"
      >
        <form className="form-call-api">
          <ModalHeader title={dataNode?.name} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="container-call-api">
              <div className="container-name">
                <div className="box-name">
                  <span className="name-group">Tên hành động</span>
                  <Tippy content="Đổi tên hành động">
                    <div
                      onClick={() => {
                        if (statusMA !== 1) {
                          setEditName(false);
                        }
                      }}
                    >
                      <Icon
                        name="Pencil"
                        style={{
                          width: 18,
                          height: 18,
                          fill: statusMA === 1 ? "var(--extra-color-20)" : "#015aa4",
                          cursor: "pointer",
                          marginBottom: 3,
                        }}
                      />
                    </div>
                  </Tippy>
                </div>

                <div className="edit-name">
                  <div style={{ flex: 1 }}>
                    <Input
                      name="search_field"
                      value={nodeName}
                      fill={true}
                      iconPosition="right"
                      disabled={editName}
                      onBlur={() => {
                        if (!_.isEqual(nodeName, dataNode?.name)) {
                          changeNodeName();
                        } else {
                          setEditName(true);
                        }
                      }}
                      // icon={<Icon name="Times" />}
                      // iconClickEvent={() => {
                      //   setEditName(false);
                      //   setNodeName(dataNode?.name)
                      // }}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNodeName(value);
                      }}
                      placeholder="Nhập tên điều kiện"
                    />
                  </div>
                </div>
              </div>
              <div className="list-form-group-call-api">
                <div className="header_option">
                  {dataTab.map((item, index) => (
                    <div key={index} className="item_option">
                      <Radio
                        value={item.value}
                        label={item.label}
                        onChange={(e) => {
                          const value = +e.target.value;
                          handleChangeOption(value);
                        }}
                        checked={item.value === formData.values?.option}
                      />
                    </div>
                  ))}
                </div>

                <div className="body_option">
                  {formData?.values?.option === 1 && (
                    <div>
                      <Input
                        name="partner_code"
                        label={"Mã đối tác"}
                        required={true}
                        value={formData.values?.partnerCode}
                        fill={true}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, values: { ...formData.values, partnerCode: value } });
                        }}
                        placeholder="Nhập mã đối tác"
                      />
                    </div>
                  )}

                  {formData?.values?.option === 2 && (
                    <div className="option_2">
                      <div>
                        <Input
                          name="link_api"
                          label={"Link API"}
                          required={true}
                          value={formData.values?.linkApi}
                          fill={true}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, values: { ...formData.values, linkApi: value } });
                          }}
                          placeholder="Nhập link api"
                        />
                      </div>

                      {!isTest && (
                        <div style={{ justifyContent: "flex-end", display: "flex" }}>
                          <div className="button_test" onClick={() => setIsTest(true)}>
                            <span style={{ fontSize: 14, fontWeight: "500" }}>Test API</span>
                          </div>
                        </div>
                      )}

                      {isTest && (
                        <div>
                          <div className="container_body">
                            {attributeData.map((item, index) => (
                              <div key={index} className="box_attribute">
                                <div className="box_title">
                                  <span style={{ fontSize: 14 }}>{item.name}</span>
                                </div>
                                <span style={{ fontSize: 14, marginLeft: 5, marginRight: 5 }}>:</span>
                                <div className="value">
                                  {item.name !== "phone" ? (
                                    <Input
                                      // name="link_api"
                                      // label={'Link API'}
                                      required={true}
                                      value={item.value}
                                      fill={true}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setAttributeData((current) =>
                                          current.map((obj, i) => {
                                            if (i === index) {
                                              return { ...obj, value: value };
                                            }
                                            return obj;
                                          })
                                        );
                                      }}
                                      placeholder={`Nhập ${item.name}`}
                                    />
                                  ) : (
                                    <NummericInput
                                      // name="link_api"
                                      // label={'Link API'}
                                      required={true}
                                      value={item.value}
                                      fill={true}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setAttributeData((current) =>
                                          current.map((obj, i) => {
                                            if (i === index) {
                                              return { ...obj, value: value };
                                            }
                                            return obj;
                                          })
                                        );
                                      }}
                                      placeholder={`Nhập ${item.name}`}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="container_result">
                            <div className="title">
                              <span style={{ fontSize: 16, fontWeight: "600" }}>JSON</span>
                            </div>

                            <div className="body">
                              <div>
                                <span style={{ fontSize: 14 }}>{"{"}</span>
                              </div>

                              <div className="body_content">
                                {attributeData.map((item, index) => (
                                  <div key={index} className="item_content">
                                    <div className="name">
                                      <span style={{ fontSize: 14 }}>{`"${item.name}"`}:</span>
                                    </div>

                                    <div className="value">
                                      <span style={{ fontSize: 14 }}>{`"${item.value}"`},</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div>
                                <span style={{ fontSize: 14 }}>{"}"}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="button_footer">
                              <div>
                                <Button
                                  variant="outline"
                                  onClick={(e) => {
                                    setIsTest(false);
                                    setAttributeData([
                                      {
                                        name: "name",
                                        value: "",
                                      },
                                      {
                                        name: "phone",
                                        value: "",
                                      },
                                    ]);
                                    setFormData({ ...formData, values: { ...formData.values, linkApi: "" } });
                                  }}
                                >
                                  Huỷ Test
                                </Button>
                              </div>
                              <div>
                                <Button
                                  onClick={(e) => {
                                    // setShowModalConfigKpi(true);
                                  }}
                                >
                                  Test API
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* {listField.map((field, index) => (
                    <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                    formData={formData}
                    />
                ))} */}
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}

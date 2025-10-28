import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IEmailRequest } from "model/email/EmailRequestModel";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { showToast } from "utils/common";
import { convertParamsToString, createArrayFromTo, createArrayFromToR, isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import "./ConfigModalPeople.scss";
import moment from "moment";
import Input from "components/input/input";
import Icon from "components/icon";
import Button from "components/button/button";
import Tippy from "@tippyjs/react";
import CampaignService from "services/CampaignService";
import MarketingAutomationService from "services/MarketingAutomationService";
import _ from "lodash";
import ContractEformService from "services/ContractEformService";
import BusinessProcessService from "services/BusinessProcessService";
import SelectCustom from "components/selectCustom/selectCustom";

export default function ConfigModalPeople(props: any) {
  const { onShow, onHide, dataNode, setDataNode, statusMA } = props;
  //console.log("dataNode", dataNode);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);
  const [nodeName, setNodeName] = useState(null);
  const [nodePoint, setNodePoint] = useState(null);

  useEffect(() => {
    if (dataNode?.name) {
      setNodeName(dataNode.name);
    }
    if (dataNode?.point) {
      setNodePoint(dataNode.point);
    }
  }, [dataNode]);

  const capitalizeFirstLetter = (str) => {
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
  };

  const [lstFieldEform, setFieldEform] = useState([]);

  const [lstFieldFilter, setLstFieldFilter] = useState([]);

  const handGetCustomerAttributes = async () => {
    const response = await CustomerService.customerAttributes();

    if (response.code === 0) {
      const result = response.result.items;
      const changeDataResult = result.map((item) => {
        return {
          name: capitalizeFirstLetter(item.title),
          fieldName: item.name,
          type: item.name === "birthday" ? "" : item.source ? "select" : item.type === "string" ? "text" : item.type,
          dataType: item.name === "birthday" ? "" : item.type,
          options:
            item.source === "data"
              ? [...item.data].map((el) => {
                  return {
                    value: el.id,
                    label: el.name,
                  };
                })
              : [],
          source: item.source === "api" ? item.path : "",
        };
      });

      setLstFieldFilter([...lstFieldFilter, ...changeDataResult]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow) {
      handGetCustomerAttributes();
    }
  }, [onShow]);

  useEffect(() => {
    if (dataNode?.configData && onShow) {
      const configData = dataNode.configData;
      // if(configData?.action){
      setData({
        action: configData?.action?.rule || [],
        conditionContact: configData?.action?.blockRule || [],
        logicalCondition: configData?.action?.logical || "and",
        rule: configData?.customer?.rule || [],
        blockRule: configData?.customer?.blockRule || [],
        logical: configData?.customer?.logical || "and",
      });
      // }
    } else {
      setData(null);
    }
  }, [dataNode, onShow]);

  const [isShowField, setIsShowField] = useState<boolean>(false);
  const [isShowFieldEform, setIsShowFieldEform] = useState<boolean>(false);

  const [idxFieldBlock, setIdxFieldBlock] = useState<number>(null);
  const [isShowFieldBlock, setIsShowFieldBlock] = useState<boolean>(false);

  const [idxFieldChildrenBlock, setIdxFieldChildrenBlock] = useState<number>(null);
  const [isShowFieldChildrenBlock, setIsShowFieldChildrenBlock] = useState<boolean>(false);

  const refOptionField = useRef();
  const refOptionFieldContainer = useRef();

  const refBlockOptionField = useRef();
  const refBlockOptionFieldContainer = useRef();

  const refChildrenBlockOptionField = useRef();
  const refChildrenBlockOptionFieldContainer = useRef();

  useOnClickOutside(refOptionField, () => setIsShowField(false), ["lst__option--group"]);

  useOnClickOutside(refBlockOptionField, () => setIsShowFieldBlock(false), ["lst__option--group"]);

  useOnClickOutside(refChildrenBlockOptionField, () => setIsShowFieldChildrenBlock(false), ["lst__option--group"]);

  const [changeDataProps, setChangeDataProps] = useState(null);

  useEffect(() => {
    if (!onShow) {
      setChangeDataProps(null);
    }
  }, [onShow]);

  const values = useMemo(
    () =>
      ({
        logicalCondition: data ? data.logicalCondition : "and",
        conditionContact: data ? data.conditionContact : [],
        action: data ? data.action : [],

        logical: data ? data.logical : "and",
        dataEform: null,
        listEformAttribute: [],
        rule: data ? data.rule : [],
        blockRule: data ? data.blockRule : [],
      } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const transformData = (data) => {
    if (Array.isArray(data)) {
      return data.map(transformData);
    } else if (typeof data === "object") {
      const result = {};
      for (const key in data) {
        if (key === "options" || key === "source") {
          continue; // Loại bỏ các trường "options" và "source"
        }

        if (key === "rule" && data[key].length > 0) {
          result[key] = data[key].map((rule) => {
            if (rule.operator === "in" && rule.value !== undefined) {
              if (rule.type === "date") {
                rule.value = JSON.stringify([moment(rule.value).format("DD/MM/YYYY")]);
              } else {
                rule.value = JSON.stringify([rule.value]);
              }
            } else if (rule.type === "date") {
              // && typeof rule.value === "string"
              rule.value = moment(rule.value).format("DD/MM/YYYY");
            }

            return transformData(rule);
          });
        } else if (key === "blockRule" && data[key].length > 0) {
          result[key] = data[key].map((block) => transformData(block));
        } else {
          result[key] = transformData(data[key]);
        }
      }
      return result;
    } else {
      return data;
    }
  };

  // Thực hiện gửi email
  const onSubmit = async (formData) => {
    // e.preventDefault();

    // setIsSubmit(true);
    const configDataNew = {
      action: {
        rule: formData.action,
        logical: formData.logicalCondition,
        blockRule: formData.conditionContact,
      },
      customer: {
        rule: formData.rule,
        logical: formData.logical,
        blockRule: formData.blockRule,
      },
    };

    console.log("configDataNew", configDataNew);

    // if(!_.isEqual(nodeName, dataNode?.name)){
    //   if(!nodeName){
    //     showToast("Vui lòng nhập tên điều kiện", "error");
    //     return;
    //   }
    // }

    const body: IEmailRequest = {
      ...dataNode,
      ...(!_.isEqual(nodeName, dataNode?.name) ? { name: nodeName } : {}),
      configData: configDataNew,
      point: nodePoint,
    };

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật điều kiện Email thành công`, "success");
      onHide(true);
      setEditName(true);
      setNodePoint(null);
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
              handleClearForm();
              // !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
            // type: "submit",
            color: "primary",
            disabled: isSubmit || !nodeName || statusMA === 1,
            is_loading: isSubmit,
            callback: () => {
              if (_.isEqual(nodeName, dataNode?.name)) {
                onSubmit(formData);
              } else {
                onHide(true);
                setEditName(true);
                setTimeout(() => {
                  setNodePoint(null);
                }, 1000);
              }
            },
          },
        ],
      },
    }),
    [isSubmit, nodeName, dataNode, formData, nodePoint, statusMA]
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
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [listActionEmail, setListActionEmail] = useState([]);

  const loadedOptionEmailAction = async (search, loadedOptions, { page }) => {
    const param: any = {
      type: "email",
    };
    const response = await CampaignService.listActionScore(param);
    if (response.code === 0) {
      const dataOption = response.result;
      setListActionEmail(dataOption);

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  code: item.code,
                  actionLevels: item.actionLevels,
                };
              })
            : []),
        ],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const [editName, setEditName] = useState(true);
  const handleClearForm = () => {
    onHide(false);
    setEditName(true);
    setNodeName(null);
    setNodePoint(null);
  };

  const changeNodeName = async () => {
    const configDataNew = {
      action: {
        rule: formData.action,
        logical: formData.logicalCondition,
        blockRule: formData.conditionContact,
      },
      customer: {
        rule: formData.rule,
        logical: formData.logical,
        blockRule: formData.blockRule,
      },
    };

    if (!nodeName) {
      showToast("Vui lòng nhập tên điều kiện", "error");
      return;
    }
    const body: IEmailRequest = {
      ...dataNode,
      name: nodeName,
      configData: configDataNew,
      point: nodePoint,
    };

    const response = await BusinessProcessService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật điều kiện thành công`, "success");
      onHide("not_close");
      setEditName(true);
      setDataNode({ ...dataNode, name: nodeName });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const [listPeople, setListPeople] = useState([
    {
      action_next: 1,
      participant: [
        {
          name: "Trung Nguyen",
          department: "Giám đốc",
        },
      ],
    },
  ]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-people"
        size="full"
      >
        <form className="form-modal-people">
          <div className="container-header">
            {editName ? (
              <div className="box-title">
                <h4>{nodeName || ""}</h4>
                <Tippy content="Đổi tên điều kiện">
                  <div
                    onClick={() => {
                      //edit name ngược true và false
                      setEditName(false);
                    }}
                  >
                    <Icon name="Pencil" style={{ width: 18, height: 18, fill: "#015aa4", cursor: "pointer", marginBottom: 3 }} />
                  </div>
                </Tippy>
              </div>
            ) : (
              <div className="edit-name">
                <div style={{ flex: 1 }}>
                  <Input
                    name="search_field"
                    value={nodeName}
                    fill={true}
                    iconPosition="right"
                    icon={<Icon name="Times" />}
                    // onBlur={() => {
                    //   setEditName(false);
                    //   setNodeName(dataNode?.name)
                    // }}
                    iconClickEvent={() => {
                      //edit name ngược true và false
                      setEditName(true);
                      setNodeName(dataNode?.name);
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNodeName(value);
                    }}
                    placeholder="Nhập tên điều kiện"
                  />
                </div>
                <div
                  className={_.isEqual(nodeName, dataNode?.name) || !nodeName ? "button-save-inactive" : "button-save-active"}
                  onClick={() => {
                    if (!_.isEqual(nodeName, dataNode?.name)) {
                      changeNodeName();
                    }
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: "500" }}>Lưu</span>
                </div>
              </div>
            )}
            <Button onClick={() => !isSubmit && handleClearForm()} type="button" className="btn-close" color="transparent" onlyIcon={true}>
              <Icon name="Times" />
            </Button>
          </div>

          <ModalBody>
            <div className="container-people">
              <div className="box-people">
                <div className="title-people">
                  <span style={{ fontSize: 16, fontWeight: "600" }}>Danh sách bước xử lý</span>
                  <Tippy content="Thêm bước">
                    <div>
                      <Button
                        color="success"
                        className="icon__add"
                        onClick={(e) => {
                          // e.preventDefault();
                          // setFormData({ ...formData, blockRule: [...formData.blockRule, defaultBlockRule] });
                        }}
                      >
                        <Icon name="PlusCircleFill" />
                      </Button>
                    </div>
                  </Tippy>
                </div>
                <div className="item-people">
                  <div className="action-next">
                    <Button
                      color={formData.logical === "and" ? "primary" : "secondary"}
                      onClick={(e) => {
                        // e.preventDefault();
                        // setFormData({ ...formData, logical: "and" });
                      }}
                    >
                      AND
                    </Button>
                    <Button
                      color={formData.logical === "or" ? "primary" : "secondary"}
                      onClick={(e) => {
                        // e.preventDefault();
                        // setFormData({ ...formData, logical: "or" });
                      }}
                    >
                      OR
                    </Button>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <SelectCustom
                      id="participant"
                      name="participant"
                      special={true}
                      fill={true}
                      // value={ item.item?.id ? {value: item.item?.code, label: item.item?.code} : null}
                      options={[]}
                      // onChange={(e) => handleChangeCodeService(e, idx)}
                      isAsyncPaginate={true}
                      placeholder="Chọn nhân viên xử lý"
                      additional={{
                        page: 1,
                      }}
                      // loadOptionsPaginate={loadedOptionCodeService}
                    />
                  </div>
                </div>
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

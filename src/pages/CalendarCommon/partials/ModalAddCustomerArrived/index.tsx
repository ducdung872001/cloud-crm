import React, { Fragment, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import TextArea from "components/textarea/textarea";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import ApprovalService from "services/ApprovalService";
import { showToast } from "utils/common";

import "./index.scss";
import BusinessProcessService from "services/BusinessProcessService";
import ObjectGroupService from "services/ObjectGroupService";
import Input from "components/input/input";
import Icon from "components/icon";
import ScheduleTreatmentService from "services/ScheduleTreatmentService";
import { is } from "bpmn-js/lib/util/ModelUtil";

interface IAddSignerFSAndQuoteProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data?: any;
}

export default function ModalAddCustomerArrived(props: IAddSignerFSAndQuoteProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [listDataVar, setListDataVar] = useState([
    { key: "customer", fields: [{ k: "customerId", v: "", readonly: true }] },
    { key: "service", fields: [{ k: "serviceId", v: "", readonly: true }] },
  ]);

  useEffect(() => {
    if (onShow && data && data?.processId) {
      setValueProcess({ value: data?.processId, label: data?.processName })
    }
  }, [onShow, data])

  useEffect(() => {
    let mounted = true;
    const fetchDetail = async (id) => {
      try {
        const res = await ScheduleTreatmentService.detail(id);
        if (!mounted) return;
        if (res?.code === 0 && res.result) {
          const item = res.result;

          setFormData((prev) => ({ ...prev, ...item }));

          // extract customerId and serviceId from response (services may be stringified or in lstService)
          const customerIdFromRes = item?.customerId ?? undefined;
          let serviceIdFromRes: any = undefined;
          try {
            if (item?.serviceId) {
              serviceIdFromRes = item.serviceId;
            } else if (item?.services) {
              const servicesParsed = typeof item.services === "string" ? JSON.parse(item.services) : item.services;
              if (Array.isArray(servicesParsed) && servicesParsed.length) serviceIdFromRes = servicesParsed[0].id ?? servicesParsed[0].serviceId ?? servicesParsed[0];
            } else if (Array.isArray(item?.lstService) && item.lstService.length) {
              serviceIdFromRes = item.lstService[0].id ?? item.lstService[0].serviceId ?? item.lstService[0];
            }
          } catch (e) {
            serviceIdFromRes = undefined;
          }

          if (!item?.processor) {
            setListDataVar([
              { key: "customer", fields: [{ k: "customerId", v: String(customerIdFromRes ?? ""), readonly: true }] },
              { key: "service", fields: [{ k: "serviceId", v: String(serviceIdFromRes ?? ""), readonly: true }] },
            ]);
          }

          if (item.processor) {
            try {
              const p = typeof item.processor === "string" ? JSON.parse(item.processor) : item.processor;

              if (p?.processId) {
                setFormData((prev) => ({ ...prev, processId: p.processId }));
              }

              if (p?.potName) {
                setFormData((prev) => ({ ...prev, potName: p.potName }));
              }

              if (p?.startNodeId) {
                setValueNode({ value: p.startNodeId, label: p.startNodeId });
                setFormData((prev) => ({ ...prev, startNodeId: p.startNodeId }));
              }

              if (p?.groupId) {
                setFormData((prev) => ({ ...prev, groupId: p.groupId }));
              }

              if (p?.lstVar) {
                let lst = p.lstVar;
                try {
                  if (typeof lst === "string") lst = JSON.parse(lst);
                } catch (e) {
                }
                setFormData((prev) => ({ ...prev, lstVar: lst }));
              }
            } catch (e) {
            }
          }
        }
      } catch (e) {
      }
    };

    if (onShow && data?.id) {
      fetchDetail(data.id);
    }

    return () => {
      mounted = false;
    };
  }, [onShow, data?.id]);

  const values = useMemo(
    () => ({
      // id: data?.id ?? null,
      processId: data?.processId ?? null,
      potId: data?.id ?? null,
      startNodeId: data?.startNodeId ?? null,
      potName: data?.name ?? "",
      groupId: data?.groupId ?? null,
      lstVar: data?.processor ? (() => {
        try {
          const p = typeof data.processor === 'string' ? JSON.parse(data.processor) : data.processor;
          return p.lstVar ? p.lstVar : [];
        } catch (e) {
          return [];
        }
      })() : [],
    }),
    [onShow, data]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
    setIsSubmit(false);
    setIsUpdate(false);

    return () => {
      setIsSubmit(false);
      setIsUpdate(false);
    };
  }, [values]);

  const [validateFieldProcess, setValidateFieldProcess] = useState<boolean>(false);
  const [valueProcess, setValueProcess] = useState(null);
  const [valueGroup, setValueGroup] = useState(null);

  const loadedOptionProcess = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      // status: 1,
      limit: 10,
      potId: data?.id,
      opType: 'EX' // lấy về ds quy trình mà đối tượng chưa trình, IN - quy trình đối tượng đã trình
    };

    const response = await BusinessProcessService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

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
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueProcess = (e) => {
    setValueProcess(e);
    setFormData({ ...formData, processId: e.value });
    setValidateFieldProcess(false);
  };

  const loadedOptionGroup = async (search, loadedOptions, { page }) => {
    const param = {
      keyword: search,
      page: page,
      limit: 10,
    };

    const response = await ObjectGroupService.list(param);

    if (response?.code === 0) {
      const dataOption = Array.isArray(response.result)
        ? response.result
        : Array.isArray(response.result?.items)
          ? response.result.items
          : [];

      const hasMore = response.result?.loadMoreAble ?? response.result?.hasMore ?? false;

      return {
        options: dataOption.map((item) => ({ value: item.id, label: item.name })),
        hasMore,
        additional: { page: page + 1 },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueGroup = (e) => {
    setValueGroup(e);
    setFormData({ ...formData, groupId: e?.value ?? null });
  };


  const [validateFieldNode, setValidateFieldNode] = useState<boolean>(false);
  const [valueNode, setValueNode] = useState(null);

  const loadedOptionNode = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      status: 1,
      limit: 10,
      processId: valueProcess?.value
    };

    const response = await BusinessProcessService.bpmListNode(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
              return {
                value: item.nodeId,
                label: item.name || item.nodeId,
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

  const handleChangeValueNode = (e) => {
    setValueNode(e);
    setFormData({ ...formData, startNodeId: e.value });
    setValidateFieldNode(false);
  };

  useEffect(() => {
    loadedOptionNode("", undefined, { page: 1 });
  }, [valueProcess?.value]);

  useEffect(() => {
    if (formData?.lstVar && Array.isArray(formData.lstVar)) {
      const mapped = formData.lstVar.map((item: any) => {
        const key = item.key || "";
        const val = item.value;
        if (val && typeof val === "object" && !Array.isArray(val)) {
          const fields = Object.keys(val).length
            ? Object.keys(val).map((k) => ({ k, v: String(val[k]), readonly: (key === "customer" && k === "customerId") || (key === "service" && k === "serviceId") }))
            : [{ k: "", v: "", readonly: false }];
          return { key, fields };
        }

        return { key, fields: [{ k: "value", v: val !== undefined && val !== null ? String(val) : "", readonly: false }] };
      });

      const ensureDefault = (arr) => {
        const out = [...arr];
        const hasCustomer = out.find((x) => x.key === "customer");
        if (!hasCustomer) {
          out.unshift({ key: "customer", fields: [{ k: "customerId", v: String((formData as any)?.customerId ?? ""), readonly: true }] });
        } else {
          const c = out.find((x) => x.key === "customer");
          if (c) {
            const hasField = c.fields.find((f) => f.k === "customerId");
            if (!hasField) c.fields.unshift({ k: "customerId", v: String((formData as any)?.customerId ?? ""), readonly: true });
            else hasField.v = hasField.v ?? String((formData as any)?.customerId ?? "");
            hasField.readonly = true;
          }
        }

        const hasService = out.find((x) => x.key === "service");
        if (!hasService) {
          const svcVal = (formData as any)?.serviceId ?? (typeof (formData as any)?.services === "string" ? (formData as any).services : "");
          out.splice(hasCustomer ? 1 : 0, 0, { key: "service", fields: [{ k: "serviceId", v: String(svcVal ?? ""), readonly: true }] });
        } else {
          const s = out.find((x) => x.key === "service");
          if (s) {
            const hasField = s.fields.find((f) => f.k === "serviceId");
            if (!hasField) s.fields.unshift({ k: "serviceId", v: String((formData as any)?.serviceId ?? (typeof (formData as any)?.services === "string" ? (formData as any).services : "")), readonly: true });
            else hasField.v = hasField.v ?? String((formData as any)?.serviceId ?? (typeof (formData as any)?.services === "string" ? (formData as any).services : ""));
            hasField.readonly = true;
          }
        }

        return out;
      };

      const final = ensureDefault(mapped.length ? mapped : []);

      setListDataVar(final.length ? final : [{ key: "", fields: [{ k: "", v: "", readonly: false }] }]);
    }
  }, [formData?.lstVar]);

  useEffect(() => {
    if (formData?.groupId) {
      ObjectGroupService.detail(formData.groupId).then((res) => {
        if (res?.code === 0 && res.result) {
          setValueGroup({ value: res.result.id, label: res.result.name });
        } else {
          setValueGroup(null);
        }
      }).catch(() => setValueGroup(null));
    } else {
      setValueGroup(null);
    }
  }, [formData?.groupId]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setFormData(values);
    setValueProcess(null);
    setValidateFieldProcess(false);
    setValueNode(null);
    setValidateFieldNode(false);
    setValueGroup(null);
    setListDataVar([{ key: "", fields: [{ k: "", v: "", readonly: false }] }]);
  };

  const buildProcessorBody = (includeStatus = false) => {
  const lstVar = (listDataVar || []).map((group) => ({
    key: group.key,
    value: (group.fields || []).reduce((acc, f) => {
      if (f.k) acc[f.k] = f.v;
      return acc;
    }, {}),
  }));

  const processorObj = {
    potName: formData.potName || data?.name || "",
    startNodeId: formData.startNodeId || null,
    lstVar: JSON.stringify(lstVar),
    processId: formData.processId ?? 0,
    groupId: formData.groupId ?? 0,
  };

  const base = data && typeof data === "object" ? { ...data } : {};

  const body: any = {
    ...base,
    ...(base.id ? {} : { id: data?.id ?? formData.potId }),
    processor: JSON.stringify(processorObj),
  };

  if (includeStatus) body.status = "5";

  return { body, processorObj };
};
  const onSubmit = async (e) => {
  e.preventDefault();

  if (!formData.processId) {
    setValidateFieldProcess(true);
    return;
  }

  setIsSubmit(true);

  // Build body + processorObj (có status)
  const { body, processorObj } = buildProcessorBody(true);

  const response = await ScheduleTreatmentService.update(body);

  if (response.code === 0) {
    try {
      const treatmentScheduleId = body.id ?? data?.id ?? formData.potId;
      await ScheduleTreatmentService.updateKafka({
        treatmentScheduleId,
        ...processorObj
      });
    } catch {}

    showToast("Xử lý thành công", "success");
    handleClearForm(true);

  } else {
    showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  }

  setIsSubmit(false);
};

  // Hàm xử lý khi người dùng nhấn nút "Cập nhật"
 const handleUpdate = async () => {
  if (!formData.processId) {
    setValidateFieldProcess(true);
    return;
  }

  setIsUpdate(true);

  // Build body (không có status)
  const { body } = buildProcessorBody(false);

  let response;
  try {
    response = await ScheduleTreatmentService.update(body);
  } catch (e) {
    response = { code: -1, message: e?.message ?? "Error" };
  }

  setIsUpdate(false);
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
              handleClearForm(false);
            },
          },
          {
            title: "Cập nhật",
            type: "button",
            color: "primary",
            disabled: isUpdate || validateFieldProcess,
            is_loading: isUpdate,
            callback: () => {
              handleUpdate();
            },
          },
          {
            title: "Xác nhận khách đến",
            type: "submit",
            color: "primary",
            disabled: isSubmit || validateFieldProcess,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isUpdate, isSubmit, validateFieldProcess, formData, values, validateFieldNode]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && !isUpdate && handleClearForm(false)}
        className="modal-signer"
        size="lg"
      >
        <form className="form-add-signer" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Xác nhận khách đến`} toggle={() => !isSubmit && !isUpdate && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <Input
                  name="potName"
                  className="custom-label"
                  value={formData?.potName ?? data?.name ?? ""}
                  onChange={(e) => setFormData({ ...formData, potName: e.target.value })}
                  label="Tên hồ sơ"
                  fill={true}
                  required={false}
                  placeholder="Tên hồ sơ"
                />
                <SelectCustom
                  name="processId"
                  className="custom-label"
                  value={valueProcess}
                  label="Chọn quy trình xử lý"
                  fill={true}
                  required={true}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionProcess}
                  placeholder="Chọn quy trình xử lý"
                  onChange={(e) => handleChangeValueProcess(e)}
                  error={validateFieldProcess}
                  message="Quy trình xử lý không được bỏ trống"
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  name="groupId"
                  className="custom-label"
                  value={valueGroup}
                  label="Loại hồ sơ"
                  fill={true}
                  required={false}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionGroup}
                  placeholder="Chọn loại hồ sơ"
                  onChange={(e) => handleChangeValueGroup(e)}
                  error={false}
                  message=""
                />
                <SelectCustom
                  key={valueProcess?.value}
                  className="custom-label"
                  name="startNodeId"
                  value={valueNode}
                  label="Chọn Node bắt đầu"
                  fill={true}
                  required={false}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionNode}
                  placeholder="Chọn Node bắt đầu"
                  onChange={(e) => handleChangeValueNode(e)}
                  error={validateFieldNode}
                  message="Node bắt đầu không được bỏ trống"
                  disabled={formData?.processId ? false : true}
                />
              </div>


              <div className="container-list-var">
                <div>
                  <span style={{ fontSize: 14, fontWeight: '500' }}>Cài đặt biến</span>
                </div>
                {listDataVar && listDataVar.length > 0 ?
                  listDataVar.map((item, index) => (
                    <div key={index} className="box-var">
                      <div className="box-var-header">
                        <Input
                          name={`var_key_${index}`}
                          value={item.key}
                          label=""
                          fill={true}
                          required={false}
                          readOnly={item.key === "customer" || item.key === "service"}
                          onChange={(e) => {
                            const newData = [...listDataVar];
                            newData[index].key = e.target.value;
                            setListDataVar(newData);
                          }}
                          placeholder="Tên biến (ví dụ: customer)"
                        />

                        <div className="group-actions">
                          <div
                            className="button-add"
                            title="Thêm biến mới"
                            onClick={() => {
                              setListDataVar([...listDataVar, { key: "", fields: [{ k: "", v: "", readonly: false }] }]);
                            }}
                          >
                            <Icon name="PlusCircleFill" />
                          </div>

                          {listDataVar.length > 1 && item.key !== "customer" && item.key !== "service" ? (
                            <div
                              className="button-delete"
                              title="Xóa biến"
                              onClick={() => {
                                const newData = [...listDataVar];
                                newData.splice(index, 1);
                                setListDataVar(newData);
                              }}
                            >
                              <Icon name="Trash" />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="fields-list">
                        {(item.fields || []).map((f, fi) => (
                          <div className="field-item" key={fi}>
                            <Input
                              name={`field_k_${index}_${fi}`}
                              value={f.k}
                              label=""
                              fill={true}
                              required={false}
                              readOnly={!!f.readonly}
                              onChange={(e) => {
                                const newData = [...listDataVar];
                                newData[index].fields[fi].k = e.target.value;
                                setListDataVar(newData);
                              }}
                              placeholder="Field name (ví dụ: age)"
                            />
                            <Input
                              name={`field_v_${index}_${fi}`}
                              value={f.v}
                              className="custom-input"
                              label=""
                              fill={true}
                              required={false}
                              readOnly={!!f.readonly}
                              onChange={(e) => {
                                const newData = [...listDataVar];
                                newData[index].fields[fi].v = e.target.value;
                                setListDataVar(newData);
                              }}
                              placeholder="Value (ví dụ: 123123)"
                            />

                            <div
                              className="button-add"
                              title="Thêm field"
                              onClick={() => {
                                const newData = [...listDataVar];
                                newData[index].fields.splice(fi + 1, 0, { k: "", v: "", readonly: false });
                                setListDataVar(newData);
                              }}
                            >
                              <Icon name="PlusCircleFill" />
                            </div>

                            {item.fields && item.fields.length > 1 && !f.readonly ? (
                              <div
                                className="button-delete"
                                title="Xóa field"
                                onClick={() => {
                                  const newData = [...listDataVar];
                                  newData[index].fields.splice(fi, 1);
                                  setListDataVar(newData);
                                }}
                              >
                                <Icon name="Trash" />
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                  : null}
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}

import React, { Fragment, useEffect, useMemo, useState, useContext } from "react";
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
import ScheduleConsultantService from "services/ScheduleConsultantService";
import ProcessedObjectService from "services/ProcessedObjectService";
import { ContextType, UserContext } from "contexts/userContext";

interface IAddSignerFSAndQuoteProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data?: any;
}

export default function ModalAddCustomerArrivedConsultation(props: IAddSignerFSAndQuoteProps) {
  const { onShow, onHide, data } = props;

  const user = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [listDataVar, setListDataVar] = useState([
    {
      key: "",
      fields: [{ k: "", v: "" }],
    },
  ]);

  useEffect(() => {
    if (onShow && data && data?.processId) {
      setValueProcess({ value: data?.processId, label: data?.processName })
    }
  }, [onShow, data])

  const values = useMemo(
    () => ({
      // id: data?.id ?? null,
      processId: data?.processId ?? null,
      potId: data?.id ?? null,
      nodeId: data?.nodeId ?? null,
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

    // Nếu đã có nodeId trong dữ liệu (mở modal với hồ sơ đã chọn), khởi tạo selected node để hiển thị
    const existingNodeId = values?.nodeId ?? data?.nodeId ?? null;
    if (existingNodeId) {
      const existingNodeLabel = data?.nodeName ?? data?.nodeLabel ?? existingNodeId;
      setValueNode({ value: existingNodeId, label: existingNodeLabel });
    } else {
      setValueNode(null);
    }

    return () => {
      setIsSubmit(false);
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

    const response = await ProcessedObjectService.list(param);

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
    setFormData({ ...formData, potId: e?.value ?? null });
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

    const response = await BusinessProcessService.debugListNodeProcess(param);

    if (response.code === 0) {
        // Lọc các node có typeNode là 'bpmn:ReceiveTask'
        const dataOption = (response.result.items || []).filter(
          (item) => item.typeNode === 'bpmn:ReceiveTask'
        );

        return {
          options: [
            ...(dataOption.length > 0
              ? dataOption.map((item) => ({
                  value: item.nodeId,
                  label: item.name || item.nodeId,
                }))
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
    setFormData({ ...formData, nodeId: e.value });
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
            ? Object.keys(val).map((k) => ({ k, v: String(val[k]) }))
            : [{ k: "", v: "" }];
          return { key, fields };
        }

        // primitive or missing -> put single field named 'value'
        return { key, fields: [{ k: "value", v: val !== undefined && val !== null ? String(val) : "" }] };
      });

      setListDataVar(mapped.length ? mapped : [{ key: "", fields: [{ k: "", v: "" }] }]);
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
    setListDataVar([{ key: "", fields: [{ k: "", v: "" }] }]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.processId) {
      setValidateFieldProcess(true);
      return;
    }

    // if (!formData.startNodeId) {
    //   setValidateFieldNode(true);
    //   return;
    // }

    setIsSubmit(true);

    const lstVar = (listDataVar || []).map((group) => ({
      key: group.key,
      value: (group.fields || []).reduce((acc, f) => {
        if (f.k) acc[f.k] = f.v;
        return acc;
      }, {} as any),
    }));

    const processorObj = {
      potName: formData.potName || data?.name || "",
      nodeId: formData.nodeId || null,
      lstVar: JSON.stringify(lstVar),
      processId: formData.processId ?? 0,
      groupId: formData.groupId ?? 0,
    };

    const consultantId = data?.consultantId ?? data?.employeeId ?? user?.id ?? user?.idEmployee ?? null;
    const consultantName = data?.consultantName ?? data?.employeeName ?? user?.name ?? "";

    const customerId = data?.customerId ?? null;
    const customerName = data?.customerName ?? "";

    const kafkaData = {
      employeeId: consultantId,
      employeeName: consultantName,
      customerId: customerId,
      customerName: customerName,
      arrival: 1,
    };

    const kafkaBody = {
      data: JSON.stringify(kafkaData),
      processId: formData.processId ?? data?.processId ?? 0,
      potId: formData.potId ?? data?.id ?? null,
      nodeId: formData.nodeId ?? valueNode?.value ?? null,
    };

    const base = data && typeof data === 'object' ? { ...data } : {};
    const body = {
      ...base,
      ...(base.id ? {} : { id: data?.id ?? formData.potId }),
      processor: JSON.stringify(processorObj),
    };

    const response = await ScheduleConsultantService.updateKafka(kafkaBody as any);

    if (response.code === 0) {
      showToast("Xử lý thành công", "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
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
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || validateFieldProcess,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, validateFieldProcess, formData, values, validateFieldNode]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-signer"
        size="lg"
      >
        <form className="form-add-signer" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Xác nhận khách đến`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  name="Tên hồ sơ"
                  className="custom-label"
                  value={valueGroup}
                  label="Tên hồ sơ"
                  fill={true}
                  required={false}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionGroup}
                  placeholder="Chọn hồ sơ"
                  onChange={(e) => handleChangeValueGroup(e)}
                  error={false}
                  message=""
                />
              </div>

              <div className="form-group">
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
                <SelectCustom
                  key={valueProcess?.value}
                  className="custom-label"
                  name="NodeId"
                  value={valueNode}
                  label="Chọn RecieveTask "
                  fill={true}
                  required={false}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionNode}
                  placeholder="Chọn RecieveTask "
                  onChange={(e) => handleChangeValueNode(e)}
                  error={validateFieldNode}
                  message="Node không được bỏ trống"
                  disabled={formData?.processId ? false : true}
                />
              </div>


              {/* <div className="container-list-var">
                <div>
                  <span style={{ fontSize: 14, fontWeight: '500' }}>Điều kiện</span>
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
                              setListDataVar([...listDataVar, { key: "", fields: [{ k: "", v: "" }] }]);
                            }}
                          >
                            <Icon name="PlusCircleFill" />
                          </div>

                          {listDataVar.length > 1 ? (
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
                                newData[index].fields.splice(fi + 1, 0, { k: "", v: "" });
                                setListDataVar(newData);
                              }}
                            >
                              <Icon name="PlusCircleFill" />
                            </div>

                            {item.fields && item.fields.length > 1 ? (
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
              </div> */}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}

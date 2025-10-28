import { convertDataRow } from "pages/BPM/BusinessProcessCreate/partials/ModalUserTask/partials/ModalOLA/partial/TableOlaRule/ConvertDataRow";
import { validateInputRules } from "pages/BPM/BusinessProcessCreate/partials/ModalUserTask/partials/ModalOLA/partial/TableOlaRule/validateInputRule";
import { useEffect, useMemo, useState } from "react";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";

export const useOlaSetting = (props) => {
  const { dataNode, onHide, typeOfNode, onShow, processId } = props;
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoadingType, setIsLoadingType] = useState(true);
  const [haveTypeNode, setHaveTypeNode] = useState(false);
  const [typeNode, setTypeNode] = useState("");

  const [valueResponse, setValueResponse] = useState({
    id: "",
    day: "",
    hour: "",
    minute: "",
    timeType: "response",
    type: typeOfNode,
    nodeId: "",
  });

  const [valueProcess, setValueProcess] = useState({
    id: "",
    day: "",
    hour: "",
    minute: "",
    timeType: "process",
    type: typeOfNode,
    nodeId: "",
  });

  const [dataAdvance, setDataAdvance] = useState(null);
  const [formDataAdvance, setFormDataAdvance] = useState(null);
  const [dataConfigAdvance, setDataConfigAdvance] = useState({ columns: [], rows: [] });
  const [dataConfigAdvanceEdit, setDataConfigAdvanceEdit] = useState({ columns: [], rows: [] });
  const [isLoadingDataAdvance, setLoadingDataAdvance] = useState(false);

  useEffect(() => {
    const targetId = onShow && dataNode?.id ? dataNode.id : processId;
    if (!targetId) return;

    const params: any = { type: typeOfNode };
    const key = onShow ? "nodeId" : "processId";
    if (onShow) {
      params.nodeId = targetId;
    } else {
      params.processId = targetId;
    }

    setIsLoadingType(true);
    getDetailServiceLevel({ [key]: targetId });
    getTypeOLA(params);
    getDetailTaskAdvance(params);
  }, [dataNode?.id, onShow, processId, typeOfNode]);

  const getTypeOLA = async (params: any) => {
    const response = await BusinessProcessService.checkTypeOLA(params);
    if (response.code === 0) {
      const result = response.result;
      setTypeNode(result || "basic");
      setHaveTypeNode(!!result);
      setIsLoadingType(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailTaskAdvance = async (params: any) => {
    const targetId = params?.nodeId ? params?.nodeId : params?.processId;
    const response = await BusinessProcessService.detailBusinessRuleTaskAdvance(params);
    if (response.code === 0) {
      const result = response.result;
      const parsedConfig = result?.config ? JSON.parse(result.config) : { columns: [], rows: [] };

      setDataAdvance({
        ...result,
        config: parsedConfig,
      });

      setDataConfigAdvance(parsedConfig);

      const formAdvance: any = {
        id: result?.id ?? null,
        name: result?.name ?? "",
        description: result?.description ?? "",
        config: parsedConfig,
      };
      if (params.nodeId) formAdvance.nodeId = targetId;
      else formAdvance.processId = targetId;

      setFormDataAdvance(formAdvance);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setLoadingDataAdvance(false);
  };

  const getDetailServiceLevel = async (params: any) => {
    const response = await BusinessProcessService.listServiceLevel({ ...params });
    if (response.code === 0) {
      const items = response.result?.items || [];
      const dataResponse = items.find((el: any) => el.timeType === "response");
      const dataProcess = items.find((el: any) => el.timeType === "process");

      setValueResponse(dataResponse || { ...valueResponse, ...params });
      setValueProcess(dataProcess || { ...valueProcess, ...params });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const updateServiceLevels = async () => {
    const resutlResponseTime = await BusinessProcessService.updateServiceLevel(valueResponse);
    const resutlProcessTime = await BusinessProcessService.updateServiceLevel(valueProcess);

    const bodyHistory = {
      responseDay: +valueResponse?.day || 0,
      responseHour: +valueResponse?.hour || 0,
      responseMinute: +valueResponse?.minute || 0,
      processDay: +valueProcess?.day || 0,
      processHour: +valueProcess?.hour || 0,
      processMinute: +valueProcess?.minute || 0,
      nodeId: valueResponse?.nodeId,
    };

    //lưu lịch sử OLA
    const resutlHistory = await BusinessProcessService.updateHistoryOLA(bodyHistory);

    if (resutlResponseTime.code === 0 && resutlProcessTime.code === 0) {
      showToast(`Cài đặt ${typeOfNode} thành công`, "success");
      onHide?.(true);
    } else {
      showToast((resutlResponseTime.message || resutlProcessTime.message) ?? "Có lỗi xảy ra", "error");
    }
  };

  const updateAdvanced = async () => {
    let statusUpdate = false;
    const targetId = dataNode?.id ? dataNode?.id : processId;
    const key = dataNode?.id ? "nodeId" : "processId";
    const dataConfig = convertDataRow(dataConfigAdvanceEdit, targetId);

    const body = {
      id: formDataAdvance.id,
      [key]: targetId,
      name: typeOfNode + "_" + targetId,
      type: typeOfNode,
      description: typeOfNode + "_" + targetId,
      inputs: JSON.stringify(dataConfig.inputs || null),
      outputs: JSON.stringify(dataConfig.outputs || null),
      config: JSON.stringify(dataConfig.config || null),
      rules: dataConfig.rules || [],
      otherwise: JSON.stringify(dataConfig.alias || null),
    };
    console.log(`body`, body);

    const response = await BusinessProcessService.updateBusinessRuleTaskAdvance(body);
    if (response.code === 0) {
      statusUpdate = true;
      showToast(`Cài đặt ${typeOfNode} thành công`, "success");
    } else if (response.code === 200 && response.message) {
      showToast("Các điều kiện chồng lấn", "error");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    return {
      response,
      statusUpdate,
    };
  };

  const onSubmit = async (e: any) => {
    // e?.preventDefault();
    const dataConfig = convertDataRow(dataConfigAdvanceEdit, "checkValidate");
    const validation = validateInputRules(dataConfig.rules);

    if (validation.length) {
      showToast(`Các trường điều kiện không được để trống`, "error");
      return;
    }
    setIsSubmit(true);

    if (typeNode === "advanced") {
      let result = await updateAdvanced();
      if (!result.statusUpdate) {
        setIsSubmit(false);
        return result;
      }
      setIsSubmit(false);
      clearForm();
    } else {
      await updateServiceLevels();
      setIsSubmit(false);
      clearForm();
    }
  };

  const clearForm = () => {
    onHide?.(false);
    setIsSubmit(false);
    setValueResponse({
      id: "",
      day: "",
      hour: "",
      minute: "",
      timeType: "response",
      type: typeOfNode,
      nodeId: "",
    });
    setValueProcess({
      id: "",
      day: "",
      hour: "",
      minute: "",
      timeType: "process",
      type: typeOfNode,
      nodeId: "",
    });
  };

  const valuesAdvance = useMemo(
    () => ({
      id: null,
      name: dataAdvance?.name ?? "",
      description: dataAdvance?.description ?? "",
      nodeId: dataNode?.id ?? null,
      config: {
        columns: dataAdvance?.config?.columns || [],
        rows: dataAdvance?.config?.rows || [],
      },
    }),
    [dataAdvance, dataNode]
  );

  return {
    typeNode,
    setTypeNode,
    isSubmit,
    setIsSubmit,
    isLoadingType,
    haveTypeNode,
    valueResponse,
    valueProcess,
    setValueResponse,
    setValueProcess,
    onSubmit,
    clearForm,
    formDataAdvance,
    setFormDataAdvance,
    dataConfigAdvance,
    setDataConfigAdvance,
    dataConfigAdvanceEdit,
    setDataConfigAdvanceEdit,
    isLoadingDataAdvance,
    valuesAdvance,
  };
};

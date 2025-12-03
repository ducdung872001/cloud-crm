import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, convertToFileName, getSearchParameters } from "reborn-util";
import "./ModalHandleTask.scss";
import BusinessProcessService from "services/BusinessProcessService";
import { handDownloadFileOrigin, showToast } from "utils/common";
import Button from "components/button/button";
import { useNavigate } from "react-router-dom";
import FormViewerComponent from "pages/BPM/BpmForm/FormViewer";
import OnHoldModal from "../HandleTask/OnHoldModal/OnHoldModal";
import OnRejectModal from "../HandleTask/OnRejectModal/OnRejectModal";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import GridService from "services/GridService";
import Loading from "components/loading";
import WorkOrderService from "services/WorkOrderService";
import { EMAIL_REGEX, PHONE_REGEX_NEW } from "utils/constant";
import Tippy from "@tippyjs/react";
import moment from "moment";
import ModalConfirmRelease from "./partials/ModalConfirmRelease/ModalConfirmRelease";
import ModalCustomPopup from "./partials/ModalCustomPopup";
import ModalSelectJump from "./partials/ModalSelectJump/ModalSelectJump";
import AddPhoneModal from "pages/CallCenter/partials/AddPhoneModal";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";

const defaultSchema = {
  type: "default",
  components: [],
};

export default function ModalHandleTask({ onShow, onHide, dataWork, isHandleTask }) {
  const params: any = getSearchParameters();
  const formViewerRef = useRef(null);
  const checkShowFullScreen = localStorage.getItem("showFullScreenEform");

  const navigation = useNavigate();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataInit, setDataInit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isLoadingEngine, setIsLoadingEngine] = useState(true);
  const [isLoadingRecall, setIsLoadingRecall] = useState(false);

  const [showFullScreen, setShowFullScreen] = useState<boolean>(checkShowFullScreen ? JSON.parse(checkShowFullScreen) : false);

  useEffect(() => {
    localStorage.setItem("showFullScreenEform", JSON.stringify(showFullScreen));
  }, [showFullScreen]);

  const [dataForm, setDataForm] = useState(null);
  const [dataEngine, setDataEngine] = useState(null);
  const [contextData, setContextData] = useState({ nodeId: "", processId: 0, potId: 0 });
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [showOnRejectModal, setShowOnRejectModal] = useState(false);
  const [showConfirmRelease, setShowConfirmRelease] = useState(false);
  const [showSelectJump, setShowSelectJump] = useState(false);
  const [keyForm, setKeyForm] = useState(null);
  const [dataSchema, setDataSchema] = useState(null);
  const [dataSchemaDraft, setDataSchemaDraft] = useState(null);
  const [dataCustomer, setDataCustomer] = useState<ICustomerResponse>(null);
  

  //Lấy danh sách các ghi chú để gửi sang portal
  const [listNodeDocument, setListNodeDocument] = useState([]);

  const [checkIsApproval, setCheckIsApproval] = useState(false);

  const [listDataRow, setListDataRow] = useState([]);

  // Hủy poll nếu component bị unmount
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const [showPopupCustom, setShowPopupCustom] = useState(false);
  const [codePopupCustom, setCodePopupCustom] = useState("");
  const [showPopupCallCustomer, setShowPopupCallCustomer] = useState(false);
  console.log('showPopupCallCustomer', showPopupCallCustomer);
  

  const cutString = (str, char) => {
    const index = str.indexOf(char);
    if (index === -1) return str; // không tìm thấy thì trả về nguyên chuỗi
    return str.substring(0, index);
  };

  const getDetailTask = async (id, dataEngine?) => {
    const response = await BusinessProcessService.detailUserTask(id);

    if (response.code == 0) {
      const result = response.result;
      setDataForm(result);
      setKeyForm(result.code);
      let config = (result.config && JSON.parse(result.config)) || null;
      if (config) {
        //Nếu không phải là trường hợp từ chối quay về thì ẩn trường select Jump đi
        if (!dataEngine?.hasJumpOptions) {
          let components = config.components;
          if (components && components.length > 0 && components.find((el) => el.type === "select" && el.key === "option_jump")) {
            components = components.filter((el) => el.key !== "option_jump");
            config = { ...config, components };
          }
        }
        // Tìm phần tử có type == "grid" trong mảng config.components rồi thêm tham số workId vào
        if (config?.components && config?.components.length > 0) {
          const updatedComponents = config.components.map((component) => {
            if (component.type === "grid") {
              const _contextData = dataWork?.contextData && JSON.parse(dataWork?.contextData);
              return {
                ...component,
                workId: dataWork?.id || null,
                potId: _contextData?.potId || null,
                nodeId: _contextData?.nodeId || null,
                processId: _contextData?.processId || null,
                fieldName: component?.fieldName || null,
              };
            }
            return component;
          });
          config = { ...config, components: updatedComponents };
        }

        setInitFormSchema(config);
        setFormSchema(config);
        if (config?.components && config?.components.length > 0) {
          const listNote = config.components.filter(
            (el) => el.type === "textarea" && el?.properties?.documentType && cutString(el.key, "_") === "Note"
          );
          if (listNote && listNote.length > 0) {
            const listNodeDate = [];
            listNote.map((item) => {
              listNodeDate.push({
                ...item,
                content: "",
              });
            });
            setListNodeDocument(listNodeDate);
          }
        }
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataForm = async (potId, nodeId, workId) => {
    setIsLoadingEngine(true);
    const params = {
      potId: potId,
      nodeId: nodeId,
      workId: workId,
    };
    const response = await BusinessProcessService.getDataForm(params);

    if (response.code == 0) {
      const result = response.result;
      const attributeValue = (result?.attributeValue && JSON.parse(result?.attributeValue)) || null;
      setDataInit(attributeValue);
      // setDataInit({...attributeValue, projectCatalog: 9});
      setDataEngine(result);
      getDetailTask(nodeId, result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoadingEngine(false);
  };

  useEffect(() => {
    if (dataWork && onShow) {
      const contextData = dataWork?.contextData && JSON.parse(dataWork?.contextData);
      setContextData(contextData);
      // getDetailTask(contextData.nodeId);
      getDataForm(contextData?.potId, contextData?.nodeId, dataWork?.id);
    }
  }, [dataWork, onShow]);

  const [formSchema, setFormSchema] = useState(defaultSchema); // Lưu trữ schema
  // console.log("formSchema", formSchema);

  const [initFormSchema, setInitFormSchema] = useState(defaultSchema); // Lưu trữ schema
  // console.log("initFormSchema", initFormSchema);

  // Callback để nhận schema khi người dùng thay đổi trong FormEditor
  const handleSchemaSubmit = (newSchema, reject, contextData) => {
    // setFormSchema(newSchema); // Cập nhật schema mới
    setDataSchema(newSchema);
    onSubmit(newSchema);
  };

  const changePriorityLevel = async () => {
    const body = {
      id: dataWork?.id,
      priorityLevel: 2,
    };

    const response = await WorkOrderService.updateLevelStatus(body);

    // if (response.code === 0) {
    //   showToast(`${priorityLevel === 4 ? 'Thêm' : 'Bỏ'} công việc ưu tiên thành công`, "success");
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }
  };

  const ReceiveProcessedObjectLog = async () => {
    setIsSubmit(true);
    const body = {
      nodeId: contextData?.nodeId,
      potId: contextData?.potId,
      processId: contextData?.processId,
      workId: dataWork.id,
    };
    const response = await BusinessProcessService.receiveProcessedObjectLog(body);

    if (response.code === 0) {
      showToast(`Tiếp nhận thành công`, "success");
      getDataForm(contextData?.potId, contextData?.nodeId, dataWork?.id);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsSubmit(false);
  };

  const handleWorkRecall = async () => {
    setIsLoadingRecall(true);
    const workId = dataWork.id;
    const params = {
      workId,
    };
    const response = await BusinessProcessService.onWorkRecall(params);
    if (response.code === 0) {
      const result = response?.result;
      if (result.result === 0 && result.status === 1) {
        showToast("Không thể thu hồi do chưa hoàn thành công việc!", "error");
      }
      if (result.result === 0 && result.status === 0) {
        const abortController = new AbortController();
        abortRef.current = abortController;
        await handlePollCheckResult(result?.requestId, abortController.signal);
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingRecall(false);
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const handlePollCheckResult = async (requestId: string, abortSignal: AbortSignal) => {
    // setIsLoadingEngine(true);

    try {
      const poll = async (): Promise<void> => {
        if (abortSignal.aborted) {
          return;
        }
        const params = {
          requestId,
        };
        const response = await BusinessProcessService.onPollCheckResult(params, abortSignal);

        if (response.code !== 0) {
          showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          return;
        }
        const result = response?.result;
        if (result.status === 1) {
          if (result.result === 0) {
            showToast("Không thể thu hồi do công việc sau đã tiếp nhận!", "error");
          } else if (result.result === 1) {
            showDialogConfirmWorkRecall(result?.requestId);
          }
          return;
        }

        await delay(1000);
        return poll();
      };

      await poll();
    } catch (error) {
      if (abortSignal.aborted) {
        console.log("Polling bị hủy do người dùng.");
      } else {
        showToast("Đã có lỗi hệ thống!", "error");
      }
    } finally {
      // setIsLoadingEngine(false);
    }
  };

  const handleRecallConfirm = async (requestId: any) => {
    if (!requestId) return;
    setIsLoadingRecall(true);
    const params = {
      requestId,
    };
    const response = await BusinessProcessService.onConfirmRecall(params);
    if (response.code === 0) {
      if (response.result === 1) {
        showToast("Thu hồi công việc thành công!", "success");
      } else {
        showToast("Không thể thu hồi công việc!", "error");
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoadingRecall(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          ...(dataEngine?.isReceived === 1
            ? ([
                {
                  title: "Thu hồi",
                  color: "primary",
                  disabled: isLoadingRecall,
                  is_loading: isLoadingRecall,
                  callback: handleWorkRecall,
                },
              ] as any)
            : []),
          ...(dataEngine?.isProcessed === 1
            ? []
            : [
                ...(dataEngine?.isReceived === 1
                  ? [
                      ...(dataForm?.type === 2 || dataForm?.type === 4
                        ? [
                            {
                              title: "YCĐC",
                              color: "primary",
                              variant: "outline",
                              disabled: isSubmit,
                              callback: () => {
                                setShowOnRejectModal(true);
                              },
                            },
                          ]
                        : []),
                    ]
                  : ([
                      ...(!isHandleTask
                        ? [
                            {
                              title: "Từ chối",
                              color: "primary",
                              variant: "outline",
                              disabled: isSubmit,
                              callback: () => {
                                setShowOnRejectModal(true);
                              },
                            },
                          ]
                        : []),
                    ] as any)),

                ...(dataEngine?.isReceived === 1
                  ? ([
                      ...(dataEngine?.isPaused === 1
                        ? [
                            {
                              title: "Tiếp tục",
                              color: "primary",
                              variant: "outline",
                              disabled: isSubmit,
                              callback: () => {
                                onContinue(dataEngine?.pausedId);
                              },
                            },
                          ]
                        : [
                            {
                              title: "Lưu nháp",
                              color: "primary",
                              variant: "outline",
                              disabled: isSubmit,
                              callback: () => {
                                onDraff(dataSchemaDraft);
                              },
                            },
                            ...(!isHandleTask
                              ? [
                                  {
                                    title: "Tạm dừng",
                                    color: "primary",
                                    variant: "outline",
                                    disabled: isSubmit,
                                    callback: () => {
                                      setShowOnHoldModal(true);
                                    },
                                  },
                                ]
                              : []),

                            {
                              title: dataForm?.type === 2 || dataForm?.type === 4 ? "Phê duyệt" : "Hoàn thành",
                              // type: "submit",
                              color: "primary",
                              disabled: isSubmit,
                              // || !isDifferenceObj(formData, values),
                              is_loading: isSubmit,
                              callback: () => {
                                if (keyForm === "bidOpening") {
                                  setShowConfirmRelease(true);
                                } else {
                                  handleSubmit();
                                }
                              },
                            },
                          ]),
                    ] as any)
                  : []),

                ...(dataEngine?.isReceived === 0
                  ? ([
                      {
                        title: "Tiếp nhận",
                        // type: "submit",
                        color: "primary",
                        disabled: isSubmit,
                        // || !isDifferenceObj(formData, values),
                        is_loading: isSubmit,
                        callback: () => {
                          ReceiveProcessedObjectLog();
                        },
                      },
                    ] as any)
                  : []),
              ]),
        ],
      },
    }),
    [
      isSubmit,
      dataEngine,
      dataSchemaDraft,
      contextData,
      params,
      formViewerRef,
      dataWork,
      dataSchema,
      isHandleTask,
      keyForm,
      dataForm,
      listDataRow,
      isLoadingRecall,
    ]
  );

  const showDialogConfirmWorkRecall = (requestId: any) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: isLoadingRecall,
      title: <Fragment>{`Thu hồi công việc`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn thu hồi công việc?</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: async () => {
        await handleRecallConfirm(requestId);
        handleClear(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClear = (acc) => {
    if (isHandleTask) {
      onHide(acc, false, true);
    } else {
      onHide(acc);
    }
    setIsSubmit(false);

    setContextData({ nodeId: "", processId: 0, potId: 0 });
    setDataInit(null);
    setDataEngine(null);
    setDataSchema(null);
    setDataSchemaDraft(null);
    setListDataRow([]);

    setTimeout(() => {
      setIsLoading(true);
    }, 500);
    setIsLoadingEngine(true);
    setKeyForm(null);
    setInitFormSchema(defaultSchema);
  };

  const checkEmpty = (data, listColumn) => {
    let check_required = false;
    data.map((item, index) => {
      if (index != 0 && item.length) {
        listColumn.map((field) => {
          if (field?.required && !item.find((el) => el.key == field.key)?.value) {
            check_required = true;
          }
        });
      }
    });
    return check_required;
  };

  const checkData = (data, listColumn) => {
    const optionRegex = {
      phoneRegex: PHONE_REGEX_NEW,
      emailRegex: EMAIL_REGEX,
    };

    let check_regex = false;
    data.map((item, index) => {
      if (index != 0 && item.length) {
        listColumn.map((field) => {
          if (
            field.regex &&
            item.find((el) => el.key == field.key)?.value &&
            !item.find((el) => el.key == field.key)?.value.match(optionRegex[field.regex])
          ) {
            check_regex = true;
          }
        });
      }
    });
    return check_regex;
  };

  const formContainerRef = useRef(null);

  const handleSubmit = async (isJump?: boolean) => {
    if (formViewerRef.current) {
      try {
        //Check thông tin trống khi lưu
        if (listDataRow && listDataRow.length > 0) {
          // Kiểm tra validation trước khi submit
          let hasError = false;
          for (const item of listDataRow) {
            if (checkEmpty(item.dataRow, item.listColumn)) {
              showToast("Các trường bắt buộc không được bỏ trống", "error");
              hasError = true;
              break;
            }
            if (checkData(item.dataRow, item.listColumn)) {
              showToast("Dữ liệu không hợp lệ", "error");
              hasError = true;
              break;
            }
          }

          if (hasError) {
            setIsSubmit(false);
            setTimeout(() => {
              try {
                formViewerRef.current?.submit();
              } catch (error) {
                setIsSubmit(false);
              }
            }, 100);
            return;
          }

          setIsSubmit(true);

          const arrayPromise = [];
          listDataRow.map((item) => {
            const promise = new Promise((resolve, reject) => {
              const param = {
                nodeId: contextData?.nodeId || "Activity_0n3i8dv",
                processId: contextData?.processId || 380,
                potId: contextData?.potId || 496,
                workId: dataWork?.id || 1813,
                fieldName: item.params?.fieldName || "boq",
                data: JSON.stringify(item.dataRow),
                documentType: item.params?.documentType || "",
              };
              GridService.updateRow(param).then((res) => resolve(res));
            });

            arrayPromise.push(promise);
          });

          Promise.all(arrayPromise).then(async (result) => {
            if (result.length > 0) {
              const result = await formViewerRef.current.submit();
            } else {
              showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
              setIsSubmit(false);
            }
          });
        } else {
          // Set submit state trước khi submit form
          setIsSubmit(true);
          const result = await formViewerRef.current.submit();
        }
      } catch (error) {
        console.error("Form submission failed:", error);
        setIsSubmit(false);
      }
    }
  };

  /**
   * Tìm tất cả các component có type === "grid" trong mảng components,
   * bỏ qua component có id === excludeId.
   * Tránh trả về duplicate dựa trên id (nếu có).
   */
  function findAllGrids(components: any[] | undefined, excludeId?: string): any[] {
    const results: any[] = [];
    const seen = new Set<string | undefined>();

    function walk(comps?: any[]) {
      if (!Array.isArray(comps) || comps.length === 0) return;
      for (const c of comps) {
        const id = c.id;
        // Nếu là grid và không phải excludeId và chưa thấy trước đó
        if (c.type === "grid" && id !== excludeId && !seen.has(id)) {
          results.push(c);
          seen.add(id);
        }
        // Duyệt con nếu có
        if (Array.isArray(c.components) && c.components.length > 0) {
          walk(c.components);
        }
      }
    }

    walk(components);
    return results;
  }
  function canParseJSON(value: any): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  const checkValidateForm = (config) => {
    // Check validate các bảng grid
    let allGrid = findAllGrids(initFormSchema?.components);
    let listKeyGrid = Object.keys(config) || [];
    if (listKeyGrid.length > 0) {
      for (let i = 0; i < listKeyGrid.length; i++) {
        let key = listKeyGrid[i];
        let grid = allGrid.find((el) => el.key === key);
        if (grid) {
          const isParsable = canParseJSON(config[key]);
          if (!isParsable) {
            console.error("Dữ liệu bảng không đúng định dạng JSON");
            continue;
          }
          const dataGrid = JSON.parse(config[key]);
          const dataRows = dataGrid?.dataRow || [];
          const headerTable = dataGrid?.headerTable || [];
          for (let index = 0; index < dataRows.length; index++) {
            const element = dataRows[index];
            let rowNumber = index + 1;
            for (let j = 0; j < headerTable.length; j++) {
              const field = headerTable[j];
              if (field?.required && !element[field.key]) {
                showToast(`Dữ liệu bảng ${grid?.label || ""} - Dòng ${rowNumber}: Các trường bắt buộc không được bỏ trống`, "error");
                return false;
              }
              const optionRegex = {
                phoneRegex: PHONE_REGEX_NEW,
                emailRegex: EMAIL_REGEX,
              };
              if (field.regex && element[field.key] && !element[field.key]?.match(optionRegex[field.regex])) {
                showToast(`Dữ liệu bảng ${grid?.label || ""} - Dòng ${rowNumber}: Dữ liệu không hợp lệ`, "error");
                return false;
              }
            }
          }
        }
      }
    }
    // Check validate các bảng grid
    return true;
  };

  const onSubmit = async (config) => {
    let checkValidate = checkValidateForm(config);
    if (!checkValidate) {
      setIsSubmit(false);
      return;
    }
    setIsSubmit(false);

    const isJump = (config?.option_jump && +config?.option_jump) || null;
    const contextData = dataWork?.contextData && JSON.parse(dataWork?.contextData);

    const body = {
      nodeId: contextData?.nodeId,
      processId: contextData?.processId,
      potId: contextData?.potId,
      config: JSON.stringify(config),
      workId: dataWork.id,
      // ...(isJump ? {isJump: isJump === 'jump' ? 1 : isJump === 'jump_to_first' ? 2  : 0} : {})
      ...(isJump ? { isJump: isJump } : {}),
    };

    if (config?.invitationDate && config?.closedDate) {
      if (config.invitationDate >= config.closedDate) {
        showToast("Thời gian mời thầu không được lớn hơn thời gian đóng thầu", "error");
        return;
      }
    }

    if (config?.extendTime) {
      if (new Date(config?.extendTime) < new Date()) {
        showToast("Thời gian gia hạn không được nhỏ hơn thời gian hiện tại", "error");
        setIsSubmit(false);
        return;
      }
    }

    setIsSubmit(true);

    const response = await BusinessProcessService.updateHandleTask(body);
    if (response.code === 0) {
      showToast(`${dataForm?.type === 2 || dataForm?.type === 4 ? "Phê duyệt" : "Xử lý"}  nhiệm vụ thành công`, "success");
      handleClear(true);
      changePriorityLevel();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsSubmit(false);
  };

  const onDraff = async (config) => {
    const body = {
      nodeId: contextData?.nodeId,
      processId: contextData?.processId,
      potId: contextData?.potId,
      config: JSON.stringify(config),
      workId: dataWork.id,
    };

    if (config?.invitationDate && config?.closedDate) {
      if (config.invitationDate >= config.closedDate) {
        showToast("Thời gian mời thầu không được lớn hơn thời gian đóng thầu", "error");
        return;
      }
    }
    setIsSubmit(true);

    if (listDataRow && listDataRow.length > 0) {
      const arrayPromise = [];
      listDataRow.map((item) => {
        const promise = new Promise((resolve, reject) => {
          const param = {
            nodeId: contextData?.nodeId || "Activity_0n3i8dv",
            processId: contextData?.processId || 380,
            potId: contextData?.potId || 496,
            workId: dataWork?.id || 1813,
            fieldName: item.params?.fieldName || "boq",
            data: JSON.stringify(item.dataRow),
            documentType: item.params?.documentType || "",
          };
          GridService.updateRow(param).then((res) => resolve(res));
        });

        arrayPromise.push(promise);
      });

      Promise.all(arrayPromise).then(async (result) => {
        if (result.length > 0) {
          const response = await BusinessProcessService.updateHandleTaskDraft(body);
          if (response.code === 0) {
            showToast(`Lưu nháp nhiệm vụ thành công`, "success");
            handleClear(true);
          } else {
            showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          }
        } else {
          showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          setIsSubmit(false);
        }
      });
    } else {
      const response = await BusinessProcessService.updateHandleTaskDraft(body);
      if (response.code === 0) {
        showToast(`Lưu nháp nhiệm vụ thành công`, "success");
        handleClear(true);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }

    setIsSubmit(false);
  };

  const saveDataRow = async (data, paramsGrid, listColumn) => {
    const optionRegex = {
      phoneRegex: PHONE_REGEX_NEW,
      emailRegex: EMAIL_REGEX,
    };

    let check_required = false;
    let check_regex = false;
    data.map((item, index) => {
      if (index != 0 && item.length) {
        listColumn.map((field) => {
          if (field?.required && !item.find((el) => el.key == field.key)?.value) {
            check_required = true;
          }
          if (
            field.regex &&
            item.find((el) => el.key == field.key)?.value &&
            !item.find((el) => el.key == field.key)?.value.match(optionRegex[field.regex])
          ) {
            check_regex = true;
          }
        });
      }
    });
    if (check_required) {
      showToast("Các trường bắt buộc không được bỏ trống", "error");
      return;
    }
    if (check_regex) {
      showToast("Dữ liệu không hợp lệ", "error");
      return;
    }

    const param = {
      nodeId: contextData?.nodeId || "Activity_0n3i8dv",
      processId: contextData?.processId || 380,
      potId: contextData?.potId || 496,
      workId: dataWork?.id || 1813,
      fieldName: paramsGrid?.fieldName || "boq",
      data: JSON.stringify(data),
      documentType: paramsGrid?.documentType || "",
      // fieldName: data.params?.fieldName || "boq",
      // data: JSON.stringify(data.dataRow),
    };
    const response = await GridService.updateRow(param);
    if (response.code === 0) {
      // showToast("Lưu thành công", "success");
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onContinue = async (pausedId) => {
    setIsSubmit(true);
    const body = {
      pausedId: pausedId,
    };
    const response = await BusinessProcessService.onContinue(body);
    if (response.code === 0) {
      showToast(`Tiếp tục công việc thành công`, "success");
      getDataForm(contextData?.potId, contextData?.nodeId, dataWork?.id);
      onHide(true, true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsSubmit(false);
  };

  useEffect(() => {
    window.addEventListener("message", (event) => {
      // Kiểm tra thông điệp từ iframe
      if (event.data?.type === "EXPORT_XLSX") {
        const listColumn = event.data.listColumn;
        const data = event.data.data;
        const name = event.data.name;
        // Tạo một workbook
        const ws = XLSX.utils.aoa_to_sheet([
          listColumn.map((item) => item.name), // Dòng tiêu đề
          listColumn.map((item) => item.key), // Dòng thứ 2 với các key
          listColumn.map((item) => (item.type == "number" ? "Number" : "Nvarchar")), // Dòng thứ 3 với các kiểu dữ liệu
        ]);

        // // Thêm dữ liệu mẫu bắt đầu từ dòng thứ 3
        // XLSX.utils.sheet_add_json(ws, data, { origin: "A3", skipHeader: true });

        // // Ẩn dòng thứ 2
        // ws["!rows"] = [{}, { hidden: true }];

        // Thêm dữ liệu mẫu bắt đầu từ dòng thứ 3
        XLSX.utils.sheet_add_json(ws, data, { origin: "A4", skipHeader: true });

        // Ẩn dòng thứ 2
        ws["!rows"] = [{}, { hidden: true }, { hidden: true }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, name);

        // Tạo blob từ workbook
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        // Tạo liên kết và tải xuống file
        let code_name = convertToFileName(name);

        download(blob, code_name + ".xlsx");
      }

      if (event.data?.type === "EXPORT_TEMPLATE") {
        const listColumn = event.data.listColumn;
        const data = event.data.data;
        const name = event.data.name;
        // Tạo một workbook
        const ws = XLSX.utils.aoa_to_sheet([
          // ["Tên khách hàng", "Tuổi", "Địa chỉ"], // Dòng tiêu đề
          // ["name", "age", "address"], // Dòng thứ 2 với các key
          listColumn.map((item) => item.name), // Dòng tiêu đề
          listColumn.map((item) => item.key), // Dòng thứ 2 với các key
          listColumn.map((item) => (item.type == "number" ? "Number" : "Nvarchar")), // Dòng thứ 3 với các kiểu dữ liệu
        ]);

        // Thêm dữ liệu mẫu bắt đầu từ dòng thứ 3
        XLSX.utils.sheet_add_json(ws, data, { origin: "A3", skipHeader: true });

        // Ẩn dòng thứ 2
        ws["!rows"] = [{}, { hidden: true }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, name);

        // Tạo blob từ workbook
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        // Tạo liên kết và tải xuống file
        let code_name = convertToFileName(name);
        download(blob, code_name + ".xlsx");
      }

      if (event.data?.type === "EXPORT_DOCUMENT") {
        const fileUrl = event.data.fileUrl;
        const fileName = event.data.fileName;
        handDownloadFileOrigin(fileUrl, fileName);
      }

      if (event.data?.type === "EXPORT_DOCUMENT_ALL") {
        const dataAttachment = event.data.dataAttachment;
        downloadAndZipFiles(dataAttachment);
      }

      if (event.data?.type === "DATA_ROW") {
        const dataRow = event.data.data;
        const params = event.data.params;
        const listColumn = event.data.listColumn;
        const fieldName = params?.fieldName;
        if (fieldName) {
          setListDataRow((prev) => {
            // tìm xem fieldName đã tồn tại trong mảng chưa
            const idx = prev.findIndex((item) => item.fieldName === fieldName);
            if (idx !== -1) {
              // update phần tử cũ đã tồn tại
              const updated = [...prev];
              updated[idx] = { fieldName, params, dataRow, listColumn };
              return updated;
            }
            // thêm mới nếu chưa có
            return [...prev, { fieldName, params, dataRow, listColumn }];
          });
        }
      }

      if (event.data?.type === "VIEW_DOCUMENT_TAB") {
        const dataLink = event.data.dataLink;
        window.open(dataLink, "_blank", "noopener,noreferrer");
      }
    });
  }, []);

  const download = async (blob, name) => {
    await saveAs(blob, name);
  };

  const downloadAndZipFiles = async (listFile) => {
    const zip = new JSZip();
    const folder = zip.folder("files");

    // Tải từng file và thêm vào file nén
    for (const url of listFile) {
      const response = await fetch(url.fileUrl);
      const blob = await response.blob();
      const fileName = url.fileName;
      folder.file(fileName, blob);
    }

    // Tạo file nén và tải xuống
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "files.zip");
    });
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size={showFullScreen ? "xxl" : "xl"}
        // toggle={() => !isSubmit && handleClear(false)}
        toggle={() => handleClear(false)}
        className={showFullScreen ? "modal-handle-task-full" : "modal-handle-task"}
      >
        <form className="form-handle-task" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={`Cài đặt biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{dataWork?.nodeName || ""}</h4>
            </div>
            <div className="container-button">
              {!showFullScreen ? (
                <Tippy content="Mở rộng">
                  <div
                    style={{ marginBottom: 4, marginRight: 5, cursor: "pointer" }}
                    onClick={() => {
                      setShowFullScreen(true);
                    }}
                  >
                    <Icon name="ZoomInFullScreen" />
                  </div>
                </Tippy>
              ) : (
                <Tippy content="Thu nhỏ">
                  <div
                    style={{ marginBottom: 4, marginRight: 5, cursor: "pointer" }}
                    onClick={() => {
                      setShowFullScreen(false);
                    }}
                  >
                    <Icon name="ZoomOutScreen" />
                  </div>
                </Tippy>
              )}
              <Button onClick={() => handleClear(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                <Icon name="Times" />
              </Button>
            </div>
          </div>
          <ModalBody>
            <div className="container_handle_task-modal">
              {/* Form Viewer để hiển thị form => truyền vào nodeId, processId, và potId */}
              {isLoadingEngine || initFormSchema?.components?.length == 0 ? (
                <Loading />
              ) : (
                <div style={{ width: "100%", pointerEvents: dataEngine?.isReceived === 0 ? "none" : "auto" }}>
                  <FormViewerComponent
                    formContainerRef={formContainerRef}
                    formViewerRef={formViewerRef}
                    formSchema={initFormSchema}
                    onSchemaSubmit={handleSchemaSubmit}
                    setShowPopupCustom={setShowPopupCustom}
                    setCodePopupCustom={setCodePopupCustom}
                    setShowPopupCallCustomer={setShowPopupCallCustomer}
                    setDataCustomer={setDataCustomer}
                    dataInit={dataInit}
                    contextData={{
                      nodeId: contextData?.nodeId,
                      processId: contextData?.processId,
                      potId: contextData?.potId,
                      workId: dataWork?.id,
                      workName: dataWork?.nodeName,
                      procurementTypeId:
                        dataWork?.extendedData && JSON.parse(dataWork?.extendedData) && JSON.parse(dataWork?.extendedData).requestGroupCode,
                    }}
                    // showOnRejectModal={showOnRejectModal || showOnHoldModal}
                    showOnRejectModal={false}
                    onValidationError={() => {
                      // Reset submit state khi form-js có lỗi validation
                      setIsSubmit(false);
                    }}
                    setDataSchemaDraft={(data) => {
                      setDataSchemaDraft(data);
                      if (listNodeDocument && listNodeDocument.length > 0) {
                        const resultNote = listNodeDocument.map((item) => ({
                          ...item,
                          content: data[item.key] || "",
                        }));
                        setListNodeDocument(resultNote);
                      }
                    }}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                </div>
              )}

              {!dataEngine ||
              dataEngine?.isReceived === 1 ||
              dataEngine?.isProcessed === 1 ||
              isLoadingEngine ||
              isLoading ||
              initFormSchema?.components?.length === 0 ? null : (
                <div className="overlay">
                  <div className="overlay-content">
                    <p>Tiếp nhận để thực hiện công việc</p>
                  </div>
                </div>
              )}

              <OnHoldModal
                onShow={showOnHoldModal}
                data={dataWork}
                dataSchema={dataSchemaDraft}
                onHide={(reload) => {
                  if (reload) {
                    handleClear(true);
                  }
                  setShowOnHoldModal(false);
                }}
              />

              <OnRejectModal
                onShow={showOnRejectModal}
                data={dataWork}
                dataSchema={dataSchemaDraft}
                // checkIsApproval={checkIsApproval}
                dataForm={dataForm}
                checkReceived={dataEngine?.isReceived === 1 ? true : false}
                onHide={(reload) => {
                  if (reload) {
                    handleClear(true);
                  }
                  setShowOnRejectModal(false);
                }}
              />

              <ModalConfirmRelease
                onShow={showConfirmRelease}
                data={dataWork}
                dataSchema={dataSchema}
                onHide={(reload) => {
                  if (reload) {
                    handleSubmit();
                  }
                  setShowConfirmRelease(false);
                }}
              />

              {/* {(dataEngine?.isProcessed === 1) ? 
                  <div className="overlayProcessed">
                    <div className="overlay-content-Processed">
                      <p>Tiếp nhận để thực hiện công việc</p>
                    </div>
                  </div>
                  : null
                } */}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalCustomPopup
        onShow={showPopupCustom}
        codePopupCustom={codePopupCustom}
        isHandleTask={isHandleTask}
        dataWork={null}
        onHide={(reload, notClose, closeDetailWork) => {
          if (!notClose) {
            setShowPopupCustom(false);
            setCodePopupCustom("");
          }
        }}
      />

      <ModalSelectJump
        onShow={showSelectJump}
        data={null}
        onHide={(reload, isJump) => {
          if (reload) {
            handleSubmit(isJump);
          }
          setShowSelectJump(false);
        }}
      />

      <AddPhoneModal 
        onShow={showPopupCallCustomer} 
        dataCustomer={dataCustomer} 
        onHide={() => setShowPopupCallCustomer(false)} />
      
    </Fragment>
  );
}

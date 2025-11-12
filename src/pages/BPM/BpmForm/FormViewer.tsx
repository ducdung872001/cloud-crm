import React, { useEffect, useRef, useState } from "react";
import { parse, format } from "date-fns";
import { SelectOptionData } from "utils/selectCommon";
import RestService from "services/RestService";
import { Form } from "@bpmn-io/form-js-viewer";
import "./FormViewer.scss";
import { showToast } from "utils/common";
import { components } from "react-select";
import ApprovedObjectService from "services/ApprovedObjectService";
import Loading from "components/loading";
// import FormattedNumberField from "./FormattedNumberField";
// import GridExtension from "./extension/gridViewer/render";
// import RenderExtension from './extension/range/render';
// import HiddenRenderExtension from './extension/hidden/render';
// import NumberRenderExtension from './extension/number/render';

//TreeSelector
// import TreeSelectorEditorExtension from "./extension/treeSelector/render";

declare global {
  interface Window {
    handleClickGroupLabelClick?: (groupKey: string) => void;
  }
}

import "@bpmn-io/form-js/dist/assets/form-js.css";
import "@bpmn-io/form-js/dist/assets/form-js-editor.css";
import "@bpmn-io/form-js/dist/assets/form-js-playground.css";
import _ from "lodash";
import { SelectOptionEform } from "utils/apiSelectCommon";
import { CallApiCommon } from "utils/callApiCommon";
// import { SelectOptionEform } from "utils/apiSelectCommon";

//Range
// import RenderExtension from "./extension/range/render";

const FormViewerComponent = (props: any) => {
  const {
    formContainerRef,
    formViewerRef,
    formSchema,
    onSchemaSubmit,
    dataInit,
    contextData,
    showOnRejectModal,
    setDataSchemaDraft,
    setIsLoading,
    isLoading,
    setShowPopupCustom,
    setCodePopupCustom,
  } = props;

  // const formContainerRef = useRef(null);
  // const formViewerRef = useRef(null);
  const [currFormSchema, setCurrFormSchema] = useState<any>();
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);

  // useEffect(() => {
  //   window.addEventListener("message", (event) => {
  //     // Xử lý dữ liệu nhận được
  //     // console.log("Received from parent:", event.data);
  //     const loading = event.data.loading;

  //     if (loading) {
  //       setIsLoadingGrid(loading);
  //     }
  //   });
  // }, []);

  const getIframe = (condition) => {
    if (formContainerRef?.current?.querySelectorAll) {
      return Array.from(formContainerRef?.current.querySelectorAll("iframe")).find((item) => condition(item));
    }
  };

  useEffect(() => {
    if (dataInit?.field && isLoadingGrid) {
      const iframe_pvcv = getIframe((item) => {
        const src = item?.getAttribute?.("src");
        return src && src.includes("fieldName=pvcv");
      });
      if (iframe_pvcv) {
        (iframe_pvcv as HTMLIFrameElement).contentWindow.postMessage(
          {
            type: "DATA_PVCV",
            data: {
              fieldId: dataInit?.field,
              projectTypeId: dataInit?.projectCatalog,
              documentType: "pvcv",
              procurementTypeId: dataInit?.procurementType,
            },
          },
          "*"
        );
      }

      const iframe_tctn = getIframe((item) => {
        const src = item?.getAttribute?.("src");
        return src && src.includes("fieldName=tctn");
      });
      if (iframe_tctn) {
        (iframe_tctn as HTMLIFrameElement).contentWindow.postMessage(
          {
            type: "DATA_TCTN",
            data: {
              fieldId: dataInit?.field,
              projectTypeId: dataInit?.projectCatalog,
              documentType: "tctn",
              procurementTypeId: dataInit?.procurementType,
            },
          },
          "*"
        );
      }

      const iframe_ctgt = getIframe((item) => {
        const src = item?.getAttribute?.("src");
        return src && src.includes("fieldName=ctgt");
      });
      if (iframe_ctgt) {
        (iframe_ctgt as HTMLIFrameElement).contentWindow.postMessage(
          {
            type: "DATA_CTGT",
            data: {
              fieldId: dataInit?.field,
              projectTypeId: dataInit?.projectCatalog,
              documentType: "ctgt",
              procurementTypeId: dataInit?.procurementType,
            },
          },
          "*"
        );
      }

      const iframe_hsmt = getIframe((item) => {
        const src = item?.getAttribute?.("src");
        return src && src.includes("fieldName=hsmt");
      });
      if (iframe_hsmt) {
        (iframe_hsmt as HTMLIFrameElement).contentWindow.postMessage(
          {
            type: "DATA_HSMT",
            data: {
              fieldId: dataInit?.field,
              projectTypeId: dataInit?.projectCatalog,
              documentType: "hsmt",
              procurementTypeId: dataInit?.procurementType,
            },
          },
          "*"
        );
      }

      const iframe_hsdk = getIframe((item) => {
        const src = item?.getAttribute?.("src");
        return src && src.includes("fieldName=hsdk");
      });
      if (iframe_hsdk) {
        (iframe_hsdk as HTMLIFrameElement).contentWindow.postMessage(
          {
            type: "DATA_HSDK",
            data: {
              fieldId: dataInit?.field,
              projectTypeId: dataInit?.projectCatalog,
              documentType: "hsdk",
              procurementTypeId: dataInit?.procurementType,
            },
          },
          "*"
        );
      }

      const iframe_dsnt = getIframe((item) => {
        const src = item?.getAttribute?.("src");
        return src && src.includes("fieldName=dsnt");
      });
      if (iframe_dsnt) {
        (iframe_dsnt as HTMLIFrameElement).contentWindow.postMessage(
          {
            type: "DATA_DSNT",
            data: {
              fieldId: dataInit?.field,
              projectTypeId: dataInit?.projectCatalog,
              documentType: "dsnt",
              procurementTypeId: dataInit?.procurementType,
            },
          },
          "*"
        );
      }

      const iframe_khlcnt = getIframe((item) => {
        const src = item?.getAttribute?.("src");
        return src && src.includes("fieldName=khlcnt");
      });
      if (iframe_khlcnt) {
        (iframe_khlcnt as HTMLIFrameElement).contentWindow.postMessage(
          {
            type: "DATA_KHLCNT",
            data: {
              fieldId: dataInit?.field,
              projectTypeId: dataInit?.projectCatalog,
              documentType: "khlcnt",
              procurementTypeId: dataInit?.procurementType,
            },
          },
          "*"
        );
      }

      const iframe_boq = getIframe((item) => {
        const src = item?.getAttribute?.("src");
        return src && src.includes("fieldName=boq");
      });
      if (iframe_boq) {
        (iframe_boq as HTMLIFrameElement).contentWindow.postMessage(
          {
            type: "DATA_BOQ",
            data: {
              fieldId: dataInit?.field,
              projectTypeId: dataInit?.projectCatalog,
              documentType: "boq",
              procurementTypeId: dataInit?.procurementType,
            },
          },
          "*"
        );
      }

      const iframe_dmvt = getIframe((item) => {
        const src = item?.getAttribute?.("src");
        return src && src.includes("fieldName=dmvt");
      });
      if (iframe_dmvt) {
        (iframe_dmvt as HTMLIFrameElement).contentWindow.postMessage(
          {
            type: "DATA_DMVT",
            data: {
              fieldId: dataInit?.field,
              projectTypeId: dataInit?.projectCatalog,
              documentType: "dmvt",
              procurementTypeId: dataInit?.procurementType,
            },
          },
          "*"
        );
      }
    }
  }, [dataInit, isLoadingGrid]);

  //nút xoá dòng trong dynamic
  function hideRemoveButtonIfSingle() {
    document.querySelectorAll(".fjs-form-field-dynamiclist").forEach((listEl) => {
      const rows = listEl.querySelectorAll(".fjs-repeat-row-container");
      const removeBtns = listEl.querySelectorAll(".fjs-repeat-row-remove");

      if (rows.length === 1) {
        removeBtns.forEach((btn: any) => (btn.style.display = "none"));
      } else {
        removeBtns.forEach((btn: any) => (btn.style.display = ""));
      }
    });
  }

  useEffect(() => {
    // Khởi tạo Viewer
    formViewerRef.current = new Form({
      container: formContainerRef.current,

      // load rendering extension
      additionalModules: [
        // HiddenRenderExtension,
        // NumberRenderExtension
        // TreeSelectorEditorExtension
        // Đóng tạm vì gây lỗi khi build lên môi trường production
        // RenderExtension,
        // GridExtension,
      ],

      // components: {
      //   fieldRenderers: [
      //     {
      //       type: 'number',
      //       renderer: FormattedNumberField
      //     }
      //   ]
      // }
    });

    let prevValues = {};
    formViewerRef.current.on("changed", async (event) => {
      let { schema, data } = event;
      // console.log("Check grid > Changed Data =>", data);

      let components = schema.components;
      const newValues = data;

      for (const key in newValues) {
        if (!_.isEqual(newValues[key], prevValues[key])) {
          // console.log("Field thay đổi:", key, "->", newValues[key]);
          console.log("components", components);

          const keyFind = components.find((el) => el.key === key || el.path === key);
          console.log("keyFind", keyFind);

          //check nếu trường nào được binding thì sẽ không chạy vào chỗ select binding
          // // console.log("bindingTarget", keyFind?.properties?.bindingTarget);
          if (keyFind?.properties?.bindingTarget) {
            /**
             * khi thay đổi trường nào chưa bindingTarget thì mới cập nhật trường được binding
             * chỗ này check điều kiện để tránh trường hợp khi thay đổi trường được binding nó lại chạy vào hàm này thì trường được binding lại bị set lại giá trị mà lấy ra từ trường cấu hình binding
             * ý nghĩ là check nếu thay đổi giá trị trường có key === key trong binding target thì sẽ k chạy vào hàm này
             */
            if (key !== keyFind?.properties?.bindingTarget) {
              updateExpressionField(components, schema, data);
            }
          }
        }
      }
      // prevValues = { ...newValues };

      setDataSchemaDraft(data);

      //Để check khi xoá 1 dòng của dynamiclist không bị chậm 1 nhịp
      requestAnimationFrame(() => {
        hideRemoveButtonIfSingle();
      });

      // //Trường nào thay đổi
      // let components = schema.components;
      // updateExpressionField(components, schema, data);
    });
    // // Gắn sự kiện click vào container
    // const handleClick = (event: MouseEvent) => {
    //   const target = event.target as HTMLElement;
    //   // console.log("Button clicked:", event);

    //   // Kiểm tra nếu phần tử được click là button
    //   if (target.tagName === "BUTTON") {
    //     // console.log("Button clicked:", target);
    //   }
    // };

    // const container = formContainerRef.current;
    // if (container) {
    //   container.addEventListener("click", handleClick);
    // }

    const updateExpressionField = (components, schema, data) => {
      components.forEach((component) => {
        if (component.type === "expression") {
          let dataExpression = data[component.key]; //Lấy ra key
          let target = component?.properties?.bindingTarget;

          if (target) {
            if (dataExpression && dataExpression != data[target]) {
              data[target] = dataExpression;
              rerenderForm(schema, data);
            }
          }
        }

        if (component.type == "number" && component?.properties?.formula) {
          console.log("vao 2", component);
          let formula = component?.properties?.formula;
          console.log("formula122", formula);

          if (formula) {
            formula = formula.replace(/curr\.([a-zA-Z_]\w*)/g, (_, field) => data[field]);
            console.log("formula", formula);
            // data[target] = formula;
          }
        }

        if (component.type == "group") {
          let subComponents = component.components;
          updateExpressionField(subComponents, schema, data);
        }

        if (component.type == "select") {
          let dataSelect = data[component.key]; //Lấy ra key
          let target = component?.properties?.bindingTarget;
          console.log("target =>", target);
          console.log("dataSelect =>", dataSelect);

          if (target) {
            const listTarget = target.split(",").map((item) => item.trim()) || [];
            console.log("listTarget", listTarget);

            if (dataSelect) {
              //lấy ra list option để chọn
              const optionValue = component.values || [];
              //tìm giá trị vừa chọn từ list option
              const valueSelected = optionValue.find((el) => el.value === dataSelect);

              if (listTarget && listTarget.length > 0) {
                listTarget.map((item) => {
                  //gán lại giá trị binding đước lấy ra từ option trong list
                  data[item] = valueSelected && valueSelected[item] ? valueSelected[item] : "";
                });
              } else {
                //gán lại giá trị binding đước lấy ra từ option trong list
                data[target] = valueSelected && valueSelected[target] ? valueSelected[target] : "";
              }
              // rerenderForm(schema, data);
            }
          }
        }

        if (component.type === "dynamiclist") {
          component.components.forEach((componentChild) => {
            if (componentChild.type == "select") {
              data[component.path].map((el) => {
                let dataSelect = el[componentChild.key]; //Lấy ra key
                let target = componentChild?.properties?.bindingTarget;
                if (target) {
                  if (componentChild.type == "select") {
                    const listTarget = target.split(",").map((item) => item.trim()) || [];
                    if (dataSelect) {
                      const optionValue = componentChild.values || [];
                      const valueSelected = optionValue.find((el) => el.value === dataSelect);

                      if (listTarget && listTarget.length > 0) {
                        listTarget.map((item) => {
                          el[item] = valueSelected && valueSelected[item] ? valueSelected[item] : "";
                        });
                      } else {
                        el[target] = valueSelected && valueSelected[target] ? valueSelected[target] : "";
                      }
                    }
                  }
                }
              });
            }

            if (componentChild.type == "number") {
              if (componentChild.type == "number" && componentChild?.properties?.formula) {
                let formula = componentChild?.properties?.formula;
                if (formula && componentChild?.properties?.formula) {
                  data[component.path].map((el) => {
                    formula = formula.replace(/curr\.([a-zA-Z_]\w*)/g, (_, field) => el[field]);
                    console.log("formula", eval(formula));
                    el[componentChild?.key] = eval(formula);
                  });
                }
              }
            }
          });
        }
      });
    };

    /**
     * Mất focus có load dữ liệu để binding ra trường khác hay không
     */
    formViewerRef.current.on("formField.blur", async (event) => {
      // console.log("Event blur =>", event);

      let formData = formViewerRef.current._getState().data;
      // console.log("Current formData blur:", formData);

      const nodeId = contextData?.nodeId;
      const potId = contextData?.potId;
      const processId = contextData?.processId;

      const formField = event.formField;

      const codeTemplateEform = formField?.properties?.codeTemplateEform;
      if (setShowPopupCustom && codeTemplateEform) {
        setShowPopupCustom(true);
        setCodePopupCustom(codeTemplateEform);
      }

      //1. Loại là select
      if (formField.type == "select") {
        let trigger = formField?.properties?.trigger || "";
        // console.log("Trigger Type blur =>", trigger);

        //Tồn tại trường binding
        let attrs = formField?.properties;
        if (trigger && trigger == "blur") {
          //Lấy ra properties
          let attrs = formField?.properties;
          if (attrs?.apiUrl) {
            //Gọi về để xử lý
            let params = { ...attrs, nodeId, potId, processId };

            //Tiền xử lý apiParams (Nếu là curr. thì lấy dữ liệu được binding từ form)
            let apiParams = params.apiParams;

            //Chia thông tin ra
            if (apiParams) {
              // Hàm thay thế các biến có tiền tố "curr"
              apiParams = apiParams.replace(/curr\.(\w+)/g, (match, key) => {
                // Truy cập giá trị từ formData
                const value = formData[key];
                // Nếu không có giá trị, trả về `null`, ngược lại trả về giá trị
                return value !== undefined && value !== null ? value : "null";
              });

              // console.log("apiParams after =>", apiParams);
              params.apiParams = apiParams;
            }

            // console.log("params from api =>", params);
            const resp = await RestService.post(params);

            //Lấy ra kết quả resp.result => array|object|scalar
            // console.log("resp from api =>", resp?.result);

            //Kiểm tra kiểu hỗ trợ binding là gì
            //1. array => binding ra table
            let updatedFormSchema = null;
            if (attrs.apiOutputType == "array") {
              updatedFormSchema = bindingToTable(attrs, resp);
            }

            //2. object|scalar => Ra trường nào đó
            if (attrs.apiOutputType == "object") {
              //Lấy ra các trường target cần phải binding
              // console.log("object type =>", attrs.apiOutputType);

              //Làm thay đổi giá trị của formData
              formData = bindingToFields(resp?.result, formData);
            }

            rerenderForm(updatedFormSchema, formData);
          }
        }
      }
    });

    formViewerRef.current.on("formField.focus", async (event) => {
      console.log("Event focus =>", event);

      let formData = formViewerRef.current._getState().data;

      const nodeId = contextData?.nodeId;
      const potId = contextData?.potId;
      const processId = contextData?.processId;

      //Nếu là select, thì cần được load lại danh sách dựa trên thông tin ràng buộc
      const formField = event.formField;

      //1. Loại là select
      if (formField.type == "select") {
        let fields = formField?.properties?.binding || ""; //Trả về departmentId
        // console.log("fields =>", fields);
        let apiUrl = formField?.properties?.apiUrl || "";

        //Tồn tại trường binding
        if (fields) {
          let arrField = fields.split(",");
          // console.log("arrField", arrField);

          let params = {};

          for (let index = 0; index < arrField.length; index++) {
            let field = arrField[index].trim();
            // console.log("field =>", field);

            let value = formData[field] ?? 0;
            params = { ...params, [field]: value };
          }

          // console.log("params =>", params);

          let dataOption;
          if (apiUrl) {
            dataOption = await SelectOptionEform(formField.key, apiUrl, { ...params, status: 1 });
          } else {
            dataOption = await SelectOptionData(formField.key, params);
          }
          formField.values = dataOption || [];
          delete formField.valuesKey; //Phải xóa đi mới hiển thị lên được
          // // rerenderForm(currFormSchema, formData);
        }
      }

      //2. Loại là button
      if (formField.type == "button") {
        //Lấy ra properties
        let attrs = formField?.properties;
        if (attrs?.apiUrl) {
          //Gọi về để xử lý
          let params = { ...attrs, nodeId, potId, processId };

          //Tiền xử lý apiParams (Nếu là curr. thì lấy dữ liệu được binding từ form)
          let apiParams = params.apiParams;

          //Chia thông tin ra
          if (apiParams) {
            // Hàm thay thế các biến có tiền tố "curr"
            apiParams = apiParams.replace(/curr\.(\w+)/g, (match, key) => {
              // Truy cập giá trị từ formData
              const value = formData[key];
              // Nếu không có giá trị, trả về `null`, ngược lại trả về giá trị
              return value !== undefined && value !== null ? value : "null";
            });

            // console.log("apiParams after =>", apiParams);
            params.apiParams = apiParams;
          }
          console.log("apiParams", apiParams);

          const paramsTotal = Object.fromEntries(
            apiParams.split(",").map((part) => {
              const [key, ...rest] = part.split("=");
              const value = rest.join("=").trim(); // ghép lại phần sau dấu "="
              return [key.trim(), value];
            })
          );

          // console.log("params from api =>", params);
          // const resp = await RestService.post(params);
          const resp = await CallApiCommon(attrs?.apiUrl, { ...paramsTotal });

          //Lấy ra kết quả resp.result => array|object|scalar
          // console.log("resp from api =>", resp?.result);

          //Kiểm tra kiểu hỗ trợ binding là gì
          //1. array => binding ra table
          let updatedFormSchema = null;
          if (attrs.apiOutputType == "array") {
            updatedFormSchema = bindingToTable(attrs, resp);
            // console.log("F1 =>", updatedFormSchema);
          }

          //2. object|scalar => Ra trường nào đó
          if (attrs.apiOutputType == "object") {
            // console.log("F2 =>");

            //Lấy ra các trường target cần phải binding
            // console.log("object type =>", attrs.apiOutputType);

            //Làm thay đổi giá trị của formData
            formData = bindingToFields(resp?.result, formData);
          }

          rerenderForm(updatedFormSchema, formData);
        }
      }

      //Trường hợp reset co callback => Thực hiện callback
      if (formField?.action == "reset") {
        // console.log("reset action");
        let attrs = formField?.properties;
        if (attrs?.callback) {
          document.location = attrs.callback;
        }
      }

      if (formField?.action == "submit") {
        const codeTemplateEform = formField?.properties?.codeTemplateEform;
        // console.log("codeTemplateEform", codeTemplateEform);
        if (codeTemplateEform) {
          if (setShowPopupCustom) {
            setShowPopupCustom(true);
          }
          setCodePopupCustom(codeTemplateEform);
        }
      }
    });

    /**
     * Binding kết quả ra bảng (table)
     * @param attrs
     * @param resp
     */
    const bindingToTable = (attrs, resp) => {
      // console.log("bindingToTable =>", currFormSchema);

      currFormSchema?.components.forEach((component) => {
        //group: L0 (Trực tiếp)
        if (component.type === "table") {
          if (component.dataSource == "=" + attrs.apiTarget) {
            component.extraDataSource = component.dataSource;
            component.dataSource = resp?.result;
          } else if (component?.extraDataSource == "=" + attrs.apiTarget) {
            component.dataSource = resp?.result;
          }
        }

        //group: L1
        if (component.type == "group") {
          let subComponents = component.components;
          bindingTableField(attrs, subComponents, resp);
        }
      });

      return currFormSchema;
    };

    /**
     * Cho phép lặp nhiều cấp
     * @param attrs
     * @param components
     * @param resp
     */
    const bindingTableField = (attrs, components, resp) => {
      components.forEach((component) => {
        if (component.type === "table") {
          if (component.dataSource == "=" + attrs.apiTarget) {
            component.extraDataSource = component.dataSource;
            component.dataSource = resp?.result;
          } else if (component?.extraDataSource == "=" + attrs.apiTarget) {
            component.dataSource = resp?.result;
          }
        }

        //group: L3
        if (component.type == "group") {
          let subComponents = component.components;
          bindingTableField(attrs, subComponents, resp);
        }
      });
    };

    //Thư viện các bộ converter
    /**
     *
     * @param {string} sourceDate - Dữ liệu nguồn (chuỗi ngày tháng)
     * @param {string} fmtSource - Định dạng dữ liệu nguồn
     * @param {string} fmtTarget - Định dạng dữ liệu đích
     * @returns {string} - Chuỗi ngày tháng sau khi chuyển đổi sang định dạng đích
     */
    const converterDate = (sourceDate, fmtSource, fmtTarget) => {
      if (!sourceDate || !fmtSource || !fmtTarget) {
        throw new Error("Invalid arguments: sourceDate, fmtSource, and fmtTarget are required");
      }

      try {
        // Parse ngày từ dữ liệu nguồn theo định dạng nguồn
        const parsedDate = parse(sourceDate, fmtSource, new Date());

        // Format ngày sang định dạng đích
        return format(parsedDate, fmtTarget);
      } catch (error) {
        console.error("Error in converting date:", error.message);
        throw new Error("Date conversion failed. Please check the formats and source date.");
      }
    };

    /**
     * Chuyển đổi boolean sang string
     * @param booleanValue
     * @returns
     */
    const convertBooleanToString = (booleanValue) => {
      const stringValue = booleanValue + "";
      return stringValue;
    };

    /**
     * Binding một đối tượng ra các trường trên form
     * @param formData
     * @param resp
     */
    const bindingToFields = (resp, formData) => {
      bindingLoopToFields(resp, formData, currFormSchema.components);
      return formData;
    };

    const bindingLoopToFields = (resp, formData, components) => {
      components.forEach((component) => {
        if (component?.key && resp.hasOwnProperty(component.key)) {
          formData[component.key] = resp[component.key];
          let props = component?.properties;

          if (props?.formatter) {
            //Nếu có bộ format => chuyển đổi
            switch (props.formatter) {
              case "date":
                formData[component.key] = converterDate(formData[component.key], props?.fmtSource, props?.fmtTarget);
                break;
              case "booleanToString":
                formData[component.key] = convertBooleanToString(formData[component.key]);
                break;
            }
          }
        }

        if (component.type == "group") {
          let subComponents = component.components;
          bindingLoopToFields(resp, formData, subComponents);
        }
      });
    };

    /**
     * Tìm kiếm trên trường => Load theo từ khóa
     */
    formViewerRef.current.on("formField.search", async (event) => {
      // // console.log('event search =>', event);
      // // console.log('event search value =>', event.value);
      const name = event.value;
      const formField = event.formField;

      //Gán lại
      if (formField.type == "select") {
        //Lấy ra các thuộc tính của nó
        //Binding với giá trị đã được chọn ở trên form
        /** Đừng mở 2 dòng dưới đây, vì mở ra là gây lỗi reset cho các select đã chọn trước đó */
        // const dataOption = await SelectOptionData(formField.key, { name });
        // formField.values = dataOption || [];
      }
    });

    formViewerRef.current.on("formField.click", (event) => {
      // console.log("Button click event:", event);
      // const buttonField = event.formField;
      // if (buttonField.type === "button") {
      //   // console.log("Button clicked:", buttonField);
      //   // Thực hiện logic tùy chỉnh
      //   if (buttonField.key === "customButton") {
      //     // console.log("Custom button logic executed!");
      //     showToast("Bạn đã bấm nút tùy chỉnh!", "success");
      //   }
      // }
    });

    formViewerRef.current.on("submit", (event) => {
      // Lặp qua các components trong đầu vào
      formSchema.components.forEach((component) => {
        // Kiểm tra nếu component có type là 'iframe'
        if (component.type === "button") {
          // console.log("iframe", component.url);

          //Đoạn xử lý dùng theo link tương đối không cần phải nhập trước https://
          let componentUrl = "";
          if (component.url?.includes("https://")) {
            componentUrl = component.url;
          } else {
            componentUrl = `${process.env.APP_LINK}${component.url}`;
          }
          // console.log("componentUrl", componentUrl);

          // Lấy fieldName từ properties.name, nếu không có thì gán giá trị mặc định là 'undefined'
          const codeTemplateEform = component?.properties?.codeTemplateEform || "undefined";
          // console.log("codeTemplateEform", codeTemplateEform);
        }
      });

      // setShowPopupCustom(true);

      const validationErrors = formViewerRef.current.validate();
      // console.log("validationErrors", validationErrors);

      // Convert validationErrors object into an array of keys
      const errorFields = Object.keys(validationErrors);
      if (!showOnRejectModal) {
        if (errorFields.length > 0) {
          showToast("Các trường bắt buộc không được để trống", "error");
          // // console.log('Object.entries(validationErrors)', Object.entries(validationErrors));
          // Duyệt qua các lỗi và thay thế thông báo
          for (const fieldId in validationErrors) {
            validationErrors[fieldId] = validationErrors[fieldId].map((error) => {
              if (error === "Field is required.") {
                return "Không được để trống.";
              }
              return error;
            });
          }
          // return;
        }
      }
      const formData = event.data;

      // // Kiểm tra nếu dữ liệu hợp lệ
      // if (!formData.name || !formData.email) {
      //   // console.log('Form không hợp lệ');
      //   return;
      // }
      // Xử lý dữ liệu hợp lệ
      // console.log("Form submitted:", formData);
      // onSchemaSubmit(formData, showOnRejectModal);
      onSchemaSubmit(formData, errorFields);
    });

    /**
     * Hiển thị lại form khi cần thiết
     * @param formData
     */
    const rerenderForm = (updatedFormSchema, formData) => {
      let updatedSchema = updatedFormSchema ? updatedFormSchema : currFormSchema;
      formViewerRef?.current
        .importSchema(updatedSchema, formData)
        .then(() => {
          // console.log("Form đã được hiển thị 1");
        })
        .catch((err) => {
          console.error("Lỗi khi tải lại form 1", err);
        });
    };

    // Định nghĩa hàm bất đồng bộ trong useEffect để sử dụng await
    const initializeForm = async () => {
      // Xử lý nếu là iframe (Dùng cho ảnh)
      let updatedFormSchema = updateIframeLinks(formSchema);

      // Xử lý nếu là button (Ví dụ chuyển đổi từ type=... sang type được chỉ định)
      updatedFormSchema = updateButtons(updatedFormSchema);

      // Xử lý khởi tạo các trường select trong form
      updatedFormSchema = await initBindingData(updatedFormSchema);

      // Import schema vào Viewer
      if (dataInit) {
        formViewerRef.current
          .importSchema(updatedFormSchema, dataInit)
          .then(() => {
            setCurrFormSchema(updatedFormSchema);
          })
          .catch((err) => {
            console.error("Lỗi khi tải form 1:", err);
          });
        setIsLoading(false);
      } else {
        formViewerRef.current
          .importSchema(updatedFormSchema)
          .then(() => {
            setCurrFormSchema(updatedFormSchema);
          })
          .catch((err) => {
            console.error("Lỗi khi tải form 2:", err);
          });
        setIsLoading(false);
      }
    };

    // Gọi hàm async
    initializeForm();

    return () => {
      if (formViewerRef.current) {
        formViewerRef.current.destroy();
      }
    };
    // }, [formSchema, dataInit, currFormSchema, showOnRejectModal]);
  }, [formSchema, dataInit, currFormSchema]);

  useEffect(() => {
    // console.log("currFormSchema changed =>", currFormSchema);
  }, [currFormSchema]);

  /**
   * Thay đổi link của iframe để chứa thông tin nodeId, potId, processId
   * @param link
   */
  const updateIframeLinks = (updatedFormSchema) => {
    const nodeId = contextData?.nodeId;
    const potId = contextData?.potId;
    const processId = contextData?.processId;
    const workId = contextData?.workId;
    const procurementType = contextData?.procurementTypeId === "02" ? "tvtk" : null;

    // Lặp qua các components trong đầu vào
    updatedFormSchema.components.forEach((component) => {
      // Kiểm tra nếu component có type là 'iframe'
      if (component.type === "iframe" && component.url) {
        // console.log("iframe", component.url);

        //Đoạn xử lý dùng theo link tương đối không cần phải nhập trước https://
        let componentUrl = "";
        if (component.url?.includes("https://") || component.url?.includes("http://")) {
          componentUrl = component.url;
        } else {
          componentUrl = `${process.env.APP_CRM_LINK}${component.url}`;
        }

        console.log("componentUrl", componentUrl);

        // Lấy fieldName từ properties.name, nếu không có thì gán giá trị mặc định là 'undefined'
        const fieldName = component?.properties?.name || "undefined";
        const enableAddRow = component?.properties?.enableAddRow || "true";
        const enableAddColumns = component?.properties?.enableAddColumns || "true";
        const enableExport = component?.properties?.enableExport || "true";
        const enableImport = component?.properties?.enableImport || "true";
        const enableAddCmtCell = component?.properties?.enableAddCmtCell || "true";
        const enableAddCmtCol = component?.properties?.enableAddCmtCol || "true";
        const enableSave = component?.properties?.enableSave || "true";
        const enableEditCell = component?.properties?.enableEditCell || "true";
        const documentType = component?.properties?.documentType || "undefined";
        const link = component?.properties?.link || "undefined";
        const apiParams = component?.properties?.apiParams || "undefined";

        // Tạo URL mới bằng cách thêm các tham số nodeId, potId, processId
        const url = new URL(componentUrl);
        url.searchParams.append("nodeId", nodeId);
        url.searchParams.append("potId", potId);
        url.searchParams.append("processId", processId);
        url.searchParams.append("fieldName", fieldName);
        url.searchParams.append("documentType", documentType);
        url.searchParams.append("link", link);
        url.searchParams.append("workId", workId);
        if (procurementType) {
          url.searchParams.append("procurementType", procurementType);
        }
        if (apiParams) {
          url.searchParams.append("apiParams", apiParams);
        }

        url.searchParams.append("enableAddRow", enableAddRow);
        url.searchParams.append("enableAddColumns", enableAddColumns);
        url.searchParams.append("enableExport", enableExport);
        url.searchParams.append("enableImport", enableImport);
        url.searchParams.append("enableAddCmtCell", enableAddCmtCell);
        url.searchParams.append("enableAddCmtCol", enableAddCmtCol);
        url.searchParams.append("enableSave", enableSave);
        url.searchParams.append("enableEditCell", enableEditCell);

        // Cập nhật URL mới vào component
        component.url = url.toString();
        component.sandbox = "allow-forms allow-scripts allow-same-origin";
      }
    });

    // Trả về dữ liệu đã được cập nhật
    return updatedFormSchema;
  };

  /**
   * Biến đổi các button để
   * 1. Thay đổi thuộc tính mặc định
   * 2. THay đổi hành vi đặc biệt (ví dụ click button thì gọi API ...)
   * @param updatedFormSchema
   * @returns
   */
  const updateButtons = (updatedFormSchema) => {
    // Lặp qua các components trong đầu vào
    updatedFormSchema.components.forEach((component) => {
      if (component.type === "button" && component?.properties) {
        let attrs = component.properties;
        if (attrs.type) {
          component.action = attrs.type;
        }
      }

      if (component.type === "group") {
        updateComponents(component.components);
      }
    });

    // Trả về dữ liệu đã được cập nhật
    return updatedFormSchema;
  };

  /**
   * Xử lý lặp nhiều tầng
   * @param components
   */
  const updateComponents = (components) => {
    components.forEach((component) => {
      if (component.type === "button" && component?.properties) {
        let attrs = component.properties;
        if (attrs.type) {
          component.action = attrs.type;
        }
      }

      if (component.type === "group") {
        updateComponents(component.components);
      }
    });
  };

  /**
   * Khởi tạo các dữ liệu động trên form (Master Data trong trường select)
   */
  const initBindingData = async (updatedFormSchema) => {
    const nodeId = contextData?.nodeId;
    const potId = contextData?.potId;
    const processId = contextData?.processId;
    let filterItems = [];

    //Kiểm tra có các trường hợp select (mà có valuesKey => Thực hiện khởi tạo dữ liệu)
    updatedFormSchema.components.forEach((component) => {
      let apiUrl = component?.properties?.apiUrl || "";
      // Kiểm tra nếu component có type là 'select'
      if (component.type === "group") {
        if (!component.label?.includes("▼") && !component.label?.includes("▲")) {
          component.label += " ▲";
          component.properties = {
            ...component.properties,
            labelId: `group-label-${component.key}`,
          };
        }

        // Xử lý các group lồng nhau
        component.components?.forEach((componentL1) => {
          if (componentL1.type === "group") {
            if (!componentL1.label?.includes("▼") && !componentL1.label?.includes("▲")) {
              componentL1.label += " ▲";
              componentL1.properties = {
                ...componentL1.properties,
                labelId: `group-label-${componentL1.key}`,
              };
            }

            // Nếu có group sâu hơn nữa
            componentL1.components?.forEach((componentL2) => {
              if (componentL2.type === "group") {
                if (!componentL2.label?.includes("▼") && !componentL2.label?.includes("▲")) {
                  componentL2.label += " ▲";
                  componentL2.properties = {
                    ...componentL2.properties,
                    labelId: `group-label-${componentL2.key}`,
                  };
                }
              }
            });
          }
        });
      }
      if (component.type === "select" && component.valuesKey) {
        // Lấy valuesKey từ component,
        // Lấy ra các tham số được gán khởi tạo
        // Thực hiện lưu lại mappers đối với những trường hợp không chuẩn, để biến đổi dữ liệu
        let key = component.valuesKey;
        let params = component.properties?.params || "";
        params = [];
        filterItems.push({ key, params, compKey: component.key, type: "select", apiUrl: apiUrl });
      }

      //Lặp cấp L1
      if (component.type == "group") {
        let componentsL1 = component.components;
        componentsL1.forEach((componentL1) => {
          // Kiểm tra nếu component có type là 'select'
          if (componentL1.type === "select" && componentL1.valuesKey) {
            // Lấy valuesKey từ component,
            // Lấy ra các tham số được gán khởi tạo
            // Thực hiện lưu lại mappers đối với những trường hợp không chuẩn, để biến đổi dữ liệu
            let key = componentL1.valuesKey;
            let params = componentL1.properties?.params || "";
            params = [];
            filterItems.push({ key, params, compKey: componentL1.key, type: "select" });
          }

          //Lặp cấp L2
          if (componentL1.type == "group") {
            let componentsL2 = componentL1.components;
            componentsL2.forEach((componentL2) => {
              // Kiểm tra nếu component có type là 'select'
              if (componentL2.type === "select" && componentL2.valuesKey) {
                // Lấy valuesKey từ component,
                // Lấy ra các tham số được gán khởi tạo
                // Thực hiện lưu lại mappers đối với những trường hợp không chuẩn, để biến đổi dữ liệu
                let key = componentL2.valuesKey;
                let params = componentL2.properties?.params || "";
                params = [];
                filterItems.push({ key, params, compKey: componentL2.key, type: "select" });
              }

              //Lặp cấp L3
              if (componentL2.type == "group") {
                let componentsL3 = componentL2.components;
                componentsL3.forEach((componentL3) => {
                  // Kiểm tra nếu component có type là 'select'
                  if (componentL3.type === "select" && componentL3.valuesKey) {
                    // Lấy valuesKey từ component,
                    // Lấy ra các tham số được gán khởi tạo
                    // Thực hiện lưu lại mappers đối với những trường hợp không chuẩn, để biến đổi dữ liệu
                    let key = componentL3.valuesKey;
                    let params = componentL3.properties?.params || "";
                    params = [];
                    filterItems.push({ key, params, compKey: componentL3.key, type: "select" });
                  }
                });
              }
            });
          }
        });
      }

      //Lịch sử phê duyệt
      if (component.type === "table") {
        let params = component.properties || "";
        if (params && params?.type == "approval" && params?.controlType == "list") {
          filterItems.push({ key: component.id, params: { groupCode: params?.groupCode, potId, processId }, type: "log" });
        }
      }

      //Xử lý khởi tạo cho thằng dynamicList
      if (component.type == "dynamiclist") {
        let nestedComponents = component.components;
        nestedComponents.forEach((nestedComponent) => {
          // Kiểm tra nếu component có type là 'select'
          if (nestedComponent.type === "select" && nestedComponent.valuesKey) {
            // Lấy valuesKey từ component,
            // Lấy ra các tham số được gán khởi tạo
            // Thực hiện lưu lại mappers đối với những trường hợp không chuẩn, để biến đổi dữ liệu
            let key = nestedComponent.valuesKey;
            let params = nestedComponent.properties?.params || "";
            params = [];
            filterItems.push({ key, params, compKey: nestedComponent.key, type: "select" });
          }
        });
      }
    });

    //Lặp tiến hành binding
    for (let index = 0; index < filterItems.length; index++) {
      let filterItem = filterItems[index];

      if (filterItem.type == "select") {
        //Đã là 1 dạng list gồm {label, value}
        let dataOption;
        if (filterItem?.apiUrl) {
          dataOption = await SelectOptionEform(filterItem.key, filterItem?.apiUrl, { ...filterItem.params, status: 1 });
        } else {
          dataOption = await SelectOptionData(filterItem.key, filterItem.params);
        }

        //Lưu trang là số 1 => Đăng ký lắng nghe sự kiện scroll
        updatedFormSchema.components.forEach((component) => {
          // Kiểm tra nếu component có type là 'select'
          if (component.type === "select" && component.key == filterItem.compKey) {
            // Cập nhật lại vào component trường values
            // console.log("dataOption =>", dataOption);
            // console.log("valuesKey =>", component.key);
            component.values = dataOption || [];
            delete component.valuesKey;
          }

          //Lặp cấp L1
          if (component.type == "group") {
            let componentsL1 = component.components;
            componentsL1.forEach((componentL1) => {
              if (componentL1.type === "select" && componentL1.key == filterItem.compKey) {
                componentL1.values = dataOption || [];
                delete componentL1.valuesKey;
              }

              //Lặp cấp L2
              if (componentL1.type == "group") {
                let componentsL2 = componentL1.components;
                componentsL2.forEach((componentL2) => {
                  if (componentL2.type === "select" && componentL2.key == filterItem.compKey) {
                    componentL2.values = dataOption || [];
                    delete componentL2.valuesKey;
                  }

                  //Lặp cấp L3
                  if (componentL2.type == "group") {
                    let componentsL3 = componentL2.components;
                    componentsL3.forEach((componentL3) => {
                      if (componentL3.type === "select" && componentL3.key == filterItem.compKey) {
                        componentL3.values = dataOption || [];
                        delete componentL3.valuesKey;
                      }
                    });
                  }
                });
              }
            });
          }

          if (component.type == "dynamiclist") {
            let nestedComponents = component.components;
            nestedComponents.forEach((nestedComponent) => {
              // Kiểm tra nếu component có type là 'select'
              if (nestedComponent.type === "select" && nestedComponent.key == filterItem.compKey) {
                // Cập nhật lại vào component trường values
                // console.log("valuesKey =>", nestedComponent.key);
                nestedComponent.values = dataOption || [];
                delete nestedComponent.valuesKey;
              }
            });
          }
        });
      }

      if (filterItem.type == "log") {
        const dataOption = await ApprovedObjectService.list(filterItem.params);

        // Thực hiện binding ngược lại vào table
        updatedFormSchema.components.forEach((component) => {
          // Kiểm tra nếu component có type là 'select'
          if (component.type === "table" && component.id == filterItem.key) {
            // Cập nhật lại vào component trường values
            // console.log("valuesKey =>", component.key);
            component.dataSource = dataOption?.result || [];
          }
        });
      }
    }

    // Trả về dữ liệu đã được cập nhật
    return updatedFormSchema;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const groupLabels = document.querySelectorAll('[class^="fjs-form-field-label"]');

      groupLabels.forEach((labelEl) => {
        const label = labelEl as HTMLElement;

        if (label.textContent?.includes("▼") || label.textContent?.includes("▲")) {
          label.style.cursor = "pointer";

          label.addEventListener("click", () => {
            // 🔁 Duyệt lên để tìm group wrapper (cha chứa toàn bộ field)
            let parent = label.parentElement;
            while (parent && !parent.classList.contains("fjs-form-field")) {
              parent = parent.parentElement;
            }

            if (!parent) {
              console.warn("⚠️ Không tìm thấy phần tử group (fjs-form-field)");
              return;
            }

            // 🔽 Tìm phần nội dung để toggle (field wrapper)
            const contentEl = Array.from(parent.children).find((el) => el !== labelEl) as HTMLElement;

            if (contentEl) {
              contentEl.classList.add("collapsible-group");
              const isCollapsed = contentEl.classList.toggle("collapsing");
              const isHidden = contentEl.classList.toggle("hidden");

              if (isCollapsed) {
                contentEl.style.maxHeight = contentEl.scrollHeight + "px";
                setTimeout(() => {
                  contentEl.style.maxHeight = "0px";
                }, 10);
              } else {
                contentEl.style.maxHeight = contentEl.scrollHeight + "px";
                setTimeout(() => {
                  contentEl.style.maxHeight = "none";
                }, 300);
              }

              if (label.textContent?.includes("▲") && isHidden) {
                label.textContent = label.textContent.replace("▲", "▼");
              } else if (label.textContent?.includes("▼") && !isHidden) {
                label.textContent = label.textContent.replace("▼", "▲");
              }
            } else {
              console.warn("⚠️ Không tìm thấy nội dung trong group");
            }
          });
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* <h2>Form Viewer</h2> */}
      {isLoading ? (
        <Loading />
      ) : (
        // Container cho form
        <div className="okok" ref={formContainerRef}></div>
      )}
    </div>
  );
};

export default FormViewerComponent;

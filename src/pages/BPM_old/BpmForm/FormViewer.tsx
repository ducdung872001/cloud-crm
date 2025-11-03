import React, { useEffect, useRef, useState } from "react";
import { parse, format } from "date-fns";
import { SelectOptionData } from "utils/selectCommon";
import RestService from "services/RestService";
import { Form } from "@bpmn-io/form-js-viewer";
import "./FormViewer.scss";
import { showToast } from "utils/common";
import { components } from "react-select";

const FormViewerComponent = ({ formSchema, onSchemaSubmit, dataInit, contextData }) => {
  console.log("dataInit", dataInit);

  const formContainerRef = useRef(null);
  const formViewerRef = useRef(null);
  const [currFormSchema, setCurrFormSchema] = useState<any>();

  console.log("currFormSchemaX =>", currFormSchema);

  // // Hàm format số với dấu phẩy
  // function formatNumberWithCommas(value) {
  //   console.log('value', value);

  //   console.log('typeof value',typeof value);
  //   const convertValue = value.toString();

  //   // Loại bỏ dấu phẩy (nếu có) và chuyển thành số hợp lệ
  //   if (typeof convertValue === 'string') {
  //     value = value.replace(/,/g, ''); // Loại bỏ dấu phẩy
  //   }
  //   const number = parseFloat(value);

  //   if (isNaN(number)) {
  //     return value; // Nếu không phải số hợp lệ, trả về giá trị gốc
  //   }

  //   // Định dạng với dấu phẩy
  //   return number.toLocaleString(); // Ví dụ: 1000 -> 1,000
  // }

  useEffect(() => {
    // Khởi tạo Viewer
    formViewerRef.current = new Form({
      container: formContainerRef.current,
    });

    function formatNumberWithCommas(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    formViewerRef.current.on("changed", (event) => {
      let { data } = event;
      console.log("Changed Data =>", data);

      //Trường nào thay đổi
      const { schema } = event;
      let components = schema.components;
      updateExpressionField(components, schema, data);

      // Kiểm tra và format các trường kiểu number
      // for (const [key, value] of Object.entries(data)) {
      //   if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value))) {
      //     // Format số theo dấu phẩy (thêm dấu ',' vào hàng nghìn)
      //     let formattedValue = formatNumberWithCommas(value);
      //     console.log(`Formatted Value for ${key}:`, formattedValue);

      //     // Cập nhật lại giá trị sau khi format
      //     data[key] = formattedValue;
      //   }
      // }
      //Kiểm tra nó có kích hoạt sự thay đổi nào khác không
      //Kiểm tra sự scroll của thành phần trên form
    });

    const updateExpressionField = (components, schema, data) => {
      components.forEach((component) => {
        if (component.type === "expression") {
          let dataExpression = data[component.key]; //Lấy ra key
          let target = component?.properties?.bindingTarget;
          console.log("target =>", target);
          console.log("dataExpression =>", dataExpression);

          if (target) {
            if (dataExpression && dataExpression != data[target]) {
              data[target] = dataExpression;
              rerenderForm(schema, data);
            }
          }
        }

        if (component.type == "group") {
          let subComponents = component.components;
          updateExpressionField(subComponents, schema, data);
        }
      });
    };

    /**
     * Mất focus có load dữ liệu để binding ra trường khác hay không
     */
    formViewerRef.current.on("formField.blur", async (event) => {
      console.log("Event blur =>", event);

      let formData = formViewerRef.current._getState().data;
      console.log("Current formData:", formData);

      const nodeId = contextData?.nodeId;
      const potId = contextData?.potId;
      const processId = contextData?.processId;

      const formField = event.formField;

      //1. Loại là select
      if (formField.type == "select") {
        let trigger = formField?.properties?.trigger || "";
        console.log("Trigger Type =>", trigger);

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

              console.log("apiParams after =>", apiParams);
              params.apiParams = apiParams;
            }

            console.log("params from api =>", params);
            const resp = await RestService.post(params);

            //Lấy ra kết quả resp.result => array|object|scalar
            console.log("resp from api =>", resp?.result);

            //Kiểm tra kiểu hỗ trợ binding là gì
            //1. array => binding ra table
            let updatedFormSchema = null;
            if (attrs.apiOutputType == "array") {
              updatedFormSchema = bindingToTable(attrs, resp);
            }

            //2. object|scalar => Ra trường nào đó
            if (attrs.apiOutputType == "object") {
              console.log("F2 =>");

              //Lấy ra các trường target cần phải binding
              console.log("object type =>", attrs.apiOutputType);

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
      console.log("Current formData:", formData);

      const nodeId = contextData?.nodeId;
      const potId = contextData?.potId;
      const processId = contextData?.processId;

      //Nếu là select, thì cần được load lại danh sách dựa trên thông tin ràng buộc
      const formField = event.formField;

      //1. Loại là select
      if (formField.type == "select") {
        let fields = formField?.properties?.binding || ""; //Trả về departmentId
        console.log("fields =>", fields);

        //Tồn tại trường binding
        if (fields) {
          let arrField = fields.split(",");
          let params = {};

          for (let index = 0; index < arrField.length; index++) {
            let field = arrField[index].trim();
            console.log("field =>", field);

            let value = formData[field] ?? 0;
            params = { ...params, [field]: value };
          }

          console.log("params =>", params);

          const dataOption = await SelectOptionData(formField.key, params);
          formField.values = dataOption || [];
          delete formField.valuesKey; //Phải xóa đi mới hiển thị lên được
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

            console.log("apiParams after =>", apiParams);
            params.apiParams = apiParams;
          }

          console.log("params from api =>", params);
          const resp = await RestService.post(params);

          //Lấy ra kết quả resp.result => array|object|scalar
          console.log("resp from api =>", resp?.result);

          //Kiểm tra kiểu hỗ trợ binding là gì
          //1. array => binding ra table
          let updatedFormSchema = null;
          if (attrs.apiOutputType == "array") {
            updatedFormSchema = bindingToTable(attrs, resp);
            console.log("F1 =>", updatedFormSchema);
          }

          //2. object|scalar => Ra trường nào đó
          if (attrs.apiOutputType == "object") {
            console.log("F2 =>");

            //Lấy ra các trường target cần phải binding
            console.log("object type =>", attrs.apiOutputType);

            //Làm thay đổi giá trị của formData
            formData = bindingToFields(resp?.result, formData);
          }

          rerenderForm(updatedFormSchema, formData);
        }
      }

      //Trường hợp reset co callback => Thực hiện callback
      if (formField?.action == "reset") {
        console.log("reset action");
        let attrs = formField?.properties;
        if (attrs?.callback) {
          document.location = attrs.callback;
        }
      }
    });
    /**
     * Binding kết quả ra bảng (table)
     * @param attrs
     * @param resp
     */
    const bindingToTable = (attrs, resp) => {
      console.log("bindingToTable =>", currFormSchema);

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

      console.log("currFormSchema =>", currFormSchema);
      console.log("currFormSchema  resp=>", resp);
      console.log("currFormSchema formData =>", formData);
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
      // console.log('event search =>', event);
      // console.log('event search value =>', event.value);
      const name = event.value;
      const formField = event.formField;

      //Gán lại
      if (formField.type == "select") {
        //Lấy ra các thuộc tính của nó
        //Binding với giá trị đã được chọn ở trên form

        const dataOption = await SelectOptionData(formField.key, { name });
        formField.values = dataOption || [];
      }
    });

    formViewerRef.current.on("submit", (event) => {
      console.log("event", event);

      const validationErrors = formViewerRef.current.validate();

      // Convert validationErrors object into an array of keys
      const errorFields = Object.keys(validationErrors);
      if (errorFields.length > 0) {
        showToast("Các trường bắt buộc không được để trống", "error");
        console.log("Object.entries(validationErrors)", Object.entries(validationErrors));
        // Duyệt qua các lỗi và thay thế thông báo
        for (const fieldId in validationErrors) {
          validationErrors[fieldId] = validationErrors[fieldId].map((error) => {
            if (error === "Field is required.") {
              return "Không được để trống.";
            }
            return error;
          });
        }
        return;
      }

      const formData = event.data;

      // // Kiểm tra nếu dữ liệu hợp lệ
      // if (!formData.name || !formData.email) {
      //   return;
      // }
      // Xử lý dữ liệu hợp lệ
      onSchemaSubmit(formData);
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
          console.log("Form đã được hiển thị 1");
        })
        .catch((err) => {
          console.error("Lỗi khi tải lại form 1", err);
        });
    };

    // Định nghĩa hàm bất đồng bộ trong useEffect để sử dụng await
    const initializeForm = async () => {
      // Xử lý nếu là iframe (Dùng cho ảnh)
      let updatedFormSchema = updateIframeLinks(formSchema);
      console.log("updatedFormSchema", updatedFormSchema);

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
            console.log("render form A =>");
          })
          .catch((err) => {
            console.error("Lỗi khi tải form 1:", err);
          });
      } else {
        formViewerRef.current
          .importSchema(updatedFormSchema)
          .then(() => {
            setCurrFormSchema(updatedFormSchema);
            console.log("render form E =>", updatedFormSchema);
          })
          .catch((err) => {
            console.error("Lỗi khi tải form 2:", err);
          });
      }
    };

    // Gọi hàm async
    initializeForm();

    return () => {
      if (formViewerRef.current) {
        formViewerRef.current.destroy();
      }
    };
  }, [formSchema, dataInit, currFormSchema]);

  useEffect(() => {
    console.log("currFormSchema changed =>", currFormSchema);
  }, [currFormSchema]);

  /**
   * Thay đổi link của iframe để chứa thông tin nodeId, potId, processId
   * @param link
   */
  const updateIframeLinks = (updatedFormSchema) => {
    const nodeId = contextData?.nodeId;
    const potId = contextData?.potId;
    const processId = contextData?.processId;

    // Lặp qua các components trong đầu vào
    updatedFormSchema.components.forEach((component) => {
      // Kiểm tra nếu component có type là 'iframe'
      if (component.type === "iframe" && component.url) {
        // Lấy fieldName từ properties.name, nếu không có thì gán giá trị mặc định là 'undefined'
        const fieldName = component?.properties?.name || "undefined";

        // Tạo URL mới bằng cách thêm các tham số nodeId, potId, processId
        const url = new URL(component.url);
        url.searchParams.append("nodeId", nodeId);
        url.searchParams.append("potId", potId);
        url.searchParams.append("processId", processId);
        url.searchParams.append("fieldName", fieldName);

        // Cập nhật URL mới vào component
        component.url = url.toString();
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
      console.log("component button =>", component);

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
      // Kiểm tra nếu component có type là 'select'
      if (component.type === "select" && component.valuesKey) {
        // Lấy valuesKey từ component,
        // Lấy ra các tham số được gán khởi tạo
        // Thực hiện lưu lại mappers đối với những trường hợp không chuẩn, để biến đổi dữ liệu
        let key = component.valuesKey;
        let params = component.properties?.params || "";
        params = [];
        filterItems.push({ key, params, compKey: component.key });
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
            filterItems.push({ key, params, compKey: componentL1.key });
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
                filterItems.push({ key, params, compKey: componentL2.key });
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
                    filterItems.push({ key, params, compKey: componentL3.key });
                  }
                });
              }
            });
          }
        });
      }
    });

    //Lặp tiến hành binding
    for (let index = 0; index < filterItems.length; index++) {
      let filterItem = filterItems[index];

      // console.log('filterItem =>', filterItem);
      //Đã là 1 dạng list gồm {label, value}
      const dataOption = await SelectOptionData(filterItem.key, filterItem.params);

      //Lưu trang là số 1 => Đăng ký lắng nghe sự kiện scroll
      updatedFormSchema.components.forEach((component) => {
        // Kiểm tra nếu component có type là 'select'
        if (component.type === "select" && component.key == filterItem.compKey) {
          // Cập nhật lại vào component trường values
          console.log("dataOption =>", dataOption);
          console.log("valuesKey =>", component.key);
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
      });
    }

    // Trả về dữ liệu đã được cập nhật
    return updatedFormSchema;
  };

  return (
    <div>
      {/* <h2>Form Viewer</h2> */}
      <div ref={formContainerRef}></div> {/* Container cho form */}
    </div>
  );
};

export default FormViewerComponent;

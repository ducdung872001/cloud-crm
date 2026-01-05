/**
 * mapConfigData.ts
 *
 * Hàm mapConfigData: ánh xạ dữ liệu `inputData` theo định nghĩa trong `config` thành `mappedData`.
 *
 * Thứ tự xử lý:
 * 1) Map các field theo config.components (group / dynamiclist / checklist / fields).
 * 2) Nếu truyền attributes + extraInfos thì ánh xạ các attribute có fieldName khớp với config:
 *    - Lấy attributeValue từ extraInfos theo attributeId (parse JSON-string nếu cần) và gán vào mappedData[fieldName].
 *    - Nếu attribute datatype = "multiselect" và không có extraInfo tương ứng -> gán [].
 * 3) Áp dụng exceptionField: nếu mappedData có key giống 1 key trong exceptionField nhưng không có giá trị
 *    thì lấy giá trị tương ứng từ inputData theo fallback key và gán vào mappedData.
 * 4) Copy mọi trường còn lại từ inputData vào mappedData (không ghi đè các key đã tồn tại trong mappedData).
 *
 * Tham số mới:
 * - exceptionField?: Record<string, string>
 *   ví dụ: { phone: "phoneMasked", email: "emailMasked" }
 *   nghĩa là: nếu mappedData.phone là empty -> lấy inputData.phoneMasked để gán mappedData.phone
 */

type AnyObject = Record<string, any>;

type Component = {
  label?: string;
  type?: string;
  layout?: AnyObject;
  id?: string;
  key?: string;
  path?: string;
  components?: Component[];
  values?: { label: string; value: any }[];
  valuesKey?: string;
  showOutline?: boolean;
  isRepeating?: boolean;
  allowAddRemove?: boolean;
  defaultRepetitions?: number;
  [k: string]: any;
};

type Config = {
  components: Component[];
  [k: string]: any;
};

type ComponentAttribute = {
  id: number;
  name?: string;
  fieldName?: string;
  datatype?: string | null;
  attributes?: any;
  [k: string]: any;
};

type ExtraInfo = {
  id?: number;
  attributeId: number;
  businessPartnerId?: number;
  guaranteeId? : number;
  contractWarrantyId? : number;
  contractId? : number;
  attributeValue?: any;
  [k: string]: any;
};

export function mapConfigData(
  config: Config,
  inputData: AnyObject,
  attributes?: Record<string, ComponentAttribute[]>,
  extraInfos?: ExtraInfo[],
  exceptionField?: Record<string, string>
): AnyObject {
  const mappedData: AnyObject = {};

  // Parse JSON-string nếu có, trả về nguyên giá trị nếu không phải JSON
  function safeParseJson(possibleJson: any): any {
    if (possibleJson == null) return possibleJson;
    if (Array.isArray(possibleJson) || typeof possibleJson === "object") return possibleJson;
    if (typeof possibleJson === "string") {
      const trimmed = possibleJson.trim();
      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
          return JSON.parse(trimmed);
        } catch {
          return possibleJson;
        }
      }
    }
    return possibleJson;
  }

  // Kiểm tra value có được coi là "không có giá trị"
  function isEmptyValue(value: any): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  }

  // Tìm array phù hợp trong inputData (heuristic cho dynamiclist khi value là JSON-string)
  function findMatchingArrayInData(subComponents: Component[], dataObject: AnyObject): { keyName: string; arrayValue: any[] } | null {
    const subKeys = (subComponents || []).map((c) => c.key).filter(Boolean);
    for (const keyName of Object.keys(dataObject || {})) {
      const rawValue = dataObject[keyName];
      let parsedValue = rawValue;
      if (typeof rawValue === "string") {
        const trimmed = rawValue.trim();
        if (trimmed.startsWith("[")) {
          try {
            parsedValue = JSON.parse(trimmed);
          } catch {
            continue;
          }
        } else {
          continue;
        }
      }
      if (Array.isArray(parsedValue) && parsedValue.length > 0 && typeof parsedValue[0] === "object") {
        const firstItemKeys = Object.keys(parsedValue[0]);
        const allMatch = subKeys.length === 0 || subKeys.every((subKeyName) => firstItemKeys.includes(subKeyName));
        if (allMatch) return { keyName, arrayValue: parsedValue };
      }
    }
    return null;
  }

  // Lấy raw value cho component từ inputData (theo path, key, valuesKey, id)
  function getRawValueForComponent(component: Component): any {
    if (component.path && hasKey(inputData, component.path)) return inputData[component.path];
    if (component.key && hasKey(inputData, component.key)) return inputData[component.key];
    if (component.valuesKey && hasKey(inputData, component.valuesKey)) return inputData[component.valuesKey];
    if (component.id && hasKey(inputData, component.id)) return inputData[component.id];
    return undefined;
  }

  function hasKey(objectToCheck: any, keyName: string): boolean {
    if (objectToCheck == null) return false;
    return Object.prototype.hasOwnProperty.call(objectToCheck, keyName) && objectToCheck[keyName] !== undefined;
  }

  // Thu thập tất cả key/path/id từ config (đệ quy) để so khớp với attributes.fieldName
  function collectConfigFieldNames(componentsToCollect: Component[], accumulator: Set<string>) {
    for (const comp of componentsToCollect || []) {
      if (comp.key) accumulator.add(comp.key);
      if (comp.path) accumulator.add(comp.path);
      if (comp.id) accumulator.add(comp.id);
      if (Array.isArray(comp.components)) {
        collectConfigFieldNames(comp.components, accumulator);
      }
    }
  }

  function processComponents(componentsToProcess: Component[], targetObject: AnyObject) {
    for (const componentDefinition of componentsToProcess) {
      const componentType = componentDefinition.type;
      const targetKeyName = componentDefinition.path || componentDefinition.key || componentDefinition.id;
      if (!componentType) continue;

      if (componentType === "uploadFile") {
        //   [
        //     {
        //         "url": "https://cloud-cdn.reborn.vn/reborn/2025/12/08/1179ec38-0936-4aa2-a30b-0856ec438854-1765204810.jpg",
        //         "type": "jpg",
        //         "name": "82654ae8-0d3c-4c3e-a79e-ec1cd6b67a56-1762834257.jpg",
        //         "size": 128529
        //     }
        // ]
        let rawValue = getRawValueForComponent(componentDefinition);

        rawValue = safeParseJson(rawValue);
        if (rawValue !== undefined) {
          console.log("Raw value for uploadFile:", rawValue);
          if (Array.isArray(rawValue)) {
            let _rawValue = rawValue.map((item) => {
              if (item) {
                return {
                  url: item || "",
                  type: "",
                  name: "",
                  size: null,
                };
              }
              return item;
            });
            targetObject[targetKeyName] = JSON.stringify(_rawValue);
            continue;
          } else if (typeof rawValue === "string") {
            const _rawValue = [
              {
                url: rawValue,
                type: "",
                name: "",
                size: null,
              },
            ];
            targetObject[targetKeyName] = JSON.stringify(_rawValue);
            continue;
          }
        }
        continue;
      }

      if (componentType === "group") {
        if (Array.isArray(componentDefinition.components)) {
          processComponents(componentDefinition.components, targetObject);
        }
        continue;
      }

      if (componentType === "dynamiclist") {
        const outputKeyName = componentDefinition.path || componentDefinition.key || componentDefinition.id;
        let rawValue = getRawValueForComponent(componentDefinition);

        if (rawValue === undefined) {
          const match = findMatchingArrayInData(componentDefinition.components || [], inputData);
          if (match) {
            rawValue = match.arrayValue;
          }
        }

        rawValue = safeParseJson(rawValue);
        const arrayValue = Array.isArray(rawValue) ? rawValue : [];

        const items = arrayValue.map((entryItem: any) => {
          const itemObject: AnyObject = {};
          if (Array.isArray(componentDefinition.components)) {
            for (const subComponent of componentDefinition.components) {
              const subKeyName = subComponent.key || subComponent.path || subComponent.id;
              let subValue;
              if (entryItem == null) subValue = undefined;
              else if (Object.prototype.hasOwnProperty.call(entryItem, subKeyName)) subValue = entryItem[subKeyName];
              else {
                const foundKeyName = Object.keys(entryItem).find((k) => k.toLowerCase() === (subKeyName || "").toLowerCase());
                if (foundKeyName) subValue = entryItem[foundKeyName];
                else subValue = undefined;
              }
              itemObject[subKeyName] = subValue;
            }
          } else {
            return entryItem;
          }
          return itemObject;
        });

        targetObject[outputKeyName] = items;
        continue;
      }

      if (componentType === "checklist") {
        const outputKeyName = componentDefinition.key || componentDefinition.path || componentDefinition.id;
        let rawValue = getRawValueForComponent(componentDefinition);
        rawValue = safeParseJson(rawValue);

        // Nếu dữ liệu không có key tương ứng -> gán [] (không fallback lấy values trong config)
        if (rawValue === undefined || rawValue === null || rawValue === "") {
          targetObject[outputKeyName] = [];
        } else if (Array.isArray(rawValue)) {
          targetObject[outputKeyName] = rawValue;
        } else if (typeof rawValue === "string") {
          const trimmed = rawValue.trim();
          if (trimmed.startsWith("[")) {
            try {
              targetObject[outputKeyName] = JSON.parse(trimmed);
            } catch {
              targetObject[outputKeyName] = trimmed.split(",").map((x) => x.trim());
            }
          } else {
            targetObject[outputKeyName] = trimmed.split(",").map((x) => x.trim());
          }
        } else {
          targetObject[outputKeyName] = [rawValue];
        }
        continue;
      }

      // Các field thông thường
      {
        const outputKeyName = componentDefinition.key || componentDefinition.path || componentDefinition.id;
        let rawValue = getRawValueForComponent(componentDefinition);
        if (rawValue === undefined && componentDefinition.valuesKey) {
          if (hasKey(inputData, componentDefinition.valuesKey)) rawValue = inputData[componentDefinition.valuesKey];
        }
        rawValue = safeParseJson(rawValue);

        if (rawValue !== undefined) {
          targetObject[outputKeyName] = rawValue;
        }
      }
    }
  }

  // 1) Xử lý config/components trước
  if (Array.isArray(config.components)) {
    processComponents(config.components, mappedData);
  }

  // 2) Nếu attributes + extraInfos được truyền, ánh xạ các attribute có fieldName khớp trong config
  if (attributes && extraInfos && typeof attributes === "object") {
    // Lấy tập các field names hiện có trong config để so khớp
    const configFieldNames = new Set<string>();
    if (Array.isArray(config.components)) {
      collectConfigFieldNames(config.components, configFieldNames);
    }

    // Tạo map từ attributeId -> extraInfo.attributeValue (parse nếu cần)
    const extraInfoMap = new Map<number, any>();
    for (const info of extraInfos) {
      if (info && typeof info.attributeId === "number") {
        extraInfoMap.set(info.attributeId, safeParseJson(info.attributeValue));
      }
    }

    // Duyệt attributes (groups), flatten và gán giá trị nếu fieldName có trong configFieldNames
    for (const groupKey of Object.keys(attributes)) {
      const attributeArray = attributes[groupKey];
      if (!Array.isArray(attributeArray)) continue;
      for (const attributeItem of attributeArray) {
        const fieldName = attributeItem.fieldName;
        const attributeId = attributeItem.id;
        if (!fieldName) continue;
        if (configFieldNames.has(fieldName)) {
          // Nếu có extraInfos chứa attributeId -> gán
          if (typeof attributeId === "number" && extraInfoMap.has(attributeId)) {
            mappedData[fieldName] = extraInfoMap.get(attributeId);
          } else {
            // Nếu không có extraInfo tương ứng, xử lý theo datatype:
            if (attributeItem.datatype && attributeItem.datatype.toLowerCase() === "multiselect") {
              mappedData[fieldName] = [];
            } else {
              // không gán để không ghi đè dữ liệu đã map trước đó
            }
          }
        }
      }
    }
  }

  // 3) Áp dụng exceptionField nếu có: dùng fallback từ inputData khi mappedData có key nhưng empty
  if (exceptionField && typeof exceptionField === "object") {
    for (const [mainKey, fallbackKey] of Object.entries(exceptionField)) {
      if (Object.prototype.hasOwnProperty.call(mappedData, mainKey) && isEmptyValue(mappedData[mainKey])) {
        if (hasKey(inputData, fallbackKey)) {
          mappedData[mainKey] = safeParseJson(inputData[fallbackKey]);
        }
      }
    }
  }

  // 4) Sau khi map theo config và attributes, copy mọi trường còn lại trong `inputData` mà chưa xuất hiện trong mappedData
  if (inputData != null && typeof inputData === "object") {
    for (const keyName of Object.keys(inputData)) {
      if (!Object.prototype.hasOwnProperty.call(mappedData, keyName)) {
        mappedData[keyName] = safeParseJson(inputData[keyName]);
      }
    }
  }

  return mappedData;
}

// =============================================================================
// FILE: src/pages/PromotionalProgram/partials/DmnSettingModal/index.tsx
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import SelectCustom from "components/selectCustom/selectCustom";
import Input from "components/input/input";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { urlsApi } from "configs/urls";
import { IActionModal } from "model/OtherModel";
import { IPromotion } from "model/promotion/PromotionModel";
import DecisionTableInputService from "services/DecisionTableInputService";
import DecisionTableOutputService from "services/DecisionTableOutputService";
import "./index.scss";

interface MappingRow {
  ruleField: string;
  ruleFieldName: string;
  mappingField: string;
  mappingFieldName: string;
}

interface SelectedRule {
  id: number;
  code: string;
  label: string;
}

interface Props {
  onShow: boolean;
  data: IPromotion | null;
  onHide: (refresh?: boolean) => void;
}

function parseMappingJson(jsonStr?: string): MappingRow[] {
  if (!jsonStr) return [];
  try {
    const obj = JSON.parse(jsonStr);
    if (typeof obj !== "object" || Array.isArray(obj)) return [];
    return Object.entries(obj).map(([k, v]: [string, any]) => ({
      ruleField: k,
      ruleFieldName: k,
      mappingField: String(v),
      mappingFieldName: String(v),
    }));
  } catch {
    return [];
  }
}

function serializeMappingList(list: MappingRow[]): string {
  const obj: Record<string, string> = {};
  list.forEach((r) => { if (r.ruleField && r.mappingField) obj[r.ruleField] = r.mappingField; });
  return JSON.stringify(obj);
}

// =============================================================================
// MappingSection
// =============================================================================
function MappingSection({ businessRuleId, listInput, setListInput, listOutput, setListOutput }: {
  businessRuleId: number;
  listInput: MappingRow[];
  setListInput: (v: MappingRow[]) => void;
  listOutput: MappingRow[];
  setListOutput: (v: MappingRow[]) => void;
}) {
  const [tab, setTab] = useState<"input" | "output">("input");
  const [formRow, setFormRow] = useState<MappingRow>({ ruleField: "", ruleFieldName: "", mappingField: "", mappingFieldName: "" });

  const switchTab = (t: "input" | "output") => { setTab(t); setFormRow({ ruleField: "", ruleFieldName: "", mappingField: "", mappingFieldName: "" }); };

  // Trường đầu vào DMN
  const loadInputFields = useCallback(async (search: string, _: any, { page }: any) => {
    const res = await DecisionTableInputService.list({ code: search, businessRuleId, page, limit: 20 });
    if (res?.code === 0) {
      return {
        options: (res.result?.items ?? []).map((it: any) => ({
          value: it.code,
          label: `${it.code}${it.name ? " - " + it.name : ""}`,
          isDisabled: listInput.some((r) => r.ruleField === it.code),
        })),
        hasMore: res.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  }, [businessRuleId, listInput]);

  // Trường đầu ra DMN
  const loadOutputFields = useCallback(async (search: string, _: any, { page }: any) => {
    const res = await DecisionTableOutputService.list({ code: search, businessRuleId, page, limit: 20 });
    if (res?.code === 0) {
      return {
        options: (res.result?.items ?? []).map((it: any) => ({
          value: it.code,
          label: `${it.code}${it.name ? " - " + it.name : ""}`,
          isDisabled: listOutput.some((r) => r.ruleField === it.code),
        })),
        hasMore: res.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  }, [businessRuleId, listOutput]);

  const handleAdd = () => {
    if (!formRow.ruleField || !formRow.mappingField) return;
    if (tab === "input") setListInput([...listInput, { ...formRow }]);
    else setListOutput([...listOutput, { ...formRow }]);
    setFormRow({ ruleField: "", ruleFieldName: "", mappingField: "", mappingFieldName: "" });
  };

  const handleDelete = (index: number) => {
    if (tab === "input") { const n = [...listInput]; n.splice(index, 1); setListInput(n); }
    else { const n = [...listOutput]; n.splice(index, 1); setListOutput(n); }
  };

  const currentList = tab === "input" ? listInput : listOutput;

  return (
    <div className="dmn-mapping-section">
      <h4 className="dmn-mapping-section__title">Dữ liệu vào/ra nghiệp vụ tham chiếu</h4>

      <div className="dmn-mapping-tabs">
        {(["input", "output"] as const).map((t) => (
          <button key={t} type="button"
            className={`dmn-mapping-tab${tab === t ? " dmn-mapping-tab--active" : ""}`}
            onClick={() => switchTab(t)}
          >
            {t === "input" ? "Dữ liệu đầu vào nghiệp vụ" : "Dữ liệu đầu ra nghiệp vụ"}
          </button>
        ))}
      </div>

      <div className="dmn-mapping-add-row">
        <div className="dmn-mapping-add-row__field">
          <SelectCustom
            key={`rule_${tab}_${businessRuleId}_${currentList.length}`}
            id="ruleField" name="ruleField" label="" options={[]} fill={true}
            value={formRow.ruleField ? { value: formRow.ruleField, label: formRow.ruleFieldName } : null}
            special={true} required={false}
            onChange={(e: any) => setFormRow({ ...formRow, ruleField: e.value, ruleFieldName: e.label })}
            isAsyncPaginate={true}
            placeholder="Chọn trường nghiệp vụ"
            additional={{ page: 1 }}
            loadOptionsPaginate={tab === "input" ? loadInputFields : loadOutputFields}
          />
        </div>

        <div className="dmn-mapping-add-row__field">
          <Input
            name="mappingField" fill={true} value={formRow.mappingField}
            onChange={(e: any) => setFormRow({ ...formRow, mappingField: e.target.value, mappingFieldName: e.target.value })}
            placeholder={tab === "input" ? "vd: $.orderAmount" : "vd: discountAmount"}
          />
        </div>

        <button type="button"
          className={`dmn-mapping-add-btn${formRow.ruleField && formRow.mappingField ? "" : " dmn-mapping-add-btn--disabled"}`}
          title="Thêm mapping" onClick={handleAdd}
        >
          <Icon name="Plus" style={{ width: 18 }} />
        </button>
      </div>

      <div className="dmn-mapping-list">
        {currentList.length === 0 && <p className="dmn-mapping-list__empty">Chưa có mapping nào.</p>}
        {currentList.map((row, idx) => (
          <div key={idx} className="dmn-mapping-list__row">
            <div className="dmn-mapping-list__row-field">
              <Input fill={true} name="ruleFieldName"
                label={idx === 0 ? "Trường nghiệp vụ" : ""}
                value={row.ruleFieldName || row.ruleField}
                readOnly={true} onChange={() => {}} placeholder=""
              />
            </div>
            <div className="dmn-mapping-list__row-field">
              <Input fill={true} name="mappingFieldName"
                label={idx === 0 ? (tab === "output" ? "Biến mapping" : "Trường mapping") : ""}
                value={row.mappingFieldName || row.mappingField}
                readOnly={true} onChange={() => {}} placeholder=""
              />
            </div>
            <button type="button" className="dmn-mapping-list__row-delete" title="Xóa" onClick={() => handleDelete(idx)}>
              <Icon name="Trash" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Main Modal
// =============================================================================
export default function DmnSettingModal({ onShow, data, onHide }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRule, setSelectedRule] = useState<SelectedRule | null>(null);
  const [listInput, setListInput]   = useState<MappingRow[]>([]);
  const [listOutput, setListOutput] = useState<MappingRow[]>([]);

  useEffect(() => {
    if (!onShow || !data) return;
    // Load tên rule đang lưu
    if (data.businessRuleId && data.businessRuleId > 0) {
      fetch(`${urlsApi.businessRule.detail}?id=${data.businessRuleId}`)
        .then((r) => r.json())
        .then((res) => {
          if (res?.code === 0 && res.result) {
            setSelectedRule({ id: res.result.id, code: res.result.code ?? "", label: res.result.name });
          }
        })
        .catch(() => {});
    } else {
      setSelectedRule(null);
    }
    setListInput(parseMappingJson(data.input));
    setListOutput(parseMappingJson(data.output));
  }, [onShow, data]);

  // businessRule/list trả về items: [{ id, code, name }]
  const loadBusinessRules = async (search: string, _: any, { page }: any) => {
    try {
      const res = await fetch(
        `${urlsApi.businessRule.list}?name=${encodeURIComponent(search)}&page=${page}&limit=20`
      ).then((r) => r.json());
      if (res?.code === 0) {
        return {
          options: (res.result?.items ?? []).map((it: any) => ({
            value: it.id,
            label: it.name,
            code: it.code ?? "",
            id: it.id,
          })),
          hasMore: res.result?.loadMoreAble ?? false,
          additional: { page: page + 1 },
        };
      }
    } catch {}
    return { options: [], hasMore: false };
  };

  const handleSave = async () => {
    if (!data?.id) return;
    if (!selectedRule) { showToast("Vui lòng chọn Luật nghiệp vụ", "error"); return; }

    setIsSaving(true);
    try {
      // Dùng promotion/update hiện có, giữ nguyên toàn bộ dữ liệu + cập nhật 3 trường
      const body = {
        id:             data.id,
        name:           data.name,
        startTime:      data.startTime,
        endTime:        data.endTime,
        applyType:      data.applyType,
        minAmount:      data.minAmount,
        perAmount:      data.perAmount,
        promotionType:  data.promotionType,
        discount:       data.discount,
        discountType:   data.discountType,
        status:         data.status,
        mode:           data.mode,
        budget:         data.budget,
        // 3 trường mới
        businessRuleId: selectedRule.id,
        input:          serializeMappingList(listInput),
        output:         serializeMappingList(listOutput),
      };

      const res = await fetch(urlsApi.promotionalProgram.update, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json());

      if (res?.code === 0) {
        showToast("Cập nhật cài đặt DMN thành công", "success");
        onHide(true);
      } else {
        showToast(res?.message ?? "Cập nhật thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const actions: IActionModal = {
    actions_left: { buttons: [{ title: "Hủy", color: "secondary", callback: () => onHide(false) }] },
    actions_right: { buttons: [{ title: isSaving ? "Đang lưu..." : "Cập nhật", color: "primary", disabled: isSaving, callback: handleSave }] },
  };

  return (
    <Modal isOpen={onShow} toggle={() => onHide(false)} size="lg">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <ModalHeader title="Cài đặt biểu mẫu" toggle={() => onHide(false)} />
        <ModalBody>
          <div className="dmn-setting-modal">
            <div className="form-group">
              <Input name="promotionName" label="Tên chương trình" fill={true}
                value={data?.name ?? ""} readOnly={true} onChange={() => {}} placeholder=""
              />
            </div>

            <div className="form-group">
              <SelectCustom
                key={`biz_rule_${data?.id}_${onShow}`}
                id="businessRule" name="businessRule" label="Luật nghiệp vụ"
                fill={true} required={true} options={[]}
                value={selectedRule ? { value: selectedRule.id, label: selectedRule.label } : null}
                onChange={(e: any) => {
                  setSelectedRule({ id: e.id ?? e.value, code: e.code ?? "", label: e.label });
                  setListInput([]);
                  setListOutput([]);
                }}
                isAsyncPaginate={true}
                placeholder="Chọn loại luật nghiệp vụ"
                additional={{ page: 1 }}
                loadOptionsPaginate={loadBusinessRules}
              />
            </div>

            {selectedRule && (
              <MappingSection
                businessRuleId={selectedRule.id}
                listInput={listInput} setListInput={setListInput}
                listOutput={listOutput} setListOutput={setListOutput}
              />
            )}
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </form>
    </Modal>
  );
}
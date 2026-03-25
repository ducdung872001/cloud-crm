// =============================================================================
// FILE: src/pages/PromotionalProgram/partials/DmnSettingModal/index.tsx
// Modal cài đặt DMN Rule cho Chương trình khuyến mãi
// Khi phương thức xử lý = "DMN Rule", hiển thị icon Settings trong danh sách.
// Bấm vào → popup này mở ra để:
//   1. Chọn Luật nghiệp vụ (businessRuleId)
//   2. Mapping tham số đầu vào  (input  = JSON string)
//   3. Mapping tham số đầu ra   (output = JSON string)
// =============================================================================

import React, { Fragment, useState, useEffect, useCallback } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import SelectCustom from "components/selectCustom/selectCustom";
import Input from "components/input/input";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { urlsApi } from "configs/urls";
import { IActionModal } from "model/OtherModel";
import { IPromotion } from "model/promotion/PromotionModel";
import PromotionService from "services/PromotionService";
import "./index.scss";

// ---------- Types ------------------------------------------------------------
interface MappingRow {
  ruleField: string;
  ruleFieldName: string;
  mappingField: string;
  mappingFieldName: string;
  mappingType: number; // 1=frm, 2=var, 0=literal
}

interface Props {
  onShow: boolean;
  data: IPromotion | null;
  onHide: (refresh?: boolean) => void;
}

// ---------- Helper: parse JSON string → MappingRow[] -----------------------
function parseMappingJson(jsonStr?: string): MappingRow[] {
  if (!jsonStr) return [];
  try {
    const obj = JSON.parse(jsonStr);
    if (Array.isArray(obj)) return obj as MappingRow[];
    // Object format: { ruleField: mappingField, ... }
    return Object.entries(obj).map(([k, v]: [string, any]) => ({
      ruleField: k,
      ruleFieldName: k,
      mappingField: String(v),
      mappingFieldName: String(v),
      mappingType: String(v).startsWith("var_") ? 2 : String(v).startsWith("frm_") ? 1 : 0,
    }));
  } catch {
    return [];
  }
}

// ---------- Helper: MappingRow[] → JSON string to store --------------------
function serializeMappingList(list: MappingRow[]): string {
  const obj: Record<string, string> = {};
  list.forEach((r) => {
    if (r.ruleField && r.mappingField) obj[r.ruleField] = r.mappingField;
  });
  return JSON.stringify(obj);
}

// =============================================================================
// Sub-component: MappingSection
// Hiển thị tab Input / Output, dropdowns & danh sách đã thêm
// =============================================================================
interface MappingSectionProps {
  businessRuleId?: number | null;
  listInput: MappingRow[];
  setListInput: (v: MappingRow[]) => void;
  listOutput: MappingRow[];
  setListOutput: (v: MappingRow[]) => void;
}

const EMPTY_ROW = (): MappingRow => ({
  ruleField: "",
  ruleFieldName: "",
  mappingField: "",
  mappingFieldName: "",
  mappingType: 1,
});

function MappingSection({
  businessRuleId,
  listInput,
  setListInput,
  listOutput,
  setListOutput,
}: MappingSectionProps) {
  const [tab, setTab] = useState<"input" | "output">("input");
  const [formRow, setFormRow] = useState<MappingRow>(EMPTY_ROW());

  // Reset form row khi chuyển tab
  const switchTab = (t: "input" | "output") => {
    setTab(t);
    setFormRow({ ...EMPTY_ROW(), mappingType: t === "output" ? 2 : 1 });
  };

  // ---------- load options: trường nghiệp vụ đầu vào (DecisionTableInput) ---
  const loadInputFields = useCallback(
    async (search: string, _: any, { page }: any) => {
      if (!businessRuleId) return { options: [], hasMore: false };
      try {
        const res = await fetch(
          `${urlsApi.decisionTableInput.list}?businessRuleId=${businessRuleId}&code=${search}&page=${page}&limit=20`
        ).then((r) => r.json());
        if (res?.code === 0) {
          const items = res.result?.items ?? [];
          return {
            options: items.map((it: any) => ({
              value: it.code,
              label: `${it.code}${it.name ? " - " + it.name : ""}`,
              isDisabled: listInput.some((r) => r.ruleField === it.code),
            })),
            hasMore: res.result?.loadMoreAble ?? false,
            additional: { page: page + 1 },
          };
        }
      } catch {}
      return { options: [], hasMore: false };
    },
    [businessRuleId, listInput]
  );

  // ---------- load options: trường nghiệp vụ đầu ra (DecisionTableOutput) --
  const loadOutputFields = useCallback(
    async (search: string, _: any, { page }: any) => {
      if (!businessRuleId) return { options: [], hasMore: false };
      try {
        const res = await fetch(
          `${urlsApi.decisionTableOutput.list}?businessRuleId=${businessRuleId}&code=${search}&page=${page}&limit=20`
        ).then((r) => r.json());
        if (res?.code === 0) {
          const items = res.result?.items ?? [];
          return {
            options: items.map((it: any) => ({
              value: it.code,
              label: `${it.code}${it.name ? " - " + it.name : ""}`,
              isDisabled: listOutput.some((r) => r.ruleField === it.code),
            })),
            hasMore: res.result?.loadMoreAble ?? false,
            additional: { page: page + 1 },
          };
        }
      } catch {}
      return { options: [], hasMore: false };
    },
    [businessRuleId, listOutput]
  );

  // ---------- load options: trường form (frm_) ------------------------------
  const loadFormFields = useCallback(async (search: string, _: any, { page }: any) => {
    try {
      const res = await fetch(
        `${urlsApi.bpmForm.lst}?code=${search}&page=${page}&limit=20`
      ).then((r) => r.json());
      if (res?.code === 0) {
        const items: any[] = res.result ?? [];
        const opts: { value: string; label: string }[] = [];
        items.forEach((form) => {
          const components: any[] = (() => {
            try { return JSON.parse(form.config)?.components ?? []; } catch { return []; }
          })();
          components.forEach((c: any) => {
            if (c.key) {
              opts.push({
                value: `frm_${form.code}.${c.key}`,
                label: `frm_${form.code}.${c.key}${c.label ? " - " + c.label : ""}`,
              });
            }
          });
        });
        return {
          options: opts,
          hasMore: res.result?.loadMoreAble ?? false,
          additional: { page: page + 1 },
        };
      }
    } catch {}
    return { options: [], hasMore: false };
  }, []);

  // ---------- load options: biến quy trình (var_) ---------------------------
  const loadVarFields = useCallback(async (search: string, _: any, { page }: any) => {
    try {
      const res = await fetch(
        `${urlsApi.businessProcess.listVariableDeclare}?name=${search}&page=${page}&limit=20`
      ).then((r) => r.json());
      if (res?.code === 0) {
        const items: any[] = res.result?.items ?? [];
        const opts: { value: string; label: string }[] = [];
        items.forEach((v) => {
          const body = (() => { try { return JSON.parse(v.body); } catch { return []; } })();
          (body as any[]).forEach((f) => {
            opts.push({
              value: `var_${v.name}.${f.name}`,
              label: `var_${v.name}.${f.name}`,
            });
          });
        });
        return {
          options: opts,
          hasMore: res.result?.loadMoreAble ?? false,
          additional: { page: page + 1 },
        };
      }
    } catch {}
    return { options: [], hasMore: false };
  }, []);

  // ---------- thêm row vào danh sách ----------------------------------------
  const handleAdd = () => {
    if (!formRow.ruleField || !formRow.mappingField) return;
    if (tab === "input") {
      setListInput([...listInput, { ...formRow }]);
    } else {
      setListOutput([...listOutput, { ...formRow }]);
    }
    setFormRow({ ...EMPTY_ROW(), mappingType: tab === "output" ? 2 : 1 });
  };

  // ---------- xoá row -------------------------------------------------------
  const handleDelete = (index: number) => {
    if (tab === "input") {
      const next = [...listInput];
      next.splice(index, 1);
      setListInput(next);
    } else {
      const next = [...listOutput];
      next.splice(index, 1);
      setListOutput(next);
    }
  };

  const currentList = tab === "input" ? listInput : listOutput;
  const mappingLabel = tab === "output" ? "Biến mapping" : "Trường mapping";

  return (
    <div className="dmn-mapping-section">
      <h4 className="dmn-mapping-section__title">Dữ liệu vào/ra nghiệp vụ tham chiếu</h4>

      {/* Tabs */}
      <div className="dmn-mapping-tabs">
        {(["input", "output"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`dmn-mapping-tab${tab === t ? " dmn-mapping-tab--active" : ""}`}
            onClick={() => switchTab(t)}
          >
            {t === "input" ? "Dữ liệu đầu vào nghiệp vụ" : "Dữ liệu đầu ra nghiệp vụ"}
          </button>
        ))}
      </div>

      {/* Row thêm mới */}
      <div className="dmn-mapping-add-row">
        {/* Chọn trường nghiệp vụ */}
        <div className="dmn-mapping-add-row__field">
          <SelectCustom
            key={`rule_${tab}_${businessRuleId}_${currentList.length}`}
            id="ruleField"
            name="ruleField"
            label=""
            options={[]}
            fill={true}
            value={formRow.ruleField ? { value: formRow.ruleField, label: formRow.ruleFieldName } : null}
            special={true}
            required={false}
            onChange={(e: any) => setFormRow({ ...formRow, ruleField: e.value, ruleFieldName: e.label })}
            isAsyncPaginate={true}
            placeholder="Chọn trường nghiệp vụ"
            additional={{ page: 1 }}
            loadOptionsPaginate={tab === "input" ? loadInputFields : loadOutputFields}
          />
        </div>

        {/* Chọn trường mapping / biến / nhập giá trị */}
        <div className="dmn-mapping-add-row__field dmn-mapping-add-row__field--mapping">
          {formRow.mappingType === 0 ? (
            <Input
              name="mappingField"
              fill={true}
              value={formRow.mappingField}
              onChange={(e: any) => setFormRow({ ...formRow, mappingField: e.target.value, mappingFieldName: e.target.value })}
              placeholder="Nhập giá trị"
            />
          ) : (
            <SelectCustom
              key={`map_${formRow.mappingType}_${tab}_${currentList.length}`}
              id="mappingField"
              name="mappingField"
              label=""
              options={[]}
              fill={true}
              value={formRow.mappingField ? { value: formRow.mappingField, label: formRow.mappingFieldName } : null}
              special={true}
              required={false}
              onChange={(e: any) => setFormRow({ ...formRow, mappingField: e.value, mappingFieldName: e.label })}
              isAsyncPaginate={true}
              placeholder={formRow.mappingType === 2 ? "Chọn biến" : "Chọn trường trong form"}
              additional={{ page: 1 }}
              loadOptionsPaginate={formRow.mappingType === 2 ? loadVarFields : loadFormFields}
            />
          )}

          {/* Toggle mapping type (chỉ với tab input) */}
          {tab === "input" && (
            <button
              type="button"
              className="dmn-mapping-toggle-btn"
              title={
                formRow.mappingType === 0
                  ? "Chuyển chọn trường trong form"
                  : formRow.mappingType === 1
                  ? "Chuyển chọn biến"
                  : "Chuyển nhập giá trị"
              }
              onClick={() =>
                setFormRow({
                  ...formRow,
                  mappingType: formRow.mappingType === 0 ? 1 : formRow.mappingType === 1 ? 2 : 0,
                  mappingField: "",
                  mappingFieldName: "",
                })
              }
            >
              <Icon name="ResetPassword" style={{ width: 18 }} />
            </button>
          )}
        </div>

        {/* Nút thêm */}
        <button
          type="button"
          className={`dmn-mapping-add-btn${formRow.ruleField && formRow.mappingField ? "" : " dmn-mapping-add-btn--disabled"}`}
          title="Thêm mapping"
          onClick={handleAdd}
        >
          <Icon name="Plus" style={{ width: 18 }} />
        </button>
      </div>

      {/* Danh sách đã thêm */}
      <div className="dmn-mapping-list">
        {currentList.length === 0 && (
          <p className="dmn-mapping-list__empty">Chưa có mapping nào.</p>
        )}
        {currentList.map((row, idx) => (
          <div key={idx} className="dmn-mapping-list__row">
            <div className="dmn-mapping-list__row-field">
              <Input
                fill={true}
                name="ruleFieldName"
                label={idx === 0 ? "Trường nghiệp vụ" : ""}
                value={row.ruleFieldName || row.ruleField}
                readOnly={true}
                onChange={() => {}}
                placeholder=""
              />
            </div>
            <div className="dmn-mapping-list__row-field">
              <Input
                fill={true}
                name="mappingFieldName"
                label={idx === 0 ? mappingLabel : ""}
                value={row.mappingFieldName || row.mappingField}
                readOnly={true}
                onChange={() => {}}
                placeholder=""
              />
            </div>
            <button
              type="button"
              className="dmn-mapping-list__row-delete"
              title="Xóa"
              onClick={() => handleDelete(idx)}
            >
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

  // Luật nghiệp vụ đã chọn: { value: id, label: name }
  const [selectedRule, setSelectedRule] = useState<{ value: number; label: string } | null>(null);

  // Danh sách mapping input / output
  const [listInput, setListInput]   = useState<MappingRow[]>([]);
  const [listOutput, setListOutput] = useState<MappingRow[]>([]);

  // ── Khởi tạo dữ liệu từ promotion khi mở modal ───────────────────────────
  useEffect(() => {
    if (!onShow || !data) return;

    if (data.businessRuleId) {
      // Sẽ load tên rule qua API để hiển thị label
      fetch(`${urlsApi.businessRule.detail}?id=${data.businessRuleId}`)
        .then((r) => r.json())
        .then((res) => {
          if (res?.code === 0 && res.result) {
            setSelectedRule({ value: res.result.id, label: res.result.name });
          } else {
            setSelectedRule({ value: data.businessRuleId!, label: `Rule #${data.businessRuleId}` });
          }
        })
        .catch(() => {
          setSelectedRule({ value: data.businessRuleId!, label: `Rule #${data.businessRuleId}` });
        });
    } else {
      setSelectedRule(null);
    }

    setListInput(parseMappingJson(data.input));
    setListOutput(parseMappingJson(data.output));
  }, [onShow, data]);

  // ── Load options luật nghiệp vụ (async paginate) ─────────────────────────
  const loadBusinessRules = async (search: string, _: any, { page }: any) => {
    try {
      const res = await fetch(
        `${urlsApi.businessRule.list}?name=${search}&page=${page}&limit=20`
      ).then((r) => r.json());
      if (res?.code === 0) {
        const items: any[] = res.result?.items ?? [];
        return {
          options: items.map((it) => ({ value: it.id, label: it.name })),
          hasMore: res.result?.loadMoreAble ?? false,
          additional: { page: page + 1 },
        };
      }
    } catch {}
    return { options: [], hasMore: false };
  };

  // ── Lưu ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!data?.id) return;
    if (!selectedRule) {
      showToast("Vui lòng chọn Luật nghiệp vụ", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await PromotionService.updateDmnSetting({
        id: data.id,
        businessRuleId: selectedRule.value,
        input:  serializeMappingList(listInput),
        output: serializeMappingList(listOutput),
      });
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

  // ── Actions footer ────────────────────────────────────────────────────────
  const actions: IActionModal = {
    actions_left: {
      buttons: [
        {
          title: "Hủy",
          color: "secondary",
          callback: () => onHide(false),
        },
      ],
    },
    actions_right: {
      buttons: [
        {
          title: isSaving ? "Đang lưu..." : "Cập nhật",
          color: "primary",
          disabled: isSaving,
          callback: handleSave,
        },
      ],
    },
  };

  return (
    <Modal
      isOpen={onShow}
      toggle={() => onHide(false)}
      size="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <ModalHeader
          title="Cài đặt biểu mẫu"
          toggle={() => onHide(false)}
        />

        <ModalBody>
          <div className="dmn-setting-modal">
            {/* Tên chương trình (readonly) */}
            <div className="form-group">
              <Input
                name="promotionName"
                label="Tên chương trình"
                fill={true}
                value={data?.name ?? ""}
                readOnly={true}
                onChange={() => {}}
                placeholder=""
              />
            </div>

            {/* Luật nghiệp vụ */}
            <div className="form-group">
              <SelectCustom
                key={`biz_rule_${data?.id}_${onShow}`}
                id="businessRule"
                name="businessRule"
                label="Luật nghiệp vụ"
                fill={true}
                required={true}
                options={[]}
                value={selectedRule}
                onChange={(e: any) => {
                  setSelectedRule(e);
                  // Reset mapping khi chọn rule mới
                  setListInput([]);
                  setListOutput([]);
                }}
                isAsyncPaginate={true}
                placeholder="Chọn loại luật nghiệp vụ"
                additional={{ page: 1 }}
                loadOptionsPaginate={loadBusinessRules}
              />
            </div>

            {/* Phần mapping (chỉ hiện khi đã chọn rule) */}
            {selectedRule && (
              <MappingSection
                businessRuleId={selectedRule.value}
                listInput={listInput}
                setListInput={setListInput}
                listOutput={listOutput}
                setListOutput={setListOutput}
              />
            )}
          </div>
        </ModalBody>

        <ModalFooter actions={actions} />
      </form>
    </Modal>
  );
}
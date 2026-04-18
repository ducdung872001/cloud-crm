import { Modal, Field, Input, Select } from "../../components/ui";
import { useState } from "react";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
  templateName?: string;
}

interface Variable {
  name: string;
  type: "string" | "number" | "boolean" | "enum" | "file" | "markdown";
  required: boolean;
  defaultValue: string;
  enumValues?: string;
  description: string;
}

const INIT: Variable[] = [
  {
    name: "transcript",
    type: "markdown",
    required: true,
    defaultValue: "",
    description: "Whisper transcript của buổi họp",
  },
  {
    name: "urd_current",
    type: "markdown",
    required: true,
    defaultValue: "",
    description: "URD hiện tại (version trước)",
  },
  {
    name: "output_format",
    type: "enum",
    required: true,
    defaultValue: "structured-diff",
    enumValues: "structured-diff, plain, json",
    description: "Format output mong muốn",
  },
];

export default function VariablesModal({ open, onClose, templateName }: Props) {
  const [vars, setVars] = useState(INIT);
  const { submitting, submit } = useFormStub("Đã lưu variable definition");

  const update = (i: number, field: keyof Variable, v: string | boolean) =>
    setVars((prev) => prev.map((x, j) => (j === i ? { ...x, [field]: v } : x)));

  const add = () => setVars((prev) => [...prev, { name: "", type: "string", required: false, defaultValue: "", description: "" }]);

  const remove = (i: number) => setVars((prev) => prev.filter((_, j) => j !== i));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Variables"
      kicker={`PROMPT · VARS${templateName ? ` · ${templateName}` : ""}`}
      sub="Định nghĩa biến được replace trong prompt template"
      size="xwide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th style={{ width: 60, textAlign: "center" }}>Req</th>
            <th>Default / Enum values</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {vars.map((v, i) => (
            <tr key={i}>
              <td>
                <Input value={v.name} onChange={(e) => update(i, "name", e.target.value)} style={{ fontFamily: "var(--font-mono)", fontSize: 12 }} />
              </td>
              <td>
                <Select
                  value={v.type}
                  onChange={(e) => update(i, "type", e.target.value as Variable["type"])}
                  options={[
                    { value: "string", label: "string" },
                    { value: "number", label: "number" },
                    { value: "boolean", label: "boolean" },
                    { value: "enum", label: "enum" },
                    { value: "file", label: "file" },
                    { value: "markdown", label: "markdown" },
                  ]}
                />
              </td>
              <td style={{ textAlign: "center" }}>
                <input type="checkbox" checked={v.required} onChange={(e) => update(i, "required", e.target.checked)} />
              </td>
              <td>
                <Input
                  value={v.type === "enum" ? (v.enumValues ?? "") : v.defaultValue}
                  onChange={(e) => update(i, v.type === "enum" ? "enumValues" : "defaultValue", e.target.value)}
                  placeholder={v.type === "enum" ? "val1, val2, val3" : "default value"}
                  style={{ fontSize: 12 }}
                />
              </td>
              <td>
                <Input value={v.description} onChange={(e) => update(i, "description", e.target.value)} style={{ fontSize: 12 }} />
              </td>
              <td>
                <button type="button" className="btn sm danger" onClick={() => remove(i)}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn sm" style={{ marginTop: 10 }} onClick={add}>
        + Thêm variable
      </button>

      <Field label="Validation rules (JSON Schema)">
        <textarea
          className="textarea mono"
          defaultValue={`{
  "transcript": { "minLength": 100 },
  "urd_current": { "minLength": 200 },
  "output_format": { "enum": ["structured-diff", "plain", "json"] }
}`}
          style={{ minHeight: 100 }}
        />
      </Field>
    </Modal>
  );
}

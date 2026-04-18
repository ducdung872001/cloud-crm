import { useState } from "react";
import { Modal, Field, Input, Segmented, Textarea } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OpenApiImportModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<"url" | "file" | "paste">("url");
  const [url, setUrl] = useState("");
  const [spec, setSpec] = useState("");
  const { submitting, submit } = useFormStub("Đã import OpenAPI", "Sinh 27 endpoints + 14 schemas");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import OpenAPI spec"
      kicker="STAGE 5 · OPENAPI"
      sub="Import spec có sẵn → Claude sinh endpoint stub + DTO"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={submitting || (mode === "url" && !url) || (mode === "paste" && !spec)}
            onClick={() => submit(onClose)}
          >
            {submitting ? "Đang import..." : "Import"}
          </button>
        </>
      }
    >
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: "url", label: "URL" },
          { value: "file", label: "Upload file" },
          { value: "paste", label: "Paste YAML/JSON" },
        ]}
      />

      <div style={{ marginTop: 14 }}>
        {mode === "url" ? (
          <Field label="OpenAPI URL" required help="YAML hoặc JSON">
            <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.megamart.vn/openapi.yaml" />
          </Field>
        ) : mode === "file" ? (
          <Field label="File spec" required>
            <div className="upload-zone" style={{ padding: 18 }}>
              <div className="field-help">Kéo thả openapi.yaml / .json / .yml</div>
            </div>
          </Field>
        ) : (
          <Field label="OpenAPI spec (YAML hoặc JSON)" required>
            <Textarea
              className="mono"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              style={{ minHeight: 240 }}
              placeholder={`openapi: 3.0.3
info:
  title: Megamart API
  version: 1.0.0
paths:
  /screens:
    get: ...`}
            />
          </Field>
        )}
      </div>

      <div style={{ marginTop: 14, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Sau khi import, Claude sẽ sinh</div>
      <div
        style={{
          padding: 10,
          background: "var(--slate-50)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--slate-600)",
        }}
      >
        • Endpoint stub (controller/handler) theo path
        <br />
        • DTO class (request/response schema)
        <br />
        • Validation rules (min, max, regex)
        <br />• OpenAPI UI (Swagger) tự động
      </div>
    </Modal>
  );
}

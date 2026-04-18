import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ImportProjectModal({ open, onClose }: Props) {
  const [source, setSource] = useState<"git" | "zip" | "bitbucket">("git");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [analyze, setAnalyze] = useState(true);
  const [genUrd, setGenUrd] = useState(true);
  const { submitting, submit } = useFormStub("Đã import project", "AI phân tích code + sinh URD tương ứng...");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import project có sẵn"
      kicker="IMPORT"
      sub="Import codebase đang tồn tại → Reborn Forge tiếp quản"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || !repoUrl} onClick={() => submit(onClose)}>
            {submitting ? "Đang import..." : "Import"}
          </button>
        </>
      }
    >
      <Field label="Nguồn" required>
        <Select
          value={source}
          onChange={(e) => setSource(e.target.value as typeof source)}
          options={[
            { value: "git", label: "GitHub / GitLab URL" },
            { value: "bitbucket", label: "Bitbucket" },
            { value: "zip", label: "Upload .zip" },
          ]}
        />
      </Field>

      {source === "zip" ? (
        <Field label="File .zip" required>
          <div className="upload-zone" style={{ padding: 18 }}>
            <div className="field-help">Kéo thả .zip hoặc click chọn</div>
          </div>
        </Field>
      ) : (
        <FieldRow>
          <Field label="Repository URL" required>
            <Input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/org/repo" />
          </Field>
          <Field label="Branch">
            <Input value={branch} onChange={(e) => setBranch(e.target.value)} />
          </Field>
        </FieldRow>
      )}

      <Checkbox
        label="AI phân tích codebase"
        help="Detect stack, architecture, API endpoints. Ước tính $0.80 — 5 phút"
        checked={analyze}
        onChange={setAnalyze}
      />
      <Checkbox label="Sinh URD ngược từ code" help="AI đọc code + inferring FR list" checked={genUrd} onChange={setGenUrd} />
    </Modal>
  );
}

import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function RepoConfigModal({ open, onClose }: Props) {
  const [provider, setProvider] = useState("github");
  const [org, setOrg] = useState("reborn-jsc");
  const [repoName, setRepoName] = useState("megamart-dooh-fe");
  const [visibility, setVisibility] = useState<"private" | "internal" | "public">("private");
  const [branchStrategy, setBranchStrategy] = useState("trunk");
  const [autoProtect, setAutoProtect] = useState(true);
  const { submitting, submit } = useFormStub("Đã cấu hình repo", "Repo tạo + CI kích hoạt");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cấu hình Git repository"
      kicker="STAGE 4 · REPO"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || !repoName} onClick={() => submit(onClose)}>
            {submitting ? "Đang tạo..." : "Tạo repo & cấu hình"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="Provider">
          <Select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            options={[
              { value: "github", label: "GitHub" },
              { value: "gitlab", label: "GitLab" },
              { value: "bitbucket", label: "Bitbucket" },
              { value: "gitea", label: "Self-hosted Gitea" },
            ]}
          />
        </Field>
        <Field label="Organization">
          <Input value={org} onChange={(e) => setOrg(e.target.value)} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Repository name" required>
          <Input value={repoName} onChange={(e) => setRepoName(e.target.value)} />
        </Field>
        <Field label="Visibility">
          <Select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as typeof visibility)}
            options={[
              { value: "private", label: "Private" },
              { value: "internal", label: "Internal" },
              { value: "public", label: "Public" },
            ]}
          />
        </Field>
      </FieldRow>

      <Field label="Branch strategy">
        <Select
          value={branchStrategy}
          onChange={(e) => setBranchStrategy(e.target.value)}
          options={[
            { value: "trunk", label: "Trunk-based (main + feature branches)" },
            { value: "gitflow", label: "GitFlow (main + develop + feature)" },
            { value: "github-flow", label: "GitHub Flow (main + PR)" },
          ]}
        />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "10px 0 6px" }}>Branch protection</div>
      <Checkbox
        label="Auto-protect main + develop"
        help="Require PR review, status checks, no force push"
        checked={autoProtect}
        onChange={setAutoProtect}
      />
      <Checkbox label="Require 1 reviewer approval trước merge" defaultChecked />
      <Checkbox label="Require CI pass trước merge" defaultChecked />
      <Checkbox label="Require signed commits" />
      <Checkbox label="Auto-delete branch sau merge" defaultChecked />

      <Field label="Claude Agent bot user" help="Bot commit với tên này, tách bạch với commit human">
        <Input defaultValue="claude-agent[bot]" />
      </Field>
    </Modal>
  );
}

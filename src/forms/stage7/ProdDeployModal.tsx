import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProdDeployModal({ open, onClose }: Props) {
  const [buildSha, setBuildSha] = useState("a1b2c3d4 — v1.0.0");
  const [strategy, setStrategy] = useState("blue-green");
  const [region, setRegion] = useState("ap-se-1");
  const [checkList, setCheckList] = useState({
    uatSigned: true,
    migrationReady: true,
    rollback: true,
    secretsRotated: true,
    announcement: false,
    support: true,
  });
  const [confirm, setConfirm] = useState("");
  const { submitting, submit } = useFormStub("Deploy production kicked off", "Pipeline chạy — thông báo Slack khi done");

  const allReady = Object.values(checkList).every(Boolean);
  const confirmOk = confirm === "MEGAMART";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deploy lên Production"
      kicker="STAGE 7 · PROD DEPLOY"
      sub="Checkpoint cuối — confirm để bắt đầu rollout"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn destructive" disabled={submitting || !allReady || !confirmOk} onClick={() => submit(onClose)}>
            {submitting ? "Đang deploy..." : "🚀 Deploy production"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="Build / Commit" required>
          <Input value={buildSha} onChange={(e) => setBuildSha(e.target.value)} />
        </Field>
        <Field label="Region / Cluster">
          <Select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            options={[
              { value: "ap-se-1", label: "Singapore (ap-southeast-1)" },
              { value: "ap-se-3", label: "Jakarta (ap-southeast-3)" },
              { value: "us-east-1", label: "N. Virginia (us-east-1)" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label="Deploy strategy">
        <Select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          options={[
            { value: "blue-green", label: "Blue-green (recommended)" },
            { value: "rolling", label: "Rolling update" },
            { value: "canary", label: "Canary (5% → 25% → 100%)" },
            { value: "recreate", label: "Recreate (có downtime)" },
          ]}
        />
      </Field>

      <div
        style={{
          padding: 14,
          background: "rgba(225,29,72,0.04)",
          border: "1px solid rgba(225,29,72,0.25)",
          borderRadius: 10,
          marginTop: 14,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Pre-deploy checklist — tất cả phải ✓</div>
        <Checkbox label="UAT đã ký biên bản bởi KH" checked={checkList.uatSigned} onChange={(v) => setCheckList({ ...checkList, uatSigned: v })} />
        <Checkbox
          label="Migration script test ở staging OK"
          checked={checkList.migrationReady}
          onChange={(v) => setCheckList({ ...checkList, migrationReady: v })}
        />
        <Checkbox label="Rollback plan sẵn sàng" checked={checkList.rollback} onChange={(v) => setCheckList({ ...checkList, rollback: v })} />
        <Checkbox
          label="Secrets rotate (API keys, DB password)"
          checked={checkList.secretsRotated}
          onChange={(v) => setCheckList({ ...checkList, secretsRotated: v })}
        />
        <Checkbox
          label="Announcement gửi KH + team (tránh deploy giờ cao điểm)"
          checked={checkList.announcement}
          onChange={(v) => setCheckList({ ...checkList, announcement: v })}
        />
        <Checkbox
          label="Team on-call sẵn sàng support 2h sau deploy"
          checked={checkList.support}
          onChange={(v) => setCheckList({ ...checkList, support: v })}
        />
      </div>

      <Field label="Gõ MEGAMART để confirm deploy" required help="Type project code (chữ hoa) để tránh deploy nhầm">
        <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="MEGAMART" />
      </Field>
    </Modal>
  );
}

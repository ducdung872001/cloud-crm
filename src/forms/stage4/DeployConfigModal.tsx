import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DeployConfigModal({ open, onClose }: Props) {
  const [target, setTarget] = useState("reborn-cloud");
  const [stagingUrl, setStagingUrl] = useState("https://staging.megamart-dooh.reborn.vn");
  const [prodUrl, setProdUrl] = useState("https://megamart-dooh.vn");
  const [autoStaging, setAutoStaging] = useState(true);
  const [autoProd, setAutoProd] = useState(false);
  const { submitting, submit } = useFormStub("Đã lưu deploy config");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deploy configuration"
      kicker="STAGE 4 · DEPLOY"
      sub="CDN, domain, CI/CD pipeline"
      size="wide"
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
      <Field label="Hosting target" required>
        <Select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          options={[
            { value: "reborn-cloud", label: "Reborn Cloud (Docker + Traefik)" },
            { value: "vercel", label: "Vercel" },
            { value: "netlify", label: "Netlify" },
            { value: "cloudflare", label: "Cloudflare Pages" },
            { value: "aws-amplify", label: "AWS Amplify" },
            { value: "custom", label: "Custom (K8s / VM)" },
          ]}
        />
      </Field>

      <FieldRow>
        <Field label="Staging URL" required>
          <Input type="url" value={stagingUrl} onChange={(e) => setStagingUrl(e.target.value)} />
        </Field>
        <Field label="Production URL" required>
          <Input type="url" value={prodUrl} onChange={(e) => setProdUrl(e.target.value)} />
        </Field>
      </FieldRow>

      <FieldRow>
        <Field label="CDN">
          <Select
            defaultValue="cloudflare"
            options={[
              { value: "cloudflare", label: "Cloudflare" },
              { value: "bunny", label: "Bunny CDN" },
              { value: "cloudfront", label: "AWS CloudFront" },
              { value: "none", label: "Không dùng" },
            ]}
          />
        </Field>
        <Field label="SSL">
          <Select
            defaultValue="letsencrypt"
            options={[
              { value: "letsencrypt", label: "Let's Encrypt (auto)" },
              { value: "cloudflare", label: "Cloudflare SSL" },
              { value: "custom", label: "Custom cert" },
            ]}
          />
        </Field>
      </FieldRow>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Auto-deploy</div>
      <Checkbox label="Auto-deploy lên staging mỗi commit vào develop" checked={autoStaging} onChange={setAutoStaging} />
      <Checkbox
        label="Auto-deploy lên prod mỗi merge vào main"
        help="Khuyến nghị tắt — deploy thủ công an toàn hơn"
        checked={autoProd}
        onChange={setAutoProd}
      />
      <Checkbox label="Rollback tự động nếu smoke test fail" defaultChecked />
      <Checkbox label="Blue-green deployment" help="0-downtime, tăng cost" />

      <Field label="Health check endpoint">
        <Input defaultValue="/api/health" style={{ fontFamily: "var(--font-mono)" }} />
      </Field>
    </Modal>
  );
}

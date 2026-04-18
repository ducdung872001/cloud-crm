import { useState } from "react";
import { Modal, Field, FieldRow, Input, Textarea, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ReleaseNoteModal({ open, onClose }: Props) {
  const [version, setVersion] = useState("1.0.0");
  const [date, setDate] = useState("");
  const [highlights, setHighlights] = useState("");
  const [features, setFeatures] = useState(
    "- CMS quản lý 118 màn hình 3 thành phố\n- Campaign scheduler với multi-timezone\n- Dashboard uptime real-time\n- Export báo cáo PDF/Excel"
  );
  const [bugfixes, setBugfixes] = useState("- Fix timezone DST edge case (BUG-106)\n- Fix export UTF-8 encoding (BUG-105)");
  const [known, setKnown] = useState("- Chưa hỗ trợ Safari 15 (upgrade lên 16+)");
  const [breaking, setBreaking] = useState("");
  const { submitting, submit } = useFormStub("Đã publish release note");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Release note editor"
      kicker="STAGE 7 · RELEASE"
      sub="Changelog gửi KH — viết friendly, tránh jargon"
      size="xwide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn">
            Preview
          </button>
          <button type="button" className="btn">
            ↓ Export PDF
          </button>
          <button type="button" className="btn primary" disabled={submitting || !version} onClick={() => submit(onClose)}>
            {submitting ? "Đang publish..." : "Publish"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="Version (semver)" required>
          <Input value={version} onChange={(e) => setVersion(e.target.value)} />
        </Field>
        <Field label="Ngày release" required>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </FieldRow>
      <Field label="Highlights (1-2 dòng tóm tắt)">
        <Textarea
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          placeholder="Bản release đầu tiên với 118 màn hình DOOH trên 3 thành phố, quản lý campaign multi-timezone và báo cáo real-time."
          style={{ minHeight: 60 }}
        />
      </Field>
      <Field label="✨ Features mới">
        <Textarea className="mono" value={features} onChange={(e) => setFeatures(e.target.value)} style={{ minHeight: 100 }} />
      </Field>
      <Field label="🐛 Bug fixes">
        <Textarea className="mono" value={bugfixes} onChange={(e) => setBugfixes(e.target.value)} style={{ minHeight: 80 }} />
      </Field>
      <Field label="⚠ Known issues">
        <Textarea className="mono" value={known} onChange={(e) => setKnown(e.target.value)} style={{ minHeight: 60 }} />
      </Field>
      <Field label="💥 Breaking changes (cho API users)">
        <Textarea className="mono" value={breaking} onChange={(e) => setBreaking(e.target.value)} style={{ minHeight: 60 }} />
      </Field>

      <Checkbox label="Viết song song tiếng Việt + tiếng Anh" defaultChecked />
      <Checkbox label="Gửi email broadcast cho users khi publish" defaultChecked />
      <Checkbox label="Đính kèm migration guide (cho breaking changes)" />
    </Modal>
  );
}

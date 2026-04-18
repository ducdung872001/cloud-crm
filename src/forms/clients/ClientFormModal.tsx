import { useState, useEffect } from "react";
import { Modal, Field, FieldRow, Input, Select } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import type { Client } from "../../data/clients";

interface Props {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (data: Partial<Client>) => void;
}

export default function ClientFormModal({ open, onClose, client, onSave }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [taxId, setTaxId] = useState("");
  const [industry, setIndustry] = useState("Other");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const { submitting, submit } = useFormStub(client ? "Đã cập nhật khách hàng" : "Đã thêm khách hàng");

  useEffect(() => {
    if (open) {
      setName(client?.name ?? "");
      setCode(client?.code ?? "");
      setTaxId(client?.taxId ?? "");
      setIndustry(client?.industry ?? "Other");
      setAddress(client?.address ?? "");
      setWebsite(client?.website ?? "");
    }
  }, [open, client]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? `Sửa: ${client.name}` : "Thêm khách hàng mới"}
      kicker="CLIENT"
      sub="Thông tin hiển thị trên URD, hợp đồng, hóa đơn."
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={submitting || !name || !code}
            onClick={() =>
              submit(() => {
                onSave({ name, code, taxId, industry, address, website });
                onClose();
              })
            }
          >
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="Tên công ty" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Mã khách hàng" required help="Viết hoa, dùng làm prefix project code">
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Mã số thuế">
          <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
        </Field>
        <Field label="Industry">
          <Select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            options={[
              { value: "Retail", label: "Retail / E-commerce" },
              { value: "Banking", label: "Banking / Finance" },
              { value: "Insurance", label: "Insurance" },
              { value: "Manufacturing", label: "Manufacturing" },
              { value: "Telco", label: "Telecom" },
              { value: "Healthcare", label: "Healthcare" },
              { value: "Education", label: "Education" },
              { value: "Government", label: "Government" },
              { value: "Other", label: "Khác" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label="Website">
        <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
      </Field>
      <Field label="Địa chỉ">
        <textarea className="textarea" value={address} onChange={(e) => setAddress(e.target.value)} style={{ minHeight: 60 }} />
      </Field>
    </Modal>
  );
}

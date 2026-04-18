import { useState } from "react";
import { Drawer, ConfirmDialog } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import ContactFormModal from "./ContactFormModal";
import PortalInviteModal from "./PortalInviteModal";
import type { Client, ClientContact } from "../../data/clients";

interface Props {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: () => void;
  onUpdate: (c: Client) => void;
}

export default function ClientDetailDrawer({ open, onClose, client, onEdit, onUpdate }: Props) {
  const { showToast } = useApp();
  const [contactOpen, setContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [delContactId, setDelContactId] = useState<string | null>(null);

  if (!client) return null;

  const saveContact = (c: ClientContact) => {
    const exists = client.contacts.find((x) => x.id === c.id);
    let contacts = exists ? client.contacts.map((x) => (x.id === c.id ? c : x)) : [...client.contacts, c];
    if (c.primary) contacts = contacts.map((x) => ({ ...x, primary: x.id === c.id }));
    onUpdate({ ...client, contacts });
  };

  const deleteContact = (id: string) => onUpdate({ ...client, contacts: client.contacts.filter((x) => x.id !== id) });

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={client.name}
        sub={`${client.code} · ${client.industry}`}
        wide
        footer={
          <>
            <button type="button" className="btn" onClick={() => setPortalOpen(true)}>
              Portal invite
            </button>
            <div style={{ flex: 1 }} />
            <button type="button" className="btn" onClick={onEdit}>
              Sửa thông tin
            </button>
            <button type="button" className="btn primary" onClick={onClose}>
              Đóng
            </button>
          </>
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: client.color,
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 22,
              display: "grid",
              placeItems: "center",
            }}
          >
            {client.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--slate-500)" }}>Khách hàng từ {client.since}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{client.projects} project đang làm</div>
          </div>
          <span className={`tag ${client.portal.enabled ? "tag-ok" : "tag-warn"}`}>{client.portal.enabled ? "Portal active" : "Chưa có portal"}</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 20,
            padding: 14,
            background: "var(--slate-50)",
            borderRadius: 10,
          }}
        >
          <div>
            <div className="field-help">MST</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{client.taxId}</div>
          </div>
          <div>
            <div className="field-help">Website</div>
            <div style={{ fontSize: 12 }}>
              <a href={client.website} target="_blank" rel="noreferrer">
                {client.website}
              </a>
            </div>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <div className="field-help">Địa chỉ</div>
            <div style={{ fontSize: 12 }}>{client.address}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14 }}>Contacts ({client.contacts.length})</div>
          <button
            type="button"
            className="btn sm primary"
            onClick={() => {
              setEditingContact(null);
              setContactOpen(true);
            }}
          >
            + Thêm contact
          </button>
        </div>
        <div className="card">
          <div className="file-list">
            {client.contacts.map((c) => (
              <div
                key={c.id}
                className="file-item"
                onClick={() => {
                  setEditingContact(c);
                  setContactOpen(true);
                }}
              >
                <div
                  className="file-ico"
                  style={{
                    background: c.primary ? "rgba(20,184,166,0.15)" : "var(--slate-100)",
                    color: c.primary ? "var(--teal-500)" : "var(--slate-500)",
                  }}
                >
                  {c.name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="file-name">
                    {c.name} {c.primary ? <span className="tag tag-ok">Primary</span> : null}
                  </div>
                  <div className="file-sub">
                    {c.title} · {c.email} · {c.phone}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="btn sm danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDelContactId(c.id);
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Drawer>

      <ContactFormModal open={contactOpen} onClose={() => setContactOpen(false)} contact={editingContact} onSave={saveContact} />
      <PortalInviteModal open={portalOpen} onClose={() => setPortalOpen(false)} client={client} />
      <ConfirmDialog
        open={!!delContactId}
        onClose={() => setDelContactId(null)}
        onConfirm={() => {
          deleteContact(delContactId!);
          showToast("warn", "Đã xóa contact");
        }}
        title="Xóa contact?"
      />
    </>
  );
}

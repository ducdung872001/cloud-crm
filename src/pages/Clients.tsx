import { useMemo, useState } from "react";
import ClientFormModal from "../forms/clients/ClientFormModal";
import ClientDetailDrawer from "../forms/clients/ClientDetailDrawer";
import { CLIENTS as INIT, type Client } from "../data/clients";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(INIT);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [detail, setDetail] = useState<Client | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
  }, [clients, search]);

  const saveClient = (data: Partial<Client>) => {
    if (editing) {
      setClients((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)));
      setDetail((d) => (d && editing.id === d.id ? { ...d, ...data } : d));
    } else {
      const id = (data.code ?? "new").toLowerCase();
      setClients((prev) => [
        ...prev,
        {
          id,
          name: data.name ?? "",
          code: data.code ?? "",
          taxId: data.taxId ?? "",
          industry: data.industry ?? "Other",
          address: data.address ?? "",
          website: data.website ?? "",
          initials: (data.name ?? "NA")
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          color: "var(--slate-500)",
          projects: 0,
          contacts: [],
          portal: { enabled: false },
          since: new Date().toLocaleDateString("vi-VN"),
        },
      ]);
    }
  };

  const updateClient = (c: Client) => {
    setClients((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    setDetail(c);
  };

  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">🏢 CLIENTS</div>
          <div className="kicker">CRM · {clients.length} khách hàng</div>
          <h1 className="title">Khách hàng</h1>
          <p className="desc">Database KH của Reborn — contact, dự án đang làm, portal access, signature.</p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            + Thêm khách hàng
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="input"
          placeholder="⌕ Tìm theo tên / code / industry..."
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid-3">
        {filtered.map((c) => (
          <div key={c.id} className="card" style={{ padding: 16, cursor: "pointer" }} onClick={() => setDetail(c)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: c.color,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {c.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "var(--slate-900)",
                  }}
                >
                  {c.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--slate-500)" }}>{c.industry}</div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                paddingTop: 10,
                borderTop: "1px solid var(--slate-100)",
                fontSize: 11,
              }}
            >
              <div>
                <div style={{ color: "var(--slate-500)" }}>Projects</div>
                <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{c.projects}</div>
              </div>
              <div>
                <div style={{ color: "var(--slate-500)" }}>Contacts</div>
                <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{c.contacts.length}</div>
              </div>
              <div>
                <div style={{ color: "var(--slate-500)" }}>Portal</div>
                <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{c.portal.enabled ? "✓" : "—"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ClientFormModal open={formOpen} onClose={() => setFormOpen(false)} client={editing} onSave={saveClient} />
      <ClientDetailDrawer
        open={!!detail}
        onClose={() => setDetail(null)}
        client={detail}
        onEdit={() => {
          setEditing(detail);
          setFormOpen(true);
        }}
        onUpdate={updateClient}
      />
    </section>
  );
}

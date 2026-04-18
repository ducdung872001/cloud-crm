import { useState } from "react";
import { Modal, Field, Input, Select } from "../../components/ui";
import { useApp } from "../../context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Column {
  name: string;
  type: string;
  pk: boolean;
  nullable: boolean;
  fk?: string;
}

interface Table {
  name: string;
  columns: Column[];
}

const INIT: Table[] = [
  {
    name: "screens",
    columns: [
      { name: "id", type: "uuid", pk: true, nullable: false },
      { name: "code", type: "varchar(32)", pk: false, nullable: false },
      { name: "branch_id", type: "uuid", pk: false, nullable: false, fk: "branches.id" },
      { name: "lat", type: "decimal", pk: false, nullable: true },
      { name: "lng", type: "decimal", pk: false, nullable: true },
      { name: "status", type: "varchar(16)", pk: false, nullable: false },
      { name: "created_at", type: "timestamptz", pk: false, nullable: false },
    ],
  },
  {
    name: "campaigns",
    columns: [
      { name: "id", type: "uuid", pk: true, nullable: false },
      { name: "name", type: "varchar(255)", pk: false, nullable: false },
      { name: "start_at", type: "timestamptz", pk: false, nullable: false },
      { name: "end_at", type: "timestamptz", pk: false, nullable: false },
    ],
  },
];

export default function SchemaEditorModal({ open, onClose }: Props) {
  const { showToast } = useApp();
  const [tables, setTables] = useState(INIT);
  const [selected, setSelected] = useState(INIT[0].name);

  const current = tables.find((t) => t.name === selected);

  const addColumn = () => {
    if (!current) return;
    setTables((prev) =>
      prev.map((t) =>
        t.name === selected ? { ...t, columns: [...t.columns, { name: "new_col", type: "varchar(255)", pk: false, nullable: true }] } : t
      )
    );
  };

  const addTable = () => {
    const name = `new_table_${tables.length + 1}`;
    setTables((prev) => [
      ...prev,
      {
        name,
        columns: [
          { name: "id", type: "uuid", pk: true, nullable: false },
          { name: "created_at", type: "timestamptz", pk: false, nullable: false },
        ],
      },
    ]);
    setSelected(name);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Database schema editor"
      kicker="STAGE 5 · SCHEMA"
      sub="Tạo/sửa table và column. Claude sẽ sinh migration + JOOQ/Prisma code."
      size="xwide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="btn" onClick={() => showToast("info", "Export SQL", "schema.sql")}>
            ↓ Export .sql
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => showToast("success", "Đã sinh migration V2__add_screens.sql", "Commit vào Git")}
          >
            Generate migration
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14, minHeight: 400 }}>
        <aside
          style={{
            background: "var(--slate-50)",
            borderRadius: 8,
            padding: 10,
            overflowY: "auto",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--slate-500)", marginBottom: 6 }}>TABLES ({tables.length})</div>
          {tables.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setSelected(t.name)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px 8px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: selected === t.name ? "rgba(20,184,166,0.1)" : "transparent",
                color: selected === t.name ? "var(--teal-500)" : "var(--slate-700)",
                fontWeight: selected === t.name ? 600 : 400,
              }}
            >
              {t.name}
            </button>
          ))}
          <button type="button" className="btn sm" style={{ marginTop: 8, width: "100%", justifyContent: "center" }} onClick={addTable}>
            + Table
          </button>
        </aside>

        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Field label="Tên table">
            <Input
              value={current?.name ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setTables((prev) => prev.map((t) => (t.name === selected ? { ...t, name: v } : t)));
                setSelected(v);
              }}
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </Field>

          <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Columns</div>
          <table className="table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>PK</th>
                <th>Null</th>
                <th>FK</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {current?.columns.map((c, i) => (
                <tr key={i}>
                  <td>
                    <Input defaultValue={c.name} style={{ fontFamily: "var(--font-mono)", fontSize: 12 }} />
                  </td>
                  <td>
                    <Select
                      defaultValue={c.type}
                      options={[
                        { value: "uuid", label: "uuid" },
                        { value: "bigserial", label: "bigserial" },
                        { value: "varchar(32)", label: "varchar(32)" },
                        { value: "varchar(255)", label: "varchar(255)" },
                        { value: "text", label: "text" },
                        { value: "boolean", label: "boolean" },
                        { value: "int", label: "int" },
                        { value: "decimal", label: "decimal" },
                        { value: "timestamptz", label: "timestamptz" },
                        { value: "jsonb", label: "jsonb" },
                      ]}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <input type="checkbox" defaultChecked={c.pk} />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <input type="checkbox" defaultChecked={c.nullable} />
                  </td>
                  <td>
                    <Input defaultValue={c.fk ?? ""} placeholder="table.column" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
                  </td>
                  <td>
                    <button type="button" className="btn sm danger">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" className="btn sm" style={{ marginTop: 10, alignSelf: "flex-start" }} onClick={addColumn}>
            + Column
          </button>
        </div>
      </div>
    </Modal>
  );
}

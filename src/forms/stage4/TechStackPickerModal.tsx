import { useState } from "react";
import { Modal, Field, Select, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  {
    id: "next-shadcn",
    name: "Next.js 14 + shadcn/ui",
    desc: "App Router · Tailwind · Zustand · React Query · TypeScript",
    popular: true,
  },
  {
    id: "vite-mui",
    name: "Vite + MUI + React Query",
    desc: "SPA classic · Material UI · Axios · Context",
  },
  {
    id: "remix-tailwind",
    name: "Remix + Tailwind",
    desc: "SSR nested routing · Prisma · Tailwind",
  },
  {
    id: "svelte-kit",
    name: "SvelteKit",
    desc: "Svelte 5 · Tailwind · tRPC",
  },
  {
    id: "custom",
    name: "Tự chọn",
    desc: "Setup thủ công — Claude không scaffold",
  },
];

const STYLING = [
  { value: "tailwind", label: "Tailwind CSS + shadcn" },
  { value: "mui", label: "Material UI" },
  { value: "chakra", label: "Chakra UI" },
  { value: "antd", label: "Ant Design" },
  { value: "css", label: "CSS thuần" },
];

export default function TechStackPickerModal({ open, onClose }: Props) {
  const [template, setTemplate] = useState("next-shadcn");
  const [styling, setStyling] = useState("tailwind");
  const [router, setRouter] = useState("app-router");
  const [state, setState] = useState("zustand");
  const [data, setData] = useState("react-query");
  const [tests, setTests] = useState(true);
  const [i18n, setI18n] = useState(true);
  const [errorTracking, setErrorTracking] = useState(true);
  const { submitting, submit } = useFormStub("Đã chọn stack", "Claude scaffold sẽ chạy khi bắt đầu Stage");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chọn frontend stack"
      kicker="STAGE 4 · STACK"
      sub="Template + thư viện. Claude sẽ scaffold theo cấu hình này."
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Xác nhận stack"}
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTemplate(t.id)}
            style={{
              padding: 14,
              border: `2px solid ${template === t.id ? "var(--teal-500)" : "var(--slate-200)"}`,
              background: template === t.id ? "rgba(20,184,166,0.05)" : "#fff",
              borderRadius: 10,
              textAlign: "left",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              {t.name}
              {t.popular ? <span className="tag tag-ok">Popular</span> : null}
            </div>
            <div style={{ fontSize: 11, color: "var(--slate-500)" }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Tùy chọn nâng cao</div>
      <Field label="Styling">
        <Select value={styling} onChange={(e) => setStyling(e.target.value)} options={STYLING} />
      </Field>
      <Field label="Routing">
        <Select
          value={router}
          onChange={(e) => setRouter(e.target.value)}
          options={[
            { value: "app-router", label: "App Router (Next.js 14)" },
            { value: "pages-router", label: "Pages Router" },
            { value: "react-router", label: "React Router v7" },
            { value: "tanstack", label: "TanStack Router" },
          ]}
        />
      </Field>
      <Field label="State management">
        <Select
          value={state}
          onChange={(e) => setState(e.target.value)}
          options={[
            { value: "zustand", label: "Zustand" },
            { value: "jotai", label: "Jotai" },
            { value: "redux", label: "Redux Toolkit" },
            { value: "context", label: "Context API thuần" },
          ]}
        />
      </Field>
      <Field label="Data fetching">
        <Select
          value={data}
          onChange={(e) => setData(e.target.value)}
          options={[
            { value: "react-query", label: "TanStack Query" },
            { value: "swr", label: "SWR" },
            { value: "apollo", label: "Apollo Client (GraphQL)" },
            { value: "fetch", label: "Native fetch" },
          ]}
        />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Thiết lập sẵn</div>
      <Checkbox label="Vitest + Playwright" checked={tests} onChange={setTests} />
      <Checkbox label="i18n (vi + en)" checked={i18n} onChange={setI18n} />
      <Checkbox label="Error tracking (Sentry)" checked={errorTracking} onChange={setErrorTracking} />
      <Checkbox label="ESLint strict + Prettier + Husky" defaultChecked />
      <Checkbox label="Storybook" />
    </Modal>
  );
}

import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

interface FieldProps {
  label?: ReactNode;
  required?: boolean;
  help?: ReactNode;
  error?: string;
  children: ReactNode;
}

export function Field({ label, required, help, error, children }: FieldProps) {
  return (
    <div className="field">
      {label ? (
        <div className="field-label">
          {label}
          {required ? <span className="field-required">*</span> : null}
        </div>
      ) : null}
      {children}
      {error ? <div className="field-error">{error}</div> : help ? <div className="field-help">{help}</div> : null}
    </div>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="field-row">{children}</div>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`input ${className}`} {...rest} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea className={`textarea ${className}`} {...rest} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  const { options, className = "", ...rest } = props;
  return (
    <select className={`select ${className}`} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

interface CheckboxProps {
  label: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  help?: ReactNode;
}
export function Checkbox({ label, checked, defaultChecked, onChange, help }: CheckboxProps) {
  return (
    <label className="checkbox-row">
      <input type="checkbox" checked={checked} defaultChecked={defaultChecked} onChange={(e) => onChange?.(e.target.checked)} />
      <div>
        <div>{label}</div>
        {help ? <div className="field-help">{help}</div> : null}
      </div>
    </label>
  );
}

interface ToggleProps {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  help?: ReactNode;
}
export function Toggle({ label, checked, defaultChecked, onChange, help }: ToggleProps) {
  return (
    <label className="checkbox-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div>
        {label ? <div>{label}</div> : null}
        {help ? <div className="field-help">{help}</div> : null}
      </div>
      <span className="toggle">
        <input type="checkbox" checked={checked} defaultChecked={defaultChecked} onChange={(e) => onChange?.(e.target.checked)} />
        <span className="toggle-slider" />
      </span>
    </label>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}
export function Segmented<T extends string>({ value, onChange, options }: SegmentedProps<T>) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button key={o.value} type="button" className={value === o.value ? "active" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface ChipsProps {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}
export function Chips({ value, onChange, placeholder }: ChipsProps) {
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <div className="chips">
      {value.map((v, i) => (
        <span key={`${v}-${i}`} className="chip">
          {v}
          <button type="button" onClick={() => remove(i)}>
            ✕
          </button>
        </span>
      ))}
      <input
        placeholder={placeholder ?? "Nhập và Enter"}
        onKeyDown={(e) => {
          const t = e.currentTarget;
          if (e.key === "Enter" && t.value.trim()) {
            e.preventDefault();
            onChange([...value, t.value.trim()]);
            t.value = "";
          } else if (e.key === "Backspace" && !t.value && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
      />
    </div>
  );
}

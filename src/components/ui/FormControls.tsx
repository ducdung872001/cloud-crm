import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Controller, useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { Chips, Segmented, Toggle } from "./Field";

// Shared props
interface Common<T extends FieldValues> {
  name: FieldPath<T>;
  label?: ReactNode;
  help?: ReactNode;
  required?: boolean;
}

function FieldShell({
  label,
  help,
  error,
  required,
  children,
}: {
  label?: ReactNode;
  help?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
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

// ============ TEXT INPUT ============
interface TextFieldProps<T extends FieldValues> extends Common<T>, Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {}

export function TextField<T extends FieldValues>({ name, label, help, required, className = "", ...rest }: TextFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const err = (errors[name] as { message?: string } | undefined)?.message;
  return (
    <FieldShell label={label} help={help} error={err} required={required}>
      <input className={`input ${err ? "error" : ""} ${className}`} {...rest} {...register(name)} />
    </FieldShell>
  );
}

// ============ TEXTAREA ============
interface TextareaFieldProps<T extends FieldValues> extends Common<T>, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> {
  mono?: boolean;
}

export function TextareaField<T extends FieldValues>({ name, label, help, required, mono, className = "", ...rest }: TextareaFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const err = (errors[name] as { message?: string } | undefined)?.message;
  return (
    <FieldShell label={label} help={help} error={err} required={required}>
      <textarea className={`textarea ${mono ? "mono" : ""} ${err ? "error" : ""} ${className}`} {...rest} {...register(name)} />
    </FieldShell>
  );
}

// ============ SELECT ============
interface SelectFieldProps<T extends FieldValues> extends Common<T>, Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> {
  options: { value: string; label: string }[];
}

export function SelectField<T extends FieldValues>({ name, label, help, required, options, className = "", ...rest }: SelectFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const err = (errors[name] as { message?: string } | undefined)?.message;
  return (
    <FieldShell label={label} help={help} error={err} required={required}>
      <select className={`select ${err ? "error" : ""} ${className}`} {...rest} {...register(name)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

// ============ CHECKBOX (inline, NO label wrapper) ============
interface CheckboxFieldProps<T extends FieldValues> extends Common<T> {
  labelText: ReactNode;
}

export function CheckboxField<T extends FieldValues>({ name, labelText, help }: CheckboxFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const err = (errors[name] as { message?: string } | undefined)?.message;
  return (
    <div>
      <label className="checkbox-row">
        <input type="checkbox" {...register(name)} />
        <div>
          <div>{labelText}</div>
          {help ? <div className="field-help">{help}</div> : null}
        </div>
      </label>
      {err ? (
        <div className="field-error" style={{ marginLeft: 26 }}>
          {err}
        </div>
      ) : null}
    </div>
  );
}

// ============ TOGGLE ============
interface ToggleFieldProps<T extends FieldValues> extends Common<T> {
  labelText: ReactNode;
}

export function ToggleField<T extends FieldValues>({ name, labelText, help }: ToggleFieldProps<T>) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <Toggle label={labelText} help={help} checked={!!field.value} onChange={field.onChange} />}
    />
  );
}

// ============ CHIPS ============
interface ChipsFieldProps<T extends FieldValues> extends Common<T> {
  placeholder?: string;
}

export function ChipsField<T extends FieldValues>({ name, label, help, required, placeholder }: ChipsFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();
  const err = (errors[name] as { message?: string } | undefined)?.message;
  return (
    <FieldShell label={label} help={help} error={err} required={required}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <Chips value={(field.value as string[]) ?? []} onChange={field.onChange} placeholder={placeholder} />}
      />
    </FieldShell>
  );
}

// ============ SEGMENTED ============
interface SegmentedFieldProps<T extends FieldValues> extends Common<T> {
  options: { value: string; label: string }[];
}

export function SegmentedField<T extends FieldValues>({ name, label, help, required, options }: SegmentedFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();
  const err = (errors[name] as { message?: string } | undefined)?.message;
  return (
    <FieldShell label={label} help={help} error={err} required={required}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <Segmented value={field.value as string} onChange={field.onChange} options={options} />}
      />
    </FieldShell>
  );
}

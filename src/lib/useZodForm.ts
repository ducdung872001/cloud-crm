import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues, type FieldValues, type Resolver, type UseFormProps, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";

interface UseZodFormOptions<V extends FieldValues> extends Omit<UseFormProps<V>, "resolver" | "defaultValues"> {
  schema: z.ZodType<V>;
  defaultValues?: DefaultValues<V>;
}

/** Wrapper: infer type từ schema, cung cấp resolver + onTouched mặc định. */
export function useZodForm<V extends FieldValues>({ schema, defaultValues, ...rest }: UseZodFormOptions<V>): UseFormReturn<V> {
  return useForm<V>({
    resolver: zodResolver(schema as never) as Resolver<V>,
    defaultValues,
    mode: "onTouched",
    reValidateMode: "onChange",
    ...rest,
  });
}

export type { FieldValues };

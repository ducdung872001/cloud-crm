import { useCallback, useState } from "react";
import { useApp } from "../context/AppContext";

export function useFormStub(successTitle: string, successSub?: string) {
  const { showToast } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(
    (onDone?: () => void) => {
      setSubmitting(true);
      window.setTimeout(() => {
        setSubmitting(false);
        showToast("success", successTitle, successSub);
        onDone?.();
      }, 400);
    },
    [showToast, successTitle, successSub]
  );

  return { submitting, submit };
}

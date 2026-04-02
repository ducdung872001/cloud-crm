// ═══════════════════════════════════════════════════════════════════════
// useApiData – generic hook for data fetching with loading/error/refetch
// ═══════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";

export interface UseApiDataOptions<T> {
  /** The async function that fetches data; receives an AbortSignal */
  fetcher: (signal: AbortSignal) => Promise<T>;
  /** Initial value before first fetch */
  initialData?: T;
  /** Whether to fetch immediately on mount */
  autoFetch?: boolean;
}

export interface UseApiDataResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiData<T>({
  fetcher,
  initialData,
  autoFetch = true,
}: UseApiDataOptions<T>): UseApiDataResult<T> {
  const [data,    setData]    = useState<T>(initialData as T);
  const [loading, setLoading] = useState(autoFetch);
  const [error,   setError]   = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher(abortRef.current.signal);
      setData(result);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Đã xảy ra lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (autoFetch) refetch();
    return () => abortRef.current?.abort();
  }, [refetch, autoFetch]);

  return { data, loading, error, refetch };
}

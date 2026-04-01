import { useCallback, useEffect, useRef, useState } from "react";
import { showToast } from "utils/common";
import ShortcutService from "services/ShortcutService";
import {
  DEFAULT_SHORTCUT_KEYS,
  MAX_SHORTCUT,
  ShortcutKey,
} from "model/dashboard/DashboardModel";

interface UseShortcutReturn {
  activeKeys: ShortcutKey[];
  isLoading: boolean;
  isSaving: boolean;
  draftKeys: ShortcutKey[];
  toggleDraftKey: (key: ShortcutKey) => void;
  saveShortcuts: () => Promise<void>;
  resetDraft: () => void;
}

export function useShortcut(): UseShortcutReturn {
  const [activeKeys, setActiveKeys] = useState<ShortcutKey[]>(DEFAULT_SHORTCUT_KEYS);
  const [draftKeys, setDraftKeys] = useState<ShortcutKey[]>(DEFAULT_SHORTCUT_KEYS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeKeysRef = useRef(activeKeys);
  useEffect(() => { activeKeysRef.current = activeKeys; }, [activeKeys]);

  // ── Fetch khi mount ──────────────────────────────────────────────────────
  const fetchShortcuts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ShortcutService.get();
      if (res.code === 0 && res.result?.shortcuts?.length) {
        setActiveKeys(res.result.shortcuts);
        setDraftKeys(res.result.shortcuts);
      }
    } catch {
      // silent — giữ default
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchShortcuts(); }, [fetchShortcuts]);

  // ── Draft handlers ────────────────────────────────────────────────────────
  const toggleDraftKey = useCallback((key: ShortcutKey) => {
    setDraftKeys((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= MAX_SHORTCUT) {
        showToast(`Chỉ được chọn tối đa ${MAX_SHORTCUT} tính năng`, "warning");
        return prev;
      }
      return [...prev, key];
    });
  }, []);

  const resetDraft = useCallback(() => {
    setDraftKeys(activeKeysRef.current);
  }, []);

  // ── Save với optimistic update ────────────────────────────────────────────
  const saveShortcuts = useCallback(async () => {
    const previous = activeKeysRef.current;
    const toSave = [...draftKeys];

    setActiveKeys(toSave); // optimistic
    setIsSaving(true);

    try {
      const res = await ShortcutService.update(toSave);
      if (res.code === 0) {
        const confirmed = res.result?.shortcuts ?? toSave;
        setActiveKeys(confirmed);
        setDraftKeys(confirmed);
        showToast("Đã lưu tùy chỉnh truy cập nhanh", "success");
      } else {
        setActiveKeys(previous);
        setDraftKeys(previous);
        showToast(res.message ?? "Lưu thất bại, vui lòng thử lại", "error");
      }
    } catch {
      setActiveKeys(previous);
      setDraftKeys(previous);
      showToast("Lưu thất bại, vui lòng thử lại", "error");
    } finally {
      setIsSaving(false);
    }
  }, [draftKeys]);

  return { activeKeys, isLoading, isSaving, draftKeys, toggleDraftKey, saveShortcuts, resetDraft };
}
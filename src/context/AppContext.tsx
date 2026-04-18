import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { PROJECTS, findProject, type Project } from "../data/projects";

export type ToastKind = "success" | "info" | "warn";

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  title: string;
  sub?: string;
}

export type Role = "BA" | "Dev" | "QA" | "PM" | "Client";

interface AppState {
  currentProject: Project;
  setCurrentProject: (id: string) => void;

  role: Role;
  setRole: (role: Role) => void;

  switcherOpen: boolean;
  openSwitcher: () => void;
  closeSwitcher: () => void;

  toasts: ToastMessage[];
  showToast: (kind: ToastKind, title: string, sub?: string) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentProjectId, setCurrentProjectId] = useState<string>(PROJECTS[0].id);
  const [role, setRole] = useState<Role>("BA");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  const currentProject = useMemo(() => findProject(currentProjectId) ?? PROJECTS[0], [currentProjectId]);

  const setCurrentProject = useCallback((id: string) => {
    if (findProject(id)) setCurrentProjectId(id);
  }, []);

  const openSwitcher = useCallback(() => setSwitcherOpen(true), []);
  const closeSwitcher = useCallback(() => setSwitcherOpen(false), []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (kind: ToastKind, title: string, sub?: string) => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, kind, title, sub }]);
      window.setTimeout(() => dismissToast(id), 3000);
    },
    [dismissToast]
  );

  const value = useMemo<AppState>(
    () => ({
      currentProject,
      setCurrentProject,
      role,
      setRole,
      switcherOpen,
      openSwitcher,
      closeSwitcher,
      toasts,
      showToast,
      dismissToast,
    }),
    [currentProject, setCurrentProject, role, switcherOpen, openSwitcher, closeSwitcher, toasts, showToast, dismissToast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

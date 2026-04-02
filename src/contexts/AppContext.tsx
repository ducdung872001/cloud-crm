import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
export interface IUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  branchCode: string;
  avatar?: string;
  token?: string;
}

export type ToastType = "success" | "info" | "warning" | "error";

export interface IToast {
  id: string;
  message: string;
  type: ToastType;
}

export interface AppContextType {
  user: IUser;
  isCollapsedSidebar: boolean;
  setIsCollapsedSidebar: (v: boolean) => void;
  toasts: IToast[];
  showToast: (msg: string, type?: ToastType) => void;
  activePage: string;
  setActivePage: (page: string) => void;
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

// ── Default User (mock) ────────────────────────────────────────────────────
const DEFAULT_USER: IUser = {
  id: "RM-HN-042",
  name: "Trần Nguyên",
  initials: "TN",
  email: "t.nguyen@rebornbank.vn",
  phone: "0912 345 678",
  role: "Relationship Manager",
  branch: "Chi nhánh Hà Nội",
  branchCode: "HN-Q2",
};

// ── Context ────────────────────────────────────────────────────────────────
export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isCollapsedSidebar, setIsCollapsedSidebar] = useState(false);
  const [toasts, setToasts] = useState<IToast[]>([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const openModal = useCallback((id: string) => setActiveModal(id), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <AppContext.Provider
      value={{
        user: DEFAULT_USER,
        isCollapsedSidebar,
        setIsCollapsedSidebar,
        toasts,
        showToast,
        activePage,
        setActivePage,
        activeModal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

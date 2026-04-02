import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface IUser {
  id: string; name: string; initials: string; email: string; phone: string;
  role: string; branch: string; branchCode: string; avatar?: string; token?: string;
  permissions?: Record<string, number>;
}
export type ToastType = "success" | "info" | "warning" | "error";
export interface IToast { id: string; message: string; type: ToastType; }

export interface AppContextType {
  isAuthenticated: boolean;
  user: IUser;
  login: (userData: any, token: string) => void;
  logout: () => void;
  isCollapsedSidebar: boolean;
  setIsCollapsedSidebar: (v: boolean) => void;
  toasts: IToast[];
  showToast: (msg: string, type?: ToastType) => void;
  activePage: string;
  setActivePage: (page: string) => void;
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
  hasPermission: (code: string) => boolean;
}

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function buildUser(u: any, perms: Record<string, number> = {}): IUser {
  const name = u?.name || u?.fullName || "Người dùng";
  const initials = name.split(" ").filter(Boolean).map((w: string) => w[0]).slice(-2).join("").toUpperCase() || "?";
  return {
    id: String(u?.id || ""), name, initials, email: u?.email || "", phone: u?.phone || "",
    role: u?.role || u?.title || "RM", branch: u?.branchName || "Chi nhánh",
    branchCode: u?.branchCode || "", avatar: u?.avatar, token: getCookie("token") || undefined, permissions: perms,
  };
}

function buildGuest(): IUser {
  return { id: "", name: "Guest", initials: "?", email: "", phone: "", role: "", branch: "", branchCode: "", permissions: {} };
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getCookie("token"));

  const [user, setUser] = useState<IUser>(() => {
    const saved = getCookie("user");
    if (saved) {
      try {
        const perms = JSON.parse(localStorage.getItem("permissions") || "{}");
        return buildUser(JSON.parse(saved), perms);
      } catch {}
    }
    return buildGuest();
  });

  // Validate token still exists on mount
  useEffect(() => {
    const token = getCookie("token");
    if (!token) { setIsAuthenticated(false); setUser(buildGuest()); }
  }, []);

  const login = useCallback((userData: any, _token: string) => {
    const perms = JSON.parse(localStorage.getItem("permissions") || "{}");
    setUser(buildUser(userData, perms));
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    ["token","user"].forEach(n => { document.cookie = `${n}=; Max-Age=0; path=/`; });
    localStorage.removeItem("permissions");
    localStorage.removeItem("user.root");
    setIsAuthenticated(false);
    setUser(buildGuest());
    setActivePage("dashboard");
  }, []);

  const hasPermission = useCallback((code: string) => !!(user.permissions?.[code]), [user.permissions]);

  const [isCollapsedSidebar, setIsCollapsedSidebar] = useState(false);
  const [toasts, setToasts]       = useState<IToast[]>([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const openModal  = useCallback((id: string) => setActiveModal(id), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <AppContext.Provider value={{ isAuthenticated, user, login, logout, isCollapsedSidebar, setIsCollapsedSidebar, toasts, showToast, activePage, setActivePage, activeModal, openModal, closeModal, hasPermission }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

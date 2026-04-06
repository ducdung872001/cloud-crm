import React, { useContext } from "react";
import { ProductStore, DataExpired, LanguageValue, DataInfoEmployee, RoleItem } from "./userContext";

export interface AuthContextType {
  id: number;
  idEmployee: number;
  username: string;
  name: string;
  phone: string;
  avatar: string;
  email: string;
  token: string;
  role: string;
  gender: number;
  permissions: Record<string, boolean>;
  product_store: ProductStore;
  dataExpired: DataExpired;
  valueLanguage: LanguageValue;
  setValueLanguage: (value: LanguageValue) => void;
  dataInfoEmployee: DataInfoEmployee | null;
  lstRole: RoleItem[];
  dataBeauty: unknown;
  setDataBeauty: (value: unknown) => void;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthContext.Provider");
  return ctx;
}

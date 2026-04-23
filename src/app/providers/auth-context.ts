import { createContext } from "react";
import type { LoginRequest, AuthUser } from "@/types/auth";
import type { CompanySettings } from "@/types/company";

export type AuthContextValue = {
  user: AuthUser | null;
  companySettings: CompanySettings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hydrateSession: () => Promise<void>;
  refreshCompanySettings: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

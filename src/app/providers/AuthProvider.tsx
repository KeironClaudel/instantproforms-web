import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshToken,
} from "@/lib/api/authApi";
import { getCompanySettings } from "@/lib/api/companyApi";
import type { AuthUser, LoginRequest } from "@/types/auth";
import type { CompanySettings } from "@/types/company";

type AuthContextValue = {
  user: AuthUser | null;
  companySettings: CompanySettings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hydrateSession: () => Promise<void>;
  refreshCompanySettings: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setCompanySettings(null);
  }, []);

  const hydrateSession = useCallback(async () => {
    try {
      setIsLoading(true);

      let currentUser: AuthUser | null = null;

      try {
        currentUser = await getCurrentUser();
      } catch {
        try {
          await refreshToken();
          currentUser = await getCurrentUser();
        } catch {
          clearSession();
          return;
        }
      }

      setUser(currentUser);

      try {
        const settings = await getCompanySettings();
        setCompanySettings(settings);
      } catch {
        setCompanySettings(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  const login = useCallback(
    async (request: LoginRequest) => {
      setIsLoading(true);

      const currentUser = await loginRequest(request);
      setUser(currentUser);

      try {
        const settings = await getCompanySettings();
        setCompanySettings(settings);
      } catch {
        setCompanySettings(null);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshCompanySettings = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const settings = await getCompanySettings();
      setCompanySettings(settings);
    } catch {
      setCompanySettings(null);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      companySettings,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      hydrateSession,
      refreshCompanySettings,
    }),
    [user, companySettings, isLoading, login, logout, hydrateSession, refreshCompanySettings],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
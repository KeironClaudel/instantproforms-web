import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "@/lib/api/authApi";
import { AuthContext, type AuthContextValue } from "@/app/providers/auth-context";
import { getCompanySettings } from "@/lib/api/companyApi";
import type { AuthUser, LoginRequest } from "@/types/auth";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companySettings, setCompanySettings] = useState<AuthContextValue["companySettings"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setCompanySettings(null);
  }, []);

  const hydrateSession = useCallback(async () => {
    try {
      setIsLoading(true);

      const currentUser = await getCurrentUser();
      setUser(currentUser);

      try {
        const settings = await getCompanySettings();
        setCompanySettings(settings);
      } catch {
        setCompanySettings(null);
      }
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  const login = useCallback(
    async (request: LoginRequest) => {
      setIsLoading(true);

      try {
        const currentUser = await loginRequest(request);
        setUser(currentUser);

        try {
          const settings = await getCompanySettings();
          setCompanySettings(settings);
        } catch {
          setCompanySettings(null);
        }
      } catch {
        clearSession();
        throw new Error("Login failed.");
      } finally {
        setIsLoading(false);
      }
    },
    [clearSession],
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

  useEffect(() => {
    function handleSessionExpired() {
      setIsLoading(false);
      clearSession();
    }

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [clearSession]);

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

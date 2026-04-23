import { useEffect, type PropsWithChildren } from "react";
import { useAuth } from "@/app/providers/AuthProvider";

export function AppBootstrap({ children }: PropsWithChildren) {
  const { hydrateSession } = useAuth();

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  return <>{children}</>;
}
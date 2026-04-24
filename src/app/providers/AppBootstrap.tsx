import { useEffect, type PropsWithChildren } from "react";
import { useAuth } from "@/app/providers/useAuth";
import { PwaManager } from "@/components/pwa/PwaManager";

export function AppBootstrap({ children }: PropsWithChildren) {
  const { hydrateSession } = useAuth();

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  return (
    <>
      {children}
      <PwaManager />
    </>
  );
}

import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

export function AppShell() {
  const { companySettings, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            {companySettings?.logoUrl ? (
              <img
                src={companySettings.logoUrl}
                alt={companySettings.displayName}
                className="h-10 w-10 rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold">
                IP
              </div>
            )}

            <div>
              <div className="font-semibold">
                {companySettings?.displayName ?? "InstantProforms"}
              </div>
              <div className="text-xs text-slate-500">
                Prefix: {companySettings?.proformPrefix ?? "-"} · Tax:{" "}
                {companySettings?.taxPercentage ?? 0}%
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/app">Dashboard</Link>
            <Link to="/app/proforms/new">New Proform</Link>
            <Link to="/app/settings">Settings</Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-slate-300 px-3 py-1.5"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
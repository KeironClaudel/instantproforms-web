import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";
import { isCompanySetupComplete } from "@/lib/utils/companySetup";

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return [
    "rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");
}

function setupLinkClassName({ isActive }: { isActive: boolean }) {
  return [
    "rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-amber-500 text-white"
      : "bg-amber-100 text-amber-800 hover:bg-amber-200",
  ].join(" ");
}

export function AppShell() {
  const { companySettings, logout } = useAuth();
  const isSetupComplete = isCompanySetupComplete(companySettings);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {companySettings?.logoUrl ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img
                  src={companySettings.logoUrl}
                  alt={companySettings.displayName}
                  className="h-9 w-9 object-contain"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-200 text-sm font-semibold shadow-sm">
                IP
              </div>
            )}

            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-slate-900">
                {companySettings?.displayName ?? "InstantProforms"}
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Prefix: {companySettings?.proformPrefix ?? "-"}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Tax: {companySettings?.taxPercentage ?? 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-2 md:flex">
              <NavLink to="/app" end className={navLinkClassName}>
                Dashboard
              </NavLink>

              <NavLink to="/app/proforms/new" className={navLinkClassName}>
                New Proform
              </NavLink>

              <NavLink to="/app/proforms" className={navLinkClassName}>
                Proforms
              </NavLink>

              <NavLink to="/app/settings" className={navLinkClassName}>
                Settings
              </NavLink>

              {!isSetupComplete ? (
                <NavLink to="/app/onboarding/company" className={setupLinkClassName}>
                  Complete Setup
                </NavLink>
              ) : null}
            </nav>

            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6">
            <NavLink to="/app" end className={navLinkClassName}>
              Dashboard
            </NavLink>

            <NavLink to="/app/proforms/new" className={navLinkClassName}>
              New Proform
            </NavLink>

            <NavLink to="/app/proforms" className={navLinkClassName}>
              Proforms
            </NavLink>

            <NavLink to="/app/settings" className={navLinkClassName}>
              Settings
            </NavLink>

            {!isSetupComplete ? (
              <NavLink to="/app/onboarding/company" className={setupLinkClassName}>
                Complete Setup
              </NavLink>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
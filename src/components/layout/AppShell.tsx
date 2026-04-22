import { Link, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="font-semibold">InstantProforms</div>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/app">Dashboard</Link>
            <Link to="/app/proforms/new">New Proform</Link>
            <Link to="/app/settings">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
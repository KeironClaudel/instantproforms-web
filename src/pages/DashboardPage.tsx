import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";
import { isCompanySetupComplete } from "@/lib/utils/companySetup";

function InfoCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
      {helper ? <div className="mt-1 text-sm text-slate-500">{helper}</div> : null}
    </div>
  );
}

function QuickAction({
  to,
  title,
  description,
  variant = "default",
}: {
  to: string;
  title: string;
  description: string;
  variant?: "default" | "highlight";
}) {
  const className =
    variant === "highlight"
      ? "rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
      : "rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50";

  return (
    <Link to={to} className={className}>
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-600">{description}</div>
    </Link>
  );
}

export function DashboardPage() {
  const { user, companySettings } = useAuth();
  const isSetupComplete = isCompanySetupComplete(companySettings);

  const companyName = companySettings?.displayName?.trim() || "Your Company";
  const prefix = companySettings?.proformPrefix?.trim() || "-";
  const taxPercentage =
    companySettings && Number.isFinite(companySettings.taxPercentage)
      ? `${companySettings.taxPercentage}%`
      : "-";
  const currencySymbol = companySettings?.currencySymbol?.trim() || "-";
  const taxLabel = companySettings?.taxLabel?.trim() || "-";
  const website = companySettings?.website?.trim() || "Not configured yet";
  const phone = companySettings?.phone?.trim() || "Not configured yet";

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
              Dashboard
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Welcome back, {user?.fullName?.split(" ")[0] ?? "User"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Manage your company workspace, create proforms faster, and keep your branding and tax settings aligned across every document.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Workspace
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              {companyName}
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Setup status:{" "}
              <span
                className={
                  isSetupComplete ? "font-medium text-emerald-700" : "font-medium text-amber-700"
                }
              >
                {isSetupComplete ? "Complete" : "Needs attention"}
              </span>
            </div>
          </div>
        </div>

        {!isSetupComplete ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-semibold text-amber-900">
              Finish your company setup
            </div>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Some essential company information is still incomplete. Finish the setup so your branding and tax configuration stay consistent across proforms.
            </p>

            <div className="mt-4">
              <Link
                to="/app/onboarding/company"
                className="inline-flex rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600"
              >
                Complete Setup
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Quick Actions
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Jump directly into the most common tasks.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <QuickAction
                to="/app/proforms/new"
                title="Create New Proform"
                description="Start a new branded proform with live totals and delivery actions."
                variant="highlight"
              />

              <QuickAction
                to="/app/settings"
                title="Open Company Settings"
                description="Update branding, logo, company information, and tax configuration."
              />

              {!isSetupComplete ? (
                <QuickAction
                  to="/app/onboarding/company"
                  title="Complete Setup"
                  description="Finish the essential company fields required for a smoother workflow."
                  variant="highlight"
                />
              ) : null}

              <QuickAction
                to="/app/settings"
                title="Review Branding"
                description="Check colors, prefix, logo, and preview how your workspace looks."
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Latest Settings Snapshot
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                A quick overview of the current company configuration.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="Prefix" value={prefix} helper="Used for proform numbering." />
              <InfoCard title="Tax" value={taxPercentage} helper={`${taxLabel} configured per company.`} />
              <InfoCard title="Currency" value={currencySymbol} helper="Displayed across totals and summaries." />
              <InfoCard title="Website" value={website} />
              <InfoCard title="Phone" value={phone} />
              <InfoCard
                title="Logo"
                value={companySettings?.logoUrl ? "Uploaded" : "Not uploaded"}
                helper={
                  companySettings?.logoUrl
                    ? "Your branding logo is available."
                    : "Upload a logo from Settings."
                }
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Company Identity
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                A simple visual snapshot of your current workspace identity.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-100 p-4">
              <div
                  className="rounded-3xl p-5 text-white"
                  style={{ backgroundColor: companySettings?.primaryColor ?? "#0f172a" }}
                >
                <div className="flex items-center gap-3">
                  {companySettings?.logoUrl ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                      <img
                        src={companySettings.logoUrl}
                        alt={companyName}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-900">
                      IP
                    </div>
                  )}

                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/70">
                      {prefix}-000001
                    </div>
                    <div className="mt-1 text-xl font-semibold">{companyName}</div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-white/70">
                      Tax Configuration
                    </div>
                    <div className="mt-1 font-medium">
                      {taxLabel} · {taxPercentage}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-white/70">
                      Currency
                    </div>
                    <div className="mt-1 font-medium">{currencySymbol}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Next Best Action
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Keep moving toward the fastest value inside the app.
              </p>
            </div>

            {isSetupComplete ? (
              <Link
                to="/app/proforms/new"
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
              >
                <div className="text-base font-semibold text-slate-900">
                  Create your next proform
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-600">
                  You already have the essentials configured. Jump straight into your proform workflow.
                </div>
              </Link>
            ) : (
              <Link
                to="/app/onboarding/company"
                className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
              >
                <div className="text-base font-semibold text-amber-900">
                  Finish company setup
                </div>
                <div className="mt-1 text-sm leading-6 text-amber-800">
                  Complete your basic company information so proforms stay consistent and production-ready.
                </div>
              </Link>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
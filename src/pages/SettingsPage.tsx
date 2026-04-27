import { PageLoader } from "@/components/ui/PageLoader";
import { useSettingsPage } from "@/hooks/pages/company/useSettingsPage";

export function SettingsPage() {
  const {
    companySettings,
    feedback,
    form,
    handleLogoChange,
    handleSubmit,
    isLoading,
    isSaving,
    isUploadingLogo,
    previewStyles,
    updateField,
  } = useSettingsPage();

  const inputClassName =
    "w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200";

  const textareaClassName =
    "min-h-32 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200";

  if (isLoading) {
    return <PageLoader message="Loading company settings..." />;
  }

  return (
    <div className="mx-auto max-w-5xl px-1 sm:px-0">
      <div className="mb-8">
        <div className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          Company Configuration
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Company Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Manage your branding, tax settings, contact details, and document configuration.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              Company Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Display Name</label>
                <input
                  className={inputClassName}
                  value={form.displayName}
                  onChange={(event) => updateField("displayName", event.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Legal Name</label>
                <input
                  className={inputClassName}
                  value={form.legalName}
                  onChange={(event) => updateField("legalName", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Website</label>
                <input
                  className={inputClassName}
                  value={form.website}
                  onChange={(event) => updateField("website", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                  className={inputClassName}
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className={inputClassName}
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Address</label>
                <input
                  className={inputClassName}
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Terms and Conditions</label>
                <textarea
                  className={textareaClassName}
                  value={form.termsAndConditions}
                  onChange={(event) => updateField("termsAndConditions", event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              Branding and Document Rules
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Primary Color</label>
                <input
                  type="color"
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white p-2"
                  value={form.primaryColor}
                  onChange={(event) => updateField("primaryColor", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Secondary Color</label>
                <input
                  type="color"
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white p-2"
                  value={form.secondaryColor}
                  onChange={(event) => updateField("secondaryColor", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Accent Color</label>
                <input
                  type="color"
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white p-2"
                  value={form.accentColor}
                  onChange={(event) => updateField("accentColor", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Proform Prefix</label>
                <input
                  className={inputClassName}
                  value={form.proformPrefix}
                  onChange={(event) => updateField("proformPrefix", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Tax Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className={inputClassName}
                  value={form.taxPercentage}
                  onChange={(event) => updateField("taxPercentage", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Currency Symbol</label>
                <input
                  className={inputClassName}
                  value={form.currencySymbol}
                  onChange={(event) => updateField("currencySymbol", event.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Tax Label</label>
                <input
                  className={inputClassName}
                  value={form.taxLabel}
                  onChange={(event) => updateField("taxLabel", event.target.value)}
                />
              </div>
            </div>
          </section>

          {feedback ? (
            <div
              className={`rounded-2xl px-4 py-3.5 text-sm shadow-sm ${
                feedback.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving changes..." : "Save Settings"}
          </button>
        </form>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              Logo
            </h2>

            <div className="flex flex-col items-center gap-4">
              {companySettings?.logoUrl ? (
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <img
                    src={companySettings.logoUrl}
                    alt={companySettings.displayName}
                    className="h-20 w-20 object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs font-medium text-slate-500">
                  No logo uploaded yet
                </div>
              )}

              <label className="w-full cursor-pointer rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                {isUploadingLogo ? "Uploading..." : "Replace Logo"}
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={(event) => void handleLogoChange(event)}
                  disabled={isUploadingLogo}
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              Live Preview
            </h2>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div
                className="rounded-3xl p-4 text-white"
                style={{ backgroundColor: previewStyles.primaryColor }}
              >
                <div className="text-sm uppercase tracking-wide text-white/80">
                  {previewStyles.prefix}-000001
                </div>

                <div className="mt-2 text-xl font-semibold">
                  {previewStyles.displayName}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div
                    className="rounded-2xl p-3 text-slate-900"
                    style={{ backgroundColor: previewStyles.secondaryColor }}
                  >
                    <div className="text-xs uppercase tracking-wide text-slate-600">
                      Tax
                    </div>
                    <div className="mt-1 font-semibold">
                      {previewStyles.taxLabel} ({previewStyles.taxPercentage}%)
                    </div>
                  </div>

                  <div
                    className="rounded-2xl p-3 text-slate-900"
                    style={{ backgroundColor: previewStyles.accentColor }}
                  >
                    <div className="text-xs uppercase tracking-wide text-slate-600">
                      Currency
                    </div>
                    <div className="mt-1 font-semibold">{previewStyles.currencySymbol}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

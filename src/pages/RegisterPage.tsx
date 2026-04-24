import { useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { registerCompany } from "@/lib/api/authApi";
import { createErrorFeedback, createSuccessFeedback } from "@/lib/utils/feedback";

const defaultTerms = `The warranty does not cover damage, failures, or modifications caused by improper handling, intervention, or alterations performed by third parties unrelated to the company.

Any issue related to the installation must be reported directly to the company before any repair or intervention.

If the client authorizes repairs by third parties without prior assessment, the granted warranty will be automatically voided.

The company is not responsible for damage caused by overloads, defective equipment, unauthorized connections, or improper use.`;

export function RegisterPage() {
  const navigate = useNavigate();
  const submitLockRef = useRef(false);

  const [form, setForm] = useState({
    companyName: "",
    companySlug: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyWebsite: "",
    displayName: "",
    legalName: "",
    termsAndConditions: defaultTerms,
    primaryColor: "#1B2D5A",
    secondaryColor: "#e6c7f0",
    accentColor: "#dbe2ff",
    proformPrefix: "PRO",
    taxPercentage: "13",
    currencySymbol: "₡",
    taxLabel: "Tax",
    ownerFullName: "",
    ownerEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const inputClassName =
    "w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200";

  const textareaClassName =
    "min-h-32 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200";

  const preview = useMemo(
    () => ({
      displayName: form.displayName.trim() || "Your Company",
      prefix: form.proformPrefix.trim() || "PRO",
      taxPercentage: form.taxPercentage.trim() || "0",
      currencySymbol: form.currencySymbol.trim() || "₡",
      taxLabel: form.taxLabel.trim() || "Tax",
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      accentColor: form.accentColor,
    }),
    [form],
  );

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function getRegisterErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
      return "Failed to register the company.";
    }

    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData &&
      typeof responseData.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }

    return "Failed to register the company.";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    setFeedback(null);

    const parsedTaxPercentage = Number(form.taxPercentage);

    if (!form.companyName.trim()) {
      setFeedback(createErrorFeedback("Company name is required."));
      return;
    }

    if (!form.companySlug.trim()) {
      setFeedback(createErrorFeedback("Company slug is required."));
      return;
    }

    if (!form.displayName.trim()) {
      setFeedback(createErrorFeedback("Display name is required."));
      return;
    }

    if (!form.ownerFullName.trim()) {
      setFeedback(createErrorFeedback("Owner full name is required."));
      return;
    }

    if (!form.ownerEmail.trim()) {
      setFeedback(createErrorFeedback("Owner email is required."));
      return;
    }

    if (!form.password.trim()) {
      setFeedback(createErrorFeedback("Password is required."));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFeedback(createErrorFeedback("Passwords do not match."));
      return;
    }

    if (!logoFile) {
      setFeedback(createErrorFeedback("Company logo is required."));
      return;
    }

    if (
      !Number.isFinite(parsedTaxPercentage) ||
      parsedTaxPercentage < 0 ||
      parsedTaxPercentage > 100
    ) {
      setFeedback(createErrorFeedback("Tax percentage must be between 0 and 100."));
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      await registerCompany({
        companyName: form.companyName.trim(),
        companySlug: form.companySlug.trim(),
        companyEmail: form.companyEmail.trim(),
        companyPhone: form.companyPhone.trim(),
        companyAddress: form.companyAddress.trim(),
        companyWebsite: form.companyWebsite.trim(),
        displayName: form.displayName.trim(),
        legalName: form.legalName.trim(),
        termsAndConditions: form.termsAndConditions.trim(),
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        proformPrefix: form.proformPrefix.trim(),
        taxPercentage: parsedTaxPercentage,
        currencySymbol: form.currencySymbol.trim(),
        taxLabel: form.taxLabel.trim(),
        logoFile,
        ownerFullName: form.ownerFullName.trim(),
        ownerEmail: form.ownerEmail.trim(),
        password: form.password,
      });

      setFeedback(createSuccessFeedback("Company registered successfully. Redirecting to login..."));

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 900);
    } catch (error) {
      setFeedback(createErrorFeedback(getRegisterErrorMessage(error)));
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <div className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          Public Registration
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Create your company workspace
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Register your company, branding, tax rules, and owner account in one step.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              Company Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Company Name</label>
                <input
                  className={inputClassName}
                  value={form.companyName}
                  onChange={(event) => updateField("companyName", event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Company Slug</label>
                <input
                  className={inputClassName}
                  value={form.companySlug}
                  onChange={(event) => updateField("companySlug", event.target.value)}
                  required
                />
              </div>

              <div>
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
                <label className="mb-1 block text-sm font-medium">Company Email</label>
                <input
                  type="email"
                  className={inputClassName}
                  value={form.companyEmail}
                  onChange={(event) => updateField("companyEmail", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                  className={inputClassName}
                  value={form.companyPhone}
                  onChange={(event) => updateField("companyPhone", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Website</label>
                <input
                  className={inputClassName}
                  value={form.companyWebsite}
                  onChange={(event) => updateField("companyWebsite", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Address</label>
                <input
                  className={inputClassName}
                  value={form.companyAddress}
                  onChange={(event) => updateField("companyAddress", event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              Owner Account
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Owner Full Name</label>
                <input
                  className={inputClassName}
                  value={form.ownerFullName}
                  onChange={(event) => updateField("ownerFullName", event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Owner Email</label>
                <input
                  type="email"
                  className={inputClassName}
                  value={form.ownerEmail}
                  onChange={(event) => updateField("ownerEmail", event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  type="password"
                  className={inputClassName}
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  className={inputClassName}
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              Branding and Tax
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

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Company Logo</label>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  className={inputClassName}
                  onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              Terms and Conditions
            </h2>

            <textarea
              className={textareaClassName}
              value={form.termsAndConditions}
              onChange={(event) => updateField("termsAndConditions", event.target.value)}
            />
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
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating workspace..." : "Create Company Workspace"}
          </button>

          <div className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-slate-900 underline">
              Sign in
            </Link>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Live Preview
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            This is a quick preview of how your company setup will feel inside the app.
          </p>

          <div className="mt-5 rounded-3xl bg-slate-100 p-4">
            <div
              className="rounded-3xl p-5 text-white"
              style={{ backgroundColor: preview.primaryColor }}
            >
              <div className="text-xs uppercase tracking-wide text-white/70">
                {preview.prefix}-000001
              </div>

              <div className="mt-2 text-2xl font-semibold">{preview.displayName}</div>

              <div className="mt-5 grid gap-3">
                <div
                  className="rounded-2xl p-3 text-slate-900"
                  style={{ backgroundColor: preview.secondaryColor }}
                >
                  <div className="text-xs uppercase tracking-wide text-slate-600">
                    Tax
                  </div>
                  <div className="mt-1 font-semibold">
                    {preview.taxLabel} ({preview.taxPercentage}%)
                  </div>
                </div>

                <div
                  className="rounded-2xl p-3 text-slate-900"
                  style={{ backgroundColor: preview.accentColor }}
                >
                  <div className="text-xs uppercase tracking-wide text-slate-600">
                    Currency
                  </div>
                  <div className="mt-1 font-semibold">{preview.currencySymbol}</div>
                </div>

                <div className="rounded-2xl border border-dashed border-white/30 px-4 py-3 text-sm text-white/80">
                  Logo: {logoFile ? logoFile.name : "Not selected yet"}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

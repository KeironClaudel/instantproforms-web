import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForgotPasswordPage } from "@/hooks/pages/auth/useForgotPasswordPage";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { email, feedback, handleSubmit, isSubmitting, setEmail } = useForgotPasswordPage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="mb-4 flex justify-end">
            <LanguageSwitcher compact />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            {t("pages.forgotPassword.title")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t("pages.forgotPassword.description")}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
              {t("common.labels.email")}
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {feedback ? (
            <div
              className={`rounded-xl px-3 py-2 text-sm ${
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
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("pages.forgotPassword.sending") : t("pages.forgotPassword.sendLink")}
          </button>

          <div className="text-center text-sm text-slate-600">
            {t("pages.forgotPassword.remembered")}{" "}
            <Link to="/login" className="font-medium text-slate-900 underline">
              {t("pages.forgotPassword.backToSignIn")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

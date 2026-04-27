import { Link } from "react-router-dom";
import { useResetPasswordPage } from "@/hooks/pages/auth/useResetPasswordPage";

export function ResetPasswordPage() {
  const {
    confirmPassword,
    feedback,
    handleSubmit,
    isSubmitting,
    newPassword,
    setConfirmPassword,
    setNewPassword,
    token,
  } = useResetPasswordPage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Reset password</h1>
          <p className="mt-2 text-sm text-slate-600">
            Choose a new password for your account.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="new-password"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              At least 8 characters, including uppercase, lowercase, and a digit.
            </p>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="confirm-password"
            >
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {!token ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This page needs a valid reset token from the email link.
            </div>
          ) : null}

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
            disabled={isSubmitting || !token}
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>

          <div className="text-center text-sm text-slate-600">
            <Link to="/login" className="font-medium text-slate-900 underline">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

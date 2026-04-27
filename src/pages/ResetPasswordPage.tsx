import axios from "axios";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "@/lib/api/authApi";
import { createErrorFeedback, createSuccessFeedback } from "@/lib/utils/feedback";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
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

  return fallbackMessage;
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!token) {
      setFeedback(createErrorFeedback("The reset token is missing or invalid."));
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback(createErrorFeedback("Passwords do not match."));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        token,
        newPassword,
      });

      setFeedback(createSuccessFeedback(response.message));

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (error) {
      setFeedback(
        createErrorFeedback(
          getApiErrorMessage(error, "Failed to reset the password."),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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

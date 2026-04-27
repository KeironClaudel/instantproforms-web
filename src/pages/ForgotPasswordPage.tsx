import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "@/lib/api/authApi";
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

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await forgotPassword({
        email: email.trim(),
      });

      setFeedback(createSuccessFeedback(response.message));
    } catch (error) {
      setFeedback(
        createErrorFeedback(
          getApiErrorMessage(error, "Failed to start the password reset process."),
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
          <h1 className="text-2xl font-semibold text-slate-900">Forgot password</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
              Email
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
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>

          <div className="text-center text-sm text-slate-600">
            Remembered your password?{" "}
            <Link to="/login" className="font-medium text-slate-900 underline">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

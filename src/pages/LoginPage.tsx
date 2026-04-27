import { Link, Navigate } from "react-router-dom";
import { useLoginPage } from "@/hooks/pages/auth/useLoginPage";

export function LoginPage() {
  const {
    email,
    errorMessage,
    handleSubmit,
    isSubmitting,
    setEmail,
    setPassword,
    password,
    shouldRedirect,
  } = useLoginPage();

  if (shouldRedirect) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Access your InstantProforms workspace.
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-slate-900 underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <div className="mt-4 text-center text-sm text-slate-600">
            Not registered yet?{" "}
            <Link to="/register" className="font-medium text-slate-900 underline">
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

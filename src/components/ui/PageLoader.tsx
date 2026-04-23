export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
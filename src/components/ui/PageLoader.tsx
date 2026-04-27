import { useTranslation } from "react-i18next";

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p className="text-sm text-slate-500">
          {message === "Loading..." ? t("components.pageLoader.loading") : message}
        </p>
      </div>
    </div>
  );
}

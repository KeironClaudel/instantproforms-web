import { useTranslation } from "react-i18next";

const languageOptions = [
  { code: "es", labelKey: "components.languageSwitcher.spanish", shortLabel: "ES" },
  { code: "en", labelKey: "components.languageSwitcher.english", shortLabel: "EN" },
] as const;

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  return (
    <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
      {languageOptions.map((option) => {
        const isActive = i18n.resolvedLanguage?.startsWith(option.code) ?? i18n.language.startsWith(option.code);

        return (
          <button
            key={option.code}
            type="button"
            onClick={() => void i18n.changeLanguage(option.code)}
            className={[
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              isActive
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
            title={t(option.labelKey)}
            aria-label={t(option.labelKey)}
          >
            {compact ? option.shortLabel : t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

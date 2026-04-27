import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "@/lib/i18n/locales/en";
import { es } from "@/lib/i18n/locales/es";

const STORAGE_KEY = "instantproforms-language";
const SUPPORTED_LANGUAGES = ["en", "es"] as const;

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return "es";
  }

  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage as (typeof SUPPORTED_LANGUAGES)[number])) {
    return storedLanguage;
  }

  const browserLanguage = window.navigator.language.toLowerCase();
  return browserLanguage.startsWith("es") ? "es" : "en";
}

void i18n.use(initReactI18next).init({
  interpolation: {
    escapeValue: false,
  },
  fallbackLng: "es",
  lng: getInitialLanguage(),
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
});

if (typeof window !== "undefined") {
  document.documentElement.lang = i18n.language;

  i18n.on("languageChanged", (language) => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  });
}

export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { fr } from "./translations/fr";
import { en } from "./translations/en";

const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fr",
    lng: localStorage.getItem("jobconnect_language") || undefined,
    supportedLngs: ["fr", "en"],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "jobconnect_language",
      caches: ["localStorage"],
    },
  });

// Synchronize HTML lang attribute
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem("jobconnect_language", lng);
});

export default i18n;

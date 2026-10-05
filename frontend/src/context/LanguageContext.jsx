import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import i18n from "../i18n";
import { formatCurrency, formatDate, formatNumber, formatRelativeTime } from "../utils/formatters";

const LanguageContext = createContext({
  language: "fr",
  isFrench: true,
  isEnglish: false,
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, fallback) => key,
  formatCurrency: (amount, currency) => "",
  formatDate: (date, options) => "",
  formatNumber: (num) => "",
  formatRelativeTime: (date) => "",
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("jobconnect_language");
    if (saved === "fr" || saved === "en") return saved;
    if (typeof navigator !== "undefined" && navigator.language) {
      if (navigator.language.toLowerCase().startsWith("en")) return "en";
    }
    return "fr";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("jobconnect_language", language);
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  const setLanguage = useCallback((lang) => {
    if (lang === "fr" || lang === "en") {
      setLanguageState(lang);
      i18n.changeLanguage(lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    const next = language === "fr" ? "en" : "fr";
    setLanguage(next);
  }, [language, setLanguage]);

  const t = useCallback(
    (key, fallback = "") => {
      const translated = i18n.t(key, { defaultValue: fallback || key });
      return translated;
    },
    []
  );

  const formatCurrencyLocalized = useCallback(
    (amount, currency = "FCFA") => formatCurrency(amount, language, currency),
    [language]
  );

  const formatDateLocalized = useCallback(
    (date, options) => formatDate(date, language, options),
    [language]
  );

  const formatNumberLocalized = useCallback(
    (num) => formatNumber(num, language),
    [language]
  );

  const formatRelativeTimeLocalized = useCallback(
    (date) => formatRelativeTime(date, language),
    [language]
  );

  const value = {
    language,
    isFrench: language === "fr",
    isEnglish: language === "en",
    setLanguage,
    toggleLanguage,
    t,
    formatCurrency: formatCurrencyLocalized,
    formatDate: formatDateLocalized,
    formatNumber: formatNumberLocalized,
    formatRelativeTime: formatRelativeTimeLocalized,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export default LanguageContext;

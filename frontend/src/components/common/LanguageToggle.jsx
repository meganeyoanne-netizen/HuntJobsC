import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageToggle({
  className = "",
  variant = "pill", // "pill" | "dropdown" | "button" | "compact"
  showLabel = true,
}) {
  const { language, setLanguage, toggleLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 transition-all ${className}`}
        role="group"
        aria-label="Sélection de la langue"
      >
        <button
          type="button"
          onClick={() => setLanguage("fr")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
            language === "fr"
              ? "bg-white text-blue-600 shadow-sm shadow-slate-900/5 dark:bg-blue-600 dark:text-white"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          aria-pressed={language === "fr"}
        >
          <span>🇫🇷</span>
          <span>FR</span>
        </button>

        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
            language === "en"
              ? "bg-white text-blue-600 shadow-sm shadow-slate-900/5 dark:bg-blue-600 dark:text-white"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          aria-pressed={language === "en"}
        >
          <span>🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <Globe size={15} className="text-blue-600 dark:text-blue-400" />
          <span>{language === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}</span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 z-50 mt-1.5 w-36 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => {
                setLanguage("fr");
                setDropdownOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                language === "fr"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🇫🇷</span> Français
              </span>
              {language === "fr" && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setLanguage("en");
                setDropdownOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                language === "en"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🇬🇧</span> English
              </span>
              {language === "en" && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Compact or simple toggle button
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`group inline-flex items-center gap-1.5 rounded-xl p-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${className}`}
      title={language === "fr" ? "Switch to English" : "Passer en Français"}
      aria-label={language === "fr" ? "Switch to English" : "Passer en Français"}
    >
      <Globe size={17} className="text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400 transition-colors" />
      <span className="uppercase tracking-wider font-extrabold">{language}</span>
    </button>
  );
}

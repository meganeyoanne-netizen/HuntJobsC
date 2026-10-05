import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({
  className = "",
  size = 19,
  showLabel = false,
  variant = "button", // "button" | "dropdown-item" | "pill"
}) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative inline-flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-300 ${
          isDark ? "bg-blue-600" : "bg-slate-300"
        } ${className}`}
        aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      >
        <span
          className={`flex h-6 w-6 transform items-center justify-center rounded-full bg-white text-slate-800 shadow-md transition-transform duration-300 ${
            isDark ? "translate-x-6 text-blue-600" : "translate-x-0"
          }`}
        >
          {isDark ? <Moon size={13} /> : <Sun size={13} className="text-amber-500" />}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn group relative inline-flex items-center justify-center gap-2 rounded-xl p-2.5 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white ${className}`}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode sombre actif (cliquer pour mode clair)" : "Mode clair actif (cliquer pour mode sombre)"}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun
            size={size}
            className="text-amber-400 transition-transform duration-300 group-hover:rotate-45"
          />
        ) : (
          <Moon
            size={size}
            className="text-slate-700 transition-transform duration-300 group-hover:-rotate-12 dark:text-slate-200"
          />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? "Mode clair" : "Mode sombre"}
        </span>
      )}
    </button>
  );
}

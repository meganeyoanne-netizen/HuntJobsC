import { fr } from "./fr";
import { en } from "./en";

export const translations = { fr, en };

export function getTranslation(lang, path, fallback = "") {
  const currentLang = translations[lang] || translations.fr;
  const keys = path.split(".");
  let result = currentLang;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      // Fallback to french if key is missing in target language
      let fallbackResult = translations.fr;
      for (const fKey of keys) {
        if (fallbackResult && typeof fallbackResult === "object" && fKey in fallbackResult) {
          fallbackResult = fallbackResult[fKey];
        } else {
          return fallback || path;
        }
      }
      return fallbackResult || fallback || path;
    }
  }

  return typeof result === "string" ? result : fallback || path;
}

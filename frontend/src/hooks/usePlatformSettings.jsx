import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
export const platformDefaults = {
  platformName: "JobConnect", platformEmail: "contact@jobconnect.cm", platformPhone: "", country: "Cameroun", language: "Français",
  homeTitle: "Votre talent mérite la bonne opportunité.",
  homeDescription: "JobConnect connecte les talents et les entreprises grâce à une plateforme moderne, intelligente et conçue pour simplifier chaque étape du recrutement.",
  maintenanceMessage: "La plateforme est temporairement en maintenance. Merci de réessayer plus tard.",
  allowRegistration: true, maintenanceMode: false, aiEnabled: true, aiOfferAnalysis: true, aiInterviewSimulation: true, aiCVAdvisor: true, aiRecruiterQuestions: true,
};
const PlatformContext = createContext({ settings: platformDefaults, loading: true });
export function PlatformSettingsProvider({ children }) {
  const [settings, setSettings] = useState(platformDefaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    try { setSettings({ ...platformDefaults, ...await api("/platform/settings/") }); setError(null); }
    catch (error) { setError(error); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("platform-settings-changed", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener("platform-settings-changed", refresh); };
  }, [refresh]);
  useEffect(() => { document.title = settings.platformName; }, [settings.platformName]);
  return <PlatformContext.Provider value={{ settings, loading, error, refresh }}>{children}</PlatformContext.Provider>;
}
export const usePlatformSettings = () => useContext(PlatformContext);

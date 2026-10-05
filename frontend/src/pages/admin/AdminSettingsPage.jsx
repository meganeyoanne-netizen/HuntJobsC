import { platformDefaults } from "../../hooks/usePlatformSettings";
import { Button, Input } from "../../components/ui";


import { useEffect } from "react";
import { patch, perform, success } from "../../services/api";
import { useResource } from "../../hooks/useResource";


import { useState } from "react";
import { AlertTriangle, Bell, Bot, Building2, Check, ChevronRight, CircleHelp, Database, FileCheck2, Globe, KeyRound, Lock, Mail, MonitorCog, Save, Settings, Shield, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, User, Users, BriefcaseBusiness, Clock3 } from "lucide-react";



function AdminSettingsPage({
  user = {
    firstName: "",
    lastName: "",
    email: "admin@jobconnect.cm",
  },
  onNavigate,
  onLogout,
}) {
  const adminName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Administrateur";

  const [activeSection, setActiveSection] = useState("general");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    ...platformDefaults,
    platformName: "JobConnect",
    platformEmail: "contact@jobconnect.cm",
    country: "Cameroun",
    language: "Français",
    allowRegistration: true,
    maintenanceMode: false,
    autoModeration: false,
    recruiterVerification: true,
    emailVerification: true,
    offerModeration: true,
    adminNotifications: true,
    securityNotifications: true,
    newUserNotifications: true,
    aiEnabled: true,
    aiOfferAnalysis: true,
    aiInterviewSimulation: true,
    aiCVAdvisor: true,
    twoFactorAuth: false,
    sessionProtection: true,
  });

  const [savedSettings]=useResource("/administration/settings/",v=>v,null);
  useEffect(()=>{if(savedSettings)setSettings(s=>({...s,...savedSettings}));},[savedSettings]);
  const updateSetting = (key, value) => {
    setSaved(false);
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSave = () => perform(async () => {const updated = await patch("/administration/settings/",settings);setSettings(previous=>({...previous,...updated}));window.dispatchEvent(new Event("platform-settings-changed"));setSaved(true);success("Paramètres sauvegardés.");});

  

  const settingsSections = [
    {
      id: "general",
      label: "Général",
      description: "Configuration générale de JobConnect",
      icon: <SlidersHorizontal size={18} />,
    },
    {
      id: "moderation",
      label: "Modération",
      description: "Gestion des offres et recruteurs",
      icon: <ShieldCheck size={18} />,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Alertes et informations administratives",
      icon: <Bell size={18} />,
    },
    {
      id: "ai",
      label: "Intelligence artificielle",
      description: "Modules IA de la plateforme",
      icon: <Bot size={18} />,
    },
    {
      id: "security",
      label: "Sécurité",
      description: "Protection et accès administrateur",
      icon: <Lock size={18} />,
    },
    {
      id: "danger",
      label: "Maintenance",
      description: "Actions sensibles de la plateforme",
      icon: <AlertTriangle size={18} />,
    },
  ];

  const navigate = (destination) => {
    setSidebarOpen(false);
    onNavigate?.(destination);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900">
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="">
        {/* HEADER */}

        

        {/* =====================================================
            PAGE CONTENT
        ===================================================== */}

        <main className="px-4 pb-28 pt-6 sm:px-7 sm:pt-8 lg:px-9 lg:pb-10">
          {/* HERO */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-9">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur">
                <Settings size={13} className="text-cyan-300" />

                <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-100">
                  Configuration système
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Configurez votre
                <br />

                <span className="text-cyan-300">
                  plateforme JobConnect.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100/80 sm:text-base">
                Gérez les paramètres généraux, la modération, la sécurité,
                les notifications et les différents services intelligents
                disponibles sur JobConnect.
              </p>
            </div>
          </section>

          {/* =====================================================
              SETTINGS LAYOUT
          ===================================================== */}

          <div className="mt-7 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            {/* SETTINGS MENU */}

            <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/50 xl:sticky xl:top-[96px]">
              <div className="border-b border-slate-100 px-3 pb-4 pt-2">
                <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                  Configuration
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Sélectionnez une catégorie.
                </p>
              </div>

              <div className="mt-3 space-y-1">
                {settingsSections.map((section) => (
                  <Button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      activeSection === section.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        activeSection === section.id
                          ? "bg-white/15"
                          : section.id === "danger"
                          ? "bg-red-50 text-red-500"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {section.icon}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black">
                        {section.label}
                      </p>

                      <p
                        className={`mt-0.5 truncate text-xs ${
                          activeSection === section.id
                            ? "text-blue-100/70"
                            : "text-slate-400"
                        }`}
                      >
                        {section.description}
                      </p>
                    </div>

                    <ChevronRight size={13} />
                  </Button>
                ))}
              </div>
            </aside>

            {/* SETTINGS PANEL */}

            <section className="min-w-0">
              {activeSection === "general" && (
                <GeneralSettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}

              {activeSection === "moderation" && (
                <ModerationSettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}

              {activeSection === "notifications" && (
                <NotificationSettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}

              {activeSection === "ai" && (
                <AISettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}

              {activeSection === "security" && (
                <SecuritySettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}

              {activeSection === "danger" && (
                <MaintenanceSettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}
            </section>
          </div>

          {/* MOBILE SAVE BUTTON */}

          <Button
            type="button"
            onClick={handleSave}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-xs font-black text-white shadow-lg shadow-blue-200 sm:hidden"
          >
            {saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}

            {saved
              ? "Modifications enregistrées"
              : "Enregistrer les modifications"}
          </Button>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   GENERAL SETTINGS
========================================================= */

function GeneralSettings({
  settings,
  updateSetting,
}) {
  return (
    <SettingsPanel
      icon={<Globe size={20} />}
      eyebrow="Plateforme"
      title="Paramètres généraux"
      description="Configurez les informations principales et le fonctionnement général de JobConnect."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <InputField
          label="Nom de la plateforme"
          value={settings.platformName}
          onChange={(value) =>
            updateSetting("platformName", value)
          }
        />

        <InputField
          label="E-mail principal"
          value={settings.platformEmail}
          icon={<Mail size={15} />}
          onChange={(value) =>
            updateSetting("platformEmail", value)
          }
        />

        <InputField
          label="Pays principal"
          value={settings.country}
          onChange={(value) =>
            updateSetting("country", value)
          }
        />

        <InputField
          label="Langue principale"
          value={settings.language}
          onChange={(value) =>
            updateSetting("language", value)
          }
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <InputField label="Téléphone de contact" value={settings.platformPhone} onChange={value => updateSetting("platformPhone", value)} />
        <InputField label="Titre de la page d'accueil" value={settings.homeTitle} onChange={value => updateSetting("homeTitle", value)} />
        <label className="md:col-span-2 text-sm font-semibold text-slate-700">Description de la page d'accueil<textarea value={settings.homeDescription} onChange={event => updateSetting("homeDescription", event.target.value)} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 p-3" /></label>
        <label className="md:col-span-2 text-sm font-semibold text-slate-700">Message de maintenance<textarea value={settings.maintenanceMessage} onChange={event => updateSetting("maintenanceMessage", event.target.value)} maxLength={500} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 p-3" /></label>
      </div>
      <div className="mt-8 space-y-4">
        <ToggleSetting
          icon={<Users size={18} />}
          title="Autoriser les nouvelles inscriptions"
          description="Permet aux nouveaux candidats et recruteurs de créer un compte."
          enabled={settings.allowRegistration}
          onChange={(value) =>
            updateSetting("allowRegistration", value)
          }
        />

        <ToggleSetting
          icon={<Mail size={18} />}
          title="Vérification des adresses e-mail"
          description="Demande la validation de l'adresse e-mail lors de la création d'un compte."
          enabled={settings.emailVerification}
          onChange={(value) =>
            updateSetting("emailVerification", value)
          }
        />
      </div>
    </SettingsPanel>
  );
}

/* =========================================================
   MODERATION SETTINGS
========================================================= */

function ModerationSettings({
  settings,
  updateSetting,
}) {
  return (
    <SettingsPanel
      icon={<ShieldCheck size={20} />}
      eyebrow="Contrôle"
      title="Modération et validation"
      description="Définissez les règles de validation des offres et des entreprises."
    >
      <div className="space-y-4">
        <ToggleSetting
          icon={<FileCheck2 size={18} />}
          title="Modération obligatoire des offres"
          description="Les nouvelles offres doivent être validées avant leur publication."
          enabled={settings.offerModeration}
          onChange={(value) =>
            updateSetting("offerModeration", value)
          }
        />

        <ToggleSetting
          icon={<Building2 size={18} />}
          title="Vérification des recruteurs"
          description="Active le processus de vérification des entreprises et recruteurs."
          enabled={settings.recruiterVerification}
          onChange={(value) =>
            updateSetting(
              "recruiterVerification",
              value
            )
          }
        />

        <ToggleSetting
          icon={<Sparkles size={18} />}
          title="Assistance automatique à la modération"
          description="Utilise des règles intelligentes pour détecter les contenus nécessitant une vérification."
          enabled={settings.autoModeration}
          onChange={(value) =>
            updateSetting("autoModeration", value)
          }
        />
      </div>

      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <CircleHelp size={18} />
          </div>

          <div>
            <p className="text-xs font-black text-blue-950">
              Vérification des entreprises
            </p>

            <p className="mt-2 text-xs leading-5 text-blue-800/70">
              Une entreprise peut créer son compte et publier des offres
              avant sa vérification. Le statut « Entreprise vérifiée »
              est uniquement affiché aux candidats lorsque la vérification
              a été validée.
            </p>
          </div>
        </div>
      </div>
    </SettingsPanel>
  );
}

/* =========================================================
   NOTIFICATIONS SETTINGS
========================================================= */

function NotificationSettings({
  settings,
  updateSetting,
}) {
  return (
    <SettingsPanel
      icon={<Bell size={20} />}
      eyebrow="Alertes"
      title="Notifications administrateur"
      description="Choisissez les événements importants pour lesquels vous souhaitez recevoir une alerte."
    >
      <div className="space-y-4">
        <ToggleSetting
          icon={<Bell size={18} />}
          title="Notifications administrateur"
          description="Recevoir les principales alertes liées à la plateforme."
          enabled={settings.adminNotifications}
          onChange={(value) =>
            updateSetting(
              "adminNotifications",
              value
            )
          }
        />

        <ToggleSetting
          icon={<User size={18} />}
          title="Nouveaux utilisateurs"
          description="Recevoir une notification lors de nouvelles inscriptions importantes."
          enabled={settings.newUserNotifications}
          onChange={(value) =>
            updateSetting(
              "newUserNotifications",
              value
            )
          }
        />

        <ToggleSetting
          icon={<Shield size={18} />}
          title="Alertes de sécurité"
          description="Être informé des connexions inhabituelles et activités sensibles."
          enabled={settings.securityNotifications}
          onChange={(value) =>
            updateSetting(
              "securityNotifications",
              value
            )
          }
        />
      </div>
    </SettingsPanel>
  );
}

/* =========================================================
   AI SETTINGS
========================================================= */

function AISettings({
  settings,
  updateSetting,
}) {
  return (
    <SettingsPanel
      icon={<Bot size={20} />}
      eyebrow="Intelligence artificielle"
      title="Modules IA"
      description="Contrôlez les fonctionnalités intelligentes disponibles sur JobConnect."
    >
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
            <Sparkles size={19} />
          </div>

          <div>
            <p className="text-[12px] font-black text-slate-900">
              Moteur IA JobConnect
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Les modules IA sont prévus pour fonctionner avec l'intégration
              de l'API Groq dans le backend Django.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <ToggleSetting
          icon={<Bot size={18} />}
          title="Activer les fonctionnalités IA"
          description="Active ou désactive globalement les modules d'intelligence artificielle."
          enabled={settings.aiEnabled}
          onChange={(value) =>
            updateSetting("aiEnabled", value)
          }
        />

        <ToggleSetting
          icon={<BriefcaseBusiness size={18} />}
          title="Analyse intelligente des offres"
          description="Permet aux candidats d'obtenir une analyse IA des offres."
          enabled={settings.aiOfferAnalysis}
          onChange={(value) =>
            updateSetting("aiOfferAnalysis", value)
          }
        />

        <ToggleSetting
          icon={<Users size={18} />}
          title="Simulation d'entretien"
          description="Active les simulations d'entretien destinées aux candidats."
          enabled={settings.aiInterviewSimulation}
          onChange={(value) =>
            updateSetting(
              "aiInterviewSimulation",
              value
            )
          }
        />

        <ToggleSetting
          icon={<FileCheck2 size={18} />}
          title="Conseiller CV"
          description="Permet l'analyse et les recommandations IA sur les CV."
          enabled={settings.aiCVAdvisor}
          onChange={(value) =>
            updateSetting("aiCVAdvisor", value)
          }
        />
      </div>
      <ToggleSetting icon={<Bot size={18} />} title="Questions d'entretien recruteur" description="Autorise la génération de questions pour les entretiens programmés." enabled={settings.aiRecruiterQuestions} onChange={value => updateSetting("aiRecruiterQuestions", value)} />
    </SettingsPanel>
  );
}

/* =========================================================
   SECURITY SETTINGS
========================================================= */

function SecuritySettings({
  settings,
  updateSetting,
}) {
  return (
    <SettingsPanel
      icon={<Lock size={20} />}
      eyebrow="Protection"
      title="Sécurité du compte"
      description="Renforcez la protection des accès administratifs."
    >
      <div className="space-y-4">
        <ToggleSetting
          icon={<KeyRound size={18} />}
          title="Authentification à deux facteurs"
          description="Ajoute une couche de sécurité supplémentaire aux comptes administrateurs."
          enabled={settings.twoFactorAuth}
          onChange={(value) =>
            updateSetting("twoFactorAuth", value)
          }
        />

        <ToggleSetting
          icon={<Shield size={18} />}
          title="Protection des sessions"
          description="Surveille les sessions et détecte les activités inhabituelles."
          enabled={settings.sessionProtection}
          onChange={(value) =>
            updateSetting(
              "sessionProtection",
              value
            )
          }
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <ActionCard
          icon={<KeyRound size={19} />}
          title="Modifier le mot de passe"
          description="Mettre à jour les identifiants administrateur."
          action="Modifier"
        />

        <ActionCard
          icon={<Clock3 size={19} />}
          title="Sessions actives"
          description="Consulter les appareils actuellement connectés."
          action="Consulter"
        />
      </div>
    </SettingsPanel>
  );
}

/* =========================================================
   MAINTENANCE SETTINGS
========================================================= */

function MaintenanceSettings({
  settings,
  updateSetting,
}) {
  return (
    <SettingsPanel
      icon={<AlertTriangle size={20} />}
      eyebrow="Zone sensible"
      title="Maintenance de la plateforme"
      description="Certaines actions peuvent affecter temporairement les utilisateurs de JobConnect."
      danger
    >
      <div className="space-y-4">
        <ToggleSetting
          icon={<MonitorCog size={18} />}
          title="Mode maintenance"
          description="Limite temporairement l'accès à la plateforme pour permettre des interventions techniques."
          enabled={settings.maintenanceMode}
          onChange={(value) =>
            updateSetting("maintenanceMode", value)
          }
          danger
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <ActionCard
          icon={<Database size={19} />}
          title="Sauvegarde des données"
          description="Créer une sauvegarde des données importantes de la plateforme."
          action="Créer une sauvegarde"
        />

        <ActionCard
          icon={<Trash2 size={19} />}
          title="Nettoyage des données"
          description="Gérer les données temporaires et historiques."
          action="Gérer"
          danger
        />
      </div>

      <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <p className="text-xs leading-5 text-red-700">
            La maintenance bloque les services pour les visiteurs, candidats et recruteurs. Les administrateurs conservent leur accès pour la désactiver.
          </p>
        </div>
      </div>
    </SettingsPanel>
  );
}

/* =========================================================
   SETTINGS PANEL
========================================================= */

function SettingsPanel({
  icon,
  eyebrow,
  title,
  description,
  children,
  danger = false,
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="border-b border-slate-100 px-6 py-6 sm:px-7">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              danger
                ? "bg-red-50 text-red-500"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {icon}
          </div>

          <div>
            <p
              className={`text-xs font-black uppercase tracking-[0.17em] ${
                danger
                  ? "text-red-500"
                  : "text-blue-600"
              }`}
            >
              {eyebrow}
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-950">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  value,
  icon,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <Input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
            icon ? "pl-10" : ""
          }`}
        />
      </div>
    </label>
  );
}

/* =========================================================
   TOGGLE SETTING
========================================================= */

function ToggleSetting({
  icon,
  title,
  description,
  enabled,
  onChange,
  danger = false,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition hover:border-blue-100 hover:bg-white sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            danger
              ? "bg-red-50 text-red-500"
              : enabled
              ? "bg-blue-100 text-blue-600"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs font-black text-slate-800">
            {title}
          </p>

          <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <Button
        type="button"
        role="switch" aria-checked={enabled} aria-label={title}
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? danger
              ? "bg-red-500"
              : "bg-blue-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </Button>
    </div>
  );
}

/* =========================================================
   ACTION CARD
========================================================= */

function ActionCard({
  icon,
  title,
  description,
  action,
  danger = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition hover:border-blue-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          danger
            ? "bg-red-50 text-red-500"
            : "bg-blue-50 text-blue-600"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-5 text-[12px] font-black text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>

      <Button aria-label="Suivant"
        type="button"
        className={`mt-5 flex items-center gap-2 text-xs font-black transition ${
          danger
            ? "text-red-500 hover:text-red-700"
            : "text-blue-600 hover:text-blue-800"
        }`}
      >
        {action}

        <ChevronRight size={13} />
      </Button>
    </div>
  );
}

export default AdminSettingsPage;
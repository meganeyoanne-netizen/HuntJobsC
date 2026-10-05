import { Button, Input } from "../../components/ui";


import { useEffect } from "react";
import { post, patch, perform, success } from "../../services/api";
import { useResource } from "../../hooks/useResource";


import { useState } from "react";
import { ArrowRight, Bell, Building2, Check, ChevronRight, Eye, KeyRound, Lock, LogOut, Mail, MessageSquare, Save, Settings, ShieldCheck, Smartphone, User, Users, Video, BriefcaseBusiness, AlertTriangle, Trash2, Sparkles } from "lucide-react";



function RecruiterSettingsPage({
  user = {
    firstName: "",
    lastName: "",
    email: "recruteur@jobconnect.cm",
    phone: "",
    companyName: "JobConnect",
  },
  onNavigate,
  onLogout,
}) {
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    "JobConnect";

  const recruiterName =
    user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : "Recruteur";

  const [activeSection, setActiveSection] =
    useState("account");

  const [saved, setSaved] = useState(false);

  const [account, setAccount] = useState({
    firstName: user?.firstName || "Michel",
    lastName: user?.lastName || "Bonyomo",
    email: user?.email || "recruteur@jobconnect.cm",
    phone: user?.phone || "",
  });

  const [passwords, setPasswords] =
    useState({
      current: "",
      newPassword: "",
      confirm: "",
    });

  const [notifications, setNotifications] =
    useState({
      applications: true,
      interviews: true,
      messages: true,
      status: true,
      offers: false,
    });

  const [preferences, setPreferences] =
    useState({
      profileVisibility: true,
      emailRecruitment: true,
      smartRecommendations: true,
    });

  const [savedPreferences]=useResource("/preferences/",v=>v,null);
  useEffect(()=>{if(savedPreferences){if(savedPreferences.notifications)setNotifications(savedPreferences.notifications);if(savedPreferences.preferences)setPreferences(savedPreferences.preferences);}},[savedPreferences]);
  const saveChanges = () => perform(async () => {if(activeSection==="security"||passwords.current||passwords.newPassword){if(passwords.newPassword!==passwords.confirm)throw Error("Les mots de passe ne correspondent pas.");await post("/users/password-change/",{old_password:passwords.current,password:passwords.newPassword});onLogout();return;}await patch("/users/me/",{first_name:account.firstName,last_name:account.lastName,email:account.email,telephone:account.phone});await patch("/preferences/",{notifications,preferences});setSaved(true);success("Paramètres sauvegardés.");});

  

  

  const settingsNavigation = [
    {
      id: "account",
      label: "Mon compte",
      description: "Informations personnelles",
      icon: <User size={18} />,
    },
    {
      id: "security",
      label: "Sécurité",
      description: "Mot de passe et accès",
      icon: <ShieldCheck size={18} />,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Gérer vos alertes",
      icon: <Bell size={18} />,
    },
    {
      id: "preferences",
      label: "Préférences",
      description: "Personnaliser JobConnect",
      icon: <Sparkles size={18} />,
    },
    {
      id: "privacy",
      label: "Confidentialité",
      description: "Données et visibilité",
      icon: <Lock size={18} />,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7fc] text-slate-900">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="">

        {/* HEADER */}

        


        {/* CONTENT */}

        <main className="px-4 pb-28 pt-6 sm:px-7 sm:pt-8 lg:px-9 lg:pb-10">

          {/* =================================================
              HERO
          ================================================= */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-9">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur">

                  <Settings size={12} />

                  <span className="text-xs font-black uppercase tracking-[0.16em]">
                    Configuration du compte
                  </span>

                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                  Gérez votre espace
                  <br />
                  <span className="text-cyan-300">
                    recruteur.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/80 sm:text-base">
                  Personnalisez votre compte, vos notifications et vos préférences de recrutement depuis un seul espace.
                </p>

              </div>


              <div className="hidden h-32 w-32 items-center justify-center rounded-[28px] border border-white/10 bg-white/10 backdrop-blur-md md:flex">

                <Settings
                  size={52}
                  strokeWidth={1.3}
                  className="text-cyan-200"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              SETTINGS LAYOUT
          ================================================= */}

          <div className="mt-7 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">


            {/* MENU */}

            <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50">

              <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.17em] text-slate-400">
                Paramètres
              </p>

              <div className="mt-2 space-y-1">

                {settingsNavigation.map(
                  (item) => {

                    const active =
                      activeSection ===
                      item.id;

                    return (

                      <Button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setActiveSection(
                            item.id
                          )
                        }
                        className={`group flex w-full items-center gap-3 rounded-xl p-3.5 text-left transition-all duration-300 ${
                          active
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >

                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                            active
                              ? "bg-white/15"
                              : "bg-slate-100 group-hover:bg-blue-100"
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span className="min-w-0 flex-1">

                          <span className="block text-xs font-black">
                            {item.label}
                          </span>

                          <span
                            className={`mt-1 block text-xs ${
                              active
                                ? "text-blue-100"
                                : "text-slate-400"
                            }`}
                          >
                            {item.description}
                          </span>

                        </span>

                        <ChevronRight
                          size={14}
                          className={`transition-transform ${
                            active
                              ? "translate-x-0"
                              : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          }`}
                        />

                      </Button>

                    );
                  }
                )}

              </div>


              {/* LOGOUT */}

              <div className="mt-5 border-t border-slate-100 pt-4">

                <Button
                  type="button"
                  onClick={() =>
                    onLogout?.()
                  }
                  className="group flex w-full items-center gap-3 rounded-xl p-3.5 text-left text-red-500 transition hover:bg-red-50"
                >

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 transition group-hover:bg-red-100">
                    <LogOut size={17} />
                  </span>

                  <span>

                    <span className="block text-xs font-black">
                      Se déconnecter
                    </span>

                    <span className="mt-1 block text-xs text-red-400">
                      Quitter votre session
                    </span>

                  </span>

                </Button>

              </div>

            </aside>


            {/* =================================================
                PANNEAU
            ================================================= */}

            <section className="min-w-0">

              {activeSection === "account" && (
                <AccountSection
                  account={account}
                  setAccount={setAccount}
                  onSave={saveChanges}
                  saved={saved}
                />
              )}


              {activeSection === "security" && (
                <SecuritySection
                  passwords={passwords}
                  setPasswords={setPasswords}
                  onSave={saveChanges}
                  saved={saved}
                />
              )}


              {activeSection === "notifications" && (
                <NotificationsSection
                  notifications={
                    notifications
                  }
                  setNotifications={
                    setNotifications
                  }
                  onSave={saveChanges}
                  saved={saved}
                />
              )}


              {activeSection === "preferences" && (
                <PreferencesSection
                  preferences={
                    preferences
                  }
                  setPreferences={
                    setPreferences
                  }
                  onSave={saveChanges}
                  saved={saved}
                />
              )}


              {activeSection === "privacy" && (
                <PrivacySection
                  preferences={
                    preferences
                  }
                  setPreferences={
                    setPreferences
                  }
                />
              )}

            </section>

          </div>

        </main>

      </div>


      {/* =====================================================
          MOBILE NAV
      ===================================================== */}

      

    </div>
  );
}


/* =========================================================
   ACCOUNT
========================================================= */

function AccountSection({
  account,
  setAccount,
  onSave,
  saved,
}) {
  return (
    <SettingsCard
      icon={<User size={21} />}
      iconClass="bg-blue-100 text-blue-600"
      eyebrow="Compte"
      title="Informations personnelles"
      description="Gérez les informations associées à votre compte recruteur."
    >

      <div className="grid gap-5 sm:grid-cols-2">

        <InputField
          label="Prénom"
          value={account.firstName}
          onChange={(value) =>
            setAccount({
              ...account,
              firstName: value,
            })
          }
          icon={<User size={16} />}
        />

        <InputField
          label="Nom"
          value={account.lastName}
          onChange={(value) =>
            setAccount({
              ...account,
              lastName: value,
            })
          }
          icon={<User size={16} />}
        />

        <InputField
          label="Email professionnel"
          value={account.email}
          onChange={(value) =>
            setAccount({
              ...account,
              email: value,
            })
          }
          icon={<Mail size={16} />}
          type="email"
        />

        <InputField
          label="Téléphone"
          value={account.phone}
          onChange={(value) =>
            setAccount({
              ...account,
              phone: value,
            })
          }
          icon={<Smartphone size={16} />}
          placeholder="+237 6 XX XX XX XX"
        />

      </div>


      <InfoBanner
        icon={<Building2 size={18} />}
        title="Compte recruteur"
        text="Les informations relatives à votre entreprise sont gérées depuis la rubrique « Mon entreprise »."
      />


      <SaveButton
        onClick={onSave}
        saved={saved}
      />

    </SettingsCard>
  );
}


/* =========================================================
   SECURITY
========================================================= */

function SecuritySection({
  passwords,
  setPasswords,
  onSave,
  saved,
}) {
  return (
    <div className="space-y-6">

      <SettingsCard
        icon={<ShieldCheck size={21} />}
        iconClass="bg-violet-100 text-violet-600"
        eyebrow="Sécurité"
        title="Mot de passe"
        description="Protégez votre compte avec un mot de passe sécurisé."
      >

        <div className="space-y-5">

          <InputField
            label="Mot de passe actuel"
            value={passwords.current}
            type="password"
            onChange={(value) =>
              setPasswords({
                ...passwords,
                current: value,
              })
            }
            icon={<KeyRound size={16} />}
          />

          <div className="grid gap-5 sm:grid-cols-2">

            <InputField
              label="Nouveau mot de passe"
              value={
                passwords.newPassword
              }
              type="password"
              onChange={(value) =>
                setPasswords({
                  ...passwords,
                  newPassword: value,
                })
              }
              icon={<Lock size={16} />}
            />

            <InputField
              label="Confirmer le mot de passe"
              value={
                passwords.confirm
              }
              type="password"
              onChange={(value) =>
                setPasswords({
                  ...passwords,
                  confirm: value,
                })
              }
              icon={<Lock size={16} />}
            />

          </div>

        </div>


        <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/70 p-5">

          <div className="flex gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <ShieldCheck size={18} />
            </div>

            <div>

              <p className="text-sm font-black text-violet-900">
                Conseils de sécurité
              </p>

              <p className="mt-1 text-xs leading-6 text-violet-700/70">
                Utilisez au moins 8 caractères avec des lettres majuscules, minuscules, chiffres et caractères spéciaux.
              </p>

            </div>

          </div>

        </div>


        <SaveButton
          onClick={onSave}
          saved={saved}
          label="Modifier le mot de passe"
        />

      </SettingsCard>


      <SettingsCard
        icon={<Smartphone size={21} />}
        iconClass="bg-cyan-100 text-cyan-600"
        eyebrow="Sessions"
        title="Sessions actives"
        description="Contrôlez les appareils connectés à votre compte."
      >

        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
              <Smartphone size={21} />
            </div>

            <div>

              <p className="text-sm font-black text-slate-800">
                Session actuelle
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Windows · Navigateur web
              </p>

            </div>

          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600">
            Active
          </span>

        </div>

      </SettingsCard>

    </div>
  );
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationsSection({
  notifications,
  setNotifications,
  onSave,
  saved,
}) {
  return (
    <SettingsCard
      icon={<Bell size={21} />}
      iconClass="bg-orange-100 text-orange-600"
      eyebrow="Notifications"
      title="Préférences de notification"
      description="Choisissez les événements pour lesquels JobConnect doit vous prévenir."
    >

      <div className="divide-y divide-slate-100">

        <ToggleRow
          icon={<Users size={18} />}
          title="Nouvelles candidatures"
          description="Recevoir une notification lorsqu'un candidat postule à une offre."
          enabled={
            notifications.applications
          }
          onChange={() =>
            setNotifications({
              ...notifications,
              applications:
                !notifications.applications,
            })
          }
          color="blue"
        />

        <ToggleRow
          icon={<Video size={18} />}
          title="Entretiens"
          description="Être informé des nouveaux entretiens et des changements de rendez-vous."
          enabled={
            notifications.interviews
          }
          onChange={() =>
            setNotifications({
              ...notifications,
              interviews:
                !notifications.interviews,
            })
          }
          color="violet"
        />

        <ToggleRow
          icon={<MessageSquare size={18} />}
          title="Messages"
          description="Recevoir les messages envoyés par les candidats."
          enabled={
            notifications.messages
          }
          onChange={() =>
            setNotifications({
              ...notifications,
              messages:
                !notifications.messages,
            })
          }
          color="cyan"
        />

        <ToggleRow
          icon={<BriefcaseBusiness size={18} />}
          title="Évolution des candidatures"
          description="Être informé lorsqu'une candidature évolue dans le processus."
          enabled={
            notifications.status
          }
          onChange={() =>
            setNotifications({
              ...notifications,
              status:
                !notifications.status,
            })
          }
          color="emerald"
        />

        <ToggleRow
          icon={<Mail size={18} />}
          title="Conseils et actualités"
          description="Recevoir des conseils et informations utiles pour vos recrutements."
          enabled={
            notifications.offers
          }
          onChange={() =>
            setNotifications({
              ...notifications,
              offers:
                !notifications.offers,
            })
          }
          color="orange"
        />

      </div>


      <SaveButton
        onClick={onSave}
        saved={saved}
      />

    </SettingsCard>
  );
}


/* =========================================================
   PREFERENCES
========================================================= */

function PreferencesSection({
  preferences,
  setPreferences,
  onSave,
  saved,
}) {
  return (
    <SettingsCard
      icon={<Sparkles size={21} />}
      iconClass="bg-blue-100 text-blue-600"
      eyebrow="Préférences"
      title="Personnalisation"
      description="Configurez votre expérience de recrutement sur JobConnect."
    >

      <div className="divide-y divide-slate-100">

        <ToggleRow
          icon={<Eye size={18} />}
          title="Profil recruteur visible"
          description="Permettre aux candidats de consulter les informations publiques de votre entreprise."
          enabled={
            preferences.profileVisibility
          }
          onChange={() =>
            setPreferences({
              ...preferences,
              profileVisibility:
                !preferences.profileVisibility,
            })
          }
          color="blue"
        />

        <ToggleRow
          icon={<Mail size={18} />}
          title="Emails liés au recrutement"
          description="Recevoir les informations importantes concernant vos recrutements par email."
          enabled={
            preferences.emailRecruitment
          }
          onChange={() =>
            setPreferences({
              ...preferences,
              emailRecruitment:
                !preferences.emailRecruitment,
            })
          }
          color="violet"
        />

        <ToggleRow
          icon={<Sparkles size={18} />}
          title="Recommandations intelligentes"
          description="Autoriser JobConnect à vous proposer des profils et informations pertinentes grâce à l'IA."
          enabled={
            preferences.smartRecommendations
          }
          onChange={() =>
            setPreferences({
              ...preferences,
              smartRecommendations:
                !preferences.smartRecommendations,
            })
          }
          color="cyan"
        />

      </div>


      <InfoBanner
        icon={<Sparkles size={18} />}
        title="JobConnect AI"
        text="Les recommandations intelligentes pourront utiliser les données de vos offres et candidatures pour améliorer vos recherches."
      />


      <SaveButton
        onClick={onSave}
        saved={saved}
      />

    </SettingsCard>
  );
}


/* =========================================================
   PRIVACY
========================================================= */

function PrivacySection({
  preferences,
  setPreferences,
}) {
  return (
    <div className="space-y-6">

      <SettingsCard
        icon={<Lock size={21} />}
        iconClass="bg-emerald-100 text-emerald-600"
        eyebrow="Confidentialité"
        title="Données et visibilité"
        description="Contrôlez la manière dont vos informations sont utilisées sur JobConnect."
      >

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <ShieldCheck size={20} />
            </div>

            <div>

              <p className="text-sm font-black text-emerald-900">
                Vos données sont protégées
              </p>

              <p className="mt-1.5 text-xs leading-6 text-emerald-700/70">
                Les données de recrutement sont utilisées uniquement dans le cadre des fonctionnalités de JobConnect et selon les permissions associées à votre compte.
              </p>

            </div>

          </div>

        </div>


        <div className="mt-6 space-y-4">

          <ToggleRow
            icon={<Eye size={18} />}
            title="Visibilité du profil entreprise"
            description="Votre entreprise peut être visible par les candidats sur la plateforme."
            enabled={
              preferences.profileVisibility
            }
            onChange={() =>
              setPreferences({
                ...preferences,
                profileVisibility:
                  !preferences.profileVisibility,
              })
            }
            color="emerald"
          />

        </div>

      </SettingsCard>


      <div className="overflow-hidden rounded-[24px] border border-red-100 bg-white shadow-xl shadow-slate-200/40">

        <div className="border-b border-red-100 bg-red-50/60 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle size={20} />
            </div>

            <div>

              <p className="text-xs font-black uppercase tracking-[0.17em] text-red-500">
                Zone sensible
              </p>

              <h2 className="mt-1 text-lg font-black text-red-900">
                Gestion du compte
              </h2>

            </div>

          </div>

        </div>


        <div className="p-6">

          <p className="text-xs leading-6 text-slate-500">
            La suppression ou la désactivation du compte peut avoir des conséquences sur vos offres, candidatures et données de recrutement.
          </p>

          <Button
            type="button"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-black text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-lg"
          >
            <Trash2 size={15} />
            Demander la désactivation du compte
          </Button>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingsCard({
  icon,
  iconClass,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

      <div className="border-b border-slate-100 p-6 sm:p-7">

        <div className="flex items-start gap-4">

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
          >
            {icon}
          </div>

          <div>

            <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
              {eyebrow}
            </p>

            <h2 className="mt-1.5 text-xl font-black text-slate-950 sm:text-2xl">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400 sm:text-sm">
              {description}
            </p>

          </div>

        </div>

      </div>


      <div className="p-6 sm:p-7">
        {children}
      </div>

    </section>
  );
}


/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  value,
  onChange,
  icon,
  type = "text",
  placeholder = "",
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-xs font-black text-slate-700">
        {label}
      </span>

      <div className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition-all duration-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-100">

        <span className="text-slate-400 transition group-focus-within:text-blue-600">
          {icon}
        </span>

        <Input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300"
        />

      </div>

    </label>
  );
}


/* =========================================================
   TOGGLE
========================================================= */

function ToggleRow({
  icon,
  title,
  description,
  enabled,
  onChange,
  color = "blue",
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    violet:
      "bg-violet-100 text-violet-600",
    cyan: "bg-cyan-100 text-cyan-600",
    emerald:
      "bg-emerald-100 text-emerald-600",
    orange:
      "bg-orange-100 text-orange-600",
  };

  return (
    <div className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-black text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>

      </div>

      <Button
        type="button"
        onClick={onChange}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 ${
          enabled
            ? "bg-blue-600 shadow-lg shadow-blue-200"
            : "bg-slate-200"
        }`}
      >

        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
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
   INFO BANNER
========================================================= */

function InfoBanner({
  icon,
  title,
  text,
}) {
  return (
    <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-5">

      <div className="flex gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          {icon}
        </div>

        <div>

          <p className="text-sm font-black text-blue-900">
            {title}
          </p>

          <p className="mt-1 text-xs leading-6 text-blue-700/70">
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SAVE BUTTON
========================================================= */

function SaveButton({
  onClick,
  saved,
  label = "Enregistrer les modifications",
}) {
  return (
    <div className="mt-7 flex justify-end">

      <Button
        type="button"
        onClick={onClick}
        className={`group flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-xs font-black shadow-lg transition-all duration-300 ${
          saved
            ? "bg-emerald-500 text-white shadow-emerald-200"
            : "bg-blue-600 text-white shadow-blue-200 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl"
        }`}
      >

        {saved ? (
          <>
            <Check size={16} />
            Modifications enregistrées
          </>
        ) : (
          <>
            <Save size={16} />
            {label}
            <ArrowRight
              size={14}
              className="transition group-hover:translate-x-1"
            />
          </>
        )}

      </Button>

    </div>
  );
}


/* =========================================================
   MOBILE NAV
========================================================= */




export default RecruiterSettingsPage;
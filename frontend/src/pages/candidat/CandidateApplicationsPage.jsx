import { Button, Input, ModalFrame } from "../../components/ui";
import { patch, perform } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { applicationsAdapter } from "../../services/adapters";
import { useLanguage } from "../../context/LanguageContext";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileStack,
  FileText,
  Filter,
  Hourglass,
  MapPin,
  Search,
  Sparkles,
  Star,
  Award,
  Video,
  X,
  XCircle,
  Building2,
  CalendarCheck2,
  Send,
  SlidersHorizontal,
} from "lucide-react";

/* =========================================================
   CANDIDATE APPLICATIONS PAGE
========================================================= */

// Données de démonstration réalistes pour exploration immédiate si aucune candidature en BDD
const DEMO_APPLICATIONS = [
  {
    id: "demo-1",
    title: "Comptable Général",
    company: "Cabinet Audit & Finance",
    companyShort: "CAF",
    location: "Douala",
    type: "CDI",
    date: "Il y a 3 jours",
    appliedDays: "Envoyé le 02 Octobre",
    status: "Présélectionné",
    statusType: "selection",
    statut: "PRESELECTION",
    progress: 60,
    currentStep: 3,
    description: "Gestion de la comptabilité générale, déclarations fiscales, suivi des bilans et clôtures mensuelles pour les clients PME.",
    steps: [
      { label: "Candidature envoyée", date: "02 Octobre", completed: true, current: false },
      { label: "Examen du dossier", date: "03 Octobre", completed: true, current: false },
      { label: "Présélectionné par le recruteur", date: "04 Octobre", completed: true, current: true },
      { label: "Entretien d'embauche", date: null, completed: false, current: false },
      { label: "Décision finale", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-2",
    title: "Coiffeuse Styliste & Visagiste",
    company: "Salon Élégance Prestige",
    companyShort: "SEP",
    location: "Yaoundé",
    type: "CDI",
    date: "Il y a 5 jours",
    appliedDays: "Envoyé le 30 Septembre",
    status: "Entretien programmé",
    statusType: "interview",
    statut: "ENTRETIEN",
    progress: 80,
    currentStep: 4,
    interviewDate: "Jeudi 08 Octobre 2026",
    interviewTime: "14h30",
    description: "Coupe, coloration, soins capillaires experts et conseil visagiste personnalisé pour clientèle haut de gamme.",
    steps: [
      { label: "Candidature envoyée", date: "30 Septembre", completed: true, current: false },
      { label: "Examen du dossier", date: "01 Octobre", completed: true, current: false },
      { label: "Dossier présélectionné", date: "02 Octobre", completed: true, current: false },
      { label: "Entretien technique & pratique", date: "08 Octobre", completed: true, current: true },
      { label: "Décision finale", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-3",
    title: "Développeur Full Stack React & Node",
    company: "TechCorp Solutions",
    companyShort: "TCS",
    location: "Télétravail",
    type: "Freelance",
    date: "Il y a 2 jours",
    appliedDays: "Envoyé le 03 Octobre",
    status: "En cours d'examen",
    statusType: "review",
    statut: "EVALUATION",
    progress: 40,
    currentStep: 2,
    description: "Développement d'interfaces web modernes en React 19, API RESTful et architecture microservices scalable.",
    steps: [
      { label: "Candidature envoyée", date: "03 Octobre", completed: true, current: false },
      { label: "Examen technique du profil", date: "04 Octobre", completed: true, current: true },
      { label: "Présélection", date: null, completed: false, current: false },
      { label: "Entretien vidéo", date: null, completed: false, current: false },
      { label: "Offre & Contrat", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-4",
    title: "Chef de Projet Digital",
    company: "Innovate Agency",
    companyShort: "INA",
    location: "Yaoundé",
    type: "CDI",
    date: "Il y a 6 jours",
    appliedDays: "Envoyé le 29 Septembre",
    status: "Entretien programmé",
    statusType: "interview",
    statut: "ENTRETIEN",
    progress: 80,
    currentStep: 4,
    interviewDate: "Vendredi 09 Octobre 2026",
    interviewTime: "10h00",
    description: "Pilotage de projets digitaux, coordination des équipes de création et suivi des indicateurs de performance.",
    steps: [
      { label: "Candidature transmise", date: "29 Septembre", completed: true, current: false },
      { label: "Validation RH", date: "01 Octobre", completed: true, current: false },
      { label: "Présélection validée", date: "03 Octobre", completed: true, current: false },
      { label: "Entretien avec la direction", date: "09 Octobre", completed: true, current: true },
      { label: "Décision finale", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-5",
    title: "Responsable Administratif & Financier",
    company: "BTP Construction Cameroun",
    companyShort: "BTP",
    location: "Douala",
    type: "CDI",
    date: "Il y a 1 semaine",
    appliedDays: "Envoyé le 28 Septembre",
    status: "Présélectionné",
    statusType: "selection",
    statut: "PRESELECTION",
    progress: 60,
    currentStep: 3,
    description: "Supervision des budgets, gestion des relations bancaires et optimisation de la trésorerie des chantiers.",
    steps: [
      { label: "Candidature reçue", date: "28 Septembre", completed: true, current: false },
      { label: "Analyse administrative", date: "30 Septembre", completed: true, current: false },
      { label: "Candidature présélectionnée", date: "02 Octobre", completed: true, current: true },
      { label: "Entretien", date: null, completed: false, current: false },
      { label: "Décision", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-6",
    title: "Manager Salon & Spa de Beauté",
    company: "Beauty Luxury Spa",
    companyShort: "BLS",
    location: "Douala",
    type: "CDI",
    date: "Il y a 8 jours",
    appliedDays: "Envoyé le 27 Septembre",
    status: "Présélectionné",
    statusType: "selection",
    statut: "PRESELECTION",
    progress: 60,
    currentStep: 3,
    description: "Management d'une équipe de 8 coiffeurs et esthéticiennes, fidélisation client et gestion des stocks de produits.",
    steps: [
      { label: "Candidature envoyée", date: "27 Septembre", completed: true, current: false },
      { label: "Revue du profil", date: "29 Septembre", completed: true, current: false },
      { label: "Présélection", date: "01 Octobre", completed: true, current: true },
      { label: "Entretien", date: null, completed: false, current: false },
      { label: "Décision finale", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-7",
    title: "Ingénieur Cloud & DevOps",
    company: "Cloud Africa Solutions",
    companyShort: "CAS",
    location: "Télétravail",
    type: "CDI",
    date: "Il y a 4 jours",
    appliedDays: "Envoyé le 01 Octobre",
    status: "Entretien programmé",
    statusType: "interview",
    statut: "ENTRETIEN",
    progress: 80,
    currentStep: 4,
    interviewDate: "Lundi 12 Octobre 2026",
    interviewTime: "16h00",
    description: "Mise en place de pipelines CI/CD, infrastructure as code Terraform et conteneurisation Docker / Kubernetes.",
    steps: [
      { label: "Candidature envoyée", date: "01 Octobre", completed: true, current: false },
      { label: "Screening technique", date: "02 Octobre", completed: true, current: false },
      { label: "Présélection technique", date: "03 Octobre", completed: true, current: false },
      { label: "Entretien avec le CTO", date: "12 Octobre", completed: true, current: true },
      { label: "Proposition d'embauche", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-8",
    title: "Auditeur Financier Junior",
    company: "KPMG Advisory",
    companyShort: "KPM",
    location: "Douala",
    type: "Stage",
    date: "Il y a 3 jours",
    appliedDays: "Envoyé le 02 Octobre",
    status: "En cours d'examen",
    statusType: "review",
    statut: "EVALUATION",
    progress: 40,
    currentStep: 2,
    description: "Participation aux missions d'audit légal et contractuel, vérification des comptes et rédaction des synthèses.",
    steps: [
      { label: "Dossier soumis", date: "02 Octobre", completed: true, current: false },
      { label: "Examen académique & CV", date: "04 Octobre", completed: true, current: true },
      { label: "Présélection", date: null, completed: false, current: false },
      { label: "Entretien collectif", date: null, completed: false, current: false },
      { label: "Décision", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-9",
    title: "Technicien Réseaux & Télécoms",
    company: "Telecom Connect",
    companyShort: "TEL",
    location: "Yaoundé",
    type: "CDD",
    date: "Il y a 4 jours",
    appliedDays: "Envoyé le 01 Octobre",
    status: "En cours d'examen",
    statusType: "review",
    statut: "EVALUATION",
    progress: 40,
    currentStep: 2,
    description: "Installation et maintenance des équipements réseaux, raccordement fibre optique et support technique aux abonnés.",
    steps: [
      { label: "Candidature reçue", date: "01 Octobre", completed: true, current: false },
      { label: "Vérification des certifications", date: "03 Octobre", completed: true, current: true },
      { label: "Présélection", date: null, completed: false, current: false },
      { label: "Entretien", date: null, completed: false, current: false },
      { label: "Validation", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-10",
    title: "Esthéticienne & Cosméticienne",
    company: "Institut Reine Beauté",
    companyShort: "IRB",
    location: "Yaoundé",
    type: "CDI",
    date: "Il y a 5 jours",
    appliedDays: "Envoyé le 30 Septembre",
    status: "Entretien programmé",
    statusType: "interview",
    statut: "ENTRETIEN",
    progress: 80,
    currentStep: 4,
    interviewDate: "Mardi 13 Octobre 2026",
    interviewTime: "11h30",
    description: "Soins du visage, épilations, massages bien-être et conseil cosmétique personnalisé.",
    steps: [
      { label: "Candidature transmise", date: "30 Septembre", completed: true, current: false },
      { label: "Étude des diplômes", date: "01 Octobre", completed: true, current: false },
      { label: "Présélectionnée", date: "02 Octobre", completed: true, current: false },
      { label: "Entretien & test pratique", date: "13 Octobre", completed: true, current: true },
      { label: "Décision finale", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-11",
    title: "Comptable Fournisseurs",
    company: "Agro-Industrie SA",
    companyShort: "AGR",
    location: "Bafoussam",
    type: "CDI",
    date: "Il y a 6 jours",
    appliedDays: "Envoyé le 29 Septembre",
    status: "En cours d'examen",
    statusType: "review",
    statut: "EVALUATION",
    progress: 40,
    currentStep: 2,
    description: "Saisie et rapprochement des factures fournisseurs, gestion des bons de commande et préparation des règlements.",
    steps: [
      { label: "Candidature envoyée", date: "29 Septembre", completed: true, current: false },
      { label: "Examen des références", date: "02 Octobre", completed: true, current: true },
      { label: "Présélection", date: null, completed: false, current: false },
      { label: "Entretien", date: null, completed: false, current: false },
      { label: "Décision", date: null, completed: false, current: false },
    ],
  },
  {
    id: "demo-12",
    title: "Développeur Mobile Flutter",
    company: "FinTech Mobile Solutions",
    companyShort: "FMS",
    location: "Télétravail",
    type: "Freelance",
    date: "Aujourd'hui",
    appliedDays: "Envoyé le 05 Octobre",
    status: "Candidature envoyée",
    statusType: "sent",
    statut: "RECUE",
    progress: 20,
    currentStep: 1,
    description: "Conception et déploiement d'une application de paiement mobile moderne sur iOS et Android avec Flutter.",
    steps: [
      { label: "Candidature envoyée", date: "05 Octobre", completed: true, current: true },
      { label: "Examen par le recruteur", date: null, completed: false, current: false },
      { label: "Présélection", date: null, completed: false, current: false },
      { label: "Entretien technique", date: null, completed: false, current: false },
      { label: "Validation de mission", date: null, completed: false, current: false },
    ],
  },
];

function CandidateApplicationsPage({
  user = {
    firstName: "",
    lastName: "",
  },
  onNavigate,
  onLogout,
}) {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);

  /* =======================================================
     DONNÉES API & CALCUL DYNAMIQUE
  ======================================================= */
  const [rawApplications] = useResource("/candidatures/", applicationsAdapter);
  
  // Utiliser les données réelles du backend si disponibles, sinon les données de démonstration
  const applications = useMemo(() => {
    if (rawApplications && rawApplications.length > 0) {
      return rawApplications;
    }
    return DEMO_APPLICATIONS;
  }, [rawApplications]);

  const withdraw = (id) =>
    perform(async () => {
      await patch("/candidatures/" + id + "/", { statut: "RETIREE" });
      onNavigate?.("candidate-applications");
    });

  // Calcul dynamique des statistiques selon l'état d'avancement
  const totalCount = applications.length;
  const inProgressCount = applications.filter(
    (a) =>
      ["sent", "review", "in_progress"].includes(a.statusType) ||
      ["RECUE", "EVALUATION"].includes(a.statut)
  ).length;
  const interviewCount = applications.filter(
    (a) => a.statusType === "interview" || a.statut === "ENTRETIEN"
  ).length;
  const shortlistedCount = applications.filter(
    (a) =>
      a.statusType === "selection" ||
      a.statut === "PRESELECTION" ||
      a.statut === "RETENU"
  ).length;

  const filters = [
    { key: "Toutes", label: "Toutes" },
    { key: "En cours", label: "En cours" },
    { key: "Présélection", label: "Présélections" },
    { key: "Entretien", label: "Entretiens" },
    { key: "Non retenues", label: "Non retenues" },
  ];

  /* =======================================================
     FILTRAGE AVANCÉ
  ======================================================= */
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch =
        application.title.toLowerCase().includes(search.toLowerCase()) ||
        application.company.toLowerCase().includes(search.toLowerCase()) ||
        application.location.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;

      if (activeFilter === "En cours") {
        matchesFilter =
          ["sent", "review", "in_progress"].includes(application.statusType) ||
          ["RECUE", "EVALUATION"].includes(application.statut);
      } else if (activeFilter === "Présélection") {
        matchesFilter =
          application.statusType === "selection" ||
          application.statut === "PRESELECTION" ||
          application.statut === "RETENU";
      } else if (activeFilter === "Entretien") {
        matchesFilter =
          application.statusType === "interview" ||
          application.statut === "ENTRETIEN";
      } else if (activeFilter === "Non retenues") {
        matchesFilter =
          application.statusType === "rejected" ||
          application.statut === "REFUSE" ||
          application.statut === "RETIREE";
      }

      return matchesSearch && matchesFilter;
    });
  }, [applications, activeFilter, search]);

  return (
    <div className="min-h-screen bg-[#f6f8fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <main className="min-h-screen">
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
          
          {/* =================================================
              INTRO BANNER
          ================================================= */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061a41] via-[#0b2d68] to-blue-600 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="relative">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-blue-100 backdrop-blur-md">
                  <BriefcaseBusiness size={14} className="text-cyan-300" />
                  <span>{t("landing.applicationTracking", "Suivi des candidatures")}</span>
                </div>

                <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-white">
                  Gardez un œil sur vos opportunités.
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/80">
                  Retrouvez toutes vos candidatures, cliquez sur chaque catégorie pour filtrer vos dossiers et visualisez précisément l'avancement de chaque étape.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              STATISTIQUES INTERACTIVES / FILTRES EN 1 CLIC
          ================================================= */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Cliquez sur une option pour filtrer par étape
              </p>
              {activeFilter !== "Toutes" && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("Toutes")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                >
                  Réinitialiser le filtre ({activeFilter})
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InteractiveStatCard
                icon={<FileStack size={22} />}
                label="Total"
                value={totalCount}
                detail="Candidatures envoyées"
                badgeColor="from-blue-600 to-indigo-600"
                iconBg="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                isActive={activeFilter === "Toutes"}
                onClick={() => setActiveFilter("Toutes")}
              />

              <InteractiveStatCard
                icon={<Hourglass size={22} />}
                label="En cours"
                value={inProgressCount}
                detail="Candidatures en traitement"
                badgeColor="from-violet-600 to-purple-600"
                iconBg="bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400"
                isActive={activeFilter === "En cours"}
                onClick={() => setActiveFilter("En cours")}
              />

              <InteractiveStatCard
                icon={<CalendarCheck2 size={22} />}
                label="Entretiens"
                value={interviewCount}
                detail="Entretiens programmés"
                badgeColor="from-emerald-600 to-teal-600"
                iconBg="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                isActive={activeFilter === "Entretien"}
                onClick={() => setActiveFilter("Entretien")}
              />

              <InteractiveStatCard
                icon={<Award size={22} />}
                label="Présélections"
                value={shortlistedCount}
                detail="Candidatures présélectionnées"
                badgeColor="from-amber-500 to-orange-600"
                iconBg="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                isActive={activeFilter === "Présélection"}
                onClick={() => setActiveFilter("Présélection")}
              />
            </div>
          </section>

          {/* =================================================
              RECHERCHE + FILTRES
          ================================================= */}
          <section className="mt-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                  Historique
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  {activeFilter === "Toutes"
                    ? "Toutes mes candidatures"
                    : `Candidatures : ${activeFilter}`}
                  <span className="ml-2.5 rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                    {filteredApplications.length}
                  </span>
                </h2>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher par poste, entreprise ou ville..."
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-11 pr-4 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Onglets Filtres */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {filters.map((f) => (
                <Button
                  key={f.key}
                  type="button"
                  onClick={() => setActiveFilter(f.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                    activeFilter === f.key
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                      : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600"
                  }`}
                >
                  {f.key === "Toutes" && <Filter size={13} />}
                  {f.key === "En cours" && <Hourglass size={13} />}
                  {f.key === "Présélection" && <Award size={13} />}
                  {f.key === "Entretien" && <CalendarCheck2 size={13} />}
                  {f.key === "Non retenues" && <XCircle size={13} />}
                  <span>{f.label}</span>
                </Button>
              ))}
            </div>
          </section>

          {/* =================================================
              LISTE DES CANDIDATURES
          ================================================= */}
          <section className="mt-5">
            {filteredApplications.length > 0 ? (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onOpen={() => setSelectedApplication(application)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                search={search}
                activeFilter={activeFilter}
                onReset={() => {
                  setSearch("");
                  setActiveFilter("Toutes");
                }}
              />
            )}
          </section>

          {/* =================================================
              CONSEIL IA
          ================================================= */}
          <section className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Sparkles size={22} />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    Optimisez vos prochaines candidatures avec l'IA
                  </p>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Utilisez les outils intelligents de JobConnect pour adapter votre CV à chaque offre et vous entraîner face à un simulateur d'entretien réaliste.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => onNavigate?.("candidate-ai")}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <span>Découvrir les outils IA</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* =====================================================
          MODAL DÉTAIL & TIMELINE DE LA CANDIDATURE
      ===================================================== */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

/* =========================================================
   INTERACTIVE STAT CARD (FILTRABLE EN 1 CLIC)
========================================================= */

function InteractiveStatCard({
  icon,
  label,
  value,
  detail,
  badgeColor = "from-blue-600 to-indigo-600",
  iconBg = "bg-blue-50 text-blue-600",
  isActive = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col text-left rounded-2xl border p-5 transition-all duration-300 ${
        isActive
          ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-700 ring-2 ring-blue-500/50 shadow-xl shadow-blue-500/10 scale-[1.02]"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/40"
      }`}
      role="button"
      aria-pressed={isActive}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
        >
          {icon}
        </div>

        {isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
            <Check size={11} /> Actif
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
            Filtrer →
          </span>
        )}
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
        {detail}
      </p>

      {/* Barre indicateur */}
      <div
        className={`mt-4 h-1 w-full rounded-full transition-all ${
          isActive
            ? `bg-gradient-to-r ${badgeColor}`
            : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200"
        }`}
      />
    </button>
  );
}

/* =========================================================
   APPLICATION CARD (AVEC AVANCEMENT CLAIR ET ÉTAPES)
========================================================= */

function ApplicationCard({ application, onOpen }) {
  const statusStyle = getStatusStyle(application.statusType);

  return (
    <article className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/40">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        
        {/* Identité */}
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-black text-white shadow-md shadow-blue-500/20">
            {application.companyShort || application.company?.charAt(0) || "JC"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-900 dark:text-white sm:text-lg">
              {application.title}
            </h3>

            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {application.company}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <MapPin size={13} className="text-slate-400" />
                {application.location}
              </span>

              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <BriefcaseBusiness size={13} className="text-slate-400" />
                {application.type}
              </span>

              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <CalendarDays size={13} className="text-slate-400" />
                {application.date || application.appliedDays}
              </span>
            </div>
          </div>
        </div>

        {/* Badge d'étape / Statut */}
        <div className="lg:w-[210px]">
          <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${statusStyle.wrapper}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${statusStyle.dot}`} />
            <span className={`text-xs font-black ${statusStyle.text}`}>
              {application.status}
            </span>
          </div>

          <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            {application.interviewDate ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CalendarCheck2 size={12} /> {application.interviewDate}
              </span>
            ) : (
              application.appliedDays || "Dossier en traitement"
            )}
          </p>
        </div>

        {/* Progression par étape */}
        <div className="lg:w-[240px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Étape {application.currentStep || 1} / 5
            </span>

            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
              {application.progress === 100 && application.statusType === "rejected"
                ? "Terminée"
                : `${application.progress || 20}%`}
            </span>
          </div>

          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                application.statusType === "rejected"
                  ? "bg-slate-400"
                  : application.statusType === "interview"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : application.statusType === "selection"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
              }`}
              style={{
                width: `${application.progress || 20}%`,
              }}
            />
          </div>
        </div>

        {/* Action Voir Détails */}
        <Button
          type="button"
          onClick={onOpen}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-3 text-xs font-black text-slate-700 dark:text-slate-200 transition hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600"
        >
          <span>Voir l'avancement</span>
          <ChevronRight size={14} />
        </Button>
      </div>
    </article>
  );
}

/* =========================================================
   STATUS STYLE MAPPER
========================================================= */

function getStatusStyle(type) {
  if (type === "selection") {
    return {
      wrapper: "border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800",
      dot: "bg-amber-500 animate-pulse",
      text: "text-amber-700 dark:text-amber-300",
    };
  }

  if (type === "review") {
    return {
      wrapper: "border-violet-200 bg-violet-50 dark:bg-violet-950/40 dark:border-violet-800",
      dot: "bg-violet-500",
      text: "text-violet-700 dark:text-violet-300",
    };
  }

  if (type === "interview") {
    return {
      wrapper: "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800",
      dot: "bg-emerald-500 animate-pulse",
      text: "text-emerald-700 dark:text-emerald-300",
    };
  }

  if (type === "rejected") {
    return {
      wrapper: "border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800",
      dot: "bg-red-500",
      text: "text-red-700 dark:text-red-300",
    };
  }

  return {
    wrapper: "border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800",
    dot: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-300",
  };
}

/* =========================================================
   DETAIL MODAL AVEC TIMELINE COMPLÈTE
========================================================= */

function ApplicationDetailModal({ application, onClose, onNavigate }) {
  const statusStyle = getStatusStyle(application.statusType);

  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <Button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-5 py-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-black text-white shadow-md shadow-blue-500/20">
              {application.companyShort || application.company?.charAt(0)}
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                Suivi d'avancement
              </p>
              <h2 className="mt-0.5 text-base font-black text-slate-900 dark:text-white">
                {application.title}
              </h2>
            </div>
          </div>

          <Button
            aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 transition"
          >
            <X size={17} />
          </Button>
        </div>

        <div className="p-5 sm:p-7">
          {/* Fiche récapitulative */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {application.title}
                </h3>
                <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {application.company}
                </p>
              </div>

              <div className={`inline-flex w-fit items-center gap-2 rounded-xl border px-3 py-2 ${statusStyle.wrapper}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${statusStyle.dot}`} />
                <span className={`text-xs font-black ${statusStyle.text}`}>
                  {application.status}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DetailInfo
                icon={<MapPin size={15} />}
                label="Localisation"
                value={application.location}
              />
              <DetailInfo
                icon={<BriefcaseBusiness size={15} />}
                label="Type de contrat"
                value={application.type}
              />
              <DetailInfo
                icon={<CalendarDays size={15} />}
                label="Date de candidature"
                value={application.date || application.appliedDays}
              />
            </div>
          </div>

          {/* Entretien programmé (si applicable) */}
          {application.interviewDate && (
            <div className="mt-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                  <Video size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Entretien d'embauche programmé
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    Prévu le {application.interviewDate} à {application.interviewTime}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-emerald-700/80 dark:text-emerald-300/80">
                    Préparez vos réponses grâce à notre simulateur d'entretien IA pour maximiser vos chances de réussite.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progression chronologique / Stepper */}
          <div className="mt-7">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                  Étapes du processus
                </p>
                <h3 className="mt-1 text-base font-black text-slate-900 dark:text-white">
                  Chronologie détaillée de votre candidature
                </h3>
              </div>

              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                {application.progress === 100 && application.statusType === "rejected"
                  ? "Terminée"
                  : `${application.progress || 20}% d'avancement`}
              </span>
            </div>

            <div className="mt-6">
              {(application.steps || []).map((step, index) => {
                const isLast = index === application.steps.length - 1;

                return (
                  <div key={`${step.label}-${index}`} className="relative flex gap-4">
                    {!isLast && (
                      <div
                        className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 ${
                          step.completed
                            ? "bg-blue-600 dark:bg-blue-500"
                            : "bg-slate-200 dark:bg-slate-800"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        step.rejected
                          ? "border-red-300 bg-red-50 text-red-500 dark:bg-red-950"
                          : step.completed
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-300"
                      }`}
                    >
                      {step.rejected ? (
                        <XCircle size={15} />
                      ) : step.completed ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pb-7">
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                        <div>
                          <p
                            className={`text-xs font-black ${
                              step.completed
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {step.label}
                          </p>

                          {step.current && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                              <Sparkles size={11} /> Étape actuelle
                            </span>
                          )}
                        </div>

                        {step.date && (
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {step.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description du poste */}
          {application.description && (
            <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                À propos du poste
              </h3>
              <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                {application.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-slate-100 dark:border-slate-800 pt-5">
            <Button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-3 text-xs font-black text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Fermer
            </Button>

            {application.statusType !== "rejected" && (
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate?.("candidate-job-detail", application.jobId || application.id);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700"
              >
                <span>Consulter l'offre</span>
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalFrame>
  );
}

/* =========================================================
   DETAIL INFO BADGE
========================================================= */

function DetailInfo({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-3 shadow-xs">
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-xs font-black text-slate-900 dark:text-white">
        {value || "Non spécifié"}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ search, activeFilter, onReset }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
        <Search size={24} />
      </div>

      <h3 className="mt-5 text-base font-black text-slate-900 dark:text-white">
        Aucune candidature trouvée
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
        {search
          ? `Aucune candidature ne correspond à votre recherche "${search}".`
          : `Vous n'avez actuellement aucune candidature avec le statut "${activeFilter}".`}
      </p>

      <Button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
      >
        Réinitialiser les filtres
      </Button>
    </div>
  );
}

export default CandidateApplicationsPage;
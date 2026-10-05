import { usePlatformSettings } from "../../hooks/usePlatformSettings";
import { Button } from "../../components/ui";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Compass,
  FileCheck2,
  FileText,
  FolderKanban,
  Menu,
  MessagesSquare,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  UsersRound,
  Video,
  X,
  BotMessageSquare,
} from "lucide-react";

import Logo from "../../components/common/Logo";
import ThemeToggle from "../../components/common/ThemeToggle";
import LanguageToggle from "../../components/common/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";


/* =========================================================
   LANDING PAGE
========================================================= */

function LandingPage({ onLogin, onRegister }) {
  const { settings: platform } = usePlatformSettings();
  const { t } = useLanguage();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* -------------------------------------------------------
     Gestion du scroll
  ------------------------------------------------------- */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  /* -------------------------------------------------------
     Navigation vers les ancres
  ------------------------------------------------------- */

  const scrollTo = (id) => {
    setMobileMenu(false);

    const element = document.getElementById(id);

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };


  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">

      {/* ===================================================
          NAVBAR
      =================================================== */}

      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "px-3 pt-3"
            : "px-4 pt-4 sm:px-6 sm:pt-5"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border transition-all duration-500 ${
            scrolled
              ? "border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 px-4 py-3 shadow-xl shadow-blue-950/10 dark:shadow-black/30 backdrop-blur-xl"
              : "border-white/30 bg-white/85 dark:border-slate-800/80 dark:bg-slate-900/85 px-5 py-4 shadow-lg shadow-blue-950/5 dark:shadow-black/20 backdrop-blur-xl"
          }`}
        >

          {/* Logo */}

          <Button
            type="button"
            onClick={() => scrollTo("accueil")}
            className="shrink-0"
          >
            <Logo className="h-10 w-auto" />
          </Button>


          {/* -------------------------------------------------
              NAVIGATION DESKTOP
          ------------------------------------------------- */}

          <nav className="hidden items-center gap-1 lg:flex">

            <Button
              type="button"
              onClick={() => scrollTo("accueil")}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            >
              {t("nav.home", "Accueil")}
            </Button>


            {/* Fonctionnalités */}

            <div className="group relative">

              <Button
                type="button"
                className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {t("nav.features", "Fonctionnalités")}

                <ChevronDown
                  size={15}
                  className="transition-transform duration-300 group-hover:rotate-180"
                />
              </Button>


              {/* Dropdown */}

              <div className="invisible absolute left-0 top-full mt-2 w-72 translate-y-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 opacity-0 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">

                {/* Candidat */}

                <Button
                  type="button"
                  onClick={() => scrollTo("candidats")}
                  className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <div className="rounded-lg bg-blue-100 dark:bg-blue-950 p-2 text-blue-600 dark:text-blue-400">
                    <UsersRound size={18} />
                  </div>

                  <div>
                    <strong className="block text-sm text-slate-900 dark:text-white">
                      {t("nav.candidates", "Candidats")}
                    </strong>

                    <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {t("nav.candidateDesc", "Trouver des opportunités et valoriser son profil.")}
                    </span>
                  </div>
                </Button>


                {/* Recruteur */}

                <Button
                  type="button"
                  onClick={() => scrollTo("recruteurs")}
                  className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-violet-50 dark:hover:bg-violet-950/40"
                >
                  <div className="rounded-lg bg-violet-100 dark:bg-violet-950 p-2 text-violet-600 dark:text-violet-400">
                    <Building2 size={18} />
                  </div>

                  <div>
                    <strong className="block text-sm text-slate-900 dark:text-white">
                      {t("nav.recruiters", "Recruteurs")}
                    </strong>

                    <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {t("nav.recruiterDesc", "Publier des offres et trouver les bons talents.")}
                    </span>
                  </div>
                </Button>


                {/* IA */}

                <Button
                  type="button"
                  onClick={() => scrollTo("intelligence")}
                  className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <div className="rounded-lg bg-blue-100 dark:bg-blue-950 p-2 text-blue-600 dark:text-blue-400">
                    <BotMessageSquare size={18} />
                  </div>

                  <div>
                    <strong className="block text-sm text-slate-900 dark:text-white">
                      {t("nav.ai", "Intelligence artificielle")}
                    </strong>

                    <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {t("nav.aiDesc", "Des outils intelligents pour vous accompagner.")}
                    </span>
                  </div>
                </Button>

              </div>
            </div>


            {/* Offres */}

            <Button
              type="button"
              onClick={() => scrollTo("offres")}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t("nav.offers", "Offres")}
            </Button>


            {/* À propos */}

            <Button
              type="button"
              onClick={() => scrollTo("apropos")}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t("nav.about", "À propos")}
            </Button>


            {/* Contact */}

            <Button
              type="button"
              onClick={() => scrollTo("contact")}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t("nav.contact", "Contact")}
            </Button>

          </nav>


          {/* -------------------------------------------------
              ACTIONS DESKTOP
          ------------------------------------------------- */}

          <div className="hidden items-center gap-2 lg:flex">

            <LanguageToggle variant="pill" className="mr-1" />
            <ThemeToggle className="mr-1" />

            <Button
              type="button"
              onClick={onLogin}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t("nav.login", "Se connecter")}
            </Button>

            <Button
              type="button"
              onClick={onRegister}
              className="group flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/40"
            >
              {t("nav.register", "S'inscrire")}

              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>

          </div>


          {/* -------------------------------------------------
              MENU MOBILE
          ------------------------------------------------- */}

          <div className="flex items-center gap-1.5 lg:hidden">
            <LanguageToggle variant="compact" />
            <ThemeToggle />
            <Button
              type="button"
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-xl p-2.5 text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={t("common.menu", "Menu")}
            >
              {mobileMenu ? (
                <X size={23} />
              ) : (
                <Menu size={23} />
              )}
            </Button>
          </div>

        </div>


        {/* ---------------------------------------------------
            MENU MOBILE OUVERT
        --------------------------------------------------- */}

        {mobileMenu && (
          <div className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl lg:hidden">

            <div className="flex items-center justify-between px-4 py-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("common.language", "Langue")}</span>
              <LanguageToggle variant="pill" />
            </div>

            <Button
              type="button"
              onClick={() => scrollTo("accueil")}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t("nav.home", "Accueil")}
            </Button>

            <Button
              type="button"
              onClick={() => scrollTo("fonctionnalites")}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t("nav.features", "Fonctionnalités")}
            </Button>

            <Button
              type="button"
              onClick={() => scrollTo("offres")}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t("nav.offers", "Offres")}
            </Button>

            <Button
              type="button"
              onClick={() => scrollTo("apropos")}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t("nav.about", "À propos")}
            </Button>

            <Button
              type="button"
              onClick={() => scrollTo("contact")}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t("nav.contact", "Contact")}
            </Button>

            <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />

            <Button
              type="button"
              onClick={onLogin}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t("nav.login", "Se connecter")}
            </Button>

            <Button
              type="button"
              onClick={onRegister}
              className="mt-1 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
            >
              {t("nav.register", "S'inscrire")}
            </Button>

          </div>
        )}

      </header>


      {/* ===================================================
          CONTENU PRINCIPAL
      =================================================== */}

      <main id="accueil">


        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative min-h-screen overflow-hidden bg-[#061a41] pt-32">

          {/* Background */}

          <div className="absolute inset-0 overflow-hidden">

            <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-600/30 blur-[120px]" />

            <div className="absolute right-[-150px] top-20 h-[600px] w-[600px] rounded-full bg-indigo-600/30 blur-[140px]" />

            <div className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[130px]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.18),transparent_30%)]" />

            <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:60px_60px]" />

          </div>


          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.05fr]">


            {/* ---------------------------------------------
                HERO TEXTE
            --------------------------------------------- */}

            <div className="animate-[fadeUp_.8s_ease-out]">

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur-md">

                <Compass
                  size={16}
                  className="text-blue-300"
                />

                <span>
                  {t("landing.heroBadge", "L'avenir de la recherche d'emploi")}
                </span>

              </div>


              <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[70px]">
                {t("landing.homeTitle", platform.homeTitle)}
              </h1>


              <p className="mt-7 max-w-2xl text-lg leading-8 text-blue-100/80 sm:text-xl">
                {t("landing.homeDescription", platform.homeDescription)}
              </p>


              {/* CTA */}

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <Button
                  type="button"
                  onClick={onRegister}
                  className="group flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-2xl shadow-blue-900/40 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500"
                >
                  {t("landing.ctaStart", "Commencer maintenant")}

                  <ArrowRight
                    size={19}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Button>


                <Button
                  type="button"
                  onClick={() => scrollTo("offres")}
                  className="group flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                >
                  <Search size={19} />

                  {t("landing.exploreOffers", "Explorer les offres")}
                </Button>

              </div>


              {/* Garanties */}

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-blue-100/70">

                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={17}
                    className="text-blue-300"
                  />

                  {t("landing.verifiedRecruiters", "Recruteurs vérifiés")}
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={17}
                    className="text-blue-300"
                  />

                  {t("landing.applicationTracking", "Suivi des candidatures")}
                </div>

                <div className="flex items-center gap-2">
                  <Target
                    size={17}
                    className="text-blue-300"
                  />

                  {t("landing.aiToolsBadge", "Outils professionnels")}
                </div>

              </div>

            </div>


            {/* ---------------------------------------------
                APERCU DASHBOARD
            --------------------------------------------- */}

            <div className="relative hidden lg:block">

              {/* Notification */}

              <div className="absolute -right-2 -top-10 z-20 animate-[float_4s_ease-in-out_infinite] rounded-2xl border border-white/30 bg-white/90 p-4 shadow-2xl backdrop-blur-xl">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                    <BriefcaseBusiness size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {t("landing.mockOpportunity", "Nouvelle opportunité")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {t("landing.mockJob", "Développeur Django • TechCorp")}
                    </p>
                  </div>

                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                </div>

              </div>


              {/* Dashboard */}

              <div className="relative rounded-[28px] border border-white/30 bg-white/95 p-4 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-xl transition-all duration-700 hover:scale-[1.01]">

                <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                  {/* Sidebar dashboard */}

                  <div className="hidden w-40 shrink-0 border-r border-slate-200 bg-white p-3 xl:block">

                    <div className="mb-7 px-2">
                      <Logo className="h-7 w-auto" />
                    </div>

                    {[
                      [t("sidebar.candidate.dashboard", "Tableau de bord"), true],
                      [t("sidebar.candidate.applications", "Candidatures"), false],
                      [t("sidebar.candidate.jobs", "Offres"), false],
                      [t("sidebar.candidate.cv", "Mon CV"), false],
                      [t("sidebar.candidate.ai", "Outils IA"), false],
                      [t("sidebar.recruiter.interviews", "Entretiens"), false],
                    ].map(([item, active]) => (
                      <div
                        key={item}
                        className={`mb-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                          active
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-500"
                        }`}
                      >
                        {item}
                      </div>
                    ))}

                  </div>


                  {/* Contenu dashboard */}

                  <div className="min-w-0 flex-1 p-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs text-slate-500">
                          {t("landing.mockHello", "Bonjour")}
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {t("landing.mockContinueSearch", "Continuez votre recherche")}
                        </p>

                      </div>

                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />

                    </div>


                    {/* Statistiques */}

                    <div className="mt-5 grid grid-cols-4 gap-2">

                      {[
                        ["12", t("landing.mockApplications", "Candidatures")],
                        ["4", t("landing.mockInterviews", "Entretiens")],
                        ["8", t("landing.mockOffers", "Offres")],
                        ["92%", t("landing.mockProfile", "Profil")],
                      ].map(([number, label]) => (
                        <div
                          key={label}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <p className="text-base font-extrabold text-slate-900">
                            {number}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {label}
                          </p>
                        </div>
                      ))}

                    </div>


                    {/* Offres recommandées */}

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">

                      <div className="flex items-center justify-between">

                        <p className="text-xs font-bold text-slate-900">
                          {t("landing.mockRecommendedJobs", "Offres recommandées")}
                        </p>

                        <span className="text-xs font-semibold text-blue-600">
                          {t("common.viewAll", "Voir tout")}
                        </span>

                      </div>


                      {[
                        [t("landing.mockJob1", "Comptable Général"), t("landing.mockCompany1", "Cabinet Audit & Finance"), t("landing.contractCdi", "CDI"), "95%"],
                        [t("landing.mockJob2", "Coiffeuse Styliste & Visagiste"), t("landing.mockCompany2", "Salon Élégance Prestige"), t("landing.contractCdi", "CDI"), "92%"],
                        [t("landing.mockJob3", "Développeur Web & Mobile"), t("landing.mockCompany3", "TechCorp Solutions"), t("landing.contractFreelance", "Freelance"), "88%"],
                      ].map(([title, company, type, score]) => (

                        <div
                          key={title}
                          className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/30"
                        >

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <BriefcaseBusiness size={15} />
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-xs font-bold text-slate-900">
                              {title}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {company}
                            </p>

                          </div>

                          <div className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                            {score}
                          </div>

                          <Button
                            type="button"
                            className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white"
                          >
                            {t("common.view", "Voir")}
                          </Button>

                        </div>

                      ))}

                    </div>

                  </div>

                </div>

              </div>


              {/* Score */}

              <div className="absolute -bottom-10 -left-14 z-20 w-64 animate-[float_5s_ease-in-out_infinite] rounded-2xl border border-white/30 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                    <Target size={18} />
                  </div>

                  <div className="flex-1">

                    <div className="flex items-center justify-between">

                      <p className="text-xs font-bold text-slate-900">
                        {t("landing.mockCompatibilityScore", "Score de compatibilité")}
                      </p>

                      <span className="text-xs font-extrabold text-blue-600">
                        92%
                      </span>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                      <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />

                    </div>

                    <p className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} /> {t("landing.mockHighMatch", "Très bonne compatibilité")}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            STATISTIQUES
        ================================================= */}

        <section className="relative z-10 bg-white px-5 py-12 sm:px-8">

          <div className="mx-auto grid max-w-6xl grid-cols-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 md:grid-cols-4">

            {[
              ["500+", t("landing.statsActiveOffers", "Offres actives"), BriefcaseBusiness],
              ["200+", t("landing.statsCompanies", "Entreprises"), Building2],
              ["5 000+", t("landing.statsRegisteredCandidates", "Candidats inscrits"), UsersRound],
              ["98%", t("landing.statsSatisfactionRate", "Satisfaction"), ShieldCheck],
            ].map(([number, label, Icon], index) => (

              <div
                key={label}
                className={`group flex items-center gap-4 p-6 transition-all duration-300 hover:bg-slate-50 ${
                  index < 3
                    ? "border-b border-slate-200 md:border-b-0 md:border-r"
                    : ""
                }`}
              >

                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={22} />
                </div>

                <div>

                  <p className="text-2xl font-extrabold text-slate-950">
                    {number}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {label}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* =================================================
            FONCTIONNALITES
        ================================================= */}

        <section
          id="fonctionnalites"
          className="scroll-mt-32 bg-slate-50 px-5 py-28 sm:px-8"
        >

          <div className="mx-auto max-w-7xl">

            <div className="mx-auto max-w-3xl text-center">

              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-600">

                <Compass size={14} />

                {t("landing.featuresBadge", "Une plateforme complète")}

              </div>


              <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">

                {t("landing.featuresTitle", "Tout ce qu'il faut pour")}

                <span className="text-blue-600">
                  {" "}{t("landing.featuresTitleHighlight", "réussir.")}
                </span>

              </h2>


              <p className="mt-5 text-lg leading-8 text-slate-500">
                {t("landing.featuresDescription", "JobConnect accompagne les candidats et les recruteurs dans chaque étape du processus de recrutement.")}
              </p>

            </div>


            {/* Cartes */}

            <div className="mt-16 grid gap-6 lg:grid-cols-3">

              {/* Candidat */}

              <FeatureCard
                id="candidats"
                icon={UsersRound}
                iconClass="bg-blue-100 text-blue-600"
                badge={t("roles.candidate", "Candidat")}
                title={t("landing.featureCandidateTitle", "Construisez votre avenir")}
                description={t("landing.featureCandidateDesc", "Trouvez les opportunités qui correspondent à votre profil et préparez-vous efficacement.")}
                items={[
                  t("landing.featureCandidate1", "Toutes les offres au même endroit"),
                  t("landing.featureCandidate2", "CV en ligne et gestion du profil"),
                  t("landing.featureCandidate3", "Suivi des candidatures"),
                  t("landing.featureCandidate4", "Simulation d'entretien"),
                  t("landing.featureCandidate5", "Outils IA et génération de documents"),
                ]}
              />


              {/* Recruteur */}

              <FeatureCard
                id="recruteurs"
                icon={Building2}
                iconClass="bg-violet-100 text-violet-600"
                badge={t("roles.recruiter", "Recruteur")}
                title={t("landing.featureRecruiterTitle", "Trouvez les meilleurs talents")}
                description={t("landing.featureRecruiterDesc", "Publiez vos offres, analysez les candidatures et identifiez rapidement les profils pertinents.")}
                items={[
                  t("landing.featureRecruiter1", "Publication d'offres et flyers"),
                  t("landing.featureRecruiter2", "ATS et gestion des candidatures"),
                  t("landing.featureRecruiter3", "Score de compatibilité"),
                  t("landing.featureRecruiter4", "Pipeline de recrutement"),
                  t("landing.featureRecruiter5", "Entretien et visioconférence"),
                ]}
                violet
              />


              {/* IA */}

              <FeatureCard
                id="intelligence"
                icon={SlidersHorizontal}
                iconClass="bg-blue-100 text-blue-600"
                badge={t("nav.ai", "Intelligence artificielle")}
                title={t("landing.featureAiTitle", "Des outils qui vous accompagnent")}
                description={t("landing.featureAiDesc", "Profitez de fonctionnalités intelligentes pour améliorer votre recherche d'emploi et votre recrutement.")}
                items={[
                  t("landing.featureAi1", "Analyse intelligente des offres"),
                  t("landing.featureAi2", "Préparation aux entretiens"),
                  t("landing.featureAi3", "Conseils personnalisés"),
                  t("landing.featureAi4", "Génération de documents"),
                  t("landing.featureAi5", "Aide à la prise de décision"),
                ]}
              />

            </div>

          </div>

        </section>


        {/* =================================================
            INTELLIGENCE ARTIFICIELLE
        ================================================= */}

        <section
          id="intelligence"
          className="scroll-mt-32 relative overflow-hidden bg-[#071b41] px-5 py-28 text-white sm:px-8"
        >

          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/30 blur-[120px]" />

          <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px]" />


          <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">

            {/* Texte */}

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-200">

                <Compass size={16} />

                {t("landing.aiSectionBadge", "Intelligence artificielle")}

              </div>


              <h2 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">

                {t("landing.aiSectionHeading", "L'IA vous accompagne,")}

                <span className="block text-blue-400">
                  {t("landing.aiSectionHeadingHighlight", "sans remplacer votre talent.")}
                </span>

              </h2>


              <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100/70">
                {t("landing.aiSectionDescription", "Analysez une offre, améliorez votre CV, entraînez-vous pour un entretien et générez vos documents professionnels grâce à des outils intelligents.")}
              </p>


              <Button
                type="button"
                onClick={onRegister}
                className="group mt-8 flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-500"
              >
                {t("landing.aiDiscoverBtn", "Découvrir les outils IA")}

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />

              </Button>

            </div>


            {/* Cartes IA */}

            <div className="grid gap-4 sm:grid-cols-2">

              {[
                [
                  t("landing.aiCard1Title", "Analyse d'offre"),
                  t("landing.aiCard1Desc", "Comprenez rapidement les exigences d'une opportunité."),
                  Search,
                ],
                [
                  t("landing.aiCard2Title", "Simulation d'entretien"),
                  t("landing.aiCard2Desc", "Préparez-vous à partir d'une offre spécifique."),
                  MessagesSquare,
                ],
                [
                  t("landing.aiCard3Title", "Conseiller CV"),
                  t("landing.aiCard3Desc", "Identifiez les points à améliorer dans votre CV."),
                  FileCheck2,
                ],
                [
                  t("landing.aiCard4Title", "Génération de documents"),
                  t("landing.aiCard4Desc", "Créez vos CV, lettres et portfolios."),
                  FolderKanban,
                ],
              ].map(([title, description, Icon]) => (

                <div
                  key={title}
                  className="group rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                >

                  <div className="mb-5 inline-flex rounded-xl bg-blue-500/20 p-3 text-blue-300 transition-transform group-hover:scale-110">
                    <Icon size={22} />
                  </div>

                  <h3 className="font-bold">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-blue-100/60">
                    {description}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* =================================================
            OFFRES
        ================================================= */}

        <section
          id="offres"
          className="scroll-mt-32 bg-white px-5 py-28 sm:px-8"
        >

          <div className="mx-auto max-w-7xl">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

              <div>

                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  {t("landing.offersBadge", "Opportunités")}
                </p>

                <h2 className="mt-3 text-4xl font-extrabold text-slate-950">
                  {t("landing.offersHeading", "Trouvez votre prochaine opportunité.")}
                </h2>

                <p className="mt-4 max-w-2xl text-slate-500">
                  {t("landing.offersSubheading", "CDI, CDD, stages, alternances et missions freelance. Retrouvez toutes les opportunités au même endroit.")}
                </p>

              </div>


              <Button
                type="button"
                onClick={onRegister}
                className="group inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600 md:self-auto"
              >

                {t("landing.seeAllOffers", "Voir les offres")}

                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />

              </Button>

            </div>


            {/* Aperçu des offres */}

            <div className="mt-12 grid gap-5 md:grid-cols-3">

              {[
                {
                  title: t("landing.offer1Title", "Comptable Général"),
                  company: t("landing.offer1Company", "Cabinet Audit & Finance"),
                  sector: t("landing.offer1Sector", "Comptabilité & Finance"),
                  type: t("landing.contractCdi", "CDI"),
                  location: "Yaoundé",
                  score: "95%",
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  title: t("landing.offer2Title", "Coiffeuse Styliste & Visagiste"),
                  company: t("landing.offer2Company", "Salon Élégance Prestige"),
                  sector: t("landing.offer2Sector", "Coiffure & Esthétique"),
                  type: t("landing.contractCdi", "CDI"),
                  location: "Douala",
                  score: "92%",
                  color: "bg-violet-50 text-violet-600",
                },
                {
                  title: t("landing.offer3Title", "Développeur Web & Mobile"),
                  company: t("landing.offer3Company", "TechCorp Solutions"),
                  sector: t("landing.offer3Sector", "Informatique & Digital"),
                  type: t("landing.contractFreelance", "Freelance"),
                  location: t("landing.contractRemote", "Télétravail"),
                  score: "88%",
                  color: "bg-emerald-50 text-emerald-600",
                },
              ].map((offer) => (

                <div
                  key={offer.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
                >

                  <div className="flex items-start justify-between">

                    <div className={`rounded-xl p-3 ${offer.color}`}>
                      <BriefcaseBusiness size={21} />
                    </div>

                    <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                      {offer.score}
                    </span>

                  </div>


                  <h3 className="mt-6 text-lg font-bold text-slate-950">
                    {offer.title}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {offer.company}
                  </p>


                  <div className="mt-5 flex flex-wrap gap-2">

                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {offer.sector}
                    </span>

                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                      {offer.type}
                    </span>

                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                      {offer.location}
                    </span>

                  </div>


                  <Button
                    type="button"
                    onClick={onRegister}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-bold text-white transition group-hover:bg-blue-600"
                  >
                    {t("landing.viewOffer", "Voir l'offre")}

                    <ArrowRight size={16} />
                  </Button>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* =================================================
            A PROPOS
        ================================================= */}

        <section
          id="apropos"
          className="scroll-mt-32 bg-slate-50 px-5 py-28 sm:px-8"
        >

          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">

            {/* Texte */}

            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                {t("landing.aboutBadge", "À propos de JobConnect")}
              </p>


              <h2 className="mt-4 text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">

                {t("landing.aboutHeading", "Une nouvelle façon de penser")}

                <span className="text-blue-600">
                  {" "}{t("landing.aboutHeadingHighlight", "le recrutement.")}
                </span>

              </h2>


              <p className="mt-6 text-lg leading-8 text-slate-600">
                {t("landing.aboutDescription", "JobConnect est une plateforme conçue pour rapprocher les candidats et les recruteurs dans un environnement simple, transparent et intelligent.")}
              </p>


              <div className="mt-8 space-y-4">

                {[
                  t("landing.aboutPoint1", "Un espace unique pour rechercher des opportunités."),
                  t("landing.aboutPoint2", "Un suivi clair de chaque candidature."),
                  t("landing.aboutPoint3", "Des outils intelligents pour mieux se préparer."),
                  t("landing.aboutPoint4", "Des outils professionnels pour les recruteurs."),
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >

                    <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
                      <Check size={15} />
                    </div>

                    <span className="text-sm font-medium text-slate-700">
                      {item}
                    </span>

                  </div>

                ))}

              </div>

            </div>


            {/* Statistiques visuelles */}

            <div className="relative">

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-3xl" />


              <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

                <div className="grid grid-cols-2 gap-4">

                  {[
                    [t("landing.aboutStatCandidates", "Candidats"), "5 000+", UsersRound],
                    [t("landing.aboutStatCompanies", "Entreprises"), "200+", Building2],
                    [t("landing.aboutStatOffers", "Offres"), "500+", BriefcaseBusiness],
                    [t("landing.aboutStatSatisfaction", "Satisfaction"), "98%", ShieldCheck],
                  ].map(([label, number, Icon]) => (

                    <div
                      key={label}
                      className="rounded-2xl bg-slate-50 p-5 transition hover:bg-blue-50"
                    >

                      <Icon
                        size={22}
                        className="text-blue-600"
                      />

                      <p className="mt-5 text-2xl font-extrabold text-slate-950">
                        {number}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {label}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            CONTACT / CTA
        ================================================= */}

        <section
          id="contact"
          className="scroll-mt-32 px-5 py-24 sm:px-8"
        >

          <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-900/20 sm:p-14">

            <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">

              <div>

                <p className="text-sm font-bold uppercase tracking-wider text-blue-200">
                  {t("landing.ctaBannerBadge", "Commencez maintenant")}
                </p>

                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                  {t("landing.ctaBannerTitle", "Prêt à trouver votre prochaine opportunité ?")}
                </h2>

                <p className="mt-4 max-w-2xl leading-7 text-blue-100/80">
                  {t("landing.ctaBannerDesc", "Rejoignez JobConnect et découvrez une nouvelle manière de rechercher un emploi ou de recruter les bons talents.")}
                </p>

              </div>


              <Button
                type="button"
                onClick={onRegister}
                className="group flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-blue-700 shadow-xl transition hover:-translate-y-1"
              >

                {t("landing.ctaBannerBtn", "Créer mon compte")}

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />

              </Button>

            </div>

          </div>

        </section>

      </main>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="border-t border-slate-200 bg-white px-5 py-12 sm:px-8">

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">

          {/* Identité */}

          <div className="md:col-span-2">

            <Logo className="h-10 w-auto" />

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
              {t("landing.footerDescription", "JobConnect simplifie la recherche d'emploi et le recrutement grâce à une plateforme moderne et intelligente.")}
            </p>

          </div>


          {/* Plateforme */}

          <div>

            <h3 className="font-bold text-slate-950">
              {t("landing.footerColPlatform", "Plateforme")}
            </h3>

            <div className="mt-4 space-y-3">

              <Button
                type="button"
                onClick={() => scrollTo("offres")}
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                {t("nav.offers", "Offres")}
              </Button>

              <Button
                type="button"
                onClick={() => scrollTo("fonctionnalites")}
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                {t("nav.features", "Fonctionnalités")}
              </Button>

              <Button
                type="button"
                onClick={() => scrollTo("intelligence")}
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                {t("nav.ai", "Intelligence artificielle")}
              </Button>

            </div>

          </div>


          {/* JobConnect */}

          <div>

            <h3 className="font-bold text-slate-950">
              {t("landing.footerColCompany", "JobConnect")}
            </h3>

            <div className="mt-4 space-y-3">

              <Button
                type="button"
                onClick={() => scrollTo("apropos")}
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                {t("nav.about", "À propos")}
              </Button>

              <Button
                type="button"
                onClick={() => scrollTo("contact")}
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                {t("nav.contact", "Contact")}
              </Button>

              <Button
                type="button"
                onClick={onLogin}
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                {t("nav.login", "Connexion")}
              </Button>

            </div>

          </div>

        </div>


        {/* Copyright */}

        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-200 pt-6 text-sm text-slate-400">

          <div className="mb-3 flex flex-wrap justify-center gap-4"><a href={"mailto:" + platform.platformEmail}>{platform.platformEmail}</a>{platform.platformPhone && <span>{platform.platformPhone}</span>}<span>{platform.country} · {platform.language}</span></div>
          © {new Date().getFullYear()} {platform.platformName}. {t("landing.allRightsReserved", "Tous droits réservés.")}

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   COMPOSANT FEATURE CARD
========================================================= */

function FeatureCard({
  id,
  icon: Icon,
  iconClass,
  badge,
  title,
  description,
  items,
  violet = false,
  cyan = false,
}) {
  return (
    <article
      id={id}
      className={`group relative scroll-mt-32 overflow-hidden rounded-3xl border bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
        violet
          ? "border-violet-100 hover:border-violet-200"
          : cyan
          ? "border-cyan-100 hover:border-cyan-200"
          : "border-blue-100 hover:border-blue-200"
      }`}
    >

      {/* Décoration */}

      <div
        className={`absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150 ${
          violet
            ? "bg-violet-500/5"
            : cyan
            ? "bg-cyan-500/5"
            : "bg-blue-500/5"
        }`}
      />


      <div className="relative">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div className={`rounded-2xl p-3 ${iconClass}`}>
            <Icon size={23} />
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
            {badge}
          </span>

        </div>


        {/* Titre */}

        <h3 className="mt-7 text-2xl font-extrabold text-slate-950">
          {title}
        </h3>


        {/* Description */}

        <p className="mt-3 leading-7 text-slate-500">
          {description}
        </p>


        {/* Liste */}

        <div className="mt-7 space-y-3">

          {items.map((item) => (

            <div
              key={item}
              className="flex items-start gap-3"
            >

              <div
                className={`mt-0.5 rounded-full p-1 ${
                  violet
                    ? "bg-violet-100 text-violet-600"
                    : cyan
                    ? "bg-cyan-100 text-cyan-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <Check size={13} />
              </div>

              <span className="text-sm font-medium text-slate-600">
                {item}
              </span>

            </div>

          ))}

        </div>

      </div>

    </article>
  );
}


export default LandingPage;
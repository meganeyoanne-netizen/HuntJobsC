import CandidateDrawer from "../../components/common/CandidateDrawer";
import { Input, Button, Select } from "../../components/ui";

import { api, post, perform } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { jobsAdapter } from "../../services/adapters";

import { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Check, ChevronDown, Clock3, Filter, Heart, MapPin, Search, Sparkles, X } from "lucide-react";



/* =========================================================
   COMPATIBILITÉ CANDIDAT
   Le score réel reste interne au système.
   Le candidat ne voit JAMAIS le pourcentage.
========================================================= */

function getCompatibilityLabel(score) {
  if (score >= 75) {
    return "Très bonne compatibilité";
  }

  if (score >= 50) {
    return "Bonne compatibilité";
  }

  if (score >= 25) {
    return "Compatibilité moyenne";
  }

  return "Consultez les critères de l’offre";
}

function getCompatibilityStyle(score) {
  if (score >= 75) {
    return {
      wrapper: "border-blue-100 bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-700",
    };
  }

  if (score >= 50) {
    return {
      wrapper: "border-violet-100 bg-violet-50",
      icon: "bg-violet-100 text-violet-600",
      text: "text-violet-700",
    };
  }

  if (score >= 25) {
    return {
      wrapper: "border-amber-100 bg-amber-50",
      icon: "bg-amber-100 text-amber-600",
      text: "text-amber-700",
    };
  }

  return {
    wrapper: "border-red-100 bg-red-50",
    icon: "bg-red-100 text-red-600",
    text: "text-red-700",
  };
}

/* =========================================================
   PAGE RECHERCHE D'OFFRES
========================================================= */

function CandidateJobsPage({
  user = {
    firstName: "",
    lastName: "",
  },
  onNavigate,
  onLogout,
}) {
  const firstName = user?.firstName || "Candidat";

  /* =======================================================
     ÉTATS DE RECHERCHE
  ======================================================= */

  const [searchTerm, setSearchTerm] = useState("");
  const [contractType, setContractType] = useState("Tous");

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [location, setLocation] = useState("");
  const [domain, setDomain] = useState("");
  const [experience, setExperience] = useState("");
  const [diploma, setDiploma] = useState("");

  const [favorites, setFavorites] = useResource("/favoris/");

  /* =======================================================
     NAVIGATION SIDEBAR
  ======================================================= */

  

  /* =======================================================
     DONNÉES DES OFFRES
     
     Le score est conservé pour la logique interne.
     Il n'est jamais affiché numériquement.
  ======================================================= */

  const jobs = useResource("/offres/", jobsAdapter)[0];

  /* =======================================================
     TYPES DE CONTRAT
  ======================================================= */

  const contractTypes = [
    "Tous",
    "CDI",
    "CDD",
    "Stage",
    "Alternance",
    "Freelance",
  ];

  /* =======================================================
     NIVEAUX D'EXPÉRIENCE
  ======================================================= */

  const experienceLevels = [
    {
      value: "Débutant",
      label: "Débutant",
      description: "0 à 1 an d'expérience",
    },
    {
      value: "Junior",
      label: "Junior",
      description: "1 à 2 ans d'expérience",
    },
    {
      value: "Intermédiaire",
      label: "Intermédiaire",
      description: "2 à 5 ans d'expérience",
    },
    {
      value: "Senior",
      label: "Senior",
      description: "5 ans et plus",
    },
  ];

  /* =======================================================
     DIPLÔMES
  ======================================================= */

  const diplomas = [
    "Doctorat",
    "Master",
    "Licence",
    "Bac",
    "BEPC",
  ];

  /* =======================================================
     FILTRAGE
  ======================================================= */

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();
    const normalizedDomain = domain.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !normalizedSearch ||
        job.title.toLowerCase().includes(normalizedSearch) ||
        job.company.toLowerCase().includes(normalizedSearch) ||
        job.domain.toLowerCase().includes(normalizedSearch);

      const matchesContract =
        contractType === "Tous" ||
        job.type === contractType;

      const matchesLocation =
        !normalizedLocation ||
        job.location.toLowerCase().includes(normalizedLocation);

      const matchesDomain =
        !normalizedDomain ||
        job.domain.toLowerCase().includes(normalizedDomain);

      const matchesExperience =
        !experience ||
        job.experience === experience;

      const matchesDiploma =
        !diploma ||
        job.diploma === diploma;

      return (
        matchesSearch &&
        matchesContract &&
        matchesLocation &&
        matchesDomain &&
        matchesExperience &&
        matchesDiploma
      );
    });
  }, [
    jobs,
    searchTerm,
    contractType,
    location,
    domain,
    experience,
    diploma,
  ]);

  /* =======================================================
     FAVORIS
  ======================================================= */

  const toggleFavorite = (jobId) => perform(async () => {await post("/favoris/",{offre:jobId}); setFavorites(await api("/favoris/"));});

  /* =======================================================
     RESET FILTRES
  ======================================================= */

  const resetFilters = () => {
    setLocation("");
    setDomain("");
    setExperience("");
    setDiploma("");
  };

  const activeFiltersCount = [
    location,
    domain,
    experience,
    diploma,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">

      {/* =====================================================
          SIDEBAR DESKTOP
      ===================================================== */}

      

      {/* =====================================================
          CONTENU PRINCIPAL
      ===================================================== */}

      <div className="">

        <main className="min-h-screen">

          {/* =================================================
              TOPBAR
          ================================================= */}

          

          {/* =================================================
              CONTENU
          ================================================= */}

          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">

            {/* =================================================
                INTRODUCTION
            ================================================= */}

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061a41] via-[#0b2d68] to-blue-600 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">

              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

              <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

              <div className="relative">

                <div className="max-w-2xl">

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-blue-100">
                    <Search size={12} />
                    Recherche d'opportunités
                  </div>

                  <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                    Trouvez l'opportunité qui vous correspond.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/75">
                    Recherchez parmi les offres disponibles et utilisez les filtres pour affiner votre recherche selon votre profil.
                  </p>

                </div>

              </div>

            </section>

            {/* =================================================
                RECHERCHE + BOUTON FILTRES
            ================================================= */}

            <section className="mt-7">

              <div className="flex flex-col gap-3 sm:flex-row">

                {/* Barre de recherche */}

                <div className="relative flex-1">

                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Rechercher un métier, une entreprise ou un domaine..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  {searchTerm && (
                    <Button aria-label="Fermer"
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={15} />
                    </Button>
                  )}

                </div>

                {/* Bouton filtres */}

                <Button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className={`flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-black transition ${
                    filtersOpen || activeFiltersCount > 0
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >

                  <Filter size={17} />

                  Filtres

                  {activeFiltersCount > 0 && (
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
                        filtersOpen
                          ? "bg-white text-blue-600"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {activeFiltersCount}
                    </span>
                  )}

                </Button>

              </div>

              {/* =================================================
                  TYPES DE CONTRAT
              ================================================= */}

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">

                {contractTypes.map((type) => (

                  <Button
                    key={type}
                    type="button"
                    onClick={() => setContractType(type)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 ${
                      contractType === type
                        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/15"
                        : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {type}
                  </Button>

                ))}

              </div>

            </section>

            {/* =================================================
                CONTENU OFFRES
            ================================================= */}

            <section className="mt-8">

              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                    Opportunités
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                    Offres disponibles
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {filteredJobs.length} offre
                    {filteredJobs.length > 1 ? "s" : ""} correspondant
                    {filteredJobs.length > 1 ? "" : ""} à votre recherche.
                  </p>

                </div>

                <div className="relative">

                  <Select
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 text-xs font-bold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    defaultValue="recent"
                  >
                    <option value="recent">
                      Plus récentes
                    </option>
                    <option value="relevance">
                      Pertinence
                    </option>
                  </Select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                </div>

              </div>

              {/* =================================================
                  GRILLE DES OFFRES
              ================================================= */}

              {filteredJobs.length > 0 ? (

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                  {filteredJobs.map((job) => {

                    const compatibilityStyle =
                      getCompatibilityStyle(
                        job.compatibility
                      );

                    const isFavorite =
                      favorites.some(item => (typeof item === "object" ? item.offre?.id || item.offre || item.id : item) === job.id);

                    return (
                      <article
                        key={job.id}
                        className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50"
                      >

                        {/* En-tête */}

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600 transition group-hover:bg-blue-600 group-hover:text-white">
                            {job.logo}
                          </div>

                          <div className="flex items-center gap-2">

                            {job.urgent && (
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-amber-600">
                                Urgent
                              </span>
                            )}

                            <Button aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"} aria-pressed={isFavorite}
                              type="button"
                              onClick={() =>
                                toggleFavorite(job.id)
                              }
                              className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                                isFavorite
                                  ? "bg-red-50 text-red-500"
                                  : "bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500"
                              }`}
                            >
                              <Heart
                                size={16}
                                fill={
                                  isFavorite
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </Button>

                          </div>

                        </div>

                        {/* Informations */}

                        <div className="mt-5">

                          <p className="text-xs font-bold text-slate-400">
                            {job.company}
                          </p>

                          <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-slate-900">
                            {job.title}
                          </h3>

                        </div>

                        {/* Métadonnées */}

                        <div className="mt-4 space-y-2">

                          <div className="flex items-center gap-2 text-xs text-slate-500">

                            <MapPin
                              size={14}
                              className="shrink-0"
                            />

                            <span>
                              {job.location}
                            </span>

                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">

                            <BriefcaseBusiness
                              size={14}
                              className="shrink-0"
                            />

                            <span>
                              {job.type}
                            </span>

                          </div>

                        </div>

                        {/* Description */}

                        <p className="mt-4 line-clamp-2 min-h-[36px] text-xs leading-5 text-slate-400">
                          {job.description}
                        </p>

                        {/* Compatibilité qualitative */}

                        <div
                          className={`mt-5 flex items-center gap-3 rounded-xl border px-3 py-3 ${compatibilityStyle.wrapper}`}
                        >

                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${compatibilityStyle.icon}`}
                          >
                            <Sparkles size={14} />
                          </div>

                          <div className="min-w-0">

                            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                              Correspondance avec votre profil
                            </p>

                            <p
                              className={`mt-0.5 truncate text-xs font-black ${compatibilityStyle.text}`}
                            >
                              {getCompatibilityLabel(
                                job.compatibility
                              )}
                            </p>

                          </div>

                        </div>

                        {/* Bas de carte */}

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                          <div className="flex items-center gap-1.5 text-xs text-slate-400">

                            <Clock3 size={12} />

                            {job.posted}

                          </div>

                          <Button
                            type="button"
                            onClick={() =>
                              onNavigate?.(
                                "candidate-job-detail",
                                job.id
                              )
                            }
                            className="flex items-center gap-1.5 text-xs font-black text-blue-600 transition hover:text-blue-700"
                          >
                            Voir l'offre
                            <ArrowRight size={12} />
                          </Button>

                        </div>

                      </article>
                    );
                  })}

                </div>

              ) : (

                /* =================================================
                   AUCUN RÉSULTAT
                ================================================= */

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Search size={23} />
                  </div>

                  <h3 className="mt-5 text-base font-black text-slate-900">
                    Aucune offre trouvée
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                    Nous n'avons trouvé aucune offre correspondant
                    aux critères sélectionnés. Essayez de modifier
                    votre recherche ou vos filtres.
                  </p>

                  <Button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setContractType("Tous");
                      resetFilters();
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                  >
                    Réinitialiser la recherche
                    <ArrowRight size={14} />
                  </Button>

                </div>

              )}

            </section>

          </div>

        </main>

      </div>

      {/* =====================================================
          OVERLAY FILTRES
      ===================================================== */}

      {filtersOpen && (
        <CandidateDrawer onClose={() => setFiltersOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setFiltersOpen(false);
            }
          }}
        >
          {/* =================================================
              PANNEAU DROIT
          ================================================= */}

          <aside
            className="absolute inset-y-0 right-0 flex w-full max-w-[430px] flex-col border-l border-slate-200 bg-white shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* Header */}

            <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-5 sm:px-7">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  Recherche avancée
                </p>

                <h2 className="mt-1 text-lg font-black text-slate-900">
                  Filtrer les offres
                </h2>

              </div>

              <Button aria-label="Fermer"
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </Button>

            </div>

            {/* Corps */}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">

              {/* Localisation */}

              <FilterField
                label="Localisation"
                description="Indiquez librement une ville ou une zone."
              >

                <div className="relative">

                  <MapPin
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Ex. Yaoundé, Douala..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

              </FilterField>

              {/* Domaine */}

              <FilterField
                label="Domaine"
                description="Saisissez le domaine professionnel recherché."
              >

                <div className="relative">

                  <BriefcaseBusiness
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="text"
                    value={domain}
                    onChange={(event) =>
                      setDomain(event.target.value)
                    }
                    placeholder="Ex. Informatique, Finance..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

              </FilterField>

              {/* Expérience */}

              <FilterField
                label="Niveau d'expérience"
                description="Choisissez le niveau correspondant à votre expérience."
              >

                <div className="space-y-2">

                  {experienceLevels.map((level) => {

                    const selected =
                      experience === level.value;

                    return (
                      <Button
                        key={level.value}
                        type="button"
                        onClick={() =>
                          setExperience(
                            selected
                              ? ""
                              : level.value
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                        }`}
                      >

                        <div>

                          <p
                            className={`text-xs font-black ${
                              selected
                                ? "text-blue-700"
                                : "text-slate-700"
                            }`}
                          >
                            {level.label}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {level.description}
                          </p>

                        </div>

                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-transparent"
                          }`}
                        >
                          <Check size={13} />
                        </span>

                      </Button>
                    );
                  })}

                </div>

              </FilterField>

              {/* Diplôme */}

              <FilterField
                label="Diplôme"
                description="Sélectionnez le niveau de diplôme minimum recherché."
              >

                <div className="grid grid-cols-2 gap-2">

                  {diplomas.map((item) => {

                    const selected =
                      diploma === item;

                    return (
                      <Button
                        key={item}
                        type="button"
                        onClick={() =>
                          setDiploma(
                            selected ? "" : item
                          )
                        }
                        className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/10"
                            : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        {item}
                      </Button>
                    );
                  })}

                </div>

              </FilterField>

              {/* Informations */}

              <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Sparkles size={15} />
                  </div>

                  <div>

                    <p className="text-xs font-black text-blue-800">
                      À propos de la compatibilité
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700/70">
                      JobConnect analyse votre profil pour vous
                      proposer les opportunités les plus pertinentes.
                      Le niveau de compatibilité est présenté sous
                      forme d'appréciation qualitative.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Footer */}

            <div className="shrink-0 border-t border-slate-200 bg-white p-5 sm:p-6">

              <div className="flex gap-3">

                <Button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Réinitialiser
                </Button>

                <Button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Afficher les offres
                  <ArrowRight size={14} />
                </Button>

              </div>

            </div>

          </aside>

        </CandidateDrawer>
      )}

      {/* =====================================================
          NAVIGATION MOBILE
      ===================================================== */}

      

    </div>
  );
}

/* =========================================================
   FILTER FIELD
========================================================= */

function FilterField({
  label,
  description,
  children,
}) {
  return (
    <div className="mb-7">

      <div className="mb-3">

        <p className="text-xs font-black text-slate-800">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-xs leading-4 text-slate-400">
            {description}
          </p>
        )}

      </div>

      {children}

    </div>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */



export default CandidateJobsPage;
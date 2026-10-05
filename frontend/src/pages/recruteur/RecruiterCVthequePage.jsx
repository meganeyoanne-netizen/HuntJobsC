import { patch, perform } from "../../services/api";
import { Input, Button, Select, ModalFrame } from "../../components/ui";


import { useResource } from "../../hooks/useResource";
import { candidatesAdapter } from "../../services/adapters";

import { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ChevronRight, Download, FileSearch, Filter, GraduationCap, Mail, MapPin, Phone, Search, Sparkles, Star, UserRound, Users, X } from "lucide-react";



function RecruiterCVthequePage({
  user = {
    firstName: "",
    lastName: "",
    companyName: "JobConnect",
  },
  onNavigate,
  onLogout,
}) {
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    "JobConnect";

  const recruiterName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Recruteur";

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [filters, setFilters] = useState({
    experience: "Toutes",
    location: "Toutes",
    availability: "Toutes",
    contract: "Tous",
  });

  const [preferences, setPreferences, , preferencesLoading] = useResource("/preferences/", value => value, {});
  const favoriteIds = Array.isArray(preferences.recruiterFavoriteCandidates) ? preferences.recruiterFavoriteCandidates : [];
  const [savingFavorite, setSavingFavorite] = useState(false);
  const toggleFavorite = id => perform(async () => {
    if (savingFavorite || preferencesLoading) return;
    setSavingFavorite(true);
    try {
      const next = favoriteIds.includes(id) ? favoriteIds.filter(value => value !== id) : [...favoriteIds, id];
      setPreferences(await patch("/preferences/", { recruiterFavoriteCandidates: next }));
    } finally { setSavingFavorite(false); }
  });

  const candidates = useResource("/candidats/", candidatesAdapter)[0];

  

  

  const colorStyles = {
    blue: {
      avatar: "bg-blue-100 text-blue-700",
      icon: "bg-blue-50 text-blue-600",
      border: "hover:border-blue-300",
      badge: "bg-blue-50 text-blue-700",
      accent: "bg-blue-600",
    },
    violet: {
      avatar: "bg-violet-100 text-violet-700",
      icon: "bg-violet-50 text-violet-600",
      border: "hover:border-violet-300",
      badge: "bg-violet-50 text-violet-700",
      accent: "bg-violet-600",
    },
    cyan: {
      avatar: "bg-cyan-100 text-cyan-700",
      icon: "bg-cyan-50 text-cyan-600",
      border: "hover:border-cyan-300",
      badge: "bg-cyan-50 text-cyan-700",
      accent: "bg-cyan-600",
    },
    orange: {
      avatar: "bg-orange-100 text-orange-700",
      icon: "bg-orange-50 text-orange-600",
      border: "hover:border-orange-300",
      badge: "bg-orange-50 text-orange-700",
      accent: "bg-orange-500",
    },
    emerald: {
      avatar: "bg-emerald-100 text-emerald-700",
      icon: "bg-emerald-50 text-emerald-600",
      border: "hover:border-emerald-300",
      badge: "bg-emerald-50 text-emerald-700",
      accent: "bg-emerald-500",
    },
  };

  const filteredCandidates = useMemo(() => {
    const query = search.toLowerCase().trim();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.title.toLowerCase().includes(query) ||
        candidate.location.toLowerCase().includes(query) ||
        candidate.skills.some((skill) =>
          skill.toLowerCase().includes(query)
        );

      const matchesMainFilter =
        activeFilter === "Tous" ||
        (activeFilter === "Favoris" ? favoriteIds.includes(candidate.id) : candidate.availability === activeFilter);

      const matchesExperience =
        filters.experience === "Toutes" ||
        candidate.level === filters.experience;

      const matchesLocation =
        filters.location === "Toutes" ||
        candidate.location.includes(filters.location);

      const matchesAvailability =
        filters.availability === "Toutes" ||
        candidate.availability === filters.availability;

      const matchesContract =
        filters.contract === "Tous" ||
        candidate.contract === filters.contract;

      return (
        matchesSearch &&
        matchesMainFilter &&
        matchesExperience &&
        matchesLocation &&
        matchesAvailability &&
        matchesContract
      );
    });
  }, [candidates,search, activeFilter, filters, preferences]);

  const resetFilters = () => {
    setFilters({
      experience: "Toutes",
      location: "Toutes",
      availability: "Toutes",
      contract: "Tous",
    });
    setActiveFilter("Tous");
    setSearch("");
  };

  const viewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const openCandidatePage = (candidate) => {
    onNavigate?.(
      "recruiter-candidate-detail",
      candidate.id
    );
  };

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

        

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <main className="px-4 pb-28 pt-6 sm:px-7 sm:pt-8 lg:px-9 lg:pb-10">

          {/* HERO */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-9">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur">

                  <Sparkles size={13} className="text-cyan-300" />

                  <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-100">
                    Talent Search
                  </span>

                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-[40px]">

                  Trouvez les talents
                  <br />

                  <span className="text-cyan-300">
                    dont votre équipe a besoin.
                  </span>

                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/80 sm:text-base">
                  Explorez les profils disponibles sur JobConnect,
                  recherchez des compétences précises et identifiez
                  rapidement les candidats correspondant à vos besoins.
                </p>

              </div>

              <div className="hidden shrink-0 lg:block">

                <div className="relative flex h-40 w-48 items-center justify-center">

                  <div className="absolute h-36 w-36 rounded-full border border-white/10" />

                  <div className="absolute h-24 w-24 rounded-full border border-white/10" />

                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-cyan-200 shadow-2xl backdrop-blur-md">
                    <Users size={34} />
                  </div>

                  <div className="absolute right-0 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/30 backdrop-blur">
                    <Star size={17} />
                  </div>

                  <div className="absolute bottom-2 left-0 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/20 backdrop-blur">
                    <FileSearch size={17} />
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* STATS */}

          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <CVStat
              icon={<Users size={22} />}
              label="Profils disponibles"
              value={candidates.length}
              color="blue"
            />

            <CVStat
              icon={<CheckCircle2 size={22} />}
              label="Profils vérifiés"
              value={
                candidates.filter(
                  (candidate) => candidate.verified
                ).length
              }
              color="emerald"
            />

            <CVStat
              icon={<Sparkles size={22} />}
              label="Profils disponibles"
              value={
                candidates.filter(
                  (candidate) =>
                    candidate.availability ===
                    "Disponible"
                ).length
              }
              color="violet"
            />

            <CVStat
              icon={<BriefcaseBusiness size={22} />}
              label="Domaines représentés"
              value="6+"
              color="orange"
            />

          </section>

          {/* SEARCH */}

          <section className="mt-7 rounded-[24px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

              <div className="flex h-14 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-100">

                <Search
                  size={21}
                  className="shrink-0 text-blue-500"
                />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  type="text"
                  placeholder="Rechercher un candidat, métier, compétence ou localisation..."
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                />

                {search && (
                  <Button aria-label="Fermer"
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-slate-400 transition hover:text-slate-700"
                  >
                    <X size={17} />
                  </Button>
                )}

              </div>

              <Button
                type="button"
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
                className={`flex h-14 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-black transition ${
                  showFilters
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Filter size={18} />
                Filtres
              </Button>

            </div>

            {/* QUICK FILTERS */}

            <div className="mt-5 flex flex-wrap gap-2">

              {[
                "Tous",
                "Favoris",
                "Disponible",
                "En recherche",
              ].map((filter) => (

                <Button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setActiveFilter(filter)
                  }
                  className={`rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                    activeFilter === filter
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {filter}
                </Button>

              ))}

            </div>

            {/* ADVANCED FILTERS */}

            {showFilters && (

              <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">

                <FilterSelect
                  label="Expérience"
                  value={filters.experience}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      experience: value,
                    })
                  }
                  options={[
                    "Toutes",
                    "Débutant",
                    "Intermédiaire",
                    "Senior",
                  ]}
                />

                <FilterSelect
                  label="Localisation"
                  value={filters.location}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      location: value,
                    })
                  }
                  options={[
                    "Toutes",
                    "Yaoundé",
                    "Douala",
                    "Bafoussam",
                  ]}
                />

                <FilterSelect
                  label="Disponibilité"
                  value={filters.availability}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      availability: value,
                    })
                  }
                  options={[
                    "Toutes",
                    "Disponible",
                    "En recherche",
                  ]}
                />

                <FilterSelect
                  label="Type de contrat"
                  value={filters.contract}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      contract: value,
                    })
                  }
                  options={[
                    "Tous",
                    "CDI",
                    "CDD",
                    "Stage",
                    "Freelance",
                  ]}
                />

                <div className="sm:col-span-2 lg:col-span-4">

                  <Button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-black text-blue-600 transition hover:text-blue-800"
                  >
                    Réinitialiser tous les filtres
                  </Button>

                </div>

              </div>

            )}

          </section>

          {/* RESULT HEADER */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Talent pool
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                Profils disponibles
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {filteredCandidates.length} profil
                {filteredCandidates.length > 1
                  ? "s"
                  : ""}{" "}
                correspondant à votre recherche
              </p>

            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">

              <Users
                size={16}
                className="text-blue-600"
              />

              <span className="text-xs font-black text-slate-600">
                {filteredCandidates.length} profils
              </span>

            </div>

          </div>

          {/* CANDIDATE GRID */}

          {filteredCandidates.length > 0 ? (

            <section className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredCandidates.map(
                (candidate, index) => (

                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    favorite={favoriteIds.includes(candidate.id)}
                    onFavorite={() => toggleFavorite(candidate.id)}
                    favoriteDisabled={savingFavorite || preferencesLoading}
                    index={index}
                    styles={
                      colorStyles[
                        candidate.color
                      ]
                    }
                    onView={() =>
                      viewCandidate(
                        candidate
                      )
                    }
                    onProfile={() =>
                      openCandidatePage(
                        candidate
                      )
                    }
                    onCV={() =>
                      alert(
                        `Ouverture du CV de ${candidate.name}`
                      )
                    }
                    onContact={() =>
                      window.open(
                        `mailto:${candidate.email}`
                      )
                    }
                  />

                )
              )}

            </section>

          ) : (

            <section className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <Search size={27} />
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-900">
                Aucun profil trouvé
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Aucun candidat ne correspond aux critères
                sélectionnés. Essayez de modifier votre recherche
                ou vos filtres.
              </p>

              <Button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Réinitialiser la recherche
              </Button>

            </section>

          )}

          {/* AI CTA */}

          <section className="relative mt-8 overflow-hidden rounded-[26px] bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 p-7 text-white shadow-2xl shadow-blue-600/20 sm:p-8">

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Sparkles size={24} />
                </div>

                <div>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider">
                    JobConnect AI
                  </span>

                  <h2 className="mt-3 text-xl font-black sm:text-2xl">
                    Trouvez les meilleurs profils pour une offre
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                    Sélectionnez une offre et laissez notre système
                    analyser les profils afin d'identifier les candidats
                    les plus pertinents.
                  </p>

                </div>

              </div>

              <Button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "recruiter-applications"
                  )
                }
                className="flex shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-xs font-black text-blue-700 transition hover:-translate-y-1 hover:bg-blue-50"
              >
                Utiliser l'ATS
                <ArrowRight size={14} />
              </Button>

            </div>

          </section>

        </main>

      </div>

      {/* =====================================================
          CANDIDATE MODAL
      ===================================================== */}

      {selectedCandidate && (

        <CandidateModal
          candidate={selectedCandidate}
          styles={
            colorStyles[
              selectedCandidate.color
            ]
          }
          onClose={() =>
            setSelectedCandidate(null)
          }
          onProfile={() =>
            openCandidatePage(
              selectedCandidate
            )
          }
        />

      )}

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function CVStat({
  icon,
  label,
  value,
  color,
}) {
  const styles = {
    blue: {
      icon: "bg-blue-100 text-blue-600",
      number: "text-blue-700",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-600",
      number: "text-emerald-700",
    },
    violet: {
      icon: "bg-violet-100 text-violet-600",
      number: "text-violet-700",
    },
    orange: {
      icon: "bg-orange-100 text-orange-600",
      number: "text-orange-700",
    },
  };

  const current = styles[color];

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">

      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-50 transition duration-500 group-hover:scale-150" />

      <div className="relative flex items-center justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${current.icon} transition duration-500 group-hover:scale-110 group-hover:rotate-6`}
        >
          {icon}
        </div>

        <p
          className={`text-3xl font-black ${current.number}`}
        >
          {value}
        </p>

      </div>

      <p className="relative mt-5 text-sm font-bold text-slate-500">
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <Select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      >

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </Select>

    </label>
  );
}

/* =========================================================
   CANDIDATE CARD
========================================================= */

function CandidateCard({
  candidate,
  favorite,
  onFavorite,
  favoriteDisabled,
  index,
  styles,
  onView,
  onProfile,
  onCV,
  onContact,
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${styles.border}`}
      style={{
        animationDelay: `${index * 70}ms`,
      }}
    >

      <div
        className={`absolute left-0 top-0 h-1 w-full ${styles.accent} transition-all duration-500 group-hover:h-1.5`}
      />

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-50 transition duration-700 group-hover:scale-150" />

      <div className="relative">

        {/* TOP */}

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-4">

            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl text-sm font-black shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 ${styles.avatar}`}
            >
              {candidate.initials}
            </div>

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <h3 className="truncate text-base font-black text-slate-950">
                  {candidate.name}
                </h3>

                {candidate.verified && (
                  <CheckCircle2
                    size={15}
                    className="shrink-0 text-blue-500"
                  />
                )}

              </div>

              <p className="mt-1 truncate text-sm font-bold text-blue-600">
                {candidate.title}
              </p>

            </div>

          </div>

          <Button aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"} aria-pressed={favorite} onClick={onFavorite} disabled={favoriteDisabled} className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Star size={18} className={favorite ? "fill-current" : ""} />
          </Button>
          <Button aria-label="Suivant"
            type="button"
            onClick={onView}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
            title="Voir le profil"
          >
            <ChevronRight size={17} />
          </Button>

        </div>

        {/* META */}

        <div className="mt-6 space-y-3">

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">

            <MapPin
              size={16}
              className="text-slate-400"
            />

            {candidate.location}

          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">

            <BriefcaseBusiness
              size={16}
              className="text-slate-400"
            />

            {candidate.experience} d'expérience ·{" "}
            {candidate.level}

          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">

            <GraduationCap
              size={16}
              className="text-slate-400"
            />

            {candidate.education}

          </div>

        </div>

        {/* AVAILABILITY */}

        <div className="mt-5 flex items-center justify-between">

          <span
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ${
              candidate.availability ===
              "Disponible"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {candidate.availability}
          </span>

          <span className="text-xs font-medium text-slate-400">
            Mis à jour {candidate.updated}
          </span>

        </div>

        {/* SKILLS */}

        <div className="mt-5 flex flex-wrap gap-2">

          {candidate.skills
            .slice(0, 4)
            .map((skill) => (

              <span
                key={skill}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-black ${styles.badge}`}
              >
                {skill}
              </span>

            ))}

          {candidate.skills.length > 4 && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-black text-slate-500">
              +{candidate.skills.length - 4}
            </span>
          )}

        </div>

        {/* ACTIONS */}

        <div className="mt-6 grid grid-cols-2 gap-2">

          <Button
            type="button"
            onClick={onView}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <UserRound size={14} />
            Voir le profil
          </Button>

          <Button
            type="button"
            onClick={onCV}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-3 text-xs font-black text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white"
          >
            <FileSearch size={14} />
            Voir le CV
          </Button>

        </div>

        <Button
          type="button"
          onClick={onContact}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <Mail size={14} />
          Contacter le candidat
        </Button>

      </div>

    </article>
  );
}

/* =========================================================
   CANDIDATE MODAL
========================================================= */

function CandidateModal({
  candidate,
  styles,
  onClose,
  onProfile,
}) {
  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5">

      <div className="relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:max-w-3xl sm:rounded-[28px]">

        {/* HEADER */}

        <div className="relative overflow-hidden bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] px-6 py-7 text-white sm:px-8">

          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

          <Button aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={18} />
          </Button>

          <div className="relative flex items-center gap-4">

            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl text-sm font-black ${styles.avatar}`}
            >
              {candidate.initials}
            </div>

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-xl font-black">
                  {candidate.name}
                </h2>

                {candidate.verified && (
                  <CheckCircle2
                    size={17}
                    className="text-cyan-300"
                  />
                )}

              </div>

              <p className="mt-1 text-sm font-bold text-cyan-200">
                {candidate.title}
              </p>

              <div className="mt-2 flex items-center gap-2 text-xs text-blue-100/70">

                <MapPin size={13} />

                {candidate.location}

              </div>

            </div>

          </div>

        </div>

        {/* CONTENT */}

        <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">

          <div className="grid gap-6 lg:grid-cols-[1fr_240px]">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Profil professionnel
              </p>

              <h3 className="mt-2 text-xl font-black text-slate-950">
                Présentation
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {candidate.bio}
              </p>

              {/* SKILLS */}

              <div className="mt-7">

                <h3 className="text-base font-black text-slate-900">
                  Compétences
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">

                  {candidate.skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className={`rounded-lg px-3 py-2 text-xs font-black ${styles.badge}`}
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              </div>

              {/* EXPERIENCE */}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                <InfoBox
                  icon={<BriefcaseBusiness size={16} />}
                  label="Expérience"
                  value={`${candidate.experience} · ${candidate.level}`}
                />

                <InfoBox
                  icon={<GraduationCap size={16} />}
                  label="Formation"
                  value={candidate.education}
                />

                <InfoBox
                  icon={<MapPin size={16} />}
                  label="Localisation"
                  value={candidate.location}
                />

                <InfoBox
                  icon={<BriefcaseBusiness size={16} />}
                  label="Contrat recherché"
                  value={candidate.contract}
                />

              </div>

            </div>

            {/* CONTACT */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Contact
              </p>

              <div className="mt-5 space-y-4">

                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-start gap-3 text-xs font-bold text-slate-600 transition hover:text-blue-600"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Mail size={15} />
                  </span>

                  <span className="break-all pt-2">
                    {candidate.email}
                  </span>

                </a>

                <a
                  href={`tel:${candidate.phone}`}
                  className="flex items-start gap-3 text-xs font-bold text-slate-600 transition hover:text-blue-600"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <Phone size={15} />
                  </span>

                  <span className="pt-2">
                    {candidate.phone}
                  </span>

                </a>

              </div>

              <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">

                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Disponibilité
                </p>

                <p className="mt-2 flex items-center gap-2 text-xs font-black text-emerald-600">

                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  {candidate.availability}

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-white p-5 sm:flex-row sm:justify-end sm:px-8">

          <Button
            type="button"
            onClick={() =>
              window.open(
                `mailto:${candidate.email}`
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <Mail size={15} />
            Contacter
          </Button>

          <Button
            type="button"
            onClick={() =>
              alert(
                `Téléchargement du CV de ${candidate.name}`
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-5 py-3 text-xs font-black text-blue-600 transition hover:bg-blue-600 hover:text-white"
          >
            <Download size={15} />
            Télécharger le CV
          </Button>

          <Button
            type="button"
            onClick={onProfile}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Profil complet
            <ArrowRight size={14} />
          </Button>

        </div>

      </div>

    </ModalFrame>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-blue-600">
        {icon}

        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xs font-black text-slate-700">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */



export default RecruiterCVthequePage;
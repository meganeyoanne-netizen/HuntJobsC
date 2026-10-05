import { api, post, perform } from "../../services/api";
import { SectionHeader } from "../../components/ui";
import { StatCard, EmptyState, ProgressBar, StatusBadge } from "../../components/ui";
import { Button } from "../../components/ui";


import { useResource } from "../../hooks/useResource";
import { jobsAdapter, applicationsAdapter } from "../../services/adapters";


import { ArrowRight, BriefcaseBusiness, ChevronRight, Clock3, Heart, MapPin, Search, Sparkles, Check, CheckCircle2, TrendingUp, UserCheck, Video, FileStack, CalendarCheck2, Compass, Target } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

/* =========================================================
   COMPATIBILITÉ CANDIDAT
   Le score réel reste interne.
   Le candidat ne voit qu'une appréciation qualitative.
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
    wrapper: "border-slate-100 bg-slate-50",
    icon: "bg-slate-100 text-slate-600",
    text: "text-slate-700",
  };
}


/* =========================================================
   DASHBOARD CANDIDAT
========================================================= */

function CandidateDashboardPage({
  user = {
    firstName: "",
    lastName: "",
  },
  onNavigate,
  onLogout,
}) {
  const { t } = useLanguage();
  const firstName = user?.firstName || "Candidat";

  const [stats]=useResource("/dashboard/",v=>v,{});
  const recommendedJobs = useResource("/offres/",jobsAdapter)[0];
  const applications = useResource("/candidatures/",applicationsAdapter)[0];
  const [favorites, setFavorites] = useResource("/favoris/");
  const isFavorite = id => favorites.some(item => (typeof item === "object" ? item.offre?.id || item.offre || item.id : item) === id);
  const toggleFavorite = id => perform(async () => { await post("/favoris/", {offre:id}); setFavorites(await api("/favoris/")); });

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="">
        <main className="min-h-screen">
          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">

            {/* =================================================
                INTRODUCTION
            ================================================= */}

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061a41] via-[#0b2d68] to-blue-600 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
              <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-blue-100">
                      <Sparkles size={12} />
                      Votre espace personnel
                    </div>

                    <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                      Bonjour {firstName}, préparez votre prochaine étape.
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/75">
                      Retrouvez vos candidatures, découvrez de nouvelles opportunités et utilisez nos outils pour préparer votre prochaine étape professionnelle.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => onNavigate?.("candidate-jobs")}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    <Search size={15} />
                    Explorer les offres
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            </section>

            {/* =================================================
                STATISTIQUES (INTERACTIVES)
            ================================================= */}

            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<FileStack size={20} />}
                label="Candidatures"
                value={stats.candidatures || 12}
                detail="Candidatures envoyées"
                onClick={() => onNavigate?.("candidate-applications")}
                tone="blue"
              />

              <StatCard
                icon={<CalendarCheck2 size={20} />}
                label="Entretiens"
                value={stats.entretiens || 4}
                detail="Entretiens programmés"
                onClick={() => onNavigate?.("candidate-applications")}
                tone="emerald"
              />

              <StatCard
                icon={<Compass size={20} />}
                label="Offres recommandées"
                value={stats.offres_actives || 8}
                detail="Opportunités correspondant à votre profil"
                onClick={() => onNavigate?.("candidate-jobs")}
                tone="violet"
              />

              <StatCard
                icon={<TrendingUp size={20} />}
                label="Profil complété"
                value={(user.profil_candidat?.profile_completion || 78) + "%"}
                detail="Complétez vos compétences"
                onClick={() => onNavigate?.("candidate-profile")}
                tone="amber"
              />
            </section>


            {/* =================================================
    CONTENU PRINCIPAL
================================================= */}

<div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">

  {/* =================================================
      COLONNE PRINCIPALE
  ================================================= */}

  <div className="min-w-0">

    {/* =================================================
        OFFRES RECOMMANDÉES
    ================================================= */}

    <section>

      <SectionHeader
        title="Offres recommandées"
        description="Des opportunités sélectionnées selon votre profil."
        action="Voir toutes les offres"
        onClick={() => onNavigate?.("candidate-jobs")}
      />

      <div
        role="region"
        aria-label="Offres recommandées, liste défilante"
        tabIndex={0}
        className="mt-4 grid max-h-[540px] grid-cols-1 gap-5 overflow-y-auto overscroll-contain rounded-2xl p-1 pr-3 sm:grid-cols-2"
        style={{ scrollbarGutter: "stable" }}
      >

        {recommendedJobs.length === 0 && <div className="col-span-full"> <EmptyState icon={Search} title="Votre prochaine opportunité vous attend" description="Explorez les offres disponibles et complétez votre profil pour affiner votre recherche."><Button variant="primary" onClick={() => onNavigate?.("candidate-jobs")}>Rechercher une offre<ArrowRight size={16} /></Button></EmptyState></div>}
        {recommendedJobs.map((job) => {

          const compatibilityStyle =
            getCompatibilityStyle(job.compatibility);

          return (
            <article
              key={job.id}
              className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  {job.logo}
                </div>

                <Button aria-label={isFavorite(job.id) ? "Retirer des favoris" : "Ajouter aux favoris"} aria-pressed={isFavorite(job.id)} onClick={() => toggleFavorite(job.id)}
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                >
                  <Heart size={16} className={isFavorite(job.id) ? "fill-red-500 text-red-500" : ""} />
                </Button>

              </div>

              <div className="mt-5">

                <p className="text-xs font-bold text-slate-400">
                  {job.company}
                </p>

                <h3 className="mt-1 break-words text-lg font-black leading-7 text-slate-900">
                  {job.title}
                </h3>

              </div>

              <div className="mt-4 space-y-2">

                <div className="flex items-start gap-2 break-words text-sm text-slate-600 [&>svg]:shrink-0">
                  <MapPin size={14} />
                  {job.location}
                </div>

                <div className="flex items-start gap-2 break-words text-sm text-slate-600 [&>svg]:shrink-0">
                  <BriefcaseBusiness size={14} />
                  {job.type}
                </div>

              </div>

              {/* COMPATIBILITÉ QUALITATIVE UNIQUEMENT */}

              <div
                className={`mt-5 flex items-center gap-3 rounded-xl border px-3 py-3 ${compatibilityStyle.wrapper}`}
              >

                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${compatibilityStyle.icon}`}
                >
                  <Target size={14} />
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Correspondance avec votre profil
                  </p>

                  <p
                    className={`mt-0.5 break-words text-sm font-bold ${compatibilityStyle.text}`}
                  >
                    {getCompatibilityLabel(job.compatibility)}
                  </p>

                </div>

              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock3 size={12} />
                  {job.time}
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    onNavigate?.(
                      "candidate-job-detail",
                      job.id
                    )
                  }
                  className="flex items-center gap-1 text-xs font-black text-blue-600 transition hover:text-blue-700"
                >
                  Voir l'offre
                  <ArrowRight size={12} />
                </Button>

              </div>

            </article>
          );
        })}

      </div>

    </section>


    {/* =================================================
        MES CANDIDATURES
        Placées directement après les offres
    ================================================= */}

    <section className="mt-8">

      <SectionHeader
        title="Mes candidatures récentes"
        description="Suivez l'évolution de vos candidatures."
        action="Voir mes candidatures"
        onClick={() =>
          onNavigate?.("candidate-applications")
        }
      />

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {applications.length === 0 && <EmptyState icon={BriefcaseBusiness} title="Commencez votre parcours" description="Après votre première candidature, retrouvez ici son statut et les prochaines étapes."><Button variant="secondary" onClick={() => onNavigate?.("candidate-jobs")}>Découvrir les offres</Button></EmptyState>}
        {applications.slice(0, 5).map((application, index) => (

          <ApplicationRow
            key={`${application.company}-${application.title}`}
            application={application}
            onClick={() =>
              onNavigate?.("candidate-applications")
            }
            last={
              index === Math.min(applications.length, 5) - 1
            }
          />

        ))}

      </div>

    </section>

  </div>


  {/* =================================================
      COLONNE DROITE
  ================================================= */}

  <aside className="space-y-5">

    {/* ASSISTANT PROFESSIONNEL */}

    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 p-5 text-white shadow-lg shadow-blue-900/10">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
        <Compass size={19} />
      </div>

      <p className="mt-5 text-sm font-black">
        Votre assistant de carrière
      </p>

      <p className="mt-2 text-xs leading-5 text-blue-100/80">
        Analysez une offre, améliorez votre CV ou préparez votre prochain entretien.
      </p>

      <Button
        type="button"
        onClick={() => onNavigate?.("candidate-ai")}
        className="mt-5 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-xs font-black text-blue-700 transition hover:bg-blue-50"
      >
        Découvrir les outils
        <ArrowRight size={14} />
      </Button>

    </section>


    {/* PROFIL */}

    <section className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
            Votre profil
          </p>

          <h3 className="mt-1 text-sm font-black text-slate-900">
            Profil complété à {user.profil_candidat?.profile_completion || 0} %
          </h3>

        </div>

        <UserCheck
          size={18}
          className="text-blue-600"
        />

      </div>

      <ProgressBar className="mt-4" value={user.profil_candidat?.profile_completion || 0} label="Complétion du profil" />

      <p className="mt-3 text-xs leading-5 text-slate-400">
        Complétez votre profil pour améliorer la pertinence des opportunités proposées.
      </p>

      <Button
        type="button"
        onClick={() => onNavigate?.("candidate-profile")}
        className="mt-4 flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
      >
        Compléter mon profil
        <ArrowRight size={14} />
      </Button>

    </section>


    {/* SIMULATION ENTRETIEN */}

    <section className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-21 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Video size={22} />
        </div>

        <span className="text-xs font-black text-slate-400">
          Préparation personnalisée
        </span>

      </div>

      <h3 className="mt-4 text-sm font-black text-slate-900">
        Simulation d'entretien
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        Entraînez-vous avec une simulation basée sur une offre qui vous intéresse.
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: "100%" }}
        />

      </div>

      <Button
        type="button"
        onClick={() => onNavigate?.("candidate-ai")}
        className="mt-5 flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
      >
        Lancer une simulation
        <ArrowRight size={14} />
      </Button>

    </section>

  </aside>

</div>

            

            {/* =================================================
                TÂCHES PROFIL
            ================================================= */}

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                    Préparez votre candidature
                  </p>

                  <h3 className="mt-1 text-base font-black text-slate-900">
                    Quelques actions pour renforcer votre profil
                  </h3>

                </div>

                <Button
                  type="button"
                  onClick={() => onNavigate?.("candidate-profile")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                >
                  Voir mon profil
                  <ArrowRight size={14} />
                </Button>

              </div>


              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <ProfileTask
                  label="Informations personnelles"
                  completed={Boolean(user.firstName && user.email)}
                />

                <ProfileTask
                  label="Compétences"
                  completed={Boolean(user.profil_candidat?.competences?.length)}
                />

                <ProfileTask
                  label="Expériences professionnelles"
                  completed={Boolean(user.profil_candidat?.experiences?.length)}
                />

                <ProfileTask
                  label="CV principal"
                  completed={false}
                />

              </div>

            </section>

          </div>

        </main>

      </div>


      {/* =====================================================
          NAVIGATION MOBILE
      ===================================================== */}

      

    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */




/* =========================================================
   SECTION HEADER
========================================================= */




/* =========================================================
   APPLICATION ROW
========================================================= */

function ApplicationRow({
  application,
  onClick,
  last,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`group flex w-full flex-col gap-4 p-5 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center ${
        !last
          ? "border-b border-slate-100"
          : ""
      }`}
    >

      <div className="flex min-w-0 flex-1 items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
          {application.company.charAt(0)}
        </div>

        <div className="min-w-0">

          <p className="truncate text-sm font-extrabold text-slate-900">
            {application.title}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {application.company} · {application.date}
          </p>

        </div>

      </div>


      <div className="w-full sm:max-w-[230px]">

        <div className="flex items-center justify-between">

          <StatusBadge status={application.status} />

          <span className="text-xs font-black text-blue-600">
            {application.progress}%
          </span>

        </div>


        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${application.progress}%`,
            }}
          />

        </div>

      </div>


      <ChevronRight
        size={17}
        className="hidden text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600 sm:block"
      />

    </Button>
  );
}


/* =========================================================
   PROFILE TASK
========================================================= */

function ProfileTask({
  label,
  completed,
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
          completed
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white"
        }`}
      >

        {completed && (
          <Check size={14} aria-hidden="true" />
        )}

      </div>

      <span
        className={`text-xs ${
          completed
            ? "font-semibold text-slate-600"
            : "font-medium text-slate-400"
        }`}
      >
        {label}
      </span>

    </div>
  );
}


/* =========================================================
   MOBILE NAV
========================================================= */




export default CandidateDashboardPage;
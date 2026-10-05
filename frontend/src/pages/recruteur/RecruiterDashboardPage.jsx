import { EmptyState } from "../../components/ui";
import { Badge } from "../../components/ui";
import { StatCard as KpiCard } from "../../components/ui";
import { Button } from "../../components/ui";


import { useResource } from "../../hooks/useResource";
import { jobsAdapter, applicationsAdapter, interviewsAdapter } from "../../services/adapters";


import { ArrowRight, BriefcaseBusiness, CalendarDays, ChevronRight, FileSearch, MoreHorizontal, Plus, Sparkles, TrendingUp, Users, Video } from "lucide-react";



function RecruiterDashboardPage({
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

  const recruiterName =
    user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : "Recruteur";

  const [animatedStats, setAnimatedStats] = useResource("/dashboard/",d=>({jobs:d.offres_actives,applications:d.candidatures,profiles:d.candidatures,interviews:d.entretiens}),{jobs:0,applications:0,profiles:0,interviews:0});

  

  const recruitmentJobs = useResource("/offres/recruteur/mes-offres/",jobsAdapter)[0];

  const candidates = useResource("/candidatures/",applicationsAdapter)[0];

  const interviews = useResource("/entretiens/",interviewsAdapter)[0];

  

  

  const publishJob = () => {
    onNavigate?.("recruiter-jobs", {
      openPublish: true,
    });
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

        


        {/* CONTENT */}

        <main className="px-4 pb-28 pt-6 sm:px-7 sm:pt-8 lg:px-9 lg:pb-10">


          {/* =================================================
              HERO
          ================================================= */}

          <section className="group relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-9">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl transition duration-700 group-hover:scale-125" />

            <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />

            <div className="absolute right-8 top-8 hidden h-28 w-28 rounded-full border border-white/10 lg:block" />

            <div className="absolute right-14 top-14 hidden h-16 w-16 rounded-full border border-white/10 lg:block" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

                  <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-100">
                    Activité de recrutement
                  </span>

                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[42px]">

                  Bonjour{" "}
                  <span className="text-cyan-300">
                    {recruiterName.split(" ")[0]}
                  </span>

                  <br />

                  votre équipe avance bien.

                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100/80 sm:text-base">
                  Vous avez actuellement{" "}
                  <strong className="font-black text-white">
                    {candidates.filter(candidate=>candidate.stage === "Candidature reçue").length} candidatures reçues
                  </strong>{" "}
                  à examiner. Retrouvez ici vos offres et vos prochains entretiens.
                </p>

                <Button
                  type="button"
                  onClick={publishJob}
                  className="group mt-7 inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3.5 text-xs font-black text-blue-700 shadow-xl shadow-blue-950/20 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-blue-50"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition group-hover:rotate-90">
                    <Plus size={15} />
                  </span>

                  Publier une offre

                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />

                </Button>

              </div>


              <div className="relative hidden h-44 w-56 shrink-0 lg:block">

                <div className="absolute right-2 top-3 h-36 w-48 rotate-3 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-md transition duration-500 group-hover:rotate-6 group-hover:scale-105">

                  <div className="flex items-center justify-between">

                    <div className="h-7 w-7 rounded-lg bg-cyan-300/20" />

                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  </div>

                  <div className="mt-5 h-2 w-24 rounded-full bg-white/20" />

                  <div className="mt-2 h-2 w-36 rounded-full bg-white/10" />

                  <div className="mt-5 flex gap-2">

                    <div className="h-7 flex-1 rounded-lg bg-white/10" />

                    <div className="h-7 w-12 rounded-lg bg-cyan-300/20" />

                  </div>

                </div>

                <div className="absolute bottom-0 left-1 h-24 w-44 -rotate-6 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-md transition duration-500 group-hover:-translate-x-2">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300/20">
                      <Users size={14} />
                    </div>

                    <div>

                      <div className="h-1.5 w-16 rounded-full bg-white/20" />

                      <div className="mt-2 h-1.5 w-11 rounded-full bg-white/10" />

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              KPI
          ================================================= */}

          <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <KpiCard
              icon={<BriefcaseBusiness size={22} />}
              label="Offres publiées"
              value={animatedStats.jobs}
              detail="Offres actuellement actives"
              color="blue"
              onClick={() =>
                onNavigate?.("recruiter-jobs")
              }
            />

            <KpiCard
              icon={<Users size={22} />}
              label="Candidatures"
              value={animatedStats.applications}
              detail="Candidatures reçues"
              color="violet"
              onClick={() =>
                onNavigate?.(
                  "recruiter-applications"
                )
              }
            />

            <KpiCard
              icon={<FileSearch size={22} />}
              label="Profils consultés"
              value={animatedStats.profiles}
              detail="Profils candidats"
              color="orange"
              onClick={() =>
                onNavigate?.(
                  "recruiter-cvtheque"
                )
              }
            />

            <KpiCard
              icon={<Video size={22} />}
              label="Entretiens"
              value={animatedStats.interviews}
              detail="Entretiens planifiés"
              color="emerald"
              onClick={() =>
                onNavigate?.(
                  "recruiter-interviews"
                )
              }
            />

          </section>


          {/* =================================================
              OFFRES + ENTRETIENS
          ================================================= */}

          <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">


            {/* OFFRES */}

            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-blue-600 shadow-lg shadow-blue-600/40" />

                    <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                      Recrutement
                    </p>

                  </div>

                  <h2 className="mt-2 text-lg font-black text-slate-950 sm:text-xl">
                    Vous recrutez actuellement
                  </h2>

                </div>

                <Button
                  type="button"
                  onClick={() =>
                    onNavigate?.(
                      "recruiter-jobs"
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black text-blue-600 transition hover:bg-blue-50"
                >
                  Voir tout
                  <ArrowRight size={12} />
                </Button>

              </div>


              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">

                {recruitmentJobs.length === 0 && <div className="col-span-full"> <EmptyState title="Lancez votre prochain recrutement" description="Publiez une offre pour recevoir vos premières candidatures."><Button variant="primary" onClick={() => onNavigate?.("recruiter-jobs", {openPublish:true})}>Publier une offre</Button></EmptyState></div>}
                {recruitmentJobs.map(
                  (job, index) => (
                    <RecruitmentJobCard
                      key={job.id}
                      job={job}
                      index={index}
                      onClick={() =>
                        onNavigate?.(
                          "recruiter-jobs",
                          job.id
                        )
                      }
                    />
                  )
                )}

              </div>

            </section>


            {/* CALENDRIER */}

            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

              <div className="border-b border-slate-100 px-6 py-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-black uppercase tracking-[0.17em] text-violet-600">
                      Planning
                    </p>

                    <h2 className="mt-2 text-lg font-black">
                      Entretiens à venir
                    </h2>

                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <CalendarDays size={18} />
                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-6">

                <div className="grid grid-cols-5 gap-2">

                  {Array.from({length:5},(_,offset)=>{const date=new Date();date.setDate(date.getDate()+offset);return [date.toLocaleDateString("fr-FR",{weekday:"short"}),String(date.getDate())];}).map(([day, date], index) => (

                    <div
                      key={day}
                      className={`rounded-xl px-1 py-2.5 text-center ${
                        index === 2
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >

                      <p className="text-xs font-bold">
                        {day}
                      </p>

                      <p className="mt-1 text-sm font-black">
                        {date}
                      </p>

                    </div>

                  ))}

                </div>


                <div className="mt-6 space-y-3">

                  {interviews.length === 0 && <EmptyState title="Votre planning est disponible" description="Planifiez un entretien depuis les candidatures reçues."><Button variant="secondary" onClick={() => onNavigate?.("recruiter-applications")}>Examiner les candidatures</Button></EmptyState>}
                  {interviews.map(
                    (interview, index) => (

                      <Button
                        key={index}
                        type="button"
                        onClick={() =>
                          onNavigate?.(
                            "recruiter-interviews"
                          )
                        }
                        className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50/40 hover:shadow-md"
                      >

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                          <Video size={16} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-xs font-black text-slate-800">
                            {interview.candidate}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {interview.job}
                          </p>

                          <div className="mt-2 flex items-center gap-2">

                            <span className="text-xs font-black text-blue-600">
                              {interview.time}
                            </span>

                            <span className="text-xs text-slate-400">
                              {interview.date}
                            </span>

                          </div>

                        </div>

                        <ChevronRight
                          size={14}
                          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                        />

                      </Button>

                    )
                  )}

                </div>

                <Button
                  type="button"
                  onClick={() =>
                    onNavigate?.(
                      "recruiter-interviews"
                    )
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3.5 text-xs font-black text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
                >
                  Voir le calendrier
                  <ArrowRight size={12} />
                </Button>

              </div>

            </section>

          </div>


          {/* =================================================
              PROGRESSION
          ================================================= */}

          <section className="mt-7 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.17em] text-cyan-600">
                  Suivi
                </p>

                <h2 className="mt-2 text-lg font-black sm:text-xl">
                  Progression des recrutements
                </h2>

              </div>

              <div className="flex items-center gap-2">

                <span className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-black text-emerald-600">
                  <TrendingUp size={11} />
                  Suivi par étape
                </span>

                <Button
                  type="button"
                  onClick={() =>
                    onNavigate?.(
                      "recruiter-applications"
                    )
                  }
                  className="hidden items-center gap-1 rounded-lg px-3 py-2 text-xs font-black text-blue-600 hover:bg-blue-50 sm:flex"
                >
                  Tout afficher
                  <ArrowRight size={12} />
                </Button>

              </div>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full min-w-[720px]">

                <thead>

                  <tr className="bg-slate-50/70">

                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Candidat
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Offre
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Étape
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Progression
                    </th>

                    <th className="w-12 px-4 py-4" />

                  </tr>

                </thead>


                <tbody>
                  {candidates.length === 0 && <tr><td colSpan={5}><EmptyState title="Aucune candidature à suivre" description="Les étapes de recrutement apparaîtront ici après réception de vos candidatures." /></td></tr>}
                  {candidates.map(
                    (candidate, index) => (

                      <tr
                        key={candidate.name}
                        className="group border-t border-slate-100 transition hover:bg-blue-50/30"
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-black ${
                                index % 2 === 0
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-violet-100 text-violet-700"
                              }`}
                            >
                              {candidate.initials}
                            </div>

                            <div>

                              <p className="text-xs font-black text-slate-800">
                                {candidate.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Nouveau profil
                              </p>

                            </div>

                          </div>

                        </td>


                        <td className="px-4 py-5">

                          <p className="max-w-[210px] truncate text-xs font-bold text-slate-600">
                            {candidate.job}
                          </p>

                        </td>


                        <td className="px-4 py-5">

                          <StageBadge
                            stage={candidate.stage}
                            color={
                              candidate.stageColor
                            }
                          />

                        </td>


                        <td className="px-4 py-5"><div className="flex items-center gap-3"><progress className="ui-progress" value={candidate.progress || 0} max="100" aria-label="Progression de la candidature"/><span className="text-xs font-semibold text-slate-500">{candidate.progress || 0}%</span></div></td>


                        <td className="px-4 py-5">

                          <Button aria-label="Afficher les actions"
                            type="button"
                            onClick={() =>
                              onNavigate?.(
                                "recruiter-applications"
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <MoreHorizontal
                              size={16}
                            />
                          </Button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>


          {/* =================================================
              BOTTOM GRID
          ================================================= */}

          <div className="mt-7 grid gap-6 lg:grid-cols-2">


            {/* NOUVEAUX CANDIDATS */}

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                    Activité
                  </p>

                  <h2 className="mt-2 text-lg font-black">
                    Nouveaux candidats
                  </h2>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users size={18} />
                </div>

              </div>


              <div className="mt-6 space-y-2">

                {candidates
                  .slice(0, 4)
                  .map(
                    (
                      candidate,
                      index
                    ) => (

                      <Button
                        key={candidate.name}
                        type="button"
                        onClick={() =>
                          onNavigate?.(
                            "recruiter-applications"
                          )
                        }
                        className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50"
                      >

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-black ${
                            index === 0
                              ? "bg-blue-100 text-blue-700"
                              : index === 1
                              ? "bg-violet-100 text-violet-700"
                              : index === 2
                              ? "bg-cyan-100 text-cyan-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {candidate.initials}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-xs font-black text-slate-800">
                            {candidate.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {candidate.job}
                          </p>

                        </div>

                        <StageBadge
                          stage={candidate.stage}
                          color={
                            candidate.stageColor
                          }
                        />

                        <ChevronRight
                          size={13}
                          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                        />

                      </Button>

                    )
                  )}

              </div>

            </section>


            {/* ATS */}

            <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 p-7 text-white shadow-2xl shadow-blue-600/20">

              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

              <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />

              <div className="relative">

                <div className="flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                    <Sparkles size={21} />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider">
                    JobConnect AI
                  </span>

                </div>


                <h2 className="mt-6 text-xl font-black leading-8 sm:text-2xl">

                  Votre suivi des candidatures
                  <br />

                  <span className="text-cyan-200">
                    {candidates.length} profils disponibles.
                  </span>

                </h2>


                <p className="mt-4 max-w-md text-xs leading-6 text-white/70 sm:text-sm">
                  Consultez les profils reçus et utilisez l’analyse IA pour préparer vos décisions de recrutement.
                </p>


                <div className="mt-6 grid grid-cols-3 gap-2">

                  <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">

                    <p className="text-xl font-black">
                      {candidates.length}
                    </p>

                    <p className="mt-1 text-xs text-white/60">
                      Profils reçus
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">

                    <p className="text-xl font-black">
                      —
                    </p>

                    <p className="mt-1 text-xs text-white/60">
                      Analyse à lancer
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">

                    <p className="text-xl font-black">
                      {candidates.filter(candidate=>candidate.statut === "PRESELECTION").length}
                    </p>

                    <p className="mt-1 text-xs text-white/60">
                      Présélectionnés
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
                  className="mt-6 flex items-center justify-between rounded-xl bg-white px-5 py-3.5 text-xs font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
                >

                  Consulter les profils

                  <ArrowRight size={13} />

                </Button>

              </div>

            </section>

          </div>

        </main>

      </div>


      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      

    </div>
  );
}


/* =========================================================
   KPI CARD
========================================================= */




/* =========================================================
   JOB CARD
========================================================= */

function RecruitmentJobCard({
  job,
  index,
  onClick,
}) {

  const colors = {
    blue: {
      background:
        "from-blue-50 to-white",
      icon:
        "bg-blue-100 text-blue-600",
      progress:
        "bg-blue-600",
      badge:
        "bg-blue-100 text-blue-700",
    },

    violet: {
      background:
        "from-violet-50 to-white",
      icon:
        "bg-violet-100 text-violet-600",
      progress:
        "bg-violet-600",
      badge:
        "bg-violet-100 text-violet-700",
    },

    cyan: {
      background:
        "from-cyan-50 to-white",
      icon:
        "bg-cyan-100 text-cyan-600",
      progress:
        "bg-cyan-600",
      badge:
        "bg-cyan-100 text-cyan-700",
    },

    emerald: {
      background:
        "from-emerald-50 to-white",
      icon:
        "bg-emerald-100 text-emerald-600",
      progress:
        "bg-emerald-600",
      badge:
        "bg-emerald-100 text-emerald-700",
    },
  };

  const current = colors[job.color];

  return (
    <Button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[20px] border border-slate-200 bg-gradient-to-br ${current.background} p-5 text-left transition-all duration-500 hover:-translate-y-1.5 hover:border-transparent hover:shadow-xl hover:shadow-slate-200/70`}
    >

      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/70 transition duration-500 group-hover:scale-150" />

      <div className="relative">

        <div className="flex items-start justify-between">

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${current.icon} transition duration-500 group-hover:rotate-6 group-hover:scale-110`}
          >
            {job.icon}
          </div>

          <span
            className={`rounded-md px-2.5 py-1.5 text-xs font-black ${current.badge}`}
          >
            {job.type}
          </span>

        </div>


        <h3 className="mt-5 truncate text-sm font-black text-slate-900">
          {job.title}
        </h3>


        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">

          <Users size={11} />

          {job.applications} candidatures

        </div>


        <div className="mt-5">

          <div className="flex items-center justify-between">

            <span className="text-xs font-bold text-slate-400">
              Progression
            </span>

            <span className="text-xs font-black text-slate-600">
              {job.progress}%
            </span>

          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/70">

            <div
              className={`h-full rounded-full ${current.progress} transition-all duration-1000 group-hover:w-[95%]`}
              style={{
                width: `${job.progress}%`,
              }}
            />

          </div>

        </div>


        <div className="mt-5 flex items-center justify-between">

          <span className="text-xs font-bold text-emerald-600">
            Offre active
          </span>

          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-300 shadow-sm transition group-hover:bg-slate-900 group-hover:text-white">
            <ArrowRight size={12} />
          </span>

        </div>

      </div>

    </Button>
  );
}


/* =========================================================
   STAGE BADGE
========================================================= */

function StageBadge({stage,color}) { return <Badge tone={color||"blue"}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{stage}</Badge>; }


/* =========================================================
   MOBILE NAV
========================================================= */




export default RecruiterDashboardPage;
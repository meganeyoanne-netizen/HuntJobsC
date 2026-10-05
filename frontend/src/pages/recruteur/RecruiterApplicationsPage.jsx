import { Button, Select, Input, ModalFrame, Textarea } from "../../components/ui";

import { patch, perform, success } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { jobsAdapter, applicationsAdapter, applicationAdapter, statusCode } from "../../services/adapters";

import React, { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Check, ChevronDown, Clock3, Download, FileSearch, Filter, Mail, MapPin, MoreHorizontal, Search, Sparkles, Star, TrendingUp, UserRound, Users, Video, X } from "lucide-react";



function RecruiterApplicationsPage({
  user = {
    firstName: "",
    lastName: "",
    companyName: "JobConnect",
  },
  onNavigate,
  onLogout,
  jobId = null,
}) {
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    "JobConnect";

  const recruiterName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Recruteur";

  /*
   * =========================================================
   * DONNÉES DE DÉMONSTRATION
   * =========================================================
   */

  const jobs = useResource("/offres/recruteur/mes-offres/", jobsAdapter)[0];

  const initialApplications = [];

  /*
   * =========================================================
   * STATES
   * =========================================================
   */

  const [applications, setApplications] = useResource("/candidatures/",applicationsAdapter);

  const [selectedJobId, setSelectedJobId] =
    useState(jobId ? Number(jobId) : null);

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("Tous");

  const [sortBy, setSortBy] =
    useState("recent");

  const [showFilters, setShowFilters] =
    useState(false);

  const [note, setNote] = useState("");

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  

  

  /*
   * =========================================================
   * OFFRE SÉLECTIONNÉE
   * =========================================================
   */

  const selectedJob = jobs.find(
    (job) => job.id === selectedJobId
  );

  /*
   * =========================================================
   * FILTRAGE
   * =========================================================
   */

  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (selectedJobId) {
      result = result.filter(
        (application) =>
          application.jobId === selectedJobId
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((application) => {
        const fullName =
          `${application.firstName} ${application.lastName}`.toLowerCase();

        const job = jobs
          .find(
            (item) =>
              item.id === application.jobId
          )
          ?.title.toLowerCase();

        const skills =
          application.skills.join(" ").toLowerCase();

        return (
          fullName.includes(query) ||
          skills.includes(query) ||
          job?.includes(query)
        );
      });
    }

    if (statusFilter !== "Tous") {
      result = result.filter(
        (application) =>
          application.status === statusFilter
      );
    }

    if (sortBy === "score") {
      result.sort(
        (a, b) => b.score - a.score
      );
    }

    if (sortBy === "recent") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [
    jobs,
    applications,
    selectedJobId,
    search,
    statusFilter,
    sortBy,
  ]);

  /*
   * =========================================================
   * STATISTIQUES
   * =========================================================
   */

  const statistics = useMemo(() => {
    const source = selectedJobId
      ? applications.filter(
          (application) =>
            application.jobId === selectedJobId
        )
      : applications;

    return {
      total: source.length,
      newApplications: source.filter(
        (application) =>
          application.status ===
          "Candidature reçue"
      ).length,
      interviews: source.filter(
        (application) =>
          application.status === "Entretien"
      ).length,
      selected: source.filter(
        (application) =>
          application.status === "Retenu"
      ).length,
    };
  }, [applications, selectedJobId]);

  /*
   * =========================================================
   * JOB HELPERS
   * =========================================================
   */

  const getJob = (id) =>
    jobs.find((job) => job.id === id);

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  const statuses = [
    "Candidature reçue",
    "Présélection",
    "Entretien",
    "Évaluation",
    "Retenu",
    "Refusé",
  ];

  const updateStatus = (applicationId,newStatus) => perform(async () => {const result=applicationAdapter(await patch("/candidatures/"+applicationId+"/",{statut:statusCode(newStatus)}));setApplications(items=>items.map(a=>a.id===applicationId?result:a));setSelectedApplication(result);});

  /*
   * =========================================================
   * NOTE INTERNE
   * =========================================================
   */

  const saveNote = () => perform(async () => {if(!selectedApplication)return;const result=applicationAdapter(await patch("/candidatures/"+selectedApplication.id+"/",{note_interne:note}));setApplications(items=>items.map(a=>a.id===result.id?result:a));setSelectedApplication(result);success("Note enregistrée.");});

  /*
   * =========================================================
   * OPEN APPLICATION
   * =========================================================
   */

  const openApplication = (application) => {
    setSelectedApplication(application);
    setNote(application.note || "");
  };

  /*
   * =========================================================
   * NAVIGATION JOB
   * =========================================================
   */

  const viewJob = (id) => {
    onNavigate?.("recruiter-jobs", id);
  };

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const logout = () => {
    setSelectedApplication(null);
    onLogout?.();
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

            <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="absolute right-8 top-8 hidden h-28 w-28 rounded-full border border-white/10 lg:block" />

            <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur">

                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />

                  <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-100">
                    Gestion des candidatures
                  </span>

                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl">

                  Trouvez vos
                  <br />

                  <span className="text-cyan-300">
                    meilleurs talents.
                  </span>

                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/80 sm:text-base">

                  Analysez les profils, suivez les étapes du recrutement
                  et identifiez rapidement les candidats les plus pertinents
                  grâce à l'ATS JobConnect.

                </p>

              </div>

              <div className="hidden shrink-0 lg:block">

                <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                      <Users size={23} />
                    </div>

                    <div>

                      <p className="text-3xl font-black">
                        {statistics.total}
                      </p>

                      <p className="text-xs font-bold text-blue-100/60">
                        candidatures à traiter
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 h-2 w-48 overflow-hidden rounded-full bg-white/10">

                    <div
                      className="h-full rounded-full bg-cyan-300 transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          statistics.total * 8,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              JOB SELECTOR
          ================================================= */}

          <section className="mt-7 rounded-[24px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                  Postes ouverts
                </p>

                <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                  Candidatures par offre
                </h2>

                <p className="mt-1.5 text-xs text-slate-400 sm:text-sm">
                  Sélectionnez un poste pour afficher uniquement ses candidats.
                </p>

              </div>

              <Button
                type="button"
                onClick={() =>
                  setSelectedJobId(null)
                }
                className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${
                  selectedJobId === null
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Toutes les candidatures
              </Button>

            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {jobs.map((job) => (

                <JobSelectorCard
                  key={job.id}
                  job={job}
                  active={
                    selectedJobId === job.id
                  }
                  onSelect={() =>
                    setSelectedJobId(job.id)
                  }
                  onViewJob={() =>
                    viewJob(job.id)
                  }
                />

              ))}

            </div>

          </section>

          {/* =================================================
              KPI
          ================================================= */}

          <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <ApplicationKpi
              icon={<Users size={23} />}
              label="Total candidatures"
              value={statistics.total}
              detail="Candidatures reçues"
              color="blue"
            />

            <ApplicationKpi
              icon={<Sparkles size={23} />}
              label="Nouvelles candidatures"
              value={statistics.newApplications}
              detail="À examiner"
              color="violet"
            />

            <ApplicationKpi
              icon={<Video size={23} />}
              label="Entretiens"
              value={statistics.interviews}
              detail="Candidats en entretien"
              color="emerald"
            />

            <ApplicationKpi
              icon={<Star size={23} />}
              label="Candidats retenus"
              value={statistics.selected}
              detail="Profils sélectionnés"
              color="orange"
            />

          </section>

          {/* =================================================
              APPLICATIONS
          ================================================= */}

          <section className="mt-7 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

            {/* SECTION HEADER */}

            <div className="border-b border-slate-100 px-5 py-6 sm:px-7">

              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-blue-600 shadow-lg shadow-blue-600/40" />

                    <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                      Candidatures
                    </p>

                  </div>

                  <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                    {selectedJob
                      ? selectedJob.title
                      : "Toutes les candidatures"}
                  </h2>

                  <p className="mt-1.5 text-sm text-slate-400">
                    {filteredApplications.length} profil
                    {filteredApplications.length > 1
                      ? "s"
                      : ""}{" "}
                    affiché
                    {filteredApplications.length > 1
                      ? "s"
                      : ""}
                  </p>

                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <Button
                    type="button"
                    onClick={() =>
                      setShowFilters(
                        !showFilters
                      )
                    }
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition ${
                      showFilters
                        ? "border-blue-200 bg-blue-50 text-blue-600"
                        : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    <Filter size={14} />
                    Filtres
                  </Button>

                  <div className="relative">

                    <Select
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(
                          event.target.value
                        )
                      }
                      className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-xs font-black text-slate-600 outline-none transition hover:border-blue-200 focus:border-blue-400"
                    >
                      <option value="recent">
                        Plus récentes
                      </option>
                      <option value="score">
                        Meilleur score
                      </option>
                    </Select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                  </div>

                </div>

              </div>

              {/* MOBILE SEARCH */}

              <div className="mt-5 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:hidden">

                <Search
                  size={16}
                  className="text-slate-400"
                />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  type="text"
                  placeholder="Rechercher un candidat..."
                  className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
                />

              </div>

              {/* FILTERS */}

              {showFilters && (

                <div className="mt-5 flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-4">

                  {[
                    "Tous",
                    ...statuses,
                  ].map((status) => (

                    <Button
                      key={status}
                      type="button"
                      onClick={() =>
                        setStatusFilter(
                          status
                        )
                      }
                      className={`rounded-xl px-3.5 py-2 text-xs font-black transition ${
                        statusFilter === status
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      {status}
                    </Button>

                  ))}

                </div>

              )}

            </div>

            {/* APPLICATION LIST */}

            <div className="p-5 sm:p-7">

              {filteredApplications.length ===
                0 ? (

                <EmptyApplications
                  onReset={() => {
                    setSearch("");
                    setStatusFilter(
                      "Tous"
                    );
                    setSelectedJobId(null);
                  }}
                />

              ) : (

                <div className="grid gap-5 xl:grid-cols-2">

                  {filteredApplications.map(
                    (
                      application,
                      index
                    ) => (

                      <ApplicationCard
                        key={application.id}
                        application={
                          application
                        }
                        job={getJob(
                          application.jobId
                        )}
                        index={index}
                        onOpen={() =>
                          openApplication(
                            application
                          )
                        }
                        onStatusChange={(
                          status
                        ) =>
                          updateStatus(
                            application.id,
                            status
                          )
                        }
                      />

                    )
                  )}

                </div>

              )}

            </div>

          </section>

        </main>

      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      

      {/* =====================================================
          APPLICATION MODAL
      ===================================================== */}

      {selectedApplication && (

        <ApplicationModal
          application={selectedApplication}
          job={getJob(
            selectedApplication.jobId
          )}
          note={note}
          setNote={setNote}
          statuses={statuses}
          onClose={() =>
            setSelectedApplication(
              null
            )
          }
          onStatusChange={(
            status
          ) =>
            updateStatus(
              selectedApplication.id,
              status
            )
          }
          onSaveNote={saveNote}
          onViewJob={() =>
            viewJob(
              selectedApplication.jobId
            )
          }
          onViewProfile={() =>
            onNavigate?.(
              "recruiter-candidate-detail",
              selectedApplication.candidateId
            )
          }
          onEmail={() =>
            window.open(
              `mailto:${selectedApplication.email}`,
              "_self"
            )
          }
          onVideo={() =>
            onNavigate?.(
              "recruiter-interviews",
              {
                candidateId:
                  selectedApplication.id,
                jobId:
                  selectedApplication.jobId,
              }
            )
          }
        />

      )}

    </div>
  );
}

/* =========================================================
   JOB SELECTOR CARD
========================================================= */

function JobSelectorCard({
  job,
  active,
  onSelect,
  onViewJob,
}) {
  const styles = {
    blue: {
      icon: "bg-blue-100 text-blue-600",
      active:
        "border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-blue-100",
      badge:
        "bg-blue-100 text-blue-700",
    },

    violet: {
      icon: "bg-violet-100 text-violet-600",
      active:
        "border-violet-300 bg-gradient-to-br from-violet-50 to-white shadow-violet-100",
      badge:
        "bg-violet-100 text-violet-700",
    },

    cyan: {
      icon: "bg-cyan-100 text-cyan-600",
      active:
        "border-cyan-300 bg-gradient-to-br from-cyan-50 to-white shadow-cyan-100",
      badge:
        "bg-cyan-100 text-cyan-700",
    },

    emerald: {
      icon: "bg-emerald-100 text-emerald-600",
      active:
        "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white shadow-emerald-100",
      badge:
        "bg-emerald-100 text-emerald-700",
    },
  };

  const current =
    styles[job.color] || styles.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-[20px] border p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
        active
          ? `${current.active} shadow-lg`
          : "border-slate-200 bg-white hover:border-blue-200"
      }`}
    >

      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/70 transition duration-500 group-hover:scale-150" />

      <div className="relative">

        <div className="flex items-start justify-between">

          <Button
            type="button"
            onClick={onSelect}
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${current.icon} transition duration-500 group-hover:scale-110 group-hover:rotate-6`}
          >
            <BriefcaseBusiness
              size={19}
            />
          </Button>

          <span
            className={`rounded-lg px-2.5 py-1.5 text-xs font-black ${current.badge}`}
          >
            {job.type}
          </span>

        </div>

        <Button
          type="button"
          onClick={onSelect}
          className="mt-5 block text-left"
        >

          <h3 className="text-sm font-black text-slate-900">
            {job.title}
          </h3>

          <div className="mt-2 flex items-center gap-2">

            <Users
              size={13}
              className="text-slate-400"
            />

            <span className="text-xs font-bold text-slate-500">
              {job.applications} candidatures
            </span>

          </div>

          <div className="mt-4 flex items-center gap-2">

            <span className="text-xs font-black text-violet-600">
              {job.newApplications} nouvelles
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span className="text-xs text-slate-400">
              Offre active
            </span>

          </div>

        </Button>

        <Button
          type="button"
          onClick={onViewJob}
          className="mt-5 flex items-center gap-1.5 text-xs font-black text-blue-600 transition hover:gap-2.5"
        >
          Voir l'offre
          <ArrowRight size={12} />
        </Button>

      </div>

    </div>
  );
}

/* =========================================================
   KPI
========================================================= */

function ApplicationKpi({
  icon,
  label,
  value,
  detail,
  color,
}) {
  const colors = {
    blue: {
      icon: "bg-blue-100 text-blue-600",
      number: "text-blue-700",
      line: "bg-blue-600",
      glow: "hover:shadow-blue-200/60",
    },

    violet: {
      icon: "bg-violet-100 text-violet-600",
      number: "text-violet-700",
      line: "bg-violet-600",
      glow: "hover:shadow-violet-200/60",
    },

    emerald: {
      icon: "bg-emerald-100 text-emerald-600",
      number: "text-emerald-700",
      line: "bg-emerald-500",
      glow: "hover:shadow-emerald-200/60",
    },

    orange: {
      icon: "bg-orange-100 text-orange-600",
      number: "text-orange-700",
      line: "bg-orange-500",
      glow: "hover:shadow-orange-200/60",
    },
  };

  const current =
    colors[color] || colors.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${current.glow}`}
    >

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-50 transition duration-500 group-hover:scale-150" />

      <div className="relative">

        <div className="flex items-center justify-between">

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${current.icon} transition duration-500 group-hover:scale-110 group-hover:rotate-6`}
          >
            {icon}
          </div>

          <TrendingUp
            size={16}
            className="text-emerald-500 transition group-hover:-translate-y-1"
          />

        </div>

        <p className="mt-6 text-sm font-bold text-slate-400">
          {label}
        </p>

        <p
          className={`mt-1 text-4xl font-black tracking-tight ${current.number}`}
        >
          {value}
        </p>

        <p className="mt-2 text-xs font-medium text-slate-400">
          {detail}
        </p>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">

          <div
            className={`h-full w-[72%] rounded-full ${current.line} transition-all duration-700 group-hover:w-[92%]`}
          />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   APPLICATION CARD
========================================================= */

function ApplicationCard({
  application,
  job,
  index,
  onOpen,
  onStatusChange,
}) {
  const statusStyles = {
    "Candidature reçue":
      "bg-slate-100 text-slate-600",
    Présélection:
      "bg-blue-50 text-blue-600",
    Entretien:
      "bg-emerald-50 text-emerald-600",
    Évaluation:
      "bg-violet-50 text-violet-600",
    Retenu:
      "bg-cyan-50 text-cyan-600",
    Refusé:
      "bg-red-50 text-red-600",
  };

  const avatarStyles = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-cyan-100 text-cyan-700",
    "bg-emerald-100 text-emerald-700",
  ];

  return (
    <article
      className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/30 transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50"
      style={{
        animationDelay: `${index * 70}ms`,
      }}
    >

      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-50/60 opacity-0 blur-2xl transition duration-700 group-hover:opacity-100" />

      <div className="relative">

        {/* TOP */}

        <div className="flex items-start gap-4">

          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-sm ${avatarStyles[index % avatarStyles.length]} transition duration-500 group-hover:scale-110 group-hover:rotate-3`}
          >
            {application.initials}
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <h3 className="text-lg font-black text-slate-950 sm:text-xl">
                  {application.firstName}{" "}
                  {application.lastName}
                </h3>

                <p className="mt-1 text-sm font-bold text-blue-600">
                  {job?.title}
                </p>

              </div>

              <div
                className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black ${
                  statusStyles[
                    application.status
                  ] || statusStyles[
                    "Candidature reçue"
                  ]
                }`}
              >

                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                {application.status}

              </div>

            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">

              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <MapPin size={13} />
                {application.location}
              </span>

              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <CalendarDays size={13} />
                {application.date}
              </span>

              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Clock3 size={13} />
                {application.experience}
              </span>

            </div>

          </div>

        </div>

        {/* SCORE */}

        <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Sparkles size={17} />
              </div>

              <div>

                <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Analyse ATS
                </p>

                <p className="mt-1 text-xs font-bold text-slate-500">
                  Compatibilité avec l'offre
                </p>

              </div>

            </div>

            <div className="text-right">

              <p className="text-2xl font-black text-blue-700">
                {application.score}%
              </p>

              <p className="text-xs font-bold text-emerald-600">
                Très bonne compatibilité
              </p>

            </div>

          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 group-hover:from-violet-600 group-hover:to-blue-500"
              style={{
                width: `${application.score}%`,
              }}
            />

          </div>

        </div>

        {/* SKILLS */}

        <div className="mt-5">

          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Compétences principales
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2">

            {application.skills.map(
              (skill) => (

                <span
                  key={skill}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  {skill}
                </span>

              )
            )}

          </div>

        </div>

        {/* ACTIONS */}

        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">

          <Button
            type="button"
            onClick={onOpen}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
          >
            <UserRound size={14} />
            Voir le profil
          </Button>

          <Button
            type="button"
            onClick={onOpen}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <FileSearch size={14} />
            Voir le CV
          </Button>

          <div className="relative">

            <Select
              value={application.status}
              onChange={(event) =>
                onStatusChange(
                  event.target.value
                )
              }
              className="h-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-9 text-xs font-black text-slate-600 outline-none transition hover:border-blue-200"
            >
              {[
                "Candidature reçue",
                "Présélection",
                "Entretien",
                "Évaluation",
                "Retenu",
                "Refusé",
              ].map((status) => (

                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>

              ))}
            </Select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

          </div>

        </div>

      </div>

    </article>
  );
}

/* =========================================================
   APPLICATION MODAL
========================================================= */

function ApplicationModal({
  application,
  job,
  note,
  setNote,
  statuses,
  onClose,
  onStatusChange,
  onSaveNote,
  onViewJob,
  onViewProfile,
  onEmail,
  onVideo,
}) {
  const currentIndex = Math.max(
    0,
    statuses.indexOf(
      application.status
    )
  );

  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[100] flex items-end justify-center bg-[#06152b]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5">

      <div
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] px-6 py-6 text-white sm:px-8">

          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-lg font-black backdrop-blur">
                {application.initials}
              </div>

              <div>

                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                  Candidature
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {application.firstName}{" "}
                  {application.lastName}
                </h2>

                <p className="mt-1 text-sm font-bold text-cyan-200">
                  {job?.title}
                </p>

              </div>

            </div>

            <Button aria-label="Fermer"
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={18} />
            </Button>

          </div>

        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">

          {/* PROGRESSION */}

          <section>

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                  Parcours candidat
                </p>

                <h3 className="mt-2 text-lg font-black text-slate-950">
                  Progression du recrutement
                </h3>

              </div>

              <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-black text-blue-600">
                {application.status}
              </span>

            </div>

            <div className="mt-6 overflow-x-auto pb-2">

              <div className="flex min-w-[650px] items-start">

                {statuses.map(
                  (status, index) => {

                    const completed =
                      index <=
                      currentIndex;

                    return (
                      <React.Fragment
                        key={status}
                      >

                        <div className="flex flex-1 flex-col items-center">

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-black transition-all duration-500 ${
                              completed
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {completed ? (
                              <Check
                                size={15}
                              />
                            ) : (
                              index + 1
                            )}
                          </div>

                          <p
                            className={`mt-2 text-center text-xs font-black ${
                              completed
                                ? "text-blue-600"
                                : "text-slate-400"
                            }`}
                          >
                            {status}
                          </p>

                        </div>

                        {index <
                          statuses.length -
                            1 && (
                          <div
                            className={`mt-5 h-1 flex-1 rounded-full transition-all duration-500 ${
                              index <
                              currentIndex
                                ? "bg-blue-600"
                                : "bg-slate-100"
                            }`}
                          />
                        )}

                      </React.Fragment>
                    );
                  }
                )}

              </div>

            </div>

          </section>

          {/* INFORMATION GRID */}

          <div className="mt-8 grid gap-5 lg:grid-cols-3">

            {/* PROFIL */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <UserRound size={17} />
                </div>

                <h3 className="text-sm font-black">
                  Profil
                </h3>

              </div>

              <div className="mt-5 space-y-3">

                <InfoRow
                  label="Localisation"
                  value={
                    application.location
                  }
                  icon={<MapPin size={14} />}
                />

                <InfoRow
                  label="Expérience"
                  value={
                    application.experience
                  }
                  icon={<Clock3 size={14} />}
                />

                <InfoRow
                  label="Formation"
                  value={
                    application.education
                  }
                  icon={
                    <FileSearch size={14} />
                  }
                />

                <InfoRow
                  label="Email"
                  value={
                    application.email
                  }
                  icon={<Mail size={14} />}
                />

              </div>

            </div>

            {/* ATS */}

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <Sparkles size={17} />
                  </div>

                  <h3 className="text-sm font-black text-slate-900">
                    Score ATS
                  </h3>

                </div>

                <span className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-blue-600 shadow-sm">
                  Recruteur
                </span>

              </div>

              <div className="mt-6 flex items-end gap-2">

                <span className="text-5xl font-black text-blue-700">
                  {application.score}%
                </span>

              </div>

              <p className="mt-1 text-xs font-bold text-emerald-600">
                Très bonne compatibilité
              </p>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-blue-100">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                  style={{
                    width: `${application.score}%`,
                  }}
                />

              </div>

            </div>

            {/* COMPÉTENCES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Sparkles size={17} />
                </div>

                <h3 className="text-sm font-black">
                  Compétences
                </h3>

              </div>

              <div className="mt-5 flex flex-wrap gap-2">

                {application.skills.map(
                  (skill) => (

                    <span
                      key={skill}
                      className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-black text-violet-700"
                    >
                      {skill}
                    </span>

                  )
                )}

              </div>

            </div>

          </div>

          {/* STATUS */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Modifier le statut
                </p>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  Faites progresser le candidat dans votre processus.
                </p>

              </div>

              <div className="flex flex-wrap gap-2">

                {statuses.map(
                  (status) => (

                    <Button
                      key={status}
                      type="button"
                      onClick={() =>
                        onStatusChange(
                          status
                        )
                      }
                      className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                        application.status ===
                        status
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      {status}
                    </Button>

                  )
                )}

              </div>

            </div>

          </section>

          {/* NOTE */}

          <section className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <MoreHorizontal size={17} />
              </div>

              <div>

                <h3 className="text-sm font-black">
                  Note interne
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Cette note est visible uniquement par votre équipe.
                </p>

              </div>

            </div>

            <Textarea
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Ajouter une remarque sur ce candidat..."
              className="mt-4 w-full resize-none rounded-xl border border-amber-100 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            />

            <Button
              type="button"
              onClick={onSaveNote}
              className="mt-3 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-600"
            >
              Enregistrer la note
            </Button>

          </section>

        </div>

        {/* FOOTER */}

        <div className="border-t border-slate-100 bg-white p-5 sm:p-6">

          <div className="flex flex-wrap gap-2">

            <Button
              type="button"
              onClick={onViewProfile}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <UserRound size={14} />
              Voir le profil
            </Button>

            <Button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Download size={14} />
              Télécharger le CV
            </Button>

            <Button
              type="button"
              onClick={onEmail}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <Mail size={14} />
              Contacter
            </Button>

            <Button
              type="button"
              onClick={onVideo}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <Video size={14} />
              Proposer une visioconférence
            </Button>

            <Button
              type="button"
              onClick={onViewJob}
              className="ml-auto flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
            >
              Voir l'offre
              <ArrowRight size={13} />
            </Button>

          </div>

        </div>

      </div>

    </ModalFrame>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
  icon,
}) {
  return (
    <div className="flex items-start gap-2.5">

      <span className="mt-0.5 text-slate-400">
        {icon}
      </span>

      <div className="min-w-0">

        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-xs font-black text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyApplications({
  onReset,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
        <Search size={24} />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-900">
        Aucune candidature trouvée
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        Aucun candidat ne correspond actuellement à vos critères de recherche ou de filtrage.
      </p>

      <Button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
      >
        Réinitialiser les filtres
      </Button>

    </div>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */



export default RecruiterApplicationsPage;
import { Button, Input, ModalFrame } from "../../components/ui";
import { useEffect } from "react";
import { patch, perform } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { candidateAdapter, statusCode } from "../../services/adapters";
import { LoadingPanel } from "../../components/common/ApiFeedback";
import React, { useState } from "react";
import { BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight, Download, FileSearch, GraduationCap, Mail, MapPin, Phone, Send, Sparkles, Star, UserRound, Video, X, Clock3, ExternalLink, Award, Languages } from "lucide-react";



function RecruiterCandidateProfilePage({
  candidateId = 1,
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

  /*
   * ==========================================================
   * DONNÉES DE DÉMONSTRATION
   * ==========================================================
   *
   * Plus tard ces données viendront de Django/API.
   *
   * candidateId permet de conserver le candidat sélectionné
   * depuis RecruiterApplicationsPage.
   */

  const candidate = useResource("/candidats/"+candidateId+"/",c=>{const v=candidateAdapter(c);return {...v,summary:v.bio,experience:v.experiences,certifications:c.profil?.certifications||[],job:v.applications[0]?.job||"",jobId:v.applications[0]?.jobId,applicationDate:v.applications[0]?.date,statusColor:"blue"};},null)[0];

  const [currentStatus, setCurrentStatus] = useState("");

  const [showStatusModal, setShowStatusModal] =
    useState(false);

  const [showContactModal, setShowContactModal] =
    useState(false);

  const [showInterviewModal, setShowInterviewModal] =
    useState(false);

  const [note, setNote] = useState("");

  const [internalNotes, setInternalNotes] = useState([]);

  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  useEffect(()=>{if(candidate){setCurrentStatus(candidate.status);setInternalNotes(candidate.applications[0]?.note?[{author:recruiterName,text:candidate.applications[0].note,date:"Note enregistrée"}]:[]);}},[candidate,recruiterName]);
  const goBack = () => {
    onNavigate?.("recruiter-applications");
  };

  const goToJob = () => {
    onNavigate?.(
      "recruiter-job-detail",
      candidate.jobId || 1
    );
  };

  /*
   * ==========================================================
   * STATUT
   * ==========================================================
   */

  const statuses = [
    {
      label: "Candidature reçue",
      color: "slate",
    },
    {
      label: "Présélection",
      color: "blue",
    },
    {
      label: "Entretien",
      color: "violet",
    },
    {
      label: "Évaluation",
      color: "amber",
    },
    {
      label: "Retenu",
      color: "emerald",
    },
    {
      label: "Refusé",
      color: "red",
    },
  ];

  const changeStatus = (status) => perform(async () => {const app=candidate.applications[0];if(!app)throw Error("Aucune candidature associée.");await patch("/candidatures/"+app.id+"/",{statut:statusCode(status)});setCurrentStatus(status);setShowStatusModal(false);});

  /*
   * ==========================================================
   * NOTE INTERNE
   * ==========================================================
   */

  const addNote = () => perform(async () => {const app=candidate.applications[0];if(!app)throw Error("Aucune candidature associée.");if(!note.trim())return;const text=[...internalNotes.map(n=>n.text),note.trim()].join("\n");await patch("/candidatures/"+app.id+"/",{note_interne:text});setInternalNotes([{author:recruiterName,text,date:"Note enregistrée"}]);setNote("");});

  /*
   * ==========================================================
   * NAVIGATION SIDEBAR
   * ==========================================================
   */

  

  

  if(!candidate)return <LoadingPanel />;
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
              HERO CANDIDAT
          ================================================= */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-6 text-white shadow-2xl shadow-blue-900/20 sm:p-8">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="absolute -bottom-28 right-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative z-10">

              <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                  {/* AVATAR */}

                  <div className="relative">

                    <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-cyan-300 via-blue-400 to-violet-500 text-3xl font-black text-white shadow-2xl shadow-blue-950/40 ring-4 ring-white/10 sm:h-32 sm:w-32 sm:text-4xl">

                      {candidate.initials}

                    </div>

                    <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#123c88] bg-emerald-500 text-white shadow-lg">
                      <CheckCircle2 size={16} />
                    </span>

                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-100 backdrop-blur">
                        Candidat
                      </span>

                      <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-black text-emerald-200">
                        Profil complet
                      </span>

                    </div>

                    <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                      {candidate.firstName}{" "}
                      {candidate.lastName}
                    </h2>

                    <p className="mt-2 text-base font-bold text-cyan-200 sm:text-lg">
                      {candidate.job}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-blue-100/75">

                      <span className="flex items-center gap-2">
                        <MapPin size={14} />
                        {candidate.location}
                      </span>

                      <span className="flex items-center gap-2">
                        <Clock3 size={14} />
                        {candidate.availability}
                      </span>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-2">

                  <Button
                    type="button"
                    onClick={() =>
                      setShowContactModal(true)
                    }
                    className="group flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-blue-700 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50"
                  >
                    <Mail size={15} />
                    Contacter
                  </Button>

                  <Button
                    type="button"
                    onClick={() =>
                      onNavigate?.("recruiter-interviews")
                    }
                    className="group flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black text-white backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/20"
                  >
                    <Video size={15} />
                    Visioconférence
                  </Button>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              CANDIDATURE / ATS
          ================================================= */}

          <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">

            {/* CANDIDATURE */}

            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

              <div className="border-b border-slate-100 px-6 py-6">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div>

                    <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                      Candidature
                    </p>

                    <h2 className="mt-2 text-xl font-black text-slate-950">
                      {candidate.job}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Candidature déposée le{" "}
                      <strong className="font-black text-slate-700">
                        {candidate.applicationDate}
                      </strong>
                    </p>

                  </div>

                  <StageBadgeLarge
                    stage={currentStatus}
                  />

                </div>

              </div>

              <div className="p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm font-black text-slate-800">
                      Progression de la candidature
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Étape actuelle :{" "}
                      <strong className="text-blue-600">
                        {currentStatus}
                      </strong>
                    </p>

                  </div>

                  <Button
                    type="button"
                    onClick={() =>
                      setShowStatusModal(true)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700"
                  >
                    Modifier le statut
                    <ChevronRight size={14} />
                  </Button>

                </div>

                {/* TIMELINE */}

                <div className="mt-8 overflow-x-auto pb-2">

                  <div className="flex min-w-[700px] items-start">

                    {statuses
                      .filter(
                        (status) =>
                          status.label !==
                          "Refusé"
                      )
                      .map(
                        (status, index) => {

                          const active =
                            status.label ===
                            currentStatus;

                          const currentIndex =
                            statuses.findIndex(
                              (item) =>
                                item.label ===
                                currentStatus
                            );

                          const completed =
                            index <
                            currentIndex;

                          return (
                            <React.Fragment
                              key={status.label}
                            >

                              <div className="flex flex-1 flex-col items-center text-center">

                                <div
                                  className={`flex h-11 w-11 items-center justify-center rounded-full border-4 transition-all duration-500 ${
                                    active
                                      ? "border-blue-100 bg-blue-600 text-white shadow-xl shadow-blue-600/30"
                                      : completed
                                      ? "border-emerald-100 bg-emerald-500 text-white"
                                      : "border-slate-100 bg-slate-50 text-slate-300"
                                  }`}
                                >
                                  {completed ? (
                                    <CheckCircle2
                                      size={17}
                                    />
                                  ) : (
                                    <span className="text-xs font-black">
                                      {index + 1}
                                    </span>
                                  )}
                                </div>

                                <p
                                  className={`mt-3 text-xs font-black ${
                                    active
                                      ? "text-blue-700"
                                      : completed
                                      ? "text-emerald-600"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {status.label}
                                </p>

                              </div>

                              {index <
                                4 && (
                                <div
                                  className={`mt-5 h-1 flex-1 rounded-full ${
                                    completed
                                      ? "bg-emerald-500"
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

              </div>

            </div>

            {/* ATS */}

            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 p-6 text-white shadow-2xl shadow-blue-600/20">

              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

              <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />

              <div className="relative">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                    <Sparkles size={20} />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider">
                    JobConnect AI
                  </span>

                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                  Compatibilité ATS
                </p>

                <div className="mt-2 flex items-end gap-2">

                  <span className="text-5xl font-black tracking-tight">
                    {candidate.compatibility}%
                  </span>

                  <span className="mb-2 text-xs font-bold text-white/60">
                    match
                  </span>

                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15">

                  <div
                    className="h-full rounded-full bg-cyan-300 transition-all duration-1000"
                    style={{
                      width: `${candidate.compatibility}%`,
                    }}
                  />

                </div>

                <p className="mt-4 text-xs leading-6 text-white/70">
                  Très bonne correspondance avec les critères de l'offre.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2">

                  <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">

                    <p className="text-lg font-black">
                      8
                    </p>

                    <p className="mt-1 text-xs text-white/60">
                      Compétences détectées
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">

                    <p className="text-lg font-black">
                      2
                    </p>

                    <p className="mt-1 text-xs text-white/60">
                      Expériences
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              GRID PROFIL
          ================================================= */}

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">

            {/* COLONNE PRINCIPALE */}

            <div className="space-y-6">

              {/* À PROPOS */}

              <ProfileSection
                icon={<UserRound size={19} />}
                title="À propos du candidat"
                label="Profil"
                color="blue"
              >

                <p className="text-sm font-medium leading-7 text-slate-600 sm:text-base">
                  {candidate.summary}
                </p>

              </ProfileSection>

              {/* COMPÉTENCES */}

              <ProfileSection
                icon={<Sparkles size={19} />}
                title="Compétences principales"
                label="Expertise"
                color="violet"
              >

                <div className="flex flex-wrap gap-2.5">

                  {candidate.skills.map(
                    (skill, index) => (
                      <span
                        key={skill}
                        className={`rounded-xl px-3.5 py-2.5 text-xs font-black transition-all duration-300 hover:-translate-y-1 ${
                          index % 4 === 0
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : index % 4 === 1
                            ? "bg-violet-50 text-violet-700 hover:bg-violet-100"
                            : index % 4 === 2
                            ? "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              </ProfileSection>

              {/* EXPÉRIENCE */}

              <ProfileSection
                icon={<BriefcaseBusiness size={19} />}
                title="Expérience professionnelle"
                label="Parcours"
                color="orange"
              >

                <div className="space-y-6">

                  {candidate.experience.map(
                    (experience, index) => (

                      <div
                        key={`${experience.role}-${index}`}
                        className="relative flex gap-4"
                      >

                        <div className="relative">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <BriefcaseBusiness
                              size={18}
                            />
                          </div>

                          {index <
                            candidate
                              .experience
                              .length -
                              1 && (
                            <div className="absolute left-1/2 top-12 h-[calc(100%+8px)] w-px -translate-x-1/2 bg-slate-200" />
                          )}

                        </div>

                        <div className="flex-1">

                          <div className="flex flex-col justify-between gap-1 sm:flex-row">

                            <div>

                              <h3 className="text-base font-black text-slate-900">
                                {experience.role}
                              </h3>

                              <p className="mt-1 text-sm font-bold text-orange-600">
                                {experience.company}
                              </p>

                            </div>

                            <span className="text-xs font-black text-slate-400">
                              {experience.period}
                            </span>

                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-500">
                            {experience.description}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </ProfileSection>

              {/* FORMATION */}

              <ProfileSection
                icon={<GraduationCap size={19} />}
                title="Formation"
                label="Études"
                color="emerald"
              >

                <div className="grid gap-4 md:grid-cols-2">

                  {candidate.education.map(
                    (education) => (

                      <div
                        key={education.diploma}
                        className="rounded-2xl border border-slate-100 bg-gradient-to-br from-emerald-50/80 to-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <GraduationCap
                              size={18}
                            />
                          </div>

                          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-black text-slate-400 shadow-sm">
                            {education.period}
                          </span>

                        </div>

                        <h3 className="mt-5 text-sm font-black text-slate-900">
                          {education.diploma}
                        </h3>

                        <p className="mt-2 text-xs font-bold text-emerald-600">
                          {education.school}
                        </p>

                      </div>

                    )
                  )}

                </div>

              </ProfileSection>

            </div>

            {/* SIDEBAR PROFIL */}

            <div className="space-y-6">

              {/* CONTACT */}

              <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

                <div className="border-b border-slate-100 px-6 py-5">

                  <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                    Informations
                  </p>

                  <h2 className="mt-2 text-lg font-black">
                    Coordonnées
                  </h2>

                </div>

                <div className="space-y-2 p-5">

                  <ContactItem
                    icon={<Mail size={16} />}
                    label="Email"
                    value={candidate.email}
                  />

                  <ContactItem
                    icon={<Phone size={16} />}
                    label="Téléphone"
                    value={candidate.phone}
                  />

                  <ContactItem
                    icon={<MapPin size={16} />}
                    label="Localisation"
                    value={candidate.location}
                  />

                </div>

              </section>

              {/* CV */}

              <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/20">

                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                      <FileSearch size={20} />
                    </div>

                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black uppercase">
                      PDF
                    </span>

                  </div>

                  <h2 className="mt-5 text-lg font-black">
                    CV du candidat
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-white/70">
                    Consultez ou téléchargez le CV utilisé pour cette candidature.
                  </p>

                  <Button
                    type="button"
                    className="mt-5 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3.5 text-xs font-black text-blue-700 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50"
                  >

                    Voir le CV

                    <ExternalLink size={14} />

                  </Button>

                  <Button
                    type="button"
                    className="mt-2 flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3.5 text-xs font-black text-white transition hover:bg-white/20"
                  >

                    Télécharger

                    <Download size={14} />

                  </Button>

                </div>

              </section>

              {/* LANGUES */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Languages size={18} />
                  </div>

                  <div>

                    <p className="text-xs font-black uppercase tracking-wider text-cyan-600">
                      Communication
                    </p>

                    <h2 className="mt-1 text-base font-black">
                      Langues
                    </h2>

                  </div>

                </div>

                <div className="mt-5 space-y-3">

                  {candidate.languages.map(
                    (language) => (

                      <div
                        key={language.name}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                      >

                        <span className="text-sm font-black text-slate-700">
                          {language.name}
                        </span>

                        <span className="text-xs font-bold text-slate-400">
                          {language.level}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </section>

              {/* CERTIFICATIONS */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Award size={18} />
                  </div>

                  <div>

                    <p className="text-xs font-black uppercase tracking-wider text-amber-600">
                      Certifications
                    </p>

                    <h2 className="mt-1 text-base font-black">
                      Certifications
                    </h2>

                  </div>

                </div>

                <div className="mt-5 space-y-2">

                  {candidate.certifications.map(
                    (certification) => (

                      <div
                        key={certification}
                        className="flex items-center gap-3 rounded-xl bg-amber-50/70 p-3"
                      >

                        <CheckCircle2
                          size={15}
                          className="shrink-0 text-amber-600"
                        />

                        <span className="text-xs font-bold text-slate-700">
                          {certification}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </section>

            </div>

          </div>

          {/* =================================================
              NOTES INTERNES
          ================================================= */}

          <section className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

            <div className="border-b border-slate-100 px-6 py-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.17em] text-violet-600">
                    Recrutement
                  </p>

                  <h2 className="mt-2 text-lg font-black sm:text-xl">
                    Notes internes
                  </h2>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Star size={18} />
                </div>

              </div>

            </div>

            <div className="p-6">

              <div className="space-y-3">

                {internalNotes.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-violet-100 hover:bg-violet-50/30"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <span className="text-xs font-black text-slate-800">
                          {item.author}
                        </span>

                        <span className="text-xs font-bold text-slate-400">
                          {item.date}
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.text}
                      </p>

                    </div>

                  )
                )}

              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                <Input
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      addNote();
                    }
                  }}
                  type="text"
                  placeholder="Ajouter une note interne..."
                  className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                />

                <Button
                  type="button"
                  onClick={addNote}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-violet-700"
                >
                  <Send size={15} />
                  Ajouter la note
                </Button>

              </div>

            </div>

          </section>

        </main>

      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      

      {/* =====================================================
          MODAL STATUT
      ===================================================== */}

      {showStatusModal && (
        <ModalOverlay
          onClose={() =>
            setShowStatusModal(false)
          }
        >

          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-7">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                  Candidature
                </p>

                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Modifier le statut
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Faites évoluer la candidature de{" "}
                  <strong className="font-black text-slate-700">
                    {candidate.firstName}{" "}
                    {candidate.lastName}
                  </strong>
                  .
                </p>

              </div>

              <Button aria-label="Fermer"
                type="button"
                onClick={() =>
                  setShowStatusModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={16} />
              </Button>

            </div>

            <div className="mt-6 space-y-2">

              {statuses.map((status) => (

                <Button
                  key={status.label}
                  type="button"
                  onClick={() =>
                    changeStatus(status.label)
                  }
                  className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    currentStatus ===
                    status.label
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-100 bg-slate-50 hover:border-blue-100 hover:bg-white"
                  }`}
                >

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      status.label ===
                      "Retenu"
                        ? "bg-emerald-100 text-emerald-600"
                        : status.label ===
                          "Refusé"
                        ? "bg-red-100 text-red-600"
                        : status.label ===
                          "Entretien"
                        ? "bg-violet-100 text-violet-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {status.label ===
                    "Retenu" ? (
                      <CheckCircle2
                        size={18}
                      />
                    ) : status.label ===
                      "Refusé" ? (
                      <X size={18} />
                    ) : (
                      <ChevronRight
                        size={18}
                      />
                    )}
                  </div>

                  <div className="flex-1">

                    <p className="text-sm font-black text-slate-800">
                      {status.label}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {status.label ===
                        "Candidature reçue" &&
                        "Candidature enregistrée sur la plateforme"}
                      {status.label ===
                        "Présélection" &&
                        "Profil retenu pour une analyse approfondie"}
                      {status.label ===
                        "Entretien" &&
                        "Candidat convoqué à un entretien"}
                      {status.label ===
                        "Évaluation" &&
                        "Candidat actuellement en phase d'évaluation"}
                      {status.label ===
                        "Retenu" &&
                        "Candidat retenu pour le poste"}
                      {status.label ===
                        "Refusé" &&
                        "Candidature non retenue"}
                    </p>

                  </div>

                  {currentStatus ===
                    status.label && (
                    <CheckCircle2
                      size={18}
                      className="text-blue-600"
                    />
                  )}

                </Button>

              ))}

            </div>

          </div>

        </ModalOverlay>
      )}

      {/* =====================================================
          MODAL CONTACT
      ===================================================== */}

      {showContactModal && (
        <ModalOverlay
          onClose={() =>
            setShowContactModal(false)
          }
        >

          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-7">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                  Communication
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Contacter le candidat
                </h2>

              </div>

              <Button aria-label="Fermer"
                type="button"
                onClick={() =>
                  setShowContactModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
              >
                <X size={16} />
              </Button>

            </div>

            <div className="mt-6 space-y-3">

              <a
                href={`mailto:${candidate.email}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-blue-50"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Mail size={18} />
                </div>

                <div>

                  <p className="text-sm font-black">
                    Envoyer un email
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {candidate.email}
                  </p>

                </div>

              </a>

              <a
                href={`tel:${candidate.phone}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-100 hover:bg-emerald-50"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Phone size={18} />
                </div>

                <div>

                  <p className="text-sm font-black">
                    Appeler le candidat
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {candidate.phone}
                  </p>

                </div>

              </a>

            </div>

          </div>

        </ModalOverlay>
      )}

      {/* =====================================================
          MODAL VISIO
      ===================================================== */}

      {showInterviewModal && (
        <ModalOverlay
          onClose={() =>
            setShowInterviewModal(false)
          }
        >

          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-7">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.17em] text-violet-600">
                  Entretien
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Programmer un entretien
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  L'entretien sera associé à la candidature de{" "}
                  <strong className="text-slate-700">
                    {candidate.firstName}{" "}
                    {candidate.lastName}
                  </strong>
                  .
                </p>

              </div>

              <Button aria-label="Fermer"
                type="button"
                onClick={() =>
                  setShowInterviewModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
              >
                <X size={16} />
              </Button>

            </div>

            <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <Video size={19} />
                </div>

                <div>

                  <p className="text-sm font-black text-slate-900">
                    Entretien visio
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {candidate.job}
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <label className="block">

                <span className="text-xs font-black text-slate-700">
                  Date
                </span>

                <div className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-slate-200 px-3">

                  <CalendarDays
                    size={16}
                    className="text-slate-400"
                  />

                  <Input
                    type="date"
                    className="w-full bg-transparent text-sm font-medium outline-none"
                  />

                </div>

              </label>

              <label className="block">

                <span className="text-xs font-black text-slate-700">
                  Heure
                </span>

                <div className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-slate-200 px-3">

                  <Clock3
                    size={16}
                    className="text-slate-400"
                  />

                  <Input
                    type="time"
                    className="w-full bg-transparent text-sm font-medium outline-none"
                  />

                </div>

              </label>

            </div>

            <Button
              type="button"
              onClick={() => {
                setShowInterviewModal(false);
                onNavigate?.(
                  "recruiter-interviews"
                );
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-1 hover:bg-violet-700"
            >
              <CalendarDays size={15} />
              Programmer l'entretien
            </Button>

          </div>

        </ModalOverlay>
      )}

    </div>
  );
}

/* =========================================================
   PROFILE SECTION
========================================================= */

function ProfileSection({
  icon,
  title,
  label,
  color,
  children,
}) {
  const styles = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      label: "text-blue-600",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      label: "text-violet-600",
    },
    orange: {
      icon: "bg-orange-50 text-orange-600",
      label: "text-orange-600",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      label: "text-emerald-600",
    },
  };

  const current =
    styles[color] || styles.blue;

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

      <div className="border-b border-slate-100 px-6 py-5">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${current.icon}`}
          >
            {icon}
          </div>

          <div>

            <p
              className={`text-xs font-black uppercase tracking-[0.17em] ${current.label}`}
            >
              {label}
            </p>

            <h2 className="mt-1 text-lg font-black text-slate-950">
              {title}
            </h2>

          </div>

        </div>

      </div>

      <div className="p-6">
        {children}
      </div>

    </section>
  );
}

/* =========================================================
   CONTACT ITEM
========================================================= */

function ContactItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-black text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   STAGE BADGE
========================================================= */

function StageBadgeLarge({
  stage,
}) {
  const config = {
    "Candidature reçue": {
      bg: "bg-slate-100",
      text: "text-slate-600",
      dot: "bg-slate-500",
    },
    Présélection: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      dot: "bg-blue-500",
    },
    Entretien: {
      bg: "bg-violet-50",
      text: "text-violet-600",
      dot: "bg-violet-500",
    },
    Évaluation: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    Retenu: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    Refusé: {
      bg: "bg-red-50",
      text: "text-red-600",
      dot: "bg-red-500",
    },
  };

  const current =
    config[stage] || config.Présélection;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black ${current.bg} ${current.text}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${current.dot}`}
      />
      {stage}
    </span>
  );
}

/* =========================================================
   MODAL OVERLAY
========================================================= */

function ModalOverlay({
  children,
  onClose,
}) {
  return (
    <ModalFrame onClose={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >

      <div
        className="max-h-[90vh] w-full overflow-y-auto"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {children}
      </div>

    </ModalFrame>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */



/* =========================================================
   LAYOUT DASHBOARD ICON
========================================================= */

function LayoutDashboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        width="7"
        height="9"
        x="3"
        y="3"
        rx="1"
      />
      <rect
        width="7"
        height="5"
        x="14"
        y="3"
        rx="1"
      />
      <rect
        width="7"
        height="9"
        x="14"
        y="12"
        rx="1"
      />
      <rect
        width="7"
        height="5"
        x="3"
        y="16"
        rx="1"
      />
    </svg>
  );
}

export default RecruiterCandidateProfilePage;
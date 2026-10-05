import { StatCard } from "../../components/ui";
import { Button, Textarea, ModalFrame } from "../../components/ui";
import { post } from "../../services/api";
import { download } from "../../services/api";

import { adminUser } from "../../services/adminAdapters";

import { patch, perform, success } from "../../services/api";
import { useResource } from "../../hooks/useResource";


import { useState } from "react";
import { Activity, AlertTriangle, ArrowLeft, Ban, Briefcase, CalendarDays, CheckCircle2, ChevronRight, Clock3, Download, Eye, FileText, GraduationCap, Mail, MapPin, Phone, RotateCcw, Send, ShieldAlert, ShieldCheck, User, UserCheck, Users, X } from "lucide-react";



function AdminCandidateDetailPage({
  selectedCandidateId,
  candidateId,
  user = {},
  onNavigate,
  onLogout,
}) {
  const activeCandidateId =
    selectedCandidateId || candidateId || 1;

  /* =========================================================
     DONNÉES TEMPORAIRES
     À CONNECTER PLUS TARD AU BACKEND DJANGO
  ========================================================= */

  const candidatesData = {};

  const [candidate, setCandidate] = useResource("/administration/users/"+activeCandidateId+"/",adminUser,adminUser({id:activeCandidateId,first_name:"",last_name:"",profil:{},entreprise_nom:"",titre:"",is_active:true}));

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("overview");

  const [openModal, setOpenModal] =
    useState(null);

  const [actionMessage, setActionMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigate = (
    destination,
    data = null
  ) => {
    setSidebarOpen(false);

    if (onNavigate) {
      onNavigate(destination, data);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     SUCCESS MESSAGE
  ========================================================= */

  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  const closeModal = () => {
    setOpenModal(null);
    setActionMessage("");
  };

  /* =========================================================
     ACTIONS ADMIN
  ========================================================= */

  const handleSuspend = () => perform(async () => {const result=await patch("/administration/users/"+candidate.id+"/",{is_suspended:true,suspension_reason:actionMessage});setCandidate(adminUser(result));setOpenModal(null);success("Compte mis à jour.");});

  const handleReactivate = () => perform(async () => {const result=await patch("/administration/users/"+candidate.id+"/",{is_suspended:false,suspension_reason:actionMessage});setCandidate(adminUser(result));setOpenModal(null);success("Compte mis à jour.");});

  const handleRequestInformation = () => perform(async () => {await post("/administration/users/"+candidate.id+"/",{action:"request-information",motif:actionMessage});setOpenModal(null);success("Demande envoyée.");});

  /* =========================================================
     STATUS
  ========================================================= */

  const statusConfig = {
    active: {
      label: "Compte actif",

      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",

      icon: (
        <CheckCircle2 size={14} />
      ),
    },

    suspended: {
      label: "Compte suspendu",

      className:
        "border-red-200 bg-red-50 text-red-700",

      icon: <Ban size={14} />,
    },

    pending: {
      label: "En attente",

      className:
        "border-amber-200 bg-amber-50 text-amber-700",

      icon: <Clock3 size={14} />,
    },
  };

  const currentStatus =
    statusConfig[candidate.status] ||
    statusConfig.active;

  /* =========================================================
     APPLICATION STATUS
  ========================================================= */

  const applicationStatus = {
    review: {
      label: "En cours d'étude",

      className:
        "bg-blue-50 text-blue-700",
    },

    interview: {
      label: "Entretien",

      className:
        "bg-violet-50 text-violet-700",
    },

    rejected: {
      label: "Non retenu",

      className:
        "bg-red-50 text-red-700",
    },

    accepted: {
      label: "Retenu",

      className:
        "bg-emerald-50 text-emerald-700",
    },
  };

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const sidebarItems = [
    {
      id: "admin-dashboard",

      label: "Tableau de bord",

      icon: <Activity size={18} />,
    },

    {
      id: "admin-users",

      label: "Utilisateurs",

      icon: <Users size={18} />,

      active: true,
    },

    {
      id: "admin-recruiters",

      label: "Recruteurs",

      icon: <Briefcase size={18} />,
    },

    {
      id: "admin-offers",

      label: "Offres",

      icon: <FileText size={18} />,
    },

    {
      id: "admin-statistics",

      label: "Statistiques",

      icon: <Activity size={18} />,
    },

    {
      id: "admin-settings",

      label: "Paramètres",

      icon: <ShieldCheck size={18} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900">
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="">
        {/* HEADER */}

        

        <main className="px-4 pb-10 pt-6 sm:px-7 lg:px-9">
          {/* SUCCESS */}

          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-emerald-700">
              <CheckCircle2 size={18} />

              <p className="text-xs font-bold">
                {successMessage}
              </p>

              <Button aria-label="Fermer"
                type="button"
                className="ml-auto"
                onClick={() =>
                  setSuccessMessage("")
                }
              >
                <X size={16} />
              </Button>
            </div>
          )}

          {/* BACK */}

          <Button
            type="button"
            onClick={() =>
              navigate("admin-users")
            }
            className="mb-6 flex items-center gap-2 text-xs font-black text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={16} />

            Retour aux utilisateurs
          </Button>

          {/* =================================================
              CANDIDATE HERO
          ================================================= */}

          <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-6 text-white shadow-2xl sm:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 text-3xl font-black backdrop-blur">
                  {candidate.firstName
                    .charAt(0)
                    .toUpperCase()}
                  {candidate.lastName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black sm:text-3xl">
                      {candidate.firstName}{" "}
                      {candidate.lastName}
                    </h2>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${currentStatus.className}`}
                    >
                      {currentStatus.icon}

                      {currentStatus.label}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-blue-100">
                    {candidate.title}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
                      {candidate.experienceLevel}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
                      {candidate.availability}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
                      Profil complété à{" "}
                      {candidate.profileCompleted}%
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-4 text-xs text-blue-100/75">
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} />

                      {candidate.email}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />

                      {candidate.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {candidate.status ===
                "suspended" ? (
                  <Button
                    type="button"
                    onClick={() =>
                      setOpenModal(
                        "reactivate"
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-black text-white"
                  >
                    <RotateCcw size={15} />

                    Réactiver
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() =>
                      setOpenModal(
                        "suspend"
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-xs font-black text-white"
                  >
                    <Ban size={15} />

                    Suspendre
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={() =>
                    setOpenModal(
                      "request"
                    )
                  }
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-black text-white"
                >
                  <Send size={15} />

                  Demander des informations
                </Button>
              </div>
            </div>
          </section>

          {/* =================================================
              TABS
          ================================================= */}

          <div className="mt-8 border-b border-slate-200">
            <div className="flex gap-6 overflow-x-auto">
              <TabButton
                active={
                  activeTab === "overview"
                }
                onClick={() =>
                  setActiveTab("overview")
                }
                label="Vue d'ensemble"
              />

              <TabButton
                active={
                  activeTab ===
                  "applications"
                }
                onClick={() =>
                  setActiveTab(
                    "applications"
                  )
                }
                label="Candidatures"
              />

              <TabButton
                active={
                  activeTab ===
                  "documents"
                }
                onClick={() =>
                  setActiveTab(
                    "documents"
                  )
                }
                label="Documents"
              />

              <TabButton
                active={
                  activeTab ===
                  "interviews"
                }
                onClick={() =>
                  setActiveTab(
                    "interviews"
                  )
                }
                label="Entretiens"
              />

              <TabButton
                active={
                  activeTab ===
                  "administration"
                }
                onClick={() =>
                  setActiveTab(
                    "administration"
                  )
                }
                label="Administration"
              />
            </div>
          </div>

          {/* =================================================
              OVERVIEW
          ================================================= */}

          {activeTab === "overview" && (
            <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <InfoCard
                  title="Informations personnelles"
                  icon={<User size={19} />}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <InfoItem
                      icon={<User size={16} />}
                      label="Nom complet"
                      value={`${candidate.firstName} ${candidate.lastName}`}
                    />

                    <InfoItem
                      icon={<Mail size={16} />}
                      label="Adresse e-mail"
                      value={candidate.email}
                    />

                    <InfoItem
                      icon={<Phone size={16} />}
                      label="Téléphone"
                      value={candidate.phone}
                    />

                    <InfoItem
                      icon={
                        <MapPin size={16} />
                      }
                      label="Localisation"
                      value={
                        candidate.location
                      }
                    />
                  </div>
                </InfoCard>

                <InfoCard
                  title="Formation"
                  icon={
                    <GraduationCap size={19} />
                  }
                >
                  <div className="space-y-4">
                    {candidate.education.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="rounded-2xl bg-slate-50 p-5"
                        >
                          <p className="text-xs font-black text-slate-700">
                            {item.degree}
                          </p>

                          <p className="mt-2 text-xs text-slate-500">
                            {item.school}
                          </p>

                          <p className="mt-2 text-xs font-bold text-blue-600">
                            {item.period}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </InfoCard>

                <InfoCard
                  title="Compétences"
                  icon={
                    <Activity size={19} />
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map(
                      (skill) => (
                        <span
                          key={skill}
                          className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </InfoCard>
              </div>

              <div className="space-y-6">
                <InfoCard
                  title="Compte"
                  icon={
                    <ShieldCheck size={19} />
                  }
                >
                  <div className="space-y-6">
                    <InfoItem
                      icon={
                        <CalendarDays
                          size={16}
                        />
                      }
                      label="Inscription"
                      value={
                        candidate.registeredAt
                      }
                    />

                    <InfoItem
                      icon={
                        <Clock3 size={16} />
                      }
                      label="Dernière connexion"
                      value={
                        candidate.lastLogin
                      }
                    />

                    <InfoItem
                      icon={
                        <UserCheck
                          size={16}
                        />
                      }
                      label="Profil complété"
                      value={`${candidate.profileCompleted}%`}
                    />
                  </div>
                </InfoCard>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                  <StatCard
                    icon={
                      <FileText size={18} />
                    }
                    label="Candidatures"
                    value={
                      candidate.applications
                        .length
                    }
                  />

                  <StatCard
                    icon={
                      <CalendarDays
                        size={18}
                      />
                    }
                    label="Entretiens"
                    value={
                      candidate.interviews
                        .length
                    }
                  />

                  <StatCard
                    icon={
                      <FileText size={18} />
                    }
                    label="Documents"
                    value={
                      candidate.documents
                        .length
                    }
                  />

                  <StatCard
                    icon={
                      <Activity size={18} />
                    }
                    label="Profil"
                    value={`${candidate.profileCompleted}%`}
                  />
                </div>

                {candidate.status ===
                  "suspended" && (
                  <div className="rounded-[24px] border border-red-100 bg-red-50 p-6">
                    <div className="flex items-center gap-3">
                      <ShieldAlert
                        size={20}
                        className="text-red-600"
                      />

                      <h3 className="text-[12px] font-black text-red-700">
                        Compte suspendu
                      </h3>
                    </div>

                    <p className="mt-4 text-xs leading-6 text-red-600">
                      {
                        candidate.suspensionReason
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================
              APPLICATIONS
          ================================================= */}

          {activeTab ===
            "applications" && (
            <div className="mt-7">
              <div className="grid gap-4">
                {candidate.applications.map(
                  (application) => {
                    const status =
                      applicationStatus[
                        application.status
                      ];

                    return (
                      <div
                        key={
                          application.id
                        }
                        className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/30"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <Briefcase
                                size={20}
                              />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-[13px] font-black">
                                  {
                                    application.job
                                  }
                                </h3>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-black ${status.className}`}
                                >
                                  {
                                    status.label
                                  }
                                </span>
                              </div>

                              <p className="mt-2 text-xs font-semibold text-slate-500">
                                {
                                  application.company
                                }
                              </p>

                              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                                <span>
                                  {
                                    application.location
                                  }
                                </span>

                                <span>
                                  {
                                    application.type
                                  }
                                </span>

                                <span>
                                  Postulé le{" "}
                                  {
                                    application.date
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            onClick={() =>
                              navigate(
                                "admin-offer-detail",
                                application.offerId
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            Voir l'offre

                            <ChevronRight
                              size={15}
                            />
                          </Button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* =================================================
              DOCUMENTS
          ================================================= */}

          {activeTab ===
            "documents" && (
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {candidate.documents.map(
                (document) => (
                  <div
                    key={document.id}
                    className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <FileText
                            size={21}
                          />
                        </div>

                        <div>
                          <h3 className="text-xs font-black">
                            {
                              document.name
                            }
                          </h3>

                          <p className="mt-2 text-xs text-slate-400">
                            {
                              document.type
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Ajouté le{" "}
                            {
                              document.date
                            }
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                        Actif
                      </span>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        type="button"
                        onClick={()=>perform(()=>download(document.url,document.name+(document.type==="CV"?".txt":".pdf")))} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-xs font-black text-slate-600"
                      >
                        <Eye size={15} />

                        Voir
                      </Button>

                      <Button
                        type="button"
                        onClick={()=>perform(()=>download(document.url,document.name+(document.type==="CV"?".txt":".pdf")))} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-xs font-black text-white"
                      >
                        <Download
                          size={15}
                        />

                        Télécharger
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* =================================================
              INTERVIEWS
          ================================================= */}

          {activeTab ===
            "interviews" && (
            <div className="mt-7">
              {candidate.interviews
                .length === 0 ? (
                <EmptyState
                  icon={
                    <CalendarDays
                      size={32}
                    />
                  }
                  title="Aucun entretien"
                  description="Ce candidat n'a actuellement aucun entretien enregistré."
                />
              ) : (
                <div className="grid gap-4">
                  {candidate.interviews.map(
                    (interview) => (
                      <div
                        key={interview.id}
                        className="rounded-[24px] border border-slate-200 bg-white p-6"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                              <CalendarDays
                                size={20}
                              />
                            </div>

                            <div>
                              <h3 className="text-[12px] font-black">
                                {
                                  interview.job
                                }
                              </h3>

                              <p className="mt-2 text-xs text-slate-500">
                                {
                                  interview.company
                                }
                              </p>

                              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                                <span>
                                  {
                                    interview.date
                                  }
                                </span>

                                <span>
                                  {
                                    interview.time
                                  }
                                </span>

                                <span>
                                  {
                                    interview.type
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            onClick={() =>
                              navigate(
                                "admin-offer-detail",
                                interview.offerId
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black"
                          >
                            Voir l'offre

                            <ChevronRight
                              size={15}
                            />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* =================================================
              ADMINISTRATION
          ================================================= */}

          {activeTab ===
            "administration" && (
            <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <InfoCard
                title="Historique administratif"
                icon={
                  <ShieldCheck size={19} />
                }
              >
                {candidate.adminHistory
                  .length === 0 ? (
                  <EmptyState
                    icon={
                      <ShieldCheck
                        size={32}
                      />
                    }
                    title="Aucune action"
                    description="Aucune action administrative n'a encore été enregistrée."
                  />
                ) : (
                  <div className="space-y-4">
                    {candidate.adminHistory.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-slate-50 p-5"
                        >
                          <div className="flex justify-between gap-4">
                            <div>
                              <p className="text-xs font-black text-slate-700">
                                {
                                  item.action
                                }
                              </p>

                              <p className="mt-2 text-xs leading-5 text-slate-500">
                                {
                                  item.message
                                }
                              </p>
                            </div>

                            <span className="text-xs text-slate-400">
                              {
                                item.date
                              }
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </InfoCard>

              <div className="h-fit rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  Actions
                </p>

                <h3 className="mt-2 text-xl font-black">
                  Gestion du candidat
                </h3>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Les actions effectuées seront
                  enregistrées dans l'historique
                  administratif.
                </p>

                <div className="mt-6 space-y-3">
                  {candidate.status ===
                  "suspended" ? (
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenModal(
                          "reactivate"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-xs font-black text-white"
                    >
                      <RotateCcw
                        size={15}
                      />

                      Réactiver le compte
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenModal(
                          "suspend"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3.5 text-xs font-black text-white"
                    >
                      <Ban size={15} />

                      Suspendre le compte
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={() =>
                      setOpenModal(
                        "request"
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-xs font-black text-blue-700"
                  >
                    <Send size={15} />

                    Demander des informations
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================
          SUSPEND MODAL
      ===================================================== */}

      {openModal === "suspend" && (
        <Modal
          title="Suspendre le candidat"
          icon={<Ban size={21} />}
          iconClassName="bg-red-50 text-red-600"
          onClose={closeModal}
        >
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle
                size={18}
                className="shrink-0 text-red-600"
              />

              <p className="text-xs leading-5 text-red-700">
                Le candidat ne pourra plus accéder
                aux fonctionnalités de son compte
                tant que la suspension sera active.
              </p>
            </div>
          </div>

          <Textarea
            value={actionMessage}
            onChange={(event) =>
              setActionMessage(
                event.target.value
              )
            }
            placeholder="Indiquez le motif de la suspension..."
            className="mt-5 min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs outline-none focus:border-red-300 focus:bg-white"
          />

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black"
            >
              Annuler
            </Button>

            <Button
              type="button"
              disabled={
                !actionMessage.trim()
              }
              onClick={handleSuspend}
              className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-xs font-black text-white disabled:opacity-50"
            >
              Suspendre
            </Button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          REACTIVATE MODAL
      ===================================================== */}

      {openModal === "reactivate" && (
        <Modal
          title="Réactiver le candidat"
          icon={<RotateCcw size={21} />}
          iconClassName="bg-emerald-50 text-emerald-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Confirmez-vous la réactivation du
            compte de ce candidat ?
          </p>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black"
            >
              Annuler
            </Button>

            <Button
              type="button"
              onClick={handleReactivate}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-black text-white"
            >
              Réactiver
            </Button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          REQUEST INFORMATION MODAL
      ===================================================== */}

      {openModal === "request" && (
        <Modal
          title="Demander des informations"
          icon={<Send size={21} />}
          iconClassName="bg-blue-50 text-blue-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Précisez les informations que
            l'administrateur souhaite demander au
            candidat.
          </p>

          <Textarea
            value={actionMessage}
            onChange={(event) =>
              setActionMessage(
                event.target.value
              )
            }
            placeholder="Écrivez votre demande..."
            className="mt-5 min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs outline-none focus:border-blue-300 focus:bg-white"
          />

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black"
            >
              Annuler
            </Button>

            <Button
              type="button"
              disabled={
                !actionMessage.trim()
              }
              onClick={
                handleRequestInformation
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white disabled:opacity-50"
            >
              <Send size={14} />

              Envoyer
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function TabButton({
  active,
  onClick,
  label,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`relative whitespace-nowrap px-1 pb-4 text-xs font-black ${
        active
          ? "text-blue-600"
          : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {label}

      {active && (
        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600" />
      )}
    </Button>
  );
}



function InfoCard({
  title,
  icon,
  children,
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <h3 className="text-[13px] font-black">
          {title}
        </h3>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <p className="text-xs font-black uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>

      <p className="mt-2 text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="flex justify-center text-slate-300">
        {icon}
      </div>

      <p className="mt-4 text-[12px] font-black text-slate-600">
        {title}
      </p>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Modal({
  title,
  icon,
  iconClassName,
  children,
  onClose,
}) {
  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClassName}`}
            >
              {icon}
            </div>

            <h3 className="text-lg font-black">
              {title}
            </h3>
          </div>

          <Button aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="mt-6">
          {children}
        </div>
      </div>
    </ModalFrame>
  );
}

export default AdminCandidateDetailPage;
import { StatCard } from "../../components/ui";
import { Button, Textarea, ModalFrame } from "../../components/ui";
import { download } from "../../services/api";

import { adminCompany } from "../../services/adminAdapters";

import { post, perform, success } from "../../services/api";
import { useResource } from "../../hooks/useResource";


import { useState } from "react";
import { ArrowLeft, BadgeCheck, Ban, BriefcaseBusiness, Building2, CalendarDays, Check, CheckCircle2, ChevronRight, CircleAlert, Clock3, Eye, FileCheck2, FileText, Globe, Lock, Mail, MapPin, Phone, ShieldAlert, ShieldCheck, User, Users, X, AlertTriangle, CircleHelp, Send, RotateCcw, Activity } from "lucide-react";



function AdminRecruiterDetailPage({
  selectedRecruiterId,
  recruiterId,
  user = {
    firstName: "",
    lastName: "",
    email: "admin@jobconnect.cm",
  },
  onNavigate,
  onLogout,
}) {
  const activeRecruiterId =
    selectedRecruiterId || recruiterId || 1;

  const adminName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Administrateur";

  /*
   * ==========================================================
   * DEMO DATA
   *
   * Plus tard, ces données viendront du backend Django.
   * La structure est déjà pensée pour être remplacée par une
   * requête API selon selectedRecruiterId.
   * ==========================================================
   */

  const initialRecruiters = {};

  const [recruiter, setRecruiter] = useResource("/administration/entreprises/"+activeRecruiterId+"/",adminCompany,adminCompany({id:activeRecruiterId,first_name:"",last_name:"",profil:{},entreprise_nom:"",titre:"",is_active:true}));

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("overview");

  const [openModal, setOpenModal] =
    useState(null);

  const [actionMessage, setActionMessage] =
    useState("");

  const [actionSuccess, setActionSuccess] =
    useState("");

  const [selectedOffer, setSelectedOffer] =
    useState(null);

  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  const navigate = (destination, data = null) => {
    setSidebarOpen(false);

    onNavigate?.(destination, data);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ==========================================================
   * MODALS
   * ==========================================================
   */

  const closeModal = () => {
    setOpenModal(null);
    setActionMessage("");
    setSelectedOffer(null);
  };

  const showSuccess = (message) => {
    setActionSuccess(message);

    setTimeout(() => {
      setActionSuccess("");
    }, 3500);
  };

  /*
   * ==========================================================
   * ACTIONS
   * ==========================================================
   */

  const handleVerify = () => perform(async () => {const result=await post("/administration/entreprises/"+recruiter.id+"/",{action:"verify"});setRecruiter(adminCompany(result));setOpenModal(null);success("Entreprise vérifiée.");});

  const handleRejectVerification = () => perform(async () => {const result=await post("/administration/entreprises/"+recruiter.id+"/",{action:"reject",motif:actionMessage});setRecruiter(adminCompany(result));setOpenModal(null);success("Décision enregistrée.");});

  const handleRequestInformation = () => perform(async () => {const result=await post("/administration/entreprises/"+recruiter.id+"/",{action:"request-information",motif:actionMessage});setRecruiter(adminCompany(result));setOpenModal(null);success("Décision enregistrée.");});

  const handleSuspend = () => perform(async () => {const result=await post("/administration/entreprises/"+recruiter.id+"/",{action:"suspend",motif:actionMessage});setRecruiter(adminCompany(result));setOpenModal(null);success("Décision enregistrée.");});

  const handleReactivate = () => perform(async () => {const result=await post("/administration/entreprises/"+recruiter.id+"/",{action:"reactivate",motif:actionMessage});setRecruiter(adminCompany(result));setOpenModal(null);success("Décision enregistrée.");});

  /*
   * ==========================================================
   * STATUS HELPERS
   * ==========================================================
   */

  const verificationConfig = {
    pending: {
      label: "Vérification en attente",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock3 size={13} />,
    },

    verified: {
      label: "Entreprise vérifiée",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <BadgeCheck size={13} />,
    },

    rejected: {
      label: "Vérification refusée",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: <CircleAlert size={13} />,
    },

    information_requested: {
      label: "Informations demandées",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
      icon: <CircleHelp size={13} />,
    },
  };

  const currentVerification =
    verificationConfig[
      recruiter.verificationStatus
    ] || verificationConfig.pending;

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
    },
    {
      id: "admin-recruiters",
      label: "Recruteurs",
      icon: <Building2 size={18} />,
      active: true,
    },
    {
      id: "admin-offers",
      label: "Offres",
      icon: <BriefcaseBusiness size={18} />,
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
      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="">
        {/* HEADER */}

        

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <main className="px-4 pb-10 pt-6 sm:px-7 lg:px-9">
          {/* SUCCESS MESSAGE */}

          {actionSuccess && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-emerald-700 shadow-sm">
              <CheckCircle2 size={19} />

              <p className="text-xs font-bold">
                {actionSuccess}
              </p>

              <Button aria-label="Fermer"
                type="button"
                onClick={() =>
                  setActionSuccess("")
                }
                className="ml-auto"
              >
                <X size={16} />
              </Button>
            </div>
          )}

          {/* BACK */}

          <Button
            type="button"
            onClick={() =>
              navigate("admin-recruiters")
            }
            className="mb-6 flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />

            Retour aux recruteurs
          </Button>

          {/* ==================================================
              COMPANY HERO
          ================================================== */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-6 text-white shadow-2xl shadow-blue-900/20 sm:p-8">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-2xl font-black text-blue-700 shadow-xl">
                    {recruiter.companyName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black sm:text-3xl">
                        {recruiter.companyName}
                      </h2>

                      {recruiter.verificationStatus ===
                        "verified" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-black text-emerald-200">
                          <BadgeCheck size={13} />

                          ENTREPRISE VÉRIFIÉE
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-blue-100/70">
                      {recruiter.sector}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-blue-100/75">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />

                        {recruiter.location}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} />

                        Inscrit le{" "}
                        {recruiter.registrationDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 xl:items-end">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${
                      currentVerification.className
                    }`}
                  >
                    {currentVerification.icon}

                    {currentVerification.label}
                  </span>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${
                      recruiter.status ===
                      "active"
                        ? "bg-emerald-400/15 text-emerald-200"
                        : "bg-red-400/15 text-red-200"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        recruiter.status ===
                        "active"
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }`}
                    />

                    {recruiter.status ===
                    "active"
                      ? "COMPTE ACTIF"
                      : "COMPTE SUSPENDU"}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="mt-8 flex flex-wrap gap-3">
                {recruiter.verificationStatus !==
                  "verified" &&
                  recruiter.status === "active" && (
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenModal(
                          "verify"
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-blue-700 shadow-lg transition hover:-translate-y-0.5"
                    >
                      <CheckCircle2
                        size={16}
                      />

                      Valider l'entreprise
                    </Button>
                  )}

                {recruiter.verificationStatus !==
                  "verified" &&
                  recruiter.status === "active" && (
                    <>
                      <Button
                        type="button"
                        onClick={() =>
                          setOpenModal(
                            "request"
                          )
                        }
                        className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black text-white backdrop-blur transition hover:bg-white/15"
                      >
                        <Send size={15} />

                        Demander des informations
                      </Button>

                      <Button
                        type="button"
                        onClick={() =>
                          setOpenModal(
                            "reject"
                          )
                        }
                        className="flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-xs font-black text-red-100 transition hover:bg-red-500/20"
                      >
                        <Ban size={15} />

                        Refuser
                      </Button>
                    </>
                  )}

                {recruiter.status ===
                "active" ? (
                  <Button
                    type="button"
                    onClick={() =>
                      setOpenModal("suspend")
                    }
                    className="flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-xs font-black text-red-100 transition hover:bg-red-500/20"
                  >
                    <ShieldAlert size={15} />

                    Suspendre
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() =>
                      setOpenModal(
                        "reactivate"
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-black text-white transition hover:bg-emerald-600"
                  >
                    <RotateCcw size={15} />

                    Réactiver l'entreprise
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* ==================================================
              STATS
          ================================================== */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={
                <BriefcaseBusiness
                  size={19}
                />
              }
              label="Offres publiées"
              value={recruiter.offersCount}
              helper={`${recruiter.activeOffers} actives`}
            />

            <StatCard
              icon={<Users size={19} />}
              label="Candidatures"
              value={recruiter.applicationsCount}
              helper="Toutes les offres"
            />

            <StatCard
              icon={
                <CalendarDays size={19} />
              }
              label="Entretiens"
              value={recruiter.interviewsCount}
              helper="Planifiés et réalisés"
            />

            <StatCard
              icon={
                <Clock3 size={19} />
              }
              label="Dernière activité"
              value="Actif"
              helper={recruiter.lastActivity}
            />
          </section>

          {/* ==================================================
              TABS
          ================================================== */}

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
                  "verification"
                }
                onClick={() =>
                  setActiveTab(
                    "verification"
                  )
                }
                label="Vérification"
              />

              <TabButton
                active={
                  activeTab === "offers"
                }
                onClick={() =>
                  setActiveTab("offers")
                }
                label={`Offres (${recruiter.offersCount})`}
              />
            </div>
          </div>

          {/* ==================================================
              OVERVIEW
          ================================================== */}

          {activeTab === "overview" && (
            <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <InfoCard
                  title="Informations de l'entreprise"
                  icon={
                    <Building2 size={19} />
                  }
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={
                        <Building2 size={16} />
                      }
                      label="Nom légal"
                      value={
                        recruiter.legalName
                      }
                    />

                    <InfoItem
                      icon={
                        <BriefcaseBusiness
                          size={16}
                        />
                      }
                      label="Secteur"
                      value={
                        recruiter.sector
                      }
                    />

                    <InfoItem
                      icon={
                        <Users size={16} />
                      }
                      label="Taille"
                      value={
                        recruiter.employees
                      }
                    />

                    <InfoItem
                      icon={
                        <MapPin size={16} />
                      }
                      label="Adresse"
                      value={
                        recruiter.address
                      }
                    />

                    <InfoItem
                      icon={
                        <Globe size={16} />
                      }
                      label="Site web"
                      value={
                        recruiter.website
                      }
                    />

                    <InfoItem
                      icon={
                        <CalendarDays
                          size={16}
                        />
                      }
                      label="Date d'inscription"
                      value={
                        recruiter.registrationDate
                      }
                    />
                  </div>

                  <div className="mt-7 border-t border-slate-100 pt-6">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Présentation
                    </p>

                    <p className="mt-3 text-xs leading-6 text-slate-600">
                      {recruiter.description}
                    </p>
                  </div>
                </InfoCard>

                <InfoCard
                  title="Responsable du compte"
                  icon={<User size={19} />}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={<User size={16} />}
                      label="Nom"
                      value={
                        recruiter.recruiterName
                      }
                    />

                    <InfoItem
                      icon={
                        <BriefcaseBusiness
                          size={16}
                        />
                      }
                      label="Fonction"
                      value={
                        recruiter.recruiterRole
                      }
                    />

                    <InfoItem
                      icon={<Mail size={16} />}
                      label="E-mail du compte"
                      value={
                        recruiter.email
                      }
                    />

                    <InfoItem
                      icon={
                        <Phone size={16} />
                      }
                      label="Téléphone"
                      value={
                        recruiter.phone
                      }
                    />
                  </div>
                </InfoCard>
              </div>

              <div className="space-y-6">
                <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                        Vérification
                      </p>

                      <h3 className="mt-2 text-lg font-black text-slate-900">
                        État du dossier
                      </h3>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ShieldCheck
                        size={20}
                      />
                    </div>
                  </div>

                  <div
                    className={`mt-6 flex items-center gap-3 rounded-2xl border p-4 ${currentVerification.className}`}
                  >
                    {currentVerification.icon}

                    <div>
                      <p className="text-xs font-black">
                        {currentVerification.label}
                      </p>

                      <p className="mt-1 text-xs opacity-70">
                        Soumis le{" "}
                        {
                          recruiter.verificationSubmittedAt
                        }
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        "verification"
                      )
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Voir le dossier

                    <ChevronRight size={14} />
                  </Button>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Lock size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-black">
                        Informations protégées
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Données utilisées pour la
                        vérification.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <ProtectedInfo
                      label="E-mail professionnel"
                      value={
                        recruiter.professionalEmail
                      }
                    />

                    <ProtectedInfo
                      label="NUI"
                      value={recruiter.nui}
                    />
                  </div>

                  <div className="mt-5 rounded-xl bg-amber-50 p-4">
                    <p className="text-xs leading-5 text-amber-700">
                      Ces informations ne doivent
                      pas être modifiées librement
                      par l'entreprise après leur
                      soumission. Toute modification
                      nécessite une intervention
                      administrative.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              VERIFICATION
          ================================================== */}

          {activeTab === "verification" && (
            <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <InfoCard
                  title="Informations de vérification"
                  icon={
                    <ShieldCheck size={19} />
                  }
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={<Mail size={16} />}
                      label="E-mail professionnel"
                      value={
                        recruiter.professionalEmail
                      }
                    />

                    <InfoItem
                      icon={
                        <FileCheck2 size={16} />
                      }
                      label="NUI"
                      value={recruiter.nui}
                    />
                  </div>

                  <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-5">
                    <div className="flex gap-3">
                      <Lock
                        size={18}
                        className="shrink-0 text-amber-600"
                      />

                      <div>
                        <p className="text-xs font-black text-amber-900">
                          Informations verrouillées
                        </p>

                        <p className="mt-2 text-xs leading-5 text-amber-700">
                          L'e-mail professionnel et
                          le NUI constituent des
                          informations sensibles du
                          processus de vérification.
                          Leur modification nécessite
                          une autorisation ou une
                          intervention de
                          l'administrateur.
                        </p>
                      </div>
                    </div>
                  </div>
                </InfoCard>

                <InfoCard
                  title="Documents fournis"
                  icon={
                    <FileText size={19} />
                  }
                >
                  <div className="space-y-3">
                    {recruiter.documents.map(
                      (document) => (
                        <div
                          key={document.id}
                          className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                              <FileText
                                size={18}
                              />
                            </div>

                            <div>
                              <p className="text-xs font-black text-slate-700">
                                {document.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {document.type} ·
                                Document fourni
                              </p>
                            </div>
                          </div>

                          <Button
                            type="button" onClick={()=>perform(()=>download(document.url,document.name+".pdf"))}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
                          >
                            <Eye size={14} />

                            Consulter
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </InfoCard>
              </div>

              <div className="h-fit rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 xl:sticky xl:top-[96px]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Décision administrative
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-950">
                  Vérification de l'entreprise
                </h3>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Analysez les informations et
                  documents fournis avant de prendre
                  une décision.
                </p>

                <div className="mt-6 space-y-3">{[["unlock-email","Autoriser la modification de l’e-mail"],["unlock-nui","Autoriser la modification du NUI"]].map(([action,label])=><Button key={action} className="w-full rounded-xl border p-3 text-xs font-bold" onClick={()=>perform(async()=>{const result=await post("/administration/entreprises/"+recruiter.id+"/",{action});setRecruiter(adminCompany(result));success("Modification autorisée.");})}>{label}</Button>)}
                  {recruiter.verificationStatus !==
                    "verified" && (
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenModal(
                          "verify"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-xs font-black text-white transition hover:bg-emerald-600"
                    >
                      <CheckCircle2
                        size={16}
                      />

                      Valider l'entreprise
                    </Button>
                  )}

                  {recruiter.verificationStatus !==
                    "verified" && (
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenModal(
                          "request"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                    >
                      <Send size={15} />

                      Demander des informations
                    </Button>
                  )}

                  {recruiter.verificationStatus !==
                    "verified" && (
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenModal(
                          "reject"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-xs font-black text-red-600 transition hover:bg-red-100"
                    >
                      <Ban size={15} />

                      Refuser la vérification
                    </Button>
                  )}
                </div>

                {recruiter.rejectionReason && (
                  <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-red-500">
                      Motif du refus
                    </p>

                    <p className="mt-2 text-xs leading-5 text-red-700">
                      {
                        recruiter.rejectionReason
                      }
                    </p>
                  </div>
                )}

                {recruiter.informationRequest && (
                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-500">
                      Informations demandées
                    </p>

                    <p className="mt-2 text-xs leading-5 text-blue-700">
                      {
                        recruiter.informationRequest
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================
              OFFERS
          ================================================== */}

          {activeTab === "offers" && (
            <div className="mt-7">
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                    Recrutement
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Offres de l'entreprise
                  </h2>
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    navigate("admin-offers")
                  }
                  className="flex items-center gap-2 text-xs font-black text-blue-600"
                >
                  Voir toutes les offres

                  <ChevronRight size={15} />
                </Button>
              </div>

              <div className="space-y-4">
                {recruiter.offers.length >
                0 ? (
                  recruiter.offers.map(
                    (offer) => (
                      <div
                        key={offer.id}
                        className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40 transition hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                              <BriefcaseBusiness
                                size={21}
                              />
                            </div>

                            <div>
                              <h3 className="text-[13px] font-black text-slate-900">
                                {offer.title}
                              </h3>

                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                                <span>
                                  {offer.type}
                                </span>

                                <span>
                                  {offer.location}
                                </span>

                                <span>
                                  {offer.applications}{" "}
                                  candidatures
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <OfferStatus
                              status={
                                offer.status
                              }
                            />

                            <Button
                              type="button"
                              onClick={() => {
                                setSelectedOffer(
                                  offer
                                );

                                navigate(
                                  "admin-offer-detail",
                                  offer.id
                                );
                              }}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                              Voir l'offre

                              <ChevronRight
                                size={13}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-12 text-center">
                    <BriefcaseBusiness
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-4 text-[12px] font-black text-slate-700">
                      Aucune offre disponible
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Cette entreprise ne possède
                      actuellement aucune offre
                      affichée.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================
          VERIFY MODAL
      ====================================================== */}

      {openModal === "verify" && (
        <Modal
          title="Valider l'entreprise"
          icon={
            <CheckCircle2 size={21} />
          }
          iconClassName="bg-emerald-50 text-emerald-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Vous êtes sur le point de valider
            l'entreprise{" "}
            <strong>
              {recruiter.companyName}
            </strong>
            .
          </p>

          <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs leading-5 text-emerald-700">
              Une fois validée, l'entreprise pourra
              afficher le statut « Entreprise
              vérifiée » aux candidats sur la
              plateforme.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600"
            >
              Annuler
            </Button>

            <Button
              type="button"
              onClick={handleVerify}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-black text-white"
            >
              <Check size={15} />

              Confirmer
            </Button>
          </div>
        </Modal>
      )}

      {/* ======================================================
          REJECT MODAL
      ====================================================== */}

      {openModal === "reject" && (
        <Modal
          title="Refuser la vérification"
          icon={<Ban size={21} />}
          iconClassName="bg-red-50 text-red-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Indiquez clairement le motif du refus.
            Cette information pourra être
            communiquée à l'entreprise.
          </p>

          <Textarea
            value={actionMessage}
            onChange={(event) =>
              setActionMessage(
                event.target.value
              )
            }
            placeholder="Exemple : Le document fourni ne permet pas de confirmer les informations déclarées."
            className="mt-5 min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
          />

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600"
            >
              Annuler
            </Button>

            <Button
              type="button"
              disabled={
                !actionMessage.trim()
              }
              onClick={
                handleRejectVerification
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refuser
            </Button>
          </div>
        </Modal>
      )}

      {/* ======================================================
          REQUEST INFORMATION MODAL
      ====================================================== */}

      {openModal === "request" && (
        <Modal
          title="Demander des informations"
          icon={<Send size={21} />}
          iconClassName="bg-blue-50 text-blue-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Précisez les informations ou documents
            complémentaires nécessaires pour
            poursuivre la vérification.
          </p>

          <Textarea
            value={actionMessage}
            onChange={(event) =>
              setActionMessage(
                event.target.value
              )
            }
            placeholder="Exemple : Merci de fournir un document justificatif plus récent concernant le NUI déclaré."
            className="mt-5 min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600"
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
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={14} />

              Envoyer
            </Button>
          </div>
        </Modal>
      )}

      {/* ======================================================
          SUSPEND MODAL
      ====================================================== */}

      {openModal === "suspend" && (
        <Modal
          title="Suspendre l'entreprise"
          icon={
            <ShieldAlert size={21} />
          }
          iconClassName="bg-red-50 text-red-600"
          onClose={closeModal}
        >
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle
                size={18}
                className="shrink-0 text-red-500"
              />

              <p className="text-xs leading-5 text-red-700">
                La suspension peut limiter l'accès
                du recruteur à certaines
                fonctionnalités de la plateforme.
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
            className="mt-5 min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
          />

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600"
            >
              Annuler
            </Button>

            <Button
              type="button"
              disabled={
                !actionMessage.trim()
              }
              onClick={handleSuspend}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suspendre
            </Button>
          </div>
        </Modal>
      )}

      {/* ======================================================
          REACTIVATE MODAL
      ====================================================== */}

      {openModal === "reactivate" && (
        <Modal
          title="Réactiver l'entreprise"
          icon={<RotateCcw size={21} />}
          iconClassName="bg-emerald-50 text-emerald-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Confirmez-vous la réactivation de
            l'entreprise{" "}
            <strong>
              {recruiter.companyName}
            </strong>{" "}
            ?
          </p>

          <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs leading-5 text-emerald-700">
              Le recruteur pourra à nouveau accéder
              normalement aux fonctionnalités
              disponibles sur son compte.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600"
            >
              Annuler
            </Button>

            <Button
              type="button"
              onClick={handleReactivate}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-black text-white"
            >
              <RotateCcw size={14} />

              Réactiver
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ==========================================================
   COMPONENTS
========================================================== */

function TabButton({
  active,
  onClick,
  label,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`relative whitespace-nowrap px-1 pb-4 text-xs font-black transition ${
        active
          ? "text-blue-600"
          : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {label}

      {active && (
        <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600" />
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
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <h3 className="text-[13px] font-black text-slate-900">
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

      <p className="mt-2 text-xs font-bold leading-5 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function ProtectedInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <Lock
          size={13}
          className="text-slate-400"
        />

        <p className="text-xs font-black text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function OfferStatus({
  status,
}) {
  const config =
    status === "active"
      ? {
          label: "Active",
          className:
            "bg-emerald-50 text-emerald-700",
        }
      : {
          label: "En attente",
          className:
            "bg-amber-50 text-amber-700",
        };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-black ${config.className}`}
    >
      {config.label}
    </span>
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
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClassName}`}
            >
              {icon}
            </div>

            <h3 className="text-lg font-black text-slate-900">
              {title}
            </h3>
          </div>

          <Button aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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

export default AdminRecruiterDetailPage;
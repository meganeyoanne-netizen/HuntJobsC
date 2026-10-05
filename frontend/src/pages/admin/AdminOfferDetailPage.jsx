import { StatCard } from "../../components/ui";
import { Button, Textarea, ModalFrame } from "../../components/ui";

import { adminOffer } from "../../services/adminAdapters";

import { post, perform, success } from "../../services/api";
import { useResource } from "../../hooks/useResource";


import { useState } from "react";
import { Activity, AlertTriangle, Archive, ArrowLeft, BadgeCheck, Ban, BriefcaseBusiness, Building2, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Eye, FileText, Globe, Mail, MapPin, RotateCcw, Send, ShieldCheck, Users, X, User, Banknote, GraduationCap } from "lucide-react";



function AdminOfferDetailPage({
  selectedOfferId,
  offerId,
  user = {
    firstName: "",
    lastName: "",
    email: "admin@jobconnect.cm",
  },
  onNavigate,
  onLogout,
}) {
  /*
   * ==========================================================
   * IDENTIFIANT DE L'OFFRE
   * ==========================================================
   */

  const activeOfferId =
    selectedOfferId || offerId || 101;

  /*
   * ==========================================================
   * DONNÉES DE DÉMONSTRATION
   *
   * Plus tard, ces données seront récupérées depuis Django.
   * ==========================================================
   */

  const initialOffers = {};

  const [offer, setOffer] = useResource("/offres/"+activeOfferId+"/",adminOffer,adminOffer({id:activeOfferId,first_name:"",last_name:"",profil:{},entreprise_nom:"",titre:"",is_active:true}));

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

  /*
   * ==========================================================
   * ADMIN NAME
   * ==========================================================
   */

  const adminName = user?.firstName
    ? `${user.firstName} ${
        user.lastName || ""
      }`.trim()
    : "Administrateur";

  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  const navigate = (
    destination,
    data = null
  ) => {
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

  const handleApproveOffer = () => perform(async () => {const result=await post("/offres/admin/"+offer.id+"/approve/",{motif:actionMessage||"Veuillez corriger cette offre."});setOffer(adminOffer(result.offre||result));setOpenModal(null);success("Décision enregistrée.");});

  const handleRejectOffer = () => perform(async () => {const result=await post("/offres/admin/"+offer.id+"/reject/",{motif:actionMessage||"Veuillez corriger cette offre."});setOffer(adminOffer(result.offre||result));setOpenModal(null);success("Décision enregistrée.");});

  const handleRequestModification = () => perform(async () => {const result=await post("/offres/admin/"+offer.id+"/reject/",{motif:actionMessage||"Veuillez corriger cette offre."});setOffer(adminOffer(result.offre||result));setOpenModal(null);success("Décision enregistrée.");});

  const handleArchiveOffer = () => perform(async () => {const result=await post("/administration/offres/"+offer.id+"/",{action:"archive",motif:actionMessage});setOffer(adminOffer(result));setOpenModal(null);});

  const handleReactivateOffer = () => perform(async () => {const result=await post("/administration/offres/"+offer.id+"/",{action:"reactivate",motif:actionMessage});setOffer(adminOffer(result));setOpenModal(null);});

  /*
   * ==========================================================
   * STATUS CONFIG
   * ==========================================================
   */

  const statusConfig = {
    pending: {
      label: "En attente de validation",

      className:
        "bg-amber-50 text-amber-700 border-amber-200",

      icon: <Clock3 size={13} />,
    },

    active: {
      label: "Offre active",

      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",

      icon: <CheckCircle2 size={13} />,
    },

    rejected: {
      label: "Offre refusée",

      className:
        "bg-red-50 text-red-700 border-red-200",

      icon: <Ban size={13} />,
    },

    modification_requested: {
      label:
        "Modification demandée",

      className:
        "bg-blue-50 text-blue-700 border-blue-200",

      icon: <Send size={13} />,
    },

    archived: {
      label: "Offre archivée",

      className:
        "bg-slate-100 text-slate-600 border-slate-200",

      icon: <Archive size={13} />,
    },
  };

  const currentStatus =
    statusConfig[offer.status] ||
    statusConfig.pending;

  /*
   * ==========================================================
   * SIDEBAR
   * ==========================================================
   */

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
    },

    {
      id: "admin-offers",
      label: "Offres",
      icon: <BriefcaseBusiness size={18} />,
      active: true,
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
      {/* MOBILE OVERLAY */}

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
        

        <main className="px-4 pb-10 pt-6 sm:px-7 lg:px-9">
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

          <Button
            type="button"
            onClick={() =>
              navigate("admin-offers")
            }
            className="mb-6 flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />

            Retour aux offres
          </Button>

          {/* ==================================================
              HERO
          ================================================== */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-6 text-white shadow-2xl shadow-blue-900/20 sm:p-8">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
                      {offer.contractType}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
                      {offer.workMode}
                    </span>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${currentStatus.className}`}
                    >
                      {currentStatus.icon}

                      {currentStatus.label}
                    </span>
                  </div>

                  <h2 className="mt-5 text-2xl font-black sm:text-4xl">
                    {offer.title}
                  </h2>

                  <Button
                    type="button"
                    onClick={() =>
                      navigate(
                        "admin-recruiter-detail",
                        offer.company.id
                      )
                    }
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-100 transition hover:text-white"
                  >
                    <Building2 size={17} />

                    {offer.company.name}

                    {offer.company
                      .verified && (
                      <BadgeCheck
                        size={16}
                        className="text-emerald-300"
                      />
                    )}
                  </Button>

                  <div className="mt-5 flex flex-wrap gap-4 text-xs text-blue-100/75">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />

                      {offer.location}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} />

                      Publiée le{" "}
                      {offer.publishedAt}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock3 size={14} />

                      Expire le{" "}
                      {offer.deadline}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 xl:items-end">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-100/60">
                      Candidatures
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      {offer.applications}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="mt-8 flex flex-wrap gap-3">
                {offer.status !==
                  "active" &&
                  offer.status !==
                    "archived" && (
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenModal(
                          "approve"
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-blue-700 shadow-lg transition hover:-translate-y-0.5"
                    >
                      <CheckCircle2
                        size={16}
                      />

                      Valider l'offre
                    </Button>
                  )}

                {offer.status ===
                  "pending" && (
                  <>
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenModal(
                          "request"
                        )
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black text-white transition hover:bg-white/15"
                    >
                      <Send size={15} />

                      Demander une modification
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

                {offer.status ===
                "active" ? (
                  <Button
                    type="button"
                    onClick={() =>
                      setOpenModal(
                        "archive"
                      )
                    }
                    className="flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-xs font-black text-red-100 transition hover:bg-red-500/20"
                  >
                    <Archive size={15} />

                    Archiver
                  </Button>
                ) : offer.status ===
                  "archived" ? (
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

                    Réactiver l'offre
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          {/* ==================================================
              STATS
          ================================================== */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Users size={19} />}
              label="Candidatures"
              value={offer.applications}
              helper="Candidats ayant postulé"
            />

            <StatCard
              icon={
                <CalendarDays size={19} />
              }
              label="Entretiens"
              value={offer.interviews}
              helper="Entretiens programmés"
            />

            <StatCard
              icon={<Eye size={19} />}
              label="Vues"
              value={offer.views}
              helper="Consultations de l'offre"
            />

            <StatCard
              icon={
                <BriefcaseBusiness
                  size={19}
                />
              }
              label="Postes"
              value={offer.positions}
              helper="Postes à pourvoir"
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
                  activeTab === "requirements"
                }
                onClick={() =>
                  setActiveTab(
                    "requirements"
                  )
                }
                label="Profil recherché"
              />

              <TabButton
                active={
                  activeTab === "company"
                }
                onClick={() =>
                  setActiveTab("company")
                }
                label="Entreprise"
              />

              <TabButton
                active={
                  activeTab === "moderation"
                }
                onClick={() =>
                  setActiveTab(
                    "moderation"
                  )
                }
                label="Modération"
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
                  title="Description du poste"
                  icon={
                    <FileText size={19} />
                  }
                >
                  <p className="text-xs leading-7 text-slate-600">
                    {offer.description}
                  </p>
                </InfoCard>

                <InfoCard
                  title="Responsabilités"
                  icon={
                    <BriefcaseBusiness
                      size={19}
                    />
                  }
                >
                  <ul className="space-y-3">
                    {offer.responsibilities.map(
                      (
                        responsibility,
                        index
                      ) => (
                        <li
                          key={index}
                          className="flex gap-3 text-xs leading-6 text-slate-600"
                        >
                          <CheckCircle2
                            size={16}
                            className="mt-1 shrink-0 text-blue-600"
                          />

                          {
                            responsibility
                          }
                        </li>
                      )
                    )}
                  </ul>
                </InfoCard>

                <InfoCard
                  title="Avantages"
                  icon={
                    <BadgeCheck size={19} />
                  }
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {offer.benefits.map(
                      (
                        benefit,
                        index
                      ) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                        >
                          <Check
                            size={15}
                            className="text-emerald-600"
                          />

                          <span className="text-xs font-bold text-slate-600">
                            {benefit}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </InfoCard>
              </div>

              <div className="space-y-6">
                <InfoCard
                  title="Informations du poste"
                  icon={
                    <BriefcaseBusiness
                      size={19}
                    />
                  }
                >
                  <div className="space-y-5">
                    <InfoItem
                      icon={
                        <BriefcaseBusiness
                          size={16}
                        />
                      }
                      label="Type de contrat"
                      value={
                        offer.contractType
                      }
                    />

                    <InfoItem
                      icon={
                        <MapPin size={16} />
                      }
                      label="Localisation"
                      value={offer.location}
                    />

                    <InfoItem
                      icon={
                        <Activity size={16} />
                      }
                      label="Mode de travail"
                      value={offer.workMode}
                    />

                    <InfoItem
                      icon={
                        <GraduationCap
                          size={16}
                        />
                      }
                      label="Niveau d'expérience"
                      value={
                        offer.experienceLevel
                      }
                    />

                    <InfoItem
                      icon={
                        <Banknote size={16} />
                      }
                      label="Salaire"
                      value={offer.salary}
                    />

                    <InfoItem
                      icon={
                        <Users size={16} />
                      }
                      label="Nombre de postes"
                      value={offer.positions}
                    />
                  </div>
                </InfoCard>

                <InfoCard
                  title="Publication"
                  icon={
                    <CalendarDays size={19} />
                  }
                >
                  <div className="space-y-5">
                    <InfoItem
                      icon={
                        <CalendarDays
                          size={16}
                        />
                      }
                      label="Date de publication"
                      value={
                        offer.publishedAt
                      }
                    />

                    <InfoItem
                      icon={
                        <Clock3 size={16} />
                      }
                      label="Date limite"
                      value={
                        offer.deadline
                      }
                    />
                  </div>
                </InfoCard>
              </div>
            </div>
          )}

          {/* ==================================================
              REQUIREMENTS
          ================================================== */}

          {activeTab === "requirements" && (
            <div className="mt-7 grid gap-6 xl:grid-cols-2">
              <InfoCard
                title="Compétences recherchées"
                icon={
                  <Activity size={19} />
                }
              >
                <div className="flex flex-wrap gap-3">
                  {offer.skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-black text-blue-700"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </InfoCard>

              <InfoCard
                title="Exigences"
                icon={
                  <CheckCircle2 size={19} />
                }
              >
                <ul className="space-y-4">
                  {offer.requirements.map(
                    (
                      requirement,
                      index
                    ) => (
                      <li
                        key={index}
                        className="flex gap-3 text-xs leading-6 text-slate-600"
                      >
                        <Check
                          size={16}
                          className="mt-1 shrink-0 text-blue-600"
                        />

                        {requirement}
                      </li>
                    )
                  )}
                </ul>
              </InfoCard>
            </div>
          )}

          {/* ==================================================
              COMPANY
          ================================================== */}

          {activeTab === "company" && (
            <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <InfoCard
                title="Entreprise"
                icon={
                  <Building2 size={19} />
                }
              >
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-2xl font-black text-blue-600">
                    {offer.company.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900">
                        {
                          offer.company.name
                        }
                      </h3>

                      {offer.company
                        .verified && (
                        <BadgeCheck
                          size={18}
                          className="text-emerald-500"
                        />
                      )}
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {
                        offer.company.sector
                      }
                    </p>

                    <div className="mt-5 space-y-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin
                          size={15}
                        />

                        {
                          offer.company.location
                        }
                      </div>

                      <div className="flex items-center gap-2">
                        <Globe size={15} />

                        {
                          offer.company.website
                        }
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() =>
                        navigate(
                          "admin-recruiter-detail",
                          offer.company.id
                        )
                      }
                      className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                    >
                      Voir l'entreprise

                      <ChevronRight
                        size={14}
                      />
                    </Button>
                  </div>
                </div>
              </InfoCard>

              <InfoCard
                title="Responsable recruteur"
                icon={<User size={19} />}
              >
                <div className="space-y-5">
                  <InfoItem
                    icon={<User size={16} />}
                    label="Nom"
                    value={
                      offer.recruiter.name
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
                      offer.recruiter.role
                    }
                  />

                  <InfoItem
                    icon={<Mail size={16} />}
                    label="E-mail"
                    value={
                      offer.recruiter.email
                    }
                  />

                  <InfoItem
                    icon={
                      <Users size={16} />
                    }
                    label="Téléphone"
                    value={
                      offer.recruiter.phone
                    }
                  />
                </div>
              </InfoCard>
            </div>
          )}

          {/* ==================================================
              MODERATION
          ================================================== */}

          {activeTab === "moderation" && (
            <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <InfoCard
                title="Historique de modération"
                icon={
                  <ShieldCheck size={19} />
                }
              >
                {offer.moderationHistory
                  .length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                    <ShieldCheck
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-4 text-xs font-black text-slate-600">
                      Aucun historique
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Aucune action de modération
                      n'a encore été enregistrée.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offer.moderationHistory.map(
                      (history) => (
                        <div
                          key={history.id}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-black text-slate-700">
                                {
                                  history.action
                                }
                              </p>

                              <p className="mt-2 text-xs leading-5 text-slate-500">
                                {
                                  history.message
                                }
                              </p>
                            </div>

                            <span className="whitespace-nowrap text-xs text-slate-400">
                              {history.date}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </InfoCard>

              <div className="h-fit rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 xl:sticky xl:top-[96px]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Décision administrative
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-950">
                  Modérer cette offre
                </h3>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Vérifiez le contenu de l'offre
                  avant de prendre une décision.
                </p>

                <div className="mt-6 space-y-3">
                  {offer.status !==
                    "active" &&
                    offer.status !==
                      "archived" && (
                      <Button
                        type="button"
                        onClick={() =>
                          setOpenModal(
                            "approve"
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-xs font-black text-white transition hover:bg-emerald-600"
                      >
                        <CheckCircle2
                          size={16}
                        />

                        Valider l'offre
                      </Button>
                    )}

                  {offer.status ===
                    "pending" && (
                    <>
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

                        Demander une modification
                      </Button>

                      <Button
                        type="button"
                        onClick={() =>
                          setOpenModal(
                            "reject"
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-xs font-black text-red-600"
                      >
                        <Ban size={15} />

                        Refuser l'offre
                      </Button>
                    </>
                  )}

                  {offer.status ===
                  "active" && (
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenModal(
                          "archive"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-xs font-black text-red-600"
                    >
                      <Archive size={15} />

                      Archiver l'offre
                    </Button>
                  )}

                  {offer.status ===
                    "archived" && (
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

                      Réactiver l'offre
                    </Button>
                  )}
                </div>

                {offer.rejectionReason && (
                  <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-red-500">
                      Motif du refus
                    </p>

                    <p className="mt-2 text-xs leading-5 text-red-700">
                      {
                        offer.rejectionReason
                      }
                    </p>
                  </div>
                )}

                {offer.modificationRequest && (
                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-500">
                      Modification demandée
                    </p>

                    <p className="mt-2 text-xs leading-5 text-blue-700">
                      {
                        offer.modificationRequest
                      }
                    </p>
                  </div>
                )}

                {offer.archiveReason && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Motif de l'archivage
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {
                        offer.archiveReason
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================
          APPROVE MODAL
      ====================================================== */}

      {openModal === "approve" && (
        <Modal
          title="Valider l'offre"
          icon={
            <CheckCircle2 size={21} />
          }
          iconClassName="bg-emerald-50 text-emerald-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Vous êtes sur le point de valider
            l'offre{" "}
            <strong>{offer.title}</strong>.
          </p>

          <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs leading-5 text-emerald-700">
              L'offre pourra être affichée aux
              candidats sur la plateforme après
              validation.
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
              onClick={handleApproveOffer}
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
          title="Refuser l'offre"
          icon={<Ban size={21} />}
          iconClassName="bg-red-50 text-red-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Indiquez le motif du refus. Le
            recruteur pourra utiliser cette
            information pour comprendre la
            décision.
          </p>

          <Textarea
            value={actionMessage}
            onChange={(event) =>
              setActionMessage(
                event.target.value
              )
            }
            placeholder="Indiquez le motif du refus..."
            className="mt-5 min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
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
                handleRejectOffer
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refuser
            </Button>
          </div>
        </Modal>
      )}

      {/* ======================================================
          REQUEST MODIFICATION MODAL
      ====================================================== */}

      {openModal === "request" && (
        <Modal
          title="Demander une modification"
          icon={<Send size={21} />}
          iconClassName="bg-blue-50 text-blue-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Expliquez au recruteur les éléments
            qui doivent être modifiés avant
            validation de l'offre.
          </p>

          <Textarea
            value={actionMessage}
            onChange={(event) =>
              setActionMessage(
                event.target.value
              )
            }
            placeholder="Décrivez les modifications nécessaires..."
            className="mt-5 min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
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
                handleRequestModification
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
          ARCHIVE MODAL
      ====================================================== */}

      {openModal === "archive" && (
        <Modal
          title="Archiver l'offre"
          icon={<Archive size={21} />}
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
                Une offre archivée ne sera plus
                accessible aux candidats.
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
            placeholder="Indiquez le motif de l'archivage..."
            className="mt-5 min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
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
                handleArchiveOffer
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Archiver
            </Button>
          </div>
        </Modal>
      )}

      {/* ======================================================
          REACTIVATE MODAL
      ====================================================== */}

      {openModal === "reactivate" && (
        <Modal
          title="Réactiver l'offre"
          icon={<RotateCcw size={21} />}
          iconClassName="bg-emerald-50 text-emerald-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Confirmez-vous la réactivation de cette
            offre ?
          </p>

          <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs leading-5 text-emerald-700">
              L'offre redeviendra visible et pourra
              à nouveau recevoir des candidatures.
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
              onClick={handleReactivateOffer}
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
   SMALL COMPONENTS
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

export default AdminOfferDetailPage;
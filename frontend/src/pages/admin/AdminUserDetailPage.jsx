import { StatCard } from "../../components/ui";
import { Button, Textarea, ModalFrame } from "../../components/ui";
import { post } from "../../services/api";

import { adminUser } from "../../services/adminAdapters";

import { patch, perform, success } from "../../services/api";
import { useResource } from "../../hooks/useResource";


import { useState } from "react";
import { Activity, AlertTriangle, ArrowLeft, Ban, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2, ChevronRight, Clock3, FileText, GraduationCap, Mail, MapPin, Phone, RotateCcw, Send, ShieldAlert, ShieldCheck, User, UserCheck, Users, X, Briefcase } from "lucide-react";



function AdminUserDetailPage({
  selectedUserId,
  userId,
  user = {
    firstName: "",
    lastName: "",
    email: "admin@jobconnect.cm",
  },
  onNavigate,
  onLogout,
}) {
  const activeUserId = selectedUserId || userId || 1;

  /*
   * ==========================================================
   * DONNÉES TEMPORAIRES
   * À REMPLACER PLUS TARD PAR LES DONNÉES DJANGO
   * ==========================================================
   */

  const usersData = {};

  const [selectedUser, setSelectedUser] = useResource("/administration/users/"+activeUserId+"/",adminUser,adminUser({id:activeUserId,first_name:"",last_name:"",profil:{},entreprise_nom:"",titre:"",is_active:true}));

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

  const navigate = (destination, data = null) => {
    setSidebarOpen(false);

    if (onNavigate) {
      onNavigate(destination, data);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ==========================================================
   * SUCCESS MESSAGE
   * ==========================================================
   */

  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  /*
   * ==========================================================
   * MODAL
   * ==========================================================
   */

  const closeModal = () => {
    setOpenModal(null);
    setActionMessage("");
  };

  /*
   * ==========================================================
   * ACTIONS ADMINISTRATIVES
   * ==========================================================
   */

  const handleActivate = () => perform(async () => {const result=await patch("/administration/users/"+selectedUser.id+"/",{is_suspended:false,suspension_reason:actionMessage});setSelectedUser(adminUser(result));setOpenModal(null);success("Compte mis à jour.");});

  const handleSuspend = () => perform(async () => {const result=await patch("/administration/users/"+selectedUser.id+"/",{is_suspended:true,suspension_reason:actionMessage});setSelectedUser(adminUser(result));setOpenModal(null);success("Compte mis à jour.");});

  const handleReactivate = () => perform(async () => {const result=await patch("/administration/users/"+selectedUser.id+"/",{is_suspended:false,suspension_reason:actionMessage});setSelectedUser(adminUser(result));setOpenModal(null);success("Compte mis à jour.");});

  const handleRequestInformation = () => perform(async () => {await post("/administration/users/"+selectedUser.id+"/",{action:"request-information",motif:actionMessage});setOpenModal(null);success("Demande envoyée.");});

  /*
   * ==========================================================
   * STATUS
   * ==========================================================
   */

  const statusConfig = {
    active: {
      label: "Compte actif",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: <CheckCircle2 size={14} />,
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
    statusConfig[selectedUser.status] ||
    statusConfig.active;

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
      active: true,
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

          {/* ==================================================
              HERO USER
          ================================================== */}

          <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-6 text-white shadow-2xl sm:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 text-3xl font-black backdrop-blur">
                  {selectedUser.firstName
                    .charAt(0)
                    .toUpperCase()}
                  {selectedUser.lastName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black sm:text-3xl">
                      {selectedUser.firstName}{" "}
                      {selectedUser.lastName}
                    </h2>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${currentStatus.className}`}
                    >
                      {currentStatus.icon}

                      {currentStatus.label}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
                      {selectedUser.role ===
                      "candidate"
                        ? "Candidat"
                        : "Recruteur"}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
                      Inscrit le{" "}
                      {selectedUser.registeredAt}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-4 text-xs text-blue-100/75">
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} />
                      {selectedUser.email}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {selectedUser.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {selectedUser.status ===
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
                  activeTab === "activity"
                }
                onClick={() =>
                  setActiveTab("activity")
                }
                label="Activité"
              />

              <TabButton
                active={
                  activeTab === "administration"
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

          {/* ==================================================
              OVERVIEW
          ================================================== */}

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
                      value={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    />

                    <InfoItem
                      icon={<Mail size={16} />}
                      label="Adresse e-mail"
                      value={selectedUser.email}
                    />

                    <InfoItem
                      icon={<Phone size={16} />}
                      label="Téléphone"
                      value={selectedUser.phone}
                    />

                    <InfoItem
                      icon={<MapPin size={16} />}
                      label="Localisation"
                      value={selectedUser.location}
                    />
                  </div>
                </InfoCard>

                {selectedUser.role ===
                  "candidate" &&
                  selectedUser.candidateProfile && (
                    <InfoCard
                      title="Profil professionnel"
                      icon={
                        <BriefcaseBusiness
                          size={19}
                        />
                      }
                    >
                      <div className="grid gap-6 sm:grid-cols-2">
                        <InfoItem
                          icon={
                            <Briefcase
                              size={16}
                            />
                          }
                          label="Profil"
                          value={
                            selectedUser
                              .candidateProfile
                              .title
                          }
                        />

                        <InfoItem
                          icon={
                            <Activity
                              size={16}
                            />
                          }
                          label="Expérience"
                          value={
                            selectedUser
                              .candidateProfile
                              .experienceLevel
                          }
                        />

                        <InfoItem
                          icon={
                            <GraduationCap
                              size={16}
                            />
                          }
                          label="Formation"
                          value={
                            selectedUser
                              .candidateProfile
                              .education
                          }
                        />

                        <InfoItem
                          icon={
                            <GraduationCap
                              size={16}
                            />
                          }
                          label="Établissement"
                          value={
                            selectedUser
                              .candidateProfile
                              .institution
                          }
                        />
                      </div>

                      <div className="mt-7">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                          Compétences
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedUser.candidateProfile.skills.map(
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
                      </div>
                    </InfoCard>
                  )}

                {selectedUser.role ===
                  "recruiter" &&
                  selectedUser.recruiterProfile && (
                    <InfoCard
                      title="Profil recruteur"
                      icon={
                        <Building2 size={19} />
                      }
                    >
                      <div className="grid gap-6 sm:grid-cols-2">
                        <InfoItem
                          icon={
                            <Building2
                              size={16}
                            />
                          }
                          label="Entreprise"
                          value={
                            selectedUser
                              .recruiterProfile
                              .companyName
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
                            selectedUser
                              .recruiterProfile
                              .position
                          }
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={() =>
                          navigate(
                            "admin-recruiter-detail",
                            selectedUser
                              .recruiterProfile
                              .companyId
                          )
                        }
                        className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white"
                      >
                        Voir l'entreprise

                        <ChevronRight
                          size={15}
                        />
                      </Button>
                    </InfoCard>
                  )}
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
                      label="Date d'inscription"
                      value={
                        selectedUser.registeredAt
                      }
                    />

                    <InfoItem
                      icon={
                        <Clock3 size={16} />
                      }
                      label="Dernière connexion"
                      value={
                        selectedUser.lastLogin
                      }
                    />

                    <InfoItem
                      icon={
                        <UserCheck
                          size={16}
                        />
                      }
                      label="Profil complété"
                      value={`${selectedUser.profileCompleted}%`}
                    />
                  </div>
                </InfoCard>

                {selectedUser.status ===
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
                        selectedUser.suspensionReason
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================
              ACTIVITY
          ================================================== */}

          {activeTab === "activity" && (
            <div className="mt-7">
              {selectedUser.role ===
              "candidate" ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon={
                      <FileText size={19} />
                    }
                    label="Candidatures"
                    value={
                      selectedUser
                        .candidateProfile
                        .applications
                    }
                  />

                  <StatCard
                    icon={
                      <Activity size={19} />
                    }
                    label="Candidatures actives"
                    value={
                      selectedUser
                        .candidateProfile
                        .activeApplications
                    }
                  />

                  <StatCard
                    icon={
                      <CalendarDays
                        size={19}
                      />
                    }
                    label="Entretiens"
                    value={
                      selectedUser
                        .candidateProfile
                        .interviews
                    }
                  />

                  <StatCard
                    icon={
                      <FileText size={19} />
                    }
                    label="Documents"
                    value={
                      selectedUser
                        .candidateProfile
                        .documents
                    }
                  />
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon={
                      <BriefcaseBusiness
                        size={19}
                      />
                    }
                    label="Offres"
                    value={
                      selectedUser
                        .recruiterProfile
                        .offers
                    }
                  />

                  <StatCard
                    icon={
                      <Activity size={19} />
                    }
                    label="Offres actives"
                    value={
                      selectedUser
                        .recruiterProfile
                        .activeOffers
                    }
                  />

                  <StatCard
                    icon={
                      <Users size={19} />
                    }
                    label="Candidatures reçues"
                    value={
                      selectedUser
                        .recruiterProfile
                        .applications
                    }
                  />

                  <StatCard
                    icon={
                      <CalendarDays
                        size={19}
                      />
                    }
                    label="Entretiens"
                    value={
                      selectedUser
                        .recruiterProfile
                        .interviews
                    }
                  />
                </div>
              )}

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-8 text-center">
                <Activity
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-4 text-[12px] font-black text-slate-600">
                  Historique d'activité
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Les activités détaillées seront
                  affichées ici après l'intégration
                  avec le backend Django.
                </p>
              </div>
            </div>
          )}

          {/* ==================================================
              ADMINISTRATION
          ================================================== */}

          {activeTab ===
            "administration" && (
            <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <InfoCard
                title="Historique administratif"
                icon={
                  <ShieldCheck size={19} />
                }
              >
                {selectedUser.adminHistory
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
                      Aucune action administrative
                      n'a encore été enregistrée.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedUser.adminHistory.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-slate-50 p-5"
                        >
                          <div className="flex justify-between gap-4">
                            <div>
                              <p className="text-xs font-black text-slate-700">
                                {item.action}
                              </p>

                              <p className="mt-2 text-xs leading-5 text-slate-500">
                                {item.message}
                              </p>
                            </div>

                            <span className="text-xs text-slate-400">
                              {item.date}
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
                  Gestion du compte
                </h3>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Les actions administratives sont
                  enregistrées dans l'historique.
                </p>

                <div className="mt-6 space-y-3">
                  {selectedUser.status ===
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
                      <RotateCcw size={15} />
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

      {/* ======================================================
          SUSPEND MODAL
      ====================================================== */}

      {openModal === "suspend" && (
        <Modal
          title="Suspendre le compte"
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
                L'utilisateur ne pourra plus
                utiliser son compte tant que la
                suspension sera active.
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

      {/* ======================================================
          REACTIVATE MODAL
      ====================================================== */}

      {openModal === "reactivate" && (
        <Modal
          title="Réactiver le compte"
          icon={<RotateCcw size={21} />}
          iconClassName="bg-emerald-50 text-emerald-600"
          onClose={closeModal}
        >
          <p className="text-xs leading-6 text-slate-500">
            Confirmez-vous la réactivation de ce
            compte utilisateur ?
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
            Indiquez les informations que vous
            souhaitez demander à cet utilisateur.
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

export default AdminUserDetailPage;
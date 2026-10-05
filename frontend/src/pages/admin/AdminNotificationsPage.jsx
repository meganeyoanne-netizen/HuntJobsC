import { useEffect } from "react";
import { Button, Input } from "../../components/ui";



import { api, post, patch, remove, perform } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { notificationsAdapter } from "../../services/adapters";

import { useState } from "react";
import { Activity, AlertTriangle, Ban, Bell, BriefcaseBusiness, Building2, Check, CheckCheck, CheckCircle2, ChevronRight, Clock3, FileText, Filter, Info, Mail, MoreHorizontal, Search, ShieldAlert, ShieldCheck, Trash2, User, UserCheck, Users, X } from "lucide-react";



function AdminNotificationsPage({
  user = {},
  onNavigate,
  onLogout,
}) {
  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigate = (destination, data = null) => {
    if (onNavigate) {
      onNavigate(destination, data);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     DONNÉES TEMPORAIRES
     À REMPLACER PAR LES DONNÉES DU BACKEND DJANGO
  ========================================================= */

  const initialNotifications = [];

  const [notifications, setNotifications, reloadNotifications] = useResource("/notifications/",list=>notificationsAdapter(list).map(n=>({...n,isRead:n.is_read,category:n.destination==="admin-recruiter-detail"?"verification":n.destination==="admin-offer-detail"?"offer":"system",actionPage:n.destination,recruiterId:n.resource_id,offerId:n.resource_id,candidateId:n.resource_id})));

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =========================================================
     STATISTIQUES
  ========================================================= */

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const verificationCount = notifications.filter(
    (notification) =>
      notification.category === "verification"
  ).length;

  const highPriorityCount = notifications.filter(
    (notification) =>
      notification.priority === "high"
  ).length;

  /* =========================================================
     FILTRES
  ========================================================= */

  const filteredNotifications =
    notifications.filter((notification) => {
      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "unread"
          ? !notification.isRead
          : notification.category === activeFilter;

      const searchValue =
        `${notification.title} ${notification.message} ${notification.companyName || ""}`.toLowerCase();

      const matchesSearch =
        searchValue.includes(
          searchTerm.toLowerCase()
        );

      return (
        matchesFilter && matchesSearch
      );
    });

  /* =========================================================
     SUCCESS
  ========================================================= */

  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  /* =========================================================
     ACTIONS NOTIFICATIONS
  ========================================================= */

  useEffect(() => { window.addEventListener("notifications-changed", reloadNotifications); return () => window.removeEventListener("notifications-changed", reloadNotifications); }, [reloadNotifications]);
  const refreshNotifications=async()=>{setNotifications(notificationsAdapter(await api("/notifications/")).map(n=>({...n,isRead:n.is_read,category:n.destination==="admin-recruiter-detail"?"verification":n.destination==="admin-offer-detail"?"offer":"system",actionPage:n.destination,recruiterId:n.resource_id,offerId:n.resource_id,candidateId:n.resource_id})));window.dispatchEvent(new Event("notifications-changed"));};
  const markAsRead = (id) => perform(async () => {await patch("/notifications/"+id+"/",{is_read:true});await refreshNotifications();setOpenMenuId(null);});

  const markAsUnread = (id) => perform(async () => {await patch("/notifications/"+id+"/",{is_read:false});await refreshNotifications();setOpenMenuId(null);});

  const markAllAsRead = (id) => perform(async () => {await post("/notifications/read_all/",{});await refreshNotifications();setOpenMenuId(null);});

  const deleteNotification = (id) => perform(async () => {await remove("/notifications/"+id+"/");await refreshNotifications();setOpenMenuId(null);});

  const clearReadNotifications = (id) => perform(async () => {await post("/notifications/clear_read/",{});await refreshNotifications();setOpenMenuId(null);});

  const handleNotificationAction = (
    notification
  ) => {
    if (
      notification.actionPage ===
      "admin-recruiter-detail"
    ) {
      navigate(
        "admin-recruiter-detail",
        notification.recruiterId
      );
      return;
    }

    if (
      notification.actionPage ===
      "admin-candidate-detail"
    ) {
      navigate(
        "admin-candidate-detail",
        notification.candidateId
      );
      return;
    }

    if (
      notification.actionPage ===
      "admin-offer-detail"
    ) {
      navigate(
        "admin-offer-detail",
        notification.offerId
      );
      return;
    }

    navigate(
      notification.actionPage
    );
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
    },
    {
      id: "admin-recruiters",
      label: "Recruteurs",
      icon: (
        <BriefcaseBusiness size={18} />
      ),
    },
    {
      id: "admin-offers",
      label: "Offres",
      icon: <FileText size={18} />,
    },
    {
      id: "admin-notifications",
      label: "Notifications",
      icon: <Bell size={18} />,
      active: true,
      badge: unreadCount,
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

  /* =========================================================
     RENDER
  ========================================================= */

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
          MAIN CONTENT
      ===================================================== */}

      <div className="">
        {/* HEADER */}

        

        <main className="px-4 pb-10 pt-6 sm:px-7 lg:px-9">
          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-emerald-700">
              <CheckCircle2 size={18} />

              <p className="text-xs font-bold">
                {successMessage}
              </p>

              <Button aria-label="Fermer"
                type="button"
                onClick={() =>
                  setSuccessMessage("")
                }
                className="ml-auto"
              >
                <X size={16} />
              </Button>
            </div>
          )}

          {/* =================================================
              HERO
          ================================================= */}

          <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-6 text-white shadow-2xl sm:p-8">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                    <Bell size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">
                      Centre administratif
                    </p>

                    <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                      Restez informé de l'activité
                    </h2>
                  </div>
                </div>

                <p className="mt-5 max-w-xl text-xs leading-6 text-blue-100/80">
                  Centralisez les demandes de
                  vérification, la modération des
                  offres, les signalements et les
                  différentes actions nécessitant une
                  intervention administrative.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCheck size={15} />

                  Tout marquer comme lu
                </Button>

                <Button
                  type="button"
                  onClick={clearReadNotifications}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-black text-white transition hover:bg-white/15"
                >
                  <Trash2 size={15} />

                  Effacer les lues
                </Button>
              </div>
            </div>

            {/* STATS */}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <HeroStat
                icon={<Bell size={17} />}
                value={unreadCount}
                label="Notifications non lues"
              />

              <HeroStat
                icon={<ShieldCheck size={17} />}
                value={verificationCount}
                label="Éléments liés à la vérification"
              />

              <HeroStat
                icon={<AlertTriangle size={17} />}
                value={highPriorityCount}
                label="Notifications prioritaires"
              />
            </div>
          </section>

          {/* =================================================
              FILTERS
          ================================================= */}

          <section className="mt-7 rounded-[24px] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/30 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Filter size={17} />
                </div>

                <div>
                  <h3 className="text-[12px] font-black">
                    Filtrer les notifications
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Consultez rapidement les
                    événements nécessitant votre
                    attention.
                  </p>
                </div>
              </div>

              <div className="relative w-full xl:w-[330px]">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Rechercher une notification..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-medium outline-none transition focus:border-blue-300 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              <FilterButton
                active={
                  activeFilter === "all"
                }
                onClick={() =>
                  setActiveFilter("all")
                }
                label="Toutes"
                count={notifications.length}
              />

              <FilterButton
                active={
                  activeFilter === "unread"
                }
                onClick={() =>
                  setActiveFilter("unread")
                }
                label="Non lues"
                count={unreadCount}
              />

              <FilterButton
                active={
                  activeFilter ===
                  "verification"
                }
                onClick={() =>
                  setActiveFilter(
                    "verification"
                  )
                }
                label="Vérifications"
              />

              <FilterButton
                active={
                  activeFilter === "offers"
                }
                onClick={() =>
                  setActiveFilter("offers")
                }
                label="Offres"
              />

              <FilterButton
                active={
                  activeFilter === "reports"
                }
                onClick={() =>
                  setActiveFilter("reports")
                }
                label="Signalements"
              />

              <FilterButton
                active={
                  activeFilter === "users"
                }
                onClick={() =>
                  setActiveFilter("users")
                }
                label="Utilisateurs"
              />

              <FilterButton
                active={
                  activeFilter === "system"
                }
                onClick={() =>
                  setActiveFilter("system")
                }
                label="Système"
              />
            </div>
          </section>

          {/* =================================================
              NOTIFICATIONS LIST
          ================================================= */}

          <section className="mt-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Activité récente
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Vos notifications
                </h2>
              </div>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500">
                {filteredNotifications.length}{" "}
                résultat
                {filteredNotifications.length > 1
                  ? "s"
                  : ""}
              </span>
            </div>

            {filteredNotifications.length ===
            0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map(
                  (notification) => {
                    const iconConfig =
                      getNotificationIcon(
                        notification.type
                      );

                    return (
                      <article
                        key={notification.id}
                        className={`group relative overflow-visible rounded-[24px] border p-5 transition-all duration-200 ${
                          notification.isRead
                            ? "border-slate-200 bg-white"
                            : "border-blue-100 bg-blue-50/50 shadow-lg shadow-blue-100/30"
                        }`}
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 gap-4">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconConfig.className}`}
                            >
                              {iconConfig.icon}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-[12px] font-black text-slate-800">
                                  {
                                    notification.title
                                  }
                                </h3>

                                {!notification.isRead && (
                                  <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-black text-white">
                                    Nouveau
                                  </span>
                                )}

                                {notification.priority ===
                                  "high" && (
                                  <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-black text-red-600">
                                    <AlertTriangle
                                      size={10}
                                    />

                                    Priorité élevée
                                  </span>
                                )}
                              </div>

                              <p className="mt-3 max-w-3xl text-xs leading-6 text-slate-500">
                                {
                                  notification.message
                                }
                              </p>

                              <div className="mt-4 flex flex-wrap items-center gap-4">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                  <Clock3
                                    size={13}
                                  />

                                  {
                                    notification.date
                                  }
                                </span>

                                {notification.companyName && (
                                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                    <Building2
                                      size={13}
                                    />

                                    {
                                      notification.companyName
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <Button aria-label="Suivant"
                              type="button"
                              onClick={() =>
                                handleNotificationAction(
                                  notification
                                )
                              }
                              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-blue-700"
                            >
                              {
                                notification.actionLabel
                              }

                              <ChevronRight
                                size={14}
                              />
                            </Button>

                            <div className="relative">
                              <Button aria-label="Afficher les actions"
                                type="button"
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId ===
                                      notification.id
                                      ? null
                                      : notification.id
                                  )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                              >
                                <MoreHorizontal
                                  size={17}
                                />
                              </Button>

                              {openMenuId ===
                                notification.id && (
                                <div className="absolute right-0 top-12 z-30 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                                  {notification.isRead ? (
                                    <Button
                                      type="button"
                                      onClick={() =>
                                        markAsUnread(
                                          notification.id
                                        )
                                      }
                                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                      <Bell
                                        size={15}
                                      />

                                      Marquer comme non lue
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      onClick={() =>
                                        markAsRead(
                                          notification.id
                                        )
                                      }
                                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                      <Check
                                        size={15}
                                      />

                                      Marquer comme lue
                                    </Button>
                                  )}

                                  <Button
                                    type="button"
                                    onClick={() =>
                                      deleteNotification(
                                        notification.id
                                      )
                                    }
                                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2
                                      size={15}
                                    />

                                    Supprimer
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getNotificationIcon(type) {
  const config = {
    verification: {
      icon: <ShieldCheck size={20} />,
      className:
        "bg-emerald-50 text-emerald-600",
    },

    offer: {
      icon: <FileText size={20} />,
      className:
        "bg-blue-50 text-blue-600",
    },

    "edit-request": {
      icon: <Mail size={20} />,
      className:
        "bg-amber-50 text-amber-600",
    },

    report: {
      icon: (
        <ShieldAlert size={20} />
      ),
      className:
        "bg-red-50 text-red-600",
    },

    candidate: {
      icon: <User size={20} />,
      className:
        "bg-violet-50 text-violet-600",
    },

    suspension: {
      icon: <Ban size={20} />,
      className:
        "bg-red-50 text-red-600",
    },

    account: {
      icon: <UserCheck size={20} />,
      className:
        "bg-indigo-50 text-indigo-600",
    },

    information: {
      icon: <Info size={20} />,
      className:
        "bg-slate-100 text-slate-600",
    },
  };

  return (
    config[type] ||
    config.information
  );
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function HeroStat({
  icon,
  value,
  label,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-blue-100">
        {icon}

        <span className="text-xs font-bold">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-black">
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
        active
          ? "bg-blue-600 text-white"
          : "border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600"
      }`}
    >
      {label}

      {typeof count === "number" && (
        <span
          className={`flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs ${
            active
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {count}
        </span>
      )}
    </Button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Bell size={24} />
      </div>

      <h3 className="mt-5 text-[13px] font-black text-slate-700">
        Aucune notification
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-400">
        Aucune notification ne correspond aux
        critères actuellement sélectionnés.
      </p>
    </div>
  );
}

export default AdminNotificationsPage;
import { StatusBadge } from "../../components/ui";
import { StatCard, ModalFrame } from "../../components/ui";
import { Button, Input, Select } from "../../components/ui";
import { userAdapter } from "../../services/adapters";

import { useEffect } from "react";
import { api, patch, perform } from "../../services/api";
import { useResource } from "../../hooks/useResource";


import { useMemo, useState } from "react";
import { AlertCircle, ArrowDownUp, Ban, Building2, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleUserRound, Eye, FileText, LayoutDashboard, Mail, MoreHorizontal, Search, Settings, ShieldCheck, UserCheck, UserPlus, Users, X } from "lucide-react";


/* =========================================================
   DONNÉES DE DÉMONSTRATION
   À remplacer ensuite par les données de l'API Django.
   ========================================================= */

const initialUsers = [];

const navigationItems = [
  {
    id: "admin-dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    id: "admin-users",
    label: "Utilisateurs",
    icon: Users,
  },
  {
    id: "admin-recruiters",
    label: "Recruteurs",
    icon: Building2,
  },
  {
    id: "admin-offers",
    label: "Offres",
    icon: FileText,
  },
  {
    id: "admin-statistics",
    label: "Statistiques",
    icon: BarChartIcon,
  },
];

const systemItems = [
  {
    id: "admin-settings",
    label: "Paramètres",
    icon: Settings,
  },
];

/* =========================================================
   ICÔNE BAR CHART
   ========================================================= */

function BarChartIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M7 16v-5" />
      <path d="M12 16V7" />
      <path d="M17 16v-8" />
    </svg>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */



/* =========================================================
   NAVBAR
   ========================================================= */



/* =========================================================
   MOBILE HEADER
   ========================================================= */



/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */



/* =========================================================
   KPI CARD
   ========================================================= */



/* =========================================================
   FILTRE SELECT
   ========================================================= */

function FilterSelect({
  value,
  onChange,
  options,
  label,
}) {
  return (
    <div className="relative">
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

/* =========================================================
   BADGE RÔLE
   ========================================================= */

function RoleBadge({ role }) {
  if (role === "Recruteur") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
        <Building2 size={11} />
        Recruteur
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
      <CircleUserRound size={11} />
      Candidat
    </span>
  );
}

/* =========================================================
   BADGE STATUT
   ========================================================= */



/* =========================================================
   MODAL DÉTAIL UTILISATEUR
   ========================================================= */

function UserDetailsModal({
  user,
  onClose,
  onSuspend,
  onReactivate,
}) {
  if (!user) return null;

  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071A36]/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-lg font-black text-white shadow-lg shadow-blue-500/20">
              {user.initials}
            </div>

            <div>
              <h2 className="text-lg font-black text-[#071A36]">
                {user.firstName} {user.lastName}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <Button aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={17} />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail size={15} />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Adresse email
                </span>
              </div>

              <p className="mt-2 break-all text-xs font-bold text-slate-700">
                {user.email}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <UserPlus size={15} />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Inscription
                </span>
              </div>

              <p className="mt-2 text-xs font-bold text-slate-700">
                {user.registeredAt}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Check size={15} />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Dernière activité
                </span>
              </div>

              <p className="mt-2 text-xs font-bold text-slate-700">
                {user.lastActivity}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <FileText size={15} />
                <span className="text-xs font-bold uppercase tracking-wide">
                  {user.role === "Candidat"
                    ? "Candidatures"
                    : "État du compte"}
                </span>
              </div>

              <p className="mt-2 text-xs font-bold text-slate-700">
                {user.role === "Candidat"
                  ? `${user.applications} candidature${
                      user.applications > 1 ? "s" : ""
                    }`
                  : user.verified
                  ? "Entreprise vérifiée"
                  : "Vérification en attente"}
              </p>
            </div>
          </div>

          {/* Vérification */}
          <div
            className={`rounded-2xl border p-4 ${
              user.verified
                ? "border-emerald-100 bg-emerald-50/70"
                : "border-orange-100 bg-orange-50/70"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  user.verified
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {user.verified ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertCircle size={17} />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  {user.verified
                    ? "Compte vérifié"
                    : "Vérification nécessaire"}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {user.verified
                    ? "Ce compte respecte actuellement les critères de vérification de la plateforme."
                    : "Ce compte nécessite une vérification ou une action administrative avant d'être pleinement actif."}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Fermer
            </Button>

            {user.status === "Suspendu" ? (
              <Button
                type="button"
                onClick={onReactivate}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white transition hover:bg-emerald-700"
              >
                <CheckCircle2 size={15} />
                Réactiver le compte
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onSuspend}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-bold text-white transition hover:bg-red-700"
              >
                <Ban size={15} />
                Suspendre le compte
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalFrame>
  );
}

/* =========================================================
   MODAL CONFIRMATION
   ========================================================= */

function ConfirmationModal({
  action,
  user,
  onClose,
  onConfirm,
}) {
  if (!user) return null;

  const isSuspend = action === "suspend";

  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[110] flex items-center justify-center bg-[#071A36]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            isSuspend
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {isSuspend ? (
            <Ban size={24} />
          ) : (
            <CheckCircle2 size={24} />
          )}
        </div>

        <div className="mt-5 text-center">
          <h3 className="text-lg font-black text-[#071A36]">
            {isSuspend
              ? "Suspendre ce compte ?"
              : "Réactiver ce compte ?"}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {isSuspend
              ? `Le compte de ${user.firstName} ${user.lastName} ne pourra plus accéder normalement à la plateforme jusqu'à sa réactivation.`
              : `Le compte de ${user.firstName} ${user.lastName} pourra à nouveau utiliser normalement la plateforme.`}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Annuler
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            className={`h-11 flex-1 rounded-xl text-xs font-bold text-white transition ${
              isSuspend
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isSuspend ? "Suspendre" : "Réactiver"}
          </Button>
        </div>
      </div>
    </ModalFrame>
  );
}

/* =========================================================
   LIGNE UTILISATEUR DESKTOP
   ========================================================= */

function UserRow({
  user,
  onView,
  onAction,
}) {
  return (
    <div className="group hidden grid-cols-[minmax(220px,1.5fr)_130px_120px_130px_120px_45px] items-center gap-3 border-b border-slate-100 px-5 py-4 transition-colors duration-300 last:border-b-0 hover:bg-slate-50/70 xl:grid">
      {/* Utilisateur */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-xs font-black text-white shadow-sm">
          {user.initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-800">
            {user.firstName} {user.lastName}
          </p>

          <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
            {user.email}
          </p>
        </div>
      </div>

      {/* Rôle */}
      <div>
        <RoleBadge role={user.role} />
      </div>

      {/* Statut */}
      <div>
        <StatusBadge status={user.status} />
      </div>

      {/* Inscription */}
      <div>
        <p className="text-xs font-semibold text-slate-600">
          {user.registeredAt}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          Inscription
        </p>
      </div>

      {/* Activité */}
      <div>
        <p className="text-xs font-semibold text-slate-600">
          {user.lastActivity}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          Dernière activité
        </p>
      </div>

      {/* Actions */}
      <div className="relative flex justify-end">
        <Button aria-label="Afficher les actions"
          type="button"
          onClick={() => onAction(user)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
          title="Actions"
        >
          <MoreHorizontal size={17} />
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
   CARTE UTILISATEUR MOBILE
   ========================================================= */

function UserMobileCard({
  user,
  onView,
  onAction,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm xl:hidden">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-xs font-black text-white">
          {user.initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">
                {user.firstName} {user.lastName}
              </p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                {user.email}
              </p>
            </div>

            <Button aria-label="Afficher les actions"
              type="button"
              onClick={() => onAction(user)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500"
            >
              <MoreHorizontal size={16} />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Inscription
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-600">
                {user.registeredAt}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Activité
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-600">
                {user.lastActivity}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => onView(user)}
            className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-blue-50 text-xs font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white"
          >
            <Eye size={14} />
            Voir le profil
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DROPDOWN ACTIONS
   ========================================================= */

function ActionMenu({
  user,
  onView,
  onSuspend,
  onReactivate,
  onClose,
}) {
  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[80]" onClick={onClose}>
      <div
        className="absolute right-5 top-1/2 w-52 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl lg:right-24 xl:right-28"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          type="button"
          onClick={() => onView(user)}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Eye size={15} />
          Voir le profil
        </Button>

        <Button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-600 transition hover:bg-slate-50"
        >
          <Mail size={15} />
          Contacter
        </Button>

        <div className="my-1 border-t border-slate-100" />

        {user.status === "Suspendu" ? (
          <Button
            type="button"
            onClick={() => onReactivate(user)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-emerald-600 transition hover:bg-emerald-50"
          >
            <CheckCircle2 size={15} />
            Réactiver
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => onSuspend(user)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-600 transition hover:bg-red-50"
          >
            <Ban size={15} />
            Suspendre
          </Button>
        )}
      </div>
    </ModalFrame>
  );
}

/* =========================================================
   SKELETON
   ========================================================= */

function UsersSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-9 w-72 rounded-xl bg-slate-200" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 rounded-3xl bg-white"
          />
        ))}
      </div>

      <div className="h-[600px] rounded-3xl bg-white" />
    </div>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export default function AdminUsersPage({
  user,
  onNavigate,
  onLogout,
}) {
  const [users, setUsers] = useResource("/administration/users/",list=>list.map(u=>({...userAdapter(u),role:userAdapter(u).roleLabel})));
  const loading = false;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");

  const [selectedUser, setSelectedUser] = useState(null);
  const [actionUser, setActionUser] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 8;

  

  /* =======================================================
     STATISTIQUES
     ======================================================= */

  const statistics = useMemo(() => {
    return {
      total: users.length,
      candidates: users.filter(
        (item) => item.role === "Candidat"
      ).length,
      recruiters: users.filter(
        (item) => item.role === "Recruteur"
      ).length,
      suspended: users.filter(
        (item) => item.status === "Suspendu"
      ).length,
    };
  }, [users]);

  /* =======================================================
     FILTRAGE
     ======================================================= */

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return users.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        `${item.firstName} ${item.lastName}`
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.email.toLowerCase().includes(normalizedSearch);

      const matchesRole =
        roleFilter === "Tous" ||
        item.role === roleFilter;

      const matchesStatus =
        statusFilter === "Tous" ||
        item.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / usersPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (safePage - 1) * usersPerPage,
    safePage * usersPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  /* =======================================================
     ACTIONS
     ======================================================= */

  const handleSuspendRequest = (targetUser) => {
    setActionUser(null);
    setSelectedUser(null);
    setConfirmation({
      action: "suspend",
      user: targetUser,
    });
  };

  const handleReactivateRequest = (targetUser) => {
    setActionUser(null);
    setSelectedUser(null);
    setConfirmation({
      action: "reactivate",
      user: targetUser,
    });
  };

  const handleViewUser = (targetUser) => {
    setSelectedUser(null);
    setActionUser(null);

    const destination =
      targetUser.role === "Recruteur"
        ? "admin-recruiter-detail"
        : "admin-candidate-detail";

    onNavigate?.(destination, targetUser.id);
  };

  const handleConfirmAction = () => perform(async () => {if(!confirmation?.user)return;await patch("/administration/users/"+confirmation.user.id+"/",{is_suspended:confirmation.action==="suspend"});setUsers((await api("/administration/users/")).map(u=>({...userAdapter(u),role:userAdapter(u).roleLabel})));setConfirmation(null);});

  const handleNavigate = (destination) => {
    onNavigate?.(destination);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8fc]">
        

        <main className="min-h-screen ">
          

          <div className="p-5 sm:p-6 lg:p-8">
            <UsersSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-800">
      

      <main className="min-h-screen pb-24  lg:pb-0">
        

        

        <div className="p-4 sm:p-6 lg:p-8">
          {/* =================================================
              HEADER
             ================================================= */}
          <section className="mb-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Users size={18} />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                    Administration
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-[#071A36] sm:text-3xl">
                  Gestion des utilisateurs
                </h1>

                <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                  Consultez, recherchez et gérez les comptes présents
                  sur la plateforme JobConnect.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => handleNavigate("admin-statistics")}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <BarChartIcon size={15} />
                  Statistiques
                </Button>
              </div>
            </div>
          </section>

          {/* =================================================
              KPI
             ================================================= */}
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total utilisateurs"
              value={statistics.total.toLocaleString("fr-FR")}
              description="Comptes enregistrés"
              color="blue"
            />

            <StatCard
              icon={CircleUserRound}
              label="Candidats"
              value={statistics.candidates.toLocaleString("fr-FR")}
              description="Profils candidats"
              color="violet"
            />

            <StatCard
              icon={Building2}
              label="Recruteurs"
              value={statistics.recruiters.toLocaleString("fr-FR")}
              description="Comptes recruteurs"
              color="emerald"
            />

            <StatCard
              icon={Ban}
              label="Comptes suspendus"
              value={statistics.suspended.toLocaleString("fr-FR")}
              description="Nécessitent une attention"
              color="orange"
            />
          </section>

          {/* =================================================
              TABLE PRINCIPALE
             ================================================= */}
          <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            {/* Header table */}
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#071A36]">
                    Tous les utilisateurs
                  </h2>

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {filteredUsers.length} résultat
                    {filteredUsers.length > 1 ? "s" : ""} correspondant
                    {filteredUsers.length > 1 ? "s" : ""} aux filtres
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {/* Recherche */}
                  <div className="relative min-w-0 sm:w-64">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <Input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Rechercher un utilisateur..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    {search && (
                      <Button aria-label="Fermer"
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                      >
                        <X size={13} />
                      </Button>
                    )}
                  </div>

                  <FilterSelect
                    label="Filtrer par rôle"
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={[
                      { value: "Tous", label: "Tous les rôles" },
                      { value: "Candidat", label: "Candidats" },
                      { value: "Recruteur", label: "Recruteurs" },
                    ]}
                  />

                  <FilterSelect
                    label="Filtrer par statut"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: "Tous", label: "Tous les statuts" },
                      { value: "Actif", label: "Actifs" },
                      {
                        value: "En attente",
                        label: "En attente",
                      },
                      {
                        value: "Suspendu",
                        label: "Suspendus",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Barre de résultats */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs font-bold text-slate-500">
                  Données synchronisées
                </span>
              </div>

              <Button
                type="button"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-blue-600"
              >
                <ArrowDownUp size={13} />
                Trier
              </Button>
            </div>

            {/* Entêtes desktop */}
            <div className="hidden grid-cols-[minmax(220px,1.5fr)_130px_120px_130px_120px_45px] items-center gap-3 border-b border-slate-100 bg-white px-5 py-3 xl:grid">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Utilisateur
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Rôle
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Statut
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Inscription
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Activité
              </span>

              <span />
            </div>

            {/* Desktop */}
            <div>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((item) => (
                  <UserRow
                    key={item.id}
                    user={item}
                    onView={handleViewUser}
                    onAction={setActionUser}
                  />
                ))
              ) : (
                <div className="hidden px-6 py-20 text-center xl:block">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Search size={23} />
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold text-slate-700">
                    Aucun utilisateur trouvé
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Modifiez votre recherche ou vos filtres.
                  </p>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="space-y-3 bg-slate-50/50 p-3 xl:hidden">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((item) => (
                  <UserMobileCard
                    key={item.id}
                    user={item}
                    onView={handleViewUser}
                    onAction={setActionUser}
                  />
                ))
              ) : (
                <div className="px-4 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Search size={23} />
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold text-slate-700">
                    Aucun utilisateur trouvé
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Modifiez votre recherche ou vos filtres.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs font-semibold text-slate-400">
                Affichage de{" "}
                <span className="font-bold text-slate-600">
                  {filteredUsers.length === 0
                    ? 0
                    : (safePage - 1) * usersPerPage + 1}
                </span>{" "}
                à{" "}
                <span className="font-bold text-slate-600">
                  {Math.min(
                    safePage * usersPerPage,
                    filteredUsers.length
                  )}
                </span>{" "}
                sur{" "}
                <span className="font-bold text-slate-600">
                  {filteredUsers.length}
                </span>
              </p>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <Button aria-label="Précédent"
                  type="button"
                  disabled={safePage === 1}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <Button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold transition ${
                        safePage === page
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button aria-label="Suivant"
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          </section>

          {/* =================================================
              INFO ADMIN
             ================================================= */}
          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <p className="text-xs font-bold text-blue-900">
                    Contrôle des comptes
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-blue-700/70">
                    Les actions sensibles sont réservées aux
                    administrateurs autorisés.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <UserCheck size={17} />
                </div>

                <div>
                  <p className="text-xs font-bold text-violet-900">
                    Vérification
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-violet-700/70">
                    Les recruteurs peuvent nécessiter une validation
                    supplémentaire.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <AlertCircle size={17} />
                </div>

                <div>
                  <p className="text-xs font-bold text-orange-900">
                    Actions à surveiller
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-orange-700/70">
                    Les comptes suspendus doivent être régulièrement
                    contrôlés.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* =====================================================
          MOBILE NAV
         ===================================================== */}
      

      {/* =====================================================
          MODAL DÉTAIL
         ===================================================== */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuspend={() => handleSuspendRequest(selectedUser)}
          onReactivate={() =>
            handleReactivateRequest(selectedUser)
          }
        />
      )}

      {/* =====================================================
          MENU ACTION
         ===================================================== */}
      {actionUser && (
        <ActionMenu
          user={actionUser}
          onClose={() => setActionUser(null)}
          onView={handleViewUser}
          onSuspend={handleSuspendRequest}
          onReactivate={handleReactivateRequest}
        />
      )}

      {/* =====================================================
          CONFIRMATION
         ===================================================== */}
      {confirmation && (
        <ConfirmationModal
          action={confirmation.action}
          user={confirmation.user}
          onClose={() => setConfirmation(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
import FloatingPanel from "../../components/common/FloatingPanel";
import { useRef } from "react";
import { StatusBadge } from "../../components/ui";
import { StatCard, ModalFrame } from "../../components/ui";
import { Button, Input, Select } from "../../components/ui";



import { api, post, perform } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { companyAdapter } from "../../services/adapters";

import { useMemo, useState } from "react";
import { Ban, Building2, Check, CheckCircle2, ChevronDown, Clock3, Eye, FileCheck2, FileSearch, LayoutDashboard, Mail, MoreHorizontal, RefreshCw, Search, Settings, ShieldCheck, Sparkles, UserCheck, UserRound, Users, X, XCircle } from "lucide-react";


/* =========================================================
   DONNÉES DE DÉMONSTRATION
========================================================= */

const initialRecruiters = [];

/* =========================================================
   NAVIGATION
========================================================= */

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
    icon: UserCheck,
  },
  {
    id: "admin-offers",
    label: "Offres",
    icon: FileSearch,
  },
  {
    id: "admin-statistics",
    label: "Statistiques",
    icon: Sparkles,
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
   UTILITAIRES
========================================================= */

function getInitials(firstName, lastName) {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
}

function getStatusStyle(status) {
  switch (status) {
    case "Vérifié":
      return {
        wrapper: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
      };

    case "En attente":
      return {
        wrapper: "border-orange-200 bg-orange-50 text-orange-700",
        dot: "bg-orange-500",
        icon: Clock3,
      };

    case "Suspendu":
      return {
        wrapper: "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500",
        icon: Ban,
      };

    default:
      return {
        wrapper: "border-slate-200 bg-slate-50 text-slate-600",
        dot: "bg-slate-400",
        icon: Clock3,
      };
  }
}

/* =========================================================
   SIDEBAR
========================================================= */



/* =========================================================
   NAVBAR
========================================================= */



/* =========================================================
   MOBILE NAV
========================================================= */



/* =========================================================
   SKELETON
========================================================= */

function RecruiterSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />

        <div className="flex-1">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
        </div>

        <div className="hidden h-8 w-24 rounded-full bg-slate-100 md:block" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="h-16 rounded-xl bg-slate-100" />
        <div className="h-16 rounded-xl bg-slate-100" />
        <div className="h-16 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */



/* =========================================================
   STATUS BADGE
========================================================= */



/* =========================================================
   ACTION MENU
========================================================= */

const adminRecruiterAdapter = company => ({ ...companyAdapter(company), status: company.is_suspended ? "Suspendu" : ({ VERIFIED: "Vérifié", PENDING: "En attente", REJECTED: "Refusé" }[company.verification_status] || "Non vérifié") });

function ActionMenu({
  recruiter,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  return (
    <div ref={anchorRef} className="relative">
      <Button aria-label="Afficher les actions" aria-expanded={open}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      >
        <MoreHorizontal size={17} />
      </Button>

      {open && (
        <FloatingPanel anchorRef={anchorRef} onClose={() => setOpen(false)}>
            <Button
              type="button"
              onClick={() => {
                setOpen(false);
                onView?.(recruiter);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Eye size={15} />
              Voir le profil
            </Button>

            {recruiter.status === "En attente" && (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onApprove?.(recruiter);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
                >
                  <Check size={15} />
                  Valider le recruteur
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onReject?.(recruiter);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <XCircle size={15} />
                  Refuser la demande
                </Button>
              </>
            )}

            {!recruiter.is_suspended && (
              <Button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSuspend?.(recruiter);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                <Ban size={15} />
                Suspendre le recruteur
              </Button>
            )}

            {recruiter.is_suspended && (
              <Button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onReactivate?.(recruiter);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
              >
                <RefreshCw size={15} />
                Réactiver le recruteur
              </Button>
            )}
        </FloatingPanel>
      )}
    </div>
  );
}

/* =========================================================
   DETAILS MODAL
========================================================= */

function RecruiterDetailsModal({ recruiter, onClose }) {
  if (!recruiter) return null;

  const initials = getInitials(recruiter.firstName, recruiter.lastName);

  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[70] flex items-center justify-center bg-[#071A36]/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
              Profil recruteur
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#071A36]">
              Informations de l’entreprise
            </h2>
          </div>

          <Button aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5 sm:p-7">
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg font-black text-white shadow-lg">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-[#071A36]">
                  {recruiter.company}
                </h3>
                <StatusBadge status={recruiter.status} />
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {recruiter.firstName} {recruiter.lastName} · {recruiter.sector}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Compte créé le {recruiter.registeredAt}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoBlock
              icon={UserRound}
              label="Responsable"
              value={`${recruiter.firstName} ${recruiter.lastName}`}
            />

            <InfoBlock
              icon={Mail}
              label="Email professionnel"
              value={recruiter.email}
            />

            <InfoBlock
              icon={Building2}
              label="Secteur"
              value={recruiter.sector}
            />

            <InfoBlock
              icon={Building2}
              label="Localisation"
              value={recruiter.city}
            />

            <InfoBlock
              icon={Users}
              label="Effectif"
              value={`${recruiter.employees} employés`}
            />

            <InfoBlock
              icon={FileCheck2}
              label="NUI"
              value={recruiter.nui}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricBox label="Offres publiées" value={recruiter.offers} />
            <MetricBox
              label="Candidatures reçues"
              value={recruiter.applications}
            />
            <MetricBox
              label="Statut"
              value={recruiter.status}
              compact
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Présentation
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {recruiter.description}
            </p>
          </div>

          {recruiter.website && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <Building2 size={16} />
              <span className="font-medium">{recruiter.website}</span>
            </div>
          )}
        </div>
      </div>
    </ModalFrame>
  );
}

function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={15} />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function MetricBox({ label, value, compact = false }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 font-black text-[#071a36] ${
          compact ? "text-sm" : "text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   CONFIRMATION MODAL
========================================================= */

function ConfirmationModal({
  type,
  recruiter,
  onClose,
  onConfirm,
}) {
  if (!recruiter) return null;

  const configs = {
    approve: {
      title: "Valider ce recruteur ?",
      description:
        "Le compte sera marqué comme vérifié et le recruteur pourra utiliser pleinement les fonctionnalités de son espace.",
      button: "Valider le recruteur",
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-600",
      buttonClass: "bg-emerald-600 hover:bg-emerald-700",
    },
    reject: {
      title: "Refuser cette demande ?",
      description:
        "Le compte ne sera pas validé. Cette action peut nécessiter une justification qui sera communiquée au recruteur.",
      button: "Refuser la demande",
      icon: XCircle,
      iconClass: "bg-red-100 text-red-600",
      buttonClass: "bg-red-600 hover:bg-red-700",
    },
    suspend: {
      title: "Suspendre ce recruteur ?",
      description:
        "Le recruteur ne pourra plus utiliser normalement son espace tant que son compte restera suspendu.",
      button: "Suspendre le compte",
      icon: Ban,
      iconClass: "bg-red-100 text-red-600",
      buttonClass: "bg-red-600 hover:bg-red-700",
    },
    reactivate: {
      title: "Réactiver ce recruteur ?",
      description:
        "Le compte sera de nouveau actif et le recruteur pourra accéder à son espace.",
      button: "Réactiver le compte",
      icon: RefreshCw,
      iconClass: "bg-emerald-100 text-emerald-600",
      buttonClass: "bg-emerald-600 hover:bg-emerald-700",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[80] flex items-center justify-center bg-[#071A36]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconClass}`}
        >
          <Icon size={25} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-[#071A36]">
          {config.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {config.description}
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-800">
            {recruiter.company}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {recruiter.firstName} {recruiter.lastName} · {recruiter.email}
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Annuler
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition ${config.buttonClass}`}
          >
            {config.button}
          </Button>
        </div>
      </div>
    </ModalFrame>
  );
}

/* =========================================================
   LIGNE DESKTOP
========================================================= */

function RecruiterRow({
  recruiter,
  onNavigate,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}) {
  const initials = getInitials(recruiter.firstName, recruiter.lastName);

  return (
    <tr className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div className="flex min-w-[230px] items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white shadow-md">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              {recruiter.company}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {recruiter.firstName} {recruiter.lastName}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="max-w-[220px] truncate text-xs font-medium text-slate-700">
            {recruiter.email}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {recruiter.city} · {recruiter.sector}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={recruiter.status} />
      </td>

      <td className="px-5 py-4 text-center">
        <p className="text-sm font-bold text-slate-800">
          {recruiter.offers}
        </p>
        <p className="text-xs text-slate-400">offres</p>
      </td>

      <td className="px-5 py-4 text-center">
        <p className="text-sm font-bold text-slate-800">
          {recruiter.applications}
        </p>
        <p className="text-xs text-slate-400">candidatures</p>
      </td>

      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            onClick={() =>
              onNavigate(
                "admin-recruiter-detail",
                recruiter.id
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            aria-label="Voir les détails"
            title="Voir les détails"
          >
            <Eye size={16} />
          </Button>

          <ActionMenu
            recruiter={recruiter}
            onView={onView}
            onApprove={onApprove}
            onReject={onReject}
            onSuspend={onSuspend}
            onReactivate={onReactivate}
          />
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   CARTE MOBILE
========================================================= */

function RecruiterMobileCard({
  recruiter,
  onNavigate,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}) {
  const initials = getInitials(recruiter.firstName, recruiter.lastName);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white shadow-md">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">
                {recruiter.company}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {recruiter.firstName} {recruiter.lastName}
              </p>
            </div>

            <ActionMenu
              recruiter={recruiter}
              onView={onView}
              onApprove={onApprove}
              onReject={onReject}
              onSuspend={onSuspend}
              onReactivate={onReactivate}
            />
          </div>

          <div className="mt-2">
            <StatusBadge status={recruiter.status} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MetricBox label="Offres" value={recruiter.offers} />
        <MetricBox label="Candidatures" value={recruiter.applications} />
        <MetricBox label="Ville" value={recruiter.city} compact />
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
        <Mail size={13} />
        <span className="truncate">{recruiter.email}</span>
      </div>

      <Button
        type="button"
        onClick={() =>
          onNavigate(
            "admin-recruiter-detail",
            recruiter.id
          )
        }
        className="flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        aria-label="Voir les détails"
        title="Voir les détails"
      >
        <Eye size={16} />
      </Button>
    </div>
  );
}

/* =========================================================
   PAGE PRINCIPALE
========================================================= */

export default function AdminRecruitersPage({
  user,
  onNavigate,
  onLogout,
}) {
  const [recruiters, setRecruiters] = useResource("/administration/entreprises/",list=>list.map(adminRecruiterAdapter));
  const loading = false;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [sectorFilter, setSectorFilter] = useState("Tous");
  const [sortBy, setSortBy] = useState("recent");

  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  

  const stats = useMemo(() => {
    const total = recruiters.length;
    const verified = recruiters.filter(
      (item) => item.status === "Vérifié"
    ).length;
    const pending = recruiters.filter(
      (item) => item.status === "En attente"
    ).length;
    const suspended = recruiters.filter(
      (item) => item.status === "Suspendu"
    ).length;

    return {
      total,
      verified,
      pending,
      suspended,
    };
  }, [recruiters]);

  const sectors = useMemo(() => {
    return [
      "Tous",
      ...Array.from(new Set(recruiters.map((item) => item.sector))),
    ];
  }, [recruiters]);

  const filteredRecruiters = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = recruiters.filter((recruiter) => {
      const matchesSearch =
        !normalizedSearch ||
        recruiter.company.toLowerCase().includes(normalizedSearch) ||
        `${recruiter.firstName} ${recruiter.lastName}`
          .toLowerCase()
          .includes(normalizedSearch) ||
        recruiter.email.toLowerCase().includes(normalizedSearch) ||
        recruiter.city.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "Tous" || recruiter.status === statusFilter;

      const matchesSector =
        sectorFilter === "Tous" || recruiter.sector === sectorFilter;

      return matchesSearch && matchesStatus && matchesSector;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "offers") {
        return b.offers - a.offers;
      }

      if (sortBy === "applications") {
        return b.applications - a.applications;
      }

      if (sortBy === "pending") {
        return Number(b.status === "En attente") - Number(a.status === "En attente");
      }

      return b.id - a.id;
    });
  }, [recruiters, search, statusFilter, sectorFilter, sortBy]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleApprove = (recruiter) => {
    setConfirmation({
      type: "approve",
      recruiter,
    });
  };

  const handleReject = (recruiter) => {
    setConfirmation({
      type: "reject",
      recruiter,
    });
  };

  const handleSuspend = (recruiter) => {
    setConfirmation({
      type: "suspend",
      recruiter,
    });
  };

  const handleReactivate = (recruiter) => {
    setConfirmation({
      type: "reactivate",
      recruiter,
    });
  };

  const handleConfirmAction = () => perform(async () => {if(!confirmation?.recruiter)return;await post("/administration/entreprises/"+confirmation.recruiter.id+"/",{action:confirmation.type==="approve"?"verify":confirmation.type,motif:confirmation.type==="reject"?"Dossier à compléter":""});setRecruiters((await api("/administration/entreprises/")).map(adminRecruiterAdapter));setConfirmation(null);});

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("Tous");
    setSectorFilter("Tous");
    setSortBy("recent");
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-800">
      

      

      <main className="">
        <div className="mx-auto max-w-[1500px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A36] via-[#0b2c5c] to-[#087ca3] p-6 text-white shadow-2xl sm:p-8">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-200 backdrop-blur">
                  <ShieldCheck size={14} />
                  Contrôle des recruteurs
                </div>

                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Gérez et vérifiez les recruteurs
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Contrôlez les demandes de vérification, surveillez les
                  comptes entreprises et assurez la fiabilité des recruteurs
                  présents sur JobConnect.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    À traiter
                  </p>

                  <p className="mt-1 text-3xl font-black">
                    {stats.pending}
                  </p>

                  <p className="text-xs text-orange-300">
                    demandes en attente
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total recruteurs"
              value={stats.total}
              description="Comptes présents sur JobConnect"
              icon={Users}
              gradient="from-blue-600 to-cyan-500"
            />

            <StatCard
              label="Recruteurs vérifiés"
              value={stats.verified}
              description="Comptes validés par l'administration"
              icon={ShieldCheck}
              gradient="from-emerald-500 to-teal-500"
            />

            <StatCard
              label="En attente"
              value={stats.pending}
              description="Demandes nécessitant une action"
              icon={Clock3}
              gradient="from-orange-500 to-amber-500"
            />

            <StatCard
              label="Suspendus"
              value={stats.suspended}
              description="Comptes actuellement suspendus"
              icon={Ban}
              gradient="from-red-500 to-rose-500"
            />
          </section>

          {/* FILTRES */}
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#071A36]">
                    Liste des recruteurs
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {filteredRecruiters.length} résultat
                    {filteredRecruiters.length > 1 ? "s" : ""} affiché
                    {filteredRecruiters.length > 1 ? "s" : ""}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleResetFilters}
                  className="self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 lg:self-auto"
                >
                  Réinitialiser les filtres
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.7fr)_180px_210px_180px]">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher une entreprise, un recruteur..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div className="relative">
                  <Select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="Vérifié">Vérifiés</option>
                    <option value="En attente">En attente</option>
                    <option value="Suspendu">Suspendus</option>
                  </Select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <Select
                    value={sectorFilter}
                    onChange={(event) =>
                      setSectorFilter(event.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector === "Tous" ? "Tous les secteurs" : sector}
                      </option>
                    ))}
                  </Select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <Select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="offers">Plus d’offres</option>
                    <option value="applications">Plus de candidatures</option>
                    <option value="pending">Demandes en attente</option>
                  </Select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* CONTENU */}
          <section className="mt-5">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <RecruiterSkeleton />
                <RecruiterSkeleton />
                <RecruiterSkeleton />
                <RecruiterSkeleton />
                <RecruiterSkeleton />
                <RecruiterSkeleton />
              </div>
            ) : filteredRecruiters.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={24} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-[#071A36]">
                  Aucun recruteur trouvé
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Aucun compte ne correspond aux critères de recherche
                  actuels.
                </p>

                <Button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 rounded-xl bg-[#071A36] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900"
                >
                  Réinitialiser
                </Button>
              </div>
            ) : (
              <>
                {/* DESKTOP */}
                <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Entreprise
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Coordonnées
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Statut
                          </th>

                          <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Offres
                          </th>

                          <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Candidatures
                          </th>

                          <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredRecruiters.map((recruiter) => (
                          <RecruiterRow
                            key={recruiter.id}
                            recruiter={recruiter}
                            onNavigate={onNavigate}
                            onView={setSelectedRecruiter}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onSuspend={handleSuspend}
                            onReactivate={handleReactivate}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MOBILE / TABLET */}
                <div className="grid gap-4 md:grid-cols-2 lg:hidden">
                  {filteredRecruiters.map((recruiter) => (
                    <RecruiterMobileCard
                      key={recruiter.id}
                      recruiter={recruiter}
                      onNavigate={onNavigate}
                      onView={setSelectedRecruiter}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onSuspend={handleSuspend}
                      onReactivate={handleReactivate}
                    />
                  ))}
                </div>
              </>
            )}
          </section>

          {/* INFORMATION */}
          <section className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                <FileCheck2 size={19} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#071A36]">
                Vérification des entreprises
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Vérifiez les informations professionnelles avant de confirmer
                le statut d’un recruteur.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg">
                <Clock3 size={19} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#071A36]">
                Demandes en attente
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Les comptes en attente doivent être examinés avant d'obtenir
                le badge de vérification.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg">
                <ShieldCheck size={19} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#071A36]">
                Sécurité de la plateforme
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                La suspension permet de limiter temporairement l’accès d’un
                recruteur en cas de problème.
              </p>
            </div>
          </section>
        </div>
      </main>

      

      {selectedRecruiter && (
        <RecruiterDetailsModal
          recruiter={selectedRecruiter}
          onClose={() => setSelectedRecruiter(null)}
        />
      )}

      {confirmation && (
        <ConfirmationModal
          type={confirmation.type}
          recruiter={confirmation.recruiter}
          onClose={() => setConfirmation(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}

import FloatingPanel from "../../components/common/FloatingPanel";
import { useRef } from "react";
import { StatusBadge } from "../../components/ui";
import { StatCard, ModalFrame } from "../../components/ui";
import { Button, Input, Select } from "../../components/ui";



import { api, post, perform } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { jobAdapter } from "../../services/adapters";

import { useMemo, useState } from "react";
import { ArrowRight, Ban, BriefcaseBusiness, Building2, Check, CheckCircle2, ChevronDown, Clock3, Eye, FileCheck2, FileSearch, LayoutDashboard, Mail, MapPin, MoreHorizontal, RefreshCw, Search, Settings, ShieldCheck, Sparkles, Users, X, XCircle } from "lucide-react";


/* =========================================================
   DONNÉES DE DÉMONSTRATION
========================================================= */

const initialOffers = [];

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
    icon: ShieldCheck,
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

function getInitials(firstName = "", lastName = "") {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getOfferStatusStyle(status) {
  switch (status) {
    case "Publiée":
      return {
        wrapper: "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
      };

    case "En attente":
      return {
        wrapper: "border-orange-200 bg-orange-50 text-orange-700",
        icon: Clock3,
      };

    case "Suspendue":
      return {
        wrapper: "border-red-200 bg-red-50 text-red-700",
        icon: Ban,
      };

    case "Rejetée":
      return {
        wrapper: "border-rose-200 bg-rose-50 text-rose-700",
        icon: XCircle,
      };

    default:
      return {
        wrapper: "border-slate-200 bg-slate-50 text-slate-600",
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
   MOBILE NAVIGATION
========================================================= */



/* =========================================================
   SKELETON
========================================================= */

function OfferSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />

        <div className="flex-1">
          <div className="h-4 w-56 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-40 rounded bg-slate-100" />
        </div>

        <div className="h-8 w-24 rounded-full bg-slate-100" />
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
   STAT CARD
========================================================= */



/* =========================================================
   BADGE STATUT
========================================================= */



/* =========================================================
   ACTION MENU
========================================================= */

function ActionMenu({
  offer,
  onNavigate,
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
                onNavigate?.("admin-offer-detail", offer.id);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Eye size={15} />
              Voir l'offre
            </Button>

            {["BROUILLON", "EN_ATTENTE"].includes(offer.statut) && (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onApprove?.(offer);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
                >
                  <Check size={15} />
                  Valider l'offre
                </Button>

                {offer.statut === "EN_ATTENTE" && <Button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onReject?.(offer);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <XCircle size={15} />
                  Rejeter l'offre
                </Button>}
              </>
            )}

            {["BROUILLON", "EN_ATTENTE", "PUBLIEE"].includes(offer.statut) && (
              <Button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSuspend?.(offer);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                <Ban size={15} />
                Bloquer l'offre
              </Button>
            )}

            {offer.statut === "SUSPENDUE" && (
              <Button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onReactivate?.(offer);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
              >
                <RefreshCw size={15} />
                Réactiver l'offre
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

function OfferDetailsModal({
  offer,
  onClose,
}) {
  if (!offer) return null;

  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[70] flex items-center justify-center bg-[#071A36]/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
              Modération
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#071A36]">
              Détails de l'offre
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
          {/* TITLE */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
                  <BriefcaseBusiness size={25} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-black text-[#071A36]">
                    {offer.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={13} />
                      {offer.company}
                    </span>

                    <span className="text-slate-300">•</span>

                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} />
                      {offer.location}
                    </span>
                  </div>
                </div>
              </div>

              <StatusBadge status={offer.status} />
            </div>
          </div>

          {/* INFOS */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailBox
              label="Contrat"
              value={offer.contract}
            />

            <DetailBox
              label="Expérience"
              value={offer.experience}
            />

            <DetailBox
              label="Rémunération"
              value={offer.salary}
            />

            <DetailBox
              label="Candidatures"
              value={offer.applications}
            />
          </div>

          {/* RECRUTEUR */}
          <div className="mt-5 rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={17}
                className="text-blue-600"
              />

              <h3 className="text-sm font-bold text-[#071A36]">
                Recruteur
              </h3>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailBox
                label="Entreprise"
                value={offer.company}
              />

              <DetailBox
                label="Responsable"
                value={offer.recruiter}
              />

              <DetailBox
                label="Email"
                value={offer.email}
              />

              <DetailBox
                label="Secteur"
                value={offer.sector}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-5 rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Description
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {offer.description}
            </p>
          </div>

          {/* COMPETENCES */}
          <div className="mt-5 rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Compétences recherchées
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {offer.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* DIPLOME */}
          <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
            <div className="flex items-start gap-3">
              <FileCheck2
                size={18}
                className="mt-0.5 shrink-0 text-violet-600"
              />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet-500">
                  Diplôme requis
                </p>

                <p className="mt-2 text-sm font-semibold text-violet-900">
                  {offer.diploma}
                </p>
              </div>
            </div>
          </div>

          {/* DATES */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <DetailBox
              label="Créée le"
              value={offer.createdAt}
            />

            <DetailBox
              label="Publiée le"
              value={offer.publishedAt || "Non publiée"}
            />

            <DetailBox
              label="Date limite"
              value={offer.deadline}
            />
          </div>
        </div>
      </div>
    </ModalFrame>
  );
}

function DetailBox({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-slate-800">
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
  offer,
  onClose,
  onConfirm,
}) {
  if (!offer) return null;

  const configs = {
    approve: {
      title: "Valider cette offre ?",
      description:
        "L'offre sera validée et pourra être publiée sur JobConnect afin d'être visible par les candidats.",
      button: "Valider l'offre",
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-600",
      buttonClass: "bg-emerald-600 hover:bg-emerald-700",
    },

    reject: {
      title: "Rejeter cette offre ?",
      description:
        "L'offre ne sera pas publiée. Une justification pourra être communiquée au recruteur.",
      button: "Rejeter l'offre",
      icon: XCircle,
      iconClass: "bg-red-100 text-red-600",
      buttonClass: "bg-red-600 hover:bg-red-700",
    },

    suspend: {
      title: "Bloquer cette offre ?",
      description:
        "L'offre ne sera plus accessible normalement aux candidats jusqu'à sa réactivation.",
      button: "Bloquer l'offre",
      icon: Ban,
      iconClass: "bg-red-100 text-red-600",
      buttonClass: "bg-red-600 hover:bg-red-700",
    },

    reactivate: {
      title: "Réactiver cette offre ?",
      description:
        "Le blocage sera levé. Une offre déjà validée sera republiée ; un brouillon restera à valider.",
      button: "Réactiver l'offre",
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
            {offer.title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {offer.company} · {offer.location}
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

function OfferRow({
  offer,
  onNavigate,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}) {
  return (
    <tr className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div className="flex min-w-[290px] items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
            <BriefcaseBusiness size={18} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              {offer.title}
            </p>

            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <Building2 size={11} />
              {offer.company}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="text-xs font-semibold text-slate-700">
            {offer.recruiter}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {offer.email}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
            {offer.contract}
          </span>

          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {offer.location}
          </span>
        </div>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={offer.status} />
      </td>

      <td className="px-5 py-4 text-center">
        <p className="text-sm font-bold text-slate-800">
          {offer.applications}
        </p>

        <p className="text-xs text-slate-400">
          candidatures
        </p>
      </td>

      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button aria-label="Consulter"
            type="button"
            onClick={() => onNavigate?.("admin-offer-detail", offer.id)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            title="Voir l'offre"
          >
            <Eye size={16} />
          </Button>

          <ActionMenu
            offer={offer}
            onNavigate={onNavigate}
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

function OfferMobileCard({
  offer,
  onNavigate,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
          <BriefcaseBusiness size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800">
                {offer.title}
              </p>

              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <Building2 size={12} />
                {offer.company}
              </p>
            </div>

            <ActionMenu
              offer={offer}
              onNavigate={onNavigate}
              onView={onView}
              onApprove={onApprove}
              onReject={onReject}
              onSuspend={onSuspend}
              onReactivate={onReactivate}
            />
          </div>

          <div className="mt-3">
            <StatusBadge status={offer.status} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
          {offer.contract}
        </span>

        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
          <MapPin size={11} />
          {offer.location}
        </span>

        <span className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700">
          {offer.experience}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <DetailBox
          label="Candidatures"
          value={offer.applications}
        />

        <DetailBox
          label="Secteur"
          value={offer.sector}
        />

        <DetailBox
          label="Échéance"
          value={offer.deadline}
        />
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
        <Mail size={13} />
        <span className="truncate">
          {offer.email}
        </span>
      </div>

      <Button
        type="button"
        onClick={() => onNavigate?.("admin-offer-detail", offer.id)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
      >
        Voir les détails
        <ArrowRight size={14} />
      </Button>
    </div>
  );
}

/* =========================================================
   PAGE PRINCIPALE
========================================================= */

export default function AdminOffersPage({
  user,
  onNavigate,
  onLogout,
}) {
  const [offers, setOffers] = useResource("/offres/admin/all/",list=>list.map(j=>({...jobAdapter(j),status:j.statut==="EN_ATTENTE"?"En attente":j.statut_label,moderationStatus:j.moderation_status})));
  const loading = false;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [contractFilter, setContractFilter] = useState("Tous");
  const [sectorFilter, setSectorFilter] = useState("Tous");
  const [sortBy, setSortBy] = useState("recent");

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const stats = useMemo(() => {
    const total = offers.length;

    const published = offers.filter(
      (offer) => offer.status === "Publiée"
    ).length;

    const pending = offers.filter(
      (offer) => offer.status === "En attente"
    ).length;

    const suspended = offers.filter(
      (offer) => offer.status === "Suspendue"
    ).length;

    return {
      total,
      published,
      pending,
      suspended,
    };
  }, [offers]);

  /* =======================================================
     FILTRES DISPONIBLES
  ======================================================= */

  const sectors = useMemo(() => {
    return [
      "Tous",
      ...Array.from(
        new Set(offers.map((offer) => offer.sector))
      ),
    ];
  }, [offers]);

  const contracts = useMemo(() => {
    return [
      "Tous",
      ...Array.from(
        new Set(offers.map((offer) => offer.contract))
      ),
    ];
  }, [offers]);

  /* =======================================================
     FILTRAGE
  ======================================================= */

  const filteredOffers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = offers.filter((offer) => {
      const matchesSearch =
        !normalizedSearch ||
        offer.title.toLowerCase().includes(normalizedSearch) ||
        offer.company.toLowerCase().includes(normalizedSearch) ||
        offer.recruiter.toLowerCase().includes(normalizedSearch) ||
        offer.location.toLowerCase().includes(normalizedSearch) ||
        offer.sector.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "Tous" ||
        offer.status === statusFilter;

      const matchesContract =
        contractFilter === "Tous" ||
        offer.contract === contractFilter;

      const matchesSector =
        sectorFilter === "Tous" ||
        offer.sector === sectorFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesContract &&
        matchesSector
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "applications") {
        return b.applications - a.applications;
      }

      if (sortBy === "pending") {
        return (
          Number(b.status === "En attente") -
          Number(a.status === "En attente")
        );
      }

      if (sortBy === "published") {
        return (
          Number(b.status === "Publiée") -
          Number(a.status === "Publiée")
        );
      }

      return b.id - a.id;
    });
  }, [
    offers,
    search,
    statusFilter,
    contractFilter,
    sectorFilter,
    sortBy,
  ]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleApprove = (offer) => {
    setConfirmation({
      type: "approve",
      offer,
    });
  };

  const handleReject = (offer) => {
    setConfirmation({
      type: "reject",
      offer,
    });
  };

  const handleSuspend = (offer) => {
    setConfirmation({
      type: "suspend",
      offer,
    });
  };

  const handleReactivate = (offer) => {
    setConfirmation({
      type: "reactivate",
      offer,
    });
  };

  const handleConfirmAction = () => perform(async () => {if(!confirmation?.offer)return;const {type,offer}=confirmation;if(["approve","reject"].includes(type))await post("/offres/admin/"+offer.id+"/"+type+"/",{motif:type==="reject"?"Offre à corriger":""});else await post("/administration/offres/"+offer.id+"/",{action:type,motif:"Décision administrateur"});setOffers((await api("/offres/admin/all/")).map(j=>({...jobAdapter(j),status:j.statut==="EN_ATTENTE"?"En attente":j.statut_label,moderationStatus:j.moderation_status})));setConfirmation(null);});

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("Tous");
    setContractFilter("Tous");
    setSectorFilter("Tous");
    setSortBy("recent");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-800">
      

      

      <main className="">
        <div className="mx-auto max-w-[1500px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
          {/* =================================================
              HERO
          ================================================= */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A36] via-[#0b2c5c] to-[#087ca3] p-6 text-white shadow-2xl sm:p-8">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-200 backdrop-blur">
                  <FileCheck2 size={14} />
                  Modération des offres
                </div>

                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Contrôlez les offres publiées sur JobConnect
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Examinez les offres proposées par les recruteurs, validez
                  les nouvelles publications et assurez la qualité des
                  opportunités proposées aux candidats.
                </p>
              </div>

              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  À modérer
                </p>

                <p className="mt-1 text-3xl font-black">
                  {stats.pending}
                </p>

                <p className="text-xs text-orange-300">
                  offres en attente
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              STATISTIQUES
          ================================================= */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total des offres"
              value={stats.total}
              description="Offres enregistrées sur JobConnect"
              icon={BriefcaseBusiness}
              gradient="from-blue-600 to-cyan-500"
            />

            <StatCard
              label="Offres publiées"
              value={stats.published}
              description="Offres actuellement visibles"
              icon={CheckCircle2}
              gradient="from-emerald-500 to-teal-500"
            />

            <StatCard
              label="En attente"
              value={stats.pending}
              description="Offres à examiner"
              icon={Clock3}
              gradient="from-orange-500 to-amber-500"
            />

            <StatCard
              label="Suspendues"
              value={stats.suspended}
              description="Offres temporairement retirées"
              icon={Ban}
              gradient="from-red-500 to-rose-500"
            />
          </section>

          {/* =================================================
              FILTRES
          ================================================= */}

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#071A36]">
                    Offres d'emploi
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {filteredOffers.length} résultat
                    {filteredOffers.length > 1 ? "s" : ""} affiché
                    {filteredOffers.length > 1 ? "s" : ""}
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

              <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.6fr)_170px_170px_200px_170px]">
                {/* RECHERCHE */}
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Rechercher une offre, entreprise..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* STATUT */}
                <SelectField
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    "Tous",
                    "Publiée",
                    "En attente",
                    "Suspendue",
                    "Rejetée",
                  ]}
                  labels={{
                    Tous: "Tous les statuts",
                    Publiée: "Publiées",
                    "En attente": "En attente",
                    Suspendue: "Suspendues",
                    Rejetée: "Rejetées",
                  }}
                />

                {/* CONTRAT */}
                <SelectField
                  value={contractFilter}
                  onChange={setContractFilter}
                  options={contracts}
                  labels={{
                    Tous: "Tous les contrats",
                  }}
                />

                {/* SECTEUR */}
                <SelectField
                  value={sectorFilter}
                  onChange={setSectorFilter}
                  options={sectors}
                  labels={{
                    Tous: "Tous les secteurs",
                  }}
                />

                {/* TRI */}
                <SelectField
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    "recent",
                    "applications",
                    "pending",
                    "published",
                  ]}
                  labels={{
                    recent: "Plus récentes",
                    applications: "Plus de candidatures",
                    pending: "À modérer",
                    published: "Déjà publiées",
                  }}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              LISTE
          ================================================= */}

          <section className="mt-5">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <OfferSkeleton />
                <OfferSkeleton />
                <OfferSkeleton />
                <OfferSkeleton />
                <OfferSkeleton />
                <OfferSkeleton />
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={24} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-[#071A36]">
                  Aucune offre trouvée
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Aucune offre ne correspond aux critères de recherche
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
                    <table className="w-full min-w-[1250px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Offre
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Recruteur
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Type / Localisation
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Statut
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
                        {filteredOffers.map((offer) => (
                          <OfferRow
                            key={offer.id}
                            offer={offer}
                            onNavigate={onNavigate}
                            onView={setSelectedOffer}
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
                  {filteredOffers.map((offer) => (
                    <OfferMobileCard
                      key={offer.id}
                      offer={offer}
                      onNavigate={onNavigate}
                      onView={setSelectedOffer}
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

          {/* =================================================
              BLOCS D'INFORMATION
          ================================================= */}

          <section className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                <FileCheck2 size={19} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#071A36]">
                Validation des offres
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Vérifiez le contenu et les informations essentielles avant de
                rendre une offre visible aux candidats.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg">
                <Clock3 size={19} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#071A36]">
                Modération en attente
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Les nouvelles offres sont examinées par l'administration
                avant leur diffusion sur la plateforme.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg">
                <ShieldCheck size={19} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#071A36]">
                Qualité des opportunités
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                La modération permet de maintenir un environnement fiable et
                pertinent pour les candidats.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* MOBILE NAV */}
      

      {/* DETAILS */}
      {selectedOffer && (
        <OfferDetailsModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}

      {/* CONFIRMATION */}
      {confirmation && (
        <ConfirmationModal
          type={confirmation.type}
          offer={confirmation.offer}
          onClose={() => setConfirmation(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  value,
  onChange,
  options,
  labels = {},
}) {
  return (
    <div className="relative">
      <Select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {labels[option] || option}
          </option>
        ))}
      </Select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}
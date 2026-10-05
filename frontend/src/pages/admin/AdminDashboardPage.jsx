import { StatCard as SharedStatCard, EmptyState, Button } from "../../components/ui";


import { useResource } from "../../hooks/useResource";
import { jobsAdapter, companyAdapter, dateLabel } from "../../services/adapters";


import { Activity, AlertCircle, ArrowRight, BarChart3, BriefcaseBusiness, Building2, CheckCircle2, ChevronRight, Clock3, FileSearch, MoreHorizontal, ShieldCheck, Sparkles, UserCheck, UserPlus, Users } from "lucide-react";


/* =========================================================
   DONNÉES DE DÉMONSTRATION
   ========================================================= */

const dashboardStats = [];

const activityData = [];

const moderationOffers = [];

const recruitersPending = [];

const recentActivities = [];

/* =========================================================
   HELPERS
   ========================================================= */

const statColors = {
  blue: {
    icon: "bg-blue-100 text-blue-600",
    glow: "from-blue-500/10 to-blue-500/0",
    value: "text-blue-700",
  },
  violet: {
    icon: "bg-violet-100 text-violet-600",
    glow: "from-violet-500/10 to-violet-500/0",
    value: "text-violet-700",
  },
  cyan: {
    icon: "bg-cyan-100 text-cyan-600",
    glow: "from-cyan-500/10 to-cyan-500/0",
    value: "text-cyan-700",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-600",
    glow: "from-emerald-500/10 to-emerald-500/0",
    value: "text-emerald-700",
  },
};

/* =========================================================
   SKELETON
   ========================================================= */

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-72 rounded-xl bg-slate-200" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-40 rounded-3xl border border-slate-100 bg-white"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="h-96 rounded-3xl bg-white" />
        <div className="h-96 rounded-3xl bg-white" />
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */



/* =========================================================
   HEADER
   ========================================================= */



/* =========================================================
   KPI CARD
   ========================================================= */

function StatCard({stat,onNavigate}){return <SharedStatCard {...stat} tone={stat.color} onClick={()=>onNavigate?.(stat.route)}/>;}

/* =========================================================
   ACTIVITY CHART
   ========================================================= */

function ActivityChart() {
  const [activityData]=useResource("/administration/statistics/",d=>d.weekly_activity);
  const maxValue = Math.max(1,...activityData.map((item) => item.value));

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity size={18} />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-[#071A36]">
                Activité de la plateforme
              </h2>

              <p className="mt-0.5 text-xs font-medium text-slate-400">
                Activité des 7 derniers jours
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          Cette semaine
          <ChevronRight size={13} />
        </Button>
      </div>

      <div className="mt-8 flex h-56 items-end gap-2 sm:gap-4">
        {activityData.map((item, index) => {
          const height = `${Math.max(
            12,
            (item.value / maxValue) * 100
          )}%`;

          return (
            <div
              key={item.day}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div className="relative flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-[42px] rounded-t-xl transition-all duration-700"
                  style={{
                    height,
                    background: ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#06b6d4", "#6366f1"][index % 7],
                    animationDelay: `${index * 70}ms`,
                  }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-lg bg-[#071A36] px-2 py-1 text-xs font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {item.value}
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-400">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-slate-500">
            Activité globale
          </span>
        </div>

        <div className="ml-auto text-right">
          <p className="text-lg font-black text-[#071A36]">{activityData.reduce((sum,item)=>sum+item.value,0)}</p>
          <p className="text-xs font-medium text-slate-400">
            actions cette semaine
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MODÉRATION DES OFFRES
   ========================================================= */

function OffersModeration({ onNavigate }) {
 const [moderationOffers]=useResource("/offres/admin/pending/",jobsAdapter);
  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Clock3 size={18} />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-[#071A36]">
                Offres à modérer
              </h2>

              <p className="mt-0.5 text-xs font-medium text-slate-400">
                {moderationOffers.length} offres nécessitent votre attention
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => onNavigate?.("admin-offers")}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 transition hover:text-blue-800"
        >
          Tout voir
          <ArrowRight size={13} />
        </Button>
      </div>

      <div className="divide-y divide-slate-100">
        {!moderationOffers.length && <EmptyState title="Modération à jour" description="Aucune offre en attente de validation."/>}
        {moderationOffers.map((offer) => (
          <div
            key={offer.id}
            className="group flex flex-col gap-4 p-5 transition-colors duration-300 hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600">
                <BriefcaseBusiness size={19} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                  {offer.title}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    {offer.company}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-slate-300" />

                  <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-600">
                    {offer.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <span className="text-xs font-medium text-slate-400">
                {offer.submitted}
              </span>

              <Button
                type="button"
                onClick={() => onNavigate?.("admin-offers")}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-[#071A36] px-3 text-xs font-bold text-white transition-all duration-300 hover:bg-blue-600"
              >
                Examiner
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   RECRUTEURS À VALIDER
   ========================================================= */

function PendingRecruiters({ onNavigate }) {
 const [recruitersPending]=useResource("/administration/entreprises/",list=>list.filter(c=>c.verification_status==="PENDING").map(c=>({...companyAdapter(c),initials:c.nom.slice(0,2),name:c.nom,date:dateLabel(c.verification_requested_at)})));
  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <UserCheck size={18} />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-[#071A36]">
                Recruteurs à valider
              </h2>

              <p className="mt-0.5 text-xs font-medium text-slate-400">
                {recruitersPending.length} demandes en attente
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => onNavigate?.("admin-recruiters")}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 transition hover:text-blue-800"
        >
          Tout voir
          <ArrowRight size={13} />
        </Button>
      </div>

      <div className="divide-y divide-slate-100">
        {!recruitersPending.length && <EmptyState title="Aucune demande en attente" description="Les nouvelles demandes de vérification apparaîtront ici."/>}
        {recruitersPending.map((recruiter) => (
          <div
            key={recruiter.id}
            className="flex items-center gap-3 p-4 transition-colors duration-300 hover:bg-slate-50/80"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-black text-white">
              {recruiter.initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">
                {recruiter.name}
              </p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                {recruiter.email}
              </p>
            </div>

            <Button aria-label="Suivant"
              type="button"
              onClick={() => onNavigate?.("admin-recruiters")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition hover:bg-violet-600 hover:text-white"
              title="Examiner"
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   ACTIVITÉS RÉCENTES
   ========================================================= */

function RecentActivities() {
 const [recentActivities]=useResource("/administration/statistics/",d=>d.recent);
  const activityIcons = {
    user: {
      icon: UserPlus,
      wrapper: "bg-blue-50 text-blue-600",
    },
    validated: {
      icon: CheckCircle2,
      wrapper: "bg-emerald-50 text-emerald-600",
    },
    offer: {
      icon: BriefcaseBusiness,
      wrapper: "bg-violet-50 text-violet-600",
    },
    warning: {
      icon: AlertCircle,
      wrapper: "bg-orange-50 text-orange-600",
    },
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
        <div>
          <h2 className="text-base font-extrabold text-[#071A36]">
            Activités récentes
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-400">
            Dernières actions effectuées sur la plateforme
          </p>
        </div>

        <Button aria-label="Afficher les actions"
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <MoreHorizontal size={17} />
        </Button>
      </div>

      <div className="divide-y divide-slate-100">
        {recentActivities.map((activity) => {
          const config = activityIcons[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="flex gap-3 p-4 transition-colors duration-300 hover:bg-slate-50/80 sm:p-5"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.wrapper}`}
              >
                <Icon size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  {activity.title}
                </p>

                <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-400">
                  {activity.description}
                </p>

                <p className="mt-1.5 text-xs font-semibold text-slate-300">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   ALERTES
   ========================================================= */

function AlertsCard({ onNavigate }) {
 const [pendingOffers]=useResource("/offres/admin/pending/",v=>v);
 const [pendingCompanies]=useResource("/administration/entreprises/",v=>v.filter(c=>c.verification_status==="PENDING"));
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A36] via-[#0a2850] to-blue-700 p-6 text-white shadow-xl shadow-blue-900/10">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-300 backdrop-blur-sm">
            <ShieldCheck size={21} />
          </div>

          <span className="rounded-full bg-orange-400/15 px-2.5 py-1 text-xs font-bold text-orange-200">
            {pendingOffers.length + pendingCompanies.length} actions en attente
          </span>
        </div>

        <h2 className="mt-5 text-lg font-black">
          Centre de contrôle
        </h2>

        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-300">
          Retrouvez les publications et les demandes de vérification à examiner.
        </p>

        <div className="mt-5 space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-400/10 text-orange-300">
              <Clock3 size={15} />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold">
                {pendingOffers.length} offres à modérer
              </p>
              <p className="text-xs text-slate-400">
                Nouvelles publications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300">
              <UserCheck size={15} />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold">
                {pendingCompanies.length} recruteurs à valider
              </p>
              <p className="text-xs text-slate-400">
                Demandes de vérification
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => onNavigate?.("admin-offers")}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-[#071A36] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50"
        >
          Examiner les alertes
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
   RACCOURCIS
   ========================================================= */

function QuickActions({ onNavigate }) {
  const actions = [
    {
      label: "Gérer les utilisateurs",
      description: "Comptes et accès",
      icon: Users,
      route: "admin-users",
      className: "bg-blue-50 text-blue-600",
    },
    {
      label: "Valider les recruteurs",
      description: "Vérifications",
      icon: UserCheck,
      route: "admin-recruiters",
      className: "bg-violet-50 text-violet-600",
    },
    {
      label: "Modérer les offres",
      description: "Publications",
      icon: BriefcaseBusiness,
      route: "admin-offers",
      className: "bg-orange-50 text-orange-600",
    },
    {
      label: "Voir les statistiques",
      description: "Performances",
      icon: BarChart3,
      route: "admin-statistics",
      className: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-extrabold text-[#071A36]">
          Accès rapides
        </h2>

        <p className="mt-1 text-xs font-medium text-slate-400">
          Les principales actions administratives
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.route}
              type="button"
              onClick={() => onNavigate?.(action.route)}
              className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.className} transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800">
                  {action.label}
                </p>

                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  {action.description}
                </p>
              </div>

              <ChevronRight
                size={15}
                className="text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-500"
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE PRINCIPALE
   ========================================================= */

export default function AdminDashboardPage({
  user,
  onNavigate,
  onLogout,
}) {
  const [liveStats]=useResource("/administration/statistics/",v=>v,{});
 const dashboardStats=[{id:"users",label:"Utilisateurs",value:liveStats.utilisateurs||0,icon:Users,color:"blue",route:"admin-users"},{id:"recruiters",label:"Recruteurs",value:liveStats.recruteurs||0,icon:Building2,color:"violet",route:"admin-recruiters"},{id:"offers",label:"Offres actives",value:liveStats.offres_actives||0,icon:BriefcaseBusiness,color:"cyan",route:"admin-offers"},{id:"applications",label:"Candidatures",value:liveStats.candidatures||0,icon:FileSearch,color:"emerald",route:"admin-statistics"}];
  const loading = false;

  

  const handleNavigate = (destination, data = null) => {
    onNavigate?.(destination, data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8fc]">
        

        <main className="min-h-screen ">
          

          <div className="p-5 sm:p-6 lg:p-8">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-800">
      

      <main className="min-h-screen pb-24  lg:pb-0">
        

        {/* Mobile header */}
        

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Hero */}
          <section className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#0b2a52] to-blue-600 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-7 lg:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <Sparkles size={13} className="text-cyan-300" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-200">
                    Centre de pilotage JobConnect
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                  Bonjour, Administrateur.
                </h1>

                <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Gardez un œil sur l'activité de la plateforme, les
                  publications et les demandes de validation depuis votre
                  espace d'administration.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:flex">
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    En attente
                  </p>
                  <p className="mt-1 text-2xl font-black">{(liveStats.offres_en_attente||0)+(liveStats.entreprises_en_attente||0)}</p>
                  <p className="text-xs font-medium text-orange-200">
                    actions
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Aujourd'hui
                  </p>
                  <p className="mt-1 text-2xl font-black">{liveStats.weekly_activity?.at(-1)?.value||0}</p>
                  <p className="text-xs font-medium text-cyan-200">
                    activités
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* KPIs */}
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <StatCard
                key={stat.id}
                stat={stat}
                onNavigate={handleNavigate}
              />
            ))}
          </section>

          {/* Main analytics */}
          <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
            <ActivityChart />

            <AlertsCard onNavigate={handleNavigate} />
          </section>

          {/* Moderation */}
          <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
            <OffersModeration onNavigate={handleNavigate} />

            <PendingRecruiters onNavigate={handleNavigate} />
          </section>

          {/* Bottom */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
            <RecentActivities />

            <QuickActions onNavigate={handleNavigate} />
          </section>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      
    </div>
  );
}
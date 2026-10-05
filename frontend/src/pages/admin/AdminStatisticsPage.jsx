import { StatCard } from "../../components/ui";
import { Button } from "../../components/ui";


import { useResource } from "../../hooks/useResource";



import { Activity, ArrowRight, BriefcaseBusiness, Building2, CalendarDays, FileCheck2, LineChart, Settings, TrendingUp, UserCheck, Users } from "lucide-react";



function AdminStatisticsPage({
  user = {
    firstName: "",
    lastName: "",
  },
  onNavigate,
}) {
  const adminName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Recruteur";

  const [statistics] = useResource("/administration/statistics/", value => value, {});
  const animatedStats = { users: statistics.utilisateurs || 0, candidates: statistics.candidats || 0, recruiters: statistics.recruteurs || 0, offers: statistics.offres || 0, applications: statistics.candidatures || 0, interviews: statistics.entretiens || 0 };
  const chartColors = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#f43f5e", "#06b6d4"];
  const distribution = [
    { label: "Candidats", value: animatedStats.candidates, color: "#2563eb" },
    { label: "Recruteurs", value: animatedStats.recruiters, color: "#f59e0b" },
    { label: "Administrateurs et autres", value: Math.max(0, animatedStats.users - animatedStats.candidates - animatedStats.recruiters), color: "#8b5cf6" },
  ];
  let angle = 0;
  const donut = animatedStats.users ? "conic-gradient(" + distribution.map(item => {
    const start = angle;
    angle += item.value / animatedStats.users * 360;
    return `${item.color} ${start}deg ${angle}deg`;
  }).join(",") + ")" : "#e2e8f0";


  

  

  const systemNavigation = [
    {
      id: "admin-settings",
      label: "Paramètres",
      icon: <Settings size={18} />,
    },
  ];

  const monthlyData = (statistics.monthly || []);

  const activityData = (statistics.activity || []);

  const topJobs = (statistics.top_jobs || []);

  const recentActivity = [];

  const maxUsers = Math.max(
    1,...monthlyData.flatMap(item => [item.users || 0, item.offers || 0, item.applications || 0])
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7fc] text-slate-900">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      


      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="">

        {/* HEADER */}

        


        {/* =====================================================
            CONTENT
        ===================================================== */}

        <main className="px-4 pb-28 pt-6 sm:px-7 sm:pt-8 lg:px-9 lg:pb-10">


          {/* HERO */}

          <section className="group relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-9">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl transition duration-700 group-hover:scale-125" />

            <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur">

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

                  <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-100">
                    Analyse de la plateforme
                  </span>

                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[42px]">

                  JobConnect continue
                  <br />

                  <span className="text-cyan-300">
                    sa progression.
                  </span>

                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100/80 sm:text-base">
                  Suivez l'évolution des utilisateurs, des offres et des candidatures pour mieux comprendre l'activité globale de votre plateforme.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">

                  <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">

                    <p className="text-xs font-bold uppercase tracking-wider text-blue-100/60">
                      Croissance utilisateurs
                    </p>

                    <div className="mt-2 flex items-center gap-2">

                      <TrendingUp
                        size={15}
                        className="text-emerald-300"
                      />

                      <span className="text-lg font-black">
                        —
                      </span>

                    </div>

                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">

                    <p className="text-xs font-bold uppercase tracking-wider text-blue-100/60">
                      Activité globale
                    </p>

                    <div className="mt-2 flex items-center gap-2">

                      <Activity
                        size={15}
                        className="text-cyan-300"
                      />

                      <span className="text-lg font-black">
                        Élevée
                      </span>

                    </div>

                  </div>

                </div>

              </div>


              <div className="hidden lg:block">

                <div className="grid w-[250px] grid-cols-2 gap-3">

                  <HeroMiniCard
                    label="Utilisateurs"
                    value={animatedStats.users}
                    icon={<Users size={18} />}
                  />

                  <HeroMiniCard
                    label="Offres"
                    value={animatedStats.recruiters}
                    icon={<BriefcaseBusiness size={18} />}
                  />

                  <HeroMiniCard
                    label="Candidatures"
                    value={activityData[0]?.value||0}
                    icon={<FileCheck2 size={18} />}
                  />

                  <HeroMiniCard
                    label="Entretiens"
                    value={activityData[2]?.value||0}
                    icon={<CalendarDays size={18} />}
                  />

                </div>

              </div>

            </div>

          </section>


          {/* KPI */}

          <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={<Users size={23} />}
              label="Utilisateurs"
              value={animatedStats.users}
              detail="+24,8% ce semestre"
              color="blue"
              onClick={() =>
                onNavigate?.("admin-users")
              }
            />

            <StatCard
              icon={<UserCheck size={23} />}
              label="Candidats"
              value={animatedStats.candidates}
              detail="83,5% des utilisateurs"
              color="violet"
              onClick={() =>
                onNavigate?.("admin-users")
              }
            />

            <StatCard
              icon={<Building2 size={23} />}
              label="Recruteurs"
              value={animatedStats.recruiters}
              detail="+18,2% ce semestre"
              color="cyan"
              onClick={() =>
                onNavigate?.("admin-recruiters")
              }
            />

            <StatCard
              icon={<BriefcaseBusiness size={23} />}
              label="Offres publiées"
              value={animatedStats.offers}
              detail="+12,6% ce mois"
              color="emerald"
              onClick={() =>
                onNavigate?.("admin-offers")
              }
            />

          </section>


          {/* =================================================
              EVOLUTION + REPARTITION
          ================================================= */}

          <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">


            {/* EVOLUTION */}

            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-blue-600 shadow-lg shadow-blue-600/40" />

                    <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                      Croissance
                    </p>

                  </div>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Évolution de la plateforme
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Inscriptions, offres et candidatures par mois.
                  </p>

                </div>

                <div className="flex items-center gap-2">

                  <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-600">

                    <TrendingUp size={12} />

                    —

                  </span>

                </div>

              </div>


              <div className="p-6">

                <div className="overflow-x-auto pb-2">
                  <div className="flex h-[270px] min-w-[520px] items-end gap-4">
                    {monthlyData.map(item => <div key={item.month} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                      <div className="flex min-h-0 flex-1 items-end justify-center gap-1 border-b border-slate-200">
                        {[{key:"users",label:"Inscriptions",color:"#2563eb"},{key:"offers",label:"Offres",color:"#f59e0b"},{key:"applications",label:"Candidatures",color:"#10b981"}].map(series => <div key={series.key} role="img" aria-label={`${item.month} : ${item[series.key] || 0} ${series.label}`} title={`${series.label} : ${item[series.key] || 0}`} className="w-full max-w-5 rounded-t-md" style={{height: `${(item[series.key] || 0) / maxUsers * 100}%`, background: series.color}} />)}
                      </div>
                      <span className="mt-3 text-center text-xs font-semibold text-slate-500">{item.month}</span>
                    </div>)}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">{[{label:"Inscriptions",color:"#2563eb"},{label:"Offres",color:"#f59e0b"},{label:"Candidatures",color:"#10b981"}].map(series => <span key={series.label} className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{background:series.color}}/>{series.label}</span>)}</div>

                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">

                  <div className="flex items-center gap-2">

                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />

                    <span className="text-xs font-bold text-slate-500">
                      Nouveaux utilisateurs
                    </span>

                  </div>

                  <div className="text-xs text-slate-400">
                    Total sur la période :
                    {" "}
                    <strong className="font-black text-slate-700">
                      {monthlyData.reduce((sum, item) => sum + item.users, 0).toLocaleString("fr-FR")}
                    </strong>
                  </div>

                </div>

              </div>

            </section>


            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
              <h2 className="text-xl font-bold">Répartition des utilisateurs</h2>
              <div role="img" aria-label={distribution.map(item => `${item.label} : ${item.value}`).join(", ")} className="relative mx-auto mt-6 flex h-52 w-52 items-center justify-center rounded-full" style={{ background: donut }}>
                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white"><strong className="text-3xl">{animatedStats.users.toLocaleString("fr-FR")}</strong><span className="text-sm text-slate-500">Utilisateurs</span></div>
              </div>
              <div className="mt-6 space-y-4">{distribution.map(item => <div key={item.label} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full" style={{ background: item.color }} />{item.label}</span><strong>{item.value.toLocaleString("fr-FR")} · {animatedStats.users ? Math.round(item.value / animatedStats.users * 100) : 0}%</strong></div>)}</div>
            </section>

          </div>


          {/* =================================================
              ACTIVITY
          ================================================= */}

          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">


            {/* ACTIVITY PERFORMANCE */}

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.17em] text-cyan-600">
                    Activité
                  </p>

                  <h2 className="mt-2 text-xl font-black">
                    Activité de la plateforme
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Indicateurs principaux d'utilisation.
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Activity size={20} />
                </div>

              </div>


              <div className="mt-8 space-y-6">

                {activityData.map((item, index) => (

                  <ActivityRow
                    key={item.label}
                    item={{...item, color: ["blue", "emerald", "violet", "cyan"][index % 4]}}
                  />

                ))}

              </div>

            </section>


            {/* QUICK STATS */}

            <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 p-7 text-white shadow-2xl shadow-blue-600/20">

              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

              <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />

              <div className="relative">

                <div className="flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">

                    <LineChart size={22} />

                  </div>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider">
                    Performance
                  </span>

                </div>


                <h2 className="mt-6 text-2xl font-black leading-8">

                  Une croissance
                  <br />

                  <span className="text-cyan-200">
                    constante.
                  </span>

                </h2>


                <p className="mt-4 text-sm leading-6 text-white/70">
                  JobConnect enregistre une progression régulière de son activité sur l'ensemble de ses services.
                </p>


                <div className="mt-7 grid grid-cols-2 gap-3">

                  <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                    <p className="text-2xl font-black">
                      {animatedStats.applications.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-white/60">
                      Candidatures
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                    <p className="text-2xl font-black">
                      {animatedStats.interviews}
                    </p>

                    <p className="mt-1 text-xs text-white/60">
                      Entretiens
                    </p>

                  </div>

                </div>


                <Button
                  type="button"
                  onClick={() =>
                    onNavigate?.("admin-dashboard")
                  }
                  className="mt-6 flex w-full items-center justify-between rounded-xl bg-white px-5 py-4 text-xs font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
                >

                  Retour au tableau de bord

                  <ArrowRight size={14} />

                </Button>

              </div>

            </section>

          </div>


          {/* =================================================
              TOP OFFERS
          ================================================= */}

          <section className="mt-7 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                  Tendances
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Domaines les plus recherchés
                </h2>

              </div>

              <Button
                type="button"
                onClick={() =>
                  onNavigate?.("admin-offers")
                }
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black text-blue-600 transition hover:bg-blue-50"
              >

                Voir les offres

                <ArrowRight size={13} />

              </Button>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>

                  <tr className="bg-slate-50/70">

                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Poste
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Offres
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Candidatures
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Popularité
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {topJobs.map(
                    (job, index) => (

                      <tr
                        key={job.title}
                        className="group border-t border-slate-100 transition hover:bg-blue-50/30"
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                index === 0
                                  ? "bg-blue-100 text-blue-600"
                                  : index === 1
                                  ? "bg-violet-100 text-violet-600"
                                  : index === 2
                                  ? "bg-cyan-100 text-cyan-600"
                                  : index === 3
                                  ? "bg-emerald-100 text-emerald-600"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                            >

                              <BriefcaseBusiness size={17} />

                            </div>

                            <p className="text-[12px] font-black text-slate-800">
                              {job.title}
                            </p>

                          </div>

                        </td>


                        <td className="px-4 py-5">

                          <span className="text-[12px] font-black text-slate-600">
                            {job.offers}
                          </span>

                        </td>


                        <td className="px-4 py-5">

                          <span className="text-[12px] font-black text-slate-700">
                            {job.applications.toLocaleString()}
                          </span>

                        </td>


                        <td className="px-4 py-5">

                          <div className="flex items-center gap-3">

                            <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ background: chartColors[index % chartColors.length], width: `${job.applications / Math.max(1, ...topJobs.map(item => item.applications)) * 100}%` }}
                              />

                            </div>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>


          {/* =================================================
              RECENT ACTIVITY
          ================================================= */}

          <section className="mt-7 rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.17em] text-violet-600">
                  Temps réel
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Activité récente
                </h2>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Activity size={20} />
              </div>

            </div>


            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {recentActivity.map((item) => (

                <RecentActivityCard
                  key={item.title}
                  item={item}
                />

              ))}

            </div>

          </section>

        </main>

      </div>


      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      

    </div>
  );
}


/* =========================================================
   HERO MINI CARD
========================================================= */

function HeroMiniCard({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/15">

      <div className="flex items-center justify-between text-cyan-200">

        <span>{icon}</span>

        <TrendingUp size={14} />

      </div>

      <p className="mt-4 text-xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-white/60">
        {label}
      </p>

    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */




/* =========================================================
   ACTIVITY ROW
========================================================= */

function ActivityRow({
  item,
}) {
  const colors = {
    blue: {
      line: "bg-blue-600",
      text: "text-blue-600",
    },

    violet: {
      line: "bg-violet-600",
      text: "text-violet-600",
    },

    cyan: {
      line: "bg-cyan-600",
      text: "text-cyan-600",
    },

    emerald: {
      line: "bg-emerald-500",
      text: "text-emerald-600",
    },
  };

  const current = colors[item.color] || colors.blue;

  return (
    <div>

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[12px] font-black text-slate-700">
            {item.label}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {item.value.toLocaleString()} activités
          </p>

        </div>

        <span
          className={`text-sm font-black ${current.text}`}
        >
          {item.percentage}%
        </span>

      </div>


      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${current.line} transition-all duration-1000`}
          style={{
            width: `${item.percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   RECENT ACTIVITY CARD
========================================================= */

function RecentActivityCard({
  item,
}) {
  const colors = {
    blue: {
      icon: "bg-blue-100 text-blue-600",
      value: "text-blue-700",
    },

    emerald: {
      icon: "bg-emerald-100 text-emerald-600",
      value: "text-emerald-700",
    },

    violet: {
      icon: "bg-violet-100 text-violet-600",
      value: "text-violet-700",
    },

    cyan: {
      icon: "bg-cyan-100 text-cyan-600",
      value: "text-cyan-700",
    },
  };

  const current =
    colors[item.color] || colors.blue;

  return (
    <div className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/60">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${current.icon} transition duration-300 group-hover:scale-110 group-hover:rotate-3`}
      >
        {item.icon}
      </div>

      <p className="mt-5 text-xs font-black leading-5 text-slate-700">
        {item.title}
      </p>

      <p
        className={`mt-2 text-2xl font-black ${current.value}`}
      >
        {item.value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {item.detail}
      </p>

    </div>
  );
}


/* =========================================================
   MOBILE NAV
========================================================= */




export default AdminStatisticsPage;
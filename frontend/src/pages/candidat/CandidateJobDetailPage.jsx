import { Button, Select } from "../../components/ui";

import { post, perform, success } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { jobAdapter, cvsAdapter } from "../../services/adapters";
import { LoadingPanel } from "../../components/common/ApiFeedback";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, FileText, Heart, MapPin, Share2, Sparkles, TrendingUp, UserRound, Building2, GraduationCap, WalletCards } from "lucide-react";



/* =========================================================
   COMPATIBILITÉ CANDIDAT
   Le score réel reste interne.
   Le candidat ne voit jamais le pourcentage exact.
========================================================= */

function getCompatibilityLabel() { return "Consultez les critères de l’offre"; }
function getCompatibilityStyle() { return {wrapper:"border-blue-100 bg-blue-50",icon:"bg-blue-100 text-blue-600",text:"text-blue-700"}; }

/* =========================================================
   PAGE DÉTAIL OFFRE
========================================================= */

function CandidateJobDetailPage({
  user = {
    firstName: "",
    lastName: "",
  },
  jobId,
  onNavigate,
  onLogout,
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMessage, setShowShareMessage] = useState(false);

  const firstName = user?.firstName || "Candidat";

  /* =======================================================
     NAVIGATION
  ======================================================= */

  

  /* =======================================================
     DONNÉES PAR DÉFAUT
     Permet à la page de fonctionner même sans backend.
  ======================================================= */

  const currentJob = useResource("/offres/"+jobId+"/",jobAdapter,null)[0];

  const [cvOptions] = useResource("/users/cvs/",cvsAdapter);
  const [selectedCV,setSelectedCV]=useState("");
  const [applying,setApplying]=useState(false);
  const compatibilityStyle = getCompatibilityStyle(
    currentJob?.compatibility
  );

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleShare = async () => {
    try {
      if (navigator?.share) {
        await navigator.share({
          title: currentJob.title,
          text: `${currentJob.title} chez ${currentJob.company}`,
        });
      } else {
        await navigator.clipboard?.writeText(window.location.href);
        setShowShareMessage(true);

        setTimeout(() => {
          setShowShareMessage(false);
        }, 2500);
      }
    } catch {
      // L'utilisateur peut simplement fermer la fenêtre de partage.
    }
  };

  const handleApply = () => perform(async () => {if(!selectedCV)throw Error("Sélectionnez un CV avant de candidater.");setApplying(true);try{await post("/candidatures/",{offre:currentJob.id,cv:Number(selectedCV)});success("Votre candidature a été envoyée.");onNavigate("candidate-applications");}finally{setApplying(false);}});

  if(!currentJob)return <LoadingPanel />;
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* =====================================================
          SIDEBAR DESKTOP
      ===================================================== */}

      

      {/* =====================================================
          CONTENU PRINCIPAL
      ===================================================== */}

      <div className="">
        <main className="min-h-screen">
          {/* =================================================
              TOPBAR
          ================================================= */}

          

          {/* =================================================
              CONTENU
          ================================================= */}

          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            {/* Retour */}

            <Button
              type="button"
              onClick={() => onNavigate?.("candidate-jobs")}
              className="group mb-6 flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-blue-600"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 transition group-hover:border-blue-200 group-hover:bg-blue-50">
                <ArrowLeft size={15} />
              </span>

              Retour aux offres
            </Button>

            {/* =================================================
                HEADER OFFRE
            ================================================= */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#061a41] via-[#0b2d68] to-blue-600 px-6 py-8 text-white sm:px-8 lg:px-10">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

                <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

                <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 flex-1 gap-5">
                    {/* Logo entreprise */}

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-black text-blue-700 shadow-lg sm:h-20 sm:w-20">
                      {currentJob.companyInitials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100">
                          {currentJob.type}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100">
                          Offre active
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                        {currentJob.title}
                      </h2>

                      <p className="mt-2 text-sm font-semibold text-blue-100">
                        {currentJob.company}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs text-blue-100/80">
                        <span className="flex items-center gap-2">
                          <MapPin size={14} />
                          {currentJob.location}
                        </span>

                        <span className="flex items-center gap-2">
                          <Clock3 size={14} />
                          Publiée {currentJob.postedAt}
                        </span>

                        <span className="flex items-center gap-2">
                          <CalendarDays size={14} />
                          Date limite : {currentJob.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}

                  <div className="flex shrink-0 gap-2">
                    <Button aria-label="Ajouter aux favoris"
                      type="button"
                      onClick={() => setIsFavorite((value) => !value)}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                        isFavorite
                          ? "border-red-200 bg-red-50 text-red-500"
                          : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                      }`}
                      title="Ajouter aux favoris"
                    >
                      <Heart
                        size={18}
                        fill={isFavorite ? "currentColor" : "none"}
                      />
                    </Button>

                    <Button
                      type="button"
                      onClick={handleShare}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
                      title="Partager"
                    >
                      <Share2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* =================================================
                  INFORMATIONS RAPIDES
              ================================================= */}

              <div className="grid border-t border-slate-100 sm:grid-cols-2 lg:grid-cols-4">
                <QuickInfo
                  icon={<BriefcaseBusiness size={17} />}
                  label="Type de contrat"
                  value={currentJob.type}
                />

                <QuickInfo
                  icon={<TrendingUp size={17} />}
                  label="Expérience"
                  value={currentJob.experience}
                />

                <QuickInfo
                  icon={<GraduationCap size={17} />}
                  label="Diplôme"
                  value={currentJob.education}
                />

                <QuickInfo
                  icon={<WalletCards size={17} />}
                  label="Rémunération"
                  value={currentJob.salary}
                />
              </div>
            </section>

            {/* =================================================
                MESSAGE PARTAGE
            ================================================= */}

            {showShareMessage && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={16} />
                Le lien de l'offre a été copié.
              </div>
            )}

            {/* =================================================
                GRILLE
            ================================================= */}

            <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_350px]">
              {/* =================================================
                  COLONNE PRINCIPALE
              ================================================= */}

              <div className="space-y-6">
                {/* Description */}

                <DetailSection
                  title="Description du poste"
                  icon={<FileText size={18} />}
                >
                  <p className="text-sm leading-7 text-slate-500">
                    {currentJob.description}
                  </p>
                </DetailSection>

                {/* Missions */}

                <DetailSection
                  title="Missions principales"
                  icon={<BriefcaseBusiness size={18} />}
                >
                  <div className="space-y-3">
                    {currentJob.missions.map((mission, index) => (
                      <ListItem
                        key={index}
                        text={mission}
                      />
                    ))}
                  </div>
                </DetailSection>

                {/* Profil recherché */}

                <DetailSection
                  title="Profil recherché"
                  icon={<UserRound size={18} />}
                >
                  <div className="space-y-3">
                    {currentJob.requirements.map(
                      (requirement, index) => (
                        <ListItem
                          key={index}
                          text={requirement}
                        />
                      )
                    )}
                  </div>
                </DetailSection>

                {/* Compétences */}

                <DetailSection
                  title="Compétences recherchées"
                  icon={<Sparkles size={18} />}
                >
                  <div className="flex flex-wrap gap-2">
                    {currentJob.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </DetailSection>

                {/* Avantages */}

                <DetailSection
                  title="Ce que l'entreprise propose"
                  icon={<Building2 size={18} />}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {currentJob.benefits.map(
                      (benefit, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                        >
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-blue-600"
                          />

                          <span className="text-xs font-semibold leading-5 text-slate-600">
                            {benefit}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </DetailSection>
              </div>

              {/* =================================================
                  SIDEBAR DROITE
              ================================================= */}

              <aside className="space-y-5">
                {/* Candidature */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                    Candidature
                  </p>

                  <h3 className="mt-2 text-base font-black text-slate-900">
                    Cette offre vous intéresse ?
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Envoyez votre candidature avec votre CV principal.
                  </p>

                  {/* Compatibilité qualitative */}

                  <div
                    className={`mt-5 rounded-xl border p-4 ${compatibilityStyle.wrapper}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${compatibilityStyle.icon}`}
                      >
                        <Sparkles size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Correspondance avec votre profil
                        </p>

                        <p
                          className={`mt-1 text-sm font-black ${compatibilityStyle.text}`}
                        >
                          {getCompatibilityLabel(
                            currentJob.compatibility
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <label className="mb-3 block text-xs font-bold">CV à joindre<Select aria-label="CV à joindre" className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900" value={selectedCV} onChange={e=>setSelectedCV(e.target.value)}><option value="">Choisir un CV</option>{cvOptions.map(cv=><option key={cv.id} value={cv.id}>{cv.name}</option>)}</Select></label>
<Button
                    type="button"
                    disabled={applying} onClick={handleApply}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    <FileText size={16} />
                    Postuler à cette offre
                    <ArrowRight size={14} />
                  </Button>

                  <p className="mt-3 text-center text-xs leading-4 text-slate-400">
                    Vous pourrez suivre l'évolution de votre candidature
                    depuis votre espace.
                  </p>
                </section>

                {/* Entreprise */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">
                      {currentJob.companyInitials}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                        Entreprise
                      </p>

                      <h3 className="mt-1 truncate text-sm font-black text-slate-900">
                        {currentJob.company}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <CompanyInfo
                      icon={<Building2 size={14} />}
                      text="Entreprise vérifiée"
                    />

                    <CompanyInfo
                      icon={<MapPin size={14} />}
                      text={currentJob.location}
                    />
                  </div>
                </section>

                {/* IA */}

                <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-blue-700 p-5 text-white shadow-lg shadow-blue-900/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Sparkles size={19} />
                  </div>

                  <p className="mt-5 text-sm font-black">
                    Préparez votre candidature
                  </p>

                  <p className="mt-2 text-xs leading-5 text-blue-100/80">
                    Analysez cette offre ou entraînez-vous à l'entretien
                    grâce à nos outils IA.
                  </p>

                  <Button
                    type="button"
                    onClick={() => onNavigate?.("candidate-ai")}
                    className="mt-5 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-xs font-black text-blue-700 transition hover:bg-blue-50"
                  >
                    Utiliser les outils IA
                    <ArrowRight size={14} />
                  </Button>
                </section>

                {/* CV */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={17} />
                  </div>

                  <h3 className="mt-4 text-sm font-black text-slate-900">
                    Votre CV principal
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Vérifiez que votre CV est à jour avant d'envoyer votre
                    candidature.
                  </p>

                  <Button
                    type="button"
                    onClick={() => onNavigate?.("candidate-cv")}
                    className="mt-4 flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    Gérer mes CV
                    <ArrowRight size={14} />
                  </Button>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          NAVIGATION MOBILE
      ===================================================== */}

      
    </div>
  );
}

/* =========================================================
   QUICK INFO
========================================================= */

function QuickInfo({ icon, label, value }) {
  return (
    <div className="border-b border-slate-100 p-4 sm:border-r sm:last:border-r-0 lg:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-xs font-black text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL SECTION
========================================================= */

function DetailSection({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <h2 className="text-base font-black text-slate-900 sm:text-lg">
          {title}
        </h2>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

/* =========================================================
   LIST ITEM
========================================================= */

function ListItem({ text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <CheckCircle2 size={13} />
      </div>

      <p className="text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   COMPANY INFO
========================================================= */

function CompanyInfo({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
      <span className="text-blue-600">{icon}</span>
      {text}
    </div>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */



export default CandidateJobDetailPage;
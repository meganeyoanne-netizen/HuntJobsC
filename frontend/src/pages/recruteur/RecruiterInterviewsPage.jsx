import { usePlatformSettings } from "../../hooks/usePlatformSettings";
import { createPortal } from "react-dom";
import { StatCard } from "../../components/ui";
import { Button, Input, Select, Textarea, ModalFrame } from "../../components/ui";

import { post, perform, success } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { applicationsAdapter, interviewsAdapter } from "../../services/adapters";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2, ClipboardList, Clock3, Copy, FileSearch, GraduationCap, LayoutDashboard, MessageSquare, MoreHorizontal, Plus, RefreshCw, Search, ShieldCheck, Sparkles, Target, UserRound, Users, Video, WandSparkles, X } from "lucide-react";



/* =========================================================
   DONNÉES DE DÉMONSTRATION
   ========================================================= */

const mockApplications = [];

const mockInterviews = [];

/* =========================================================
   NAVIGATION
   ========================================================= */

const mainNavigation = [
  {
    id: "recruiter-dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    id: "recruiter-jobs",
    label: "Mes offres",
    icon: BriefcaseBusiness,
  },
  {
    id: "recruiter-applications",
    label: "Candidatures",
    icon: Users,
  },
  {
    id: "recruiter-cvtheque",
    label: "CVthèque",
    icon: FileSearch,
  },
  {
    id: "recruiter-interviews",
    label: "Entretiens",
    icon: Video,
  },
];



/* =========================================================
   QUESTIONS IA DE DÉMONSTRATION
   ========================================================= */

const buildQuestion = undefined;

/* =========================================================
   COMPOSANT PRINCIPAL
   ========================================================= */

export default function RecruiterInterviewsPage({
  user = {
    firstName: "",
    lastName: "",
    companyName: "JobConnect",
  },
  onNavigate,
  onLogout,
}) {
  const { settings: platform } = usePlatformSettings();
  const questionsEnabled = platform.aiEnabled && platform.aiRecruiterQuestions;
  const [realApplications]=useResource("/candidatures/",applicationsAdapter);
  const mockApplications=realApplications.filter(a=>!["RETENU","REFUSE","RETIREE"].includes(a.statut)).map(a=>({...a,candidate:a.name,offer:a.job}));
  const [mockInterviews,,reloadInterviews]=useResource("/entretiens/",interviewsAdapter);
  const [scheduleDate,setScheduleDate]=useState("");
  const [scheduleTime,setScheduleTime]=useState("10:00");
  const [scheduleType,setScheduleType]=useState("TECHNIQUE");
  const [scheduleMessage,setScheduleMessage]=useState("");
  const schedule=()=>perform(async()=>{if(!scheduleApplication?.id)throw Error("Sélectionnez une candidature.");await post("/entretiens/",{candidature:scheduleApplication.id,date:new Date(scheduleDate+"T"+scheduleTime).toISOString(),type:scheduleType,message:scheduleMessage});setShowScheduleModal(false);reloadInterviews();success("Entretien planifié.");});
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");

  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [selectedInterview, setSelectedInterview] = useState(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [interviewType, setInterviewType] = useState("mixte");

  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationVersion = useRef(0);
  const generatorOffers = [...new Map(mockInterviews.map(interview => [interview.jobId, { id: interview.jobId, title: interview.job }])).values()];

  const [scheduleApplication, setScheduleApplication] = useState(null);

  const [copiedId, setCopiedId] = useState(null);

  const fullName =
    `${user?.firstName || "Michel"} ${user?.lastName || "Bonyomo"}`.trim();

  const initials =
    `${user?.firstName?.[0] || "M"}${user?.lastName?.[0] || "B"}`
      .toUpperCase();

  /* =========================================================
     STATISTIQUES
     ========================================================= */

  const stats = useMemo(() => {
    const upcoming = mockInterviews.filter(
      (item) => item.status === "À venir"
    ).length;

    const today = mockInterviews.filter(
      (item) => item.dateValue === new Date().toISOString().slice(0,10)
    ).length;

    const candidates = new Set(
      mockInterviews.map((item) => item.candidateId)
    ).size;

    const completed = mockInterviews.filter(
      (item) => item.status === "Terminé"
    ).length;

    return {
      upcoming,
      today,
      candidates,
      completed,
    };
  }, [mockInterviews]);

  /* =========================================================
     FILTRAGE
     ========================================================= */

  const filteredInterviews = useMemo(() => {
    let result = [...mockInterviews];

    if (activeTab === "upcoming") {
      result = result.filter((item) => item.status === "À venir");
    }

    if (activeTab === "completed") {
      result = result.filter((item) => item.status === "Terminé");
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter(
        (item) =>
          item.candidate.toLowerCase().includes(search) ||
          item.job.toLowerCase().includes(search) ||
          item.type.toLowerCase().includes(search)
      );
    }

    return result;
  }, [mockInterviews, activeTab, searchTerm]);

  /* =========================================================
     GÉNÉRATION QUESTIONS
     ========================================================= */

  const openQuestionGenerator = (interview = null) => {
    if (!questionsEnabled) return;
    generationVersion.current += 1;
    setIsGenerating(false);
    setSelectedInterview(interview);
    setGeneratedQuestions([]);
    setQuestionCount(5);
    setInterviewType(interview?.type?.toLowerCase() || "mixte");
    setShowGeneratorModal(true);
  };

  const closeQuestionGenerator = () => {
    generationVersion.current += 1;
    setIsGenerating(false);
    setShowGeneratorModal(false);
  };
  const selectGeneratorInterview = interview => {
    setSelectedInterview(interview || null);
    setInterviewType(interview?.type?.toLowerCase() || "mixte");
    setGeneratedQuestions([]);
  };
  const generateQuestions = () => perform(async () => {
    if (!selectedInterview || isGenerating || !questionsEnabled) return;
    const version = generationVersion.current;
    setIsGenerating(true);
    setGeneratedQuestions([]);
    try {
      const result = await post("/ia/questions-entretien/", { entretien: selectedInterview.id, nombre: questionCount, type: interviewType.toUpperCase() });
      if (version === generationVersion.current) setGeneratedQuestions(result.questions.map((question, index) => ({ ...question, id: question.id ?? index, keyPoints: question.keyPoints || [], evaluationCriteria: question.evaluationCriteria || [] })));
    } finally {
      if (version === generationVersion.current) setIsGenerating(false);
    }
  });

  const copyQuestion = async (question) => {
    const content = [
      `${question.category}`,
      question.question,
      "",
      question.expectedAnswer
        ? `Réponse attendue : ${question.expectedAnswer}`
        : `Réponse prototype : ${question.prototypeAnswer}`,
      "",
      question.keyPoints
        ? `Points à vérifier : ${question.keyPoints.join(", ")}`
        : `Critères d'évaluation : ${question.evaluationCriteria.join(", ")}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(question.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1800);
    } catch (error) {
      console.error("Impossible de copier la question :", error);
    }
  };

  const copyAllQuestions = async () => {
    const content = generatedQuestions
      .map((question, index) => {
        const answer = question.expectedAnswer
          ? `Réponse attendue : ${question.expectedAnswer}`
          : `Réponse prototype : ${question.prototypeAnswer}`;

        const criteria = question.keyPoints
          ? `Points à vérifier : ${question.keyPoints.join(", ")}`
          : `Critères d'évaluation : ${question.evaluationCriteria.join(", ")}`;

        return `${index + 1}. ${question.question}\n\n${answer}\n\n${criteria}`;
      })
      .join("\n\n--------------------------------\n\n");

    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Impossible de copier les questions :", error);
    }
  };

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const handleNavigation = (destination, data = null) => {
    if (onNavigate) {
      onNavigate(destination, data);
    }
  };

  /* =========================================================
     BADGE TYPE
     ========================================================= */

  const getInterviewTypeStyle = (type) => {
    switch (type) {
      case "Technique":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "Comportemental":
        return "bg-violet-50 text-violet-700 border-violet-100";

      case "RH":
        return "bg-orange-50 text-orange-700 border-orange-100";

      case "Portfolio":
        return "bg-cyan-50 text-cyan-700 border-cyan-100";

      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(.97) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-up {
          animation: fadeUp .45s ease-out both;
        }

        .animate-modal-in {
          animation: modalIn .25s ease-out both;
        }
      `}</style>

      {
      /* =====================================================
          SIDEBAR DESKTOP
      ===================================================== */}

      
      {/* =====================================================
          CONTENU PRINCIPAL
      ===================================================== */}

      <main className="min-h-screen ">
        {/* Header */}
        

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* =================================================
              HERO
          ================================================= */}

          <section className="animate-fade-up relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#0a2b59] to-[#075985] p-6 text-white shadow-xl shadow-blue-100 sm:p-8">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="absolute -bottom-24 right-20 h-52 w-52 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                  <Video size={13} />
                  Gestion des entretiens
                </div>

                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Préparez chaque entretien avec l'IA.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                  Vos entretiens sont liés aux candidatures existantes.
                  Générez ensuite des questions personnalisées à partir de
                  l'offre, du profil et du parcours du candidat.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button disabled={!questionsEnabled} title={questionsEnabled ? "Générer des questions" : "Module désactivé par l’administrateur"} onClick={() => openQuestionGenerator()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-blue-700">
                    <WandSparkles size={16} /> Générer des questions
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-[#071A36] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <Plus size={16} />
                    Programmer un entretien
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleNavigation("recruiter-applications")}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/15"
                  >
                    Voir les candidatures
                    <ArrowRight size={15} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[390px]">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <div className="text-2xl font-black">{stats.upcoming}</div>
                  <div className="mt-1 text-xs font-semibold text-blue-200">
                    À venir
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <div className="text-2xl font-black">{stats.today}</div>
                  <div className="mt-1 text-xs font-semibold text-blue-200">
                    Aujourd'hui
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <div className="text-2xl font-black">{stats.candidates}</div>
                  <div className="mt-1 text-xs font-semibold text-blue-200">
                    Candidats
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <div className="text-2xl font-black">{stats.completed}</div>
                  <div className="mt-1 text-xs font-semibold text-blue-200">
                    Terminés
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              STATISTIQUES
          ================================================= */}

          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={CalendarDays}
              label="Entretiens à venir"
              value={stats.upcoming}
              description="Planifiés"
              iconClass="bg-blue-50 text-blue-600"
              valueClass="text-blue-700"
            />

            <StatCard
              icon={Clock3}
              label="Aujourd'hui"
              value={stats.today}
              description="À traiter"
              iconClass="bg-orange-50 text-orange-600"
              valueClass="text-orange-600"
            />

            <StatCard
              icon={Users}
              label="Candidats concernés"
              value={stats.candidates}
              description="Profils uniques"
              iconClass="bg-violet-50 text-violet-600"
              valueClass="text-violet-700"
            />

            <StatCard
              icon={CheckCircle2}
              label="Entretiens terminés"
              value={stats.completed}
              description="Historique"
              iconClass="bg-emerald-50 text-emerald-600"
              valueClass="text-emerald-700"
            />
          </section>

          {/* =================================================
              BARRE OUTILS
          ================================================= */}

          <section className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900">
                Vos entretiens
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Chaque entretien est rattaché à une candidature et à une offre.
              </p>
            </div>

            {/* Recherche mobile */}
            <div className="relative md:hidden">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex w-full rounded-xl border border-slate-200 bg-white p-1 sm:w-auto">
              <TabButton
                active={activeTab === "upcoming"}
                onClick={() => setActiveTab("upcoming")}
              >
                À venir
              </TabButton>

              <TabButton
                active={activeTab === "completed"}
                onClick={() => setActiveTab("completed")}
              >
                Terminés
              </TabButton>

              <TabButton
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
              >
                Tous
              </TabButton>
            </div>
          </section>

          {/* =================================================
              BANDEAU IA
          ================================================= */}

          <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <WandSparkles size={20} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">
                    Questions d'entretien personnalisées
                  </h4>

                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-violet-700">
                    IA
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Les questions sont générées selon le type d'entretien,
                  l'offre concernée et les informations disponibles sur le
                  candidat. Elles sont différentes de la simulation d'entretien
                  proposée au candidat.
                </p>
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-2 text-xs font-bold text-slate-500 sm:flex">
              <ShieldCheck size={14} className="text-emerald-500" />
              Données de candidature utilisées
            </div>
          </section>

          {/* =================================================
              LISTE ENTRETIENS
          ================================================= */}

          <section className="space-y-4">
            {filteredInterviews.length === 0 ? (
              <EmptyState
                searchTerm={searchTerm}
                onReset={() => {
                  setSearchTerm("");
                  setActiveTab("all");
                }}
              />
            ) : (
              filteredInterviews.map((interview, index) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  index={index}
                  onGenerate={() => openQuestionGenerator(interview)}
                  onViewCandidate={() =>
                    handleNavigation(
                      "recruiter-candidate-detail",
                      interview.candidateId
                    )
                  }
                  onViewOffer={() =>
                    handleNavigation("recruiter-jobs")
                  }
                />
              ))
            )}
          </section>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <ClipboardList size={18} />
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900">
                  Fonctionnement des entretiens
                </h4>

                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                  Un entretien ne peut être créé qu'à partir d'une offre
                  existante et d'une candidature enregistrée sur cette offre.
                  Le recruteur peut ensuite consulter la candidature, le profil
                  du candidat et générer des questions adaptées au contexte de
                  recrutement.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      
      {/* =====================================================
          MODAL GÉNÉRATION QUESTIONS
      ===================================================== */}

      {showGeneratorModal && createPortal(
        <ModalFrame onClose={closeQuestionGenerator} className="flex items-center justify-center bg-[#031126]/65 p-3 backdrop-blur-sm sm:p-6">
          <div className="relative flex w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl" style={{ maxHeight: "calc(100dvh - 48px)", overflow: "hidden" }}>
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-[#071A36] p-5 text-white">
              <div><h2 className="text-xl font-bold">Générer des questions d'entretien</h2><p className="mt-1 text-sm text-blue-100">Préparez les questions selon l'offre et le profil du candidat.</p></div>
              <Button aria-label="Fermer" onClick={closeQuestionGenerator} className="shrink-0 rounded-xl p-2 text-white"><X size={20} /></Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
              {mockInterviews.length === 0 ? <div className="rounded-2xl bg-blue-50 p-6 text-sm text-blue-900">
                <p>Programmez d'abord un entretien lié à une candidature pour générer des questions adaptées à l'offre et au candidat.</p>
                <Button onClick={() => { closeQuestionGenerator(); setShowScheduleModal(true); }} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-white">Programmer un entretien</Button>
              </div> : <>
                <fieldset disabled={isGenerating} className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">Offre concernée
                    <Select value={selectedInterview?.jobId ?? ""} onChange={event => selectGeneratorInterview(mockInterviews.find(interview => String(interview.jobId) === event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3">
                      <option value="">Sélectionner une offre</option>
                      {generatorOffers.map(offer => <option key={offer.id} value={offer.id}>{offer.title}</option>)}
                    </Select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">Entretien et candidat
                    <Select value={selectedInterview?.id ?? ""} disabled={!selectedInterview || isGenerating || !questionsEnabled} onChange={event => selectGeneratorInterview(mockInterviews.find(interview => String(interview.id) === event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3">
                      <option value="">Sélectionner un entretien</option>
                      {mockInterviews.filter(interview => interview.jobId === selectedInterview?.jobId).map(interview => <option key={interview.id} value={interview.id}>{interview.candidate} — {interview.date} à {interview.time}</option>)}
                    </Select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">Type d'entretien
                    <Select value={interviewType} onChange={event => { setInterviewType(event.target.value); setGeneratedQuestions([]); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3">
                      <option value="technique">Technique</option><option value="rh">Ressources humaines</option><option value="comportemental">Comportemental</option><option value="motivation">Motivation</option><option value="mixte">Mixte</option>
                    </Select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">Nombre de questions
                    <Select value={questionCount} onChange={event => { setQuestionCount(Number(event.target.value)); setGeneratedQuestions([]); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3">
                      {[5, 10, 15, 20].map(count => <option key={count} value={count}>{count} questions</option>)}
                    </Select>
                  </label>
                </fieldset>
                <p className="mt-4 text-sm text-slate-500">Les offres proposées sont celles ayant un entretien programmé. L'IA utilise l'offre et la candidature de l'entretien sélectionné.</p>
                <Button onClick={generateQuestions} disabled={!selectedInterview || isGenerating || !questionsEnabled} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"><WandSparkles size={18} />{isGenerating ? "Génération en cours…" : "Générer les questions"}</Button>
                <div className="mt-6" aria-live="polite" aria-busy={isGenerating}>
                  {isGenerating ? <QuestionSkeleton count={Math.min(questionCount, 5)} /> : generatedQuestions.length > 0 && <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">{generatedQuestions.length} questions pour {selectedInterview?.candidate}</h3><Button onClick={copyAllQuestions} className="text-blue-600"><Copy size={16} /> Copier toutes les questions</Button></div>
                    <div className="space-y-4">{generatedQuestions.map((question, index) => <GeneratedQuestionCard key={question.id ?? index} question={question} index={index} copied={copiedId === question.id} onCopy={() => copyQuestion(question)} />)}</div>
                  </>}
                </div>
              </>}
            </div>
          </div>
        </ModalFrame>, document.body
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#031126]/65 p-4 backdrop-blur-sm">
          <div className="animate-modal-in w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#071A36] to-[#0b4a7d] p-5 text-white">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                  Nouveau rendez-vous
                </div>

                <h3 className="mt-1 text-lg font-black">
                  Programmer un entretien
                </h3>
              </div>

              <Button aria-label="Fermer"
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={18} />

                  <div>
                    <div className="text-xs font-black text-blue-900">
                      Entretien lié à une candidature
                    </div>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Vous pouvez uniquement programmer un entretien avec un
                      candidat ayant déjà postulé à une offre de votre
                      entreprise.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black text-slate-700">
                  Candidature concernée
                </label>

                <Select
                  value={scheduleApplication?.id||""}
                  onChange={(event) => {
                    const selected = mockApplications.find(
                      (application) =>
                        application.id === Number(event.target.value)
                    );

                    if (selected) {
                      setScheduleApplication(selected);
                    }
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Choisir une candidature</option>{mockApplications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.candidate} — {application.offer}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Date
                  </label>

                  <Input
                    type="date"
                    value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Heure
                  </label>

                  <Input
                    type="time"
                    value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Type
                  </label>

                  <Select value={scheduleType} onChange={e=>setScheduleType(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                    <option value="TECHNIQUE">Technique</option>
                    <option value="RH">RH</option>
                    <option value="COMPORTEMENTAL">Comportemental</option>
                    <option value="MOTIVATION">Motivation</option>
                    <option value="MIXTE">Mixte</option>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Format
                  </label>

                  <Select className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                    <option>Visioconférence</option>
                    <option>Présentiel</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black text-slate-700">
                  Message au candidat
                </label>

                <Textarea
                  rows={3} value={scheduleMessage} onChange={e=>setScheduleMessage(e.target.value)}
                  placeholder="Ajoutez une information utile au candidat..."
                  className="w-full resize-none rounded-xl border border-slate-200 p-3 text-xs outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Annuler
                </Button>

                <Button
                  type="button"
                  onClick={schedule}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  <CalendarDays size={15} />
                  Programmer l'entretien
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
   ========================================================= */



/* =========================================================
   TAB BUTTON
   ========================================================= */

function TabButton({ active, onClick, children }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-bold transition sm:flex-none ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-100"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      {children}
    </Button>
  );
}

/* =========================================================
   INTERVIEW CARD
   ========================================================= */
function getInterviewTypeStyle(type) {
  switch (type) {
    case "Technique":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "RH":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Culturel":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Diretion": // ou "Direction"
      return "border-orange-200 bg-orange-50 text-orange-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}
function InterviewCard({
  interview,
  index,
  onGenerate,
  onViewCandidate,
  onViewOffer,
}) {
  const isCompleted = interview.status === "Terminé";

  return (
    <article
      className="animate-fade-up overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Candidate */}
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-sm font-black text-white shadow-lg shadow-blue-100">
                {interview.initials}
              </div>

              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                  isCompleted ? "bg-slate-300" : "bg-emerald-500"
                }`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-black text-slate-900 sm:text-lg">
                  {interview.candidate}
                </h3>

                <span
                  className={`rounded-full border px-2 py-1 text-xs font-black ${getStatusStyle(
                    interview.status
                  )}`}
                >
                  {interview.status}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="font-bold text-slate-700">
                  {interview.job}
                </span>
                <span>•</span>
                <span>{interview.contract}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {interview.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:flex xl:items-center">
            <InfoMini
              icon={CalendarDays}
              label="Date"
              value={interview.date}
            />

            <InfoMini
              icon={Clock3}
              label="Heure"
              value={interview.time}
            />

            <InfoMini
              icon={Video}
              label="Format"
              value={interview.location}
            />

            <div className="rounded-xl bg-blue-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-blue-400">
                Compatibilité
              </div>

              <div className="mt-1 text-lg font-black text-blue-700">
                {interview.compatibility}%
              </div>
            </div>
          </div>
        </div>

        {/* Ligne inférieure */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-xl border px-3 py-2 text-xs font-black ${getInterviewTypeStyle(
                  interview.type
                )}`}
              >
                {interview.type}
              </span>

              <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                <Clock3 size={12} />
                {interview.duration}
              </span>

              <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                <ClipboardList size={12} />
                Candidature du {interview.applicationDate}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={onViewCandidate}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <UserRound size={14} />
                Voir la candidature
              </Button>

              <Button
                type="button"
                onClick={onViewOffer}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <BriefcaseBusiness size={14} />
                Voir l'offre
              </Button>

              <Button
                type="button"
                onClick={onGenerate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-100 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Sparkles size={14} />
                Générer les questions
              </Button>

              <Button aria-label="Afficher les actions"
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <MoreHorizontal size={17} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   INFO MINI
   ========================================================= */

function InfoMini({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Icon size={11} />
        {label}
      </div>

      <div className="mt-1 max-w-[110px] truncate text-xs font-black text-slate-800">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   QUESTION GÉNÉRÉE
   ========================================================= */

function GeneratedQuestionCard({
  question,
  index,
  copied,
  onCopy,
}) {
  const isTechnical = question.category === "Technique";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
              {index + 1}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-1 text-xs font-black ${getQuestionCategoryStyle(
                    question.category
                  )}`}
                >
                  {question.category}
                </span>

                <span className="text-xs font-semibold text-slate-400">
                  {question.offer}
                </span>
              </div>

              <h5 className="mt-2 text-sm font-black leading-6 text-slate-900">
                {question.question}
              </h5>
            </div>
          </div>

          <Button
            type="button"
            onClick={onCopy}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              copied
                ? "bg-emerald-50 text-emerald-700"
                : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 size={13} />
                Copié
              </>
            ) : (
              <>
                <Copy size={13} />
                Copier
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-blue-700">
            {isTechnical ? (
              <GraduationCap size={14} />
            ) : (
              <MessageSquare size={14} />
            )}

            {isTechnical ? "Réponse attendue" : "Réponse prototype"}
          </div>

          <p className="text-xs leading-5 text-slate-600">
            {isTechnical
              ? question.expectedAnswer
              : question.prototypeAnswer}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-emerald-700">
            <Target size={14} />

            {isTechnical ? "Points à vérifier" : "Critères d'évaluation"}
          </div>

          <div className="flex flex-wrap gap-2">
            {(isTechnical
              ? question.keyPoints
              : question.evaluationCriteria
            ).map((point) => (
              <span
                key={point}
                className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
              >
                {point}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   SKELETON QUESTIONS
   ========================================================= */

function QuestionSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50 p-4">
            <div className="h-8 w-8 rounded-lg bg-slate-200" />

            <div className="flex-1">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
            <div className="h-28 rounded-xl bg-slate-100" />
            <div className="h-28 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyState({ searchTerm, onReset }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {searchTerm ? <Search size={24} /> : <CalendarDays size={24} />}
      </div>

      <h3 className="mt-4 text-base font-black text-slate-900">
        Aucun entretien trouvé
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
        {searchTerm
          ? "Aucun entretien ne correspond à votre recherche."
          : "Aucun entretien ne correspond actuellement à ce filtre."}
      </p>

      <Button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
      >
        Afficher tous les entretiens
      </Button>
    </div>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

function getStatusStyle(status) {
  if (status === "À venir") {
    return "border-blue-100 bg-blue-50 text-blue-700";
  }

  if (status === "Terminé") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-orange-100 bg-orange-50 text-orange-700";
}

function getQuestionCategoryStyle(category) {
  switch (category) {
    case "Technique":
      return "border-blue-100 bg-blue-50 text-blue-700";

    case "Comportemental":
      return "border-violet-100 bg-violet-50 text-violet-700";

    case "Motivation":
      return "border-orange-100 bg-orange-50 text-orange-700";

    case "RH":
      return "border-cyan-100 bg-cyan-50 text-cyan-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}
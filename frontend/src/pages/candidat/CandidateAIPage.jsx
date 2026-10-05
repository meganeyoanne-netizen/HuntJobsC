import { usePlatformSettings } from "../../hooks/usePlatformSettings";
import { Button, Input, Textarea, ModalFrame } from "../../components/ui";
import AIResult from "../../components/common/AIResult";

import { api, perform } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { cvsAdapter } from "../../services/adapters";

import { useRef, useState } from "react";
import { ArrowRight, Check, FileText, Image as ImageIcon, MessageSquareText, Paperclip, Search, Sparkles, Upload, Video, X } from "lucide-react";




/* =========================================================
   CANDIDATE AI PAGE
========================================================= */

function CandidateAIPage({
  user = {
    firstName: "",
    lastName: "",
  },
  onNavigate,
  onLogout,
}) {
  const { settings: platform } = usePlatformSettings();
  const firstName = user?.firstName || "Candidat";

  const [activeModal, setActiveModal] = useState(null);

  const [aiResult,setAIResult]=useState(null);
  const [aiLoading,setAILoading]=useState(false);
  const runAI = (tool,context) => perform(async()=>{const modules={"analyse-offre":"aiOfferAnalysis","simulation-entretien":"aiInterviewSimulation","conseiller-cv":"aiCVAdvisor"};if(!platform.aiEnabled || (modules[tool] && !platform[modules[tool]]))throw Error("Ce module IA est désactivé par l’administrateur.");setAILoading(true);try{const response=await api("/ia/"+tool+"/",{method:"POST",body:context});setActiveModal(null);setAIResult({result:response.resultat,tool,context:context instanceof FormData?{}:context});}finally{setAILoading(false);}});
  


  const handleNavigate = (destination, data = null) => {
    setActiveModal(null);
    onNavigate?.(destination, data);
  };


  return (
    <div className="w-full text-slate-900 dark:text-slate-100">

      {/* =====================================================
          SIDEBAR DESKTOP
      ===================================================== */}

      


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="">

        <main className="min-h-screen">

          {/* =================================================
              TOPBAR
          ================================================= */}

          


          {/* =================================================
              PAGE
          ================================================= */}

          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">

            {/* HERO */}

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061a41] via-[#0b2d68] to-blue-600 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">

              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

              <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />

              <div className="relative max-w-3xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-blue-100">

                  <Sparkles size={12} />

                  JobConnect AI

                </div>


                <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                  Donnez un avantage à votre candidature.
                </h2>


                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/75">
                  Analysez les opportunités qui vous intéressent, préparez vos entretiens et améliorez votre CV grâce aux outils intelligents de JobConnect.
                </p>

              </div>

            </section>


            {/* =================================================
                OUTILS
            ================================================= */}

            <section className="mt-8">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                  Vos outils
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Que souhaitez-vous faire ?
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Choisissez un outil pour commencer.
                </p>

              </div>


              <div className="mt-5 grid gap-5 lg:grid-cols-3">

                {/* =================================================
                    ANALYSE OFFRE
                ================================================= */}

                <AIToolCard
                  icon={<Search size={22} />}
                  title="Analyse d'offre"
                  description="Comprenez rapidement une offre d'emploi et identifiez les éléments importants avant de postuler."
                  features={[
                    "Analyse des missions",
                    "Compétences recherchées",
                    "Points importants de l'offre",
                  ]}
                  buttonLabel="Analyser une offre"
                  iconBackground="bg-blue-50"
                  iconColor="text-blue-600"
                  disabled={!platform.aiEnabled || !platform.aiOfferAnalysis}
                  onClick={() => setActiveModal("offer-analysis")}
                />


                {/* =================================================
                    SIMULATION
                ================================================= */}

                <AIToolCard
                  icon={<Video size={22} />}
                  title="Simulation d'entretien"
                  description="Préparez-vous à votre prochain entretien avec une simulation basée sur l'offre qui vous intéresse."
                  features={[
                    "Questions adaptées à l'offre",
                    "Simulation interactive",
                    "Préparation personnalisée",
                  ]}
                  buttonLabel="Commencer une simulation"
                  iconBackground="bg-violet-50"
                  iconColor="text-violet-600"
                  disabled={!platform.aiEnabled || !platform.aiInterviewSimulation}
                  onClick={() => setActiveModal("interview")}
                />


                {/* =================================================
                    CONSEILLER CV
                ================================================= */}

                <AIToolCard
                  icon={<FileText size={22} />}
                  title="Conseiller CV"
                  description="Obtenez des recommandations intelligentes pour améliorer votre CV et mieux valoriser votre profil."
                  features={[
                    "Analyse de votre CV",
                    "Conseils personnalisés",
                    "Amélioration du contenu",
                  ]}
                  buttonLabel="Analyser mon CV"
                  iconBackground="bg-emerald-50"
                  iconColor="text-emerald-600"
                  disabled={!platform.aiEnabled || !platform.aiCVAdvisor}
                  onClick={() => setActiveModal("cv-advisor")}
                />

              </div>

            </section>


            {/* =================================================
                HISTORIQUE
            ================================================= */}

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/90 p-5 sm:p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                    Activité récente
                  </p>

                  <h3 className="mt-1 text-base font-black text-slate-900 dark:text-white">
                    Vos dernières utilisations
                  </h3>

                </div>

                <Sparkles
                  size={19}
                  className="text-blue-600 dark:text-blue-400"
                />

              </div>


              <div className="mt-5 grid gap-3 md:grid-cols-3">

                <HistoryItem
                  icon={<Search size={16} />}
                  title="Analyse d'offre"
                  detail="Développeur Full Stack Junior"
                  date="Il y a 2 jours"
                />

                <HistoryItem
                  icon={<Video size={16} />}
                  title="Simulation d'entretien"
                  detail="Développeur Django"
                  date="Il y a 4 jours"
                />

                <HistoryItem
                  icon={<FileText size={16} />}
                  title="Conseiller CV"
                  detail="CV Développeur Full Stack"
                  date="Il y a 6 jours"
                />

              </div>

            </section>


            {/* =================================================
                CONSEIL
            ================================================= */}

            <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/40 p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <MessageSquareText size={20} />
                </div>

                <div className="flex-1">

                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Conseil JobConnect
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">
                    Avant de postuler, utilisez l'analyse d'offre pour mieux comprendre les attentes du recruteur et adapter votre candidature.
                  </p>

                </div>

              </div>

            </section>

          </div>

        </main>

      </div>


      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      


      {/* =====================================================
          MODALS
      ===================================================== */}

      {activeModal === "offer-analysis" && (
        <OfferImportModal
          title="Analyser une offre"
          description="Ajoutez l'offre que vous souhaitez analyser. Vous pouvez utiliser un PDF, copier son texte ou importer une image."
          buttonLabel="Lancer l'analyse"
          onClose={() => setActiveModal(null)}
          onSuccess={context=>runAI("analyse-offre",context)}
        />
      )}


      {activeModal === "interview" && (
        <OfferImportModal
          title="Préparer un entretien"
          description="Importez l'offre correspondant au poste pour générer une simulation d'entretien personnalisée."
          buttonLabel="Préparer la simulation"
          onClose={() => setActiveModal(null)}
          onSuccess={context=>runAI("simulation-entretien",context)}
        />
      )}


      {activeModal === "cv-advisor" && (
        <CVAdvisorModal
          onClose={() => setActiveModal(null)}
          onSuccess={context=>runAI("conseiller-cv",context)}
        />
      )}

      {aiLoading&&<div role="status" className="fixed bottom-5 left-5 z-[150] rounded-2xl bg-blue-600 p-5 text-white shadow-xl">Génération en cours…</div>}
      {aiResult&&<AIResult {...aiResult} onClose={()=>setAIResult(null)}/>}
    </div>
  );
}


/* =========================================================
   AI TOOL CARD
========================================================= */

function AIToolCard({
  icon,
  title,
  description,
  features,
  buttonLabel,
  iconBackground,
  iconColor,
  onClick,
  disabled,
}) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/40">

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBackground} ${iconColor} transition group-hover:scale-105`}
      >
        {icon}
      </div>


      <h3 className="mt-5 text-base font-black text-slate-900 dark:text-white">
        {title}
      </h3>


      <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>


      <div className="mt-5 space-y-3">

        {features.map((feature) => (

          <div
            key={feature}
            className="flex items-center gap-2"
          >

            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">

              <Check size={11} />

            </div>

            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {feature}
            </span>

          </div>

        ))}

      </div>


      <Button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="mt-7 flex w-full items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-xs font-black text-slate-700 dark:text-slate-200 transition hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
      >

        {disabled ? "Désactivé par l’administrateur" : buttonLabel}

        <ArrowRight size={14} />

      </Button>
    </article>
  );
}


/* =========================================================
   OFFER IMPORT MODAL
========================================================= */

function OfferImportModal({
  title,
  description,
  buttonLabel,
  onClose,
  onSuccess,
}) {
  const [mode, setMode] = useState("pdf");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);


  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };


  const handleImageChange = (event) => {
    const selectedImage = event.target.files?.[0];

    if (selectedImage) {
      setImage(selectedImage);
    }
  };


  const canSubmit =
    (mode === "pdf" && file) ||
    (mode === "text" && text.trim().length > 20) ||
    (mode === "image" && image);


  return (
    <ModalShell
      title={title}
      description={description}
      onClose={onClose}
    >

      {/* =================================================
          MODES
      ================================================= */}

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">

        <ModalModeButton
          active={mode === "pdf"}
          icon={<FileText size={15} />}
          label="PDF"
          onClick={() => setMode("pdf")}
        />

        <ModalModeButton
          active={mode === "text"}
          icon={<MessageSquareText size={15} />}
          label="Texte"
          onClick={() => setMode("text")}
        />

        <ModalModeButton
          active={mode === "image"}
          icon={<ImageIcon size={15} />}
          label="Image"
          onClick={() => setMode("image")}
        />

      </div>


      {/* =================================================
          PDF
      ================================================= */}

      {mode === "pdf" && (

        <div className="mt-5">

          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 text-center transition hover:border-blue-300 hover:bg-blue-50/40"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Upload size={21} />
            </div>

            {file ? (

              <>
                <p className="mt-4 text-sm font-black text-slate-800">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  PDF sélectionné
                </p>
              </>

            ) : (

              <>
                <p className="mt-4 text-sm font-black text-slate-700">
                  Importer votre offre en PDF
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Cliquez pour sélectionner un fichier
                </p>
              </>

            )}

          </Button>

        </div>

      )}


      {/* =================================================
          TEXT
      ================================================= */}

      {mode === "text" && (

        <div className="mt-5">

          <label className="mb-2 block text-xs font-black text-slate-700">
            Texte de l'offre
          </label>

          <Textarea
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder="Copiez-collez ici le contenu de l'offre d'emploi..."
            className="min-h-[220px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

          <p className="mt-2 text-xs text-slate-400">
            Vous pouvez copier directement le texte depuis un site d'emploi ou un document.
          </p>

        </div>

      )}


      {/* =================================================
          IMAGE
      ================================================= */}

      {mode === "image" && (

        <div className="mt-5">

          <Input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          <Button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 text-center transition hover:border-blue-300 hover:bg-blue-50/40"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <ImageIcon size={21} />
            </div>

            {image ? (

              <>
                <p className="mt-4 text-sm font-black text-slate-800">
                  {image.name}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Image sélectionnée
                </p>
              </>

            ) : (

              <>
                <p className="mt-4 text-sm font-black text-slate-700">
                  Importer le flyer de l'offre
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  PNG, JPG, JPEG...
                </p>
              </>

            )}

          </Button>

        </div>

      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

        <Button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-500 transition hover:bg-slate-50"
        >
          Annuler
        </Button>

        <Button
          type="button"
          disabled={!canSubmit}
          onClick={()=>{const context=new FormData();context.append("texte",text);if(file)context.append("fichier",file);if(image)context.append("image",image);onSuccess(context);}}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >

          <Sparkles size={14} />

          {buttonLabel}

        </Button>

      </div>

    </ModalShell>
  );
}


/* =========================================================
   CV ADVISOR MODAL
========================================================= */

function CVAdvisorModal({
  onClose,
  onSuccess,
}) {
  const [selectedCV, setSelectedCV] = useState(null);
  const [importedFile, setImportedFile] = useState(null);

  const fileInputRef = useRef(null);


  const cvs = useResource("/users/cvs/",cvsAdapter)[0];


  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setImportedFile(file);
      setSelectedCV(null);
    }
  };


  const canSubmit = selectedCV || importedFile;


  return (
    <ModalShell
      title="Conseiller CV"
      description="Choisissez un CV déjà disponible sur JobConnect ou importez un nouveau document à analyser."
      onClose={onClose}
    >

      {/* =================================================
          CV EXISTANTS
      ================================================= */}

      <div className="mt-1">

        <div className="flex items-center justify-between">

          <p className="text-xs font-black text-slate-700">
            Mes CV disponibles
          </p>

          <span className="text-xs font-bold text-slate-400">
            {cvs.length} CV
          </span>

        </div>


        <div className="mt-3 space-y-2">

          {cvs.map((cv) => (

            <Button
              key={cv.id}
              type="button"
              onClick={() => {
                setSelectedCV(cv.id);
                setImportedFile(null);
              }}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                selectedCV === cv.id
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
              }`}
            >

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  selectedCV === cv.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >

                <FileText size={17} />

              </div>


              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <p className="truncate text-xs font-black text-slate-800">
                    {cv.name}
                  </p>

                  {cv.primary && (
                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-black text-blue-700">
                      Principal
                    </span>
                  )}

                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {cv.updated}
                </p>

              </div>


              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  selectedCV === cv.id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300"
                }`}
              >

                {selectedCV === cv.id && (
                  <Check size={12} />
                )}

              </div>

            </Button>

          ))}

        </div>

      </div>


      {/* =================================================
          SEPARATOR
      ================================================= */}

      <div className="my-5 flex items-center gap-3">

        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          ou
        </span>

        <div className="h-px flex-1 bg-slate-200" />

      </div>


      {/* =================================================
          IMPORT
      ================================================= */}

      <Input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`flex w-full items-center gap-4 rounded-2xl border-2 border-dashed p-4 text-left transition ${
          importedFile
            ? "border-blue-300 bg-blue-50"
            : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
        }`}
      >

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <Upload size={19} />
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-xs font-black text-slate-700">
            {importedFile
              ? importedFile.name
              : "Utiliser un autre CV"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {importedFile
              ? "PDF sélectionné"
              : "Importer un CV au format PDF"}
          </p>

        </div>

        <Paperclip
          size={16}
          className="text-slate-300"
        />

      </Button>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

        <Button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-500 transition hover:bg-slate-50"
        >
          Annuler
        </Button>

        <Button
          type="button"
          disabled={!canSubmit}
          onClick={onSuccess}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >

          <Sparkles size={14} />

          Analyser mon CV

        </Button>

      </div>

    </ModalShell>
  );
}


/* =========================================================
   MODAL SHELL
========================================================= */

function ModalShell({
  title,
  description,
  children,
  onClose,
}) {
  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

      <div
        className="absolute inset-0"
        onClick={onClose}
      />


      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white p-5 shadow-2xl sm:p-7">

        {/* Header */}

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Sparkles size={20} />
          </div>


          <div className="min-w-0 flex-1">

            <h2 className="text-lg font-black tracking-tight text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>

          </div>


          <Button aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >

            <X size={18} />

          </Button>

        </div>


        {children}

      </div>

    </ModalFrame>
  );
}


/* =========================================================
   MODAL MODE BUTTON
========================================================= */

function ModalModeButton({
  active,
  icon,
  label,
  onClick,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-black transition ${
        active
          ? "bg-white text-blue-600 shadow-sm"
          : "text-slate-400 hover:text-slate-600"
      }`}
    >

      {icon}

      {label}

    </Button>
  );
}


/* =========================================================
   HISTORY ITEM
========================================================= */

function HistoryItem({
  icon,
  title,
  detail,
  date,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-800/50 p-4 transition hover:border-blue-100 hover:bg-blue-50/40 dark:hover:border-blue-900/50 dark:hover:bg-blue-950/30">

      <div className="flex items-center gap-3">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-black text-slate-800 dark:text-slate-100">
            {title}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-400">
            {detail}
          </p>

        </div>

      </div>


      <p className="mt-3 text-xs font-semibold text-slate-400 dark:text-slate-500">
        {date}
      </p>

    </div>
  );
}


/* =========================================================
   MOBILE NAV
========================================================= */




export default CandidateAIPage;
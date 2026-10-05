import { SectionHeader } from "../../components/ui";
import { Button, ModalFrame, Textarea, Input } from "../../components/ui";
import { downloadText } from "../../services/api";
import AIResult from "../../components/common/AIResult";
import { documentDesigns } from "./documentDesigns";

import { api, remove, perform } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { generationsAdapter } from "../../services/adapters";

import { useState } from "react";
import { ArrowRight, BriefcaseBusiness, Check, Download, Eye, FileText, FolderOpen, Mail, Plus, Sparkles, Trash2, Upload, WandSparkles, X } from "lucide-react";




/* =========================================================
   DOCUMENTS IA — ESPACE CANDIDAT
========================================================= */

function CandidateDocumentsPage({
  user = {
    firstName: "",
    lastName: "",
  },
  onNavigate,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState("documents");
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);

  const firstName = user?.firstName || "Candidat";


  /* =======================================================
     NAVIGATION SIDEBAR
  ======================================================= */

  


  /* =======================================================
     DOCUMENTS EXISTANTS
  ======================================================= */

  const [documents, setDocuments] = useResource("/generations/",generationsAdapter);


  /* =======================================================
     TYPES DE DOCUMENTS
  ======================================================= */

  const documentTypes = [
    {
      id: "cv",
      title: "Créer un CV",
      description:
        "Générez un CV professionnel adapté à votre profil et à votre objectif.",
      icon: <FileText size={21} />,
      color: "blue",
    },
    {
      id: "letter",
      title: "Lettre de motivation",
      description:
        "Créez une lettre personnalisée à partir d'une offre d'emploi.",
      icon: <Mail size={21} />,
      color: "violet",
    },
    {
      id: "portfolio",
      title: "Portfolio",
      description:
        "Construisez un portfolio professionnel mettant en valeur vos réalisations.",
      icon: <FolderOpen size={21} />,
      color: "emerald",
    },
  ];


  /* =======================================================
     SUPPRESSION DOCUMENT
  ======================================================= */

  const deleteDocument = (id) => perform(async () => {await remove("/generations/"+id+"/");setDocuments(items=>items.filter(d=>d.id!==id));});


  /* =======================================================
     OUVRIR GÉNÉRATEUR
  ======================================================= */

  const openGenerator = (type) => {
    setSelectedDocumentType(type);
    setShowGenerator(true);
  };


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


            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061a41] via-[#0b2d68] to-blue-600 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">

              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

              <div className="absolute -bottom-28 left-1/3 h-60 w-60 rounded-full bg-indigo-400/20 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

                <div className="max-w-2xl">

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-blue-100">
                    <Sparkles size={12} />
                    Génération intelligente
                  </div>

                  <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                    Créez des documents qui vous ressemblent.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/75">
                    Utilisez l'intelligence artificielle pour créer des CV,
                    lettres de motivation et portfolios professionnels adaptés
                    à vos objectifs.
                  </p>

                </div>


                <Button
                  type="button"
                  onClick={() => openGenerator("cv")}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  <Plus size={16} />
                  Créer un document
                </Button>

              </div>

            </section>


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <DocumentStat
                icon={<FileText size={19} />}
                label="Documents"
                value={documents.length}
                detail="Documents disponibles"
              />

              <DocumentStat
                icon={<Sparkles size={19} />}
                label="Documents IA"
                value="8"
                detail="Documents générés"
              />

              <DocumentStat
                icon={<Download size={19} />}
                label="Téléchargements"
                value="14"
                detail="Documents téléchargés"
              />

              <DocumentStat
                icon={<FolderOpen size={19} />}
                label="Espace utilisé"
                value="5,4 Mo"
                detail="Sur votre espace personnel"
              />

            </section>


            {/* =================================================
                GÉNÉRATEURS
            ================================================= */}

            <section className="mt-8">

              <SectionHeader
                title="Créer avec l'IA"
                description="Choisissez le document que vous souhaitez générer."
              />


              <div className="mt-5 grid gap-4 md:grid-cols-3">

                {documentTypes.map((type) => (

                  <DocumentGeneratorCard
                    key={type.id}
                    document={type}
                    onClick={() => openGenerator(type.id)}
                  />

                ))}

              </div>

            </section>


            {/* =================================================
                DOCUMENTS
            ================================================= */}

            <section className="mt-9">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                <SectionHeader
                  title="Mes documents"
                  description="Retrouvez ici tous vos documents générés."
                />

                <div className="flex rounded-xl border border-slate-200 bg-white p-1">

                  <Button
                    type="button"
                    onClick={() => setActiveTab("documents")}
                    className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                      activeTab === "documents"
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-blue-600"
                    }`}
                  >
                    Tous
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setActiveTab("recent")}
                    className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                      activeTab === "recent"
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-blue-600"
                    }`}
                  >
                    Récents
                  </Button>

                </div>

              </div>


              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">

                {documents.length > 0 ? (

                  documents
                    .filter((document) => {
                      if (activeTab === "recent") {
                        return document.id <= 2;
                      }

                      return true;
                    })
                    .map((document, index, array) => (

                      <DocumentRow
                        key={document.id}
                        document={document}
                        last={index === array.length - 1}
                        onDelete={() =>
                          deleteDocument(document.id)
                        }
                      />

                    ))

                ) : (

                  <EmptyDocuments
                    onCreate={() => openGenerator("cv")}
                  />

                )}

              </div>

            </section>


            {/* =================================================
                CONSEILS
            ================================================= */}

            <section className="mt-8 grid gap-5 lg:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-white p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <WandSparkles size={20} />
                  </div>

                  <div>

                    <h3 className="text-sm font-black text-slate-900">
                      Personnalisez vos documents
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Plus votre profil est complet, plus l'IA pourra
                      adapter vos documents à votre parcours et à vos
                      objectifs professionnels.
                    </p>

                    <Button
                      type="button"
                      onClick={() => onNavigate?.("candidate-profile")}
                      className="mt-4 flex items-center gap-2 text-xs font-black text-blue-600 transition hover:text-blue-700"
                    >
                      Compléter mon profil
                      <ArrowRight size={13} />
                    </Button>

                  </div>

                </div>

              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div>

                    <h3 className="text-sm font-black text-slate-900">
                      Adaptez votre CV à une offre
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Analysez une offre d'emploi et utilisez les
                      recommandations de l'IA pour améliorer votre
                      candidature.
                    </p>

                    <Button
                      type="button"
                      onClick={() => onNavigate?.("candidate-ai")}
                      className="mt-4 flex items-center gap-2 text-xs font-black text-violet-600 transition hover:text-violet-700"
                    >
                      Utiliser l'outil IA
                      <ArrowRight size={13} />
                    </Button>

                  </div>

                </div>

              </div>

            </section>

          </div>

        </main>

      </div>


      {/* =====================================================
          NAVIGATION MOBILE
      ===================================================== */}

      


      {/* =====================================================
          MODAL GÉNÉRATION
      ===================================================== */}

      {showGenerator && (

        <DocumentGeneratorModal
          type={selectedDocumentType}
          onClose={() => {
            setShowGenerator(false);
            setSelectedDocumentType(null);
          }}
        />

      )}

    </div>
  );
}


/* =========================================================
   DOCUMENT STAT
========================================================= */

function DocumentStat({
  icon,
  label,
  value,
  detail,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/40 sm:p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-slate-400">
        {detail}
      </p>

    </div>
  );
}


/* =========================================================
   SECTION HEADER
========================================================= */




/* =========================================================
   GENERATOR CARD
========================================================= */

function DocumentGeneratorCard({
  document,
  onClick,
}) {
  const styles = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      hover: "group-hover:bg-blue-600 group-hover:text-white",
      button: "text-blue-600",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      hover: "group-hover:bg-violet-600 group-hover:text-white",
      button: "text-violet-600",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      hover: "group-hover:bg-emerald-600 group-hover:text-white",
      button: "text-emerald-600",
    },
  };

  const style = styles[document.color] || styles.blue;

  return (
    <Button
      type="button"
      onClick={onClick}
      className="group text-left rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50"
    >

      <div className="flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.icon} ${style.hover} transition-all`}
        >
          {document.icon}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-300 transition group-hover:bg-blue-50 group-hover:text-blue-600">
          <ArrowRight size={15} />
        </div>

      </div>

      <h3 className="mt-5 text-sm font-black text-slate-900">
        {document.title}
      </h3>

      <p className="mt-2 min-h-[40px] text-xs leading-5 text-slate-400">
        {document.description}
      </p>

      <div className={`mt-5 flex items-center gap-2 text-xs font-black ${style.button}`}>
        Commencer
        <ArrowRight size={12} />
      </div>

    </Button>
  );
}


/* =========================================================
   DOCUMENT ROW
========================================================= */

function DocumentRow({
  document,
  last,
  onDelete,
}) {
  return (
    <div
      className={`group flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center ${
        !last ? "border-b border-slate-100" : ""
      }`}
    >

      <div className="flex min-w-0 flex-1 items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {document.icon}
        </div>

        <div className="min-w-0">

          <p className="truncate text-sm font-extrabold text-slate-900">
            {document.title}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">

            <span>{document.type}</span>

            <span>•</span>

            <span>{document.format}</span>

            <span>•</span>

            <span>{document.size}</span>

            <span>•</span>

            <span>{document.date}</span>

          </div>

        </div>

      </div>


      <div className="flex items-center gap-2">

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-black text-emerald-600">

          <Check size={11} />

          {document.status}

        </span>


        <Button aria-label="Consulter"
          type="button"
          title="Prévisualiser" onClick={()=>downloadText(document.contenu,document.title+".txt")}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Eye size={15} />
        </Button>


        <Button aria-label="Télécharger"
          type="button"
          title="Télécharger" onClick={()=>downloadText(document.contenu,document.title+".txt")}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Download size={15} />
        </Button>


        <Button aria-label="Supprimer"
          type="button"
          title="Supprimer"
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={15} />
        </Button>

      </div>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyDocuments({
  onCreate,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <FolderOpen size={26} />
      </div>

      <h3 className="mt-5 text-base font-black text-slate-900">
        Aucun document
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
        Vous n'avez pas encore créé de document. Utilisez nos outils IA
        pour commencer.
      </p>

      <Button
        type="button"
        onClick={onCreate}
        className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white transition hover:bg-blue-700"
      >
        <Plus size={15} />
        Créer un document
      </Button>

    </div>
  );
}


/* =========================================================
   MODAL GÉNÉRATION
========================================================= */

function DocumentGeneratorModal({
  type,
  onClose,
}) {
  const [text,setText]=useState("");
  const [file,setFile]=useState(null);
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [design,setDesign]=useState("libre");
  const [questions,setQuestions]=useState(null);
  const [answers,setAnswers]=useState({});
  const tool={cv:"generer-cv",letter:"lettre-motivation",portfolio:"portfolio"}[type];
  const guided=type==="cv"||type==="portfolio";
  const generate=()=>perform(async()=>{setLoading(true);try{const body=new FormData();body.append("texte",text);if(file)body.append("fichier",file);if(guided){body.append("design",design);if(questions===null)body.append("etape","preparer");else body.append("reponses",JSON.stringify(questions.map((question,index)=>({question,reponse:answers[index]||""}))));}const response=await api("/ia/"+tool+"/",{method:"POST",body});if(guided&&questions===null){setQuestions(response.questions);setAnswers({});}else setResult(response.resultat);}finally{setLoading(false);}});
  const titles = {
    cv: "Créer un CV avec l'IA",
    letter: "Créer une lettre de motivation",
    portfolio: "Créer un portfolio",
  };

  const descriptions = {
    cv:
      "L'IA va vous accompagner dans la création d'un CV professionnel adapté à votre profil.",
    letter:
      "Personnalisez votre lettre de motivation en fonction de l'offre et de votre parcours.",
    portfolio:
      "Créez une présentation professionnelle de vos compétences et réalisations.",
  };

  const title = titles[type] || titles.cv;
  const description = descriptions[type] || descriptions.cv;

  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

      {result&&<AIResult result={result} tool={tool} context={{texte:text}} onClose={()=>{setResult(null);onClose();}}/>}
      <div className={"relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl " + (guided ? "max-w-4xl" : "max-w-xl")}>

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles size={19} />
            </div>

            <div>

              <h2 className="text-sm font-black text-slate-900">
                {title}
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Assistant JobConnect
              </p>

            </div>

          </div>


          <Button aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <X size={17} />
          </Button>

        </div>


        {/* BODY */}

        <div className="overflow-y-auto p-6">

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">

            <div className="flex gap-3">

              <Sparkles
                size={18}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <p className="text-xs leading-5 text-blue-800">
                {description}
              </p>

            </div>

          </div>


          {guided&&<fieldset className="mt-5"><legend className="text-xs font-black uppercase tracking-wide text-slate-500">Choisissez votre modèle {type==="cv"?"de CV":"de portfolio"}</legend><p className="mt-1 text-xs text-slate-500">Sélectionnez un aperçu pour voir la présentation souhaitée.</p><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{documentDesigns[type].map(option=><label key={option.id} className={"group cursor-pointer overflow-hidden rounded-2xl border-2 transition hover:border-blue-300 hover:shadow-md "+(design===option.id?"border-blue-600 bg-blue-50 shadow-md":"border-slate-200 bg-white")}><input type="radio" name="document-design" value={option.id} checked={design===option.id} onChange={()=>{setDesign(option.id);setQuestions(null);setAnswers({});}} className="sr-only"/><div className="flex h-44 items-center justify-center overflow-hidden bg-slate-100 p-2 sm:h-52"><img src={option.image} alt={`Aperçu du modèle ${option.label} ${type==="cv"?"de CV":"de portfolio"}`} className="h-full w-full object-contain"/></div><div className="flex items-start justify-between gap-2 p-3"><div><span className="block text-xs font-black text-slate-800">{option.label}</span><span className="mt-1 block text-[11px] text-slate-500">{option.description}</span></div>{design===option.id&&<Check size={16} className="shrink-0 text-blue-600"/>}</div></label>)}</div></fieldset>}

          {questions!==null&&<div className="mt-5 space-y-3"><p className="text-xs font-bold text-slate-700">Précisions utiles pour personnaliser votre document (facultatives)</p>{questions.length===0?<p className="text-xs text-slate-500">Votre profil contient déjà les informations nécessaires.</p>:questions.map((question,index)=><label key={index} className="block text-xs font-semibold text-slate-700">{question}<Textarea rows={2} value={answers[index]||""} onChange={e=>setAnswers(current=>({...current,[index]:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label>)}</div>}

          <div className="mt-6">

            <label className="text-xs font-black uppercase tracking-wide text-slate-500">
              Informations complémentaires
            </label>

            <Textarea
              rows={5} value={text} onChange={e=>setText(e.target.value)}
              placeholder="Décrivez votre objectif, le poste recherché ou les informations que vous souhaitez mettre en avant..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

          </div>


          <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                <Upload size={16} />
              </div>

              <div className="flex-1">

                <p className="text-xs font-bold text-slate-700">
                  Ajouter un document existant
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Facultatif — PDF, DOC ou DOCX
                </p>

              </div>

              <Button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <Input aria-label="Document existant" type="file" accept=".pdf,.txt,.docx" onChange={e=>setFile(e.target.files?.[0])} />
              </Button>

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">

          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-3 text-xs font-black text-slate-500 transition hover:bg-white hover:text-slate-700"
          >
            Annuler
          </Button>

          <Button
            type="button" onClick={generate} disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Sparkles size={14} />
            {loading?"En cours…":guided&&questions===null?"Continuer":"Générer avec l’IA"}
          </Button>

        </div>

      </div>

    </ModalFrame>
  );
}


/* =========================================================
   MOBILE NAV
========================================================= */




export default CandidateDocumentsPage;

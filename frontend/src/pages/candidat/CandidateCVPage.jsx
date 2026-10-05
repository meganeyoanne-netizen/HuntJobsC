import { Button, Input } from "../../components/ui";
import CVOnlineEditor from "../../components/common/CVOnlineEditor";

import { api, post, remove, perform, download } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { cvsAdapter } from "../../services/adapters";

import { useRef, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Check, Download, Eye, FileText, MoreHorizontal, Plus, Search, Settings2, Sparkles, Trash2, Upload, X } from "lucide-react";




/* =========================================================
   CANDIDATE CV PAGE
========================================================= */

function CandidateCVPage({
  user = {
    firstName: "",
    lastName: "",
  },
  onNavigate,
  onLogout,
}) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const firstName = user?.firstName || "Candidat";

  /* =======================================================
     NAVIGATION
  ======================================================= */

  

  /* =======================================================
     CV DEMO
  ======================================================= */

  const [cvList, setCvList] = useResource("/users/cvs/",cvsAdapter);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredCVs = cvList.filter((cv) =>
    cv.name.toLowerCase().includes(search.toLowerCase())
  );

  /* =======================================================
     SET MAIN CV
  ======================================================= */

  const refreshCVs=async()=>setCvList(cvsAdapter(await api("/users/cvs/")));
  const handleSetMain = (id) => perform(async () => {await post("/users/cvs/"+id+"/primary/",{});await refreshCVs();});

  /* =======================================================
     DELETE CV
  ======================================================= */

  const confirmDelete = () => perform(async () => {if(!selectedCV)return;await remove("/users/cvs/"+selectedCV.id+"/");await refreshCVs();setSelectedCV(null);setShowDeleteModal(false);});

  /* =======================================================
     UPLOAD
  ======================================================= */

  const handleFileChange = (event) => perform(async () => {const file=event.target.files?.[0];if(!file)return;setIsUploading(true);try{const form=new FormData();form.append("titre",file.name);form.append("fichier",file);await api("/users/cvs/",{method:"POST",body:form});await refreshCVs();setShowUploadModal(false);}finally{setIsUploading(false);}});

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">

      <CVOnlineEditor onSaved={refreshCVs}/>
      {/* =====================================================
          SIDEBAR DESKTOP
      ===================================================== */}

      


      {/* =====================================================
          CONTENU
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

            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061a41] via-[#0b2d68] to-blue-600 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">

              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

              <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />

              <div className="relative">

                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

                  <div className="max-w-2xl">

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-blue-100">

                      <FileText size={12} />

                      Gestion de vos CV

                    </div>

                    <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                      Votre CV, votre première impression.
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/75">
                      Ajoutez, gérez et améliorez vos CV afin de présenter
                      la meilleure version de votre profil aux recruteurs.
                    </p>

                  </div>

                  <Button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    <Upload size={15} />
                    Ajouter un CV
                  </Button>

                </div>

              </div>

            </section>


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <CVStat
                icon={<FileText size={19} />}
                label="CV disponibles"
                value={cvList.length}
                detail="Documents enregistrés"
              />

              <CVStat
                icon={<Check size={19} />}
                label="CV principal"
                value={
                  cvList.some((cv) => cv.main)
                    ? "Défini"
                    : "À définir"
                }
                detail="Utilisé pour vos candidatures"
              />

              <CVStat
                icon={<Sparkles size={19} />}
                label="CV optimisé"
                value={
                  cvList.length
                    ? `${Math.max(
                        ...cvList.map(
                          (cv) => cv.completeness
                        )
                      )}%`
                    : "0%"
                }
                detail="Meilleur niveau de complétude"
              />

              <CVStat
                icon={<BriefcaseBusiness size={19} />}
                label="Candidatures"
                value="12"
                detail="Avec votre CV principal"
              />

            </section>


            {/* =================================================
                BARRE DE RECHERCHE
            ================================================= */}

            <section className="mt-8">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                    Ma bibliothèque
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                    Mes CV
                  </h2>

                </div>

                <div className="relative w-full sm:max-w-xs">

                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Rechercher un CV..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>

            </section>


            {/* =================================================
                CV PRINCIPAL
            ================================================= */}

            {cvList.some((cv) => cv.main) && (

              <section className="mt-5">

                {cvList
                  .filter((cv) => cv.main)
                  .map((cv) => (

                    <div
                      key={cv.id}
                      className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/40 sm:p-6"
                    >

                      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-50 blur-2xl" />

                      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-4">

                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                            <FileText size={24} />
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-sm font-black text-slate-900 sm:text-base">
                                {cv.name}
                              </h3>

                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-black uppercase tracking-wide text-blue-700">
                                <Check size={10} />
                                CV principal
                              </span>

                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {cv.type} · {cv.size} · Mis à jour le{" "}
                              {cv.updated}
                            </p>

                          </div>

                        </div>

                        <div className="flex flex-wrap gap-2">

                          <CVAction
                            icon={<Eye size={15} />}
                            label="Aperçu" onClick={()=>perform(()=>download("/fichiers/cv/"+cv.id+"/",cv.name+(cv.fichier?".pdf":".txt")))}
                          />

                          <CVAction
                            icon={<Download size={15} />}
                            label="Télécharger" onClick={()=>perform(()=>download("/fichiers/cv/"+cv.id+"/",cv.name+(cv.fichier?".pdf":".txt")))}
                          />

                          <Button
                            type="button"
                            onClick={() => {
                              setSelectedCV(cv);
                              setShowDeleteModal(true);
                            }}
                            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-500 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                            Supprimer
                          </Button>

                        </div>

                      </div>

                    </div>

                  ))}

              </section>

            )}


            {/* =================================================
                LISTE DES CV
            ================================================= */}

            <section className="mt-5">

              {filteredCVs.length === 0 ? (

                <EmptyCV
                  search={search}
                  onUpload={() => setShowUploadModal(true)}
                />

              ) : (

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {filteredCVs
                    .filter((cv) => !cv.main)
                    .map((cv) => (

                      <CVCard
                        key={cv.id}
                        cv={cv}
                        onSetMain={() =>
                          handleSetMain(cv.id)
                        }
                        onDelete={() => {
                          setSelectedCV(cv);
                          setShowDeleteModal(true);
                        }}
                      />

                    ))}

                </div>

              )}

            </section>


            {/* =================================================
                CONSEILS
            ================================================= */}

            <section className="mt-8 grid gap-5 lg:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Sparkles size={19} />
                  </div>

                  <div>

                    <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                      Assistant IA
                    </p>

                    <h3 className="mt-1 text-sm font-black text-slate-900">
                      Optimisez votre CV
                    </h3>

                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Analysez votre CV avec nos outils IA et obtenez des
                  recommandations pour améliorer sa présentation et son contenu.
                </p>

                <Button
                  type="button"
                  onClick={() => onNavigate?.("candidate-ai")}
                  className="mt-5 flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  Analyser mon CV
                  <ArrowRight size={14} />
                </Button>

              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Settings2 size={19} />
                  </div>

                  <div>

                    <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-600">
                      Conseils
                    </p>

                    <h3 className="mt-1 text-sm font-black text-slate-900">
                      Gardez votre CV à jour
                    </h3>

                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Votre CV principal sera utilisé lors de vos candidatures.
                  Pensez à le maintenir à jour avec vos nouvelles compétences
                  et expériences.
                </p>

                <Button
                  type="button"
                  onClick={() => onNavigate?.("candidate-profile")}
                  className="mt-5 flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-600"
                >
                  Mettre à jour mon profil
                  <ArrowRight size={14} />
                </Button>

              </div>

            </section>

          </div>

        </main>

      </div>


      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      


      {/* =====================================================
          MODAL UPLOAD
      ===================================================== */}

      {showUploadModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  Bibliothèque CV
                </p>

                <h3 className="mt-1 text-base font-black text-slate-900">
                  Ajouter un CV
                </h3>

              </div>

              <Button aria-label="Fermer"
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </Button>

            </div>

            <div className="p-5 sm:p-6">

              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-300 hover:bg-blue-50/50"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:scale-105">
                  <Upload size={24} />
                </div>

                <p className="mt-4 text-sm font-black text-slate-800">
                  {isUploading
                    ? "Importation en cours..."
                    : "Cliquez pour sélectionner votre CV"}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Format accepté : PDF · Taille maximale recommandée : 5 Mo
                </p>

                {isUploading && (
                  <div className="mt-5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">

                    <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-600" />

                  </div>
                )}

              </Button>

              <Input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="mt-5 rounded-xl bg-blue-50 p-4">

                <div className="flex gap-3">

                  <Sparkles
                    size={17}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <p className="text-xs leading-5 text-blue-800">
                    Après l'importation, vous pourrez utiliser les outils IA
                    pour analyser et améliorer votre CV.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          MODAL SUPPRESSION
      ===================================================== */}

      {showDeleteModal && selectedCV && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={21} />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900">
              Supprimer ce CV ?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Vous êtes sur le point de supprimer{" "}
              <span className="font-bold text-slate-600">
                {selectedCV.name}
              </span>
              . Cette action ne pourra pas être annulée.
            </p>

            <div className="mt-6 flex gap-3">

              <Button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCV(null);
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
              >
                Annuler
              </Button>

              <Button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-xs font-black text-white transition hover:bg-red-700"
              >
                Supprimer
              </Button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   CV CARD
========================================================= */

function CVCard({
  cv,
  onSetMain,
  onDelete,
}) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50">

      <div className="flex items-start justify-between gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
          <FileText size={21} />
        </div>

        <Button aria-label="Afficher les actions"
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <MoreHorizontal size={17} />
        </Button>

      </div>

      <div className="mt-5">

        <h3 className="truncate text-sm font-black text-slate-900">
          {cv.name}
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          {cv.type} · {cv.size}
        </p>

      </div>

      {/* COMPLETUDE */}

      <div className="mt-5">

        <div className="flex items-center justify-between">

          <span className="text-xs font-bold text-slate-400">
            Niveau de complétude
          </span>

          <span className="text-xs font-black text-blue-600">
            {cv.completeness}%
          </span>

        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${cv.completeness}%`,
            }}
          />

        </div>

      </div>

      <p className="mt-4 text-xs text-slate-400">
        Mis à jour le {cv.updated}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">

        <CVAction
          icon={<Eye size={14} />}
          label="Aperçu" onClick={()=>perform(()=>download("/fichiers/cv/"+cv.id+"/",cv.name+(cv.fichier?".pdf":".txt")))}
        />

        <CVAction
          icon={<Download size={14} />}
          label="Télécharger" onClick={()=>perform(()=>download("/fichiers/cv/"+cv.id+"/",cv.name+(cv.fichier?".pdf":".txt")))}
        />

      </div>

      <Button
        type="button"
        onClick={onSetMain}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-black text-blue-700 transition hover:bg-blue-100"
      >
        <Check size={13} />
        Définir comme CV principal
      </Button>

      <Button
        type="button"
        onClick={onDelete}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={13} />
        Supprimer
      </Button>

    </article>
  );
}


/* =========================================================
   CV ACTION
========================================================= */

function CVAction({
  icon,
  label,
  onClick,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-black text-slate-600 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
    >
      {icon}
      {label}
    </Button>
  );
}


/* =========================================================
   STAT
========================================================= */

function CVStat({
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
   EMPTY
========================================================= */

function EmptyCV({
  search,
  onUpload,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FileText size={24} />
      </div>

      <h3 className="mt-5 text-sm font-black text-slate-900">
        {search
          ? "Aucun CV trouvé"
          : "Vous n'avez encore aucun CV"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
        {search
          ? "Essayez avec un autre terme de recherche."
          : "Ajoutez votre premier CV afin de pouvoir l'utiliser lors de vos candidatures."}
      </p>

      {!search && (
        <Button
          type="button"
          onClick={onUpload}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white transition hover:bg-blue-700"
        >
          <Plus size={15} />
          Ajouter mon CV
        </Button>
      )}

    </div>
  );
}


/* =========================================================
   MOBILE NAV
========================================================= */




export default CandidateCVPage;
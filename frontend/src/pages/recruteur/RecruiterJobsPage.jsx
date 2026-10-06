import FormField from "../../components/ui/FormField";
import { StatusBadge as SharedStatusBadge } from "../../components/ui";
import { StatCard } from "../../components/ui";
import { Button, Input, ModalFrame, Form, Select, Textarea } from "../../components/ui";

import { api, post, patch, perform, success, report } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { jobsAdapter, offerPayload } from "../../services/adapters";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Building2, CalendarDays, Check, ChevronDown, Clock3, Edit3, FileSearch, Filter, MapPin, MoreHorizontal, Plus, Search, Sparkles, Trash2, Users, X } from "lucide-react";




const diplomaOptions = ["BEPC", "Probatoire", "Baccalauréat", "CAP", "BEP", "BTS", "DUT", "Licence", "Master", "Diplôme d’ingénieur", "Doctorat", "Autre"];

function RecruiterJobsPage({
  user = {
    firstName: "",
    lastName: "",
    companyName: "JobConnect",
  },
  onNavigate,
  onLogout,
  openPublish = false,
  jobId = null,
}) {

  const companyName =
    user?.companyName ||
    user?.company?.name ||
    "JobConnect";

  const recruiterName =
    user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : "Recruteur";


  /* =========================================================
     DONNÉES DES OFFRES
  ========================================================= */

  const [jobs, setJobs] = useResource("/offres/recruteur/mes-offres/",jobsAdapter);


  /* =========================================================
     ÉTATS
  ========================================================= */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showFilters, setShowFilters] =
    useState(false);

  const [showJobModal, setShowJobModal] =
    useState(openPublish);

  const [editingJob, setEditingJob] =
    useState(null);

  const [showMenu, setShowMenu] =
    useState(null);


  /* =========================================================
     FORMULAIRE
  ========================================================= */

  const defaultDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const emptyForm = {
    title: "",
    location: "",
    type: "CDI",
    experience: "Débutant",
    salary: "",
    diploma: "Baccalauréat",
    specialty: "",
    flyer: null,
    existingFlyer: "",
    deadline: defaultDeadline,
    description: "",
    skills: [],
  };


  const [form, setForm] =
    useState(emptyForm);

  const [skillInput, setSkillInput] =
    useState("");


  /* =========================================================
     FILTRAGE
  ========================================================= */

  const filteredJobs = useMemo(() => {

    return jobs.filter((job) => {

      const matchesSearch =
        job.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        job.location
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        job.skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(search.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" ||
        job.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  }, [jobs, search, statusFilter]);


  /* =========================================================
     STATISTIQUES
  ========================================================= */

  const activeJobs =
    jobs.filter(
      (job) => job.status === "active"
    ).length;

  const pendingJobs =
    jobs.filter(
      (job) => job.status === "pending"
    ).length;

  const expiredJobs =
    jobs.filter(
      (job) => job.status === "expired"
    ).length;

  const totalApplications =
    jobs.reduce(
      (total, job) =>
        total + job.applications,
      0
    );

  const totalViews =
    jobs.reduce(
      (total, job) =>
        total + job.views,
      0
    );


  /* =========================================================
     OUVERTURE MODAL PUBLICATION
  ========================================================= */

  const openCreateModal = () => {

    setEditingJob(null);

    setForm(emptyForm);

    setSkillInput("");

    setShowJobModal(true);

  };


  /* =========================================================
     OUVERTURE MODAL MODIFICATION
  ========================================================= */

  const openEditModal = (job) => {

    setEditingJob(job);

    setForm({
      title: job.title,
      location: job.location,
      type: job.type,
      experience: job.experience,
      salary: job.salary,
      diploma: job.diploma,
      specialty: "",
      flyer: null,
      existingFlyer: job.flyer || "",
      deadline: job.deadline,
      description: job.description,
      skills: [...job.skills],
    });

    setSkillInput("");

    setShowMenu(null);

    setShowJobModal(true);

  };

  useEffect(() => {
    if (jobId && jobs?.length > 0) {
      const target = jobs.find((j) => String(j.id) === String(jobId));
      if (target) {
        openEditModal(target);
      }
    }
  }, [jobId, jobs]);


  /* =========================================================
     FERMETURE MODAL
  ========================================================= */

  const closeModal = () => {

    setShowJobModal(false);

    setEditingJob(null);

    setForm(emptyForm);

    setSkillInput("");

  };


  /* =========================================================
     FORM INPUT
  ========================================================= */

  const updateForm = (field, value) => {

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

  };


  /* =========================================================
     AJOUT COMPÉTENCE
  ========================================================= */

  const addSkill = () => {

    const value =
      skillInput.trim();

    if (!value) return;

    const exists =
      form.skills.some(
        (skill) =>
          skill.toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {

      setSkillInput("");

      return;
    }

    setForm((current) => ({
      ...current,
      skills: [
        ...current.skills,
        value,
      ],
    }));

    setSkillInput("");

  };


  /* =========================================================
     SUPPRESSION COMPÉTENCE
     
     IMPORTANT :
     En modification, les compétences déjà
     validées ne peuvent pas être retirées.
  ========================================================= */

  const removeSkill = (skill) => {

    if (editingJob) {

      const existingSkill =
        editingJob.skills.some(
          (item) =>
            item.toLowerCase() ===
            skill.toLowerCase()
        );

      if (existingSkill) {
        return;
      }
    }

    setForm((current) => ({
      ...current,
      skills: current.skills.filter(
        (item) => item !== skill
      ),
    }));

  };


  /* =========================================================
     ENREGISTRER OFFRE
  ========================================================= */

  const refreshJobs=async()=>setJobs(jobsAdapter(await api("/offres/recruteur/mes-offres/")));
  const handleSubmit = (event) => perform(async () => {
    event.preventDefault();

    // Auto-intégration de la compétence si l'utilisateur l'a saisie sans cliquer sur +
    let currentSkills = [...(form.skills || [])];
    if (skillInput && skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
      currentSkills.push(skillInput.trim());
      updateForm("skills", currentSkills);
      setSkillInput("");
    }

    if (!form.title || !form.title.trim()) {
      report(Error("Veuillez renseigner l'intitulé du poste."));
      return;
    }
    if (!form.location || !form.location.trim()) {
      report(Error("Veuillez renseigner la localisation."));
      return;
    }
    if (!form.diploma) {
      report(Error("Veuillez sélectionner un diplôme requis."));
      return;
    }
    if (currentSkills.length === 0) {
      report(Error("Veuillez ajouter au moins une compétence recherchée (ex. React, Gestion de projet...)."));
      return;
    }
    if (!form.deadline) {
      report(Error("Veuillez indiquer la date limite de candidature."));
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (form.deadline < today) {
      report(Error("La date limite doit être aujourd'hui ou une date future."));
      return;
    }

    const payload = offerPayload({ ...form, skills: currentSkills });
    if (editingJob) delete payload.diplome_requis;
    let body = payload;
    if (form.flyer) {
      body = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          body.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
        }
      });
      body.append("flyer", form.flyer);
    }
    if (editingJob) {
      await patch("/offres/recruteur/" + editingJob.id + "/update/", body);
    } else {
      const result = await post("/offres/recruteur/create/", body);
      const id = result?.offre?.id || result?.id;
      if (id) {
        await post("/offres/recruteur/" + id + "/submit/", {});
      }
    }
    await refreshJobs();
    closeModal();
    success("Offre enregistrée et soumise à la modération avec succès !");
  });


  /* =========================================================
     SUPPRIMER / ARCHIVER
  ========================================================= */

  const archiveJob = (id) => perform(async () => {await post("/offres/recruteur/"+id+"/archive/",{});await refreshJobs();setShowMenu(null);});


  /* =========================================================
     RÉACTIVER
  ========================================================= */

  const reactivateJob = (id) => perform(async () => {await post("/offres/recruteur/"+id+"/reactivate/",{});await refreshJobs();setShowMenu(null);});


  /* =========================================================
     NAVIGATION
  ========================================================= */

  


  


  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7fc] text-slate-900">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="">


        {/* HEADER */}

        


        {/* =====================================================
            CONTENU
        ===================================================== */}

        <main className="px-4 pb-28 pt-6 sm:px-7 sm:pt-8 lg:px-9 lg:pb-10">


          {/* =================================================
              HERO
          ================================================= */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-9">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-blue-300/10 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">

                  <BriefcaseBusiness size={12} />

                  <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-100">
                    Espace offres
                  </span>

                </div>


                <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                  Gérez vos offres
                  <br />
                  <span className="text-cyan-300">
                    et trouvez les meilleurs talents.
                  </span>
                </h2>


                <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/75 sm:text-base">
                  Publiez, modifiez et suivez vos offres d'emploi depuis un seul espace.
                </p>

              </div>


              <div className="flex shrink-0">

                <Button
                  type="button"
                  onClick={openCreateModal}
                  className="group flex items-center gap-3 rounded-xl bg-white px-5 py-3.5 text-xs font-black text-blue-700 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50"
                >

                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition duration-500 group-hover:rotate-90">
                    <Plus size={16} />
                  </span>

                  Publier une offre

                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />

                </Button>

              </div>

            </div>

          </section>


          {/* =================================================
              STATISTIQUES
          ================================================= */}

          <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={<BriefcaseBusiness size={22} />}
              label="Offres actives"
              value={activeJobs}
              detail="Offres publiées et visibles"
              color="blue"
            />

            <StatCard
              icon={<Clock3 size={22} />}
              label="En modération"
              value={pendingJobs}
              detail="En attente de validation admin"
              color="orange"
            />

            <StatCard
              icon={<Users size={22} />}
              label="Candidatures"
              value={totalApplications}
              detail="Toutes vos offres"
              color="violet"
            />

            <StatCard
              icon={<FileSearch size={22} />}
              label="Vues"
              value={totalViews}
              detail="Consultations des offres"
              color="cyan"
            />

          </section>


          {/* =================================================
              BARRE DE RECHERCHE MOBILE + FILTRES
          ================================================= */}

          <section className="mt-7 rounded-[22px] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/40">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                <Search
                  size={17}
                  className="shrink-0 text-slate-400"
                />

                <Input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Rechercher par titre, localisation ou compétence..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />

              </div>


              <Button
                type="button"
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-black transition ${
                  showFilters
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >

                <Filter size={15} />

                Filtres

                <ChevronDown
                  size={14}
                  className={`transition ${
                    showFilters
                      ? "rotate-180"
                      : ""
                  }`}
                />

              </Button>

            </div>


            {showFilters && (

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">

                <FilterButton
                  label="Toutes"
                  active={
                    statusFilter ===
                    "all"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "all"
                    )
                  }
                />

                <FilterButton
                  label="Actives"
                  active={
                    statusFilter ===
                    "active"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "active"
                    )
                  }
                />

                <FilterButton
                  label="En modération"
                  active={
                    statusFilter ===
                    "pending"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "pending"
                    )
                  }
                />

                <FilterButton
                  label="Expirées"
                  active={
                    statusFilter ===
                    "expired"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "expired"
                    )
                  }
                />

                <FilterButton
                  label="Archivées"
                  active={
                    statusFilter ===
                    "archived"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "archived"
                    )
                  }
                />

              </div>

            )}

          </section>


          {/* =================================================
              LISTE DES OFFRES
          ================================================= */}

          <section className="mt-7">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                  Vos publications
                </p>

                <h2 className="mt-1.5 text-xl font-black text-slate-950">
                  Offres d'emploi
                </h2>

              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                {filteredJobs.length} offre
                {filteredJobs.length > 1
                  ? "s"
                  : ""}
              </span>

            </div>


            {filteredJobs.length === 0 ? (

              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BriefcaseBusiness
                    size={25}
                  />
                </div>

                <h3 className="mt-5 text-lg font-black">
                  Aucune offre trouvée
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Modifiez votre recherche ou publiez une nouvelle offre.
                </p>

                <Button
                  type="button"
                  onClick={
                    openCreateModal
                  }
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Publier une offre
                </Button>

              </div>

            ) : (

              <div className="grid gap-5 xl:grid-cols-2">

                {filteredJobs.map(
                  (job, index) => (

                    <JobCard
                      key={job.id}
                      job={job}
                      index={index}
                      menuOpen={
                        showMenu ===
                        job.id
                      }
                      onCloseMenu={() => setShowMenu(null)}
                      onMenu={() =>
                        setShowMenu(
                          showMenu ===
                            job.id
                            ? null
                            : job.id
                        )
                      }
                      onEdit={() =>
                        openEditModal(
                          job
                        )
                      }
                      onArchive={() =>
                        archiveJob(
                          job.id
                        )
                      }
                      onReactivate={() =>
                        reactivateJob(
                          job.id
                        )
                      }
                      onApplications={() =>
                        onNavigate?.(
                          "recruiter-applications",
                          job.id
                        )
                      }
                    />

                  )
                )}

              </div>

            )}

          </section>


          {/* =================================================
              INFORMATION
          ================================================= */}

          <section className="mt-7 overflow-hidden rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Sparkles size={21} />
              </div>

              <div className="flex-1">

                <h3 className="text-base font-black text-slate-900">
                  Bon à savoir concernant les modifications
                </h3>

                <p className="mt-1.5 max-w-3xl text-xs leading-6 text-slate-500 sm:text-sm">
                  Une fois une offre validée, certains critères deviennent obligatoires. Le diplôme requis et les compétences déjà validées sont conservés afin de garantir la cohérence des candidatures analysées par l'ATS. Vous pouvez néanmoins ajouter de nouvelles compétences et modifier la date limite.
                </p>

              </div>

            </div>

          </section>

        </main>

      </div>


      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      


      {/* =====================================================
          MODAL OFFRE
      ===================================================== */}

      {showJobModal && (

        <JobModal
          form={form}
          setForm={setForm}
          editingJob={editingJob}
          skillInput={skillInput}
          setSkillInput={setSkillInput}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onClose={closeModal}
          onSubmit={handleSubmit}
          updateForm={updateForm}
        />

      )}

    </div>
  );
}


/* ===========================================================
   STAT CARD
=========================================================== */




/* ===========================================================
   JOB CARD
=========================================================== */

function JobCard({
  job,
  index,
  menuOpen,
  onMenu,
  onCloseMenu,
  onEdit,
  onArchive,
  onReactivate,
  onApplications,
}) {

  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = event => { if (!menuRef.current?.contains(event.target)) onCloseMenu(); };
    const closeEscape = event => { if (event.key === "Escape") { onCloseMenu(); menuRef.current?.querySelector("button")?.focus(); } };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, [menuOpen, onCloseMenu]);

  const gradients = [
    "from-blue-50 via-white to-cyan-50",
    "from-violet-50 via-white to-blue-50",
    "from-cyan-50 via-white to-emerald-50",
    "from-orange-50 via-white to-amber-50",
  ];

  const iconColors = [
    "bg-blue-100 text-blue-600",
    "bg-violet-100 text-violet-600",
    "bg-cyan-100 text-cyan-600",
    "bg-orange-100 text-orange-600",
  ];

  const isActive =
    job.status === "active";

  const isExpired =
    job.status === "expired";

  const isArchived =
    job.status === "archived";

  return (
    <article
      style={{ zIndex: menuOpen ? 40 : undefined }}
      className={`group relative overflow-visible rounded-[24px] border border-slate-200 bg-gradient-to-br ${
        gradients[
          index % gradients.length
        ]
      } p-6 shadow-lg shadow-slate-200/40 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl`}
    >

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/70 transition duration-500 group-hover:scale-150" />


      <div className="relative">

        {/* TOP */}

        <div className="flex items-start justify-between gap-4">

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              iconColors[
                index %
                  iconColors.length
              ]
            } transition duration-500 group-hover:rotate-6 group-hover:scale-110`}
          >
            <BriefcaseBusiness
              size={21}
            />
          </div>


          <div className="flex items-center gap-2">

            <JobStatus
              status={
                job.status
              }
              label={
                job.statusLabel
              }
            />


            <div ref={menuRef} className="relative">

              <Button aria-label="Afficher les actions" aria-expanded={menuOpen}
                type="button"
                onClick={onMenu}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-400 shadow-sm transition hover:bg-white hover:text-slate-700"
              >
                <MoreHorizontal
                  size={17}
                />
              </Button>


              {menuOpen && (

                <div className="absolute right-0 top-11 z-30 w-56 max-w-[calc(100vw-48px)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">

                  <Button
                    type="button"
                    onClick={onEdit}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                  >

                    <Edit3 size={14} />

                    Modifier l'offre

                  </Button>


                  {isArchived ||
                  isExpired ? (

                    <Button
                      type="button"
                      onClick={
                        onReactivate
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-emerald-600 transition hover:bg-emerald-50"
                    >

                      <Check size={14} />

                      Réactiver l'offre

                    </Button>

                  ) : (

                    <Button
                      type="button"
                      onClick={
                        onArchive
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-red-500 transition hover:bg-red-50"
                    >

                      <Trash2 size={14} />

                      Archiver l'offre

                    </Button>

                  )}

                </div>

              )}

            </div>

          </div>

        </div>


        {/* TITLE */}

        <div className="mt-5">

          <h3
            onClick={onEdit}
            className="cursor-pointer text-xl font-black tracking-tight text-slate-950 transition hover:text-blue-600"
            title="Cliquer pour voir et modifier les détails de l'offre"
          >
            {job.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">

            <span className="flex items-center gap-1.5">
              <Building2
                size={12}
              />
              {job.company}
            </span>

            <span className="flex items-center gap-1.5">
              <MapPin
                size={12}
              />
              {job.location}
            </span>

          </div>

        </div>


        {/* TAGS */}

        <div className="mt-5 flex flex-wrap gap-2">

          <span className="rounded-lg bg-white/80 px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm">
            {job.type}
          </span>

          <span className="rounded-lg bg-white/80 px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm">
            {job.experience}
          </span>

          <span className="rounded-lg bg-white/80 px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm">
            {job.skills.length} compétences
          </span>

        </div>


        {/* SKILLS */}

        <div className="mt-4 flex flex-wrap gap-1.5">

          {job.skills
            .slice(0, 4)
            .map((skill) => (

              <span
                key={skill}
                className="rounded-md bg-slate-900/5 px-2.5 py-1.5 text-xs font-bold text-slate-500"
              >
                {skill}
              </span>

            ))}

          {job.skills.length >
            4 && (

            <span className="rounded-md bg-slate-900/5 px-2.5 py-1.5 text-xs font-bold text-slate-400">
              +
              {job.skills.length -
                4}
            </span>

          )}

        </div>


        {/* STATS */}

        <div className="mt-6 grid grid-cols-3 gap-2">

          <div className="rounded-xl bg-white/70 p-3">

            <p className="text-xs font-bold text-slate-400">
              Candidatures
            </p>

            <p className="mt-1 text-lg font-black text-slate-800">
              {job.applications}
            </p>

          </div>


          <div className="rounded-xl bg-white/70 p-3">

            <p className="text-xs font-bold text-slate-400">
              Vues
            </p>

            <p className="mt-1 text-lg font-black text-slate-800">
              {job.views}
            </p>

          </div>


          <div className="rounded-xl bg-white/70 p-3">

            <p className="text-xs font-bold text-slate-400">
              Échéance
            </p>

            <p className="mt-1 truncate text-xs font-black text-slate-800">
              {formatDate(
                job.deadline
              )}
            </p>

          </div>

        </div>


        {/* FOOTER */}

        <div className="mt-5 flex items-center justify-between border-t border-slate-200/60 pt-5">

          <div className="flex items-center gap-2">

            {job.validated ? (
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600">

                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                  <Check size={10} />
                </span>

                Offre validée

              </span>
            ) : job.status === "pending" ? (
              <span className="flex items-center gap-1.5 text-xs font-black text-amber-600">

                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100">
                  <Clock3 size={10} />
                </span>

                En modération

              </span>
            ) : null}

          </div>


          <div className="flex items-center gap-2">

            <Button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-blue-600"
            >
              <Edit3 size={12} />
              Détails
            </Button>

            <Button
              type="button"
              onClick={
                onApplications
              }
              className="group/button flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-black text-white transition hover:bg-blue-600"
            >

              Candidatures

              <ArrowRight
                size={12}
                className="transition group-hover/button:translate-x-1"
              />

            </Button>

          </div>

        </div>

      </div>

    </article>
  );
}


/* ===========================================================
   JOB STATUS
=========================================================== */

function JobStatus({ status, label }) {
  const displayLabel =
    label ||
    {
      active: "Active",
      pending: "En modération",
      draft: "Brouillon",
      expired: "Expirée",
      archived: "Archivée",
      rejected: "Rejetée",
      suspended: "Suspendue",
    }[status] ||
    "En modération";
  return <SharedStatusBadge status={displayLabel} />;
}


/* ===========================================================
   FILTER BUTTON
=========================================================== */

function FilterButton({
  label,
  active,
  onClick,
}) {

  return (
    <Button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2.5 text-xs font-black transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {label}
    </Button>
  );
}


/* ===========================================================
   MODAL OFFRE
=========================================================== */

function JobModal({
  form,
  setForm,
  editingJob,
  skillInput,
  setSkillInput,
  onAddSkill,
  onRemoveSkill,
  onClose,
  onSubmit,
  updateForm,
}) {

  const [flyerPreview, setFlyerPreview] = useState(form.existingFlyer);
  useEffect(() => {
    if (!form.flyer) { setFlyerPreview(form.existingFlyer); return; }
    const url = URL.createObjectURL(form.flyer);
    setFlyerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.flyer, form.existingFlyer]);

  const handleSkillKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter" ||
      event.key === "/"
    ) {

      event.preventDefault();

      onAddSkill();

    }

  };


  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div
        className="absolute inset-0"
        onClick={onClose}
      />


      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-6 py-5 sm:px-7">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">

              {editingJob ? (
                <Edit3
                  size={19}
                />
              ) : (
                <Plus
                  size={20}
                />
              )}

            </div>

            <div>

              <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                {editingJob
                  ? "Modification"
                  : "Nouvelle publication"}
              </p>

              <h2 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">
                {editingJob
                  ? "Modifier l'offre"
                  : "Publier une offre"}
              </h2>

            </div>

          </div>


          <Button aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
          >
            <X size={17} />
          </Button>

        </div>


        {/* CONTENT */}

        <Form
          onSubmit={onSubmit}
          className="min-h-0 overflow-y-auto overscroll-contain"
        >

          <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-2">


            {/* =================================================
                INFORMATIONS PRINCIPALES
            ================================================= */}

            <div className="space-y-5">

              <FormSectionTitle
                number="01"
                title="Informations générales"
              />


              <FormField
                label="Intitulé du poste"
                required
              >

                <Input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="Ex. Développeur Full Stack"
                  className="form-input"
                  required
                />

              </FormField>


              <FormField
                label="Localisation"
                required
              >

                <div className="relative">

                  <MapPin
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateForm(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="Ex. Yaoundé, Cameroun"
                    className="form-input pl-10"
                    required
                  />

                </div>

              </FormField>


              <div className="grid gap-4 sm:grid-cols-2">

                <FormField
                  label="Type de contrat"
                  required
                >

                  <div className="relative">

                    <Select
                      value={form.type}
                      onChange={(event) =>
                        !editingJob &&
                        updateForm(
                          "type",
                          event.target.value
                        )
                      }
                      disabled={Boolean(editingJob)}
                      className={`form-input ${
                        editingJob
                          ? "cursor-not-allowed bg-slate-100 pr-12 text-slate-500"
                          : ""
                      }`}
                    >

                      <option>
                        CDI
                      </option>

                      <option>
                        CDD
                      </option>

                      <option>
                        Stage
                      </option>

                      <option>
                        Alternance
                      </option>

                      <option>
                        Freelance
                      </option>

                    </Select>

                    {editingJob && (
                      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">
                        <Check size={10} />
                        VERROUILLÉ
                      </div>
                    )}

                  </div>

                </FormField>


                <FormField
                  label="Expérience"
                  required
                >

                  <div className="relative">

                    <Select
                      value={
                        form.experience
                      }
                      onChange={(event) =>
                        !editingJob &&
                        updateForm(
                          "experience",
                          event.target.value
                        )
                      }
                      disabled={Boolean(editingJob)}
                      className={`form-input ${
                        editingJob
                          ? "cursor-not-allowed bg-slate-100 pr-12 text-slate-500"
                          : ""
                      }`}
                    >

                      <option>
                        Débutant
                      </option>

                      <option>
                        1 - 2 ans
                      </option>

                      <option>
                        2 - 4 ans
                      </option>

                      <option>
                        4 - 7 ans
                      </option>

                      <option>
                        Senior
                      </option>

                    </Select>

                    {editingJob && (
                      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">
                        <Check size={10} />
                        VERROUILLÉ
                      </div>
                    )}

                  </div>

                </FormField>

              </div>


              <FormField
                label="Rémunération"
              >

                <div className="relative">

                  <Input
                    type="text"
                    value={form.salary}
                    onChange={(event) =>
                      !editingJob &&
                      updateForm(
                        "salary",
                        event.target.value
                      )
                    }
                    disabled={Boolean(editingJob)}
                    placeholder="Ex. 300 000 - 500 000 FCFA"
                    className={`form-input ${
                      editingJob
                        ? "cursor-not-allowed bg-slate-100 pr-12 text-slate-500"
                        : ""
                    }`}
                  />

                  {editingJob && (
                    <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">
                      <Check size={10} />
                      VERROUILLÉ
                    </div>
                  )}

                </div>

                {editingJob && (
                  <p className="mt-1.5 text-xs leading-4 text-slate-400">
                    Cette information a déjà été validée et ne peut plus être modifiée.
                  </p>
                )}

              </FormField>


              {/* =================================================
                  DIPLOME
              ================================================= */}

              <FormField label="Diplôme requis" required>
                <Select value={form.diploma} onChange={event => updateForm("diploma", event.target.value)} disabled={Boolean(editingJob)} className="form-input w-full" required>
                  <option value="">Sélectionner un diplôme</option>
                  {editingJob && !diplomaOptions.includes(form.diploma) && <option value={form.diploma}>{form.diploma}</option>}
                  {diplomaOptions.map(diploma => <option key={diploma} value={diploma}>{diploma}</option>)}
                </Select>
                {editingJob && <p className="mt-2 text-xs text-slate-500">Le diplôme et sa spécialité déjà validés sont conservés.</p>}
              </FormField>
              {!editingJob && <FormField label="Spécialité" description="Précisez le domaine ou la filière du diplôme.">
                <Input value={form.specialty} onChange={event => updateForm("specialty", event.target.value)} placeholder="Ex. Informatique, comptabilité, génie civil…" maxLength={180} className="form-input w-full" />
              </FormField>}
              <FormField label="Flyer de recrutement" description="Ajoutez une image à joindre à votre offre (facultatif).">
                <Input type="file" accept="image/*" className="w-full text-sm" onChange={event => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith("image/")) { report(Error("Sélectionnez un fichier image.")); event.target.value = ""; return; }
                  updateForm("flyer", file);
                  event.target.value = "";
                }} />
                {flyerPreview && <img src={flyerPreview} alt="Aperçu du flyer de recrutement" className="mt-3 max-h-64 w-full rounded-xl border border-slate-200 object-contain" />}
                {form.flyer && <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600"><span>{form.flyer.name}</span><Button onClick={() => updateForm("flyer", null)} className="text-red-600">Retirer cette image</Button></div>}
              </FormField>

            </div>


            {/* =================================================
                COMPÉTENCES + DATE
            ================================================= */}

            <div className="space-y-5">

              <FormSectionTitle
                number="02"
                title="Critères & publication"
              />


              {/* DATE LIMITE */}

              <FormField
                label="Date limite de candidature"
                required
              >

                <div className="relative">

                  <CalendarDays
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                  />

                  <Input
                    type="date"
                    value={
                      form.deadline
                    }
                    onChange={(event) =>
                      updateForm(
                        "deadline",
                        event.target.value
                      )
                    }
                    className="form-input pl-10"
                    required
                  />

                </div>


                {editingJob && (

                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-500">

                    <CalendarDays
                      size={10}
                    />

                    La date limite peut être modifiée.

                  </p>

                )}

              </FormField>


              {/* COMPETENCES */}

              <FormField
                label="Compétences recherchées"
                required
              >

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

                  <div className="flex gap-2">

                    <Input
                      type="text"
                      value={
                        skillInput
                      }
                      onChange={(event) =>
                        setSkillInput(
                          event.target.value
                        )
                      }
                      onKeyDown={
                        handleSkillKeyDown
                      }
                      placeholder="Ex. React"
                      className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs font-medium outline-none placeholder:text-slate-400"
                    />

                    <Button aria-label="Ajouter"
                      type="button"
                      onClick={
                        onAddSkill
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                      <Plus
                        size={15}
                      />
                    </Button>

                  </div>


                  <div className="mt-3 flex flex-wrap gap-2">

                    {form.skills.map(
                      (
                        skill
                      ) => {

                        const isExisting =
                          editingJob &&
                          editingJob.skills.some(
                            (item) =>
                              item.toLowerCase() ===
                              skill.toLowerCase()
                          );

                        return (

                          <span
                            key={skill}
                            className={`group/skill flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ${
                              isExisting
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >

                            {isExisting && (
                              <Check
                                size={10}
                              />
                            )}

                            {skill}


                            {!isExisting && (

                              <Button aria-label="Fermer"
                                type="button"
                                onClick={() =>
                                  onRemoveSkill(
                                    skill
                                  )
                                }
                                className="flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-red-100 hover:text-red-500"
                              >
                                <X
                                  size={10}
                                />
                              </Button>

                            )}

                          </span>

                        );

                      }
                    )}

                  </div>

                </div>


                {editingJob ? (

                  <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-4 text-blue-600">
                    Les compétences en bleu ont déjà été validées. Elles restent obligatoires. Vous pouvez uniquement ajouter de nouvelles compétences.
                  </p>

                ) : (

                  <p className="mt-2 text-xs leading-4 text-slate-400">
                    Appuyez sur Entrée ou utilisez le bouton + pour ajouter une compétence.
                  </p>

                )}

              </FormField>


              {/* DESCRIPTION */}

              <FormField
                label="Description de l'offre"
                required
              >

                <Textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Présentez le poste, les missions et les responsabilités..."
                  rows={7}
                  className="form-input resize-none"
                  required
                />

              </FormField>

            </div>

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

            <div className="flex items-center gap-2 text-xs text-slate-400">

              <Sparkles
                size={12}
                className="text-blue-500"
              />

              <span>
                L'ATS JobConnect analysera les candidatures selon les critères de l'offre.
              </span>

            </div>


            <div className="flex gap-3">

              <Button
                type="button"
                onClick={
                  onClose
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-500 transition hover:bg-slate-100"
              >
                Annuler
              </Button>


              <Button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >

                {editingJob
                  ? "Enregistrer les modifications"
                  : "Publier l'offre"}

                <ArrowRight
                  size={14}
                />

              </Button>

            </div>

          </div>

        </Form>

      </div>

    </ModalFrame>
  );
}


/* ===========================================================
   FORM SECTION
=========================================================== */

function FormSectionTitle({
  number,
  title,
}) {

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">

      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-600">
        {number}
      </span>

      <h3 className="text-sm font-black text-slate-900">
        {title}
      </h3>

    </div>
  );
}


/* ===========================================================
   FORM FIELD
=========================================================== */




/* ===========================================================
   MOBILE NAV
=========================================================== */




/* ===========================================================
   DATE
=========================================================== */

function formatDate(
  date
) {

  if (!date) {
    return "—";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}


export default RecruiterJobsPage;